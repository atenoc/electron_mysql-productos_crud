console.log("login")

const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", (e) => {
    try {
      e.preventDefault();
  
      const usuario = {
        user: user.value,
        password: password.value
      };

      console.log(usuario)

      window.ipcRender.send('login', usuario);
      console.log(">>>>>>>>> Usuario Logueado")

    } catch (error) {
      console.log(error);
    }
  });