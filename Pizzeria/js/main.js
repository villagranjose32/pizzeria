// Sistema de carrito de pizzas con integración WhatsApp
class PizzeriaCart {
    constructor() {
        this.cart = [];
        this.total = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Event listeners para botones de cantidad
        document.querySelectorAll('.btn-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeQuantity(e.target);
            });
        });

        // Event listeners para botones pedir
        document.querySelectorAll('.btn-pedir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addToCart(e.target);
            });
        });

        // Event listener para finalizar pedido
        document.getElementById('btn-finalizar').addEventListener('click', () => {
            this.finalizarPedido();
        });
    }

    changeQuantity(btn) {
        let currentQuantity = parseInt(btn.textContent);
        currentQuantity = currentQuantity >= 5 ? 1 : currentQuantity + 1;
        btn.textContent = currentQuantity;
        btn.setAttribute('data-quantity', currentQuantity);
    }

    addToCart(btn) {
        const pizzaCard = btn.closest('.pizza-card');
        const pizzaTitle = pizzaCard.querySelector('.pizza-title').textContent;
        const pizzaPrice = parseInt(pizzaCard.querySelector('.pizza-price').textContent.replace('$', ''));
        const quantityBtn = pizzaCard.querySelector('.btn-quantity');
        const quantity = parseInt(quantityBtn.getAttribute('data-quantity'));

        // Buscar si la pizza ya está en el carrito
        const existingItem = this.cart.find(item => item.name === pizzaTitle);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                name: pizzaTitle,
                price: pizzaPrice,
                quantity: quantity
            });
        }

        // Resetear cantidad a 1 después de agregar
        quantityBtn.textContent = '1';
        quantityBtn.setAttribute('data-quantity', '1');

        this.updateDisplay();
        this.showAddedMessage(pizzaTitle, quantity);
    }

    showAddedMessage(pizzaName, quantity) {
        // Crear mensaje temporal
        const message = document.createElement('div');
        message.className = 'added-message';
        message.textContent = `${quantity} ${pizzaName} agregada al pedido`;
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
            document.body.removeChild(message);
        }, 2000);
    }

    updateDisplay() {
        this.calculateTotal();
        this.displayCartItems();
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

        const cartHTML = this.cart.map(item => `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold;">${item.name}</span>
                <span style="color: #666;">x${item.quantity}</span>
                <span style="font-weight: bold; color: #e74c3c;">$${item.price * item.quantity}</span>
                <button onclick="pizzaCart.removeFromCart('${item.name}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
        `).join('');

        cartItemsContainer.innerHTML = cartHTML;
    }

    removeFromCart(pizzaName) {
        this.cart = this.cart.filter(item => item.name !== pizzaName);
        this.updateDisplay();
    }

    finalizarPedido() {
        // Validar campos obligatorios
        const nombre = document.getElementById('nombre').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const telefono = document.getElementById('telefono').value.trim();

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

        if (!telefono) {
            alert('Por favor, ingresa tu número de teléfono');
            document.getElementById('telefono').focus();
            return;
        }

        if (this.cart.length === 0) {
            alert('No hay productos en el carrito. Agrega algunas pizzas antes de finalizar el pedido.');
            return;
        }

        this.enviarWhatsApp(nombre, direccion, telefono);
    }

    enviarWhatsApp(nombre, direccion, telefono) {
        // Número de WhatsApp de la pizzería (reemplaza con el número real)
        const numeroWhatsApp = '5491120290381'; // Número actualizado de la pizzería
        
        // Construir mensaje para WhatsApp
        let mensaje = `🍕 *NUEVO PEDIDO DE PIZZERÍA* 🍕\n\n`;
        mensaje += `👤 *Cliente:* ${nombre}\n`;
        mensaje += `📍 *Dirección:* ${direccion}\n`;
        mensaje += `📱 *Teléfono:* ${telefono}\n\n`;
        mensaje += `🛒 *DETALLE DEL PEDIDO:*\n`;
        mensaje += `${'-'.repeat(30)}\n`;

        this.cart.forEach(item => {
            mensaje += `• ${item.name} x${item.quantity} - $${item.price * item.quantity}\n`;
        });

        mensaje += `${'-'.repeat(30)}\n`;
        mensaje += `💰 *TOTAL: $${this.total}*\n\n`;
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

    limpiarCarrito() {
        this.cart = [];
        this.updateDisplay();
        
        // Limpiar formulario
        document.getElementById('nombre').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('telefono').value = '';
    }
}

// Inicializar el sistema cuando se carga la página
let pizzaCart;
document.addEventListener('DOMContentLoaded', () => {
    pizzaCart = new PizzeriaCart();
});