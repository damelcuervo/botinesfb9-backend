const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadImage } = require('./controllers/uploadController');

const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Rutas Públicas ---
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'API funcionando correctamente' }));
app.get('/api/products', productController.getAllProducts);

// Listar categorías para desplegables o filtros
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Listar marcas para desplegables
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});

// Autenticación de Admin
app.post('/api/auth/login', authController.login);

// --- Rutas Protegidas (Solo Admin) ---
//app.post('/api/products', authMiddleware, productController.createProduct);
app.post('/api/products', productController.createProduct);

// Ruta para subir imágenes desde la PC
app.post('/api/upload', upload.single('image'), uploadImage);

app.listen(PORT, () => {
  console.log(`Servidor de botinesfb9 corriendo en http://localhost:${PORT}`);
});