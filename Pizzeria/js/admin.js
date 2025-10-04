// Sistema de administración de pizzería
class PizzeriaAdmin {
    constructor() {
        this.pizzaData = this.loadPizzaData();
        this.shouldUpdateMenu = false; // Controlar cuándo recrear el menú
        this.hasAdminChanges = false; // Controlar si hay cambios del admin
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Solo actualizar el menú si hay cambios del admin
        if (this.hasAdminChanges) {
            this.shouldUpdateMenu = true;
            this.updateMenuDisplay();
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
            this.resetToDefault();
        });

        // Botón para agregar nueva pizza
        document.getElementById('add-pizza-btn').addEventListener('click', () => {
            this.addNewPizza();
        });

        // Cerrar panel al hacer clic fuera
        document.getElementById('admin-panel').addEventListener('click', (e) => {
            if (e.target.id === 'admin-panel') {
                this.closeAdminPanel();
            }
        });
    }

    loadPizzaData() {
        // Datos por defecto basados en el HTML actual
        const defaultData = [
            { id: 1, name: 'Especial', description: 'Salsa, muzza norrella', price: 4000, image: 'images/especial.jpg' },
            { id: 2, name: 'Común', description: 'Salsa, mozzarella', price: 4200, image: 'images/comun.jpg' },
            { id: 3, name: 'Choclo', description: 'Salsa, mozzarella, choclo', price: 4200, image: 'images/choclo.jpg' },
            { id: 4, name: 'Muzzarella', description: 'Salsa, mozzarella, orégano', price: 4000, image: 'images/muzzarella.jpg' },
            { id: 5, name: 'Napolitana', description: 'Salsa, mozzarella, tomate, ajo', price: 4300, image: 'images/napolitana.jpg' },
            { id: 6, name: 'Fugazzetta', description: 'Muzzarella, orégano, cebolla', price: 4300, image: 'images/fugazzetta.jpg' },
            { id: 7, name: 'Calabresa', description: 'Muzzarella, peperoni, orégano', price: 4400, image: 'images/calabresa.jpg' },
            { id: 8, name: 'Ananá', description: 'Salsa, mozzarella, piña', price: 4200, image: 'images/anana.jpg' },
            { id: 9, name: 'Palmitos', description: 'Salsa, mozzarella, palmitos, salsa golf', price: 4500, image: 'images/palmitos.jpg' },
            { id: 10, name: 'Rúcula', description: 'Salsa, muzzarella, rúcula, parmesano', price: 4400, image: 'images/rucula.jpg' },
            { id: 11, name: 'Primavera', description: 'Salsa, muzzarella, jamón, tomate', price: 4400, image: 'images/primavera.jpg' },
            { id: 12, name: '4 Quesos', description: 'Muzzarella, parmesano, queso azul, fontina', price: 4500, image: 'images/4quesos.jpg' }
        ];

        // Cargar datos guardados o usar datos por defecto
        const savedData = localStorage.getItem('pizzaData');
        const hasChanges = localStorage.getItem('hasAdminChanges') === 'true';
        
        if (savedData && hasChanges) {
            this.hasAdminChanges = true;
            return JSON.parse(savedData);
        } else {
            // Si no hay cambios del admin, usar datos por defecto
            this.hasAdminChanges = false;
            return defaultData;
        }
    }

    savePizzaData() {
        localStorage.setItem('pizzaData', JSON.stringify(this.pizzaData));
        localStorage.setItem('hasAdminChanges', 'true');
        this.hasAdminChanges = true;
    }

    resetToDefault() {
        // Método para volver a los datos originales
        if (confirm('¿Estás seguro de que quieres restablecer todas las pizzas a sus valores originales? Se perderán todos los cambios realizados.')) {
            localStorage.removeItem('pizzaData');
            localStorage.removeItem('hasAdminChanges');
            this.hasAdminChanges = false;
            this.pizzaData = this.loadPizzaData();
            this.closeAdminPanel();
            location.reload(); // Recargar página para mostrar datos originales
        }
    }

    openAdminPanel() {
        // Solicitar contraseña
        const password = prompt('Ingrese la contraseña de administrador:');
        
        if (password !== 'Lucas351524') {
            alert('Contraseña incorrecta. Acceso denegado.');
            return;
        }
        
        document.getElementById('admin-panel').style.display = 'flex';
        this.loadAdminPanel();
    }

    closeAdminPanel() {
        document.getElementById('admin-panel').style.display = 'none';
    }

    loadAdminPanel() {
        const adminList = document.getElementById('admin-pizza-list');
        adminList.innerHTML = '';

        this.pizzaData.forEach(pizza => {
            const pizzaItem = document.createElement('div');
            pizzaItem.className = 'admin-pizza-item';
            pizzaItem.innerHTML = `
                <img src="${pizza.image}" alt="${pizza.name}" class="admin-pizza-image" onerror="this.src='images/placeholder.jpg'">
                <div class="admin-pizza-info">
                    <input type="text" value="${pizza.name}" onchange="pizzaAdmin.updatePizza(${pizza.id}, 'name', this.value)">
                    <textarea onchange="pizzaAdmin.updatePizza(${pizza.id}, 'description', this.value)">${pizza.description}</textarea>
                    <input type="number" value="${pizza.price}" min="0" onchange="pizzaAdmin.updatePizza(${pizza.id}, 'price', parseInt(this.value))">
                </div>
                <div class="admin-pizza-actions">
                    <button class="admin-btn change-image" onclick="pizzaAdmin.changeImage(${pizza.id})">📷 Cambiar Imagen</button>
                    <button class="admin-btn delete" onclick="pizzaAdmin.deletePizza(${pizza.id})">🗑️ Eliminar</button>
                </div>
            `;
            adminList.appendChild(pizzaItem);
        });
    }

    updatePizza(id, field, value) {
        const pizza = this.pizzaData.find(p => p.id === id);
        if (pizza) {
            pizza[field] = value;
            this.savePizzaData();
            // Solo marcamos para actualizar el menú si es una imagen
            if (field === 'image') {
                this.shouldUpdateMenu = true;
            }
            this.updateMenuDisplay();
        }
    }

    changeImage(id) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    this.updatePizza(id, 'image', imageData);
                    this.loadAdminPanel(); // Recargar panel para mostrar nueva imagen
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    deletePizza(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta pizza?')) {
            this.pizzaData = this.pizzaData.filter(p => p.id !== id);
            this.savePizzaData();
            this.shouldUpdateMenu = true; // Recrear menú cuando se elimina
            this.loadAdminPanel();
            this.updateMenuDisplay();
        }
    }

    addNewPizza() {
        const name = document.getElementById('new-pizza-name').value.trim();
        const description = document.getElementById('new-pizza-description').value.trim();
        const price = parseInt(document.getElementById('new-pizza-price').value);
        const imageFile = document.getElementById('new-pizza-image').files[0];

        if (!name || !description || !price) {
            alert('Por favor, completa todos los campos obligatorios (nombre, descripción y precio)');
            return;
        }

        const newId = Math.max(...this.pizzaData.map(p => p.id)) + 1;
        const newPizza = {
            id: newId,
            name: name,
            description: description,
            price: price,
            image: 'images/placeholder.jpg' // Imagen por defecto
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPizza.image = e.target.result;
                this.pizzaData.push(newPizza);
                this.savePizzaData();
                this.shouldUpdateMenu = true; // Recrear menú cuando se agrega
                this.loadAdminPanel();
                this.updateMenuDisplay();
                this.clearNewPizzaForm();
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.pizzaData.push(newPizza);
            this.savePizzaData();
            this.shouldUpdateMenu = true; // Recrear menú cuando se agrega
            this.loadAdminPanel();
            this.updateMenuDisplay();
            this.clearNewPizzaForm();
        }
    }

    clearNewPizzaForm() {
        document.getElementById('new-pizza-name').value = '';
        document.getElementById('new-pizza-description').value = '';
        document.getElementById('new-pizza-price').value = '';
        document.getElementById('new-pizza-image').value = '';
    }

    updateMenuDisplay() {
        // Solo actualizar si hay cambios significativos (agregar/eliminar pizzas)
        // Los cambios de precio se manejan directamente en el DOM
        if (this.shouldUpdateMenu) {
            const menuContainer = document.querySelector('.menu-container');
            menuContainer.innerHTML = '';

            // Agrupar pizzas en filas de 3
            const pizzasPerRow = 3;
            for (let i = 0; i < this.pizzaData.length; i += pizzasPerRow) {
                const row = document.createElement('div');
                row.className = 'pizza-row';

                for (let j = i; j < i + pizzasPerRow && j < this.pizzaData.length; j++) {
                    const pizza = this.pizzaData[j];
                    const pizzaCard = document.createElement('div');
                    pizzaCard.className = 'pizza-card';
                    pizzaCard.innerHTML = `
                        <img src="${pizza.image}" alt="Pizza ${pizza.name}" onerror="this.src='images/placeholder.svg'">
                        <h2 class="pizza-title">${pizza.name}</h2>
                        <p class="pizza-description">${pizza.description}</p>
                        <div class="pizza-footer">
                            <span class="pizza-price">$${pizza.price}</span>
                            <button class="btn-pizza-type" data-type="entera">Entera</button>
                            <button class="btn-pedir">Pedir</button>
                        </div>
                    `;
                    row.appendChild(pizzaCard);
                }
                menuContainer.appendChild(row);
            }

            // Reinicializar event listeners del carrito
            if (window.pizzaCart) {
                pizzaCart.setupEventListeners();
            }
            
            this.shouldUpdateMenu = false;
        } else {
            // Solo actualizar precios en el DOM existente sin recrear todo
            this.updatePricesInDOM();
        }
    }

    updatePricesInDOM() {
        // Actualizar solo los precios sin recrear el HTML completo
        const pizzaCards = document.querySelectorAll('.pizza-card');
        pizzaCards.forEach((card, index) => {
            if (this.pizzaData[index]) {
                const priceElement = card.querySelector('.pizza-price');
                const titleElement = card.querySelector('.pizza-title');
                const descElement = card.querySelector('.pizza-description');
                
                if (priceElement) priceElement.textContent = `$${this.pizzaData[index].price}`;
                if (titleElement) titleElement.textContent = this.pizzaData[index].name;
                if (descElement) descElement.textContent = this.pizzaData[index].description;
            }
        });
    }
}

// Inicializar sistema de administración
let pizzaAdmin;
document.addEventListener('DOMContentLoaded', () => {
    pizzaAdmin = new PizzeriaAdmin();
});