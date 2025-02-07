LS.Color.autoScheme()

const { xxh3 } = require("@node-rs/xxhash");

const mainElement = document.getElementById('main');
const wrapperElement = document.getElementById('wrapper');
const clipboardHistory = document.getElementById('clipboardHistory');

const tabs = new LS.Tabs(document.getElementById('content'), { list: false })

const clipboardEvent = require('clipboard-event')
const { ipcRenderer, clipboard } = require('electron');

clipboardEvent.startListening();

async function getWallpaper() {
    return await ipcRenderer.invoke('get-wallpaper');
}

let wallpaper = null;

async function enableAcrylicWindow(){
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

        LS.Color.setAccent(color);
    }
}

enableDynamicColor()
// enableAcrylicWindow()

const clipboardItems = [];

function checkDuplicate(item, data){
    item.hash = xxh3.xxh64(data);
    item.element.__hash = item.hash;
    
    if(clipboardHistory.children[clipboardHistory.children.length - 1]?.__hash === item.hash){
        return false;
    }

    const existing = clipboardItems.find(i => i.hash === item.hash);

    if(existing){
        clipboardHistory.prepend(existing.container);
        return false;
    }

    return true;
}

clipboardEvent.on('change', () => {
    console.log('Clipboard changed');

    const item = {
        formats: clipboard.availableFormats(),

        content: {},

        element: N("ls-box", {
            class: "clipboard-item contained level-2",

            onclick() {
                clipboard.write(item.content);

                LS.Toast.show("Copied to clipboard", {
                    timeout: 1500
                });
            }
        }),

        container: N({
            class: "clipboard-item-container"
        })
    }

    item.container.add(item.element);

    let isFileList = item.formats.includes("text/uri-list"), image = item.formats.find(f => f.startsWith("image/"));

    if(image){
        item.content.image = clipboard.readImage();
        type = "image";

        if(!checkDuplicate(item, item.content.image.toBitmap())){
            return;
        }

        item.element.add(N({
            class: "clipboard-item-image-container",
            inner: N("img", {
                src: item.content.image.toDataURL()
            })
        }));
    }

    if(item.formats.includes("text/plain")){
        item.content.text = clipboard.readText();

        if(!checkDuplicate(item, item.content.text)){
            return;
        }
        
        item.element.add(N({
            class: "clipboard-item-text-container",
            innerText: item.content.text
        }));
    }


    for(let format of item.formats){
        if(format === "text/html"){
            item.content.html = clipboard.readHTML();
            continue;
        }

        if(format === "text/rtf"){
            item.content.rtf = clipboard.readRTF();
            continue;
        }

        if(format === "text/uri-list"){
            item.content.files = clipboard.read("text/uri-list").replaceAll("\r", "").split("\n").filter(Boolean);
            // return; // TODO: Implement files

            // for(let file of item.content.files){
            //     item.element.add(N({
            //         class: "clipboard-item-file-container",
            //         inner: N("ls-box", {
            //             class: "clipboard-item-file",
            //         })
            //     }));
            // }
            continue;
        }
    }


    clipboardItems.push(item);
    clipboardHistory.prepend(item.container);
});

function clearAll(){
    clipboardItems.length = 0;
    clipboardHistory.innerHTML = "";
}