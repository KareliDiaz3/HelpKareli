/* ============================================
   SPEAKLEXI 2.0 - CONFIGURACIÓN DE APLICACIÓN
   Archivo: frontend/config/app-config.js
   Descripción: Configuración centralizada basada en arquitectura modular
   Módulos: Usuarios, Lecciones, Aprendizaje, Desempeño, Mantenimiento
   ============================================ */

/**
 * Configuración del entorno
 */
const APP_ENV = {
    MODE: 'development', // 'development' | 'production' | 'testing'
    DEBUG: true,
    VERSION: '2.0.0',
    APP_NAME: 'SpeakLexi'
};

/**
 * Configuración de la API
 */
const API_CONFIG = {
    // URLs base según entorno
    BASE_URL: APP_ENV.MODE === 'production' 
        ? 'https://api.speaklexi.com' 
        : 'http://localhost:5000',
    
    API_URL: APP_ENV.MODE === 'production'
        ? 'https://api.speaklexi.com/api'
        : 'http://localhost:5000/api',
    
    // Timeout para peticiones (ms)
    TIMEOUT: 30000,
    
    // Reintentos automáticos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // ============================================
    // ENDPOINTS POR MÓDULO (según arquitectura)
    // ============================================
    
    ENDPOINTS: {
        // ========================================
        // MÓDULO 1: GESTIÓN DE USUARIOS
        // ========================================
        AUTH: {
            // UC-01: Iniciar sesión
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH_TOKEN: '/auth/refresh',
            
            // UC-02: Recuperar contraseña
            RECUPERAR_PASSWORD: '/auth/recuperar-contrasena',
            RESTABLECER_PASSWORD: '/auth/restablecer-contrasena',
            VALIDAR_TOKEN_RECUPERACION: '/auth/validar-token-recuperacion',
            
            // UC-03: Autenticar usuario (verificación)
            VERIFICAR_EMAIL: '/auth/verificar',
            REENVIAR_CODIGO: '/auth/reenviar-verificacion',
            
            // UC-04: Registrar usuario
            REGISTRO: '/auth/registro',
            
            // UC-05: Asignar nivel
            ACTUALIZAR_NIVEL: '/auth/actualizar-nivel',
            EVALUACION_DIAGNOSTICA: '/auth/evaluacion-diagnostica'
        },
        
        // UC-06 y UC-07: Gestión de perfil
        USUARIO: {
            PERFIL: '/usuario/perfil',
            ACTUALIZAR_PERFIL: '/usuario/perfil',
            CAMBIAR_PASSWORD: '/usuario/cambiar-contrasena',
            
            // UC-06: Cambiar curso/idioma
            CAMBIAR_IDIOMA: '/usuario/cambiar-idioma',
            CAMBIAR_CURSO: '/usuario/cambiar-curso',
            CAMBIAR_NIVEL: '/usuario/cambiar-nivel',
            
            // UC-07: Eliminar cuenta
            DESACTIVAR: '/usuario/desactivar',
            REACTIVAR: '/usuario/reactivar/:id',
            ELIMINAR: '/usuario/eliminar',
            
            // Progreso y estadísticas del usuario
            ESTADISTICAS: '/usuario/estadisticas',
            PROGRESO: '/usuario/progreso',
            LOGROS: '/usuario/logros',
            HISTORIAL: '/usuario/historial'
        },
        
        // ========================================
        // MÓDULO 2: GESTIÓN DE LECCIONES Y CONTENIDO
        // ========================================
        
        // UC-08: Crear nuevas lecciones
        LECCIONES: {
            LISTAR: '/lecciones',
            CREAR: '/lecciones/crear',
            DETALLE: '/lecciones/:id',
            ACTUALIZAR: '/lecciones/:id',
            ELIMINAR: '/lecciones/:id',
            
            // Contenido de la lección
            CONTENIDO: '/lecciones/:id/contenido',
            ACTIVIDADES: '/lecciones/:id/actividades',
            
            // Estado del alumno
            INICIAR: '/lecciones/:id/iniciar',
            COMPLETAR: '/lecciones/:id/completar',
            PROGRESO_LECCION: '/lecciones/:id/progreso'
        },
        
        // UC-09: Agregar multimedia
        MULTIMEDIA: {
            SUBIR: '/multimedia/subir',
            LISTAR: '/multimedia',
            DETALLE: '/multimedia/:id',
            ELIMINAR: '/multimedia/:id',
            VINCULAR_LECCION: '/multimedia/:id/vincular',
            VALIDAR_FORMATO: '/multimedia/validar'
        },
        
        CURSOS: {
            LISTAR: '/cursos',
            DETALLE: '/cursos/:id',
            LECCIONES: '/cursos/:id/lecciones',
            PROGRESO: '/cursos/:id/progreso',
            INSCRIBIR: '/cursos/:id/inscribir'
        },
        
        // ========================================
        // MÓDULO 3: GESTIÓN DEL APRENDIZAJE
        // ========================================
        
        // UC-10: Registrar progreso
        PROGRESO: {
            REGISTRAR: '/progreso/registrar',
            SINCRONIZAR: '/progreso/sincronizar',
            HISTORIAL: '/progreso/historial',
            POR_LECCION: '/progreso/leccion/:id',
            POR_CURSO: '/progreso/curso/:id'
        },
        
        // UC-11: Otorgar recompensas
        RECOMPENSAS: {
            LISTAR: '/recompensas',
            OTORGAR: '/recompensas/otorgar',
            RECLAMAR: '/recompensas/:id/reclamar',
            HISTORIAL: '/recompensas/historial'
        },
        
        // UC-12: Generar tablas de clasificación
        GAMIFICACION: {
            PUNTOS: '/gamificacion/puntos',
            LOGROS: '/gamificacion/logros',
            DESBLOQUEAR_LOGRO: '/gamificacion/logros/:id/desbloquear',
            
            // Tablas de clasificación
            RANKING_GLOBAL: '/gamificacion/ranking/global',
            RANKING_SEMANAL: '/gamificacion/ranking/semanal',
            RANKING_MENSUAL: '/gamificacion/ranking/mensual',
            RANKING_AMIGOS: '/gamificacion/ranking/amigos',
            
            // Racha y nivel
            RACHA: '/gamificacion/racha',
            NIVEL_USUARIO: '/gamificacion/nivel',
            XP_USUARIO: '/gamificacion/xp'
        },
        
        EJERCICIOS: {
            OBTENER: '/ejercicios/:id',
            VALIDAR: '/ejercicios/:id/validar',
            ENVIAR_RESPUESTA: '/ejercicios/:id/responder',
            PISTA: '/ejercicios/:id/pista'
        },
        
        // ========================================
        // MÓDULO 4: GESTIÓN DE DESEMPEÑO Y RETROALIMENTACIÓN
        // ========================================
        
        // UC-13: Consultar estadísticas de progreso
        ESTADISTICAS: {
            ALUMNO: '/estadisticas/alumno/:id',
            CURSO: '/estadisticas/curso/:id',
            GENERAL: '/estadisticas/general',
            REPORTE: '/estadisticas/reporte',
            AREAS_MEJORA: '/estadisticas/areas-mejora/:id'
        },
        
        // UC-14: Revisar retroalimentación
        RETROALIMENTACION: {
            LISTAR: '/retroalimentacion',
            CREAR: '/retroalimentacion/crear',
            POR_LECCION: '/retroalimentacion/leccion/:id',
            POR_ALUMNO: '/retroalimentacion/alumno/:id',
            RESPONDER: '/retroalimentacion/:id/responder'
        },
        
        // UC-15: Planificar nuevos contenidos
        PLANIFICACION: {
            CREAR_PLAN: '/planificacion/crear',
            PLANES: '/planificacion/planes',
            DETALLE: '/planificacion/:id',
            ACTUALIZAR: '/planificacion/:id',
            ELIMINAR: '/planificacion/:id',
            ANALIZAR_DESEMPENO: '/planificacion/analizar'
        },
        
        PROFESOR: {
            DASHBOARD: '/profesor/dashboard',
            ALUMNOS: '/profesor/alumnos',
            ALUMNO_DETALLE: '/profesor/alumnos/:id',
            ESTADISTICAS_GRUPO: '/profesor/estadisticas',
            RETROALIMENTACIONES: '/profesor/retroalimentaciones'
        },
        
        // ========================================
        // MÓDULO 5: GESTIÓN DE SOPORTE Y MANTENIMIENTO
        // ========================================
        
        // UC-16: Consultar reportes de fallas
        REPORTES: {
            LISTAR: '/reportes/fallas',
            CREAR: '/reportes/fallas/crear',
            DETALLE: '/reportes/fallas/:id',
            ACTUALIZAR_ESTADO: '/reportes/fallas/:id/estado',
            ASIGNAR_PERSONAL: '/reportes/fallas/:id/asignar',
            RESOLVER: '/reportes/fallas/:id/resolver'
        },
        
        // UC-17: Programar tareas de mantenimiento
        MANTENIMIENTO: {
            TAREAS: '/mantenimiento/tareas',
            CREAR_TAREA: '/mantenimiento/tareas/crear',
            DETALLE_TAREA: '/mantenimiento/tareas/:id',
            ACTUALIZAR_TAREA: '/mantenimiento/tareas/:id',
            COMPLETAR_TAREA: '/mantenimiento/tareas/:id/completar',
            PROGRAMAR: '/mantenimiento/programar'
        },
        
        // ========================================
        // ADMIN (transversal a todos los módulos)
        // ========================================
        ADMIN: {
            // Gestión de usuarios
            USUARIOS: '/admin/usuarios',
            USUARIO_DETALLE: '/admin/usuarios/:id',
            CREAR_USUARIO: '/admin/usuarios',
            ACTUALIZAR_USUARIO: '/admin/usuarios/:id',
            ELIMINAR_USUARIO: '/admin/usuarios/:id',
            
            // Gestión de contenido
            CONTENIDO: '/admin/contenido',
            CONTENIDO_DETALLE: '/admin/contenido/:id',
            
            // Estadísticas generales
            ESTADISTICAS: '/admin/estadisticas',
            REPORTES: '/admin/reportes',
            
            // Sistema
            LOGS: '/admin/logs',
            CONFIGURACION: '/admin/configuracion'
        },
        
        // Configuración y Health
        HEALTH: '/health',
        CONFIG: '/config',
        VERSION: '/version'
    }
};

/**
 * Configuración de almacenamiento local
 * Basado en los atributos de la clase Usuario de la arquitectura
 */
const STORAGE_CONFIG = {
    // Keys para localStorage
    KEYS: {
        // Autenticación
        TOKEN: 'token',
        REFRESH_TOKEN: 'refresh_token',
        
        // Usuario (según tabla usuarios)
        USUARIO: 'usuario',
        USUARIO_ID: 'usuario_id',
        USUARIO_ROL: 'rol',
        USUARIO_ESTADO: 'estado_cuenta',
        
        // Preferencias
        THEME: 'color-theme',
        EMAIL: 'correo',
        CORREO: 'correo', // Alias
        
        // Perfil estudiante (según tabla perfil_estudiantes)
        IDIOMA: 'idioma_aprendizaje',
        NIVEL_ACTUAL: 'nivel_actual',
        CURSO_ACTUAL: 'curso_actual',
        
        // Onboarding
        ONBOARDING_COMPLETADO: 'onboarding_completado',
        EMAIL_VERIFICADO: 'correo_verificado',
        
        // Preferencias y caché
        PREFERENCIAS: 'preferencias',
        CACHE_TIMESTAMP: 'cache_timestamp'
    },
    
    // Tiempo de expiración del caché (ms)
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
    
    // Prefijo para keys de caché
    CACHE_PREFIX: 'cache_'
};

/**
 * Configuración de la UI
 */
const UI_CONFIG = {
    // Temas disponibles
    THEMES: ['light', 'dark', 'auto'],
    
    // Idiomas soportados (según RF del sistema)
    IDIOMAS_DISPONIBLES: [
        { codigo: 'es', nombre: 'Español', flag: '🇪🇸' },
        { codigo: 'en', nombre: 'English (Inglés)', flag: '🇬🇧' },
        { codigo: 'fr', nombre: 'Français (Francés)', flag: '🇫🇷' },
        { codigo: 'de', nombre: 'Deutsch (Alemán)', flag: '🇩🇪' },
        { codigo: 'it', nombre: 'Italiano', flag: '🇮🇹' }
    ],
    
    // Niveles CEFR (según tabla perfil_estudiantes)
    NIVELES_CEFR: [
        { codigo: 'A1', nombre: 'Principiante', descripcion: 'Usuario básico' },
        { codigo: 'A2', nombre: 'Elemental', descripcion: 'Usuario básico' },
        { codigo: 'B1', nombre: 'Intermedio', descripcion: 'Usuario independiente' },
        { codigo: 'B2', nombre: 'Intermedio Alto', descripcion: 'Usuario independiente' },
        { codigo: 'C1', nombre: 'Avanzado', descripcion: 'Usuario competente' },
        { codigo: 'C2', nombre: 'Maestría', descripcion: 'Usuario competente' }
    ],
    
    // Configuración de toasts
    TOAST: {
        DURATION: 4000,
        POSITION: 'top-right',
        MAX_VISIBLE: 3
    },
    
    // Configuración de modales
    MODAL: {
        ANIMATION_DURATION: 300,
        CLOSE_ON_OVERLAY_CLICK: true,
        CLOSE_ON_ESC: true
    },
    
    // Paginación
    PAGINATION: {
        ITEMS_PER_PAGE: 10,
        MAX_PAGE_BUTTONS: 5
    },
    
    // Animaciones
    ANIMATIONS: {
        ENABLED: true,
        DURATION: 300,
        EASING: 'ease-in-out'
    },
    
    // ✅ Rutas de la aplicación
    RUTAS: {
        HOME: '/index.html',
        LOGIN: '/pages/auth/login.html',
        REGISTRO: '/pages/auth/registro.html',
        VERIFICAR_EMAIL: '/pages/auth/verificar-email.html',
        ASIGNAR_NIVEL: '/pages/onboarding/asignar-nivel.html',
        RECUPERAR_PASSWORD: '/pages/auth/recuperar-contrasena.html'
    }
};

/**
 * ✅ NUEVA: Configuración de niveles CEFR y evaluación
 */
const NIVELES_CONFIG = {
    // Niveles disponibles (CEFR estándar)
    DISPONIBLES: [
        { 
            id: "A1", 
            name: "Principiante", 
            description: "Empezando desde cero",
            caracteristicas: [
                "Comprende frases básicas",
                "Puede presentarse",
                "Vocabulario: ~500 palabras"
            ]
        },
        { 
            id: "A2", 
            name: "Elemental", 
            description: "Conocimientos básicos",
            caracteristicas: [
                "Conversación simple",
                "Tareas cotidianas",
                "Vocabulario: ~1000 palabras"
            ]
        },
        { 
            id: "B1", 
            name: "Intermedio", 
            description: "Conversación cotidiana",
            caracteristicas: [
                "Temas familiares",
                "Viajes",
                "Vocabulario: ~2000 palabras"
            ]
        },
        { 
            id: "B2", 
            name: "Intermedio Alto", 
            description: "Fluidez en la mayoría de situaciones",
            caracteristicas: [
                "Temas abstractos",
                "Argumentación",
                "Vocabulario: ~4000 palabras"
            ]
        },
        { 
            id: "C1", 
            name: "Avanzado", 
            description: "Dominio del idioma",
            caracteristicas: [
                "Textos complejos",
                "Expresión fluida",
                "Vocabulario: ~8000 palabras"
            ]
        },
        { 
            id: "C2", 
            name: "Maestría", 
            description: "Nivel nativo",
            caracteristicas: [
                "Comprensión total",
                "Expresión matizada",
                "Vocabulario: 10000+ palabras"
            ]
        }
    ],
    
    // Mapeo de puntajes a niveles
    SCORE_TO_LEVEL: {
        90: "C2",
        75: "C1",
        60: "B2",
        45: "B1",
        30: "A2",
        0: "A1"
    },
    
    // Configuración de evaluación
    EVALUACION: {
        PREGUNTAS_POR_NIVEL: 10,
        TIEMPO_LIMITE_SEGUNDOS: 600,
        MIN_PREGUNTAS_CORRECTAS: {
            A1: 0,
            A2: 3,
            B1: 5,
            B2: 6,
            C1: 8,
            C2: 9
        }
    }
};

/**
 * ✅ NUEVA: Configuración de tiempos y timeouts
 */
const TIMEOUTS_CONFIG = {
    // Timeout para peticiones API (ms)
    API_REQUEST: 30000,
    
    // Timeout para reenvío de código de verificación (segundos)
    REENVIO_CODIGO: 60,
    
    // Timeout para reenvío de recuperación de contraseña (segundos)
    REENVIO_RECUPERACION: 120,
    
    // Tiempo de espera para redirecciones (ms)
    REDIRECT_DELAY: 1500,
    
    // Duración de mensajes toast (ms)
    TOAST_DURATION: 4000,
    
    // Timeout para auto-logout por inactividad (ms)
    AUTO_LOGOUT: 30 * 60 * 1000, // 30 minutos
    
    // Duración de animaciones (ms)
    ANIMATION_DURATION: 300,
    
    // Debounce para búsquedas (ms)
    SEARCH_DEBOUNCE: 300,
    
    // Polling interval para actualizaciones (ms)
    POLLING_INTERVAL: 30000 // 30 segundos
};

/**
 * Configuración de validación
 * Basado en los requisitos de la base de datos
 */
const VALIDATION_CONFIG = {
    // Reglas de contraseña
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: false,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: false
    },
    
    // Reglas de email (según tabla usuarios: VARCHAR(150))
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MAX_LENGTH: 150
    },
    
    // Reglas de nombre (según tabla usuarios: VARCHAR(100))
    NOMBRE: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    },
    
    // Reglas de código de verificación (VARCHAR(6))
    CODIGO_VERIFICACION: {
        LENGTH: 6,
        PATTERN: /^\d{6}$/,
        EXPIRACION_MINUTOS: 15
    },
    
    // Validaciones de multimedia (UC-09)
    MULTIMEDIA: {
        FORMATOS_IMAGEN: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        FORMATOS_VIDEO: ['mp4', 'webm', 'ogg'],
        FORMATOS_AUDIO: ['mp3', 'wav', 'ogg'],
        MAX_SIZE_MB: 50,
        MAX_SIZE_BYTES: 50 * 1024 * 1024
    }
};

/**
 * Configuración de gamificación
 * Basado en UC-10, UC-11, UC-12 y Módulo 3
 */
const GAMIFICACION_CONFIG = {
    // Puntos por acción (UC-10: Registrar progreso)
    PUNTOS: {
        LECCION_COMPLETADA: 10,
        EJERCICIO_CORRECTO: 5,
        EJERCICIO_PERFECTO: 10,
        RACHA_DIARIA: 20,
        EVALUACION_APROBADA: 50,
        NIVEL_COMPLETADO: 100,
        LOGRO_DESBLOQUEADO: 25,
        PRIMER_LOGIN: 5,
        COMENTARIO_PROFESOR: 15
    },
    
    // Niveles de XP (según tabla perfil_estudiantes: total_xp)
    NIVELES: [
        { nivel: 1, xp_requerido: 0, titulo: 'Novato' },
        { nivel: 2, xp_requerido: 100, titulo: 'Aprendiz' },
        { nivel: 3, xp_requerido: 250, titulo: 'Estudiante' },
        { nivel: 4, xp_requerido: 500, titulo: 'Competente' },
        { nivel: 5, xp_requerido: 1000, titulo: 'Hábil' },
        { nivel: 6, xp_requerido: 2000, titulo: 'Experto' },
        { nivel: 7, xp_requerido: 3500, titulo: 'Maestro' },
        { nivel: 8, xp_requerido: 5500, titulo: 'Gran Maestro' },
        { nivel: 9, xp_requerido: 8000, titulo: 'Leyenda' },
        { nivel: 10, xp_requerido: 12000, titulo: 'Campeón' }
    ],
    
    // Tipos de logros (UC-11: Otorgar recompensas)
    TIPOS_LOGROS: [
        'primera_leccion',
        'racha_7_dias',
        'racha_30_dias',
        'nivel_completado',
        'perfeccionista',
        'velocista',
        'estudioso',
        'social',
        'explorador'
    ],
    
    // Configuración de racha
    RACHA: {
        MIN_ACTIVIDAD_DIARIA: 10, // minutos
        MAX_DIAS_INACTIVIDAD: 1
    }
};

/**
 * Configuración de roles y permisos
 * Basado en la tabla usuarios: rol ENUM('alumno', 'profesor', 'admin')
 */
const ROLES_CONFIG = {
    // Roles del sistema (según BD)
    ROLES: {
        ALUMNO: 'alumno',
        ESTUDIANTE: 'alumno', // Alias
        PROFESOR: 'profesor',
        ADMIN: 'admin',
        ADMINISTRADOR: 'admin', // Alias
        MANTENIMIENTO: 'mantenimiento'
    },
    
    // ✅ CORRECCIÓN APLICADA: Rutas relativas desde /pages/auth/
    RUTAS_DASHBOARD: {
        alumno: '../estudiante/estudiante-dashboard.html',
        profesor: '../profesor/profesor-dashboard.html',
        admin: '../admin/admin-dashboard.html',
        mantenimiento: '../mantenimiento/mantenimiento-dashboard.html'
    },
    
    // Estados de cuenta (según BD)
    ESTADOS_CUENTA: {
        ACTIVO: 'activo',
        PENDIENTE_VERIFICACION: 'pendiente_verificacion',
        BLOQUEADO: 'bloqueado',
        DESACTIVADO: 'desactivado'
    },
    
    // Permisos por rol (según casos de uso)
    PERMISOS: {
        alumno: [
            'ver_lecciones',          // UC-10
            'realizar_ejercicios',    // UC-10
            'ver_progreso',           // UC-10
            'ver_recompensas',        // UC-11
            'ver_ranking',            // UC-12
            'cambiar_curso',          // UC-06
            'eliminar_cuenta'         // UC-07
        ],
        profesor: [
            'ver_estadisticas',       // UC-13
            'revisar_retroalimentacion', // UC-14
            'planificar_contenido',   // UC-15
            'dar_retroalimentacion'
        ],
        admin: [
            'gestionar_usuarios',
            'gestionar_contenido',    // UC-08, UC-09
            'ver_reportes',
            'crear_lecciones',        // UC-08
            'agregar_multimedia'      // UC-09
        ],
        mantenimiento: [
            'consultar_reportes',     // UC-16
            'programar_tareas',       // UC-17
            'ver_logs',
            'gestionar_sistema'
        ]
    }
};

/**
 * Configuración de errores
 * Basado en los flujos alternativos de los diagramas de secuencia
 */
const ERROR_CONFIG = {
    // Códigos de error personalizados
    CODIGOS: {
        // Autenticación (UC-01, UC-02, UC-03)
        EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
        CUENTA_DESACTIVADA: 'CUENTA_DESACTIVADA',
        CUENTA_ELIMINADA: 'CUENTA_ELIMINADA',
        TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
        TOKEN_INVALIDO: 'TOKEN_INVALIDO',
        CREDENCIALES_INVALIDAS: 'CREDENCIALES_INVALIDAS',
        CODIGO_VERIFICACION_INVALIDO: 'CODIGO_VERIFICACION_INVALIDO',
        
        // Usuario (UC-04, UC-06, UC-07)
        EMAIL_EN_USO: 'EMAIL_EN_USO',
        USUARIO_NO_ENCONTRADO: 'USUARIO_NO_ENCONTRADO',
        PASSWORD_INCORRECTA: 'PASSWORD_INCORRECTA',
        
        // Contenido (UC-08, UC-09)
        FORMATO_NO_SOPORTADO: 'FORMATO_NO_SOPORTADO',
        ARCHIVO_MUY_GRANDE: 'ARCHIVO_MUY_GRANDE',
        LECCION_NO_ENCONTRADA: 'LECCION_NO_ENCONTRADA',
        
        // Progreso (UC-10, UC-11, UC-12)
        SIN_PROGRESO: 'SIN_PROGRESO',
        SIN_DATOS_RANKING: 'SIN_DATOS_RANKING',
        
        // Desempeño (UC-13, UC-14, UC-15)
        SIN_ESTADISTICAS: 'SIN_ESTADISTICAS',
        SIN_RETROALIMENTACION: 'SIN_RETROALIMENTACION',
        
        // Mantenimiento (UC-16, UC-17)
        SIN_REPORTES: 'SIN_REPORTES',
        ACCESO_DENEGADO: 'ACCESO_DENEGADO',
        
        // Validación
        DATOS_INVALIDOS: 'DATOS_INVALIDOS',
        CAMPO_REQUERIDO: 'CAMPO_REQUERIDO',
        
        // Sistema
        ERROR_SERVIDOR: 'ERROR_SERVIDOR',
        ERROR_RED: 'ERROR_RED',
        ERROR_TIMEOUT: 'ERROR_TIMEOUT'
    },
    
    // Mensajes de error amigables
    MENSAJES: {
        EMAIL_NOT_VERIFIED: 'Por favor verifica tu correo electrónico antes de iniciar sesión',
        CUENTA_DESACTIVADA: 'Tu cuenta está desactivada. Puedes reactivarla desde el login',
        CUENTA_ELIMINADA: 'Esta cuenta ha sido eliminada permanentemente',
        TOKEN_EXPIRADO: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
        CREDENCIALES_INVALIDAS: 'Correo o contraseña incorrectos',
        CODIGO_VERIFICACION_INVALIDO: 'El código de verificación es inválido o ha expirado',
        EMAIL_EN_USO: 'Este correo electrónico ya está registrado',
        FORMATO_NO_SOPORTADO: 'El formato del archivo no es compatible',
        ARCHIVO_MUY_GRANDE: 'El archivo es demasiado grande',
        SIN_PROGRESO: 'No hay progreso registrado para mostrar',
        SIN_DATOS_RANKING: 'No hay suficientes datos para generar el ranking',
        SIN_ESTADISTICAS: 'No hay estadísticas disponibles',
        SIN_RETROALIMENTACION: 'No hay comentarios registrados',
        SIN_REPORTES: 'No hay reportes de fallas disponibles',
        ACCESO_DENEGADO: 'No tienes permisos para acceder a esta función',
        ERROR_SERVIDOR: 'Error en el servidor. Por favor intenta más tarde',
        ERROR_RED: 'No se pudo conectar al servidor. Verifica tu conexión a internet'
    }
};

/**
 * Configuración de fechas y formatos
 */
const FORMAT_CONFIG = {
    // Formatos de fecha
    DATE_FORMATS: {
        SHORT: 'DD/MM/YYYY',
        LONG: 'dddd, D [de] MMMM [de] YYYY',
        TIME: 'HH:mm',
        DATETIME: 'DD/MM/YYYY HH:mm',
        ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    },
    
    // Locale
    LOCALE: 'es-MX',
    TIMEZONE: 'America/Mexico_City'
};

/**
 * Configuración de usuarios de prueba (solo desarrollo)
 * Basado en los roles del sistema
 */
const TEST_USERS = APP_ENV.MODE === 'development' ? [
    {
        name: "Estudiante Demo",
        email: "estudiante@speaklexi.com",
        password: "estudiante123",
        role: "alumno",
        description: "Acceso completo al módulo de aprendizaje"
    },
    {
        name: "Profesor Demo",
        email: "profesor@speaklexi.com",
        password: "profesor123",
        role: "profesor",
        description: "Acceso a estadísticas y retroalimentación"
    },
    {
        name: "Admin Demo",
        email: "admin@speaklexi.com",
        password: "admin123",
        role: "admin",
        description: "Gestión de contenido y usuarios"
    },
    {
        name: "Mantenimiento Demo",
        email: "mantenimiento@speaklexi.com",
        password: "mantenimiento123",
        role: "mantenimiento",
        description: "Reportes y tareas programadas"
    }
] : [];

/**
 * Función auxiliar para navegar al dashboard según el rol
 * @param {string} rol - Rol del usuario
 */
function navegarAlDashboard(rol) {
    const rutas = ROLES_CONFIG.RUTAS_DASHBOARD;
    
    if (rutas[rol]) {
        window.location.href = rutas[rol];
    } else {
        console.error('Rol no válido o dashboard no configurado:', rol);
        // Redirigir a página por defecto o mostrar error
        window.location.href = '../estudiante/estudiante-dashboard.html';
    }
}

/**
 * Configuración de la aplicación completa
 */
const APP_CONFIG = {
    ENV: APP_ENV,
    API: API_CONFIG,
    STORAGE: STORAGE_CONFIG,
    UI: UI_CONFIG,
    TIMEOUTS: TIMEOUTS_CONFIG,
    NIVELES: NIVELES_CONFIG,  // ← ✅ AGREGADO
    VALIDATION: VALIDATION_CONFIG,
    GAMIFICACION: GAMIFICACION_CONFIG,
    ROLES: ROLES_CONFIG,
    ERROR: ERROR_CONFIG,
    FORMAT: FORMAT_CONFIG,
    TEST_USERS: TEST_USERS,
    navegarAlDashboard: navegarAlDashboard
};

/**
 * Exportar configuraciones
 */
if (typeof window !== 'undefined') {
    // Browser environment - hacer disponible globalmente
    window.APP_CONFIG = APP_CONFIG;
    
    // También exportar individualmente para acceso directo
    window.SpeakLexiConfig = {
        ENV: APP_ENV,
        API: API_CONFIG,
        STORAGE: STORAGE_CONFIG,
        UI: UI_CONFIG,
        TIMEOUTS: TIMEOUTS_CONFIG,
        NIVELES: NIVELES_CONFIG,  // ← ✅ AGREGADO
        VALIDATION: VALIDATION_CONFIG,
        GAMIFICACION: GAMIFICACION_CONFIG,
        ROLES: ROLES_CONFIG,
        ERROR: ERROR_CONFIG,
        FORMAT: FORMAT_CONFIG,
        TEST_USERS: TEST_USERS,
        navegarAlDashboard: navegarAlDashboard
    };
}

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}

// Export para ES modules
if (typeof exports !== 'undefined') {
    exports.default = APP_CONFIG;
    exports.APP_CONFIG = APP_CONFIG;
}

// Log de inicialización en desarrollo
if (APP_ENV.DEBUG && typeof console !== 'undefined') {
    console.log(`🚀 ${APP_ENV.APP_NAME} v${APP_ENV.VERSION} - Configuración cargada en modo: ${APP_ENV.MODE}`);
    console.log('📁 Módulos configurados: Usuarios, Lecciones, Aprendizaje, Desempeño, Mantenimiento');
    console.log('✅ Configuración NIVELES agregada correctamente');
    console.log('🎯 Niveles CEFR disponibles: A1, A2, B1, B2, C1, C2');
}