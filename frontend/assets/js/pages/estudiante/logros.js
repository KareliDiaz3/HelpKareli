/* ============================================
   SPEAKLEXI - LOGROS Y RECOMPENSAS
   Archivo: assets/js/pages/estudiante/logros.js
   ============================================ */

(() => {
    'use strict';

    // VERIFICAR DEPENDENCIAS
    const deps = ['APP_CONFIG', 'apiClient', 'toastManager', 'Utils'];
    for (const dep of deps) {
        if (!window[dep]) {
            console.error(`❌ ${dep} no cargado`);
            return;
        }
    }

    // CONFIGURACIÓN
    const config = {
        API: window.APP_CONFIG.API,
        ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS
    };

    // ELEMENTOS DOM
    const elementos = {
        perfilGamificacion: document.getElementById('perfil-gamificacion'),
        logrosContainer: document.getElementById('logros-container'),
        rachaVisualizacion: document.getElementById('racha-visualizacion'),
        proximasRecompensas: document.getElementById('proximas-recompensas'),
        loadingIndicator: document.getElementById('loading-indicator'),
        errorMessage: document.getElementById('error-message')
    };

    // ESTADO
    let estado = {
        usuario: null,
        perfil: null,
        logros: [],
        racha: null,
        isLoading: false
    };

    // FUNCIONES PRINCIPALES
    function init() {
        verificarAuth();
        cargarDatos();
    }

    function verificarAuth() {
        estado.usuario = window.Utils.getFromStorage('usuario');
        if (!estado.usuario) {
            window.location.href = '/pages/auth/login.html';
            return;
        }
    }

    async function cargarDatos() {
        try {
            estado.isLoading = true;
            mostrarLoading(true);
            ocultarError();

            // Cargar todos los datos en paralelo
            const [perfilResponse, logrosResponse, rachaResponse] = await Promise.all([
                window.apiClient.get('/api/gamificacion/nivel'),
                window.apiClient.get('/api/gamificacion/logros'),
                window.apiClient.get('/api/gamificacion/racha')
            ]);

            if (perfilResponse.success && logrosResponse.success && rachaResponse.success) {
                estado.perfil = perfilResponse.data;
                estado.logros = logrosResponse.data.logros || [];
                estado.racha = rachaResponse.data.racha;
                
                renderizarUI();
                window.toastManager.success('Datos de logros cargados');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }

        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarError('Error al cargar los logros. Intenta nuevamente.');
            window.toastManager.error('Error al cargar logros');
        } finally {
            estado.isLoading = false;
            mostrarLoading(false);
        }
    }

    function renderizarUI() {
        renderizarPerfil();
        renderizarLogros();
        renderizarRacha();
        renderizarProximasRecompensas();
    }

    function renderizarPerfil() {
        if (!estado.perfil) return;

        const progreso = estado.perfil.progreso_nivel || 0;
        const xpFaltante = estado.perfil.xp_faltante || 0;
        
        elementos.perfilGamificacion.innerHTML = `
            <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-8 rounded-2xl shadow-lg text-center">
                <div class="text-6xl font-bold mb-2">Nivel ${estado.perfil.nivel}</div>
                <p class="text-xl mb-1">${estado.perfil.total_xp} XP</p>
                <p class="text-sm opacity-90 mb-6">${estado.perfil.nivel_cefr || 'A1'}</p>
                
                <div class="bg-white/20 rounded-full h-4 mb-3">
                    <div class="bg-white rounded-full h-4 transition-all duration-1000 ease-out" 
                         style="width: ${progreso}%"></div>
                </div>
                
                <div class="flex justify-between text-sm">
                    <span>Nivel ${estado.perfil.nivel}</span>
                    <span class="opacity-90">${xpFaltante} XP para el siguiente</span>
                    <span>Nivel ${estado.perfil.nivel + 1}</span>
                </div>
            </div>
        `;
    }

    function renderizarLogros() {
        if (estado.logros.length === 0) {
            elementos.logrosContainer.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <i class="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No hay logros disponibles</p>
                    <p class="text-gray-400 text-sm mt-2">Completa actividades para desbloquear logros</p>
                </div>
            `;
            return;
        }

        let html = '';
        
        estado.logros.forEach(logro => {
            const desbloqueado = logro.desbloqueado;
            const tieneProgreso = logro.progreso !== undefined;
            
            const clasesBase = 'p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105';
            const clasesColor = desbloqueado 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-200 dark:shadow-yellow-800' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
            
            const clasesEstado = desbloqueado ? '' : 'grayscale opacity-70';
            const icono = desbloqueado ? logro.icono : '🔒';

            html += `
                <div class="${clasesBase} ${clasesColor} ${clasesEstado}">
                    <div class="text-5xl mb-4 text-center">${icono}</div>
                    <h3 class="text-xl font-bold mb-2 text-center">${logro.nombre}</h3>
                    <p class="text-sm opacity-90 text-center mb-4">${logro.descripcion}</p>
                    
                    ${desbloqueado && logro.fecha_desbloqueo ? `
                        <div class="text-center">
                            <span class="text-xs bg-white/20 px-3 py-1 rounded-full">
                                ${formatearFechaRelativa(logro.fecha_desbloqueo)}
                            </span>
                        </div>
                    ` : ''}
                    
                    ${!desbloqueado && tieneProgreso ? `
                        <div class="mt-4">
                            <div class="bg-white/20 rounded-full h-2 mb-2">
                                <div class="bg-white rounded-full h-2 transition-all duration-500" 
                                     style="width: ${logro.progreso}%"></div>
                            </div>
                            <p class="text-xs text-center opacity-90">${logro.progreso}% completado</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        elementos.logrosContainer.innerHTML = html;
    }

    function renderizarRacha() {
        if (!estado.racha) return;

        const rachaActiva = estado.racha.activa;
        const diasRacha = estado.racha.dias || 0;
        
        // Generar calendario de últimos 7 días
        let calendarioHTML = '';
        const hoy = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(hoy.getDate() - i);
            const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
            const diaMes = fecha.getDate();
            
            // Simular días activos (en producción esto vendría del backend)
            const diaActivo = i <= diasRacha - 1 && rachaActiva;
            
            calendarioHTML += `
                <div class="text-center">
                    <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">${diaSemana}</div>
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                                ${diaActivo ? 
                                    'bg-green-500 text-white shadow-lg transform scale-110' : 
                                    'bg-gray-200 dark:bg-gray-600 text-gray-500'} 
                                transition-all duration-300">
                        ${diaMes}
                    </div>
                </div>
            `;
        }

        elementos.rachaVisualizacion.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">${diasRacha} días</p>
                        <p class="text-gray-600 dark:text-gray-400 ${rachaActiva ? 'text-green-600' : 'text-red-600'}">
                            ${rachaActiva ? '🔥 Racha activa' : '❌ Racha perdida'}
                        </p>
                    </div>
                    <div class="text-orange-500 transform hover:scale-110 transition-transform">
                        <i class="fas fa-fire text-4xl ${rachaActiva ? 'animate-pulse' : ''}"></i>
                    </div>
                </div>
                
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                    ${rachaActiva ? 
                        `¡Sigue así! Tu racha está activa` : 
                        `Completa una lección hoy para reactivar tu racha`}
                </div>
                
                <div class="flex justify-between items-center">
                    ${calendarioHTML}
                </div>
                
                ${diasRacha >= 7 ? `
                    <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                        <p class="text-yellow-700 dark:text-yellow-300 text-sm font-semibold">
                            🎉 ¡Racha de 7 días completada! +20 XP
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderizarProximasRecompensas() {
        const logrosNoDesbloqueados = estado.logros.filter(logro => !logro.desbloqueado);
        const proximosLogros = logrosNoDesbloqueados.slice(0, 3);

        if (proximosLogros.length === 0) {
            elementos.proximasRecompensas.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-star text-3xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">¡Felicidades! Has desbloqueado todos los logros disponibles</p>
                </div>
            `;
            return;
        }

        let html = '<div class="space-y-4">';
        
        proximosLogros.forEach(logro => {
            const progreso = logro.progreso || 0;
            
            html += `
                <div class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 
                          hover:shadow-lg transition-all duration-300">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="text-2xl opacity-50">${logro.icono}</div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 dark:text-white">${logro.nombre}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${logro.descripcion}</p>
                        </div>
                    </div>
                    
                    <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" 
                             style="width: ${progreso}%"></div>
                    </div>
                    
                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Progreso</span>
                        <span class="font-semibold">${progreso}%</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        elementos.proximasRecompensas.innerHTML = html;
    }

    // FUNCIONES AUXILIARES
    function formatearFechaRelativa(fechaString) {
        const fecha = new Date(fechaString);
        const ahora = new Date();
        const diffTiempo = Math.abs(ahora - fecha);
        const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
        
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
        
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function mostrarLoading(mostrar) {
        if (elementos.loadingIndicator) {
            elementos.loadingIndicator.classList.toggle('hidden', !mostrar);
        }
        if (mostrar) {
            const elementosCarga = [
                elementos.perfilGamificacion,
                elementos.logrosContainer,
                elementos.rachaVisualizacion,
                elementos.proximasRecompensas
            ];
            
            elementosCarga.forEach(elemento => {
                if (elemento) {
                    elemento.innerHTML = `
                        <div class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                            <p class="text-gray-500 mt-2">Cargando...</p>
                        </div>
                    `;
                }
            });
        }
    }

    function mostrarError(mensaje) {
        if (elementos.errorMessage) {
            elementos.errorMessage.textContent = mensaje;
            elementos.errorMessage.classList.remove('hidden');
        }
    }

    function ocultarError() {
        if (elementos.errorMessage) {
            elementos.errorMessage.classList.add('hidden');
        }
    }

    // INICIALIZACIÓN
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

})();