/* ============================================
   SPEAKLEXI - MODELO DE PROFESOR
   Módulo 4: Dashboard y Gestión de Estudiantes
   
   Funciones:
   - Dashboard del profesor
   - Gestión de estudiantes asignados
   - Estadísticas y métricas
   - Alertas y notificaciones
   ============================================ */

const pool = require('../config/database');

class ProfesorModel {
    
    /**
     * Obtener información del profesor con su asignación
     */
    static async obtenerInfoProfesor(profesorId) {
        const query = `
            SELECT 
                u.id,
                u.nombre,
                u.primer_apellido,
                pa.nivel,
                pa.idioma,
                c.id as curso_id,
                c.nombre as curso_nombre
            FROM usuarios u
            INNER JOIN profesor_asignaciones pa ON pa.profesor_id = u.id
            INNER JOIN cursos c ON c.id = pa.curso_id
            WHERE u.id = ? AND pa.activo = TRUE
            LIMIT 1
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows[0] || null;
    }
    
    /**
     * Obtener estudiantes asignados al profesor
     */
    static async obtenerEstudiantes(profesorId) {
        const query = `
            SELECT 
                pe.usuario_id as id,
                CONCAT(u.nombre, ' ', u.primer_apellido) as nombre_completo,
                u.correo,
                pe.nivel_actual,
                pe.idioma_aprendizaje,
                pe.total_xp,
                COALESCE(ee.lecciones_completadas, 0) as lecciones_completadas,
                COALESCE(ee.promedio_general, 0) as promedio_general,
                COALESCE(ee.tiempo_total_estudio, 0) as tiempo_total_estudio,
                pa.curso_id,
                c.nombre as curso_nombre
            FROM profesor_asignaciones pa
            INNER JOIN perfil_estudiantes pe 
                ON pe.nivel_actual = pa.nivel 
                AND pe.idioma_aprendizaje = pa.idioma
            INNER JOIN usuarios u ON u.id = pe.usuario_id
            INNER JOIN cursos c ON c.id = pa.curso_id
            LEFT JOIN estadisticas_estudiante ee ON ee.usuario_id = pe.usuario_id
            WHERE pa.profesor_id = ? 
                AND pa.activo = TRUE 
                AND u.rol = 'alumno'
                AND u.estado_cuenta = 'activo'
            ORDER BY pe.total_xp DESC
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows;
    }
    
    /**
     * Obtener estadísticas generales de la clase
     */
    static async obtenerEstadisticasGenerales(profesorId) {
        const query = `
            SELECT 
                COUNT(DISTINCT pe.usuario_id) as total_estudiantes,
                AVG(COALESCE(ee.promedio_general, 0)) as promedio_clase,
                SUM(COALESCE(ee.lecciones_completadas, 0)) as total_lecciones_completadas,
                SUM(COALESCE(ee.tiempo_total_estudio, 0)) as tiempo_total_clase,
                COUNT(DISTINCT CASE WHEN ee.lecciones_completadas > 0 THEN pe.usuario_id END) as estudiantes_activos
            FROM profesor_asignaciones pa
            INNER JOIN perfil_estudiantes pe 
                ON pe.nivel_actual = pa.nivel 
                AND pe.idioma_aprendizaje = pa.idioma
            INNER JOIN usuarios u ON u.id = pe.usuario_id
            LEFT JOIN estadisticas_estudiante ee ON ee.usuario_id = pe.usuario_id
            WHERE pa.profesor_id = ? 
                AND pa.activo = TRUE
                AND u.rol = 'alumno'
                AND u.estado_cuenta = 'activo'
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows[0];
    }
    
    /**
     * Obtener top estudiantes por XP
     */
    static async obtenerTopEstudiantes(profesorId, limit = 5) {
        const query = `
            SELECT 
                pe.usuario_id as id,
                CONCAT(u.nombre, ' ', u.primer_apellido) as nombre_completo,
                pe.total_xp,
                COALESCE(ee.lecciones_completadas, 0) as lecciones_completadas,
                COALESCE(ee.promedio_general, 0) as promedio_general,
                COALESCE(ee.tiempo_total_estudio, 0) as tiempo_total_estudio
            FROM profesor_asignaciones pa
            INNER JOIN perfil_estudiantes pe 
                ON pe.nivel_actual = pa.nivel 
                AND pe.idioma_aprendizaje = pa.idioma
            INNER JOIN usuarios u ON u.id = pe.usuario_id
            LEFT JOIN estadisticas_estudiante ee ON ee.usuario_id = pe.usuario_id
            WHERE pa.profesor_id = ? 
                AND pa.activo = TRUE
                AND u.rol = 'alumno'
                AND u.estado_cuenta = 'activo'
            ORDER BY pe.total_xp DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [profesorId, limit]);
        return rows;
    }
    
    /**
     * Obtener alertas del profesor
     */
    static async obtenerAlertas(profesorId, soloNoRevisadas = true) {
        let query = `
            SELECT 
                a.id,
                a.estudiante_id,
                CONCAT(u.nombre, ' ', u.primer_apellido) as estudiante_nombre,
                a.tipo_alerta,
                a.severidad,
                a.titulo,
                a.descripcion,
                a.metadata,
                a.creado_en,
                c.nombre as curso_nombre,
                l.titulo as leccion_titulo
            FROM alertas_automaticas a
            INNER JOIN usuarios u ON u.id = a.estudiante_id
            INNER JOIN cursos c ON c.id = a.curso_id
            LEFT JOIN lecciones l ON l.id = a.leccion_id
            WHERE a.profesor_id = ?
        `;
        
        if (soloNoRevisadas) {
            query += ' AND a.revisada = FALSE';
        }
        
        query += ' ORDER BY a.creado_en DESC';
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows;
    }
    
    /**
     * Obtener estadísticas detalladas de un estudiante específico
     */
    static async obtenerEstadisticasEstudiante(profesorId, estudianteId) {
        const query = `
            SELECT 
                pe.usuario_id as id,
                CONCAT(u.nombre, ' ', u.primer_apellido) as nombre_completo,
                u.correo,
                pe.nivel_actual,
                pe.idioma_aprendizaje,
                pe.total_xp,
                COALESCE(ee.lecciones_completadas, 0) as lecciones_completadas,
                COALESCE(ee.promedio_general, 0) as promedio_general,
                COALESCE(ee.tiempo_total_estudio, 0) as tiempo_total_estudio,
                pa.curso_id,
                c.nombre as curso_nombre,
                
                -- Estadísticas de ejercicios
                (SELECT COUNT(*) FROM resultados_ejercicios re WHERE re.usuario_id = pe.usuario_id) as total_ejercicios_intentados,
                (SELECT AVG(puntuacion_obtenida) FROM resultados_ejercicios re WHERE re.usuario_id = pe.usuario_id) as promedio_ejercicios,
                
                -- Progreso en lecciones
                (SELECT COUNT(*) FROM progreso_lecciones pl WHERE pl.usuario_id = pe.usuario_id AND pl.completado = TRUE) as lecciones_completadas_total,
                (SELECT COUNT(*) FROM progreso_lecciones pl WHERE pl.usuario_id = pe.usuario_id) as lecciones_iniciadas_total
                
            FROM profesor_asignaciones pa
            INNER JOIN perfil_estudiantes pe 
                ON pe.nivel_actual = pa.nivel 
                AND pe.idioma_aprendizaje = pa.idioma
            INNER JOIN usuarios u ON u.id = pe.usuario_id
            INNER JOIN cursos c ON c.id = pa.curso_id
            LEFT JOIN estadisticas_estudiante ee ON ee.usuario_id = pe.usuario_id
            WHERE pa.profesor_id = ? 
                AND pe.usuario_id = ?
                AND pa.activo = TRUE
            LIMIT 1
        `;
        
        const [rows] = await pool.execute(query, [profesorId, estudianteId]);
        return rows[0] || null;
    }
    
    /**
     * Obtener lecciones del curso del profesor
     */
    static async obtenerLeccionesCurso(profesorId) {
        const query = `
            SELECT 
                l.id,
                l.titulo,
                l.descripcion,
                l.nivel,
                l.duracion_minutos,
                l.orden,
                l.estado,
                COUNT(pl.id) as total_estudiantes_completado,
                AVG(COALESCE(pl.puntuacion, 0)) as puntuacion_promedio
            FROM profesor_asignaciones pa
            INNER JOIN cursos c ON c.id = pa.curso_id
            INNER JOIN lecciones l ON l.curso_id = c.id
            LEFT JOIN progreso_lecciones pl ON pl.leccion_id = l.id AND pl.completado = TRUE
            WHERE pa.profesor_id = ? 
                AND pa.activo = TRUE
                AND l.estado = 'activa'
            GROUP BY l.id, l.titulo, l.descripcion, l.nivel, l.duracion_minutos, l.orden, l.estado
            ORDER BY l.orden ASC
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows;
    }
    
    /**
     * Verificar que el profesor tiene acceso al estudiante
     */
    static async verificarAccesoEstudiante(profesorId, estudianteId) {
        const query = `
            SELECT COUNT(*) as tiene_acceso
            FROM profesor_asignaciones pa
            INNER JOIN perfil_estudiantes pe 
                ON pe.nivel_actual = pa.nivel 
                AND pe.idioma_aprendizaje = pa.idioma
            WHERE pa.profesor_id = ? 
                AND pe.usuario_id = ?
                AND pa.activo = TRUE
        `;
        
        const [rows] = await pool.execute(query, [profesorId, estudianteId]);
        return rows[0].tiene_acceso > 0;
    }
    
    /**
     * Marcar alerta como revisada
     */
    static async marcarAlertaRevisada(alertaId, profesorId) {
        const query = `
            UPDATE alertas_automaticas 
            SET revisada = TRUE, fecha_revision = NOW()
            WHERE id = ? AND profesor_id = ?
        `;
        
        await pool.execute(query, [alertaId, profesorId]);
    }
}

module.exports = ProfesorModel;