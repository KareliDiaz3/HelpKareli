// backend/models/gamificacionModel.js
const db = require('../config/database');
const pool = db.pool || db;

/**
 * MODELO: Gamificación (Puntos, Niveles, Rachas, Rankings, Logros)
 * RF-11: Otorgar recompensas
 * RF-12: Generar tablas de clasificación
 * 
 * Tabla principal: perfil_estudiantes
 * Campos: total_xp, nivel_xp, racha_dias, fecha_ultima_racha
 */

// Configuración de niveles (debe coincidir con app-config.js)
const NIVELES = [
    { nivel: 1, xp_requerido: 0 },
    { nivel: 2, xp_requerido: 100 },
    { nivel: 3, xp_requerido: 250 },
    { nivel: 4, xp_requerido: 500 },
    { nivel: 5, xp_requerido: 1000 },
    { nivel: 6, xp_requerido: 2000 },
    { nivel: 7, xp_requerido: 3500 },
    { nivel: 8, xp_requerido: 5500 },
    { nivel: 9, xp_requerido: 8000 },
    { nivel: 10, xp_requerido: 12000 }
];

/**
 * ✅ EJEMPLO COMPLETO - Calcular nivel basado en XP total
 */
function calcularNivelPorXP(totalXP) {
    let nivel = 1;
    
    for (let i = NIVELES.length - 1; i >= 0; i--) {
        if (totalXP >= NIVELES[i].xp_requerido) {
            nivel = NIVELES[i].nivel;
            break;
        }
    }
    
    // Calcular progreso hasta siguiente nivel
    const nivelActual = NIVELES.find(n => n.nivel === nivel);
    const siguienteNivel = NIVELES.find(n => n.nivel === nivel + 1);
    
    let progreso_siguiente = 100;
    let xp_faltante = 0;
    
    if (siguienteNivel) {
        const xpEnNivelActual = totalXP - nivelActual.xp_requerido;
        const xpNecesario = siguienteNivel.xp_requerido - nivelActual.xp_requerido;
        progreso_siguiente = Math.round((xpEnNivelActual / xpNecesario) * 100);
        xp_faltante = siguienteNivel.xp_requerido - totalXP;
    }
    
    return {
        nivel,
        progreso_siguiente,
        xp_faltante,
        xp_nivel_actual: nivelActual.xp_requerido,
        xp_siguiente_nivel: siguienteNivel ? siguienteNivel.xp_requerido : null
    };
}

/**
 * ✅ EJEMPLO COMPLETO - Otorgar puntos XP a un usuario
 */
exports.otorgarPuntos = async (usuarioId, puntosXP, razon = '') => {
    try {
        // Obtener XP actual
        const [perfil] = await pool.execute(
            'SELECT total_xp, nivel_xp FROM perfil_estudiantes WHERE usuario_id = ?',
            [usuarioId]
        );
        
        if (perfil.length === 0) {
            throw new Error('Perfil de estudiante no encontrado');
        }
        
        const xpAnterior = perfil[0].total_xp;
        const nivelAnterior = perfil[0].nivel_xp;
        const xpNuevo = xpAnterior + puntosXP;
        
        // Calcular nuevo nivel
        const { nivel: nuevoNivel } = calcularNivelPorXP(xpNuevo);
        const subioNivel = nuevoNivel > nivelAnterior;
        
        // Actualizar perfil
        await pool.execute(
            `UPDATE perfil_estudiantes 
             SET total_xp = ?, nivel_xp = ?
             WHERE usuario_id = ?`,
            [xpNuevo, nuevoNivel, usuarioId]
        );
        
        console.log(`✅ ${puntosXP} XP otorgados a usuario ${usuarioId}. Razón: ${razon}`);
        
        return {
            xp_anterior: xpAnterior,
            xp_nuevo: xpNuevo,
            puntos_otorgados: puntosXP,
            nivel_anterior: nivelAnterior,
            nivel_nuevo: nuevoNivel,
            subio_nivel: subioNivel,
            razon
        };
        
    } catch (error) {
        console.error('Error en GamificacionModel.otorgarPuntos:', error);
        throw error;
    }
};

/**
 * ✅ EJEMPLO COMPLETO - Actualizar racha diaria
 */
exports.actualizarRacha = async (usuarioId) => {
    try {
        // Obtener racha actual
        const [perfil] = await pool.execute(
            'SELECT racha_dias, fecha_ultima_racha FROM perfil_estudiantes WHERE usuario_id = ?',
            [usuarioId]
        );
        
        if (perfil.length === 0) {
            throw new Error('Perfil de estudiante no encontrado');
        }
        
        const rachaActual = perfil[0].racha_dias;
        const fechaUltimaRacha = perfil[0].fecha_ultima_racha;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        let nuevaRacha = rachaActual;
        let rachaActualizada = false;
        
        if (!fechaUltimaRacha) {
            // Primera vez
            nuevaRacha = 1;
            rachaActualizada = true;
        } else {
            const fechaUltima = new Date(fechaUltimaRacha);
            fechaUltima.setHours(0, 0, 0, 0);
            
            const diferenciaDias = Math.floor((hoy - fechaUltima) / (1000 * 60 * 60 * 24));
            
            if (diferenciaDias === 0) {
                // Ya estudió hoy, no hacer nada
                rachaActualizada = false;
            } else if (diferenciaDias === 1) {
                // Ayer estudió, incrementar racha
                nuevaRacha = rachaActual + 1;
                rachaActualizada = true;
            } else {
                // Más de 1 día sin estudiar, resetear
                nuevaRacha = 1;
                rachaActualizada = true;
            }
        }
        
        if (rachaActualizada) {
            await pool.execute(
                `UPDATE perfil_estudiantes 
                 SET racha_dias = ?, fecha_ultima_racha = CURDATE()
                 WHERE usuario_id = ?`,
                [nuevaRacha, usuarioId]
            );
            
            console.log(`✅ Racha actualizada para usuario ${usuarioId}: ${nuevaRacha} días`);
        }
        
        return {
            racha_anterior: rachaActual,
            racha_nueva: nuevaRacha,
            racha_actualizada: rachaActualizada
        };
        
    } catch (error) {
        console.error('Error en GamificacionModel.actualizarRacha:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener información completa de XP y nivel del usuario
 * 
 * INSTRUCCIONES:
 * 1. SELECT de perfil_estudiantes (total_xp, nivel_xp)
 * 2. Usar calcularNivelPorXP() para obtener detalles del nivel
 * 3. Retornar: { total_xp, nivel, progreso_siguiente, xp_faltante, ... }
 */
exports.obtenerNivelUsuario = async (usuarioId) => {
    try {
        const [perfil] = await pool.execute(
            'SELECT total_xp, nivel_xp FROM perfil_estudiantes WHERE usuario_id = ?',
            [usuarioId]
        );
        
        if (perfil.length === 0) {
            return null;
        }
        
        const totalXP = perfil[0].total_xp;
        const infoNivel = calcularNivelPorXP(totalXP);
        
        return {
            total_xp: totalXP,
            ...infoNivel
        };
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerNivelUsuario:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener ranking global (TOP usuarios por XP)
 * 
 * INSTRUCCIONES:
 * 1. SELECT de perfil_estudiantes JOIN usuarios JOIN perfil_usuarios
 * 2. Ordenar por total_xp DESC
 * 3. Incluir: posición (ROW_NUMBER), nombre, foto_perfil, total_xp, nivel_xp, 
 *    racha_dias, lecciones_completadas, cursos_completados
 * 4. LIMIT y OFFSET para paginación
 */
exports.obtenerRankingGlobal = async (limite = 100, offset = 0) => {
    try {
        const query = `
            SELECT 
                (@row_number := @row_number + 1) AS posicion,
                u.id as usuario_id,
                pu.nombre_completo,
                pu.foto_perfil,
                pe.total_xp,
                pe.nivel_xp,
                pe.racha_dias,
                pe.lecciones_completadas,
                pe.cursos_completados,
                pe.nivel_actual,
                pe.idioma_aprendizaje
            FROM perfil_estudiantes pe
            JOIN usuarios u ON pe.usuario_id = u.id
            JOIN perfil_usuarios pu ON u.id = pu.usuario_id
            CROSS JOIN (SELECT @row_number := ?) AS init
            WHERE u.estado_cuenta = 'activo'
            ORDER BY pe.total_xp DESC
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await pool.execute(query, [offset, limite, offset]);
        return rows;
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerRankingGlobal:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener ranking semanal
 * 
 * INSTRUCCIONES:
 * 1. Necesitas calcular XP ganado esta semana
 * 2. Opción A: Crear tabla actividad_xp con campos (usuario_id, puntos_xp, fecha, razon)
 * 3. Opción B: Usar SUM de progreso_lecciones donde fecha >= inicio_semana
 * 4. Similar a ranking global pero filtrado por semana actual
 */
exports.obtenerRankingSemanal = async (limite = 100) => {
    try {
        // Calcular inicio de semana (lunes)
        const query = `
            SELECT 
                u.id as usuario_id,
                pu.nombre_completo,
                pu.foto_perfil,
                COUNT(DISTINCT pl.leccion_id) as lecciones_esta_semana,
                pe.total_xp,
                pe.nivel_xp,
                pe.racha_dias
            FROM usuarios u
            JOIN perfil_usuarios pu ON u.id = pu.usuario_id
            JOIN perfil_estudiantes pe ON u.id = pe.usuario_id
            LEFT JOIN progreso_lecciones pl ON u.id = pl.usuario_id 
                AND pl.actualizado_en >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                AND pl.completada = TRUE
            WHERE u.estado_cuenta = 'activo'
            GROUP BY u.id
            ORDER BY lecciones_esta_semana DESC, pe.total_xp DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [limite]);
        
        // Agregar posición
        return rows.map((row, index) => ({
            posicion: index + 1,
            ...row
        }));
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerRankingSemanal:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener ranking mensual
 * Similar a semanal pero con mes actual
 */
exports.obtenerRankingMensual = async (limite = 100) => {
    try {
        const query = `
            SELECT 
                u.id as usuario_id,
                pu.nombre_completo,
                pu.foto_perfil,
                COUNT(DISTINCT pl.leccion_id) as lecciones_este_mes,
                pe.total_xp,
                pe.nivel_xp,
                pe.racha_dias
            FROM usuarios u
            JOIN perfil_usuarios pu ON u.id = pu.usuario_id
            JOIN perfil_estudiantes pe ON u.id = pe.usuario_id
            LEFT JOIN progreso_lecciones pl ON u.id = pl.usuario_id 
                AND MONTH(pl.actualizado_en) = MONTH(CURDATE())
                AND YEAR(pl.actualizado_en) = YEAR(CURDATE())
                AND pl.completada = TRUE
            WHERE u.estado_cuenta = 'activo'
            GROUP BY u.id
            ORDER BY lecciones_este_mes DESC, pe.total_xp DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [limite]);
        
        return rows.map((row, index) => ({
            posicion: index + 1,
            ...row
        }));
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerRankingMensual:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener ranking por nivel CEFR
 * 
 * INSTRUCCIONES:
 * 1. Similar a ranking global
 * 2. Agregar WHERE pe.nivel_actual = ?
 * 3. Parámetro: nivel ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
 */
exports.obtenerRankingPorNivel = async (nivel, limite = 100) => {
    try {
        const query = `
            SELECT 
                (@row_number := @row_number + 1) AS posicion,
                u.id as usuario_id,
                pu.nombre_completo,
                pu.foto_perfil,
                pe.total_xp,
                pe.nivel_xp,
                pe.racha_dias,
                pe.lecciones_completadas,
                pe.idioma_aprendizaje
            FROM perfil_estudiantes pe
            JOIN usuarios u ON pe.usuario_id = u.id
            JOIN perfil_usuarios pu ON u.id = pu.usuario_id
            CROSS JOIN (SELECT @row_number := 0) AS init
            WHERE u.estado_cuenta = 'activo' AND pe.nivel_actual = ?
            ORDER BY pe.total_xp DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [nivel, limite]);
        return rows;
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerRankingPorNivel:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener posición del usuario en el ranking global
 * 
 * INSTRUCCIONES:
 * 1. Contar cuántos usuarios tienen más XP que el usuario actual
 * 2. Esa cantidad + 1 = posición del usuario
 * 3. También obtener total de usuarios activos
 */
exports.obtenerPosicionUsuario = async (usuarioId) => {
    try {
        // Obtener XP del usuario
        const [perfil] = await pool.execute(
            'SELECT total_xp FROM perfil_estudiantes WHERE usuario_id = ?',
            [usuarioId]
        );
        
        if (perfil.length === 0) {
            return null;
        }
        
        const xpUsuario = perfil[0].total_xp;
        
        // Contar usuarios con más XP
        const [resultado] = await pool.execute(
            `SELECT COUNT(*) + 1 as posicion
             FROM perfil_estudiantes pe
             JOIN usuarios u ON pe.usuario_id = u.id
             WHERE pe.total_xp > ? AND u.estado_cuenta = 'activo'`,
            [xpUsuario]
        );
        
        // Total de usuarios activos
        const [total] = await pool.execute(
            `SELECT COUNT(*) as total
             FROM perfil_estudiantes pe
             JOIN usuarios u ON pe.usuario_id = u.id
             WHERE u.estado_cuenta = 'activo'`
        );
        
        return {
            posicion: resultado[0].posicion,
            total_usuarios: total[0].total,
            percentil: Math.round((1 - (resultado[0].posicion / total[0].total)) * 100)
        };
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerPosicionUsuario:', error);
        throw error;
    }
};

/**
 * TODO PARA DEEPSEEK: Obtener logros del usuario
 * NOTA: Esto requiere crear una tabla 'logros' y 'usuario_logros'
 * Por ahora, puedes devolver logros mockeados basados en estadísticas
 */
exports.obtenerLogrosUsuario = async (usuarioId) => {
    try {
        const [perfil] = await pool.execute(
            `SELECT * FROM perfil_estudiantes WHERE usuario_id = ?`,
            [usuarioId]
        );
        
        if (perfil.length === 0) {
            return [];
        }
        
        const p = perfil[0];
        const logros = [];
        
        // Logros basados en estadísticas
        if (p.lecciones_completadas >= 1) {
            logros.push({
                id: 'primera_leccion',
                nombre: 'Primera Lección',
                descripcion: 'Completaste tu primera lección',
                icono: '🎯',
                desbloqueado: true
            });
        }
        
        if (p.racha_dias >= 7) {
            logros.push({
                id: 'racha_7',
                nombre: 'Racha de 7 días',
                descripcion: 'Estudiaste 7 días consecutivos',
                icono: '🔥',
                desbloqueado: true
            });
        }
        
        if (p.cursos_completados >= 1) {
            logros.push({
                id: 'primer_curso',
                nombre: 'Primer Curso',
                descripcion: 'Completaste tu primer curso',
                icono: '🏆',
                desbloqueado: true
            });
        }
        
        if (p.nivel_xp >= 5) {
            logros.push({
                id: 'nivel_5',
                nombre: 'Nivel 5',
                descripcion: 'Alcanzaste el nivel 5',
                icono: '⭐',
                desbloqueado: true
            });
        }
        
        return logros;
        
    } catch (error) {
        console.error('Error en GamificacionModel.obtenerLogrosUsuario:', error);
        throw error;
    }
};

module.exports = exports;
