const { Router } = require("express");
const CartModel = require("../models/Cart.model");
const ProductModel = require("../models/Product.model");

const router = Router();

// Crear carrito
router.post("/", async (req, res) => {
  try {
    const cart = await CartModel.create({ products: [] });
    return res.status(201).json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

// Traer carrito con populate 
router.get("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) return res.status(404).json({ status: "error", payload: "Cart not found" });

    return res.json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

// Agregar producto al carrito 
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const exists = await ProductModel.exists({ _id: pid });
    if (!exists) return res.status(404).json({ status: "error", payload: "Product not found" });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", payload: "Cart not found" });

    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx === -1) cart.products.push({ product: pid, quantity: 1 });
    else cart.products[idx].quantity += 1;

    await cart.save();
    return res.json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

//  DELETE /api/carts/:cid/products/:pid
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", payload: "Cart not found" });

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();

    return res.json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

//  PUT /api/carts/:cid (reemplaza array completo)
router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body; // [{product, quantity}]
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: "error", payload: "products debe ser un array" });
    }

    const cart = await CartModel.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", payload: "Cart not found" });

    cart.products = products.map((p) => ({ product: p.product, quantity: p.quantity }));
    await cart.save();

    return res.json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

//  PUT /api/carts/:cid/products/:pid (solo quantity)
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ status: "error", payload: "quantity inválida" });
    }

    const cart = await CartModel.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", payload: "Cart not found" });

    const idx = cart.products.findIndex((p) => p.product.toString() === req.params.pid);
    if (idx === -1) return res.status(404).json({ status: "error", payload: "Product not in cart" });

    cart.products[idx].quantity = quantity;
    await cart.save();

    return res.json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

//DELETE /api/carts/:cid (vaciar carrito)
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", payload: "Cart not found" });

    cart.products = [];
    await cart.save();

    return res.json({ status: "success", payload: cart });
  } catch (e) {
    return res.status(500).json({ status: "error", payload: e.message });
  }
});

module.exports = router;
