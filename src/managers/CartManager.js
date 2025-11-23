const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor(filename) {
    this.filePath = path.join(__dirname, '..', 'data', filename);
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async _writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  _getNextId(carts) {
    if (carts.length === 0) return 1;
    const maxId = carts.reduce((max, c) => (c.id > max ? c.id : max), 0);
    return maxId + 1;
  }

  async createCart() {
    const carts = await this._readFile();

    const newCart = {
      id: this._getNextId(carts),
      products: []
    };

    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find(c => c.id === id);
  }

  async addProductToCart(cartId, productId) {
    const carts = await this._readFile();
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) return null;

    const cart = carts[cartIndex];
    const existing = cart.products.find(p => p.product === productId);

    if (existing) {
      existing.quantity++;
    } else {
      cart.products.push({
        product: productId,
        quantity: 1
      });
    }

    carts[cartIndex] = cart;
    await this._writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;
