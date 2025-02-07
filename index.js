const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

class Tool {
    constructor(name, icon, action) {
        this.name = name;
        this.icon = icon;
        this.action = action;

        this.width = 300;
        this.height = 425;

        this.window = new BrowserWindow({
            width: this.width,
            height: this.height,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
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
        
        this.window.hide();
    }

    toggleWindow() {
        if (this.window.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }

    hide(){
        this.window.minimize();
        this.window.hide();
        this.window.setSize(this.width, this.height);
    }
    
    show(){
        this.window.show();
        this.window.focus();
        this.window.webContents.send('focus');
        this.window.setSize(this.width, this.height);
    }

    reportPosition() {
        const [x, y] = this.window.getPosition();
        this.window.webContents.send('listen-to-window-move', x, y);
    }
}

const tools = {};

app.whenReady().then(() => {

    tools.clipboardManager = new Tool('clipboard');

    globalShortcut.register('Alt+v', () => {
        tools.clipboardManager.toggleWindow();
    });

    globalShortcut.register('Alt+.', () => {
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

    ipcMain.on('toggle-window', event => {
        event.sender._parent.toggleWindow();
    })

    ipcMain.on('close-window', event => {
        event.sender._parent.hide();
    })
})();

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});