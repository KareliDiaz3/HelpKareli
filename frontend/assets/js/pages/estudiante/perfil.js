/* ============================================
   SPEAKLEXI - PERFIL DEL ESTUDIANTE
   Archivo: assets/js/pages/estudiante/perfil.js
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
        moduleName: 'Perfil Estudiante',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => {
            console.error('💥 Error al cargar perfil:', error);
            window.ModuleLoader.showModuleError(
                'Error al cargar el perfil. Por favor recarga la página.'
            );
        }
    });

    if (!inicializado) return;

    // ============================================
    // 2. FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
    // ============================================
    async function inicializarModulo() {
        console.log('✅ Perfil estudiante listo');

        // ===================================
        // CONFIGURACIÓN DESDE APP_CONFIG
        // ===================================
        const config = {
            API: window.APP_CONFIG.API,
            ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS,
            STORAGE: window.APP_CONFIG.STORAGE.KEYS,
            VALIDATION: window.APP_CONFIG.VALIDATION,
            UI: window.APP_CONFIG.UI,
            ROLES: window.APP_CONFIG.ROLES
        };
        const endpoints = config.ENDPOINTS.AUTH;

        // ===================================
        // ELEMENTOS DEL DOM
        // ===================================
        const elementos = {
            // Formularios
            personalInfoForm: document.getElementById('personal-info-form'),
            
            // Campos de información personal
            nombreInput: document.getElementById('nombre'),
            apellidosInput: document.getElementById('apellidos'),
            emailInput: document.getElementById('email'),
            telefonoInput: document.getElementById('telefono'),
            
            // Campos de contraseña
            // Información académica
            idiomaDisplay: document.getElementById('idioma-display'),
            nivelDisplay: document.getElementById('nivel-display'),

            // Botones
            savePersonalBtn: document.getElementById('save-personal-btn'),
            deactivateBtn: document.getElementById('deactivate-btn'),
            deleteBtn: document.getElementById('delete-btn'),
            
            // Modales
            deactivateModal: document.getElementById('deactivate-modal'),
            deleteModal: document.getElementById('delete-modal'),
            deleteConfirmationInput: document.getElementById('delete-confirmation-input'),
            confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
            
            // Foto de perfil
            profilePhoto: document.getElementById('profile-photo'),
            photoInput: document.getElementById('photo-input')
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
        }

        function deshabilitarFormularios(deshabilitar = true) {
            const botones = [elementos.savePersonalBtn];
            botones.forEach(btn => {
                if (btn) btn.disabled = deshabilitar;
            });
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
                window.toastManager.error('Debes iniciar sesión para acceder al perfil');
                setTimeout(() => {
                    window.location.href = config.UI.RUTAS.LOGIN;
                }, 1500);
                return false;
            }
            return true;
        }

        /**
         * Configura todos los event listeners
         */
        function configurarEventListeners() {
            // Formulario de información personal
            elementos.personalInfoForm?.addEventListener('submit', manejarGuardarInformacionPersonal);
            
            // Gestión de cuenta
            elementos.deactivateBtn?.addEventListener('click', mostrarModalDesactivar);
            elementos.deleteBtn?.addEventListener('click', mostrarModalEliminar);
            
            // Modales
            document.getElementById('cancel-deactivate-btn')?.addEventListener('click', ocultarModalDesactivar);
            document.getElementById('confirm-deactivate-btn')?.addEventListener('click', manejarDesactivarCuenta);
            document.getElementById('cancel-delete-btn')?.addEventListener('click', ocultarModalEliminar);
            elementos.deleteConfirmationInput?.addEventListener('input', validarConfirmacionEliminar);
            elementos.confirmDeleteBtn?.addEventListener('click', manejarEliminarCuenta);
            
            // Foto de perfil
            elementos.photoInput?.addEventListener('change', manejarCambioFoto);
            
            // Logout
            document.addEventListener('click', (e) => {
                if (e.target.closest('#logout-btn')) {
                    manejarLogout();
                }
            });
        }

        /**
         * Carga los datos del usuario
         */
        async function cargarDatosUsuario() {
            if (estado.isLoading) return;

            mostrarCargando(true);

            try {
                // ✅ USAR apiClient PARA CARGAR DATOS DEL PERFIL
                const response = await window.apiClient.get(endpoints.PERFIL);

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
                    window.toastManager.error('Error al cargar datos del perfil');
                }
            } finally {
                mostrarCargando(false);
            }
        }

        /**
         * Obtiene datos de fallback desde localStorage
         */
        function obtenerDatosFallback() {
            return {
                usuario: estado.usuario,
                datos_estudiante: {
                    idioma_aprendizaje: estado.usuario?.idioma || 'Inglés',
                    nivel_actual: estado.usuario?.nivel_actual || 'A1'
                }
            };
        }

        function obtenerNombreSeparado(usuario) {
            if (!usuario) {
                return { nombre: '', apellidos: '' };
            }
            if (usuario.nombre || usuario.primer_apellido) {
                return {
                    nombre: usuario.nombre || '',
                    apellidos: `${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim()
                };
            }
            const completo = (usuario.nombre_completo || '').trim();
            if (!completo) {
                return { nombre: '', apellidos: '' };
            }
            const partes = completo.split(' ');
            const nombre = partes.shift() || '';
            const apellidos = partes.join(' ');
            return { nombre, apellidos };
        }

        /**
         * Actualiza la interfaz con los datos del usuario
         */
        function actualizarUI() {
            if (!estado.datosPerfil) return;

            const { usuario, datos_estudiante } = estado.datosPerfil;

            // Información personal
            const nombresSeparados = obtenerNombreSeparado(usuario);
            if (elementos.nombreInput) elementos.nombreInput.value = nombresSeparados.nombre;
            if (elementos.apellidosInput) elementos.apellidosInput.value = nombresSeparados.apellidos;
            if (elementos.emailInput) elementos.emailInput.value = usuario?.correo || '';
            if (elementos.telefonoInput) elementos.telefonoInput.value = usuario?.telefono || '';

            // Información académica
            if (elementos.idiomaDisplay) elementos.idiomaDisplay.textContent = datos_estudiante?.idioma_aprendizaje || '-';
            if (elementos.nivelDisplay) elementos.nivelDisplay.textContent = datos_estudiante?.nivel_actual || '-';

            // Foto de perfil
            actualizarFotoPerfil(usuario);

            progressStore?.setProfile({
                nombre: elementos.nombreInput?.value,
                apellidos: elementos.apellidosInput?.value,
                correo: elementos.emailInput?.value,
                idioma: elementos.idiomaDisplay?.textContent,
                nivel: elementos.nivelDisplay?.textContent
            });
        }

        /**
         * Actualiza la foto de perfil
         */
        function actualizarFotoPerfil(usuario) {
            if (!elementos.profilePhoto) return;

            if (usuario?.foto_perfil && usuario.foto_perfil !== 'default-avatar.png') {
                elementos.profilePhoto.src = usuario.foto_perfil;
            } else {
                const nombreCompleto = `${usuario?.nombre || 'Usuario'} ${usuario?.primer_apellido || ''}`;
                elementos.profilePhoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=9333ea&color=fff&size=128`;
            }
        }

        /**
         * Maneja el guardado de información personal
         */
        async function manejarGuardarInformacionPersonal(e) {
            e.preventDefault();
            
            if (estado.isLoading) return;

            mostrarCargando(true);
            deshabilitarFormularios(true);
            
            if (elementos.savePersonalBtn) {
                elementos.savePersonalBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
            }

            try {
                const datosActualizados = {
                    nombre: elementos.nombreInput?.value.trim() || '',
                    primer_apellido: elementos.apellidosInput?.value.split(' ')[0] || '',
                    segundo_apellido: elementos.apellidosInput?.value.split(' ').slice(1).join(' ') || null,
                    telefono: elementos.telefonoInput?.value.trim() || null
                };

                // ✅ USAR apiClient PARA ACTUALIZAR PERFIL
                const response = await window.apiClient.put(endpoints.ACTUALIZAR_PERFIL, datosActualizados);

                if (response.success) {
                    window.toastManager.success('Información actualizada correctamente');

                    // Actualizar datos locales
                    if (response.data.usuario) {
                        estado.datosPerfil.usuario = { ...estado.datosPerfil.usuario, ...response.data.usuario };
                        window.Utils.saveToStorage(config.STORAGE.USUARIO, estado.datosPerfil.usuario);
                        progressStore?.setProfile({
                            nombre: estado.datosPerfil.usuario.nombre,
                            apellidos: `${estado.datosPerfil.usuario.primer_apellido || ''} ${estado.datosPerfil.usuario.segundo_apellido || ''}`.trim(),
                            correo: estado.datosPerfil.usuario.correo,
                            idioma: elementos.idiomaDisplay?.textContent,
                            nivel: elementos.nivelDisplay?.textContent
                        });
                    }
                } else {
                    throw new Error(response.error || 'Error al actualizar la información');
                }

            } catch (error) {
                console.error('💥 Error al guardar información:', error);
                window.toastManager.error(error.message);
            } finally {
                mostrarCargando(false);
                deshabilitarFormularios(false);
                
                if (elementos.savePersonalBtn) {
                    elementos.savePersonalBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';
                }
            }
        }

        /**
         * Maneja el cambio de foto de perfil
         */
        async function manejarCambioFoto(e) {
            const archivo = e.target.files[0];
            if (!archivo) return;

            // Validar tipo y tamaño
            const tiposPermitidos = ['image/jpeg', 'image/png'];
            const tamañoMaximo = 5 * 1024 * 1024; // 5MB

            if (!tiposPermitidos.includes(archivo.type)) {
                window.toastManager.error('Solo se permiten archivos JPG y PNG');
                return;
            }

            if (archivo.size > tamañoMaximo) {
                window.toastManager.error('El archivo no debe superar los 5MB');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('foto_perfil', archivo);

                // ✅ USAR apiClient PARA SUBIR FOTO
                const uploadEndpoint = config.ENDPOINTS.USUARIO?.SUBIR_FOTO || endpoints.SUBIR_FOTO;

                if (!uploadEndpoint) {
                    window.toastManager.error('No hay endpoint configurado para subir la foto de perfil.');
                    return;
                }

                const response = await window.apiClient.uploadFile(uploadEndpoint, formData);

                if (response.success) {
                    window.toastManager.success('Foto de perfil actualizada correctamente');
                    
                    // Actualizar imagen en tiempo real
                    if (response.data.foto_perfil && elementos.profilePhoto) {
                        elementos.profilePhoto.src = response.data.foto_perfil;
                        
                        // Actualizar datos locales
                        if (estado.datosPerfil.usuario) {
                            estado.datosPerfil.usuario.foto_perfil = response.data.foto_perfil;
                            window.Utils.saveToStorage(config.STORAGE.USUARIO, estado.datosPerfil.usuario);
                        }
                    }
                } else {
                    throw new Error(response.error || 'Error al subir la foto');
                }

            } catch (error) {
                console.error('💥 Error al cambiar foto:', error);
                window.toastManager.error(error.message);
            }
        }

        // ===================================
        // GESTIÓN DE CUENTA (DESACTIVAR/ELIMINAR)
        // ===================================

        function mostrarModalDesactivar() {
            if (elementos.deactivateModal) {
                elementos.deactivateModal.classList.remove('hidden');
            }
        }

        function ocultarModalDesactivar() {
            if (elementos.deactivateModal) {
                elementos.deactivateModal.classList.add('hidden');
            }
        }

        function mostrarModalEliminar() {
            if (elementos.deleteModal) {
                elementos.deleteModal.classList.remove('hidden');
            }
        }

        function ocultarModalEliminar() {
            if (elementos.deleteModal) {
                elementos.deleteModal.classList.add('hidden');
            }
            if (elementos.deleteConfirmationInput) {
                elementos.deleteConfirmationInput.value = '';
            }
            if (elementos.confirmDeleteBtn) {
                elementos.confirmDeleteBtn.disabled = true;
            }
        }

        function validarConfirmacionEliminar(e) {
            if (elementos.confirmDeleteBtn) {
                elementos.confirmDeleteBtn.disabled = e.target.value !== 'ELIMINAR';
            }
        }

        async function manejarDesactivarCuenta() {
            const btn = document.getElementById('confirm-deactivate-btn');
            if (!btn) return;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Desactivando...';

            try {
                // ✅ USAR apiClient PARA DESACTIVAR CUENTA
                const response = await window.apiClient.post(endpoints.DESACTIVAR_CUENTA);

                if (response.success) {
                    const limite = response.reactivar_hasta ? new Date(response.reactivar_hasta) : null;
                    const mensaje = limite
                        ? `Cuenta desactivada. Puedes reactivarla hasta el ${limite.toLocaleDateString()}.`
                        : 'Cuenta desactivada. Tienes 30 días para reactivarla.';

                    window.toastManager.success(mensaje);
                    ocultarModalDesactivar();

                    setTimeout(() => {
                        window.Utils.clearStorage();
                        window.location.href = config.UI.RUTAS.LOGIN;
                    }, 2000);
                } else {
                    throw new Error(response.error || 'Error al desactivar la cuenta');
                }

            } catch (error) {
                console.error('💥 Error al desactivar cuenta:', error);
                window.toastManager.error(error.message);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-pause mr-2"></i>Sí, Desactivar Mi Cuenta';
            }
        }

        async function manejarEliminarCuenta() {
            const btn = document.getElementById('confirm-delete-btn');
            if (!btn) return;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Eliminando...';

            try {
                // ✅ USAR apiClient PARA ELIMINAR CUENTA
                const response = await window.apiClient.delete(endpoints.ELIMINAR_CUENTA);

                if (response.success) {
                    const limite = response.reactivar_hasta ? new Date(response.reactivar_hasta) : null;
                    const mensaje = limite
                        ? `Cuenta marcada para eliminación. Puedes revertirla iniciando sesión antes del ${limite.toLocaleDateString()}.`
                        : 'Cuenta marcada para eliminación. Tienes 30 días para reactivarla iniciando sesión nuevamente.';

                    window.toastManager.success(mensaje);
                    ocultarModalEliminar();

                    setTimeout(() => {
                        window.Utils.clearStorage();
                        window.location.href = config.UI.RUTAS.LOGIN;
                    }, 2000);
                } else {
                    throw new Error(response.error || 'Error al eliminar la cuenta');
                }

            } catch (error) {
                console.error('💥 Error al eliminar cuenta:', error);
                window.toastManager.error(error.message);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-trash mr-2"></i>Sí, Eliminar Permanentemente';
            }
        }

        /**
         * Maneja el cierre de sesión
         */
        function manejarLogout() {
            window.Utils.removeFromStorage(config.STORAGE.USUARIO);
            window.Utils.removeFromStorage(config.STORAGE.TOKEN);
            
            window.toastManager.success('Sesión cerrada correctamente');
            
            setTimeout(() => {
                window.location.href = config.UI.RUTAS.LOGIN;
            }, 1000);
        }

        // ===================================
        // INICIALIZACIÓN
        // ===================================
        
        function inicializar() {
            if (!verificarAutenticacion()) {
                return;
            }

            configurarEventListeners();
            cargarDatosUsuario();

            if (window.APP_CONFIG.ENV.DEBUG) {
                console.log('🔧 Perfil configurado:', { config, estado, elementos });
            }
        }

        // Ejecutar inicialización
        inicializar();
    }

})();