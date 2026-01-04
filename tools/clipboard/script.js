const { exec, execSync } = require("child_process");
const { xxh3 } = require("@node-rs/xxhash");
const fs = require("fs");

const { clipboard, nativeImage } = require('electron');
const PINNED_FILE = __dirname + '/pinnedClipboard.json';

function safeReadJSON(path){
    try { return JSON.parse(fs.readFileSync(path, 'utf8')); } catch(e){ return []; }
}

function savePinned(){
    try {
        const pinnedExport = clipboardItems.filter(i => i.pinned).map(i => {
            const content = {};
            if(i.content.text) content.text = i.content.text;
            if(i.content.html) content.html = i.content.html;
            if(i.content.rtf) content.rtf = i.content.rtf;
            if(i.content.files) content.files = i.content.files;
            if(i.content.image) content.imageDataUrl = i.content.image.toDataURL();
            return { formats: i.formats, content, hash: i.hash.toString() };
        });
        fs.writeFileSync(PINNED_FILE, JSON.stringify(pinnedExport, null, 2));
    } catch(e){ console.error("Failed saving pinned entries", e); }
}

function addControls(item){
    const controls = N({
        class: 'clipboard-item-controls'
    });

    const isPinned = !!item.pinned;
    const pinBtn = N('button', {
        class: 'clip-pin-btn circle elevated',
        inner: N('i', { class: isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle' }),
        title: 'Pin',
        onclick(e){
            e.stopPropagation();
            item.pinned = !item.pinned;
            if(item.pinned){
                pinBtn.querySelector('i').classList.remove('bi-pin-angle');
                pinBtn.querySelector('i').classList.add('bi-pin-angle-fill');
                item.element.classList.add('pinned');
            } else {
                pinBtn.querySelector('i').classList.add('bi-pin-angle');
                pinBtn.querySelector('i').classList.remove('bi-pin-angle-fill');
                item.element.classList.remove('pinned');
            }
            savePinned();
        }
    });

    if(isPinned) item.element.classList.add('pinned');

    const removeBtn = N('button', {
        class: 'clip-remove-btn circle elevated',
        inner: N('i', { class: 'bi-x' }),
        title: 'Remove',
        onclick(e){
            e.stopPropagation();
            const idx = clipboardItems.indexOf(item);
            if(idx > -1) clipboardItems.splice(idx,1);
            item.container.remove();
            if(item.pinned) savePinned();
        }
    });

    controls.add(pinBtn, removeBtn);
    item.element.style.position = 'relative';
    item.element.add(controls);
}

function loadPinned(){
    if(!fs.existsSync(PINNED_FILE)) return;
    const stored = safeReadJSON(PINNED_FILE);
    stored.forEach(st => {
        const item = {
            formats: st.formats || [],
            content: {},
            pinned: true,
            element: N("ls-box", {
                class: "clipboard-item contained level-2 pinned",
                attr: { tabindex: '1' },
                onclick(){
                    clipboard.write(item.content);
                    LS.Toast.show("Copied to clipboard", { timeout: 1500 });
                    arc.window.hide();
                    paste();
                }
            }),
            container: N({ class: 'clipboard-item-container' }),
            hash: BigInt(st.hash)
        };
        item.container.add(item.element);
        addControls(item);
        // Rebuild content
        if(st.content.imageDataUrl){
            item.content.image = nativeImage.createFromDataURL(st.content.imageDataUrl);
            item.element.add(N({
                class: 'clipboard-item-image-container',
                inner: N('img', { src: st.content.imageDataUrl })
            }));
        }
        if(st.content.text){
            item.content.text = st.content.text;
            item.element.add(N({ class: 'clipboard-item-text-container', innerText: st.content.text }));
        }
        if(st.content.html){ item.content.html = st.content.html; }
        if(st.content.rtf){ item.content.rtf = st.content.rtf; }
        if(st.content.files){ item.content.files = st.content.files; }
        // Ensure hash exists
        if(!item.hash){
            if(item.content.text) item.hash = xxh3.xxh64(item.content.text);
            else if(item.content.image) item.hash = xxh3.xxh64(item.content.image.toBitmap());
            else item.hash = xxh3.xxh64(JSON.stringify(item.content));
        }
        item.element.__hash = item.hash;
        clipboardItems.push(item);
        clipboardHistory.prepend(item.container);
    });
}

const mainElement = document.getElementById('main');
const clipboardHistory = document.getElementById('clipboardHistory');

const tabs = new LS.Tabs(document.getElementById('content'), { list: true });

tabs.set(0);

const clipboardEvent = require('clipboard-event');

clipboardEvent.startListening();

// Load persisted pinned items early
const clipboardItems = [];
loadPinned();

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
        pinned: false,
        element: N("ls-box", {
            class: "clipboard-item contained level-2",
            attr: { tabindex: "1" },
            onclick() {
                clipboard.write(item.content);
                LS.Toast.show("Copied to clipboard", { timeout: 1500 });
                arc.window.hide();
                paste();
            }
        }),
        container: N({ class: "clipboard-item-container" })
    }

    item.container.add(item.element);
    addControls(item);

    let isFileList = item.formats.includes("text/uri-list"), image = item.formats.find(f => f.startsWith("image/"));

    if(image){
        item.content.image = clipboard.readImage();
        type = "image";

        if(!checkDuplicate(item, item.content.image.toBitmap())){
            return;
        }

        item.element.add(N({
            class: "clipboard-item-image-container",
            inner: N("img", { src: item.content.image.toDataURL() })
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
    savePinned();
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

function checkIsMounted(path) {
    try {
        const result = execSync(`mount | grep ${path}`);
        return result.toString().trim() !== '';
    } catch (error) {
        console.error(`Error checking if ${path} is mounted:`, error);
        return false;
    }
}

if(fs.existsSync(__dirname + '/folders.json')) {
    const lockedFolders = document.getElementById('lockedFolders');
    const refreshButton = document.getElementById('lockedFoldersRefresh');

    function refresh() {
        const folders = require('./folders.json');
        
        folders.forEach(folder => {
            if(!folder.path) return;

            if(!folder.cipherFolder) folder.cipherFolder = "cipher";
            if(!folder.plainFolder) folder.plainFolder = "plain";

            let isMounted = checkIsMounted(folder.path + '/' + folder.plainFolder);

            console.log(`Checking if ${folder.path}/${folder.plainFolder}/ is mounted: ${isMounted}`);

            const button = N("button", {
                class: "pill",
                inner: [ N("i", { class: "bi-" + (isMounted? "folder-fill": "folder-x"), style: {marginRight: "6px"} }), folder.name ],
                accent: folder.color || "blue",
                onclick() {
                    if(isMounted) {
                        exec(`fusermount -u ${folder.path}/${folder.plainFolder}`);
                        this.querySelector("i").classList.remove("bi-folder-fill");
                        this.querySelector("i").classList.add("bi-folder-x");
                        LS.Toast.show("Folder unmounted", { timeout: 1500, accent: "green" });
                        isMounted = false;
                    } else {
                        if(!fs.existsSync(folder.path + '/' + folder.plainFolder)) {
                            fs.mkdirSync(folder.path + '/' + folder.plainFolder, { recursive: true });
                        }
                        
                        if(!fs.existsSync(folder.path + '/' + folder.cipherFolder)) {
                            fs.mkdirSync(folder.path + '/' + folder.cipherFolder, { recursive: true });
                        }

                        exec(`gocryptfs ${folder.path}/${folder.cipherFolder} ${folder.path}/${folder.plainFolder} -extpass 'zenity --password'`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error mounting folder: ${error.message}`);
                                LS.Toast.show("Failed to mount folder", { timeout: 2000, accent: "red" });
                                return;
                            }

                            if (stderr) {
                                console.warn(`Mount stderr: ${stderr}`);
                            }

                            this.querySelector("i").classList.remove("bi-folder-x");
                            this.querySelector("i").classList.add("bi-folder-fill");
                            isMounted = true;
                            LS.Toast.show("Folder mounted", { timeout: 1500, accent: "green" });
                        });
                    }
                }
            });

            lockedFolders.appendChild(button);
        });
    }

    refresh();

    refreshButton.addEventListener('click', () => {
        lockedFolders.innerHTML = '';
        refresh();
    });
} else {
    tabs.remove("lockedFoldersTab");
}