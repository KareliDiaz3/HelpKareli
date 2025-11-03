/* ============================================
   SPEAKLEXI - GESTIÓN DE LECCIONES (ADMIN)
   Archivo: assets/js/pages/admin/gestion-lecciones.js
   ============================================ */

(() => {
    'use strict';

    // ============================================
    // 1. VERIFICACIÓN DE DEPENDENCIAS
    // ============================================
    const requiredDependencies = [
        'APP_CONFIG',
        'apiClient', 
        'formValidator',
        'toastManager'
    ];

    for (const dep of requiredDependencies) {
        if (!window[dep]) {
            console.error(`❌ ${dep} no está cargado`);
            return;
        }
    }

    console.log('✅ Módulo Gestión de Lecciones inicializado');

    // ============================================
    // 2. CONFIGURACIÓN
    // ============================================
    const config = {
        API: window.APP_CONFIG.API,
        ENDPOINTS: window.APP_CONFIG.LEARNING.LECCIONES,
        STORAGE: window.APP_CONFIG.STORAGE.KEYS,
        VALIDATION: window.APP_CONFIG.VALIDATION.LECCION,
        UI: window.APP_CONFIG.UI
    };

    // ============================================
    // 3. ELEMENTOS DEL DOM
    // ============================================
    const elementos = {
        // Filtros
        filtroNivel: document.getElementById('filtro-nivel'),
        filtroIdioma: document.getElementById('filtro-idioma'),
        filtroEstado: document.getElementById('filtro-estado'),
        
        // Botones
        btnCrearLeccion: document.getElementById('btn-crear-leccion'),
        
        // Estados
        loadingLecciones: document.getElementById('loading-lecciones'),
        emptyLecciones: document.getElementById('empty-lecciones'),
        tablaLecciones: document.getElementById('tabla-lecciones'),
        leccionesBody: document.getElementById('lecciones-body'),
        
        // Paginación
        paginacionLecciones: document.getElementById('paginacion-lecciones'),
        paginacionDesde: document.getElementById('paginacion-desde'),
        paginacionHasta: document.getElementById('paginacion-hasta'),
        paginacionTotal: document.getElementById('paginacion-total'),
        btnPaginaAnterior: document.getElementById('btn-pagina-anterior'),
        btnPaginaSiguiente: document.getElementById('btn-pagina-siguiente'),
        
        // Modal
        modalLeccion: document.getElementById('modal-leccion'),
        modalTitulo: document.getElementById('modal-titulo'),
        formLeccion: document.getElementById('form-leccion'),
        btnCancelarModal: document.getElementById('btn-cancelar-modal'),
        btnGuardarLeccion: document.getElementById('btn-guardar-leccion')
    };

    // ============================================
    // 4. ESTADO DE LA APLICACIÓN
    // ============================================
    const estado = {
        lecciones: [],
        paginacion: {
            paginaActual: 1,
            limite: 10,
            total: 0,
            totalPaginas: 0
        },
        filtros: {
            nivel: '',
            idioma: '',
            estado: 'activa'
        },
        modoEdicion: false,
        leccionEditando: null,
        isLoading: false
    };

    // ============================================
    // 5. FUNCIONES PRINCIPALES
    // ============================================

    /**
     * Inicializa el módulo
     */
    function init() {
        setupEventListeners();
        cargarLecciones();
        
        if (window.APP_CONFIG.ENV.DEBUG) {
            console.log('🔧 Gestión de Lecciones lista:', { config, elementos });
        }
    }

    /**
     * Configura todos los event listeners
     */
    function setupEventListeners() {
        // Filtros
        elementos.filtroNivel?.addEventListener('change', manejarCambioFiltro);
        elementos.filtroIdioma?.addEventListener('change', manejarCambioFiltro);
        elementos.filtroEstado?.addEventListener('change', manejarCambioFiltro);
        
        // Botones principales
        elementos.btnCrearLeccion?.addEventListener('click', mostrarModalCrear);
        
        // Modal
        elementos.btnCancelarModal?.addEventListener('click', ocultarModal);
        elementos.btnGuardarLeccion?.addEventListener('click', manejarGuardarLeccion);
        
        // Paginación
        elementos.btnPaginaAnterior?.addEventListener('click', irPaginaAnterior);
        elementos.btnPaginaSiguiente?.addEventListener('click', irPaginaSiguiente);
        
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ocultarModal();
        });
    }

    /**
     * Maneja cambios en los filtros
     */
    function manejarCambioFiltro() {
        estado.filtros = {
            nivel: elementos.filtroNivel.value,
            idioma: elementos.filtroIdioma.value,
            estado: elementos.filtroEstado.value
        };
        
        estado.paginacion.paginaActual = 1;
        cargarLecciones();
    }

    /**
     * Carga las lecciones desde la API
     */
    async function cargarLecciones() {
        if (estado.isLoading) return;
        
        try {
            estado.isLoading = true;
            mostrarLoading(true);
            ocultarTabla();

            const params = new URLSearchParams({
                pagina: estado.paginacion.paginaActual,
                limite: estado.paginacion.limite,
                ...estado.filtros
            });

            // Si hay filtro de nivel, usar endpoint específico
            let endpoint;
            if (estado.filtros.nivel) {
                endpoint = config.ENDPOINTS.POR_NIVEL.replace(':nivel', estado.filtros.nivel) + `?${params}`;
            } else {
                endpoint = config.ENDPOINTS.LISTAR + `?${params}`;
            }

            const response = await window.apiClient.get(endpoint);

            if (response.success) {
                estado.lecciones = response.data.lecciones || [];
                estado.paginacion = {
                    ...estado.paginacion,
                    total: response.data.paginacion?.total || 0,
                    totalPaginas: response.data.paginacion?.totalPaginas || 0
                };
                
                actualizarUI();
            } else {
                window.toastManager.error('Error al cargar las lecciones');
            }

        } catch (error) {
            manejarError('Error de conexión al cargar lecciones', error);
        } finally {
            estado.isLoading = false;
            mostrarLoading(false);
        }
    }

    /**
     * Actualiza la UI según el estado actual
     */
    function actualizarUI() {
        // Mostrar estado correspondiente
        if (estado.lecciones.length === 0) {
            mostrarEmptyState();
        } else {
            mostrarTabla();
            renderizarLecciones();
            actualizarPaginacion();
        }
    }

    /**
     * Renderiza las lecciones en la tabla
     */
    function renderizarLecciones() {
        elementos.leccionesBody.innerHTML = '';

        estado.lecciones.forEach(leccion => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${escapeHtml(leccion.titulo)}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">${escapeHtml(leccion.descripcion || 'Sin descripción')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        ${leccion.nivel}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${leccion.idioma}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${leccion.duracion_minutos} min
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span class="inline-flex items-center gap-1">
                        <i class="fas ${leccion.total_multimedia > 0 ? 'fa-check text-green-500' : 'fa-times text-red-500'}"></i>
                        ${leccion.total_multimedia || 0} archivos
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        leccion.estado === 'activa' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }">
                        ${leccion.estado === 'activa' ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 editar-leccion" data-id="${leccion.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 eliminar-leccion" data-id="${leccion.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <a href="/pages/admin/gestion-multimedia.html?leccion_id=${leccion.id}" 
                           class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                           title="Gestionar Multimedia">
                            <i class="fas fa-file-video"></i>
                        </a>
                    </div>
                </td>
            `;
            
            elementos.leccionesBody.appendChild(fila);
        });

        // Agregar event listeners a los botones de acción
        document.querySelectorAll('.editar-leccion').forEach(btn => {
            btn.addEventListener('click', () => editarLeccion(btn.dataset.id));
        });

        document.querySelectorAll('.eliminar-leccion').forEach(btn => {
            btn.addEventListener('click', () => eliminarLeccion(btn.dataset.id));
        });
    }

    /**
     * Muestra el modal para crear lección
     */
    function mostrarModalCrear() {
        estado.modoEdicion = false;
        estado.leccionEditando = null;
        
        elementos.modalTitulo.textContent = 'Crear Lección';
        elementos.formLeccion.reset();
        elementos.leccionId.value = '';
        
        mostrarModal();
    }

    /**
     * Muestra el modal para editar lección
     */
    async function editarLeccion(id) {
        try {
            mostrarLoadingModal(true);
            
            const endpoint = config.ENDPOINTS.DETALLE.replace(':id', id);
            const response = await window.apiClient.get(endpoint);
            
            if (response.success) {
                const leccion = response.data.leccion;
                
                estado.modoEdicion = true;
                estado.leccionEditando = leccion;
                
                elementos.modalTitulo.textContent = 'Editar Lección';
                elementos.leccionId.value = leccion.id;
                elementos.titulo.value = leccion.titulo;
                elementos.descripcion.value = leccion.descripcion || '';
                elementos.nivel.value = leccion.nivel;
                elementos.idioma.value = leccion.idioma;
                elementos.duracion_minutos.value = leccion.duracion_minutos;
                elementos.orden.value = leccion.orden;
                elementos.contenido.value = leccion.contenido || '';
                
                mostrarModal();
            } else {
                window.toastManager.error('Error al cargar la lección');
            }
            
        } catch (error) {
            manejarError('Error al cargar lección para editar', error);
        } finally {
            mostrarLoadingModal(false);
        }
    }

    /**
     * Maneja el guardado de lección (crear o editar)
     */
    async function manejarGuardarLeccion() {
        if (estado.isLoading) return;
        
        const datos = obtenerDatosFormulario();
        const validacion = validarFormularioLeccion(datos);
        
        if (!validacion.esValido) {
            mostrarErroresFormulario(validacion.errores);
            return;
        }

        await guardarLeccion(datos);
    }

    /**
     * Guarda la lección en la API
     */
    async function guardarLeccion(datos) {
        try {
            estado.isLoading = true;
            mostrarLoadingModal(true);
            limpiarErroresFormulario();

            let endpoint, method;
            
            if (estado.modoEdicion) {
                endpoint = config.ENDPOINTS.ACTUALIZAR.replace(':id', estado.leccionEditando.id);
                method = 'PUT';
            } else {
                endpoint = config.ENDPOINTS.CREAR;
                method = 'POST';
            }

            const response = await window.apiClient[method.toLowerCase()](endpoint, datos);

            if (response.success) {
                window.toastManager.success(
                    estado.modoEdicion 
                        ? 'Lección actualizada exitosamente' 
                        : 'Lección creada exitosamente'
                );
                
                ocultarModal();
                cargarLecciones();
            } else {
                if (response.errores && response.errores.length > 0) {
                    const errores = {};
                    response.errores.forEach(error => {
                        errores[error.campo] = error.mensaje;
                    });
                    mostrarErroresFormulario(errores);
                } else {
                    window.toastManager.error(response.error || 'Error al guardar la lección');
                }
            }

        } catch (error) {
            manejarError('Error de conexión al guardar lección', error);
        } finally {
            estado.isLoading = false;
            mostrarLoadingModal(false);
        }
    }

    /**
     * Elimina una lección
     */
    async function eliminarLeccion(id) {
        const confirmacion = await window.toastManager.confirm(
            '¿Estás seguro de que quieres eliminar esta lección? Esta acción no se puede deshacer.'
        );
        
        if (!confirmacion) return;

        try {
            const endpoint = config.ENDPOINTS.ELIMINAR.replace(':id', id);
            const response = await window.apiClient.delete(endpoint);

            if (response.success) {
                window.toastManager.success('Lección eliminada exitosamente');
                cargarLecciones();
            } else {
                window.toastManager.error(response.error || 'Error al eliminar la lección');
            }

        } catch (error) {
            manejarError('Error de conexión al eliminar lección', error);
        }
    }

    // ============================================
    // 6. FUNCIONES DE VALIDACIÓN
    // ============================================

    /**
     * Obtiene datos del formulario
     */
    function obtenerDatosFormulario() {
        const formData = new FormData(elementos.formLeccion);
        const datos = {};
        
        for (const [key, value] of formData.entries()) {
            datos[key] = value.trim();
        }
        
        return datos;
    }

    /**
     * Valida el formulario de lección
     */
    function validarFormularioLeccion(datos) {
        const errores = {};
        
        // Validar título
        if (!datos.titulo) {
            errores.titulo = 'El título es requerido';
        } else if (datos.titulo.length < config.VALIDATION.TITULO_MIN) {
            errores.titulo = `El título debe tener al menos ${config.VALIDATION.TITULO_MIN} caracteres`;
        } else if (datos.titulo.length > config.VALIDATION.TITULO_MAX) {
            errores.titulo = `El título no debe exceder ${config.VALIDATION.TITULO_MAX} caracteres`;
        }
        
        // Validar nivel
        if (!datos.nivel) {
            errores.nivel = 'El nivel es requerido';
        }
        
        // Validar idioma
        if (!datos.idioma) {
            errores.idioma = 'El idioma es requerido';
        }
        
        // Validar duración
        if (datos.duracion_minutos) {
            const duracion = parseInt(datos.duracion_minutos);
            if (duracion < config.VALIDATION.DURACION_MIN || duracion > config.VALIDATION.DURACION_MAX) {
                errores.duracion_minutos = `La duración debe estar entre ${config.VALIDATION.DURACION_MIN} y ${config.VALIDATION.DURACION_MAX} minutos`;
            }
        }
        
        return {
            esValido: Object.keys(errores).length === 0,
            errores: errores
        };
    }

    // ============================================
    // 7. FUNCIONES DE UI/UX
    // ============================================

    function mostrarLoading(mostrar) {
        if (mostrar) {
            elementos.loadingLecciones.classList.remove('hidden');
            elementos.emptyLecciones.classList.add('hidden');
            elementos.tablaLecciones.classList.add('hidden');
            elementos.paginacionLecciones.classList.add('hidden');
        } else {
            elementos.loadingLecciones.classList.add('hidden');
        }
    }

    function mostrarLoadingModal(mostrar) {
        elementos.btnGuardarLeccion.disabled = mostrar;
        
        if (mostrar) {
            elementos.btnGuardarLeccion.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            elementos.btnGuardarLeccion.innerHTML = 'Guardar Lección';
        }
    }

    function mostrarEmptyState() {
        elementos.emptyLecciones.classList.remove('hidden');
        elementos.tablaLecciones.classList.add('hidden');
        elementos.paginacionLecciones.classList.add('hidden');
    }

    function mostrarTabla() {
        elementos.emptyLecciones.classList.add('hidden');
        elementos.tablaLecciones.classList.remove('hidden');
        elementos.paginacionLecciones.classList.remove('hidden');
    }

    function ocultarTabla() {
        elementos.tablaLecciones.classList.add('hidden');
        elementos.paginacionLecciones.classList.add('hidden');
    }

    function mostrarModal() {
        elementos.modalLeccion.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function ocultarModal() {
        elementos.modalLeccion.classList.add('hidden');
        document.body.style.overflow = 'auto';
        limpiarErroresFormulario();
    }

    function actualizarPaginacion() {
        const { paginaActual, limite, total } = estado.paginacion;
        const desde = (paginaActual - 1) * limite + 1;
        const hasta = Math.min(paginaActual * limite, total);
        
        elementos.paginacionDesde.textContent = desde;
        elementos.paginacionHasta.textContent = hasta;
        elementos.paginacionTotal.textContent = total;
        
        elementos.btnPaginaAnterior.disabled = paginaActual === 1;
        elementos.btnPaginaSiguiente.disabled = paginaActual === estado.paginacion.totalPaginas;
    }

    function irPaginaAnterior() {
        if (estado.paginacion.paginaActual > 1) {
            estado.paginacion.paginaActual--;
            cargarLecciones();
        }
    }

    function irPaginaSiguiente() {
        if (estado.paginacion.paginaActual < estado.paginacion.totalPaginas) {
            estado.paginacion.paginaActual++;
            cargarLecciones();
        }
    }

    function mostrarErroresFormulario(errores) {
        limpiarErroresFormulario();
        
        Object.entries(errores).forEach(([campo, mensaje]) => {
            const input = document.getElementById(campo);
            const errorElement = document.getElementById(`error-${campo}`);
            
            if (input && errorElement) {
                input.classList.add('border-red-500', 'focus:ring-red-500');
                errorElement.textContent = mensaje;
                errorElement.classList.remove('hidden');
            }
        });
        
        // Scroll al primer error
        const primerError = document.querySelector('.border-red-500');
        primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function limpiarErroresFormulario() {
        document.querySelectorAll('[id^="error-"]').forEach(el => {
            el.classList.add('hidden');
        });
        
        document.querySelectorAll('.border-red-500').forEach(el => {
            el.classList.remove('border-red-500', 'focus:ring-red-500');
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function manejarError(mensaje, error) {
        console.error('💥 Error:', error);
        
        if (window.APP_CONFIG.ENV.DEBUG) {
            console.trace();
        }
        
        window.toastManager.error(mensaje);
    }

    // ============================================
    // 8. INICIALIZACIÓN
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

})();