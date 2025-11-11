# 🚀 INSTALACIÓN RÁPIDA - MÓDULO 4 FRONTEND

## PASO 1: Extraer archivos

```bash
# Opción A: tar.gz
tar -xzf modulo4-frontend.tar.gz
cd modulo4-frontend

# Opción B: zip  
unzip modulo4-frontend.zip
cd modulo4-frontend
```

## PASO 2: Revisar estructura

```
modulo4-frontend/
├── README.md                           ✅ Documentación principal
├── GUIDELINES-DEEPSEEK.md              ✅ Instrucciones para DeepSeek
├── API-REFERENCE.md                    ✅ Endpoints del backend
├── ARCHIVOS-PENDIENTES.md              ✅ Guía de archivos restantes
├── INSTALACION.md                      ✅ Este archivo
├── html/
│   ├── estudiante/
│   │   ├── estadisticas.html          ✅ UC-13 COMPLETO
│   │   └── retroalimentacion.html     📝 Por crear (patrón definido)
│   └── profesor/
│       ├── retroalimentacion-profesor.html  📝 Por crear
│       └── planificacion.html               📝 Por crear
└── js/
    ├── estudiante/
    │   ├── estadisticas.js            ✅ UC-13 COMPLETO
    │   └── retroalimentacion.js       📝 Por crear
    └── profesor/
        ├── retroalimentacion-profesor.js    📝 Por crear
        └── planificacion.js                 📝 Por crear
```

## PASO 3: Copiar archivos al proyecto

### 3.1 Copiar HTML completos

```bash
# Desde la carpeta modulo4-frontend/

# Copiar estadísticas (COMPLETO)
cp html/estudiante/estadisticas.html ../frontend/pages/estudiante/

# Los demás archivos HTML deberás crearlos siguiendo el patrón de estadisticas.html
# Ver ARCHIVOS-PENDIENTES.md para la estructura
```

### 3.2 Copiar JavaScript completos

```bash
# Copiar estadísticas.js (COMPLETO)
cp js/estudiante/estadisticas.js ../frontend/assets/js/pages/estudiante/

# Los demás archivos JS deberás crearlos siguiendo el patrón de estadisticas.js
# Ver ARCHIVOS-PENDIENTES.md y GUIDELINES-DEEPSEEK.md
```

## PASO 4: Verificar backend del Módulo 4

Asegúrate de que el backend tenga estos archivos (según chat anterior):

```
backend/
├── models/
│   ├── estadisticasModel.js          ✅ (del chat anterior)
│   ├── retroalimentacionModel.js     ✅ (del chat anterior)
│   └── planificacionModel.js         ✅ (del chat anterior)
├── controllers/
│   ├── estadisticasController.js     ✅ (del chat anterior)
│   ├── retroalimentacionController.js ✅ (del chat anterior)
│   └── planificacionController.js    ✅ (del chat anterior)
└── routes/
    ├── estadisticasRoutes.js         ✅ (del chat anterior)
    ├── retroalimentacionRoutes.js    ✅ (del chat anterior)
    └── planificacionRoutes.js        ✅ (del chat anterior)
```

### Verificar que las rutas estén registradas en server.js:

```javascript
// backend/server.js
app.use('/api/estadisticas', require('./routes/estadisticasRoutes'));
app.use('/api/retroalimentacion', require('./routes/retroalimentacionRoutes'));
app.use('/api/planificacion', require('./routes/planificacionRoutes'));
```

## PASO 5: Probar la funcionalidad completa (UC-13)

```bash
# 1. Iniciar el backend
cd backend
npm run dev

# 2. Iniciar el frontend (Live Server o similar)
# Abrir: http://localhost:3000/pages/estudiante/estadisticas.html
```

### Testing manual UC-13:
1. ✅ Login como estudiante
2. ✅ Navegar a `/pages/estudiante/estadisticas.html`
3. ✅ Verificar que se cargan:
   - Resumen general (XP, nivel, racha, lecciones)
   - Gráfico de progreso temporal
   - Métricas por habilidad
   - Distribución de actividades
   - Áreas de mejora
   - Fortalezas
4. ✅ Probar botón "Actualizar"
5. ✅ Probar botón "Exportar PDF"

## PASO 6: Crear archivos restantes con DeepSeek

Ahora que tienes:
- ✅ `estadisticas.html` y `estadisticas.js` como referencia COMPLETA
- ✅ `GUIDELINES-DEEPSEEK.md` con instrucciones detalladas
- ✅ `API-REFERENCE.md` con todos los endpoints
- ✅ `ARCHIVOS-PENDIENTES.md` con la estructura de cada archivo

**Usa DeepSeek para crear los archivos restantes**:

### 6.1 Prompt para DeepSeek:

```
Siguiendo EXACTAMENTE el patrón de estadisticas.html y estadisticas.js,
crea el archivo [NOMBRE].html y [NOMBRE].js.

Archivos de referencia completos:
- modulo4-frontend/html/estudiante/estadisticas.html
- modulo4-frontend/js/estudiante/estadisticas.js

Guías:
- modulo4-frontend/GUIDELINES-DEEPSEEK.md (patrones obligatorios)
- modulo4-frontend/API-REFERENCE.md (endpoints a usar)
- modulo4-frontend/ARCHIVOS-PENDIENTES.md (estructura específica)

Archivo a crear: [ESPECIFICAR]

Implementa TODOS los comentarios // DeepSeek: con código funcional.
```

### 6.2 Orden recomendado de creación:

1. ✅ **estadisticas.html + estadisticas.js** (YA COMPLETOS)
2. 🔄 **retroalimentacion.html + retroalimentacion.js** (estudiante)
3. 🔄 **retroalimentacion-profesor.html + retroalimentacion-profesor.js** (profesor)
4. 🔄 **planificacion.html + planificacion.js** (profesor)

## PASO 7: Testing completo

Después de crear cada archivo, probar:

### UC-14 Estudiante (Retroalimentación):
1. Login como estudiante
2. Ir a `/pages/estudiante/retroalimentacion.html`
3. Verificar lista de comentarios
4. Probar filtros (por lección, por fecha)
5. Responder a un comentario
6. Verificar que se actualiza la lista

### UC-14 Profesor (Retroalimentación):
1. Login como profesor
2. Ir a `/pages/profesor/retroalimentacion-profesor.html`
3. Ver lista de alumnos
4. Seleccionar un alumno
5. Ver retroalimentación del alumno
6. Crear nuevo comentario
7. Verificar que aparece en la lista

### UC-15 Profesor (Planificación):
1. Login como profesor
2. Ir a `/pages/profesor/planificacion.html`
3. Ver dashboard de análisis
4. Ver áreas críticas del grupo
5. Crear nuevo plan de contenido
6. Editar plan existente
7. Eliminar plan

## PASO 8: Integración con navegación

Agregar enlaces en el navbar del estudiante y profesor:

### navbar estudiante (frontend/assets/components/navbar.html):
```html
<a href="/pages/estudiante/estadisticas.html" class="nav-link">
    📊 Mis Estadísticas
</a>
<a href="/pages/estudiante/retroalimentacion.html" class="nav-link">
    💬 Retroalimentación
</a>
```

### navbar profesor (frontend/assets/components/navbar.html):
```html
<a href="/pages/profesor/retroalimentacion-profesor.html" class="nav-link">
    💬 Retroalimentación
</a>
<a href="/pages/profesor/planificacion.html" class="nav-link">
    📋 Planificación
</a>
```

## PASO 9: Verificación final

### Checklist completo:

#### Backend ✅
- [ ] Modelos del Módulo 4 funcionando
- [ ] Controllers del Módulo 4 funcionando
- [ ] Rutas registradas en server.js
- [ ] Endpoints respondiendo correctamente
- [ ] Autenticación funcionando
- [ ] Roles verificándose correctamente

#### Frontend ✅
- [ ] estadisticas.html renderiza correctamente
- [ ] estadisticas.js carga datos sin errores
- [ ] Chart.js funciona (gráficos visibles)
- [ ] retroalimentacion.html completo
- [ ] retroalimentacion.js completo
- [ ] retroalimentacion-profesor.html completo
- [ ] retroalimentacion-profesor.js completo
- [ ] planificacion.html completo
- [ ] planificacion.js completo
- [ ] Todos los archivos siguen el patrón establecido
- [ ] No hay errores en consola
- [ ] Todos los comentarios `// DeepSeek:` implementados
- [ ] Uso correcto de APP_CONFIG
- [ ] Uso correcto de apiClient
- [ ] toastManager funcionando
- [ ] Validaciones implementadas

#### UX/UI ✅
- [ ] Responsive design funcionando
- [ ] Loading states visibles
- [ ] Mensajes de error claros
- [ ] Animaciones suaves
- [ ] Estados vacíos manejados
- [ ] Confirmaciones antes de eliminar
- [ ] Feedback visual en acciones

## TROUBLESHOOTING

### Error: "APP_CONFIG is not defined"
- Verificar que `app-config.js` esté cargado antes que los módulos
- Ver orden de scripts en HTML

### Error: "apiClient is not defined"
- Verificar que `api-client.js` esté cargado
- Ver dependencias en ModuleLoader

### Error: "Cannot read property 'ENDPOINTS' of undefined"
- APP_CONFIG no se exportó correctamente a window
- Verificar app-config.js línea final

### Error: 401 Unauthorized
- Token expirado o inválido
- Hacer logout y login nuevamente

### Error: 404 Not Found en endpoints
- Verificar que las rutas estén registradas en server.js
- Verificar que el backend esté corriendo

### Gráficos no se muestran
- Verificar que Chart.js esté cargado (CDN)
- Ver consola para errores de Chart.js
- Verificar que los datos tengan el formato correcto

---

## 📞 SOPORTE

Para dudas sobre la implementación:
1. ✅ Revisar `GUIDELINES-DEEPSEEK.md`
2. ✅ Revisar `API-REFERENCE.md`
3. ✅ Consultar `estadisticas.html` y `estadisticas.js` (ejemplos completos)
4. ✅ Revisar `ARCHIVOS-PENDIENTES.md`
5. ✅ Revisar implementación del Módulo 3 (mismo patrón)

---

**¡Éxito con la instalación! 🚀**

**Tiempo estimado total**: 8-12 horas (con código base) vs 20-30 horas (desde cero)
