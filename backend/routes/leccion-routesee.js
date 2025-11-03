const express = require('express');
const router = express.Router();
const leccionController = require('../controllers/leccionController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');

// Middleware de validación
const validarCrearLeccion = [
    body('titulo')
        .isLength({ min: 5, max: 100 })
        .withMessage('El título debe tener entre 5 y 100 caracteres'),
    body('nivel')
        .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
        .withMessage('Nivel inválido'),
    body('idioma')
        .isIn(['Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Japonés', 'Coreano', 'Chino'])
        .withMessage('Idioma no soportado'),
    body('duracion_minutos')
        .optional()
        .isInt({ min: 1, max: 180 })
        .withMessage('La duración debe estar entre 1 y 180 minutos')
];

const validarProgreso = [
    body('progreso')
        .isInt({ min: 0, max: 100 })
        .withMessage('El progreso debe estar entre 0 y 100')
];

// Todas las rutas requieren autenticación
router.use(authMiddleware.verificarToken);

// Rutas públicas (para estudiantes y profesores)
router.get('/nivel/:nivel', 
    param('nivel').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    leccionController.listarLecciones
);

router.get('/:id', 
    param('id').isInt({ min: 1 }),
    leccionController.obtenerLeccion
);

router.post('/:id/progreso',
    param('id').isInt({ min: 1 }),
    validarProgreso,
    leccionController.registrarProgreso
);

// Rutas de profesor/admin
router.post('/crear',
    authMiddleware.verificarRol('profesor', 'admin'),
    validarCrearLeccion,
    leccionController.crearLeccion
);

router.put('/:id',
    authMiddleware.verificarRol('profesor', 'admin'),
    param('id').isInt({ min: 1 }),
    leccionController.actualizarLeccion
);

router.delete('/:id',
    authMiddleware.verificarRol('profesor', 'admin'),
    param('id').isInt({ min: 1 }),
    leccionController.eliminarLeccion
);

module.exports = router;