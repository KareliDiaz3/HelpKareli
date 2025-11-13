/* ============================================
   SPEAKLEXI - RUTAS DE PROFESOR
   Módulo 4: Endpoints para gestión de desempeño
   
   Rutas protegidas con:
   - verificarToken: Usuario autenticado
   - verificarProfesor: Solo rol profesor
   ============================================ */

const express = require('express');
const router = express.Router();
const ProfesorController = require('../controllers/profesorController');
const { verificarToken, verificarProfesor } = require('../middleware/authMiddleware');

// ============================================
// MIDDLEWARE GLOBAL PARA RUTAS DE PROFESOR
// ============================================

// Todas las rutas requieren autenticación y rol de profesor
router.use(verificarToken);
router.use(verificarProfesor);

// ============================================
// DASHBOARD Y ESTADÍSTICAS
// ============================================

/**
 * @route   GET /api/profesor/dashboard
 * @desc    Obtener dashboard principal del profesor
 * @access  Private (Profesor only)
 * @response {Object} data - Datos del dashboard
 */
router.get('/dashboard', ProfesorController.obtenerDashboard);

/**
 * @route   GET /api/profesor/estudiantes
 * @desc    Obtener lista de estudiantes asignados al profesor
 * @access  Private (Profesor only)
 * @query   {string} [busqueda] - Filtrar por nombre
 * @response {Array} data - Lista de estudiantes
 */
router.get('/estudiantes', ProfesorController.obtenerEstudiantes);

/**
 * @route   GET /api/profesor/estadisticas
 * @desc    Obtener estadísticas detalladas
 * @access  Private (Profesor only)
 * @query   {number} [estudiante_id] - ID de estudiante para estadísticas específicas
 * @response {Object} data - Estadísticas generales o de estudiante
 */
router.get('/estadisticas', ProfesorController.obtenerEstadisticasDetalladas);

// ============================================
// GESTIÓN DE RETROALIMENTACIÓN
// ============================================

/**
 * @route   POST /api/profesor/retroalimentacion
 * @desc    Enviar retroalimentación a estudiante
 * @access  Private (Profesor only)
 * @body    {number} estudiante_id - ID del estudiante
 * @body    {string} asunto - Asunto del mensaje
 * @body    {string} mensaje - Contenido del mensaje
 * @body    {string} [tipo] - Tipo: felicitacion, mejora, alerta, general
 * @body    {number} [leccion_id] - ID de lección relacionada
 * @response {Object} data - ID de la retroalimentación creada
 */
router.post('/retroalimentacion', ProfesorController.enviarRetroalimentacion);

/**
 * @route   GET /api/profesor/retroalimentacion
 * @desc    Obtener historial de retroalimentaciones enviadas
 * @access  Private (Profesor only)
 * @query   {number} [estudiante_id] - Filtrar por estudiante
 * @query   {boolean} [leido] - Filtrar por estado de lectura
 * @response {Array} data - Lista de retroalimentaciones
 */
router.get('/retroalimentacion', ProfesorController.obtenerRetroalimentaciones);

// ============================================
// PLANIFICACIÓN DE CONTENIDOS
// ============================================

/**
 * @route   POST /api/profesor/planes
 * @desc    Crear plan de estudio personalizado
 * @access  Private (Profesor only)
 * @body    {number} estudiante_id - ID del estudiante
 * @body    {string} titulo - Título del plan
 * @body    {string} [descripcion] - Descripción del plan
 * @body    {string} [objetivos] - Objetivos del plan
 * @body    {Array} [temas_dificultad] - Array de temas con dificultad
 * @body    {Array} [lecciones_sugeridas] - Array de IDs de lecciones
 * @body    {Array} [ejercicios_extra] - Array de ejercicios adicionales
 * @body    {string} [fecha_inicio] - Fecha de inicio (YYYY-MM-DD)
 * @body    {string} [fecha_fin_estimada] - Fecha fin estimada (YYYY-MM-DD)
 * @response {Object} data - ID del plan creado
 */
router.post('/planes', ProfesorController.crearPlan);

/**
 * @route   GET /api/profesor/planes
 * @desc    Obtener planes de estudio creados por el profesor
 * @access  Private (Profesor only)
 * @response {Array} data - Lista de planes
 */
router.get('/planes', ProfesorController.obtenerPlanes);

// ============================================
// ALERTAS Y NOTIFICACIONES
// ============================================

/**
 * @route   GET /api/profesor/alertas
 * @desc    Obtener alertas del profesor
 * @access  Private (Profesor only)
 * @query   {boolean} [solo_no_revisadas] - Solo alertas no revisadas (default: true)
 * @response {Array} data - Lista de alertas
 */
router.get('/alertas', ProfesorController.obtenerAlertas);

/**
 * @route   PUT /api/profesor/alertas/:id/revisar
 * @desc    Marcar alerta como revisada
 * @access  Private (Profesor only)
 * @params  {number} id - ID de la alerta
 * @response {Object} message - Confirmación
 */
router.put('/alertas/:id/revisar', ProfesorController.marcarAlertaRevisada);

// ============================================
// GESTIÓN DE CONTENIDO
// ============================================

/**
 * @route   GET /api/profesor/lecciones
 * @desc    Obtener lecciones del curso asignado al profesor
 * @access  Private (Profesor only)
 * @response {Array} data - Lista de lecciones con estadísticas
 */
router.get('/lecciones', ProfesorController.obtenerLecciones);

// ============================================
// RUTAS ADICIONALES PARA FUNCIONALIDAD EXTENDIDA
// ============================================

/**
 * @route   GET /api/profesor/estadisticas-avanzadas
 * @desc    Obtener estadísticas avanzadas (futura implementación)
 * @access  Private (Profesor only)
 */
router.get('/estadisticas-avanzadas', (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint para estadísticas avanzadas - En desarrollo',
        data: null
    });
});

/**
 * @route   GET /api/profesor/reportes
 * @desc    Generar reportes (futura implementación)
 * @access  Private (Profesor only)
 */
router.get('/reportes', (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint para reportes - En desarrollo',
        data: null
    });
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

/**
 * Manejo de rutas no definidas en profesor
 */
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`,
        suggestion: 'Verifique la documentación de la API'
    });
});

// ============================================
// EXPORTACIÓN
// ============================================

module.exports = router;