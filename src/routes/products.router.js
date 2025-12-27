const { Router } = require("express");
const ProductModel = require("../models/Product.model");

const router = Router();

/**
 * GET /api/products?limit=&page=&sort=&query=
 * query soportado:
 *  - category:remeras
 *  - available:true  (usa status)
 *  - available:false
 */
router.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;

    const sortParam = req.query.sort; // asc | desc
    const sort =
      sortParam === "asc"
        ? { price: 1 }
        : sortParam === "desc"
        ? { price: -1 }
        : undefined;

    const queryParam = req.query.query;
    const filter = {};

    // filtros por categoría o disponibilidad
    if (queryParam) {
      const [key, value] = String(queryParam).split(":");

      if (key === "category" && value) filter.category = value;
      else if (key === "available" && value) filter.status = value === "true";
      else {
        
        filter.category = queryParam;
      }
    }

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort,
      lean: true,
    });

    // Links prev/next
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const common = `${sortParam ? `&sort=${sortParam}` : ""}${
      queryParam ? `&query=${encodeURIComponent(queryParam)}` : ""
    }`;

    const prevLink = result.hasPrevPage
      ? `${baseUrl}?limit=${limit}&page=${result.prevPage}${common}`
      : null;

    const nextLink = result.hasNextPage
      ? `${baseUrl}?limit=${limit}&page=${result.nextPage}${common}`
      : null;

    return res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error("Error en GET /api/products:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

// GET /api/products/:pid  (pid es ObjectId)
router.get("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductModel.findById(pid).lean();

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }

    return res.json({ status: "success", payload: product });
  } catch (error) {
    console.error("Error en GET /api/products/:pid:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

// POST /api/products/
router.post("/", async (req, res) => {
  try {
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];
    const missing = requiredFields.filter((f) => req.body[f] === undefined);

    if (missing.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Faltan campos: ${missing.join(", ")}`,
      });
    }

    const data = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      thumbnails: Array.isArray(req.body.thumbnails) ? req.body.thumbnails : [],
      status: req.body.status !== undefined ? Boolean(req.body.status) : true,
    };

    const created = await ProductModel.create(data);
    return res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    console.error("Error en POST /api/products:", error);

    // duplicado de code
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ status: "error", message: "El code ya existe" });
    }

    return res
      .status(500)
      .json({ status: "error", message: `Error interno: ${error.message}` });
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;

    const update = { ...req.body };
    if (update.price !== undefined) update.price = Number(update.price);
    if (update.stock !== undefined) update.stock = Number(update.stock);

    const updated = await ProductModel.findByIdAndUpdate(pid, update, {
      new: true,
    }).lean();

    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }

    return res.json({ status: "success", payload: updated });
  } catch (error) {
    console.error("Error en PUT /api/products/:pid:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;

    const deleted = await ProductModel.findByIdAndDelete(pid).lean();
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }

    return res.json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    console.error("Error en DELETE /api/products/:pid:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

module.exports = router;
