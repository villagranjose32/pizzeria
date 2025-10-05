const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static('Pizzeria'));

// Crear directorio para imágenes si no existe
const uploadsDir = path.join(__dirname, 'Pizzeria', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        // Verificar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Archivo para guardar datos de pizzas
const dataFile = path.join(__dirname, 'pizza-data.json');

// Función para leer datos
function readPizzaData() {
    try {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error leyendo datos:', error);
    }
    return {};
}

// Función para guardar datos
function savePizzaData(data) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error guardando datos:', error);
        return false;
    }
}

// Función para leer configuración de WhatsApp
function readWhatsAppConfig() {
    try {
        const configFile = path.join(__dirname, 'whatsapp-config.json');
        if (fs.existsSync(configFile)) {
            const data = fs.readFileSync(configFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error leyendo configuración WhatsApp:', error);
    }
    return { whatsappNumber: '543516351524' }; // Número por defecto
}

// Función para guardar configuración de WhatsApp
function saveWhatsAppConfig(config) {
    try {
        const configFile = path.join(__dirname, 'whatsapp-config.json');
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error guardando configuración WhatsApp:', error);
        return false;
    }
}

// API Routes

// Obtener datos de pizzas
app.get('/api/pizzas', (req, res) => {
    const data = readPizzaData();
    res.json(data);
});

// Actualizar precio de pizza
app.put('/api/pizzas/:pizzaId/price', (req, res) => {
    const { pizzaId } = req.params;
    const { entirePrice, halfPrice } = req.body;
    
    const data = readPizzaData();
    
    if (!data[pizzaId]) {
        data[pizzaId] = {};
    }
    
    data[pizzaId].entirePrice = entirePrice;
    data[pizzaId].halfPrice = halfPrice;
    
    if (savePizzaData(data)) {
        res.json({ success: true, message: 'Precio actualizado correctamente' });
    } else {
        res.status(500).json({ success: false, message: 'Error al guardar' });
    }
});

// Actualizar datos completos de pizza (precio + ingredientes)
app.put('/api/pizzas/:pizzaId/data', (req, res) => {
    const { pizzaId } = req.params;
    const { entirePrice, halfPrice, ingredients } = req.body;
    
    const data = readPizzaData();
    
    if (!data[pizzaId]) {
        data[pizzaId] = {};
    }
    
    data[pizzaId].entirePrice = entirePrice;
    data[pizzaId].halfPrice = halfPrice;
    data[pizzaId].ingredients = ingredients;
    
    if (savePizzaData(data)) {
        res.json({ success: true, message: 'Datos de pizza actualizados correctamente' });
    } else {
        res.status(500).json({ success: false, message: 'Error al guardar' });
    }
});

// Subir imagen de pizza
app.post('/api/pizzas/:pizzaId/image', upload.single('image'), (req, res) => {
    const { pizzaId } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    }
    
    const data = readPizzaData();
    
    if (!data[pizzaId]) {
        data[pizzaId] = {};
    }
    
    // Eliminar imagen anterior si existe
    if (data[pizzaId].imageUrl) {
        const oldImagePath = path.join(__dirname, 'Pizzeria', data[pizzaId].imageUrl);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
    
    // Guardar nueva imagen
    data[pizzaId].imageUrl = `uploads/${req.file.filename}`;
    
    if (savePizzaData(data)) {
        res.json({ 
            success: true, 
            message: 'Imagen subida correctamente',
            imageUrl: data[pizzaId].imageUrl
        });
    } else {
        res.status(500).json({ success: false, message: 'Error al guardar' });
    }
});

// Obtener configuración de WhatsApp
app.get('/api/whatsapp-config', (req, res) => {
    const config = readWhatsAppConfig();
    res.json(config);
});

// Actualizar configuración de WhatsApp
app.put('/api/whatsapp-config', (req, res) => {
    const { whatsappNumber } = req.body;
    
    if (!whatsappNumber) {
        return res.status(400).json({ success: false, message: 'Número de WhatsApp requerido' });
    }
    
    if (saveWhatsAppConfig({ whatsappNumber })) {
        res.json({ success: true, message: 'Configuración de WhatsApp actualizada' });
    } else {
        res.status(500).json({ success: false, message: 'Error al guardar configuración' });
    }
});

// Verificar autenticación admin
app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    
    // Password hardcodeado por seguridad
    if (password === 'Lucas351524') {
        res.json({ success: true, message: 'Autenticación correcta' });
    } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Pizzeria', 'index.html'));
});

// Manejar errores de multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'El archivo es demasiado grande' });
        }
    }
    
    if (error.message === 'Solo se permiten archivos de imagen') {
        return res.status(400).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`🍕 Servidor de pizzería ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Accede a: http://localhost:${PORT}`);
});