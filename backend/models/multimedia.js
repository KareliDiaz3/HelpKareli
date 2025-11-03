const database = require('../config/database');

class Multimedia {
    /**
     * Subir archivo multimedia
     */
    static async subir(datosMultimedia) {
        const {
            leccion_id,
            nombre_archivo,
            tipo_archivo,
            ruta_archivo,
            tamaño,
            duracion,
            descripcion,
            orden,
            subido_por
        } = datosMultimedia;

        const [result] = await database.query(
            `INSERT INTO multimedia 
             (leccion_id, nombre_archivo, tipo_archivo, ruta_archivo, tamaño, duracion, descripcion, orden, subido_por) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [leccion_id, nombre_archivo, tipo_archivo, ruta_archivo, tamaño, duracion, descripcion, orden, subido_por]
        );

        return result.insertId;
    }

    /**
     * Obtener multimedia por lección
     */
    static async obtenerPorLeccion(leccionId) {
        const [multimedia] = await database.query(
            `SELECT m.*, 
                    u.nombre as subidor_nombre,
                    u.primer_apellido as subidor_apellido
             FROM multimedia m
             LEFT JOIN usuarios u ON m.subido_por = u.id
             WHERE m.leccion_id = ?
             ORDER BY m.orden ASC`,
            [leccionId]
        );

        return multimedia;
    }

    /**
     * Obtener archivo por ID
     */
    static async obtenerPorId(id) {
        const [archivos] = await database.query(
            'SELECT * FROM multimedia WHERE id = ?',
            [id]
        );

        return archivos.length > 0 ? archivos[0] : null;
    }

    /**
     * Eliminar archivo multimedia
     */
    static async eliminar(id) {
        const [result] = await database.query(
            'DELETE FROM multimedia WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Actualizar orden de multimedia
     */
    static async actualizarOrden(id, orden) {
        const [result] = await database.query(
            'UPDATE multimedia SET orden = ? WHERE id = ?',
            [orden, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Obtener estadísticas de uso
     */
    static async obtenerEstadisticas(leccionId) {
        const [estadisticas] = await database.query(
            `SELECT 
                COUNT(*) as total_archivos,
                SUM(tamaño) as tamaño_total,
                AVG(duracion) as duracion_promedio,
                tipo_archivo,
                COUNT(*) as cantidad_por_tipo
             FROM multimedia 
             WHERE leccion_id = ?
             GROUP BY tipo_archivo`,
            [leccionId]
        );

        return estadisticas;
    }
}

module.exports = Multimedia;