// ==========================================================
// server.js - SpeakLexi Backend - COMPLETO CON BASE DE DATOS
// ==========================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ==========================================================
// IMPORTAR CONFIGURACIÓN DE BASE DE DATOS
// ==========================================================

const { initializeDatabase, testConnection } = require('./config/database');

// ==========================================================
// IMPORTAR SOLO RUTAS QUE EXISTEN
// ==========================================================

const authRoutes = require('./routes/auth-routes');

// ❌ ESTAS RUTAS NO EXISTEN TODAVÍA - COMENTAR TEMPORALMENTE
// const userRoutes = require('./routes/users');
// const lessonRoutes = require('./routes/lessons');
// const progressRoutes = require('./routes/progress');

const app = express();

// ==========================================================
// INICIALIZACIÓN DE BASE DE DATOS
// ==========================================================

const initializeApp = async () => {
  console.log('🔧 Inicializando aplicación SpeakLexi...');
  
  // Probar conexión a base de datos
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.log('⚠️  ADVERTENCIA: Base de datos no disponible');
    console.log('📝 El servidor arrancará pero las funciones de base de datos fallarán');
  } else {
    console.log('✅ Base de datos conectada correctamente');
  }

  // Inicializar servicios adicionales aquí si es necesario
  console.log('✅ Aplicación inicializada correctamente');
};

// ==========================================================
// MIDDLEWARES
// ==========================================================

// Seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // máximo 100 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta más tarde.'
  }
});
app.use(limiter);

// CORS - Simplificar para desarrollo
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (si los necesitas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================================
// RUTAS - SOLO LAS QUE EXISTEN
// ==========================================================

// ✅ SOLO MONTAR LA RUTA QUE EXISTE
app.use('/api/auth', authRoutes);

// ❌ COMENTAR TEMPORALMENTE HASTA QUE CREES ESTAS RUTAS
// app.use('/api/users', userRoutes);
// app.use('/api/lessons', lessonRoutes);
// app.use('/api/progress', progressRoutes);

// ==========================================================
// RUTAS BÁSICAS DEL SISTEMA
// ==========================================================

// Ruta de salud (con estado de BD)
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  res.json({ 
    status: 'OK', 
    message: 'SpeakLexi API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: dbStatus ? 'connected' : 'disconnected',
      authentication: 'available',
      email: 'available'
    }
  });
});

// Ruta de configuración (útil para el frontend)
app.get('/api/config', (req, res) => {
  res.json({
    appName: 'SpeakLexi',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    features: {
      auth: true,
      users: false,    // ⏳ Pendiente
      lessons: false,  // ⏳ Pendiente
      progress: false  // ⏳ Pendiente
    },
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
      config: '/api/config'
    }
  });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido a SpeakLexi API',
    version: '1.0.0',
    description: 'Sistema de aprendizaje de idiomas',
    availableEndpoints: [
      'GET  /api/health - Estado del sistema',
      'GET  /api/config - Configuración',
      'POST /api/auth/registro - Registro de usuario',
      'POST /api/auth/login - Inicio de sesión',
      'POST /api/auth/verificar - Verificación de email',
      'POST /api/auth/recuperar-contrasena - Recuperación de contraseña',
      'POST /api/auth/restablecer-contrasena - Restablecer contraseña'
    ],
    documentation: 'Consulta la documentación para más detalles'
  });
});

// ==========================================================
// MANEJO DE ERRORES
// ==========================================================

// 404 - Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health', 
      '/api/config', 
      '/api/auth/registro',
      '/api/auth/login',
      '/api/auth/verificar',
      '/api/auth/recuperar-contrasena',
      '/api/auth/restablecer-contrasena'
    ],
    suggestion: 'Verifica la URL o consulta GET / para ver endpoints disponibles'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON malformado en el cuerpo de la petición',
      suggestion: 'Verifica que tu JSON sea válido'
    });
  }
  
  // Error de base de datos
  if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      error: 'Servicio de base de datos no disponible',
      message: 'Intenta nuevamente en unos momentos'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal. Por favor, intenta nuevamente.'
  });
});

// ==========================================================
// INICIAR SERVIDOR
// ==========================================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Inicializar y luego iniciar servidor
initializeApp().then(() => {
  app.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Servidor SpeakLexi INICIADO CORRECTAMENTE');
    console.log('='.repeat(50));
    console.log(`📍 URL: http://${HOST}:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Autenticación: http://${HOST}:${PORT}/api/auth`);
    console.log(`❤️  Health: http://${HOST}:${PORT}/api/health`);
    console.log(`📝 Config: http://${HOST}:${PORT}/api/config`);
    console.log('='.repeat(50));
    console.log('✅ ¡Backend listo para recibir peticiones!');
    console.log('='.repeat(50) + '\n');
  });
}).catch(error => {
  console.error('❌ Error fatal inicializando la aplicación:', error);
  process.exit(1);
});

// Manejo graceful de cierre
process.on('SIGINT', () => {
  console.log('\n🔻 Recibida señal de cierre (SIGINT)');
  console.log('👋 Cerrando servidor SpeakLexi...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔻 Recibida señal de terminación (SIGTERM)');
  console.log('👋 Cerrando servidor SpeakLexi...');
  process.exit(0);
});

module.exports = app;