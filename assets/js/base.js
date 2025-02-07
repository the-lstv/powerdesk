const { ipcRenderer } = require('electron');
const wrapperElement = document.getElementById('wrapper');


LS.Color.autoScheme()


let wallpaper = null;
async function getWallpaper() {
    return await ipcRenderer.invoke('get-wallpaper');
}

LS.Color.update("dynamic");

async function enableAcrylicWindow(){
    if(!wrapperElement) return console.error('Cant enable acrylic window, Wrapper element not found');

    if(!wallpaper){
        wallpaper = await getWallpaper();
    }

    wrapperElement.style.backgroundImage = `url(${wallpaper})`;
    wrapperElement.classList.add('acrylic');

    ipcRenderer.invoke('get-position');

    ipcRenderer.on('listen-to-window-move', (event, x, y) => {
        wrapperElement.style.backgroundPosition = `${-(x - screen.availLeft)}px ${-(y - screen.availTop)}px`;
        wrapperElement.style.backgroundSize = `${screen.width}px ${screen.height}px`;
    });
}

async function enableDynamicColor(){
    if(!wallpaper){
        wallpaper = await getWallpaper();
    }

    const img = new Image();
    img.src = wallpaper;

    img.onload = function(){
        const color = LS.Color.fromImage(img);

        LS.Color.update("dynamic", color);
        LS.Color.setAccent("dynamic");
    }
}

// enableDynamicColor()
// enableAcrylicWindow()
