// TODO: Make major changes
const { ipcRenderer } = require('electron');

const arc = {
    window: {
        hide(){
            ipcRenderer.send("arc:hide-window");
        },

        show(){
            ipcRenderer.send("arc:show-window");
        },

        toggle(){
            ipcRenderer.send("arc:toggle-window");
        }
    },
    
    registerShortcut(shortcut){
        ipcRenderer.send("arc:register-shortcut", shortcut);
    },

    on(event, callback){
        return ipcRenderer.on("arc:" + event, callback);
    },
    
    async getWallpaper() {
        if(arc._wallpaperCache) return arc._wallpaperCache;

        const wallpaper = await ipcRenderer.invoke('arc:get-wallpaper');

        if(wallpaper) arc._wallpaperCache = wallpaper;

        return wallpaper;
    },

    /**
     * @experimental
     */
    async enableAcrylicWindow(){
        const wrapperElement = document.getElementById('wrapper');

        if(!wrapperElement) throw new Error('Cant enable acrylic window, #wrapper element not found');
    
        const wallpaper = await arc.getWallpaper();
    
        wrapperElement.style.backgroundImage = `url(${wallpaper})`;
        wrapperElement.classList.add('acrylic');
    
        ipcRenderer.invoke('arc:get-position');
    
        ipcRenderer.on('arc:listen-to-window-move', (event, x, y) => {
            wrapperElement.style.backgroundPosition = `${-(x - screen.availLeft)}px ${-(y - screen.availTop)}px`;
            wrapperElement.style.backgroundSize = `${screen.width}px ${screen.height}px`;
        });
    },

    /**
     * @experimental
     */
    async enableDynamicColor(){
        const wallpaper = await arc.getWallpaper();

        const img = new Image();
        img.src = wallpaper;

        img.onload = function(){
            const color = LS.Color.fromImage(img);
    
            LS.Color.update("dynamic", color);
            LS.Color.setAccent("dynamic");
        }
    }
}

if(window.LS) {
    LS.Color.autoScheme();
    LS.Color.update("dynamic");
}

// arc.enableDynamicColor()
// arc.enableAcrylicWindow()