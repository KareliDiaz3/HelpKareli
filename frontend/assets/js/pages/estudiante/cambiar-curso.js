/* ============================================
   SPEAKLEXI - CAMBIAR CURSO Y NIVEL
   Archivo: assets/js/pages/estudiante/cambiar-curso.js
   Usa: APP_CONFIG, apiClient, formValidator, toastManager, Utils
   ============================================ */

(async () => {
    'use strict';

    // ============================================
    // 1. ESPERAR DEPENDENCIAS CON MODULE LOADER
    // ============================================
    const dependencias = [
        'APP_CONFIG',
        'apiClient',
        'formValidator',
        'toastManager',
        'Utils',
        'ModuleLoader'
    ];

    const progressStore = window.StudentProgress || null;

    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Cambiar Curso',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => {
            console.error('💥 Error al cargar módulo de cambio de curso:', error);
            window.ModuleLoader.showModuleError(
                'Error al cargar el sistema de cambio de curso. Por favor recarga la página.'
            );
        }
    });

    if (!inicializado) return;

    // ============================================
    // 2. FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
    // ============================================
    async function inicializarModulo() {
        console.log('✅ Módulo Cambiar Curso listo');

        // ===================================
        // CONFIGURACIÓN DESDE APP_CONFIG
        // ===================================
        const config = {
            API: window.APP_CONFIG.API,
            ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS,
            STORAGE: window.APP_CONFIG.STORAGE.KEYS,
            VALIDATION: window.APP_CONFIG.VALIDATION,
            UI: window.APP_CONFIG.UI,
            ROLES: window.APP_CONFIG.ROLES,
            NIVELES: window.APP_CONFIG.NIVELES
        };

        // ===================================
        // ELEMENTOS DEL DOM
        // ===================================
        const elementos = {
            // Información actual
            currentIdioma: document.getElementById('current-idioma'),
            currentNivel: document.getElementById('current-nivel'),
            
            // Formulario
            changeCourseForm: document.getElementById('change-course-form'),
            submitBtn: document.getElementById('submit-btn'),
            
            // Radio buttons
            idiomaInputs: document.querySelectorAll('input[name="idioma"]'),
            nivelInputs: document.querySelectorAll('input[name="nivel"]')
        };

        // ===================================
        // ESTADO DE LA APLICACIÓN
        // ===================================
        const estado = {
            usuario: null,
            token: null,
            datosPerfil: null,
            isLoading: false
        };

        // ===================================
        // FUNCIONES AUXILIARES
        // ===================================
        
        function mostrarCargando(mostrar = true) {
            estado.isLoading = mostrar;
            elementos.submitBtn.disabled = mostrar;
            
            if (mostrar) {
                elementos.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
            } else {
                elementos.submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';
            }
        }

        // ===================================
        // FUNCIONES PRINCIPALES
        // ===================================

        /**
         * Verifica la autenticación del usuario
         */
        function verificarAutenticacion() {
            estado.usuario = window.Utils.getFromStorage(config.STORAGE.USUARIO);
            estado.token = window.Utils.getFromStorage(config.STORAGE.TOKEN);

            if (!estado.usuario || !estado.token) {
                window.toastManager.error('Debes iniciar sesión para acceder a esta página');
                setTimeout(() => {
                    window.location.href = config.UI.RUTAS.LOGIN;
                }, 1500);
                return false;
            }
            return true;
        }

        /**
         * Carga los datos actuales del usuario
         */
        async function cargarDatosActuales() {
            if (estado.isLoading) return;

            try {
                // ✅ USAR apiClient PARA CARGAR DATOS DEL PERFIL
                const response = await window.apiClient.get(config.ENDPOINTS.USUARIOS.PERFIL);

                if (response.success) {
                    estado.datosPerfil = response.data;
                    actualizarUI();
                } else {
                    throw new Error(response.error || 'Error al cargar datos del perfil');
                }

            } catch (error) {
                console.error('💥 Error al cargar datos:', error);
                
                // Usar datos del localStorage como fallback
                estado.datosPerfil = obtenerDatosFallback();
                actualizarUI();
                
                if (error.message.includes('Failed to fetch')) {
                    window.toastManager.warning('Usando datos locales. El servidor no está disponible.');
                } else {
                    window.toastManager.error('Error al cargar los datos actuales');
                }
            }
        }

        /**
         * Obtiene datos de fallback desde localStorage
         */
        function obtenerDatosFallback() {
            const snapshot = progressStore?.getSnapshot();
            return {
                usuario: estado.usuario,
                datos_estudiante: {
                    idioma_aprendizaje: snapshot?.idiomaActual || estado.usuario?.idioma || 'Inglés',
                    nivel_actual: snapshot?.nivelActual || estado.usuario?.nivel_actual || 'A1'
                }
            };
        }

        /**
         * Actualiza la interfaz con los datos del usuario
         */
        function actualizarUI() {
            if (!estado.datosPerfil) return;

            const { datos_estudiante } = estado.datosPerfil;

            // Actualizar información actual
            if (elementos.currentIdioma) {
                elementos.currentIdioma.textContent = datos_estudiante?.idioma_aprendizaje || '-';
            }
            if (elementos.currentNivel) {
                elementos.currentNivel.textContent = datos_estudiante?.nivel_actual || '-';
            }

            // Pre-seleccionar valores actuales
            const idiomaActual = datos_estudiante?.idioma_aprendizaje;
            const nivelActual = datos_estudiante?.nivel_actual;

            if (idiomaActual) {
                elementos.idiomaInputs.forEach(input => {
                    if (input.value === idiomaActual) {
                        input.checked = true;
                    }
                });
            }

            if (nivelActual) {
                elementos.nivelInputs.forEach(input => {
                    if (input.value === nivelActual) {
                        input.checked = true;
                    }
                });
            }
        }

        /**
         * Maneja el envío del formulario
         */
        async function manejarCambioCurso(e) {
            e.preventDefault();

            if (estado.isLoading) return;

            // Validar selecciones
            const idiomaSeleccionado = document.querySelector('input[name="idioma"]:checked');
            const nivelSeleccionado = document.querySelector('input[name="nivel"]:checked');

            if (!idiomaSeleccionado || !nivelSeleccionado) {
                window.toastManager.error('Por favor selecciona tanto el idioma como el nivel');
                return;
            }

            // Verificar si hay cambios reales
            const idiomaActual = estado.datosPerfil?.datos_estudiante?.idioma_aprendizaje;
            const nivelActual = estado.datosPerfil?.datos_estudiante?.nivel_actual;

            if (idiomaSeleccionado.value === idiomaActual && nivelSeleccionado.value === nivelActual) {
                window.toastManager.info('No hay cambios que guardar');
                return;
            }

            await actualizarCurso(idiomaSeleccionado.value, nivelSeleccionado.value);
        }

        /**
         * Actualiza el curso en el servidor
         */
        async function actualizarCurso(idioma, nivel) {
            mostrarCargando(true);

            try {
                console.log('📤 Actualizando curso...');

                const response = await window.apiClient.patch(config.ENDPOINTS.AUTH.ACTUALIZAR_NIVEL, {
                    correo: estado.usuario.correo,
                    nivel: nivel,
                    idioma: idioma
                });

                if (response.success) {
                    window.toastManager.success('¡Curso actualizado exitosamente!');
                } else {
                    throw new Error(response.error || 'Error al actualizar el curso');
                }

            } catch (error) {
                console.error('💥 Error al actualizar curso:', error);
                window.toastManager.warning('No pudimos sincronizar con el servidor, pero guardamos el cambio localmente.');
            } finally {
                aplicarCambioLocal(idioma, nivel);
                mostrarCargando(false);
                setTimeout(() => {
                    window.location.href = '/pages/estudiante/estudiante-dashboard.html';
                }, 1200);
            }
        }

        function aplicarCambioLocal(idioma, nivel) {
            if (estado.datosPerfil?.datos_estudiante) {
                estado.datosPerfil.datos_estudiante.idioma_aprendizaje = idioma;
                estado.datosPerfil.datos_estudiante.nivel_actual = nivel;
            }

            if (!estado.usuario.datos_estudiante) {
                estado.usuario.datos_estudiante = {};
            }
            estado.usuario.datos_estudiante.idioma_aprendizaje = idioma;
            estado.usuario.datos_estudiante.nivel_actual = nivel;
            window.Utils.saveToStorage(config.STORAGE.USUARIO, estado.usuario);
            progressStore?.changeCourse(idioma, nivel);
        }

        /**
         * Configura los event listeners
         */
        function configurarEventListeners() {
            elementos.changeCourseForm?.addEventListener('submit', manejarCambioCurso);
        }

        // ===================================
        // INICIALIZACIÓN
        // ===================================
        
        function inicializar() {
            if (!verificarAutenticacion()) {
                return;
            }

            configurarEventListeners();
            cargarDatosActuales();

            if (window.APP_CONFIG.ENV.DEBUG) {
                console.log('🔧 Cambiar Curso configurado:', { config, estado, elementos });
            }
        }

        // Ejecutar inicialización
        inicializar();
    }

})();