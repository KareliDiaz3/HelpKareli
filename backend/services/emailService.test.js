jest.mock('nodemailer', () => {
  const sendMail = jest.fn(() => Promise.resolve({ messageId: 'mocked-id' }));
  const verify = jest.fn((cb) => cb(null, true));

  return {
    createTransport: jest.fn(() => ({ sendMail, verify })),
    __mockedTransport: { sendMail, verify }
  };
});

const loadService = () => require('./emailService');

describe('emailService template builders', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.EMAIL_USER = 'noreply@speaklexi.dev';
    process.env.EMAIL_PASSWORD = 'secret';
    process.env.EMAIL_FROM = 'SpeakLexi <noreply@speaklexi.dev>';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('buildRecoveryEmail incluye nombre personalizado y correo codificado', () => {
    const { buildRecoveryEmail } = loadService();
    const correo = 'student.demo@example.com';
    const token = 'abc123';
    const nombre = 'Laura';

    const mailOptions = buildRecoveryEmail(correo, token, nombre);
    const enlaceEsperado = `${process.env.FRONTEND_URL}/pages/auth/restablecer-contrasena.html?token=${token}&email=${encodeURIComponent(correo)}`;

    expect(mailOptions.to).toBe(correo);
    expect(mailOptions.subject).toContain('Recuperación de contraseña');
    expect(mailOptions.html).toContain('Hola Laura');
    expect(mailOptions.html).toContain(token);
    expect(mailOptions.html).toContain(encodeURIComponent(correo));
    expect(mailOptions.html).toContain(enlaceEsperado);
  });

  test('buildRecoveryEmail usa "Estudiante" cuando no hay nombre', () => {
    const { buildRecoveryEmail } = loadService();
    const mailOptions = buildRecoveryEmail('demo@example.com', 'token999');

    expect(mailOptions.html).toContain('Hola Estudiante');
  });

  test('buildVerificationEmail inserta el código proporcionado', () => {
    const { buildVerificationEmail } = loadService();
    const correo = 'user@test.com';
    const codigo = '654321';

    const mailOptions = buildVerificationEmail(correo, codigo);

    expect(mailOptions.to).toBe(correo);
    expect(mailOptions.subject).toContain('Verifica tu cuenta');
    expect(mailOptions.html).toContain(codigo);
  });
});
