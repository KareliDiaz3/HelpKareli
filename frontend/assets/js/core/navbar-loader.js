/* ============================================
   SPEAKLEXI - CARGADOR DE NAVBAR
   Archivo: assets/js/navbar-loader.js
   Usa: window.APP_CONFIG desde app-config.js
   ============================================ */

class NavbarLoader {
    constructor() {
        this.config = window.APP_CONFIG || {};
        this.navbarPath = this.config.UI?.NAVBAR_PATH || '/assets/components/navbar.html';
        this.init();
    }

    async init() {
        await this.loadNavbar();
        this.setupEventListeners();
        this.configureStudentNav();
        console.log('✅ Navbar cargado');
    }

    /**
     * Carga el navbar
     */
    async loadNavbar() {
        try {
            const response = await fetch(this.navbarPath);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Remover script si existe
            const script = tempDiv.querySelector('script');
            if (script) script.remove();
            
            // Insertar navbar
            const navElement = tempDiv.firstElementChild;
            if (navElement) {
                document.body.insertBefore(navElement, document.body.firstChild);
            }
            
        } catch (error) {
            console.error('❌ Error cargando navbar:', error);
            this.createFallbackNavbar();
        }
    }

    /**
     * Navbar simple de respaldo
     */
    createFallbackNavbar() {
        const fallbackNavbar = `
            <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex justify-between h-16 items-center">
                        <div class="flex items-center">
                            <a href="/index.html" class="flex items-center space-x-2">
                                <span class="text-xl font-bold text-gray-900 dark:text-white">SpeakLexi</span>
                            </a>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                <i class="fas fa-moon text-gray-600 dark:text-yellow-400" id="theme-icon"></i>
                            </button>
                            
                            <div class="hidden md:flex space-x-4">
                                <a href="/index.html" class="text-gray-700 dark:text-gray-300 hover:text-blue-600">Inicio</a>
                                <a href="/pages/auth/login.html" class="text-gray-700 dark:text-gray-300 hover:text-blue-600">Login</a>
                                <a href="/pages/auth/registro.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Registro</a>
                            </div>

                            <button id="mobile-menu-toggle" class="md:hidden p-2">
                                <i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Menú móvil -->
                <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div class="px-4 py-2 space-y-2">
                        <a href="/index.html" class="block py-2 text-gray-700 dark:text-gray-300">Inicio</a>
                        <a href="/pages/auth/login.html" class="block py-2 text-gray-700 dark:text-gray-300">Login</a>
                        <a href="/pages/auth/registro.html" class="block py-2 bg-blue-600 text-white rounded text-center">Registro</a>
                    </div>
                </div>
            </nav>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fallbackNavbar;
        document.body.insertBefore(tempDiv.firstElementChild, document.body.firstChild);
    }

    /**
     * Configura eventos
     */
    setupEventListeners() {
        setTimeout(() => {
            // Menú móvil
            const mobileToggle = document.getElementById('mobile-menu-toggle');
            const mobileMenu = document.getElementById('mobile-menu');

            if (mobileToggle && mobileMenu) {
                mobileToggle.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }

            // Tema oscuro/claro
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle && window.themeManager) {
                themeToggle.addEventListener('click', () => {
                    window.themeManager.toggleTheme();
                });
            }

            this.configureStudentNav();
        }, 100);
    }

    configureStudentNav() {
        const path = window.location.pathname || '';
        const isStudentSection = path.includes('/pages/estudiante/');

        const profileLink = document.getElementById('student-profile-link');
        const changeCourseLink = document.getElementById('student-change-course-link');
        const mobileLinks = document.getElementById('student-mobile-links');

        const toggle = (element, show) => {
            if (!element) return;
            if (show) {
                element.classList.remove('hidden');
            } else {
                if (!element.classList.contains('hidden')) {
                    element.classList.add('hidden');
                }
            }
        };

        toggle(profileLink, isStudentSection);
        toggle(changeCourseLink, isStudentSection);
        toggle(mobileLinks, isStudentSection);
    }
}

// Inicializar automáticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NavbarLoader();
    });
} else {
    new NavbarLoader();
}