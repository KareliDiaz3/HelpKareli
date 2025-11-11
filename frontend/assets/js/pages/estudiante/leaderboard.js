/* ============================================
   SPEAKLEXI - LEADERBOARD
   Archivo: assets/js/pages/estudiante/leaderboard.js
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
        tabBtns: document.querySelectorAll('.tab-btn'),
        miPosicion: document.getElementById('mi-posicion'),
        rankingContainer: document.getElementById('ranking-container'),
        loadingIndicator: document.getElementById('loading-indicator'),
        errorMessage: document.getElementById('error-message')
    };

    // ESTADO
    let estado = {
        usuario: null,
        tipoActual: 'global',
        rankingData: [],
        miPosicionData: null,
        isLoading: false
    };

    // FUNCIONES PRINCIPALES
    function init() {
        verificarAuth();
        setupEventListeners();
        cargarRanking('global');
    }

    function verificarAuth() {
        estado.usuario = window.Utils.getFromStorage('usuario');
        if (!estado.usuario) {
            window.location.href = '/pages/auth/login.html';
            return;
        }
    }

    function setupEventListeners() {
        elementos.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tipo = btn.dataset.tipo;
                cambiarTab(tipo);
            });
        });
    }

    function cambiarTab(tipo) {
        elementos.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tipo === tipo);
        });
        
        estado.tipoActual = tipo;
        cargarRanking(tipo);
    }

    async function cargarRanking(tipo) {
        try {
            estado.isLoading = true;
            mostrarLoading(true);
            ocultarError();

            // Cargar ranking según el tipo
            let endpoint;
            switch (tipo) {
                case 'global':
                    endpoint = '/api/gamificacion/ranking/global?limite=20';
                    break;
                case 'semanal':
                    endpoint = '/api/gamificacion/ranking/semanal?limite=20';
                    break;
                case 'mensual':
                    endpoint = '/api/gamificacion/ranking/mensual?limite=20';
                    break;
                case 'nivel':
                    // Para ranking por nivel, usar el nivel actual del usuario
                    const nivelUsuario = await obtenerNivelUsuario();
                    endpoint = `/api/gamificacion/ranking/nivel/${nivelUsuario}?limite=20`;
                    break;
                default:
                    endpoint = '/api/gamificacion/ranking/global?limite=20';
            }

            const [rankingResponse, posicionResponse] = await Promise.all([
                window.apiClient.get(endpoint),
                window.apiClient.get(`/api/gamificacion/mi-posicion`)
            ]);

            if (rankingResponse.success && posicionResponse.success) {
                estado.rankingData = rankingResponse.data.ranking || [];
                estado.miPosicionData = posicionResponse.data;
                
                renderizarMiPosicion();
                renderizarRanking();
                window.toastManager.success(`Ranking ${tipo} cargado`);
            } else {
                throw new Error('Error en la respuesta del servidor');
            }

        } catch (error) {
            console.error('Error al cargar ranking:', error);
            mostrarError('Error al cargar la clasificación. Intenta nuevamente.');
            window.toastManager.error('Error al cargar clasificación');
        } finally {
            estado.isLoading = false;
            mostrarLoading(false);
        }
    }

    async function obtenerNivelUsuario() {
        try {
            const response = await window.apiClient.get('/api/gamificacion/nivel');
            if (response.success) {
                return response.data.nivel_cefr || 'A1';
            }
        } catch (error) {
            console.error('Error al obtener nivel:', error);
        }
        return 'A1';
    }

    function renderizarMiPosicion() {
        if (!estado.miPosicionData) return;

        const data = estado.miPosicionData;
        const porcentajeTop = Math.round((1 - (data.posicion / data.total_usuarios)) * 100);
        
        elementos.miPosicion.innerHTML = `
            <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-2xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="text-4xl font-bold">#${data.posicion}</div>
                        <div>
                            <p class="text-2xl font-bold">${estado.usuario.nombre}</p>
                            <p class="opacity-90">${data.usuario.total_xp} XP • Nivel ${data.usuario.nivel_xp}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm opacity-90">Estás en el top</p>
                        <p class="text-2xl font-bold">${porcentajeTop}%</p>
                        <p class="text-xs opacity-90">de ${data.total_usuarios} usuarios</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderizarRanking() {
        if (estado.rankingData.length === 0) {
            elementos.rankingContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No hay datos de ranking disponibles</p>
                    <p class="text-gray-400 text-sm mt-2">Completa lecciones para aparecer en el ranking</p>
                </div>
            `;
            return;
        }

        let html = '';
        
        estado.rankingData.forEach((user, index) => {
            const isTop3 = index < 3;
            const isCurrentUser = user.usuario_id === estado.usuario.id;
            const medallas = ['🥇', '🥈', '🥉'];
            
            let clasesFondo = 'bg-white dark:bg-gray-800';
            if (index === 0) {
                clasesFondo = 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200';
            } else if (index === 1) {
                clasesFondo = 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200';
            } else if (index === 2) {
                clasesFondo = 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200';
            }
            
            if (isCurrentUser) {
                clasesFondo += ' border-2 border-primary-500 shadow-lg';
            }

            const avatarUrl = user.foto_perfil || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre_completo)}&background=6366f1&color=fff&size=128`;

            html += `
                <div class="flex items-center gap-4 p-4 rounded-xl mb-3 ${clasesFondo} shadow hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                    <div class="text-2xl font-bold ${isTop3 ? 'text-3xl' : 'text-gray-500 dark:text-gray-400'} min-w-12 text-center">
                        ${isTop3 ? medallas[index] : user.posicion}
                    </div>
                    
                    <img src="${avatarUrl}" 
                         class="w-12 h-12 rounded-full ${isTop3 ? 'border-4 border-yellow-400' : 'border-2 border-gray-200'} object-cover" 
                         alt="${user.nombre_completo}"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre_completo)}&background=6366f1&color=fff&size=128'">
                    
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-900 dark:text-white truncate">${user.nombre_completo}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            ${user.total_xp} XP • Nivel ${user.nivel_xp}
                            ${user.racha_dias > 0 ? `• 🔥 ${user.racha_dias}d` : ''}
                        </p>
                    </div>
                    
                    ${isCurrentUser ? 
                        '<span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-3 py-1 rounded-full font-semibold">Tú</span>' : 
                        ''
                    }
                </div>
            `;
        });
        
        elementos.rankingContainer.innerHTML = html;
    }

    // FUNCIONES AUXILIARES
    function mostrarLoading(mostrar) {
        if (elementos.loadingIndicator) {
            elementos.loadingIndicator.classList.toggle('hidden', !mostrar);
        }
        if (mostrar) {
            elementos.rankingContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    <p class="text-gray-500 mt-4">Cargando ranking...</p>
                </div>
            `;
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