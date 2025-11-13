/* ============================================
   SPEAKLEXI - GESTIÓN DE RETROALIMENTACIÓN (PROFESOR) - ACTUALIZADO
   Archivo: assets/js/pages/profesor/retroalimentacion-profesor.js
   UC-14: Revisar retroalimentación - CON DATOS REALES DEL MÓDULO 4
   ============================================ */

class RetroalimentacionProfesor {
    constructor() {
        this.API_URL = window.APP_CONFIG?.API?.BASE_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.estado = {
            estudiantes: [],
            estudianteSeleccionado: null,
            retroalimentaciones: [],
            filtroBusqueda: ''
        };
        this.init();
    }

    async init() {
        try {
            console.log('✅ Módulo Retroalimentación Profesor iniciando...');
            
            // Verificar autenticación y rol
            await this.verificarAutenticacion();
            
            // Cargar datos iniciales
            await this.cargarEstudiantes();
            this.configurarEventListeners();
            
            console.log('✅ Módulo Retroalimentación Profesor listo');
        } catch (error) {
            console.error('💥 Error inicializando módulo:', error);
            this.mostrarError('Error al cargar el módulo de retroalimentación');
        }
    }

    async verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        if (!usuario || !usuario.id) {
            window.location.href = '/pages/auth/login.html';
            throw new Error('Usuario no autenticado');
        }

        if (usuario.rol !== 'profesor' && usuario.rol !== 'admin') {
            window.location.href = '/pages/estudiante/dashboard.html';
            throw new Error('Acceso denegado: rol no autorizado');
        }

        if (!this.token) {
            window.location.href = '/pages/auth/login.html';
            throw new Error('Token no disponible');
        }
    }

    // ELEMENTOS DOM
    get elementos() {
        return {
            // Panel lateral
            listaAlumnos: document.getElementById('lista-alumnos'),
            buscadorAlumnos: document.getElementById('buscador-alumnos'),
            loadingAlumnos: document.getElementById('loading-alumnos'),
            
            // Panel principal
            alumnoSeleccionadoNombre: document.getElementById('alumno-seleccionado-nombre'),
            alumnoSeleccionadoNivel: document.getElementById('alumno-seleccionado-nivel'),
            listaRetroalimentacionAlumno: document.getElementById('lista-retroalimentacion-alumno'),
            estadoVacioAlumno: document.getElementById('estado-vacio-alumno'),
            loadingRetroalimentacion: document.getElementById('loading-retroalimentacion'),
            
            // Modal crear
            modalCrear: document.getElementById('modal-crear'),
            formCrearComentario: document.getElementById('form-crear-comentario'),
            selectAlumnoModal: document.getElementById('select-alumno-modal'),
            selectLeccionModal: document.getElementById('select-leccion-modal'),
            textareaComentario: document.getElementById('textarea-comentario'),
            inputCalificacion: document.getElementById('input-calificacion'),
            selectTipo: document.getElementById('select-tipo'),
            btnEnviarComentario: document.getElementById('btn-enviar-comentario'),
            btnCancelarCrear: document.getElementById('btn-cancelar-crear'),
            
            // Botones
            btnNuevoComentario: document.getElementById('btn-nuevo-comentario'),
            btnNuevoPrimerComentario: document.getElementById('btn-nuevo-primer-comentario')
        };
    }

    // ============================================
    // FUNCIONES PRINCIPALES - DATOS REALES
    // ============================================

    async cargarEstudiantes() {
        try {
            this.mostrarCargando('alumnos', true);
            
            const response = await fetch(`${this.API_URL}/profesor/estudiantes`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }

            this.estado.estudiantes = result.data || [];
            this.renderizarListaEstudiantes(this.estado.estudiantes);
            this.llenarSelectAlumnos(this.estado.estudiantes);
            
            // Seleccionar primer estudiante si existe
            if (this.estado.estudiantes.length > 0) {
                await this.seleccionarEstudiante(this.estado.estudiantes[0].estudiante_id);
            }
            
            this.mostrarCargando('alumnos', false);
            
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            this.mostrarCargando('alumnos', false);
            this.mostrarError('Error al cargar la lista de estudiantes');
        }
    }

    async cargarRetroalimentacionEstudiante(estudianteId) {
        try {
            this.mostrarCargando('retroalimentacion', true);
            
            const response = await fetch(
                `${this.API_URL}/profesor/retroalimentacion?estudiante_id=${estudianteId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }

            this.estado.retroalimentaciones = result.data || [];
            this.renderizarRetroalimentacionEstudiante(this.estado.retroalimentaciones);
            this.mostrarCargando('retroalimentacion', false);
            
        } catch (error) {
            console.error('❌ Error cargando retroalimentación:', error);
            this.mostrarCargando('retroalimentacion', false);
            this.mostrarError('Error al cargar la retroalimentación del estudiante');
        }
    }

    async crearRetroalimentacion(datos) {
        try {
            const response = await fetch(`${this.API_URL}/profesor/retroalimentacion`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }

            return result;
            
        } catch (error) {
            console.error('❌ Error creando retroalimentación:', error);
            throw error;
        }
    }

    // ============================================
    // RENDERIZADO - ACTUALIZADO CON DATOS REALES
    // ============================================

    renderizarListaEstudiantes(estudiantes) {
        const elementos = this.elementos;
        if (!elementos.listaAlumnos) return;

        const estudiantesFiltrados = estudiantes.filter(est => 
            est.estudiante_nombre.toLowerCase().includes(this.estado.filtroBusqueda.toLowerCase()) ||
            est.estudiante_correo.toLowerCase().includes(this.estado.filtroBusqueda.toLowerCase())
        );

        if (estudiantesFiltrados.length === 0) {
            elementos.listaAlumnos.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-users text-3xl mb-2"></i>
                    <p>No se encontraron estudiantes</p>
                    ${this.estado.filtroBusqueda ? '<p class="text-sm">Intenta con otros términos de búsqueda</p>' : ''}
                </div>
            `;
            return;
        }

        elementos.listaAlumnos.innerHTML = estudiantesFiltrados.map(est => {
            const estaSeleccionado = this.estado.estudianteSeleccionado?.estudiante_id === est.estudiante_id;
            const iniciales = est.estudiante_nombre.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return `
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    estaSeleccionado ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                }" data-estudiante-id="${est.estudiante_id}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${iniciales.substring(0, 2)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-900 dark:text-white truncate">
                                ${est.estudiante_nombre}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                                ${est.estudiante_correo}
                            </p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                    ${est.nivel_actual}
                                </span>
                                <span class="text-xs text-gray-500">•</span>
                                <span class="text-xs text-gray-500">
                                    ${est.lecciones_completadas} lecciones
                                </span>
                                <span class="text-xs text-gray-500">•</span>
                                <span class="text-xs text-gray-500">
                                    ${est.total_xp} XP
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Agregar event listeners
        document.querySelectorAll('[data-estudiante-id]').forEach(element => {
            element.addEventListener('click', () => {
                const estudianteId = parseInt(element.getAttribute('data-estudiante-id'));
                this.seleccionarEstudiante(estudianteId);
            });
        });
    }

    renderizarRetroalimentacionEstudiante(retroalimentaciones) {
        const elementos = this.elementos;
        if (!elementos.listaRetroalimentacionAlumno || !elementos.estadoVacioAlumno) return;

        if (retroalimentaciones.length === 0) {
            elementos.estadoVacioAlumno.classList.remove('hidden');
            elementos.listaRetroalimentacionAlumno.classList.add('hidden');
            return;
        }

        elementos.estadoVacioAlumno.classList.add('hidden');
        elementos.listaRetroalimentacionAlumno.classList.remove('hidden');

        elementos.listaRetroalimentacionAlumno.innerHTML = retroalimentaciones.map(retro => {
            const fecha = new Date(retro.creado_en).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const tipoColores = {
                felicitacion: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                mejora: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                alerta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            };

            const tipoTexto = {
                felicitacion: 'Felicitación',
                mejora: 'Sugerencia de Mejora',
                alerta: 'Alerta',
                general: 'General'
            };

            return `
                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
                                ${retro.asunto}
                            </h3>
                            ${retro.leccion_titulo ? `
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Lección: ${retro.leccion_titulo}
                                </p>
                            ` : ''}
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${tipoColores[retro.tipo] || tipoColores.general}">
                                ${tipoTexto[retro.tipo] || 'General'}
                            </span>
                            <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold">
                                ${retro.leido ? 'Leído' : 'No leído'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="prose dark:prose-invert max-w-none mb-4">
                        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${retro.mensaje}</p>
                    </div>
                    
                    <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Enviado: ${fecha}
                        </p>
                        <div class="flex gap-2">
                            <button class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold flex items-center gap-1"
                                    onclick="retroalimentacionProfesor.editarRetroalimentacion(${retro.id})">
                                <i class="fas fa-edit text-xs"></i>Editar
                            </button>
                            <button class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold flex items-center gap-1"
                                    onclick="retroalimentacionProfesor.eliminarRetroalimentacion(${retro.id})">
                                <i class="fas fa-trash text-xs"></i>Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    llenarSelectAlumnos(estudiantes) {
        const elementos = this.elementos;
        if (!elementos.selectAlumnoModal) return;
        
        elementos.selectAlumnoModal.innerHTML = `
            <option value="">Seleccionar estudiante...</option>
            ${estudiantes.map(est => `
                <option value="${est.estudiante_id}">
                    ${est.estudiante_nombre} (${est.nivel_actual} - ${est.lecciones_completadas} lecciones)
                </option>
            `).join('')}
        `;
    }

    // ============================================
    // GESTIÓN DE ESTADO Y SELECCIÓN
    // ============================================

    async seleccionarEstudiante(estudianteId) {
        const estudiante = this.estado.estudiantes.find(e => e.estudiante_id === estudianteId);
        if (!estudiante) return;

        this.estado.estudianteSeleccionado = estudiante;
        
        // Actualizar UI
        const elementos = this.elementos;
        elementos.alumnoSeleccionadoNombre.textContent = estudiante.estudiante_nombre;
        elementos.alumnoSeleccionadoNivel.textContent = 
            `Nivel ${estudiante.nivel_actual} • ${estudiante.lecciones_completadas} lecciones • ${estudiante.total_xp} XP`;
        
        // Actualizar selección visual
        document.querySelectorAll('[data-estudiante-id]').forEach(el => {
            el.classList.remove('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-200');
        });
        
        const elementoSeleccionado = document.querySelector(`[data-estudiante-id="${estudianteId}"]`);
        if (elementoSeleccionado) {
            elementoSeleccionado.classList.add('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-200');
        }
        
        // Cargar retroalimentación
        await this.cargarRetroalimentacionEstudiante(estudianteId);
    }

    // ============================================
    // GESTIÓN DE FORMULARIOS Y MODALES
    // ============================================

    async manejarEnvioFormulario(event) {
        event.preventDefault();
        
        const elementos = this.elementos;
        const formData = new FormData(elementos.formCrearComentario);
        
        const datos = {
            estudiante_id: parseInt(formData.get('alumno_id')),
            asunto: formData.get('asunto') || 'Comentario del profesor',
            mensaje: formData.get('comentario'),
            tipo: formData.get('tipo') || 'general',
            leccion_id: formData.get('leccion_id') ? parseInt(formData.get('leccion_id')) : null
        };

        // Validaciones básicas
        if (!datos.estudiante_id || !datos.mensaje) {
            this.mostrarError('Se requiere estudiante y mensaje');
            return;
        }

        try {
            elementos.btnEnviarComentario.disabled = true;
            elementos.btnEnviarComentario.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            
            const resultado = await this.crearRetroalimentacion(datos);
            
            this.mostrarExito('Retroalimentación enviada correctamente');
            elementos.formCrearComentario.reset();
            this.ocultarModalCrear();
            
            // Recargar retroalimentación si el estudiante seleccionado es el mismo
            if (this.estado.estudianteSeleccionado && 
                this.estado.estudianteSeleccionado.estudiante_id === datos.estudiante_id) {
                await this.cargarRetroalimentacionEstudiante(datos.estudiante_id);
            }
            
        } catch (error) {
            this.mostrarError('Error al enviar la retroalimentación: ' + error.message);
        } finally {
            elementos.btnEnviarComentario.disabled = false;
            elementos.btnEnviarComentario.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Comentario';
        }
    }

    mostrarModalCrear() {
        const elementos = this.elementos;
        elementos.modalCrear.classList.remove('hidden');
        elementos.modalCrear.classList.add('flex');
        
        // Si hay un estudiante seleccionado, preseleccionarlo en el modal
        if (this.estado.estudianteSeleccionado && elementos.selectAlumnoModal) {
            elementos.selectAlumnoModal.value = this.estado.estudianteSeleccionado.estudiante_id;
        }
    }

    ocultarModalCrear() {
        const elementos = this.elementos;
        elementos.modalCrear.classList.add('hidden');
        elementos.modalCrear.classList.remove('flex');
        elementos.formCrearComentario.reset();
    }

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================

    mostrarCargando(tipo, mostrar) {
        const elementos = this.elementos;
        const elemento = tipo === 'alumnos' ? elementos.loadingAlumnos : elementos.loadingRetroalimentacion;
        
        if (elemento) {
            elemento.classList.toggle('hidden', !mostrar);
        }
    }

    mostrarExito(mensaje) {
        if (window.toastManager) {
            window.toastManager.success(mensaje);
        } else {
            alert(`✅ ${mensaje}`);
        }
    }

    mostrarError(mensaje) {
        if (window.toastManager) {
            window.toastManager.error(mensaje);
        } else {
            alert(`❌ ${mensaje}`);
        }
    }

    // ============================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // ============================================

    configurarEventListeners() {
        const elementos = this.elementos;

        // Búsqueda de estudiantes
        if (elementos.buscadorAlumnos) {
            elementos.buscadorAlumnos.addEventListener('input', (e) => {
                this.estado.filtroBusqueda = e.target.value;
                this.renderizarListaEstudiantes(this.estado.estudiantes);
            });
        }

        // Botones de nuevo comentario
        if (elementos.btnNuevoComentario) {
            elementos.btnNuevoComentario.addEventListener('click', () => this.mostrarModalCrear());
        }

        if (elementos.btnNuevoPrimerComentario) {
            elementos.btnNuevoPrimerComentario.addEventListener('click', () => this.mostrarModalCrear());
        }

        // Formulario crear comentario
        if (elementos.formCrearComentario) {
            elementos.formCrearComentario.addEventListener('submit', (e) => this.manejarEnvioFormulario(e));
        }

        // Cancelar creación
        if (elementos.btnCancelarCrear) {
            elementos.btnCancelarCrear.addEventListener('click', () => this.ocultarModalCrear());
        }

        // Cerrar modal al hacer clic fuera
        if (elementos.modalCrear) {
            elementos.modalCrear.addEventListener('click', (e) => {
                if (e.target === elementos.modalCrear) {
                    this.ocultarModalCrear();
                }
            });
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !elementos.modalCrear.classList.contains('hidden')) {
                this.ocultarModalCrear();
            }
        });
    }

    // ============================================
    // FUNCIONES PARA BOTONES (disponibles globalmente)
    // ============================================

    async editarRetroalimentacion(retroId) {
        // TODO: Implementar edición cuando el backend lo soporte
        this.mostrarError('La edición de retroalimentación estará disponible próximamente');
    }

    async eliminarRetroalimentacion(retroId) {
        const confirmado = confirm('¿Estás seguro de que quieres eliminar esta retroalimentación?');
        if (!confirmado) return;

        // TODO: Implementar eliminación cuando el backend lo soporte
        this.mostrarError('La eliminación de retroalimentación estará disponible próximamente');
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

let retroalimentacionProfesor;

document.addEventListener('DOMContentLoaded', () => {
    retroalimentacionProfesor = new RetroalimentacionProfesor();
});

// Hacer funciones disponibles globalmente para onclick
window.retroalimentacionProfesor = retroalimentacionProfesor;
window.editarRetroalimentacion = (id) => retroalimentacionProfesor?.editarRetroalimentacion(id);
window.eliminarRetroalimentacion = (id) => retroalimentacionProfesor?.eliminarRetroalimentacion(id);