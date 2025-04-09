// Función para inicializar el switcher de tema
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

document.addEventListener('DOMContentLoaded', function() {
    initializeThemeSwitcher();
    handleThemeToggleFocus();

    // Obtener el carrito desde localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calcular los valores
    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const envio = 30;
    const tarifaServicio = 15;
    const total = subtotal + envio + tarifaServicio;

    // Mostrar productos en la sección izquierda
    const restaurantSection = document.querySelector('.restaurant-info');
    restaurantSection.innerHTML = '<h2>Tu pedido</h2>';
    
    cart.forEach(item => {
        const itemTotal = item.unitPrice * item.quantity;
        restaurantSection.innerHTML += `
            <div class="food-item">
                <div class="food-name">${item.name} (${item.quantity})</div>
                <div class="food-price">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });

    // Actualizar los totales en el resumen
    const summaryContent = document.querySelector('.summary-content');
    
    // Limpiar solo el contenido después del h2
    const summaryItemsHTML = `
        <div class="summary-item">
            <span class="summary-subtotal">Subtotal</span>
            <span class="summary-subtotal">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-subtotal">Envío</span>
            <span class="summary-subtotal">$${envio.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-subtotal">Tarifa de servicio</span>
            <span class="summary-subtotal">$${tarifaServicio.toFixed(2)}</span>
        </div>
    `;
    
    // Insertar después del h2
    const h2 = summaryContent.querySelector('h2');
    h2.insertAdjacentHTML('afterend', summaryItemsHTML);

    // Actualizar el display del total
    const totalDisplay = document.querySelector('.order-actions .total-display span');
    if (totalDisplay) {
        totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Configurar botón de pedido
    document.querySelector('.place-order-btn').addEventListener('click', function() {
        alert(`Pedido realizado con éxito! Total: $${total.toFixed(2)}`);
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    });

    // Manejar el botón de regreso al menú
    document.getElementById('back-to-menu').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Guardar el carrito actual en localStorage por si acaso
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Redirigir conservando el carrito
        window.location.href = 'index.html';
    });

});