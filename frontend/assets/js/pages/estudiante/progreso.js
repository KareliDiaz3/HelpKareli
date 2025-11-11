/* ============================================
   SPEAKLEXI - MI PROGRESO
   Archivo: assets/js/pages/estudiante/progreso.js
   ============================================ */

(() => {
    'use strict';

    // VERIFICAR DEPENDENCIAS
    const deps = ['APP_CONFIG', 'apiClient', 'toastManager', 'Utils', 'Chart'];
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
        statsContainer: document.getElementById('stats-container'),
        graficoSemanal: document.getElementById('graficoSemanal'),
        listaLecciones: document.getElementById('lista-lecciones'),
        tablaHistorial: document.getElementById('tabla-historial'),
        loadingIndicator: document.getElementById('loading-indicator'),
        errorMessage: document.getElementById('error-message')
    };

    // ESTADO
    let estado = {
        usuario: null,
        datosProgreso: null,
        lecciones: [],
        historial: [],
        chartSemanal: null,
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
            const [resumenResponse, nivelResponse, historialResponse] = await Promise.all([
                window.apiClient.get('/api/progreso/resumen'),
                window.apiClient.get('/api/gamificacion/nivel'),
                window.apiClient.get('/api/progreso/historial?limite=10')
            ]);

            if (resumenResponse.success && nivelResponse.success && historialResponse.success) {
                estado.datosProgreso = {
                    ...resumenResponse.data.resumen,
                    ...nivelResponse.data
                };
                estado.historial = historialResponse.data.historial || [];
                
                // Cargar datos de lecciones (usando historial como fuente temporal)
                await cargarLecciones();
                
                renderizarUI();
                window.toastManager.success('Progreso actualizado');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }

        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarError('Error al cargar el progreso. Intenta nuevamente.');
            window.toastManager.error('Error al cargar progreso');
        } finally {
            estado.isLoading = false;
            mostrarLoading(false);
        }
    }

    async function cargarLecciones() {
        try {
            // Usar el historial para obtener lecciones recientes
            // En una implementación real, habría un endpoint específico para lecciones del usuario
            const leccionesUnicas = [];
            const leccionesVistas = new Set();
            
            estado.historial.forEach(item => {
                if (!leccionesVistas.has(item.leccion_id)) {
                    leccionesUnicas.push({
                        id: item.leccion_id,
                        titulo: item.leccion_titulo,
                        progreso: item.progreso,
                        completada: item.completada,
                        tiempo_segundos: item.tiempo_total_segundos,
                        curso_nombre: item.curso_nombre,
                        fecha_actualizacion: item.actualizado_en
                    });
                    leccionesVistas.add(item.leccion_id);
                }
            });
            
            estado.lecciones = leccionesUnicas.slice(0, 8); // Mostrar últimas 8 lecciones
        } catch (error) {
            console.error('Error al cargar lecciones:', error);
            estado.lecciones = [];
        }
    }

    function renderizarUI() {
        renderizarStats();
        renderizarGraficoSemanal();
        renderizarLecciones();
        renderizarHistorial();
    }

    function renderizarStats() {
        const datos = estado.datosProgreso;
        const tiempoHoras = Math.floor((datos.tiempo_total_segundos || 0) / 3600);
        const tiempoMinutos = Math.floor(((datos.tiempo_total_segundos || 0) % 3600) / 60);
        
        const cards = [
            {
                titulo: 'XP Total',
                valor: datos.total_xp || 0,
                subtitulo: `Nivel ${datos.nivel_xp || 1}`,
                icono: 'fas fa-star',
                color: 'purple',
                progreso: datos.progreso_nivel || 0,
                infoExtra: `${datos.xp_faltante || 0} XP para siguiente nivel`
            },
            {
                titulo: 'Lecciones',
                valor: datos.lecciones_completadas || 0,
                subtitulo: 'completadas',
                icono: 'fas fa-book',
                color: 'blue',
                progreso: null,
                infoExtra: `${datos.lecciones_incompletas || 0} en progreso`
            },
            {
                titulo: 'Tiempo Total',
                valor: tiempoHoras,
                subtitulo: `${tiempoMinutos} min de estudio`,
                icono: 'fas fa-clock',
                color: 'green',
                progreso: null,
                infoExtra: `${Math.round((datos.tiempo_total_segundos || 0) / 60)} minutos total`
            },
            {
                titulo: 'Racha Actual',
                valor: datos.racha_dias || 0,
                subtitulo: 'días seguidos',
                icono: 'fas fa-fire',
                color: 'orange',
                progreso: datos.racha_dias > 0 ? Math.min((datos.racha_dias / 7) * 100, 100) : 0,
                infoExtra: datos.racha_dias >= 7 ? '¡Racha semanal completa!' : 'Sigue practicando'
            }
        ];

        let html = '';
        cards.forEach(card => {
            html += `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex-1">
                            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">${card.titulo}</p>
                            <p class="text-3xl font-bold text-${card.color}-600 dark:text-${card.color}-400 mt-1">${card.valor}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${card.subtitulo}</p>
                            ${card.infoExtra ? `<p class="text-xs text-${card.color}-500 dark:text-${card.color}-300 mt-2">${card.infoExtra}</p>` : ''}
                        </div>
                        <div class="w-12 h-12 bg-${card.color}-100 dark:bg-${card.color}-900 rounded-xl flex items-center justify-center ml-4">
                            <i class="${card.icono} text-${card.color}-600 dark:text-${card.color}-400 text-xl"></i>
                        </div>
                    </div>
                    ${card.progreso !== null ? `
                        <div class="mt-3">
                            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>Progreso</span>
                                <span>${Math.round(card.progreso)}%</span>
                            </div>
                            <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div class="bg-${card.color}-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                                     style="width: ${card.progreso}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        elementos.statsContainer.innerHTML = html;
    }

    function renderizarGraficoSemanal() {
        // Generar datos de ejemplo para la semana (en producción esto vendría del backend)
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const actividadSemanal = [45, 78, 92, 65, 120, 85, 60]; // XP por día (ejemplo)
        
        const ctx = elementos.graficoSemanal.getContext('2d');
        
        // Destruir chart anterior si existe
        if (estado.chartSemanal) {
            estado.chartSemanal.destroy();
        }
        
        // Crear gradiente para el área del gráfico
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
        
        estado.chartSemanal = new Chart(ctx, {
            type: 'line',
            data: {
                labels: diasSemana,
                datasets: [{
                    label: 'XP Ganado',
                    data: actividadSemanal,
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
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
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `XP: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    function renderizarLecciones() {
        if (estado.lecciones.length === 0) {
            elementos.listaLecciones.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No hay lecciones recientes</p>
                    <p class="text-gray-400 text-sm mt-2">Comienza una lección para ver tu progreso aquí</p>
                </div>
            `;
            return;
        }

        let html = '';
        
        estado.lecciones.forEach(leccion => {
            const completada = leccion.completada;
            const tiempoFormateado = formatearTiempo(leccion.tiempo_segundos || 0);
            const fechaActualizacion = formatearFechaRelativa(leccion.fecha_actualizacion);
            
            html += `
                <div class="p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    completada ? 
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                    'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-900 dark:text-white truncate">${leccion.titulo}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${leccion.curso_nombre || 'Curso'} • ${fechaActualizacion}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                            completada ? 
                            'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 
                            'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        }">
                            ${completada ? 'Completada' : 'En progreso'}
                        </span>
                    </div>
                    
                    <div class="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out" 
                             style="width: ${leccion.progreso || 0}%"></div>
                    </div>
                    
                    <div class="mt-2 flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">${leccion.progreso || 0}% completado</span>
                        <span class="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <i class="fas fa-clock"></i> ${tiempoFormateado}
                        </span>
                    </div>
                </div>
            `;
        });
        
        elementos.listaLecciones.innerHTML = html;
    }

    function renderizarHistorial() {
        if (estado.historial.length === 0) {
            elementos.tablaHistorial.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-history text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No hay historial de actividad</p>
                    <p class="text-gray-400 text-sm mt-2">Tu actividad aparecerá aquí</p>
                </div>
            `;
            return;
        }

        let rows = '';
        
        estado.historial.forEach(item => {
            const fechaFormateada = formatearFechaRelativa(item.actualizado_en);
            const xpGanado = item.completada ? 10 : 0; // 10 XP por lección completada
            
            rows += `
                <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">${fechaFormateada}</td>
                    <td class="px-4 py-3">
                        <div>
                            <p class="text-gray-900 dark:text-white font-medium">${item.leccion_titulo}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${item.curso_nombre}</p>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${
                            item.completada ? 
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                            'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }">
                            ${item.progreso}%
                        </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                        ${xpGanado > 0 ? `
                            <span class="text-green-600 dark:text-green-400 font-semibold flex items-center justify-end gap-1">
                                <i class="fas fa-star"></i> +${xpGanado} XP
                            </span>
                        ` : '<span class="text-gray-400">-</span>'}
                    </td>
                </tr>
            `;
        });
        
        elementos.tablaHistorial.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Fecha</th>
                            <th class="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Lección</th>
                            <th class="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">Progreso</th>
                            <th class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold">XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // FUNCIONES AUXILIARES
    function formatearTiempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        
        if (horas > 0) return `${horas}h ${minutos}m`;
        if (minutos > 0) return `${minutos} min`;
        return `${segundos} seg`;
    }

    function formatearFechaRelativa(fechaString) {
        const fecha = new Date(fechaString);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMinutos = Math.floor(diffMs / (1000 * 60));
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMinutos < 1) return 'Ahora mismo';
        if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
        if (diffHoras < 24) return `Hace ${diffHoras} h`;
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        
        return fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
        });
    }

    function mostrarLoading(mostrar) {
        if (elementos.loadingIndicator) {
            elementos.loadingIndicator.classList.toggle('hidden', !mostrar);
        }
        if (mostrar) {
            const elementosCarga = [
                elementos.statsContainer,
                elementos.listaLecciones,
                elementos.tablaHistorial
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
            
            // Para el gráfico, mostrar placeholder
            if (elementos.graficoSemanal) {
                const ctx = elementos.graficoSemanal.getContext('2d');
                ctx.fillStyle = '#f3f4f6';
                ctx.fillRect(0, 0, elementos.graficoSemanal.width, elementos.graficoSemanal.height);
                ctx.fillStyle = '#9ca3af';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '16px Arial';
                ctx.fillText('Cargando gráfico...', elementos.graficoSemanal.width / 2, elementos.graficoSemanal.height / 2);
            }
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