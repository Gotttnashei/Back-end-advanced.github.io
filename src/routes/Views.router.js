const { Router } = require("express");
const ProductModel = require("../models/Product.model");
const CartModel = require("../models/Cart.model");

const router = Router();

// /products (lista paginada) -> renderiza "home"
router.get("/products", async (req, res) => {
  try {
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;

    const sortParam = req.query.sort;
    const sort =
      sortParam === "asc"
        ? { price: 1 }
        : sortParam === "desc"
        ? { price: -1 }
        : undefined;

    const queryParam = req.query.query;
    const filter = {};
    if (queryParam) {
      const [key, value] = String(queryParam).split(":");
      if (key === "category" && value) filter.category = value;
      if (key === "available" && value) filter.status = value === "true";
    }

    const result = await ProductModel.paginate(filter, { limit, page, sort, lean: true });

    return res.render("home", {
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      limit,
      sort: sortParam || "",
      query: queryParam || "",
    });
  } catch (e) {
    console.error("Error en GET /products (views):", e);
    return res.status(500).send("Error interno");
  }
});

// /products/:pid (detalle) -> renderiza "product"
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    return res.render("productDetail", { product });

  } catch (e) {
    console.error("Error en GET /products/:pid (views):", e);
    return res.status(500).send("Error interno");
  }
});

// /carts/:cid (vista carrito) -> renderiza "cart"
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    return res.render("cart", { cart });
  } catch (e) {
    console.error("Error en GET /carts/:cid (views):", e);
    return res.status(500).send("Error interno");
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    return res.render("realtimeProducts", { products });
  } catch (e) {
    console.error("Error en GET /realtimeproducts:", e);
    return res.status(500).send("Error interno");
  }
});

module.exports = router;
