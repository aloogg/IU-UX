document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicialización de componentes según lo que exista en la página
    initMenu();
    initOverlays();
    initSkipLink();
    initThemeToggle();
    initFocusManagement();
    initInteractiveElements();
});

// 1. Manejo del menú hamburguesa (solo si existe en la página)
function initMenu() {
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (!menuIcon || !dropdownMenu) return; // Salir si no existe en esta página
    
    const menuItems = dropdownMenu.querySelectorAll('[role="menuitem"]');
    
    // Configurar ARIA inicial
    menuIcon.setAttribute('aria-expanded', 'false');
    menuIcon.setAttribute('aria-controls', 'dropdownMenu');
    menuIcon.setAttribute('role', 'button');
    
    // Eventos
    menuIcon.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        } else if (e.key === 'Escape' && dropdownMenu.style.display === 'block') {
            closeMenu();
        }
    });
    
    menuIcon.addEventListener('click', toggleMenu);
    
    dropdownMenu.addEventListener('keydown', function(e) {
        if (!menuItems.length) return;
        
        if (e.key === 'Escape') {
            closeMenu();
            menuIcon.focus();
        }
        
        if (!e.shiftKey && e.key === 'Tab' && e.target === menuItems[menuItems.length - 1]) {
            e.preventDefault();
            menuIcon.focus();
            closeMenu();
        }
        
        if (e.shiftKey && e.key === 'Tab' && e.target === menuItems[0]) {
            e.preventDefault();
            menuIcon.focus();
            closeMenu();
        }
    });
    
    function toggleMenu() {
        const isExpanded = menuIcon.getAttribute('aria-expanded') === 'true';
        menuIcon.setAttribute('aria-expanded', !isExpanded);
        dropdownMenu.style.display = isExpanded ? 'none' : 'block';
        
        if (!isExpanded) {
            menuItems.forEach(item => item.setAttribute('tabindex', '0'));
            menuItems[0]?.focus();
        } else {
            menuItems.forEach(item => item.setAttribute('tabindex', '-1'));
        }
    }
    
    function closeMenu() {
        menuIcon.setAttribute('aria-expanded', 'false');
        dropdownMenu.style.display = 'none';
        menuItems.forEach(item => item.setAttribute('tabindex', '-1'));
    }
}

// 2. Manejo genérico de overlays/modales
function initOverlays() {
    // Selector para identificar overlays (puedes ajustarlo según tus clases)
    const overlays = document.querySelectorAll('[role="dialog"], .overlay, [aria-modal="true"]');
    
    overlays.forEach(overlay => {
        // Configurar ARIA inicial
        overlay.setAttribute('aria-hidden', 'true');
        
        // Buscar botón de cierre (puede tener varias clases comunes)
        const closeButton = overlay.querySelector('.close-btn, .close-button, [aria-label*="cerrar"]');
        
        // Manejar teclado en overlay
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                overlay.setAttribute('aria-hidden', 'true');
                overlay.style.display = 'none';
                
                // Enfocar el elemento que abrió el overlay si tiene aria-controls
                const opener = document.querySelector(`[aria-controls="${overlay.id}"]`);
                opener?.focus();
            }
            
            // Trap focus dentro del overlay
            if (e.key === 'Tab') {
                const focusableElements = overlay.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
        
        // Configurar botón de cierre si existe
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                overlay.setAttribute('aria-hidden', 'true');
                overlay.style.display = 'none';
            });
            
            closeButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    });
}

// 3. Skip link (solo si existe)
function initSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink) return;
    
    skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.addEventListener('blur', function() {
                target.removeAttribute('tabindex');
            }, { once: true });
        }
    });
}

// 4. Tema oscuro/claro (solo si existe)
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
}

// 5. Manejo de foco para todos los elementos interactivos
function initFocusManagement() {
    const interactiveElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    interactiveElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid #4D90FE';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// 6. Mejorar accesibilidad de elementos interactivos genéricos
function initInteractiveElements() {
    // Botones genéricos (incluye los de ordenar)
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Enlaces que actúan como botones
    document.querySelectorAll('a[role="button"]').forEach(link => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}