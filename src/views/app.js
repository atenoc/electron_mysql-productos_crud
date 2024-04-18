console.log("Ventana principal");

function getProductos(){

  let reload = localStorage.getItem('reload')
  console.log("reload:: " +reload)
  if(reload > 0){
    location.reload()
    localStorage.setItem('reload', 0)
  }

  window.ipcRender.invoke('getProducts').then((result) => {

    let tablaProductos = document.querySelector('#tabla-productos');
    let texto = '';
    tablaProductos.innerHTML = '';

    if(result && Object.keys(result).length === 0 && result.constructor === Object){
      console.log("vacio")
      texto +=
      `
      <tr>
          <span> No hay registros </span>
      </tr>
      `;

      tablaProductos.innerHTML = texto;

    }else{
      //console.log(result.productos.length)
      //console.log(result.productos) //undefined
      for (const element of result.productos) {
          texto +=
              `
              <tr>
                  <td>${element.id}</td>
                  <td>${element.name}</td>
                  <td>${element.price}</td>
                  <td>${element.description}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <button type="button" id="btnConsultar" class="btn btn-warning btn-sm" onclick="consultProduct('${element.id}')">
                        <span>Editar</span>
                        <i class="fas fa-edit"></i>
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" onclick="deleteProducto('${element.id}')">
                        <span>Borrar</span>
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>

              </tr>
          `;
      }
      tablaProductos.innerHTML = texto;
    }

  });
}

getProductos();

function consultProduct(id){
  window.ipcRender.send('consultProduct', id);
  window.ipcRender.send('openmodal','modificar');
}

function deleteProducto(id){

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger mr-2'
    },
    buttonsStyling: false,
    allowEscapeKey: false,
    allowOutsideClick: false
  });

  swalWithBootstrapButtons.fire({
      title: '¿Estas seguro?',
      text: "¡Esta acción no se puede revertir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'mr-2',
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
  }).then((result) => {
      if (result.value) {

        console.log("Eliminar producto id: "+id)
        window.ipcRender.send('deleteProduct', id);
        getProductos()
        location.reload()
        console.log("Producto eliminado")

        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          showConfirmButton: false,
          timer: 1500
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("Cancelado")
      }
  });
 
}

const btnAgregar = document.querySelector("#btnAgregar");
btnAgregar.addEventListener("click", (e) => {
  window.ipcRender.send('openmodal', 'agregar');
});