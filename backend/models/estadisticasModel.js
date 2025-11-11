/* ============================================
   SPEAKLEXI - MODELO DE ESTADÍSTICAS
   Módulo 4: Gestión de Desempeño (UC-13)
   
   Funciones:
   - Obtener estadísticas generales de un profesor
   - Consultar progreso individual de alumnos
   - Análisis de fortalezas/debilidades
   - Tiempo promedio por lección
   - Tasas de completitud por curso/nivel
   ============================================ */

const db = require('../config/database');

const EstadisticasModel = {
    
    /**
     * UC-13: Obtener estadísticas generales del profesor
     * Dashboard con métricas de todos sus alumnos
     */
    async obtenerEstadisticasGenerales(profesorId) {
        const pool = db.pool || db;
        
        try {
            // Total de alumnos del profesor
            const totalAlumnos = await pool.query(
                `SELECT COUNT(DISTINCT u.id) as total
                 FROM usuarios u
                 INNER JOIN progreso_lecciones pl ON u.id = pl.usuario_id
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE l.profesor_id = ? AND u.rol = 'estudiante'`,
                [profesorId]
            );

            // Alumnos activos (última actividad en 7 días)
            const alumnosActivos = await pool.query(
                `SELECT COUNT(DISTINCT u.id) as activos
                 FROM usuarios u
                 INNER JOIN progreso_lecciones pl ON u.id = pl.usuario_id
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE l.profesor_id = ? 
                 AND u.rol = 'estudiante'
                 AND pl.fecha_ultima_actividad >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
                [profesorId]
            );

            // Lecciones completadas totales
            const leccionesCompletadas = await pool.query(
                `SELECT COUNT(*) as total
                 FROM progreso_lecciones pl
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE l.profesor_id = ? AND pl.completada = true`,
                [profesorId]
            );

            // Tiempo promedio de estudio (en minutos)
            const tiempoPromedio = await pool.query(
                `SELECT AVG(pl.tiempo_dedicado) as promedio_minutos
                 FROM progreso_lecciones pl
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE l.profesor_id = ?`,
                [profesorId]
            );

            // Tasa de completitud general
            const tasaCompletitud = await pool.query(
                `SELECT 
                    COUNT(CASE WHEN pl.completada = true THEN 1 END) as completadas,
                    COUNT(*) as total,
                    (COUNT(CASE WHEN pl.completada = true THEN 1 END) / COUNT(*)) * 100 as tasa
                 FROM progreso_lecciones pl
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE l.profesor_id = ?`,
                [profesorId]
            );

            return {
                total_alumnos: totalAlumnos[0].total,
                alumnos_activos: alumnosActivos[0].activos,
                lecciones_completadas: leccionesCompletadas[0].total,
                tiempo_promedio_minutos: Math.round(tiempoPromedio[0].promedio_minutos || 0),
                tasa_completitud: Math.round(tasaCompletitud[0].tasa || 0)
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
        }
    },

    /**
     * UC-13: Obtener lista de alumnos con su progreso
     * Para vista de tabla en el dashboard del profesor
     */
    async obtenerListaAlumnos(profesorId, filtros = {}) {
        const pool = db.pool || db;
        
        try {
            const { nivel, idioma, ordenar = 'nombre', limite = 50 } = filtros;
            
            let query = `
                SELECT 
                    u.id,
                    u.nombre,
                    u.primer_apellido,
                    u.correo,
                    COUNT(DISTINCT pl.leccion_id) as lecciones_iniciadas,
                    COUNT(DISTINCT CASE WHEN pl.completada = true THEN pl.leccion_id END) as lecciones_completadas,
                    COALESCE(SUM(pl.tiempo_dedicado), 0) as tiempo_total_minutos,
                    COALESCE(AVG(pl.progreso), 0) as progreso_promedio,
                    MAX(pl.fecha_ultima_actividad) as ultima_actividad,
                    COALESCE(g.xp_total, 0) as xp_total,
                    COALESCE(g.nivel, 1) as nivel_estudiante
                FROM usuarios u
                INNER JOIN progreso_lecciones pl ON u.id = pl.usuario_id
                INNER JOIN lecciones l ON pl.leccion_id = l.id
                LEFT JOIN gamificacion g ON u.id = g.usuario_id
                WHERE l.profesor_id = ? AND u.rol = 'estudiante'
            `;
            
            const params = [profesorId];
            
            if (nivel) {
                query += ` AND l.nivel = ?`;
                params.push(nivel);
            }
            
            if (idioma) {
                query += ` AND l.idioma = ?`;
                params.push(idioma);
            }
            
            query += ` GROUP BY u.id, u.nombre, u.primer_apellido, u.correo, g.xp_total, g.nivel`;
            
            // Ordenamiento
            switch (ordenar) {
                case 'progreso':
                    query += ` ORDER BY progreso_promedio DESC`;
                    break;
                case 'actividad':
                    query += ` ORDER BY ultima_actividad DESC`;
                    break;
                case 'xp':
                    query += ` ORDER BY xp_total DESC`;
                    break;
                default:
                    query += ` ORDER BY u.nombre ASC`;
            }
            
            query += ` LIMIT ?`;
            params.push(limite);
            
            const alumnos = await pool.query(query, params);
            
            // Formatear datos
            return alumnos.map(alumno => ({
                id: alumno.id,
                nombre_completo: `${alumno.nombre} ${alumno.primer_apellido || ''}`.trim(),
                correo: alumno.correo,
                lecciones_iniciadas: alumno.lecciones_iniciadas,
                lecciones_completadas: alumno.lecciones_completadas,
                tiempo_total_horas: Math.round(alumno.tiempo_total_minutos / 60 * 10) / 10,
                progreso_promedio: Math.round(alumno.progreso_promedio),
                ultima_actividad: alumno.ultima_actividad,
                xp_total: alumno.xp_total,
                nivel: alumno.nivel_estudiante
            }));

        } catch (error) {
            throw new Error(`Error al obtener lista de alumnos: ${error.message}`);
        }
    },

    /**
     * UC-13: Obtener progreso individual detallado de un alumno
     * Incluye fortalezas, debilidades y análisis por lección
     */
    async obtenerProgresoIndividual(alumnoId, profesorId) {
        const pool = db.pool || db;
        
        try {
            // Información básica del alumno
            const alumno = await pool.query(
                `SELECT u.id, u.nombre, u.primer_apellido, u.correo,
                        COALESCE(g.xp_total, 0) as xp_total,
                        COALESCE(g.nivel, 1) as nivel,
                        COALESCE(g.racha_actual, 0) as racha
                 FROM usuarios u
                 LEFT JOIN gamificacion g ON u.id = g.usuario_id
                 WHERE u.id = ?`,
                [alumnoId]
            );

            if (!alumno.length) {
                throw new Error('Alumno no encontrado');
            }

            // Progreso por lección
            const progresoLecciones = await pool.query(
                `SELECT 
                    l.id as leccion_id,
                    l.titulo,
                    l.nivel,
                    l.idioma,
                    pl.progreso,
                    pl.completada,
                    pl.tiempo_dedicado,
                    pl.fecha_inicio,
                    pl.fecha_completado,
                    pl.fecha_ultima_actividad
                 FROM progreso_lecciones pl
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE pl.usuario_id = ? AND l.profesor_id = ?
                 ORDER BY pl.fecha_ultima_actividad DESC`,
                [alumnoId, profesorId]
            );

            // Análisis de fortalezas (lecciones con >80% progreso)
            const fortalezas = progresoLecciones
                .filter(l => l.progreso >= 80)
                .map(l => ({
                    leccion: l.titulo,
                    nivel: l.nivel,
                    progreso: l.progreso
                }));

            // Análisis de debilidades (lecciones con <50% progreso y tiempo >30 min)
            const debilidades = progresoLecciones
                .filter(l => l.progreso < 50 && l.tiempo_dedicado > 30)
                .map(l => ({
                    leccion: l.titulo,
                    nivel: l.nivel,
                    progreso: l.progreso,
                    tiempo_dedicado: l.tiempo_dedicado
                }));

            // Estadísticas generales del alumno
            const totalLecciones = progresoLecciones.length;
            const leccionesCompletadas = progresoLecciones.filter(l => l.completada).length;
            const progresoPromedio = totalLecciones > 0
                ? Math.round(progresoLecciones.reduce((sum, l) => sum + l.progreso, 0) / totalLecciones)
                : 0;
            const tiempoTotal = progresoLecciones.reduce((sum, l) => sum + l.tiempo_dedicado, 0);

            return {
                alumno: {
                    id: alumno[0].id,
                    nombre: `${alumno[0].nombre} ${alumno[0].primer_apellido || ''}`.trim(),
                    correo: alumno[0].correo,
                    xp_total: alumno[0].xp_total,
                    nivel: alumno[0].nivel,
                    racha: alumno[0].racha
                },
                estadisticas: {
                    total_lecciones: totalLecciones,
                    lecciones_completadas: leccionesCompletadas,
                    progreso_promedio: progresoPromedio,
                    tiempo_total_minutos: tiempoTotal,
                    tiempo_total_horas: Math.round(tiempoTotal / 60 * 10) / 10,
                    tasa_completitud: totalLecciones > 0 
                        ? Math.round((leccionesCompletadas / totalLecciones) * 100)
                        : 0
                },
                progreso_lecciones: progresoLecciones.map(l => ({
                    leccion_id: l.leccion_id,
                    titulo: l.titulo,
                    nivel: l.nivel,
                    idioma: l.idioma,
                    progreso: l.progreso,
                    completada: l.completada,
                    tiempo_dedicado: l.tiempo_dedicado,
                    fecha_inicio: l.fecha_inicio,
                    fecha_completado: l.fecha_completado,
                    ultima_actividad: l.fecha_ultima_actividad
                })),
                fortalezas: fortalezas,
                debilidades: debilidades
            };

        } catch (error) {
            throw new Error(`Error al obtener progreso individual: ${error.message}`);
        }
    },

    /**
     * UC-13: Obtener tiempo promedio por lección
     * Útil para identificar lecciones que toman más/menos tiempo
     */
    async obtenerTiempoPromedioPorLeccion(profesorId) {
        const pool = db.pool || db;
        
        try {
            const tiempos = await pool.query(
                `SELECT 
                    l.id as leccion_id,
                    l.titulo,
                    l.nivel,
                    l.idioma,
                    COUNT(pl.usuario_id) as total_estudiantes,
                    AVG(pl.tiempo_dedicado) as tiempo_promedio_minutos,
                    MIN(pl.tiempo_dedicado) as tiempo_minimo,
                    MAX(pl.tiempo_dedicado) as tiempo_maximo,
                    AVG(pl.progreso) as progreso_promedio
                 FROM lecciones l
                 LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY l.id, l.titulo, l.nivel, l.idioma
                 ORDER BY tiempo_promedio_minutos DESC`,
                [profesorId]
            );

            return tiempos.map(t => ({
                leccion_id: t.leccion_id,
                titulo: t.titulo,
                nivel: t.nivel,
                idioma: t.idioma,
                total_estudiantes: t.total_estudiantes,
                tiempo_promedio_minutos: Math.round(t.tiempo_promedio_minutos || 0),
                tiempo_minimo: t.tiempo_minimo || 0,
                tiempo_maximo: t.tiempo_maximo || 0,
                progreso_promedio: Math.round(t.progreso_promedio || 0)
            }));

        } catch (error) {
            throw new Error(`Error al obtener tiempos promedio: ${error.message}`);
        }
    },

    /**
     * UC-13: Obtener tasas de completitud por nivel/idioma
     * Para identificar qué niveles o idiomas necesitan ajustes
     */
    async obtenerTasasCompletitud(profesorId, agruparPor = 'nivel') {
        const pool = db.pool || db;
        
        try {
            const campo = agruparPor === 'idioma' ? 'l.idioma' : 'l.nivel';
            
            const tasas = await pool.query(
                `SELECT 
                    ${campo} as categoria,
                    COUNT(DISTINCT l.id) as total_lecciones,
                    COUNT(DISTINCT pl.usuario_id) as total_estudiantes,
                    COUNT(CASE WHEN pl.completada = true THEN 1 END) as completadas,
                    COUNT(*) as total_intentos,
                    (COUNT(CASE WHEN pl.completada = true THEN 1 END) / COUNT(*)) * 100 as tasa_completitud,
                    AVG(pl.progreso) as progreso_promedio,
                    AVG(pl.tiempo_dedicado) as tiempo_promedio
                 FROM lecciones l
                 LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY ${campo}
                 ORDER BY tasa_completitud DESC`,
                [profesorId]
            );

            return tasas.map(t => ({
                categoria: t.categoria,
                total_lecciones: t.total_lecciones,
                total_estudiantes: t.total_estudiantes,
                completadas: t.completadas,
                total_intentos: t.total_intentos,
                tasa_completitud: Math.round(t.tasa_completitud || 0),
                progreso_promedio: Math.round(t.progreso_promedio || 0),
                tiempo_promedio_minutos: Math.round(t.tiempo_promedio || 0)
            }));

        } catch (error) {
            throw new Error(`Error al obtener tasas de completitud: ${error.message}`);
        }
    },

    /**
     * UC-13: Obtener estadísticas de progreso semanal/mensual
     * Para gráficos de tendencia en el dashboard
     */
    async obtenerTendenciaProgreso(profesorId, periodo = 'semanal') {
        const pool = db.pool || db;
        
        try {
            const intervalo = periodo === 'mensual' ? 30 : 7;
            
            const tendencia = await pool.query(
                `SELECT 
                    DATE(pl.fecha_ultima_actividad) as fecha,
                    COUNT(DISTINCT pl.usuario_id) as estudiantes_activos,
                    COUNT(CASE WHEN pl.completada = true THEN 1 END) as lecciones_completadas,
                    SUM(pl.tiempo_dedicado) as tiempo_total_minutos,
                    AVG(pl.progreso) as progreso_promedio
                 FROM progreso_lecciones pl
                 INNER JOIN lecciones l ON pl.leccion_id = l.id
                 WHERE l.profesor_id = ?
                 AND pl.fecha_ultima_actividad >= DATE_SUB(NOW(), INTERVAL ? DAY)
                 GROUP BY DATE(pl.fecha_ultima_actividad)
                 ORDER BY fecha ASC`,
                [profesorId, intervalo]
            );

            return tendencia.map(t => ({
                fecha: t.fecha,
                estudiantes_activos: t.estudiantes_activos,
                lecciones_completadas: t.lecciones_completadas,
                tiempo_total_minutos: t.tiempo_total_minutos,
                progreso_promedio: Math.round(t.progreso_promedio || 0)
            }));

        } catch (error) {
            throw new Error(`Error al obtener tendencia de progreso: ${error.message}`);
        }
    }
};

module.exports = EstadisticasModel;
