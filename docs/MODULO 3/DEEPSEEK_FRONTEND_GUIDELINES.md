# 📘 FRONTEND MÓDULO 3 - GUÍA PARA DEEPSEEK

## 🎯 OBJETIVO
Expandir los archivos base del frontend para el Módulo 3 (Gestión del Aprendizaje), implementando las funcionalidades de:
- **UC-10**: Registrar progreso por lección
- **UC-11**: Sistema de recompensas (XP, niveles, logros)
- **UC-12**: Tablas de clasificación (leaderboards)

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
frontend/
├── pages/estudiante/
│   ├── mis-progresos.html        ✅ BASE CREADA
│   ├── leaderboard.html          ✅ BASE CREADA
│   └── logros-recompensas.html   ✅ BASE CREADA
│
└── assets/js/pages/estudiante/
    ├── progreso.js                ✅ BASE CREADA
    ├── leaderboard.js             ✅ BASE CREADA
    └── logros.js                  ✅ BASE CREADA
```

---

## 🔌 ENDPOINTS DEL BACKEND (YA IMPLEMENTADOS)

### Progreso (UC-10)
```javascript
GET  /api/progreso/usuario/:id              // Obtener todo el progreso del usuario
GET  /api/progreso/historial/:userId        // Historial de actividad (query: ?limite=10)
GET  /api/progreso/actividad-semanal/:userId // XP ganado por día de la semana
POST /api/progreso/registrar                // Registrar progreso nuevo
```

### Gamificación (UC-11, UC-12)
```javascript
GET  /api/gamificacion/perfil               // XP, nivel, racha del usuario
GET  /api/gamificacion/ranking              // Ranking (query: ?tipo=global|semanal|mensual&limite=20)
GET  /api/gamificacion/mi-posicion          // Posición del usuario (query: ?tipo=global)
GET  /api/gamificacion/logros/:userId       // Todos los logros (desbloqueados y bloqueados)
GET  /api/gamificacion/racha/:userId        // Detalles de la racha actual
POST /api/gamificacion/otorgar-xp          // Otorgar XP (body: {usuario_id, xp, razon})
```

---

## 🎨 PATRONES DE DISEÑO A SEGUIR

### 1. Estructura HTML
Todos los HTMLs deben seguir este patrón (ver `estudiante-dashboard.html`):

```html
<!DOCTYPE html>
<html lang="es" class="h-full scroll-smooth">
<head>
    <!-- Meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título - SpeakLexi</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="/assets/js/core/tailwind-config.js"></script>
    <link rel="stylesheet" href="/assets/css/custom-styles.css">
    <link rel="stylesheet" href="/assets/css/animations.css">
</head>
<body class="h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Navbar dinámico -->
    <div id="navbar-container"></div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <!-- Tu contenido aquí -->
    </div>

    <!-- Scripts (ORDEN IMPORTANTE) -->
    <script src="/config/app-config.js"></script>
    <script src="/assets/js/core/utils.js" async></script>
    <script src="/assets/js/core/api-client.js" async></script>
    <script src="/assets/js/core/toast-manager.js" async></script>
    <script src="/assets/js/core/navbar-loader.js" async></script>
    <script src="/assets/js/pages/estudiante/TU_ARCHIVO.js" defer></script>
</body>
</html>
```

### 2. Estructura JavaScript
Todos los JS deben seguir este patrón (ver `dashboard.js`):

```javascript
/* ============================================
   SPEAKLEXI - NOMBRE DEL MÓDULO
   Archivo: ruta/del/archivo.js
   ============================================ */

(() => {
    'use strict';

    // 1️⃣ VERIFICACIÓN DE DEPENDENCIAS
    const deps = ['APP_CONFIG', 'apiClient', 'toastManager', 'Utils'];
    for (const dep of deps) {
        if (!window[dep]) {
            console.error(`❌ ${dep} no cargado`);
            return;
        }
    }

    // 2️⃣ CONFIGURACIÓN
    const config = {
        API: window.APP_CONFIG.API,
        ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS
    };

    // 3️⃣ ELEMENTOS DOM
    const elementos = {
        miElemento: document.getElementById('mi-elemento')
    };

    // 4️⃣ ESTADO
    let estado = {
        usuario: null,
        datos: null
    };

    // 5️⃣ FUNCIONES PRINCIPALES
    function init() {
        verificarAuth();
        setupEventListeners();
        cargarDatos();
    }

    function verificarAuth() {
        estado.usuario = window.Utils.getFromStorage('usuario');
        if (!estado.usuario) {
            window.location.href = '/pages/auth/login.html';
            return;
        }
    }

    function setupEventListeners() {
        // Event listeners aquí
    }

    async function cargarDatos() {
        try {
            const response = await window.apiClient.get('TU_ENDPOINT');
            if (response.success) {
                estado.datos = response.data;
                renderizarUI();
            }
        } catch (error) {
            console.error('Error:', error);
            window.toastManager.error('Error al cargar datos');
        }
    }

    function renderizarUI() {
        // Actualizar DOM aquí
    }

    // 6️⃣ INICIALIZACIÓN
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

})();
```

---

## 📋 TAREAS ESPECÍFICAS POR ARCHIVO

### 1. `mis-progresos.html` + `progreso.js`

**HTML:**
- ✅ Estructura base ya creada
- ⚠️ **EXPANDIR**: 
  - 4 stat cards en `#stats-container`
  - Canvas para gráfico en `#graficoSemanal`
  - Lista de lecciones en `#lista-lecciones`
  - Tabla de historial en `#tabla-historial`

**JS - `progreso.js`:**

```javascript
// TAREA 1: Cargar datos del API
async function cargarDatos() {
    const [perfil, progreso, actividadSemanal] = await Promise.all([
        window.apiClient.get(`/api/gamificacion/perfil`),
        window.apiClient.get(`/api/progreso/usuario/${estado.usuario.id}`),
        window.apiClient.get(`/api/progreso/actividad-semanal/${estado.usuario.id}`)
    ]);
    
    estado.datosProgreso = {
        xp_total: perfil.data.xp_total,
        nivel: perfil.data.nivel,
        lecciones_completadas: progreso.data.lecciones_completadas,
        tiempo_total: progreso.data.tiempo_total_minutos,
        racha: perfil.data.racha_actual,
        actividad_semanal: actividadSemanal.data.xp_por_dia
    };
}

// TAREA 2: Renderizar 4 stat cards
function renderizarStats() {
    const cards = [
        {
            titulo: 'XP Total',
            valor: estado.datosProgreso.xp_total,
            subtitulo: `Nivel ${estado.datosProgreso.nivel}`,
            icono: 'fas fa-star',
            color: 'purple',
            progreso: 65 // Calcular progreso al siguiente nivel
        },
        {
            titulo: 'Lecciones',
            valor: estado.datosProgreso.lecciones_completadas,
            subtitulo: 'completadas',
            icono: 'fas fa-book',
            color: 'blue',
            progreso: null
        },
        {
            titulo: 'Tiempo Total',
            valor: Math.floor(estado.datosProgreso.tiempo_total / 60), // Convertir a horas
            subtitulo: 'horas de estudio',
            icono: 'fas fa-clock',
            color: 'green',
            progreso: null
        },
        {
            titulo: 'Racha Actual',
            valor: estado.datosProgreso.racha,
            subtitulo: 'días seguidos',
            icono: 'fas fa-fire',
            color: 'orange',
            progreso: 80
        }
    ];

    let html = '';
    cards.forEach(card => {
        html += `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${card.titulo}</p>
                        <p class="text-3xl font-bold text-${card.color}-600">${card.valor}</p>
                        <p class="text-xs text-gray-500 mt-1">${card.subtitulo}</p>
                    </div>
                    <div class="w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center">
                        <i class="${card.icono} text-${card.color}-600 text-2xl"></i>
                    </div>
                </div>
                ${card.progreso ? `
                    <div class="bg-gray-200 rounded-full h-2">
                        <div class="bg-${card.color}-500 h-2 rounded-full" style="width: ${card.progreso}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    elementos.statsContainer.innerHTML = html;
}

// TAREA 3: Implementar Chart.js para actividad semanal
function renderizarGraficoSemanal() {
    const ctx = elementos.graficoSemanal.getContext('2d');
    
    // Destruir chart anterior si existe
    if (estado.chartSemanal) {
        estado.chartSemanal.destroy();
    }
    
    estado.chartSemanal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'XP Ganado',
                data: estado.datosProgreso.actividad_semanal,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
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
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// TAREA 4: Renderizar lista de lecciones
function renderizarLecciones() {
    const lecciones = estado.datosProgreso.lecciones || [];
    
    let html = '';
    lecciones.forEach(leccion => {
        const completada = leccion.progreso >= 100;
        const tiempoFormateado = formatearTiempo(leccion.tiempo_dedicado);
        
        html += `
            <div class="p-4 rounded-xl ${completada ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'} 
                        border ${completada ? 'border-green-200' : 'border-gray-200'} hover:shadow-md transition-all">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white">${leccion.titulo}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${leccion.nivel} • ${leccion.idioma}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold 
                                ${completada ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
                        ${completada ? 'Completada' : 'En progreso'}
                    </span>
                </div>
                
                <div class="mt-3 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div class="bg-primary-500 h-2 rounded-full transition-all duration-500" 
                         style="width: ${leccion.progreso}%"></div>
                </div>
                
                <div class="mt-2 flex items-center justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">${leccion.progreso}% completado</span>
                    <span class="text-gray-600 dark:text-gray-400">
                        <i class="fas fa-clock"></i> ${tiempoFormateado}
                    </span>
                </div>
            </div>
        `;
    });
    
    elementos.listaLecciones.innerHTML = html || '<p class="text-gray-500 text-center py-8">No hay lecciones disponibles</p>';
}

// TAREA 5: Renderizar historial
function renderizarHistorial() {
    const historial = estado.datosProgreso.historial || [];
    
    let rows = '';
    historial.forEach(item => {
        const fechaFormateada = formatearFechaRelativa(item.fecha);
        
        rows += `
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${fechaFormateada}</td>
                <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">${item.leccion_titulo}</td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        ${item.progreso}%
                    </span>
                </td>
                <td class="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
                    +${item.xp_ganado} XP
                </td>
            </tr>
        `;
    });
    
    elementos.tablaHistorial.innerHTML = `
        <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Fecha</th>
                    <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Lección</th>
                    <th class="px-4 py-2 text-center text-gray-700 dark:text-gray-300">Progreso</th>
                    <th class="px-4 py-2 text-right text-gray-700 dark:text-gray-300">XP</th>
                </tr>
            </thead>
            <tbody>
                ${rows || '<tr><td colspan="4" class="text-center py-8 text-gray-500">Sin historial</td></tr>'}
            </tbody>
        </table>
    `;
}

// Funciones auxiliares
function formatearTiempo(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) return `${horas}h ${mins}min`;
    return `${mins}min`;
}

function formatearFechaRelativa(fecha) {
    const ahora = new Date();
    const fechaObj = new Date(fecha);
    const diffMs = ahora - fechaObj;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHoras < 1) return 'Hace unos minutos';
    if (diffHoras < 24) return `Hace ${diffHoras} horas`;
    if (diffHoras < 48) return 'Ayer';
    
    return fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
```

---

### 2. `leaderboard.html` + `leaderboard.js`

**TAREAS:**

1. **Implementar sistema de tabs**
   - 4 tabs: Global, Semanal, Mensual, Por Nivel
   - Al hacer clic, cambiar clase `active` y recargar ranking

2. **Renderizar "Mi Posición"**
   - Card destacado arriba del ranking
   - Mostrar: posición, avatar, nombre, XP
   - Usar gradiente de fondo

3. **Renderizar Top 3 especial**
   - Top 1: 🥇 + fondo dorado (`bg-gradient-to-r from-yellow-50 to-orange-50`)
   - Top 2: 🥈 + fondo plateado
   - Top 3: 🥉 + fondo bronce

4. **Renderizar resto del ranking**
   - Lista simple con: posición, avatar, nombre, XP
   - Highlight del usuario actual con borde azul

**Ejemplo de código:**

```javascript
function renderizarRanking() {
    let html = '';
    
    estado.rankingData.forEach((user, index) => {
        const isTop3 = index < 3;
        const isCurrentUser = user.id === estado.usuario.id;
        const medallas = ['🥇', '🥈', '🥉'];
        
        let clasesFondo = 'bg-white dark:bg-gray-800';
        if (index === 0) clasesFondo = 'bg-gradient-to-r from-yellow-50 to-orange-50';
        else if (index === 1) clasesFondo = 'bg-gradient-to-r from-gray-50 to-gray-100';
        else if (index === 2) clasesFondo = 'bg-gradient-to-r from-orange-50 to-yellow-50';
        
        if (isCurrentUser) clasesFondo += ' border-2 border-primary-500';
        
        html += `
            <div class="flex items-center gap-4 p-4 rounded-xl mb-3 ${clasesFondo} shadow hover:shadow-lg transition-all">
                <div class="text-2xl font-bold ${isTop3 ? 'text-3xl' : 'text-gray-500'}">
                    ${isTop3 ? medallas[index] : user.posicion}
                </div>
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=6366f1&color=fff" 
                     class="w-12 h-12 rounded-full ${isTop3 ? 'border-4 border-yellow-400' : ''}" 
                     alt="${user.nombre}">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white">${user.nombre}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${user.xp} XP</p>
                </div>
                ${isCurrentUser ? '<span class="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">Tú</span>' : ''}
            </div>
        `;
    });
    
    elementos.rankingContainer.innerHTML = html;
}
```

---

### 3. `logros-recompensas.html` + `logros.js`

**TAREAS:**

1. **Perfil de Gamificación**
   - Nivel grande (texto 6xl)
   - XP actual / XP siguiente nivel
   - Barra de progreso animada
   - Fondo degradado

2. **Grid de Logros**
   - 3 columnas en desktop, 1 en móvil
   - Desbloqueados: colores vibrantes, sin efectos
   - Bloqueados: `grayscale` + `opacity-50` + candado 🔒

3. **Visualización de Racha**
   - Número grande de días + icono de fuego
   - Calendario de últimos 7 días (cuadrados verdes/grises)

4. **Próximas Recompensas**
   - Lista de 3 próximos logros
   - Cada uno con barra de progreso
   - Mostrar requisitos faltantes

**Ejemplo de código para logros:**

```javascript
function renderizarLogros() {
    let html = '';
    
    estado.logros.forEach(logro => {
        const desbloqueado = logro.desbloqueado;
        const clases = desbloqueado 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 grayscale opacity-50';
        
        html += `
            <div class="p-6 rounded-2xl shadow-lg ${clases} hover:scale-105 transition-all">
                <div class="text-5xl mb-4 text-center">${desbloqueado ? logro.icono : '🔒'}</div>
                <h3 class="text-xl font-bold mb-2 text-center">${logro.nombre}</h3>
                <p class="text-sm opacity-90 text-center">${logro.descripcion}</p>
                ${desbloqueado ? `
                    <div class="mt-4 text-center">
                        <span class="text-xs bg-white/20 px-3 py-1 rounded-full">
                            Desbloqueado el ${new Date(logro.fecha_desbloqueo).toLocaleDateString('es-ES')}
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    elementos.logrosContainer.innerHTML = html;
}
```

---

## ⚠️ PUNTOS IMPORTANTES

1. **NO crear nuevos archivos CSS/JS core** - Solo expandir los archivos base proporcionados

2. **Usar `window.apiClient`** para todas las llamadas al API:
   ```javascript
   const response = await window.apiClient.get('/api/endpoint');
   if (response.success) {
       // Usar response.data
   }
   ```

3. **Mostrar toasts** para feedback:
   ```javascript
   window.toastManager.success('Operación exitosa');
   window.toastManager.error('Error al cargar');
   window.toastManager.info('Información');
   ```

4. **Dark mode** - Todas las clases deben incluir variantes dark:
   ```html
   <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
   ```

5. **Responsive** - Usar clases de Tailwind:
   ```html
   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
   ```

6. **Animaciones** - Usar transiciones:
   ```html
   <div class="hover:shadow-lg transition-all duration-300">
   ```

---

## ✅ CHECKLIST FINAL

Antes de considerar completo el módulo, verificar:

- [ ] Todas las páginas HTML se ven bien en móvil, tablet y desktop
- [ ] Dark mode funciona correctamente en todas las páginas
- [ ] Todos los endpoints del API están conectados
- [ ] Los gráficos de Chart.js se renderizan correctamente
- [ ] Los datos de ejemplo se reemplazan con datos reales del API
- [ ] Los toasts se muestran en las operaciones
- [ ] La navegación entre páginas funciona
- [ ] No hay errores en la consola del navegador
- [ ] El código sigue los patrones establecidos
- [ ] Los comentarios `// DeepSeek:` fueron resueltos

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Día 1**: Completar `mis-progresos.html` + `progreso.js`
   - Stats cards
   - Gráfico semanal
   - Lista de lecciones
   - Historial

2. **Día 2**: Completar `leaderboard.html` + `leaderboard.js`
   - Sistema de tabs
   - Mi posición
   - Top 3 especial
   - Ranking completo

3. **Día 3**: Completar `logros-recompensas.html` + `logros.js`
   - Perfil gamificación
   - Grid de logros
   - Visualización de racha
   - Próximas recompensas

---

## 📞 RECURSOS ADICIONALES

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Chart.js**: https://www.chartjs.org/docs/latest/
- **Font Awesome**: https://fontawesome.com/icons

---

**¡IMPORTANTE!**: Si encuentras algún endpoint que no existe o da error, verifica primero que el backend esté corriendo y que las rutas estén registradas en `server.js`.
