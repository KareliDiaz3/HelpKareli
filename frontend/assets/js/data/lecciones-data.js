/* ============================================
   SPEAKLEXI - BANCO DE LECCIONES INTERACTIVAS
   Archivo: assets/js/data/lecciones-data.js
   Descripción: Preguntas organizadas por idioma y nivel.
   ============================================ */

(function initializeLessonsData() {
    const LESSONS_DATA = {
    "ingles": {
        "A1": {
            "title": "Inglés A1 - Fundamentos cotidianos",
            "description": "Practica vocabulario básico, saludos y frases esenciales para empezar a comunicarte.",
            "questions": [
                {
                    "prompt": "¿Cómo se dice 'hola' en inglés?",
                    "options": [
                        "Hello",
                        "Bye",
                        "Thanks",
                        "Please"
                    ],
                    "answer": 0,
                    "explanation": "'Hello' es la forma más común de saludar en inglés.",
                    "media": {
                        "type": "audio",
                        "label": "Escucha la pronunciación",
                        "src": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_9f3c36a5d4.mp3?filename=hello-111085.mp3"
                    }
                },
                {
                    "prompt": "Selecciona la traducción correcta de 'gracias'.",
                    "options": [
                        "Sorry",
                        "Goodbye",
                        "Thank you",
                        "Excuse me"
                    ],
                    "answer": 2,
                    "explanation": "'Thank you' significa 'gracias'."
                },
                {
                    "prompt": "¿Cuál es el plural de 'book'?",
                    "options": [
                        "Books",
                        "Bookes",
                        "Bookss",
                        "Bookz"
                    ],
                    "answer": 0,
                    "explanation": "La mayoría de los plurales regulares se forman agregando -s."
                },
                {
                    "prompt": "Completa: 'I ___ Maria'",
                    "options": [
                        "am",
                        "is",
                        "are",
                        "be"
                    ],
                    "answer": 0,
                    "explanation": "Con 'I' siempre usamos el verbo 'am'."
                },
                {
                    "prompt": "¿Cómo se pregunta '¿Cómo estás?'?",
                    "options": [
                        "How old are you?",
                        "Where are you?",
                        "How are you?",
                        "Who are you?"
                    ],
                    "answer": 2,
                    "explanation": "'How are you?' es la pregunta estándar para saber cómo está alguien."
                },
                {
                    "prompt": "Selecciona el color 'blue'.",
                    "options": [
                        "Rojo",
                        "Verde",
                        "Azul",
                        "Amarillo"
                    ],
                    "answer": 2,
                    "explanation": "'Blue' significa azul."
                },
                {
                    "prompt": "Elige la opción correcta: 'She ___ from Mexico.'",
                    "options": [
                        "am",
                        "are",
                        "is",
                        "be"
                    ],
                    "answer": 2,
                    "explanation": "Con 'She' usamos 'is'."
                },
                {
                    "prompt": "¿Qué palabra significa 'familia'?",
                    "options": [
                        "family",
                        "friend",
                        "food",
                        "flower"
                    ],
                    "answer": 0,
                    "explanation": "'Family' se traduce como familia."
                },
                {
                    "prompt": "Completa la frase: 'This is ___ apple'.",
                    "options": [
                        "a",
                        "an",
                        "the",
                        "one"
                    ],
                    "answer": 1,
                    "explanation": "Se usa 'an' antes de sonidos vocálicos como 'apple'."
                },
                {
                    "prompt": "Selecciona la opción que significa 'por favor'.",
                    "options": [
                        "Please",
                        "Thanks",
                        "Hello",
                        "Happy"
                    ],
                    "answer": 0,
                    "explanation": "'Please' es la forma cortés de pedir algo."
                }
            ]
        },
        "A2": {
            "title": "Inglés A2 - Rutinas y descripciones",
            "description": "Construye frases sobre tus actividades diarias y describe personas y lugares.",
            "questions": [
                {
                    "prompt": "Completa: 'We ___ breakfast at 8 a.m.'",
                    "options": [
                        "has",
                        "having",
                        "have",
                        "had"
                    ],
                    "answer": 2,
                    "explanation": "Con 'we' el presente simple usa 'have'."
                },
                {
                    "prompt": "Selecciona el adverbio de frecuencia: 'I ___ go to the gym.'",
                    "options": [
                        "never",
                        "strong",
                        "music",
                        "slow"
                    ],
                    "answer": 0,
                    "explanation": "'Never' indica frecuencia."
                },
                {
                    "prompt": "Elige la opción correcta: 'There ___ a park near my house.'",
                    "options": [
                        "is",
                        "are",
                        "be",
                        "am"
                    ],
                    "answer": 0,
                    "explanation": "Para singular usamos 'there is'."
                },
                {
                    "prompt": "¿Cómo se dice 'ella está cocinando'?",
                    "options": [
                        "She cooks",
                        "She is cook",
                        "She is cooking",
                        "She cooking"
                    ],
                    "answer": 2,
                    "explanation": "El presente continuo usa 'is' + verbo en -ing."
                },
                {
                    "prompt": "Selecciona el comparativo correcto de 'tall'.",
                    "options": [
                        "taller",
                        "more tall",
                        "most tall",
                        "tallest"
                    ],
                    "answer": 0,
                    "explanation": "El comparativo regular de 'tall' es 'taller'."
                },
                {
                    "prompt": "Completa: 'Do you want ___ tea?'",
                    "options": [
                        "any",
                        "some",
                        "many",
                        "few"
                    ],
                    "answer": 1,
                    "explanation": "'Some' se usa en preguntas cuando esperamos respuesta afirmativa."
                },
                {
                    "prompt": "¿Cuál es la pregunta correcta para obtener información personal?",
                    "options": [
                        "Where you live?",
                        "Where do you live?",
                        "Where are you live?",
                        "Where live you?"
                    ],
                    "answer": 1,
                    "explanation": "El orden correcto es auxiliar + sujeto + verbo."
                },
                {
                    "prompt": "Selecciona la traducción de 'Estoy aprendiendo inglés'.",
                    "options": [
                        "I learning English",
                        "I'm learn English",
                        "I'm learning English",
                        "I am to learn English"
                    ],
                    "answer": 2,
                    "explanation": "El presente continuo se forma con to be + verbo en -ing."
                },
                {
                    "prompt": "Completa: 'She has ___ hair.'",
                    "options": [
                        "long brown",
                        "brown long",
                        "a brown long",
                        "longly brown"
                    ],
                    "answer": 0,
                    "explanation": "En inglés los adjetivos de color van después del de tamaño."
                },
                {
                    "prompt": "Elige la opción correcta para hablar del clima: 'It is ___ today.'",
                    "options": [
                        "raining",
                        "rain",
                        "rains",
                        "rainy"
                    ],
                    "answer": 3,
                    "explanation": "'Rainy' es el adjetivo que describe el clima."
                }
            ]
        },
        "B1": {
            "title": "Inglés B1 - Situaciones cotidianas",
            "description": "Comprende y responde en contextos como viajes, estudios y trabajo.",
            "questions": [
                {
                    "prompt": "Selecciona el phrasal verb correcto: 'Can you ___ the meeting to next week?'",
                    "options": [
                        "put off",
                        "put out",
                        "put on",
                        "put up"
                    ],
                    "answer": 0,
                    "explanation": "'Put off' significa posponer."
                },
                {
                    "prompt": "Completa: 'If it ___ tomorrow, we will stay home.'",
                    "options": [
                        "rains",
                        "rain",
                        "raining",
                        "will rain"
                    ],
                    "answer": 0,
                    "explanation": "En la primera condicional usamos presente simple en la cláusula if."
                },
                {
                    "prompt": "Elige la opción correcta: 'I have been working here ___ 2019.'",
                    "options": [
                        "for",
                        "since",
                        "during",
                        "from"
                    ],
                    "answer": 1,
                    "explanation": "'Since' indica el punto de inicio."
                },
                {
                    "prompt": "¿Cuál es el sinónimo de 'improve'?",
                    "options": [
                        "worsen",
                        "enhance",
                        "forget",
                        "ignore"
                    ],
                    "answer": 1,
                    "explanation": "'Enhance' y 'improve' significan mejorar."
                },
                {
                    "prompt": "Selecciona la pregunta adecuada en pasado.",
                    "options": [
                        "Did you went?",
                        "Did you go?",
                        "Went you?",
                        "Have you went?"
                    ],
                    "answer": 1,
                    "explanation": "Después de 'Did' usamos el verbo base."
                },
                {
                    "prompt": "Completa: 'She was late because she ___ miss the bus.'",
                    "options": [
                        "decided",
                        "needed",
                        "managed",
                        "did"
                    ],
                    "answer": 3,
                    "explanation": "'Did' completa la expresión enfática 'she did miss the bus'."
                },
                {
                    "prompt": "Elige la opción correcta: 'I'm looking forward ___ you soon.'",
                    "options": [
                        "see",
                        "seeing",
                        "to see",
                        "saw"
                    ],
                    "answer": 1,
                    "explanation": "Después de 'looking forward' usamos verbo en -ing."
                },
                {
                    "prompt": "Selecciona la mejor respuesta para 'Could you give me a hand?'",
                    "options": [
                        "No, I could not.",
                        "Hands are important.",
                        "Sure, what do you need?",
                        "Give me yours first."
                    ],
                    "answer": 2,
                    "explanation": "La respuesta adecuada ofrece ayuda."
                },
                {
                    "prompt": "Completa: 'Despite ___ tired, he finished the report.'",
                    "options": [
                        "be",
                        "being",
                        "been",
                        "to be"
                    ],
                    "answer": 1,
                    "explanation": "Después de 'despite' usamos un gerundio."
                },
                {
                    "prompt": "¿Qué expresión significa 'hacer las paces'?",
                    "options": [
                        "make up",
                        "make out",
                        "make off",
                        "make in"
                    ],
                    "answer": 0,
                    "explanation": "'Make up' en este contexto significa reconciliarse."
                }
            ]
        },
        "B2": {
            "title": "Inglés B2 - Expresión avanzada",
            "description": "Analiza textos extensos, defiende opiniones y usa estructuras complejas.",
            "questions": [
                {
                    "prompt": "Selecciona la opción que mejor completa: 'Not only ___ the presentation, but she also answered every question.'",
                    "options": [
                        "did she prepare",
                        "she prepared",
                        "prepared she",
                        "did prepare she"
                    ],
                    "answer": 0,
                    "explanation": "Después de 'Not only' invertimos sujeto y auxiliar."
                },
                {
                    "prompt": "Elige la expresión correcta: 'By the time we arrived, the movie ___'",
                    "options": [
                        "has started",
                        "had started",
                        "was starting",
                        "would start"
                    ],
                    "answer": 1,
                    "explanation": "Usamos past perfect para indicar una acción terminada antes de otra en pasado."
                },
                {
                    "prompt": "Completa: 'Should you need any assistance, please ___ free to contact us.'",
                    "options": [
                        "feel",
                        "felt",
                        "feeling",
                        "to feel"
                    ],
                    "answer": 0,
                    "explanation": "Expresión fija 'feel free'."
                },
                {
                    "prompt": "Selecciona el sinónimo de 'reluctant'.",
                    "options": [
                        "eager",
                        "unwilling",
                        "delighted",
                        "certain"
                    ],
                    "answer": 1,
                    "explanation": "'Reluctant' significa poco dispuesto."
                },
                {
                    "prompt": "Identifica la voz pasiva correcta.",
                    "options": [
                        "The committee choosing the winner.",
                        "The committee choose the winner.",
                        "The winner was chosen by the committee.",
                        "The winner chosen by the committee."
                    ],
                    "answer": 2,
                    "explanation": "Forma correcta en pasado pasivo."
                },
                {
                    "prompt": "Completa: 'Hardly had I closed the door ___ the phone rang.'",
                    "options": [
                        "than",
                        "when",
                        "that",
                        "until"
                    ],
                    "answer": 1,
                    "explanation": "Estructura fija 'Hardly... when'."
                },
                {
                    "prompt": "¿Qué opción expresa obligación débil?",
                    "options": [
                        "must",
                        "have to",
                        "should",
                        "need"
                    ],
                    "answer": 2,
                    "explanation": "'Should' expresa recomendación/obligación suave."
                },
                {
                    "prompt": "Selecciona la expresión idiomática equivalente a 'keep someone updated'.",
                    "options": [
                        "keep someone posted",
                        "keep someone grounded",
                        "keep someone aside",
                        "keep someone on"
                    ],
                    "answer": 0,
                    "explanation": "'Keep someone posted' significa informar."
                },
                {
                    "prompt": "Completa: 'The solution, ___ seemed obvious at first, turned out to be complex.'",
                    "options": [
                        "which",
                        "that",
                        "who",
                        "where"
                    ],
                    "answer": 0,
                    "explanation": "'Which' introduce cláusula relativa no restrictiva."
                },
                {
                    "prompt": "Elige la opción correcta para un estilo formal de carta.",
                    "options": [
                        "Hey there!",
                        "What's up?",
                        "To whom it may concern,",
                        "Hi friend!"
                    ],
                    "answer": 2,
                    "explanation": "Saludo formal estándar."
                }
            ]
        },
        "C1": {
            "title": "Inglés C1 - Matices y argumentación",
            "description": "Domina expresiones idiomáticas y argumenta con precisión en contextos profesionales.",
            "questions": [
                {
                    "prompt": "Selecciona la expresión que indica que algo se adelantó.",
                    "options": [
                        "brought forward",
                        "brought about",
                        "brought around",
                        "brought up"
                    ],
                    "answer": 0,
                    "explanation": "'Bring forward' significa adelantar."
                },
                {
                    "prompt": "Completa: 'It's high time we ___ action.'",
                    "options": [
                        "take",
                        "took",
                        "taken",
                        "are taking"
                    ],
                    "answer": 1,
                    "explanation": "Después de 'It's high time' usamos pasado simple para urgencia."
                },
                {
                    "prompt": "Identifica el término que significa 'evidente'.",
                    "options": [
                        "pellucid",
                        "tenuous",
                        "esoteric",
                        "abstruse"
                    ],
                    "answer": 0,
                    "explanation": "'Pellucid' significa claro o evidente."
                },
                {
                    "prompt": "Elige la opción correcta: 'No sooner had they launched the product ___ sales skyrocketed.'",
                    "options": [
                        "that",
                        "when",
                        "than",
                        "then"
                    ],
                    "answer": 2,
                    "explanation": "Expresión fija 'No sooner... than'."
                },
                {
                    "prompt": "Selecciona el adjetivo que describe a alguien digno de confianza.",
                    "options": [
                        "unscrupulous",
                        "aboveboard",
                        "cagey",
                        "duplicitous"
                    ],
                    "answer": 1,
                    "explanation": "'Aboveboard' significa honesto."
                },
                {
                    "prompt": "Completa: 'He spoke with such ___ that the audience was captivated.'",
                    "options": [
                        "aplomb",
                        "malaise",
                        "ennui",
                        "torpor"
                    ],
                    "answer": 0,
                    "explanation": "'Aplomb' significa seguridad y confianza."
                },
                {
                    "prompt": "¿Cuál es la mejor paráfrasis de 'to shed light on'?",
                    "options": [
                        "to obscure",
                        "to clarify",
                        "to reject",
                        "to postpone"
                    ],
                    "answer": 1,
                    "explanation": "La expresión significa clarificar."
                },
                {
                    "prompt": "Selecciona la opción que contiene un condicional mixto correctamente usado.",
                    "options": [
                        "If I knew her number, I would have called her yesterday.",
                        "If I had known her number, I would call her now.",
                        "If I know her number, I would call her yesterday.",
                        "If I have known her number, I would call her now."
                    ],
                    "answer": 1,
                    "explanation": "Mezcla pasado perfecto con condicional presente para consecuencias actuales."
                },
                {
                    "prompt": "Completa: 'Her remarks were so ___ that no one dared to interrupt.'",
                    "options": [
                        "trenchant",
                        "jejune",
                        "banal",
                        "fatuous"
                    ],
                    "answer": 0,
                    "explanation": "'Trenchant' significa incisivo."
                },
                {
                    "prompt": "Selecciona la expresión correcta para hablar de una situación difícil.",
                    "options": [
                        "a walk in the park",
                        "a tough row to hoe",
                        "over the moon",
                        "on cloud nine"
                    ],
                    "answer": 1,
                    "explanation": "'A tough row to hoe' indica dificultad."
                }
            ]
        },
        "C2": {
            "title": "Inglés C2 - Dominio total del idioma",
            "description": "Perfecciona matices estilísticos, referencias culturales y lenguaje especializado.",
            "questions": [
                {
                    "prompt": "Selecciona la palabra que describe un argumento cuidadosamente construido.",
                    "options": [
                        "ramshackle",
                        "cogent",
                        "languid",
                        "jejune"
                    ],
                    "answer": 1,
                    "explanation": "'Cogent' significa persuasivo y bien estructurado."
                },
                {
                    "prompt": "Completa: 'The professor's discourse was replete ___ classical allusions.'",
                    "options": [
                        "with",
                        "by",
                        "from",
                        "of"
                    ],
                    "answer": 0,
                    "explanation": "La preposición adecuada es 'with'."
                },
                {
                    "prompt": "Elige la expresión correcta para referirse a sabiduría convencional.",
                    "options": [
                        "zeitgeist",
                        "locus classicus",
                        "received wisdom",
                        "fait accompli"
                    ],
                    "answer": 2,
                    "explanation": "'Received wisdom' equivale a conocimiento aceptado."
                },
                {
                    "prompt": "¿Cuál de las siguientes oraciones emplea correctamente un participio absoluto?",
                    "options": [
                        "Weather permitting, the ceremony will proceed outdoors.",
                        "Permitting weather, the ceremony will proceed outdoors.",
                        "The ceremony, weather permitting will proceed outdoors.",
                        "Weather permitting the ceremony will proceed outdoors"
                    ],
                    "answer": 0,
                    "explanation": "Estructura tradicional: participio + coma + oración principal."
                },
                {
                    "prompt": "Completa: 'Far from being merely ornamental, the metaphor ___ the narrative arc.'",
                    "options": [
                        "undergirds",
                        "undermines",
                        "obfuscates",
                        "belittles"
                    ],
                    "answer": 0,
                    "explanation": "'Undergird' significa sustentar."
                },
                {
                    "prompt": "Selecciona el término más adecuado para 'un error por descuido'.",
                    "options": [
                        "solecism",
                        "panegyric",
                        "homily",
                        "aperçu"
                    ],
                    "answer": 0,
                    "explanation": "'Solecism' refiere a un error gramatical o social."
                },
                {
                    "prompt": "Identifica la locución latina que significa 'con la misma voz'.",
                    "options": [
                        "sub rosa",
                        "ipse dixit",
                        "pari passu",
                        "una voce"
                    ],
                    "answer": 3,
                    "explanation": "'Una voce' = con una sola voz."
                },
                {
                    "prompt": "Completa: 'Were he to acquiesce, the proposal ___ ratified immediately.'",
                    "options": [
                        "will be",
                        "would be",
                        "was",
                        "has been"
                    ],
                    "answer": 1,
                    "explanation": "Condicional formal con inversión usa 'would be'."
                },
                {
                    "prompt": "Selecciona la palabra que expresa extremo detalle.",
                    "options": [
                        "minutiae",
                        "largesse",
                        "pith",
                        "verve"
                    ],
                    "answer": 0,
                    "explanation": "'Minutiae' son detalles minuciosos."
                },
                {
                    "prompt": "Elige la frase que muestra un uso apropiado de 'perfunctory'.",
                    "options": [
                        "She offered a perfunctory apology before leaving the meeting.",
                        "He perfunctory offered apology before leaving the meeting.",
                        "Her apology perfunctory before leaving.",
                        "She apology was perfunctory before leaving."
                    ],
                    "answer": 0,
                    "explanation": "La primera es la estructura correcta."
                }
            ]
        }
    },
    "frances": {
        "A1": {
            "title": "Francés A1 - Bases comunicativas",
            "description": "Aprende saludos, números y frases esenciales para interactuar en situaciones simples.",
            "questions": [
                {
                    "prompt": "Selecciona el saludo formal para decir 'hola' en francés.",
                    "options": [
                        "Bonjour",
                        "Salut",
                        "Merci",
                        "Au revoir"
                    ],
                    "answer": 0,
                    "explanation": "'Bonjour' es el saludo estándar durante el día.",
                    "media": {
                        "type": "audio",
                        "label": "Pronunciación de Bonjour",
                        "src": "https://cdn.pixabay.com/download/audio/2022/03/09/audio_2d0a73e7fb.mp3?filename=bonjour-110757.mp3"
                    }
                },
                {
                    "prompt": "¿Cómo se escribe 'gracias' en francés?",
                    "options": [
                        "Pardon",
                        "Merci",
                        "S'il vous plaît",
                        "Bonsoir"
                    ],
                    "answer": 1,
                    "explanation": "'Merci' se utiliza para agradecer."
                },
                {
                    "prompt": "Completa la frase: 'Je ___ Marie.'",
                    "options": [
                        "suis",
                        "es",
                        "est",
                        "sommes"
                    ],
                    "answer": 0,
                    "explanation": "Con 'Je' usamos la forma 'suis' del verbo être."
                },
                {
                    "prompt": "¿Cuál es la pregunta informal para decir '¿Cómo estás?'?",
                    "options": [
                        "Comment ça va ?",
                        "Où es-tu ?",
                        "Qui es-tu ?",
                        "Combien ça coûte ?"
                    ],
                    "answer": 0,
                    "explanation": "'Comment ça va ?' se usa de forma cotidiana."
                },
                {
                    "prompt": "Elige el número correcto para la palabra 'quatre'.",
                    "options": [
                        "2",
                        "3",
                        "4",
                        "5"
                    ],
                    "answer": 2,
                    "explanation": "'Quatre' corresponde al número cuatro."
                },
                {
                    "prompt": "Completa: 'Nous ___ français.'",
                    "options": [
                        "parle",
                        "parlez",
                        "parlons",
                        "parlent"
                    ],
                    "answer": 2,
                    "explanation": "'Nous parlons' es la forma correcta del presente."
                },
                {
                    "prompt": "Selecciona la traducción de 'buenas noches'.",
                    "options": [
                        "Bonne nuit",
                        "Bonne journée",
                        "Bonne soirée",
                        "Bon appétit"
                    ],
                    "answer": 0,
                    "explanation": "'Bonne nuit' se usa antes de ir a dormir."
                },
                {
                    "prompt": "¿Qué palabra significa 'familia'?",
                    "options": [
                        "fleur",
                        "fromage",
                        "famille",
                        "fenêtre"
                    ],
                    "answer": 2,
                    "explanation": "'Famille' significa familia."
                },
                {
                    "prompt": "Completa: 'C'est ___ ami.'",
                    "options": [
                        "un",
                        "une",
                        "des",
                        "du"
                    ],
                    "answer": 0,
                    "explanation": "'Ami' es masculino, por lo que usamos 'un'."
                },
                {
                    "prompt": "Selecciona el plural correcto de 'chat' (gato).",
                    "options": [
                        "chats",
                        "chates",
                        "chatx",
                        "chaux"
                    ],
                    "answer": 0,
                    "explanation": "El plural regular agrega -s: 'chats'."
                }
            ]
        },
        "A2": {
            "title": "Francés A2 - Rutinas y descripciones",
            "description": "Describe actividades diarias, lugares y preferencias usando estructuras básicas.",
            "questions": [
                {
                    "prompt": "Completa: 'Nous ___ le dîner à 20h.'",
                    "options": [
                        "mangeons",
                        "mangent",
                        "mange",
                        "mangons"
                    ],
                    "answer": 0,
                    "explanation": "Con 'nous' el verbo 'manger' se conjuga 'mangeons'."
                },
                {
                    "prompt": "Selecciona el adverbio de frecuencia en la frase: 'Je vais ___ au cinéma.'",
                    "options": [
                        "souvent",
                        "rouge",
                        "voiture",
                        "lentement"
                    ],
                    "answer": 0,
                    "explanation": "'Souvent' significa a menudo."
                },
                {
                    "prompt": "Elige la opción correcta: 'Il y ___ un marché le dimanche.'",
                    "options": [
                        "a",
                        "ont",
                        "es",
                        "est"
                    ],
                    "answer": 0,
                    "explanation": "Expresión fija 'il y a'."
                },
                {
                    "prompt": "¿Cómo dices 'Ella está estudiando' para enfatizar la acción en curso?",
                    "options": [
                        "Elle étudie",
                        "Elle est étudiée",
                        "Elle est en train d'étudier",
                        "Elle étudies"
                    ],
                    "answer": 2,
                    "explanation": "'Être en train de' destaca que la acción sucede ahora."
                },
                {
                    "prompt": "Selecciona el comparativo correcto de 'grand'.",
                    "options": [
                        "plus grand",
                        "grandest",
                        "plus grande",
                        "grandement"
                    ],
                    "answer": 0,
                    "explanation": "Para masculino singular usamos 'plus grand'."
                },
                {
                    "prompt": "Completa: 'Je voudrais ___ eau.'",
                    "options": [
                        "des",
                        "de la",
                        "de l'",
                        "du"
                    ],
                    "answer": 2,
                    "explanation": "'Eau' empieza con vocal, por eso usamos 'de l''."
                },
                {
                    "prompt": "¿Cuál es la pregunta bien formada para preguntar dónde vive alguien?",
                    "options": [
                        "Où habites-tu ?",
                        "Où tu habites ?",
                        "Où habites tu",
                        "Où habite-toi ?"
                    ],
                    "answer": 0,
                    "explanation": "La inversión 'habites-tu' es correcta en registro estándar."
                },
                {
                    "prompt": "Traduce 'Estamos aprendiendo francés'.",
                    "options": [
                        "Nous apprenons le français",
                        "Nous apprends français",
                        "On apprendre français",
                        "Nous apprendre le français"
                    ],
                    "answer": 0,
                    "explanation": "'Apprenons' es la forma adecuada para 'nous'."
                },
                {
                    "prompt": "Completa: 'Elle a les cheveux ___.'",
                    "options": [
                        "longs bruns",
                        "bruns longs",
                        "longues bruns",
                        "long brun"
                    ],
                    "answer": 0,
                    "explanation": "El orden habitual es longitud + color."
                },
                {
                    "prompt": "Selecciona la opción correcta para hablar del clima: 'Il fait ___ aujourd'hui.'",
                    "options": [
                        "pluie",
                        "pluvieux",
                        "pleuvoir",
                        "pluieusement"
                    ],
                    "answer": 1,
                    "explanation": "'Il fait pluvieux' describe un día lluvioso."
                }
            ]
        },
        "B1": {
            "title": "Francés B1 - Interacción cotidiana",
            "description": "Resuelve situaciones frecuentes como viajes, trabajo y estudios en francés.",
            "questions": [
                {
                    "prompt": "Completa con el verbo pronominal correcto: 'Je me ___ tôt.'",
                    "options": [
                        "réveille",
                        "réveilles",
                        "réveillent",
                        "réveillai"
                    ],
                    "answer": 0,
                    "explanation": "'Je me réveille tôt' significa me levanto temprano."
                },
                {
                    "prompt": "Completa: 'Si j'ai le temps, je ___ au musée.'",
                    "options": [
                        "vais",
                        "irais",
                        "allais",
                        "suis allé"
                    ],
                    "answer": 0,
                    "explanation": "En la primera condicional usamos presente + futuro simple (o presente para un plan)."
                },
                {
                    "prompt": "Elige la forma correcta: 'Cela fait trois ans que je ___ ici.'",
                    "options": [
                        "travaille",
                        "travaillais",
                        "travaillerai",
                        "ai travaillé"
                    ],
                    "answer": 0,
                    "explanation": "'Cela fait ... que' se combina con el presente para indicar duración."
                },
                {
                    "prompt": "Selecciona el sinónimo de 'améliorer'.",
                    "options": [
                        "empirer",
                        "perfectionner",
                        "ignorer",
                        "rater"
                    ],
                    "answer": 1,
                    "explanation": "'Perfectionner' significa mejorar."
                },
                {
                    "prompt": "¿Qué pregunta en passé composé usa inversión?",
                    "options": [
                        "As-tu visité Paris ?",
                        "Tu as visité Paris ?",
                        "Est-ce que tu visité Paris ?",
                        "As-tu visite Paris ?"
                    ],
                    "answer": 0,
                    "explanation": "'As-tu visité Paris ?' es correcta y mantiene la tilde en 'visité'."
                },
                {
                    "prompt": "Completa: 'Elle est en retard car elle ___ le bus.'",
                    "options": [
                        "a raté",
                        "raté",
                        "avait raté",
                        "rate"
                    ],
                    "answer": 0,
                    "explanation": "Se usa passé composé con 'avoir'."
                },
                {
                    "prompt": "Selecciona la expresión equivalente a 'attendre avec impatience'.",
                    "options": [
                        "avoir hâte de",
                        "avoir peur de",
                        "avoir envie de",
                        "avoir honte de"
                    ],
                    "answer": 0,
                    "explanation": "'Avoir hâte de' significa esperar con entusiasmo."
                },
                {
                    "prompt": "Completa: 'Malgré ___ fatigue, il continue.'",
                    "options": [
                        "sa",
                        "son",
                        "ses",
                        "leur"
                    ],
                    "answer": 0,
                    "explanation": "'Fatigue' es femenino, por lo que corresponde 'sa fatigue'."
                },
                {
                    "prompt": "Completa la frase: 'Depuis 2019, ils ___ à Lyon.'",
                    "options": [
                        "habitent",
                        "habitaient",
                        "habiteront",
                        "ont habité"
                    ],
                    "answer": 0,
                    "explanation": "Con 'depuis' se usa el presente para acciones que continúan."
                },
                {
                    "prompt": "Elige la respuesta cortés ante 'Puis-je vous aider ?'",
                    "options": [
                        "Oui, merci beaucoup, j’apprécie.",
                        "Non, je ne vous aide pas.",
                        "Oui, donne-moi ça.",
                        "Ce n’est pas mon problème."
                    ],
                    "answer": 0,
                    "explanation": "La primera opción agradece la ayuda de manera educada."
                }
            ]
        },
        "B2": {
            "title": "Francés B2 - Argumentación y matices",
            "description": "Utiliza estructuras complejas, matiza tus ideas y participa en debates formales.",
            "questions": [
                {
                    "prompt": "Completa: 'Non seulement il a travaillé tard, ___ il est revenu le lendemain.'",
                    "options": [
                        "mais aussi",
                        "donc",
                        "ainsi",
                        "alors"
                    ],
                    "answer": 0,
                    "explanation": "'Non seulement... mais aussi' es la estructura correcta."
                },
                {
                    "prompt": "Selecciona la forma correcta: 'Une fois que nous serons arrivés, la réunion ___.'",
                    "options": [
                        "a commencé",
                        "commencera",
                        "avait commencé",
                        "commence"
                    ],
                    "answer": 1,
                    "explanation": "El futuro anterior en la cláusula principal indica una acción posterior."
                },
                {
                    "prompt": "Identifica el sinónimo de 'réticent'.",
                    "options": [
                        "enthousiaste",
                        "réticent",
                        "peureux",
                        "déterminé"
                    ],
                    "answer": 1,
                    "explanation": "'Réticent' significa poco dispuesto."
                },
                {
                    "prompt": "Completa: 'Il est grand temps que tu ___ une décision.'",
                    "options": [
                        "prends",
                        "prennes",
                        "prendra",
                        "as pris"
                    ],
                    "answer": 1,
                    "explanation": "Después de 'Il est grand temps que' se usa subjuntivo."
                },
                {
                    "prompt": "¿Cuál es la voz pasiva correcta?",
                    "options": [
                        "On a pris la décision.",
                        "La décision a été prise.",
                        "La décision prend.",
                        "La décision a pris."
                    ],
                    "answer": 1,
                    "explanation": "'La décision a été prise' es la forma pasiva en passé composé."
                },
                {
                    "prompt": "Completa: 'À peine étais-je sorti ___ il a commencé à pleuvoir.'",
                    "options": [
                        "qu’",
                        "dont",
                        "mais",
                        "alors"
                    ],
                    "answer": 0,
                    "explanation": "'À peine... que' requiere inversión y 'que'."
                },
                {
                    "prompt": "Selecciona la expresión idiomática equivalente a 'tenir quelqu’un informé'.",
                    "options": [
                        "tenir quelqu’un au courant",
                        "tenir quelqu’un à l’écart",
                        "tenir quelqu’un par la main",
                        "tenir quelqu’un sous silence"
                    ],
                    "answer": 0,
                    "explanation": "'Tenir au courant' significa mantener informado."
                },
                {
                    "prompt": "Elige el conector formal adecuado para una carta profesional.",
                    "options": [
                        "Salut !",
                        "Bonjour !",
                        "Madame, Monsieur,",
                        "Coucou !"
                    ],
                    "answer": 2,
                    "explanation": "'Madame, Monsieur,' es un saludo formal estándar."
                },
                {
                    "prompt": "Completa: 'La solution, ___ semblait évidente, est finalement complexe.'",
                    "options": [
                        "qui",
                        "que",
                        "où",
                        "dont"
                    ],
                    "answer": 0,
                    "explanation": "'Qui' introduce una oración relativa con antecedente sujeto."
                },
                {
                    "prompt": "Selecciona la mejor reformulación de 'expliquer clairement'.",
                    "options": [
                        "brouiller les pistes",
                        "mettre en lumière",
                        "faire abstraction",
                        "jeter l’éponge"
                    ],
                    "answer": 1,
                    "explanation": "'Mettre en lumière' significa clarificar."
                }
            ]
        },
        "C1": {
            "title": "Francés C1 - Lenguaje avanzado y matices",
            "description": "Domina registros formales, vocabulario preciso y expresiones idiomáticas complejas.",
            "questions": [
                {
                    "prompt": "Selecciona la expresión que significa 'adelantar una reunión'.",
                    "options": [
                        "avancer une réunion",
                        "reporter une réunion",
                        "solder une réunion",
                        "annuler une réunion"
                    ],
                    "answer": 0,
                    "explanation": "'Avancer une réunion' implica adelantarla."
                },
                {
                    "prompt": "Completa: 'Il est grand temps que nous ___ des mesures concrètes.'",
                    "options": [
                        "prenons",
                        "prendrons",
                        "prenions",
                        "avons pris"
                    ],
                    "answer": 2,
                    "explanation": "Se requiere subjuntivo: 'que nous prenions'."
                },
                {
                    "prompt": "Identifica el adjetivo que significa 'transparente, evidente'.",
                    "options": [
                        "opaque",
                        "limpide",
                        "douteux",
                        "ambigu"
                    ],
                    "answer": 1,
                    "explanation": "'Limpide' se usa para algo claro."
                },
                {
                    "prompt": "Completa: 'À peine avaient-ils lancé le produit ___ les ventes ont explosé.'",
                    "options": [
                        "qu’",
                        "quand",
                        "alors",
                        "donc"
                    ],
                    "answer": 0,
                    "explanation": "Estructura fija 'À peine... que'."
                },
                {
                    "prompt": "Selecciona el adjetivo que describe a alguien íntegro.",
                    "options": [
                        "malhonnête",
                        "droit",
                        "rusé",
                        "trompeur"
                    ],
                    "answer": 1,
                    "explanation": "'Droit' significa honrado."
                },
                {
                    "prompt": "Completa: 'Il a parlé avec un ___ incroyable, captivant toute la salle.'",
                    "options": [
                        "aplomb",
                        "laxisme",
                        "marasme",
                        "torpeur"
                    ],
                    "answer": 0,
                    "explanation": "'Aplomb' = seguridad."
                },
                {
                    "prompt": "¿Cuál es la mejor paráfrasis de 'éclaircir un sujet'?",
                    "options": [
                        "éluder le sujet",
                        "mettre en lumière un sujet",
                        "dénaturer un sujet",
                        "écarter un sujet"
                    ],
                    "answer": 1,
                    "explanation": "'Mettre en lumière' significa clarificar."
                },
                {
                    "prompt": "Selecciona la frase que utiliza correctamente un condicional mixto.",
                    "options": [
                        "Si j’avais su, je viendrais aujourd’hui.",
                        "Si je savais, je serais venu hier.",
                        "Si j’avais su, je serais venu hier.",
                        "Si je sais, je serais venu hier."
                    ],
                    "answer": 2,
                    "explanation": "Combina passé composé en la condición y condicional pasado en la consecuencia."
                },
                {
                    "prompt": "Completa: 'Ses remarques étaient si ___ que personne n’a osé répondre.'",
                    "options": [
                        "acerbes",
                        "banales",
                        "fadasses",
                        "mollasses"
                    ],
                    "answer": 0,
                    "explanation": "'Acerbes' = mordaces, incisivas."
                },
                {
                    "prompt": "Selecciona la expresión que describe una tarea difícil.",
                    "options": [
                        "un jeu d’enfant",
                        "un casse-tête",
                        "être aux anges",
                        "être ravi"
                    ],
                    "answer": 1,
                    "explanation": "'Un casse-tête' indica dificultad."
                }
            ]
        },
        "C2": {
            "title": "Francés C2 - Dominio estilístico y especializado",
            "description": "Perfecciona la precisión léxica, referencias culturales y registros muy formales.",
            "questions": [
                {
                    "prompt": "Selecciona el término que describe un discurso muy convincente.",
                    "options": [
                        "fumeux",
                        "léthargique",
                        "percutant",
                        "fuyant"
                    ],
                    "answer": 2,
                    "explanation": "'Percutant' significa impactante y convincente."
                },
                {
                    "prompt": "Completa: 'Son exposé était truffé ___ références classiques.'",
                    "options": [
                        "de",
                        "par",
                        "vers",
                        "chez"
                    ],
                    "answer": 0,
                    "explanation": "La preposición adecuada es 'de'."
                },
                {
                    "prompt": "¿Cómo se denomina la 'sabiduría aceptada por todos'?",
                    "options": [
                        "un fait accompli",
                        "une sagesse reçue",
                        "une gageure",
                        "un pathos"
                    ],
                    "answer": 1,
                    "explanation": "'Sagesse reçue' equivale a 'received wisdom'."
                },
                {
                    "prompt": "Identifica la frase que emplea correctamente un participe absolu.",
                    "options": [
                        "Le soleil étant levé, nous partîmes.",
                        "Étant le soleil levé, nous partîmes.",
                        "Le soleil levé, nous partons.",
                        "Le soleil étant levé nous partons."
                    ],
                    "answer": 0,
                    "explanation": "'Le soleil étant levé, nous partîmes' es un ejemplo clásico."
                },
                {
                    "prompt": "Completa: 'Loin d’être décorative, la métaphore ___ la progression du récit.'",
                    "options": [
                        "sous-tend",
                        "affaiblit",
                        "efface",
                        "méprise"
                    ],
                    "answer": 0,
                    "explanation": "'Sous-tendre' significa sustentar."
                },
                {
                    "prompt": "Selecciona el término que designa un error lingüístico involuntario.",
                    "options": [
                        "un solécisme",
                        "un dithyrambe",
                        "un apologue",
                        "un aphorisme"
                    ],
                    "answer": 0,
                    "explanation": "'Solécisme' es un error de estilo o gramática."
                },
                {
                    "prompt": "¿Cuál es la locución latina que significa 'con una sola voz'?",
                    "options": [
                        "sub rosa",
                        "ex cathedra",
                        "pari passu",
                        "una voce"
                    ],
                    "answer": 3,
                    "explanation": "'Una voce' equivale a unanimidad."
                },
                {
                    "prompt": "Completa: 'S’il acquiesçait, la proposition ___ ratifiée immédiatement.'",
                    "options": [
                        "sera",
                        "serait",
                        "fut",
                        "avait été"
                    ],
                    "answer": 1,
                    "explanation": "Se usa condicional 'serait'."
                },
                {
                    "prompt": "Selecciona la palabra que indica detalles minuciosos.",
                    "options": [
                        "les minuties",
                        "la largesse",
                        "la verve",
                        "l’allégresse"
                    ],
                    "answer": 0,
                    "explanation": "'Les minuties' significa detalles minuciosos."
                },
                {
                    "prompt": "Elige la frase que emplea correctamente 'superficiellement'.",
                    "options": [
                        "Il a lu le dossier superficiellement avant la réunion.",
                        "Il superficiellement a lu le dossier.",
                        "Il a superficiellement lu dossier.",
                        "Il a lu le dossier superficiellemente."
                    ],
                    "answer": 0,
                    "explanation": "La primera respeta el adverbio bien colocado."
                }
            ]
        }
    },
    "aleman": {
        "A1": {
            "title": "Alemán A1 - Fundamentos esenciales",
            "description": "Aprende saludos básicos, vocabulario cotidiano y estructuras simples.",
            "questions": [
                {
                    "prompt": "Selecciona el saludo formal equivalente a 'hola' en alemán.",
                    "options": [
                        "Guten Tag",
                        "Auf Wiedersehen",
                        "Danke schön",
                        "Bitte"
                    ],
                    "answer": 0,
                    "explanation": "'Guten Tag' es un saludo formal en alemán.",
                    "media": {
                        "type": "audio",
                        "label": "Pronunciación de Guten Tag",
                        "src": "https://cdn.pixabay.com/download/audio/2021/09/01/audio_c1c8c58537.mp3?filename=guten-tag-6896.mp3"
                    }
                },
                {
                    "prompt": "¿Cómo se escribe 'gracias' en alemán?",
                    "options": [
                        "Bitte",
                        "Gern",
                        "Danke",
                        "Hallo"
                    ],
                    "answer": 2,
                    "explanation": "'Danke' significa 'gracias'."
                },
                {
                    "prompt": "Completa: 'Ich ___ Ana.'",
                    "options": [
                        "bin",
                        "bist",
                        "ist",
                        "seid"
                    ],
                    "answer": 0,
                    "explanation": "Con 'ich' el verbo 'sein' se conjuga como 'bin'."
                },
                {
                    "prompt": "¿Cuál es la pregunta para decir '¿Cómo estás?'?",
                    "options": [
                        "Wo bist du?",
                        "Wie heißt du?",
                        "Wie geht es dir?",
                        "Wer bist du?"
                    ],
                    "answer": 2,
                    "explanation": "'Wie geht es dir?' pregunta por el estado de alguien."
                },
                {
                    "prompt": "Elige el número correcto para la palabra 'drei'.",
                    "options": [
                        "2",
                        "3",
                        "4",
                        "5"
                    ],
                    "answer": 1,
                    "explanation": "'Drei' corresponde al número tres."
                },
                {
                    "prompt": "Completa: 'Wir ___ Deutsch.'",
                    "options": [
                        "spreche",
                        "sprechen",
                        "sprichst",
                        "sprecht"
                    ],
                    "answer": 1,
                    "explanation": "Con 'wir' el verbo 'sprechen' se conjuga 'sprechen'."
                },
                {
                    "prompt": "Selecciona la traducción de 'buenas noches'.",
                    "options": [
                        "Gute Nacht",
                        "Guten Morgen",
                        "Guten Abend",
                        "Tschüss"
                    ],
                    "answer": 0,
                    "explanation": "'Gute Nacht' se usa antes de dormir."
                },
                {
                    "prompt": "¿Qué palabra significa 'familia'?",
                    "options": [
                        "Familie",
                        "Freund",
                        "Fenster",
                        "Frühstück"
                    ],
                    "answer": 0,
                    "explanation": "'Familie' se traduce como familia."
                },
                {
                    "prompt": "Completa: 'Das ist ___ Freund.'",
                    "options": [
                        "ein",
                        "eine",
                        "einen",
                        "einem"
                    ],
                    "answer": 0,
                    "explanation": "'Freund' es masculino en nominativo, usamos 'ein'."
                },
                {
                    "prompt": "Selecciona el plural correcto de 'Buch'.",
                    "options": [
                        "Buche",
                        "Buchern",
                        "Bücher",
                        "Büchern"
                    ],
                    "answer": 2,
                    "explanation": "El plural irregular es 'Bücher'."
                }
            ]
        },
        "A2": {
            "title": "Alemán A2 - Rutinas y descripciones",
            "description": "Describe actividades diarias y preferencias personales con mayor detalle.",
            "questions": [
                {
                    "prompt": "Completa: 'Wir stehen jeden Morgen um sieben ___.'",
                    "options": [
                        "auf",
                        "aus",
                        "an",
                        "über"
                    ],
                    "answer": 0,
                    "explanation": "El verbo separable 'aufstehen' se conjuga 'wir stehen ... auf'."
                },
                {
                    "prompt": "Selecciona el adverbio de frecuencia en la frase: 'Ich gehe ___ ins Fitnessstudio.'",
                    "options": [
                        "oft",
                        "langsam",
                        "Stadt",
                        "schwarz"
                    ],
                    "answer": 0,
                    "explanation": "'Oft' significa a menudo."
                },
                {
                    "prompt": "Elige la opción correcta: 'Es ___ sonntags einen Markt.'",
                    "options": [
                        "ist",
                        "sind",
                        "gibt",
                        "hat"
                    ],
                    "answer": 2,
                    "explanation": "La expresión 'es gibt' indica que existe."
                },
                {
                    "prompt": "¿Cómo dices 'Ella está cocinando' en alemán cotidiano?",
                    "options": [
                        "Sie kocht gerade.",
                        "Sie ist kochen.",
                        "Sie kochtet.",
                        "Sie ist am kochen."
                    ],
                    "answer": 0,
                    "explanation": "'Sie kocht gerade.' indica que la acción ocurre ahora."
                },
                {
                    "prompt": "Selecciona el comparativo correcto de 'groß'.",
                    "options": [
                        "größer",
                        "großer",
                        "am größer",
                        "größere"
                    ],
                    "answer": 0,
                    "explanation": "El comparativo regular es 'größer'."
                },
                {
                    "prompt": "Completa: 'Möchtest du ___ Tee?'",
                    "options": [
                        "etwas",
                        "jemand",
                        "nirgend",
                        "jeder"
                    ],
                    "answer": 0,
                    "explanation": "'Etwas Tee' se usa para ofrecer algo de té."
                },
                {
                    "prompt": "¿Cuál es la pregunta bien formada?",
                    "options": [
                        "Wo wohnst du?",
                        "Wo du wohnst?",
                        "Wo wohnst du hin?",
                        "Wo wohnt du?"
                    ],
                    "answer": 0,
                    "explanation": "'Wo wohnst du?' tiene orden correcto."
                },
                {
                    "prompt": "Traduce 'Estoy aprendiendo alemán'.",
                    "options": [
                        "Ich lerne Deutsch.",
                        "Ich lerne Alemán.",
                        "Ich lernt Deutsch.",
                        "Ich am lernen Deutsch."
                    ],
                    "answer": 0,
                    "explanation": "'Ich lerne Deutsch.' es la forma correcta."
                },
                {
                    "prompt": "Completa: 'Sie hat ___ Haare.'",
                    "options": [
                        "lange braune",
                        "braun lange",
                        "lange braunen",
                        "langen braune"
                    ],
                    "answer": 0,
                    "explanation": "Los adjetivos preceden con terminación acusativa plural '-e': 'lange braune Haare'."
                },
                {
                    "prompt": "Selecciona la opción correcta: 'Es ist heute ___.'",
                    "options": [
                        "regnerisch",
                        "regnen",
                        "Regens",
                        "regnet"
                    ],
                    "answer": 0,
                    "explanation": "'Regnerisch' es el adjetivo para describir el clima lluvioso."
                }
            ]
        },
        "B1": {
            "title": "Alemán B1 - Gestión de situaciones cotidianas",
            "description": "Responde a imprevistos, viajes y vida laboral con recursos lingüísticos intermedios.",
            "questions": [
                {
                    "prompt": "Completa: 'Kannst du die Besprechung auf nächste Woche ___?'",
                    "options": [
                        "verschieben",
                        "versprechen",
                        "verschenken",
                        "verstehen"
                    ],
                    "answer": 0,
                    "explanation": "'Verschieben' significa posponer."
                },
                {
                    "prompt": "Completa: 'Wenn es morgen ___, bleiben wir zu Hause.'",
                    "options": [
                        "regnet",
                        "regnete",
                        "wird regnen",
                        "geregnet"
                    ],
                    "answer": 0,
                    "explanation": "En la primera condicional se usa presente: 'wenn es regnet'."
                },
                {
                    "prompt": "Selecciona la opción correcta: 'Ich arbeite seit 2019 ___ diesem Unternehmen.'",
                    "options": [
                        "in",
                        "bei",
                        "nach",
                        "um"
                    ],
                    "answer": 1,
                    "explanation": "Se usa la preposición 'bei' para referirse a la empresa."
                },
                {
                    "prompt": "¿Cuál es el sinónimo de 'verbessern'?",
                    "options": [
                        "verschlechtern",
                        "optimieren",
                        "vergessen",
                        "ignorieren"
                    ],
                    "answer": 1,
                    "explanation": "'Optimieren' significa mejorar."
                },
                {
                    "prompt": "¿Qué pregunta en pasado está bien formada?",
                    "options": [
                        "Bist du gestern ins Kino gegangen?",
                        "Hast du gegangen ins Kino?",
                        "Gingst du gestern ins Kino?",
                        "Bist du ins Kino gehst?"
                    ],
                    "answer": 0,
                    "explanation": "'Bist du ... gegangen?' usa el perfecto correcto."
                },
                {
                    "prompt": "Completa: 'Sie kam zu spät, weil sie den Bus ___.'",
                    "options": [
                        "verpasst hat",
                        "hat verpasst",
                        "verpasst",
                        "verpasste hat"
                    ],
                    "answer": 0,
                    "explanation": "En perfecto el participio va al final: 'verpasst hat'."
                },
                {
                    "prompt": "Selecciona la expresión equivalente a 'Ich freue mich darauf, dich zu sehen.'",
                    "options": [
                        "Ich kann es kaum erwarten, dich zu sehen.",
                        "Ich habe keine Lust, dich zu sehen.",
                        "Ich vergesse, dich zu sehen.",
                        "Ich brauche dich nicht zu sehen."
                    ],
                    "answer": 0,
                    "explanation": "La primera expresa entusiasmo."
                },
                {
                    "prompt": "Completa: 'Trotz ___ Müdigkeit machte er weiter.'",
                    "options": [
                        "seiner",
                        "seinem",
                        "sein",
                        "seines"
                    ],
                    "answer": 0,
                    "explanation": "Con 'trotz' se usa genitivo: 'trotz seiner Müdigkeit'."
                },
                {
                    "prompt": "Completa: 'Seit 2019 ___ sie in Berlin.'",
                    "options": [
                        "wohnen",
                        "wohnte",
                        "werden wohnen",
                        "sind gewohnt"
                    ],
                    "answer": 0,
                    "explanation": "Con 'seit' se usa presente: 'sie wohnen'."
                },
                {
                    "prompt": "Selecciona la respuesta adecuada a 'Kannst du mir helfen?'.",
                    "options": [
                        "Ja, natürlich, wie kann ich helfen?",
                        "Nein, hilf du mir.",
                        "Warum sollte ich?",
                        "Vielleicht später, keine Ahnung."
                    ],
                    "answer": 0,
                    "explanation": "La primera ofrece ayuda de manera cortés."
                }
            ]
        },
        "B2": {
            "title": "Alemán B2 - Argumentación y precisión",
            "description": "Usa estructuras complejas, matiza opiniones y maneja registros formales.",
            "questions": [
                {
                    "prompt": "Completa: 'Nicht nur hat sie den Bericht geschrieben, ___ sie hat ihn auch präsentiert.'",
                    "options": [
                        "sondern auch",
                        "doch auch",
                        "aber auch",
                        "sowie"
                    ],
                    "answer": 0,
                    "explanation": "Estructura fija 'nicht nur ..., sondern auch'."
                },
                {
                    "prompt": "Selecciona la opción correcta: 'Als wir ankamen, ___ der Film schon.'",
                    "options": [
                        "hatte begonnen",
                        "hat begonnen",
                        "begann",
                        "würde beginnen"
                    ],
                    "answer": 0,
                    "explanation": "El pluscuamperfecto indica que la acción ya había empezado."
                },
                {
                    "prompt": "Completa: 'Sollten Sie weitere Fragen haben, ___ Sie sich gern an uns wenden.'",
                    "options": [
                        "dürfen",
                        "können",
                        "sollten",
                        "werden"
                    ],
                    "answer": 1,
                    "explanation": "'Können Sie sich ... wenden' es la fórmula cortés estándar."
                },
                {
                    "prompt": "Identifica el sinónimo de 'widerwillig'.",
                    "options": [
                        "bereitwillig",
                        "abgeneigt",
                        "begeistert",
                        "zuverlässig"
                    ],
                    "answer": 1,
                    "explanation": "'Abgeneigt' significa poco dispuesto."
                },
                {
                    "prompt": "¿Qué frase está en voz pasiva correctamente?",
                    "options": [
                        "Das Komitee wählt den Gewinner.",
                        "Der Gewinner wurde vom Komitee gewählt.",
                        "Der Gewinner wählt das Komitee.",
                        "Der Gewinner ist gewählt."
                    ],
                    "answer": 1,
                    "explanation": "'Der Gewinner wurde ... gewählt' es la forma pasiva en Präteritum."
                },
                {
                    "prompt": "Completa: 'Kaum hatte ich die Tür geschlossen, ___ das Telefon.'",
                    "options": [
                        "läutete",
                        "als",
                        "wann",
                        "denn"
                    ],
                    "answer": 0,
                    "explanation": "'Kaum ...,' requiere inversión y el verbo en primera posición: 'läutete'."
                },
                {
                    "prompt": "¿Qué modal expresa una obligación leve?",
                    "options": [
                        "müssen",
                        "sollen",
                        "dürfen",
                        "brauchen"
                    ],
                    "answer": 1,
                    "explanation": "'Sollen' se usa para recomendaciones u obligaciones suaves."
                },
                {
                    "prompt": "Selecciona la expresión equivalente a 'jemanden auf dem Laufenden halten'.",
                    "options": [
                        "jemanden auf dem neuesten Stand halten",
                        "jemanden auf Abstand halten",
                        "jemanden im Dunkeln lassen",
                        "jemanden zum Schweigen bringen"
                    ],
                    "answer": 0,
                    "explanation": "'Auf dem neuesten Stand halten' significa informar."
                },
                {
                    "prompt": "Completa: 'Die Lösung, ___ zunächst offensichtlich schien, war kompliziert.'",
                    "options": [
                        "die",
                        "der",
                        "das",
                        "welcher"
                    ],
                    "answer": 0,
                    "explanation": "'Die' concuerda con 'Lösung' (femenino)."
                },
                {
                    "prompt": "Elige la fórmula adecuada para una carta formal.",
                    "options": [
                        "Hallo zusammen,",
                        "Sehr geehrte Damen und Herren,",
                        "Hi Leute,",
                        "Na, alles klar?"
                    ],
                    "answer": 1,
                    "explanation": "'Sehr geehrte Damen und Herren,' es saludo formal estándar."
                }
            ]
        },
        "C1": {
            "title": "Alemán C1 - Lenguaje profesional y matices",
            "description": "Argumenta con precisión, usa expresiones idiomáticas y domina registros formales.",
            "questions": [
                {
                    "prompt": "Selecciona la expresión que significa 'adelantar una cita'.",
                    "options": [
                        "einen Termin vorziehen",
                        "einen Termin absagen",
                        "einen Termin aufheben",
                        "einen Termin nachholen"
                    ],
                    "answer": 0,
                    "explanation": "'Einen Termin vorziehen' significa adelantarlo."
                },
                {
                    "prompt": "Completa: 'Es ist höchste Zeit, dass wir ___ Maßnahmen ergreifen.'",
                    "options": [
                        "konkrete",
                        "konkreten",
                        "konkreter",
                        "konkret"
                    ],
                    "answer": 0,
                    "explanation": "La frase correcta es 'konkrete Maßnahmen ergreifen', con adjetivo en acusativo plural sin artículo."
                },
                {
                    "prompt": "Identifica el adjetivo que significa 'transparente, evidente'.",
                    "options": [
                        "undurchsichtig",
                        "offenkundig",
                        "fraglich",
                        "dubios"
                    ],
                    "answer": 1,
                    "explanation": "'Offenkundig' significa evidente."
                },
                {
                    "prompt": "Completa: 'Kaum hatten sie das Produkt lanciert, ___ die Verkäufe.'",
                    "options": [
                        "stiegen",
                        "steigen",
                        "waren gestiegen",
                        "würden steigen"
                    ],
                    "answer": 0,
                    "explanation": "En alemán se suele usar inversión: '..., stiegen die Verkäufe.'"
                },
                {
                    "prompt": "Selecciona el adjetivo que describe a alguien íntegro.",
                    "options": [
                        "skrupellos",
                        "rechtschaffen",
                        "hinterlistig",
                        "trügerisch"
                    ],
                    "answer": 1,
                    "explanation": "'Rechtschaffen' significa honrado."
                },
                {
                    "prompt": "Completa: 'Er sprach mit großem ___, sodass alle gebannt zuhörten.'",
                    "options": [
                        "Selbstvertrauen",
                        "Verdruss",
                        "Überdruss",
                        "Schweigen"
                    ],
                    "answer": 0,
                    "explanation": "'Selbstvertrauen' equivale a aplomo."
                },
                {
                    "prompt": "¿Cuál es la mejor paráfrasis de 'etwas beleuchten'?",
                    "options": [
                        "etwas verschleiern",
                        "etwas näher erläutern",
                        "etwas abtun",
                        "etwas verdrängen"
                    ],
                    "answer": 1,
                    "explanation": "'Näher erläutern' significa explicar con detalle."
                },
                {
                    "prompt": "Selecciona la frase que usa correctamente un condicional mixto.",
                    "options": [
                        "Wenn ich es gewusst hätte, wäre ich gestern gekommen.",
                        "Wenn ich es weiß, wäre ich gestern gekommen.",
                        "Wenn ich es gewusst hätte, komme ich heute.",
                        "Wenn ich es wusste, wäre ich gekommen."
                    ],
                    "answer": 0,
                    "explanation": "Primera opción mezcla pasado y consecuencia hipotética presente correctamente."
                },
                {
                    "prompt": "Completa: 'Ihre Bemerkungen waren so ___, dass niemand widersprach.'",
                    "options": [
                        "treffend",
                        "fad",
                        "belanglos",
                        "schwerfällig"
                    ],
                    "answer": 0,
                    "explanation": "'Treffend' significa certero."
                },
                {
                    "prompt": "Selecciona la expresión que describe una tarea difícil.",
                    "options": [
                        "ein Kinderspiel",
                        "eine harte Nuss",
                        "auf Wolke sieben sein",
                        "überglücklich sein"
                    ],
                    "answer": 1,
                    "explanation": "'Eine harte Nuss' implica dificultad."
                }
            ]
        },
        "C2": {
            "title": "Alemán C2 - Dominio estilístico y especializado",
            "description": "Perfecciona matices culturales, vocabulario técnico y estructuras sofisticadas.",
            "questions": [
                {
                    "prompt": "Selecciona el término que describe un argumento muy convincente.",
                    "options": [
                        "haltlos",
                        "stringent",
                        "träge",
                        "belanglos"
                    ],
                    "answer": 1,
                    "explanation": "'Stringent' significa coherente y convincente."
                },
                {
                    "prompt": "Completa: 'Der Vortrag war gespickt ___ klassischen Anspielungen.'",
                    "options": [
                        "mit",
                        "von",
                        "für",
                        "an"
                    ],
                    "answer": 0,
                    "explanation": "La preposición correcta es 'mit'."
                },
                {
                    "prompt": "¿Cómo se denomina el conocimiento aceptado por todos?",
                    "options": [
                        "Allgemeinwissen",
                        "Binsenweisheit",
                        "Hintergedanke",
                        "Fait accompli"
                    ],
                    "answer": 1,
                    "explanation": "'Binsenweisheit' equivale a 'sabiduría recibida'."
                },
                {
                    "prompt": "Identifica la frase con un Partizipialkonstruktion correcta.",
                    "options": [
                        "Das Wetter erlaubend, findet die Feier draußen statt.",
                        "Das Wetter es erlaubend, findet die Feier draußen statt.",
                        "Bei erlaubendem Wetter findet die Feier draußen statt.",
                        "Erlaubt das Wetter, findet die Feier draußen statt."
                    ],
                    "answer": 2,
                    "explanation": "'Bei erlaubendem Wetter ...' es construcción participial aceptada."
                },
                {
                    "prompt": "Completa: 'Weit davon entfernt, nur schmückend zu sein, ___ die Metapher den Handlungsbogen.'",
                    "options": [
                        "trägt",
                        "untermauert",
                        "untergräbt",
                        "verwässert"
                    ],
                    "answer": 1,
                    "explanation": "'Untermauern' significa sustentar."
                },
                {
                    "prompt": "Selecciona el término para un error lingüístico involuntario.",
                    "options": [
                        "Schnitzer",
                        "Panegyrikus",
                        "Gleichnis",
                        "Anekdote"
                    ],
                    "answer": 0,
                    "explanation": "'Schnitzer' puede referirse a un error involuntario."
                },
                {
                    "prompt": "¿Cuál es la locución latina que significa 'con una sola voz'?",
                    "options": [
                        "ipso facto",
                        "ad hoc",
                        "pari passu",
                        "una voce"
                    ],
                    "answer": 3,
                    "explanation": "'Una voce' expresa unanimidad."
                },
                {
                    "prompt": "Completa: 'Würde er zustimmen, ___ der Vorschlag sofort ratifiziert.'",
                    "options": [
                        "wird",
                        "würde",
                        "wäre",
                        "ist"
                    ],
                    "answer": 1,
                    "explanation": "Se usa condicional 'würde'."
                },
                {
                    "prompt": "Selecciona la palabra que indica detalles minuciosos.",
                    "options": [
                        "Einzelheiten",
                        "Grosszügigkeit",
                        "Kern",
                        "Schwung"
                    ],
                    "answer": 0,
                    "explanation": "'Einzelheiten' significa detalles precisos."
                },
                {
                    "prompt": "Elige la frase que usa correctamente 'oberflächlich'.",
                    "options": [
                        "Er hat den Bericht oberflächlich gelesen.",
                        "Er oberflächlich hat den Bericht gelesen.",
                        "Er hat oberflächlich gelesen Bericht.",
                        "Er hat den Bericht oberflächlicher gelesen."
                    ],
                    "answer": 0,
                    "explanation": "La primera coloca correctamente el adverbio."
                }
            ]
        }
    },
    "italiano": {
        "A1": {
            "title": "Italiano A1 - Conversazioni básicas",
            "description": "Domina saludos, vocabulario cotidiano y frases esenciales para comenzar a comunicarte.",
            "questions": [
                {
                    "prompt": "Selecciona el saludo formal equivalente a 'hola' en italiano.",
                    "options": [
                        "Buongiorno",
                        "Arrivederci",
                        "Grazie",
                        "Per favore"
                    ],
                    "answer": 0,
                    "explanation": "'Buongiorno' se usa como saludo formal durante el día.",
                    "media": {
                        "type": "audio",
                        "label": "Pronuncia di Buongiorno",
                        "src": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4fc7e1a247.mp3?filename=ciao-111086.mp3"
                    }
                },
                {
                    "prompt": "¿Cómo se escribe 'gracias' en italiano?",
                    "options": [
                        "Prego",
                        "Scusa",
                        "Grazie",
                        "Ciao"
                    ],
                    "answer": 2,
                    "explanation": "'Grazie' significa 'gracias'."
                },
                {
                    "prompt": "Completa: 'Io ___ Maria.'",
                    "options": [
                        "sono",
                        "sei",
                        "è",
                        "siete"
                    ],
                    "answer": 0,
                    "explanation": "Con 'io' el verbo 'essere' se conjuga 'sono'."
                },
                {
                    "prompt": "¿Cuál es la pregunta para decir '¿Cómo estás?'?",
                    "options": [
                        "Dove sei?",
                        "Chi sei?",
                        "Come ti chiami?",
                        "Come stai?"
                    ],
                    "answer": 3,
                    "explanation": "'Come stai?' pregunta por el estado de alguien."
                },
                {
                    "prompt": "Elige el número correcto para la palabra 'tre'.",
                    "options": [
                        "2",
                        "3",
                        "4",
                        "5"
                    ],
                    "answer": 1,
                    "explanation": "'Tre' corresponde al número tres."
                },
                {
                    "prompt": "Completa: 'Noi ___ italiano.'",
                    "options": [
                        "parlo",
                        "parliamo",
                        "parlate",
                        "parlano"
                    ],
                    "answer": 1,
                    "explanation": "Con 'noi' el verbo 'parlare' se conjuga 'parliamo'."
                },
                {
                    "prompt": "Selecciona la traducción de 'buenas noches'.",
                    "options": [
                        "Buona notte",
                        "Buon pomeriggio",
                        "Buona sera",
                        "A presto"
                    ],
                    "answer": 0,
                    "explanation": "'Buona notte' se usa antes de dormir."
                },
                {
                    "prompt": "¿Qué palabra significa 'familia'?",
                    "options": [
                        "famiglia",
                        "finestra",
                        "formaggio",
                        "fiore"
                    ],
                    "answer": 0,
                    "explanation": "'Famiglia' significa familia."
                },
                {
                    "prompt": "Completa: 'Questo è ___ amico.'",
                    "options": [
                        "un",
                        "una",
                        "uno",
                        "degli"
                    ],
                    "answer": 0,
                    "explanation": "'Amico' es masculino, por lo que usamos 'un'."
                },
                {
                    "prompt": "Selecciona el plural correcto de 'libro'.",
                    "options": [
                        "libri",
                        "libres",
                        "libra",
                        "libriamo"
                    ],
                    "answer": 0,
                    "explanation": "El plural regular es 'libri'."
                }
            ]
        },
        "A2": {
            "title": "Italiano A2 - Rutinas y preferencias",
            "description": "Describe hábitos diarios, lugares y gustos utilizando estructuras básicas.",
            "questions": [
                {
                    "prompt": "Completa: 'Ci alziamo alle sette ___.'",
                    "options": [
                        "in punto",
                        "sopra",
                        "oltre",
                        "senza"
                    ],
                    "answer": 0,
                    "explanation": "'Alle sette in punto' indica una hora exacta."
                },
                {
                    "prompt": "Selecciona el adverbio de frecuencia: 'Vado ___ in palestra.'",
                    "options": [
                        "spesso",
                        "lento",
                        "finestra",
                        "verde"
                    ],
                    "answer": 0,
                    "explanation": "'Spesso' significa a menudo."
                },
                {
                    "prompt": "Elige la opción correcta: 'C'è ___ mercato la domenica.'",
                    "options": [
                        "un",
                        "uno",
                        "una",
                        "degli"
                    ],
                    "answer": 0,
                    "explanation": "'C'è un mercato' es la forma estándar."
                },
                {
                    "prompt": "¿Cómo dices 'Ella está cocinando' en italiano?",
                    "options": [
                        "Lei cucina",
                        "Lei sta cucinando",
                        "Lei cucinava",
                        "Lei è cucinare"
                    ],
                    "answer": 1,
                    "explanation": "'Sta cucinando' indica acción en progreso."
                },
                {
                    "prompt": "Selecciona el comparativo correcto de 'alto'.",
                    "options": [
                        "più alto",
                        "alto di più",
                        "il più alto",
                        "più alti"
                    ],
                    "answer": 0,
                    "explanation": "El comparativo se forma con 'più + adjetivo'."
                },
                {
                    "prompt": "Completa: 'Vuoi ___ tè?'",
                    "options": [
                        "del",
                        "degli",
                        "alla",
                        "sul"
                    ],
                    "answer": 0,
                    "explanation": "'Del tè' es el partitivo correcto."
                },
                {
                    "prompt": "¿Cuál es la pregunta bien formada?",
                    "options": [
                        "Dove abiti?",
                        "Dove tu abiti?",
                        "Dove abiti tu?",
                        "Dove abitate tu?"
                    ],
                    "answer": 0,
                    "explanation": "'Dove abiti?' es directa y correcta."
                },
                {
                    "prompt": "Traduce 'Estamos aprendiendo italiano'.",
                    "options": [
                        "Stiamo imparando l'italiano",
                        "Siamo imparando italiano",
                        "Impariamo italiano ora",
                        "Stiamo impariamo italiano"
                    ],
                    "answer": 0,
                    "explanation": "'Stiamo imparando l'italiano' usa el progresivo correcto."
                },
                {
                    "prompt": "Completa: 'Ha i capelli ___.'",
                    "options": [
                        "lunghi castani",
                        "castani lunghi",
                        "lunga castani",
                        "lunghi marroni"
                    ],
                    "answer": 0,
                    "explanation": "El orden habitual es longitud + color."
                },
                {
                    "prompt": "Selecciona la opción correcta: 'Oggi è molto ___.'",
                    "options": [
                        "piovoso",
                        "piove",
                        "pioggia",
                        "piovendo"
                    ],
                    "answer": 0,
                    "explanation": "'Piovoso' describe el clima."
                }
            ]
        },
        "B1": {
            "title": "Italiano B1 - Gestión de situaciones comunes",
            "description": "Interactúa en viajes, trabajo y estudios con seguridad en un nivel intermedio.",
            "questions": [
                {
                    "prompt": "Completa: 'Puoi ___ la riunione alla prossima settimana?'",
                    "options": [
                        "rimandare",
                        "risolvere",
                        "ricevere",
                        "riprendere"
                    ],
                    "answer": 0,
                    "explanation": "'Rimandare' significa posponer."
                },
                {
                    "prompt": "Completa: 'Se domani ___, restiamo a casa.'",
                    "options": [
                        "piove",
                        "pioverà",
                        "piovesse",
                        "ha piovuto"
                    ],
                    "answer": 0,
                    "explanation": "En la primera condicional se usa presente: 'se piove'."
                },
                {
                    "prompt": "Selecciona la opción correcta: 'Lavoro qui ___ 2019.'",
                    "options": [
                        "dal",
                        "da",
                        "fino",
                        "tra"
                    ],
                    "answer": 0,
                    "explanation": "'Dal 2019' indica desde cuándo ocurre la acción."
                },
                {
                    "prompt": "¿Cuál es el sinónimo de 'migliorare'?",
                    "options": [
                        "peggiorare",
                        "perfezionare",
                        "dimenticare",
                        "ignorare"
                    ],
                    "answer": 1,
                    "explanation": "'Perfezionare' significa mejorar."
                },
                {
                    "prompt": "¿Qué pregunta en pasado está bien formada?",
                    "options": [
                        "Sei andato al cinema ieri?",
                        "Hai andato al cinema ieri?",
                        "Andavi al cinema ieri?",
                        "Vai al cinema ieri?"
                    ],
                    "answer": 0,
                    "explanation": "El passato prossimo correcto es 'Sei andato ...?'"
                },
                {
                    "prompt": "Completa: 'È in ritardo perché ha ___ l'autobus.'",
                    "options": [
                        "perso",
                        "perduto",
                        "perdere",
                        "perso di"
                    ],
                    "answer": 0,
                    "explanation": "'Ha perso l'autobus' es expresión común."
                },
                {
                    "prompt": "Selecciona la expresión equivalente a 'Non vedo l'ora di vederti.'",
                    "options": [
                        "Non posso aspettare di vederti.",
                        "Non voglio vederti.",
                        "Mi dimentico di vederti.",
                        "Non ho bisogno di vederti."
                    ],
                    "answer": 0,
                    "explanation": "La primera mantiene el entusiasmo por encontrarse."
                },
                {
                    "prompt": "Completa: 'Nonostante la ___ stanchezza, ha continuato a studiare.'",
                    "options": [
                        "sua",
                        "suo",
                        "suoi",
                        "sue"
                    ],
                    "answer": 0,
                    "explanation": "'Stanchezza' es femenino singular, por lo que usamos 'sua'."
                },
                {
                    "prompt": "Completa: 'Dal 2019 ___ a Milano.'",
                    "options": [
                        "vivono",
                        "vivevano",
                        "vivranno",
                        "sono vissuti"
                    ],
                    "answer": 0,
                    "explanation": "Con 'dal' se usa presente: 'vivono'."
                },
                {
                    "prompt": "Selecciona la respuesta cortés a 'Mi dai una mano?'.",
                    "options": [
                        "Certo, dimmi pure!",
                        "Perché dovrei?",
                        "No, arrangiati.",
                        "Forse dopo, non so."
                    ],
                    "answer": 0,
                    "explanation": "La primera ofrece ayuda de manera amable."
                }
            ]
        },
        "B2": {
            "title": "Italiano B2 - Argumentación y registros formales",
            "description": "Defiende opiniones, analiza textos y utiliza conectores formales con soltura.",
            "questions": [
                {
                    "prompt": "Completa: 'Non solo ha preparato il rapporto, ___ lo ha anche presentato.'",
                    "options": [
                        "ma anche",
                        "però anche",
                        "così anche",
                        "bensì"
                    ],
                    "answer": 0,
                    "explanation": "Estructura fija 'non solo..., ma anche'."
                },
                {
                    "prompt": "Selecciona la opción correcta: 'Quando siamo arrivati, il film ___.'",
                    "options": [
                        "era già iniziato",
                        "è iniziato",
                        "iniziava",
                        "inizierà"
                    ],
                    "answer": 0,
                    "explanation": "El trapassato prossimo indica que la acción ya había empezado."
                },
                {
                    "prompt": "Completa: 'Qualora avesse bisogno di assistenza, si ___ rivolgere a noi.'",
                    "options": [
                        "può",
                        "potrà",
                        "dovrà",
                        "avrebbe"
                    ],
                    "answer": 0,
                    "explanation": "En un registro formal se usa 'si può rivolgere a noi'."
                },
                {
                    "prompt": "Identifica el sinónimo de 'riluttante'.",
                    "options": [
                        "entusiasta",
                        "restio",
                        "convinto",
                        "felice"
                    ],
                    "answer": 1,
                    "explanation": "'Restio' significa poco dispuesto."
                },
                {
                    "prompt": "¿Qué frase está en voz pasiva correctamente?",
                    "options": [
                        "La giuria sceglie il vincitore.",
                        "Il vincitore è stato scelto dalla giuria.",
                        "La giuria è scelta dal vincitore.",
                        "Il vincitore sceglie la giuria."
                    ],
                    "answer": 1,
                    "explanation": "'È stato scelto' es la forma pasiva en pasado."
                },
                {
                    "prompt": "Completa: 'Appena ho chiuso la porta, ___ il telefono.'",
                    "options": [
                        "ha squillato",
                        "squillò",
                        "squillerà",
                        "squillerebbe"
                    ],
                    "answer": 0,
                    "explanation": "'Ha squillato' describe la acción inmediata en passato prossimo."
                },
                {
                    "prompt": "¿Qué forma expresa una obligación suave?",
                    "options": [
                        "devi",
                        "bisogna",
                        "dovresti",
                        "serve"
                    ],
                    "answer": 2,
                    "explanation": "'Dovresti' corresponde a 'deberías'."
                },
                {
                    "prompt": "Selecciona la expresión equivalente a 'tenere qualcuno informato'.",
                    "options": [
                        "tenere qualcuno aggiornato",
                        "tenere qualcuno distante",
                        "tenere qualcuno al buio",
                        "tenere qualcuno zitto"
                    ],
                    "answer": 0,
                    "explanation": "'Tenere aggiornato' significa informar."
                },
                {
                    "prompt": "Completa: 'La soluzione, ___ sembrava ovvia, era complessa.'",
                    "options": [
                        "che",
                        "cui",
                        "dove",
                        "chi"
                    ],
                    "answer": 0,
                    "explanation": "'Che' introduce la proposición relativa con antecedente sujeto."
                },
                {
                    "prompt": "Elige la fórmula adecuada para una carta formal.",
                    "options": [
                        "Ciao a tutti,",
                        "Gentili Signore e Signori,",
                        "Ehi amici,",
                        "Buonasera a tutti!"
                    ],
                    "answer": 1,
                    "explanation": "'Gentili Signore e Signori,' es saludo formal estándar."
                }
            ]
        },
        "C1": {
            "title": "Italiano C1 - Lenguaje avanzado y profesional",
            "description": "Perfecciona matices, expresiones idiomáticas y argumentación en contextos exigentes.",
            "questions": [
                {
                    "prompt": "Selecciona la expresión que significa 'adelantar una riunione'.",
                    "options": [
                        "anticipare una riunione",
                        "rimandare una riunione",
                        "annullare una riunione",
                        "sospendere una riunione"
                    ],
                    "answer": 0,
                    "explanation": "'Anticipare una riunione' significa adelantarla."
                },
                {
                    "prompt": "Completa: 'È ora che noi ___ misure concrete.'",
                    "options": [
                        "prendiamo",
                        "prenderemo",
                        "prendessimo",
                        "abbiamo preso"
                    ],
                    "answer": 0,
                    "explanation": "Después de 'È ora che' se usa congiuntivo presente: 'prendiamo'."
                },
                {
                    "prompt": "Identifica el adjetivo que significa 'evidente'.",
                    "options": [
                        "oscuro",
                        "lampante",
                        "dubbioso",
                        "confuso"
                    ],
                    "answer": 1,
                    "explanation": "'Lampante' equivale a evidente."
                },
                {
                    "prompt": "Completa: 'Appena avevano lanciato il prodotto, le vendite ___.'",
                    "options": [
                        "sono schizzate",
                        "schizzano",
                        "schizzavano",
                        "schizzerebbero"
                    ],
                    "answer": 0,
                    "explanation": "El passato prossimo con 'sono schizzate' indica aumento inmediato."
                },
                {
                    "prompt": "Selecciona el adjetivo que describe a una persona íntegra.",
                    "options": [
                        "disonesta",
                        "specchiata",
                        "furba",
                        "ambigua"
                    ],
                    "answer": 1,
                    "explanation": "'Specchiata' significa irreprochable."
                },
                {
                    "prompt": "Completa: 'Ha parlato con una grande ___, conquistando il pubblico.'",
                    "options": [
                        "sicurezza",
                        "noia",
                        "indifferenza",
                        "fatica"
                    ],
                    "answer": 0,
                    "explanation": "'Sicurezza' transmite confianza."
                },
                {
                    "prompt": "¿Cuál es la mejor paráfrasis de 'fare chiarezza'?",
                    "options": [
                        "fare luce su",
                        "mettere da parte",
                        "far finta di nulla",
                        "creare confusione"
                    ],
                    "answer": 0,
                    "explanation": "'Fare luce su' equivale a clarificar."
                },
                {
                    "prompt": "Selecciona la frase que usa correctamente un periodo ipotetico misto.",
                    "options": [
                        "Se l’avessi saputo, sarei venuto ieri.",
                        "Se lo so, sarei venuto ieri.",
                        "Se l’avessi saputo, vengo oggi.",
                        "Se lo sapevo, venivo ieri."
                    ],
                    "answer": 0,
                    "explanation": "La primera combina condicional y passato correctamente."
                },
                {
                    "prompt": "Completa: 'Le sue osservazioni erano così ___ che nessuno replicò.'",
                    "options": [
                        "taglienti",
                        "banali",
                        "sciatte",
                        "fiacche"
                    ],
                    "answer": 0,
                    "explanation": "'Taglienti' equivale a incisivas."
                },
                {
                    "prompt": "Selecciona la expresión que describe una tarea difícil.",
                    "options": [
                        "un gioco da ragazzi",
                        "una bella gatta da pelare",
                        "essere al settimo cielo",
                        "una passeggiata"
                    ],
                    "answer": 1,
                    "explanation": "'Una bella gatta da pelare' indica un reto complicado."
                }
            ]
        },
        "C2": {
            "title": "Italiano C2 - Dominio estilístico y cultural",
            "description": "Utiliza referencias culturales, vocabulario especializado y estructuras sofisticadas con precisión.",
            "questions": [
                {
                    "prompt": "Selecciona el término que describe un argomento molto convincente.",
                    "options": [
                        "fragile",
                        "stringente",
                        "blando",
                        "superfluo"
                    ],
                    "answer": 1,
                    "explanation": "'Stringente' significa sólido y convincente."
                },
                {
                    "prompt": "Completa: 'La conferenza era colma ___ riferimenti classici.'",
                    "options": [
                        "di",
                        "su",
                        "per",
                        "tra"
                    ],
                    "answer": 0,
                    "explanation": "Se usa la preposición 'di'."
                },
                {
                    "prompt": "¿Cómo se denomina la sapienza accettata da tutti?",
                    "options": [
                        "sapere raro",
                        "sapienza condivisa",
                        "dubbio comune",
                        "parere solitario"
                    ],
                    "answer": 1,
                    "explanation": "'Sapienza condivisa' equivale a conocimiento aceptado."
                },
                {
                    "prompt": "Identifica la frase con un participio assoluto correcto.",
                    "options": [
                        "Terminato il discorso, il professore uscì.",
                        "Il discorso terminato, il professore esce.",
                        "Terminando il discorso, il professore uscì.",
                        "Finito il discorso il professore esce"
                    ],
                    "answer": 0,
                    "explanation": "'Terminato il discorso, ...' es participio absoluto clásico."
                },
                {
                    "prompt": "Completa: 'Lungi dall’essere ornamentale, la metafora ___ l’arco narrativo.'",
                    "options": [
                        "sostiene",
                        "indebolisce",
                        "oscurisce",
                        "svaluta"
                    ],
                    "answer": 0,
                    "explanation": "'Sostiene' significa que la refuerza."
                },
                {
                    "prompt": "Selecciona el término que designa un errore linguistico involontario.",
                    "options": [
                        "solecismo",
                        "panegirico",
                        "allegoria",
                        "aforisma"
                    ],
                    "answer": 0,
                    "explanation": "'Solecismo' indica un error de estilo o gramática."
                },
                {
                    "prompt": "¿Cuál es la locución que significa 'con una sola voz'?",
                    "options": [
                        "a porte chiuse",
                        "ad una voce",
                        "subito e subito",
                        "pro forma"
                    ],
                    "answer": 1,
                    "explanation": "'Ad una voce' expresa unanimidad."
                },
                {
                    "prompt": "Completa: 'Se accettasse, la proposta ___ approvata subito.'",
                    "options": [
                        "sarà",
                        "verrebbe",
                        "fu",
                        "era"
                    ],
                    "answer": 1,
                    "explanation": "Se usa condizionale 'verrebbe approvata'."
                },
                {
                    "prompt": "Selecciona la palabra que indica dettagli minuziosi.",
                    "options": [
                        "minuzie",
                        "grandezze",
                        "nucleo",
                        "brio"
                    ],
                    "answer": 0,
                    "explanation": "'Minuzie' son detalles muy precisos."
                },
                {
                    "prompt": "Elige la frase que usa correctamente 'superficialmente'.",
                    "options": [
                        "Ha letto il rapporto superficialmente prima della riunione.",
                        "Superficialmente ha letto il rapporto.",
                        "Ha letto superficialmente rapporto.",
                        "Ha letto il rapporto superficialmenti."
                    ],
                    "answer": 0,
                    "explanation": "La primera coloca correctamente el adverbio."
                }
            ]
        }
    }
};
    window.LESSONS_DATA = LESSONS_DATA;
})();
