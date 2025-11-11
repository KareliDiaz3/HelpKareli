/* ============================================
   SPEAKLEXI - CONTROLADOR DE ESTADÍSTICAS
   Módulo 4: Gestión de Desempeño (UC-13)
   ============================================ */

const EstadisticasModel = require('../models/estadisticasModel');

const EstadisticasController = {
    
    /**
     * GET /api/estadisticas/generales
     * Obtener estadísticas generales del profesor
     */
    async obtenerEstadisticasGenerales(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const estadisticas = await EstadisticasModel.obtenerEstadisticasGenerales(profesorId);
            
            res.status(200).json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas generales:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener estadísticas generales',
                error: error.message
            });
        }
    },

    /**
     * GET /api/estadisticas/alumnos
     * Obtener lista de alumnos con su progreso
     * Query params: nivel, idioma, ordenar, limite
     */
    async obtenerListaAlumnos(req, res) {
        try {
            const profesorId = req.usuario.id;
            const filtros = {
                nivel: req.query.nivel,
                idioma: req.query.idioma,
                ordenar: req.query.ordenar || 'nombre',
                limite: parseInt(req.query.limite) || 50
            };
            
            const alumnos = await EstadisticasModel.obtenerListaAlumnos(profesorId, filtros);
            
            res.status(200).json({
                success: true,
                data: alumnos,
                total: alumnos.length
            });

        } catch (error) {
            console.error('Error al obtener lista de alumnos:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener lista de alumnos',
                error: error.message
            });
        }
    },

    /**
     * GET /api/estadisticas/alumno/:id
     * Obtener progreso individual detallado de un alumno
     */
    async obtenerProgresoIndividual(req, res) {
        try {
            const profesorId = req.usuario.id;
            const alumnoId = parseInt(req.params.id);
            
            if (!alumnoId) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'ID de alumno inválido'
                });
            }
            
            const progreso = await EstadisticasModel.obtenerProgresoIndividual(alumnoId, profesorId);
            
            res.status(200).json({
                success: true,
                data: progreso
            });

        } catch (error) {
            console.error('Error al obtener progreso individual:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    mensaje: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener progreso individual',
                error: error.message
            });
        }
    },

    /**
     * GET /api/estadisticas/tiempos-promedio
     * Obtener tiempos promedio por lección
     */
    async obtenerTiemposPromedio(req, res) {
        try {
            const profesorId = req.usuario.id;
            
            const tiempos = await EstadisticasModel.obtenerTiempoPromedioPorLeccion(profesorId);
            
            res.status(200).json({
                success: true,
                data: tiempos,
                total: tiempos.length
            });

        } catch (error) {
            console.error('Error al obtener tiempos promedio:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener tiempos promedio',
                error: error.message
            });
        }
    },

    /**
     * GET /api/estadisticas/tasas-completitud
     * Obtener tasas de completitud por nivel/idioma
     * Query params: agrupar_por (nivel o idioma)
     */
    async obtenerTasasCompletitud(req, res) {
        try {
            const profesorId = req.usuario.id;
            const agruparPor = req.query.agrupar_por || 'nivel';
            
            if (!['nivel', 'idioma'].includes(agruparPor)) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'agrupar_por debe ser "nivel" o "idioma"'
                });
            }
            
            const tasas = await EstadisticasModel.obtenerTasasCompletitud(profesorId, agruparPor);
            
            res.status(200).json({
                success: true,
                data: tasas,
                agrupado_por: agruparPor
            });

        } catch (error) {
            console.error('Error al obtener tasas de completitud:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener tasas de completitud',
                error: error.message
            });
        }
    },

    /**
     * GET /api/estadisticas/tendencia
     * Obtener tendencia de progreso semanal/mensual
     * Query params: periodo (semanal o mensual)
     */
    async obtenerTendencia(req, res) {
        try {
            const profesorId = req.usuario.id;
            const periodo = req.query.periodo || 'semanal';
            
            if (!['semanal', 'mensual'].includes(periodo)) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'periodo debe ser "semanal" o "mensual"'
                });
            }
            
            const tendencia = await EstadisticasModel.obtenerTendenciaProgreso(profesorId, periodo);
            
            res.status(200).json({
                success: true,
                data: tendencia,
                periodo
            });

        } catch (error) {
            console.error('Error al obtener tendencia:', error);
            res.status(500).json({
                success: false,
                mensaje: 'Error al obtener tendencia de progreso',
                error: error.message
            });
        }
    }
};

module.exports = EstadisticasController;
