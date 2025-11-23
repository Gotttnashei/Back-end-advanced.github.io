const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productManager = new ProductManager('products.json');

// GET /api/products/
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json({ status: 'success', payload: products });
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductById(pid);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({ status: 'success', payload: product });
  } catch (error) {
    console.error('Error en GET /api/products/:pid:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// POST /api/products/
router.post('/', async (req, res) => {
  try {
    console.log('Body recibido:', req.body);

    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const missing = requiredFields.filter(f => req.body[f] === undefined);

    if (missing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Faltan campos: ${missing.join(', ')}`
      });
    }

    const data = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      thumbnails: Array.isArray(req.body.thumbnails) ? req.body.thumbnails : []
    };

    const newProduct = await productManager.addProduct(data);

    res.status(201).json({ status: 'success', payload: newProduct });

  } catch (error) {
    console.error('Error en POST /api/products:', error);
    res.status(500).json({
      status: 'error',
      message: `Error interno del servidor: ${error.message}`
    });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const updated = await productManager.updateProduct(pid, req.body);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({ status: 'success', payload: updated });
  } catch (error) {
    console.error('Error en PUT /api/products/:pid:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const deleted = await productManager.deleteProduct(pid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error en DELETE /api/products/:pid:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

module.exports = router;
