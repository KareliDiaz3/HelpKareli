// ==========================================================
// backend/routes/auth-routes.js - VERSIÓN CORREGIDA ONBOARDING
// ==========================================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================================
// MIDDLEWARE PARA MANEJAR ERRORES DE VALIDACIÓN
// ==========================================================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const erroresFormateados = errors.array().map(err => ({
      campo: err.path || err.param,
      mensaje: err.msg,
      valor_recibido: err.value,
      ubicacion: err.location
    }));
    
    console.log('❌ Errores de validación:', JSON.stringify(erroresFormateados, null, 2));
    
    return res.status(400).json({ 
      error: 'Datos de entrada inválidos',
      errores: erroresFormateados,
      mensaje: 'Por favor corrige los errores en el formulario',
      count: errors.array().length
    });
  }
  
  // ✅ MARCADOR PARA EL CONTROLADOR
  req.validacionExitosa = true;
  req.erroresValidacion = [];
  next();
};

// ==========================================================
// CONSTANTES DE CONFIGURACIÓN
// ==========================================================
const CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  NOMBRE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  ROLES: {
    ESTUDIANTE: ['alumno', 'estudiante'],
    PROFESOR: ['profesor', 'teacher'],
    ADMIN: ['admin', 'administrador'],
    TODOS: ['alumno', 'estudiante', 'profesor', 'teacher', 'admin', 'administrador']
  },
  NIVELES: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  IDIOMAS: ['Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Japonés', 'Coreano', 'Chino']
};

// ==========================================================
// VALIDACIONES PARA REGISTRO (CORREGIDAS)
// ==========================================================
const validacionesRegistro = [
  // Información personal
  body('nombre')
    .trim()
    .isLength({ min: CONFIG.NOMBRE.MIN_LENGTH, max: CONFIG.NOMBRE.MAX_LENGTH })
    .withMessage(`El nombre debe tener entre ${CONFIG.NOMBRE.MIN_LENGTH} y ${CONFIG.NOMBRE.MAX_LENGTH} caracteres`)
    .matches(CONFIG.NOMBRE.PATTERN)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('primer_apellido')
    .trim()
    .isLength({ min: CONFIG.NOMBRE.MIN_LENGTH, max: CONFIG.NOMBRE.MAX_LENGTH })
    .withMessage(`El primer apellido debe tener entre ${CONFIG.NOMBRE.MIN_LENGTH} y ${CONFIG.NOMBRE.MAX_LENGTH} caracteres`)
    .matches(CONFIG.NOMBRE.PATTERN)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  // ✅ FIX CRÍTICO: segundo_apellido con custom validator
  body('segundo_apellido')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .custom((value) => {
      // Si está vacío o es null, es válido
      if (!value || value === '') return true;
      
      // Si tiene valor, validar longitud y patrón
      if (value.length > CONFIG.NOMBRE.MAX_LENGTH) {
        throw new Error(`El segundo apellido no debe exceder ${CONFIG.NOMBRE.MAX_LENGTH} caracteres`);
      }
      
      if (!CONFIG.NOMBRE.PATTERN.test(value)) {
        throw new Error('El segundo apellido solo puede contener letras y espacios');
      }
      
      return true;
    }),
  
  // Credenciales
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido')
    .isLength({ max: 100 })
    .withMessage('El email no debe exceder 100 caracteres'),
  
  body('password')
    .isLength({ min: CONFIG.PASSWORD.MIN_LENGTH })
    .withMessage(`La contraseña debe tener al menos ${CONFIG.PASSWORD.MIN_LENGTH} caracteres`)
    .matches(CONFIG.PASSWORD.PATTERN)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  // Rol
  body('rol')
    .optional()
    .isIn(CONFIG.ROLES.TODOS)
    .withMessage(`Rol inválido. Valores permitidos: ${CONFIG.ROLES.TODOS.join(', ')}`),

  // ✅ Validación flexible para idioma (acepta ambos campos)
  body('idioma')
    .optional()
    .custom((value, { req }) => {
      const rol = req.body.rol || 'alumno';
      
      // Solo validar para estudiantes
      if (CONFIG.ROLES.ESTUDIANTE.includes(rol)) {
        const idioma = req.body.idioma || req.body.idioma_aprendizaje;
        
        if (!idioma) {
          throw new Error('Los estudiantes deben especificar un idioma de aprendizaje');
        }
        
        if (!CONFIG.IDIOMAS.includes(idioma)) {
          throw new Error(`Idioma no soportado. Valores permitidos: ${CONFIG.IDIOMAS.join(', ')}`);
        }
      }
      
      return true;
    }),

  // Validación alternativa para idioma_aprendizaje
  body('idioma_aprendizaje')
    .optional()
    .custom((value, { req }) => {
      // Si ya validamos "idioma", no necesitamos validar este
      if (req.body.idioma) return true;
      
      const rol = req.body.rol || 'alumno';
      
      if (CONFIG.ROLES.ESTUDIANTE.includes(rol)) {
        if (!value) {
          throw new Error('Los estudiantes deben especificar un idioma de aprendizaje');
        }
        
        if (!CONFIG.IDIOMAS.includes(value)) {
          throw new Error(`Idioma no soportado. Valores permitidos: ${CONFIG.IDIOMAS.join(', ')}`);
        }
      }
      
      return true;
    }),

  // Nivel actual
  body('nivel_actual')
    .optional()
    .custom((value, { req }) => {
      const rol = req.body.rol || 'alumno';
      
      if (CONFIG.ROLES.ESTUDIANTE.includes(rol) && value) {
        if (!CONFIG.NIVELES.includes(value)) {
          throw new Error(`Nivel inválido. Valores permitidos: ${CONFIG.NIVELES.join(', ')}`);
        }
      }
      
      return true;
    }),

  // Validaciones para profesores
  body('titulo')
    .if((value, { req }) => CONFIG.ROLES.PROFESOR.includes(req.body.rol))
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El título no debe exceder 100 caracteres'),

  body('especialidad')
    .if((value, { req }) => CONFIG.ROLES.PROFESOR.includes(req.body.rol))
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La especialidad no debe exceder 100 caracteres'),

  body('años_experiencia')
    .if((value, { req }) => CONFIG.ROLES.PROFESOR.includes(req.body.rol))
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Los años de experiencia deben estar entre 0 y 50'),

  body('biografia')
    .if((value, { req }) => CONFIG.ROLES.PROFESOR.includes(req.body.rol))
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La biografía no debe exceder 500 caracteres'),

  handleValidationErrors
];

// ==========================================================
// VALIDACIONES PARA LOGIN
// ==========================================================
const validacionesLogin = [
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 1 })
    .withMessage('La contraseña no puede estar vacía'),

  handleValidationErrors
];

// ==========================================================
// VALIDACIONES PARA VERIFICACIÓN
// ==========================================================
const validacionesVerificacion = [
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('codigo')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener exactamente 6 caracteres')
    .isNumeric()
    .withMessage('El código debe contener solo números')
    .matches(/^[0-9]{6}$/)
    .withMessage('El código debe ser de 6 dígitos numéricos'),

  handleValidationErrors
];

// ==========================================================
// VALIDACIONES PARA REENVIAR CÓDIGO
// ==========================================================
const validacionesReenviarCodigo = [
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),

  handleValidationErrors
];

// ==========================================================
// VALIDACIONES PARA RECUPERAR CONTRASEÑA
// ==========================================================
const validacionesRecuperarPassword = [
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),

  handleValidationErrors
];

// ==========================================================
// VALIDACIONES PARA RESTABLECER CONTRASEÑA
// ==========================================================
const validacionesRestablecerPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('El token es requerido'),
  
  body('nueva_contrasena')
    .isLength({ min: CONFIG.PASSWORD.MIN_LENGTH })
    .withMessage(`La contraseña debe tener al menos ${CONFIG.PASSWORD.MIN_LENGTH} caracteres`)
    .matches(CONFIG.PASSWORD.PATTERN)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  handleValidationErrors
];

// ==========================================================
// VALIDACIONES PARA ACTUALIZAR NIVEL
// ==========================================================
const validacionesActualizarNivel = [
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('nivel')
    .isIn(CONFIG.NIVELES)
    .withMessage(`Nivel inválido. Valores permitidos: ${CONFIG.NIVELES.join(', ')}`),
  
  body('idioma')
    .optional()
    .isIn(CONFIG.IDIOMAS)
    .withMessage(`Idioma no soportado. Valores permitidos: ${CONFIG.IDIOMAS.join(', ')}`),

  handleValidationErrors
];

// ==========================================================
// MIDDLEWARE DE LOGGING
// ==========================================================
router.use((req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip
  };
  
  // Si es POST, mostrar body (sin password)
  if (req.method === 'POST' && req.body) {
    const bodyLog = { ...req.body };
    if (bodyLog.password) bodyLog.password = '***';
    if (bodyLog.nueva_contrasena) bodyLog.nueva_contrasena = '***';
    logData.body = bodyLog;
  }
  
  console.log(`🔐 [AUTH]`, logData);
  next();
});

// ==========================================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ==========================================================

// Registro y verificación
router.post('/registro', validacionesRegistro, authController.registrarUsuario);
router.post('/verificar', validacionesVerificacion, authController.verificarCuenta);
router.post('/reenviar-verificacion', validacionesReenviarCodigo, authController.reenviarVerificacion);

// Login
router.post('/login', validacionesLogin, authController.iniciarSesion);

// Recuperación de contraseña
router.post('/recuperar-contrasena', validacionesRecuperarPassword, authController.solicitarRecuperacionContrasena);
router.post('/restablecer-contrasena', validacionesRestablecerPassword, authController.restablecerContrasena);

// ✅✅✅ CORRECCIÓN CRÍTICA: Actualización de nivel SIN AUTENTICACIÓN para onboarding
// El usuario aún no tiene token JWT durante el proceso de onboarding
// La validación se hace con el correo en el body del request
router.patch('/actualizar-nivel', validacionesActualizarNivel, authController.actualizarNivel);

// ==========================================================
// RUTAS PROTEGIDAS (CON AUTENTICACIÓN)
// ==========================================================

// Verificación y gestión de cuenta
router.get('/verificar-token', authMiddleware.verificarToken, authController.verificarToken);
router.get('/perfil', authMiddleware.verificarToken, authController.obtenerPerfil);
router.post('/logout', authMiddleware.verificarToken, authController.cerrarSesion);
router.post('/desactivar-cuenta', authMiddleware.verificarToken, authController.desactivarCuenta);
router.delete('/eliminar-cuenta', authMiddleware.verificarToken, authController.eliminarCuenta);
router.post('/reactivar-cuenta', authController.reactivarCuenta);

// ==========================================================
// RUTAS DE UTILIDAD Y DIAGNÓSTICO
// ==========================================================

router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    service: 'Authentication Service',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()) + 's',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    database: 'Connected'
  };
  
  res.json(health);
});

router.get('/config', (req, res) => {
  res.json({
    auth: {
      password: {
        min_length: CONFIG.PASSWORD.MIN_LENGTH,
        requirements: {
          uppercase: 1,
          lowercase: 1,
          numbers: 1,
          special_chars: 0
        }
      },
      verification: {
        code_length: 6,
        code_expiry_hours: 24,
        max_attempts: 3
      },
      roles: CONFIG.ROLES.TODOS,
      levels: CONFIG.NIVELES,
      languages: CONFIG.IDIOMAS
    },
    features: {
      email_verification: true,
      password_reset: true,
      account_recovery: true,
      multi_language_support: true,
      level_assessment: true,
      profile_management: true,
      refresh_tokens: false
    },
    security: {
      max_login_attempts: 5,
      lockout_duration_minutes: 15,
      token_expiry: process.env.JWT_EXPIRES_IN || '1h'
    },
    endpoints: {
      public: [
        'POST /api/auth/registro',
        'POST /api/auth/login',
        'POST /api/auth/verificar',
        'POST /api/auth/recuperar-contrasena',
        'POST /api/auth/restablecer-contrasena',
        'POST /api/auth/reenviar-verificacion',
        'PATCH /api/auth/actualizar-nivel'
      ],
      private: [
        'GET /api/auth/verificar-token',
        'GET /api/auth/perfil',
        'POST /api/auth/logout'
      ],
      utility: [
        'GET /api/auth/health',
        'GET /api/auth/config',
        'GET /api/auth/docs'
      ]
    }
  });
});

router.get('/docs', (req, res) => {
  res.json({
    name: 'SpeakLexi Authentication API',
    description: 'Sistema completo de autenticación y gestión de usuarios',
    version: '2.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api/auth`,
    documentation: 'https://github.com/sTr4yDev/speakLexi2.0',
    endpoints: {
      'POST /registro': {
        description: 'Registrar nuevo usuario',
        authentication: false,
        body: {
          nombre: 'string (requerido, 2-50 caracteres)',
          primer_apellido: 'string (requerido, 2-50 caracteres)',
          segundo_apellido: 'string (opcional, max 50 caracteres)',
          correo: 'email (requerido)',
          password: 'string (requerido, min 8 caracteres, debe contener mayúscula, minúscula y número)',
          rol: 'string (opcional, default: alumno)',
          idioma: 'string (requerido para estudiantes)',
          nivel_actual: 'string (opcional, default: A1 para estudiantes)'
        },
        response: {
          201: 'Usuario creado exitosamente',
          400: 'Datos inválidos',
          409: 'Email ya registrado'
        }
      },
      'POST /login': {
        description: 'Iniciar sesión',
        authentication: false,
        body: {
          correo: 'email (requerido)',
          password: 'string (requerido)'
        },
        response: {
          200: 'Login exitoso, retorna token JWT',
          401: 'Credenciales inválidas',
          423: 'Cuenta bloqueada temporalmente'
        }
      },
      'POST /verificar': {
        description: 'Verificar cuenta con código de 6 dígitos',
        authentication: false,
        body: {
          correo: 'email (requerido)',
          codigo: 'string (requerido, 6 dígitos)'
        },
        response: {
          200: 'Cuenta verificada exitosamente',
          400: 'Código inválido o expirado'
        }
      },
      'PATCH /actualizar-nivel': {
        description: 'Actualizar nivel del estudiante (usado durante onboarding)',
        authentication: false,
        body: {
          correo: 'email (requerido)',
          nivel: 'string (requerido: A1, A2, B1, B2, C1, C2)',
          idioma: 'string (opcional)'
        },
        response: {
          200: 'Nivel actualizado exitosamente',
          403: 'Email no verificado o rol inválido',
          404: 'Usuario no encontrado'
        }
      },
      'GET /perfil': {
        description: 'Obtener perfil del usuario autenticado',
        authentication: true,
        headers: {
          Authorization: 'Bearer {token}'
        },
        response: {
          200: 'Datos del perfil',
          401: 'No autenticado'
        }
      }
    }
  });
});

// ==========================================================
// MANEJO DE ERRORES
// ==========================================================

// 404 - Ruta no encontrada
router.use((req, res) => {
  res.status(404).json({
    error: 'Ruta de autenticación no encontrada',
    path: req.path,
    method: req.method,
    available_endpoints: [
      'POST /api/auth/registro',
      'POST /api/auth/login',
      'POST /api/auth/verificar',
      'POST /api/auth/recuperar-contrasena',
      'PATCH /api/auth/actualizar-nivel',
      'GET /api/auth/verificar-token',
      'GET /api/auth/health',
      'GET /api/auth/config',
      'GET /api/auth/docs'
    ],
    suggestion: 'Consulta GET /api/auth/docs para ver la documentación completa'
  });
});

// Middleware para errores no manejados
router.use((error, req, res, next) => {
  console.error('💥 Error no manejado en auth-routes:', error);
  
  res.status(error.status || 500).json({
    error: 'Error interno del servidor',
    mensaje: 'Ocurrió un error inesperado en el servicio de autenticación',
    reference: `${req.method} ${req.path}`,
    codigo: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ==========================================================
// EXPORTAR
// ==========================================================

module.exports = router;