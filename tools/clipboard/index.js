module.exports = (clipboard) => {
    const window = clipboard.createWindow({
        width: 300,
        height: 425,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: true,
        resizable: false,
        show: false,
        minimizable: false,
        maximizable: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
}