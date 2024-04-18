console.log("agregar js")

const productForm = document.querySelector("#productForm");
productForm.addEventListener("submit", (e) => {
    try {
      e.preventDefault();
  
      const product = {
        name: producto.value,
        price: precio.value,
        description: descripcion.value,
      };

      console.log(producto.value+" - "+precio.value+" - "+descripcion.value)

      window.ipcRender.send('addProduct', product);
      console.log(">>>>>>>>>> Producto Agregado")
      localStorage.setItem('reload', 1)
      //getProductos();
      //location.reload();

      document.querySelector('#producto').value = '';
      document.querySelector('#precio').value = '';
      document.querySelector('#descripcion').value = '';

    } catch (error) {
      console.log(error);
    }
});


const mimodal = document.querySelector("#cancelar");
mimodal.addEventListener("click", (e) => {
  window.ipcRender.send('closemodal');
});