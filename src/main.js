console.log("main process")
// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Notification, Menu} = require('electron')
const path = require('path')
const db = require('./database.js');
const Store = require('electron-store');
const store = new Store();
var fs = require('fs');

let mainWindow;
let loginWindow;
let modalWindow;

const agregarHtml =  'src/views/agregar.html';
const modificarHtml =  'src/views/modificar.html';
const tituloNotificacion = 'Nombre de mi sistema'

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('src/views/app.html')
  mainWindow.webContents.openDevTools()
}

function createWindowLogin () {
    // Create the browser window.
    loginWindow = new BrowserWindow({
      width: 400,
      height: 500,
      //resizable: false,
      //maximizable: false,
      autoHideMenuBar: true,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
      }
    })
  
    loginWindow.loadFile('src/views/login.html')
    //loginWindow.webContents.openDevTools()
}

function createModalWindow (archivoHtml) {
    modalWindow = new BrowserWindow({
      width: 400,
      height: 500,
      //resizable: false,
      maximizable: false,
      autoHideMenuBar: true,
      parent: mainWindow,
      modal: true,
      frame: false,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
      }
    })
  
    modalWindow.loadFile(archivoHtml)
    //loginWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindowLogin()
  //createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindowLogin()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
  console.log("APP CERRADA")
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * ***************************************************************************************
 */

 ipcMain.on('login', (event, data) => {
  console.log('login: ', data);
  const { user, password } = data;
  const sql = 'SELECT * FROM usuarios WHERE usuario=? AND pass=?';

  try {
    console.log("Consultando usuario")
    db.query(sql, [user, password], (error, results, fields) => {
      if (error) {
        console.log(error);
      }
      console.log(results)
      if (results.length > 0) {
        store.set('user', results[0].usuario);
        store.set('rol', results[0].rol);
        console.log("storage: " + store.get('user'))
        createWindow()
        loginWindow.close()

        new Notification({
          title: "Mi Desarrollo",
          body: "Bienvenido",
        }).show();
        
      }
    });
    
  } catch (error) {
      console.log(error)
  }
});


ipcMain.on('addProduct', (event, reciboProducto) => {
  console.log('>>>>>>>>>>>>>>>>>>>> addProduct', reciboProducto);

  const name = reciboProducto.name
  const description = reciboProducto.description
  const price = reciboProducto.price
  const sql = ' INSERT INTO product (name, description, price ) VALUES (?,?,?) ';
  try {
      db.query(sql, [name, description, price], (error) => {
          if (error) {
              console.log(error);
            } else {
              console.log("Producto agregado")
              mainWindow.webContents.executeJavaScript("getProductos()");
              //modalWindow.close()

              new Notification({
                  title: tituloNotificacion,
                  body: "Producto registrado correctamente: " +name,
              }).show();
            }
        }); 
  } catch (error) {
      console.log(error)
  }

});


ipcMain.handle('getProducts', (event) => {
  console.log(">>>>>>>>>>>>>>>>>>>> getProducts")
  db.query('SELECT * FROM product ORDER BY id DESC', (error, results, fields) => {
    if (error) {
      console.log(error);
    }
    console.log("Consulta total: "+results.length)
    if (results.length > 0) {
      store.set('noRegistros', 1)
      store.set('resultados', results);
    }else{
      store.set('noRegistros', 0)
      store.delete('resultados')
    }
  });
  const data = { productos: store.get('resultados') };
  const noData = { };
  if (store.get('noRegistros') === 0){
    return noData;
  }else{
    return data;
  }

});


ipcMain.on('consultProduct', (event, idProducto) => {
  console.log(">>>>>>>>>>>>>>>>>>>> consultProduct: " +idProducto)
  
  const sql = 'SELECT * FROM product WHERE id=?';
  db.query(sql, [idProducto], (error, result) => {
    if (error) {
      console.log(error);
    }
    console.log("Id obtenido: "+result[0].id)
    store.set('producto', result)
  });

});


ipcMain.handle('getProduct', (event) => {
  const producto = { producto: store.get('producto') }
  console.log(producto)
  return producto
});


ipcMain.on('updateProduct', (event, productoEditar) => {
  console.log(">>>>>>>>>>>>>>>>>>>> updateProduct")
  console.log(productoEditar)
  const { name, price, description, id } = productoEditar;
  const sql = 'UPDATE product SET name=?, price=?, description=? WHERE id=?';

  db.query(sql, [name, price, description, id], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Producto actualizado:" + result)
      mainWindow.webContents.executeJavaScript("getProductos()");
      modalWindow.close()

      new Notification({
        title: tituloNotificacion,
        body: "Producto actualizado correctamente",
      }).show();
    }
  });

});


ipcMain.on('deleteProduct', (event, idProducto) => {
  console.log(">>>>>>>>>>>>>>>>>>>> deleteProduct")
  const sql = 'DELETE FROM product WHERE id = ?';
  db.query(sql, [idProducto], (error) => {
    if (error) {
      console.log(error);
    } else {

      new Notification({
        title: tituloNotificacion,
        body: "Producto eliminado correctamente",
      }).show();
      console.log("Producto eliminado")
    }
  });

});


ipcMain.on('openmodal', (event, valor) => {
  console.log(">>>>>>>>>>>>>>>>>>>> openModal: " +valor)

  if(valor=='agregar'){
    createModalWindow(agregarHtml)
  }
  if(valor=='modificar'){
    createModalWindow(modificarHtml)
  }
  
});

ipcMain.on('closemodal', (event) => {
  modalWindow.close()
  console.log("<<<<<<<<<<<<<<<<<<<< closeModal")
});










  


