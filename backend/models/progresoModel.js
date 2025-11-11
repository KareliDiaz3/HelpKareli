// backend/models/progresoModel.js
const db = require('../config/database');
const pool = db.pool || db;

/**
 * MODELO: Progreso de Lecciones y Cursos
 * RF-10: Registrar progreso del alumno
 * 
 * Tablas principales:
 * - progreso_lecciones
 * - inscripciones_cursos
 * - perfil_estudiantes
 */

/**
 * ✅ EJEMPLO COMPLETO - Registrar o actualizar progreso de una lección
 * Este método INSERTA o ACTUALIZA el progreso de un usuario en una lección
 */
exports.registrarProgresoLeccion = async (usuarioId, leccionId, datos) => {
    try {
        const { progreso, tiempo_segundos } = datos;
        const completada = progreso >= 100;
        
        // Query con INSERT ... ON DUPLICATE KEY UPDATE
        const query = `
            INSERT INTO progreso_lecciones 
                (usuario_id, leccion_id, progreso, tiempo_total_segundos, completada, fecha_inicio)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                progreso = VALUES(progreso),
                tiempo_total_segundos = tiempo_total_segundos + VALUES(tiempo_total_segundos),
                completada = VALUES(completada),
                fecha_completado = IF(VALUES(completada) = TRUE AND completada = FALSE, NOW(), fecha_completado),
                actualizado_en = NOW()
        `;
        
        const [resultado] = await pool.execute(query, [
            usuarioId, 
            leccionId, 
            progreso, 
            tiempo_segundos || 0, 
            completada
        ]);
        
        // Verificar si es la primera vez que se completa
        const recien_completada = completada && resultado.affectedRows === 1;
        
        // Si completó, actualizar contador en perfil_estudiantes
        if (recien_completada) {
            await pool.execute(
                `UPDATE perfil_estudiantes 
                 SET lecciones_completadas = lecciones_completadas + 1 
                 WHERE usuario_id = ?`,
                [usuarioId]
            );
        }
        
        return {
            success: true,
            recien_completada,
            progreso,
            completada
        };
        
    } catch (error) {
        console.error('Error en ProgresoModel.registrarProgresoLeccion:', error);
        throw error;
    }
};

/**
 * ✅ EJEMPLO COMPLETO - Obtener progreso de un usuario en una lección específica
 */
exports.obtenerProgresoPorLeccion = async (usuarioId, leccionId) => {
    try {
        const query = `
            SELECT 
                pl.*,
                l.titulo as leccion_titulo,
                l.duracion_minutos,
                l.nivel,
                l.idioma
            FROM progreso_lecciones pl
            JOIN lecciones l ON pl.leccion_id = l.id
            WHERE pl.usuario_id = ? AND pl.leccion_id = ?
        `;
        
        const [rows] = await pool.execute(query, [usuarioId, leccionId]);
        return rows.length > 0 ? rows[0] : null;
        
    } catch (error) {
        console.error('Error en ProgresoModel.obtenerProgresoPorLeccion:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener progreso general de un usuario en un curso
 * 
 * INSTRUCCIONES:
 * 1. Hacer JOIN entre progreso_lecciones, lecciones y cursos
 * 2. Filtrar por usuario_id y curso_id
 * 3. Calcular:
 *    - total_lecciones del curso
 *    - lecciones_completadas por el usuario
 *    - progreso_promedio = AVG(progreso)
 *    - tiempo_total = SUM(tiempo_total_segundos)
 * 4. Retornar objeto con estos datos
 */
exports.obtenerProgresoPorCurso = async (usuarioId, cursoId) => {
    try {
        const query = `
            SELECT 
                c.id as curso_id,
                c.nombre as curso_nombre,
                COUNT(l.id) as total_lecciones,
                SUM(CASE WHEN pl.completada = TRUE THEN 1 ELSE 0 END) as lecciones_completadas,
                ROUND(AVG(COALESCE(pl.progreso, 0)), 2) as progreso_promedio,
                SUM(COALESCE(pl.tiempo_total_segundos, 0)) as tiempo_total_segundos
            FROM cursos c
            JOIN lecciones l ON c.id = l.curso_id AND l.estado = 'activa'
            LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id AND pl.usuario_id = ?
            WHERE c.id = ?
            GROUP BY c.id
        `;
        
        const [rows] = await pool.execute(query, [usuarioId, cursoId]);
        return rows.length > 0 ? rows[0] : null;
        
    } catch (error) {
        console.error('Error en ProgresoModel.obtenerProgresoPorCurso:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener historial de actividad del usuario
 * 
 * INSTRUCCIONES:
 * 1. SELECT de progreso_lecciones con JOIN a lecciones y cursos
 * 2. Filtrar por usuario_id
 * 3. Ordenar por actualizado_en DESC
 * 4. Limitar a las últimas 50 actividades
 * 5. Incluir: fecha, lección, curso, progreso, tiempo
 */
exports.obtenerHistorialProgreso = async (usuarioId, limite = 50) => {
    try {
        const query = `
            SELECT 
                pl.id,
                pl.progreso,
                pl.completada,
                pl.tiempo_total_segundos,
                pl.fecha_inicio,
                pl.fecha_completado,
                pl.actualizado_en,
                l.id as leccion_id,
                l.titulo as leccion_titulo,
                c.id as curso_id,
                c.nombre as curso_nombre,
                c.icono as curso_icono
            FROM progreso_lecciones pl
            JOIN lecciones l ON pl.leccion_id = l.id
            JOIN cursos c ON l.curso_id = c.id
            WHERE pl.usuario_id = ?
            ORDER BY pl.actualizado_en DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [usuarioId, limite]);
        return rows;
        
    } catch (error) {
        console.error('Error en ProgresoModel.obtenerHistorialProgreso:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Sincronizar progreso (para offline)
 * 
 * INSTRUCCIONES:
 * 1. Recibe array de objetos: [{ leccion_id, progreso, tiempo_segundos, timestamp }]
 * 2. Para cada elemento, llamar a registrarProgresoLeccion()
 * 3. Si el timestamp es más reciente que el almacenado, actualizar
 * 4. Retornar resumen: { sincronizados: N, fallidos: M, errores: [] }
 */
exports.sincronizarProgreso = async (usuarioId, progresosArray) => {
    try {
        let sincronizados = 0;
        let fallidos = 0;
        const errores = [];
        
        for (const item of progresosArray) {
            try {
                await this.registrarProgresoLeccion(usuarioId, item.leccion_id, {
                    progreso: item.progreso,
                    tiempo_segundos: item.tiempo_segundos
                });
                sincronizados++;
            } catch (err) {
                fallidos++;
                errores.push({
                    leccion_id: item.leccion_id,
                    error: err.message
                });
            }
        }
        
        return {
            sincronizados,
            fallidos,
            errores
        };
        
    } catch (error) {
        console.error('Error en ProgresoModel.sincronizarProgreso:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener resumen de progreso del estudiante
 * 
 * INSTRUCCIONES:
 * 1. SELECT de perfil_estudiantes
 * 2. Incluir: total_xp, nivel_xp, racha_dias, lecciones_completadas, cursos_completados
 * 3. Calcular porcentaje hasta siguiente nivel (usar GAMIFICACION_CONFIG)
 * 4. Incluir fecha_ultima_racha
 */
exports.obtenerResumenProgreso = async (usuarioId) => {
    try {
        const query = `
            SELECT 
                pe.total_xp,
                pe.nivel_xp,
                pe.racha_dias,
                pe.fecha_ultima_racha,
                pe.lecciones_completadas,
                pe.cursos_completados,
                pe.nivel_actual,
                pe.idioma_aprendizaje
            FROM perfil_estudiantes pe
            WHERE pe.usuario_id = ?
        `;
        
        const [rows] = await pool.execute(query, [usuarioId]);
        return rows.length > 0 ? rows[0] : null;
        
    } catch (error) {
        console.error('Error en ProgresoModel.obtenerResumenProgreso:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Actualizar progreso general de un curso
 * 
 * INSTRUCCIONES:
 * 1. Calcular lecciones completadas vs total lecciones del curso
 * 2. Actualizar tabla inscripciones_cursos:
 *    - progreso_general = (lecciones_completadas / total_lecciones) * 100
 *    - estado = 'completado' si progreso_general >= 100
 *    - fecha_ultima_actividad = NOW()
 * 3. Si completó el curso (primera vez), incrementar cursos_completados en perfil_estudiantes
 */
exports.actualizarProgresoCurso = async (usuarioId, cursoId) => {
    try {
        // Obtener estadísticas del curso
        const progreso = await this.obtenerProgresoPorCurso(usuarioId, cursoId);
        
        if (!progreso) {
            throw new Error('No se encontró el curso o el usuario no está inscrito');
        }
        
        const progreso_general = Math.round(
            (progreso.lecciones_completadas / progreso.total_lecciones) * 100
        );
        
        const estado = progreso_general >= 100 ? 'completado' : 'en_progreso';
        
        // Actualizar inscripción
        const query = `
            UPDATE inscripciones_cursos
            SET progreso_general = ?,
                estado = ?,
                fecha_ultima_actividad = NOW()
            WHERE usuario_id = ? AND curso_id = ?
        `;
        
        await pool.execute(query, [progreso_general, estado, usuarioId, cursoId]);
        
        // Si completó el curso, actualizar contador
        if (estado === 'completado') {
            await pool.execute(
                `UPDATE perfil_estudiantes 
                 SET cursos_completados = cursos_completados + 1 
                 WHERE usuario_id = ? AND cursos_completados = 0`,
                [usuarioId]
            );
        }
        
        return {
            progreso_general,
            estado,
            lecciones_completadas: progreso.lecciones_completadas,
            total_lecciones: progreso.total_lecciones
        };
        
    } catch (error) {
        console.error('Error en ProgresoModel.actualizarProgresoCurso:', error);
        throw error;
    }
};

module.exports = exports;
