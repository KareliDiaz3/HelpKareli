# 📦 MÓDULO 4 - FRONTEND: GESTIÓN DE DESEMPEÑO Y RETROALIMENTACIÓN
## SpeakLexi 2.0

**Versión**: 1.0.0  
**Fecha**: 2025-11-10  
**Estrategia**: Código simplificado base para expansión con DeepSeek

---

## 📋 CONTENIDO DEL PAQUETE

Este paquete contiene el **frontend completo** del Módulo 4, que implementa:

### ✅ **UC-13: Consultar estadísticas de progreso**
- Dashboard de estadísticas generales del alumno
- Gráficos de progreso temporal
- Métricas de desempeño por habilidad
- Áreas de mejora identificadas

### ✅ **UC-14: Revisar retroalimentación**
- Vista de comentarios del profesor
- Historial de retroalimentación por lección
- Calificaciones y observaciones
- Respuestas a comentarios

### ✅ **UC-15: Planificar nuevos contenidos** (Vista profesor)
- Dashboard de planificación
- Análisis de desempeño del grupo
- Creación de planes de contenido
- Gestión de planes existentes

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
modulo4-frontend/
├── README.md                                    # Este archivo
├── GUIDELINES-DEEPSEEK.md                       # Instrucciones detalladas para DeepSeek
├── html/
│   ├── estudiante/
│   │   ├── estadisticas.html                   # UC-13: Vista de estadísticas
│   │   └── retroalimentacion.html              # UC-14: Vista de retroalimentación
│   └── profesor/
│       ├── planificacion.html                  # UC-15: Dashboard planificación
│       └── retroalimentacion-profesor.html     # UC-14: Vista profesor
├── js/
│   ├── estudiante/
│   │   ├── estadisticas.js                     # UC-13: Lógica estadísticas
│   │   └── retroalimentacion.js                # UC-14: Lógica retroalimentación
│   └── profesor/
│       ├── planificacion.js                    # UC-15: Lógica planificación
│       └── retroalimentacion-profesor.js       # UC-14: Gestión retroalimentación
└── API-REFERENCE.md                            # Documentación de endpoints
```

---

## 🚀 INSTALACIÓN RÁPIDA

### 1. Extraer archivos
```bash
# Opción A: .tar.gz
tar -xzf modulo4-frontend.tar.gz

# Opción B: .zip
unzip modulo4-frontend.zip
```

### 2. Copiar archivos al proyecto

```bash
# Copiar HTML
cp html/estudiante/*.html ../frontend/pages/estudiante/
cp html/profesor/*.html ../frontend/pages/profesor/

# Copiar JavaScript
cp js/estudiante/*.js ../frontend/assets/js/pages/estudiante/
cp js/profesor/*.js ../frontend/assets/js/pages/profesor/
```

### 3. Verificar endpoints del backend

Asegúrate de que el backend del Módulo 4 esté corriendo con estos endpoints:

**Estadísticas (UC-13):**
- `GET /api/estadisticas/alumno/:id` - Estadísticas del alumno
- `GET /api/estadisticas/general` - Estadísticas generales
- `GET /api/estadisticas/areas-mejora/:id` - Áreas de mejora

**Retroalimentación (UC-14):**
- `GET /api/retroalimentacion` - Listar retroalimentación
- `POST /api/retroalimentacion/crear` - Crear comentario
- `GET /api/retroalimentacion/leccion/:id` - Por lección
- `GET /api/retroalimentacion/alumno/:id` - Por alumno
- `POST /api/retroalimentacion/:id/responder` - Responder

**Planificación (UC-15):**
- `GET /api/planificacion/planes` - Listar planes
- `POST /api/planificacion/crear` - Crear plan
- `GET /api/planificacion/:id` - Detalle del plan
- `PUT /api/planificacion/:id` - Actualizar plan
- `DELETE /api/planificacion/:id` - Eliminar plan
- `POST /api/planificacion/analizar` - Analizar desempeño

---

## 🎯 CASOS DE USO IMPLEMENTADOS

### UC-13: Consultar estadísticas de progreso

**Actor**: Estudiante  
**Descripción**: Visualizar métricas de desempeño y progreso

**Archivos**:
- `html/estudiante/estadisticas.html`
- `js/estudiante/estadisticas.js`

**Características**:
- ✅ Dashboard con resumen general
- ✅ Gráfico de progreso temporal (Chart.js)
- ✅ Métricas por habilidad (lectura, escritura, escucha, habla)
- ✅ Identificación de áreas de mejora
- 🔄 Comparativa con promedio del nivel (DeepSeek)
- 🔄 Exportar estadísticas PDF (DeepSeek)

---

### UC-14: Revisar retroalimentación

**Actor**: Estudiante, Profesor  
**Descripción**: Gestionar comentarios y retroalimentación

**Archivos estudiante**:
- `html/estudiante/retroalimentacion.html`
- `js/estudiante/retroalimentacion.js`

**Archivos profesor**:
- `html/profesor/retroalimentacion-profesor.html`
- `js/profesor/retroalimentacion-profesor.js`

**Características**:
- ✅ Lista de comentarios por lección
- ✅ Visualización de calificaciones
- ✅ Responder a comentarios
- ✅ Filtros por fecha y lección
- 🔄 Notificaciones de nueva retroalimentación (DeepSeek)
- 🔄 Marcar como leído (DeepSeek)

---

### UC-15: Planificar nuevos contenidos

**Actor**: Profesor  
**Descripción**: Crear planes de contenido basados en desempeño

**Archivos**:
- `html/profesor/planificacion.html`
- `js/profesor/planificacion.js`

**Características**:
- ✅ Dashboard de análisis de grupo
- ✅ Crear planes de contenido
- ✅ Gestionar planes existentes
- ✅ Identificar áreas críticas del grupo
- 🔄 Sugerencias automáticas de contenido (DeepSeek)
- 🔄 Programar lanzamiento de lecciones (DeepSeek)

---

## 🔧 CONFIGURACIÓN

### Variables globales requeridas

Los archivos JavaScript asumen que estas variables están disponibles en `window`:

```javascript
// Desde frontend/config/app-config.js
window.APP_CONFIG
window.API_CONFIG
window.STORAGE_CONFIG
window.VALIDATION_CONFIG
window.UI_CONFIG

// Utilidades core (desde frontend/assets/js/core/)
window.apiClient
window.toastManager
window.formValidator
window.ModuleLoader
```

### Dependencias CSS

Los archivos HTML usan:
- TailwindCSS (vía CDN)
- Chart.js (vía CDN) - Para gráficos
- Custom styles de SpeakLexi (`frontend/assets/css/`)

---

## 📊 INTEGRACIÓN CON BACKEND

### Flujo de datos

```
Frontend (HTML/JS) → API Client → Backend Routes → Controllers → Models → Database
                                        ↓
                   ← JSON Response ←  ←  ←  ←
```

### Autenticación

Todos los endpoints requieren:
```javascript
Authorization: Bearer <token>
```

El token se obtiene de `localStorage.getItem(APP_CONFIG.STORAGE.KEYS.TOKEN)`

### Roles requeridos

- **UC-13**: Rol `alumno`
- **UC-14**: Rol `alumno` (vista estudiante), Rol `profesor` (vista profesor)
- **UC-15**: Rol `profesor`

---

## 🧪 TESTING

### Testing manual

1. **Estadísticas (UC-13)**:
   ```
   Login como estudiante → Ir a /pages/estudiante/estadisticas.html
   - Verificar que se cargan las estadísticas
   - Verificar gráficos de Chart.js
   - Verificar métricas por habilidad
   ```

2. **Retroalimentación estudiante (UC-14)**:
   ```
   Login como estudiante → Ir a /pages/estudiante/retroalimentacion.html
   - Verificar lista de comentarios
   - Probar responder a un comentario
   - Verificar filtros
   ```

3. **Retroalimentación profesor (UC-14)**:
   ```
   Login como profesor → Ir a /pages/profesor/retroalimentacion-profesor.html
   - Ver lista de alumnos
   - Crear nuevo comentario
   - Editar comentario existente
   ```

4. **Planificación (UC-15)**:
   ```
   Login como profesor → Ir a /pages/profesor/planificacion.html
   - Ver análisis de desempeño del grupo
   - Crear nuevo plan de contenido
   - Gestionar planes existentes
   ```

---

## 🚨 PUNTOS CRÍTICOS

### Para DeepSeek

Los archivos tienen comentarios `// DeepSeek:` que indican:
- ✅ **Implementación básica lista** (funciona pero puede mejorarse)
- 🔄 **Requiere expansión** (funcionalidad crítica pendiente)
- 🎨 **Mejora UI/UX** (funcional pero puede verse mejor)

### Errores comunes a evitar

1. **No destructurar `[rows]`** en queries del backend
   ```javascript
   // ❌ MAL
   const data = await pool.query('SELECT...');
   
   // ✅ BIEN
   const [rows] = await pool.query('SELECT...');
   ```

2. **No usar `APP_CONFIG`**
   ```javascript
   // ❌ MAL
   fetch('/api/estadisticas/...')
   
   // ✅ BIEN
   apiClient.get(APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.ALUMNO.replace(':id', userId))
   ```

3. **No verificar token antes de hacer peticiones**
   ```javascript
   // ✅ BIEN
   const token = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.TOKEN);
   if (!token) {
       window.location.href = APP_CONFIG.UI.RUTAS.LOGIN;
       return;
   }
   ```

---

## 📖 DOCUMENTACIÓN ADICIONAL

- **GUIDELINES-DEEPSEEK.md**: Instrucciones detalladas para expandir el código
- **API-REFERENCE.md**: Documentación completa de endpoints del backend
- **app-config.js**: Configuración centralizada (ya existe en el proyecto)

---

## 🎓 ESTIMACIÓN DE TIEMPOS

### Con código base (este paquete)
- **Expansión por DeepSeek**: 8-12 horas
- **Testing y ajustes**: 3-5 horas
- **Total**: ~15 horas

### Sin código base (desde cero)
- **Desarrollo completo**: 20-30 horas
- **Testing**: 5-8 horas
- **Total**: ~35 horas

**Ahorro estimado**: 20 horas (~57%)

---

## 🔗 PRÓXIMOS PASOS

1. ✅ Extraer archivos
2. ✅ Copiar al proyecto
3. ✅ Verificar backend corriendo
4. 🔄 Expandir con DeepSeek siguiendo GUIDELINES
5. 🔄 Testing completo
6. 🔄 Deploy

---

## 💡 TIPS

- Los archivos HTML son **completos y funcionales** tal cual
- Los archivos JS tienen **estructura base lista**
- Los comentarios `// DeepSeek:` son **guías específicas**
- La integración con backend **ya está configurada**

---

## 📞 SOPORTE

Para dudas sobre la implementación:
1. Revisar `GUIDELINES-DEEPSEEK.md`
2. Revisar `API-REFERENCE.md`
3. Consultar el `app-config.js` del proyecto
4. Revisar implementación del Módulo 3 (mismo patrón)

---

**¡Listo para expandir con DeepSeek! 🚀**
