const fs = require('fs').promises;
const path = require('path');

class ProductManager {
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

  _getNextId(products) {
    if (products.length === 0) return 1;
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    return maxId + 1;
  }

  async getProducts() {
    return await this._readFile();
  }

  async getProductById(id) {
    const products = await this._readFile();
    return products.find(p => p.id === id);
  }

  async addProduct(productData) {
    const products = await this._readFile();

    const newProduct = {
      id: this._getNextId(products),
      status: productData.status ?? true,
      ...productData
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this._readFile();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) return null;

    const { id: _, ...rest } = updateData;

    products[index] = {
      ...products[index],
      ...rest
    };

    await this._writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) return false;

    products.splice(index, 1);
    await this._writeFile(products);
    return true;
  }
}

module.exports = ProductManager;
