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

    createWindow(options, content = 'index.html') {
        const window = new BrowserWindow(options);

        if(typeof content !== 'string') {
            throw new Error('Content must be a path to a file or a URL');
        }

        if(!content.startsWith('file://')) {
            if(!content.startsWith("/")){
                content = __dirname + '/tools/' + this.name + "/" + content;
            }

            if(!fs.existsSync(content) || fs.lstatSync(content).isDirectory()) {
                if(fs.existsSync(content + '.html')) {
                    content += '.html';
                } else if(fs.existsSync(content + '/index.html')) {
                    content += '/index.html';
                } else {
                    throw new Error('Content file does not exist: ' + content);
                }
            }

            content = "file://" + content;
        }

        window.webContents._parent = this;

        window.on('move', () => {
            const [x, y] = window.getPosition();
            window.webContents.send('arc:window:move', x, y);
        });

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
                window.setSkipTaskbar(true);
            }, 1000);
        }

        return window;
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

    ipcMain.handle('arc:window:get-position', event => {
        const window = getWindow(event);
        if (window) {
            const [x, y] = window.getPosition();
            return { x, y };
        }

        return null;
    })

    ipcMain.on('arc:window:set-ignore-mouse-events', (event, boolean) => {
        getWindow(event)?.setIgnoreMouseEvents(!!boolean);
    });

    ipcMain.on('arc:window:set-always-on-top', (event, boolean, type) => {
        getWindow(event)?.setAlwaysOnTop(!!boolean, type);
    });

    ipcMain.on('arc:window:toggle', event => {
        const window = getWindow(event);

        if (window.isVisible()) {
            window.hide();
        } else {
            window.show();
            window.focus();
            window.webContents.send('focus');
        }
    });

    ipcMain.on('arc:window:hide', event => {
        getWindow(event)?.hide();
    });

    ipcMain.on('arc:window:show', event => {
        getWindow(event)?.show();
    });

    ipcMain.on('arc:window:focus', event => {
        getWindow(event)?.focus();
    });

    ipcMain.on('arc:window:blur', event => {
        getWindow(event)?.blur();
    });

    ipcMain.on('arc:window:close', event => {
        getWindow(event)?.close();
    });

    ipcMain.on('arc:window:minimize', event => {
        getWindow(event)?.minimize();
    });

    ipcMain.on('arc:window:maximize', event => {
        getWindow(event)?.maximize();
    });

    ipcMain.on('arc:window:unmaximize', event => {
        getWindow(event)?.unmaximize();
    });

    ipcMain.on('arc:window:maximize-toggle', event => {
        const window = getWindow(event);
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });

    ipcMain.on('arc:window:resize', (event, width, height) => {
        getWindow(event)?.setSize(width, height);
    });

    ipcMain.on('arc:window:move', (event, x, y) => {
        getWindow(event)?.setPosition(x, y);
    });

    ipcMain.on('arc:window:move-by', (event, x, y) => {
        const window = getWindow(event);
        if (window) {
            const [currentX, currentY] = window.getPosition();
            window.setPosition(currentX + x, currentY + y);
        }
    });

    ipcMain.on('arc:window:toggle-devtools', event => {
        const window = getWindow(event);
        if (window) {
            if (window.webContents.isDevToolsOpened()) {
                window.webContents.closeDevTools();
            } else {
                window.webContents.openDevTools();
            }
        }
    });

    ipcMain.on('arc:register-shortcut', (event, shortcut) => {
        const window = getWindow(event);

        if (globalShortcut.isRegistered(shortcut)) {
            console.log(`Shortcut ${shortcut} is already registered.`);
            return;
        }

        globalShortcut.register(shortcut, () => {
            window.webContents.send('arc:handle-shortcut', shortcut);
        });

        console.log(`Registered shortcut: ${shortcut}`);
    });

    ipcMain.on('arc:unregister-shortcut', (event, shortcut) => {
        if (globalShortcut.isRegistered(shortcut)) {
            globalShortcut.unregister(shortcut);
            console.log(`Unregistered shortcut: ${shortcut}`);
        } else {
            console.log(`Shortcut ${shortcut} is not registered.`);
        }
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