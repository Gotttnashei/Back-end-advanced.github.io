const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productManager = new ProductManager('products.json');

// Home: podrías redirigir a /products
router.get('/', (req, res) => {
  res.redirect('/products');
});

// Vista de productos "normales" (se recarga la página)
router.get('/products', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', {
      title: 'AESTHETIC STORE - Productos',
      products
    });
  } catch (error) {
    console.error('Error en GET /products (vista):', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Vista con WebSocket en tiempo real
router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realtimeProducts', {
      title: 'AESTHETIC STORE - Productos en tiempo real',
      products
    });
  } catch (error) {
    console.error('Error en GET /realtimeproducts:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router;
