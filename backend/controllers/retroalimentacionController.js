/* ============================================
   SPEAKLEXI - CONTROLADOR DE RETROALIMENTACIÓN
   Módulo 4: Gestión de Desempeño (UC-14)
   ============================================ */

const RetroalimentacionModel = require('../models/retroalimentacionModel');

const RetroalimentacionController = {
    
    /**
     * POST /api/retroalimentacion
     * Crear un nuevo comentario/retroalimentación
     */
    async crearComentario(req, res) {
        try {
            const {
                leccion_id,
                tipo, // 'duda', 'comentario', 'sugerencia', 'reporte_error'
                asunto,
                mensaje,
                es_privado
            } = req.body;

            // Validaciones
            if (!tipo || !asunto || !mensaje) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Faltan campos requeridos: tipo, asunto, mensaje'
                });
            }

            const tiposValidos = ['duda', 'comentario', 'sugerencia', 'reporte_error'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Tipo de retroalimentación inválido'
                });
            }

            const datos = {
                usuario_id: req.usuario.id,
                leccion_id,
                tipo,
                asunto,
                mensaje,
                es_privado: es_privado || false
            };

            const comentario = await RetroalimentacionModel.crearComentario(datos);

            res.status(201).json({
                success: true,
                mensaje: 'Comentario creado exitosamente',
                data: comentario
            });

        } catch (error) {
            console.error('Error al crear comentario:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al crear comentario',
                error: error.message
            });
        }
    },

    /**
     * GET /api/retroalimentacion
     * Obtener todos los comentarios para el profesor
     * Query params: tipo, leccion_id, solo_sin_respuesta, limite, offset
     */
    async obtenerComentarios(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const filtros = {
                tipo: req.query.tipo,
                leccion_id: req.query.leccion_id ? parseInt(req.query.leccion_id) : undefined,
                solo_sin_respuesta: req.query.solo_sin_respuesta === 'true',
                limite: parseInt(req.query.limite) || 50,
                offset: parseInt(req.query.offset) || 0
            };

            const comentarios = await RetroalimentacionModel.obtenerComentarios(profesorId, filtros);

            res.status(200).json({
                success: true,
                data: comentarios,
                total: comentarios.length,
                filtros_aplicados: filtros
            });

        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener comentarios',
                error: error.message
            });
        }
    },

    /**
     * GET /api/retroalimentacion/:id
     * Obtener detalles de un comentario específico con todas sus respuestas
     */
    async obtenerComentarioPorId(req, res) {
        try {
            const profesorId = req.usuario.id;
            const comentarioId = parseInt(req.params.id);

            if (!comentarioId) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'ID de comentario inválido'
                });
            }

            const comentario = await RetroalimentacionModel.obtenerComentarioPorId(comentarioId, profesorId);

            res.status(200).json({
                success: true,
                data: comentario
            });

        } catch (error) {
            console.error('Error al obtener comentario:', error);
            
            if (error.message.includes('no encontrado') || error.message.includes('no tienes acceso')) {
                return res.status(404).json({
                    success: false,
                    mensaje: error.message
                });
            }

            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener comentario',
                error: error.message
            });
        }
    },

    /**
     * POST /api/retroalimentacion/:id/responder
     * Responder a un comentario
     */
    async responderComentario(req, res) {
        try {
            const profesorId = req.usuario.id;
            const comentarioId = parseInt(req.params.id);
            const { mensaje } = req.body;

            if (!comentarioId) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'ID de comentario inválido'
                });
            }

            if (!mensaje || mensaje.trim() === '') {
                return res.status(400).json({
                    success: false,
                    mensaje: 'El mensaje de respuesta es requerido'
                });
            }

            const respuesta = await RetroalimentacionModel.responderComentario(
                comentarioId,
                profesorId,
                mensaje
            );

            res.status(201).json({
                success: true,
                mensaje: 'Respuesta enviada exitosamente',
                data: respuesta
            });

        } catch (error) {
            console.error('Error al responder comentario:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al responder comentario',
                error: error.message
            });
        }
    },

    /**
     * GET /api/retroalimentacion/analisis/recurrentes
     * Análisis de comentarios recurrentes
     * Query params: periodo (días, default 30)
     */
    async analizarRecurrentes(req, res) {
        try {
            const profesorId = req.usuario.id;
            const periodo = parseInt(req.query.periodo) || 30;

            const analisis = await RetroalimentacionModel.analizarComentariosRecurrentes(
                profesorId,
                periodo
            );

            res.status(200).json({
                success: true,
                data: analisis,
                periodo_dias: periodo
            });

        } catch (error) {
            console.error('Error al analizar comentarios recurrentes:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al analizar comentarios recurrentes',
                error: error.message
            });
        }
    },

    /**
     * GET /api/retroalimentacion/estadisticas
     * Obtener estadísticas de retroalimentación
     */
    async obtenerEstadisticas(req, res) {
        try {
            const profesorId = req.usuario.id;

            const estadisticas = await RetroalimentacionModel.obtenerEstadisticasRetroalimentacion(profesorId);

            res.status(200).json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener estadísticas de retroalimentación',
                error: error.message
            });
        }
    },

    /**
     * PATCH /api/retroalimentacion/:id/resolver
     * Marcar comentario como resuelto
     */
    async marcarResuelto(req, res) {
        try {
            const profesorId = req.usuario.id;
            const comentarioId = parseInt(req.params.id);

            if (!comentarioId) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'ID de comentario inválido'
                });
            }

            const resultado = await RetroalimentacionModel.marcarComoResuelto(comentarioId, profesorId);

            res.status(200).json({
                success: true,
                mensaje: resultado.mensaje
            });

        } catch (error) {
            console.error('Error al marcar comentario como resuelto:', error);
            
            if (error.message.includes('no encontrado') || error.message.includes('no tienes acceso')) {
                return res.status(404).json({
                    success: false,
                    mensaje: error.message
                });
            }

            res.status(500).json({
                success: false,
                mensaje: 'Error al marcar comentario como resuelto',
                error: error.message
            });
        }
    }
};

module.exports = RetroalimentacionController;
