// Sistema de carrito de pizzas con integración WhatsApp
class PizzeriaCart {
    constructor() {
        this.cart = [];
        this.total = 0;
        this.deliveryType = 'delivery'; // Por defecto envío a domicilio
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Event listeners para botones de tipo de pizza (Entera/Media)
        this.attachPizzaTypeListeners();

        // Event listeners para botones pedir
        this.attachPedirListeners();

        // Event listener para finalizar pedido
        document.getElementById('btn-finalizar').addEventListener('click', () => {
            this.finalizarPedido();
        });

        // Event listeners para el carrito
        document.getElementById('cart-btn').addEventListener('click', () => {
            this.openCartPanel();
        });

        document.getElementById('close-cart').addEventListener('click', () => {
            this.closeCartPanel();
        });

        document.getElementById('clear-cart').addEventListener('click', () => {
            this.clearCart();
        });

        document.getElementById('continue-shopping').addEventListener('click', () => {
            this.closeCartPanel();
        });

        document.getElementById('proceed-checkout').addEventListener('click', () => {
            this.proceedToCheckout();
        });

        // Cerrar carrito al hacer clic fuera
        document.getElementById('cart-panel').addEventListener('click', (e) => {
            if (e.target.id === 'cart-panel') {
                this.closeCartPanel();
            }
        });

        // Event listeners para opciones de entrega
        document.getElementById('delivery-btn').addEventListener('click', () => {
            this.setDeliveryType('delivery');
        });

        document.getElementById('pickup-btn').addEventListener('click', () => {
            this.setDeliveryType('pickup');
        });
    }

    attachPizzaTypeListeners() {
        document.querySelectorAll('.btn-pizza-type').forEach(btn => {
            btn.removeEventListener('click', this.togglePizzaType);
            btn.addEventListener('click', (e) => {
                this.togglePizzaType(e.target);
            });
        });
    }

    attachPedirListeners() {
        document.querySelectorAll('.btn-pedir').forEach(btn => {
            btn.removeEventListener('click', this.addToCart);
            btn.addEventListener('click', (e) => {
                this.addToCart(e.target);
            });
        });
    }

    togglePizzaType(btn) {
        const currentType = btn.getAttribute('data-type');
        if (currentType === 'entera') {
            btn.setAttribute('data-type', 'media');
            btn.textContent = 'Media';
            btn.classList.add('media');
        } else {
            btn.setAttribute('data-type', 'entera');
            btn.textContent = 'Entera';
            btn.classList.remove('media');
        }
    }

    addToCart(btn) {
        const pizzaCard = btn.closest('.pizza-card');
        const pizzaTitle = pizzaCard.querySelector('.pizza-title').textContent;
        const pizzaPriceElement = pizzaCard.querySelector('.pizza-price');
        const basePrice = parseInt(pizzaPriceElement.textContent.replace('$', ''));
        const typeBtn = pizzaCard.querySelector('.btn-pizza-type');
        const pizzaType = typeBtn.getAttribute('data-type');
        
        // Calcular precio según el tipo (media pizza = 60% del precio)
        const pizzaPrice = pizzaType === 'media' ? Math.round(basePrice * 0.6) : basePrice;
        const pizzaDescription = `${pizzaTitle} (${pizzaType === 'entera' ? 'Entera' : 'Media'})`;

        // Buscar si la pizza con el mismo tipo ya está en el carrito
        const existingItem = this.cart.find(item => 
            item.name === pizzaTitle && item.type === pizzaType
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: pizzaTitle,
                type: pizzaType,
                description: pizzaDescription,
                price: pizzaPrice,
                quantity: 1
            });
        }

        this.updateDisplay();
        this.showAddedMessage(pizzaDescription, 1);
        this.updateCartCount();
    }

    setDeliveryType(type) {
        this.deliveryType = type;
        
        // Actualizar botones activos
        document.querySelectorAll('.delivery-option').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (type === 'delivery') {
            document.getElementById('delivery-btn').classList.add('active');
            this.showAddressField();
        } else {
            document.getElementById('pickup-btn').classList.add('active');
            this.hideAddressField();
        }
    }

    showAddressField() {
        const container = document.getElementById('direccion-container');
        const input = document.getElementById('direccion');
        
        container.classList.remove('hidden');
        input.required = true;
        input.placeholder = 'Ingresa tu dirección completa';
    }

    hideAddressField() {
        const container = document.getElementById('direccion-container');
        const input = document.getElementById('direccion');
        
        container.classList.add('hidden');
        input.required = false;
        input.value = ''; // Limpiar el campo
    }

    showAddedMessage(pizzaDescription, quantity) {
        // Crear mensaje temporal
        const message = document.createElement('div');
        message.className = 'added-message';
        message.textContent = `${quantity} ${pizzaDescription} agregada al pedido`;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(message);
        
        // Remover mensaje después de 2 segundos
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 2000);
    }

    updateDisplay() {
        this.calculateTotal();
        this.displayCartItems();
        this.updateCartCount();
        document.getElementById('total').value = `$${this.total}`;
    }

    calculateTotal() {
        this.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        
        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color: #666; font-style: italic;">No hay productos en el carrito</p>';
            return;
        }

        const cartHTML = this.cart.map((item, index) => `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                    <span style="font-weight: bold;">${item.description}</span>
                    <div style="font-size: 0.9em; color: #888;">$${item.price} c/u</div>
                </div>
                <span style="color: #666; margin: 0 10px;">x${item.quantity}</span>
                <span style="font-weight: bold; color: #e74c3c; margin: 0 10px;">$${item.price * item.quantity}</span>
                <button onclick="pizzaCart.removeFromCart(${index})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
        `).join('');

        cartItemsContainer.innerHTML = cartHTML;
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateDisplay();
    }

    finalizarPedido() {
        // Validar campos obligatorios
        const nombre = document.getElementById('nombre').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const observaciones = document.getElementById('observaciones').value.trim();

        if (!nombre) {
            alert('Por favor, ingresa tu nombre y apellido');
            document.getElementById('nombre').focus();
            return;
        }

        if (!direccion) {
            alert('Por favor, ingresa la dirección de envío');
            document.getElementById('direccion').focus();
            return;
        }

        if (this.cart.length === 0) {
            alert('No hay productos en el carrito. Agrega algunas pizzas antes de finalizar el pedido.');
            return;
        }

        this.enviarWhatsApp(nombre, direccion, observaciones);
    }

    enviarWhatsApp(nombre, direccion, observaciones) {
        // Obtener número de WhatsApp desde el admin o usar el por defecto
        let numeroWhatsApp = '54930290381'; // Número por defecto
        
        // Si el admin está disponible, usar el número configurado
        if (window.pizzaAdmin) {
            numeroWhatsApp = pizzaAdmin.getWhatsAppNumber();
        }
        
        // Construir mensaje para WhatsApp
        let mensaje = `🍕 *NUEVO PEDIDO DE PIZZERÍA* 🍕\n\n`;
        mensaje += `👤 *Cliente:* ${nombre}\n`;
        mensaje += `📍 *Dirección:* ${direccion}\n\n`;
        
        if (observaciones) {
            mensaje += `📝 *Observaciones:* ${observaciones}\n\n`;
        }
        
        mensaje += `🛒 *DETALLE DEL PEDIDO:*\n`;
        mensaje += `${'-'.repeat(40)}\n`;

        this.cart.forEach(item => {
            mensaje += `• ${item.description}\n`;
            mensaje += `  Cantidad: ${item.quantity} - Precio: $${item.price} c/u\n`;
            mensaje += `  Subtotal: $${item.price * item.quantity}\n\n`;
        });

        mensaje += `${'-'.repeat(40)}\n`;
        mensaje += `💰 *TOTAL GENERAL: $${this.total}*\n\n`;
        mensaje += `⏰ Fecha: ${new Date().toLocaleDateString('es-AR')}\n`;
        mensaje += `🕐 Hora: ${new Date().toLocaleTimeString('es-AR')}`;

        // Codificar mensaje para URL
        const mensajeCodificado = encodeURIComponent(mensaje);
        
        // Crear URL de WhatsApp
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
        
        // Abrir WhatsApp
        window.open(urlWhatsApp, '_blank');
        
        // Mostrar confirmación y limpiar carrito
        this.mostrarConfirmacion();
        this.limpiarCarrito();
    }

    mostrarConfirmacion() {
        const confirmacion = document.createElement('div');
        confirmacion.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        confirmacion.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <h3 style="color: #27ae60; margin-bottom: 20px;">✅ ¡Pedido Enviado!</h3>
                <p style="margin-bottom: 20px;">Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto para confirmar los detalles.</p>
                <button onclick="document.body.removeChild(this.parentElement.parentElement)" 
                        style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Cerrar
                </button>
            </div>
        `;
        
        document.body.appendChild(confirmacion);
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = totalItems;
    }

    openCartPanel() {
        document.getElementById('cart-panel').style.display = 'flex';
        this.displayCartDetails();
    }

    closeCartPanel() {
        document.getElementById('cart-panel').style.display = 'none';
    }

    displayCartDetails() {
        const cartDetails = document.getElementById('cart-details');
        
        if (this.cart.length === 0) {
            cartDetails.innerHTML = `
                <div class="empty-cart">
                    <h3>🛒 Tu carrito está vacío</h3>
                    <p>Agrega algunas pizzas deliciosas para comenzar tu pedido</p>
                </div>
            `;
            return;
        }

        let cartHTML = '';
        this.cart.forEach((item, index) => {
            cartHTML += `
                <div class="cart-item-detail">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.description}</div>
                        <div class="cart-item-description">Precio unitario: $${item.price}</div>
                        <div class="cart-item-price">Subtotal: $${item.price * item.quantity}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="qty-btn" onclick="pizzaCart.changeItemQuantity(${index}, -1)">-</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" onclick="pizzaCart.changeItemQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="pizzaCart.removeFromCart(${index})">🗑️</button>
                    </div>
                </div>
            `;
        });

        cartHTML += `
            <div class="cart-total">
                <div class="cart-total-text">Total del pedido:</div>
                <div class="cart-total-amount">$${this.total}</div>
            </div>
        `;

        cartDetails.innerHTML = cartHTML;
    }

    changeItemQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity += change;
            if (this.cart[index].quantity <= 0) {
                this.cart.splice(index, 1);
            }
            this.updateDisplay();
            this.displayCartDetails();
        }
    }

    clearCart() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            this.cart = [];
            this.updateDisplay();
            this.displayCartDetails();
        }
    }

    proceedToCheckout() {
        this.closeCartPanel();
        // Scroll hacia el formulario de pedido
        document.querySelector('.order-summary').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    limpiarCarrito() {
        this.cart = [];
        this.updateDisplay();
        
        // Limpiar formulario
        document.getElementById('nombre').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('observaciones').value = '';
        
        // Resetear todos los botones a "Entera"
        document.querySelectorAll('.btn-pizza-type').forEach(btn => {
            btn.setAttribute('data-type', 'entera');
            btn.textContent = 'Entera';
            btn.classList.remove('media');
        });
    }
}

// Inicializar el sistema cuando se carga la página
let pizzaCart;
document.addEventListener('DOMContentLoaded', () => {
    pizzaCart = new PizzeriaCart();
});