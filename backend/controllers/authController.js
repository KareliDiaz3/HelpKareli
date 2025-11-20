// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const { generarToken, generarCodigoVerificacion } = require('../config/jwt');
const emailService = require('../services/emailService');

// ==========================================================
// UTILIDADES DE ESTADO DE CUENTA
// ==========================================================

let columnasEstadoCuentaAseguradas = false;
let columnasBaseUsuariosAseguradas = false;

async function asegurarColumnasBaseUsuarios() {
    if (columnasBaseUsuariosAseguradas) return;

    try {
        // En entornos donde "ADD COLUMN IF NOT EXISTS" no está disponible (MySQL 5.7),
        // comprobamos columna por columna antes de alterarla para evitar errores 500.
        const verificarColumna = async (columna) => {
            const [rows] = await database.query(
                'SHOW COLUMNS FROM usuarios LIKE ?',
                [columna]
            );
            return rows.length > 0;
        };

        const columnasAAgregar = [];

        const existeCorreoVerificado = await verificarColumna('correo_verificado');
        if (!existeCorreoVerificado) {
            columnasAAgregar.push('ADD COLUMN correo_verificado TINYINT(1) NOT NULL DEFAULT 0');
        }

        const existeEstadoCuenta = await verificarColumna('estado_cuenta');
        if (!existeEstadoCuenta) {
            columnasAAgregar.push("ADD COLUMN estado_cuenta ENUM('activo','pendiente_verificacion','desactivado','bloqueado') NOT NULL DEFAULT 'pendiente_verificacion'");
        }

        const existeUltimoAcceso = await verificarColumna('ultimo_acceso');
        if (!existeUltimoAcceso) {
            columnasAAgregar.push('ADD COLUMN ultimo_acceso DATETIME NULL');
        }

        if (columnasAAgregar.length > 0) {
            const alterSQL = `ALTER TABLE usuarios ${columnasAAgregar.join(', ')}`;
            await database.query(alterSQL);
            console.log('✅ Columnas base de usuarios aseguradas:', columnasAAgregar);
        }

        columnasBaseUsuariosAseguradas = true;
    } catch (error) {
        console.warn('⚠️  No se pudieron asegurar las columnas base de usuarios:', error.message);
    }
}

async function asegurarColumnasEstadoCuenta() {
    if (columnasEstadoCuentaAseguradas) return;

    try {
        await database.query(`
            ALTER TABLE usuarios
            ADD COLUMN IF NOT EXISTS fecha_desactivacion DATETIME NULL,
            ADD COLUMN IF NOT EXISTS reactivar_hasta DATETIME NULL,
            ADD COLUMN IF NOT EXISTS eliminacion_programada DATETIME NULL
        `);
        columnasEstadoCuentaAseguradas = true;
    } catch (error) {
        console.warn('⚠️  No se pudieron asegurar las columnas de estado de cuenta:', error.message);
    }
}

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/registro
// @access  Public
exports.registrarUsuario = async (req, res) => {
    let connection;
    try {
        // Validar que no hay errores de validación
        if (!req.validacionExitosa) {
            return res.status(400).json({ 
                error: 'Datos de registro inválidos',
                detalles: req.validationErrors 
            });
        }

        const { 
            nombre, 
            primer_apellido, 
            segundo_apellido, 
            correo, 
            password,
            rol = 'alumno'  // Valor por defecto
        } = req.body;

        console.log('📝 Datos de registro recibidos:', {
            nombre,
            correo,
            rol,
            idiomaFinal: req.body.idioma || req.body.idioma_aprendizaje || 'Inglés',
            nivelFinal: req.body.nivel_actual || 'A1'
        });

        // Verificar si el usuario ya existe
        const [usuariosExistentes] = await database.query(
            'SELECT id FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ 
                error: 'El correo ya está registrado' 
            });
        }

        // Iniciar transacción
        connection = await database.getConnection();
        await connection.beginTransaction();

        // Hashear contraseña
        const saltRounds = 12;
        const contrasenaHash = await bcrypt.hash(password, saltRounds);

        // Generar código de verificación
        const codigoVerificacion = generarCodigoVerificacion();
        const expiraVerificacion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // 1. Insertar usuario principal
        const [resultadoUsuario] = await connection.query(
            `INSERT INTO usuarios 
             (nombre, primer_apellido, segundo_apellido, correo, contrasena_hash, rol, codigo_verificacion, expira_verificacion) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, primer_apellido, segundo_apellido || null, correo, contrasenaHash, rol, codigoVerificacion, expiraVerificacion]
        );

        const usuario_id = resultadoUsuario.insertId;
        const nombre_completo = `${nombre} ${primer_apellido} ${segundo_apellido || ''}`.trim();

        console.log('✅ Usuario principal creado:', usuario_id);

        // 2. Crear perfil base (común para todos) - CORREGIDO: usar creado_en en lugar de fecha_creacion
        await connection.query(
            `INSERT INTO perfil_usuarios (usuario_id, nombre_completo) 
             VALUES (?, ?)`,
            [usuario_id, nombre_completo]
        );

        console.log('✅ Perfil base creado');

        // 3. Crear perfil específico según el rol
        switch(rol) {
            case 'alumno':
                const idioma = req.body.idioma || req.body.idioma_aprendizaje || 'Inglés';
                const nivel = req.body.nivel_actual || 'A1';
                
                console.log('📚 Creando perfil de estudiante:', { idioma, nivel });
                
                await connection.query(
                    `INSERT INTO perfil_estudiantes (usuario_id, nivel_actual, idioma_aprendizaje) 
                     VALUES (?, ?, ?)`,
                    [usuario_id, nivel, idioma]
                );
                
                console.log('✅ Perfil de estudiante creado');
                break;
                
            case 'profesor':
                await connection.query(
                    `INSERT INTO perfil_profesores (usuario_id, titulo, especialidad, años_experiencia, biografia) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        usuario_id, 
                        req.body.titulo || null,
                        req.body.especialidad || null,
                        req.body.años_experiencia || 0,
                        req.body.biografia || null
                    ]
                );
                console.log('✅ Perfil de profesor creado');
                break;
                
            case 'admin':
                // Solo permitir creación de admins mediante métodos específicos
                // Por seguridad, aquí convertimos a profesor si alguien intenta crear admin
                await connection.query(
                    `UPDATE usuarios SET rol = 'profesor' WHERE id = ?`,
                    [usuario_id]
                );
                await connection.query(
                    `INSERT INTO perfil_profesores (usuario_id, titulo, especialidad) 
                     VALUES (?, 'Profesor', 'General')`,
                    [usuario_id]
                );
                console.log('⚠️  Intento de crear admin convertido a profesor');
                break;
        }

        // 4. Enviar email de verificación
        try {
            await emailService.enviarCodigoVerificacion(correo, codigoVerificacion, nombre);
            console.log('✅ Email de verificación enviado');
        } catch (emailError) {
            console.error('❌ Error enviando email:', emailError);
            // No fallar el registro si el email falla
        }

        // Confirmar transacción
        await connection.commit();
        console.log('✅ Transacción confirmada exitosamente');

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente. Por favor verifica tu email.',
            usuario: {
                id: usuario_id,
                nombre: nombre_completo,
                correo: correo,
                rol: rol
            },
            verificacion_requerida: true
        });

    } catch (error) {
        // Rollback en caso de error
        if (connection) {
            await connection.rollback();
            console.log('🔴 Transacción revertida debido a error');
        }
        
        console.error('❌ Error en registro:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor en el registro',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined,
            codigo: 'REGISTRATION_ERROR'
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
};

// @desc    Verificar cuenta con código
// @route   POST /api/auth/verificar
// @access  Public
exports.verificarCuenta = async (req, res) => {
    try {
        const { correo, codigo } = req.body;

        if (!correo || !codigo) {
            return res.status(400).json({ 
                error: 'Correo y código son requeridos' 
            });
        }

        // Buscar usuario pendiente de verificación
        const [usuarios] = await database.query(
            `SELECT id, nombre, primer_apellido, codigo_verificacion, expira_verificacion, rol 
             FROM usuarios 
             WHERE correo = ? AND estado_cuenta = 'pendiente_verificacion'`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ 
                error: 'Usuario no encontrado o ya verificado' 
            });
        }

        const usuario = usuarios[0];

        // Verificar expiración
        if (new Date() > new Date(usuario.expira_verificacion)) {
            // Generar nuevo código
            const nuevoCodigo = generarCodigoVerificacion();
            const nuevaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            await database.query(
                'UPDATE usuarios SET codigo_verificacion = ?, expira_verificacion = ? WHERE id = ?',
                [nuevoCodigo, nuevaExpiracion, usuario.id]
            );

            // Reenviar email
            await emailService.enviarCodigoVerificacion(
                correo, 
                nuevoCodigo, 
                `${usuario.nombre} ${usuario.primer_apellido}`
            );

            return res.status(400).json({ 
                error: 'Código expirado. Se ha enviado un nuevo código a tu email.',
                nuevo_codigo_enviado: true
            });
        }

        // Verificar código
        if (usuario.codigo_verificacion !== codigo) {
            return res.status(400).json({ 
                error: 'Código de verificación incorrecto' 
            });
        }

        // Actualizar usuario a activo - CORREGIDO: usar correo_verificado en lugar de email_verificado
        await database.query(
            `UPDATE usuarios 
             SET estado_cuenta = 'activo', correo_verificado = TRUE, 
                 codigo_verificacion = NULL, expira_verificacion = NULL,
                 ultimo_acceso = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [usuario.id]
        );

        // Generar token JWT
        const token = generarToken({ 
            id: usuario.id, 
            correo: correo,
            rol: usuario.rol 
        });

        // Obtener datos completos del usuario
        const [usuarioCompleto] = await database.query(
            `SELECT u.id, u.nombre, u.primer_apellido, u.segundo_apellido, 
                    u.correo, u.rol, u.estado_cuenta, u.fecha_registro,
                    pu.nombre_completo, pu.foto_perfil
             FROM usuarios u
             LEFT JOIN perfil_usuarios pu ON u.id = pu.usuario_id
             WHERE u.id = ?`,
            [usuario.id]
        );

        res.json({
            mensaje: 'Cuenta verificada exitosamente',
            token: token,
            usuario: usuarioCompleto[0]
        });

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor en la verificación' 
        });
    }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
exports.iniciarSesion = async (req, res) => {
    try {
        await asegurarColumnasBaseUsuarios();
        await asegurarColumnasBaseUsuarios();
        await asegurarColumnasBaseUsuarios();
        await asegurarColumnasEstadoCuenta();

        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ 
                error: 'Correo y contraseña son requeridos' 
            });
        }

        // Buscar usuario - CORREGIDO: usar correo_verificado en lugar de email_verificado
        const [usuarios] = await database.query(
            `SELECT u.id, u.nombre, u.primer_apellido, u.segundo_apellido,
                    u.correo, u.contrasena_hash, u.rol, u.estado_cuenta,
                    u.correo_verificado, u.fecha_desactivacion, u.reactivar_hasta, u.eliminacion_programada,
                    pu.nombre_completo, pu.foto_perfil
             FROM usuarios u
             LEFT JOIN perfil_usuarios pu ON u.id = pu.usuario_id
             WHERE u.correo = ?`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        const usuario = usuarios[0];

        // Verificar estado de la cuenta
        if (usuario.estado_cuenta === 'bloqueado') {
            return res.status(401).json({ 
                error: 'Cuenta bloqueada. Contacta al administrador.' 
            });
        }

        if (usuario.estado_cuenta === 'pendiente_verificacion') {
            return res.status(401).json({ 
                error: 'Cuenta pendiente de verificación. Revisa tu email.' 
            });
        }

        if (usuario.estado_cuenta === 'desactivado') {
            const ventanaReactivacionVigente = usuario.reactivar_hasta && new Date(usuario.reactivar_hasta) > new Date();

            if (!ventanaReactivacionVigente) {
                return res.status(401).json({
                    error: 'Cuenta desactivada y fuera de ventana de reactivación.',
                    reactivar_hasta: usuario.reactivar_hasta
                });
            }

            console.log('♻️  Reactivando cuenta desactivada tras login exitoso');
            await database.query(
                `UPDATE usuarios
                 SET estado_cuenta = 'activo', fecha_desactivacion = NULL,
                     reactivar_hasta = NULL, eliminacion_programada = NULL
                 WHERE id = ?`,
                [usuario.id]
            );
            usuario.estado_cuenta = 'activo';
        }

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(password, usuario.contrasena_hash);
        if (!contrasenaValida) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Actualizar último acceso
        await database.query(
            'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?',
            [usuario.id]
        );

        // Generar token JWT
        const token = generarToken({ 
            id: usuario.id, 
            correo: usuario.correo,
            rol: usuario.rol 
        });

        // Determinar redirección según rol
        let redirectUrl = '';
        switch (usuario.rol) {
            case 'alumno':
                redirectUrl = '/dashboard-estudiante.html';
                break;
            case 'profesor':
                redirectUrl = '/dashboard-profesor.html';
                break;
            case 'admin':
                redirectUrl = '/dashboard-admin.html';
                break;
            default:
                redirectUrl = '/dashboard.html';
        }

        res.json({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo || `${usuario.nombre} ${usuario.primer_apellido}`,
                correo: usuario.correo,
                rol: usuario.rol,
                foto_perfil: usuario.foto_perfil
            },
            redirectUrl: redirectUrl
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor en el login' 
        });
    }
};

// @desc    Solicitar recuperación de contraseña
// @route   POST /api/auth/recuperar-contrasena
// @access  Public
exports.solicitarRecuperacionContrasena = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ 
                error: 'Correo es requerido' 
            });
        }

        // Verificar si el usuario existe
        const [usuarios] = await database.query(
            'SELECT id, nombre, primer_apellido FROM usuarios WHERE correo = ? AND estado_cuenta = "activo"',
            [correo]
        );

        if (usuarios.length === 0) {
            // Por seguridad, no revelar si el email existe o no
            return res.json({ 
                mensaje: 'Si el email existe, se enviarán instrucciones de recuperación' 
            });
        }

        const usuario = usuarios[0];

        // Generar token de recuperación
        const tokenRecuperacion = require('crypto').randomBytes(32).toString('hex');
        const expiraRecuperacion = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

        await database.query(
            'UPDATE usuarios SET token_recuperacion = ?, expira_recuperacion = ? WHERE id = ?',
            [tokenRecuperacion, expiraRecuperacion, usuario.id]
        );

        // Enviar email de recuperación
        try {
            await emailService.enviarRecuperacionContrasena(
                correo, 
                tokenRecuperacion, 
                `${usuario.nombre} ${usuario.primer_apellido}`
            );
        } catch (emailError) {
            console.error('Error enviando email de recuperación:', emailError);
            return res.status(500).json({ 
                error: 'Error enviando email de recuperación' 
            });
        }

        res.json({ 
            mensaje: 'Se han enviado instrucciones de recuperación a tu email' 
        });

    } catch (error) {
        console.error('Error en recuperación:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor en la recuperación' 
        });
    }
};

// @desc    Restablecer contraseña
// @route   POST /api/auth/restablecer-contrasena
// @access  Public
exports.restablecerContrasena = async (req, res) => {
    try {
        const { token, nueva_contrasena } = req.body;

        if (!token || !nueva_contrasena) {
            return res.status(400).json({ 
                error: 'Token y nueva contraseña son requeridos' 
            });
        }

        if (nueva_contrasena.length < 8) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 8 caracteres' 
            });
        }

        // Buscar usuario con token válido
        const [usuarios] = await database.query(
            `SELECT id FROM usuarios 
             WHERE token_recuperacion = ? AND expira_recuperacion > NOW()`,
            [token]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ 
                error: 'Token inválido o expirado' 
            });
        }

        const usuario = usuarios[0];

        // Hashear nueva contraseña
        const saltRounds = 12;
        const nuevaContrasenaHash = await bcrypt.hash(nueva_contrasena, saltRounds);

        // Actualizar contraseña y limpiar token
        await database.query(
            `UPDATE usuarios 
             SET contrasena_hash = ?, token_recuperacion = NULL, expira_recuperacion = NULL 
             WHERE id = ?`,
            [nuevaContrasenaHash, usuario.id]
        );

        res.json({ 
            mensaje: 'Contraseña restablecida exitosamente' 
        });

    } catch (error) {
        console.error('Error restableciendo contraseña:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al restablecer contraseña' 
        });
    }
};

// @desc    Reenviar código de verificación
// @route   POST /api/auth/reenviar-verificacion
// @access  Public
exports.reenviarVerificacion = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ 
                error: 'Correo es requerido' 
            });
        }

        // Buscar usuario pendiente de verificación
        const [usuarios] = await database.query(
            `SELECT id, nombre, primer_apellido 
             FROM usuarios 
             WHERE correo = ? AND estado_cuenta = 'pendiente_verificacion'`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({ 
                error: 'Usuario no encontrado o ya verificado' 
            });
        }

        const usuario = usuarios[0];

        // Generar nuevo código
        const nuevoCodigo = generarCodigoVerificacion();
        const nuevaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await database.query(
            'UPDATE usuarios SET codigo_verificacion = ?, expira_verificacion = ? WHERE id = ?',
            [nuevoCodigo, nuevaExpiracion, usuario.id]
        );

        // Enviar email
        try {
            await emailService.enviarCodigoVerificacion(
                correo, 
                nuevoCodigo, 
                `${usuario.nombre} ${usuario.primer_apellido}`
            );
        } catch (emailError) {
            console.error('Error enviando email:', emailError);
            return res.status(500).json({ 
                error: 'Error enviando email de verificación' 
            });
        }

        res.json({ 
            mensaje: 'Se ha enviado un nuevo código de verificación a tu email' 
        });

    } catch (error) {
        console.error('Error reenviando verificación:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// @desc    Verificar token (para el cliente)
// @route   GET /api/auth/verificar-token
// @access  Private
exports.verificarToken = async (req, res) => {
    try {
        // Si llegamos aquí, el middleware de auth ya verificó el token
        const usuario = req.user;

        // Obtener datos actualizados del usuario
        const [usuarios] = await database.query(
            `SELECT u.id, u.nombre, u.primer_apellido, u.segundo_apellido, 
                    u.correo, u.rol, u.estado_cuenta, u.fecha_registro,
                    pu.nombre_completo, pu.foto_perfil
             FROM usuarios u
             LEFT JOIN perfil_usuarios pu ON u.id = pu.usuario_id
             WHERE u.id = ?`,
            [usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        res.json({ 
            usuario: usuarios[0],
            token_valido: true
        });

    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

// @desc    Actualizar nivel del estudiante después de verificación
// @route   PUT /api/auth/actualizar-nivel
// @access  Private
exports.actualizarNivel = async (req, res) => {
    const { correo, nivel, idioma } = req.body;

    try {
        // Buscar usuario - CORREGIDO: usar correo_verificado en lugar de email_verificado
        const [usuarios] = await database.query(
            'SELECT id, rol, correo_verificado FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (!usuarios.length) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        const usuario = usuarios[0];

        // Verificar que el email esté verificado
        if (!usuario.correo_verificado) {
            return res.status(403).json({ 
                error: 'Debes verificar tu email antes de asignar un nivel',
                codigo: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Verificar que sea estudiante
        if (!['alumno', 'estudiante'].includes(usuario.rol)) {
            return res.status(403).json({ 
                error: 'Solo los estudiantes pueden actualizar su nivel',
                codigo: 'INVALID_ROLE'
            });
        }

        // Verificar que existe el perfil de estudiante
        const [perfiles] = await database.query(
            'SELECT usuario_id FROM perfil_estudiantes WHERE usuario_id = ?',
            [usuario.id]
        );

        if (!perfiles.length) {
            // Crear perfil si no existe
            await database.query(
                `INSERT INTO perfil_estudiantes 
                 (usuario_id, nivel_actual, idioma_aprendizaje) 
                 VALUES (?, ?, ?)`,
                [usuario.id, nivel, idioma || 'Inglés']
            );
        } else {
            // Actualizar perfil existente
            await database.query(
                `UPDATE perfil_estudiantes 
                 SET nivel_actual = ?, 
                     idioma_aprendizaje = ?
                 WHERE usuario_id = ?`,
                [nivel, idioma || 'Inglés', usuario.id]
            );
        }

        console.log(`✅ Nivel actualizado para usuario ${usuario.id}: ${nivel} en ${idioma || 'Inglés'}`);

        res.status(200).json({ 
            mensaje: 'Nivel actualizado correctamente',
            nivel,
            idioma: idioma || 'Inglés'
        });

    } catch (error) {
        console.error('❌ Error actualizando nivel:', error);
        res.status(500).json({ 
            error: 'Error al actualizar nivel',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/perfil
// @access  Private
exports.obtenerPerfil = async (req, res) => {
    try {
        // El usuario viene del middleware de autenticación
        const usuario = req.user;

        // Obtener datos completos del perfil
        const [perfiles] = await database.query(
            `SELECT u.id, u.nombre, u.primer_apellido, u.segundo_apellido, 
                    u.correo, u.rol, u.estado_cuenta, u.fecha_registro,
                    u.ultimo_acceso, u.correo_verificado,
                    pu.nombre_completo, pu.foto_perfil, pu.telefono
             FROM usuarios u
             LEFT JOIN perfil_usuarios pu ON u.id = pu.usuario_id
             WHERE u.id = ?`,
            [usuario.id]
        );

        if (perfiles.length === 0) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        const perfil = perfiles[0];

        // Obtener datos específicos según el rol
        if (perfil.rol === 'alumno') {
            const [perfilEstudiante] = await database.query(
                `SELECT nivel_actual, idioma_aprendizaje, total_xp
                 FROM perfil_estudiantes
                 WHERE usuario_id = ?`,
                [usuario.id]
            );
            
            if (perfilEstudiante.length > 0) {
                perfil.datos_estudiante = perfilEstudiante[0];
            }
        } else if (perfil.rol === 'profesor') {
            const [perfilProfesor] = await database.query(
                `SELECT titulo, especialidad, años_experiencia, biografia
                 FROM perfil_profesores
                 WHERE usuario_id = ?`,
                [usuario.id]
            );
            
            if (perfilProfesor.length > 0) {
                perfil.datos_profesor = perfilProfesor[0];
            }
        } else if (perfil.rol === 'admin') {
            const [perfilAdmin] = await database.query(
                `SELECT departamento, nivel_acceso, cargo
                 FROM perfil_administradores
                 WHERE usuario_id = ?`,
                [usuario.id]
            );
            
            if (perfilAdmin.length > 0) {
                perfil.datos_admin = perfilAdmin[0];
            }
        }

        res.json({ 
            usuario: perfil 
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener el perfil' 
        });
    }
};

// @desc    Cerrar sesión (invalidar token del lado del cliente)
// @route   POST /api/auth/logout
// @access  Private
exports.cerrarSesion = async (req, res) => {
    try {
        // Nota: En una implementación JWT stateless, el logout es principalmente
        // del lado del cliente (eliminar el token). Aquí registramos el evento.
        
        const usuario = req.user;

        // Registrar el logout en logs (opcional)
        console.log(`🚪 Usuario ${usuario.id} (${usuario.correo}) ha cerrado sesión`);

        // Si quisieras implementar una lista negra de tokens, aquí sería el lugar
        // Por ahora, solo respondemos exitosamente
        
        res.json({ 
            mensaje: 'Sesión cerrada exitosamente',
            action: 'Por favor elimina el token del almacenamiento local'
        });

    } catch (error) {
        console.error('Error cerrando sesión:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al cerrar sesión' 
        });
    }
};

// @desc    Desactivar cuenta (soft-delete) con ventana de reactivación de 30 días
// @route   POST /api/auth/desactivar-cuenta
// @access  Private
exports.desactivarCuenta = async (req, res) => {
    try {
        await asegurarColumnasBaseUsuarios();
        await asegurarColumnasEstadoCuenta();

        const usuarioId = req.user.id;
        const [resultado] = await database.query(
            `UPDATE usuarios
             SET estado_cuenta = 'desactivado',
                 fecha_desactivacion = NOW(),
                 reactivar_hasta = DATE_ADD(NOW(), INTERVAL 30 DAY),
                 eliminacion_programada = NULL
             WHERE id = ?`,
            [usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            mensaje: 'Cuenta desactivada. Puedes reactivarla dentro de 30 días iniciando sesión de nuevo.',
            reactivar_hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
    } catch (error) {
        console.error('❌ Error al desactivar cuenta:', error);
        res.status(500).json({
            error: 'Error interno al desactivar la cuenta',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Programar eliminación con opción de reactivar en 30 días
// @route   DELETE /api/auth/eliminar-cuenta
// @access  Private
exports.eliminarCuenta = async (req, res) => {
    try {
        await asegurarColumnasBaseUsuarios();
        await asegurarColumnasEstadoCuenta();

        const usuarioId = req.user.id;
        const [resultado] = await database.query(
            `UPDATE usuarios
             SET estado_cuenta = 'desactivado',
                 fecha_desactivacion = NOW(),
                 reactivar_hasta = DATE_ADD(NOW(), INTERVAL 30 DAY),
                 eliminacion_programada = DATE_ADD(NOW(), INTERVAL 30 DAY)
             WHERE id = ?`,
            [usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            mensaje: 'Cuenta marcada para eliminación. Puedes reactivarla dentro de 30 días iniciando sesión.',
            reactivar_hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
    } catch (error) {
        console.error('❌ Error al eliminar cuenta:', error);
        res.status(500).json({
            error: 'Error interno al eliminar la cuenta',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Reactivar cuenta desactivada dentro de la ventana de 30 días
// @route   POST /api/auth/reactivar-cuenta
// @access  Public
exports.reactivarCuenta = async (req, res) => {
    try {
        await asegurarColumnasBaseUsuarios();
        await asegurarColumnasEstadoCuenta();

        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        const [usuarios] = await database.query(
            `SELECT id, contrasena_hash, estado_cuenta, reactivar_hasta
             FROM usuarios
             WHERE correo = ?`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        if (usuario.estado_cuenta !== 'desactivado') {
            return res.status(400).json({ error: 'La cuenta no está desactivada' });
        }

        const ventanaVigente = usuario.reactivar_hasta && new Date(usuario.reactivar_hasta) > new Date();
        if (!ventanaVigente) {
            return res.status(400).json({ error: 'La ventana de reactivación ha expirado' });
        }

        const contrasenaValida = await bcrypt.compare(password, usuario.contrasena_hash);
        if (!contrasenaValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        await database.query(
            `UPDATE usuarios
             SET estado_cuenta = 'activo', fecha_desactivacion = NULL,
                 reactivar_hasta = NULL, eliminacion_programada = NULL
             WHERE id = ?`,
            [usuario.id]
        );

        res.json({
            success: true,
            mensaje: 'Cuenta reactivada correctamente. Ahora puedes iniciar sesión.',
            usuario_id: usuario.id
        });
    } catch (error) {
        console.error('❌ Error al reactivar cuenta:', error);
        res.status(500).json({
            error: 'Error interno al reactivar la cuenta',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};