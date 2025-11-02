# Documentación Técnica - Módulo 1: Gestión de Usuarios

## 🏗️ Arquitectura del Sistema SpeakLexi

### **Diagrama de Arquitectura General**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND       │    │   BASE DE DATOS │
│   (Cliente)     │◄──►│   (Express.js)   │◄──►│    (MySQL)      │
│                 │    │                  │    │                 │
│ • HTML/CSS/JS   │    │ • API REST       │    │ • Tablas:       │
│ • Tailwind CSS  │    │ • JWT Auth       │    │   - usuarios    │
│ • Componentes   │    │ • Middlewares    │    │   - verificaciones│
└─────────────────┘    │ • Servicios      │    │   - recuperaciones│
                       └──────────────────┘    └─────────────────┘
```

---

## 📋 MÓDULO 1: GESTIÓN DE USUARIOS

### **🎯 Objetivo del Módulo**
Manejar todo el ciclo de vida del usuario: registro, autenticación, verificación, recuperación de contraseña y gestión de perfiles.

### **🏛️ Arquitectura del Módulo**

#### **Backend - Estructura de Capas**
```
backend/
├── 📁 config/                 # Configuración del sistema
│   ├── database.js           # Conexión MySQL con pool
│   └── jwt.js               # Configuración JWT
├── 📁 controllers/           # Lógica de negocio
│   └── authController.js     # Controlador de autenticación
├── 📁 middleware/            # Interceptores de peticiones
│   ├── auth.js              # Autenticación JWT
│   └── validator.js         # Validación de datos
├── 📁 models/               # Modelos de datos
│   └── usuario.js           # Esquema de usuario
├── 📁 routes/               # Definición de endpoints
│   └── auth-routes.js       # Rutas de autenticación
├── 📁 services/             # Servicios externos
│   └── emailService.js      # Servicio de correos
└── server.js                # Servidor principal
```

#### **Frontend - Estructura de Componentes**
```
frontend/
├── 📁 pages/auth/           # Páginas de autenticación
│   ├── login.html
│   ├── registro.html
│   ├── verificar-email.html
│   ├── recuperar-contrasena.html
│   └── restablecer-contrasena.html
├── 📁 public/js/
│   ├── 📁 api/              # Clientes HTTP
│   │   ├── auth.js          # API de autenticación
│   │   └── usuario.js       # API de usuario
│   ├── 📁 components/       # Componentes reutilizables
│   │   ├── login-form.js
│   │   └── register-form.js
│   └── 📁 utils/            # Utilidades
│       ├── auth-storage.js  # Manejo de tokens
│       ├── toast.js         # Notificaciones
│       └── validators.js    # Validadores
```

---

## 🔧 IMPLEMENTACIÓN DETALLADA

### **1. Base de Datos - Esquema de Usuarios**

#### **Tabla: `usuarios`**
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    estado_cuenta ENUM('pendiente', 'activo', 'inactivo') DEFAULT 'pendiente',
    codigo_verificacion VARCHAR(6),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    curso_actual VARCHAR(50),
    nivel_asignado VARCHAR(50),
    rol ENUM('estudiante', 'profesor', 'admin') DEFAULT 'estudiante'
);
```

#### **Tablas Auxiliares:**
- `verificaciones`: Códigos de verificación con expiración
- `recuperaciones`: Tokens de recuperación de contraseña

### **2. Backend - Flujo de Autenticación**

#### **Configuración Principal (`config/`)**
```javascript
// database.js - Pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 60000
});

// jwt.js - Configuración de tokens
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN
};
```

#### **Controlador (`controllers/authController.js`)**
```javascript
// Flujo de registro
exports.registrarUsuario = async (req, res) => {
  // 1. Validar datos
  // 2. Hashear contraseña (bcrypt - 12 rounds)
  // 3. Guardar usuario en BD (estado: 'pendiente')
  // 4. Generar código de verificación
  // 5. Enviar email de verificación
  // 6. Responder al cliente
};

// Flujo de verificación
exports.verificarCuenta = async (req, res) => {
  // 1. Validar código
  // 2. Activar cuenta (estado: 'activo')
  // 3. Generar JWT token
  // 4. Responder con token y datos de usuario
};
```

#### **Middleware (`middleware/`)**
```javascript
// auth.js - Protección de rutas
const authenticateToken = async (req, res, next) => {
  // 1. Extraer token del header
  // 2. Verificar JWT
  // 3. Buscar usuario en BD
  // 4. Verificar estado de cuenta
  // 5. Adjuntar usuario a req.user
  // 6. Continuar a la ruta protegida
};

// validator.js - Validación de datos
const validarRegistro = [
  body('correo').isEmail().normalizeEmail(),
  body('contrasena').isLength({ min: 8 }),
  body('nombre').isLength({ min: 2 })
];
```

#### **Servicios (`services/emailService.js`)**
```javascript
// Servicio simplificado sin Redis
exports.enviarCodigoVerificacion = async (correo, codigo) => {
  // 1. Configurar transporter (nodemailer)
  // 2. Crear template HTML
  // 3. Enviar email con reintentos
  // 4. Manejar errores
};
```

#### **Rutas (`routes/auth-routes.js`)**
```javascript
router.post('/registro', validarRegistro, authController.registrarUsuario);
router.post('/verificar', validarVerificacion, authController.verificarCuenta);
router.post('/login', validarLogin, authController.iniciarSesion);
router.post('/recuperar-contrasena', authController.solicitarRecuperacionContrasena);
router.post('/restablecer-contrasena', authController.restablecerContrasena);
```

### **3. Frontend - Flujo de Interfaz**

#### **API Client (`public/js/api/auth.js`)**
```javascript
class AuthAPI {
  static async login(correo, contrasena) {
    // 1. Validar datos localmente
    // 2. Enviar petición POST /api/auth/login
    // 3. Manejar respuesta (éxito/error)
    // 4. Guardar token en localStorage
    // 5. Redirigir según rol
  }

  static async register(datosUsuario) {
    // 1. Validar formulario
    // 2. Enviar petición POST /api/auth/registro
    // 3. Redirigir a verificación de email
  }
}
```

#### **Gestión de Estado (`public/js/utils/auth-storage.js`)**
```javascript
const AuthStorage = {
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },
  
  getToken() {
    return localStorage.getItem('auth_token');
  },
  
  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};
```

#### **Componentes (`public/js/components/`)**
```javascript
// login-form.js - Componente reutilizable
class LoginForm extends HTMLElement {
  connectedCallback() {
    // 1. Renderizar formulario
    // 2. Manejar eventos de submit
    // 3. Validar en tiempo real
    // 4. Mostrar errores/éxitos
  }
}
```

---

## 🔄 FLUJOS DE TRABAJO PRINCIPALES

### **Flujo 1: Registro de Usuario**
```
Frontend → Backend → Base de Datos → Servicio Email
    ↓          ↓           ↓              ↓
1. Formulario → Validación → Crear usuario → Enviar código
2. Redirigir → Generar código → Guardar código → Email enviado
```

### **Flujo 2: Verificación de Email**
```
Frontend → Backend → Base de Datos
    ↓          ↓           ↓
1. Ingresar código → Validar código → Activar cuenta
2. Recibir token ← Generar JWT ← Actualizar estado
```

### **Flujo 3: Autenticación JWT**
```
Frontend → Middleware → Controlador
    ↓          ↓           ↓
1. Incluir token → Verificar token → Ejecutar lógica
2. En cada request → Extraer usuario → Acceso a datos
```

---

## 🛡️ SEGURIDAD IMPLEMENTADA

### **Medidas de Seguridad**
| Capa | Medida | Propósito |
|------|--------|-----------|
| **Base de Datos** | Hash bcrypt (12 rounds) | Protección contraseñas |
| **API** | Rate limiting (100 req/15min) | Prevenir fuerza bruta |
| **Tokens** | JWT con expiración (1h) | Sesiones temporales |
| **Comunicación** | CORS configurado | Prevenir CSRF |
| **Headers** | Helmet.js | Seguridad HTTP |
| **Validación** | Express-validator | Prevenir inyecciones |

### **Variables de Entorno Críticas**
```env
JWT_SECRET=clave_super_secreta_compleja
BCRYPT_ROUNDS=12
DB_PASSWORD=password_seguro
EMAIL_PASSWORD=app_password_gmail
```

---

## 📊 ENDPOINTS DEL MÓDULO

### **Autenticación Pública**
| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/registro` | Registrar nuevo usuario | `{nombre, correo, contrasena}` |
| `POST` | `/api/auth/verificar` | Verificar código de email | `{codigo, correo}` |
| `POST` | `/api/auth/login` | Iniciar sesión | `{correo, contrasena}` |
| `POST` | `/api/auth/recuperar-contrasena` | Solicitar recuperación | `{correo}` |
| `POST` | `/api/auth/restablecer-contrasena` | Restablecer contraseña | `{token, nuevaContrasena}` |

### **Rutas Protegidas (Futuras)**
| Método | Endpoint | Descripción | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/auth/perfil` | Obtener perfil usuario | ✅ |
| `PUT` | `/api/auth/perfil` | Actualizar perfil | ✅ |
| `PUT` | `/api/auth/cambiar-curso` | Cambiar curso | ✅ |
| `DELETE` | `/api/auth/cuenta` | Eliminar cuenta | ✅ |

---

## 🚀 GUÍA PARA NUEVOS MÓDULOS

### **Plantilla para Nuevos Módulos**
```markdown
## Módulo X: [Nombre del Módulo]

### Estructura Backend
```
backend/
├── controllers/[modulo]-controller.js
├── routes/[modulo]-routes.js  
├── models/[entidad].js
└── services/[servicio].js (si aplica)
```

### Estructura Frontend
```
frontend/
├── pages/[modulo]/
├── public/js/api/[modulo].js
└── public/js/components/[componente].js
```

### Base de Datos
```sql
-- Nueva tabla: [tabla_nombre]
-- Relaciones con usuarios: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
```

### Consideraciones Especiales
- [ ] ¿Requiere autenticación? ✅/❌
- [ ] ¿Requiere permisos especiales? [rol_requerido]
- [ ] ¿Modifica estructura de usuarios? ✅/❌
- [ ] ¿Nuevas dependencias? [lista_dependencias]
```

---

## 📝 NOTAS TÉCNICAS IMPORTANTES

### **Patrones Implementados**
- **MVC (Modelo-Vista-Controlador)**: Separación clara de responsabilidades
- **Repository Pattern**: Acceso a datos abstracto mediante `database.js`
- **Service Layer**: Lógica de negocio en servicios separados
- **Middleware Chain**: Validación → Autenticación → Controlador

### **Decisiones de Diseño**
1. **JWT sobre Sessions**: Para escalabilidad y APIs RESTful
2. **Pool de Conexiones**: Mejor rendimiento en MySQL
3. **Validación en Capas**: Frontend + Backend + Base de Datos
4. **Emails Asíncronos**: Sin colas complejas (simplicidad)

### **Extensiones Futuras**
- [ ] Refresh tokens para mayor seguridad
- [ ] 2FA (Autenticación de dos factores)
- [ ] Login con redes sociales
- [ ] Auditoría de actividades del usuario

---

## 🔍 ESTADO ACTUAL DEL MÓDULO

### **✅ COMPLETADO**
- [x] Registro de usuario con verificación por email
- [x] Login/logout con JWT
- [x] Recuperación de contraseña
- [x] Middleware de autenticación
- [x] Validación de datos en frontend y backend
- [x] Servicio de emails funcional

### **🔄 EN DESARROLLO**
- [ ] Gestión de perfil de usuario
- [ ] Cambio de curso/nivel
- [ ] Eliminación de cuenta
- [ ] Panel de administración de usuarios

### **📋 PENDIENTE**
- [ ] Tests unitarios e integración
- [ ] Documentación Swagger/OpenAPI
- [ ] Rate limiting específico por endpoint
- [ ] Mejoras en seguridad (CSP headers)

---

*Esta documentación se actualizará conforme se desarrollen nuevos módulos manteniendo la consistencia arquitectónica.*