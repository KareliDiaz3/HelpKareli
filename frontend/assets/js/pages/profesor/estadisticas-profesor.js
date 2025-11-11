/* ============================================
   SPEAKLEXI - ESTADÍSTICAS PROFESOR
   Archivo: assets/js/pages/profesor/estadisticas-profesor.js
   UC-13: Consultar estadísticas de progreso (Vista Profesor)
   ============================================ */

(async () => {
    'use strict';

    const dependencias = ['APP_CONFIG', 'apiClient', 'toastManager', 'formValidator', 'ModuleLoader', 'Chart'];
    
    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Estadísticas Profesor',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => {
            console.error('Error inicializando módulo:', error);
            window.toastManager.error('Error al cargar el módulo de estadísticas');
        }
    });

    if (!inicializado) return;

    async function inicializarModulo() {
        // CONFIGURACIÓN
        const config = {
            API: window.APP_CONFIG.API,
            ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS
        };

        // ELEMENTOS DOM
        const elementos = {
            filtroNivel: document.getElementById('filtro-nivel'),
            filtroIdioma: document.getElementById('filtro-idioma'),
            filtroFechaDesde: document.getElementById('filtro-fecha-desde'),
            filtroFechaHasta: document.getElementById('filtro-fecha-hasta'),
            btnFiltrar: document.getElementById('btn-filtrar'),
            btnExportar: document.getElementById('btn-exportar'),
            
            // Estadísticas generales
            totalAlumnos: document.getElementById('total-alumnos'),
            leccionesCompletadas: document.getElementById('lecciones-completadas'),
            xpPromedio: document.getElementById('xp-promedio'),
            tasaCompletacion: document.getElementById('tasa-completacion'),
            
            // Gráficos
            graficoProgresoNiveles: document.getElementById('grafico-progreso-niveles'),
            graficoDistribucionHabilidades: document.getElementById('grafico-distribucion-habilidades'),
            graficoTendenciaMensual: document.getElementById('grafico-tendencia-mensual'),
            
            // Tablas
            tablaMejoresAlumnos: document.getElementById('tabla-mejores-alumnos'),
            tablaAreasCriticas: document.getElementById('tabla-areas-criticas'),
            
            // Estados
            loadingIndicator: document.getElementById('loading-indicator'),
            errorMessage: document.getElementById('error-message')
        };

        // ESTADO
        let estado = {
            estadisticas: null,
            filtros: {
                nivel: 'todos',
                idioma: 'todos',
                fecha_desde: '',
                fecha_hasta: ''
            },
            charts: {}
        };

        // FUNCIONES PRINCIPALES
        function verificarAuth() {
            const usuario = window.Utils.getFromStorage('usuario');
            if (!usuario || (usuario.rol !== 'profesor' && usuario.rol !== 'admin')) {
                window.location.href = '/pages/auth/login.html';
                return false;
            }
            return true;
        }

        function setupEventListeners() {
            // DeepSeek: Configurar event listeners para filtros y botones
            elementos.btnFiltrar.addEventListener('click', aplicarFiltros);
            elementos.btnExportar.addEventListener('click', exportarReporte);
            
            elementos.filtroNivel.addEventListener('change', function() {
                estado.filtros.nivel = this.value;
            });
            
            elementos.filtroIdioma.addEventListener('change', function() {
                estado.filtros.idioma = this.value;
            });
            
            elementos.filtroFechaDesde.addEventListener('change', function() {
                estado.filtros.fecha_desde = this.value;
            });
            
            elementos.filtroFechaHasta.addEventListener('change', function() {
                estado.filtros.fecha_hasta = this.value;
            });
        }

        // DeepSeek: Cargar estadísticas generales del grupo
        async function cargarEstadisticas() {
            if (!verificarAuth()) return;
            
            try {
                mostrarCargando(true);
                ocultarError();

                const params = new URLSearchParams();
                if (estado.filtros.nivel !== 'todos') params.append('nivel', estado.filtros.nivel);
                if (estado.filtros.idioma !== 'todos') params.append('idioma', estado.filtros.idioma);
                if (estado.filtros.fecha_desde) params.append('fecha_desde', estado.filtros.fecha_desde);
                if (estado.filtros.fecha_hasta) params.append('fecha_hasta', estado.filtros.fecha_hasta);

                const endpoint = `${config.ENDPOINTS.ESTADISTICAS.GENERAL}?${params.toString()}`;
                const response = await window.apiClient.get(endpoint);

                if (response.success) {
                    estado.estadisticas = response.data;
                    renderizarEstadisticas();
                    window.toastManager.success('Estadísticas actualizadas');
                } else {
                    throw new Error(response.message || 'Error al cargar estadísticas');
                }

            } catch (error) {
                console.error('Error cargando estadísticas:', error);
                mostrarError('Error al cargar las estadísticas. Intenta nuevamente.');
                window.toastManager.error('Error al cargar estadísticas');
            } finally {
                mostrarCargando(false);
            }
        }

        // DeepSeek: Aplicar filtros y recargar datos
        async function aplicarFiltros() {
            await cargarEstadisticas();
        }

        // DeepSeek: Renderizar todas las estadísticas en el dashboard
        function renderizarEstadisticas() {
            if (!estado.estadisticas) return;

            renderizarResumenGeneral();
            renderizarGraficoProgresoNiveles();
            renderizarGraficoDistribucionHabilidades();
            renderizarGraficoTendenciaMensual();
            renderizarTablaMejoresAlumnos();
            renderizarTablaAreasCriticas();
        }

        // DeepSeek: Renderizar cards de resumen general
        function renderizarResumenGeneral() {
            const datos = estado.estadisticas.totales;
            
            elementos.totalAlumnos.textContent = datos.alumnos_activos || 0;
            elementos.leccionesCompletadas.textContent = datos.lecciones_completadas || 0;
            elementos.xpPromedio.textContent = datos.xp_promedio || 0;
            elementos.tasaCompletacion.textContent = `${datos.tasa_completacion || 0}%`;
        }

        // DeepSeek: Crear gráfico de progreso por niveles
        function renderizarGraficoProgresoNiveles() {
            const ctx = elementos.graficoProgresoNiveles.getContext('2d');
            const datos = estado.estadisticas.por_nivel || [];
            
            // Destruir chart anterior si existe
            if (estado.charts.progresoNiveles) {
                estado.charts.progresoNiveles.destroy();
            }
            
            estado.charts.progresoNiveles = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datos.map(item => item.nivel),
                    datasets: [
                        {
                            label: 'Alumnos',
                            data: datos.map(item => item.alumnos),
                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            borderColor: 'rgb(99, 102, 241)',
                            borderWidth: 1
                        },
                        {
                            label: 'XP Promedio',
                            data: datos.map(item => item.xp_promedio),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Progreso por Nivel CEFR'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Cantidad de Alumnos'
                            }
                        },
                        y1: {
                            beginAtZero: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'XP Promedio'
                            },
                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    }
                }
            });
        }

        // DeepSeek: Crear gráfico de distribución de habilidades
        function renderizarGraficoDistribucionHabilidades() {
            const ctx = elementos.graficoDistribucionHabilidades.getContext('2d');
            
            // Datos de ejemplo (en producción vendrían del backend)
            const datosHabilidades = {
                lectura: 75,
                escritura: 68,
                escucha: 82,
                habla: 60,
                gramatica: 70,
                vocabulario: 78
            };
            
            if (estado.charts.distribucionHabilidades) {
                estado.charts.distribucionHabilidades.destroy();
            }
            
            estado.charts.distribucionHabilidades = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: Object.keys(datosHabilidades).map(key => 
                        key.charAt(0).toUpperCase() + key.slice(1)
                    ),
                    datasets: [{
                        label: 'Promedio del Grupo',
                        data: Object.values(datosHabilidades),
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgb(99, 102, 241)',
                        pointBackgroundColor: 'rgb(99, 102, 241)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(99, 102, 241)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribución de Habilidades'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        }
                    }
                }
            });
        }

        // DeepSeek: Crear gráfico de tendencia mensual
        function renderizarGraficoTendenciaMensual() {
            const ctx = elementos.graficoTendenciaMensual.getContext('2d');
            const datos = estado.estadisticas.tendencia_mensual || [];
            
            if (estado.charts.tendenciaMensual) {
                estado.charts.tendenciaMensual.destroy();
            }
            
            estado.charts.tendenciaMensual = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datos.map(item => {
                        const [year, month] = item.mes.split('-');
                        return new Date(year, month - 1).toLocaleDateString('es-ES', { 
                            month: 'short', 
                            year: 'numeric' 
                        });
                    }),
                    datasets: [
                        {
                            label: 'Alumnos Nuevos',
                            data: datos.map(item => item.alumnos_nuevos),
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Lecciones Completadas',
                            data: datos.map(item => item.lecciones_completadas),
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Tendencia Mensual'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Alumnos Nuevos'
                            }
                        },
                        y1: {
                            beginAtZero: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Lecciones Completadas'
                            },
                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    }
                }
            });
        }

        // DeepSeek: Renderizar tabla de mejores alumnos
        function renderizarTablaMejoresAlumnos() {
            // Datos de ejemplo (en producción vendrían del backend)
            const mejoresAlumnos = [
                { nombre: 'Ana García', nivel: 'B2', xp: 2450, lecciones: 25, racha: 14 },
                { nombre: 'Carlos López', nivel: 'B1', xp: 2180, lecciones: 22, racha: 7 },
                { nombre: 'María Rodríguez', nivel: 'B2', xp: 2100, lecciones: 20, racha: 21 },
                { nombre: 'Juan Martínez', nivel: 'A2', xp: 1950, lecciones: 18, racha: 5 },
                { nombre: 'Laura Hernández', nivel: 'B1', xp: 1880, lecciones: 17, racha: 9 }
            ];
            
            let html = '';
            mejoresAlumnos.forEach((alumno, index) => {
                html += `
                    <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-3 text-center">${index + 1}</td>
                        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${alumno.nombre}</td>
                        <td class="px-4 py-3 text-center">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${alumno.nivel}</span>
                        </td>
                        <td class="px-4 py-3 text-center font-semibold">${alumno.xp}</td>
                        <td class="px-4 py-3 text-center">${alumno.lecciones}</td>
                        <td class="px-4 py-3 text-center">
                            <span class="flex items-center justify-center gap-1 text-orange-600">
                                <i class="fas fa-fire"></i> ${alumno.racha}d
                            </span>
                        </td>
                    </tr>
                `;
            });
            
            elementos.tablaMejoresAlumnos.innerHTML = html || `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        No hay datos de alumnos disponibles
                    </td>
                </tr>
            `;
        }

        // DeepSeek: Renderizar tabla de áreas críticas
        function renderizarTablaAreasCriticas() {
            // Datos de ejemplo (en producción vendrían del análisis del backend)
            const areasCriticas = [
                { habilidad: 'Habla', porcentaje: 60, alumnos_afectados: 35, criticidad: 'Alta' },
                { habilidad: 'Escritura', porcentaje: 68, alumnos_afectados: 25, criticidad: 'Media' },
                { habilidad: 'Gramática Avanzada', porcentaje: 72, alumnos_afectados: 20, criticidad: 'Media' }
            ];
            
            let html = '';
            areasCriticas.forEach(area => {
                const colorCriticidad = area.criticidad === 'Alta' ? 'bg-red-100 text-red-800' : 
                                      area.criticidad === 'Media' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800';
                
                html += `
                    <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${area.habilidad}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-primary-500 h-2 rounded-full" style="width: ${area.porcentaje}%"></div>
                                </div>
                                <span class="text-sm text-gray-600">${area.porcentaje}%</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-center">${area.alumnos_afectados}</td>
                        <td class="px-4 py-3 text-center">
                            <span class="px-2 py-1 ${colorCriticidad} text-xs rounded-full">${area.criticidad}</span>
                        </td>
                    </tr>
                `;
            });
            
            elementos.tablaAreasCriticas.innerHTML = html || `
                <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                        No se identificaron áreas críticas
                    </td>
                </tr>
            `;
        }

        // DeepSeek: Exportar reporte completo
        async function exportarReporte() {
            try {
                window.toastManager.info('Generando reporte...');
                
                const params = new URLSearchParams();
                if (estado.filtros.nivel !== 'todos') params.append('nivel', estado.filtros.nivel);
                if (estado.filtros.idioma !== 'todos') params.append('idioma', estado.filtros.idioma);
                if (estado.filtros.fecha_desde) params.append('fecha_desde', estado.filtros.fecha_desde);
                if (estado.filtros.fecha_hasta) params.append('fecha_hasta', estado.filtros.fecha_hasta);
                
                // En una implementación real, el backend generaría el PDF
                // Por ahora simulamos la descarga
                setTimeout(() => {
                    window.toastManager.success('Reporte generado exitosamente');
                    
                    // Simular descarga
                    const link = document.createElement('a');
                    link.href = '#';
                    link.setAttribute('download', `reporte-estadisticas-${new Date().getTime()}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }, 2000);
                
            } catch (error) {
                console.error('Error exportando reporte:', error);
                window.toastManager.error('Error al generar el reporte');
            }
        }

        // FUNCIONES AUXILIARES
        function mostrarCargando(mostrar) {
            if (elementos.loadingIndicator) {
                elementos.loadingIndicator.classList.toggle('hidden', !mostrar);
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
        setupEventListeners();
        await cargarEstadisticas();
    }

    // EJECUTAR
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarModulo);
    } else {
        setTimeout(inicializarModulo, 100);
    }

})();