const socket = io();

// Elementos del DOM
const productsList = document.getElementById('productsList');
const productForm = document.getElementById('productForm');

// Función para renderizar productos en la lista
function renderProducts(products) {
  if (!productsList) return;

  if (!products.length) {
    productsList.innerHTML = '<li>No hay productos cargados.</li>';
    return;
  }

  productsList.innerHTML = '';

  products.forEach((prod) => {
    const li = document.createElement('li');
    li.dataset.id = prod.id;

    li.innerHTML = `
      <h4>${prod.title}</h4>
      <p>${prod.description}</p>
      <p><strong>Precio:</strong> $${prod.price}</p>
      <button class="btn-delete">Eliminar</button>
      <hr />
    `;

    const deleteBtn = li.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
      socket.emit('deleteProduct', prod.id);
    });

    productsList.appendChild(li);
  });
}

// Escuchamos la lista actualizada desde el servidor
socket.on('products', (products) => {
  renderProducts(products);
});

// Manejar envío del formulario de nuevo producto
if (productForm) {
  productForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(productForm);
    const thumbnailsRaw = formData.get('thumbnails');

    const newProduct = {
      title: formData.get('title'),
      description: formData.get('description'),
      code: formData.get('code'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      category: formData.get('category'),
      thumbnails: thumbnailsRaw
        ? thumbnailsRaw.split(',').map((t) => t.trim())
        : []
    };

    socket.emit('createProduct', newProduct);
    productForm.reset();
  });
}
