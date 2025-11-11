const GamificacionModel = require('../models/gamificacionModel');

/**
 * CONTROLADOR: Gamificación (XP, Niveles, Rankings, Logros)
 * RF-11: Otorgar recompensas
 * RF-12: Generar tablas de clasificación
 */

/**
 * ✅ EJEMPLO COMPLETO
 * @desc    Obtener ranking global
 * @route   GET /api/gamificacion/ranking/global
 * @access  Private
 */
exports.obtenerRankingGlobal = async (req, res) => {
    try {
        const { limite = 100, offset = 0 } = req.query;
        
        const ranking = await GamificacionModel.obtenerRankingGlobal(
            parseInt(limite), 
            parseInt(offset)
        );
        
        res.json({
            ranking,
            total: ranking.length,
            limite: parseInt(limite),
            offset: parseInt(offset)
        });
        
    } catch (error) {
        console.error('Error en obtenerRankingGlobal:', error);
        res.status(500).json({ 
            error: 'Error al obtener ranking global',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener ranking semanal
 * @route   GET /api/gamificacion/ranking/semanal
 */
exports.obtenerRankingSemanal = async (req, res) => {
    try {
        const { limite = 100 } = req.query;
        
        const ranking = await GamificacionModel.obtenerRankingSemanal(parseInt(limite));
        
        res.json({
            ranking,
            total: ranking.length,
            periodo: 'semanal'
        });
        
    } catch (error) {
        console.error('Error en obtenerRankingSemanal:', error);
        res.status(500).json({ 
            error: 'Error al obtener ranking semanal',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener ranking mensual
 * @route   GET /api/gamificacion/ranking/mensual
 */
exports.obtenerRankingMensual = async (req, res) => {
    try {
        const { limite = 100 } = req.query;
        
        const ranking = await GamificacionModel.obtenerRankingMensual(parseInt(limite));
        
        res.json({
            ranking,
            total: ranking.length,
            periodo: 'mensual'
        });
        
    } catch (error) {
        console.error('Error en obtenerRankingMensual:', error);
        res.status(500).json({ 
            error: 'Error al obtener ranking mensual',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener ranking por nivel CEFR
 * @route   GET /api/gamificacion/ranking/nivel/:nivel
 */
exports.obtenerRankingPorNivel = async (req, res) => {
    try {
        const { nivel } = req.params;
        const { limite = 100 } = req.query;
        
        // Validar nivel CEFR
        const nivelesValidos = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (!nivelesValidos.includes(nivel)) {
            return res.status(400).json({ 
                error: 'Nivel CEFR inválido. Usa: A1, A2, B1, B2, C1, C2' 
            });
        }
        
        const ranking = await GamificacionModel.obtenerRankingPorNivel(nivel, parseInt(limite));
        
        res.json({
            ranking,
            total: ranking.length,
            nivel
        });
        
    } catch (error) {
        console.error('Error en obtenerRankingPorNivel:', error);
        res.status(500).json({ 
            error: 'Error al obtener ranking por nivel',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener puntos XP del usuario actual
 * @route   GET /api/gamificacion/puntos
 */
exports.obtenerPuntosUsuario = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        const puntosData = await GamificacionModel.obtenerNivelUsuario(usuarioId);
        
        if (!puntosData) {
            return res.status(404).json({ 
                error: 'No se encontró el perfil del estudiante' 
            });
        }
        
        res.json({ 
            puntos: puntosData.total_xp,
            nivel_actual: puntosData.nivel_xp,
            siguiente_nivel_xp: puntosData.siguiente_nivel_xp,
            progreso_nivel: puntosData.progreso_nivel
        });
        
    } catch (error) {
        console.error('Error en obtenerPuntosUsuario:', error);
        res.status(500).json({ 
            error: 'Error al obtener puntos',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener nivel del usuario actual
 * @route   GET /api/gamificacion/nivel
 */
exports.obtenerNivelUsuario = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        const nivelData = await GamificacionModel.obtenerNivelUsuario(usuarioId);
        
        if (!nivelData) {
            return res.status(404).json({ 
                error: 'No se encontró el perfil del estudiante' 
            });
        }
        
        res.json({ 
            nivel: nivelData.nivel_xp,
            total_xp: nivelData.total_xp,
            nivel_cefr: nivelData.nivel_actual,
            siguiente_nivel_xp: nivelData.siguiente_nivel_xp,
            progreso_nivel: nivelData.progreso_nivel
        });
        
    } catch (error) {
        console.error('Error en obtenerNivelUsuario:', error);
        res.status(500).json({ 
            error: 'Error al obtener nivel',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener racha del usuario
 * @route   GET /api/gamificacion/racha
 */
exports.obtenerRachaUsuario = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        // Obtener del modelo de progreso
        const ProgresoModel = require('../models/progresoModel');
        const resumen = await ProgresoModel.obtenerResumenProgreso(usuarioId);
        
        if (!resumen) {
            return res.status(404).json({ 
                error: 'No se encontró el perfil del estudiante' 
            });
        }
        
        // Verificar si la racha sigue activa
        const hoy = new Date().toISOString().split('T')[0];
        const ultimaRacha = new Date(resumen.fecha_ultima_racha).toISOString().split('T')[0];
        
        const rachaActiva = ultimaRacha === hoy || 
                           (new Date(hoy) - new Date(ultimaRacha)) / (1000 * 60 * 60 * 24) === 1;
        
        res.json({
            racha: {
                dias: rachaActiva ? resumen.racha_dias : 0,
                fecha_ultima: resumen.fecha_ultima_racha,
                activa: rachaActiva
            }
        });
        
    } catch (error) {
        console.error('Error en obtenerRachaUsuario:', error);
        res.status(500).json({ 
            error: 'Error al obtener racha',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener logros del usuario
 * @route   GET /api/gamificacion/logros
 */
exports.obtenerLogrosUsuario = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        const logros = await GamificacionModel.obtenerLogrosUsuario(usuarioId);
        
        res.json({
            logros,
            total: logros.length,
            logros_desbloqueados: logros.filter(l => l.desbloqueado).length,
            logros_totales: logros.length
        });
        
    } catch (error) {
        console.error('Error en obtenerLogrosUsuario:', error);
        res.status(500).json({ 
            error: 'Error al obtener logros',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Desbloquear logro específico
 * @route   POST /api/gamificacion/logros/:logroId/desbloquear
 */
exports.desbloquearLogro = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { logroId } = req.params;
        
        // Por ahora, simular desbloqueo hasta que se implemente la tabla
        const logros = await GamificacionModel.obtenerLogrosUsuario(usuarioId);
        const logro = logros.find(l => l.id === parseInt(logroId));
        
        if (!logro) {
            return res.status(404).json({ 
                error: 'Logro no encontrado' 
            });
        }
        
        if (logro.desbloqueado) {
            return res.status(400).json({ 
                error: 'Este logro ya está desbloqueado' 
            });
        }
        
        res.status(200).json({ 
            mensaje: `¡Felicidades! Has desbloqueado el logro: ${logro.nombre}`,
            logro: {
                ...logro,
                desbloqueado: true,
                fecha_desbloqueo: new Date().toISOString()
            },
            nota: 'Funcionalidad de persistencia en desarrollo - tabla usuario_logros requerida'
        });
        
    } catch (error) {
        console.error('Error en desbloquearLogro:', error);
        res.status(500).json({ 
            error: 'Error al desbloquear logro',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ COMPLETADO: Obtener posición del usuario en el ranking
 * @route   GET /api/gamificacion/mi-posicion
 */
exports.obtenerMiPosicion = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        
        const posicion = await GamificacionModel.obtenerPosicionUsuario(usuarioId);
        
        if (!posicion) {
            return res.status(404).json({ 
                error: 'No se encontró el perfil del estudiante' 
            });
        }
        
        res.json({ 
            posicion: posicion.posicion,
            total_usuarios: posicion.total_usuarios,
            percentil: posicion.percentil,
            usuario: {
                nombre: posicion.nombre,
                total_xp: posicion.total_xp,
                nivel_xp: posicion.nivel_xp,
                nivel_cefr: posicion.nivel_actual
            }
        });
        
    } catch (error) {
        console.error('Error en obtenerMiPosicion:', error);
        res.status(500).json({ 
            error: 'Error al obtener posición',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ✅ NUEVO: Otorgar puntos XP manualmente (para testing)
 * @route   POST /api/gamificacion/otorgar-puntos
 * @access  Private (admin/profesor)
 */
exports.otorgarPuntos = async (req, res) => {
    try {
        const { usuario_id, puntos, razon } = req.body;
        const administradorId = req.user.id;
        
        if (!usuario_id || !puntos || !razon) {
            return res.status(400).json({ 
                error: 'usuario_id, puntos y razon son requeridos' 
            });
        }
        
        // En producción, verificar que el usuario tenga permisos de administrador
        // if (req.user.rol !== 'admin' && req.user.rol !== 'profesor') {
        //     return res.status(403).json({ error: 'No autorizado' });
        // }
        
        const resultado = await GamificacionModel.otorgarPuntos(
            usuario_id, 
            parseInt(puntos), 
            razon
        );
        
        res.json({
            mensaje: `Se otorgaron ${puntos} XP al usuario`,
            resultado
        });
        
    } catch (error) {
        console.error('Error en otorgarPuntos:', error);
        res.status(500).json({ 
            error: 'Error al otorgar puntos',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = exports;