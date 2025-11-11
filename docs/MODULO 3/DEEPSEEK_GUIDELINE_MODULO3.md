# 🎯 GUIDELINE TÉCNICO - MÓDULO 3 BACKEND (PROGRESO Y GAMIFICACIÓN)

## ⚠️ REGLAS CRÍTICAS - LEER PRIMERO

### 1. PATRÓN DE DATABASE (OBLIGATORIO)
```javascript
// ✅ CORRECTO - SIEMPRE usar este patrón
const db = require('../config/database');
const pool = db.pool || db;

// Luego usar pool.execute()
const [rows] = await pool.execute(query, params);
// rows es un array, acceder con rows[0] si necesitas primer elemento

// ❌ INCORRECTO
const [rows, fields] = await pool.execute(); // NO destructurar fields
const rows = await pool.execute(); // NO olvidar destructurar
```

### 2. ESTRUCTURA DE CONTROLADORES (OBLIGATORIO)
```javascript
// ✅ SIEMPRE seguir este formato:
exports.nombreFuncion = async (req, res) => {
    try {
        // 1. Extraer datos de req.body, req.params, req.user
        const { param1, param2 } = req.body;
        const usuarioId = req.user.id; // Viene del middleware protect
        
        // 2. Validaciones básicas
        if (!param1) {
            return res.status(400).json({ error: 'Parámetro requerido' });
        }
        
        // 3. Llamar al modelo
        const resultado = await Modelo.metodo(param1, param2);
        
        // 4. Responder
        res.status(200).json({
            mensaje: 'Operación exitosa',
            data: resultado
        });
        
    } catch (error) {
        console.error('Error en nombreFuncion:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
```

### 3. RUTAS (OBLIGATORIO)
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/nombreController');
const { protect, authorize } = require('../middleware/auth');

// ✅ RUTAS ESPECÍFICAS PRIMERO, GENÉRICAS DESPUÉS
router.get('/usuario/estadisticas', protect, controller.estadisticasUsuario);
router.get('/:id', protect, controller.obtenerPorId);

// ✅ SIEMPRE usar protect para rutas privadas
// ✅ SIEMPRE usar authorize(roles) para restringir por rol

module.exports = router;
```

### 4. NOMENCLATURA DE ARCHIVOS
- Modelos: `nombreModel.js` (singular) → `progresoModel.js`
- Controladores: `nombreController.js` → `progresoController.js`
- Rutas: `nombreRoutes.js` → `progresoRoutes.js`

---

## 📊 TABLAS DE BASE DE DATOS EXISTENTES

### Tabla: `perfil_estudiantes`
```sql
- usuario_id (FK a usuarios.id)
- nivel_actual (VARCHAR - A1, A2, B1, B2, C1, C2)
- idioma_aprendizaje (VARCHAR)
- total_xp (INT DEFAULT 0)
- nivel_xp (INT DEFAULT 1)
- racha_dias (INT DEFAULT 0)
- fecha_ultima_racha (DATE)
- lecciones_completadas (INT DEFAULT 0)
- cursos_completados (INT DEFAULT 0)
```

### Tabla: `progreso_lecciones`
```sql
- id (PK)
- usuario_id (FK)
- leccion_id (FK)
- progreso (INT 0-100)
- completada (BOOLEAN)
- tiempo_total_segundos (INT)
- fecha_inicio (TIMESTAMP)
- fecha_completado (TIMESTAMP NULL)
- actualizado_en (TIMESTAMP)
```

### Tabla: `inscripciones_cursos`
```sql
- id (PK)
- usuario_id (FK)
- curso_id (FK)
- fecha_inscripcion (TIMESTAMP)
- progreso_general (INT 0-100)
- estado (ENUM: 'en_progreso', 'completado', 'abandonado')
- fecha_ultima_actividad (TIMESTAMP)
```

---

## 🎮 REQUISITOS FUNCIONALES A IMPLEMENTAR

### RF-10: Registrar Progreso
**Controlador**: `progresoController.js`
**Métodos necesarios**:
1. `registrarProgresoLeccion(req, res)` - Actualiza progreso de lección específica
2. `obtenerProgresoPorLeccion(req, res)` - GET progreso de una lección
3. `obtenerProgresoPorCurso(req, res)` - GET progreso de un curso
4. `sincronizarProgreso(req, res)` - Sincronizar progreso offline
5. `obtenerHistorialProgreso(req, res)` - Historial de actividad del usuario

**Datos a registrar por cada lección completada**:
- Progreso (0-100%)
- Tiempo dedicado (segundos)
- Fecha inicio/completado
- Actualizar: total_xp, lecciones_completadas, racha

### RF-11: Otorgar Recompensas
**Controlador**: `gamificacionController.js`
**Métodos necesarios**:
1. `otorgarPuntos(req, res)` - Otorgar XP por acción
2. `calcularNivel(req, res)` - Calcular nivel basado en XP
3. `actualizarRacha(req, res)` - Actualizar racha diaria
4. `verificarRacha(req, res)` - Verificar si se mantiene la racha
5. `obtenerLogrosDisponibles(req, res)` - Listar logros disponibles
6. `desbloquearLogro(req, res)` - Desbloquear logro específico

**Sistema de puntos** (desde `app-config.js` → `GAMIFICACION_CONFIG.PUNTOS`):
```javascript
const PUNTOS = {
    LECCION_COMPLETADA: 10,
    EJERCICIO_CORRECTO: 5,
    EJERCICIO_PERFECTO: 10,
    RACHA_DIARIA: 20,
    EVALUACION_APROBADA: 50,
    NIVEL_COMPLETADO: 100,
    CURSO_COMPLETADO: 200
};
```

### RF-12: Generar Tablas de Clasificación
**Controlador**: `gamificacionController.js`
**Métodos necesarios**:
1. `obtenerRankingGlobal(req, res)` - Top usuarios por XP
2. `obtenerRankingSemanal(req, res)` - Ranking de la semana
3. `obtenerRankingMensual(req, res)` - Ranking del mes
4. `obtenerRankingPorNivel(req, res)` - Ranking filtrado por nivel CEFR
5. `obtenerPosicionUsuario(req, res)` - Posición del usuario actual

**Campos para ranking**:
- usuario_id, nombre, foto_perfil
- total_xp, nivel_xp
- lecciones_completadas, cursos_completados
- racha_dias
- Posición en el ranking

---

## 🔧 IMPLEMENTACIÓN REQUERIDA

### ARCHIVO 1: `backend/models/progresoModel.js`

```javascript
// Estructura base - TÚ COMPLETAS LAS QUERIES
const db = require('../config/database');
const pool = db.pool || db;

/**
 * Registrar o actualizar progreso de una lección
 */
exports.registrarProgresoLeccion = async (usuarioId, leccionId, datos) => {
    try {
        // TODO: Implementar query con INSERT ... ON DUPLICATE KEY UPDATE
        // Campos: progreso, tiempo_total_segundos, completada (si progreso >= 100)
        // Si es primera vez: fecha_inicio = NOW()
        // Si completada: fecha_completado = NOW()
        
    } catch (error) {
        console.error('Error en ProgresoModel.registrarProgresoLeccion:', error);
        throw error;
    }
};

/**
 * Obtener progreso de un usuario en una lección específica
 */
exports.obtenerProgresoPorLeccion = async (usuarioId, leccionId) => {
    try {
        // TODO: SELECT con JOIN a lecciones para obtener info completa
    } catch (error) {
        console.error('Error en ProgresoModel.obtenerProgresoPorLeccion:', error);
        throw error;
    }
};

// CONTINÚA CON LOS DEMÁS MÉTODOS SEGÚN RF-10...
```

### ARCHIVO 2: `backend/models/gamificacionModel.js`

```javascript
const db = require('../config/database');
const pool = db.pool || db;

/**
 * Otorgar puntos XP a un usuario
 */
exports.otorgarPuntos = async (usuarioId, puntosXP, razon) => {
    try {
        // TODO: UPDATE perfil_estudiantes SET total_xp = total_xp + ?
        // Luego calcular si subió de nivel
        // Retornar: { nuevo_total_xp, nivel_actual, subio_nivel }
    } catch (error) {
        console.error('Error en GamificacionModel.otorgarPuntos:', error);
        throw error;
    }
};

/**
 * Actualizar racha diaria del usuario
 */
exports.actualizarRacha = async (usuarioId) => {
    try {
        // TODO: Lógica de racha
        // 1. Obtener fecha_ultima_racha del usuario
        // 2. Si es hoy, no hacer nada
        // 3. Si fue ayer, incrementar racha_dias
        // 4. Si fue hace >1 día, resetear racha_dias a 1
        // 5. Actualizar fecha_ultima_racha = CURDATE()
    } catch (error) {
        console.error('Error en GamificacionModel.actualizarRacha:', error);
        throw error;
    }
};

// CONTINÚA CON LOS DEMÁS MÉTODOS SEGÚN RF-11 y RF-12...
```

### ARCHIVO 3: `backend/controllers/progresoController.js`

```javascript
const ProgresoModel = require('../models/progresoModel');
const GamificacionModel = require('../models/gamificacionModel');

/**
 * @desc    Registrar progreso de lección
 * @route   POST /api/progreso/registrar
 * @access  Private (alumno)
 */
exports.registrarProgresoLeccion = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { leccion_id, progreso, tiempo_segundos } = req.body;
        
        // Validaciones
        if (!leccion_id || progreso === undefined) {
            return res.status(400).json({ 
                error: 'leccion_id y progreso son requeridos' 
            });
        }
        
        // Registrar progreso
        const resultado = await ProgresoModel.registrarProgresoLeccion(
            usuarioId, 
            leccion_id, 
            { progreso, tiempo_segundos }
        );
        
        // Si completó la lección (progreso >= 100), otorgar puntos
        if (progreso >= 100 && resultado.recien_completada) {
            await GamificacionModel.otorgarPuntos(
                usuarioId, 
                10, // LECCION_COMPLETADA
                `Lección ${leccion_id} completada`
            );
            await GamificacionModel.actualizarRacha(usuarioId);
        }
        
        res.json({
            mensaje: 'Progreso registrado exitosamente',
            progreso: resultado
        });
        
    } catch (error) {
        console.error('Error en registrarProgresoLeccion:', error);
        res.status(500).json({ error: 'Error al registrar progreso' });
    }
};

// CONTINÚA CON LOS DEMÁS MÉTODOS...
```

### ARCHIVO 4: `backend/controllers/gamificacionController.js`

```javascript
const GamificacionModel = require('../models/gamificacionModel');

/**
 * @desc    Obtener ranking global
 * @route   GET /api/gamificacion/ranking/global
 * @access  Private
 */
exports.obtenerRankingGlobal = async (req, res) => {
    try {
        const { limite = 100, offset = 0 } = req.query;
        
        const ranking = await GamificacionModel.obtenerRankingGlobal(
            parseInt(limite), 
            parseInt(offset)
        );
        
        res.json({
            ranking,
            total: ranking.length
        });
        
    } catch (error) {
        console.error('Error en obtenerRankingGlobal:', error);
        res.status(500).json({ error: 'Error al obtener ranking' });
    }
};

// CONTINÚA CON LOS DEMÁS MÉTODOS...
```

### ARCHIVO 5: `backend/routes/progresoRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const progresoController = require('../controllers/progresoController');
const { protect, authorize } = require('../middleware/auth');

// Registrar progreso (POST)
router.post('/registrar', protect, authorize('alumno'), progresoController.registrarProgresoLeccion);

// Obtener progreso por lección
router.get('/leccion/:leccionId', protect, progresoController.obtenerProgresoPorLeccion);

// Obtener progreso por curso
router.get('/curso/:cursoId', protect, progresoController.obtenerProgresoPorCurso);

// Sincronizar progreso
router.post('/sincronizar', protect, progresoController.sincronizarProgreso);

// Historial de progreso
router.get('/historial', protect, progresoController.obtenerHistorialProgreso);

module.exports = router;
```

### ARCHIVO 6: `backend/routes/gamificacionRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const gamificacionController = require('../controllers/gamificacionController');
const { protect } = require('../middleware/auth');

// Rankings
router.get('/ranking/global', protect, gamificacionController.obtenerRankingGlobal);
router.get('/ranking/semanal', protect, gamificacionController.obtenerRankingSemanal);
router.get('/ranking/mensual', protect, gamificacionController.obtenerRankingMensual);
router.get('/ranking/nivel/:nivel', protect, gamificacionController.obtenerRankingPorNivel);

// Puntos y nivel
router.get('/puntos', protect, gamificacionController.obtenerPuntosUsuario);
router.get('/nivel', protect, gamificacionController.obtenerNivelUsuario);

// Racha
router.get('/racha', protect, gamificacionController.obtenerRachaUsuario);

// Logros
router.get('/logros', protect, gamificacionController.obtenerLogrosUsuario);
router.post('/logros/:logroId/desbloquear', protect, gamificacionController.desbloquearLogro);

module.exports = router;
```

---

## 📝 REGISTRO EN `server.js`

Después de crear los archivos, agregar estas líneas en `backend/server.js`:

```javascript
// MÓDULO 3: Gestión del Aprendizaje
const progresoRoutes = require('./routes/progresoRoutes');
const gamificacionRoutes = require('./routes/gamificacionRoutes');

app.use('/api/progreso', progresoRoutes);
app.use('/api/gamificacion', gamificacionRoutes);
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de enviar el código, verifica:
- [ ] Todos los modelos usan `const pool = db.pool || db;`
- [ ] Todas las queries usan `const [rows] = await pool.execute()`
- [ ] Todos los controladores tienen `try-catch`
- [ ] Todas las rutas privadas tienen `protect`
- [ ] Los nombres de archivos son correctos (singular para modelos)
- [ ] Las rutas están en el orden correcto (específicas antes que genéricas)
- [ ] Los status codes son apropiados (200, 201, 400, 404, 500)
- [ ] Los mensajes de error son descriptivos
- [ ] Se incluye `process.env.NODE_ENV === 'development'` para detalles

---

## 🎯 INSTRUCCIONES PARA DEEPSEEK

**TU TRABAJO**:
1. Completa TODAS las queries SQL en los modelos
2. Implementa TODOS los métodos en controladores
3. Asegúrate de que los cálculos de XP, nivel y racha sean correctos
4. Agrega validaciones adicionales donde sea necesario
5. Mantén consistencia con el código existente del proyecto

**NO CAMBIES**:
- La estructura de archivos
- Los nombres de funciones
- El patrón de database
- El formato de respuestas JSON

**REFERENCIAS**:
- Sistema de puntos: `GAMIFICACION_CONFIG.PUNTOS` en app-config.js
- Niveles XP: `GAMIFICACION_CONFIG.NIVELES` en app-config.js
- Roles disponibles: 'alumno', 'profesor', 'admin'

**PREGUNTA ANTES DE**:
- Crear nuevas tablas en la BD (usa las existentes)
- Cambiar nombres de campos
- Agregar dependencias npm nuevas
