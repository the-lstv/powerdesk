const { exec, execSync } = require("child_process");
const { xxh3 } = require("@node-rs/xxhash");
const fs = require("fs");

arc.registerShortcut("Alt+v");
arc.registerShortcut("Alt+.");

arc.on("handle-shortcut", () => {
    arc.window.toggle();
});

console.log("Clipboard manager initialized");

const { clipboard, nativeImage } = require("electron");
const PINNED_FILE = __dirname + "/pinnedClipboard.json";

const MAX_ITEMS = 1200;
const INITIAL_RENDER_LIMIT = 120;
const RENDER_STEP = 80;
const SEARCH_DEBOUNCE_MS = 120;
const TEXT_HASH_SAMPLE_SIZE = 4096;
const TEXT_PREVIEW_LIMIT = 2000;

const clipboardItems = [];
const clipboardHashMap = new Map();

let searchQuery = "";
let renderLimit = INITIAL_RENDER_LIMIT;
let isClipboardProcessing = false;
let hasClipboardPending = false;

// Temporary until LS is updated
LS.SelectOne = (selector => document.querySelector(selector));

const clipboardHistory = LS.SelectOne("#clipboardHistory");
const clipboardSearch = LS.SelectOne("#clipboardSearch");
const content = LS.SelectOne("#content");

const tabs = new LS.Tabs(content, { list: true });

// Temporary hack
[...tabs.tabs.values()].forEach(tab => { tab.handle = null; tab.title = LS.Create({ html: tab.title }); });
tabs.renderList();

const clipboardEvent = require("clipboard-event");
clipboardEvent.startListening();

const resultMeta = LS.Create("div", {
    id: "clipboardResultMeta",
    class: "clipboard-result-meta",
    innerText: "",
});

const loadMoreButton = LS.Create("button", {
    id: "clipboardLoadMore",
    class: "pill elevated",
    innerText: "Load more",
    style: { display: "none" },
    onclick() {
        renderLimit += RENDER_STEP;
        renderClipboardList();
    },
});

clipboardHistory.insertAdjacentElement("beforebegin", resultMeta);
clipboardHistory.insertAdjacentElement("afterend", loadMoreButton);

tabs.set(0);

loadPinned();
refreshSearchIndexForAll();
renderClipboardList();

arc.on("focus", () => {
    const first = clipboardHistory.querySelector(".clipboard-item");
    if (first) first.focus();
});

if (clipboardSearch) {
    const debouncedSearch = debounce((value) => {
        searchQuery = normalizeSearch(value);
        renderLimit = INITIAL_RENDER_LIMIT;
        renderClipboardList();
    }, SEARCH_DEBOUNCE_MS);

    clipboardSearch.addEventListener("input", (event) => {
        debouncedSearch(event.target.value);
    });
}

clipboardHistory.addEventListener("scroll", () => {
    if (clipboardHistory.scrollTop + clipboardHistory.clientHeight >= clipboardHistory.scrollHeight - 120) {
        const filtered = getFilteredItems();
        if (renderLimit < filtered.length) {
            renderLimit += RENDER_STEP;
            renderClipboardList();
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const focusable = Array.from(LS.Select("#clipboardHistory .clipboard-item"));
    if (focusable.length === 0) return;

    const currentIndex = focusable.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
        return;
    }

    const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
    focusable[prevIndex].focus();
});

window.addEventListener("blur", () => {
    arc.window.hide();
});

clipboardEvent.on("change", () => {
    hasClipboardPending = true;
    processClipboardQueue();
});

function processClipboardQueue() {
    if (isClipboardProcessing) return;

    isClipboardProcessing = true;

    try {
        while (hasClipboardPending) {
            hasClipboardPending = false;
            ingestClipboardSnapshot();
        }
    } finally {
        isClipboardProcessing = false;
    }
}

function ingestClipboardSnapshot() {
    const item = {
        formats: clipboard.availableFormats(),
        content: {},
        pinned: false,
        hash: null,
        createdAt: Date.now(),
        searchText: "",
        previewText: "",
        previewImageDataUrl: null,
        element: null,
        container: null,
    };

    const hasImage = item.formats.some((format) => format.startsWith("image/"));

    if (hasImage) {
        const image = clipboard.readImage();
        if (!image.isEmpty()) {
            item.content.image = image;
            item.previewImageDataUrl = buildImagePreview(image);
        }
    }

    if (item.formats.includes("text/plain")) {
        item.content.text = clipboard.readText();
        item.previewText = createTextPreview(item.content.text);
    }

    if (item.formats.includes("text/html")) {
        item.content.html = clipboard.readHTML();
    }

    if (item.formats.includes("text/rtf")) {
        item.content.rtf = clipboard.readRTF();
    }

    if (item.formats.includes("text/uri-list")) {
        item.content.files = clipboard
            .read("text/uri-list")
            .replaceAll("\r", "")
            .split("\n")
            .filter(Boolean);
    }

    if (Object.keys(item.content).length === 0) return;

    item.hash = buildClipboardHash(item);
    item.searchText = buildSearchText(item);

    const existingItem = clipboardHashMap.get(item.hash.toString());
    if (existingItem) {
        moveItemToFront(existingItem);
        renderClipboardList();
        return;
    }

    clipboardItems.unshift(item);
    clipboardHashMap.set(item.hash.toString(), item);

    enforceItemLimit();
    renderClipboardList();
}

function buildClipboardItemElement(item) {
    if (item.element) return;

    item.element = LS.Create("ls-box", {
        class: "clipboard-item contained level-2",
        attr: { tabindex: "1" },
        onclick() {
            clipboard.write(item.content);
            LS.Toast.show("Copied to clipboard", { timeout: 1500 });
            arc.window.hide();
            paste();
        },
    });

    item.container = LS.Create("div", { class: "clipboard-item-container" });
    item.container.append(item.element);

    if (item.pinned) {
        item.element.classList.add("pinned");
    }

    if (item.previewImageDataUrl) {
        item.element.append(
            LS.Create("div", {
                class: "clipboard-item-image-container",
                inner: [{ tag: "img", src: item.previewImageDataUrl, alt: "Clipboard image preview" }],
            })
        );
    }

    if (item.previewText) {
        item.element.append(
            LS.Create("div", {
                class: "clipboard-item-text-container",
                innerText: item.previewText,
                title: item.content.text || "",
            })
        );
    }

    addControls(item);
}

function addControls(item) {
    const controls = LS.Create("div", { class: "clipboard-item-controls" });

    const pinIcon = LS.Create("i", { class: item.pinned ? "bi-pin-angle-fill" : "bi-pin-angle" });

    const pinBtn = LS.Create("button", {
        class: "clip-pin-btn circle elevated",
        inner: [pinIcon],
        title: "Pin",
        onclick(event) {
            event.stopPropagation();

            item.pinned = !item.pinned;
            pinIcon.className = item.pinned ? "bi-pin-angle-fill" : "bi-pin-angle";
            item.element.classList.toggle("pinned", item.pinned);

            savePinned();
        },
    });

    const removeBtn = LS.Create("button", {
        class: "clip-remove-btn circle elevated",
        inner: [{ tag: "i", class: "bi-x" }],
        title: "Remove",
        onclick(event) {
            event.stopPropagation();
            removeItem(item, { savePinnedState: item.pinned });
            renderClipboardList();
        },
    });

    controls.append(pinBtn, removeBtn);
    item.element.append(controls);
}

function getFilteredItems() {
    if (!searchQuery) return clipboardItems;
    return clipboardItems.filter((item) => item.searchText.includes(searchQuery));
}

function renderClipboardList() {
    const filteredItems = getFilteredItems();
    const visibleItems = filteredItems.slice(0, renderLimit);

    clipboardHistory.innerHTML = "";

    if (filteredItems.length === 0) {
        clipboardHistory.append(
            LS.Create("div", {
                class: "clipboard-empty-state",
                innerText: searchQuery ? "No matches found" : "Clipboard is empty",
            })
        );

        resultMeta.innerText = "";
        loadMoreButton.style.display = "none";
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const item of visibleItems) {
        buildClipboardItemElement(item);
        fragment.append(item.container);
    }

    clipboardHistory.append(fragment);

    const shownCount = visibleItems.length;
    resultMeta.innerText = `${shownCount} / ${filteredItems.length} shown`;

    if (shownCount < filteredItems.length) {
        loadMoreButton.style.display = "inline-flex";
        return;
    }

    loadMoreButton.style.display = "none";
}

function moveItemToFront(item) {
    const currentIndex = clipboardItems.indexOf(item);
    if (currentIndex <= 0) return;

    clipboardItems.splice(currentIndex, 1);
    clipboardItems.unshift(item);
}

function removeItem(item, options = {}) {
    const { savePinnedState = false } = options;

    const itemIndex = clipboardItems.indexOf(item);
    if (itemIndex !== -1) {
        clipboardItems.splice(itemIndex, 1);
    }

    if (item.hash) {
        clipboardHashMap.delete(item.hash.toString());
    }

    if (savePinnedState) savePinned();
}

function enforceItemLimit() {
    if (clipboardItems.length <= MAX_ITEMS) return;

    for (let index = clipboardItems.length - 1; index >= 0 && clipboardItems.length > MAX_ITEMS; index--) {
        if (clipboardItems[index].pinned) continue;
        removeItem(clipboardItems[index]);
    }
}

function normalizeSearch(value) {
    return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function buildSearchText(item) {
    const sections = [];

    if (item.content.text) sections.push(item.content.text);
    if (item.content.files) sections.push(item.content.files.join(" "));
    if (item.formats && item.formats.length) sections.push(item.formats.join(" "));

    return normalizeSearch(sections.join(" "));
}

function refreshSearchIndexForAll() {
    for (const item of clipboardItems) {
        item.searchText = buildSearchText(item);
    }
}

function createTextPreview(value) {
    if (!value) return "";
    if (value.length <= TEXT_PREVIEW_LIMIT) return value;

    return `${value.slice(0, TEXT_PREVIEW_LIMIT)}\n... (${value.length - TEXT_PREVIEW_LIMIT} more chars)`;
}

function buildImagePreview(image) {
    try {
        const size = image.getSize();
        if (!size.width || !size.height) return image.toDataURL();

        const targetWidth = Math.min(360, size.width);
        const targetHeight = Math.max(1, Math.round(size.height * (targetWidth / size.width)));
        return image.resize({ width: targetWidth, height: targetHeight, quality: "good" }).toDataURL();
    } catch (error) {
        return image.toDataURL();
    }
}

function createTextHashSource(text) {
    if (text.length <= TEXT_HASH_SAMPLE_SIZE * 2) return text;
    return `${text.slice(0, TEXT_HASH_SAMPLE_SIZE)}\0${text.slice(-TEXT_HASH_SAMPLE_SIZE)}\0${text.length}`;
}

function buildClipboardHash(item) {
    if (item.content.text) {
        return xxh3.xxh64(createTextHashSource(item.content.text));
    }

    if (item.content.image) {
        try {
            const source = item.content.image;
            const size = source.getSize();
            const thumb = source.resize({ width: 48, height: 48, quality: "good" });
            const bitmap = thumb.toBitmap();
            const sizedBitmap = Buffer.concat([bitmap, Buffer.from(`${size.width}x${size.height}`)]);
            return xxh3.xxh64(sizedBitmap);
        } catch (error) {
            return xxh3.xxh64(item.content.image.toDataURL());
        }
    }

    if (item.content.files) {
        return xxh3.xxh64(item.content.files.join("|"));
    }

    return xxh3.xxh64(JSON.stringify(item.content || {}));
}

function safeReadJSON(path) {
    try {
        return JSON.parse(fs.readFileSync(path, "utf8"));
    } catch (error) {
        return [];
    }
}

function savePinned() {
    try {
        const pinnedExport = clipboardItems
            .filter((item) => item.pinned)
            .map((item) => {
                const content = {};

                if (item.content.text) content.text = item.content.text;
                if (item.content.html) content.html = item.content.html;
                if (item.content.rtf) content.rtf = item.content.rtf;
                if (item.content.files) content.files = item.content.files;
                if (item.content.image) content.imageDataUrl = item.content.image.toDataURL();

                return {
                    formats: item.formats,
                    content,
                    hash: item.hash ? item.hash.toString() : null,
                };
            });

        fs.writeFileSync(PINNED_FILE, JSON.stringify(pinnedExport, null, 2));
    } catch (error) {
        console.error("Failed saving pinned entries", error);
    }
}

function loadPinned() {
    if (!fs.existsSync(PINNED_FILE)) return;

    const stored = safeReadJSON(PINNED_FILE);

    for (const entry of stored) {
        const item = {
            formats: entry.formats || [],
            content: {},
            pinned: true,
            hash: null,
            createdAt: Date.now(),
            searchText: "",
            previewText: "",
            previewImageDataUrl: null,
            element: null,
            container: null,
        };

        if (entry.content && entry.content.imageDataUrl) {
            item.content.image = nativeImage.createFromDataURL(entry.content.imageDataUrl);
            item.previewImageDataUrl = buildImagePreview(item.content.image);
        }

        if (entry.content && entry.content.text) {
            item.content.text = entry.content.text;
            item.previewText = createTextPreview(entry.content.text);
        }

        if (entry.content && entry.content.html) item.content.html = entry.content.html;
        if (entry.content && entry.content.rtf) item.content.rtf = entry.content.rtf;
        if (entry.content && entry.content.files) item.content.files = entry.content.files;

        if (entry.hash) {
            item.hash = BigInt(entry.hash);
        } else {
            item.hash = buildClipboardHash(item);
        }

        item.searchText = buildSearchText(item);

        const key = item.hash.toString();
        if (clipboardHashMap.has(key)) continue;

        clipboardItems.push(item);
        clipboardHashMap.set(key, item);
    }
}

function clearAll() {
    clipboardItems.length = 0;
    clipboardHashMap.clear();
    renderClipboardList();
    savePinned();
}

function paste() {
    if (process.platform === "linux") {
        exec("xdotool key ctrl+v");
        return;
    }

    if (process.platform === "win32") {
        exec("powershell.exe -command \"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^{v}')\"");
        return;
    }

    if (process.platform === "darwin") {
        exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
    }
}

function copyPaste(text) {
    clipboard.writeText(text);
    arc.window.hide();
    paste();
}

function debounce(callback, delay) {
    let timeout = null;

    return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
    };
}

function checkIsMounted(path) {
    try {
        const result = execSync(`mount | grep ${path}`);
        return result.toString().trim() !== "";
    } catch (error) {
        console.error(`Error checking if ${path} is mounted:`, error);
        return false;
    }
}

if (fs.existsSync(__dirname + "/folders.json")) {
    const lockedFolders = LS.SelectOne("#lockedFolders");
    const refreshButton = LS.SelectOne("#lockedFoldersRefresh");

    function refresh() {
        const folders = require("./folders.json");

        for (const folder of folders) {
            if (!folder.path) continue;

            if (!folder.cipherFolder) folder.cipherFolder = "cipher";
            if (!folder.plainFolder) folder.plainFolder = "plain";

            let isMounted = checkIsMounted(folder.path + "/" + folder.plainFolder);

            const icon = LS.Create("i", {
                class: "bi-" + (isMounted ? "folder-fill" : "folder-x"),
                style: { marginRight: "6px" },
            });

            const button = LS.Create("button", {
                class: "pill",
                inner: [icon, folder.name],
                accent: folder.color || "blue",
                onclick() {
                    if (isMounted) {
                        exec(`fusermount -u ${folder.path}/${folder.plainFolder}`);
                        icon.classList.remove("bi-folder-fill");
                        icon.classList.add("bi-folder-x");
                        LS.Toast.show("Folder unmounted", { timeout: 1500, accent: "green" });
                        isMounted = false;
                        return;
                    }

                    if (!fs.existsSync(folder.path + "/" + folder.plainFolder)) {
                        fs.mkdirSync(folder.path + "/" + folder.plainFolder, { recursive: true });
                    }

                    if (!fs.existsSync(folder.path + "/" + folder.cipherFolder)) {
                        fs.mkdirSync(folder.path + "/" + folder.cipherFolder, { recursive: true });
                    }

                    exec(
                        `gocryptfs ${folder.path}/${folder.cipherFolder} ${folder.path}/${folder.plainFolder} -extpass 'zenity --password'`,
                        (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error mounting folder: ${error.message}`);
                                LS.Toast.show("Failed to mount folder", { timeout: 2000, accent: "red" });
                                return;
                            }

                            if (stderr) {
                                console.warn(`Mount stderr: ${stderr}`);
                            }

                            icon.classList.remove("bi-folder-x");
                            icon.classList.add("bi-folder-fill");
                            isMounted = true;
                            LS.Toast.show("Folder mounted", { timeout: 1500, accent: "green" });
                        }
                    );
                },
            });

            lockedFolders.appendChild(button);
        }
    }

    refresh();

    refreshButton.addEventListener("click", () => {
        lockedFolders.innerHTML = "";
        refresh();
    });
} else {
    tabs.remove("lockedFoldersTab");
}
