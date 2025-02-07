const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

class Tool {
    constructor(name, icon, action) {
        this.name = name;
        this.icon = icon;
        this.action = action;

        this.window = new BrowserWindow({
            width: 300,
            height: 425,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            hasShadow: true,
            resizable: false,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this.window.webContents._parent = this;

        this.window.on('move', () => this.reportPosition());
        
        this.window.loadURL('file://' + __dirname + '/tools/' + this.name + '/index.html');
        console.log('file://' + __dirname + '/tools/' + this.name + '/index.html');
        
        this.window.hide();
    }

    toggleWindow() {
        if (this.window.isVisible()) {
            this.window.hide();
        } else {
            this.window.show();
            this.window.focus();
        }
    }

    reportPosition() {
        const [x, y] = this.window.getPosition();
        this.window.webContents.send('listen-to-window-move', x, y);
    }
}

const tools = {};

app.whenReady().then(() => {

    tools.clipboardManager = new Tool('clipboard');

    globalShortcut.register('Super+v', () => {
        tools.clipboardManager.toggleWindow();
    });

    globalShortcut.register('Super+.', () => {
        tools.clipboardManager.toggleWindow();
    });

});

(async function iHateESM () {
    const { getWallpaper } = await import('wallpaper');

    ipcMain.handle('get-wallpaper', async () => {
        try {
            const wallpaper = await getWallpaper();
            return wallpaper;
        } catch (error) {
            console.error('Failed to get wallpaper:', error);
            throw error;
        }
    });

    ipcMain.handle('get-position', event => {
        event.sender._parent.reportPosition();
    }) 
})();

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});