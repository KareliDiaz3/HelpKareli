/* ============================================
   SPEAKLEXI - DASHBOARD PROFESOR
   Archivo: assets/js/pages/profesor/dashboard.js
   ============================================ */

(() => {
    'use strict';

    // ============================================
    // 1. CONFIGURACIÓN Y VARIABLES GLOBALES
    // ============================================
    let progressChart, performanceChart, activityChart;
    let dashboardData = {
        stats: {},
        recentStudents: [],
        classMetrics: {},
        pendingTasks: [],
        upcomingLessons: []
    };

    // ============================================
    // 2. VERIFICACIÓN DE DEPENDENCIAS
    // ============================================
    const requiredDependencies = [
        'APP_CONFIG',
        'apiClient', 
        'Utils',
        'themeManager',
        'toastManager',
        'Chart'
    ];

    /**
     * Verifica que todas las dependencias estén cargadas
     */
    function checkDependencies() {
        const missing = [];
        
        for (const dep of requiredDependencies) {
            if (!window[dep]) {
                missing.push(dep);
            }
        }

        if (missing.length > 0) {
            console.warn(`⚠️ Dependencias faltantes: ${missing.join(', ')}`);
            return false;
        }
        
        return true;
    }

    /**
     * Espera a que las dependencias estén listas
     */
    async function waitForDependencies(maxAttempts = 50) {
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (checkDependencies()) {
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.error('❌ Timeout esperando dependencias');
        return false;
    }

    // ============================================
    // 3. FUNCIONES PRINCIPALES
    // ============================================

    /**
     * Inicializa el dashboard del profesor
     */
    async function init() {
        console.log('🚀 Iniciando Dashboard Profesor...');

        // Esperar dependencias
        const ready = await waitForDependencies();
        if (!ready) {
            console.error('❌ No se pudieron cargar todas las dependencias');
            return;
        }

        console.log('✅ Todas las dependencias cargadas');
        
        // Verificar permisos primero
        if (!verificarPermisos()) {
            return;
        }

        // Setup básico
        setupEventListeners();
        
        // Esperar a que el navbar esté cargado para inicializar el tema
        await esperarNavbar();
        inicializarTheme();
        
        // Cargar datos del dashboard
        await cargarDashboardData();
        
        // Configurar listener de tema DESPUÉS de cargar los gráficos
        configurarListenerTema();
        
        console.log('✅ Dashboard Profesor inicializado correctamente');
    }

    /**
     * Espera a que el navbar esté cargado en el DOM
     */
    async function esperarNavbar(maxAttempts = 50) {
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const themeButton = document.getElementById('theme-toggle');
            if (themeButton) {
                console.log('✅ Navbar cargado, botón de tema encontrado');
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('⚠️ Navbar no se cargó en el tiempo esperado');
        return false;
    }

    /**
     * Inicializa el sistema de temas
     */
    function inicializarTheme() {
        if (window.themeManager) {
            const themeButton = document.getElementById('theme-toggle');
            if (themeButton) {
                window.themeManager.setupThemeButtons();
                console.log('🎨 Theme Manager configurado para Dashboard Profesor');
            } else {
                console.warn('⚠️ Botón de tema no encontrado, intentando de nuevo...');
                setTimeout(inicializarTheme, 500);
            }
        }
    }

    /**
     * Verifica permisos de profesor
     */
    function verificarPermisos() {
        try {
            const usuario = Utils.getFromStorage(APP_CONFIG.STORAGE.KEYS.USUARIO);
            
            if (!usuario) {
                window.location.href = APP_CONFIG.UI.RUTAS.LOGIN;
                return false;
            }
            
            const rol = usuario.rol || 'alumno';
            
            if (!['profesor', 'admin', 'administrador'].includes(rol.toLowerCase())) {
                mostrarErrorPermisos();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error verificando permisos:', error);
            window.location.href = APP_CONFIG.UI.RUTAS.LOGIN;
            return false;
        }
    }

    function mostrarErrorPermisos() {
        if (window.toastManager) {
            window.toastManager.error('No tienes permisos para acceder al panel de profesor');
        }
        setTimeout(() => {
            const usuario = Utils.getFromStorage(APP_CONFIG.STORAGE.KEYS.USUARIO);
            const rol = usuario?.rol || 'alumno';
            window.location.href = APP_CONFIG.ROLES.RUTAS_DASHBOARD[rol] || APP_CONFIG.UI.RUTAS.LOGIN;
        }, 3000);
    }

    /**
     * Configura todos los event listeners
     */
    function setupEventListeners() {
        // Botones de acciones rápidas
        document.querySelectorAll('.flex-col.items-center').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span')?.textContent;
                if (action) manejarAccionRapida(action);
            });
        });

        // Cards de estadísticas (click para ir a secciones específicas)
        document.querySelectorAll('.cursor-pointer').forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('p')?.textContent;
                if (title) manejarClickCard(title);
            });
        });

        // Filtros de gráficos
        const activityChartContainer = document.querySelector("#activity-chart")?.parentElement;
        if (activityChartContainer) {
            const filterButtons = activityChartContainer.querySelectorAll('button');
            filterButtons.forEach((btn, index) => {
                btn.addEventListener('click', function() {
                    // Remover clase activa de todos
                    filterButtons.forEach(b => {
                        b.classList.remove('bg-primary-100', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
                        b.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                    });
                    
                    // Agregar clase activa al clickeado
                    this.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                    this.classList.add('bg-primary-100', 'dark:bg-primary-900/30', 'text-primary-600', 'dark:text-primary-400');
                    
                    // Actualizar gráfico
                    actualizarGraficoActividad(index === 0 ? '7d' : '30d');
                });
            });
        }

        // Botones de navegación
        document.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                manejarNavegacion(action);
            });
        });
    }

    /**
     * Carga los datos del dashboard del profesor
     */
    async function cargarDashboardData() {
        try {
            mostrarLoading(true);

            // Intentar cargar datos reales del backend
            const datosReales = await cargarDatosReales();
            
            if (datosReales) {
                dashboardData = datosReales;
            } else {
                // Fallback a datos de demostración
                console.log('📊 Usando datos de demostración para profesor');
                dashboardData = obtenerDatosDemostracion();
                
                if (window.toastManager) {
                    window.toastManager.warning('Mostrando datos de demostración. Servidor no disponible.');
                }
            }
            
            inicializarGraficos();
            actualizarUI();

            if (window.toastManager) {
                window.toastManager.success('Dashboard del profesor cargado correctamente');
            }

        } catch (error) {
            manejarError('Error al cargar datos del dashboard', error);
            
            // Usar datos de demo como último recurso
            dashboardData = obtenerDatosDemostracion();
            inicializarGraficos();
            actualizarUI();
        } finally {
            mostrarLoading(false);
        }
    }

    /**
     * Intenta cargar datos reales del backend para profesor
     */
    async function cargarDatosReales() {
        try {
            const profesorId = Utils.getFromStorage(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
            
            // Endpoints específicos para profesor
            const endpoints = APP_CONFIG.API.ENDPOINTS.PROFESOR;
            
            const [estadisticasRes, alumnosRes, tareasRes] = await Promise.all([
                window.apiClient.get(endpoints.ESTADISTICAS.replace(':id', profesorId)),
                window.apiClient.get(endpoints.ALUMNOS + '?limit=5&recent=true'),
                window.apiClient.get(endpoints.TAREAS_PENDIENTES.replace(':id', profesorId))
            ]);

            if (estadisticasRes.success && alumnosRes.success) {
                return {
                    stats: {
                        totalAlumnos: estadisticasRes.data.total_alumnos || 0,
                        leccionesActivas: estadisticasRes.data.lecciones_activas || 0,
                        retroalimentacionPendiente: estadisticasRes.data.retroalimentacion_pendiente || 0,
                        promedioProgreso: estadisticasRes.data.promedio_progreso || 0
                    },
                    recentStudents: alumnosRes.data.alumnos || [],
                    classMetrics: estadisticasRes.data.metricas_clase || {
                        nivelPromedio: 'B1',
                        tasaCompletacion: 75,
                        horasTotales: 245,
                        actividadSemanal: 89
                    },
                    pendingTasks: tareasRes.success ? tareasRes.data.tareas : [],
                    upcomingLessons: estadisticasRes.data.proximas_lecciones || []
                };
            }
            
            return null;
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar datos reales del profesor:', error.message);
            return null;
        }
    }

    /**
     * Obtiene datos de demostración para profesor
     */
    function obtenerDatosDemostracion() {
        return {
            stats: {
                totalAlumnos: 45,
                leccionesActivas: 12,
                retroalimentacionPendiente: 8,
                promedioProgreso: 72
            },
            recentStudents: [
                {
                    id: 1,
                    nombre: 'Ana García López',
                    nivel: 'B1',
                    progreso: 85,
                    ultimaActividad: new Date().toISOString(),
                    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=6366f1&color=fff',
                    necesitaRetroalimentacion: true
                },
                {
                    id: 2,
                    nombre: 'Carlos Rodríguez',
                    nivel: 'A2', 
                    progreso: 65,
                    ultimaActividad: new Date(Date.now() - 86400000).toISOString(),
                    avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=10b981&color=fff',
                    necesitaRetroalimentacion: false
                },
                {
                    id: 3,
                    nombre: 'María Fernández',
                    nivel: 'B2',
                    progreso: 92,
                    ultimaActividad: new Date(Date.now() - 172800000).toISOString(),
                    avatar: 'https://ui-avatars.com/api/?name=Maria+Fernandez&background=f59e0b&color=fff',
                    necesitaRetroalimentacion: true
                }
            ],
            classMetrics: {
                nivelPromedio: 'B1',
                tasaCompletacion: 75,
                horasTotales: 245,
                actividadSemanal: 89
            },
            pendingTasks: [
                {
                    id: 1,
                    tipo: 'retroalimentacion',
                    titulo: 'Revisar ejercicio de Ana García',
                    descripcion: 'Ejercicio de conversación avanzada',
                    prioridad: 'alta',
                    fechaLimite: new Date(Date.now() + 86400000).toISOString()
                },
                {
                    id: 2,
                    tipo: 'planificacion',
                    titulo: 'Planificar lección B1',
                    descripcion: 'Nueva lección sobre tiempos verbales',
                    prioridad: 'media',
                    fechaLimite: new Date(Date.now() + 259200000).toISOString()
                }
            ],
            upcomingLessons: [
                {
                    id: 1,
                    titulo: 'Conversación Avanzada B2',
                    fecha: new Date(Date.now() + 86400000).toISOString(),
                    alumnosInscritos: 8,
                    duracion: 60
                },
                {
                    id: 2, 
                    titulo: 'Gramática Intermedia B1',
                    fecha: new Date(Date.now() + 172800000).toISOString(),
                    alumnosInscritos: 12,
                    duracion: 45
                }
            ]
        };
    }

    /**
     * Inicializa los gráficos con Chart.js
     */
    function inicializarGraficos() {
        // Detectar tema actual
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#9ca3af' : '#6b7280';

        // Gráfico de Progreso de la Clase
        const progressCtx = document.getElementById('progress-chart')?.getContext('2d');
        if (progressCtx) {
            if (progressChart) {
                progressChart.destroy();
            }

            progressChart = new Chart(progressCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completado', 'En Progreso', 'No Iniciado'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: [
                            '#10b981',
                            '#f59e0b', 
                            '#ef4444'
                        ],
                        borderWidth: 2,
                        borderColor: isDark ? '#1f2937' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: {
                                    family: 'Inter, system-ui, sans-serif'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: '#6366f1',
                            borderWidth: 1
                        }
                    }
                }
            });
        }

        // Gráfico de Rendimiento por Habilidad
        const performanceCtx = document.getElementById('performance-chart')?.getContext('2d');
        if (performanceCtx) {
            if (performanceChart) {
                performanceChart.destroy();
            }

            performanceChart = new Chart(performanceCtx, {
                type: 'radar',
                data: {
                    labels: ['Lectura', 'Escritura', 'Escucha', 'Habla', 'Gramática', 'Vocabulario'],
                    datasets: [{
                        label: 'Promedio Clase',
                        data: [75, 68, 82, 65, 70, 78],
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: {
                                color: gridColor
                            },
                            grid: {
                                color: gridColor
                            },
                            pointLabels: {
                                color: textColor,
                                font: {
                                    family: 'Inter, system-ui, sans-serif'
                                }
                            },
                            ticks: {
                                color: textColor,
                                backdropColor: 'transparent'
                            },
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor,
                                font: {
                                    family: 'Inter, system-ui, sans-serif'
                                }
                            }
                        }
                    }
                }
            });
        }

        // Gráfico de Actividad Semanal
        const activityCtx = document.getElementById('activity-chart')?.getContext('2d');
        if (activityCtx) {
            if (activityChart) {
                activityChart.destroy();
            }

            activityChart = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Horas de Estudio',
                        data: [12, 15, 8, 18, 22, 10, 5],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: gridColor
                            },
                            ticks: {
                                color: textColor
                            }
                        },
                        x: {
                            grid: {
                                color: gridColor
                            },
                            ticks: {
                                color: textColor
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor,
                                font: {
                                    family: 'Inter, system-ui, sans-serif'
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Configura el listener para cambios de tema
     */
    function configurarListenerTema() {
        if (window._profesorDashboardThemeHandler) {
            document.removeEventListener('themeChange', window._profesorDashboardThemeHandler);
        }
        
        window._profesorDashboardThemeHandler = (event) => {
            console.log('🎨 Tema cambiado, actualizando gráficos del profesor...');
            setTimeout(() => {
                inicializarGraficos();
            }, 150);
        };
        
        document.addEventListener('themeChange', window._profesorDashboardThemeHandler);
        console.log('✅ Listener de tema configurado para gráficos del profesor');
    }

    /**
     * Actualiza el gráfico de actividad
     */
    function actualizarGraficoActividad(periodo) {
        if (window.toastManager) {
            window.toastManager.info(`Mostrando actividad de los últimos ${periodo === '7d' ? '7 días' : '30 días'}`);
        }
        
        console.log(`Actualizando gráfico para período: ${periodo}`);
        // Aquí se actualizarían los datos del gráfico con llamadas al backend
    }

    /**
     * Maneja acciones rápidas del dashboard
     */
    function manejarAccionRapida(accion) {
        const acciones = {
            'Retroalimentación': () => irARetroalimentacion(),
            'Planificación': () => irAPlanificacion(),
            'Estadísticas': () => irAEstadisticas(),
            'Contenido': () => irAGestionContenido()
        };

        if (acciones[accion]) {
            acciones[accion]();
        } else {
            console.log(`Acción: ${accion}`);
        }
    }

    /**
     * Maneja clicks en las cards de estadísticas
     */
    function manejarClickCard(titulo) {
        const navegacion = {
            'Total Alumnos': () => irAGestionAlumnos(),
            'Lecciones Activas': () => irAGestionLecciones(),
            'Retroalimentación Pendiente': () => irARetroalimentacion(),
            'Progreso Promedio': () => irAEstadisticas()
        };

        if (navegacion[titulo]) {
            navegacion[titulo]();
        }
    }

    /**
     * Maneja navegación por acciones
     */
    function manejarNavegacion(accion) {
        const rutas = {
            'gestion-alumnos': '/pages/profesor/gestion-alumnos.html',
            'retroalimentacion': '/pages/profesor/retroalimentacion-profesor.html',
            'planificacion': '/pages/profesor/planificacion.html',
            'estadisticas': '/pages/profesor/estadisticas-profesor.html',
            'gestion-contenido': '/pages/profesor/gestion-contenido.html'
        };

        if (rutas[accion]) {
            window.location.href = rutas[accion];
        }
    }

    // Funciones de navegación
    function irARetroalimentacion() {
        window.location.href = '/pages/profesor/retroalimentacion-profesor.html';
    }

    function irAPlanificacion() {
        window.location.href = '/pages/profesor/planificacion.html';
    }

    function irAEstadisticas() {
        window.location.href = '/pages/profesor/estadisticas-profesor.html';
    }

    function irAGestionContenido() {
        window.location.href = '/pages/profesor/gestion-contenido.html';
    }

    function irAGestionAlumnos() {
        window.location.href = '/pages/profesor/gestion-alumnos.html';
    }

    function irAGestionLecciones() {
        window.location.href = '/pages/profesor/gestion-lecciones.html';
    }

    /**
     * Actualiza la UI con los datos cargados
     */
    function actualizarUI() {
        actualizarStatsCards();
        actualizarListaAlumnos();
        actualizarMetricasClase();
        actualizarTareasPendientes();
        actualizarProximasLecciones();
    }

    function actualizarStatsCards() {
        const { stats } = dashboardData;
        
        // Actualizar cada stat card
        const statElements = {
            alumnos: document.querySelector('[data-stat="alumnos"]'),
            lecciones: document.querySelector('[data-stat="lecciones"]'),
            retroalimentacion: document.querySelector('[data-stat="retroalimentacion"]'),
            progreso: document.querySelector('[data-stat="progreso"]')
        };

        if (statElements.alumnos) statElements.alumnos.textContent = stats.totalAlumnos?.toLocaleString() || '0';
        if (statElements.lecciones) statElements.lecciones.textContent = stats.leccionesActivas?.toLocaleString() || '0';
        if (statElements.retroalimentacion) statElements.retroalimentacion.textContent = stats.retroalimentacionPendiente?.toLocaleString() || '0';
        if (statElements.progreso) statElements.progreso.textContent = `${stats.promedioProgreso?.toLocaleString() || '0'}%`;
    }

    function actualizarListaAlumnos() {
        const container = document.getElementById('recent-students');
        if (!container || !dashboardData.recentStudents.length) return;

        container.innerHTML = dashboardData.recentStudents.map(alumno => {
            const fecha = formatearFecha(alumno.ultimaActividad);
            const badgeClass = alumno.necesitaRetroalimentacion ? 
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            
            const badgeText = alumno.necesitaRetroalimentacion ? 'Necesita feedback' : 'Al día';

            return `
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div class="flex items-center gap-3">
                        <img src="${alumno.avatar}" class="w-10 h-10 rounded-full" alt="${alumno.nombre}">
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">${alumno.nombre}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Nivel ${alumno.nivel} • ${alumno.progreso}% completado
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="px-2 py-1 text-xs ${badgeClass} rounded-full">${badgeText}</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${fecha}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function actualizarMetricasClase() {
        const { classMetrics } = dashboardData;
        const container = document.getElementById('class-metrics');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">${classMetrics.nivelPromedio}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Nivel Promedio</div>
                </div>
                <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">${classMetrics.tasaCompletacion}%</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Tasa Completación</div>
                </div>
                <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${classMetrics.horasTotales}h</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Horas Totales</div>
                </div>
                <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${classMetrics.actividadSemanal}%</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Actividad Semanal</div>
                </div>
            </div>
        `;
    }

    function actualizarTareasPendientes() {
        const container = document.getElementById('pending-tasks');
        if (!container || !dashboardData.pendingTasks.length) return;

        container.innerHTML = dashboardData.pendingTasks.map(tarea => {
            const prioridadClass = {
                alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                baja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            }[tarea.prioridad];

            const fecha = formatearFecha(tarea.fechaLimite);

            return `
                <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div class="flex-1">
                        <p class="font-medium text-gray-900 dark:text-white">${tarea.titulo}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${tarea.descripcion}</p>
                    </div>
                    <div class="text-right">
                        <span class="px-2 py-1 text-xs ${prioridadClass} rounded-full capitalize">${tarea.prioridad}</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${fecha}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function actualizarProximasLecciones() {
        const container = document.getElementById('upcoming-lessons');
        if (!container || !dashboardData.upcomingLessons.length) return;

        container.innerHTML = dashboardData.upcomingLessons.map(leccion => {
            const fecha = new Date(leccion.fecha).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div class="flex-1">
                        <p class="font-medium text-gray-900 dark:text-white">${leccion.titulo}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${leccion.alumnosInscritos} alumnos • ${leccion.duracion} min</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${fecha}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Próxima</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diff = ahora - fecha;
        
        if (diff < 0) {
            // Fecha futura
            const dias = Math.ceil(-diff / 86400000);
            if (dias === 1) return 'Mañana';
            if (dias <= 7) return `En ${dias} días`;
            return fecha.toLocaleDateString('es-ES');
        }
        
        // Menos de 24 horas
        if (diff < 86400000) {
            return 'Hoy';
        }
        // Menos de 48 horas
        if (diff < 172800000) {
            return 'Ayer';
        }
        // Más de 2 días
        return fecha.toLocaleDateString('es-ES');
    }

    // ============================================
    // 4. FUNCIONES DE UTILIDAD
    // ============================================

    function mostrarLoading(mostrar) {
        if (mostrar) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    function manejarError(mensaje, error) {
        console.error('💥 Error en Dashboard Profesor:', error);
        
        if (window.toastManager) {
            window.toastManager.error(mensaje);
        }
        
        if (APP_CONFIG.ENV.DEBUG) {
            console.trace();
        }
    }

    // ============================================
    // 5. INICIALIZACIÓN
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

})();