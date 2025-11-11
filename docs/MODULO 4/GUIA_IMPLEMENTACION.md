# 📘 BACKEND MÓDULO 4 - GUÍA DE IMPLEMENTACIÓN

## 🎯 OBJETIVO

Implementar el backend completo del **Módulo 4: Gestión de Desempeño** con los siguientes casos de uso:
- **UC-13**: Consultar estadísticas de progreso de alumnos
- **UC-14**: Revisar y responder retroalimentación
- **UC-15**: Planificar nuevos contenidos basado en análisis

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
backend/
├── models/
│   ├── estadisticasModel.js         ✅ COMPLETO (7 métodos)
│   ├── retroalimentacionModel.js    ✅ COMPLETO (8 métodos)
│   └── planificacionModel.js        ✅ COMPLETO (4 métodos)
│
├── controllers/
│   ├── estadisticasController.js    ✅ COMPLETO (6 endpoints)
│   ├── retroalimentacionController.js ✅ COMPLETO (7 endpoints)
│   └── planificacionController.js   ✅ COMPLETO (4 endpoints)
│
├── routes/
│   ├── estadisticasRoutes.js        ✅ COMPLETO
│   ├── retroalimentacionRoutes.js   ✅ COMPLETO
│   └── planificacionRoutes.js       ✅ COMPLETO
│
└── schema.sql                        ✅ COMPLETO (2 tablas + vistas)
```

---

## 🗄️ TABLAS DE BASE DE DATOS

### 1. `retroalimentacion`
```sql
CREATE TABLE retroalimentacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    leccion_id INT NULL, -- Puede ser NULL
    tipo ENUM('duda', 'comentario', 'sugerencia', 'reporte_error'),
    asunto VARCHAR(255),
    mensaje TEXT,
    es_privado BOOLEAN,
    respondido BOOLEAN,
    fecha_creacion DATETIME,
    fecha_respuesta DATETIME NULL
);
```

### 2. `respuestas_retroalimentacion`
```sql
CREATE TABLE respuestas_retroalimentacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    retroalimentacion_id INT NOT NULL,
    profesor_id INT NOT NULL,
    mensaje TEXT,
    fecha_respuesta DATETIME
);
```

**IMPORTANTE**: Ejecutar `schema.sql` antes de probar los endpoints.

---

## 🔌 ENDPOINTS IMPLEMENTADOS

### UC-13: ESTADÍSTICAS (6 endpoints)

#### 1. Estadísticas Generales
```
GET /api/estadisticas/generales
Autenticación: Requerida (Profesor)
Response: {
    total_alumnos: number,
    alumnos_activos: number,
    lecciones_completadas: number,
    tiempo_promedio_minutos: number,
    tasa_completitud: number
}
```

#### 2. Lista de Alumnos
```
GET /api/estadisticas/alumnos
Query params: nivel, idioma, ordenar, limite
Response: Array de alumnos con su progreso
```

#### 3. Progreso Individual
```
GET /api/estadisticas/alumno/:id
Response: {
    alumno: {...},
    estadisticas: {...},
    progreso_lecciones: [...],
    fortalezas: [...],
    debilidades: [...]
}
```

#### 4. Tiempos Promedio
```
GET /api/estadisticas/tiempos-promedio
Response: Array de lecciones con tiempos promedio
```

#### 5. Tasas de Completitud
```
GET /api/estadisticas/tasas-completitud
Query: agrupar_por=nivel|idioma
Response: Array agrupado por nivel o idioma
```

#### 6. Tendencia de Progreso
```
GET /api/estadisticas/tendencia
Query: periodo=semanal|mensual
Response: Array de datos por fecha
```

---

### UC-14: RETROALIMENTACIÓN (7 endpoints)

#### 1. Crear Comentario
```
POST /api/retroalimentacion
Body: {
    leccion_id?: number,
    tipo: 'duda'|'comentario'|'sugerencia'|'reporte_error',
    asunto: string,
    mensaje: string,
    es_privado?: boolean
}
```

#### 2. Obtener Comentarios
```
GET /api/retroalimentacion
Query: tipo, leccion_id, solo_sin_respuesta, limite, offset
Response: Array de comentarios
```

#### 3. Obtener Comentario por ID
```
GET /api/retroalimentacion/:id
Response: Comentario con todas sus respuestas
```

#### 4. Responder Comentario
```
POST /api/retroalimentacion/:id/responder
Body: { mensaje: string }
```

#### 5. Análisis de Recurrentes
```
GET /api/retroalimentacion/analisis/recurrentes
Query: periodo=30 (días)
Response: {
    por_tipo: [...],
    lecciones_mas_comentadas: [...],
    asuntos_comunes: [...]
}
```

#### 6. Estadísticas de Retroalimentación
```
GET /api/retroalimentacion/estadisticas
Response: Métricas generales
```

#### 7. Marcar como Resuelto
```
PATCH /api/retroalimentacion/:id/resolver
```

---

### UC-15: PLANIFICACIÓN (4 endpoints)

#### 1. Áreas de Mejora
```
GET /api/planificacion/areas-mejora
Response: {
    lecciones_dificiles: [...],
    niveles_dificiles: [...],
    temas_problematicos: [...]
}
```

#### 2. Sugerencias de Contenido
```
GET /api/planificacion/sugerencias-contenido
Response: {
    gaps_niveles: [...],
    temas_refuerzo: [...],
    necesitan_material: [...]
}
```

#### 3. Análisis de Dificultad
```
GET /api/planificacion/analisis-dificultad
Response: Array con análisis de cada lección
```

#### 4. Recomendaciones Consolidadas
```
GET /api/planificacion/recomendaciones
Response: {
    estadisticas: {...},
    recomendaciones: [...],
    lecciones_atencion: [...]
}
```

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### 1. Preparar Base de Datos
```sql
-- Ejecutar schema.sql en tu base de datos
mysql -u root -p speaklexi < schema.sql
```

### 2. Copiar Archivos al Proyecto

```bash
# Modelos
cp estadisticasModel.js backend/models/
cp retroalimentacionModel.js backend/models/
cp planificacionModel.js backend/models/

# Controladores
cp estadisticasController.js backend/controllers/
cp retroalimentacionController.js backend/controllers/
cp planificacionController.js backend/controllers/

# Rutas
cp estadisticasRoutes.js backend/routes/
cp retroalimentacionRoutes.js backend/routes/
cp planificacionRoutes.js backend/routes/
```

### 3. Registrar Rutas en server.js

```javascript
// backend/server.js

// Importar rutas del Módulo 4
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const retroalimentacionRoutes = require('./routes/retroalimentacionRoutes');
const planificacionRoutes = require('./routes/planificacionRoutes');

// Registrar rutas
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/retroalimentacion', retroalimentacionRoutes);
app.use('/api/planificacion', planificacionRoutes);
```

### 4. Verificar Middleware de Autenticación

El Módulo 4 usa `authMiddleware` para proteger las rutas. Verifica que exista:

```javascript
// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: 'No se proporcionó token de autenticación'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Incluye: id, rol, nombre, etc.
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            mensaje: 'Token inválido o expirado'
        });
    }
};
```

---

## 🧪 TESTING

### 1. Probar Estadísticas

```bash
# Estadísticas generales
curl -X GET http://localhost:3000/api/estadisticas/generales \
  -H "Authorization: Bearer TU_TOKEN"

# Lista de alumnos
curl -X GET "http://localhost:3000/api/estadisticas/alumnos?ordenar=progreso" \
  -H "Authorization: Bearer TU_TOKEN"

# Progreso individual
curl -X GET http://localhost:3000/api/estadisticas/alumno/3 \
  -H "Authorization: Bearer TU_TOKEN"
```

### 2. Probar Retroalimentación

```bash
# Crear comentario
curl -X POST http://localhost:3000/api/retroalimentacion \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leccion_id": 1,
    "tipo": "duda",
    "asunto": "Pronunciación",
    "mensaje": "¿Cómo se pronuncia esta palabra?"
  }'

# Obtener comentarios
curl -X GET http://localhost:3000/api/retroalimentacion \
  -H "Authorization: Bearer TU_TOKEN"

# Responder comentario
curl -X POST http://localhost:3000/api/retroalimentacion/1/responder \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mensaje": "La pronunciación correcta es..."}'
```

### 3. Probar Planificación

```bash
# Áreas de mejora
curl -X GET http://localhost:3000/api/planificacion/areas-mejora \
  -H "Authorization: Bearer TU_TOKEN"

# Sugerencias de contenido
curl -X GET http://localhost:3000/api/planificacion/sugerencias-contenido \
  -H "Authorization: Bearer TU_TOKEN"

# Recomendaciones
curl -X GET http://localhost:3000/api/planificacion/recomendaciones \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 🔗 CONEXIONES CON OTROS MÓDULOS

### Módulo 3 → Módulo 4
El Módulo 4 consume datos del Módulo 3:

- **Estadísticas** usa `progreso_lecciones` y `gamificacion`
- **Planificación** analiza datos de `progreso_lecciones`

### Módulo 2 → Módulo 4
- **Retroalimentación** se vincula con `lecciones`
- **Estadísticas** agrupa por `lecciones.nivel` e `idioma`

### Módulo 1 → Módulo 4
- Todos los endpoints usan `usuarios.id` para autenticación
- Estadísticas filtran por `rol='estudiante'` o `'profesor'`

---

## ⚠️ PUNTOS IMPORTANTES

### 1. Autenticación
- **Todas las rutas** requieren token JWT válido
- El token debe incluir: `{ id, rol, nombre }`
- Verificar que `authMiddleware` funcione correctamente

### 2. Permisos
- **Estadísticas**: Solo profesores pueden acceder
- **Retroalimentación**: Estudiantes crean, profesores responden
- **Planificación**: Solo profesores

### 3. Datos Mínimos Requeridos
Para que las estadísticas funcionen, necesitas:
- Al menos 1 profesor con lecciones creadas
- Al menos 3 estudiantes con progreso registrado
- Algunos comentarios en `retroalimentacion`

### 4. Performance
- Las consultas incluyen índices optimizados
- Se usan `LEFT JOIN` para evitar perder datos
- Límites por defecto (50) para paginación

---

## 📊 DATOS DE EJEMPLO

Si necesitas datos de prueba rápidos:

```sql
-- Profesor (asume que ya existe usuario id=2)
-- Lecciones (del Módulo 2)
-- Progreso (del Módulo 3)

-- Comentarios de prueba
INSERT INTO retroalimentacion (usuario_id, leccion_id, tipo, asunto, mensaje) VALUES
(3, 1, 'duda', 'Pronunciación', 'No entiendo cómo pronunciar "Hello"'),
(4, 1, 'sugerencia', 'Más ejemplos', 'Podrían añadir más ejemplos prácticos'),
(3, 2, 'reporte_error', 'Error en ejercicio', 'El ejercicio 3 no funciona');
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Antes de considerar completo el Módulo 4:

- [ ] Ejecutar `schema.sql` en la base de datos
- [ ] Copiar todos los archivos a sus directorios
- [ ] Registrar rutas en `server.js`
- [ ] Verificar que `authMiddleware` funcione
- [ ] Probar los 17 endpoints con Postman/curl
- [ ] Verificar que las respuestas tengan el formato correcto
- [ ] Comprobar que los errores se manejen apropiadamente
- [ ] Revisar que no haya errores en la consola
- [ ] Probar con datos reales de progreso

---

## 🐛 TROUBLESHOOTING

### Error: "tabla no existe"
→ Ejecutar `schema.sql` en la base de datos

### Error: "Cannot read property 'id' of undefined"
→ El token JWT no incluye los datos del usuario. Revisar `authMiddleware`

### Error: "No se encontró alumno/comentario"
→ Verificar que los IDs existan en la base de datos

### Respuestas vacías en estadísticas
→ Necesitas datos de progreso (Módulo 3) para ver estadísticas

### "No tienes acceso a este comentario"
→ Solo el profesor dueño de la lección puede acceder

---

## 📚 RECURSOS ADICIONALES

- **Módulo 3**: Necesario para que las estadísticas funcionen
- **Postman Collection**: Crear colección con todos los endpoints
- **Base de datos de ejemplo**: Usar script de datos de prueba

---

## 🎉 RESULTADO FINAL

Cuando termines la implementación, tendrás:

✅ **17 endpoints funcionando** (6 estadísticas + 7 retroalimentación + 4 planificación)
✅ **2 tablas nuevas** con sus relaciones correctas
✅ **19 métodos en modelos** completamente implementados
✅ **Análisis inteligente** de progreso de alumnos
✅ **Sistema completo** de retroalimentación profesor-alumno
✅ **Recomendaciones automáticas** para planificar contenido

---

**¡Todo el backend del Módulo 4 está listo para usar!** 🚀

Si tienes dudas sobre algún endpoint o función específica, revisa el código en los archivos. Cada método tiene comentarios explicativos.
