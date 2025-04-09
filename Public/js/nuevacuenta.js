// Función para inicializar el switcher de tema
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const body = document.body;
    const iconLight = themeToggle.querySelector('.icon-light');
    const iconDark = themeToggle.querySelector('.icon-dark');
    
    // Comprobar preferencia usando AppStorage
    const currentTheme = AppStorage.getThemePreference();
    
    // Aplicar tema inicial
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        if (iconLight) iconLight.style.display = 'none';
        if (iconDark) iconDark.style.display = 'inline';
        themeToggle.setAttribute('aria-pressed', 'true');
    } else {
        if (iconLight) iconLight.style.display = 'inline';
        if (iconDark) iconDark.style.display = 'none';
        themeToggle.setAttribute('aria-pressed', 'false');
    }
    
    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            if (newTheme === 'dark') {
                body.classList.add('dark-mode');
                if (iconLight) iconLight.style.display = 'none';
                if (iconDark) iconDark.style.display = 'inline';
                themeToggle.setAttribute('aria-pressed', 'true');
            } else {
                body.classList.remove('dark-mode');
                if (iconLight) iconLight.style.display = 'inline';
                if (iconDark) iconDark.style.display = 'none';
                themeToggle.setAttribute('aria-pressed', 'false');
            }
        }
    });
    
    // Escuchar clic en el botón
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Cambiar icono y estado ARIA
        if (isDark) {
            if (iconLight) iconLight.style.display = 'none';
            if (iconDark) iconDark.style.display = 'inline';
            themeToggle.setAttribute('aria-pressed', 'true');
            AppStorage.setTheme('dark');
        } else {
            if (iconLight) iconLight.style.display = 'inline';
            if (iconDark) iconDark.style.display = 'none';
            themeToggle.setAttribute('aria-pressed', 'false');
            AppStorage.setTheme('light');
        }
    });
}

// Función para manejar navegación por teclado
function setupKeyboardNavigation() {
    const form = document.getElementById('registerForm');
    if (form) {
        const focusableElements = form.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
        
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusableElements);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                themeToggle.click();
            }
        });
    }
}

// Función para mejorar accesibilidad de mensajes de error
function enhanceErrorAccessibility(input, errorElement) {
    input.setAttribute('aria-describedby', errorElement.id);
    input.setAttribute('aria-invalid', 'false');
    
    input.addEventListener('blur', () => {
        if (input.classList.contains('invalid')) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.setAttribute('aria-invalid', 'false');
        }
    });
}

// Validaciones y manejo del formulario
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tema
    initializeThemeSwitcher();
    
    // Configurar navegación por teclado
    setupKeyboardNavigation();
    
    // Saltar al contenido principal
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.tabIndex = -1;
                mainContent.focus();
            }
        });
    }
    
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    const nombre = document.getElementById('nombre');
    const password = document.getElementById('password');
    const email = document.getElementById('email');
    const telefono = document.getElementById('telefono');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Mejorar accesibilidad del formulario
    form.setAttribute('aria-label', 'Formulario de registro de nueva cuenta');
    if (submitButton) {
        submitButton.setAttribute('aria-label', 'Registrar nueva cuenta');
    }
    
    // Crear contenedores para mensajes de error con ARIA
    function setupErrorMessages() {
        function createErrorElement(inputElement) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.id = `${inputElement.id}-error`;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
            
            // Configurar accesibilidad
            enhanceErrorAccessibility(inputElement, errorElement);
            return errorElement;
        }
        
        createErrorElement(password);
        createErrorElement(email);
        createErrorElement(telefono);
    }
    
    setupErrorMessages();
    
    // Expresiones regulares para validación
    const validations = {
        password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        telefono: /^\d{10}$/
    };
    
    // Validación en tiempo real con feedback accesible
    function setupRealTimeValidation() {
        password.addEventListener('input', validatePassword);
        email.addEventListener('input', validateEmail);
        telefono.addEventListener('input', validateTelefono);
    }
    
    function validatePassword() {
        const value = this.value;
        const errorElement = this.nextElementSibling;
        let errors = [];
        
        if (value.length < 8) errors.push("Mínimo 8 caracteres");
        if (!/\d/.test(value)) errors.push("Al menos un número");
        if (!/[@$!%*#?&]/.test(value)) errors.push("Al menos un caracter especial (@$!%*#?&)");
        
        if (errors.length > 0 && value.length > 0) {
            errorElement.innerHTML = errors.length > 1 
                ? '<ul><li>' + errors.join('</li><li>') + '</li></ul>' 
                : errors[0];
            this.classList.add('invalid');
            this.setAttribute('aria-invalid', 'true');
        } else {
            errorElement.innerHTML = '';
            this.classList.remove('invalid');
            this.setAttribute('aria-invalid', 'false');
        }
    }
    
    function validateEmail() {
        const value = this.value.trim();
        const errorElement = this.nextElementSibling;
        
        if (!validations.email.test(value) && value.length > 0) {
            errorElement.textContent = 'Ingresa un email válido (ejemplo@dominio.com)';
            this.classList.add('invalid');
            this.setAttribute('aria-invalid', 'true');
        } else {
            errorElement.textContent = '';
            this.classList.remove('invalid');
            this.setAttribute('aria-invalid', 'false');
        }
    }
    
    function validateTelefono() {
        this.value = this.value.replace(/\D/g, '');
        const value = this.value;
        const errorElement = this.nextElementSibling;
        
        if (!validations.telefono.test(value) && value.length > 0) {
            errorElement.textContent = 'El teléfono debe tener 10 dígitos';
            this.classList.add('invalid');
            this.setAttribute('aria-invalid', 'true');
        } else {
            errorElement.textContent = '';
            this.classList.remove('invalid');
            this.setAttribute('aria-invalid', 'false');
        }
    }
    
    setupRealTimeValidation();
    
    // Manejo accesible del envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Disparar validaciones
        password.dispatchEvent(new Event('input'));
        email.dispatchEvent(new Event('input'));
        telefono.dispatchEvent(new Event('input'));
        
        // Verificar si hay errores
        const invalidFields = document.querySelectorAll('.invalid');
    
        if (invalidFields.length === 0) {
            const userData = {
                nombre: nombre.value,
                email: email.value,
                telefono: telefono.value,
                password: password.value
            };
            
            // Intenta guardar el nuevo usuario
            if (AppStorage.saveNewUser(userData)) {
                // Guarda también como usuario actual (inicia sesión automáticamente)
                AppStorage.saveUserData(userData);

                // Feedback visual accesible
                const liveRegion = document.createElement('div');
                liveRegion.setAttribute('role', 'status');
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.style.position = 'absolute';
                liveRegion.style.left = '-9999px';
                liveRegion.textContent = 'Registro exitoso. Redirigiendo...';
                document.body.appendChild(liveRegion);
                    
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // Mostrar error si el usuario ya existe
                const errorElement = email.nextElementSibling;
                errorElement.textContent = 'Ya existe una cuenta con este email';
                email.classList.add('invalid');
                email.setAttribute('aria-invalid', 'true');
                
                // Enfocar el campo de email
                email.focus();
            }
        }
    });
});