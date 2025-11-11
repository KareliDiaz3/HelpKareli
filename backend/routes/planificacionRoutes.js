/* ============================================
   SPEAKLEXI - RUTAS DE PLANIFICACIÓN
   Módulo 4: Gestión de Desempeño (UC-15)
   ============================================ */

const express = require('express');
const router = express.Router();
const planificacionController = require('../controllers/planificacionController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de profesor
router.use(authMiddleware);

/**
 * @route   GET /api/planificacion/areas-mejora
 * @desc    Identificar áreas de mejora comunes
 * @access  Profesor
 */
router.get('/areas-mejora', planificacionController.identificarAreasMejora);

/**
 * @route   GET /api/planificacion/sugerencias-contenido
 * @desc    Generar sugerencias de contenido adicional
 * @access  Profesor
 */
router.get('/sugerencias-contenido', planificacionController.generarSugerencias);

/**
 * @route   GET /api/planificacion/analisis-dificultad
 * @desc    Analizar dificultad de lecciones existentes
 * @access  Profesor
 */
router.get('/analisis-dificultad', planificacionController.analizarDificultad);

/**
 * @route   GET /api/planificacion/recomendaciones
 * @desc    Obtener recomendaciones consolidadas de planificación
 * @access  Profesor
 */
router.get('/recomendaciones', planificacionController.obtenerRecomendaciones);

module.exports = router;
