console.log("modificar")

const loadProducto = () => {
    window.ipcRender.invoke('getProduct').then((result) => {

        if(result && Object.keys(result).length === 0 && result.constructor === Object){
            console.log("vacio")
          }else{
            console.log(result.producto[0].id)
            document.querySelector('#id').value = result.producto[0].id;
            document.querySelector('#producto').value = result.producto[0].name;
            document.querySelector('#precio').value = result.producto[0].price;
            document.querySelector('#descripcion').value = result.producto[0].description;
            
          }

    });
}

loadProducto();


let cancelar = document.querySelector('#cancelar');
cancelar.addEventListener('click', () => {
    document.location.href = './app.html',true;
});


const productForm = document.querySelector("#updateProductForm");
productForm.addEventListener("submit", (e) => {
    try {
      e.preventDefault();
  
      const product = {
        id: id.value,
        name: producto.value,
        price: precio.value,
        description: descripcion.value,
      };

      console.log(id.value+" - "+producto.value+" - "+precio.value+" - "+descripcion.value)
      window.ipcRender.send('updateProduct', product);
      localStorage.setItem('reload', 1)
      location.href = './app.html';

    } catch (error) {
      console.log(error);
    }
});


/*
function regresar(){
	$.getScript("app.js", function(){
 		document.write(getProductos());
	});
}
*/