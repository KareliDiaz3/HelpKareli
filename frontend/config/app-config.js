/* ============================================
   SPEAKLEXI 2.0 - CONFIGURACIÓN COMPLETA
   Archivo: frontend/config/app-config.js
   Descripción: Configuración centralizada para todos los módulos
   Módulos: Usuarios, Lecciones, Aprendizaje, Desempeño
   ============================================ */

/**
 * Configuración del entorno
 */
const APP_ENV = {
    MODE: 'development', // 'development' | 'production' | 'testing'
    DEBUG: true,
    VERSION: '2.0.0',
    APP_NAME: 'SpeakLexi',
    BUILD_DATE: '2025-01-15'
};

/**
 * Configuración de la API - COMPLETAMENTE ACTUALIZADA
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
    // ENDPOINTS COMPLETOS - TODOS LOS MÓDULOS
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

            // Gestión de ciclo de vida de cuenta
            DESACTIVAR_CUENTA: '/auth/desactivar-cuenta',
            ELIMINAR_CUENTA: '/auth/eliminar-cuenta',
            REACTIVAR_CUENTA: '/auth/reactivar-cuenta',
            
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
            CREAR: '/lecciones',
            DETALLE: '/lecciones/:id',
            ACTUALIZAR: '/lecciones/:id',
            ELIMINAR: '/lecciones/:id',
            
            // Contenido de la lección
            CONTENIDO: '/lecciones/:id/contenido',
            ACTIVIDADES: '/lecciones/:id/actividades',
            
            // Estado del alumno
            INICIAR: '/lecciones/:id/iniciar',
            COMPLETAR: '/lecciones/:id/completar',
            PROGRESO_LECCION: '/lecciones/:id/progreso',
            
            // Para estudiantes
            RECOMENDADAS: '/lecciones/recomendadas',
            EN_PROGRESO: '/lecciones/en-progreso',
            COMPLETADAS: '/lecciones/completadas'
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
        
        // Gestión de cursos
        CURSOS: {
            LISTAR: '/cursos',
            DETALLE: '/cursos/:id',
            CREAR: '/cursos',
            ACTUALIZAR: '/cursos/:id',
            ELIMINAR: '/cursos/:id',
            POR_NIVEL: '/cursos/nivel/:nivel',
            LECCIONES: '/cursos/:id/lecciones',
            INSCRIBIR: '/cursos/:id/inscribir',
            PROGRESO: '/cursos/:id/progreso',
            SIGUIENTE_LECCION: '/cursos/:id/siguiente-leccion'
        },
        
        // Dashboard estudiante
        ESTUDIANTE: {
            DASHBOARD: '/estudiante/dashboard',
            MIS_CURSOS: '/estudiante/mis-cursos',
            ESTADISTICAS: '/estudiante/estadisticas',
            PROGRESO_GENERAL: '/estudiante/progreso',
            CERTIFICADOS: '/estudiante/certificados',
            ACTIVIDAD_RECIENTE: '/estudiante/actividad-reciente',
            LECCIONES_RECOMENDADAS: '/estudiante/lecciones-recomendadas'
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
            POR_CURSO: '/progreso/curso/:id',
            RESUMEN: '/progreso/resumen'
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
        // MÓDULO 4: GESTIÓN DE DESEMPEÑO Y ANÁLISIS
        // ========================================
        
        // ✅ UC-13: Consultar estadísticas de progreso (PROFESOR)
        PROFESOR: {
            // Dashboard y gestión general
            DASHBOARD: '/profesor/dashboard',
            ALUMNOS: '/profesor/alumnos',
            ALUMNO_DETALLE: '/profesor/alumnos/:id',
            
            // Estadísticas detalladas
            ESTADISTICAS: {
                GENERAL: '/profesor/estadisticas/general',
                POR_NIVEL: '/profesor/estadisticas/por-nivel',
                TENDENCIA_MENSUAL: '/profesor/estadisticas/tendencia-mensual',
                MEJORES_ALUMNOS: '/profesor/estadisticas/mejores-alumnos',
                AREAS_CRITICAS: '/profesor/estadisticas/areas-criticas',
                EXPORTAR_REPORTE: '/profesor/estadisticas/exportar',
                DISTRIBUCION_HABILIDADES: '/profesor/estadisticas/distribucion-habilidades'
            },
            
            // ✅ UC-14: Revisar retroalimentación
            RETROALIMENTACION: {
                ALUMNOS: '/profesor/alumnos',
                POR_ALUMNO: '/profesor/retroalimentacion/alumno/:id',
                CREAR: '/profesor/retroalimentacion',
                ACTUALIZAR: '/profesor/retroalimentacion/:id',
                ELIMINAR: '/profesor/retroalimentacion/:id',
                LECCIONES_ALUMNO: '/profesor/alumno/:id/lecciones',
                LISTAR_TODAS: '/profesor/retroalimentaciones'
            },
            
            // ✅ UC-15: Planificar nuevos contenidos
            PLANIFICACION: {
                ANALIZAR: '/profesor/planificacion/analisis',
                PLANES: '/profesor/planificacion/planes',
                CREAR: '/profesor/planificacion/planes',
                ACTUALIZAR: '/profesor/planificacion/planes/:id',
                ELIMINAR: '/profesor/planificacion/planes/:id',
                DETALLE: '/profesor/planificacion/planes/:id',
                SUGERENCIAS: '/profesor/planificacion/sugerencias'
            }
        },
        
        // Endpoints genéricos (para compatibilidad)
        ESTADISTICAS: {
            ALUMNO: '/estadisticas/alumno/:id',
            CURSO: '/estadisticas/curso/:id',
            GENERAL: '/estadisticas/general'
        },
        
        RETROALIMENTACION: {
            LISTAR: '/retroalimentacion',
            CREAR: '/retroalimentacion/crear',
            POR_LECCION: '/retroalimentacion/leccion/:id',
            POR_ALUMNO: '/retroalimentacion/alumno/:id'
        },
        
        // Configuración y Health
        HEALTH: '/health',
        CONFIG: '/config',
        VERSION: '/version'
    }
};

/**
 * Configuración de almacenamiento local
 */
const STORAGE_CONFIG = {
    // Keys para localStorage
    KEYS: {
        // Autenticación
        TOKEN: 'token',
        REFRESH_TOKEN: 'refresh_token',
        
        // Usuario
        USUARIO: 'usuario',
        USUARIO_ID: 'usuario_id',
        USUARIO_ROL: 'rol',
        USUARIO_ESTADO: 'estado_cuenta',
        
        // Preferencias
        THEME: 'color-theme',
        EMAIL: 'correo',
        CORREO: 'correo',
        
        // Perfil estudiante
        IDIOMA: 'idioma_aprendizaje',
        NIVEL_ACTUAL: 'nivel_actual',
        CURSO_ACTUAL: 'curso_actual',
        
        // Cursos del estudiante
        CURSOS_INSCRITOS: 'cursos_inscritos',
        CURSO_ACTIVO: 'curso_activo',
        PROGRESO_CURSOS: 'progreso_cursos',
        
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
    
    // Idiomas soportados
    IDIOMAS_DISPONIBLES: [
        { codigo: 'es', nombre: 'Español', flag: '🇪🇸' },
        { codigo: 'en', nombre: 'English (Inglés)', flag: '🇬🇧' },
        { codigo: 'fr', nombre: 'Français (Francés)', flag: '🇫🇷' },
        { codigo: 'de', nombre: 'Deutsch (Alemán)', flag: '🇩🇪' },
        { codigo: 'it', nombre: 'Italiano', flag: '🇮🇹' }
    ],
    
    // Niveles CEFR
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
    
    // Rutas de la aplicación
    RUTAS: {
        HOME: '/index.html',
        LOGIN: '/pages/auth/login.html',
        REGISTRO: '/pages/auth/registro.html',
        VERIFICAR_EMAIL: '/pages/auth/verificar-email.html',
        ASIGNAR_NIVEL: '/pages/onboarding/asignar-nivel.html',
        RECUPERAR_PASSWORD: '/pages/auth/recuperar-contrasena.html',
        
        // Rutas para estudiantes
        ESTUDIANTE: {
            DASHBOARD: '/pages/estudiante/estudiante-dashboard.html',
            MIS_CURSOS: '/pages/estudiante/mis-cursos.html',
            ESTADISTICAS: '/pages/estudiante/estadisticas-estudiante.html',
            CERTIFICADOS: '/pages/estudiante/certificados.html',
            PERFIL: '/pages/estudiante/perfil-estudiante.html'
        },
        
        // Rutas para cursos
        CURSOS: {
            CATALOGO: '/pages/cursos/catalogo-cursos.html',
            DETALLE: '/pages/cursos/detalle-curso.html',
            LECCION: '/pages/cursos/leccion-curso.html',
            PROGRESO: '/pages/cursos/progreso-curso.html'
        },
        
        // ✅ NUEVAS RUTAS PARA PROFESOR
        PROFESOR: {
            DASHBOARD: '/pages/profesor/profesor-dashboard.html',
            ESTADISTICAS: '/pages/profesor/estadisticas-profesor.html',
            RETROALIMENTACION: '/pages/profesor/retroalimentacion-profesor.html',
            PLANIFICACION: '/pages/profesor/planificacion.html',
            ALUMNOS: '/pages/profesor/gestion-alumnos.html'
        },
        
        // Rutas para admin
        ADMIN: {
            DASHBOARD: '/pages/admin/admin-dashboard.html',
            USUARIOS: '/pages/admin/gestion-usuarios.html',
            CONTENIDO: '/pages/admin/gestion-contenido.html'
        }
    }
};

/**
 * Configuración de niveles CEFR y evaluación
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
 * Configuración de tiempos y timeouts
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
    
    // Reglas de email
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MAX_LENGTH: 150
    },
    
    // Reglas de nombre
    NOMBRE: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    },
    
    // Reglas de código de verificación
    CODIGO_VERIFICACION: {
        LENGTH: 6,
        PATTERN: /^\d{6}$/,
        EXPIRACION_MINUTOS: 15
    },
    
    // Validaciones de multimedia
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
 */
const GAMIFICACION_CONFIG = {
    // Puntos por acción
    PUNTOS: {
        LECCION_COMPLETADA: 10,
        EJERCICIO_CORRECTO: 5,
        EJERCICIO_PERFECTO: 10,
        RACHA_DIARIA: 20,
        EVALUACION_APROBADA: 50,
        NIVEL_COMPLETADO: 100,
        LOGRO_DESBLOQUEADO: 25,
        PRIMER_LOGIN: 5,
        COMENTARIO_PROFESOR: 15,
        
        // Puntos específicos para cursos
        CURSO_INSCRITO: 15,
        CURSO_COMPLETADO: 200,
        LECCION_CURSO_COMPLETADA: 25
    },
    
    // Niveles de XP
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
    
    // Tipos de logros
    TIPOS_LOGROS: [
        'primera_leccion',
        'racha_7_dias',
        'racha_30_dias',
        'nivel_completado',
        'perfeccionista',
        'velocista',
        'estudioso',
        'social',
        'explorador',
        
        // Logros específicos para cursos
        'primer_curso',
        'curso_completado',
        'especialista_curso',
        'coleccionista_cursos'
    ],
    
    // Configuración de racha
    RACHA: {
        MIN_ACTIVIDAD_DIARIA: 10, // minutos
        MAX_DIAS_INACTIVIDAD: 1
    }
};

/**
 * Configuración de roles y permisos
 */
const ROLES_CONFIG = {
    // Roles del sistema
    ROLES: {
        ALUMNO: 'alumno',
        ESTUDIANTE: 'alumno',
        PROFESOR: 'profesor',
        ADMIN: 'admin',
        ADMINISTRADOR: 'admin'
    },
    
    // Rutas de dashboard por rol
    RUTAS_DASHBOARD: {
        alumno: '../estudiante/estudiante-dashboard.html',
        profesor: '../profesor/profesor-dashboard.html',
        admin: '../admin/admin-dashboard.html'
    },
    
    // Estados de cuenta
    ESTADOS_CUENTA: {
        ACTIVO: 'activo',
        PENDIENTE_VERIFICACION: 'pendiente_verificacion',
        BLOQUEADO: 'bloqueado',
        DESACTIVADO: 'desactivado'
    },
    
    // Permisos por rol
    PERMISOS: {
        alumno: [
            'ver_lecciones',
            'realizar_ejercicios',
            'ver_progreso',
            'ver_recompensas',
            'ver_ranking',
            'cambiar_curso',
            'eliminar_cuenta',
            'ver_cursos',
            'inscribirse_cursos',
            'ver_progreso_cursos',
            'completar_lecciones_curso'
        ],
        profesor: [
            'ver_estadisticas',
            'revisar_retroalimentacion',
            'planificar_contenido',
            'dar_retroalimentacion',
            'crear_cursos',
            'gestionar_cursos',
            'ver_estadisticas_cursos',
            'ver_alumnos',
            'analizar_desempeno'
        ],
        admin: [
            'gestionar_usuarios',
            'gestionar_contenido',
            'ver_reportes',
            'crear_lecciones',
            'agregar_multimedia',
            'gestionar_todos_cursos',
            'asignar_cursos',
            'ver_analiticas_cursos',
            'gestionar_profesores'
        ]
    }
};

/**
 * Configuración de errores
 */
const ERROR_CONFIG = {
    // Códigos de error personalizados
    CODIGOS: {
        // Autenticación
        EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
        CUENTA_DESACTIVADA: 'CUENTA_DESACTIVADA',
        CUENTA_ELIMINADA: 'CUENTA_ELIMINADA',
        TOKEN_EXPIRADO: 'TOKEN_EXPIRADO',
        TOKEN_INVALIDO: 'TOKEN_INVALIDO',
        CREDENCIALES_INVALIDAS: 'CREDENCIALES_INVALIDAS',
        CODIGO_VERIFICACION_INVALIDO: 'CODIGO_VERIFICACION_INVALIDO',
        
        // Usuario
        EMAIL_EN_USO: 'EMAIL_EN_USO',
        USUARIO_NO_ENCONTRADO: 'USUARIO_NO_ENCONTRADO',
        PASSWORD_INCORRECTA: 'PASSWORD_INCORRECTA',
        
        // Contenido
        FORMATO_NO_SOPORTADO: 'FORMATO_NO_SOPORTADO',
        ARCHIVO_MUY_GRANDE: 'ARCHIVO_MUY_GRANDE',
        LECCION_NO_ENCONTRADA: 'LECCION_NO_ENCONTRADA',
        
        // Cursos
        CURSO_NO_ENCONTRADO: 'CURSO_NO_ENCONTRADO',
        CURSO_YA_INSCRITO: 'CURSO_YA_INSCRITO',
        CURSO_NO_DISPONIBLE: 'CURSO_NO_DISPONIBLE',
        LECCION_CURSO_NO_ENCONTRADA: 'LECCION_CURSO_NO_ENCONTRADA',
        PROGRESO_CURSO_NO_ENCONTRADO: 'PROGRESO_CURSO_NO_ENCONTRADO',
        
        // Progreso
        SIN_PROGRESO: 'SIN_PROGRESO',
        SIN_DATOS_RANKING: 'SIN_DATOS_RANKING',
        
        // Desempeño
        SIN_ESTADISTICAS: 'SIN_ESTADISTICAS',
        SIN_RETROALIMENTACION: 'SIN_RETROALIMENTACION',
        
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
        
        // Cursos
        CURSO_NO_ENCONTRADO: 'El curso solicitado no existe',
        CURSO_YA_INSCRITO: 'Ya estás inscrito en este curso',
        CURSO_NO_DISPONIBLE: 'Este curso no está disponible en este momento',
        LECCION_CURSO_NO_ENCONTRADA: 'La lección del curso no fue encontrada',
        PROGRESO_CURSO_NO_ENCONTRADO: 'No se encontró progreso para este curso',
        
        SIN_PROGRESO: 'No hay progreso registrado para mostrar',
        SIN_DATOS_RANKING: 'No hay suficientes datos para generar el ranking',
        SIN_ESTADISTICAS: 'No hay estadísticas disponibles',
        SIN_RETROALIMENTACION: 'No hay comentarios registrados',
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
 * Usuarios de prueba (solo desarrollo)
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
    }
] : [];

/**
 * Función auxiliar para navegar al dashboard según el rol
 */
function navegarAlDashboard(rol) {
    const rutas = ROLES_CONFIG.RUTAS_DASHBOARD;
    
    if (rutas[rol]) {
        window.location.href = rutas[rol];
    } else {
        console.error('Rol no válido o dashboard no configurado:', rol);
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
    NIVELES: NIVELES_CONFIG,
    VALIDATION: VALIDATION_CONFIG,
    GAMIFICACION: GAMIFICACION_CONFIG,
    ROLES: ROLES_CONFIG,
    ERROR: ERROR_CONFIG,
    FORMAT: FORMAT_CONFIG,
    TEST_USERS: TEST_USERS,
    navegarAlDashboard: navegarAlDashboard
};

// ==========================================================
// EXPORTAR AL WINDOW GLOBAL
// ==========================================================
if (typeof window !== 'undefined') {
    window.APP_ENV = APP_ENV;
    window.API_CONFIG = API_CONFIG;
    window.STORAGE_CONFIG = STORAGE_CONFIG;
    window.UI_CONFIG = UI_CONFIG;
    window.TIMEOUTS_CONFIG = TIMEOUTS_CONFIG;
    window.NIVELES_CONFIG = NIVELES_CONFIG;
    window.VALIDATION_CONFIG = VALIDATION_CONFIG;
    window.GAMIFICACION_CONFIG = GAMIFICACION_CONFIG;
    window.ROLES_CONFIG = ROLES_CONFIG;
    window.ERROR_CONFIG = ERROR_CONFIG;
    window.FORMAT_CONFIG = FORMAT_CONFIG;
    window.TEST_USERS = TEST_USERS;
    window.APP_CONFIG = APP_CONFIG;
    window.SpeakLexiConfig = APP_CONFIG;
    window.navegarAlDashboard = navegarAlDashboard;
    
    console.log('✅ SpeakLexi Config - Configuración completa cargada');
    console.log('   - Modo:', window.APP_ENV?.MODE);
    console.log('   - Versión:', window.APP_ENV?.VERSION);
    console.log('   - Endpoints PROFESOR configurados: ✅');
    console.log('   - Módulo 5 (Mantenimiento) eliminado: ✅');
}

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}

// Log de inicialización
if (APP_ENV.DEBUG && typeof console !== 'undefined') {
    console.log(`🚀 ${APP_ENV.APP_NAME} v${APP_ENV.VERSION} - Configuración cargada`);
    console.log('📁 Módulos activos: Usuarios, Lecciones, Aprendizaje, Desempeño');
    console.log('🎯 Endpoints de PROFESOR configurados para UC-13, UC-14, UC-15');
}