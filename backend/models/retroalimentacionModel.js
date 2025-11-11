/* ============================================
   SPEAKLEXI - MODELO DE RETROALIMENTACIÓN
   Módulo 4: Gestión de Desempeño (UC-14)
   
   Funciones:
   - Sistema de comentarios en lecciones
   - Foros de discusión
   - Respuestas a dudas específicas
   - Análisis de comentarios recurrentes
   ============================================ */

const db = require('../config/database');

const RetroalimentacionModel = {
    
    /**
     * UC-14: Crear un nuevo comentario/retroalimentación
     * Puede ser sobre una lección específica o general
     */
    async crearComentario(datos) {
        const pool = db.pool || db;
        
        try {
            const {
                usuario_id,
                leccion_id = null,
                tipo, // 'duda', 'comentario', 'sugerencia', 'reporte_error'
                asunto,
                mensaje,
                es_privado = false
            } = datos;

            const resultado = await pool.query(
                `INSERT INTO retroalimentacion 
                 (usuario_id, leccion_id, tipo, asunto, mensaje, es_privado, fecha_creacion)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [usuario_id, leccion_id, tipo, asunto, mensaje, es_privado]
            );

            return {
                id: resultado.insertId,
                usuario_id,
                leccion_id,
                tipo,
                asunto,
                mensaje,
                es_privado,
                fecha_creacion: new Date()
            };

        } catch (error) {
            throw new Error(`Error al crear comentario: ${error.message}`);
        }
    },

    /**
     * UC-14: Obtener todos los comentarios para el profesor
     * Filtrado por tipo, lección, estado, etc.
     */
    async obtenerComentarios(profesorId, filtros = {}) {
        const pool = db.pool || db;
        
        try {
            const {
                tipo,
                leccion_id,
                solo_sin_respuesta = false,
                limite = 50,
                offset = 0
            } = filtros;

            let query = `
                SELECT 
                    r.id,
                    r.usuario_id,
                    r.leccion_id,
                    r.tipo,
                    r.asunto,
                    r.mensaje,
                    r.es_privado,
                    r.fecha_creacion,
                    r.respondido,
                    r.fecha_respuesta,
                    u.nombre as estudiante_nombre,
                    u.primer_apellido as estudiante_apellido,
                    u.correo as estudiante_correo,
                    l.titulo as leccion_titulo,
                    l.nivel as leccion_nivel,
                    COUNT(rr.id) as total_respuestas
                FROM retroalimentacion r
                INNER JOIN usuarios u ON r.usuario_id = u.id
                LEFT JOIN lecciones l ON r.leccion_id = l.id
                LEFT JOIN respuestas_retroalimentacion rr ON r.id = rr.retroalimentacion_id
                WHERE (l.profesor_id = ? OR l.profesor_id IS NULL)
            `;

            const params = [profesorId];

            if (tipo) {
                query += ` AND r.tipo = ?`;
                params.push(tipo);
            }

            if (leccion_id) {
                query += ` AND r.leccion_id = ?`;
                params.push(leccion_id);
            }

            if (solo_sin_respuesta) {
                query += ` AND r.respondido = false`;
            }

            query += ` 
                GROUP BY r.id, r.usuario_id, r.leccion_id, r.tipo, r.asunto, r.mensaje, 
                         r.es_privado, r.fecha_creacion, r.respondido, r.fecha_respuesta,
                         u.nombre, u.primer_apellido, u.correo, l.titulo, l.nivel
                ORDER BY r.fecha_creacion DESC
                LIMIT ? OFFSET ?
            `;

            params.push(limite, offset);

            const comentarios = await pool.query(query, params);

            return comentarios.map(c => ({
                id: c.id,
                estudiante: {
                    id: c.usuario_id,
                    nombre: `${c.estudiante_nombre} ${c.estudiante_apellido || ''}`.trim(),
                    correo: c.estudiante_correo
                },
                leccion: c.leccion_id ? {
                    id: c.leccion_id,
                    titulo: c.leccion_titulo,
                    nivel: c.leccion_nivel
                } : null,
                tipo: c.tipo,
                asunto: c.asunto,
                mensaje: c.mensaje,
                es_privado: c.es_privado,
                fecha_creacion: c.fecha_creacion,
                respondido: c.respondido,
                fecha_respuesta: c.fecha_respuesta,
                total_respuestas: c.total_respuestas
            }));

        } catch (error) {
            throw new Error(`Error al obtener comentarios: ${error.message}`);
        }
    },

    /**
     * UC-14: Obtener detalles de un comentario específico con todas sus respuestas
     */
    async obtenerComentarioPorId(comentarioId, profesorId) {
        const pool = db.pool || db;
        
        try {
            // Obtener comentario principal
            const comentario = await pool.query(
                `SELECT 
                    r.id,
                    r.usuario_id,
                    r.leccion_id,
                    r.tipo,
                    r.asunto,
                    r.mensaje,
                    r.es_privado,
                    r.fecha_creacion,
                    r.respondido,
                    r.fecha_respuesta,
                    u.nombre as estudiante_nombre,
                    u.primer_apellido as estudiante_apellido,
                    u.correo as estudiante_correo,
                    l.titulo as leccion_titulo,
                    l.nivel as leccion_nivel,
                    l.profesor_id
                 FROM retroalimentacion r
                 INNER JOIN usuarios u ON r.usuario_id = u.id
                 LEFT JOIN lecciones l ON r.leccion_id = l.id
                 WHERE r.id = ?`,
                [comentarioId]
            );

            if (!comentario.length) {
                throw new Error('Comentario no encontrado');
            }

            // Verificar que el profesor tenga acceso
            if (comentario[0].profesor_id && comentario[0].profesor_id !== profesorId) {
                throw new Error('No tienes acceso a este comentario');
            }

            // Obtener respuestas
            const respuestas = await pool.query(
                `SELECT 
                    rr.id,
                    rr.profesor_id,
                    rr.mensaje,
                    rr.fecha_respuesta,
                    p.nombre as profesor_nombre,
                    p.primer_apellido as profesor_apellido
                 FROM respuestas_retroalimentacion rr
                 INNER JOIN usuarios p ON rr.profesor_id = p.id
                 WHERE rr.retroalimentacion_id = ?
                 ORDER BY rr.fecha_respuesta ASC`,
                [comentarioId]
            );

            return {
                id: comentario[0].id,
                estudiante: {
                    id: comentario[0].usuario_id,
                    nombre: `${comentario[0].estudiante_nombre} ${comentario[0].estudiante_apellido || ''}`.trim(),
                    correo: comentario[0].estudiante_correo
                },
                leccion: comentario[0].leccion_id ? {
                    id: comentario[0].leccion_id,
                    titulo: comentario[0].leccion_titulo,
                    nivel: comentario[0].leccion_nivel
                } : null,
                tipo: comentario[0].tipo,
                asunto: comentario[0].asunto,
                mensaje: comentario[0].mensaje,
                es_privado: comentario[0].es_privado,
                fecha_creacion: comentario[0].fecha_creacion,
                respondido: comentario[0].respondido,
                fecha_respuesta: comentario[0].fecha_respuesta,
                respuestas: respuestas.map(r => ({
                    id: r.id,
                    profesor: {
                        id: r.profesor_id,
                        nombre: `${r.profesor_nombre} ${r.profesor_apellido || ''}`.trim()
                    },
                    mensaje: r.mensaje,
                    fecha: r.fecha_respuesta
                }))
            };

        } catch (error) {
            throw new Error(`Error al obtener comentario: ${error.message}`);
        }
    },

    /**
     * UC-14: Responder a un comentario
     */
    async responderComentario(comentarioId, profesorId, mensaje) {
        const pool = db.pool || db;
        
        try {
            // Insertar respuesta
            const resultado = await pool.query(
                `INSERT INTO respuestas_retroalimentacion 
                 (retroalimentacion_id, profesor_id, mensaje, fecha_respuesta)
                 VALUES (?, ?, ?, NOW())`,
                [comentarioId, profesorId, mensaje]
            );

            // Actualizar estado del comentario
            await pool.query(
                `UPDATE retroalimentacion 
                 SET respondido = true, fecha_respuesta = NOW()
                 WHERE id = ?`,
                [comentarioId]
            );

            return {
                id: resultado.insertId,
                retroalimentacion_id: comentarioId,
                profesor_id: profesorId,
                mensaje,
                fecha_respuesta: new Date()
            };

        } catch (error) {
            throw new Error(`Error al responder comentario: ${error.message}`);
        }
    },

    /**
     * UC-14: Análisis de comentarios recurrentes
     * Identificar temas o problemas comunes
     */
    async analizarComentariosRecurrentes(profesorId, periodo = 30) {
        const pool = db.pool || db;
        
        try {
            // Contar por tipo de comentario
            const porTipo = await pool.query(
                `SELECT 
                    r.tipo,
                    COUNT(*) as total,
                    COUNT(CASE WHEN r.respondido = false THEN 1 END) as sin_responder
                 FROM retroalimentacion r
                 LEFT JOIN lecciones l ON r.leccion_id = l.id
                 WHERE (l.profesor_id = ? OR l.profesor_id IS NULL)
                 AND r.fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? DAY)
                 GROUP BY r.tipo
                 ORDER BY total DESC`,
                [profesorId, periodo]
            );

            // Lecciones con más comentarios
            const leccionesMasComentadas = await pool.query(
                `SELECT 
                    l.id,
                    l.titulo,
                    l.nivel,
                    COUNT(r.id) as total_comentarios,
                    COUNT(CASE WHEN r.tipo = 'duda' THEN 1 END) as dudas,
                    COUNT(CASE WHEN r.tipo = 'reporte_error' THEN 1 END) as errores
                 FROM lecciones l
                 INNER JOIN retroalimentacion r ON l.id = r.leccion_id
                 WHERE l.profesor_id = ?
                 AND r.fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? DAY)
                 GROUP BY l.id, l.titulo, l.nivel
                 HAVING total_comentarios > 0
                 ORDER BY total_comentarios DESC
                 LIMIT 10`,
                [profesorId, periodo]
            );

            // Palabras clave frecuentes en asuntos (análisis simple)
            const asuntosComunes = await pool.query(
                `SELECT 
                    r.asunto,
                    COUNT(*) as frecuencia
                 FROM retroalimentacion r
                 LEFT JOIN lecciones l ON r.leccion_id = l.id
                 WHERE (l.profesor_id = ? OR l.profesor_id IS NULL)
                 AND r.fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? DAY)
                 GROUP BY r.asunto
                 ORDER BY frecuencia DESC
                 LIMIT 10`,
                [profesorId, periodo]
            );

            return {
                por_tipo: porTipo.map(t => ({
                    tipo: t.tipo,
                    total: t.total,
                    sin_responder: t.sin_responder
                })),
                lecciones_mas_comentadas: leccionesMasComentadas.map(l => ({
                    leccion_id: l.id,
                    titulo: l.titulo,
                    nivel: l.nivel,
                    total_comentarios: l.total_comentarios,
                    dudas: l.dudas,
                    errores: l.errores
                })),
                asuntos_comunes: asuntosComunes.map(a => ({
                    asunto: a.asunto,
                    frecuencia: a.frecuencia
                }))
            };

        } catch (error) {
            throw new Error(`Error al analizar comentarios recurrentes: ${error.message}`);
        }
    },

    /**
     * UC-14: Obtener estadísticas de retroalimentación
     * Para dashboard del profesor
     */
    async obtenerEstadisticasRetroalimentacion(profesorId) {
        const pool = db.pool || db;
        
        try {
            const estadisticas = await pool.query(
                `SELECT 
                    COUNT(*) as total_comentarios,
                    COUNT(CASE WHEN r.respondido = false THEN 1 END) as sin_responder,
                    COUNT(CASE WHEN r.tipo = 'duda' THEN 1 END) as total_dudas,
                    COUNT(CASE WHEN r.tipo = 'sugerencia' THEN 1 END) as total_sugerencias,
                    COUNT(CASE WHEN r.tipo = 'reporte_error' THEN 1 END) as total_errores,
                    COUNT(CASE WHEN r.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as nuevos_semana,
                    AVG(TIMESTAMPDIFF(HOUR, r.fecha_creacion, r.fecha_respuesta)) as tiempo_respuesta_promedio_horas
                 FROM retroalimentacion r
                 LEFT JOIN lecciones l ON r.leccion_id = l.id
                 WHERE l.profesor_id = ? OR l.profesor_id IS NULL`,
                [profesorId]
            );

            return {
                total_comentarios: estadisticas[0].total_comentarios,
                sin_responder: estadisticas[0].sin_responder,
                total_dudas: estadisticas[0].total_dudas,
                total_sugerencias: estadisticas[0].total_sugerencias,
                total_errores: estadisticas[0].total_errores,
                nuevos_semana: estadisticas[0].nuevos_semana,
                tiempo_respuesta_promedio_horas: Math.round(estadisticas[0].tiempo_respuesta_promedio_horas || 0)
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas de retroalimentación: ${error.message}`);
        }
    },

    /**
     * UC-14: Marcar comentario como resuelto
     */
    async marcarComoResuelto(comentarioId, profesorId) {
        const pool = db.pool || db;
        
        try {
            // Verificar que el profesor tenga acceso
            const comentario = await pool.query(
                `SELECT r.id, l.profesor_id
                 FROM retroalimentacion r
                 LEFT JOIN lecciones l ON r.leccion_id = l.id
                 WHERE r.id = ?`,
                [comentarioId]
            );

            if (!comentario.length) {
                throw new Error('Comentario no encontrado');
            }

            if (comentario[0].profesor_id && comentario[0].profesor_id !== profesorId) {
                throw new Error('No tienes acceso a este comentario');
            }

            // Marcar como resuelto
            await pool.query(
                `UPDATE retroalimentacion 
                 SET respondido = true, fecha_respuesta = NOW()
                 WHERE id = ?`,
                [comentarioId]
            );

            return { success: true, mensaje: 'Comentario marcado como resuelto' };

        } catch (error) {
            throw new Error(`Error al marcar comentario como resuelto: ${error.message}`);
        }
    }
};

module.exports = RetroalimentacionModel;
