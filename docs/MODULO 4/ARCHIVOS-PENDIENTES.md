# ARCHIVOS PENDIENTES - MÓDULO 4 FRONTEND

Este archivo documenta los archivos que DeepSeek debe crear siguiendo el patrón de `estadisticas.html` y `estadisticas.js`.

---

## ARCHIVO: html/estudiante/retroalimentacion.html

### Estructura similar a estadisticas.html pero con:

**Secciones**:
1. Header: "💬 Mi Retroalimentación"
2. Filtros:
   - Select de lección
   - Input de fecha
   - Botón "Filtrar"
3. Lista de comentarios del profesor:
   - Card por cada retroalimentación
   - Mostrar: profesor, lección, fecha, comentario, calificación
   - Botón "Responder" si no tiene respuesta
4. Modal para responder comentario
5. Estado vacío si no hay retroalimentación

**IDs importantes**:
- `#filtro-leccion`
- `#filtro-fecha`
- `#btn-filtrar`
- `#lista-retroalimentacion`
- `#modal-responder`
- `#textarea-respuesta`
- `#btn-enviar-respuesta`

---

## ARCHIVO: js/estudiante/retroalimentacion.js

### Estructura base (patrón IIFE + ModuleLoader):

```javascript
(async () => {
    'use strict';

    const dependencias = ['APP_CONFIG', 'apiClient', 'toastManager', 'formValidator', 'ModuleLoader'];
    
    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Retroalimentación Estudiante',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => { /* ... */ }
    });

    if (!inicializado) return;

    async function inicializarModulo() {
        // Config, elementos, estado
        
        // DeepSeek: Implementar
        async function cargarRetroalimentacion() {
            // GET /api/retroalimentacion/alumno/:id
        }
        
        // DeepSeek: Implementar
        function aplicarFiltros() {
            // Filtrar por leccion_id y fecha
        }
        
        // DeepSeek: Implementar
        function renderizarLista(retroalimentaciones) {
            // Generar HTML para cards
        }
        
        // DeepSeek: Implementar
        async function responderComentario(retroalimentacionId) {
            // POST /api/retroalimentacion/:id/responder
        }
        
        // Event listeners
        // Inicialización
    }
})();
```

---

## ARCHIVO: html/profesor/retroalimentacion-profesor.html

### Estructura:

**Secciones**:
1. Header: "💬 Gestión de Retroalimentación"
2. Panel lateral: Lista de alumnos
3. Panel principal:
   - Header del alumno seleccionado
   - Botón "Nuevo Comentario"
   - Lista de retroalimentación del alumno
4. Modal crear comentario:
   - Select alumno
   - Select lección
   - Textarea comentario
   - Input calificación (0-10)
   - Select tipo (positiva/negativa/neutra)

**IDs importantes**:
- `#lista-alumnos`
- `#alumno-seleccionado-nombre`
- `#lista-retroalimentacion-alumno`
- `#btn-nuevo-comentario`
- `#modal-crear`
- `#form-crear-comentario`

---

## ARCHIVO: js/profesor/retroalimentacion-profesor.js

### Funciones a implementar:

```javascript
// DeepSeek: Implementar
async function cargarAlumnos() {
    // GET /api/profesor/alumnos
}

// DeepSeek: Implementar
async function cargarRetroalimentacionAlumno(alumnoId) {
    // GET /api/retroalimentacion/alumno/:id
}

// DeepSeek: Implementar
async function crearComentario(event) {
    // Validar formulario
    // POST /api/retroalimentacion/crear
}

// DeepSeek: Implementar
async function editarComentario(retroId) {
    // Cargar datos y mostrar modal edición
}

// DeepSeek: Implementar
async function eliminarComentario(retroId) {
    // Confirmar y DELETE
}
```

---

## ARCHIVO: html/profesor/planificacion.html

### Estructura:

**Secciones**:
1. Header: "📋 Planificación de Contenidos"
2. Dashboard de análisis:
   - Cards de métricas del grupo
   - Gráfico de desempeño por área
   - Lista de áreas críticas
3. Sección de sugerencias automáticas
4. Lista de planes de contenido:
   - Cards con título, descripción, estado, fechas
   - Botones: Ver, Editar, Eliminar
5. Botón flotante: "Crear Nuevo Plan"
6. Modal crear/editar plan:
   - Input título
   - Textarea descripción
   - Select nivel
   - Checkboxes áreas de enfoque
   - Date inputs (fecha inicio/fin)

**IDs importantes**:
- `#analisis-grupo`
- `#areas-criticas`
- `#sugerencias`
- `#lista-planes`
- `#btn-crear-plan`
- `#modal-plan`
- `#form-plan`

---

## ARCHIVO: js/profesor/planificacion.js

### Funciones a implementar:

```javascript
// DeepSeek: Implementar
async function cargarDashboard() {
    // POST /api/planificacion/analizar
    // Renderizar análisis, áreas críticas, sugerencias
}

// DeepSeek: Implementar
async function cargarPlanes() {
    // GET /api/planificacion/planes
}

// DeepSeek: Implementar
async function crearPlan(event) {
    // Validar formulario
    // POST /api/planificacion/crear
}

// DeepSeek: Implementar
async function editarPlan(planId) {
    // GET /api/planificacion/:id
    // Llenar formulario
    // PUT /api/planificacion/:id
}

// DeepSeek: Implementar
async function eliminarPlan(planId) {
    // Confirmar
    // DELETE /api/planificacion/:id
}

// DeepSeek: Implementar
function renderizarAnalisisGrupo(analisis) {
    // Mostrar métricas generales del grupo
}

// DeepSeek: Implementar
function renderizarAreasCriticas(areas) {
    // Cards con áreas que necesitan atención
}

// DeepSeek: Implementar
function renderizarSugerencias(sugerencias) {
    // Lista de recomendaciones automáticas
}
```

---

## PATRONES COMUNES A TODOS LOS ARCHIVOS

### 1. Estructura HTML
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Tailwind + Chart.js + Config + Core utilities -->
</head>
<body>
    <div id="navbar-container"></div>
    <main class="container mx-auto px-4 py-8">
        <!-- Contenido específico -->
    </main>
    
    <!-- Modales -->
    <!-- Loading overlay -->
    
    <script src="navbar-loader.js"></script>
    <script src="[archivo-especifico].js"></script>
</body>
</html>
```

### 2. Estructura JavaScript
```javascript
(async () => {
    'use strict';

    // 1. Dependencias
    // 2. ModuleLoader.initModule
    // 3. function inicializarModulo() {
    //      - Config
    //      - Elementos
    //      - Estado
    //      - Funciones auxiliares
    //      - Funciones principales (con comentarios DeepSeek)
    //      - Event listeners
    //      - Verificar auth
    //      - Llamadas iniciales
    //    }
})();
```

### 3. Comentarios DeepSeek
```javascript
// DeepSeek: [Descripción de la tarea]
// - Paso 1
// - Paso 2
// - Paso 3
async function nombreFuncion() {
    // Código base mínimo o TODO
}
```

### 4. Manejo de errores
```javascript
try {
    mostrarCargando(true);
    const response = await apiClient.METHOD(endpoint, data);
    // Procesar respuesta
    toastManager.success('Operación exitosa');
} catch (error) {
    console.error('Error:', error);
    toastManager.error('Error al [acción]');
} finally {
    mostrarCargando(false);
}
```

### 5. Validación de formularios
```javascript
async function submitForm(event) {
    event.preventDefault();
    
    const valido = formValidator.validateForm(elementos.form);
    if (!valido) {
        toastManager.warning('Completa todos los campos');
        return;
    }
    
    // Procesar formulario
}
```

---

## CHECKLIST PARA DEEPSEEK

Al implementar cada archivo, verificar:

- [ ] IIFE con async
- [ ] ModuleLoader.initModule correcto
- [ ] Todos los comentarios `// DeepSeek:` implementados
- [ ] Uso de APP_CONFIG para endpoints
- [ ] Uso de apiClient (no fetch directo)
- [ ] Manejo de errores con try/catch
- [ ] toastManager para feedback al usuario
- [ ] Verificación de autenticación
- [ ] Destructuring de queries (backend)
- [ ] Estados de carga (mostrarCargando)
- [ ] Validación de formularios
- [ ] Limpiar formularios después de submit
- [ ] Event listeners configurados
- [ ] Responsive design (Tailwind)
- [ ] Animaciones suaves (transitions)

---

**NOTA**: Cada archivo debe seguir el patrón exacto de `estadisticas.html` y `estadisticas.js` que ya están completos en este paquete.
