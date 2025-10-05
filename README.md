# 🍕 Sistema de Pizzería - Backend Completo

Sistema de pedidos de pizzería con backend Node.js que permite gestión global de imágenes y precios.

## ✨ Características Principales

### 🛒 **Para Clientes:**
- Menú de pizzas con opciones Entera/Media
- Carrito de compras interactivo
- Integración completa con WhatsApp
- Formulario de pedidos con validación
- Precios actualizados en tiempo real

### 👨‍💼 **Para Administradores:**
- Panel de administración con autenticación
- Gestión de precios por pizza (Entera y Media)
- **Upload de imágenes que se ven para TODOS los usuarios**
- Configuración de número de WhatsApp
- Persistencia de datos en servidor

## 🔧 **Arquitectura Técnica**

### **Frontend:**
- HTML5, CSS3, JavaScript Vanilla
- Sistema de carrito reactivo
- Interfaz responsive para móviles

### **Backend:**
- **Node.js + Express.js**
- **Multer** para upload de archivos
- **CORS** habilitado para peticiones cruzadas
- **Sistema de archivos** para persistencia

## 🚀 **Instalación y Uso**

### **Desarrollo Local:**
```bash
npm install
npm start
# Servidor en http://localhost:3000
```

### **Producción (Render):**
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Node.js

## 🎯 **Principal Mejora: Imágenes Globales**

**ANTES:** Las imágenes solo se guardaban en localStorage del navegador del admin  
**AHORA:** Las imágenes se guardan en el servidor y **TODOS los usuarios las ven**

### **Cómo funciona:**
1. Admin sube imagen desde panel de administración
2. Imagen se guarda en `/Pizzeria/uploads/` del servidor
3. **Todos los usuarios que entren al sitio ven la imagen actualizada**
4. Precios también sincronizados globalmente

## 📱 **Integración WhatsApp**

- Número configurable desde panel admin
- Mensajes formateados con detalles completos
- Todos los pedidos se envían al número configurado

---

**Desarrollado con asistencia de IA**  
**Tecnologías:** Node.js, Express, HTML5, CSS3, JavaScript, WhatsApp API
