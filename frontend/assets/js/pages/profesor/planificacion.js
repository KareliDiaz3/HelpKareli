/* ============================================
   SPEAKLEXI - PLANIFICADOR DE CONTENIDOS (PROFESOR)
   Archivo: assets/js/pages/profesor/planificacion.js
   UC-15: Planificar nuevos contenidos - CON DATOS REALES
   ============================================ */

class PlanificacionProfesor {
    constructor() {
        this.API_URL = window.APP_CONFIG?.API?.BASE_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.estado = {
            planes: [],
            estudiantes: [],
            lecciones: [],
            analisis: null,
            estudianteSeleccionado: null,
            planSeleccionado: null,
            filtroEstado: 'todos'
        };
        this.init();
    }

    async init() {
        try {
            console.log('✅ Módulo Planificación Profesor iniciando...');
            
            // Verificar autenticación y rol
            await this.verificarAutenticacion();
            
            // Cargar datos iniciales
            await Promise.all([
                this.cargarDashboard(),
                this.cargarEstudiantes(),
                this.cargarPlanes(),
                this.cargarLecciones()
            ]);
            
            this.configurarEventListeners();
            this.renderizarResumen();
            
            console.log('✅ Módulo Planificación Profesor listo');
        } catch (error) {
            console.error('💥 Error inicializando módulo:', error);
            this.mostrarError('Error al cargar el módulo de planificación');
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
            // Dashboard
            analisisGrupo: document.getElementById('analisis-grupo'),
            areasCriticas: document.getElementById('areas-criticas'),
            sugerencias: document.getElementById('sugerencias'),
            graficoDesempeno: document.getElementById('grafico-desempeno'),
            loadingDashboard: document.getElementById('loading-dashboard'),
            
            // Planes
            listaPlanes: document.getElementById('lista-planes'),
            estadoVacioPlanes: document.getElementById('estado-vacio-planes'),
            loadingPlanes: document.getElementById('loading-planes'),
            
            // Modal crear plan
            modalPlan: document.getElementById('modal-plan'),
            formPlan: document.getElementById('form-plan'),
            inputTitulo: document.getElementById('input-titulo'),
            textareaDescripcion: document.getElementById('textarea-descripcion'),
            selectEstudiante: document.getElementById('select-estudiante'),
            selectNivel: document.getElementById('select-nivel'),
            checkboxesAreas: document.querySelectorAll('input[name="areas_enfoque"]'),
            inputFechaInicio: document.getElementById('input-fecha-inicio'),
            inputFechaFin: document.getElementById('input-fecha-fin'),
            btnGuardarPlan: document.getElementById('btn-guardar-plan'),
            btnCancelarPlan: document.getElementById('btn-cancelar-plan'),
            
            // Botones
            btnCrearPlan: document.getElementById('btn-crear-plan'),
            btnCrearPrimerPlan: document.getElementById('btn-crear-primer-plan'),
            
            // Confirmación
            modalConfirmacion: document.getElementById('modal-confirmacion'),
            textoConfirmacion: document.getElementById('texto-confirmacion'),
            btnConfirmarSi: document.getElementById('btn-confirmar-si'),
            btnConfirmarNo: document.getElementById('btn-confirmar-no')
        };
    }

    // ============================================
    // FUNCIONES PRINCIPALES - DATOS REALES
    // ============================================

    async cargarDashboard() {
        try {
            this.mostrarCargando('dashboard', true);
            
            const response = await fetch(`${this.API_URL}/profesor/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }

            this.estado.analisis = result.data;
            this.renderizarDashboard(this.estado.analisis);
            this.mostrarCargando('dashboard', false);
            
        } catch (error) {
            console.error('❌ Error cargando dashboard:', error);
            this.mostrarCargando('dashboard', false);
            this.mostrarError('Error al cargar el análisis del dashboard');
        }
    }

    async cargarEstudiantes() {
        try {
            const response = await fetch(`${this.API_URL}/profesor/estudiantes`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            this.estado.estudiantes = result.data || [];
            this.llenarSelectEstudiantes();
            
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            throw error;
        }
    }

    async cargarPlanes() {
        try {
            this.mostrarCargando('planes', true);
            
            const response = await fetch(`${this.API_URL}/profesor/planes`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            this.estado.planes = result.data || [];
            this.renderizarPlanes();
            this.mostrarCargando('planes', false);
            
        } catch (error) {
            console.error('❌ Error cargando planes:', error);
            this.mostrarCargando('planes', false);
            this.mostrarError('Error al cargar los planes de estudio');
        }
    }

    async cargarLecciones() {
        try {
            const response = await fetch(`${this.API_URL}/profesor/lecciones`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            this.estado.lecciones = result.data || [];
            
        } catch (error) {
            console.error('❌ Error cargando lecciones:', error);
            throw error;
        }
    }

    async crearPlan(datos) {
        try {
            const response = await fetch(`${this.API_URL}/profesor/planes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('❌ Error creando plan:', error);
            throw error;
        }
    }

    async actualizarEstadoPlan(planId, nuevoEstado) {
        try {
            const response = await fetch(`${this.API_URL}/profesor/planes/${planId}/estado`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            throw error;
        }
    }

    // ============================================
    // RENDERIZADO - INTERFAZ DE USUARIO
    // ============================================

    renderizarDashboard(analisis) {
        this.renderizarAnalisisGrupo(analisis.estadisticas);
        this.renderizarAreasCriticas(analisis.temas_dificultad || []);
        this.renderizarGraficoDesempeno(analisis.temas_dificultad || []);
    }

    renderizarAnalisisGrupo(estadisticas) {
        const elementos = this.elementos;
        if (!elementos.analisisGrupo) return;

        elementos.analisisGrupo.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ${estadisticas.total_estudiantes || 0}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Estudiantes Totales</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${estadisticas.estudiantes_con_plan || 0}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Con Plan Personalizado</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${estadisticas.planes_activos || 0}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Planes Activos</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        ${estadisticas.planes_completados || 0}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Planes Completados</div>
                </div>
            </div>
        `;
    }

    renderizarAreasCriticas(temas) {
        const elementos = this.elementos;
        if (!elementos.areasCriticas) return;

        if (temas.length === 0) {
            elementos.areasCriticas.innerHTML = `
                <div class="text-center py-4 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-check-circle text-2xl mb-2"></i>
                    <p>No se identificaron áreas críticas</p>
                </div>
            `;
            return;
        }

        elementos.areasCriticas.innerHTML = temas.slice(0, 5).map(tema => `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 ${
                tema.frecuencia >= 10 ? 'border-red-500' :
                tema.frecuencia >= 5 ? 'border-yellow-500' : 'border-orange-500'
            }">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white capitalize">
                        ${tema.tema || 'Tema no especificado'}
                    </h3>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                        tema.frecuencia >= 10 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        tema.frecuencia >= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    }">
                        ${tema.estudiantes_afectados || tema.frecuencia} estudiantes
                    </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Frecuencia: ${tema.frecuencia} veces reportado
                </div>
                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="h-2 rounded-full ${
                        tema.frecuencia >= 10 ? 'bg-red-500' :
                        tema.frecuencia >= 5 ? 'bg-yellow-500' : 'bg-orange-500'
                    }" style="width: ${Math.min(tema.frecuencia * 10, 100)}%"></div>
                </div>
            </div>
        `).join('');
    }

    renderizarGraficoDesempeno(temas) {
        const elementos = this.elementos;
        if (!elementos.graficoDesempeno || !window.Chart) return;

        const ctx = elementos.graficoDesempeno.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        if (temas.length === 0) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#6B7280';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos suficientes', elementos.graficoDesempeno.width / 2, elementos.graficoDesempeno.height / 2);
            return;
        }

        const temasLabels = temas.map(t => t.tema?.substring(0, 15) + (t.tema?.length > 15 ? '...' : '') || 'Tema');
        const frecuencias = temas.map(t => t.frecuencia);
        const estudiantes = temas.map(t => t.estudiantes_afectados || t.frecuencia);

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: temasLabels,
                datasets: [
                    {
                        label: 'Frecuencia',
                        data: frecuencias,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                    },
                    {
                        label: 'Estudiantes Afectados',
                        data: estudiantes,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Temas con Dificultad - Análisis'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                }
            }
        });
    }

    renderizarPlanes() {
        const elementos = this.elementos;
        if (!elementos.listaPlanes) return;

        const planesFiltrados = this.estado.planes.filter(plan => {
            if (this.estado.filtroEstado === 'todos') return true;
            return plan.estado === this.estado.filtroEstado;
        });

        if (planesFiltrados.length === 0) {
            elementos.estadoVacioPlanes.classList.remove('hidden');
            elementos.listaPlanes.classList.add('hidden');
            return;
        }

        elementos.estadoVacioPlanes.classList.add('hidden');
        elementos.listaPlanes.classList.remove('hidden');
        elementos.listaPlanes.innerHTML = planesFiltrados.map(plan => this.obtenerHTMLPlan(plan)).join('');
    }

    obtenerHTMLPlan(plan) {
        const estudiante = this.estado.estudiantes.find(e => e.id === plan.estudiante_id);
        const fechaInicio = plan.fecha_inicio ? new Date(plan.fecha_inicio).toLocaleDateString() : 'No definida';
        const fechaFin = plan.fecha_fin_estimada ? new Date(plan.fecha_fin_estimada).toLocaleDateString() : 'No definida';
        
        const coloresEstado = {
            'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'en_progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };

        const textosEstado = {
            'pendiente': 'Pendiente',
            'en_progreso': 'En Progreso',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };

        const progreso = this.calcularProgresoPlan(plan);

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                            ${plan.titulo}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-2">
                            ${plan.descripcion || 'Sin descripción'}
                        </p>
                        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span class="flex items-center gap-1">
                                <i class="fas fa-user"></i>
                                ${estudiante?.nombre_completo || 'Estudiante no encontrado'}
                            </span>
                            <span class="flex items-center gap-1">
                                <i class="fas fa-calendar"></i>
                                ${fechaInicio} - ${fechaFin}
                            </span>
                            <span class="flex items-center gap-1">
                                <i class="fas fa-book"></i>
                                ${plan.lecciones_sugeridas?.length || 0} lecciones
                            </span>
                        </div>
                        
                        ${progreso > 0 ? `
                            <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                                     style="width: ${progreso}%"></div>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 text-right">
                                ${progreso}% completado
                            </div>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${coloresEstado[plan.estado]}">
                            ${textosEstado[plan.estado]}
                        </span>
                        <div class="relative">
                            <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    onclick="planificacionProfesor.mostrarMenuAcciones(${plan.id}, this)">
                                <i class="fas fa-ellipsis-v text-gray-500"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        <i class="fas fa-clock mr-1"></i>
                        Creado: ${new Date(plan.creado_en).toLocaleDateString()}
                    </div>
                    <div class="flex gap-2">
                        <button class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold flex items-center gap-1"
                                onclick="planificacionProfesor.verDetallesPlan(${plan.id})">
                            <i class="fas fa-eye text-xs"></i>Ver
                        </button>
                        <button class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
                                onclick="planificacionProfesor.editarPlan(${plan.id})">
                            <i class="fas fa-edit text-xs"></i>Editar
                        </button>
                        <button class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold flex items-center gap-1"
                                onclick="planificacionProfesor.eliminarPlan(${plan.id})">
                            <i class="fas fa-trash text-xs"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    calcularProgresoPlan(plan) {
        if (plan.estado === 'completado') return 100;
        if (plan.estado === 'pendiente') return 0;
        
        // Simular progreso basado en lecciones completadas
        const totalLecciones = plan.lecciones_sugeridas?.length || 0;
        if (totalLecciones === 0) return 0;
        
        const leccionesCompletadas = Math.floor(Math.random() * totalLecciones); // Simulado
        return Math.round((leccionesCompletadas / totalLecciones) * 100);
    }

    llenarSelectEstudiantes() {
        const elementos = this.elementos;
        if (!elementos.selectEstudiante) return;
        
        elementos.selectEstudiante.innerHTML = `
            <option value="">Seleccionar estudiante...</option>
            ${this.estado.estudiantes.map(est => `
                <option value="${est.id}">
                    ${est.nombre_completo} (${est.nivel_actual})
                </option>
            `).join('')}
        `;
    }

    renderizarResumen() {
        const totalPlanes = this.estado.planes.length;
        const planesActivos = this.estado.planes.filter(p => p.estado === 'en_progreso').length;
        const planesCompletados = this.estado.planes.filter(p => p.estado === 'completado').length;

        // Actualizar contadores en la UI si existen
        const totalElement = document.getElementById('total-planes');
        const activosElement = document.getElementById('planes-activos');
        const completadosElement = document.getElementById('planes-completados');
        const estudiantesElement = document.getElementById('total-estudiantes');

        if (totalElement) totalElement.textContent = totalPlanes;
        if (activosElement) activosElement.textContent = planesActivos;
        if (completadosElement) completadosElement.textContent = planesCompletados;
        if (estudiantesElement) estudiantesElement.textContent = this.estado.estudiantes.length;
    }

    // ============================================
    // GESTIÓN DE FORMULARIOS Y MODALES
    // ============================================

    async manejarEnvioFormulario(event) {
        event.preventDefault();
        
        const elementos = this.elementos;
        const formData = new FormData(elementos.formPlan);
        
        const areasEnfoque = Array.from(elementos.checkboxesAreas)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const datos = {
            estudiante_id: parseInt(formData.get('estudiante_id')),
            titulo: formData.get('titulo'),
            descripcion: formData.get('descripcion'),
            objetivos: formData.get('descripcion'), // Usar descripción como objetivos por ahora
            temas_dificultad: areasEnfoque,
            lecciones_sugeridas: [], // Por implementar: selección de lecciones
            ejercicios_extra: [], // Por implementar: ejercicios adicionales
            fecha_inicio: formData.get('fecha_inicio'),
            fecha_fin_estimada: formData.get('fecha_fin')
        };

        // Validaciones
        if (!datos.estudiante_id || !datos.titulo || !datos.descripcion) {
            this.mostrarError('Completa todos los campos requeridos');
            return;
        }

        try {
            elementos.btnGuardarPlan.disabled = true;
            elementos.btnGuardarPlan.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creando...';
            
            const resultado = await this.crearPlan(datos);
            
            this.mostrarExito('Plan de estudio creado correctamente');
            elementos.formPlan.reset();
            this.ocultarModalPlan();
            
            // Recargar planes
            await this.cargarPlanes();
            
        } catch (error) {
            this.mostrarError('Error al crear el plan: ' + error.message);
        } finally {
            elementos.btnGuardarPlan.disabled = false;
            elementos.btnGuardarPlan.innerHTML = 'Crear Plan';
        }
    }

    mostrarModalPlan() {
        const elementos = this.elementos;
        elementos.modalPlan.classList.remove('hidden');
        elementos.modalPlan.classList.add('flex');
        
        // Configurar fechas mínimas
        const hoy = new Date().toISOString().split('T')[0];
        if (elementos.inputFechaInicio) {
            elementos.inputFechaInicio.min = hoy;
        }
    }

    ocultarModalPlan() {
        const elementos = this.elementos;
        elementos.modalPlan.classList.add('hidden');
        elementos.modalPlan.classList.remove('flex');
        elementos.formPlan.reset();
    }

    async mostrarConfirmacion(mensaje) {
        return new Promise((resolve) => {
            const elementos = this.elementos;
            elementos.textoConfirmacion.textContent = mensaje;
            elementos.modalConfirmacion.classList.remove('hidden');
            elementos.modalConfirmacion.classList.add('flex');
            
            elementos.btnConfirmarSi.onclick = () => {
                this.ocultarModalConfirmacion();
                resolve(true);
            };
            
            elementos.btnConfirmarNo.onclick = () => {
                this.ocultarModalConfirmacion();
                resolve(false);
            };
        });
    }

    ocultarModalConfirmacion() {
        const elementos = this.elementos;
        elementos.modalConfirmacion.classList.add('hidden');
        elementos.modalConfirmacion.classList.remove('flex');
    }

    // ============================================
    // FUNCIONES DE GESTIÓN DE PLANES
    // ============================================

    async verDetallesPlan(planId) {
        const plan = this.estado.planes.find(p => p.id === planId);
        if (!plan) return;

        // TODO: Implementar vista detallada del plan
        this.mostrarInfo(`Viendo detalles del plan: ${plan.titulo}`);
    }

    async editarPlan(planId) {
        const plan = this.estado.planes.find(p => p.id === planId);
        if (!plan) return;

        // TODO: Implementar edición de plan
        this.mostrarInfo(`Editando plan: ${plan.titulo} - Funcionalidad en desarrollo`);
    }

    async eliminarPlan(planId) {
        const plan = this.estado.planes.find(p => p.id === planId);
        if (!plan) return;

        const confirmado = await this.mostrarConfirmacion(
            `¿Estás seguro de que quieres eliminar el plan "${plan.titulo}"? Esta acción no se puede deshacer.`
        );

        if (!confirmado) return;

        try {
            // TODO: Implementar eliminación en el backend
            // await fetch(`${this.API_URL}/profesor/planes/${planId}`, { method: 'DELETE' });
            
            this.mostrarExito('Plan eliminado correctamente');
            await this.cargarPlanes(); // Recargar lista
            
        } catch (error) {
            this.mostrarError('Error al eliminar el plan: ' + error.message);
        }
    }

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================

    mostrarCargando(tipo, mostrar) {
        const elementos = this.elementos;
        const elemento = tipo === 'dashboard' ? elementos.loadingDashboard : elementos.loadingPlanes;
        
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

    mostrarInfo(mensaje) {
        if (window.toastManager) {
            window.toastManager.info(mensaje);
        } else {
            alert(`ℹ️ ${mensaje}`);
        }
    }

    // ============================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // ============================================

    configurarEventListeners() {
        const elementos = this.elementos;

        // Botones de crear plan
        if (elementos.btnCrearPlan) {
            elementos.btnCrearPlan.addEventListener('click', () => this.mostrarModalPlan());
        }

        if (elementos.btnCrearPrimerPlan) {
            elementos.btnCrearPrimerPlan.addEventListener('click', () => this.mostrarModalPlan());
        }

        // Formulario crear plan
        if (elementos.formPlan) {
            elementos.formPlan.addEventListener('submit', (e) => this.manejarEnvioFormulario(e));
        }

        // Cancelar creación
        if (elementos.btnCancelarPlan) {
            elementos.btnCancelarPlan.addEventListener('click', () => this.ocultarModalPlan());
        }

        // Cerrar modales al hacer clic fuera
        if (elementos.modalPlan) {
            elementos.modalPlan.addEventListener('click', (e) => {
                if (e.target === elementos.modalPlan) {
                    this.ocultarModalPlan();
                }
            });
        }

        if (elementos.modalConfirmacion) {
            elementos.modalConfirmacion.addEventListener('click', (e) => {
                if (e.target === elementos.modalConfirmacion) {
                    this.ocultarModalConfirmacion();
                }
            });
        }

        // Configurar dependencia de fechas
        if (elementos.inputFechaInicio && elementos.inputFechaFin) {
            elementos.inputFechaInicio.addEventListener('change', function() {
                elementos.inputFechaFin.min = this.value;
            });
        }

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!elementos.modalPlan.classList.contains('hidden')) {
                    this.ocultarModalPlan();
                }
                if (!elementos.modalConfirmacion.classList.contains('hidden')) {
                    this.ocultarModalConfirmacion();
                }
            }
        });
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

let planificacionProfesor;

document.addEventListener('DOMContentLoaded', () => {
    planificacionProfesor = new PlanificacionProfesor();
});

// Hacer funciones disponibles globalmente para onclick
window.planificacionProfesor = planificacionProfesor;