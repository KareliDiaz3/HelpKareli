// backend/services/emailService.js - VERSIÓN SIMPLIFICADA
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Configuración SIMPLE del Transporter (usando EMAIL_* de tu .env)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 2. Verificar conexión al iniciar
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Error de conexión SMTP:', error.message);
  } else {
    console.log('✅ Servidor SMTP listo para enviar mensajes');
  }
});

// 3. Función de Reintento Mejorada (SIN Redis)
async function sendWithRetry(mailOptions, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a: ${mailOptions.to}`);
      return { success: true, result };
    } catch (err) {
      console.error(`❌ Intento ${i + 1} fallido:`, err.message);
      
      // Si es el último intento, retornar error
      if (i === retries - 1) {
        return { 
          success: false, 
          error: `Fallo después de ${retries} intentos: ${err.message}` 
        };
      }
      
      // Esperar antes del siguiente intento (1s, 2s, 4s...)
      const backoffTime = 2 ** i * 1000;
      console.log(`⏳ Reintentando en ${backoffTime/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
}

// 4. Función para enviar código de verificación
exports.enviarCodigoVerificacion = async (correo, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: correo,
    subject: 'Verifica tu cuenta - SpeakLexi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">¡Bienvenido a SpeakLexi!</h1>
        <p>Tu código de verificación es:</p>
        <div style="background: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="color: #0ea5e9; letter-spacing: 5px; margin: 0;">${codigo}</h2>
        </div>
        <p style="color: #666; margin-top: 20px;">Este código expira en 10 minutos.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Si no solicitaste este código, ignora este mensaje.</p>
      </div>
    `
  };

  return await sendWithRetry(mailOptions);
};

// 5. Función para enviar recuperación de contraseña
exports.enviarRecuperacionPassword = async (correo, token) => {
  const enlace = `${process.env.FRONTEND_URL}/pages/auth/restablecer-contrasena.html?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: correo,
    subject: 'Recuperación de contraseña - SpeakLexi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Recuperación de Contraseña</h1>
        <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${enlace}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #666; text-align: center;">
          O copia este enlace:<br>
          <span style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
            ${enlace}
          </span>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este mensaje.
        </p>
      </div>
    `
  };

  return await sendWithRetry(mailOptions);
};

// 6. Función simple para probar el servicio
exports.probarEmail = async () => {
  const testMailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER, // Enviarse a sí mismo para prueba
    subject: 'Prueba de Email - SpeakLexi',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="color: #667eea;">✅ Prueba Exitosa</h1>
        <p>El servicio de email de SpeakLexi está funcionando correctamente.</p>
        <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  };

  return await sendWithRetry(testMailOptions);
};