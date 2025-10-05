// Sistema de administración de pizzería con backend
class PizzeriaAdmin {
    constructor() {
        this.pizzaData = {};
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPizzaData();
        await this.loadWhatsAppConfig();
    }

    // Cargar datos desde el backend
    async loadPizzaData() {
        try {
            const response = await fetch('/api/pizzas');
            if (response.ok) {
                this.pizzaData = await response.json();
                this.updatePizzaDisplay();
            }
        } catch (error) {
            console.error('Error cargando datos de pizzas:', error);
        }
    }

    // Cargar configuración de WhatsApp desde el backend
    async loadWhatsAppConfig() {
        try {
            const response = await fetch('/api/whatsapp-config');
            if (response.ok) {
                const config = await response.json();
                const input = document.getElementById('whatsapp-number');
                if (input) {
                    input.value = config.whatsappNumber || '543516351524';
                }
            }
        } catch (error) {
            console.error('Error cargando configuración WhatsApp:', error);
        }
    }

    setupEventListeners() {
        // Botón para abrir panel admin
        document.getElementById('admin-btn').addEventListener('click', () => {
            this.openAdminPanel();
        });

        // Botón para cerrar panel admin
        document.getElementById('close-admin').addEventListener('click', () => {
            this.closeAdminPanel();
        });

        // Botón para resetear datos
        document.getElementById('reset-admin').addEventListener('click', () => {
            this.resetAdminData();
        });

        // Cerrar panel al hacer clic fuera
        document.getElementById('admin-panel').addEventListener('click', (e) => {
            if (e.target.id === 'admin-panel') {
                this.closeAdminPanel();
            }
        });

        // Autenticación
        document.getElementById('admin-login-btn').addEventListener('click', () => {
            this.authenticateAdmin();
        });

        // Enter en el campo de contraseña
        document.getElementById('admin-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticateAdmin();
            }
        });

        // Configuración de WhatsApp
        document.getElementById('save-whatsapp').addEventListener('click', () => {
            this.saveWhatsAppNumber();
        });
    }

    // Autenticar admin
    async authenticateAdmin() {
        const password = document.getElementById('admin-password').value;
        
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const result = await response.json();

            if (result.success) {
                this.isAuthenticated = true;
                document.getElementById('admin-login').style.display = 'none';
                document.getElementById('admin-content').style.display = 'block';
                this.showPizzasList();
            } else {
                alert('Contraseña incorrecta');
                document.getElementById('admin-password').value = '';
            }
        } catch (error) {
            console.error('Error en autenticación:', error);
            alert('Error de conexión');
        }
    }

    // Guardar número de WhatsApp
    async saveWhatsAppNumber() {
        const number = document.getElementById('whatsapp-number').value.trim();
        
        if (!number) {
            alert('Por favor ingrese un número de WhatsApp');
            return;
        }

        try {
            const response = await fetch('/api/whatsapp-config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ whatsappNumber: number }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Número de WhatsApp actualizado correctamente');
            } else {
                alert('Error al actualizar el número');
            }
        } catch (error) {
            console.error('Error guardando número WhatsApp:', error);
            alert('Error de conexión');
        }
    }

    // Mostrar lista de pizzas para editar
    showPizzasList() {
        const pizzasContainer = document.getElementById('pizzas-list');
        pizzasContainer.innerHTML = '';

        // Lista de pizzas disponibles
        const pizzas = [
            { id: 'comun', name: 'Pizza Común' },
            { id: 'especial', name: 'Pizza Especial' },
            { id: 'napolitana', name: 'Pizza Napolitana' },
            { id: 'choclo', name: 'Pizza de Choclo' },
            { id: 'jamon-queso', name: 'Jamón y Queso' },
            { id: 'pepperoni', name: 'Pepperoni' },
            { id: 'cuatro-quesos', name: 'Cuatro Quesos' },
            { id: 'vegetal', name: 'Pizza Vegetal' },
            { id: 'hawaiana', name: 'Pizza Hawaiana' },
            { id: 'barbacoa', name: 'Pizza Barbacoa' },
            { id: 'margherita', name: 'Pizza Margherita' },
            { id: 'mexicana', name: 'Pizza Mexicana' }
        ];

        pizzas.forEach(pizza => {
            const pizzaData = this.pizzaData[pizza.id] || {};
            
            const pizzaCard = document.createElement('div');
            pizzaCard.className = 'admin-pizza-card';
            pizzaCard.innerHTML = `
                <h3>${pizza.name}</h3>
                <div class="admin-pizza-form">
                    <div class="price-inputs">
                        <label>Precio Entera:</label>
                        <input type="number" id="entire-${pizza.id}" value="${pizzaData.entirePrice || ''}" placeholder="0">
                        
                        <label>Precio Media:</label>
                        <input type="number" id="half-${pizza.id}" value="${pizzaData.halfPrice || ''}" placeholder="0">
                    </div>
                    
                    <div class="ingredients-section">
                        <label>Ingredientes:</label>
                        <textarea id="ingredients-${pizza.id}" placeholder="Ej: Salsa, mozzarella, jamón, oregano..." 
                                rows="3">${pizzaData.ingredients || ''}</textarea>
                    </div>
                    
                    <div class="image-upload">
                        <label>Imagen actual:</label>
                        <img src="${pizzaData.imageUrl ? pizzaData.imageUrl : `images/${pizza.id}.jfif`}" 
                             alt="${pizza.name}" class="current-image">
                        
                        <label>Nueva imagen:</label>
                        <input type="file" id="image-${pizza.id}" accept="image/*">
                    </div>
                    
                    <div class="admin-buttons">
                        <button onclick="pizzeriaAdmin.updatePizzaData('${pizza.id}')" class="save-btn">
                            Guardar Todo
                        </button>
                        <button onclick="pizzeriaAdmin.uploadImage('${pizza.id}')" class="upload-btn">
                            Subir Imagen
                        </button>
                    </div>
                </div>
            `;
            
            pizzasContainer.appendChild(pizzaCard);
        });
    }

    // Actualizar datos completos de pizza (precio e ingredientes)
    async updatePizzaData(pizzaId) {
        const entirePrice = document.getElementById(`entire-${pizzaId}`).value;
        const halfPrice = document.getElementById(`half-${pizzaId}`).value;
        const ingredients = document.getElementById(`ingredients-${pizzaId}`).value;

        if (!entirePrice || !halfPrice) {
            alert('Por favor complete ambos precios');
            return;
        }

        try {
            const response = await fetch(`/api/pizzas/${pizzaId}/data`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entirePrice: parseFloat(entirePrice),
                    halfPrice: parseFloat(halfPrice),
                    ingredients: ingredients.trim()
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Datos de pizza actualizados correctamente');
                await this.loadPizzaData(); // Recargar datos
            } else {
                alert('Error al actualizar datos');
            }
        } catch (error) {
            console.error('Error actualizando datos de pizza:', error);
            alert('Error de conexión');
        }
    }

    // Mantener función de precio para compatibilidad
    async updatePizzaPrice(pizzaId) {
        return this.updatePizzaData(pizzaId);
    }

    // Subir imagen
    async uploadImage(pizzaId) {
        const fileInput = document.getElementById(`image-${pizzaId}`);
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor seleccione una imagen');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`/api/pizzas/${pizzaId}/image`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert('Imagen subida correctamente');
                await this.loadPizzaData(); // Recargar datos
                this.showPizzasList(); // Actualizar lista
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            alert('Error de conexión');
        }
    }

    // Actualizar visualización de pizzas en el menú principal
    updatePizzaDisplay() {
        Object.keys(this.pizzaData).forEach(pizzaId => {
            const pizzaData = this.pizzaData[pizzaId];
            
            // Actualizar precios
            if (pizzaData.entirePrice) {
                const entirePriceElement = document.querySelector(`[data-pizza="${pizzaId}"] .price-entire`);
                if (entirePriceElement) {
                    entirePriceElement.textContent = `$${pizzaData.entirePrice}`;
                }
            }
            
            if (pizzaData.halfPrice) {
                const halfPriceElement = document.querySelector(`[data-pizza="${pizzaId}"] .price-half`);
                if (halfPriceElement) {
                    halfPriceElement.textContent = `$${pizzaData.halfPrice}`;
                }
            }
            
            // Actualizar ingredientes
            if (pizzaData.ingredients) {
                const descriptionElement = document.querySelector(`[data-pizza="${pizzaId}"] .pizza-description`);
                if (descriptionElement) {
                    descriptionElement.textContent = pizzaData.ingredients;
                }
            }
            
            // Actualizar imagen
            if (pizzaData.imageUrl) {
                const imageElement = document.querySelector(`[data-pizza="${pizzaId}"] img`);
                if (imageElement) {
                    imageElement.src = pizzaData.imageUrl;
                }
            }
        });
    }

    // Resetear datos
    resetAdminData() {
        if (confirm('¿Está seguro de que desea resetear todos los datos? Esta acción no se puede deshacer.')) {
            alert('Función de reset no implementada en el backend. Contacte al desarrollador.');
        }
    }

    // Abrir panel admin
    openAdminPanel() {
        document.getElementById('admin-panel').style.display = 'flex';
        if (!this.isAuthenticated) {
            document.getElementById('admin-login').style.display = 'block';
            document.getElementById('admin-content').style.display = 'none';
            document.getElementById('admin-password').focus();
        } else {
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            this.showPizzasList();
        }
    }

    // Cerrar panel admin
    closeAdminPanel() {
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('admin-password').value = '';
    }
}

// Inicializar el sistema de administración
let pizzeriaAdmin;
document.addEventListener('DOMContentLoaded', () => {
    pizzeriaAdmin = new PizzeriaAdmin();
});