/* ============================================
   SPEAKLEXI - Dashboard Profesor (Módulo 4 - Datos Reales)
   Archivo: assets/js/pages/profesor/dashboard.js
   ============================================ */

class ProfesorDashboard {
    constructor() {
        this.API_URL = window.APP_CONFIG?.API?.BASE_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.profesorData = null;
        this.init();
    }

    async init() {
        try {
            console.log('✅ Dashboard Profesor Módulo 4 iniciando...');
            
            // Esperar dependencias si existen
            if (window.ModuleLoader) {
                const dependencias = ['APP_CONFIG', 'apiClient'];
                await window.ModuleLoader.initModule({
                    moduleName: 'Dashboard Profesor Módulo 4',
                    dependencies: dependencias
                });
            }

            await this.cargarDatosDashboard();
            this.renderizarDashboard();
            this.configurarEventListeners();
            
            console.log('✅ Dashboard Profesor Módulo 4 listo');
        } catch (error) {
            console.error('💥 Error inicializando dashboard:', error);
            this.mostrarError('Error al cargar el dashboard');
        }
    }

    async cargarDatosDashboard() {
        try {
            console.log('📊 Cargando datos del dashboard...');
            
            const response = await fetch(`${this.API_URL}/profesor/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }

            this.profesorData = result.data;
            console.log('✅ Datos del dashboard cargados:', this.profesorData);
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            throw error;
        }
    }

    renderizarDashboard() {
        if (!this.profesorData) {
            this.mostrarError('No se pudieron cargar los datos');
            return;
        }

        const { 
            profesor, 
            estadisticas, 
            estudiantes_recientes = [], 
            alertas = [],
            retroalimentacion = {},
            planificacion = {}
        } = this.profesorData;

        // Header con información del profesor
        this.actualizarHeaderProfesor(profesor);
        
        // Estadísticas principales
        this.actualizarEstadisticasPrincipales(estadisticas);
        
        // Lista de estudiantes
        this.renderizarListaEstudiantes(estudiantes_recientes);
        
        // Alertas
        this.renderizarAlertas(alertas);
        
        // Estadísticas de retroalimentación
        this.renderizarStatsRetroalimentacion(retroalimentacion);
        
        // Estadísticas de planificación
        this.renderizarStatsPlanificacion(planificacion);

        // Mostrar contenido
        this.mostrarContenido();
    }

    actualizarHeaderProfesor(profesor) {
        const elementos = {
            nombreProfesor: document.getElementById('nombreProfesor'),
            cursoAsignado: document.getElementById('cursoAsignado'),
            nivelIdioma: document.getElementById('nivelIdioma')
        };

        if (elementos.nombreProfesor) {
            elementos.nombreProfesor.textContent = `${profesor.nombre} ${profesor.primer_apellido}`;
        }
        if (elementos.cursoAsignado) {
            elementos.cursoAsignado.textContent = profesor.curso_nombre || 'Sin curso asignado';
        }
        if (elementos.nivelIdioma) {
            elementos.nivelIdioma.textContent = `${profesor.nivel || 'N/A'} - ${profesor.idioma || 'N/A'}`;
        }
    }

    actualizarEstadisticasPrincipales(estadisticas) {
        const elementos = {
            totalEstudiantes: document.getElementById('total-estudiantes'),
            leccionesCompletadas: document.getElementById('lecciones-completadas'),
            promedioXP: document.getElementById('promedio-xp'),
            horasTotales: document.getElementById('horas-totales'),
            promedioClase: document.getElementById('promedio-clase')
        };

        // Usar datos reales del backend
        if (elementos.totalEstudiantes) {
            elementos.totalEstudiantes.textContent = estadisticas.total_estudiantes || 0;
            if (elementos.totalEstudiantes.parentElement) {
                const estudiantesActivos = estadisticas.estudiantes_activos || estadisticas.total_estudiantes || 0;
                elementos.totalEstudiantes.parentElement.querySelector('.text-sm').textContent = 
                    `${estudiantesActivos} activos`;
            }
        }
        if (elementos.leccionesCompletadas) {
            elementos.leccionesCompletadas.textContent = 
                (estadisticas.total_lecciones_completadas || 0).toLocaleString();
        }
        if (elementos.promedioXP) {
            elementos.promedioXP.textContent = `${estadisticas.promedio_xp || 0} XP`;
        }
        if (elementos.horasTotales) {
            elementos.horasTotales.textContent = `${estadisticas.tiempo_total_horas || 0}h`;
        }
        if (elementos.promedioClase) {
            elementos.promedioClase.textContent = `${estadisticas.promedio_clase || 0}%`;
        }
    }

    renderizarListaEstudiantes(estudiantes) {
        const container = document.getElementById('lista-estudiantes');
        if (!container) return;

        if (!estudiantes || estudiantes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">👥</div>
                    <p class="text-gray-500 dark:text-gray-400 text-lg">No hay estudiantes asignados</p>
                    <p class="text-sm text-gray-400 mt-2">Los estudiantes aparecerán aquí cuando se asignen</p>
                </div>
            `;
            return;
        }

        container.innerHTML = estudiantes.map(est => `
            <div class="group hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div class="flex items-center justify-between p-4 cursor-pointer" 
                     onclick="dashboard.verDetalleEstudiante(${est.id})">
                    <div class="flex items-center space-x-4 flex-1">
                        <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span class="text-white font-bold text-sm">
                                ${(est.nombre?.charAt(0) || '')}${(est.primer_apellido?.charAt(0) || '')}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2">
                                <h4 class="font-semibold text-gray-900 dark:text-white truncate">
                                    ${est.nombre || ''} ${est.primer_apellido || ''}
                                </h4>
                                <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-full font-medium">
                                    ${est.nivel_actual || 'N/A'}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">${est.correo || ''}</p>
                            <div class="flex items-center space-x-4 mt-1">
                                <span class="text-xs text-gray-500">${est.idioma_aprendizaje || 'N/A'}</span>
                                <span class="text-xs text-gray-500">•</span>
                                <span class="text-xs text-gray-500">
                                    ${est.lecciones_completadas || 0}/${est.lecciones_iniciadas || 0} lecciones
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="text-right">
                            <div class="flex items-center space-x-2">
                                <div class="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                         style="width: ${est.promedio_progreso || 0}%"></div>
                                </div>
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                                    ${est.promedio_progreso || 0}%
                                </span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">Progreso</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                                ${est.total_xp || 0}
                            </div>
                            <div class="text-xs text-gray-500">XP</div>
                        </div>
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderizarAlertas(alertas) {
        const container = document.getElementById('lista-alertas');
        const badge = document.getElementById('alertasBadge');
        
        if (!container) return;

        // Actualizar badge
        if (badge) {
            const totalAlertas = alertas?.length || 0;
            badge.textContent = totalAlertas;
            badge.classList.toggle('hidden', totalAlertas === 0);
        }

        if (!alertas || alertas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-5xl mb-3">🎉</div>
                    <p class="text-gray-600 dark:text-gray-400 font-medium">
                        ¡Excelente trabajo!
                    </p>
                    <p class="text-sm text-gray-500 mt-1">
                        No hay alertas pendientes
                    </p>
                </div>
            `;
            return;
        }

        const severityColors = {
            'info': 'bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300',
            'warning': 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900/20 dark:text-yellow-300',
            'critical': 'bg-red-100 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-300'
        };

        container.innerHTML = alertas.map(alerta => {
            const colorClase = severityColors[alerta.severidad] || severityColors.info;
            
            return `
                <div class="p-4 border-l-4 ${colorClase} bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs px-2 py-1 rounded-full ${colorClase}">
                                    ${(alerta.severidad || 'info').toUpperCase()}
                                </span>
                                <span class="text-sm text-gray-600 dark:text-gray-400">
                                    ${alerta.estudiante_nombre || 'Estudiante'}
                                </span>
                            </div>
                            <h4 class="font-medium text-gray-900 dark:text-white">${alerta.titulo || 'Alerta'}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                ${alerta.descripcion || 'Sin descripción disponible'}
                            </p>
                            <p class="text-xs text-gray-500 mt-2">
                                ${alerta.creado_en ? new Date(alerta.creado_en).toLocaleDateString('es-MX') : 'Fecha no disponible'}
                            </p>
                        </div>
                        <button onclick="dashboard.resolverAlerta(${alerta.id})" 
                                class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 ml-4 whitespace-nowrap">
                            Revisar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderizarStatsRetroalimentacion(stats) {
        const container = document.getElementById('statsRetroalimentacion');
        if (!container || !stats) return;

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4 text-center">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${stats.total_enviados || 0}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Enviados</p>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400">${stats.total_leidos || 0}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Leídos</p>
                </div>
                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${stats.total_no_leidos || 0}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${stats.enviados_ultima_semana || 0}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Esta semana</p>
                </div>
            </div>
        `;
    }

    renderizarStatsPlanificacion(stats) {
        const container = document.getElementById('statsPlanificacion');
        if (!container || !stats) return;

        container.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Total planes</span>
                    <span class="font-semibold text-gray-900 dark:text-white">${stats.total_planes || 0}</span>
                </div>
                <div class="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                    <span class="text-sm text-gray-600 dark:text-gray-400">En progreso</span>
                    <span class="font-semibold text-blue-600 dark:text-blue-400">${stats.planes_en_progreso || 0}</span>
                </div>
                <div class="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Completados</span>
                    <span class="font-semibold text-green-600 dark:text-green-400">${stats.planes_completados || 0}</span>
                </div>
                <div class="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Estudiantes con plan</span>
                    <span class="font-semibold text-purple-600 dark:text-purple-400">${stats.estudiantes_con_plan || 0}</span>
                </div>
            </div>
        `;
    }

    mostrarContenido() {
        const loading = document.getElementById('loading-dashboard') || document.getElementById('loadingDashboard');
        const content = document.getElementById('contenido-dashboard') || document.getElementById('dashboardContent');

        if (loading) loading.classList.add('hidden');
        if (content) content.classList.remove('hidden');
    }

    configurarEventListeners() {
        // Botones de navegación
        const btnEstadisticas = document.getElementById('btnVerEstadisticas');
        const btnRetroalimentacion = document.getElementById('btnRetroalimentacion');
        const btnPlanificacion = document.getElementById('btnPlanificacion');

        if (btnEstadisticas) {
            btnEstadisticas.addEventListener('click', () => {
                window.location.href = '/pages/profesor/estadisticas-profesor.html';
            });
        }

        if (btnRetroalimentacion) {
            btnRetroalimentacion.addEventListener('click', () => {
                window.location.href = '/pages/profesor/retroalimentacion-profesor.html';
            });
        }

        if (btnPlanificacion) {
            btnPlanificacion.addEventListener('click', () => {
                window.location.href = '/pages/profesor/planificacion.html';
            });
        }

        // Filtros y búsqueda (si existen)
        const btnBuscar = document.getElementById('btn-buscar');
        const inputBuscar = document.getElementById('input-buscar');

        if (btnBuscar && inputBuscar) {
            btnBuscar.addEventListener('click', () => {
                this.buscarEstudiantes(inputBuscar.value);
            });

            inputBuscar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.buscarEstudiantes(inputBuscar.value);
                }
            });
        }
    }

    async buscarEstudiantes(termino) {
        try {
            console.log('🔍 Buscando estudiantes:', termino);
            // Implementar búsqueda real cuando el backend lo soporte
            // Por ahora solo recargamos la lista completa
            await this.cargarDatosDashboard();
            this.renderizarDashboard();
        } catch (error) {
            console.error('Error buscando estudiantes:', error);
        }
    }

    verDetalleEstudiante(estudianteId) {
        window.location.href = `/pages/profesor/estadisticas-profesor.html?id=${estudianteId}`;
    }

    async resolverAlerta(alertaId) {
        try {
            console.log('✅ Resolviendo alerta:', alertaId);
            
            const response = await fetch(`${this.API_URL}/profesor/alertas/${alertaId}/revisar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Recargar datos para actualizar la vista
                await this.cargarDatosDashboard();
                this.renderizarDashboard();
                this.mostrarNotificacion('Alerta marcada como revisada', 'success');
            } else {
                throw new Error('Error al actualizar la alerta');
            }
        } catch (error) {
            console.error('❌ Error resolviendo alerta:', error);
            this.mostrarError('Error al marcar alerta como revisada');
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Implementar notificación toast
        console.log(`📢 ${tipo.toUpperCase()}: ${mensaje}`);
        
        // Toast simple
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            tipo === 'success' ? 'bg-green-500 text-white' : 
            tipo === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        toast.textContent = mensaje;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }

    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    }
}

// Inicialización compatible con ambos sistemas
let dashboard;

if (typeof window.ModuleLoader !== 'undefined') {
    // Sistema de módulos existente
    (async () => {
        'use strict';
        
        const dependencias = ['APP_CONFIG', 'apiClient', 'ModuleLoader'];
        
        const inicializado = await window.ModuleLoader.initModule({
            moduleName: 'Dashboard Profesor Módulo 4',
            dependencies: dependencias,
            onReady: () => {
                dashboard = new ProfesorDashboard();
            },
            onError: (error) => {
                console.error('💥 Error al cargar dashboard:', error);
                // Fallback: inicializar sin módulos
                dashboard = new ProfesorDashboard();
            }
        });
    })();
} else {
    // Inicialización directa
    document.addEventListener('DOMContentLoaded', () => {
        dashboard = new ProfesorDashboard();
    });
}

// Exportar para uso global
window.ProfesorDashboard = ProfesorDashboard;
window.dashboard = dashboard;