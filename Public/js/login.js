// Función para validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para mostrar mensajes accesibles
function showAccessibleMessage(message, role = 'status') {
    const existingLiveRegion = document.querySelector('[aria-live]');
    if (existingLiveRegion) existingLiveRegion.remove();

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', role);
    liveRegion.setAttribute('aria-live', role === 'alert' ? 'assertive' : 'polite');
    Object.assign(liveRegion.style, {
        position: 'absolute',
        left: '-9999px'
    });
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    
    setTimeout(() => liveRegion.remove(), 3000);
}

// Función para mostrar errores
function showError(field, message) {
    const input = document.getElementById(field);
    const errorElement = document.getElementById(`${field}-error`);
    
    input.classList.add('invalid');
    errorElement.textContent = message;
    input.focus();
}

// Función para resetear errores
function resetErrors() {
    ['email', 'password'].forEach(field => {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(`${field}-error`);
        input?.classList.remove('invalid');
        errorElement.textContent = '';
    });
}

// Función para inicializar el switcher de tema
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const body = document.body;
    const iconLight = themeToggle.querySelector('.icon-light');
    const iconDark = themeToggle.querySelector('.icon-dark');
    
    // Comprobar preferencia
    const currentTheme = localStorage.getItem('theme') || 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Aplicar tema inicial
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        iconLight.style.display = 'none';
        iconDark.style.display = 'inline';
        themeToggle.setAttribute('aria-pressed', 'true');
    } else {
        iconLight.style.display = 'inline';
        iconDark.style.display = 'none';
        themeToggle.setAttribute('aria-pressed', 'false');
    }
    
    // Escuchar clic en el botón
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Cambiar icono y estado ARIA
        if (isDark) {
            iconLight.style.display = 'none';
            iconDark.style.display = 'inline';
            themeToggle.setAttribute('aria-pressed', 'true');
        } else {
            iconLight.style.display = 'inline';
            iconDark.style.display = 'none';
            themeToggle.setAttribute('aria-pressed', 'false');
        }
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Función para manejar el foco en el theme toggle
function handleThemeToggleFocus() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            themeToggle.click();
        }
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {

    initializeThemeSwitcher();
    handleThemeToggleFocus();

    // Redirigir si ya está logueado
    if (AppStorage.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {

            e.preventDefault();

            const identifier = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            const submitButton = loginForm.querySelector('button[type="submit"]');

            resetErrors();
            
        // Validación básica
        if (!identifier) {
            showError('email', 'Por favor ingresa tu email o teléfono');
            return;
        }
        
        if (!password) {
            showError('password', 'Por favor ingresa tu contraseña');
            return;
        }
            
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<span class="spinner"></span> Iniciando sesión...';
            
        try {
            // Buscar usuario en AppStorage
            const user = AppStorage.findUser(identifier, password);
            
            if (!user) {
                const users = AppStorage.getAllUsers();
                const userExists = users.some(u => 
                    u.email.toLowerCase().trim() === identifier.toLowerCase().trim() || 
                    u.telefono === identifier
                );
                
                if (userExists) {
                    showError('password', 'Contraseña incorrecta');
                } else {
                    showError('email', 'Usuario no registrado');
                }
                throw new Error('Credenciales incorrectas');
            }
                
            // Guardar sesión
            AppStorage.saveUserData(user);
            console.log("Datos de sesión guardados:", {
                currentUser: localStorage.getItem('currentUser'),
                sessionActive: sessionStorage.getItem('sessionActive')
            });
                    
            // Redirección
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error en login:", error);
        }
            
            finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }

        });
    }
});