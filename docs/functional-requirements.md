# Verificación de Requisitos Funcionales

La siguiente tabla resume el estado de los requisitos funcionales solicitados para SpeakLexi, indicando el caso de uso asociado, el actor principal y la ubicación donde se implementa cada función dentro del repositorio.

| Código | Descripción resumida | Caso de uso / Actor | Implementación principal |
| --- | --- | --- | --- |
| RF-01 | Inicio de sesión con correo y contraseña | UC-01 · Usuario | `frontend/pages/auth/login.html`, `frontend/assets/js/pages/auth/login.js` |
| RF-02 | Recuperación de contraseña vía correo | UC-02 (<<extend>> UC-01) · Usuario | `frontend/pages/auth/recuperar-contrasena.html`, `frontend/assets/js/pages/auth/recuperar-contrasena.js` |
| RF-03 | Verificación automática por correo | UC-03 (<<include>> UC-01/UC-02) · Usuario | `frontend/pages/auth/verificar-email.html`, `frontend/assets/js/pages/auth/verificar-email.js` |
| RF-04 | Registro de perfil con datos e idioma + redirección a evaluación inicial | UC-04 · Usuario | `frontend/pages/auth/registro.html`, `frontend/assets/js/pages/auth/registro.js`, `frontend/pages/onboarding/asignar-nivel.html` |
| RF-05 | Asignar nivel mediante examen de 10 preguntas o selección manual por idioma | UC-05 (<<extend>> UC-04) · Usuario | `frontend/pages/onboarding/asignar-nivel.html`, `frontend/assets/js/pages/onboarding/asignar-nivel.js` |
| RF-06 | Cambio de curso/idioma con lecciones dinámicas | UC-06 (<<extend>> UC-04) · Usuario | `frontend/pages/estudiante/cambiar-curso.html`, `frontend/assets/js/pages/estudiante/cambiar-curso.js`, accesos rápidos en `frontend/assets/components/navbar.html` |
| RF-07 | Eliminación y reactivación de cuenta desde el perfil | UC-07 (<<extend>> UC-04) · Usuario | `frontend/pages/estudiante/perfil.html`, `frontend/assets/js/pages/estudiante/perfil.js` |
| RF-08 | Creación de nuevas lecciones con actividades dinámicas | UC-08 · Administrador de contenido | `frontend/pages/admin/gestion-lecciones.html`, `frontend/assets/js/pages/admin/gestion-lecciones.js`, editor modular en `frontend/pages/admin/editor-leccion.html` |
| RF-09 | Inclusión de recursos multimedia (audio, video, imágenes) en lecciones | UC-09 (<<include>> UC-08) · Administrador de contenido | Gestión multimedia en `frontend/pages/admin/editor-leccion.html`, carga en `frontend/assets/js/pages/admin/editar-leccion/`, preguntas con audio en `frontend/assets/js/data/lecciones-data.js` |
| RF-10 | Registro del progreso del alumno por lección y ventana de resumen | UC-10 · Alumno | `frontend/assets/js/pages/estudiante/lecciones.js`, `frontend/assets/js/pages/estudiante/dashboard.js` |
| RF-11 | Recompensas y motivadores tras completar lecciones | UC-11 (<<include>> UC-10) · Alumno | Panel de logros en `frontend/pages/estudiante/logros-recompensas.html`, feedback gamificado en `frontend/assets/js/pages/estudiante/lecciones.js` |
| RF-12 | Tablas de clasificación y acceso desde la experiencia de lecciones | UC-12 (<<include>> UC-10) · Alumno | `frontend/pages/estudiante/leaderboard.html`, enlaces desde `frontend/assets/js/pages/estudiante/lecciones.js` y `frontend/assets/js/pages/estudiante/dashboard.js` |
| RF-13 | Estadísticas de progreso por alumno para profesores | UC-13 · Profesor | `frontend/pages/profesor/estadisticas-profesor.html`, `frontend/assets/js/pages/profesor/estadisticas.js` |
| RF-14 | Revisión de retroalimentación enviada por estudiantes | UC-14 (<<extend>> UC-13) · Profesor | `frontend/pages/profesor/retroalimentacion-profesor.html`, `frontend/assets/js/pages/profesor/retroalimentacion.js` |
| RF-15 | Planificación de nuevos contenidos basada en desempeño (tabla con al menos 5 alumnos) | UC-15 (<<include>> UC-13) · Profesor | `frontend/pages/profesor/planificacion.html`, tablas dinámicas en `frontend/assets/js/pages/profesor/planificacion.js` |

> **Nota:** Todos los requisitos cuentan con implementaciones visibles en la interfaz o en la lógica JavaScript correspondiente, incluyendo la nueva experiencia de lecciones multinivel (`frontend/pages/estudiante/lecciones.html`) que habilita evaluaciones de 10 preguntas para inglés, francés, alemán e italiano.
