const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const fs = require('fs');

class ApplicationContext {
    constructor(name) {
        this.name = name;
        // this.icon = icon;
        // this.action = action;

        if(fs.existsSync(__dirname + '/tools/' + this.name + '/index.js')) {
            const constructor = require('./tools/' + this.name + '/');

            if(typeof constructor === 'function') {
                constructor(this);
            }
        }
    }

    createWindow(options, content = 'file://' + __dirname + '/tools/' + this.name + '/index.html') {
        const window = new BrowserWindow(options);

        window.webContents._parent = this;

        window.on('move', () => this.reportPosition());

        if(content) {
            window.loadURL(content);
        }
        
        if(options.show === false) window.hide();

        if(options.persistent === true) {
            window.on('close', (event) => {
                event.preventDefault();
                window.hide();
            });
        }

        if(options.skipTaskbar){
            window.setSkipTaskbar(true);
    
            setTimeout(() => {
                this.window.setSkipTaskbar(true);
            }, 1000);
        }

        // TODO: Change
        this.window = window;

        return window;
    }

    reportPosition() {
        const [x, y] = this.window.getPosition();
        this.window.webContents.send('arc:listen-to-window-move', x, y);
    }
}

const activeTools = fs.readFileSync(__dirname + '/tools.config', 'utf8').split('\n').map(line => { line = line.trim(); return line.charAt(0) === "#"? null: line } ).filter(Boolean);

(async function () {

    if(/* some config option to toggle dynamic/fluent themes */true) {
        const { getWallpaper } = await import('wallpaper');

        ipcMain.handle('arc:get-wallpaper', async () => {
            try {
                const wallpaper = await getWallpaper();
                return wallpaper;
            } catch (error) {
                console.error('Failed to get wallpaper:', error);
                throw error;
            }
        });
    }

    function getWindow(event){
        const window = BrowserWindow.fromWebContents(event.sender);
        return window || null
    }

    ipcMain.handle('arc:get-position', event => {
        event.sender._parent.reportPosition();
    })

    ipcMain.on('arc:toggle-window', event => {
        const window = getWindow(event);

        if (window.isVisible()) {
            window.hide();
        } else {
            window.show();
            window.focus();
            window.webContents.send('focus');
        }
    })

    ipcMain.on('arc:hide-window', event => {
        getWindow(event)?.hide();
    })

    ipcMain.on('arc:show-window', event => {
        getWindow(event)?.show();
    })

    ipcMain.on('arc:register-shortcut', (event, shortcut) => {
        if (globalShortcut.isRegistered(shortcut)) {
            console.log(`Shortcut ${shortcut} is already registered.`);
            return;
        }

        globalShortcut.register(shortcut, () => {
            event.sender._parent.window.webContents.send('arc:handle-shortcut', shortcut);
        });

        console.log(`Registered shortcut: ${shortcut}`);
    });

    app.whenReady().then(() => {

        for (const tool of activeTools) {
            new ApplicationContext(tool);
        }

    });

})();

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});