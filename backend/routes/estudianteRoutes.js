/* ============================================
   SPEAKLEXI - RUTAS DE ESTUDIANTE (ACTUALIZACIÓN MÓDULO 4)
   ============================================ */

const express = require('express');
const router = express.Router();
const RetroalimentacionModel = require('../models/retroalimentacionModel');
const PlanificacionModel = require('../models/planificacionModel');
const { verificarToken, verificarEstudiante } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);
router.use(verificarEstudiante);

// ============================================
// RETROALIMENTACIÓN - ESTUDIANTE
// ============================================

/**
 * @route   GET /api/estudiante/retroalimentacion
 * @desc    Obtener retroalimentación recibida por el estudiante
 * @access  Private (Estudiante only)
 */
router.get('/retroalimentacion', async (req, res) => {
    try {
        const estudianteId = req.usuario.id;
        const retroalimentaciones = await RetroalimentacionModel.obtenerPorEstudiante(estudianteId);
        
        res.json({
            success: true,
            data: retroalimentaciones
        });
    } catch (error) {
        console.error('Error en obtener retroalimentación estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener retroalimentación',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/estudiante/retroalimentacion/:id/leer
 * @desc    Marcar retroalimentación como leída
 * @access  Private (Estudiante only)
 */
router.put('/retroalimentacion/:id/leer', async (req, res) => {
    try {
        const estudianteId = req.usuario.id;
        const { id } = req.params;
        
        await RetroalimentacionModel.marcarComoLeida(id, estudianteId);
        
        res.json({
            success: true,
            message: 'Retroalimentación marcada como leída'
        });
    } catch (error) {
        console.error('Error en marcar como leída:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar como leída',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/estudiante/retroalimentacion/no-leidas/count
 * @desc    Contar retroalimentaciones no leídas
 * @access  Private (Estudiante only)
 */
router.get('/retroalimentacion/no-leidas/count', async (req, res) => {
    try {
        const estudianteId = req.usuario.id;
        const total = await RetroalimentacionModel.contarNoLeidas(estudianteId);
        
        res.json({
            success: true,
            data: { total }
        });
    } catch (error) {
        console.error('Error en contar no leídas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al contar no leídas',
            error: error.message
        });
    }
});

// ============================================
//PLANES DE ESTUDIO - ESTUDIANTE
// ============================================

/**
 * @route   GET /api/estudiante/planes
 * @desc    Obtener planes de estudio asignados al estudiante
 * @access  Private (Estudiante only)
 */
router.get('/planes', async (req, res) => {
    try {
        const estudianteId = req.usuario.id;
        const planes = await PlanificacionModel.obtenerPorEstudiante(estudianteId);
        
        res.json({
            success: true,
            data: planes
        });
    } catch (error) {
        console.error('Error en obtener planes estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener planes',
            error: error.message
        });
    }
});

module.exports = router;