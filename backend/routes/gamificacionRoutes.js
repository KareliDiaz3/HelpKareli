const express = require('express');
const router = express.Router();
const gamificacionController = require('../controllers/gamificacionController');
const { protect, authorize } = require('../middleware/auth');

/**
 * RUTAS: Gamificación (XP, Niveles, Rankings, Logros)
 * Todas las rutas requieren autenticación
 */

// ===================================
// RANKINGS (RF-12)
// ===================================

// Ranking global (TOP usuarios por XP total)
router.get('/ranking/global', protect, gamificacionController.obtenerRankingGlobal);

// Ranking semanal
router.get('/ranking/semanal', protect, gamificacionController.obtenerRankingSemanal);

// Ranking mensual
router.get('/ranking/mensual', protect, gamificacionController.obtenerRankingMensual);

// Ranking por nivel CEFR (A1, A2, B1, B2, C1, C2)
router.get('/ranking/nivel/:nivel', protect, gamificacionController.obtenerRankingPorNivel);

// Obtener mi posición en el ranking
router.get('/mi-posicion', protect, gamificacionController.obtenerMiPosicion);

// ===================================
// PUNTOS Y NIVEL (RF-11)
// ===================================

// Obtener puntos XP del usuario actual
router.get('/puntos', protect, gamificacionController.obtenerPuntosUsuario);

// Obtener nivel del usuario actual
router.get('/nivel', protect, gamificacionController.obtenerNivelUsuario);

// ===================================
// RACHA (RF-11)
// ===================================

// Obtener racha del usuario actual
router.get('/racha', protect, gamificacionController.obtenerRachaUsuario);

// ===================================
// LOGROS (RF-11)
// ===================================

// Obtener logros del usuario actual
router.get('/logros', protect, gamificacionController.obtenerLogrosUsuario);

// Desbloquear logro específico
router.post('/logros/:logroId/desbloquear', protect, gamificacionController.desbloquearLogro);

// ===================================
// ADMIN/TESTING (RF-11)
// ===================================

// Otorgar puntos manualmente (para testing/admin)
router.post(
    '/otorgar-puntos', 
    protect, 
    authorize(['admin', 'profesor']), // Solo admin/profesor
    gamificacionController.otorgarPuntos
);

module.exports = router;