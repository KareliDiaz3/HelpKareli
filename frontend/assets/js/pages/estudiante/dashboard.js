/* ============================================
   SPEAKLEXI - Dashboard Estudiante
   Conectado a API real - SIN MOCK DATA
   ============================================ */

(async () => {
    'use strict';

    // ============================================
    // ESPERAR DEPENDENCIAS
    // ============================================
    const dependencias = ['APP_CONFIG', 'apiClient', 'ModuleLoader'];

    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Dashboard Estudiante',
        dependencies: dependencias,
        onReady: inicializarDashboard,
        onError: (error) => {
            console.error('💥 Error al cargar dashboard:', error);
            mostrarErrorDashboard('Error al cargar el dashboard');
        }
    });

    if (!inicializado) return;

    // ============================================
    // FUNCIÓN PRINCIPAL
    // ============================================
    async function inicializarDashboard() {
        console.log('✅ Dashboard Estudiante iniciando...');

        const client = window.apiClient;

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
            greeting: document.getElementById('greeting')
        };

        // ===================================
        // CARGAR RESUMEN DEL ESTUDIANTE
        // ===================================
        async function cargarResumen() {
            try {
                console.log('🔄 Cargando resumen del estudiante...');
                
                const response = await client.get('/progreso/resumen');
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log('📊 Datos del dashboard cargados:', data);

                // Verificar si hay datos reales
                if (!data || Object.keys(data).length === 0) {
                    throw new Error('No hay datos disponibles en la respuesta');
                }

                // Actualizar stats superiores
                actualizarStatsSuperiores(data);

                // Renderizar contenido dinámico
                renderizarContenidoDinamico(data);

                // Cargar lecciones recomendadas
                await cargarLeccionesRecomendadas();

            } catch (error) {
                console.error('❌ Error al cargar resumen:', error);
                mostrarEstadoSinDatos('No se pudieron cargar los datos del dashboard. Verifica tu conexión o intenta más tarde.');
            }
        }

        // ===================================
        // CARGAR LECCIONES RECOMENDADAS
        // ===================================
        async function cargarLeccionesRecomendadas() {
            try {
                console.log('🔄 Cargando lecciones recomendadas...');
                
                const response = await client.get('/progreso/lecciones-recomendadas');
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log('📚 Lecciones recomendadas cargadas:', data);

                // Verificar si hay lecciones recomendadas
                if (data.lecciones_recomendadas && data.lecciones_recomendadas.length > 0) {
                    renderizarLeccionesRecomendadas(data.lecciones_recomendadas);
                } else {
                    console.log('ℹ️ No hay lecciones recomendadas disponibles');
                }

            } catch (error) {
                console.error('❌ Error al cargar lecciones recomendadas:', error);
                // No mostramos error al usuario para lecciones recomendadas
            }
        }

        // ===================================
        // ACTUALIZAR STATS SUPERIORES
        // ===================================
        function actualizarStatsSuperiores(data) {
            const perfil = data.perfil || {};
            const estadisticas = data.estadisticas || {};

            console.log('📈 Actualizando stats con:', { perfil, estadisticas });

            // Racha 
            if (elementos.diasRachaStat) {
                elementos.diasRachaStat.textContent = perfil.racha_dias || 0;
            }

            // XP Total
            if (elementos.totalXPStat) {
                elementos.totalXPStat.textContent = perfil.total_xp || 0;
            }

            // Lecciones Completadas
            if (elementos.leccionesCompletadasStat) {
                elementos.leccionesCompletadasStat.textContent = estadisticas.lecciones_completadas || 0;
            }

            // Nivel e Idioma
            if (elementos.nivelUsuarioStat) {
                elementos.nivelUsuarioStat.textContent = perfil.nivel_actual || 'A1';
            }
            if (elementos.idiomaAprendizajeStat) {
                elementos.idiomaAprendizajeStat.textContent = perfil.idioma_aprendizaje || 'Inglés';
            }

            // Actualizar greeting
            if (elementos.greeting) {
                const nombre = perfil.nombre || 'Estudiante';
                const hora = new Date().getHours();
                let saludo = 'Buenos días';
                if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';
                if (hora >= 19) saludo = 'Buenas noches';
                elementos.greeting.textContent = `${saludo}, ${nombre}!`;
            }
        }

        // ===================================
        // RENDERIZAR CONTENIDO DINÁMICO
        // ===================================
        function renderizarContenidoDinamico(data) {
            if (!elementos.contenidoDashboard) return;

            const perfil = data.perfil || {};
            const estadisticas = data.estadisticas || {};
            const leccionesEnProgreso = data.lecciones_en_progreso || [];
            const leccionesCompletadas = data.lecciones_completadas || [];
            const logros = data.logros_recientes || [];

            // Verificar si hay datos mínimos
            const tieneDatosMinimos = perfil.nivel_actual || estadisticas.lecciones_completadas !== undefined;

            if (!tieneDatosMinimos) {
                mostrarEstadoSinDatos('No hay datos de progreso disponibles. Comienza tu primera lección.');
                return;
            }

            // Calcular progreso semanal
            const tiempoTotal = estadisticas.tiempo_total_minutos || 0;
            const metaDiaria = 30;
            const porcentajeMeta = Math.min(100, Math.round((tiempoTotal / metaDiaria) * 100));

            let html = `
                <div class="space-y-8">
                    <!-- Grid Principal -->
                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <!-- Columna Izquierda - 2/3 width -->
                        <div class="xl:col-span-2 space-y-8">
                            ${generarContinuarAprendizaje(leccionesEnProgreso, perfil)}
                            ${generarGridProgreso(estadisticas, tiempoTotal, metaDiaria, porcentajeMeta)}
                            ${generarLeccionesRecientes(leccionesCompletadas)}
                            ${generarLeccionesEnProgreso(leccionesEnProgreso)}
                        </div>

                        <!-- Columna Derecha - 1/3 width -->
                        <div class="space-y-8">
                            ${generarLeaderboard(perfil)}
                            ${generarLogros(logros)}
                            ${generarAccionesRapidas()}
                        </div>
                    </div>
                </div>
            `;

            elementos.contenidoDashboard.innerHTML = html;

            // Configurar event listeners después de renderizar
            configurarEventListenersDinamicos();
        }

        // ===================================
        // COMPONENTES DINÁMICOS
        // ===================================

        function generarContinuarAprendizaje(leccionesEnProgreso, perfil) {
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
                                        <p class="text-xl font-bold">${perfil.idioma_aprendizaje || 'Inglés'}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm opacity-90">Tu nivel</p>
                                        <p class="text-xl font-bold">${perfil.nivel_actual || 'A1'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex-shrink-0">
                                <button onclick="verLeccionesRecomendadas()" class="w-full lg:w-auto bg-white text-purple-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105">
                                    <i class="fas fa-play"></i>
                                    <span>Ver Lecciones</span>
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
                                        <p class="text-xl font-bold">${obtenerSiguienteNivel(perfil.nivel_actual)}</p>
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

        function generarGridProgreso(estadisticas, tiempoTotal, metaDiaria, porcentajeMeta) {
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

                    <!-- Progreso Semanal -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Progreso Semanal</h3>
                        
                        <div class="space-y-4">
                            <div class="text-center py-8">
                                <i class="fas fa-chart-line text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                                <p class="text-gray-500 dark:text-gray-400">Progreso semanal no disponible</p>
                                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Completa más lecciones para ver tu progreso</p>
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

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Lecciones Recientes</h3>
                        <button onclick="verTodasLecciones()" class="text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold transition-colors duration-200">Ver todas</button>
                    </div>
                    
                    <div class="space-y-4">
                        ${leccionesRecientes.map(leccion => `
                            <div class="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all cursor-pointer group transform hover:-translate-y-0.5" onclick="verLeccion(${leccion.id})">
                                <div class="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i class="fas fa-check text-green-600 dark:text-green-400 text-lg"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-900 dark:text-white">${leccion.titulo}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Completado - ${leccion.xp_ganado || 0} XP</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-2xl">✅</span>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${formatearFecha(leccion.fecha_completada)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function generarLeccionesEnProgreso(leccionesEnProgreso) {
            if (leccionesEnProgreso.length === 0) {
                return `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Lecciones en Progreso</h3>
                        <div class="text-center py-8">
                            <i class="fas fa-play-circle text-gray-300 dark:text-gray-600 text-4xl mb-4"></i>
                            <p class="text-gray-500 dark:text-gray-400">No tienes lecciones en progreso</p>
                            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">¡Comienza una nueva lección!</p>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Lecciones en Progreso</h3>
                    <div class="space-y-4">
                        ${leccionesEnProgreso.map(leccion => `
                            <div class="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all cursor-pointer group transform hover:-translate-y-0.5" onclick="iniciarLeccion(${leccion.id})">
                                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i class="fas fa-play text-blue-600 dark:text-blue-400 text-lg"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-900 dark:text-white">${leccion.titulo}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">En progreso - ${leccion.progreso || 0}%</p>
                                    <div class="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <div class="bg-blue-500 rounded-full h-2 transition-all duration-1000" style="width: ${leccion.progreso || 0}%"></div>
                                    </div>
                                </div>
                                <span class="text-2xl">📖</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function generarLeaderboard(perfil) {
            const nombreCompleto = `${perfil.nombre || 'Usuario'} ${perfil.primer_apellido || ''}`;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=6366f1&color=fff`;

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Clasificación Global</h3>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Usuario actual -->
                        <div class="flex items-center gap-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800">
                            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">-</span>
                            <img src="${avatarUrl}" class="w-8 h-8 rounded-full border-2 border-primary-500" alt="">
                            <div class="flex-1">
                                <p class="font-semibold text-sm text-primary-600 dark:text-primary-400">Tú</p>
                                <p class="text-xs text-primary-500 dark:text-primary-400">${perfil.total_xp || 0} XP</p>
                            </div>
                            <div class="text-xs bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
                                Nuevo
                            </div>
                        </div>
                        
                        <div class="text-center py-4">
                            <i class="fas fa-trophy text-gray-300 dark:text-gray-600 text-2xl mb-2"></i>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">Clasificación no disponible</p>
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

            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Logros Recientes</h3>
                    </div>
                    
                    <div class="space-y-4">
                        ${logros.slice(0, 3).map(logro => `
                            <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                                <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                    <span class="text-2xl">🎯</span>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-900 dark:text-white">${logro.titulo}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">${logro.descripcion}</p>
                                    <div class="mt-1 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                        <i class="fas fa-gem"></i>
                                        <span>+${logro.xp_otorgado || 50} XP</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
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
            if (!elementos.contenidoDashboard || lecciones.length === 0) return;

            const html = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                            Lecciones Recomendadas
                        </h2>
                        <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            ${lecciones.length} disponibles
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${lecciones.map(leccion => `
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
                                    <span>⏱️ ${leccion.duracion_minutos} min</span>
                                    <span>🌍 ${leccion.idioma}</span>
                                </div>
                                
                                <button 
                                    onclick="iniciarLeccion(${leccion.id})"
                                    class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Comenzar Lección
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            elementos.contenidoDashboard.innerHTML += html;
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

        function mostrarEstadoSinDatos(mensaje) {
            console.error('📭 Estado sin datos:', mensaje);
            
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
                                onclick="verLeccionesRecomendadas()"
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

        // ===================================
        // INICIALIZACIÓN
        // ===================================
        
        // Ocultar loading y mostrar contenido
        if (elementos.loadingDashboard) {
            elementos.loadingDashboard.classList.add('hidden');
        }
        if (elementos.contenidoDashboard) {
            elementos.contenidoDashboard.classList.remove('hidden');
        }

        // Cargar datos
        await cargarResumen();

        console.log('✅ Dashboard Estudiante listo');
    }

})();