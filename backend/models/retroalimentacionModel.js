/* ============================================
   SPEAKLEXI - MODELO DE RETROALIMENTACIÓN
   Módulo 4: Sistema de Retroalimentación Profesor-Estudiante
   
   Funciones:
   - Enviar retroalimentación de profesor a estudiante
   - Gestionar mensajes enviados y recibidos
   - Tracking de lecturas
   - Sistema de tipos (felicitación, mejora, alerta)
   ============================================ */

const pool = require('../config/database');

class RetroalimentacionModel {
    
    /**
     * Enviar retroalimentación de profesor a estudiante
     */
    static async crear(data) {
        const query = `
            INSERT INTO retroalimentacion 
            (profesor_id, estudiante_id, curso_id, leccion_id, asunto, mensaje, tipo, relacionado_a, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(query, [
            data.profesor_id,
            data.estudiante_id,
            data.curso_id,
            data.leccion_id || null,
            data.asunto,
            data.mensaje,
            data.tipo || 'general',
            data.relacionado_a || null,
            data.metadata ? JSON.stringify(data.metadata) : null
        ]);
        
        return result.insertId;
    }
    
    /**
     * Obtener retroalimentación enviada por profesor
     */
    static async obtenerPorProfesor(profesorId, filtros = {}) {
        let query = `
            SELECT 
                r.id,
                r.estudiante_id,
                CONCAT(u.nombre, ' ', u.primer_apellido) as estudiante_nombre,
                r.asunto,
                r.mensaje,
                r.tipo,
                r.leido,
                r.fecha_lectura,
                r.creado_en,
                c.nombre as curso_nombre,
                l.titulo as leccion_titulo
            FROM retroalimentacion r
            INNER JOIN usuarios u ON u.id = r.estudiante_id
            INNER JOIN cursos c ON c.id = r.curso_id
            LEFT JOIN lecciones l ON l.id = r.leccion_id
            WHERE r.profesor_id = ?
        `;
        
        const params = [profesorId];
        
        if (filtros.estudiante_id) {
            query += ' AND r.estudiante_id = ?';
            params.push(filtros.estudiante_id);
        }
        
        if (filtros.leido !== undefined) {
            query += ' AND r.leido = ?';
            params.push(filtros.leido);
        }
        
        if (filtros.tipo) {
            query += ' AND r.tipo = ?';
            params.push(filtros.tipo);
        }
        
        query += ' ORDER BY r.creado_en DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }
    
    /**
     * Obtener retroalimentación recibida por estudiante
     */
    static async obtenerPorEstudiante(estudianteId) {
        const query = `
            SELECT 
                r.id,
                r.profesor_id,
                CONCAT(up.nombre, ' ', up.primer_apellido) as profesor_nombre,
                r.asunto,
                r.mensaje,
                r.tipo,
                r.leido,
                r.creado_en,
                c.nombre as curso_nombre,
                l.titulo as leccion_titulo
            FROM retroalimentacion r
            INNER JOIN usuarios up ON up.id = r.profesor_id
            INNER JOIN cursos c ON c.id = r.curso_id
            LEFT JOIN lecciones l ON l.id = r.leccion_id
            WHERE r.estudiante_id = ?
            ORDER BY r.creado_en DESC
        `;
        
        const [rows] = await pool.execute(query, [estudianteId]);
        return rows;
    }
    
    /**
     * Marcar retroalimentación como leída
     */
    static async marcarComoLeida(retroalimentacionId, estudianteId) {
        const query = `
            UPDATE retroalimentacion 
            SET leido = TRUE, fecha_lectura = NOW()
            WHERE id = ? AND estudiante_id = ?
        `;
        
        await pool.execute(query, [retroalimentacionId, estudianteId]);
    }
    
    /**
     * Contar mensajes no leídos por estudiante
     */
    static async contarNoLeidas(estudianteId) {
        const query = `
            SELECT COUNT(*) as total
            FROM retroalimentacion
            WHERE estudiante_id = ? AND leido = FALSE
        `;
        
        const [rows] = await pool.execute(query, [estudianteId]);
        return rows[0].total;
    }
    
    /**
     * Obtener estadísticas de retroalimentación para dashboard
     */
    static async obtenerEstadisticasProfesor(profesorId) {
        const query = `
            SELECT 
                COUNT(*) as total_enviados,
                COUNT(CASE WHEN leido = TRUE THEN 1 END) as total_leidos,
                COUNT(CASE WHEN leido = FALSE THEN 1 END) as total_no_leidos,
                COUNT(CASE WHEN tipo = 'felicitacion' THEN 1 END) as total_felicitaciones,
                COUNT(CASE WHEN tipo = 'mejora' THEN 1 END) as total_mejoras,
                COUNT(CASE WHEN tipo = 'alerta' THEN 1 END) as total_alertas,
                COUNT(CASE WHEN creado_en >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as enviados_ultima_semana
            FROM retroalimentacion
            WHERE profesor_id = ?
        `;
        
        const [rows] = await pool.execute(query, [profesorId]);
        return rows[0];
    }
    
    /**
     * Verificar si profesor puede enviar retroalimentación a estudiante
     */
    static async verificarPermisoProfesor(profesorId, estudianteId) {
        const query = `
            SELECT COUNT(*) as tiene_permiso
            FROM profesor_asignaciones pa
            INNER JOIN perfil_estudiantes pe ON pe.nivel_actual = pa.nivel AND pe.idioma_aprendizaje = pa.idioma
            WHERE pa.profesor_id = ? 
            AND pe.usuario_id = ?
            AND pa.activo = TRUE
        `;
        
        const [rows] = await pool.execute(query, [profesorId, estudianteId]);
        return rows[0].tiene_permiso > 0;
    }
}

module.exports = RetroalimentacionModel;