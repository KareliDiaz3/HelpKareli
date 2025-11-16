/* ============================================
   SPEAKLEXI - CLIENTE API CORREGIDO (VERSIÓN COMPLETA)
   Archivo: assets/js/core/api-client.js
   ============================================ */

class APIClient {
    constructor() {
        // ✅ Usar configuración centralizada
        this.config = window.APP_CONFIG?.API || this.getDefaultConfig();
        this.storageConfig = window.APP_CONFIG?.STORAGE || {};
        
        this.baseURL = this.config.API_URL || this.config.BASE_URL || 'http://localhost:5000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
        
        console.log('✅ API Client inicializado:', this.baseURL);
    }

    /**
     * Configuración por defecto (fallback)
     */
    getDefaultConfig() {
        return {
            BASE_URL: 'http://localhost:5000',
            API_URL: 'http://localhost:5000/api',
            TIMEOUT: 30000,
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000,
            ENDPOINTS: {
                AUTH: {
                    LOGIN: '/auth/login',
                    REGISTRO: '/auth/registro'
                }
            }
        };
    }

    /**
     * Obtiene el token de autenticación del localStorage
     */
    getAuthToken() {
        return localStorage.getItem(this.storageConfig.KEYS?.TOKEN || 'token');
    }

    /**
     * Establece el token de autenticación
     */
    setAuthToken(token) {
        const tokenKey = this.storageConfig.KEYS?.TOKEN || 'token';
        if (token) {
            localStorage.setItem(tokenKey, token);
        } else {
            localStorage.removeItem(tokenKey);
        }
    }

    /**
     * Obtiene los headers con autenticación
     */
    getHeaders(customHeaders = {}) {
        const headers = { ...this.defaultHeaders, ...customHeaders };
        
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    /**
     * Realiza una petición HTTP con timeout y reintentos
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.headers),
            timeout: this.config.TIMEOUT || 30000
        };

        let attempts = 0;
        const maxAttempts = this.config.RETRY_ATTEMPTS || 1;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`📤 ${options.method || 'GET'} ${url} (Intento ${attempts}/${maxAttempts})`);
                
                const response = await this.fetchWithTimeout(url, config);
                const data = await response.json();

                console.log(`📥 Status: ${response.status}`, data);

                if (!response.ok) {
                    // Manejar errores de autenticación
                    if (response.status === 401 || response.status === 403) {
                        this.handleAuthError(response);
                    }

                    return {
                        success: false,
                        status: response.status,
                        error: data.error || data.mensaje || 'Error en la petición',
                        errores: data.errores || [],
                        data: data
                    };
                }

                return {
                    success: true,
                    status: response.status,
                    data: data
                };

            } catch (error) {
                console.error(`💥 Error en petición (intento ${attempts}):`, error);
                
                // Si es el último intento, devolver error
                if (attempts >= maxAttempts) {
                    return this.handleRequestError(error);
                }
                
                // Esperar antes del reintento
                if (this.config.RETRY_DELAY) {
                    await this.delay(this.config.RETRY_DELAY);
                }
            }
        }
    }

    /**
     * Fetch con timeout
     */
    async fetchWithTimeout(url, options = {}) {
        const { timeout = 30000 } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    /**
     * Maneja errores de petición
     */
    handleRequestError(error) {
        let errorMessage = 'Error de conexión con el servidor';
        let errorCode = 'ERROR_RED';
        
        if (error.name === 'AbortError') {
            errorMessage = 'La petición tardó demasiado tiempo';
            errorCode = 'ERROR_TIMEOUT';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
            errorCode = 'ERROR_RED';
        }

        return {
            success: false,
            status: 0,
            error: errorMessage,
            errorCode: errorCode,
            originalError: error
        };
    }

    /**
     * Delay para reintentos
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Maneja errores de autenticación
     */
    handleAuthError(response) {
        this.setAuthToken(null);
        localStorage.removeItem(this.storageConfig.KEYS?.USUARIO || 'usuario');
        
        // Solo redirigir si no estamos en una página de auth
        const isAuthPage = window.location.pathname.includes('login') || 
                          window.location.pathname.includes('registro');
        
        if (!isAuthPage && window.toastManager) {
            window.toastManager.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        }
    }

    /**
     * ========================================
     * MÉTODOS HTTP BÁSICOS - CORREGIDOS
     * ========================================
     */

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    async post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    // ✅ CORREGIDO: Cambiar 'url' por 'endpoint'
    async put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    async patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Sube un archivo
     */
    async uploadFile(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const token = this.getAuthToken();
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    error: data.error || data.mensaje || 'Error al subir archivo',
                    data: data
                };
            }

            return {
                success: true,
                status: response.status,
                data: data
            };

        } catch (error) {
            console.error('💥 Error al subir archivo:', error);
            return this.handleRequestError(error);
        }
    }

    /**
     * ========================================
     * ENDPOINTS ESPECÍFICOS DE SPEAKLEXI
     * ========================================
     */

    // 🔐 MÓDULO 1: AUTENTICACIÓN Y USUARIOS
    async login(credentials) {
        const endpoint = this.config.ENDPOINTS?.AUTH?.LOGIN || '/auth/login';
        return this.post(endpoint, credentials);
    }

    async registro(userData) {
        const endpoint = this.config.ENDPOINTS?.AUTH?.REGISTRO || '/auth/registro';
        return this.post(endpoint, userData);
    }

    async verificarEmail(codigo, correo) {
        const endpoint = this.config.ENDPOINTS?.AUTH?.VERIFICAR_EMAIL || '/auth/verificar-email';
        return this.post(endpoint, { codigo, correo });
    }

    async reenviarCodigo(correo) {
        const endpoint = this.config.ENDPOINTS?.AUTH?.REENVIAR_CODIGO || '/auth/reenviar-codigo';
        return this.post(endpoint, { correo });
    }

    async recuperarPassword(correo) {
        const endpoint = this.config.ENDPOINTS?.AUTH?.RECUPERAR_PASSWORD || '/auth/recuperar-contrasena';
        return this.post(endpoint, { correo });
    }

    async restablecerPassword(token, nuevaPassword) {
        const endpoint = this.config.ENDPOINTS?.AUTH?.RESTABLECER_PASSWORD || '/auth/restablecer-contrasena';
        return this.post(endpoint, { token, nuevaPassword });
    }

    async logout() {
        const endpoint = this.config.ENDPOINTS?.AUTH?.LOGOUT || '/auth/logout';
        const result = await this.post(endpoint);
        
        // Limpiar localStorage independientemente del resultado
        this.setAuthToken(null);
        localStorage.removeItem(this.storageConfig.KEYS?.USUARIO || 'usuario');
        
        return result;
    }

    // 👤 MÓDULO 1: GESTIÓN DE PERFIL
    async getPerfil() {
        const endpoint = this.config.ENDPOINTS?.USUARIO?.PERFIL || '/usuario/perfil';
        return this.get(endpoint);
    }

    async actualizarPerfil(data) {
        const endpoint = this.config.ENDPOINTS?.USUARIO?.ACTUALIZAR_PERFIL || '/usuario/perfil';
        return this.put(endpoint, data);
    }

    async cambiarPassword(data) {
        const endpoint = this.config.ENDPOINTS?.USUARIO?.CAMBIAR_PASSWORD || '/usuario/cambiar-contrasena';
        return this.post(endpoint, data);
    }

    async cambiarIdioma(idioma) {
        const endpoint = this.config.ENDPOINTS?.USUARIO?.CAMBIAR_IDIOMA || '/usuario/cambiar-idioma';
        return this.post(endpoint, { idioma });
    }

    async getEstadisticas() {
        const endpoint = this.config.ENDPOINTS?.USUARIO?.ESTADISTICAS || '/usuario/estadisticas';
        return this.get(endpoint);
    }

    // 📚 MÓDULO 2: LECCIONES Y CONTENIDO
    async listarLecciones() {
        const endpoint = this.config.ENDPOINTS?.LECCIONES?.LISTAR || '/lecciones';
        return this.get(endpoint);
    }

    async getLeccion(id) {
        const endpoint = (this.config.ENDPOINTS?.LECCIONES?.DETALLE || '/lecciones/:id').replace(':id', id);
        return this.get(endpoint);
    }

    async crearLeccion(datos) {
        const endpoint = this.config.ENDPOINTS?.LECCIONES?.CREAR || '/lecciones';
        return this.post(endpoint, datos);
    }

    async actualizarLeccion(id, datos) {
        const endpoint = (this.config.ENDPOINTS?.LECCIONES?.ACTUALIZAR || '/lecciones/:id').replace(':id', id);
        return this.put(endpoint, datos);
    }

    async eliminarLeccion(id) {
        const endpoint = (this.config.ENDPOINTS?.LECCIONES?.ELIMINAR || '/lecciones/:id').replace(':id', id);
        return this.delete(endpoint);
    }

    async iniciarLeccion(id) {
        const endpoint = (this.config.ENDPOINTS?.LECCIONES?.INICIAR || '/lecciones/:id/iniciar').replace(':id', id);
        return this.post(endpoint);
    }

    async completarLeccion(id) {
        const endpoint = (this.config.ENDPOINTS?.LECCIONES?.COMPLETAR || '/lecciones/:id/completar').replace(':id', id);
        return this.post(endpoint);
    }

    // 🎯 MÓDULO 3: APRENDIZAJE Y GAMIFICACIÓN
    async registrarProgreso(data) {
        const endpoint = this.config.ENDPOINTS?.PROGRESO?.REGISTRAR || '/progreso/registrar';
        return this.post(endpoint, data);
    }

    async getProgresoLeccion(leccionId) {
        const endpoint = (this.config.ENDPOINTS?.PROGRESO?.LECCION || '/progreso/leccion/:id').replace(':id', leccionId);
        return this.get(endpoint);
    }

    async getRankingGlobal() {
        const endpoint = this.config.ENDPOINTS?.GAMIFICACION?.RANKING_GLOBAL || '/gamificacion/ranking/global';
        return this.get(endpoint);
    }

    async getLogros() {
        const endpoint = this.config.ENDPOINTS?.GAMIFICACION?.LOGROS || '/gamificacion/logros';
        return this.get(endpoint);
    }

    // 📊 MÓDULO 4: ESTADÍSTICAS Y RETROALIMENTACIÓN
    async getEstadisticasAlumno(id) {
        const endpoint = (this.config.ENDPOINTS?.ESTADISTICAS?.ALUMNO || '/estadisticas/alumno/:id').replace(':id', id);
        return this.get(endpoint);
    }

    async getEstadisticasGenerales() {
        const endpoint = this.config.ENDPOINTS?.ESTADISTICAS?.GENERALES || '/estadisticas/generales';
        return this.get(endpoint);
    }

    // 🔧 MÓDULO 5: REPORTES Y MANTENIMIENTO
    async crearReporteFalla(data) {
        const endpoint = this.config.ENDPOINTS?.REPORTES?.CREAR || '/reportes/fallas/crear';
        return this.post(endpoint, data);
    }

    async listarReportes() {
        const endpoint = this.config.ENDPOINTS?.REPORTES?.LISTAR || '/reportes/fallas';
        return this.get(endpoint);
    }

    // 🎬 MÓDULO 6: MULTIMEDIA
    async subirMultimedia(formData) {
        const endpoint = this.config.ENDPOINTS?.MULTIMEDIA?.SUBIR || '/multimedia/subir';
        return this.uploadFile(endpoint, formData);
    }

    async obtenerMultimediaLeccion(leccionId) {
        const endpoint = (this.config.ENDPOINTS?.MULTIMEDIA?.POR_LECCION || '/multimedia/leccion/:id').replace(':id', leccionId);
        return this.get(endpoint);
    }

    async eliminarMultimedia(id) {
        const endpoint = (this.config.ENDPOINTS?.MULTIMEDIA?.ELIMINAR || '/multimedia/:id').replace(':id', id);
        return this.delete(endpoint);
    }

    /**
     * Verifica el estado del servidor
     */
    async healthCheck() {
        const endpoint = this.config.ENDPOINTS?.HEALTH || '/health';
        return this.get(endpoint);
    }

    /**
     * Obtiene configuración del servidor
     */
    async getServerConfig() {
        const endpoint = this.config.ENDPOINTS?.CONFIG || '/config';
        return this.get(endpoint);
    }

    /**
     * Verifica si el usuario está autenticado
     */
    async verificarAutenticacion() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return { autenticado: false };
            }
            
            const resultado = await this.getPerfil();
            return {
                autenticado: resultado.success,
                usuario: resultado.data
            };
        } catch (error) {
            return { autenticado: false };
        }
    }
}

// Crear instancia global automáticamente lo antes posible
function inicializarClienteGlobal(force = false) {
    try {
        if (!window.apiClient || force) {
            window.apiClient = new APIClient();
        }
    } catch (error) {
        console.error('💥 No se pudo inicializar APIClient:', error);
    }
}

// Inicializar inmediatamente para que ModuleLoader no quede esperando
inicializarClienteGlobal();

// Reintentar al completar el DOM por si alguna dependencia faltaba
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => inicializarClienteGlobal(true));
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}