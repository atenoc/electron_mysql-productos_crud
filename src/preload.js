console.log("preload")

const contextBridge = require('electron').contextBridge;
const ipcRender = require('electron').ipcRenderer;

const ipc = {
    'render': {
        'send': [
            'login',
            'logout',
            'invitado',
            'addProduct',
            'updateProduct',
            'deleteProduct',
            'consultProduct',
            'consultCarreras',
            'openmodal',
            'closemodal'
        ],
        'sendReceive': [
            'getCarreras',
            'getUserData',
            'getProducts',
            'getProduct',
            'confirmAddBook',
            'confirmUpdateBook',
            'confirmDeleteBook'
        ]
    }
};

contextBridge.exposeInMainWorld(
    'ipcRender', {
    send: (channel, args) => {
        let validChannels = ipc.render.send;

        if (validChannels.includes(channel)) {
            ipcRender.send(channel, args);
        }
    },
    invoke: (channel, args) => {
        let validChannels = ipc.render.sendReceive;

        if (validChannels.includes(channel)) {
            return ipcRender.invoke(channel, args);
        }
    }
});