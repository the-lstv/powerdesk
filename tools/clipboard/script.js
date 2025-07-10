const { exec } = require("child_process");
const { xxh3 } = require("@node-rs/xxhash");
const fs = require("fs");

const mainElement = document.getElementById('main');
const clipboardHistory = document.getElementById('clipboardHistory');

const tabs = new LS.Tabs(document.getElementById('content'), { list: true });

tabs.set(0);

const clipboardEvent = require('clipboard-event');
const { clipboard } = require('electron');

clipboardEvent.startListening();

arc.registerShortcut('Alt+v');
arc.registerShortcut('Alt+.');

arc.on('handle-shortcut', (event, shortcut) => {
    arc.window.toggle();
});

arc.on('focus', (event, x, y) => {
    const item = clipboardHistory.children[0];

    if(item){
        item.querySelector(".clipboard-item").focus();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); // Prevent scrolling

        let focusable = Array.from(clipboardHistory.children);

        if(focusable.length === 0) return;

        let currentIndex = focusable.indexOf(document.activeElement);

        if (event.key === "ArrowDown") {
            let nextIndex = (currentIndex + 1) % focusable.length;
            focusable[nextIndex].focus();
        } else if (event.key === "ArrowUp") {
            let prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
            focusable[prevIndex].focus();
        }
    }
});

window.addEventListener("blur", () => {
    arc.window.hide();
});

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

            attr: {
                tabindex: "1",
            },

            onclick() {
                clipboard.write(item.content);

                LS.Toast.show("Copied to clipboard", {
                    timeout: 1500
                });

                arc.window.hide();
                paste();
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

function paste() {
    if (process.platform === "linux") {
        exec("xdotool key ctrl+v");
    } else if (process.platform === "win32") {
        exec("powershell.exe -command \"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^{v}')\"");
    } else if (process.platform === "darwin") {
        exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
    }
}

function copyPaste(text) {
    clipboard.writeText(text);
    arc.window.hide();
    paste();
}

// Windows ¯\_(ツ)_/¯
// if(process.platform === "win32"){
//     const ffi = require("ffi-napi");
//     const ref = require("ref-napi");

//     const user32 = new ffi.Library("user32.dll", {
//         keybd_event: ["void", ["uint8", "uint8", "uint32", "int32"]]
//     });

//     // Constants for key events
//     const KEYEVENTF_KEYDOWN = 0x0000;
//     const KEYEVENTF_KEYUP = 0x0002;
//     const VK_CONTROL = 0x11;
//     const VK_V = 0x56;

//     paste = () => {
//         user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYDOWN, 0);
//         user32.keybd_event(VK_V, 0, KEYEVENTF_KEYDOWN, 0);
//         user32.keybd_event(VK_V, 0, KEYEVENTF_KEYUP, 0);
//         user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
//     }
// }

if(fs.existsSync(__dirname + '/folders.json')) {
    const lockedFolders = document.getElementById('lockedFolders');

    const folders = require('./folders.json');

    folders.forEach(folder => {
        const button = N("button", {
            class: "pill",
            textContent: folder.name,
            accent: folder.color || "blue",
            onclick: () => exec(`gocryptfs ${folder.path}/${folder.cipherFolder || "cipher"}/ ${folder.path}/${folder.plainFolder || "plain"}/ -extpass 'zenity --password'`)
        });

        lockedFolders.appendChild(button);
    });
} else {
    tabs.remove("lockedFoldersTab");
}