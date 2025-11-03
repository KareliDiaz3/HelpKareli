const multer = require('multer');
const path = require('path');

// Crear directorio de uploads si no existe
const fs = require('fs');
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitizar nombre de archivo
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'multimedia-' + uniqueSuffix + path.extname(originalName));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = {
        'image/jpeg': true,
        'image/png': true,
        'video/mp4': true,
        'audio/mpeg': true,
        'audio/wav': true,
        'application/pdf': true
    };

    if (allowedMimes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 5 // Máximo 5 archivos por request
    },
    fileFilter: fileFilter
});

// Manejo de errores de Multer
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es demasiado grande. Tamaño máximo: 50MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Demasiados archivos. Máximo: 5 archivos por solicitud'
            });
        }
    } else if (error) {
        return res.status(400).json({
            error: error.message
        });
    }
    next();
};

module.exports = {
    upload,
    handleUploadErrors
};