/* ============================================
   SPEAKLEXI - GESTIÓN DE RETROALIMENTACIÓN (PROFESOR)
   Archivo: assets/js/pages/profesor/retroalimentacion-profesor.js
   UC-14: Revisar retroalimentación
   ============================================ */

(async () => {
    'use strict';

    const dependencias = ['APP_CONFIG', 'apiClient', 'toastManager', 'formValidator', 'ModuleLoader'];
    
    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Retroalimentación Profesor',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => {
            console.error('Error inicializando módulo:', error);
            window.toastManager.error('Error al cargar el módulo de retroalimentación');
        }
    });

    if (!inicializado) return;

    async function inicializarModulo() {
        // CONFIGURACIÓN
        const config = {
            API: window.APP_CONFIG.API,
            ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS.RETROALIMENTACION
        };

        // ELEMENTOS DOM
        const elementos = {
            // Panel lateral - Lista de alumnos
            listaAlumnos: document.getElementById('lista-alumnos'),
            buscadorAlumnos: document.getElementById('buscador-alumnos'),
            
            // Panel principal - Retroalimentación del alumno seleccionado
            alumnoSeleccionadoNombre: document.getElementById('alumno-seleccionado-nombre'),
            alumnoSeleccionadoNivel: document.getElementById('alumno-seleccionado-nivel'),
            listaRetroalimentacionAlumno: document.getElementById('lista-retroalimentacion-alumno'),
            estadoVacioAlumno: document.getElementById('estado-vacio-alumno'),
            
            // Botones y modales
            btnNuevoComentario: document.getElementById('btn-nuevo-comentario'),
            modalCrear: document.getElementById('modal-crear'),
            formCrearComentario: document.getElementById('form-crear-comentario'),
            selectAlumnoModal: document.getElementById('select-alumno-modal'),
            selectLeccionModal: document.getElementById('select-leccion-modal'),
            textareaComentario: document.getElementById('textarea-comentario'),
            inputCalificacion: document.getElementById('input-calificacion'),
            selectTipo: document.getElementById('select-tipo'),
            btnEnviarComentario: document.getElementById('btn-enviar-comentario'),
            btnCancelarCrear: document.getElementById('btn-cancelar-crear'),
            
            // Estados
            loadingAlumnos: document.getElementById('loading-alumnos'),
            loadingRetroalimentacion: document.getElementById('loading-retroalimentacion')
        };

        // ESTADO
        let estado = {
            alumnos: [],
            alumnoSeleccionado: null,
            retroalimentaciones: [],
            lecciones: [],
            filtroBusqueda: ''
        };

        // FUNCIONES AUXILIARES
        function mostrarCargando(elemento, mostrar) {
            if (elemento) {
                elemento.classList.toggle('hidden', !mostrar);
            }
        }

        function mostrarModal(modal, mostrar) {
            if (modal) {
                modal.classList.toggle('hidden', !mostrar);
                if (mostrar) {
                    modal.classList.add('flex');
                    modal.classList.remove('hidden');
                } else {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            }
        }

        // DeepSeek: Cargar lista de alumnos del profesor
        async function cargarAlumnos() {
            try {
                mostrarCargando(elementos.loadingAlumnos, true);
                
                // En una implementación real, usaríamos el endpoint de profesores
                // const response = await window.apiClient.get(config.ENDPOINTS.PROFESOR_ALUMNOS);
                
                // Simulación de datos - reemplazar con llamada real
                estado.alumnos = [
                    {
                        id: 1,
                        nombre: 'Ana García López',
                        nivel: 'B1',
                        idioma: 'Inglés',
                        lecciones_completadas: 15,
                        xp_total: 1250,
                        avatar: 'AG'
                    },
                    {
                        id: 2,
                        nombre: 'Carlos Rodríguez',
                        nivel: 'A2',
                        idioma: 'Inglés',
                        lecciones_completadas: 8,
                        xp_total: 750,
                        avatar: 'CR'
                    },
                    {
                        id: 3,
                        nombre: 'María Fernández',
                        nivel: 'B2',
                        idioma: 'Inglés',
                        lecciones_completadas: 22,
                        xp_total: 2100,
                        avatar: 'MF'
                    }
                ];
                
                renderizarListaAlumnos(estado.alumnos);
                llenarSelectAlumnos(estado.alumnos);
                mostrarCargando(elementos.loadingAlumnos, false);
                
            } catch (error) {
                console.error('Error cargando alumnos:', error);
                mostrarCargando(elementos.loadingAlumnos, false);
                window.toastManager.error('Error al cargar la lista de alumnos');
            }
        }

        // DeepSeek: Renderizar lista de alumnos en el panel lateral
        function renderizarListaAlumnos(alumnos) {
            const alumnosFiltrados = alumnos.filter(alumno => 
                alumno.nombre.toLowerCase().includes(estado.filtroBusqueda.toLowerCase())
            );

            if (alumnosFiltrados.length === 0) {
                elementos.listaAlumnos.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-users text-3xl mb-2"></i>
                        <p>No se encontraron alumnos</p>
                    </div>
                `;
                return;
            }

            elementos.listaAlumnos.innerHTML = alumnosFiltrados.map(alumno => `
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    estado.alumnoSeleccionado?.id === alumno.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                }" data-alumno-id="${alumno.id}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${alumno.avatar}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-900 dark:text-white truncate">${alumno.nombre}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Nivel ${alumno.nivel} • ${alumno.lecciones_completadas} lecciones
                            </p>
                        </div>
                    </div>
                </div>
            `).join('');

            // Agregar event listeners a los alumnos
            document.querySelectorAll('[data-alumno-id]').forEach(element => {
                element.addEventListener('click', function() {
                    const alumnoId = parseInt(this.getAttribute('data-alumno-id'));
                    seleccionarAlumno(alumnoId);
                });
            });
        }

        // DeepSeek: Llenar select de alumnos en el modal
        function llenarSelectAlumnos(alumnos) {
            if (!elementos.selectAlumnoModal) return;
            
            elementos.selectAlumnoModal.innerHTML = `
                <option value="">Seleccionar alumno...</option>
                ${alumnos.map(alumno => `
                    <option value="${alumno.id}">${alumno.nombre} (Nivel ${alumno.nivel})</option>
                `).join('')}
            `;
        }

        // DeepSeek: Cargar retroalimentación de un alumno específico
        async function cargarRetroalimentacionAlumno(alumnoId) {
            try {
                mostrarCargando(elementos.loadingRetroalimentacion, true);
                
                // Simulación de datos - reemplazar con llamada real
                // const response = await window.apiClient.get(
                //     config.ENDPOINTS.POR_ALUMNO.replace(':id', alumnoId)
                // );
                
                estado.retroalimentaciones = [
                    {
                        id: 1,
                        leccion_id: 5,
                        leccion_titulo: 'Present Perfect Tense',
                        comentario: 'Excelente trabajo en los ejercicios de gramática. Has mostrado gran comprensión de los conceptos.',
                        calificacion: 9,
                        tipo: 'positiva',
                        fecha_creacion: '2025-11-08T10:30:00Z',
                        respuesta_alumno: '¡Gracias! Los ejercicios me parecieron muy útiles.',
                        fecha_respuesta: '2025-11-08T14:20:00Z'
                    },
                    {
                        id: 2,
                        leccion_id: 8,
                        leccion_titulo: 'Conversación Avanzada',
                        comentario: 'Buena participación, pero necesitas trabajar más en la pronunciación de las palabras compuestas.',
                        calificacion: 7,
                        tipo: 'neutra',
                        fecha_creacion: '2025-11-05T15:45:00Z',
                        respuesta_alumno: null,
                        fecha_respuesta: null
                    }
                ];
                
                renderizarRetroalimentacionAlumno(estado.retroalimentaciones);
                mostrarCargando(elementos.loadingRetroalimentacion, false);
                
            } catch (error) {
                console.error('Error cargando retroalimentación:', error);
                mostrarCargando(elementos.loadingRetroalimentacion, false);
                window.toastManager.error('Error al cargar la retroalimentación del alumno');
            }
        }

        // DeepSeek: Renderizar retroalimentación del alumno seleccionado
        function renderizarRetroalimentacionAlumno(retroalimentaciones) {
            if (retroalimentaciones.length === 0) {
                elementos.estadoVacioAlumno.classList.remove('hidden');
                elementos.listaRetroalimentacionAlumno.classList.add('hidden');
                return;
            }

            elementos.estadoVacioAlumno.classList.add('hidden');
            elementos.listaRetroalimentacionAlumno.classList.remove('hidden');

            elementos.listaRetroalimentacionAlumno.innerHTML = retroalimentaciones.map(retro => `
                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">${retro.leccion_titulo}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                ${new Date(retro.fecha_creacion).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                retro.tipo === 'positiva' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                retro.tipo === 'negativa' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }">
                                ${retro.tipo.charAt(0).toUpperCase() + retro.tipo.slice(1)}
                            </span>
                            ${retro.calificacion ? `
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                                    ${retro.calificacion}/10
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="prose dark:prose-invert max-w-none mb-4">
                        <p class="text-gray-700 dark:text-gray-300">${retro.comentario}</p>
                    </div>
                    
                    ${retro.respuesta_alumno ? `
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-primary-500">
                            <p class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Respuesta del alumno:</p>
                            <p class="text-gray-700 dark:text-gray-300">${retro.respuesta_alumno}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                ${new Date(retro.fecha_respuesta).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    ` : `
                        <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                            El alumno aún no ha respondido a este comentario.
                        </p>
                    `}
                    
                    <div class="flex justify-end gap-2 mt-4">
                        <button class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold"
                                onclick="editarComentario(${retro.id})">
                            <i class="fas fa-edit mr-1"></i>Editar
                        </button>
                        <button class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold"
                                onclick="eliminarComentario(${retro.id})">
                            <i class="fas fa-trash mr-1"></i>Eliminar
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // DeepSeek: Seleccionar alumno y cargar su retroalimentación
        async function seleccionarAlumno(alumnoId) {
            const alumno = estado.alumnos.find(a => a.id === alumnoId);
            if (!alumno) return;

            estado.alumnoSeleccionado = alumno;
            
            // Actualizar UI
            elementos.alumnoSeleccionadoNombre.textContent = alumno.nombre;
            elementos.alumnoSeleccionadoNivel.textContent = `Nivel ${alumno.nivel} • ${alumno.lecciones_completadas} lecciones`;
            
            // Remover selección anterior
            document.querySelectorAll('[data-alumno-id]').forEach(el => {
                el.classList.remove('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-200');
            });
            
            // Agregar selección actual
            document.querySelector(`[data-alumno-id="${alumnoId}"]`).classList.add('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-200');
            
            // Cargar retroalimentación
            await cargarRetroalimentacionAlumno(alumnoId);
        }

        // DeepSeek: Crear nuevo comentario para un alumno
        async function crearComentario(event) {
            event.preventDefault();
            
            // Validar formulario
            const valido = window.formValidator.validateForm(elementos.formCrearComentario);
            if (!valido) {
                window.toastManager.warning('Completa todos los campos requeridos');
                return;
            }

            const formData = new FormData(elementos.formCrearComentario);
            const datos = {
                alumno_id: parseInt(formData.get('alumno_id')),
                leccion_id: parseInt(formData.get('leccion_id')),
                comentario: formData.get('comentario'),
                calificacion: formData.get('calificacion') ? parseInt(formData.get('calificacion')) : null,
                tipo: formData.get('tipo')
            };

            try {
                // En una implementación real:
                // await window.apiClient.post(config.ENDPOINTS.CREAR, datos);
                
                window.toastManager.success('Comentario creado exitosamente');
                elementos.formCrearComentario.reset();
                mostrarModal(elementos.modalCrear, false);
                
                // Recargar retroalimentación si el alumno seleccionado es el mismo
                if (estado.alumnoSeleccionado && estado.alumnoSeleccionado.id === datos.alumno_id) {
                    await cargarRetroalimentacionAlumno(datos.alumno_id);
                }
                
            } catch (error) {
                console.error('Error creando comentario:', error);
                window.toastManager.error('Error al crear el comentario');
            }
        }

        // DeepSeek: Editar comentario existente
        async function editarComentario(retroId) {
            const retro = estado.retroalimentaciones.find(r => r.id === retroId);
            if (!retro) return;

            // En una implementación real, mostraríamos un modal de edición
            // con los datos precargados del comentario
            window.toastManager.info(`Editando comentario #${retroId} - Funcionalidad en desarrollo`);
        }

        // DeepSeek: Eliminar comentario
        async function eliminarComentario(retroId) {
            const confirmado = confirm('¿Estás seguro de que quieres eliminar este comentario?');
            if (!confirmado) return;

            try {
                // En una implementación real:
                // await window.apiClient.delete(config.ENDPOINTS.ELIMINAR.replace(':id', retroId));
                
                window.toastManager.success('Comentario eliminado exitosamente');
                
                // Recargar retroalimentación
                if (estado.alumnoSeleccionado) {
                    await cargarRetroalimentacionAlumno(estado.alumnoSeleccionado.id);
                }
                
            } catch (error) {
                console.error('Error eliminando comentario:', error);
                window.toastManager.error('Error al eliminar el comentario');
            }
        }

        // CONFIGURAR EVENT LISTENERS
        function configurarEventListeners() {
            // Búsqueda de alumnos
            if (elementos.buscadorAlumnos) {
                elementos.buscadorAlumnos.addEventListener('input', function(e) {
                    estado.filtroBusqueda = e.target.value;
                    renderizarListaAlumnos(estado.alumnos);
                });
            }

            // Nuevo comentario
            if (elementos.btnNuevoComentario) {
                elementos.btnNuevoComentario.addEventListener('click', () => {
                    mostrarModal(elementos.modalCrear, true);
                });
            }

            // Formulario crear comentario
            if (elementos.formCrearComentario) {
                elementos.formCrearComentario.addEventListener('submit', crearComentario);
            }

            // Cancelar creación
            if (elementos.btnCancelarCrear) {
                elementos.btnCancelarCrear.addEventListener('click', () => {
                    mostrarModal(elementos.modalCrear, false);
                });
            }

            // Cerrar modal al hacer clic fuera
            if (elementos.modalCrear) {
                elementos.modalCrear.addEventListener('click', (e) => {
                    if (e.target === elementos.modalCrear) {
                        mostrarModal(elementos.modalCrear, false);
                    }
                });
            }
        }

        // INICIALIZACIÓN
        async function inicializar() {
            // Verificar autenticación y rol
            const usuario = window.Utils.getFromStorage('usuario');
            if (!usuario) {
                window.location.href = '/pages/auth/login.html';
                return;
            }

            if (usuario.rol !== 'profesor' && usuario.rol !== 'admin') {
                window.location.href = '/pages/estudiante/dashboard.html';
                return;
            }

            configurarEventListeners();
            await cargarAlumnos();
            
            // Seleccionar primer alumno por defecto si hay alumnos
            if (estado.alumnos.length > 0) {
                await seleccionarAlumno(estado.alumnos[0].id);
            }
        }

        // Hacer funciones disponibles globalmente para los onclick
        window.editarComentario = editarComentario;
        window.eliminarComentario = eliminarComentario;

        // EJECUTAR INICIALIZACIÓN
        await inicializar();
    }

})();