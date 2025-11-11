const ProgresoModel = require('../models/progresoModel');
const GamificacionModel = require('../models/gamificacionModel');

/**
 * CONTROLADOR: Progreso de Lecciones y Cursos
 * RF-10: Registrar progreso del alumno
 */

/**
 * ✅ EJEMPLO COMPLETO
 * @desc    Registrar progreso de lección
 * @route   POST /api/progreso/registrar
 * @access  Private (alumno)
 */
exports.registrarProgresoLeccion = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { leccion_id, progreso, tiempo_segundos } = req.body;
        
        // Validaciones
        if (!leccion_id || progreso === undefined) {
            return res.status(400).json({ 
                error: 'leccion_id y progreso son requeridos' 
            });
        }
        
        if (progreso < 0 || progreso > 100) {
            return res.status(400).json({ 
                error: 'El progreso debe estar entre 0 y 100' 
            });
        }
        
        // Registrar progreso
        const resultado = await ProgresoModel.registrarProgresoLeccion(
            usuarioId, 
            leccion_id, 
            { progreso, tiempo_segundos: tiempo_segundos || 0 }
        );
        
        // Si completó la lección (progreso >= 100), otorgar puntos
        if (progreso >= 100 && resultado.recien_completada) {
            await GamificacionModel.otorgarPuntos(
                usuarioId, 
                10, // LECCION_COMPLETADA
                `Lección ${leccion_id} completada`
            );
            await GamificacionModel.actualizarRacha(usuarioId);
        }
        
        res.status(200).json({
            mensaje: 'Progreso registrado exitosamente',
            progreso: resultado
        });
        
    } catch (error) {
        console.error('Error en registrarProgresoLeccion:', error);
        res.status(500).json({ 
            error: 'Error al registrar progreso',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener progreso por lección
 * @route   GET /api/progreso/leccion/:leccionId
 * @access  Private
 */
exports.obtenerProgresoPorLeccion = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { leccionId } = req.params;
        
        if (!leccionId) {
            return res.status(400).json({ 
                error: 'leccionId es requerido' 
            });
        }
        
        const progreso = await ProgresoModel.obtenerProgresoPorLeccion(usuarioId, leccionId);
        
        if (!progreso) {
            return res.status(404).json({ 
                error: 'No se encontró progreso para esta lección',
                sugerencia: 'Puede que aún no hayas comenzado esta lección'
            });
        }
        
        res.json({ 
            progreso,
            mensaje: progreso.completada ? 
                'Lección completada' : 
                `Progreso: ${progreso.progreso}%`
        });
        
    } catch (error) {
        console.error('Error en obtenerProgresoPorLeccion:', error);
        res.status(500).json({ 
            error: 'Error al obtener progreso de la lección',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener progreso por curso
 * @route   GET /api/progreso/curso/:cursoId
 */
exports.obtenerProgresoPorCurso = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { cursoId } = req.params;
        
        if (!cursoId) {
            return res.status(400).json({ 
                error: 'cursoId es requerido' 
            });
        }
        
        const progreso = await ProgresoModel.obtenerProgresoPorCurso(usuarioId, cursoId);
        
        if (!progreso) {
            return res.status(404).json({ 
                error: 'No se encontró el curso o no estás inscrito',
                sugerencia: 'Asegúrate de estar inscrito en este curso'
            });
        }
        
        res.json({ 
            progreso,
            resumen: {
                curso_id: cursoId,
                progreso_general: progreso.progreso_general,
                estado: progreso.estado,
                lecciones_completadas: progreso.lecciones_completadas,
                total_lecciones: progreso.total_lecciones,
                fecha_ultima_actividad: progreso.fecha_ultima_actividad
            }
        });
        
    } catch (error) {
        console.error('Error en obtenerProgresoPorCurso:', error);
        res.status(500).json({ 
            error: 'Error al obtener progreso del curso',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Sincronizar progreso (para uso offline)
 * @route   POST /api/progreso/sincronizar
 */
exports.sincronizarProgreso = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { progresos } = req.body;
        
        if (!Array.isArray(progresos)) {
            return res.status(400).json({ 
                error: 'El campo progresos debe ser un array' 
            });
        }
        
        if (progresos.length === 0) {
            return res.status(400).json({ 
                error: 'El array progresos no puede estar vacío' 
            });
        }
        
        // Validar estructura de cada progreso
        for (const progreso of progresos) {
            if (!progreso.leccion_id || progreso.progreso === undefined) {
                return res.status(400).json({ 
                    error: 'Cada progreso debe tener leccion_id y progreso' 
                });
            }
        }
        
        const resultado = await ProgresoModel.sincronizarProgreso(usuarioId, progresos);
        
        res.json({
            mensaje: `Sincronización completada - ${resultado.actualizados} progresos actualizados`,
            resultado: {
                sincronizados: resultado.actualizados,
                con_errores: resultado.errores,
                nuevos_completados: resultado.nuevos_completados
            }
        });
        
    } catch (error) {
        console.error('Error en sincronizarProgreso:', error);
        res.status(500).json({ 
            error: 'Error al sincronizar progreso',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener historial de progreso
 * @route   GET /api/progreso/historial
 */
exports.obtenerHistorialProgreso = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { limite = 50, offset = 0, tipo = 'todos' } = req.query;
        
        // Validar tipo
        const tiposValidos = ['todos', 'lecciones', 'cursos', 'completados'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ 
                error: 'Tipo inválido. Usa: todos, lecciones, cursos, completados' 
            });
        }
        
        const historial = await ProgresoModel.obtenerHistorialProgreso(
            usuarioId, 
            parseInt(limite),
            parseInt(offset),
            tipo
        );
        
        res.json({
            historial,
            total: historial.length,
            limite: parseInt(limite),
            offset: parseInt(offset),
            tipo
        });
        
    } catch (error) {
        console.error('Error en obtenerHistorialProgreso:', error);
        res.status(500).json({ 
            error: 'Error al obtener historial de progreso',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener resumen de progreso del usuario
 * @route   GET /api/progreso/resumen
 */
exports.obtenerResumenProgreso = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        const resumen = await ProgresoModel.obtenerResumenProgreso(usuarioId);
        
        if (!resumen) {
            return res.status(404).json({ 
                error: 'No se encontró el perfil del estudiante',
                sugerencia: 'Completa tu primer lección para crear tu perfil'
            });
        }
        
        // Calcular estadísticas adicionales
        const estadisticas = {
            ...resumen,
            eficiencia: resumen.lecciones_completadas > 0 ? 
                Math.round((resumen.lecciones_completadas / (resumen.lecciones_completadas + resumen.lecciones_incompletas)) * 100) : 0,
            tiempo_promedio_leccion: resumen.lecciones_completadas > 0 ?
                Math.round(resumen.tiempo_total_segundos / resumen.lecciones_completadas) : 0,
            dias_activo: Math.ceil((new Date() - new Date(resumen.fecha_registro)) / (1000 * 60 * 60 * 24))
        };
        
        res.json({ 
            resumen: estadisticas,
            mensaje: `Nivel ${resumen.nivel_actual} - ${resumen.lecciones_completadas} lecciones completadas`
        });
        
    } catch (error) {
        console.error('Error en obtenerResumenProgreso:', error);
        res.status(500).json({ 
            error: 'Error al obtener resumen de progreso',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ NUEVO: Actualizar progreso de curso (cuando se completa una lección)
 * @route   POST /api/progreso/curso/:cursoId/actualizar
 * @access  Private
 */
exports.actualizarProgresoCurso = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { cursoId } = req.params;
        
        if (!cursoId) {
            return res.status(400).json({ 
                error: 'cursoId es requerido' 
            });
        }
        
        const resultado = await ProgresoModel.actualizarProgresoCurso(usuarioId, cursoId);
        
        res.json({
            mensaje: 'Progreso del curso actualizado',
            resultado
        });
        
    } catch (error) {
        console.error('Error en actualizarProgresoCurso:', error);
        res.status(500).json({ 
            error: 'Error al actualizar progreso del curso',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = exports;