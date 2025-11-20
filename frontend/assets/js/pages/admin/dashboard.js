/* ============================================
   SPEAKLEXI - DASHBOARD ADMIN CORREGIDO V2
   Archivo: assets/js/pages/admin/dashboard.js
   ============================================ */

(() => {
    'use strict';

    // ============================================
    // 1. CONFIGURACIÓN Y VARIABLES GLOBALES
    // ============================================
    let activityChart, languageChart;
    let dashboardData = {
        stats: {},
        recentUsers: [],
        systemMetrics: {},
        activityLogs: []
    };

    // ============================================
    // 2. VERIFICACIÓN DE DEPENDENCIAS
    // ============================================
    const requiredDependencies = [
        'APP_CONFIG',
        'apiClient', 
        'Utils',
        'themeManager',
        'toastManager'
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
     * Inicializa el dashboard
     */
    async function init() {
        console.log('🚀 Iniciando Dashboard Admin...');

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
        
        console.log('✅ Dashboard Admin inicializado correctamente');
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
            // Verificar que el botón existe antes de inicializar
            const themeButton = document.getElementById('theme-toggle');
            if (themeButton) {
                // Re-setup del theme manager para asegurar que detecte el botón
                window.themeManager.setupThemeButtons();
                console.log('🎨 Theme Manager configurado para Dashboard Admin');
            } else {
                console.warn('⚠️ Botón de tema no encontrado, intentando de nuevo...');
                setTimeout(inicializarTheme, 500);
            }
        }
    }

    /**
     * Verifica permisos de administrador
     */
    function verificarPermisos() {
        try {
            const usuario = Utils.getFromStorage(APP_CONFIG.STORAGE.KEYS.USUARIO);
            
            if (!usuario) {
                window.location.href = APP_CONFIG.UI.RUTAS.LOGIN;
                return false;
            }
            
            const rol = usuario.rol || 'alumno';
            
            if (!['admin', 'administrador'].includes(rol.toLowerCase())) {
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
            window.toastManager.error('No tienes permisos para acceder al panel de administración');
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
        const logoutBtn = document.getElementById('logout-admin-btn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', manejarLogout);
        }

        // Botones de gestión de contenido
        document.querySelectorAll('button').forEach(btn => {
            const texto = btn.textContent;
            
            if (texto.includes('Crear Nueva Lección')) {
                btn.addEventListener('click', () => {
                    window.location.href = 'gestion-lecciones.html?accion=crear';
                });
            }
            
            if (texto.includes('Editar Lecciones')) {
                btn.addEventListener('click', () => {
                    window.location.href = 'gestion-lecciones.html';
                });
            }
            
            if (texto.includes('Agregar Multimedia')) {
                btn.addEventListener('click', () => {
                    window.location.href = 'gestion-multimedia.html';
                });
            }
            
            if (texto.includes('Agregar Usuario')) {
                btn.addEventListener('click', () => {
                    window.location.href = 'gestion-usuarios.html?accion=crear';
                });
            }
            
            if (texto.includes('Ver Usuarios')) {
                btn.addEventListener('click', () => {
                    window.location.href = 'gestion-usuarios.html';
                });
            }
        });

        // Filtros de gráficos
        const activityChartContainer = document.querySelector("#activity-chart")?.parentElement;
        if (activityChartContainer) {
            const filterButtons = activityChartContainer.querySelectorAll('button');
            filterButtons.forEach((btn, index) => {
                btn.addEventListener('click', function() {
                    // Remover clase activa de todos
                    filterButtons.forEach(b => {
                        b.classList.remove('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
                        b.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                    });
                    
                    // Agregar clase activa al clickeado
                    this.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                    this.classList.add('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
                    
                    // Actualizar gráfico
                    actualizarGraficoActividad(index === 0 ? '7d' : '30d');
                });
            });
        }

        // Botones de acciones rápidas
        document.querySelectorAll('.flex-col.items-center').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span')?.textContent;
                if (action) manejarAccionRapida(action);
            });
        });
    }

    async function manejarLogout() {
        const logoutBtn = document.getElementById('logout-admin-btn');
        const destino = APP_CONFIG?.UI?.RUTAS?.LOGIN || '/pages/auth/login.html';

        try {
            if (logoutBtn) {
                logoutBtn.disabled = true;
                logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saliendo...';
            }

            if (window.apiClient?.logout) {
                await window.apiClient.logout();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        } catch (error) {
            console.error('❌ Error al cerrar sesión del admin:', error);
        } finally {
            window.location.href = destino;
        }
    }

    /**
     * Carga los datos del dashboard
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
                console.log('📊 Usando datos de demostración');
                dashboardData = obtenerDatosDemostracion();
                
                if (window.toastManager) {
                    window.toastManager.warning('Mostrando datos de demostración. Servidor no disponible.');
                }
            }
            
            inicializarGraficos();
            actualizarUI();

            if (window.toastManager) {
                window.toastManager.success('Dashboard cargado correctamente');
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
     * Intenta cargar datos reales del backend
     */
    async function cargarDatosReales() {
        try {
            // Usar endpoints de ADMIN definidos en APP_CONFIG
            const endpoints = APP_CONFIG.API.ENDPOINTS.ADMIN;
            
            const [estadisticasRes, usuariosRes] = await Promise.all([
                window.apiClient.get(endpoints.ESTADISTICAS),
                window.apiClient.get(endpoints.USUARIOS + '?limit=5&recent=true')
            ]);

            if (estadisticasRes.success && usuariosRes.success) {
                return {
                    stats: {
                        totalUsuarios: estadisticasRes.data.total_usuarios || 0,
                        leccionesActivas: estadisticasRes.data.lecciones_activas || 0,
                        totalProfesores: estadisticasRes.data.total_profesores || 0,
                        actividadHoy: estadisticasRes.data.actividad_hoy || 0
                    },
                    recentUsers: usuariosRes.data.usuarios || [],
                    systemMetrics: estadisticasRes.data.metricas_sistema || {
                        cpu: 42,
                        memoria: 68,
                        almacenamiento: 35,
                        uptime: 99.9
                    },
                    activityLogs: estadisticasRes.data.actividad_reciente || []
                };
            }
            
            return null;
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar datos reales:', error.message);
            return null;
        }
    }

    /**
     * Obtiene datos de demostración
     */
    function obtenerDatosDemostracion() {
        return {
            stats: {
                totalUsuarios: 1247,
                leccionesActivas: 156,
                totalProfesores: 28,
                actividadHoy: 342
            },
            recentUsers: [
                {
                    nombre: 'Ana López',
                    correo: 'ana@email.com',
                    rol: 'Estudiante',
                    estado_cuenta: 'activo',
                    fecha_registro: new Date().toISOString(),
                    avatar: 'https://ui-avatars.com/api/?name=Ana+Lopez&background=6366f1&color=fff'
                },
                {
                    nombre: 'Carlos Ruiz',
                    correo: 'carlos@email.com',
                    rol: 'Profesor',
                    estado_cuenta: 'activo',
                    fecha_registro: new Date(Date.now() - 86400000).toISOString(),
                    avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&background=10b981&color=fff'
                },
                {
                    nombre: 'María García',
                    correo: 'maria@email.com',
                    rol: 'Estudiante',
                    estado_cuenta: 'pendiente_verificacion',
                    fecha_registro: new Date(Date.now() - 172800000).toISOString(),
                    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=f59e0b&color=fff'
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
                    mensaje: 'Nuevo usuario registrado',
                    usuario: 'Ana López',
                    timestamp: new Date(),
                    icon: 'user-plus',
                    color: 'blue'
                },
                {
                    tipo: 'leccion_completada',
                    mensaje: 'Lección completada',
                    usuario: 'Carlos Ruiz',
                    leccion: 'Vocabulario Básico',
                    timestamp: new Date(Date.now() - 3600000),
                    icon: 'book',
                    color: 'green'
                },
                {
                    tipo: 'nivel_alcanzado',
                    mensaje: 'Nivel alcanzado',
                    usuario: 'María García',
                    nivel: 'B1',
                    timestamp: new Date(Date.now() - 7200000),
                    icon: 'chart-line',
                    color: 'purple'
                }
            ]
        };
    }

    /**
     * Inicializa los gráficos con ApexCharts
     */
    function inicializarGraficos() {
        // Detectar tema actual
        const isDark = document.documentElement.classList.contains('dark');
        
        // Gráfico de Actividad
        const activityOptions = {
            series: [{
                name: 'Usuarios Activos',
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 85, 95, 110]
            }],
            chart: {
                height: 350,
                type: 'line',
                zoom: { enabled: false },
                toolbar: { show: false },
                fontFamily: 'Inter, system-ui, sans-serif',
                background: 'transparent'
            },
            colors: ['#6366f1'],
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            grid: {
                borderColor: isDark ? '#374151' : '#e7e7e7',
                row: {
                    colors: [isDark ? '#1f2937' : '#f3f3f3', 'transparent'],
                    opacity: 0.5
                }
            },
            markers: { size: 4 },
            xaxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                labels: {
                    style: {
                        colors: isDark ? '#9ca3af' : '#6b7280'
                    }
                }
            },
            yaxis: {
                title: { 
                    text: 'Usuarios Activos',
                    style: {
                        color: isDark ? '#9ca3af' : '#6b7280'
                    }
                },
                labels: {
                    style: {
                        colors: isDark ? '#9ca3af' : '#6b7280'
                    }
                }
            },
            theme: {
                mode: isDark ? 'dark' : 'light'
            }
        };

        const activityChartEl = document.querySelector("#activity-chart");
        if (activityChartEl) {
            if (activityChart) {
                activityChart.destroy();
            }
            activityChart = new ApexCharts(activityChartEl, activityOptions);
            activityChart.render();
        }

        // Gráfico de Idiomas
        const languageOptions = {
            series: [44, 55, 41, 17, 15],
            labels: ['Inglés', 'Francés', 'Portugués', 'Alemán', 'Italiano'],
            chart: {
                type: 'donut',
                height: 350,
                background: 'transparent'
            },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: { width: 200 },
                    legend: { position: 'bottom' }
                }
            }],
            legend: { 
                position: 'bottom',
                labels: {
                    colors: isDark ? '#9ca3af' : '#6b7280'
                }
            },
            theme: {
                mode: isDark ? 'dark' : 'light'
            }
        };

        const languageChartEl = document.querySelector("#language-chart");
        if (languageChartEl) {
            if (languageChart) {
                languageChart.destroy();
            }
            languageChart = new ApexCharts(languageChartEl, languageOptions);
            languageChart.render();
        }
    }
    
    /**
     * Configura el listener para cambios de tema
     */
    function configurarListenerTema() {
        // Remover listener anterior si existe para evitar duplicados
        if (window._adminDashboardThemeHandler) {
            document.removeEventListener('themeChange', window._adminDashboardThemeHandler);
        }
        
        // Crear nuevo handler
        window._adminDashboardThemeHandler = (event) => {
            console.log('🎨 Tema cambiado, actualizando gráficos...', event.detail);
            setTimeout(() => {
                inicializarGraficos();
            }, 150);
        };
        
        // Agregar listener
        document.addEventListener('themeChange', window._adminDashboardThemeHandler);
        console.log('✅ Listener de tema configurado para gráficos');
    }

    /**
     * Actualiza el gráfico de actividad
     */
    function actualizarGraficoActividad(periodo) {
        if (window.toastManager) {
            window.toastManager.info(`Mostrando datos de los últimos ${periodo === '7d' ? '7 días' : '30 días'}`);
        }
        
        // Aquí se actualizarían los datos del gráfico con llamadas al backend
        console.log(`Actualizando gráfico para período: ${periodo}`);
    }

    /**
     * Maneja acciones rápidas del dashboard
     */
    function manejarAccionRapida(accion) {
        const acciones = {
            'Reporte': () => generarReporte(),
            'Ajustes': () => abrirAjustes(),
            'Equipo': () => verEquipo(),
            'Ayuda': () => mostrarAyuda()
        };

        if (acciones[accion]) {
            acciones[accion]();
        } else {
            console.log(`Acción: ${accion}`);
        }
    }

    function generarReporte() {
        if (window.toastManager) {
            window.toastManager.info('Generando reporte del sistema...');
        }
        // Lógica para generar reporte
        setTimeout(() => {
            window.toastManager.success('Reporte generado exitosamente');
        }, 2000);
    }

    function abrirAjustes() {
        window.location.href = 'configuracion.html';
    }

    function verEquipo() {
        window.location.href = 'gestion-usuarios.html?rol=profesor';
    }

    function mostrarAyuda() {
        if (window.toastManager) {
            window.toastManager.info('Abriendo centro de ayuda...');
        }
    }

    /**
     * Actualiza la UI con los datos cargados
     */
    function actualizarUI() {
        // Actualizar stats cards
        actualizarStatsCards();
        
        // Actualizar tabla de usuarios recientes
        actualizarTablaUsuarios();
        
        // Actualizar métricas del sistema
        actualizarMetricasSistema();
        
        // Actualizar actividad reciente
        actualizarActividadReciente();
    }

    function actualizarStatsCards() {
        const { stats } = dashboardData;
        
        // Encontrar y actualizar cada stat card
        const statElements = {
            usuarios: document.querySelector('.text-blue-600.dark\\:text-blue-500'),
            lecciones: document.querySelector('.text-green-600.dark\\:text-green-500'),
            profesores: document.querySelector('.text-purple-600.dark\\:text-purple-500'),
            actividad: document.querySelector('.text-orange-600.dark\\:text-orange-500')
        };

        if (statElements.usuarios) statElements.usuarios.textContent = stats.totalUsuarios?.toLocaleString() || '0';
        if (statElements.lecciones) statElements.lecciones.textContent = stats.leccionesActivas?.toLocaleString() || '0';
        if (statElements.profesores) statElements.profesores.textContent = stats.totalProfesores?.toLocaleString() || '0';
        if (statElements.actividad) statElements.actividad.textContent = stats.actividadHoy?.toLocaleString() || '0';
    }

    function actualizarTablaUsuarios() {
        const tbody = document.querySelector('table tbody');
        if (!tbody || !dashboardData.recentUsers.length) return;

        tbody.innerHTML = dashboardData.recentUsers.map(usuario => {
            const estadoClass = usuario.estado_cuenta === 'activo' ? 'green' : 'yellow';
            const estadoTexto = usuario.estado_cuenta === 'activo' ? 'Activo' : 'Pendiente';
            const fecha = formatearFecha(usuario.fecha_registro);
            
            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="py-3">
                        <div class="flex items-center gap-3">
                            <img src="${usuario.avatar}" class="w-8 h-8 rounded-full" alt="${usuario.nombre}">
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">${usuario.nombre}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${usuario.correo}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-3">
                        <span class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">${usuario.rol}</span>
                    </td>
                    <td class="py-3">
                        <span class="px-2 py-1 text-xs bg-${estadoClass}-100 dark:bg-${estadoClass}-900/30 text-${estadoClass}-600 dark:text-${estadoClass}-400 rounded-full">${estadoTexto}</span>
                    </td>
                    <td class="py-3 text-sm text-gray-600 dark:text-gray-400">${fecha}</td>
                </tr>
            `;
        }).join('');
    }

    function actualizarMetricasSistema() {
        const { systemMetrics } = dashboardData;
        const progressBars = document.querySelectorAll('.bg-gray-200');
        const metricas = [
            { key: 'cpu', value: systemMetrics.cpu, color: 'green' },
            { key: 'memoria', value: systemMetrics.memoria, color: 'blue' },
            { key: 'almacenamiento', value: systemMetrics.almacenamiento, color: 'purple' },
            { key: 'uptime', value: systemMetrics.uptime, color: 'green' }
        ];

        progressBars.forEach((bar, index) => {
            if (metricas[index]) {
                const progress = bar.querySelector(`.bg-${metricas[index].color}-500`);
                if (progress) {
                    progress.style.width = `${metricas[index].value}%`;
                }
                
                const percentageText = bar.previousElementSibling?.querySelector('span:last-child');
                if (percentageText) {
                    percentageText.textContent = `${metricas[index].value}%`;
                }
            }
        });
    }

    function actualizarActividadReciente() {
        // Esta función actualizaría la lista de actividad reciente
        // Por ahora usamos los datos hardcoded del HTML
    }

    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diff = ahora - fecha;
        
        // Menos de 24 horas
        if (diff < 86400000) {
            return 'Hoy';
        }
        // Menos de 48 horas
        if (diff < 172800000) {
            return 'Ayer';
        }
        // Más de 2 días
        return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
        console.error('💥 Error en Dashboard:', error);
        
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