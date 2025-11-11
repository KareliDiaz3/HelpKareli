/* ============================================
   SPEAKLEXI - CONTROLADOR DE PLANIFICACIÓN
   Módulo 4: Gestión de Desempeño (UC-15)
   ============================================ */

const PlanificacionModel = require('../models/planificacionModel');

const PlanificacionController = {
    
    /**
     * GET /api/planificacion/areas-mejora
     * Identificar áreas de mejora comunes
     */
    async identificarAreasMejora(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const areas = await PlanificacionModel.identificarAreasMejora(profesorId);
            
            res.status(200).json({
                success: true,
                data: areas
            });

        } catch (error) {
            console.error('Error al identificar áreas de mejora:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al identificar áreas de mejora',
                error: error.message
            });
        }
    },

    /**
     * GET /api/planificacion/sugerencias-contenido
     * Generar sugerencias de contenido adicional
     */
    async generarSugerencias(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const sugerencias = await PlanificacionModel.generarSugerenciasContenido(profesorId);
            
            res.status(200).json({
                success: true,
                data: sugerencias
            });

        } catch (error) {
            console.error('Error al generar sugerencias:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al generar sugerencias de contenido',
                error: error.message
            });
        }
    },

    /**
     * GET /api/planificacion/analisis-dificultad
     * Analizar dificultad de lecciones existentes
     */
    async analizarDificultad(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const analisis = await PlanificacionModel.analizarDificultadLecciones(profesorId);
            
            res.status(200).json({
                success: true,
                data: analisis,
                total: analisis.length
            });

        } catch (error) {
            console.error('Error al analizar dificultad:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al analizar dificultad de lecciones',
                error: error.message
            });
        }
    },

    /**
     * GET /api/planificacion/recomendaciones
     * Obtener recomendaciones consolidadas de planificación
     */
    async obtenerRecomendaciones(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const recomendaciones = await PlanificacionModel.obtenerRecomendacionesConsolidadas(profesorId);
            
            res.status(200).json({
                success: true,
                data: recomendaciones
            });

        } catch (error) {
            console.error('Error al obtener recomendaciones:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener recomendaciones de planificación',
                error: error.message
            });
        }
    }
};

module.exports = PlanificacionController;
