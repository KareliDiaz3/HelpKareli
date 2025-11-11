/* ============================================
   SPEAKLEXI - PLANIFICACIÓN DE CONTENIDOS (PROFESOR)
   Archivo: assets/js/pages/profesor/planificacion.js
   UC-15: Planificar nuevos contenidos
   ============================================ */

(async () => {
    'use strict';

    const dependencias = ['APP_CONFIG', 'apiClient', 'toastManager', 'formValidator', 'ModuleLoader', 'Chart'];
    
    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Planificación de Contenidos',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => {
            console.error('Error inicializando módulo:', error);
            window.toastManager.error('Error al cargar el módulo de planificación');
        }
    });

    if (!inicializado) return;

    async function inicializarModulo() {
        // CONFIGURACIÓN
        const config = {
            API: window.APP_CONFIG.API,
            ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS.PLANIFICACION
        };

        // ELEMENTOS DOM
        const elementos = {
            // Dashboard de análisis
            analisisGrupo: document.getElementById('analisis-grupo'),
            areasCriticas: document.getElementById('areas-criticas'),
            sugerencias: document.getElementById('sugerencias'),
            graficoDesempeno: document.getElementById('grafico-desempeno'),
            
            // Lista de planes
            listaPlanes: document.getElementById('lista-planes'),
            estadoVacioPlanes: document.getElementById('estado-vacio-planes'),
            
            // Botones y modales
            btnCrearPlan: document.getElementById('btn-crear-plan'),
            modalPlan: document.getElementById('modal-plan'),
            formPlan: document.getElementById('form-plan'),
            inputTitulo: document.getElementById('input-titulo'),
            textareaDescripcion: document.getElementById('textarea-descripcion'),
            selectNivel: document.getElementById('select-nivel'),
            checkboxesAreas: document.querySelectorAll('input[name="areas_enfoque"]'),
            inputFechaInicio: document.getElementById('input-fecha-inicio'),
            inputFechaFin: document.getElementById('input-fecha-fin'),
            btnGuardarPlan: document.getElementById('btn-guardar-plan'),
            btnCancelarPlan: document.getElementById('btn-cancelar-plan'),
            
            // Estados
            loadingDashboard: document.getElementById('loading-dashboard'),
            loadingPlanes: document.getElementById('loading-planes'),
            
            // Modal confirmación
            modalConfirmacion: document.getElementById('modal-confirmacion'),
            textoConfirmacion: document.getElementById('texto-confirmacion'),
            btnConfirmarSi: document.getElementById('btn-confirmar-si'),
            btnConfirmarNo: document.getElementById('btn-confirmar-no')
        };

        // ESTADO
        let estado = {
            planes: [],
            analisis: null,
            modoEdicion: false,
            planEditando: null,
            accionConfirmar: null
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

        function mostrarConfirmacion(mensaje) {
            return new Promise((resolve) => {
                elementos.textoConfirmacion.textContent = mensaje;
                mostrarModal(elementos.modalConfirmacion, true);
                
                elementos.btnConfirmarSi.onclick = () => {
                    mostrarModal(elementos.modalConfirmacion, false);
                    resolve(true);
                };
                
                elementos.btnConfirmarNo.onclick = () => {
                    mostrarModal(elementos.modalConfirmacion, false);
                    resolve(false);
                };
            });
        }

        // DeepSeek: Cargar dashboard con análisis de desempeño del grupo
        async function cargarDashboard() {
            try {
                mostrarCargando(elementos.loadingDashboard, true);
                
                // Simulación de datos - reemplazar con llamada real
                // const response = await window.apiClient.post(config.ENDPOINTS.ANALIZAR);
                
                estado.analisis = {
                    analisis: {
                        total_alumnos: 45,
                        promedio_xp: 850,
                        promedio_lecciones: 12,
                        tasa_completacion: 72.5
                    },
                    areas_criticas: [
                        {
                            habilidad: 'habla',
                            porcentaje_promedio: 58,
                            alumnos_afectados: 28,
                            nivel_criticidad: 'alto'
                        },
                        {
                            habilidad: 'escritura',
                            porcentaje_promedio: 65,
                            alumnos_afectados: 22,
                            nivel_criticidad: 'medio'
                        },
                        {
                            habilidad: 'gramatica',
                            porcentaje_promedio: 70,
                            alumnos_afectados: 18,
                            nivel_criticidad: 'medio'
                        }
                    ],
                    sugerencias: [
                        {
                            tipo: 'contenido',
                            area: 'habla',
                            recomendacion: 'Crear ejercicios de conversación guiada',
                            prioridad: 'alta'
                        },
                        {
                            tipo: 'metodologia',
                            area: 'escritura',
                            recomendacion: 'Implementar corrección entre pares',
                            prioridad: 'media'
                        },
                        {
                            tipo: 'contenido',
                            area: 'gramatica',
                            recomendacion: 'Desarrollar lecciones de tiempos verbales',
                            prioridad: 'media'
                        }
                    ],
                    mejores_practicas: [
                        {
                            leccion_id: 23,
                            titulo: 'Present Simple vs Continuous',
                            tasa_exito: 89,
                            razon: 'Ejercicios interactivos y ejemplos claros'
                        }
                    ]
                };
                
                renderizarAnalisisGrupo(estado.analisis.analisis);
                renderizarAreasCriticas(estado.analisis.areas_criticas);
                renderizarSugerencias(estado.analisis.sugerencias);
                renderizarGraficoDesempeno(estado.analisis.areas_criticas);
                mostrarCargando(elementos.loadingDashboard, false);
                
            } catch (error) {
                console.error('Error cargando dashboard:', error);
                mostrarCargando(elementos.loadingDashboard, false);
                window.toastManager.error('Error al cargar el análisis del grupo');
            }
        }

        // DeepSeek: Renderizar análisis general del grupo
        function renderizarAnalisisGrupo(analisis) {
            if (!elementos.analisisGrupo) return;

            elementos.analisisGrupo.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${analisis.total_alumnos}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Alumnos Activos</div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">${analisis.promedio_xp}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">XP Promedio</div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${analisis.promedio_lecciones}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Lecciones Promedio</div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${analisis.tasa_completacion}%</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Tasa Completación</div>
                    </div>
                </div>
            `;
        }

        // DeepSeek: Renderizar áreas críticas que necesitan atención
        function renderizarAreasCriticas(areas) {
            if (!elementos.areasCriticas) return;

            elementos.areasCriticas.innerHTML = areas.map(area => `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 ${
                    area.nivel_criticidad === 'alto' ? 'border-red-500' :
                    area.nivel_criticidad === 'medio' ? 'border-yellow-500' : 'border-orange-500'
                }">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-900 dark:text-white capitalize">${area.habilidad}</h3>
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                            area.nivel_criticidad === 'alto' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            area.nivel_criticidad === 'medio' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        }">
                            ${area.nivel_criticidad.toUpperCase()}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        ${area.porcentaje_promedio}% de dominio • ${area.alumnos_afectados} alumnos afectados
                    </div>
                    <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="h-2 rounded-full ${
                            area.nivel_criticidad === 'alto' ? 'bg-red-500' :
                            area.nivel_criticidad === 'medio' ? 'bg-yellow-500' : 'bg-orange-500'
                        }" style="width: ${area.porcentaje_promedio}%"></div>
                    </div>
                </div>
            `).join('');
        }

        // DeepSeek: Renderizar sugerencias automáticas
        function renderizarSugerencias(sugerencias) {
            if (!elementos.sugerencias) return;

            elementos.sugerencias.innerHTML = sugerencias.map(sug => `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                            sug.prioridad === 'alta' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                            sug.prioridad === 'media' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                            'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        }">
                            <i class="fas fa-lightbulb text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">${sug.recomendacion}</h4>
                            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span class="capitalize">${sug.area}</span>
                                <span>•</span>
                                <span class="capitalize">${sug.tipo}</span>
                                <span>•</span>
                                <span class="capitalize ${sug.prioridad === 'alta' ? 'text-red-600' : sug.prioridad === 'media' ? 'text-yellow-600' : 'text-green-600'}">
                                    Prioridad ${sug.prioridad}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // DeepSeek: Crear gráfico de desempeño por área
        function renderizarGraficoDesempeno(areas) {
            if (!elementos.graficoDesempeno) return;

            const ctx = elementos.graficoDesempeno.getContext('2d');
            
            const habilidades = areas.map(area => area.habilidad);
            const porcentajes = areas.map(area => area.porcentaje_promedio);
            const colores = areas.map(area => 
                area.nivel_criticidad === 'alto' ? 'rgba(239, 68, 68, 0.8)' :
                area.nivel_criticidad === 'medio' ? 'rgba(245, 158, 11, 0.8)' :
                'rgba(249, 115, 22, 0.8)'
            );

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: habilidades.map(h => h.charAt(0).toUpperCase() + h.slice(1)),
                    datasets: [{
                        label: 'Porcentaje de Dominio',
                        data: porcentajes,
                        backgroundColor: colores,
                        borderColor: colores.map(color => color.replace('0.8', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Dominio: ${context.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Porcentaje de Dominio (%)'
                            }
                        }
                    }
                }
            });
        }

        // DeepSeek: Cargar lista de planes de contenido
        async function cargarPlanes() {
            try {
                mostrarCargando(elementos.loadingPlanes, true);
                
                // Simulación de datos - reemplazar con llamada real
                // const response = await window.apiClient.get(config.ENDPOINTS.PLANES);
                
                estado.planes = [
                    {
                        id: 1,
                        titulo: 'Plan de Refuerzo B1 - Noviembre',
                        descripcion: 'Reforzar gramática y vocabulario intermedio para estudiantes B1',
                        nivel: 'B1',
                        idioma: 'Inglés',
                        areas_enfoque: ['gramatica', 'vocabulario'],
                        fecha_inicio: '2025-11-15',
                        fecha_fin: '2025-11-30',
                        estado: 'activo',
                        profesor_nombre: 'María García',
                        fecha_creacion: '2025-11-08T09:00:00Z',
                        progreso: {
                            porcentaje_completado: 35,
                            alumnos_inscritos: 25,
                            lecciones_completadas: 7
                        }
                    },
                    {
                        id: 2,
                        titulo: 'Curso Avanzado C1 - Diciembre',
                        descripcion: 'Contenido avanzado para estudiantes C1 enfocado en conversación y escritura académica',
                        nivel: 'C1',
                        idioma: 'Inglés',
                        areas_enfoque: ['habla', 'escritura'],
                        fecha_inicio: '2025-12-01',
                        fecha_fin: '2025-12-20',
                        estado: 'borrador',
                        profesor_nombre: 'María García',
                        fecha_creacion: '2025-11-05T14:30:00Z',
                        progreso: {
                            porcentaje_completado: 0,
                            alumnos_inscritos: 0,
                            lecciones_completadas: 0
                        }
                    }
                ];
                
                renderizarListaPlanes(estado.planes);
                mostrarCargando(elementos.loadingPlanes, false);
                
            } catch (error) {
                console.error('Error cargando planes:', error);
                mostrarCargando(elementos.loadingPlanes, false);
                window.toastManager.error('Error al cargar los planes de contenido');
            }
        }

        // DeepSeek: Renderizar lista de planes
        function renderizarListaPlanes(planes) {
            if (!elementos.listaPlanes) return;

            if (planes.length === 0) {
                elementos.estadoVacioPlanes.classList.remove('hidden');
                elementos.listaPlanes.classList.add('hidden');
                return;
            }

            elementos.estadoVacioPlanes.classList.add('hidden');
            elementos.listaPlanes.classList.remove('hidden');

            elementos.listaPlanes.innerHTML = planes.map(plan => `
                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${plan.titulo}</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-2">${plan.descripcion}</p>
                            
                            <div class="flex flex-wrap gap-2 mb-3">
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                                    Nivel ${plan.nivel}
                                </span>
                                <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-semibold">
                                    ${plan.idioma}
                                </span>
                                <span class="px-2 py-1 ${
                                    plan.estado === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                    plan.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                } rounded-full text-xs font-semibold">
                                    ${plan.estado.charAt(0).toUpperCase() + plan.estado.slice(1)}
                                </span>
                            </div>
                            
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                <div class="flex flex-wrap gap-4">
                                    <span><i class="fas fa-calendar mr-1"></i> ${plan.fecha_inicio} - ${plan.fecha_fin}</span>
                                    <span><i class="fas fa-users mr-1"></i> ${plan.progreso.alumnos_inscritos} alumnos</span>
                                    <span><i class="fas fa-tasks mr-1"></i> ${plan.progreso.lecciones_completadas} lecciones</span>
                                </div>
                            </div>
                        </div>
                        
                        ${plan.estado === 'activo' && plan.progreso.porcentaje_completado > 0 ? `
                            <div class="text-right ml-4">
                                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    ${plan.progreso.porcentaje_completado}%
                                </div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">Completado</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${plan.estado === 'activo' && plan.progreso.porcentaje_completado > 0 ? `
                        <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                            <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${plan.progreso.porcentaje_completado}%"></div>
                        </div>
                    ` : ''}
                    
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            <i class="fas fa-user mr-1"></i> ${plan.profesor_nombre} • 
                            ${new Date(plan.fecha_creacion).toLocaleDateString('es-ES')}
                        </div>
                        
                        <div class="flex gap-2">
                            <button class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm"
                                    onclick="verPlan(${plan.id})">
                                <i class="fas fa-eye mr-1"></i>Ver
                            </button>
                            <button class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm"
                                    onclick="editarPlan(${plan.id})">
                                <i class="fas fa-edit mr-1"></i>Editar
                            </button>
                            <button class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold text-sm"
                                    onclick="eliminarPlan(${plan.id})">
                                <i class="fas fa-trash mr-1"></i>Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // DeepSeek: Crear nuevo plan de contenido
        async function crearPlan(event) {
            event.preventDefault();
            
            const valido = window.formValidator.validateForm(elementos.formPlan);
            if (!valido) {
                window.toastManager.warning('Completa todos los campos requeridos');
                return;
            }

            const formData = new FormData(elementos.formPlan);
            const areasEnfoque = Array.from(elementos.checkboxesAreas)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            const datos = {
                titulo: formData.get('titulo'),
                descripcion: formData.get('descripcion'),
                nivel: formData.get('nivel'),
                idioma: 'Inglés', // Por defecto por ahora
                areas_enfoque: areasEnfoque,
                fecha_inicio: formData.get('fecha_inicio'),
                fecha_fin: formData.get('fecha_fin'),
                objetivos: [
                    'Mejorar habilidades identificadas en el análisis',
                    'Incrementar tasa de completación'
                ]
            };

            try {
                // En una implementación real:
                // await window.apiClient.post(config.ENDPOINTS.CREAR, datos);
                
                window.toastManager.success('Plan creado exitosamente');
                elementos.formPlan.reset();
                mostrarModal(elementos.modalPlan, false);
                await cargarPlanes(); // Recargar lista
                
            } catch (error) {
                console.error('Error creando plan:', error);
                window.toastManager.error('Error al crear el plan');
            }
        }

        // DeepSeek: Editar plan existente
        async function editarPlan(planId) {
            const plan = estado.planes.find(p => p.id === planId);
            if (!plan) return;

            // En una implementación real, cargaríamos los datos del plan
            // y llenaríamos el formulario para edición
            window.toastManager.info(`Editando plan #${planId} - Funcionalidad en desarrollo`);
        }

        // DeepSeek: Eliminar plan
        async function eliminarPlan(planId) {
            const confirmado = await mostrarConfirmacion('¿Estás seguro de que quieres eliminar este plan? Esta acción no se puede deshacer.');
            if (!confirmado) return;

            try {
                // En una implementación real:
                // await window.apiClient.delete(config.ENDPOINTS.ELIMINAR.replace(':id', planId));
                
                window.toastManager.success('Plan eliminado exitosamente');
                await cargarPlanes(); // Recargar lista
                
            } catch (error) {
                console.error('Error eliminando plan:', error);
                window.toastManager.error('Error al eliminar el plan');
            }
        }

        // DeepSeek: Ver detalles del plan
        async function verPlan(planId) {
            const plan = estado.planes.find(p => p.id === planId);
            if (!plan) return;

            // En una implementación real, mostraríamos un modal con los detalles completos
            window.toastManager.info(`Viendo detalles del plan: ${plan.titulo}`);
        }

        // CONFIGURAR EVENT LISTENERS
        function configurarEventListeners() {
            // Crear nuevo plan
            if (elementos.btnCrearPlan) {
                elementos.btnCrearPlan.addEventListener('click', () => {
                    estado.modoEdicion = false;
                    estado.planEditando = null;
                    elementos.formPlan.reset();
                    elementos.btnGuardarPlan.textContent = 'Crear Plan';
                    mostrarModal(elementos.modalPlan, true);
                });
            }

            // Guardar plan
            if (elementos.formPlan) {
                elementos.formPlan.addEventListener('submit', crearPlan);
            }

            // Cancelar creación/edición
            if (elementos.btnCancelarPlan) {
                elementos.btnCancelarPlan.addEventListener('click', () => {
                    mostrarModal(elementos.modalPlan, false);
                });
            }

            // Cerrar modal al hacer clic fuera
            if (elementos.modalPlan) {
                elementos.modalPlan.addEventListener('click', (e) => {
                    if (e.target === elementos.modalPlan) {
                        mostrarModal(elementos.modalPlan, false);
                    }
                });
            }

            // Configurar fechas mínimas
            const hoy = new Date().toISOString().split('T')[0];
            if (elementos.inputFechaInicio) {
                elementos.inputFechaInicio.min = hoy;
                elementos.inputFechaInicio.addEventListener('change', function() {
                    if (elementos.inputFechaFin) {
                        elementos.inputFechaFin.min = this.value;
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
            await cargarDashboard();
            await cargarPlanes();
        }

        // Hacer funciones disponibles globalmente para los onclick
        window.verPlan = verPlan;
        window.editarPlan = editarPlan;
        window.eliminarPlan = eliminarPlan;

        // EJECUTAR INICIALIZACIÓN
        await inicializar();
    }

})();