const Leccion = require('../models/leccion');
const Multimedia = require('../models/multimedia');

// @desc    Crear nueva lección
// @route   POST /api/lecciones/crear
// @access  Private (Profesor/Admin)
exports.crearLeccion = async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            contenido,
            nivel,
            idioma,
            duracion_minutos,
            orden
        } = req.body;

        // Validar datos requeridos
        if (!titulo || !nivel || !idioma) {
            return res.status(400).json({
                error: 'Título, nivel e idioma son requeridos'
            });
        }

        const leccionData = {
            titulo,
            descripcion: descripcion || '',
            contenido: contenido || '',
            nivel,
            idioma,
            duracion_minutos: duracion_minutos || 30,
            orden: orden || 0,
            creado_por: req.user.id
        };

        const leccionId = await Leccion.crear(leccionData);

        res.status(201).json({
            mensaje: 'Lección creada exitosamente',
            leccion: {
                id: leccionId,
                ...leccionData
            }
        });

    } catch (error) {
        console.error('Error creando lección:', error);
        res.status(500).json({
            error: 'Error interno del servidor al crear lección'
        });
    }
};

// @desc    Obtener lección por ID
// @route   GET /api/lecciones/:id
// @access  Private
exports.obtenerLeccion = async (req, res) => {
    try {
        const leccionId = req.params.id;
        const leccion = await Leccion.obtenerPorId(leccionId);

        if (!leccion) {
            return res.status(404).json({
                error: 'Lección no encontrada'
            });
        }

        // Obtener multimedia asociada
        const multimedia = await Multimedia.obtenerPorLeccion(leccionId);

        res.json({
            leccion: {
                ...leccion,
                multimedia
            }
        });

    } catch (error) {
        console.error('Error obteniendo lección:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener lección'
        });
    }
};

// @desc    Listar lecciones por nivel e idioma
// @route   GET /api/lecciones/nivel/:nivel
// @access  Private
exports.listarLecciones = async (req, res) => {
    try {
        const { nivel } = req.params;
        const { idioma, pagina = 1, limite = 10 } = req.query;

        if (!idioma) {
            return res.status(400).json({
                error: 'El parámetro idioma es requerido'
            });
        }

        const resultado = await Leccion.listarPorNivel(nivel, idioma, pagina, limite);

        res.json(resultado);

    } catch (error) {
        console.error('Error listando lecciones:', error);
        res.status(500).json({
            error: 'Error interno del servidor al listar lecciones'
        });
    }
};

// @desc    Actualizar lección
// @route   PUT /api/lecciones/:id
// @access  Private (Profesor/Admin)
exports.actualizarLeccion = async (req, res) => {
    try {
        const leccionId = req.params.id;
        const datosActualizacion = req.body;

        // Verificar que la lección existe
        const leccionExistente = await Leccion.obtenerPorId(leccionId);
        if (!leccionExistente) {
            return res.status(404).json({
                error: 'Lección no encontrada'
            });
        }

        // Verificar permisos (solo el creador o admin puede editar)
        if (leccionExistente.creado_por !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({
                error: 'No tienes permisos para editar esta lección'
            });
        }

        const actualizado = await Leccion.actualizar(leccionId, datosActualizacion);

        if (actualizado) {
            res.json({
                mensaje: 'Lección actualizada exitosamente'
            });
        } else {
            res.status(400).json({
                error: 'No se pudo actualizar la lección'
            });
        }

    } catch (error) {
        console.error('Error actualizando lección:', error);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar lección'
        });
    }
};

// @desc    Eliminar lección
// @route   DELETE /api/lecciones/:id
// @access  Private (Profesor/Admin)
exports.eliminarLeccion = async (req, res) => {
    try {
        const leccionId = req.params.id;

        // Verificar que la lección existe
        const leccionExistente = await Leccion.obtenerPorId(leccionId);
        if (!leccionExistente) {
            return res.status(404).json({
                error: 'Lección no encontrada'
            });
        }

        // Verificar permisos
        if (leccionExistente.creado_por !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({
                error: 'No tienes permisos para eliminar esta lección'
            });
        }

        const eliminado = await Leccion.eliminar(leccionId);

        if (eliminado) {
            res.json({
                mensaje: 'Lección eliminada exitosamente'
            });
        } else {
            res.status(400).json({
                error: 'No se pudo eliminar la lección'
            });
        }

    } catch (error) {
        console.error('Error eliminando lección:', error);
        res.status(500).json({
            error: 'Error interno del servidor al eliminar lección'
        });
    }
};

// @desc    Registrar progreso de lección
// @route   POST /api/lecciones/:id/progreso
// @access  Private
exports.registrarProgreso = async (req, res) => {
    try {
        const leccionId = req.params.id;
        const { progreso } = req.body;
        const usuarioId = req.user.id;

        if (progreso < 0 || progreso > 100) {
            return res.status(400).json({
                error: 'El progreso debe estar entre 0 y 100'
            });
        }

        // Verificar que la lección existe
        const leccionExistente = await Leccion.obtenerPorId(leccionId);
        if (!leccionExistente) {
            return res.status(404).json({
                error: 'Lección no encontrada'
            });
        }

        await Leccion.registrarProgreso(usuarioId, leccionId, progreso);

        res.json({
            mensaje: 'Progreso registrado exitosamente',
            progreso,
            completada: progreso === 100
        });

    } catch (error) {
        console.error('Error registrando progreso:', error);
        res.status(500).json({
            error: 'Error interno del servidor al registrar progreso'
        });
    }
};