// Variable global para el carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

//cart.length = 0;

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

// Función para manejar el menú hamburguesa
function setupHamburgerMenu() {
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuIcon && dropdownMenu) {
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Cerrar el menú al hacer clic fuera de él
        document.addEventListener('click', function() {
            if (dropdownMenu.classList.contains('active')) {
                dropdownMenu.classList.remove('active');
                menuIcon.classList.remove('active');
            }
        });

        // Evitar que el menú se cierre al hacer clic dentro de él
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Función para mostrar notificación de carrito
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {

    // Guardar el estado actual primero
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Resto de tu código actual de updateCartDisplay...
    const container = document.getElementById('cartStateContainer');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-message">
                <p>El carrito está vacío</p>
                <p>¡Ve nuestro menú en busca de algo delicioso!</p>
                <p>🍽️😋</p>
            </div>
        `;
    
    } else {
        // Mostrar productos + resumen
        container.innerHTML = `
            <div class="cart-items">
                ${cart.map((item, index) => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">$${item.unitPrice.toFixed(2)} c/u</div>
                        </div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                            <button class="remove-item-btn" data-index="${index}">×</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>$${cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Servicio</span>
                    <span>$30.00</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>$${(cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) + 30).toFixed(2)}</span>
                </div>
                <button class="checkout-btn">Pagar</button>
            </div>
        `;
        
        // Agregar eventos a los nuevos elementos
        addCartEventListeners();
    }
}

function addCartEventListeners() {
    // Eventos para botones de cantidad
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart[index].quantity++;
            updateCartDisplay();
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
            updateCartDisplay();
        });
    });
    
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartDisplay();
        });
    });
    
    // Evento para el botón de pagar
    document.querySelector('.checkout-btn')?.addEventListener('click', function() {
        // Cerrar primero el overlay del carrito
        const cartOverlay = document.getElementById('cartOverlay');
        cartOverlay.classList.remove('active');
        
        setTimeout(() => {
            cartOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Verificar si el usuario está logueado
            if (!AppStorage.isLoggedIn()) {
                const unregisteredOverlay = document.getElementById('unregisteredOverlay');
                unregisteredOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                return; // Detener el proceso si no está logueado
            }
            
            // Si está logueado, continuar con el proceso de pago
            const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
            const shipping = 30;
            const total = subtotal + shipping;
            
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('cartSubtotal', subtotal.toFixed(2));
            localStorage.setItem('cartShipping', shipping.toFixed(2));
            localStorage.setItem('cartTotal', total.toFixed(2));
            
            window.location.href = 'pagar.html';
        }, 300); // Esperar la animación de cierre
    });
}

// Función para mostrar los detalles del producto
function setupProductDetails() {
    const ordenarBtns = document.querySelectorAll('.ordenar-btn');
    const productOverlay = document.getElementById('productOverlay');
    const closeProductBtn = document.getElementById('closeProductBtn');
    
    // Elementos del overlay
    const productTitle = document.getElementById('productTitle');
    const productDescription = document.getElementById('productDescription');
    const productPrice = document.getElementById('productPrice');
    const productQuantity = document.getElementById('productQuantity');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const payBtn = document.querySelector('.pay-btn');

    let currentProduct = null;
    let quantity = 1;
    let price = 0;
    
    // Mostrar overlay al hacer clic en ordenar
    ordenarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentProduct = this.getAttribute('data-producto');
            const descripcion = this.getAttribute('data-descripcion');
            price = parseFloat(this.getAttribute('data-precio'));
            
            productTitle.textContent = currentProduct;
            productDescription.textContent = descripcion;
            productPrice.textContent = `$${price.toFixed(2)}`;
            productQuantity.textContent = '1';
            quantity = 1;
            
            productOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Cerrar overlay
    closeProductBtn.addEventListener('click', function() {
        productOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Aumentar cantidad
    plusBtn.addEventListener('click', function() {
        quantity++;
        productQuantity.textContent = quantity;
        updatePrice();
    });
    
    // Disminuir cantidad
    minusBtn.addEventListener('click', function() {
        if (quantity > 1) {
            quantity--;
            productQuantity.textContent = quantity;
            updatePrice();
        }
    });
    
    // Actualizar precio total
    function updatePrice() {
        const total = price * quantity;
        productPrice.textContent = `$${total.toFixed(2)}`;
    }
    
    // Agregar al carrito
    addToCartBtn.addEventListener('click', function() {
        if (!currentProduct) return;
        
        const product = {
            name: currentProduct,
            description: productDescription.textContent,
            unitPrice: price,
            quantity: quantity
        };
        
        // Buscar si ya existe el producto
        const existingIndex = cart.findIndex(item => 
            item.name === product.name && 
            item.description === product.description
        );
        
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push(product);
        }
        
        // Mostrar notificación y actualizar
        showCartNotification(`${quantity} ${currentProduct} agregado(s)`);
        productOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Resetear valores
        quantity = 1;
        productQuantity.textContent = '1';
        updatePrice();
        
        // ACTUALIZAR LA VISTA DEL CARRITO (FALTABA ESTA LÍNEA)
        updateCartDisplay();
    });

    // Configurar el botón de pagar
    payBtn.addEventListener('click', function() {
        // Cerrar el overlay del producto primero
        productOverlay.style.display = 'none';
        
        // Verificar si el usuario está logueado
        if (!AppStorage.isLoggedIn()) {
            // Mostrar overlay de usuario no registrado
            const unregisteredOverlay = document.getElementById('unregisteredOverlay');
            unregisteredOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            // Si está logueado, preparar el pago directo
            const product = {
                name: currentProduct,
                description: productDescription.textContent,
                unitPrice: price,
                quantity: quantity
            };
            
            // Guardar en localStorage como un carrito con un solo producto
            localStorage.setItem('cart', JSON.stringify([product]));
            localStorage.setItem('cartSubtotal', (price * quantity).toFixed(2));
            localStorage.setItem('cartShipping', '30.00');
            localStorage.setItem('cartTotal', (price * quantity + 30).toFixed(2));
            
            // Redirigir a la página de pago
            window.location.href = 'pagar.html';
        }
        
        // Resetear valores
        quantity = 1;
        productQuantity.textContent = '1';
        updatePrice();
    });

}

// Función para configurar el carrito
function setupCart() {
    const cartText = document.querySelector('.carrito-text');
    const stickyCartBtn = document.querySelector('.sticky-cart-btn');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    
    function openCart() {
        cartOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        cartOverlay.classList.add('active');
        updateCartDisplay(); // Actualizar siempre al abrir
    }

    // Eventos para abrir carrito
    cartText?.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    stickyCartBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
    
    // Cerrar carrito
    closeCartBtn?.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
        setTimeout(() => {
            cartOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    });
    
    // Cerrar al hacer clic fuera
    cartOverlay?.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove('active');
            setTimeout(() => {
                cartOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    });
}

// Función para actualizar los enlaces de cuenta
function updateAccountLinks() {
    const isLoggedIn = checkAuthStatus();
    
    // Actualizar enlace en el menú hamburguesa
    const accountLink = document.querySelector('.dropdown-menu a[href="nuevacuenta.html"]');
    if (accountLink) {
        if (isLoggedIn) {
            accountLink.textContent = 'Perfil';
            accountLink.href = '#';
            accountLink.classList.add('profile-link');
        } else {
            accountLink.textContent = 'Nueva Cuenta';
            accountLink.href = 'nuevacuenta.html';
            accountLink.classList.remove('profile-link');
        }
    }
    
    // Actualizar ícono de cuenta en sticky nav
    const accountIcon = document.querySelector('.sticky-nav a:last-child');
    if (accountIcon) {
        if (isLoggedIn) {
            accountIcon.innerHTML = '<i class="fi fi-rr-user"></i> Perfil';
        } else {
            accountIcon.innerHTML = '<i class="fi fi-rr-user"></i> Cuenta';
        }
    }
}

// Función para cargar datos del perfil
function loadProfileData() {
    // Usar AppStorage para obtener el usuario actual
    const currentUser = AppStorage.getCurrentUser();
    
    if (currentUser) {
        document.getElementById('profileNombre').textContent = currentUser.nombre || 'No especificado';
        document.getElementById('profileEmail').textContent = currentUser.email || 'No especificado';
        
        // Enmascarar teléfono (mostrar solo últimos 4 dígitos)
        const telefono = currentUser.telefono || '';
        document.getElementById('profileTelefono').textContent = 
            telefono.length > 4 ? '*'.repeat(telefono.length - 4) + telefono.slice(-4) : telefono;
    } else {
        // Si no hay usuario, redirigir a login
        window.location.href = 'login.html';
    }
}

// Función para configurar el overlay de perfil
function setupProfileOverlay() {
    const profileOverlay = document.getElementById('profileOverlay');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    function openProfileOverlay() {
        if (AppStorage.isLoggedIn()) {
            loadProfileData();
            profileOverlay.classList.add('active');
        } else {
            window.location.href = 'nuevacuenta.html';
        }
    }

    // Cerrar sesión (ACTUALIZADO)
    logoutBtn.addEventListener('click', () => {
        AppStorage.clearData();
        updateAccountLinks();
        closeProfileOverlay();
        window.location.href = 'index.html';
    });
    
    function closeProfileOverlay() {
        profileOverlay.classList.remove('active');
    }
    
    // Event listeners
    closeProfileBtn.addEventListener('click', closeProfileOverlay);
    profileOverlay.addEventListener('click', (e) => {
        if (e.target === profileOverlay) {
            closeProfileOverlay();
        }
    });
    
    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userData');
        sessionStorage.removeItem('sessionActive');
        updateAccountLinks();
        closeProfileOverlay();
        window.location.href = 'index.html';
    });
    
    // Manejar clics en los enlaces de perfil
    document.querySelector('.sticky-nav a:last-child').addEventListener('click', function(e) {
        e.preventDefault();
        openProfileOverlay();
    });
    
    document.querySelector('.dropdown-menu').addEventListener('click', function(e) {
        const link = e.target.closest('a.profile-link');
        if (link) {
            e.preventDefault();
            openProfileOverlay();
        }
    });
}

// Función para verificar estado de autenticación
function checkAuthStatus() {
    return AppStorage.isLoggedIn();
}








// Función para configurar el overlay de usuario no registrado
function setupUnregisteredOverlay() {
    const createAccountBtn = document.getElementById('createAccountBtn');
    const continueAsGuestBtn = document.getElementById('continueAsGuestBtn');
    const unregisteredOverlay = document.getElementById('unregisteredOverlay');
    
    // Redirigir a crear cuenta
    createAccountBtn.addEventListener('click', function() {
        unregisteredOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        window.location.href = 'nuevacuenta.html';
    });
    
    // Continuar como invitado (cerrar overlay)
    continueAsGuestBtn.addEventListener('click', function() {
        unregisteredOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Cerrar al hacer clic fuera
    unregisteredOverlay.addEventListener('click', function(e) {
        if (e.target === unregisteredOverlay) {
            unregisteredOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeThemeSwitcher();
    handleThemeToggleFocus();
    setupHamburgerMenu();
    setupProductDetails();
    setupCart();
    setupProfileOverlay();
    updateAccountLinks();
    checkAuthStatus();
    setupUnregisteredOverlay();
    
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.init();
    }
});