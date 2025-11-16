/* ============================================
   SPEAKLEXI - ASIGNACIÓN DE NIVEL
   Archivo: assets/js/pages/onboarding/asignar-nivel.js
   Usa: APP_CONFIG, apiClient, formValidator, toastManager, Utils
   ============================================ */

(async () => {
    'use strict';

    // ============================================
    // 1. ESPERAR DEPENDENCIAS CON MODULE LOADER
    // ============================================
    const dependencias = [
        'APP_CONFIG',
        'apiClient', 
        'formValidator',
        'toastManager',
        'Utils',
        'ModuleLoader'
    ];

    const inicializado = await window.ModuleLoader.initModule({
        moduleName: 'Asignar Nivel',
        dependencies: dependencias,
        onReady: inicializarModulo,
        onError: (error) => {
            console.error('💥 Error al cargar módulo de asignación de nivel:', error);
            window.ModuleLoader.showModuleError(
                'Error al cargar el sistema de asignación de nivel. Por favor recarga la página.'
            );
        }
    });

    if (!inicializado) return;

    // ============================================
    // 2. FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
    // ============================================
    async function inicializarModulo() {
        console.log('✅ Módulo Asignar Nivel listo');

        // ===================================
        // CONFIGURACIÓN DESDE APP_CONFIG
        // ===================================
        const config = {
            API: window.APP_CONFIG.API,
            ENDPOINTS: window.APP_CONFIG.API.ENDPOINTS,
            STORAGE: window.APP_CONFIG.STORAGE.KEYS,
            VALIDATION: window.APP_CONFIG.VALIDATION,
            UI: window.APP_CONFIG.UI,
            NIVELES: window.APP_CONFIG.NIVELES
        };

        // ===================================
        // ELEMENTOS DEL DOM
        // ===================================
        const elementos = {
            subtitle: document.getElementById('subtitle'),
            contentContainer: document.getElementById('content-container')
        };

        // ===================================
        // ESTADO DE LA APLICACIÓN
        // ===================================
        const estado = {
            step: 'choice', // choice, evaluation, manual, results
            currentQuestion: 0,
            answers: [],
            selectedLevel: '',
            calculatedLevel: '',
            idioma: '',
            correo: '',
            isLoading: false
        };

        // ===================================
        // DATOS DE NIVELES Y PREGUNTAS
        // ===================================

        // Niveles disponibles
        const LEVELS = config.NIVELES.DISPONIBLES || [
            { id: "A1", name: "Principiante", description: "Empezando desde cero" },
            { id: "A2", name: "Elemental", description: "Conocimientos básicos" },
            { id: "B1", name: "Intermedio", description: "Conversación cotidiana" },
            { id: "B2", name: "Intermedio Alto", description: "Fluidez en la mayoría de situaciones" },
            { id: "C1", name: "Avanzado", description: "Dominio del idioma" },
            { id: "C2", name: "Maestría", description: "Nivel nativo" }
        ];

        // Preguntas para cada idioma
        const EVALUATION_QUESTIONS = {
            'inglés': [
                { question: "Complete: 'I ___ to the store yesterday'", options: ["go", "goes", "went", "going"], correct: 2 },
                { question: "Which sentence is correct?", options: ["She don't like pizza", "She doesn't likes pizza", "She doesn't like pizza", "She not like pizza"], correct: 2 },
                { question: "What does 'although' mean?", options: ["because", "but/however", "therefore", "also"], correct: 1 },
                { question: "Choose the correct form: 'If I ___ rich, I would travel the world'", options: ["am", "was", "were", "be"], correct: 2 },
                { question: "What is a synonym for 'ubiquitous'?", options: ["rare", "everywhere", "beautiful", "difficult"], correct: 1 },
                { question: "Complete the idiom: 'It's raining cats and ___'", options: ["dogs", "birds", "fish", "mice"], correct: 0 },
                { question: "Which is the correct passive form: 'They built the house in 1990'", options: ["The house built in 1990", "The house was built in 1990", "The house is built in 1990", "The house has built in 1990"], correct: 1 },
                { question: "What does 'serendipity' mean?", options: ["A happy accident", "A sad moment", "A difficult situation", "A planned event"], correct: 0 },
                { question: "Identify the correct tag question: 'She can swim, ___?'", options: ["can she", "can't she", "does she", "doesn't she"], correct: 1 },
                { question: "Choose the correct phrasal verb: 'Please ___ the lights when you leave'", options: ["turn off", "turn on", "turn up", "turn down"], correct: 0 }
            ],
            'francés': [
                { question: "Comment dit-on 'Bonjour' en français?", options: ["Bonjour", "Bonsoir", "Merci", "Au revoir"], correct: 0 },
                { question: "Quelle est la forme correcte: 'Je ___ français'", options: ["est", "suis", "es", "sont"], correct: 1 },
                { question: "Complétez: 'Nous ___ à Paris l'année dernière'", options: ["allons", "sommes allés", "irons", "allions"], correct: 1 },
                { question: "Quelle phrase est correcte?", options: ["Je vais au cinéma", "Je va au cinéma", "Je aller au cinéma", "Je vais cinéma"], correct: 0 },
                { question: "Que signifie 'bien que'?", options: ["parce que", "mais", "donc", "aussi"], correct: 1 },
                { question: "Choisissez la forme correcte: 'Si j'___ riche, je voyagerais dans le monde entier'", options: ["étais", "serais", "sois", "suis"], correct: 0 },
                { question: "Quel est un synonyme de 'ubiquitaire'?", options: ["rare", "partout", "beau", "difficile"], correct: 1 },
                { question: "Complétez l'expression: 'Il pleut des cordes et des ___'", options: ["chiens", "chats", "poissons", "souris"], correct: 1 },
                { question: "Quelle est la forme passive: 'Ils ont construit la maison en 1990'", options: ["La maison a été construite en 1990", "La maison est construite en 1990", "La maison a construit en 1990", "La maison était construite en 1990"], correct: 0 },
                { question: "Que signifie 'sérendipité'?", options: ["Une heureuse découverte", "Un moment triste", "Une situation difficile", "Un événement planifié"], correct: 0 }
            ],
            'alemán': [
                { question: "¿Cómo se dice 'Buenos días' en alemán?", options: ["Guten Morgen", "Gute Nacht", "Guten Abend", "Auf Wiedersehen"], correct: 0 },
                { question: "Completa: 'Ich ___ seit zwei Jahren Deutsch.'", options: ["lerne", "lernen", "gelernt", "lernt"], correct: 0 },
                { question: "Selecciona la opción correcta: 'Wenn ich Zeit habe, ___ ich spazieren.'", options: ["gehe", "ging", "gegangen", "gehen"], correct: 0 },
                { question: "¿Cuál es un sinónimo de 'verbessern'?", options: ["verschlechtern", "optimieren", "vergessen", "ignorieren"], correct: 1 },
                { question: "Completa la pregunta: 'Hast du den Bericht ___?'", options: ["lesen", "gelesen", "liest", "gelesene"], correct: 1 },
                { question: "Identifica la voz pasiva correcta.", options: ["Das Haus wurde 1990 gebaut.", "1990 baut das Haus.", "Das Haus ist bauen 1990.", "Das Haus hat gebaut."], correct: 0 },
                { question: "Completa: 'Wir freuen uns ___ Ihren Besuch.'", options: ["auf", "für", "zu", "an"], correct: 0 },
                { question: "¿Qué significa 'obwohl'?", options: ["porque", "aunque", "después", "durante"], correct: 1 },
                { question: "Selecciona la frase con Konjunktiv II correcta.", options: ["Wenn ich Geld habe, reise ich.", "Wenn ich mehr Zeit hätte, würde ich reisen.", "Wenn ich mehr Zeit habe, würde ich reisen.", "Wenn ich mehr Zeit hätte, werde ich reisen."], correct: 1 },
                { question: "Completa: 'Kaum war er angekommen, ___ es zu regnen.'", options: ["begann", "beginnt", "hat begonnen", "wird beginnen"], correct: 0 }
            ],
            'italiano': [
                { question: "¿Cómo se dice 'Buenas tardes' en italiano?", options: ["Buon pomeriggio", "Buona sera", "Buona notte", "Buongiorno"], correct: 0 },
                { question: "Completa: 'Sto ___ italiano da tre mesi.'", options: ["studiando", "studiare", "studio", "studiato"], correct: 0 },
                { question: "Selecciona la opción correcta: 'Se avessi tiempo, ___ al mare.'", options: ["andrò", "andrei", "andavo", "andato"], correct: 1 },
                { question: "¿Cuál es un sinónimo de 'migliorare'?", options: ["peggiorare", "perfezionare", "dimenticare", "ignorare"], correct: 1 },
                { question: "Completa la pregunta: 'Hai ___ il documento?'", options: ["leggere", "letto", "leggendo", "leggi"], correct: 1 },
                { question: "Identifica la voz pasiva correcta.", options: ["Il consiglio approva il progetto.", "Il progetto è stato approvato dal consiglio.", "Il progetto approva il consiglio.", "Il progetto approvò il consiglio."], correct: 1 },
                { question: "Completa: 'Nonostante ___ stanco, ha continuato a lavorare.'", options: ["sia", "fu", "fosse", "è"], correct: 2 },
                { question: "¿Qué significa 'benché'?", options: ["porque", "aunque", "siempre que", "después"], correct: 1 },
                { question: "Selecciona la frase condicional formal correcta.", options: ["Qualora avesse bisogno, ci contatti.", "Qualora ha bisogno, ci contatta.", "Qualora avrà bisogno, contattaci.", "Qualora aveva bisogno, contattava."], correct: 0 },
                { question: "Completa: 'Appena ebbi chiuso la porta, ___ il telefono.'", options: ["suonava", "suonò", "suonerà", "suonato"], correct: 1 }
            ]
        };

        // ===================================
        // FUNCIONES AUXILIARES
        // ===================================
        
        function mostrarCargando(mostrar = true) {
            estado.isLoading = mostrar;
        }

        // ===================================
        // FUNCIONES PRINCIPALES
        // ===================================

        /**
         * Carga los datos del usuario desde localStorage
         */
        function cargarDatosUsuario() {
            estado.idioma = window.Utils.getFromStorage(config.STORAGE.IDIOMA) || '';
            estado.correo = window.Utils.getFromStorage(config.STORAGE.CORREO);

            if (!estado.correo) {
                window.toastManager.error('No se encontraron datos de usuario. Redirigiendo al registro...');
                setTimeout(() => {
                    window.location.href = config.UI.RUTAS.REGISTRO;
                }, 2000);
                return false;
            }
            return true;
        }

        /**
         * Renderiza la interfaz según el paso actual
         */
        function render() {
            if (!elementos.subtitle || !elementos.contentContainer) {
                console.error('❌ Elementos del DOM no encontrados');
                return;
            }

            switch (estado.step) {
                case 'choice':
                    renderChoice();
                    break;
                case 'evaluation':
                    renderEvaluation();
                    break;
                case 'results':
                    renderResults();
                    break;
                case 'manual':
                    renderManual();
                    break;
            }
        }

        /**
         * Renderiza la pantalla de elección de método
         */
        function renderChoice() {
            elementos.subtitle.textContent = `Asigna tu nivel ${estado.idioma ? 'de ' + estado.idioma : ''}`;
            elementos.contentContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 animate-fade-in">
                    <div class="mb-6 text-center">
                        <h2 class="text-3xl font-bold dark:text-white">Asigna tu Nivel</h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-300">
                            Elige cómo quieres determinar tu nivel ${estado.idioma ? 'de ' + estado.idioma : ''}
                        </p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <button id="start-evaluation" class="group flex flex-col items-center gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                                <i class="fas fa-brain text-3xl"></i>
                            </div>
                            <div class="text-center">
                                <h3 class="text-lg font-semibold dark:text-white">Realizar Evaluación</h3>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Responde 10 preguntas para determinar tu nivel
                                </p>
                            </div>
                        </button>

                        <button id="manual-selection" class="group flex flex-col items-center gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300">
                            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                <i class="fas fa-book text-3xl"></i>
                            </div>
                            <div class="text-center">
                                <h3 class="text-lg font-semibold dark:text-white">Seleccionar Nivel</h3>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Ya conozco mi nivel y quiero elegirlo manualmente
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            `;

            // Event listeners
            document.getElementById('start-evaluation').addEventListener('click', iniciarEvaluacion);
            document.getElementById('manual-selection').addEventListener('click', iniciarSeleccionManual);
        }

        /**
         * Inicia el proceso de evaluación
         */
        function iniciarEvaluacion() {
            const supportedLanguages = ['inglés', 'francés', 'alemán', 'italiano'];
            if (!supportedLanguages.includes(estado.idioma.toLowerCase())) {
                window.toastManager.info(`Examen para otros idiomas en desarrollo. Selecciona tu nivel manualmente.`);
                return;
            }
            
            estado.step = 'evaluation';
            estado.currentQuestion = 0;
            estado.answers = [];
            render();
        }

        /**
         * Inicia la selección manual de nivel
         */
        function iniciarSeleccionManual() {
            estado.step = 'manual';
            render();
        }

        /**
         * Renderiza la pantalla de evaluación
         */
        function renderEvaluation() {
            const questions = EVALUATION_QUESTIONS[estado.idioma.toLowerCase()];
            const question = questions[estado.currentQuestion];
            const progress = ((estado.currentQuestion + 1) / questions.length) * 100;

            elementos.subtitle.textContent = 'Evaluación de nivel';
            elementos.contentContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 animate-fade-in">
                    <div class="mb-6">
                        <div class="mb-2 flex justify-between text-sm">
                            <span class="text-gray-600 dark:text-gray-300">
                                Pregunta ${estado.currentQuestion + 1} de ${questions.length}
                            </span>
                            <span class="font-medium dark:text-white">${Math.round(progress)}%</span>
                        </div>
                        <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div class="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <h2 class="mb-6 text-2xl font-bold dark:text-white">${question.question}</h2>

                    <div class="grid gap-3">
                        ${question.options.map((option, index) => `
                            <button class="answer-btn w-full text-left rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 dark:text-white" data-index="${index}">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            // Event listeners para respuestas
            document.querySelectorAll('.answer-btn').forEach(btn => {
                btn.addEventListener('click', manejarRespuesta);
            });
        }

        /**
         * Maneja la selección de una respuesta
         */
        function manejarRespuesta(e) {
            const answerIndex = parseInt(e.currentTarget.dataset.index);
            estado.answers.push(answerIndex);

            const questions = EVALUATION_QUESTIONS[estado.idioma.toLowerCase()];
            
            if (estado.currentQuestion < questions.length - 1) {
                estado.currentQuestion++;
                render();
            } else {
                calcularNivelFinal();
            }
        }

        /**
         * Calcula el nivel final basado en las respuestas
         */
        function calcularNivelFinal() {
            const questions = EVALUATION_QUESTIONS[estado.idioma.toLowerCase()];
            const correctAnswers = estado.answers.filter((a, i) => a === questions[i].correct).length;
            const percentage = (correctAnswers / questions.length) * 100;

            // Lógica de asignación de nivel
            if (percentage >= 90) estado.calculatedLevel = "C2";
            else if (percentage >= 75) estado.calculatedLevel = "C1";
            else if (percentage >= 60) estado.calculatedLevel = "B2";
            else if (percentage >= 45) estado.calculatedLevel = "B1";
            else if (percentage >= 30) estado.calculatedLevel = "A2";
            else estado.calculatedLevel = "A1";

            estado.step = 'results';
            render();
        }

        /**
         * Renderiza los resultados de la evaluación
         */
        function renderResults() {
            const questions = EVALUATION_QUESTIONS[estado.idioma.toLowerCase()];
            const correctAnswers = estado.answers.filter((a, i) => a === questions[i].correct).length;
            const percentage = Math.round((correctAnswers / questions.length) * 100);
            const levelInfo = LEVELS.find(l => l.id === estado.calculatedLevel);

            elementos.subtitle.textContent = '¡Evaluación completada!';
            elementos.contentContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transition-colors duration-300 animate-fade-in">
                    <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <i class="fas fa-check-circle text-4xl text-green-600 dark:text-green-400"></i>
                    </div>
                    <h1 class="text-3xl font-bold mb-2 dark:text-white">Evaluación Completada</h1>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">
                        Has respondido correctamente ${correctAnswers} de ${questions.length} preguntas
                    </p>

                    <div class="mb-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 p-6 border-2 border-purple-200 dark:border-purple-800">
                        <p class="text-sm font-medium text-purple-600 dark:text-purple-400">Tu nivel recomendado es</p>
                        <h2 class="mt-2 text-4xl font-bold text-purple-600 dark:text-purple-400">${levelInfo.id}</h2>
                        <p class="text-lg font-medium text-gray-900 dark:text-white">${levelInfo.name}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${levelInfo.description}</p>
                        <div class="mt-4">
                            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${percentage}%</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300">Precisión</div>
                        </div>
                    </div>

                    <button id="confirm-level" class="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        Confirmar y Continuar
                    </button>
                </div>
            `;

            document.getElementById('confirm-level').addEventListener('click', () => actualizarNivel(estado.calculatedLevel));
        }

        /**
         * Renderiza la selección manual de nivel
         */
        function renderManual() {
            elementos.subtitle.textContent = 'Selecciona tu nivel';
            elementos.contentContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 animate-fade-in">
                    <h2 class="text-2xl font-bold text-center mb-4 dark:text-white">Selecciona tu Nivel</h2>
                    <div class="grid gap-3 mb-6">
                        ${LEVELS.map(level => `
                            <button class="level-btn w-full text-left rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 transition-all hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:text-white" data-level="${level.id}">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <span class="text-lg font-bold mr-2">${level.id}</span>
                                        <span class="font-semibold">${level.name}</span>
                                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${level.description}</p>
                                    </div>
                                    <i class="fas fa-circle text-gray-300 dark:text-gray-600 check-icon"></i>
                                </div>
                            </button>
                        `).join('')}
                    </div>

                    <button id="confirm-manual" disabled class="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        Confirmar Nivel
                    </button>

                    <div class="mt-4 text-center">
                        <button id="back-btn" class="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                            Volver atrás
                        </button>
                    </div>
                </div>
            `;

            const confirmBtn = document.getElementById('confirm-manual');
            
            // Event listeners para selección de nivel
            document.querySelectorAll('.level-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const level = e.currentTarget.dataset.level;
                    estado.selectedLevel = level;

                    // Actualizar UI
                    document.querySelectorAll('.level-btn').forEach(b => {
                        b.classList.remove('border-purple-500', 'dark:border-purple-400', 'bg-purple-50', 'dark:bg-purple-900/20');
                        b.querySelector('.check-icon').className = 'fas fa-circle text-gray-300 dark:text-gray-600 check-icon';
                    });
                    e.currentTarget.classList.add('border-purple-500', 'dark:border-purple-400', 'bg-purple-50', 'dark:bg-purple-900/20');
                    e.currentTarget.querySelector('.check-icon').className = 'fas fa-check-circle text-purple-600 dark:text-purple-400 check-icon';

                    confirmBtn.disabled = false;
                });
            });

            confirmBtn.addEventListener('click', () => actualizarNivel(estado.selectedLevel));
            document.getElementById('back-btn').addEventListener('click', () => {
                estado.step = 'choice';
                render();
            });
        }

        /**
         * ✅ VERSIÓN CON DEBUG: Actualiza el nivel del usuario en el servidor
         */
        async function actualizarNivel(nivel) {
            if (estado.isLoading) return;

            mostrarCargando(true);
            const confirmBtn = document.querySelector('button[id^="confirm"]');
            
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Asignando nivel...';
            }

            try {
                // ✅ DEBUG: Mostrar datos que se enviarán
                const datosAEnviar = {
                    correo: estado.correo,
                    nivel: nivel,
                    idioma: estado.idioma
                };

                console.log('📤 Datos a enviar:', datosAEnviar);
                console.log('📋 Estado completo:', estado);
                console.log('💾 LocalStorage actual:', {
                    correo: localStorage.getItem(config.STORAGE.CORREO),
                    idioma: localStorage.getItem(config.STORAGE.IDIOMA),
                    idioma_aprendizaje: localStorage.getItem('idioma_aprendizaje')
                });

                // ✅ VALIDAR DATOS ANTES DE ENVIAR
                const errores = [];
                
                if (!estado.correo) {
                    errores.push({ campo: 'correo', mensaje: 'Correo está vacío' });
                }
                
                if (!estado.idioma) {
                    errores.push({ campo: 'idioma', mensaje: 'Idioma está vacío' });
                } else {
                    // Verificar formato del idioma
                    const idiomasPermitidos = ['Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Japonés', 'Coreano', 'Chino'];
                    if (!idiomasPermitidos.includes(estado.idioma)) {
                        errores.push({ 
                            campo: 'idioma', 
                            mensaje: `Idioma "${estado.idioma}" no está en la lista permitida: ${idiomasPermitidos.join(', ')}` 
                        });
                    }
                }

                if (!nivel) {
                    errores.push({ campo: 'nivel', mensaje: 'Nivel está vacío' });
                } else {
                    const nivelesPermitidos = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                    if (!nivelesPermitidos.includes(nivel)) {
                        errores.push({ 
                            campo: 'nivel', 
                            mensaje: `Nivel "${nivel}" no válido. Debe ser: ${nivelesPermitidos.join(', ')}` 
                        });
                    }
                }

                if (errores.length > 0) {
                    console.log('❌ Errores de validación:', errores);
                    throw new Error(`Errores de validación: ${JSON.stringify(errores)}`);
                }

                // ✅ USAR apiClient CON ENDPOINTS DE APP_CONFIG
                const endpoint = config.ENDPOINTS.AUTH.ACTUALIZAR_NIVEL;
                console.log('🌐 Enviando a endpoint:', endpoint);
                
                const response = await window.apiClient.patch(endpoint, datosAEnviar);

                console.log('📨 Respuesta del servidor:', response);

                if (response.success) {
                    window.toastManager.success(`✅ Nivel ${nivel} asignado correctamente`);
                    
                    // ✅ LIMPIAR LOCALSTORAGE (ahora sí, después de asignar nivel exitosamente)
                    window.Utils.removeFromStorage(config.STORAGE.CORREO);
                    window.Utils.removeFromStorage(config.STORAGE.IDIOMA);

                    // Redirigir a login
                    setTimeout(() => {
                        window.location.href = config.UI.RUTAS.LOGIN;
                    }, 1500);
                } else {
                    throw new Error(response.error || 'Error al actualizar nivel');
                }

            } catch (error) {
                console.error('💥 Error al actualizar nivel:', error);
                window.toastManager.error(error.message);
                
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Confirmar y Continuar';
                }
            } finally {
                mostrarCargando(false);
            }
        }

        // ===================================
        // INICIALIZACIÓN
        // ===================================
        
        function inicializar() {
            if (!cargarDatosUsuario()) {
                return;
            }

            render();

            if (window.APP_CONFIG.ENV.DEBUG) {
                console.log('🔧 Asignar Nivel configurado:', { config, estado, LEVELS });
            }
        }

        // Ejecutar inicialización
        inicializar();
    }

})();