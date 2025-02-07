/*
    Author: Lukas (thelstv)
    Copyright: (c) https://lstv.space

    Last modified: 2025
    License: GPL-3.0
    Version: 5.1.0
    See: https://github.com/thelstv/LS
*/

(exports => {

    const global = typeof window !== 'undefined'? window : globalThis;
    const instance = exports();

    if(typeof module !== "undefined"){
        module.exports = instance
    }

    if(instance.isWeb){
        global.LS = instance

        for (let key in instance.Tiny){
            global[key] = instance.Tiny[key]
        }

        if(!window.ls_do_not_prototype) LS.prototypeTiny();

        LS._topLayer = LS.Create({id: "ls-top-layer", style: {
            position: "fixed"
        }});

        LS._topLayerInherit = function () { console.error("LS._topLayerInherit is deprecated and no longer serves any purpose, you can safely remove it from your code.") }

        function bodyAvailable(){
            document.body.append(LS._topLayer)
            LS._events.completed("body-available")
        }

        if(document.body) bodyAvailable(); else window.addEventListener("load", bodyAvailable);
    }

    return instance

})(() => {

    const LS = {
        isWeb: typeof window !== 'undefined',
        version: "5.1.0",
        v: 5,

        init(options = {}){
            if(!this.isWeb) return;

            options = LS.Util.defaults({
                globalPrototype: true,
                theme: null,
                accent: null,
                autoScheme: true,
                adaptiveTheme: false
            }, options);

            if(options.globalPrototype) LS.prototypeTiny();
            if(options.theme) this.Color.setTheme(options.theme);
            if(options.accent) this.Color.setAccent(options.accent);
            if(options.autoScheme) this.Color.autoScheme(options.adaptiveTheme);

            LS._events.completed("init")
        },

        components: new Map,

        EventHandler: class EventHandler {
            constructor(target, options = {}){
                this.events = new Map;
                this.options = options;

                if(target){
                    target._events = this;

                    ["emit", "on", "once", "off", "invoke"].forEach(method => {
                        if (!target.hasOwnProperty(method)) target[method] = this[method].bind(this);
                    });

                    this.target = target;
                }
            }

            prepare(name, options){
                if(!this.events.has(name)){
                    this.events.set(name, { listeners: [], empty: [], ...options, _isEvent: true })
                } else if(options){
                    Object.assign(this.events.get(name), options)
                }

                return this.events.get(name)
            }

            on(name, callback, options){
                const event = (name._isEvent? name: this.events.get(name)) || this.prepare(name);
                if(event.completed) return callback();

                const index = event.empty.length > 0 ? event.empty.pop() : event.listeners.length;

                event.listeners[index] = { callback, index, ...options }
                return this
            }

            off(name, callback){
                const event = name._isEvent? name: this.events.get(name);
                if(!event) return;

                for(let i = 0; i < event.listeners.length; i++){
                    if(event.listeners[i].callback === callback) {
                        event.empty.push(i)
                        event.listeners[i] = null
                    }
                }

                return this
            }

            once(name, callback, options){
                return this.on(name, callback, Object.assign(options || {}, { once: true }))
            }

            /**
             * @deprecated
            */
            invoke(name, ...data){
                return this.emit(name, data, { results: true })
            }

            emit(name, data, options = {}){
                if(!name) return;

                const event = name._isEvent? name: this.events.get(name);

                const returnData = options.results? []: null;
                if(!event) return returnData;

                const hasData = Array.isArray(data) && data.length > 0;

                for(let listener of event.listeners){
                    if(!listener || typeof listener.callback !== "function") continue;

                    try {
                        const result = hasData? listener.callback(...data): listener.callback();

                        if(options.break && result === false) break;
                        if(options.results) returnData.push(result);
                    } catch (error) {
                        console.error(`Error in listener for event '${name}':`, listener, error);
                    }

                    if(listener.once) {
                        event.empty.push(listener.index);
                        event.listeners[listener.index] = null;
                        listener = null;
                    }
                }

                return returnData
            }

            rapidFire(event, data){
                if(!event._isEvent) throw new Error("Event must be a valid event object when using rapidFire");

                for(let i = 0; i < event.listeners.length; i++){
                    event.listeners[i].callback(data);
                }
            }

            flush() {
                this.events.clear();
            }

            alias(name, alias){
                this.events.set(alias, this.prepare(name))
            }

            completed(name){
                this.emit(name)

                this.prepare(name, {
                    completed: true
                })
            }
        },

        TinyWrap(elements){
            if(!elements) return null;
            
            // No need to wrap anything, prototypes are global
            if(LS.Tiny._prototyped) return elements;

            function wrap(element){
                return element._lsWrapped || (element._lsWrapped = new Proxy(element, {
                    get(target, key){
                        return LS.TinyFactory[key] || target[key]
                    },
    
                    set(target, key, value){
                        return target[key] = value
                    }
                }))
            }

            return Array.isArray(elements)? elements.map(wrap): wrap(elements);
        },

        Tiny: {
            /**
             * @description Element selector utility
             */
            Q(selector, subSelector, one = false) {
                if(!selector) return LS.TinyWrap(one? null: []);

                const isElement = selector instanceof HTMLElement;
                const target = (isElement? selector : document);

                if(isElement && !subSelector) return LS.TinyWrap(one? selector: [selector]);

                const actualSelector = isElement? subSelector || "*" : selector || '*';

                let elements = one? target.querySelector(actualSelector): target.querySelectorAll(actualSelector);
                
                return LS.TinyWrap(one? elements: [...elements]);
            },

            /**
             * @description Single element selector
             */
            O(selector, subSelector){
                if(!selector) return LS.TinyWrap(document.body);
                return LS.Tiny.Q(selector, subSelector, true)
            },

            /**
             * @description Element builder utility
             */
            N(tagName = "div", content){
                if(typeof tagName !== "string"){
                    content = tagName;
                    tagName = "div";
                }

                content =
                    typeof content === "string" 
                        ? { innerHTML: content } 
                        : Array.isArray(content) 
                            ? { inner: content } 
                            : content || {};


                const { class: className, tooltip, ns, accent, attr, style, inner, content: innerContent, ...rest } = content;

                const element = Object.assign(
                    ns ? document.createElementNS(ns, tagName) : document.createElement(tagName),
                    rest
                );

                // Handle attributes
                if (accent) LS.TinyFactory.attrAssign.call(element, { "ls-accent": accent });
                if (attr) LS.TinyFactory.attrAssign.call(element, attr);

                // Handle tooltips
                if (tooltip) {
                    if (!LS.Tooltips) {
                        element.attrAssign({ title: tooltip });
                    } else {
                        element.attrAssign({ "ls-tooltip": tooltip });
                        LS.Tooltips.addElements([{ target: element, attributeName: "ls-tooltip" }]);
                    }
                }

                if (className && element.class) LS.TinyFactory.class.call(element, className);
                if (typeof style === "object") LS.TinyFactory.applyStyle.call(element, style);

                // Append children or content
                const contentToAdd = inner || innerContent;
                if (contentToAdd) LS.TinyFactory.add.call(element, contentToAdd);

                return element;
            },

            /**
             * @description Color utilities
             */
            C(r, g, b, a = 1){
                return new LS.Color(r, g, b, a)
            },

            M: {
                _GlobalID: {
                    count: 0,
                    prefix: Math.round(Math.random() * 1e3).toString(36) + Math.round(Math.random() * 1e3).toString(36)
                },

                ShiftDown: false,
                ControlDown: false,
                lastKey: null,

                on(...events){
                    let fn = events.find(event => typeof event === "function");

                    for(const event of events){
                        if(typeof event !== "string") continue;
                        window.addEventListener(event, fn)
                    }
                    return LS.Tiny.M
                },

                get GlobalID(){
                    // return M.GlobalIndex.toString(36)

                    LS.Tiny.M._GlobalID.count++;

                    return `${Date.now().toString(36)}-${(LS.Tiny.M._GlobalID.count).toString(36)}-${LS.Tiny.M._GlobalID.prefix}`
                },

                uid(){
                    return LS.Tiny.M.GlobalID + "-" + crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
                },

                Style(url, callback) {
                    return new Promise((resolve, reject) => {
                        const linkElement = N("link", {
                            rel: "stylesheet",
                            href: url,
                            onload() {
                                if (callback) callback(null);
                                resolve();
                            },
                            onerror(error) {
                                const errorMsg = error.toString();
                                if (callback) callback(errorMsg);
                                reject(errorMsg);
                            }
                        });
                
                        O("head").appendChild(linkElement);
                    });
                },

                Script(url, callback) {
                    return new Promise((resolve, reject) => {
                        const scriptElement = N("script", {
                            src: url,
                            onload() {
                                if (callback) callback(null);
                                resolve();
                            },
                            onerror(error) {
                                const errorMsg = error.toString();
                                if (callback) callback(errorMsg);
                                reject(errorMsg);
                            }
                        });
                
                        O("head").appendChild(scriptElement);
                    });
                },

                async Document(url, callback) {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                        const text = await response.text();
                        const data = N("div", { innerHTML: text });

                        if (callback) callback(null, data);
                        return await data;
                    } catch (error) {
                        const errorMsg = error.toString();
                        if (callback) callback(errorMsg);
                        throw errorMsg;
                    }
                }
            },

            _prototyped: false
        },


        /**
         * @description TinyFactory (utilities for HTML elements)
         */
        TinyFactory: {
            isElement: true,

            attr(get = false, set = false) {
                if (set) {
                    this.setAttribute(get, set);
                    return this;
                }
            
                if (get) {
                    return this.getAttribute(get);
                }
            
                const attributes = {};
                for (const { name, value } of this.attributes) {
                    attributes[name] = value;
                }
            
                return attributes;
            },

            attrAssign(attributes){
                if (typeof attributes === "string") {
                    attributes = { Array: [attributes] };
                } else if (Array.isArray(attributes)) {
                    attributes = { Array: attributes };
                }
            
                for (const [key, value] of Object.entries(attributes)) {
                    if (key === "Array") {
                        for (const attr of value) {
                            if (typeof attr === "object") {
                                this.attrAssign(attr);
                            } else if (attr) {
                                this.setAttribute(attr, "");
                            }
                        }
                    } else if (key) {
                        this.setAttribute(key, value || "");
                    }
                }
            
                return this;
            },

            delAttr(...attributes){
                attributes = attributes.flat(2);
                attributes.forEach(attribute => this.removeAttribute(attribute))

                return this
            },

            class(names, action = 1){
                if(typeof names == "undefined") return this;

                action = (action == "add" || (!!action && action !== "remove"))? (action == 2 || action == "toggle")? "toggle": "add": "remove";

                for(let className of typeof names === "string"? names.split(" "): names){
                    if(typeof className !== "string" || className.length < 1) continue;
                    this.classList[action](className)
                }

                return this
            },

            hasClass(...names){
                if(names.length === 0) return false;
                if(names.length === 1) return this.classList.contains(names[0]);

                let has = true;

                names = names.flatMap(className => {
                    if(!this.classList.contains(className)) has = false
                })

                return has
            },

            get(selector = '*'){
                return LS.Tiny.O(this, selector)
            },

            getAll(selector = '*'){
                return LS.Tiny.Q(this, selector)
            },

            add(...elements){
                this.append(...LS.Util.resolveElements(...elements));
                return this
            },

            addBefore(target){
                LS.Util.resolveElements(target).forEach(element => this.parentNode.insertBefore(element, this))
                return this
            },

            addAfter(target){
                LS.Util.resolveElements(target).forEach(element => this.parentNode.insertBefore(element, this.nextSibling))
                return this
            },

            addTo(element){
                LS.Tiny.O(element).add(this)
                return this
            },

            wrapIn(element){
                this.addAfter(LS.Tiny.O(element));
                element.appendChild(this);
                return this
            },

            isInView(){
                var rect = this.getBoundingClientRect();
                return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.left < (window.innerWidth || document.documentElement.clientWidth) && rect.bottom > 0 && rect.right > 0
            },

            isEntirelyInView(){
                var rect = this.getBoundingClientRect();

                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            },

            on(...events){
                let func = events.find(e => typeof e == "function");
                for (const evt of events) {
                    if (typeof evt != "string") continue;
                    this.addEventListener(evt, func);
                }

                return this
            },

            off(...events){
                let func = events.find(e => typeof e == "function");
                for (const evt of events) {
                    if (typeof evt != "string") continue;
                    this.removeEventListener(evt, func);
                }

                return this
            },

            hide(){
                let current = getComputedStyle(this).display;
                this._display = current;

                this.style.display = "none";
                return this
            },

            show(displayOverride){
                this.style.display = displayOverride || this._display || "inherit";
                return this
            },

            applyStyle(rules){
                if(typeof rules !== "object") throw new Error("First attribute of \"applyStyle\" must be an object");

                for(let rule in rules){
                    if(!rules.hasOwnProperty(rule)) continue;

                    let value = rules[rule];

                    if(!rule.startsWith("--")) rule = rule.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

                    this.style.setProperty(rule, value)
                }
            },

            set(...elements){
                this.innerHTML = '';
                return this.add(...elements)
            },

            clear(){
                this.innerHTML = '';
                return this
            },

            has(...elements){
                return !!elements.find(element => this.get(element))
            }
        },

        prototypeTiny(){
            if(LS.Tiny._prototyped) return;
            LS.Tiny._prototyped = true;

            console.debug("Warning: TinyFactory has been prototyped globally to all HTML elements. You can now use all its featuers seamlessly. Beware that this may conflict with other libraries or future changes or cause confusion, please use with caution!");
            Object.assign(HTMLElement.prototype, LS.TinyFactory);
        },

        Util: {
            resolveElements(...array){
                return array.flat(Infinity).map(element => {
                    if(element && element.tagName) return element;

                    return [...N("div", element).childNodes];
                }).flat();
            },

            params(get = null){
                let url = location.href;

                if(!url.includes('?')){
                    return get? null : {}
                }

                let result = {},
                    params = url.replaceAll(/(.*?)\?/gi, '').split('&')
                ;
                
                for(let param of params){
                    param = param.split("=");
                    result[param[0]] = decodeURIComponent(param[1] || "").replace(/#(.*)/g,"")
                }

                return get? result[get] : result
            },

            touchHandle(element, options = {}){
                element = LS.Tiny.O(element);

                if(!element) throw "Invalid handle!";

                let events = new LS.EventHandler, cancelled = false;

                options = {
                    buttons: [0, 1, 2],
                    ...options
                }

                if(options.cursor) events.cursor = options.cursor;
                
                events.target = element // The target will change based on the event target!

                let [pointerLockPreviousX, pointerLockPreviousY] = [0, 0];

                function move(event) {
                    if(cancelled) return;

                    let x, y, isTouchEvent = event.type == "touchmove";

                    if(!isTouchEvent) event.preventDefault()

                    if(!events.pointerLockActive) {
                        x = isTouchEvent? event.touches[0].clientX : event.clientX
                        y = isTouchEvent? event.touches[0].clientY : event.clientY
                    }

                    if(options.pointerLock){
                        // The following adds seamles fallback for pointerlock on touch devices and emulates absolute mouse position for pointerlock!
                        // This allows you to easily enable/disable pointerlock without losing any functionality or having to write custom fallbacks, on both touch and mouse devices!

                        if(events.pointerLockActive){
                            x = pointerLockPreviousX += !isNaN(event.movementX)? event.movementX: 0
                            y = pointerLockPreviousY += !isNaN(event.movementY)? event.movementY: 0
                        } else if(isTouchEvent){
                            event.movementX = Math.round(x - pointerLockPreviousX)
                            event.movementY = Math.round(y - pointerLockPreviousY)
                            pointerLockPreviousX = x
                            pointerLockPreviousY = y
                        }
                    }

                    if(options.onMove) options.onMove(x, y, event, cancel)

                    events.emit("move", [x, y, event, cancel])
                }

                function cancel() {
                    cancelled = true
                }

                function pointerLockChangeWatch(){
                    events.pointerLockActive = document.pointerLockElement === element;
                }

                document.addEventListener('pointerlockchange',  pointerLockChangeWatch);
    
                function release(evt) {
                    events.seeking = false;
                    cancelled = false;
    
                    element.class("is-dragging", 0)
                    events.target.class("ls-drag-target", 0)
                    document.documentElement.class("ls-dragging",0)
                    document.removeEventListener("mousemove", move);
                    document.removeEventListener("mouseup", release);
                    document.removeEventListener("touchmove", move);
                    document.removeEventListener("touchend", release);
                    document.documentElement.style.cursor = "";
    
                    events.emit(evt.type == "destroy"? "destroy" : "end", [evt])

                    if(events.pointerLockActive){
                        document.exitPointerLock();
                    }

                    if(evt.type == "destroy")
                        if(options.onDestroy) options.onDestroy(evt);
                    else 
                        if(options.onEnd) options.onEnd(evt);
                }

                function start(event){
                    if(typeof options.exclude == "string" && event.target.matches(options.exclude)) return;
                    if(!options.exclude && event.target !== element) return;

                    event.preventDefault()

                    if(event.type == "mousedown" && !options.buttons.includes(event.button)) return;
                    
                    events.seeking = true;

                    let x = event.type == "touchstart"? event.touches[0].clientX : event.clientX, y = event.type == "touchstart"? event.touches[0].clientY : event.clientY;

                    events.emit("start", [event, cancel, x, y])
                    if(options.onStart) options.onStart(event, cancel, x, y)

                    if(cancelled) return events.seeking = false;

                    if(options.pointerLock && event.type !== "touchstart") {

                        pointerLockPreviousX = event.clientX
                        pointerLockPreviousY = event.clientY

                        if (event.type !== "touchstart") element.requestPointerLock();
                    }

                    events.target = LS.Tiny.O(event.target);
                    events.target.class("ls-drag-target")

                    element.class("is-dragging")
                    document.documentElement.class("ls-dragging")
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", release);
                    document.addEventListener("touchmove", move);
                    document.addEventListener("touchend", release);
                    document.documentElement.style.cursor = events.cursor || "grab";
                }

                element.on("mousedown", "touchstart", ...(options.startEvents || []), start)

                events.destroy = function (){
                    release({type: "destroy"})
                    element.off("mousedown", "touchstart", start)
                    document.removeEventListener('pointerlockchange',  pointerLockChangeWatch);
                    cancelled = true;
                    events.destroy = () => false;
                    events.destroyed = true
                    return true
                }

                return events
            },

            defaults(defaults, target = {}) {
                if(typeof target !== "object") throw "The target must be an object";

                for (const [key, value] of Object.entries(defaults)) {
                    if (!(key in target)) {
                        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(defaults, key));
                    }
                }
                return target
            },

            copy(text) {
                return new Promise(resolve => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text)
                            .then(() => {
                                resolve()
                            })
                            .catch(error => {
                                resolve(error)
                            })
                    } else {
                        let temp = LS.Tiny.N('textarea', {value: text})

                        document.body.appendChild(temp)
                        temp.select()
                        document.execCommand('copy')
                        
                        document.body.removeChild(temp)
                        resolve()
                    }
                })
            },
        },

        Component: class {
            constructor(){
                if(!this._component || !LS.components.has(this._component.name)){
                    throw new Error("This class has to be extended and loaded as a component with LS.LoadComponent.");
                }

                if(this.init) {
                    LS.once("init", () => this.init())
                }

                this._events = new LS.EventHandler(this);
            }
        },

        LoadComponent(componentClass, options = {}){
            const name = options.name || componentClass.name;

            if(LS.components.has(name)) {
                console.warn(`[LS] Duplicate component name ${name}, ignored!`);
                return
            }

            const component = {
                class: componentClass,
                metadata: options.metadata,
                global: !!options.global,
                name
            }

            LS.components.set(name, component)
            componentClass.prototype._component = component;
            
            if(component.global){
                LS[name] = options.singular? new componentClass: componentClass;
            }

            return component
        },

        GetComponent(name){
            return LS.components.get(name)
        },
    }

    new LS.EventHandler(LS);
    LS.SelectAll = LS.Tiny.Q;
    LS.Select = LS.Tiny.O;
    LS.Create = LS.Tiny.N;

    /**
     * @description Color and theme utilities
     */
    LS.Color = class {
        constructor(r, g, b, a) {
            if (typeof r === "string") {

                // Hex
                if(r.charCodeAt(0) === 35) {
                    [r, g, b] = LS.Color.parseHex(r);
                }

                // RGB
                else if(r.startsWith("rgb(") || r.startsWith("rgba(")) {
                    let match = r.match(/rgba?\((\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)(?:\s*,?\s*([0-9.]+))?\)/);

                    if(match) {
                        [r, g, b, a] = match.slice(1).map(Number);
                    } else {
                        throw new Error("Colour " + r + " could not be parsed.");
                    }
                }

                else {
                    if(!LS.Color.context) {
                        LS.Color._createProcessingCanvas();
                    }
                    
                    // canvas.width = canvas.height = 1;
                    LS.Color.context.fillStyle = r;

                    [r, g, b] = LS.Color.parseHex(LS.Color.context.fillStyle);
                }
            } else if (r instanceof LS.Color) {
                [r, g, b, a] = r.color;
            } else if (Array.isArray(r)) {
                [r, g, b, a] = r;
            }

            if (r === null || typeof r === "undefined" || isNaN(r)) r = 255;
            if (g === null || typeof g === "undefined" || isNaN(g)) g = 255;
            if (b === null || typeof b === "undefined" || isNaN(b)) b = 255;
            if (a === null || typeof a === "undefined" || isNaN(a)) a = 1;
    
            this.r = Math.round(Math.min(255, Math.max(0, r)));
            this.g = Math.round(Math.min(255, Math.max(0, g)));
            this.b = Math.round(Math.min(255, Math.max(0, b)));
            this.a = Math.min(1, Math.max(0, a));
        }

        static {
            this._events = new LS.EventHandler(this);

            this.colors = new Map;
            this.themes = new Set(["light", "dark", "amoled"]);

            // Style tag to manage
            this.style = LS.Tiny.N("style", {id: "ls-colors"});

            LS.once("body-available", ()=>{
                document.head.appendChild(this.style)
            })

            Object.defineProperties(this, {
                lightModePreffered: {
                    get(){
                        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
                    }
                }
            })

            if(window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', thing => {
                    this.emit("scheme-changed", [thing.matches])
                })
            }
        }
    
        get hex() {
            return "#" + (1 << 24 | this.r << 16 | this.g << 8 | this.b).toString(16).slice(1);
        }
    
        get rgb() {
            return `rgb(${this.r}, ${this.g}, ${this.b})`;
        }
    
        get rgba() {
            return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
        }
    
        get hsl() {
            let r = this.r / 255;
            let g = this.g / 255;
            let b = this.b / 255;
    
            let max = Math.max(r, g, b);
            let min = Math.min(r, g, b);
    
            let l = (max + min) / 2;
            let h, s;
    
            if (max === min) {
                h = s = 0;
            } else {
                let delta = max - min;
                s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
                switch (max) {
                    case r:
                        h = (g - b) / delta + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / delta + 2;
                        break;
                    case b:
                        h = (r - g) / delta + 4;
                        break;
                }
                h /= 6;
            }
    
            h = Math.round(h * 360);
            s = Math.round(s * 100);
            l = Math.round(l * 100);
    
            return [h, s, l];
        }
    
        get color() {
            return [this.r, this.g, this.b, this.a];
        }
    
        get pixel() {
            return [this.r, this.g, this.b, this.a * 255];
        }
    
        get brightness() {
            return Math.sqrt(
                0.299 * (this.r * this.r) +
                0.587 * (this.g * this.g) +
                0.114 * (this.b * this.b)
            );
        }
    
        get isDark() {
            return this.brightness < 127.5;
        }
    
        hue(hue) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(hue, 360), 0);
            return LS.Color.fromHSL(h, s, l);
        }
    
        saturation(percent) {
            let [h, s, l] = this.hsl;
            s = Math.max(Math.min(percent, 100), 0);
            return LS.Color.fromHSL(h, s, l);
        }

        lightness(percent) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(percent, 100), 0);
            return LS.Color.fromHSL(h, s, l);
        }

        tone(hue, saturation, lightness) {
            let [h, s, l] = this.hsl;
            return LS.Color.fromHSL(hue || h, (s / 100) * saturation, lightness);
        }

        lighten(percent) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(l + percent, 100), 0);
            return LS.Color.fromHSL(h, s, l);
        }
    
        darken(percent) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(l - percent, 100), 0);
            return LS.Color.fromHSL(h, s, l);
        }
    
        hueShift(deg) {
            let [h, s, l] = this.hsl;
            h = (h + deg) % 360;
            return LS.Color.fromHSL(h, s, l);
        }
    
        multiply(r2, g2, b2, a2) {
            let color = new LS.Color(r2, g2, b2, a2).color;
            return new LS.Color(this.r * color[0], this.g * color[1], this.b * color[2], this.a * color[3]);
        }
    
        divide(r2, g2, b2, a2) {
            let color = new LS.Color(r2, g2, b2, a2).color;
            return new LS.Color(this.r / color[0], this.g / color[1], this.b / color[2], this.a / color[3]);
        }
    
        add(r2, g2, b2, a2) {
            let color = new LS.Color(r2, g2, b2, a2).color;
            return new LS.Color(this.r + color[0], this.g + color[1], this.b + color[2], this.a + color[3]);
        }
    
        subtract(r2, g2, b2, a2) {
            let color = new LS.Color(r2, g2, b2, a2).color;
            return new LS.Color(this.r - color[0], this.g - color[1], this.b - color[2], this.a - color[3]);
        }
    
        alpha(v) {
            return new LS.Color(this.r, this.g, this.b, v);
        }

        static parseHex(hex) {
            if(hex.length < 4 || hex.length > 9) {
                throw new Error("Invalid hex string");
            }

            if (hex.length <= 5) {
                return [ parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16), parseInt(hex[3] + hex[3], 16), hex.length === 5? parseInt(hex[4] + hex[4], 16) / 255: 1 ];
            } else {
                return [ parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), hex.length === 9? parseInt(hex.slice(7, 9), 16) / 255: 1 ];
            }
        }
    
        static fromHSL(h, s, l) {
            s /= 100;
            l /= 100;
    
            let k = n => (n + h / 30) % 12,
                a = s * Math.min(l, 1 - l),
                f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    
            return new LS.Color(255 * f(0), 255 * f(8), 255 * f(4));
        }
    
        static random() {
            return new LS.Color(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
        }

        static trueRandom() {
            return new LS.Color([...crypto.getRandomValues(new Uint8Array(3))]);
        }

        static get theme(){
            return document.body.getAttribute("ls-theme")
        }

        static set theme(theme){
            this.setTheme(theme)
        }
        
        static get accent(){
            return document.body.getAttribute("ls-accent")
        }

        static set accent(color){
            this.setAccent(color)
        }

        static generate(r, g, b) {
            let color = (r instanceof LS.Color)? r: new LS.Color(r, g, b), style = "";

            for(let i of [10, 20, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 95]){
                style += `--accent-${i}:${color.lightness(i).hex};`; 
            }

            for(let i of [5, 6, 8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]){
                style += `--surface-${i}:${color.tone(null, 12, i).hex};`; 
            }

            return style
        }

        static add(name, r, g, b){
            if(this.colors.has(name)) return false;
            return this.update(name, r, g, b);
        }

        static update(name, r, g, b){
            let accent = this.colors.get(name);
            const color = (r instanceof LS.Color)? r: new LS.Color(r, g, b);

            if(!accent) {
                accent = {}
                this.colors.set(name, accent);
            }

            let style = `[ls-accent="${name}"]{${this.generate(color)}}`;

            accent.color = color;

            if(!accent.style){
                accent.style = document.createTextNode(style);
                this.style.appendChild(accent.style);
            } else {
                accent.style.textContent = style;
            }

            return accent
        }

        static apply(element, r, g, b){
            let color = (r instanceof LS.Color)? r: new LS.Color(r, g, b);
            element.style = (element.style? element.style: "")+ this.generate(color);
        }

        static remove(name){
            let color = this.colors.get(name);

            if(!color) return false;

            this.style.removeChild(color.style);
            this.colors.delete(name);
        }

        static setAccent(accent){
            document.body.setAttribute("ls-accent", accent)
            return this
        }

        static setTheme(theme){
            document.body.setAttribute("ls-theme", theme)
            this.emit("theme-changed", [theme])
            return this
        }

        static setAdaptiveTheme(amoled){
            LS.Color.setTheme(this.lightModePreffered? "light": amoled? "amoled" : "dark")
            return this
        }

        static autoScheme(amoled){
            LS.once("body-available", () => {
                this.setAdaptiveTheme(amoled);
                this.on("scheme-changed", () => this.setAdaptiveTheme())
            })
            return this
        }

        static all(){
            return this.colors.keys()
        }

        static random(){
            return new LS.Color(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
        }

        static andomAccent(){
            let colors = this.all();
            return colors[Math.floor(Math.random() * colors.length)];
        }

        static fromImage(image, sampleGap = 16, maxResolution = 200){
            if(!(image instanceof HTMLImageElement)) {
                throw new TypeError("The first argument must be an image element");
            }

            sampleGap += sampleGap % 4;

            let pixelIndex = -4,
                sum = [0, 0, 0],
                sampleCount = 0
            ;

            if(!LS.Color.canvas) {
                LS.Color._createProcessingCanvas();
            }

            if (!LS.Color.context) return new LS.Color(0, 0, 0);

            const scale = Math.min(1, maxResolution / Math.max(image.naturalWidth, image.naturalHeight));

            LS.Color.canvas.width = Math.ceil(image.naturalWidth * scale);
            LS.Color.canvas.height = Math.ceil(image.naturalHeight * scale);

            LS.Color.context.drawImage(image, 0, 0, LS.Color.canvas.width, LS.Color.canvas.height);

            let imageData;
            try {
                imageData = LS.Color.context.getImageData(0, 0, LS.Color.canvas.width, LS.Color.canvas.height);
            } catch (error) {
                console.error(error);
                return new LS.Color(0, 0, 0);
            }

            for (let i = imageData.data.length; (pixelIndex += sampleGap) < i; ) {
                ++sampleCount
                sum[0] += imageData.data[pixelIndex]
                sum[1] += imageData.data[pixelIndex + 1]
                sum[2] += imageData.data[pixelIndex + 2]
            }
        
            return new LS.Color((sum[0] = ~~(sum[0] / sampleCount)), (sum[1] = ~~(sum[1] / sampleCount)), (sum[2] = ~~(sum[2] / sampleCount)));
        }

        static _createProcessingCanvas() {
            if(!LS.Color.canvas) {
                const canvas = document.createElement('canvas');
                LS.Color.canvas = canvas;
                LS.Color.context = canvas.getContext('2d');
            }
        }
    }

    // LS.Color.add("navy", 40,28,108);
    // LS.Color.add("blue", 0,133,255);
    // LS.Color.add("pastel_indigo", 70,118,181);
    // LS.Color.add("lapis", 34,114,154);
    // LS.Color.add("teal", 0,128,128);
    // LS.Color.add("pastel_teal", 69,195,205);
    // LS.Color.add("aquamarine", 58,160,125);
    // LS.Color.add("mint", 106,238,189);
    // LS.Color.add("green", 25,135,84);
    // LS.Color.add("lime", 133,210,50);
    // LS.Color.add("neon", 173,255,110);
    // LS.Color.add("yellow", 255,236,32);
    // LS.Color.add("lstv_red", 237,108,48);
    // LS.Color.add("lstv_yellow", 252,194,27);
    // LS.Color.add("lstv_blue", 64,192,231);
    // LS.Color.add("orange", 255,140,32);
    // LS.Color.add("deep_orange", 255,112,52);
    // LS.Color.add("red", 245,47,47);
    // LS.Color.add("rusty_red", 220,53,69);
    // LS.Color.add("pink", 230,52,164);
    // LS.Color.add("hotpink", 245,100,169);
    // LS.Color.add("purple", 155,77,175);
    // LS.Color.add("soap", 210,190,235);
    // LS.Color.add("burple", 81,101,246);
    // LS.Color.add("gray", 73,73,73);
    // LS.Color.add("gray_light", 107,107,107);
    // LS.Color.add("white", 225,225,225);
    // LS.Color.add("black", 16,16,16);

    if(LS.isWeb){
        LS.Tiny.M.on("keydown", event => {
            M.lastKey = event.key;
            if(event.key == "Shift") LS.Tiny.M.ShiftDown = true;
            if(event.key == "Control") LS.Tiny.M.ControlDown = true;
        })

        LS.Tiny.M.on("keyup", event => {
            LS.Tiny.M.lastKey = event.key;
            if(event.key == "Shift") LS.Tiny.M.ShiftDown = false;
            if(event.key == "Control") LS.Tiny.M.ControlDown = false;
        })

        LS.Tiny.M.on("mousedown", () => LS.Tiny.M.mouseDown = true)
        LS.Tiny.M.on("mouseup", () => LS.Tiny.M.mouseDown = false)
    }

    return LS

});
LS.LoadComponent(class Toast extends LS.Component {
    constructor(){
        super()

        let container = this.container = N({
            class: "ls-toast-layer"
        });

        LS.once("body-available", () => {
            LS._topLayer.add(container);
        })
    }

    closeAll(){
        this.emit("close-all")
    }

    show(content, options = {}){
        let toast = N({
            class: "ls-toast level-0",
            accent: options.accent || null,

            inner: [
                options.icon? N("i", {class: options.icon}) : null,

                N({inner: content, class: "ls-toast-content"}),

                !options.uncancellable? N("button", {
                    class: "elevated circle ls-toast-close",
                    inner: "&times;",

                    onclick(){
                        methods.close()
                    }
                }): null
            ]
        })

        let methods = {
            element: toast,

            update(content){
                toast.get(".ls-toast-content").set(content)
            },

            close(){
                toast.class("open", 0);
                setTimeout(()=>{
                    if(!options.keep) toast.remove()
                }, 150)
            }
        }

        this.once("close-all", methods.close)

        this.container.add(toast);

        if(options.timeout) setTimeout(()=>{
            methods.close()
        }, options.timeout)
        
        setTimeout(()=>{
            toast.class("open")
        }, 1)

        return methods
    }
}, { global: true, singular: true, name: "Toast" });
LS.LoadComponent(class Tabs extends LS.Component {
    constructor(element, options = {}) {
        super();

        this.order = [];
        this.tabs = new Map;
        this.activeTab = null;
        this.element = O(element);
        this.container = O(element);

        options = LS.Util.defaults({
            unstyled: false,
            list: true,
            selector: "ls-tab, .ls-tab",
        }, options);
        
        if(!options.unstyled) {
            this.container.class("ls-tabs-styled");
        }

        if(options.selector) {
            this.container.getAll(options.selector).forEach((tab, i) => {
                this.add(tab.getAttribute("id") || "tab-" + i, tab);
            });
        }

        this.options = options;

        if(options.list) {
            this.element.class("ls-tabs-has-list");

            this.list = N({
                class: "ls-tabs-list",
            });

            this.container = N({
                class: "ls-tabs-content",
                inner: [...this.element.children]
            });

            this.element.add(this.list, this.container);

            this.renderList();
        } else {
            this.element.class("ls-tabs-content")
        }
    }

    get index() {
        return this.order.indexOf(this.activeTab);
    }

    add(id, content, options = {}) {
        if(this.tabs.has(id)) {
            return this;
        }

        const tab = { id, element: content, title: options.title || content.getAttribute("tab-title") || content.getAttribute("title") };

        this.tabs.set(id, tab);
        this.order.push(id);
        this.container.add(content);
        return this;
    }

    remove(id) {
        const tab = this.tabs.get(id);

        if(!tab) {
            return false;
        }

        const index = this.order.indexOf(id);

        tab.element.remove();
        if(tab.handle) tab.handle.remove();

        this.tabs.delete(id);
        this.order.splice(index, 1);

        this.emit("removed", [id]);
        return true;
    }

    setClosestNextTo(id) {
        const index = this.order.indexOf(id);
        if(index === -1) {
            return false;
        }

        if (index === this.order.length - 1) {
            this.set(this.order[index - 1]);
        } else {
            this.set(this.order[index + 1]);
        }
    }

    set(id) {
        if(typeof id === "number") {
            id = this.order[id];
        }

        const tab = this.tabs.get(id);
        const currentTab = this.tabs.get(this.activeTab)

        if(!tab) {
            return false;
        }

        const index = this.order.indexOf(id);

        if(this.activeTab === id) {
            return true;
        }

        if(currentTab) {
            currentTab.element.class("tab-active", false);

            if(currentTab.handle) {
                currentTab.handle.class("active", false);
            }
        }
        
        tab.element.class("tab-active");
        this.emit("changed", [id]);

        if(tab.handle) {
            tab.handle.class("active");
        }

        this.activeTab = id;

        // if(this.options.list) {
        //     for(const tab in this.tabs) {
        //         const _element = O(this.tabs[tab].element);
        //         if(!_element || tab === id) {
        //             continue;
        //         }

        //         _element.class("tab-active", 0);
        //         if(this.options.hide && this.options.mode !== "presentation") {
        //             _element.hide();
        //         }
        //     }
        // }
    }

    first() {
        this.set(this.order[0]);
    }

    last() {
        this.set(this.order[this.order.length - 1]);
    }

    next(loop = false) {
        const index = this.index;

        if(index === -1) {
            return false;
        }

        if(index !== this.order.length - 1) {
            return this.set(this.order[index + 1]);
        }
        
        if(loop) {
            return this.set(this.order[0]);
        }

        return false;
    }

    previous(loop = false) {
        const index = this.index;

        if(index === -1) {
            return false;
        }

        if(index !== 0) {
            return this.set(this.order[index - 1]);
        }

        if(loop) {
            return this.set(this.order[this.order.length - 1]);
        }

        return false;
    }

    renderList(){
        for(this.list.children.length; this.list.children.length > 0; this.list.children[0].remove());

        this.order.forEach((id) => {
            const tab = this.tabs.get(id);
            if(!tab) return;

            if(!tab.handle) {
                tab.handle = N({
                    class: "ls-tab-handle",
                    inner: tab.title || id,

                    onclick: () => {
                        this.set(id);
                    }
                })

                if(this.options.closeable){
                    tab.handle.add(N("button", {
                        class: "clear circle ls-tab-close",
                        inner: "&times;",

                        onclick: () => {
                            const canceled = this.emit("close", [id], { results: true })[0] === false;

                            if(canceled) return;

                            if(this.activeTab === id) {
                                this.setClosestNextTo(id);
                            }

                            this.remove(id);
                            this.renderList();
                        }
                    }))
                }
            }

            this.list.add(tab.handle);
        });
    }
}, { name: 'Tabs', global: true });
LS.LoadComponent(class Tooltips extends LS.Component {
    constructor(){
        super()

        this.container = N({ class: "ls-tootlip-layer" });
        this.contentElement = N({ class:"ls-tooltip-content" });

        this.container.add(this.contentElement);

        this.attributes = ['ls-tooltip', 'ls-hint'];

        // Observe attribute changes
        this.observer = new MutationObserver(this.addElements);

        LS.once("body-available", () => {
            LS._topLayer.add(this.container)

            this.rescan()

            this.observer.observe(document.documentElement, {
                attributes: true,
                // childList: true,
                subtree: true,
                attributeFilter: this.attributes
            })
        })
    }

    position(x, y){
        let box;

        if(x instanceof Element) {
            box = x.getBoundingClientRect()
        } else if(typeof x == "number") box = {x}

        let cbox = this.contentElement.getBoundingClientRect(),
            pos_top = box.top - cbox.height,
            pos_bottom = box.top + box.height
        ;

        this.contentElement.applyStyle({
            left:(
                box.width ? Math.min(Math.max(box.left+(box.width/2)-(cbox.width/2),4),innerWidth-(cbox.width)) : box.x
            ) + "px",

            maxWidth:(innerWidth - 8)+"px",

            top: typeof y === "number"? y + "px": `calc(${pos_top < 20? pos_bottom : pos_top}px ${pos_top < 0? "+" : "-"} var(--ui-tooltip-rise, 5px))`
        })
    }

    set(text){
        this.contentElement.set(text);
    }

    show(){
        this.container.class("shown");
    }

    hide(){
        this.container.class("shown", false);
    }

    addElements(mutations){
        if(!Array.isArray(mutations)) mutations = [mutations];

        for(let mutation of mutations.reverse()) {
            if(typeof mutation !== "object" || !mutation || !mutation.target) continue;

            let e = O(mutation.target), attr = mutation.attributeName;

            e.hasTooltip = e.hasAttribute(attr);
            e.tooltip_value = e.attr(attr);
            e.tooltip_hint = e.hasAttribute("ls-hint");

            if(!e._hasTooltip)! this.setup(e);
        }
    }

    rescan(){
        this.addElements(Q(this.attributes.map(a=>`[${a}]`).join(",")).map(e=>{
            return {
                target: e,
                attributeName: Object.keys(e.attr()).find(a=>this.attributes.includes(a))
            }
        }))
    }

    setup(element){
        element._hasTooltip = true;
     
        element.on("mouseenter", ()=>{
            if(!element.hasTooltip) return;
            this.invoke("set", element.tooltip_value);

            if(element.tooltip_hint) return;

            this.set(element.tooltip_value)
            this.show()

            this.position(element)
        })

        element.on("mousemove", () => this.position(element))

        element.on("mouseleave", () => {
            if(!element.hasTooltip) return;
            this.invoke("leave", element.tooltip_value);
            this.hide()
        })
    }
}, { global: true, singular: true, name: "Tooltips" });