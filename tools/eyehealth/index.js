module.exports = (instance) => {
    const twentyRuleWindow = instance.createWindow({
        width: 360,
        height: 250,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: true,
        resizable: false,
        show: false,
        minimizable: false,
        maximizable: false,
        persistent: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
}