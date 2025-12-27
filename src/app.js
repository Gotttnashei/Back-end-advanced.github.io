const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");



const ProductManager = require("./managers/ProductManager");

const app = express();
const PORT = process.env.PORT || 8080;

// ---- Middlewares básicos ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// ---- Handlebars ----
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ---- Rutas ----
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// ---- Conexión Mongo + server ----
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongo conectado ");

    const httpServer = app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });

    // ---- WebSocket (socket.io) ----
    const io = new Server(httpServer);

    
    const productManager = new ProductManager("products.json");

    io.on("connection", async (socket) => {
      console.log("Nuevo cliente conectado");

      const products = await productManager.getProducts();
      socket.emit("products", products);

      socket.on("createProduct", async (productData) => {
        try {
          await productManager.addProduct(productData);
          const updatedProducts = await productManager.getProducts();
          io.emit("products", updatedProducts);
        } catch (error) {
          console.error("Error al crear producto desde socket:", error);
        }
      });

      socket.on("deleteProduct", async (productId) => {
        try {
          await productManager.deleteProduct(Number(productId));
          const updatedProducts = await productManager.getProducts();
          io.emit("products", updatedProducts);
        } catch (error) {
          console.error("Error al eliminar producto desde socket:", error);
        }
      });
    });
  })
  .catch((err) => console.error("Mongo error ", err));
