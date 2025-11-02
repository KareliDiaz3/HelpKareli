// ==========================================================
// config/database.js - Configuración de MySQL - CORREGIDO
// ==========================================================

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SpeakLexi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// ==========================================================
// FUNCIONES DE CONEXIÓN
// ==========================================================

// Probar conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
}

// Ejecutar consultas simples
async function query(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Error en consulta SQL:', error.message);
    console.error('📝 Consulta:', sql);
    console.error('🔢 Parámetros:', params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// ⭐ MÉTODO NUEVO: Obtener conexión para transacciones
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('🔗 Conexión obtenida del pool');
    return connection;
  } catch (error) {
    console.error('❌ Error obteniendo conexión:', error.message);
    throw error;
  }
}

// ==========================================================
// FUNCIONES DE TRANSACCIÓN (UTILIDADES)
// ==========================================================

// Iniciar una transacción
async function beginTransaction(connection) {
  try {
    await connection.execute('START TRANSACTION');
    console.log('🔄 Transacción iniciada');
  } catch (error) {
    console.error('❌ Error iniciando transacción:', error.message);
    throw error;
  }
}

// Confirmar transacción
async function commitTransaction(connection) {
  try {
    await connection.execute('COMMIT');
    console.log('✅ Transacción confirmada');
  } catch (error) {
    console.error('❌ Error confirmando transacción:', error.message);
    throw error;
  }
}

// Revertir transacción
async function rollbackTransaction(connection) {
  try {
    await connection.execute('ROLLBACK');
    console.log('↩️ Transacción revertida');
  } catch (error) {
    console.error('❌ Error revertiendo transacción:', error.message);
    throw error;
  }
}

// ==========================================================
// FUNCIÓN DE INICIALIZACIÓN (OPCIONAL)
// ==========================================================

async function initializeDatabase() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    console.log('📊 Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    return false;
  }
}

// ==========================================================
// EXPORTAR
// ==========================================================

module.exports = {
  pool,
  query,
  getConnection,           // ⭐ NUEVO - Para transacciones
  beginTransaction,        // ⭐ NUEVO - Utilidades
  commitTransaction,       // ⭐ NUEVO
  rollbackTransaction,     // ⭐ NUEVO
  testConnection,
  initializeDatabase       // ⭐ NUEVO - Para inicializar al arrancar
};