const database = require('../config/database');

class Leccion {
    /**
     * Crear nueva lección
     */
    static async crear(leccionData) {
        const {
            titulo,
            descripcion,
            contenido,
            nivel,
            idioma,
            duracion_minutos,
            orden,
            creado_por,
            estado = 'activa'
        } = leccionData;

        const [result] = await database.query(
            `INSERT INTO lecciones 
             (titulo, descripcion, contenido, nivel, idioma, duracion_minutos, orden, creado_por, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion, contenido, nivel, idioma, duracion_minutos, orden, creado_por, estado]
        );

        return result.insertId;
    }

    /**
     * Obtener lección por ID
     */
    static async obtenerPorId(id) {
        const [lecciones] = await database.query(
            `SELECT l.*, 
                    u.nombre as creador_nombre,
                    u.primer_apellido as creador_apellido
             FROM lecciones l
             LEFT JOIN usuarios u ON l.creado_por = u.id
             WHERE l.id = ? AND l.estado = 'activa'`,
            [id]
        );

        return lecciones.length > 0 ? lecciones[0] : null;
    }

    /**
     * Listar lecciones por nivel e idioma
     */
    static async listarPorNivel(nivel, idioma, pagina = 1, limite = 10) {
        const offset = (pagina - 1) * limite;

        const [lecciones] = await database.query(
            `SELECT l.*, 
                    u.nombre as creador_nombre,
                    u.primer_apellido as creador_apellido,
                    (SELECT COUNT(*) FROM multimedia m WHERE m.leccion_id = l.id) as total_multimedia
             FROM lecciones l
             LEFT JOIN usuarios u ON l.creado_por = u.id
             WHERE l.nivel = ? AND l.idioma = ? AND l.estado = 'activa'
             ORDER BY l.orden ASC
             LIMIT ? OFFSET ?`,
            [nivel, idioma, limite, offset]
        );

        // Obtener total para paginación
        const [total] = await database.query(
            `SELECT COUNT(*) as total 
             FROM lecciones 
             WHERE nivel = ? AND idioma = ? AND estado = 'activa'`,
            [nivel, idioma]
        );

        return {
            lecciones,
            paginacion: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total: total[0].total,
                totalPaginas: Math.ceil(total[0].total / limite)
            }
        };
    }

    /**
     * Actualizar lección
     */
    static async actualizar(id, datosActualizacion) {
        const camposPermitidos = ['titulo', 'descripcion', 'contenido', 'nivel', 'idioma', 'duracion_minutos', 'orden', 'estado'];
        const campos = [];
        const valores = [];

        Object.keys(datosActualizacion).forEach(key => {
            if (camposPermitidos.includes(key)) {
                campos.push(`${key} = ?`);
                valores.push(datosActualizacion[key]);
            }
        });

        if (campos.length === 0) {
            throw new Error('No hay campos válidos para actualizar');
        }

        valores.push(id);

        const [result] = await database.query(
            `UPDATE lecciones SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
            valores
        );

        return result.affectedRows > 0;
    }

    /**
     * Eliminar lección (soft delete)
     */
    static async eliminar(id) {
        const [result] = await database.query(
            'UPDATE lecciones SET estado = "inactiva", actualizado_en = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Registrar progreso de estudiante
     */
    static async registrarProgreso(usuarioId, leccionId, progreso) {
        const [result] = await database.query(
            `INSERT INTO progreso_lecciones (usuario_id, leccion_id, progreso, completada) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE progreso = ?, completada = ?, actualizado_en = CURRENT_TIMESTAMP`,
            [usuarioId, leccionId, progreso, progreso === 100, progreso, progreso === 100]
        );

        return result.affectedRows > 0;
    }

    /**
     * Obtener progreso del estudiante
     */
    static async obtenerProgreso(usuarioId, leccionId) {
        const [progreso] = await database.query(
            'SELECT * FROM progreso_lecciones WHERE usuario_id = ? AND leccion_id = ?',
            [usuarioId, leccionId]
        );

        return progreso.length > 0 ? progreso[0] : null;
    }
}

module.exports = Leccion;