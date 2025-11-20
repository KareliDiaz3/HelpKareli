(() => {
    'use strict';

    const STORAGE_KEY = 'speaklexi_student_progress_v1';
    const USER_STORAGE_KEY = (window.APP_CONFIG?.STORAGE?.KEYS?.USUARIO) || 'usuario';
    const MAX_HEARTS = 50;
    const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    const IDIOMAS = {
        ingles: { label: 'Inglés', icon: '🇬🇧' },
        frances: { label: 'Francés', icon: '🇫🇷' },
        aleman: { label: 'Alemán', icon: '🇩🇪' },
        italiano: { label: 'Italiano', icon: '🇮🇹' }
    };

    const BASE_LOGROS = [
        {
            id: 'primer_paso',
            titulo: 'Primer Paso',
            descripcion: 'Completaste tu primera lección en SpeakLexi.',
            xp_otorgado: 50,
            condicion: (state) => state.totalLecciones >= 1
        },
        {
            id: 'perfeccionista',
            titulo: 'Perfeccionista',
            descripcion: 'Lograste una lección perfecta con 10/10 aciertos.',
            xp_otorgado: 80,
            condicion: (_, contexto) => contexto?.porcentaje === 100
        },
        {
            id: 'racha_firme',
            titulo: 'Racha Imparable',
            descripcion: 'Mantén una racha activa de al menos 5 días.',
            xp_otorgado: 120,
            condicion: (state) => state.rachaDias >= 5
        },
        {
            id: 'explorador_idiomas',
            titulo: 'Explorador de Idiomas',
            descripcion: 'Comienza cursos en dos idiomas distintos.',
            xp_otorgado: 90,
            condicion: (state) => state.cursos?.length >= 2
        },
        {
            id: 'maestro_xp',
            titulo: 'Maestro XP',
            descripcion: 'Acumula más de 2500 puntos de experiencia.',
            xp_otorgado: 150,
            condicion: (state) => state.xp >= 2500
        }
    ];

    const COMPETIDORES = [
        { id: 'r1', nombre: 'Lucía Hernández', nivel: 'B2', idioma: 'Inglés', xp: 4200, racha: 9 },
        { id: 'r2', nombre: 'Mateo García', nivel: 'B1', idioma: 'Francés', xp: 3650, racha: 6 },
        { id: 'r3', nombre: 'Camila Torres', nivel: 'C1', idioma: 'Italiano', xp: 5100, racha: 12 },
        { id: 'r4', nombre: 'Julián Pérez', nivel: 'A2', idioma: 'Alemán', xp: 2100, racha: 3 },
        { id: 'r5', nombre: 'Valentina Ruiz', nivel: 'C2', idioma: 'Inglés', xp: 5900, racha: 20 },
        { id: 'r6', nombre: 'Diego Martínez', nivel: 'B2', idioma: 'Francés', xp: 3300, racha: 5 },
        { id: 'r7', nombre: 'Sara López', nivel: 'A1', idioma: 'Italiano', xp: 1700, racha: 2 },
        { id: 'r8', nombre: 'Andrés Castillo', nivel: 'B1', idioma: 'Inglés', xp: 2900, racha: 4 }
    ];

    function dividirNombre(nombreCompleto = '') {
        const partes = nombreCompleto.trim().split(' ');
        const nombre = partes.shift() || 'Estudiante';
        const apellidos = partes.join(' ');
        return { nombre, apellidos };
    }

    function safeParse(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('StudentProgress: error parsing', key, error);
            return null;
        }
    }

    function safeSave(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('StudentProgress: error saving', key, error);
        }
    }

    function obtenerUsuarioBase() {
        const stored = safeParse(USER_STORAGE_KEY);
        if (!stored) return {};
        return stored;
    }

    function normalizarIdioma(valor) {
        if (!valor) {
            return { key: 'ingles', ...IDIOMAS.ingles };
        }
        const lower = valor.toString().toLowerCase();
        if (lower.includes('fr')) return { key: 'frances', ...IDIOMAS.frances };
        if (lower.includes('al') || lower.includes('deu')) return { key: 'aleman', ...IDIOMAS.aleman };
        if (lower.includes('it')) return { key: 'italiano', ...IDIOMAS.italiano };
        return { key: 'ingles', ...IDIOMAS.ingles };
    }

    function crearCursoBase(idiomaKey, nivel = 'A1', esActivo = false) {
        const info = IDIOMAS[idiomaKey] || IDIOMAS.ingles;
        return {
            id: idiomaKey,
            idiomaKey,
            idiomaLabel: info.label,
            nombre: `${info.label} general`,
            icono: info.icon,
            nivel,
            progreso: esActivo ? 12 : 0,
            xp: 0,
            activo: esActivo,
            ultimoAcceso: new Date().toISOString()
        };
    }

    function crearLogrosBase() {
        const ahora = new Date().toISOString();
        return BASE_LOGROS.map((logro, index) => ({
            ...logro,
            earned: index < 2,
            earnedAt: index < 2 ? ahora : null
        }));
    }

    function crearEstadoInicial() {
        const usuario = obtenerUsuarioBase();
        const nombreCompleto = usuario?.nombre || usuario?.nombre_completo || 'Estudiante';
        const nombres = dividirNombre(nombreCompleto);
        const idiomaPreferido = normalizarIdioma(usuario?.idioma || usuario?.idioma_aprendizaje);

        return {
            nombre: nombres.nombre,
            apellidos: nombres.apellidos,
            correo: usuario?.correo || '',
            xp: 0,
            totalLecciones: 0,
            hearts: MAX_HEARTS,
            ultimaRecargaCorazones: new Date().toISOString(),
            minutosSemana: 0,
            minutosTotales: 0,
            rachaDias: 1,
            lastLessonDate: null,
            idiomaKey: idiomaPreferido.key,
            idiomaActual: idiomaPreferido.label,
            nivelActual: 'A1',
            cursos: [crearCursoBase(idiomaPreferido.key, 'A1', true)],
            historial: [],
            logros: crearLogrosBase()
        };
    }

    function mergeCursos(baseCursos = [], storedCursos = []) {
        const mapa = new Map();
        baseCursos.forEach((curso) => mapa.set(curso.idiomaKey, { ...curso }));
        storedCursos.forEach((curso) => {
            const existente = mapa.get(curso.idiomaKey);
            if (existente) {
                mapa.set(curso.idiomaKey, { ...existente, ...curso });
            } else {
                mapa.set(curso.idiomaKey, { ...crearCursoBase(curso.idiomaKey), ...curso });
            }
        });
        return Array.from(mapa.values());
    }

    function mergeLogros(baseLogros = [], storedLogros = []) {
        const mapa = new Map();
        baseLogros.forEach((logro) => mapa.set(logro.id, { ...logro }));
        storedLogros.forEach((logro) => {
            const existente = mapa.get(logro.id);
            if (existente) {
                mapa.set(logro.id, {
                    ...existente,
                    ...logro,
                    condicion: existente.condicion
                });
            } else {
                mapa.set(logro.id, { ...logro });
            }
        });
        return Array.from(mapa.values());
    }

    function restaurarCorazones(state) {
        if (!state.ultimaRecargaCorazones) return;
        const ultima = new Date(state.ultimaRecargaCorazones);
        const hoy = new Date();
        const mismoDia = ultima.toDateString() === hoy.toDateString();
        if (!mismoDia) {
            state.hearts = MAX_HEARTS;
            state.ultimaRecargaCorazones = hoy.toISOString();
        }
    }

    const storedState = safeParse(STORAGE_KEY);
    const initialState = crearEstadoInicial();
    const state = {
        ...initialState,
        ...storedState,
        cursos: mergeCursos(initialState.cursos, storedState?.cursos),
        logros: mergeLogros(initialState.logros, storedState?.logros)
    };

    restaurarCorazones(state);
    if (state.apellidos === undefined) {
        state.apellidos = initialState.apellidos;
    }

    function guardarEstado() {
        safeSave(STORAGE_KEY, state);
    }

    function actualizarRacha() {
        const hoy = new Date();
        const ultima = state.lastLessonDate ? new Date(state.lastLessonDate) : null;
        if (!ultima) {
            state.rachaDias = 1;
        } else {
            const diff = hoy.setHours(0, 0, 0, 0) - ultima.setHours(0, 0, 0, 0);
            const dias = diff / (1000 * 60 * 60 * 24);
            if (dias === 0) {
                // mismo día, mantener
            } else if (dias === 1) {
                state.rachaDias += 1;
            } else {
                state.rachaDias = 1;
            }
        }
        state.lastLessonDate = new Date().toISOString();
    }

    function asegurarCurso(idiomaKey) {
        let curso = state.cursos.find((c) => c.idiomaKey === idiomaKey);
        if (!curso) {
            curso = crearCursoBase(idiomaKey, 'A1', false);
            state.cursos.push(curso);
        }
        return curso;
    }

    function desbloquearLogros(contexto) {
        const desbloqueados = [];
        state.logros.forEach((logro) => {
            if (logro.earned) return;
            if (typeof logro.condicion === 'function' && logro.condicion(state, contexto)) {
                logro.earned = true;
                logro.earnedAt = new Date().toISOString();
                desbloqueados.push({ ...logro });
            }
        });
        return desbloqueados;
    }

    function registrarLeccion({ idioma, nivel, aciertos, total }) {
        restaurarCorazones(state);
        const idiomaInfo = normalizarIdioma(idioma);
        const porcentaje = Math.round((aciertos / Math.max(total, 1)) * 100);
        const xpBase = Math.max(10, aciertos * 15);
        const bonus = porcentaje === 100 ? 30 : porcentaje >= 90 ? 20 : porcentaje >= 75 ? 10 : 0;
        const xpGanado = xpBase + bonus;
        const corazonesPerdidos = Math.min(MAX_HEARTS, Math.max(0, total - aciertos));

        state.hearts = Math.max(0, state.hearts - corazonesPerdidos);
        state.xp += xpGanado;
        state.totalLecciones += 1;
        state.minutosTotales += Math.max(5, Math.round(total * 1.2));
        state.minutosSemana += Math.max(5, Math.round(total * 1.2));
        state.idiomaKey = idiomaInfo.key;
        state.idiomaActual = idiomaInfo.label;
        state.nivelActual = nivel;

        const curso = asegurarCurso(idiomaInfo.key);
        curso.nivel = nivel;
        curso.progreso = Math.min(100, (curso.progreso || 0) + 10);
        curso.xp = (curso.xp || 0) + xpGanado;
        curso.activo = true;
        curso.ultimoAcceso = new Date().toISOString();
        state.cursos.forEach((c) => {
            if (c.idiomaKey !== curso.idiomaKey) {
                c.activo = false;
            }
        });

        state.historial.unshift({
            id: Date.now(),
            titulo: `${idiomaInfo.label} ${nivel}`,
            idioma: idiomaInfo.key,
            idiomaLabel: idiomaInfo.label,
            nivel,
            aciertos,
            total,
            porcentaje,
            xp_ganado: xpGanado,
            fechaActualizacion: new Date().toISOString()
        });
        state.historial = state.historial.slice(0, 6);

        actualizarRacha();
        const logrosDesbloqueados = desbloquearLogros({ porcentaje });
        guardarEstado();

        return {
            xpGanado,
            corazonesPerdidos,
            corazonesRestantes: state.hearts,
            logrosDesbloqueados,
            porcentaje
        };
    }

    function cambiarCurso(idiomaLabel, nivel) {
        const info = normalizarIdioma(idiomaLabel);
        state.idiomaKey = info.key;
        state.idiomaActual = info.label;
        state.nivelActual = nivel;
        const curso = asegurarCurso(info.key);
        curso.nivel = nivel;
        curso.activo = true;
        curso.ultimoAcceso = new Date().toISOString();
        state.cursos.forEach((c) => {
            if (c.idiomaKey !== info.key) {
                c.activo = false;
            }
        });
        desbloquearLogros();
        guardarEstado();
        return { idioma: info.label, nivel };
    }

    function obtenerSnapshot() {
        const cursosOrdenados = [...state.cursos].sort((a, b) => (b.activo === a.activo ? b.xp - a.xp : (b.activo ? 1 : -1)));
        const logrosGanados = state.logros
            .filter((logro) => logro.earned)
            .sort((a, b) => new Date(b.earnedAt || 0) - new Date(a.earnedAt || 0));
        const nombreCompleto = [state.nombre, state.apellidos].filter(Boolean).join(' ').trim() || 'Estudiante';

        return {
            nombre: state.nombre,
            nombreCompleto,
            correo: state.correo,
            xp: state.xp,
            totalLecciones: state.totalLecciones,
            hearts: state.hearts,
            minutosSemana: state.minutosSemana,
            minutosTotales: state.minutosTotales,
            rachaDias: state.rachaDias,
            idiomaActual: state.idiomaActual,
            idiomaKey: state.idiomaKey,
            nivelActual: state.nivelActual,
            cursos: cursosOrdenados,
            historial: [...state.historial],
            logros: logrosGanados
        };
    }

    function obtenerDatosDashboard() {
        const snapshot = obtenerSnapshot();
        return {
            usuario: {
                nombre: snapshot.nombre,
                nivel: snapshot.nivelActual,
                idioma: snapshot.idiomaActual,
                xp: snapshot.xp,
                racha_dias: snapshot.rachaDias
            },
            progreso: {
                leccionesCompletadas: snapshot.totalLecciones,
                tiempoEstudio: snapshot.minutosSemana,
                general: Math.min(100, Math.round((snapshot.totalLecciones / 24) * 100))
            },
            estadisticas: {
                rachaActual: snapshot.rachaDias,
                puntosTotales: snapshot.xp,
                lecciones_completadas: snapshot.totalLecciones
            },
            lecciones_completadas: snapshot.historial,
            cursos: snapshot.cursos,
            logros: snapshot.logros,
            leccionesRecomendadas: obtenerLeccionesRecomendadas(snapshot)
        };
    }

    function obtenerLeccionesRecomendadas(snapshot, limite = 8) {
        const cursosOrdenados = [...(snapshot.cursos || [])].sort((a, b) => (b.activo === a.activo ? 0 : b.activo ? 1 : -1));
        const cursosFuente = cursosOrdenados.filter((curso) => curso.activo) || [];
        const cursos = cursosFuente.length ? cursosFuente : cursosOrdenados;

        const combos = [];
        cursos.forEach((curso) => {
            LEVELS.forEach((nivel) => {
                combos.push({
                    id: `${curso.id}-${nivel}`,
                    titulo: `${curso.idiomaLabel} ${nivel}`,
                    idioma: curso.idiomaKey,
                    idiomaLabel: curso.idiomaLabel,
                    nivel,
                    descripcion: `10 preguntas clave para tu nivel ${nivel} de ${curso.idiomaLabel}.`,
                    duracion_minutos: 15,
                    icono: curso.icono
                });
            });
        });
        return combos.slice(0, limite);
    }

    function obtenerLeaderboard(tipo = 'global') {
        const snapshot = obtenerSnapshot();
        const factor = tipo === 'semanal' ? 0.6 : tipo === 'mensual' ? 0.85 : 1;
        let lista = COMPETIDORES.map((comp, index) => ({
            usuario_id: comp.id,
            nombre_completo: comp.nombre,
            nivel_xp: comp.nivel,
            idioma: comp.idioma,
            total_xp: Math.round(comp.xp * factor + index * 37),
            racha_dias: comp.racha,
            foto_perfil: null
        }));

        if (tipo === 'nivel') {
            lista = lista.filter((comp) => comp.nivel_xp.startsWith(snapshot.nivelActual.charAt(0)));
        }

        lista.push({
            usuario_id: 'actual',
            nombre_completo: snapshot.nombreCompleto || snapshot.nombre,
            nivel_xp: snapshot.nivelActual,
            idioma: snapshot.idiomaActual,
            total_xp: snapshot.xp,
            racha_dias: snapshot.rachaDias,
            esUsuario: true,
            foto_perfil: null
        });

        lista.sort((a, b) => b.total_xp - a.total_xp);
        lista = lista.map((item, index) => ({
            ...item,
            posicion: index + 1
        }));

        const usuario = lista.find((item) => item.esUsuario) || lista.find((item) => item.usuario_id === 'actual');
        const total = lista.length;

        return {
            ranking: lista,
            total,
            miPosicion: usuario
                ? {
                      posicion: usuario.posicion,
                      total_usuarios: total,
                      usuario: {
                          nombre: usuario.nombre_completo,
                          total_xp: usuario.total_xp,
                          nivel_xp: usuario.nivel_xp
                      }
                  }
                : null
        };
    }

    function setPerfil(datos = {}) {
        if (datos.nombre) state.nombre = datos.nombre;
        if (datos.apellidos !== undefined) state.apellidos = datos.apellidos;
        if (datos.correo) state.correo = datos.correo;
        if (datos.idioma) {
            const info = normalizarIdioma(datos.idioma);
            state.idiomaKey = info.key;
            state.idiomaActual = info.label;
        }
        if (datos.nivel) state.nivelActual = datos.nivel;
        guardarEstado();
    }

    window.StudentProgress = {
        MAX_HEARTS,
        getSnapshot: obtenerSnapshot,
        recordLesson: registrarLeccion,
        changeCourse: cambiarCurso,
        getDashboardData: obtenerDatosDashboard,
        getRecommendedLessons: (limit) => obtenerLeccionesRecomendadas(obtenerSnapshot(), limit),
        getLeaderboard: obtenerLeaderboard,
        setProfile: setPerfil
    };
})();
