/* ============================================
   SPEAKLEXI - DASHBOARD ADMIN
   Archivo: assets/js/pages/admin/dashboard.js
   ============================================ */

(() => {
    'use strict';

    // ============================================
    // 1. VERIFICACIÓN DE DEPENDENCIAS (CRÍTICO)
    // ============================================
    const requiredDependencies = [
        'APP_CONFIG',
        'apiClient', 
        'formValidator',
        'toastManager',
        'themeManager'
    ];

    for (const dep of requiredDependencies) {
        if (!window[dep]) {
            console.error(`❌ ${dep} no está cargado`);
            return;
        }
    }

    console.log('✅ Dashboard Admin inicializado');

    // ============================================
    // 2. CONFIGURACIÓN DESDE APP_CONFIG
    // ============================================
    const config = {
        API: window.APP_CONFIG.API,
        ENDPOINTS: window.APP_CONFIG.ADMIN,
        STORAGE: window.APP_CONFIG.STORAGE.KEYS,
        UI: window.APP_CONFIG.UI
    };

    // ============================================
    // 3. VARIABLES GLOBALES
    // ============================================
    let activityChart, languageChart;
    let dashboardData = {
        stats: {},
        recentUsers: [],
        systemMetrics: {},
        activityLogs: []
    };

    // ============================================
    // 4. FUNCIONES PRINCIPALES
    // ============================================

    /**
     * Inicializa el dashboard
     */
    function init() {
        setupEventListeners();
        verificarPermisos();
        cargarDashboardData();
        
        if (window.APP_CONFIG.ENV.DEBUG) {
            console.log('🔧 Dashboard Admin listo:', { config });
        }
    }

    /**
     * Verifica permisos de administrador
     */
    function verificarPermisos() {
        const usuario = Utils.getFromStorage(config.STORAGE.USER);
        
        if (!usuario || !['admin', 'administrador'].includes(usuario.rol)) {
            window.toastManager.error('No tienes permisos para acceder al panel de administración');
            setTimeout(() => {
                window.location.href = config.UI.RUTAS.LOGIN;
            }, 2000);
            return false;
        }
        
        return true;
    }

    /**
     * Configura todos los event listeners
     */
    function setupEventListeners() {
        // Botones de gestión de contenido
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Crear Nueva Lección')) {
                btn.addEventListener('click', () => {
                    window.location.href = '/pages/admin/gestion-lecciones.html';
                });
            }
            
            if (btn.textContent.includes('Editar Lecciones')) {
                btn.addEventListener('click', () => {
                    window.location.href = '/pages/admin/gestion-lecciones.html';
                });
            }
            
            if (btn.textContent.includes('Agregar Multimedia')) {
                btn.addEventListener('click', () => {
                    window.location.href = '/pages/admin/gestion-multimedia.html';
                });
            }
            
            if (btn.textContent.includes('Agregar Usuario')) {
                btn.addEventListener('click', () => {
                    window.location.href = '/pages/admin/gestion-usuarios.html';
                });
            }
            
            if (btn.textContent.includes('Ver Usuarios')) {
                btn.addEventListener('click', () => {
                    window.location.href = '/pages/admin/gestion-usuarios.html';
                });
            }
        });

        // Botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', manejarLogout);
        }

        // Filtros de gráficos
        document.querySelectorAll('#activity-chart').parentElement.querySelectorAll('button').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                // Remover clase activa de todos los botones
                this.parentElement.querySelectorAll('button').forEach(b => {
                    b.classList.remove('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
                    b.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                });
                
                // Agregar clase activa al botón clickeado
                this.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                this.classList.add('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
                
                // Actualizar gráfico según el período seleccionado
                actualizarGraficoActividad(index === 0 ? '7d' : '30d');
            });
        });
    }

    /**
     * Carga los datos del dashboard
     */
    async function cargarDashboardData() {
        try {
            mostrarLoading(true);

            // En una implementación real, estos datos vendrían de la API
            // Por ahora usamos datos de ejemplo
            await simularCargaDatos();
            
            inicializarGraficos();
            actualizarUI();

        } catch (error) {
            manejarError('Error al cargar datos del dashboard', error);
        } finally {
            mostrarLoading(false);
        }
    }

    /**
     * Simula la carga de datos (para demo)
     */
    async function simularCargaDatos() {
        return new Promise(resolve => {
            setTimeout(() => {
                dashboardData = {
                    stats: {
                        totalUsuarios: 1247,
                        leccionesActivas: 156,
                        totalProfesores: 28,
                        actividadHoy: 342
                    },
                    recentUsers: [
                        {
                            nombre: 'Ana López',
                            email: 'ana@email.com',
                            rol: 'Estudiante',
                            estado: 'Activo',
                            fecha: 'Hoy'
                        },
                        {
                            nombre: 'Carlos Ruiz',
                            email: 'carlos@email.com',
                            rol: 'Profesor',
                            estado: 'Activo',
                            fecha: 'Ayer'
                        },
                        {
                            nombre: 'María García',
                            email: 'maria@email.com',
                            rol: 'Estudiante',
                            estado: 'Pendiente',
                            fecha: '15/10/2025'
                        }
                    ],
                    systemMetrics: {
                        cpu: 42,
                        memoria: 68,
                        almacenamiento: 35,
                        uptime: 99.9
                    },
                    activityLogs: [
                        {
                            tipo: 'registro',
                            mensaje: 'Ana López se unió hace 2 horas',
                            timestamp: new Date()
                        },
                        {
                            tipo: 'leccion_completada',
                            mensaje: 'Carlos Ruiz completó "Vocabulario Básico"',
                            timestamp: new Date(Date.now() - 3600000)
                        },
                        {
                            tipo: 'nivel_alcanzado',
                            mensaje: 'María García alcanzó el nivel B1',
                            timestamp: new Date(Date.now() - 7200000)
                        }
                    ]
                };
                resolve();
            }, 1000);
        });
    }

    /**
     * Inicializa los gráficos
     */
    function inicializarGraficos() {
        // Gráfico de Actividad
        const activityOptions = {
            series: [{
                name: 'Usuarios Activos',
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 85, 95, 110]
            }],
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
                fontFamily: 'Inter, system-ui, sans-serif'
            },
            colors: ['#6366f1'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                }
            },
            markers: {
                size: 4
            },
            xaxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            },
            yaxis: {
                title: {
                    text: 'Usuarios Activos'
                }
            }
        };

        activityChart = new ApexCharts(document.querySelector("#activity-chart"), activityOptions);
        activityChart.render();

        // Gráfico de Idiomas
        const languageOptions = {
            series: [44, 55, 41, 17, 15],
            labels: ['Inglés', 'Francés', 'Portugués', 'Alemán', 'Italiano'],
            chart: {
                type: 'donut',
                height: 350
            },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            legend: {
                position: 'bottom'
            }
        };

        languageChart = new ApexCharts(document.querySelector("#language-chart"), languageOptions);
        languageChart.render();
    }

    /**
     * Actualiza el gráfico de actividad según el período
     */
    function actualizarGraficoActividad(periodo) {
        // En una implementación real, aquí se haría una petición a la API
        // Por ahora solo mostramos un mensaje
        window.toastManager.info(`Mostrando datos de los últimos ${periodo === '7d' ? '7 días' : '30 días'}`);
    }

    /**
     * Actualiza la UI con los datos cargados
     */
    function actualizarUI() {
        // Actualizar stats cards
        document.querySelectorAll('.bg-white, .dark\\:bg-gray-800').forEach((card, index) => {
            const statValue = card.querySelector('p.text-3xl');
            if (statValue) {
                const stats = Object.values(dashboardData.stats);
                if (stats[index]) {
                    statValue.textContent = stats[index].toLocaleString();
                }
            }
        });

        // Actualizar métricas del sistema
        const metrics = dashboardData.systemMetrics;
        document.querySelectorAll('.bg-gray-200, .dark\\:bg-gray-700').forEach((bar, index) => {
            const progress = bar.querySelector('.bg-green-500, .bg-blue-500, .bg-purple-500');
            if (progress) {
                const values = [metrics.cpu, metrics.memoria, metrics.almacenamiento, metrics.uptime];
                progress.style.width = `${values[index]}%`;
                
                // Actualizar el texto del porcentaje
                const percentageText = bar.previousElementSibling?.querySelector('span:last-child');
                if (percentageText) {
                    percentageText.textContent = `${values[index]}%`;
                }
            }
        });
    }

    /**
     * Maneja el cierre de sesión
     */
    function manejarLogout() {
        const confirmacion = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
        
        if (confirmacion) {
            // Limpiar almacenamiento local
            Utils.clearStorage();
            
            // Redirigir al login
            window.location.href = config.UI.RUTAS.LOGIN;
        }
    }

    // ============================================
    // 5. FUNCIONES DE UI/UX
    // ============================================

    function mostrarLoading(mostrar) {
        // Podrías agregar un overlay de loading si es necesario
        if (mostrar) {
            // Mostrar skeleton loader
        } else {
            // Ocultar skeleton loader
        }
    }

    function manejarError(mensaje, error) {
        console.error('💥 Error en Dashboard:', error);
        
        if (window.APP_CONFIG.ENV.DEBUG) {
            console.trace();
        }
        
        window.toastManager.error(mensaje);
    }

    // ============================================
    // 6. INICIALIZACIÓN
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

})();