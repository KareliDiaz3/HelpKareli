/* ============================================
   SPEAKLEXI - MODELO DE PLANIFICACIÓN
   Módulo 4: Gestión de Desempeño (UC-15)
   
   Funciones:
   - Identificar áreas de mejora comunes
   - Sugerencias de contenido adicional
   - Análisis de dificultad de lecciones
   - Recomendaciones basadas en estadísticas
   ============================================ */

const db = require('../config/database');

const PlanificacionModel = {
    
    /**
     * UC-15: Identificar áreas de mejora comunes
     * Basado en el desempeño general de los alumnos
     */
    async identificarAreasMejora(profesorId) {
        const pool = db.pool || db;
        
        try {
            // Lecciones con baja tasa de completitud (<50%)
            const leccionesDificiles = await pool.query(
                `SELECT 
                    l.id,
                    l.titulo,
                    l.nivel,
                    l.idioma,
                    COUNT(DISTINCT pl.usuario_id) as total_estudiantes,
                    COUNT(CASE WHEN pl.completada = true THEN 1 END) as completadas,
                    (COUNT(CASE WHEN pl.completada = true THEN 1 END) / COUNT(DISTINCT pl.usuario_id)) * 100 as tasa_completitud,
                    AVG(pl.progreso) as progreso_promedio,
                    AVG(pl.tiempo_dedicado) as tiempo_promedio
                 FROM lecciones l
                 INNER JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY l.id, l.titulo, l.nivel, l.idioma
                 HAVING tasa_completitud < 50 AND total_estudiantes >= 3
                 ORDER BY tasa_completitud ASC
                 LIMIT 10`,
                [profesorId]
            );

            // Niveles con más dificultades
            const nivelesDificiles = await pool.query(
                `SELECT 
                    l.nivel,
                    COUNT(DISTINCT l.id) as total_lecciones,
                    COUNT(DISTINCT pl.usuario_id) as total_estudiantes,
                    AVG(pl.progreso) as progreso_promedio,
                    (COUNT(CASE WHEN pl.completada = true THEN 1 END) / COUNT(*)) * 100 as tasa_completitud,
                    AVG(pl.tiempo_dedicado) as tiempo_promedio
                 FROM lecciones l
                 INNER JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY l.nivel
                 ORDER BY tasa_completitud ASC`,
                [profesorId]
            );

            // Temas comunes en reportes de error y dudas
            const temasProblematicos = await pool.query(
                `SELECT 
                    l.id as leccion_id,
                    l.titulo,
                    l.nivel,
                    COUNT(CASE WHEN r.tipo = 'duda' THEN 1 END) as total_dudas,
                    COUNT(CASE WHEN r.tipo = 'reporte_error' THEN 1 END) as total_errores,
                    COUNT(r.id) as total_comentarios
                 FROM lecciones l
                 INNER JOIN retroalimentacion r ON l.id = r.leccion_id
                 WHERE l.profesor_id = ?
                 AND r.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                 GROUP BY l.id, l.titulo, l.nivel
                 HAVING total_comentarios > 2
                 ORDER BY total_comentarios DESC
                 LIMIT 10`,
                [profesorId]
            );

            return {
                lecciones_dificiles: leccionesDificiles.map(l => ({
                    leccion_id: l.id,
                    titulo: l.titulo,
                    nivel: l.nivel,
                    idioma: l.idioma,
                    total_estudiantes: l.total_estudiantes,
                    completadas: l.completadas,
                    tasa_completitud: Math.round(l.tasa_completitud || 0),
                    progreso_promedio: Math.round(l.progreso_promedio || 0),
                    tiempo_promedio_minutos: Math.round(l.tiempo_promedio || 0),
                    recomendacion: l.tasa_completitud < 30 
                        ? 'Revisar contenido y dividir en lecciones más pequeñas'
                        : 'Añadir material de apoyo o ejercicios adicionales'
                })),
                niveles_dificiles: nivelesDificiles.map(n => ({
                    nivel: n.nivel,
                    total_lecciones: n.total_lecciones,
                    total_estudiantes: n.total_estudiantes,
                    progreso_promedio: Math.round(n.progreso_promedio || 0),
                    tasa_completitud: Math.round(n.tasa_completitud || 0),
                    tiempo_promedio_minutos: Math.round(n.tiempo_promedio || 0)
                })),
                temas_problematicos: temasProblematicos.map(t => ({
                    leccion_id: t.leccion_id,
                    titulo: t.titulo,
                    nivel: t.nivel,
                    total_dudas: t.total_dudas,
                    total_errores: t.total_errores,
                    total_comentarios: t.total_comentarios
                }))
            };

        } catch (error) {
            throw new Error(`Error al identificar áreas de mejora: ${error.message}`);
        }
    },

    /**
     * UC-15: Generar sugerencias de contenido adicional
     * Basado en gaps de conocimiento y progreso de alumnos
     */
    async generarSugerenciasContenido(profesorId) {
        const pool = db.pool || db;
        
        try {
            // Identificar gaps entre niveles
            const gapsNiveles = await pool.query(
                `SELECT DISTINCT
                    l1.nivel as nivel_actual,
                    l2.nivel as nivel_siguiente,
                    COUNT(DISTINCT pl.usuario_id) as estudiantes_atascados
                 FROM progreso_lecciones pl
                 INNER JOIN lecciones l1 ON pl.leccion_id = l1.id
                 LEFT JOIN progreso_lecciones pl2 ON pl.usuario_id = pl2.usuario_id
                 LEFT JOIN lecciones l2 ON pl2.leccion_id = l2.id
                 WHERE l1.profesor_id = ?
                 AND pl.completada = true
                 AND (pl2.completada = false OR pl2.id IS NULL)
                 AND l2.nivel > l1.nivel
                 GROUP BY l1.nivel, l2.nivel
                 HAVING estudiantes_atascados >= 3
                 ORDER BY estudiantes_atascados DESC
                 LIMIT 5`,
                [profesorId]
            );

            // Temas con alto tiempo de dedicación (necesitan refuerzo)
            const temasRefuerzo = await pool.query(
                `SELECT 
                    l.id,
                    l.titulo,
                    l.nivel,
                    AVG(pl.tiempo_dedicado) as tiempo_promedio,
                    AVG(pl.progreso) as progreso_promedio,
                    COUNT(DISTINCT pl.usuario_id) as total_estudiantes
                 FROM lecciones l
                 INNER JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY l.id, l.titulo, l.nivel
                 HAVING tiempo_promedio > 60 AND progreso_promedio < 70
                 ORDER BY tiempo_promedio DESC
                 LIMIT 5`,
                [profesorId]
            );

            // Lecciones que necesitan material complementario
            const necesitanMaterial = await pool.query(
                `SELECT 
                    l.id,
                    l.titulo,
                    l.nivel,
                    COUNT(CASE WHEN r.tipo = 'duda' THEN 1 END) as dudas,
                    COUNT(CASE WHEN pl.progreso < 50 THEN 1 END) as estudiantes_con_dificultad
                 FROM lecciones l
                 LEFT JOIN retroalimentacion r ON l.id = r.leccion_id
                 LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY l.id, l.titulo, l.nivel
                 HAVING dudas > 3 OR estudiantes_con_dificultad > 5
                 ORDER BY (dudas + estudiantes_con_dificultad) DESC
                 LIMIT 5`,
                [profesorId]
            );

            return {
                gaps_niveles: gapsNiveles.map(g => ({
                    nivel_actual: g.nivel_actual,
                    nivel_siguiente: g.nivel_siguiente,
                    estudiantes_atascados: g.estudiantes_atascados,
                    sugerencia: `Crear lección de transición entre ${g.nivel_actual} y ${g.nivel_siguiente}`
                })),
                temas_refuerzo: temasRefuerzo.map(t => ({
                    leccion_id: t.id,
                    titulo: t.titulo,
                    nivel: t.nivel,
                    tiempo_promedio_minutos: Math.round(t.tiempo_promedio),
                    progreso_promedio: Math.round(t.progreso_promedio),
                    total_estudiantes: t.total_estudiantes,
                    sugerencia: 'Crear ejercicios de práctica adicionales o material explicativo complementario'
                })),
                necesitan_material: necesitanMaterial.map(n => ({
                    leccion_id: n.id,
                    titulo: n.titulo,
                    nivel: n.nivel,
                    total_dudas: n.dudas,
                    estudiantes_con_dificultad: n.estudiantes_con_dificultad,
                    sugerencia: 'Añadir videos explicativos, ejemplos adicionales o guías de estudio'
                }))
            };

        } catch (error) {
            throw new Error(`Error al generar sugerencias: ${error.message}`);
        }
    },

    /**
     * UC-15: Analizar dificultad de lecciones existentes
     * Para ajustar niveles o reorganizar contenido
     */
    async analizarDificultadLecciones(profesorId) {
        const pool = db.pool || db;
        
        try {
            const analisis = await pool.query(
                `SELECT 
                    l.id,
                    l.titulo,
                    l.nivel,
                    l.idioma,
                    COUNT(DISTINCT pl.usuario_id) as total_estudiantes,
                    AVG(pl.tiempo_dedicado) as tiempo_promedio,
                    AVG(pl.progreso) as progreso_promedio,
                    (COUNT(CASE WHEN pl.completada = true THEN 1 END) / COUNT(DISTINCT pl.usuario_id)) * 100 as tasa_completitud,
                    STDDEV(pl.tiempo_dedicado) as desviacion_tiempo,
                    MIN(pl.tiempo_dedicado) as tiempo_minimo,
                    MAX(pl.tiempo_dedicado) as tiempo_maximo
                 FROM lecciones l
                 LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                 WHERE l.profesor_id = ?
                 GROUP BY l.id, l.titulo, l.nivel, l.idioma
                 HAVING total_estudiantes > 0
                 ORDER BY l.nivel, l.titulo`,
                [profesorId]
            );

            return analisis.map(a => {
                const tiempoPromedio = Math.round(a.tiempo_promedio || 0);
                const progreso = Math.round(a.progreso_promedio || 0);
                const tasa = Math.round(a.tasa_completitud || 0);
                
                // Clasificar dificultad
                let dificultad_estimada = 'Media';
                let ajuste_sugerido = 'Sin ajustes necesarios';
                
                if (tiempoPromedio > 90 && progreso < 60) {
                    dificultad_estimada = 'Muy Alta';
                    ajuste_sugerido = 'Considerar dividir en 2 lecciones o simplificar contenido';
                } else if (tiempoPromedio > 60 && progreso < 70) {
                    dificultad_estimada = 'Alta';
                    ajuste_sugerido = 'Añadir material de apoyo o ejercicios guiados';
                } else if (tiempoPromedio < 20 && progreso > 90) {
                    dificultad_estimada = 'Muy Baja';
                    ajuste_sugerido = 'Considerar añadir más contenido o ejercicios avanzados';
                } else if (tiempoPromedio < 30 && progreso > 85) {
                    dificultad_estimada = 'Baja';
                    ajuste_sugerido = 'Puede enriquecerse con material adicional';
                }

                return {
                    leccion_id: a.id,
                    titulo: a.titulo,
                    nivel: a.nivel,
                    idioma: a.idioma,
                    total_estudiantes: a.total_estudiantes,
                    tiempo_promedio_minutos: tiempoPromedio,
                    progreso_promedio: progreso,
                    tasa_completitud: tasa,
                    desviacion_tiempo: Math.round(a.desviacion_tiempo || 0),
                    tiempo_minimo: a.tiempo_minimo || 0,
                    tiempo_maximo: a.tiempo_maximo || 0,
                    dificultad_estimada,
                    ajuste_sugerido
                };
            });

        } catch (error) {
            throw new Error(`Error al analizar dificultad: ${error.message}`);
        }
    },

    /**
     * UC-15: Obtener recomendaciones de planificación
     * Dashboard consolidado para el profesor
     */
    async obtenerRecomendacionesConsolidadas(profesorId) {
        const pool = db.pool || db;
        
        try {
            // Obtener datos de diferentes fuentes
            const [
                estadisticasGenerales,
                leccionesProblematicas,
                temasRecurrentes
            ] = await Promise.all([
                // Estadísticas generales
                pool.query(
                    `SELECT 
                        COUNT(DISTINCT l.id) as total_lecciones,
                        COUNT(DISTINCT pl.usuario_id) as total_estudiantes,
                        AVG(pl.progreso) as progreso_general,
                        COUNT(CASE WHEN pl.completada = true THEN 1 END) as total_completadas
                     FROM lecciones l
                     LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                     WHERE l.profesor_id = ?`,
                    [profesorId]
                ),
                
                // Top 5 lecciones con problemas
                pool.query(
                    `SELECT 
                        l.id,
                        l.titulo,
                        l.nivel,
                        (COUNT(CASE WHEN pl.completada = true THEN 1 END) / COUNT(DISTINCT pl.usuario_id)) * 100 as tasa_completitud,
                        COUNT(r.id) as total_comentarios
                     FROM lecciones l
                     LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id
                     LEFT JOIN retroalimentacion r ON l.id = r.leccion_id
                     WHERE l.profesor_id = ?
                     GROUP BY l.id, l.titulo, l.nivel
                     HAVING total_comentarios > 0 OR tasa_completitud < 60
                     ORDER BY (total_comentarios + (100 - tasa_completitud)) DESC
                     LIMIT 5`,
                    [profesorId]
                ),
                
                // Temas recurrentes en retroalimentación
                pool.query(
                    `SELECT 
                        r.tipo,
                        COUNT(*) as total
                     FROM retroalimentacion r
                     LEFT JOIN lecciones l ON r.leccion_id = l.id
                     WHERE (l.profesor_id = ? OR l.profesor_id IS NULL)
                     AND r.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                     GROUP BY r.tipo
                     ORDER BY total DESC`,
                    [profesorId]
                )
            ]);

            // Generar recomendaciones
            const recomendaciones = [];
            
            // Recomendación 1: Lecciones con problemas
            if (leccionesProblematicas.length > 0) {
                recomendaciones.push({
                    prioridad: 'Alta',
                    categoria: 'Contenido problemático',
                    descripcion: `${leccionesProblematicas.length} lecciones necesitan atención inmediata`,
                    accion: 'Revisar y mejorar estas lecciones',
                    lecciones_afectadas: leccionesProblematicas.map(l => l.titulo)
                });
            }
            
            // Recomendación 2: Retroalimentación sin responder
            const sinResponder = temasRecurrentes.find(t => t.tipo === 'duda');
            if (sinResponder && sinResponder.total > 5) {
                recomendaciones.push({
                    prioridad: 'Media',
                    categoria: 'Retroalimentación pendiente',
                    descripcion: `Hay ${sinResponder.total} dudas sin responder en los últimos 30 días`,
                    accion: 'Responder dudas pendientes y considerar crear FAQ'
                });
            }
            
            // Recomendación 3: Bajo progreso general
            const progresoGeneral = Math.round(estadisticasGenerales[0].progreso_general || 0);
            if (progresoGeneral < 60) {
                recomendaciones.push({
                    prioridad: 'Alta',
                    categoria: 'Progreso general bajo',
                    descripcion: `El progreso promedio es ${progresoGeneral}%`,
                    accion: 'Revisar dificultad general del curso y añadir material de apoyo'
                });
            }

            return {
                estadisticas: {
                    total_lecciones: estadisticasGenerales[0].total_lecciones,
                    total_estudiantes: estadisticasGenerales[0].total_estudiantes,
                    progreso_general: progresoGeneral,
                    total_completadas: estadisticasGenerales[0].total_completadas
                },
                recomendaciones,
                lecciones_atencion: leccionesProblematicas.map(l => ({
                    leccion_id: l.id,
                    titulo: l.titulo,
                    nivel: l.nivel,
                    tasa_completitud: Math.round(l.tasa_completitud || 0),
                    total_comentarios: l.total_comentarios
                }))
            };

        } catch (error) {
            throw new Error(`Error al obtener recomendaciones: ${error.message}`);
        }
    }
};

module.exports = PlanificacionModel;
