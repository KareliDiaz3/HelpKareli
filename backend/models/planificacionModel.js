/* ============================================
   SPEAKLEXI - MODELO DE PLANIFICACIÓN
   Módulo 4: Planes de Estudio Personalizados
   
   Funciones:
   - Crear planes de estudio personalizados
   - Gestionar planes por profesor y estudiante
   - Seguimiento de progreso de planes
   - Sugerencias de lecciones y ejercicios
   ============================================ */

const pool = require('../config/database');

class PlanificacionModel {
    
    /**
     * Crear plan de estudio personalizado
     */
    static async crear(data) {
        const query = `
            INSERT INTO planes_estudio 
            (profesor_id, estudiante_id, curso_id, titulo, descripcion, objetivos, 
             temas_dificultad, lecciones_sugeridas, ejercicios_extra, 
             fecha_inicio, fecha_fin_estimada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(query, [
            data.profesor_id,
            data.estudiante_id,
            data.curso_id,
            data.titulo,
            data.descripcion || null,
            data.objetivos || null,
            data.temas_dificultad ? JSON.stringify(data.temas_dificultad) : null,
            data.lecciones_sugeridas ? JSON.stringify(data.lecciones_sugeridas) : null,
            data.ejercicios_extra ? JSON.stringify(data.ejercicios_extra) : null,
            data.fecha_inicio || null,
            data.fecha_fin_estimada || null
        ]);
        
        return result.insertId;
    }
    
    /**
     * Obtener planes creados por profesor
     */
    static async obtenerPorProfesor(profesorId) {
        const query = `
            SELECT 
                p.id,
                p.estudiante_id,
                CONCAT(u.nombre, ' ', u.primer_apellido) as estudiante_nombre,
                p.titulo,
                p.descripcion,
                p.objetivos,
                p.temas_dificultad,
                p.lecciones_sugeridas,
                p.ejercicios_extra,
                p.estado,
                p.fecha_inicio,
                p.fecha_fin_estimada,
                p.fecha_completado,
                p.creado_en,
                c.nombre as curso_nombre
            FROM planes_estudio p
            INNER JOIN usuarios u ON u.id = p.estudiante_id
            INNER JOIN cursos c ON c.id = p.curso_id
            WHERE p.profesor_id = ?
            ORDER BY p.creado_en DESC
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        
        // Parsear JSON fields
        return rows.map(plan => ({
            ...plan,
            temas_dificultad: plan.temas_dificultad ? JSON.parse(plan.temas_dificultad) : [],
            lecciones_sugeridas: plan.lecciones_sugeridas ? JSON.parse(plan.lecciones_sugeridas) : [],
            ejercicios_extra: plan.ejercicios_extra ? JSON.parse(plan.ejercicios_extra) : []
        }));
    }
    
    /**
     * Obtener planes asignados a estudiante
     */
    static async obtenerPorEstudiante(estudianteId) {
        const query = `
            SELECT 
                p.id,
                p.profesor_id,
                CONCAT(up.nombre, ' ', up.primer_apellido) as profesor_nombre,
                p.titulo,
                p.descripcion,
                p.objetivos,
                p.temas_dificultad,
                p.lecciones_sugeridas,
                p.ejercicios_extra,
                p.estado,
                p.fecha_inicio,
                p.fecha_fin_estimada,
                p.fecha_completado,
                p.creado_en,
                c.nombre as curso_nombre
            FROM planes_estudio p
            INNER JOIN usuarios up ON up.id = p.profesor_id
            INNER JOIN cursos c ON c.id = p.curso_id
            WHERE p.estudiante_id = ?
            ORDER BY p.creado_en DESC
        `;
        
        const [rows] = await pool.execute(query, [estudianteId]);
        
        // Parsear JSON fields
        return rows.map(plan => ({
            ...plan,
            temas_dificultad: plan.temas_dificultad ? JSON.parse(plan.temas_dificultad) : [],
            lecciones_sugeridas: plan.lecciones_sugeridas ? JSON.parse(plan.lecciones_sugeridas) : [],
            ejercicios_extra: plan.ejercicios_extra ? JSON.parse(plan.ejercicios_extra) : []
        }));
    }
    
    /**
     * Actualizar estado del plan
     */
    static async actualizarEstado(planId, nuevoEstado) {
        let fechaCompletado = null;
        
        if (nuevoEstado === 'completado') {
            fechaCompletado = new Date();
        }
        
        const query = `
            UPDATE planes_estudio 
            SET estado = ?, fecha_completado = ?
            WHERE id = ?
        `;
        
        await pool.execute(query, [nuevoEstado, fechaCompletado, planId]);
    }
    
    /**
     * Obtener lecciones sugeridas con detalles completos
     */
    static async obtenerLeccionesSugeridas(planId) {
        const query = `
            SELECT 
                l.id,
                l.titulo,
                l.descripcion,
                l.nivel,
                l.duracion_minutos,
                l.orden
            FROM lecciones l
            WHERE l.id IN (
                SELECT JSON_EXTRACT(lecciones_sugeridas, '$[*]')
                FROM planes_estudio
                WHERE id = ?
            )
            ORDER BY l.orden ASC
        `;
        
        const [rows] = await pool.execute(query, [planId]);
        return rows;
    }
    
    /**
     * Obtener estadísticas de planificación para dashboard
     */
    static async obtenerEstadisticasProfesor(profesorId) {
        const query = `
            SELECT 
                COUNT(*) as total_planes,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as planes_pendientes,
                COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as planes_en_progreso,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as planes_completados,
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as planes_cancelados,
                COUNT(DISTINCT estudiante_id) as estudiantes_con_plan,
                COUNT(CASE WHEN fecha_inicio <= CURDATE() AND fecha_fin_estimada >= CURDATE() THEN 1 END) as planes_activos
            FROM planes_estudio
            WHERE profesor_id = ?
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows[0];
    }
    
    /**
     * Obtener temas de dificultad comunes entre estudiantes
     */
    static async obtenerTemasDificultadComunes(profesorId) {
        const query = `
            SELECT 
                tema,
                COUNT(*) as frecuencia,
                COUNT(DISTINCT estudiante_id) as estudiantes_afectados
            FROM (
                SELECT 
                    estudiante_id,
                    JSON_UNQUOTE(JSON_EXTRACT(temas_dificultad, CONCAT('$[', idx, ']'))) as tema
                FROM planes_estudio
                CROSS JOIN (
                    SELECT 0 as idx UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                ) indices
                WHERE profesor_id = ?
                AND JSON_EXTRACT(temas_dificultad, CONCAT('$[', idx, ']')) IS NOT NULL
            ) temas
            GROUP BY tema
            ORDER BY frecuencia DESC
            LIMIT 10
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows;
    }
}

module.exports = PlanificacionModel;