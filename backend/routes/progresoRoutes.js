const express = require('express');
const router = express.Router();
const progresoController = require('../controllers/progresoController');
const { protect, authorize } = require('../middleware/auth');

/**
 * RUTAS: Progreso de Lecciones y Cursos
 * Todas las rutas requieren autenticación (protect)
 * Algunas solo para alumnos (authorize('alumno'))
 */

// ===================================
// RUTAS DE REGISTRO DE PROGRESO
// ===================================

// Registrar progreso de lección (POST)
router.post(
    '/registrar', 
    protect, 
    authorize('alumno'), 
    progresoController.registrarProgresoLeccion
);

// Sincronizar progreso (para offline)
router.post(
    '/sincronizar', 
    protect, 
    authorize('alumno'), 
    progresoController.sincronizarProgreso
);

// ===================================
// RUTAS DE CONSULTA DE PROGRESO
// ===================================

// Obtener resumen de progreso del usuario
router.get('/resumen', protect, progresoController.obtenerResumenProgreso);

// Obtener historial de progreso
router.get('/historial', protect, progresoController.obtenerHistorialProgreso);

// Obtener progreso por lección específica
router.get('/leccion/:leccionId', protect, progresoController.obtenerProgresoPorLeccion);

// Obtener progreso por curso específico
router.get('/curso/:cursoId', protect, progresoController.obtenerProgresoPorCurso);

// ===================================
// ACTUALIZACIÓN DE PROGRESO DE CURSO
// ===================================

// Actualizar progreso de curso (cuando se completa una lección)
router.post(
    '/curso/:cursoId/actualizar', 
    protect, 
    authorize('alumno'), 
    progresoController.actualizarProgresoCurso
);

module.exports = router;