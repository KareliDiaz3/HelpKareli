# 📡 API REFERENCE - MÓDULO 4
## Backend Endpoints: Gestión de Desempeño y Retroalimentación

---

## 🔐 AUTENTICACIÓN

**Todos los endpoints requieren**:
```
Authorization: Bearer <jwt_token>
```

**Roles permitidos** (según endpoint):
- `alumno` - Estudiante
- `profesor` - Profesor
- `admin` - Administrador

---

## 📊 UC-13: ESTADÍSTICAS DE PROGRESO

### 1. Obtener estadísticas de un alumno

```http
GET /api/estadisticas/alumno/:id
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros URL**:
- `id` (required): ID del alumno

**Roles permitidos**: `alumno` (propio), `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "alumno": {
      "id": 123,
      "nombre": "Juan Pérez",
      "nivel_actual": "B1",
      "idioma": "ingles"
    },
    "resumen": {
      "total_xp": 1250,
      "nivel": 5,
      "racha_dias": 7,
      "lecciones_completadas": 15,
      "tiempo_estudio_total": 450
    },
    "progreso_temporal": [
      {
        "fecha": "2025-11-01",
        "xp_acumulado": 800,
        "lecciones": 2
      },
      {
        "fecha": "2025-11-02",
        "xp_acumulado": 900,
        "lecciones": 1
      }
    ],
    "metricas_habilidades": {
      "lectura": 75,
      "escritura": 68,
      "escucha": 82,
      "habla": 60
    },
    "distribucion_actividades": {
      "seleccion_multiple": 45,
      "completar_espacios": 30,
      "emparejamiento": 15,
      "escritura": 10
    }
  }
}
```

**Response 404 Not Found**:
```json
{
  "success": false,
  "message": "Alumno no encontrado"
}
```

---

### 2. Obtener estadísticas generales

```http
GET /api/estadisticas/general
```

**Headers**:
```
Authorization: Bearer <token>
```

**Roles permitidos**: `admin`, `profesor`

**Query Parameters** (opcionales):
- `nivel` - Filtrar por nivel CEFR (A1, A2, B1, B2, C1, C2)
- `idioma` - Filtrar por idioma (ingles, frances, aleman, etc.)
- `fecha_desde` - Fecha inicio (YYYY-MM-DD)
- `fecha_hasta` - Fecha fin (YYYY-MM-DD)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "totales": {
      "alumnos_activos": 150,
      "lecciones_completadas": 2340,
      "xp_promedio": 850,
      "tasa_completacion": 78.5
    },
    "por_nivel": [
      {
        "nivel": "A1",
        "alumnos": 35,
        "xp_promedio": 450,
        "tasa_completacion": 82
      },
      {
        "nivel": "B1",
        "alumnos": 50,
        "xp_promedio": 950,
        "tasa_completacion": 75
      }
    ],
    "tendencia_mensual": [
      {
        "mes": "2025-10",
        "alumnos_nuevos": 25,
        "lecciones_completadas": 450
      },
      {
        "mes": "2025-11",
        "alumnos_nuevos": 30,
        "lecciones_completadas": 520
      }
    ]
  }
}
```

---

### 3. Identificar áreas de mejora

```http
GET /api/estadisticas/areas-mejora/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros URL**:
- `id` (required): ID del alumno

**Roles permitidos**: `alumno` (propio), `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "areas_criticas": [
      {
        "habilidad": "habla",
        "porcentaje": 60,
        "estado": "critico",
        "recomendaciones": [
          "Practicar más ejercicios de pronunciación",
          "Hacer sesiones de conversación"
        ]
      },
      {
        "habilidad": "escritura",
        "porcentaje": 68,
        "estado": "mejorable",
        "recomendaciones": [
          "Realizar más ejercicios de redacción",
          "Revisar gramática avanzada"
        ]
      }
    ],
    "fortalezas": [
      {
        "habilidad": "escucha",
        "porcentaje": 82,
        "descripcion": "Excelente comprensión auditiva"
      }
    ],
    "sugerencias_contenido": [
      {
        "tipo": "leccion",
        "titulo": "Conversación Avanzada",
        "nivel": "B1",
        "razon": "Mejorar habilidad de habla"
      }
    ]
  }
}
```

---

### 4. Generar reporte de estadísticas

```http
GET /api/estadisticas/reporte
```

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `usuario_id` (required): ID del alumno
- `formato` (required): `pdf` | `json` | `csv`
- `fecha_desde` (optional): Fecha inicio
- `fecha_hasta` (optional): Fecha fin

**Roles permitidos**: `alumno` (propio), `profesor`, `admin`

**Response 200 OK** (si formato=json):
```json
{
  "success": true,
  "data": {
    "reporte": {
      "alumno": {...},
      "periodo": {
        "desde": "2025-10-01",
        "hasta": "2025-11-10"
      },
      "metricas": {...},
      "progreso": {...}
    }
  }
}
```

**Response 200 OK** (si formato=pdf):
- Content-Type: `application/pdf`
- Body: Binary PDF file

---

## 💬 UC-14: RETROALIMENTACIÓN

### 1. Listar retroalimentación (general)

```http
GET /api/retroalimentacion
```

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters** (opcionales):
- `page` - Página (default: 1)
- `limit` - Items por página (default: 10)
- `tipo` - Filtrar por tipo: `positiva`, `negativa`, `neutra`
- `fecha_desde` - Fecha inicio
- `fecha_hasta` - Fecha fin

**Roles permitidos**: `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "retroalimentaciones": [
      {
        "id": 45,
        "alumno_id": 123,
        "alumno_nombre": "Juan Pérez",
        "leccion_id": 12,
        "leccion_titulo": "Present Perfect",
        "comentario": "Excelente trabajo en los ejercicios",
        "calificacion": 9,
        "tipo": "positiva",
        "fecha_creacion": "2025-11-08T10:30:00Z",
        "respuesta_alumno": null,
        "fecha_respuesta": null
      }
    ],
    "total": 150,
    "pagina_actual": 1,
    "total_paginas": 15
  }
}
```

---

### 2. Crear retroalimentación

```http
POST /api/retroalimentacion/crear
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Roles permitidos**: `profesor`, `admin`

**Request Body**:
```json
{
  "alumno_id": 123,
  "leccion_id": 12,
  "comentario": "Buen progreso, pero debes practicar más la pronunciación",
  "calificacion": 7,
  "tipo": "neutra",
  "areas_mejora": ["pronunciacion", "fluidez"]
}
```

**Validaciones**:
- `alumno_id`: required, debe existir
- `leccion_id`: required, debe existir
- `comentario`: required, min 10 caracteres, max 1000
- `calificacion`: optional, 0-10
- `tipo`: optional, enum: positiva|negativa|neutra
- `areas_mejora`: optional, array de strings

**Response 201 Created**:
```json
{
  "success": true,
  "message": "Retroalimentación creada exitosamente",
  "data": {
    "id": 46,
    "alumno_id": 123,
    "leccion_id": 12,
    "comentario": "Buen progreso...",
    "calificacion": 7,
    "fecha_creacion": "2025-11-10T15:45:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "comentario",
      "message": "El comentario debe tener al menos 10 caracteres"
    }
  ]
}
```

---

### 3. Obtener retroalimentación por lección

```http
GET /api/retroalimentacion/leccion/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros URL**:
- `id` (required): ID de la lección

**Roles permitidos**: `alumno`, `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "alumno_id": 123,
      "alumno_nombre": "Juan Pérez",
      "comentario": "Excelente trabajo",
      "calificacion": 9,
      "fecha_creacion": "2025-11-08T10:30:00Z",
      "respuesta_alumno": "Gracias por el feedback",
      "fecha_respuesta": "2025-11-08T14:20:00Z"
    }
  ]
}
```

---

### 4. Obtener retroalimentación de un alumno

```http
GET /api/retroalimentacion/alumno/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros URL**:
- `id` (required): ID del alumno

**Roles permitidos**: `alumno` (propio), `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "leccion_id": 12,
      "leccion_titulo": "Present Perfect",
      "profesor_id": 5,
      "profesor_nombre": "María García",
      "comentario": "Excelente trabajo en los ejercicios",
      "calificacion": 9,
      "tipo": "positiva",
      "fecha_creacion": "2025-11-08T10:30:00Z",
      "respuesta_alumno": null,
      "fecha_respuesta": null,
      "leido": false
    }
  ]
}
```

---

### 5. Responder a retroalimentación

```http
POST /api/retroalimentacion/:id/responder
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros URL**:
- `id` (required): ID de la retroalimentación

**Roles permitidos**: `alumno` (solo puede responder a su propia retroalimentación)

**Request Body**:
```json
{
  "respuesta": "Gracias por el feedback, voy a trabajar en esas áreas"
}
```

**Validaciones**:
- `respuesta`: required, min 5 caracteres, max 500

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Respuesta enviada exitosamente",
  "data": {
    "id": 45,
    "respuesta_alumno": "Gracias por el feedback...",
    "fecha_respuesta": "2025-11-10T16:00:00Z"
  }
}
```

---

### 6. Marcar retroalimentación como leída

```http
PUT /api/retroalimentacion/:id/leer
```

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros URL**:
- `id` (required): ID de la retroalimentación

**Roles permitidos**: `alumno` (propio)

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Marcado como leído"
}
```

---

## 📋 UC-15: PLANIFICACIÓN DE CONTENIDOS

### 1. Listar planes de contenido

```http
GET /api/planificacion/planes
```

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters** (opcionales):
- `estado` - Filtrar por estado: `activo`, `completado`, `borrador`
- `nivel` - Filtrar por nivel CEFR
- `idioma` - Filtrar por idioma

**Roles permitidos**: `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "titulo": "Plan de Refuerzo B1 - Noviembre",
      "descripcion": "Reforzar gramática y vocabulario intermedio",
      "nivel": "B1",
      "idioma": "ingles",
      "areas_enfoque": ["gramatica", "vocabulario"],
      "fecha_inicio": "2025-11-15",
      "fecha_fin": "2025-11-30",
      "estado": "activo",
      "creado_por": 5,
      "profesor_nombre": "María García",
      "fecha_creacion": "2025-11-08T09:00:00Z"
    }
  ]
}
```

---

### 2. Crear plan de contenido

```http
POST /api/planificacion/crear
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Roles permitidos**: `profesor`, `admin`

**Request Body**:
```json
{
  "titulo": "Plan de Refuerzo B1 - Noviembre",
  "descripcion": "Reforzar gramática y vocabulario intermedio",
  "nivel": "B1",
  "idioma": "ingles",
  "areas_enfoque": ["gramatica", "vocabulario", "pronunciacion"],
  "fecha_inicio": "2025-11-15",
  "fecha_fin": "2025-11-30",
  "objetivos": [
    "Mejorar uso de tiempos verbales",
    "Ampliar vocabulario técnico"
  ],
  "recursos_sugeridos": [
    {
      "tipo": "leccion",
      "leccion_id": 45
    },
    {
      "tipo": "ejercicio",
      "ejercicio_id": 120
    }
  ]
}
```

**Validaciones**:
- `titulo`: required, min 5, max 200 caracteres
- `descripcion`: required, min 20, max 1000 caracteres
- `nivel`: required, enum: A1|A2|B1|B2|C1|C2
- `idioma`: required
- `areas_enfoque`: required, array no vacío
- `fecha_inicio`: required, formato YYYY-MM-DD
- `fecha_fin`: required, formato YYYY-MM-DD, debe ser posterior a fecha_inicio

**Response 201 Created**:
```json
{
  "success": true,
  "message": "Plan creado exitosamente",
  "data": {
    "id": 11,
    "titulo": "Plan de Refuerzo B1 - Noviembre",
    "estado": "borrador",
    "fecha_creacion": "2025-11-10T16:30:00Z"
  }
}
```

---

### 3. Obtener detalle de un plan

```http
GET /api/planificacion/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros URL**:
- `id` (required): ID del plan

**Roles permitidos**: `profesor`, `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "titulo": "Plan de Refuerzo B1 - Noviembre",
    "descripcion": "Reforzar gramática y vocabulario intermedio",
    "nivel": "B1",
    "idioma": "ingles",
    "areas_enfoque": ["gramatica", "vocabulario"],
    "fecha_inicio": "2025-11-15",
    "fecha_fin": "2025-11-30",
    "objetivos": [
      "Mejorar uso de tiempos verbales",
      "Ampliar vocabulario técnico"
    ],
    "recursos_sugeridos": [
      {
        "tipo": "leccion",
        "leccion_id": 45,
        "titulo": "Present Perfect Advanced"
      }
    ],
    "estado": "activo",
    "progreso": {
      "porcentaje_completado": 35,
      "alumnos_inscritos": 25,
      "lecciones_completadas": 7
    },
    "creado_por": 5,
    "profesor_nombre": "María García",
    "fecha_creacion": "2025-11-08T09:00:00Z",
    "fecha_actualizacion": "2025-11-09T14:20:00Z"
  }
}
```

---

### 4. Actualizar plan

```http
PUT /api/planificacion/:id
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros URL**:
- `id` (required): ID del plan

**Roles permitidos**: `profesor` (creador), `admin`

**Request Body**: (Todos los campos opcionales)
```json
{
  "titulo": "Plan de Refuerzo B1 - Actualizado",
  "descripcion": "Nueva descripción",
  "estado": "activo",
  "fecha_fin": "2025-12-05"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Plan actualizado exitosamente",
  "data": {
    "id": 10,
    "titulo": "Plan de Refuerzo B1 - Actualizado",
    "fecha_actualizacion": "2025-11-10T17:00:00Z"
  }
}
```

---

### 5. Eliminar plan

```http
DELETE /api/planificacion/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros URL**:
- `id` (required): ID del plan

**Roles permitidos**: `profesor` (creador), `admin`

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Plan eliminado exitosamente"
}
```

---

### 6. Analizar desempeño del grupo

```http
POST /api/planificacion/analizar
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Roles permitidos**: `profesor`, `admin`

**Request Body** (opcional):
```json
{
  "nivel": "B1",
  "idioma": "ingles",
  "fecha_desde": "2025-10-01",
  "fecha_hasta": "2025-11-10"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "analisis": {
      "total_alumnos": 50,
      "promedio_xp": 950,
      "promedio_lecciones": 12,
      "tasa_completacion": 75.5
    },
    "areas_criticas": [
      {
        "habilidad": "habla",
        "porcentaje_promedio": 62,
        "alumnos_afectados": 35,
        "nivel_criticidad": "alto"
      },
      {
        "habilidad": "escritura",
        "porcentaje_promedio": 70,
        "alumnos_afectados": 25,
        "nivel_criticidad": "medio"
      }
    ],
    "sugerencias": [
      {
        "tipo": "contenido",
        "area": "habla",
        "recomendacion": "Crear más ejercicios de conversación",
        "prioridad": "alta"
      },
      {
        "tipo": "metodologia",
        "area": "general",
        "recomendacion": "Implementar sesiones de práctica grupal",
        "prioridad": "media"
      }
    ],
    "mejores_practicas": [
      {
        "leccion_id": 45,
        "titulo": "Present Perfect Advanced",
        "tasa_exito": 92,
        "razon": "Alta comprensión y buen engagement"
      }
    ]
  }
}
```

---

## 🔄 CÓDIGOS DE ESTADO HTTP

### Success Codes
- `200 OK` - Petición exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Petición exitosa sin contenido de respuesta

### Client Error Codes
- `400 Bad Request` - Datos inválidos o error de validación
- `401 Unauthorized` - No autenticado (token inválido/expirado)
- `403 Forbidden` - No autorizado (sin permisos para este recurso)
- `404 Not Found` - Recurso no encontrado
- `422 Unprocessable Entity` - Error de validación de negocio

### Server Error Codes
- `500 Internal Server Error` - Error del servidor
- `503 Service Unavailable` - Servicio temporalmente no disponible

---

## 🛡️ SEGURIDAD

### Headers requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Rate Limiting
- 100 peticiones por hora por IP
- 500 peticiones por hora por usuario autenticado

### CORS
- Permitido solo desde orígenes configurados
- Credenciales habilitadas

---

## 📝 NOTAS IMPORTANTES

1. **Paginación**: Todos los endpoints de listado soportan `page` y `limit`
2. **Fechas**: Formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
3. **IDs**: Siempre integers
4. **Errores**: Siempre incluyen `success: false` y `message`
5. **Autorización**: Los alumnos solo pueden ver/modificar sus propios datos

---

## 🧪 EJEMPLOS DE USO CON apiClient

### JavaScript (Frontend)

```javascript
// Obtener estadísticas del alumno actual
const userId = localStorage.getItem(APP_CONFIG.STORAGE.KEYS.USUARIO_ID);
const response = await apiClient.get(
    APP_CONFIG.API.ENDPOINTS.ESTADISTICAS.ALUMNO.replace(':id', userId)
);

// Crear retroalimentación
await apiClient.post(
    APP_CONFIG.API.ENDPOINTS.RETROALIMENTACION.CREAR,
    {
        alumno_id: 123,
        leccion_id: 12,
        comentario: "Excelente trabajo",
        calificacion: 9
    }
);

// Analizar desempeño
const analisis = await apiClient.post(
    APP_CONFIG.API.ENDPOINTS.PLANIFICACION.ANALIZAR,
    {
        nivel: "B1",
        idioma: "ingles"
    }
);
```

---

**Versión**: 1.0.0  
**Última actualización**: 2025-11-10
