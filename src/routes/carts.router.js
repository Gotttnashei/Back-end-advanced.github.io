const { Router } = require('express');
const CartManager = require('../managers/CartManager');

const router = Router();
const cartManager = new CartManager('carts.json');

// POST /api/carts/
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ status: 'success', payload: newCart });
  } catch (error) {
    console.error('Error en POST /api/carts:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart.products });
  } catch (error) {
    console.error('Error en GET /api/carts/:cid:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    const updated = await cartManager.addProductToCart(cid, pid);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: updated });
  } catch (error) {
    console.error('Error en POST agregar producto al carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

module.exports = router;
