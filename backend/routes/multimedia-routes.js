const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const multimediaController = require('../controllers/multimediaController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: fileFilter
});

// Middleware de validación
const validarSubidaMultimedia = [
    body('leccion_id')
        .isInt({ min: 1 })
        .withMessage('ID de lección inválido'),
    body('descripcion')
        .optional()
        .isLength({ max: 200 })
        .withMessage('La descripción no debe exceder 200 caracteres')
];

// Todas las rutas requieren autenticación
router.use(authMiddleware.verificarToken);

// Rutas públicas
router.get('/leccion/:leccionId',
    param('leccionId').isInt({ min: 1 }),
    multimediaController.obtenerMultimediaPorLeccion
);

// Rutas de profesor/admin
router.post('/subir',
    authMiddleware.verificarRol('profesor', 'admin'),
    upload.single('archivo'),
    validarSubidaMultimedia,
    multimediaController.subirMultimedia
);

router.put('/:id/orden',
    authMiddleware.verificarRol('profesor', 'admin'),
    param('id').isInt({ min: 1 }),
    body('orden').isInt({ min: 0 }),
    multimediaController.actualizarOrden
);

router.delete('/:id',
    authMiddleware.verificarRol('profesor', 'admin'),
    param('id').isInt({ min: 1 }),
    multimediaController.eliminarMultimedia
);

module.exports = router;