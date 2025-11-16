/* ============================================
   SPEAKLEXI - Dashboard Estudiante CORREGIDO
   Maneja usuarios nuevos y existentes
   ============================================ */

(async () => {
    'use strict';

    const elementosIniciales = {
        loading: document.getElementById('loading-dashboard'),
        contenido: document.getElementById('contenido-dashboard')
    };

    function mostrarErrorInicial(mensaje) {
        if (elementosIniciales.loading) {
            elementosIniciales.loading.innerHTML = `
                <div class="text-center space-y-4">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 font-semibold">${mensaje}</p>
                    <button class="px-4 py-2 bg-primary-600 text-white rounded-lg" onclick="window.location.reload()">
                        Reintentar
                    </button>
                </div>`;
        }
        if (elementosIniciales.contenido) {
            elementosIniciales.contenido.classList.remove('hidden');
        }
    }

    // ============================================
    // ELEMENTOS BASE PARA MANEJAR EL ESTADO DE CARGA
    // ============================================
    const cargaUI = {
        contenido: document.getElementById('contenido-dashboard'),
        loading: document.getElementById('loading-dashboard')
    };

    function mostrarSeccionPrincipal() {
        if (cargaUI.loading) {
            cargaUI.loading.classList.add('hidden');
        }
        if (cargaUI.contenido) {
            cargaUI.contenido.classList.remove('hidden');
        }
    }

    function mostrarErrorDependencias(titulo, detalle) {
        mostrarSeccionPrincipal();

        if (!cargaUI.contenido) return;

        cargaUI.contenido.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-plug-circle-xmark text-red-600 dark:text-red-200 text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-red-700 dark:text-red-100 mb-3">${titulo}</h3>
                <p class="text-red-600 dark:text-red-200 mb-6">${detalle}</p>
                <button class="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors" onclick="window.location.reload()">
                    <i class="fas fa-rotate-right mr-2"></i>Reintentar
                </button>
            </div>
        `;
    }

    // ============================================
    // ELEMENTOS BASE PARA MANEJAR EL ESTADO DE CARGA
    // ============================================
    const cargaUI = {
        contenido: document.getElementById('contenido-dashboard'),
        loading: document.getElementById('loading-dashboard')
    };

    function mostrarSeccionPrincipal() {
        if (cargaUI.loading) {
            cargaUI.loading.classList.add('hidden');
        }
        if (cargaUI.contenido) {
            cargaUI.contenido.classList.remove('hidden');
        }
    }

    function mostrarErrorDependencias(titulo, detalle) {
        mostrarSeccionPrincipal();

        if (!cargaUI.contenido) return;

        cargaUI.contenido.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-plug-circle-xmark text-red-600 dark:text-red-200 text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-red-700 dark:text-red-100 mb-3">${titulo}</h3>
                <p class="text-red-600 dark:text-red-200 mb-6">${detalle}</p>
                <button class="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors" onclick="window.location.reload()">
                    <i class="fas fa-rotate-right mr-2"></i>Reintentar
                </button>
            </div>
        `;
    }

    // ============================================
    // ESPERAR DEPENDENCIAS
    // ============================================
    const dependencias = ['APP_CONFIG', 'ModuleLoader'];
    const moduleLoader = window.ModuleLoader;
    let apiClientReadyPromise = null;

    if (!moduleLoader || typeof moduleLoader.initModule !== 'function') {
        mostrarErrorDependencias('No se pudo preparar el dashboard', 'El cargador de módulos no está disponible. Asegúrate de incluir /assets/js/core/module-loader.js en el HTML.');
        return;
    }

    const inicializado = await moduleLoader.initModule({
        moduleName: 'Dashboard Estudiante',
        dependencies: dependencias,
        onReady: inicializarDashboard,
        onError: (error) => {
            console.error('💥 Error al cargar dashboard:', error);
            mostrarErrorDependencias('No se pudo iniciar el dashboard', 'Ocurrió un error inesperado durante la inicialización.');
        }
    });

    if (!inicializado) {
        const faltantes = dependencias.filter(dep => !window[dep]);
        const detalle = faltantes.length
            ? `No se cargaron las dependencias: ${faltantes.join(', ')}. Verifica que los scripts necesarios estén disponibles.`
            : 'El cargador de módulos no pudo inicializar esta página. Revisa la consola para más detalles.';
        mostrarErrorDependencias('No se pudo cargar el dashboard', detalle);
        return;
    }

    function esperarApiClient(maxWait = 10000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                if (window.apiClient) {
                    clearInterval(interval);
                    resolve(window.apiClient);
                    return;
                }
                if (window.APIClient) {
                    window.apiClient = new window.APIClient();
                    clearInterval(interval);
                    resolve(window.apiClient);
                    return;
                }

                if (Date.now() - start >= maxWait) {
                    clearInterval(interval);
                    reject(new Error('apiClient no estuvo listo dentro del tiempo esperado'));
                }
            }, 50);
        });
    }

    function cargarScriptAsync(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
            document.head.appendChild(script);
        });
    }

    async function asegurarApiClient() {
        if (window.apiClient) {
            return window.apiClient;
        }

        if (window.APIClient) {
            window.apiClient = new window.APIClient();
            return window.apiClient;
        }

        if (!apiClientReadyPromise) {
            apiClientReadyPromise = esperarApiClient();
        }

        try {
            return await apiClientReadyPromise;
        } catch (error) {
            console.warn('⌛ apiClient no estuvo listo a tiempo, reintentando con carga directa...', error);
            apiClientReadyPromise = null;

            try {
                await cargarScriptAsync('/assets/js/core/api-client.js');
            } catch (cargaError) {
                throw new Error(`No se pudo cargar el cliente API: ${cargaError.message}`);
            }

            if (window.apiClient) {
                return window.apiClient;
            }

            if (window.APIClient) {
                window.apiClient = new window.APIClient();
                return window.apiClient;
            }

            throw new Error('apiClient sigue sin inicializar después del reintento');
        }
    }

    // ============================================
    // FUNCIÓN PRINCIPAL
    // ============================================
    async function inicializarDashboard() {
        console.log('✅ Dashboard Estudiante iniciando...');

        mostrarSeccionPrincipal();

        let client;
        try {
            client = await asegurarApiClient();
        } catch (error) {
            console.error('💥 No fue posible asegurar apiClient para el dashboard:', error);
            mostrarErrorDependencias('No se pudo preparar el dashboard', 'No fue posible inicializar el cliente API en el navegador. Recarga la página o verifica que /assets/js/core/api-client.js esté accesible.');
            return;
        }
        const progressStore = window.StudentProgress || null;
        let seUsoDashboardLocal = false;
        let prehidratadoConLocal = false;

        // ===================================
        // ELEMENTOS DEL DOM
        // ===================================
        const elementos = {
            // Stats superiores
            diasRachaStat: document.getElementById('dias-racha-stat'),
            totalXPStat: document.getElementById('total-xp-stat'),
            leccionesCompletadasStat: document.getElementById('lecciones-completadas-stat'),
            nivelUsuarioStat: document.getElementById('nivel-usuario-stat'),
            idiomaAprendizajeStat: document.getElementById('idioma-aprendizaje-stat'),
            
            // Contenedor principal
            contenidoDashboard: document.getElementById('contenido-dashboard'),
            loadingDashboard: document.getElementById('loading-dashboard'),

            // Greeting
            greeting: document.getElementById('greeting'),
            logoutBtn: document.getElementById('logout-dashboard-btn')
        };

        // ===================================
        // CARGAR RESUMEN DEL ESTUDIANTE - CORREGIDO
        // ===================================
        async function cargarResumen() {
            try {
                console.log('🔄 Cargando resumen del estudiante...');

                const resultado = await client.get('/progreso/resumen');
                console.log('🔍 DEBUG Resultado completo:', resultado);

                if (!resultado.success) {
                    if (resultado.status === 404) {
                        if (!mostrarDashboardLocal()) {
                            mostrarEstadoInicial();
                        }
                        return;
                    }
                    throw new Error(resultado.error || `Error HTTP: ${resultado.status}`);
                }

                const datosReales = resultado.data?.data || resultado.data;
                if (!datosReales || typeof datosReales !== 'object' || Object.keys(datosReales).length === 0) {
                    console.warn('⚠️ No hay datos disponibles desde API, usando progreso local');
                    if (!mostrarDashboardLocal()) {
                        mostrarEstadoInicial();
                    }
                    return;
                }

                actualizarStatsSuperiores(datosReales);
                renderizarContenidoDinamico(datosReales);
                await cargarLeccionesRecomendadas();

            } catch (error) {
                console.error('❌ Error al cargar resumen:', error);
                if (!mostrarDashboardLocal()) {
                    if (error.message.includes('404') || error.message.includes('No hay datos')) {
                        mostrarEstadoInicial();
                    } else {
                        mostrarEstadoSinDatos('No se pudo conectar con el servidor. Intenta más tarde.');
                    }
                }
            }
        }

        // ===================================
        // CARGAR LECCIONES RECOMENDADAS - CORREGIDO
        // ===================================
        async function cargarLeccionesRecomendadas() {
            try {
                console.log('🔄 Cargando lecciones recomendadas...');

                if (progressStore) {
                    const locales = progressStore.getRecommendedLessons(8);
                    if (locales.length) {
                        renderizarLeccionesRecomendadas(locales);
                    }
                }

                const resultado = await client.get('/progreso/lecciones-recomendadas');
                console.log('📚 Resultado lecciones recomendadas:', resultado);

                if (!resultado.success) {
                    console.warn('⚠️ No se pudieron cargar lecciones recomendadas:', resultado.error);
                    return;
                }

                const data = resultado.data;
                const leccionesRecomendadas = data.lecciones_recomendadas || data.data || data || [];

                if (Array.isArray(leccionesRecomendadas) && leccionesRecomendadas.length > 0) {
                    renderizarLeccionesRecomendadas(leccionesRecomendadas);
                } else {
                    console.log('ℹ️ No hay lecciones recomendadas disponibles');
                }

            } catch (error) {
                console.error('❌ Error al cargar lecciones recomendadas:', error);
            }
        }

        function prehidratarDashboardLocal() {
            if (!progressStore || prehidratadoConLocal) return;
            const data = progressStore.getDashboardData();
            if (!data) return;
            prehidratadoConLocal = true;
            actualizarStatsSuperiores(data);
            renderizarContenidoDinamico(data);
            renderizarLeccionesRecomendadas(data.leccionesRecomendadas || []);
        }

        function mostrarDashboardLocal() {
            if (!progressStore) return false;
            if (seUsoDashboardLocal) return true;
            const data = progressStore.getDashboardData();
            if (!data) return false;
            actualizarStatsSuperiores(data);
            renderizarContenidoDinamico(data);
            seUsoDashboardLocal = true;
            return true;
        }

        // ===================================
        // MOSTRAR ESTADO INICIAL (USUARIO NUEVO)
        // ===================================
        function mostrarEstadoInicial() {
            console.log('🆕 Mostrando estado inicial para usuario nuevo');

            if (mostrarDashboardLocal()) {
                return;
            }

            // Resetear stats a valores iniciales
            if (elementos.diasRachaStat) elementos.diasRachaStat.textContent = '0';
            if (elementos.totalXPStat) elementos.totalXPStat.textContent = '0';
            if (elementos.leccionesCompletadasStat) elementos.leccionesCompletadasStat.textContent = '0';
            if (elementos.nivelUsuarioStat) elementos.nivelUsuarioStat.textContent = 'A1';
            if (elementos.idiomaAprendizajeStat) elementos.idiomaAprendizajeStat.textContent = 'Inglés';
            
            // Actualizar greeting con nombre genérico
            if (elementos.greeting) {
                const hora = new Date().getHours();
                let saludo = 'Buenos días';
                if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';
                if (hora >= 19) saludo = 'Buenas noches';
                elementos.greeting.textContent = `${saludo}!`;
            }
            
            // Renderizar dashboard para usuario nuevo
            if (elementos.contenidoDashboard) {
                elementos.contenidoDashboard.innerHTML = `
                    <div class="space-y-8">
                        <!-- Mensaje de Bienvenida para Usuario Nuevo -->
                        <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                            <div class="text-center">
                                <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-rocket text-4xl"></i>
                                </div>
                                <h2 class="text-3xl font-bold mb-3">¡Bienvenido a SpeakLexi!</h2>
                                <p class="text-lg text-purple-100 mb-6">Estás a punto de comenzar tu viaje de aprendizaje de idiomas</p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div class="bg-white/10 rounded-lg p-4">
                                        <i class="fas fa-book-open text-3xl mb-2"></i>
                                        <p class="font-semibold">Lecciones Interactivas</p>
                                    </div>
                                    <div class="bg-white/10 rounded-lg p-4">
                                        <i class="fas fa-trophy text-3xl mb-2"></i>
                                        <p class="font-semibold">Gana Logros</p>
                                    </div>
                                    <div class="bg-white/10 rounded-lg p-4">
                                        <i class="fas fa-users text-3xl mb-2"></i>
                                        <p class="font-semibold">Compite con Amigos</p>
                                    </div>
                                </div>
                                
                                <button onclick="comenzarPrimeraLeccion()" class="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg">
                                    <i class="fas fa-play mr-2"></i>Comenzar mi Primera Lección
                                </button>
                            </div>
                        </div>
                        
                        <!-- Grid de Información -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Cómo Empezar -->
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <i class="fas fa-lightbulb text-yellow-500"></i>
                                    ¿Cómo Empezar?
                                </h3>
                                <ol class="space-y-3 text-gray-700 dark:text-gray-300">
                                    <li class="flex items-start gap-3">
                                        <span class="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                        <span>Explora nuestro catálogo de lecciones</span>
                                    </li>
                                    <li class="flex items-start gap-3">
                                        <span class="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                        <span>Completa ejercicios interactivos</span>
                                    </li>
                                    <li class="flex items-start gap-3">
                                        <span class="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                        <span>Gana XP y desbloquea logros</span>
                                    </li>
                                    <li class="flex items-start gap-3">
                                        <span class="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                        <span>Sube en el ranking global</span>
                                    </li>
                                </ol>
                            </div>
                            
                            <!-- Tu Objetivo -->
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <i class="fas fa-target text-red-500"></i>
                                    Tu Objetivo de Aprendizaje
                                </h3>
                                <div class="space-y-4">
                                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Nivel Actual</p>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">A1 - Principiante</p>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Idioma</p>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">Inglés 🇬🇧</p>
                                    </div>
                                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
                                        <p class="text-sm text-purple-600 dark:text-purple-400 mb-2">Meta Diaria</p>
                                        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">30 minutos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Acciones Rápidas -->
                        ${generarAccionesRapidas()}
                    </div>
                `;
            }
            
            // Intentar cargar lecciones recomendadas
            cargarLeccionesRecomendadas().catch(() => {
                console.log('ℹ️ No se pudieron cargar lecciones recomendadas para usuario nuevo');
            });
        }

        // ===================================
        // ACTUALIZAR STATS SUPERIORES - CORREGIDO
        // ===================================
        function actualizarStatsSuperiores(data) {
            // ✅ CORRECCIÓN: Manejar diferentes estructuras de datos
            const usuario = data.usuario || data.perfil || {};
            const progreso = data.progreso || data.estadisticas || {};
            const estadisticas = data.estadisticas || {};
            const snapshot = progressStore?.getSnapshot();

            console.log('📈 Actualizando stats con:', { usuario, progreso, estadisticas });

            // Racha
            if (elementos.diasRachaStat) {
                elementos.diasRachaStat.textContent = estadisticas.rachaActual || usuario.racha_dias || snapshot?.rachaDias || 0;
            }

            // XP Total
            if (elementos.totalXPStat) {
                elementos.totalXPStat.textContent = usuario.xp || usuario.total_xp || estadisticas.puntosTotales || snapshot?.xp || 0;
            }

            // Lecciones Completadas
            if (elementos.leccionesCompletadasStat) {
                elementos.leccionesCompletadasStat.textContent =
                    progreso.leccionesCompletadas ||
                    estadisticas.lecciones_completadas ||
                    snapshot?.totalLecciones ||
                    0;
            }

            // Nivel e Idioma
            if (elementos.nivelUsuarioStat) {
                elementos.nivelUsuarioStat.textContent = usuario.nivel || usuario.nivel_actual || snapshot?.nivelActual || 'A1';
            }
            if (elementos.idiomaAprendizajeStat) {
                elementos.idiomaAprendizajeStat.textContent = usuario.idioma || usuario.idioma_aprendizaje || snapshot?.idiomaActual || 'Inglés';
            }

            // Actualizar greeting
            if (elementos.greeting) {
                const nombre = usuario.nombre || snapshot?.nombreCompleto || snapshot?.nombre || 'Estudiante';
                const hora = new Date().getHours();
                let saludo = 'Buenos días';
                if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';
                if (hora >= 19) saludo = 'Buenas noches';
                elementos.greeting.textContent = `${saludo}, ${nombre}!`;
            }
        }

        // ===================================
        // RENDERIZAR CONTENIDO DINÁMICO - CORREGIDO
        // ===================================
        function renderizarContenidoDinamico(data) {
            if (!elementos.contenidoDashboard) return;

            // ✅ CORRECCIÓN: Manejar diferentes estructuras de datos
            const usuario = data.usuario || data.perfil || {};
            const progreso = data.progreso || data.estadisticas || {};
            const leccionesEnProgreso = data.leccionesEnProgreso || data.lecciones_en_progreso || [];
            const snapshot = progressStore?.getSnapshot();
            const leccionesCompletadas = data.leccionesCompletadas || data.lecciones_completadas || data.actividadReciente || snapshot?.historial || [];
            const logros = (data.logros || data.logros_recientes || snapshot?.logros || []).filter(Boolean);
            const cursos = (data.cursos && data.cursos.length ? data.cursos : snapshot?.cursos) || [];
            const leccionesRecomendadas = data.leccionesRecomendadas || progressStore?.getRecommendedLessons(8) || [];

            // Verificar si hay datos mínimos
            const tieneDatosMinimos = usuario.nivel || progreso.leccionesCompletadas !== undefined;

            if (!tieneDatosMinimos) {
                mostrarEstadoInicial();
                return;
            }

            // Calcular progreso semanal
            const tiempoTotal = progreso.tiempoEstudio || data.tiempo_total_minutos || 0;
            const metaDiaria = 30;
            const porcentajeMeta = Math.min(100, Math.round((tiempoTotal / metaDiaria) * 100));

            let html = `
                <div class="space-y-8">
                    <!-- Grid Principal -->
                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <!-- Columna Izquierda - 2/3 width -->
                        <div class="xl:col-span-2 space-y-8">
                            ${generarContinuarAprendizaje(leccionesEnProgreso, usuario)}
                            ${generarGridProgreso(progreso, tiempoTotal, metaDiaria, porcentajeMeta)}
                            ${generarLeccionesRecientes(leccionesCompletadas)}
                            ${generarCursosEnProgreso(cursos)}
                        </div>

                        <!-- Columna Derecha - 1/3 width -->
                        <div class="space-y-8">
                            ${generarLeaderboard(usuario)}
                            ${generarLogros(logros)}
                            ${generarAccionesRapidas()}
                        </div>
                    </div>
                </div>
            `;

            elementos.contenidoDashboard.innerHTML = html;

            // Configurar event listeners después de renderizar
            configurarEventListenersDinamicos();

            if (leccionesRecomendadas.length) {
                renderizarLeccionesRecomendadas(leccionesRecomendadas);
            }
        }

        // ===================================
        // COMPONENTES DINÁMICOS - CORREGIDOS
        // ===================================

        function generarContinuarAprendizaje(leccionesEnProgreso, usuario) {
            const leccionActiva = leccionesEnProgreso[0];
            
            if (!leccionActiva) {
                return `
                    <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                        <div class="absolute inset-0 opacity-10">
                            <div class="absolute top-4 left-4 w-8 h-8 bg-white rounded-full"></div>
                            <div class="absolute bottom-8 right-8 w-12 h-12 bg-white rounded-full"></div>
                        </div>
                        
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                            <div class="flex-1">
                                <h3 class="text-2xl font-bold mb-2">¡Comienza tu aprendizaje!</h3>
                                <p class="text-purple-100 mb-4">Aún no has comenzado ninguna lección. ¡Es el momento perfecto para empezar!</p>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm opacity-90">Curso disponible</p>
                                        <p class="text-xl font-bold">${usuario.idioma || 'Inglés'}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm opacity-90">Tu nivel</p>
                                        <p class="text-xl font-bold">${usuario.nivel || 'A1'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex-shrink-0">
                                <button onclick="comenzarPrimeraLeccion()" class="w-full lg:w-auto bg-white text-purple-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105">
                                    <i class="fas fa-play"></i>
                                    <span>Comenzar Lección</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                    <div class="absolute inset-0 opacity-10">
                        <div class="absolute top-4 left-4 w-8 h-8 bg-white rounded-full"></div>
                        <div class="absolute bottom-8 right-8 w-12 h-12 bg-white rounded-full"></div>
                    </div>
                    
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold mb-2">¡Continúa tu aprendizaje!</h3>
                            <p class="text-purple-100 mb-4">Estás a punto de alcanzar el siguiente nivel. No te detengas ahora.</p>
                            
                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span>Progreso de la lección</span>
                                        <span>${leccionActiva.progreso || 0}%</span>
                                    </div>
                                    <div class="bg-white/20 rounded-full h-3">
                                        <div class="bg-white rounded-full h-3 transition-all duration-1000" style="width: ${leccionActiva.progreso || 0}%"></div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm opacity-90">Lección actual</p>
                                        <p class="text-xl font-bold">${leccionActiva.titulo || 'Lección en progreso'}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm opacity-90">Siguiente nivel</p>
                                        <p class="text-xl font-bold">${obtenerSiguienteNivel(usuario.nivel)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex-shrink-0">
                            <button onclick="iniciarLeccion(${leccionActiva.id})" class="w-full lg:w-auto bg-white text-purple-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105">
                                <i class="fas fa-play"></i>
                                <span>Continuar Lección</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function generarGridProgreso(progreso, tiempoTotal, metaDiaria, porcentajeMeta) {
            return `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Meta Diaria -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Meta Diaria</h3>
                            <span class="text-sm text-gray-600 dark:text-gray-400">${metaDiaria} min</span>
                        </div>
                        
                        <!-- Circular Progress -->
                        <div class="relative w-32 h-32 mx-auto mb-4">
                            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path class="text-gray-200 dark:text-gray-700" 
                                      d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none" stroke="currentColor" stroke-width="3"/>
                                <path class="text-green-500" 
                                      d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="${porcentajeMeta}, 100"
                                      stroke-linecap="round"/>
                                <text x="18" y="20.5" class="text-4px font-bold fill-current text-gray-900 dark:text-white" text-anchor="middle" transform="rotate(90 18 18)">${tiempoTotal}/${metaDiaria}</text>
                            </svg>
                        </div>
                        
                        <p class="text-center text-sm text-gray-600 dark:text-gray-400">${tiempoTotal} de ${metaDiaria} minutos completados hoy</p>
                    </div>

                    <!-- Estadísticas Rápidas -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Tu Progreso</h3>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-check-circle text-blue-600 dark:text-blue-400"></i>
                                    </div>
                                    <span class="text-gray-700 dark:text-gray-300">Lecciones Completadas</span>
                                </div>
                                <span class="text-xl font-bold text-blue-600 dark:text-blue-400">${progreso.leccionesCompletadas || 0}</span>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-clock text-green-600 dark:text-green-400"></i>
                                    </div>
                                    <span class="text-gray-700 dark:text-gray-300">Tiempo de Estudio</span>
                                </div>
                                <span class="text-xl font-bold text-green-600 dark:text-green-400">${tiempoTotal}m</span>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-chart-line text-purple-600 dark:text-purple-400"></i>
                                    </div>
                                    <span class="text-gray-700 dark:text-gray-300">Progreso General</span>
                                </div>
                                <span class="text-xl font-bold text-purple-600 dark:text-purple-400">${progreso.general || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function generarLeccionesRecientes(leccionesCompletadas) {
            const leccionesRecientes = leccionesCompletadas.slice(0, 3);

            if (leccionesRecientes.length === 0) {
                return `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Lecciones Recientes</h3>
                        </div>
                        <div class="text-center py-8">
                            <i class="fas fa-book-open text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                            <p class="text-gray-500 dark:text-gray-400">Aún no has completado lecciones</p>
                            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">¡Comienza tu primera lección!</p>
                        </div>
                    </div>
                `;
            }

            const tarjetasRecientes = leccionesRecientes
                .map((leccion) => {
                    const destinoLocal = leccion.idioma
                        ? `irALecciones('${leccion.idioma}','${leccion.nivel || 'A1'}')`
                        : `verLeccion(${leccion.id})`;
                    const xp = leccion.xp_ganado || leccion.xp || 0;
                    const titulo = leccion.titulo || `${leccion.idioma?.toUpperCase() || 'Lección'} ${leccion.nivel || ''}`;
                    const fecha = formatearFecha(leccion.fechaActualizacion || leccion.fecha_completada);

                    return `
                        <div class="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all cursor-pointer group transform hover:-translate-y-0.5" onclick="${destinoLocal}">
                            <div class="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i class="fas fa-check text-green-600 dark:text-green-400 text-lg"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-semibold text-gray-900 dark:text-white">${titulo}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Completado - ${xp} XP</p>
                            </div>
                            <div class="text-right">
                                <span class="text-2xl">✅</span>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${fecha}</p>
                            </div>
                        </div>
                    `;
                })
                .join('');

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Lecciones Recientes</h3>
                        <button onclick="verTodasLecciones()" class="text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold transition-colors duration-200">Ver todas</button>
                    </div>

                    <div class="space-y-4">
                        ${tarjetasRecientes}
                    </div>
                </div>
            `;
        }

        function generarCursosEnProgreso(cursos) {
            if (cursos.length === 0) {
                return `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Tus Cursos</h3>
                        <div class="text-center py-8">
                            <i class="fas fa-graduation-cap text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                            <p class="text-gray-500 dark:text-gray-400">No estás inscrito en ningún curso</p>
                            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">¡Explora nuestros cursos disponibles!</p>
                        </div>
                    </div>
                `;
            }

            const cursosHtml = cursos
                .map((curso) => `
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all cursor-pointer group transform hover:-translate-y-0.5" onclick="verCurso('${curso.id || curso.idiomaKey}')">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-white text-lg">
                            ${curso.icono || '📚'}
                        </div>
                        <div class="flex-1">
                            <p class="font-semibold text-gray-900 dark:text-white">${curso.nombre}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${curso.nivel} - ${curso.progreso || 0}% completado</p>
                            ${curso.activo ? '<span class="inline-flex items-center mt-2 text-xs text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Curso activo</span>' : ''}
                            <div class="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div class="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-1000" style="width: ${curso.progreso || 0}%"></div>
                            </div>
                        </div>
                        <span class="text-2xl">${curso.icono || '📚'}</span>
                    </div>
                `)
                .join('');

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Tus Cursos</h3>
                    <div class="space-y-4">
                        ${cursosHtml}
                    </div>
                </div>
            `;
        }

        function generarLeaderboard(usuario) {
            const nombreCompleto = `${usuario.nombre || 'Usuario'} ${usuario.primer_apellido || ''}`;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=6366f1&color=fff`;

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Tu Progreso</h3>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Usuario actual -->
                        <div class="flex items-center gap-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800">
                            <img src="${avatarUrl}" class="w-12 h-12 rounded-full border-2 border-primary-500" alt="">
                            <div class="flex-1">
                                <p class="font-semibold text-primary-600 dark:text-primary-400">${usuario.nombre || 'Estudiante'}</p>
                                <p class="text-sm text-primary-500 dark:text-primary-400">Nivel ${usuario.nivel || 'A1'}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <i class="fas fa-star text-yellow-500"></i>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">${usuario.xp || 0} XP</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <p class="text-2xl font-bold text-gray-900 dark:text-white">${usuario.xp || 0}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">XP Total</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <p class="text-2xl font-bold text-gray-900 dark:text-white">${usuario.nivel || 'A1'}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Nivel</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function generarLogros(logros) {
            if (logros.length === 0) {
                return `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Logros</h3>
                        </div>
                        <div class="text-center py-4">
                            <i class="fas fa-trophy text-gray-300 dark:text-gray-600 text-3xl mb-3"></i>
                            <p class="text-gray-500 dark:text-gray-400">Aún no tienes logros</p>
                            <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">¡Completa lecciones para desbloquearlos!</p>
                        </div>
                    </div>
                `;
            }

            const logrosHtml = logros
                .slice(0, 3)
                .map((logro) => `
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">🎯</span>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">${logro.titulo || 'Logro desbloqueado'}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${logro.descripcion || '¡Felicidades!'}</p>
                            <div class="mt-1 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                <i class="fas fa-gem"></i>
                                <span>+${logro.xp_otorgado || 50} XP</span>
                            </div>
                        </div>
                    </div>
                `)
                .join('');

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Logros Recientes</h3>
                    </div>

                    <div class="space-y-4">
                        ${logrosHtml}
                    </div>
                </div>
            `;
        }

        function generarAccionesRapidas() {
            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="verLeccionesRecomendadas()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group transform hover:-translate-y-0.5">
                            <i class="fas fa-search text-gray-600 dark:text-gray-400 text-xl mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"></i>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Buscar Lecciones</span>
                        </button>
                        
                        <button onclick="verComunidad()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group transform hover:-translate-y-0.5">
                            <i class="fas fa-users text-gray-600 dark:text-gray-400 text-xl mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"></i>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Comunidad</span>
                        </button>
                        
                        <button onclick="mostrarAyuda()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group transform hover:-translate-y-0.5">
                            <i class="fas fa-question-circle text-gray-600 dark:text-gray-400 text-xl mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"></i>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Ayuda</span>
                        </button>
                        
                        <button onclick="recargarDashboard()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group transform hover:-translate-y-0.5">
                            <i class="fas fa-sync-alt text-gray-600 dark:text-gray-400 text-xl mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"></i>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Actualizar</span>
                        </button>
                    </div>
                </div>
            `;
        }

        // ===================================
        // RENDERIZAR LECCIONES RECOMENDADAS
        // ===================================
        function renderizarLeccionesRecomendadas(lecciones) {
            if (!elementos.contenidoDashboard) return;
            const existente = document.getElementById('recommended-lessons-section');
            if (existente) existente.remove();
            if (!lecciones.length) return;

            const tarjetasHtml = lecciones
                .map((leccion) => `
                    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                                ${leccion.titulo}
                            </h3>
                            <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                ${leccion.nivel}
                            </span>
                        </div>

                        <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                            ${leccion.descripcion || 'Sin descripción'}
                        </p>

                        <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span>⏱️ ${leccion.duracion_minutos || 30} min</span>
                            <span>🌍 ${leccion.idiomaLabel || leccion.idioma || 'Inglés'}</span>
                        </div>

                        <button
                            onclick="iniciarLeccionRecomendada('${leccion.idioma || 'ingles'}','${leccion.nivel || 'A1'}')"
                            class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            Comenzar Lección
                        </button>
                    </div>
                `)
                .join('');

            const html = `
                <div id="recommended-lessons-section" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                            Lecciones Recomendadas
                        </h2>
                        <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            ${lecciones.length} disponibles
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${tarjetasHtml}
                    </div>
                </div>
            `;

            elementos.contenidoDashboard.insertAdjacentHTML('beforeend', html);
        }

        // ===================================
        // FUNCIONES AUXILIARES
        // ===================================
        function formatearFecha(fecha) {
            if (!fecha) return 'Fecha no disponible';
            try {
                const date = new Date(fecha);
                const ahora = new Date();
                const diff = ahora - date;
                const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

                if (dias === 0) return 'Hoy';
                if (dias === 1) return 'Ayer';
                if (dias < 7) return `Hace ${dias} días`;
                
                return date.toLocaleDateString('es-MX', { 
                    day: 'numeric', 
                    month: 'short' 
                });
            } catch (error) {
                return 'Fecha inválida';
            }
        }

        function obtenerSiguienteNivel(nivelActual) {
            const niveles = {
                'A1': 'A2',
                'A2': 'B1', 
                'B1': 'B2',
                'B2': 'C1',
                'C1': 'C2',
                'C2': 'C2+'
            };
            return niveles[nivelActual] || 'A2';
        }

        function configurarEventListenersDinamicos() {
            // Los event listeners se configuran mediante onclick en los elementos
        }

        elementos.logoutBtn?.addEventListener('click', manejarLogout);

        async function manejarLogout() {
            elementos.logoutBtn.disabled = true;
            elementos.logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saliendo...';
            try {
                await window.apiClient.logout();
            } catch (error) {
                console.warn('⚠️ Error cerrando sesión:', error);
            } finally {
                localStorage.clear();
                window.location.href = '/pages/auth/login.html';
            }
        }

        function mostrarEstadoSinDatos(mensaje) {
            console.error('📭 Estado sin datos:', mensaje);

            mostrarSeccionPrincipal();

            if (elementos.contenidoDashboard) {
                elementos.contenidoDashboard.innerHTML = `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-yellow-800 mb-2">No hay datos disponibles</h3>
                        <p class="text-yellow-700 mb-6">${mensaje}</p>
                        <div class="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                onclick="window.location.reload()"
                                class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
                                <i class="fas fa-sync-alt mr-2"></i>Reintentar
                            </button>
                            <button 
                                onclick="comenzarPrimeraLeccion()"
                                class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold">
                                <i class="fas fa-play mr-2"></i>Comenzar Lección
                            </button>
                        </div>
                    </div>
                `;
            }

            // Resetear stats a cero
            if (elementos.diasRachaStat) elementos.diasRachaStat.textContent = '0';
            if (elementos.totalXPStat) elementos.totalXPStat.textContent = '0';
            if (elementos.leccionesCompletadasStat) elementos.leccionesCompletadasStat.textContent = '0';
            if (elementos.nivelUsuarioStat) elementos.nivelUsuarioStat.textContent = 'A1';
            if (elementos.idiomaAprendizajeStat) elementos.idiomaAprendizajeStat.textContent = 'Inglés';
            if (elementos.greeting) elementos.greeting.textContent = '¡Bienvenido!';
        }

        function mostrarErrorDashboard(mensaje) {
            console.error('💥 Error dashboard:', mensaje);
            mostrarSeccionPrincipal();
            mostrarEstadoSinDatos(mensaje);
        }

        // ===================================
        // FUNCIONES GLOBALES PARA BOTONES
        // ===================================
        window.iniciarLeccion = function(leccionId) {
            window.location.href = `/pages/estudiante/leccion-activa.html?id=${leccionId}`;
        };

        window.verLeccion = function(leccionId) {
            window.location.href = `/pages/estudiante/leccion-detalle.html?id=${leccionId}`;
        };

        window.verCurso = function(cursoId) {
            const snapshot = progressStore?.getSnapshot();
            const cursoIdString = `${cursoId}`;
            if (!Number.isFinite(Number(cursoIdString))) {
                const idioma = cursoIdString.split('-')[0] || snapshot?.idiomaKey || 'ingles';
                const nivel = snapshot?.nivelActual || 'A1';
                window.irALecciones(idioma, nivel);
                return;
            }
            window.location.href = `/pages/estudiante/curso-detalle.html?id=${cursoId}`;
        };

        window.verLeccionesRecomendadas = function() {
            window.location.href = '/pages/estudiante/lecciones.html';
        };

        window.verTodasLecciones = function() {
            window.location.href = '/pages/estudiante/lecciones.html';
        };

        window.verComunidad = function() {
            window.location.href = '/pages/comunidad/foro.html';
        };

        window.mostrarAyuda = function() {
            window.location.href = '/pages/ayuda/centro-ayuda.html';
        };

        window.recargarDashboard = function() {
            window.location.reload();
        };

        // ✅ NUEVA FUNCIÓN PARA USUARIOS NUEVOS
        window.comenzarPrimeraLeccion = function() {
            console.log('🚀 Usuario nuevo comenzando primera lección');
            window.location.href = '/pages/estudiante/lecciones.html?filtro=principiante';
        };

        window.iniciarLeccionRecomendada = function(idioma, nivel) {
            const params = new URLSearchParams({ idioma, nivel, autoStart: 'true' });
            window.location.href = `/pages/estudiante/lecciones.html?${params.toString()}`;
        };

        window.irALecciones = function(idioma, nivel = 'A1') {
            const params = new URLSearchParams({ idioma, nivel, autoStart: 'true' });
            window.location.href = `/pages/estudiante/lecciones.html?${params.toString()}`;
        };

        // ===================================
        // INICIALIZACIÓN
        // ===================================
        
        // Pre-hidratar con datos locales para que el estudiante siempre vea contenido aunque no haya API
        prehidratarDashboardLocal();

        // Cargar datos
        await cargarResumen();

        console.log('✅ Dashboard Estudiante listo');
    }

})();