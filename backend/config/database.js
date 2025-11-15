// ==========================================================
// backend/config/database.js - VERSIÓN CORREGIDA
// ==========================================================

const mysql = require('mysql2/promise');

// ==========================================================
// CONFIGURACIÓN DEL POOL
// ==========================================================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Karamelo3!!',
  database: process.env.DB_NAME || 'SpeakLexi2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Configuraciones adicionales recomendadas
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// ==========================================================
// FUNCIONES DE BASE DE DATOS
// ==========================================================

/**
 * Probar conexión a la base de datos
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL:', {
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user
    });
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', {
      message: error.message,
      code: error.code,
      errno: error.errno
    });
    return false;
  }
}

/**
 * Ejecutar consulta SQL
 * ✅ FIX: Ahora retorna [rows, fields] como mysql2/promise
 * @param {string} sql - Query SQL
 * @param {Array} params - Parámetros para la query
 * @returns {Promise<[Array, Array]>} - [rows, fields]
 */
async function query(sql, params = []) {
  try {
    // ✅ Usar pool.execute directamente (retorna [rows, fields])
    const [rows, fields] = await pool.execute(sql, params);
    return [rows, fields]; // ✅ Retornar ambos
  } catch (error) {
    console.error('❌ Error en consulta SQL:', {
      message: error.message,
      sql: sql.substring(0, 100) + '...',
      code: error.code
    });
    throw error;
  }
}

/**
 * Obtener conexión del pool para transacciones
 * @returns {Promise<Connection>}
 */
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Error obteniendo conexión:', error.message);
    throw error;
  }
}

/**
 * Cerrar el pool (útil para testing)
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('❌ Error cerrando pool:', error.message);
    throw error;
  }
}

/**
 * Inicializar base de datos y verificar conexión
 * @returns {Promise<boolean>}
 */
async function initializeDatabase() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    console.log('✅ Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    return false;
  }
}

/**
 * Ejecutar múltiples queries en una transacción
 * @param {Function} callback - Función que recibe la conexión
 * @returns {Promise<any>}
 * 
 * @example
 * const resultado = await transaction(async (conn) => {
 *   await conn.execute('INSERT INTO ...');
 *   await conn.execute('UPDATE ...');
 *   return { success: true };
 * });
 */
async function transaction(callback) {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error en transacción (rollback realizado):', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// ==========================================================
// UTILIDADES
// ==========================================================

/**
 * Verificar si existe un registro
 * @param {string} tabla - Nombre de la tabla
 * @param {string} campo - Campo a verificar
 * @param {any} valor - Valor a buscar
 * @returns {Promise<boolean>}
 */
async function exists(tabla, campo, valor) {
  try {
    const [rows] = await query(
      `SELECT COUNT(*) as count FROM ?? WHERE ?? = ?`,
      [tabla, campo, valor]
    );
    return rows[0].count > 0;
  } catch (error) {
    console.error('❌ Error verificando existencia:', error.message);
    throw error;
  }
}

/**
 * Obtener estadísticas del pool
 * @returns {Object}
 */
function getPoolStats() {
  return {
    totalConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    connectionLimit: dbConfig.connectionLimit,
    waitingClients: pool.pool._connectionQueue.length
  };
}

// ==========================================================
// EXPORTAR
// ==========================================================

module.exports = {
  // Pool
  pool,
  
  // Funciones principales
  query,                  // ✅ Ahora retorna [rows, fields]
  getConnection,
  closePool,
  testConnection,
  initializeDatabase,
  transaction,
  
  // Utilidades
  exists,
  getPoolStats
};