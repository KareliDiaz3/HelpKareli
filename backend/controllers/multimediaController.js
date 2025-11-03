const Multimedia = require('../models/multimedia');
const Leccion = require('../models/leccion');
const fs = require('fs').promises;
const path = require('path');

// @desc    Subir archivo multimedia
// @route   POST /api/multimedia/subir
// @access  Private (Profesor/Admin)
exports.subirMultimedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No se ha proporcionado ningún archivo'
            });
        }

        const { leccion_id, descripcion, orden } = req.body;

        if (!leccion_id) {
            // Eliminar archivo subido si no hay lección_id
            await fs.unlink(req.file.path);
            return res.status(400).json({
                error: 'El ID de lección es requerido'
            });
        }

        // Verificar que la lección existe y el usuario tiene permisos
        const leccion = await Leccion.obtenerPorId(leccion_id);
        if (!leccion) {
            await fs.unlink(req.file.path);
            return res.status(404).json({
                error: 'Lección no encontrada'
            });
        }

        if (leccion.creado_por !== req.user.id && req.user.rol !== 'admin') {
            await fs.unlink(req.file.path);
            return res.status(403).json({
                error: 'No tienes permisos para agregar multimedia a esta lección'
            });
        }

        const datosMultimedia = {
            leccion_id,
            nombre_archivo: req.file.originalname,
            tipo_archivo: req.file.mimetype,
            ruta_archivo: req.file.path,
            tamaño: req.file.size,
            duracion: req.body.duracion || null,
            descripcion: descripcion || '',
            orden: orden || 0,
            subido_por: req.user.id
        };

        const multimediaId = await Multimedia.subir(datosMultimedia);

        res.status(201).json({
            mensaje: 'Archivo subido exitosamente',
            multimedia: {
                id: multimediaId,
                ...datosMultimedia,
                ruta_archivo: `/uploads/${path.basename(req.file.path)}` // Ruta pública
            }
        });

    } catch (error) {
        console.error('Error subiendo multimedia:', error);
        
        // Limpiar archivo en caso de error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('Error limpiando archivo:', cleanupError);
            }
        }

        res.status(500).json({
            error: 'Error interno del servidor al subir archivo'
        });
    }
};

// @desc    Obtener multimedia por lección
// @route   GET /api/multimedia/leccion/:leccionId
// @access  Private
exports.obtenerMultimediaPorLeccion = async (req, res) => {
    try {
        const { leccionId } = req.params;

        const multimedia = await Multimedia.obtenerPorLeccion(leccionId);

        res.json({
            multimedia,
            total: multimedia.length
        });

    } catch (error) {
        console.error('Error obteniendo multimedia:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener multimedia'
        });
    }
};

// @desc    Eliminar archivo multimedia
// @route   DELETE /api/multimedia/:id
// @access  Private (Profesor/Admin)
exports.eliminarMultimedia = async (req, res) => {
    try {
        const multimediaId = req.params.id;

        // Obtener información del archivo
        const archivo = await Multimedia.obtenerPorId(multimediaId);
        if (!archivo) {
            return res.status(404).json({
                error: 'Archivo multimedia no encontrado'
            });
        }

        // Verificar permisos
        const leccion = await Leccion.obtenerPorId(archivo.leccion_id);
        if (leccion.creado_por !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({
                error: 'No tienes permisos para eliminar este archivo'
            });
        }

        // Eliminar archivo físico
        try {
            await fs.unlink(archivo.ruta_archivo);
        } catch (fileError) {
            console.warn('No se pudo eliminar el archivo físico:', fileError.message);
        }

        // Eliminar registro de la base de datos
        const eliminado = await Multimedia.eliminar(multimediaId);

        if (eliminado) {
            res.json({
                mensaje: 'Archivo multimedia eliminado exitosamente'
            });
        } else {
            res.status(400).json({
                error: 'No se pudo eliminar el archivo multimedia'
            });
        }

    } catch (error) {
        console.error('Error eliminando multimedia:', error);
        res.status(500).json({
            error: 'Error interno del servidor al eliminar multimedia'
        });
    }
};

// @desc    Actualizar orden de multimedia
// @route   PUT /api/multimedia/:id/orden
// @access  Private (Profesor/Admin)
exports.actualizarOrden = async (req, res) => {
    try {
        const multimediaId = req.params.id;
        const { orden } = req.body;

        if (orden === undefined || orden < 0) {
            return res.status(400).json({
                error: 'El orden debe ser un número positivo'
            });
        }

        const actualizado = await Multimedia.actualizarOrden(multimediaId, orden);

        if (actualizado) {
            res.json({
                mensaje: 'Orden actualizado exitosamente'
            });
        } else {
            res.status(400).json({
                error: 'No se pudo actualizar el orden'
            });
        }

    } catch (error) {
        console.error('Error actualizando orden:', error);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar orden'
        });
    }
};