/* ============================================
   SPEAKLEXI - RUTAS DE RETROALIMENTACIÓN
   Módulo 4: Gestión de Desempeño (UC-14)
   ============================================ */

const express = require('express');
const router = express.Router();
const retroalimentacionController = require('../controllers/retroalimentacionController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   POST /api/retroalimentacion
 * @desc    Crear un nuevo comentario/retroalimentación
 * @body    leccion_id, tipo, asunto, mensaje, es_privado
 * @access  Estudiante/Profesor
 */
router.post('/', retroalimentacionController.crearComentario);

/**
 * @route   GET /api/retroalimentacion
 * @desc    Obtener todos los comentarios para el profesor
 * @query   tipo, leccion_id, solo_sin_respuesta, limite, offset
 * @access  Profesor
 */
router.get('/', retroalimentacionController.obtenerComentarios);

/**
 * @route   GET /api/retroalimentacion/estadisticas
 * @desc    Obtener estadísticas de retroalimentación
 * @access  Profesor
 */
router.get('/estadisticas', retroalimentacionController.obtenerEstadisticas);

/**
 * @route   GET /api/retroalimentacion/analisis/recurrentes
 * @desc    Análisis de comentarios recurrentes
 * @query   periodo (días)
 * @access  Profesor
 */
router.get('/analisis/recurrentes', retroalimentacionController.analizarRecurrentes);

/**
 * @route   GET /api/retroalimentacion/:id
 * @desc    Obtener detalles de un comentario específico
 * @access  Profesor/Estudiante (autor)
 */
router.get('/:id', retroalimentacionController.obtenerComentarioPorId);

/**
 * @route   POST /api/retroalimentacion/:id/responder
 * @desc    Responder a un comentario
 * @body    mensaje
 * @access  Profesor
 */
router.post('/:id/responder', retroalimentacionController.responderComentario);

/**
 * @route   PATCH /api/retroalimentacion/:id/resolver
 * @desc    Marcar comentario como resuelto
 * @access  Profesor
 */
router.patch('/:id/resolver', retroalimentacionController.marcarResuelto);

module.exports = router;
