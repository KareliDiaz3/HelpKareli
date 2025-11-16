(() => {
    'use strict';

    if (!window.StudentProgress) {
        console.error('❌ Falta StudentProgress');
        const contenedor = document.getElementById('ranking-container');
        if (contenedor) {
            contenedor.innerHTML = '<p class="text-center text-red-500">No hay datos de progreso disponibles.</p>';
        }
        return;
    }

    const progressStore = window.StudentProgress;

    const elementos = {
        tabBtns: document.querySelectorAll('.tab-btn'),
        rankingContainer: document.getElementById('ranking-container'),
        loadingIndicator: document.getElementById('loading-indicator'),
        errorMessage: document.getElementById('error-message'),
        rankingTitulo: document.getElementById('ranking-titulo'),
        rankingTotal: document.getElementById('ranking-total'),
        miPosicionNumero: document.getElementById('mi-posicion-numero'),
        miPosicionDatos: document.getElementById('mi-posicion-datos'),
        miPosicionXP: document.getElementById('mi-posicion-xp'),
        miPosicionPercentil: document.getElementById('mi-posicion-percentil')
    };

    const estado = {
        usuario: null,
        tipoActual: 'global',
        rankingData: [],
        miPosicionData: null
    };

    function init() {
        if (!verificarAuth()) return;
        estado.usuario = progressStore.getSnapshot();
        setupTabs();
        cargarRanking('global');
    }

    function verificarAuth() {
        const storageKeys = window.APP_CONFIG?.STORAGE?.KEYS || {};
        const usuarioRaw = localStorage.getItem(storageKeys.USUARIO || 'usuario');
        if (!usuarioRaw) {
            window.location.href = '/pages/auth/login.html';
            return false;
        }
        return true;
    }

    function setupTabs() {
        elementos.tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const tipo = btn.dataset.tipo;
                cambiarTab(tipo);
            });
        });
    }

    function cambiarTab(tipo) {
        elementos.tabBtns.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tipo === tipo);
        });
        estado.tipoActual = tipo;
        cargarRanking(tipo);
    }

    function cargarRanking(tipo) {
        try {
            mostrarLoading(true);
            ocultarError();
            const datos = progressStore.getLeaderboard(tipo);
            estado.rankingData = datos.ranking;
            estado.miPosicionData = datos.miPosicion;
            actualizarTitulo(tipo, datos.total);
            renderizarMiPosicion();
            renderizarRanking();
        } catch (error) {
            console.error('Error al cargar ranking local:', error);
            mostrarError('No se pudo generar la tabla de clasificación.');
        } finally {
            mostrarLoading(false);
        }
    }

    function actualizarTitulo(tipo, total) {
        if (elementos.rankingTitulo) {
            const titulos = {
                global: 'Ranking Global',
                semanal: 'Ranking Semanal',
                mensual: 'Ranking Mensual',
                nivel: 'Ranking por Nivel'
            };
            elementos.rankingTitulo.textContent = titulos[tipo] || 'Ranking Global';
        }
        if (elementos.rankingTotal) {
            elementos.rankingTotal.textContent = total || estado.rankingData.length;
        }
    }

    function renderizarMiPosicion() {
        const data = estado.miPosicionData;
        if (!data) return;
        const total = data.total_usuarios || estado.rankingData.length;
        const percentil = total ? Math.max(1, Math.round((1 - (data.posicion - 1) / total) * 100)) : 100;
        if (elementos.miPosicionNumero) elementos.miPosicionNumero.textContent = data.posicion;
        if (elementos.miPosicionDatos) {
            const nombre = data.usuario.nombre || estado.usuario?.nombreCompleto || estado.usuario?.nombre || 'Estudiante';
            elementos.miPosicionDatos.textContent = `${nombre} · Nivel ${data.usuario.nivel_xp}`;
        }
        if (elementos.miPosicionXP) elementos.miPosicionXP.textContent = `${data.usuario.total_xp} XP`;
        if (elementos.miPosicionPercentil) elementos.miPosicionPercentil.textContent = `Top ${percentil}%`;
    }

    function renderizarRanking() {
        if (!elementos.rankingContainer) return;
        if (estado.rankingData.length === 0) {
            elementos.rankingContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">Aún no hay participantes</p>
                    <p class="text-gray-400 text-sm mt-2">Completa lecciones para aparecer en la tabla</p>
                </div>
            `;
            return;
        }

        const snapshot = estado.usuario;
        const html = estado.rankingData.map((user, index) => {
            const medallas = ['🥇', '🥈', '🥉'];
            const isTop3 = index < 3;
            const isCurrentUser = user.esUsuario || user.nombre_completo === (snapshot?.nombreCompleto || snapshot?.nombre);
            let clasesFondo = 'bg-white dark:bg-gray-800';
            if (index === 0) clasesFondo = 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200';
            if (index === 1) clasesFondo = 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200';
            if (index === 2) clasesFondo = 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200';
            if (isCurrentUser) clasesFondo += ' border-primary-500 shadow-lg';
            const nombreMostrar = user.nombre_completo || 'Estudiante';
            const avatarUrl = user.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreMostrar)}&background=6366f1&color=fff&size=128`;
            return `
                <div class="flex items-center gap-4 p-4 rounded-xl mb-3 ${clasesFondo} shadow hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                    <div class="text-2xl font-bold ${isTop3 ? 'text-3xl' : 'text-gray-500 dark:text-gray-400'} min-w-12 text-center">
                        ${isTop3 ? medallas[index] : user.posicion}
                    </div>
                    <img src="${avatarUrl}" class="w-12 h-12 rounded-full ${isTop3 ? 'border-4 border-yellow-400' : 'border-2 border-gray-200'} object-cover" alt="${nombreMostrar}">
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-900 dark:text-white truncate">${nombreMostrar}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${user.total_xp} XP • Nivel ${user.nivel_xp} ${user.racha_dias ? `• 🔥 ${user.racha_dias}d` : ''}</p>
                    </div>
                    ${isCurrentUser ? '<span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-3 py-1 rounded-full font-semibold">Tú</span>' : ''}
                </div>
            `;
        }).join('');

        elementos.rankingContainer.innerHTML = html;
    }

    function mostrarLoading(mostrar) {
        if (elementos.loadingIndicator) {
            elementos.loadingIndicator.classList.toggle('hidden', !mostrar);
        }
        if (mostrar && elementos.rankingContainer) {
            elementos.rankingContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    <p class="text-gray-500 mt-4">Cargando ranking...</p>
                </div>
            `;
        }
    }

    function mostrarError(mensaje) {
        if (!elementos.errorMessage) return;
        const texto = elementos.errorMessage.querySelector('p') || elementos.errorMessage;
        texto.textContent = mensaje;
        elementos.errorMessage.classList.remove('hidden');
    }

    function ocultarError() {
        if (!elementos.errorMessage) return;
        elementos.errorMessage.classList.add('hidden');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
