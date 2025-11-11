# 🤖 GUIDELINES PARA DEEPSEEK - MÓDULO 4 FRONTEND
## SpeakLexi 2.0 - Gestión de Desempeño y Retroalimentación

---

## 📋 CONTEXTO

Has recibido archivos **base** del frontend del Módulo 4. Tu trabajo es **expandir y completar** las funcionalidades marcadas con `// DeepSeek:` en los archivos JavaScript.

**Archivos a trabajar**:
- `js/estudiante/estadisticas.js` (UC-13)
- `js/estudiante/retroalimentacion.js` (UC-14) 
- `js/profesor/retroalimentacion-profesor.js` (UC-14)
- `js/profesor/planificacion.js` (UC-15)

**Archivos HTML**: ✅ Completos, no modificar

---

## 🎯 ESTRATEGIA GENERAL

### 1. Código base ya implementado ✅

- ✅ Estructura modular con IIFE
- ✅ Inicialización con `ModuleLoader`
- ✅ Configuración desde `APP_CONFIG`
- ✅ Manejo de errores básico
- ✅ Integración con `apiClient`
- ✅ UI base en HTML

### 2. Tu trabajo 🔄

Buscar comentarios `// DeepSeek:` y expandir:
- Lógica de negocio compleja
- Validaciones avanzadas
- Filtros y búsquedas
- Generación de gráficos
- Exportación de datos
- Notificaciones en tiempo real

---

## 🔧 PATRONES OBLIGATORIOS

### Patrón 1: Uso de APP_CONFIG

**❌ NUNCA hacer esto**:
```javascript
fetch('http://localhost:5000/api/estadisticas/alumno/123')
localStorage.getItem('token')
```

**✅ SIEMPRE hacer esto**:
```javascript
const userId = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
const endpoint = APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.ALUMNO.replace(':id', userId);
apiClient.get(endpoint)
```

### Patrón 2: Destructuring de queries (Backend)

Si tocas el backend:

**❌ NUNCA**:
```javascript
const data = await pool.query('SELECT * FROM...');
const user = data[0];
```

**✅ SIEMPRE**:
```javascript
const [rows] = await pool.query('SELECT * FROM...');
const user = rows[0];
```

### Patrón 3: Manejo de errores

**❌ NUNCA**:
```javascript
fetch('/api/...').then(res => res.json()).then(data => {...})
```

**✅ SIEMPRE**:
```javascript
try {
    const response = await apiClient.get(endpoint);
    // manejar response
} catch (error) {
    console.error('Error:', error);
    toastManager.error(error.message || 'Error al cargar datos');
}
```

### Patrón 4: Chart.js (Gráficos)

**Ejemplo correcto**:
```javascript
const ctx = document.getElementById('miGrafico').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Ene', 'Feb', 'Mar'],
        datasets: [{
            label: 'Progreso',
            data: [65, 75, 85],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true }
        }
    }
});
```

### Patrón 5: Formateo de fechas

```javascript
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
```

---

## 📝 ARCHIVO 1: estadisticas.js (UC-13)

### Estado actual ✅
- Estructura IIFE lista
- Inicialización con ModuleLoader
- Función `cargarEstadisticas()` base
- Elementos DOM identificados

### Tu trabajo 🔄

#### 1. Expandir `cargarEstadisticas()`

**Ubicación**: Línea ~90
```javascript
// DeepSeek: Implementar carga completa de estadísticas
async function cargarEstadisticas() {
    try {
        mostrarCargando(true);
        
        // 1. Obtener ID del usuario desde localStorage
        const usuarioId = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
        
        // 2. Llamar a los endpoints
        const [estadisticas, areasMejora] = await Promise.all([
            apiClient.get(APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.ALUMNO.replace(':id', usuarioId)),
            apiClient.get(APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.AREAS_MEJORA.replace(':id', usuarioId))
        ]);
        
        // 3. Renderizar datos
        renderizarResumenGeneral(estadisticas.data);
        renderizarGraficoProgreso(estadisticas.data.progreso_temporal);
        renderizarMetricasHabilidades(estadisticas.data.metricas_habilidades);
        renderizarAreasMejora(areasMejora.data);
        
        mostrarCargando(false);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        mostrarCargando(false);
        toastManager.error('Error al cargar estadísticas');
    }
}
```

#### 2. Implementar `renderizarGraficoProgreso()`

**Ubicación**: Línea ~120
```javascript
// DeepSeek: Crear gráfico de progreso con Chart.js
function renderizarGraficoProgreso(datos) {
    const ctx = document.getElementById('grafico-progreso').getContext('2d');
    
    // Extraer labels y data
    const labels = datos.map(d => formatearFecha(d.fecha));
    const xpData = datos.map(d => d.xp_acumulado);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'XP Acumulado',
                data: xpData,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
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
                    title: {
                        display: true,
                        text: 'Puntos XP'
                    }
                }
            }
        }
    });
}
```

#### 3. Implementar `renderizarMetricasHabilidades()`

**Ubicación**: Línea ~170
```javascript
// DeepSeek: Renderizar barra de progreso por cada habilidad
function renderizarMetricasHabilidades(metricas) {
    const container = elementos.metricasHabilidades;
    
    const habilidades = [
        { nombre: 'Lectura', key: 'lectura', color: 'bg-blue-500' },
        { nombre: 'Escritura', key: 'escritura', color: 'bg-green-500' },
        { nombre: 'Escucha', key: 'escucha', color: 'bg-yellow-500' },
        { nombre: 'Habla', key: 'habla', color: 'bg-red-500' }
    ];
    
    container.innerHTML = habilidades.map(hab => {
        const valor = metricas[hab.key] || 0;
        return `
            <div class="mb-4">
                <div class="flex justify-between mb-1">
                    <span class="font-medium">${hab.nombre}</span>
                    <span class="text-sm text-gray-600">${valor}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="${hab.color} h-2 rounded-full transition-all duration-300" 
                         style="width: ${valor}%"></div>
                </div>
            </div>
        `;
    }).join('');
}
```

#### 4. Implementar exportación a PDF (OPCIONAL)

**Ubicación**: Línea ~200
```javascript
// DeepSeek: Exportar estadísticas a PDF
async function exportarPDF() {
    try {
        // Puedes usar jsPDF o generar en backend
        toastManager.success('Generando PDF...');
        
        // Llamar a endpoint de backend que genere PDF
        const usuarioId = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
        const response = await apiClient.get(
            `${APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.REPORTE}?usuario_id=${usuarioId}&formato=pdf`,
            { responseType: 'blob' }
        );
        
        // Descargar archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `estadisticas-${new Date().getTime()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toastManager.success('PDF descargado exitosamente');
    } catch (error) {
        toastManager.error('Error al generar PDF');
    }
}
```

---

## 📝 ARCHIVO 2: retroalimentacion.js (UC-14 - Estudiante)

### Tu trabajo 🔄

#### 1. Implementar `cargarRetroalimentacion()`

**Ubicación**: Línea ~75
```javascript
// DeepSeek: Cargar retroalimentación del alumno
async function cargarRetroalimentacion() {
    try {
        mostrarCargando(true);
        
        const usuarioId = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
        const endpoint = APP_CONFIG.API.ENDPOINTS.RETROALIMENTACION.POR_ALUMNO.replace(':id', usuarioId);
        
        const response = await apiClient.get(endpoint);
        estado.retroalimentaciones = response.data;
        
        aplicarFiltros(); // Aplicar filtros actuales
        mostrarCargando(false);
    } catch (error) {
        console.error('Error:', error);
        mostrarCargando(false);
        toastManager.error('Error al cargar retroalimentación');
    }
}
```

#### 2. Implementar `aplicarFiltros()`

**Ubicación**: Línea ~95
```javascript
// DeepSeek: Filtrar retroalimentación por fecha y lección
function aplicarFiltros() {
    let filtradas = [...estado.retroalimentaciones];
    
    // Filtro por lección
    if (estado.filtros.leccion !== 'todas') {
        filtradas = filtradas.filter(r => r.leccion_id === parseInt(estado.filtros.leccion));
    }
    
    // Filtro por fecha
    if (estado.filtros.fecha) {
        const fechaFiltro = new Date(estado.filtros.fecha);
        filtradas = filtradas.filter(r => {
            const fechaRetro = new Date(r.fecha_creacion);
            return fechaRetro.toDateString() === fechaFiltro.toDateString();
        });
    }
    
    // Ordenar por fecha descendente
    filtradas.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    
    renderizarLista(filtradas);
}
```

#### 3. Implementar `responderComentario()`

**Ubicación**: Línea ~130
```javascript
// DeepSeek: Enviar respuesta a un comentario del profesor
async function responderComentario(retroalimentacionId) {
    const respuesta = elementos.respuestaInput.value.trim();
    
    if (!respuesta) {
        toastManager.warning('Escribe una respuesta');
        return;
    }
    
    try {
        const endpoint = APP_CONFIG.API.ENDPOINTS.RETROALIMENTACION.RESPONDER.replace(':id', retroalimentacionId);
        
        await apiClient.post(endpoint, {
            respuesta: respuesta
        });
        
        toastManager.success('Respuesta enviada');
        elementos.respuestaInput.value = '';
        cerrarModal();
        cargarRetroalimentacion(); // Recargar lista
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al enviar respuesta');
    }
}
```

---

## 📝 ARCHIVO 3: retroalimentacion-profesor.js (UC-14 - Profesor)

### Tu trabajo 🔄

#### 1. Implementar `cargarAlumnos()`

**Ubicación**: Línea ~80
```javascript
// DeepSeek: Cargar lista de alumnos del profesor
async function cargarAlumnos() {
    try {
        // Endpoint puede variar según backend
        const response = await apiClient.get(APP_CONFIG.API.ENDPOINTS.PROFESOR.ALUMNOS);
        estado.alumnos = response.data;
        
        renderizarListaAlumnos(response.data);
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al cargar alumnos');
    }
}
```

#### 2. Implementar `crearComentario()`

**Ubicación**: Línea ~110
```javascript
// DeepSeek: Crear nuevo comentario para un alumno
async function crearComentario(event) {
    event.preventDefault();
    
    // Validar formulario
    const valido = formValidator.validateForm(elementos.form);
    if (!valido) {
        toastManager.warning('Completa todos los campos requeridos');
        return;
    }
    
    const formData = new FormData(elementos.form);
    const datos = {
        alumno_id: formData.get('alumno_id'),
        leccion_id: formData.get('leccion_id'),
        comentario: formData.get('comentario'),
        calificacion: parseInt(formData.get('calificacion')) || null
    };
    
    try {
        await apiClient.post(APP_CONFIG.API.ENDPOINTS.RETROALIMENTACION.CREAR, datos);
        
        toastManager.success('Comentario creado exitosamente');
        elementos.form.reset();
        cerrarModal();
        
        // Recargar si hay un alumno seleccionado
        if (estado.alumnoSeleccionado) {
            cargarRetroalimentacionAlumno(estado.alumnoSeleccionado);
        }
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al crear comentario');
    }
}
```

#### 3. Implementar `cargarRetroalimentacionAlumno()`

**Ubicación**: Línea ~150
```javascript
// DeepSeek: Cargar retroalimentación de un alumno específico
async function cargarRetroalimentacionAlumno(alumnoId) {
    try {
        mostrarCargando(true);
        estado.alumnoSeleccionado = alumnoId;
        
        const endpoint = APP_CONFIG.API.ENDPOINTS.RETROALIMENTACION.POR_ALUMNO.replace(':id', alumnoId);
        const response = await apiClient.get(endpoint);
        
        renderizarRetroalimentacionAlumno(response.data);
        mostrarCargando(false);
    } catch (error) {
        console.error('Error:', error);
        mostrarCargando(false);
        toastManager.error('Error al cargar retroalimentación');
    }
}
```

---

## 📝 ARCHIVO 4: planificacion.js (UC-15 - Profesor)

### Tu trabajo 🔄

#### 1. Implementar `cargarDashboard()`

**Ubicación**: Línea ~85
```javascript
// DeepSeek: Cargar dashboard con análisis de desempeño del grupo
async function cargarDashboard() {
    try {
        mostrarCargando(true);
        
        // Llamar a endpoint de análisis
        const response = await apiClient.post(APP_CONFIG.API.ENDPOINTS.PLANIFICACION.ANALIZAR);
        
        renderizarAnalisisGrupo(response.data.analisis);
        renderizarAreasCriticas(response.data.areas_criticas);
        renderizarSugerencias(response.data.sugerencias);
        
        mostrarCargando(false);
    } catch (error) {
        console.error('Error:', error);
        mostrarCargando(false);
        toastManager.error('Error al cargar análisis');
    }
}
```

#### 2. Implementar `crearPlan()`

**Ubicación**: Línea ~120
```javascript
// DeepSeek: Crear nuevo plan de contenido
async function crearPlan(event) {
    event.preventDefault();
    
    const valido = formValidator.validateForm(elementos.formCrearPlan);
    if (!valido) {
        toastManager.warning('Completa todos los campos');
        return;
    }
    
    const formData = new FormData(elementos.formCrearPlan);
    const datos = {
        titulo: formData.get('titulo'),
        descripcion: formData.get('descripcion'),
        nivel: formData.get('nivel'),
        areas_enfoque: formData.getAll('areas_enfoque'), // checkbox múltiple
        fecha_inicio: formData.get('fecha_inicio'),
        fecha_fin: formData.get('fecha_fin')
    };
    
    try {
        await apiClient.post(APP_CONFIG.API.ENDPOINTS.PLANIFICACION.CREAR_PLAN, datos);
        
        toastManager.success('Plan creado exitosamente');
        elementos.formCrearPlan.reset();
        cerrarModal();
        cargarPlanes();
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al crear plan');
    }
}
```

#### 3. Implementar `cargarPlanes()`

**Ubicación**: Línea ~160
```javascript
// DeepSeek: Cargar lista de planes de contenido
async function cargarPlanes() {
    try {
        const response = await apiClient.get(APP_CONFIG.API.ENDPOINTS.PLANIFICACION.PLANES);
        estado.planes = response.data;
        
        renderizarListaPlanes(response.data);
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al cargar planes');
    }
}
```

#### 4. Implementar `editarPlan()` y `eliminarPlan()`

**Ubicación**: Línea ~180
```javascript
// DeepSeek: Editar plan existente
async function editarPlan(planId) {
    try {
        // Cargar datos del plan
        const endpoint = APP_CONFIG.API.ENDPOINTS.PLANIFICACION.DETALLE.replace(':id', planId);
        const response = await apiClient.get(endpoint);
        
        // Llenar formulario con datos
        llenarFormularioEdicion(response.data);
        
        // Mostrar modal de edición
        mostrarModalEdicion(planId);
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al cargar plan');
    }
}

// DeepSeek: Eliminar plan
async function eliminarPlan(planId) {
    const confirmado = await mostrarConfirmacion('¿Eliminar este plan?');
    if (!confirmado) return;
    
    try {
        const endpoint = APP_CONFIG.API.ENDPOINTS.PLANIFICACION.ELIMINAR.replace(':id', planId);
        await apiClient.delete(endpoint);
        
        toastManager.success('Plan eliminado');
        cargarPlanes();
    } catch (error) {
        console.error('Error:', error);
        toastManager.error('Error al eliminar plan');
    }
}
```

---

## 🎨 MEJORAS UI/UX OPCIONALES

### 1. Loading states mejorados

```javascript
function mostrarCargando(mostrar, elemento = null) {
    const target = elemento || elementos.contenidoPrincipal;
    
    if (mostrar) {
        target.innerHTML = `
            <div class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        `;
    }
}
```

### 2. Estados vacíos

```javascript
function mostrarEstadoVacio(mensaje, icono = '📭') {
    return `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">${icono}</div>
            <p class="text-gray-600">${mensaje}</p>
        </div>
    `;
}
```

### 3. Animaciones de entrada

```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.3s ease-out;
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de considerar el trabajo completo, verifica:

### General
- [ ] Todos los comentarios `// DeepSeek:` están implementados
- [ ] No hay errores en consola
- [ ] Uso correcto de `APP_CONFIG`
- [ ] Manejo de errores con try/catch
- [ ] Destructuring correcto de queries (si tocaste backend)

### UC-13 (Estadísticas)
- [ ] Se cargan estadísticas del alumno
- [ ] Gráfico de progreso renderiza con Chart.js
- [ ] Métricas por habilidad muestran barras de progreso
- [ ] Áreas de mejora se identifican correctamente
- [ ] (Opcional) Exportación a PDF funciona

### UC-14 (Retroalimentación)
- [ ] Estudiante ve lista de comentarios
- [ ] Filtros funcionan (por lección, por fecha)
- [ ] Estudiante puede responder comentarios
- [ ] Profesor ve lista de alumnos
- [ ] Profesor puede crear nuevos comentarios
- [ ] Calificaciones se muestran correctamente

### UC-15 (Planificación)
- [ ] Dashboard de análisis se carga
- [ ] Áreas críticas se identifican
- [ ] Se pueden crear nuevos planes
- [ ] Lista de planes se muestra
- [ ] Se pueden editar planes existentes
- [ ] Se pueden eliminar planes

---

## 🚨 ERRORES COMUNES A EVITAR

### 1. No usar apiClient
```javascript
// ❌ MAL
fetch('/api/estadisticas/...')

// ✅ BIEN
apiClient.get(APP_CONFIG.API.ENDPOINTS.ESTADISTICAS....)
```

### 2. No manejar estados de carga
```javascript
// ❌ MAL
async function cargar() {
    const data = await apiClient.get(...);
    renderizar(data);
}

// ✅ BIEN
async function cargar() {
    try {
        mostrarCargando(true);
        const data = await apiClient.get(...);
        renderizar(data);
    } catch (error) {
        toastManager.error('Error');
    } finally {
        mostrarCargando(false);
    }
}
```

### 3. No validar datos antes de enviar
```javascript
// ❌ MAL
async function enviar() {
    const data = { ... };
    await apiClient.post(..., data);
}

// ✅ BIEN
async function enviar() {
    const valido = formValidator.validateForm(form);
    if (!valido) {
        toastManager.warning('Completa el formulario');
        return;
    }
    
    const data = { ... };
    await apiClient.post(..., data);
}
```

### 4. No limpiar formularios después de enviar
```javascript
// ✅ BIEN
async function crear() {
    // ... crear recurso
    form.reset();
    cerrarModal();
    recargarLista();
}
```

---

## 📚 RECURSOS ÚTILES

### Chart.js
- Documentación: https://www.chartjs.org/docs/latest/
- Tipos de gráficos: line, bar, pie, doughnut, radar

### Validación
- Usar `formValidator` del core
- Reglas en `APP_CONFIG.VALIDATION`

### Fechas
- Usar `new Date()` nativo de JavaScript
- Formato: `toLocaleDateString('es-MX', { ... })`

### Filtros y búsqueda
- Array methods: `filter()`, `map()`, `sort()`
- Buscar en múltiples campos: usar `.includes()` o regex

---

## 💡 TIPS FINALES

1. **Sigue el patrón del Módulo 3**: Los archivos del Módulo 3 son tu mejor referencia
2. **Lee los comentarios**: Cada `// DeepSeek:` tiene contexto sobre qué hacer
3. **Prueba incrementalmente**: Implementa una función, prueba, continúa
4. **Usa console.log()**: Para debuggear el flujo de datos
5. **Verifica el backend**: Si un endpoint no funciona, revisa el backend primero

---

## 🎓 EJEMPLO COMPLETO DE FLUJO

```javascript
// 1. Usuario carga página de estadísticas

// 2. ModuleLoader inicializa el módulo
const inicializado = await window.ModuleLoader.initModule({...});

// 3. Se llama a inicializarModulo()
async function inicializarModulo() {
    // 4. Verificar token
    const token = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.TOKEN);
    if (!token) {
        window.location.href = APP_CONFIG.UI.RUTAS.LOGIN;
        return;
    }
    
    // 5. Cargar datos
    await cargarEstadisticas();
    
    // 6. Configurar listeners
    configurarListeners();
}

// 7. Función cargarEstadisticas llama al backend
async function cargarEstadisticas() {
    try {
        mostrarCargando(true);
        
        const userId = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
        const response = await apiClient.get(
            APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.ALUMNO.replace(':id', userId)
        );
        
        renderizar(response.data);
        
    } catch (error) {
        toastManager.error('Error al cargar');
    } finally {
        mostrarCargando(false);
    }
}

// 8. Renderizar datos en el DOM
function renderizar(datos) {
    elementos.contenedor.innerHTML = generarHTML(datos);
}
```

---

**¡Éxito con la implementación! 🚀**

Si tienes dudas:
1. Revisa los archivos del Módulo 3 (mismo patrón)
2. Consulta API-REFERENCE.md para endpoints
3. Revisa app-config.js para configuración
