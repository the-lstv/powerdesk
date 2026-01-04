/*
    Author: Lukas (thelstv)
    Copyright: (c) https://lstv.space

    Last modified: 2025
    License: GPL-3.0
    Version: 5.1.1
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

        function bodyAvailable(){
            document.body.append(LS._topLayer)
            LS._events.completed("body-available")
        }

        if(document.body) bodyAvailable(); else window.addEventListener("load", bodyAvailable);
    }

    return instance

})(() => {

    class EventHandler {
        constructor(target){
            LS.EventHandler.prepareHandler(this);

            if(target){
                target._events = this;

                ["emit", "on", "once", "off", "invoke"].forEach(method => {
                    if (!target.hasOwnProperty(method)) target[method] = this[method].bind(this);
                });

                this.target = target;
            }
        }

        static prepareHandler(target){
            target.events = new Map;
        }

        prepareEvent(name, options){
            if(!this.events.has(name)){
                this.events.set(name, { listeners: [], empty: [], ...options, _isEvent: true })
            } else if(options){
                Object.assign(this.events.get(name), options)
            }

            return this.events.get(name)
        }

        on(name, callback, options){
            const event = (name._isEvent? name: this.events.get(name)) || this.prepareEvent(name);
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

        /**
         * Emit an event with the given name and data.
         * @param {string|object} name Name of the event or an event object.
         * @param {Array} data Data to pass to the event listeners.
         * @param {object} options Options for the event emission.
         * @returns {Array|null} Returns an array of results or null.
         */

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

        quickEmit(event, data){
            if(!event._isEvent) throw new Error("Event must be a valid event object when using quickEmit");

            for(let i = 0, len = event.listeners.length; i < len; i++){
                const listener = event.listeners[i];
                if(!listener || typeof listener.callback !== "function") continue;

                if(listener.once) {
                    event.empty.push(listener.index);
                    event.listeners[listener.index] = null;
                }

                listener.callback(...data);
            }
        }

        flush() {
            this.events.clear();
        }

        alias(name, alias){
            this.events.set(alias, this.prepareEvent(name))
        }

        completed(name){
            this.emit(name)

            this.prepareEvent(name, {
                completed: true
            })
        }
    }

    const LS = {
        isWeb: typeof window !== 'undefined',
        version: "5.1.1",
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

        EventHandler,

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
             * Element selector utility
             */
            Q(selector, subSelector, one = false) {
                if(!selector) return LS.TinyWrap(one? null: []);

                const isElement = selector instanceof Element;
                const target = (isElement? selector : document);

                if(isElement && !subSelector) return LS.TinyWrap(one? selector: [selector]);

                const actualSelector = isElement? subSelector || "*" : selector || '*';

                let elements = one? target.querySelector(actualSelector): target.querySelectorAll(actualSelector);

                return LS.Tiny._prototyped? elements: LS.TinyWrap(one? elements: [...elements]);
            },

            /**
             * Single element selector
             */
            O(selector, subSelector){
                if(!selector) selector = document.body;
                return LS.Tiny.Q(selector, subSelector, true)
            },

            /**
             * Element builder utility
             */
            N(tagName = "div", content){
                if(typeof tagName !== "string"){
                    content = tagName;
                    tagName = "div";
                }

                if(!content) return document.createElement(tagName);

                content =
                    typeof content === "string"
                        ? { innerHTML: content }
                        : Array.isArray(content)
                            ? { inner: content }
                            : content || {};

                if(tagName === "svg" && !content.hasOwnProperty("ns")) {
                    content.ns = "http://www.w3.org/2000/svg";
                }

                const { class: className, tooltip, ns, accent, style, inner, content: innerContent, reactive, ...rest } = content;


                const element = Object.assign(
                    ns ? document.createElementNS(ns, tagName) : document.createElement(tagName),
                    rest
                );

                // Handle attributes
                if (accent) LS.TinyFactory.attrAssign.call(element, { "ls-accent": accent });
                if (content.attr || content.attributes) LS.TinyFactory.attrAssign.call(element, content.attr || content.attributes);

                // Handle tooltips
                if (tooltip) {
                    if (!LS.Tooltips) {
                        element.setAttribute("title", tooltip);
                    } else {
                        element.setAttribute("ls-tooltip", tooltip);
                        LS.Tooltips.addElements([{ target: element, attributeName: "ls-tooltip" }]);
                    }
                }

                // Handle reactive bindings
                if (reactive) {
                    if (!LS.Reactive) {
                        console.warn("Reactive bindings are not available, please include the Reactive module to use this feature.");
                    }

                    LS.Reactive.bindElement(element, reactive);
                }

                if (className) LS.TinyFactory.class.call(element, className);
                if (typeof style === "object") LS.TinyFactory.applyStyle.call(element, style);

                // Append children or content
                const contentToAdd = inner || innerContent;
                if (contentToAdd) LS.TinyFactory.add.call(element, contentToAdd);

                return element;
            },

            /**
             * Color utilities
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

                LoadStyle(href, callback) {
                    return new Promise((resolve, reject) => {
                        const linkElement = N("link", {
                            rel: "stylesheet",
                            href,

                            onload() {
                                if (typeof callback === "function") callback(null);
                                resolve();
                            },

                            onerror(error) {
                                const errorMsg = error.toString();
                                if (typeof callback === "function") callback(errorMsg);
                                reject(errorMsg);
                            }
                        });
                
                        document.head.appendChild(linkElement);
                    });
                },

                LoadScript(src, callback) {
                    return new Promise((resolve, reject) => {
                        const scriptElement = N("script", {
                            src,

                            onload() {
                                if (typeof callback === "function") callback(null);
                                resolve();
                            },

                            onerror(error) {
                                const errorMsg = error.toString();
                                if (typeof callback === "function") callback(errorMsg);
                                reject(errorMsg);
                            }
                        });
                
                        document.head.appendChild(scriptElement);
                    });
                },

                async LoadDocument(url, callback, targetElement = null) {
                    let data;

                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                        const text = await response.text();

                        if (targetElement instanceof Element) {
                            targetElement.innerHTML = text;
                            data = targetElement;
                        } else if (typeof targetElement === "string") {
                            data = LS.Tiny.N(targetElement, { innerHTML: text });
                        } else {
                            const template = document.createElement("template");
                            template.innerHTML = text;
                            data = template.content.childNodes;
                        }

                        if (typeof callback === "function") callback(null, data);
                        return data;
                    } catch (error) {
                        if (typeof callback === "function") callback(error.toString());
                        throw error;
                    }
                }
            },

            _prototyped: false
        },


        /**
         * TinyFactory (utilities for HTML elements)
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

        Component: class Component extends EventHandler {
            constructor(){
                super();

                if(!this._component || !LS.components.has(this._component.name)){
                    throw new Error("This class has to be extended and loaded as a component with LS.LoadComponent.");
                }

                if(this.init) {
                    LS.once("init", () => this.init())
                }

                // if(this._component.hasEvents) {
                //     this._events = new LS.EventHandler(this);
                // }
            }
        },

        LoadComponent(componentClass, options = {}){
            const name = options.name || componentClass.name;

            if(LS.components.has(name)) {
                console.warn(`[LS] Duplicate component name ${name}, ignored!`);
                return
            }

            const component = {
                isConstructor: typeof componentClass === "function",
                class: componentClass,
                metadata: options.metadata,
                global: !!options.global,
                hasEvents: options.events !== false,
                name
            }

            if (!component.isConstructor) {
                Object.setPrototypeOf(componentClass, LS.Component.prototype);
                componentClass._component = component;

                if(component.hasEvents) {
                    LS.EventHandler.prepareHandler(componentClass);
                }
            } else {
                componentClass.prototype._component = component;
            }

            LS.components.set(name, component);

            if(component.global){
                LS[name] = options.singular && component.isConstructor? new componentClass: componentClass;
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
    LS.Misc = LS.Tiny.M;

    /**
     * Color and theme utilities
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

        get int(){
            return (this.r << 16) | (this.g << 8) | this.b;
        }

        get hexInt() {
            return 1 << 24 | this.r << 16 | this.g << 8 | this.b
        }

        get hex() {
            return "#" + this.hexInt.toString(16).slice(1);
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

        saturate(percent) {
            let [h, s, l] = this.hsl;
            s = Math.max(Math.min(s + percent, 100), 0);
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

            for(let i of [6, 8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 98]){
                style += `--base-${i}:${color.tone(null, 12, i).hex};`; 
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
            document.body.setAttribute("ls-accent", accent);
            return this
        }

        static setTheme(theme){
            document.body.setAttribute("ls-theme", theme);
            this.emit("theme-changed", [theme]);
            return this
        }

        static setAdaptiveTheme(amoled){
            LS.Color.setTheme(localStorage.getItem("ls-theme") || (this.lightModePreffered? "light": amoled? "amoled" : "dark"));
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

});/**
 * Animation utilities for LS
 * @version 1.0.0
 */

(() => {
    const transforms = {
        up: 'translateY(10px)',
        down: 'translateY(-10px)',
        left: 'translateX(10px)',
        right: 'translateX(-10px)'
    };

    LS.LoadComponent({
        fadeOut(element, duration = 300, direction = null) {
            duration = duration ?? 300;
        
            element.style.transition = `opacity ${duration}ms, transform ${duration}ms`;
            element.style.opacity = 0;
            element.style.pointerEvents = 'none';
            
            if (direction) {
                element.style.transform = transforms[direction] || '';
            }
        
            if (element._fadeOutTimeout) clearTimeout(element._fadeOutTimeout);
            element._fadeOutTimeout = setTimeout(() => {
                element.style.display = 'none';
            }, duration);
        },

        fadeIn(element, duration = 300, direction = null) {
            duration = duration ?? 300;

            element.style.display = '';
            
            if (direction) {
                element.style.transform = transforms[direction] || '';
            }
        
            if (element._fadeOutTimeout) clearTimeout(element._fadeOutTimeout);
            setTimeout(() => {
                element.style.transition = `opacity ${duration}ms, transform ${duration}ms`;
                element.style.opacity = 1;
                element.style.pointerEvents = 'auto';
                if (direction) element.style.transform = 'translateY(0) translateX(0)';
            }, 0);
        },

        slideInToggle(newElement, oldElement = null, duration = 300) {
            if (oldElement) {
                oldElement.classList.remove('visible');
                oldElement.classList.add('leaving');

                if (oldElement._leavingTimeout) clearTimeout(oldElement._leavingTimeout);
                oldElement._leavingTimeout = setTimeout(() => {
                    oldElement.classList.remove('leaving');
                }, duration);
            }

            if (newElement._leavingTimeout) clearTimeout(newElement._leavingTimeout);
            newElement.classList.remove('leaving');
            newElement.classList.add("visible");
        },

        transforms
    }, { name: "Animation", global: true });
})();/**
 * GL Utilities for LS
 * @version 1.0.0
 */

if(!globalThis.PIXI) {
    console.error("LS.GL requires PIXI.js to work")
} else (() => {
    class GLElement extends PIXI.Container {
        constructor(options = {}) {
            super();

            this.graphics = null;
            this.label = null;

            this.styleContext = (options.style instanceof StyleContext)? options.style: new StyleContext(options.style || {});
            this.computedStyle = this.styleContext.computedStyle;

            if(options.tooltip){
                tooltips.set(this, options.tooltip)
            }

            if(options.inner) {
                this.add(options.inner);
            }

            // if (options.onClick) {
            //     this.on("click", options.onClick);
            // }

            // if (options.onPointerDown) {
            //     this.on("pointerdown", options.onPointerDown);
            // }

            // if (options.onPointerUp) {
            //     this.on("pointerup", options.onPointerUp);
            // }

            // if (options.onPointerEnter) {
            //     this.on("pointerenter", options.onPointerEnter);
            // }

            // if (options.onPointerLeave) {
            //     this.on("pointerleave", options.onPointerLeave);
            // }

            // if (options.onPointerMove) {
            //     this.on("pointermove", options.onPointerMove);
            // }

            this.x = options.x || 0;
            this.y = options.y || 0;


            if(options.text) this.setText(options.text); else this.draw();
        }

        draw() {
            if(this.computedStyle.display === "block"){
                if(!this.graphics){
                    this.graphics = new PIXI.Graphics;
                    this.addChild(this.graphics);
                    this.graphics.zIndex = -1;
                }

                this.graphics.clear();

                const actualX = this.computedStyle.margin[3];
                const actualY = this.computedStyle.margin[0];
                const actualWidth = this.width + this.computedStyle.padding[3] + this.computedStyle.padding[1];
                const actualHeight = this.height + this.computedStyle.padding[0] + this.computedStyle.padding[2];

                const shape = this.computedStyle.borderRadius? this.graphics.roundRect: this.graphics.rect;
                shape.call(this.graphics, actualX, actualY, actualWidth, actualHeight, this.computedStyle.borderRadius || undefined);

                if(this.computedStyle.background) {
                    this.graphics.fill(this.computedStyle.background);
                }
                
                if(this.computedStyle.border) {
                    this.graphics.stroke(this.computedStyle.border);
                }
            }

            if(this.computedStyle.overflowHidden && this.parent) {
                if(!this.overflow_mask){
                    this.overflow_mask = new PIXI.Sprite(PIXI.Texture.WHITE);
                    this.addChild(this.overflow_mask);
                }
        
                this.overflow_mask.width = this.computedStyle.clipWidth || actualWidth;
                this.overflow_mask.height = this.computedStyle.clipHeight || actualHeight;

                this.mask = this.overflow_mask;
            } else {
                this.mask = null;
            }

            this.layout();
        }

        layout() {
            let y = 0;
            for(const child of this.children){
                if(child !== this.graphics && child !== this.overflow_mask && !(child.style && child.style.position === "absolute")){
                    const childMargin = child.style && child.style.margin? child.style.margin: [0, 0, 0, 0];

                    y += childMargin[0] || 0;
                    child.position.set(childMargin[3] + this.computedStyle.padding[3], y + this.computedStyle.padding[0]);

                    y += child.height + (childMargin[2] || 0) + (this.computedStyle.gap || 0);
                }
            }

            this.__layoutHeight = y + this.computedStyle.padding[0] + this.computedStyle.padding[2];
        }

        setText(text) {
            if(!this.label) {
                this.label = new PIXI.Text({ text, style: this.styleContext.get("text") });
                this.addChild(this.label)
            } else this.label.text = text;

            this.draw();
        }

        set innerText(text) {
            this.setText(text)
        }

        get innerText() {
            return this.label? this.label.text: ""
        }

        setTooltip(label) {
            tooltips.set(this, label)
            return this
        }

        removeTooltip() {
            
        }

        add(nodes) {
            for(let node of Array.isArray(nodes)? nodes: [nodes]){
                this.addChild(node)
            }
            return this
        }
    }

    const PADDING_PROPERTIES = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
    const MARGIN_PROPERTIES = ["marginTop", "marginRight", "marginBottom", "marginLeft"];

    class StyleContext {
        constructor(style = {}, options = {}) {
            this.computedStyle = {
                display: "block",
                position: "static",
                padding: [0, 0, 0, 0],
                margin: [0, 0, 0, 0],
            }

            this.parent = options.parent || null;

            this.mask = style || {};
            this.compile();
        }

        compile(patch) {
            if(!patch) patch = this.mask; else if (!patch._normalized) {
                const normalizedPatch = { _normalized: true };

                for (let prop in patch) {
                    if (!patch.hasOwnProperty(prop)) continue;
                    normalizedPatch[prop.trim().replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())] = patch[prop];
                }

                return this.compile(normalizedPatch);
            } else if (patch._normalized) {
                delete patch._normalized;
                this.mask = Object.assign(this.mask, patch);
            }

            for (let prop in patch) {
                if (!patch.hasOwnProperty(prop)) continue;

                const value = patch[prop];

                const index_padding = PADDING_PROPERTIES.indexOf(prop);
                if(index_padding !== -1) {
                    if(!this.computedStyle.padding) this.computedStyle.padding = [0, 0, 0, 0];
                    this.computedStyle.padding[index_padding] = parseInt(value) || 0;
                    continue;
                }

                const index_margin = MARGIN_PROPERTIES.indexOf(prop);
                if(index_margin !== -1) {
                    if(!this.computedStyle.margin) this.computedStyle.margin = [0, 0, 0, 0];
                    this.computedStyle.margin[index_margin] = parseInt(value) || 0;
                    continue;
                }

                this.computedStyle[prop] = value === "inherit" ? this.#normalizeValue(prop) : this.#normalizeValue(prop, value);
            }

            if (this.parent && this.parent.style) {
                for (let prop in this.parent.style) {
                    if (this.parent.style.hasOwnProperty(prop) && !patch.hasOwnProperty(prop)) {
                        this.computedStyle[prop] = this.#normalizeValue(prop, this.parent.get(prop));
                    }
                }
            }
        }

        #normalizeValue(prop, value = null) {
            if(!value) value = (this.parent && this.parent.style)? (this.parent.get(prop)): (LS.GL.rootStyle? LS.GL.rootStyle.style[prop]: undefined);

            if((prop === "padding" || prop === "margin" || prop === "borderRadius") && (!Array.isArray(value) || value.length < 4)) {
                if (typeof value === "string") {
                    value = value.split(" ").map(v => parseInt(v) || 0);
                }

                if (!Array.isArray(value)) {
                    value = [value, value, value, value];
                } else if (value.length === 2) {
                    value = [value[0], value[1], value[0], value[1]];
                } else if (value.length === 3) {
                    value = [value[0], value[1], value[2], value[1]];
                } else {
                    while (value.length < 4) {
                        value.push(value[value.length - 1]);
                    }
                }
            }

            return value;
        }

        fork(style) {
            const newStyle = new StyleContext(style, { parent: this });
            return newStyle;
        }

        set(prop, value) {
            if (typeof prop === "object") {
                this.compile(prop);
                return this;
            }

            this.compile({ [prop]: value });
            return this;
        }

        /**
         * @warning Values set with this method may be overridden by the parent context and aren't normalized.
         */
        setRaw(prop, value) {
            if (typeof prop === "object") {
                for (let key in prop) {
                    if (prop.hasOwnProperty(key)) {
                        this.computedStyle[key] = prop[key];
                    }
                }
                return this;
            }

            this.computedStyle[prop] = value;
            return this;
        }

        get(prop) {
            return this.computedStyle[prop];
        }

        static textStyleFromCSS(style) {
            if(!style) return undefined;

            if(style instanceof PIXI.TextStyle) {
                return style;
            }

            if(style instanceof Element) {
                style = window.getComputedStyle(style);
            }

            const textStyle = {};

            textStyle.align = style.textAlign || "left";
            textStyle.breakWords = style.overflowWrap === "break-word";
            if (style.textShadow) textStyle.dropShadow = style.textShadow;
            if (style.color) textStyle.fill = style.color;
            textStyle.fontFamily = style.fontFamily || "monospace";
            textStyle.fontSize = parseInt(style.fontSize) || 16;
            if (style.fontStyle) textStyle.fontStyle = style.fontStyle;
            if (style.fontVariant) textStyle.fontVariant = style.fontVariant;
            if (style.fontWeight) textStyle.fontWeight = style.fontWeight;
            if (style.letterSpacing) textStyle.letterSpacing = parseInt(style.letterSpacing);
            if (style.lineHeight) textStyle.lineHeight = parseInt(style.lineHeight);
            if (style.textStroke) textStyle.stroke = style.textStroke;
            if (style.verticalAlign) textStyle.textBaseline = style.verticalAlign;
            if (style.whiteSpace) textStyle.whiteSpace = style.whiteSpace;
            textStyle.wordWrap = style.wordWrap || (style.whiteSpace === "normal");
            if (style.wordWrapWidth) textStyle.wordWrapWidth = parseInt(style.wordWrapWidth);

            return new PIXI.TextStyle(textStyle)
        }
    }

    const context_style = new StyleContext({
        display: "block",
        overflow: "hidden"
    });

    class Context extends GLElement {
        constructor(options = {}) {
            if(!options.style) options.style = context_style;
            super(options);
        }

        render() {
            this.draw();
            return this;
        }
    }

    class Renderer {
        constructor(options = {}) {
            this.options = options;
        }

        async init() {
            this.renderer = await PIXI.autoDetectRenderer(this.options);
        }
    }

    LS.LoadComponent({ GLElement: Element, StyleContext, Context, Renderer }, { name: "GL", global: true });
})();
LS.WebSocket = class WebSocketWrapper extends LS.EventHandler {
    constructor(url, options = {}){
        super();

        if(!url) throw "No URL specified";
        if(!url.startsWith("ws://") && !url.startsWith("wss://")) url = (location.protocol === "https:"? "wss://": "ws://") + url;

        this.addEventListener = this.on;
        this.removeEventListener = this.off;

        if(Array.isArray(options) || typeof options === "string"){
            options = {protocols: options};
        }

        if(typeof options !== "object" || options === null || typeof options === "undefined") options = {};

        this.options = LS.Util.defaults({
            autoReconnect: true,
            autoConnect: true,
            delayMessages: true,
            protocols: null
        }, options);

        this.waiting = [];

        Object.defineProperty(this, "readyState", {
            get(){
                return this.socket.readyState
            }
        })

        Object.defineProperty(this, "bufferedAmount", {
            get(){
                return this.socket.bufferedAmount
            }
        })

        Object.defineProperty(this, "protocol", {
            get(){
                return this.socket.protocol
            }
        })

        this.url = url;
        if(this.options.autoConnect) this.connect();
    }

    connect(){
        if(this.socket && this.socket.readyState === 1) return;

        this.socket = new WebSocket(this.url, this.options.protocols || null);

        this.socket.addEventListener("open", event => {
            if(this.waiting.length > 0){
                for(let message of this.waiting) this.socket.send(message);
                this.waiting = []
            }

            this.emit("open", [event])
        })

        this.socket.addEventListener("message", event => {
            this.emit("message", [event])
        })

        this.socket.addEventListener("close", async event => {
            let prevent = false;

            this.emit("close", [event, () => {
                prevent = true
            }])

            if(!prevent && this.options.autoReconnect) this.connect();
        })

        this.socket.addEventListener("error", event => {
            this.emit("error", [event])
        })
    }

    send(data){
        if(!this.socket || this.socket.readyState !== 1) {
            if(this.options.delayMessages) this.waiting.push(data)
            return false
        }

        this.socket.send(data)
        return true
    }

    close(code, message){
        this.socket.close(code, message)
    }
};/**
 * Universal generioc I/O node for LS.
 * @version 1.0.0
 * 
 * How is this different from simple EventHandler?
 * Not much, but it allows for a consistent way to send data across unrelated nodes using custom protocols and connect in a tree structure.
 * Your main application can have a main input/output node, and then different components or even 3rd party plugins can interact with it using a standard protocol.
 * For example, a DAW could use this to allow plugins to communicate with each other.
 * LS.Patcher is compatible with LS.Node too.
 * 
 * Example workflow:
 * @example
 * const main = new LS.Node({
 *     onSignal (signal, data, sender) {
 *         switch (signal) {
 *             case "audio":
 *               // Play audio data
 *               break;
 *         }
 *     }
 * });
 * 
 * const audio_processor = new LS.Node({
 *     onSignal (signal, data, sender) {
 *         switch (signal) {
 *             case "audio":
 *               // Process audio data
 *               this.output("audio", processedData);
 *               break;
 *         }
 *     }
 * });
 * 
 * main.addChild(audio_processor);
 * 
 * // The following code could be made independently of the main application:
 * const plugin = new LS.Node({
 *     onSignal (signal, data, sender) {
 *         switch (signal) {
 *              case "start":
 *                 // Start processing
 *                 this.output("audio", <audio_data>);
 *                 break;
 *         }
 *     }
 * });
 * 
 * // And the main application can simply connect it:
 * audio_processor.addChild(plugin);
 * audio_processor.send("start");
 */

LS.LoadComponent(class Node extends LS.EventHandler {
    constructor(options = {}) {
        super();

        if (typeof options.onSignal === "function") {
            this.on("signal", options.onSignal);
        }

        this.signalEmitter = this.prepareEvent("signal");

        if(options.hasChildren) {
            this.children = [];
        }

        this.parent = null;
    }

    send(signal, data, propagate = true, sender = null) {
        this.quickEmit(this.signalEmitter, [signal, data, sender || this]);
        if (propagate && this.children) for (const child of this.children) {
            child.send(signal, data, propagate, this);
        }
    }

    output(signal, data) {
        if (this.parent) {
            this.parent.send(signal, data, this);
        }
    }

    addChild(child) {
        if (!(child instanceof Node)) {
            throw new Error("Child must be an instance of Node");
        }

        if (!this.children) return;

        if (child.parent) {
            child.parent.removeChild(child);
        }

        this.children.push(child);
        child.parent = this;

        this.emit("childAdded", [child]);
        return this;
    }

    removeChild(child) {
        if (!this.children) return;

        const index = this.children.indexOf(child);
        if (index === -1) return;

        this.children.splice(index, 1);
        child.parent = null;

        this.emit("childRemoved", child);
    }
}, { name: "Node", global: true })
/**
 * A simple yet powerful, fast and lightweight reactive library for LS
 * @version 1.0.0
 * 
 * TODO: Support attribute binding
 * TODO: Bind multiple values (eg. {{ user.displayname || user.username }})
 */

LS.LoadComponent(class Reactive extends LS.Component {
    constructor(){
        super()

        this.bindCache = new Map();

        this.global = this.wrap(null, {}, true);

        window.addEventListener("DOMContentLoaded", () => {
            this.scan();
        })
    }

    /**
     * Scans the document or specific element for elements with the data-reactive attribute and caches them
     * @param {HTMLElement} scanTarget The target element to scan
     */

    scan(scanTarget = document.body){
        const scan = scanTarget.querySelectorAll(`[data-reactive]`);

        for(let target of scan) {
            this.bindElement(target);
        }
    }

    /**
     * Parses the data-reactive attribute of an element and caches it for lookup
     * @param {HTMLElement} target The target element to bind
     */

    bindElement(target, defaultBind = null){
        let attribute = (defaultBind || target.getAttribute("data-reactive")).trim();
        if(!attribute || target.__last_bind === attribute) return;

        if(target.__last_bind) this.unbindElement(target, true);

        target.__last_bind = attribute;

        // Match data prefix
        let value_prefix = null;
        if(this.constructor.matchStringChar(attribute.charCodeAt(0))) {
            const string_char = attribute.charAt(0);
            const end = attribute.indexOf(string_char, 1);
            if(end === -1) {
                console.warn("Invalid reactive attribute: " + attribute);
                return;
            }

            value_prefix = attribute.slice(1, end);
            attribute = attribute.slice(end + 1).trim();
        }

        const [prefix, name, extra] = this.split_path(attribute);
        if(!name) return;

        const key = this.constructor.parseKey(prefix, name, extra);

        target.__reactive = key;

        if(value_prefix) {
            target.__reactive.value_prefix = value_prefix;
        }

        let binding = this.bindCache.get(prefix);

        if(!binding) {
            binding = { object: null, updated: false, keys: new Map };
            this.bindCache.set(prefix, binding);
        }

        const cache = binding.keys.get(key.name);
        if(cache) cache.add(target); else binding.keys.set(key.name, new Set([target]));

        if(binding.object) this.renderValue(target, binding.object[key.name]);
    }

    /**
     * Removes a binding from an element
     * @param {HTMLElement} target The target element to unbind
     */

    unbindElement(target, keepAttribute = false){
        if(!keepAttribute) target.removeAttribute("data-reactive");
        if(!target.__last_bind) return;

        const [prefix, name] = this.split_path(target.__last_bind);

        delete target.__last_bind;
        delete target.__reactive;

        if(!name) return;

        let binding = this.bindCache.get(prefix);
        if(!binding) return;

        const cache = binding.keys.get(name);
        if(cache) cache.delete(target);
    }


    /**
     * A fast, light parser to expand a key to an object with dynamic properties, eg. "username || anonymous".
     * @param {string} extra The key string to parse
    */

    static parseKey(prefix, name, extra){
        let i = -1, v_start = 0, v_propety = null, state = 0, string_char = null;

        const result = {
            prefix, name
        };

        extra = extra? extra.trim(): null;
        if(!extra) return result;

        while(++i < extra.length) {
            const char = extra.charCodeAt(i);
            
            if(state === 0) {
                if(char === 58){ // :
                    v_start = i + 1;
                    state = 4;
                    continue;
                }

                state = 1;
            }

            if(state === 4) {
                if(this.matchKeyword(extra.charCodeAt(i + 1)) && i !== extra.length - 1) continue;
                const type = extra.slice(v_start, i + 1).toLowerCase();
                result.type = this.types.get(type) || type;

                if(extra.charCodeAt(i + 1) === 40) { // (
                    i++;
                    v_start = i + 1;
                    state = 5;
                    continue;
                }

                state = 1;
            }

            if (state === 5) {
                let args = [];
                while (i < extra.length && extra.charCodeAt(i) !== 41) { // )
                    if (!this.matchWhitespace(extra.charCodeAt(i))) {
                        let arg_start = i;
                        while (i < extra.length && extra.charCodeAt(i) !== 44 && extra.charCodeAt(i) !== 41) { // , or )
                            i++;
                        }
                        args.push(extra.slice(arg_start, i).trim());
                        if (extra.charCodeAt(i) === 44) i++; // Skip comma
                    } else {
                        i++;
                    }
                }
                result.args = args;
                state = 1;
            }

            if(state === 3) {
                if(char === string_char) {
                    result[v_propety] = extra.slice(v_start, i);
                    state = 0;
                }
                continue;
            }

            if(this.matchWhitespace(char)) continue;

            if(state === 2) {
                if(this.matchStringChar(char)) {
                    string_char = char;
                    v_start = i + 1;
                    state = 3;
                }
                continue;
            }

            switch(char) {
                case 124: // | - Or
                    if(extra.charCodeAt(i + 1) === 124) {
                        i++;
                        v_propety = "or";
                        state = 2;
                        break;
                    }

                    console.warn("You have a syntax error in key: " + extra);
                    return result; // Invalid
                
                case 63: // ? - Default
                    if(extra.charCodeAt(i + 1) === 63) {
                        i++;
                        v_propety = "default";
                        state = 2;
                        break;
                    }

                    console.warn("You have a syntax error in key: " + extra);
                    return result; // Invalid
                
                case 33: // ! - Raw HTML
                    result.raw = true;
                    break;
            }
        }

        return result;
    }

    static matchKeyword(char){
        return (
            (char >= 48 && char <= 57) || // 0-9
            (char >= 65 && char <= 90) || // A-Z
            (char >= 97 && char <= 122) || // a-z
            char === 95 || // _
            char === 45    // -
        )
    }

    static matchWhitespace(char){
        return char === 32 || char === 9 || char === 10 || char === 13;
    }

    static matchStringChar(char){
        return char === 34 || char === 39 || char === 96;
    }

    static types = new Map([
        ["string", String],
        ["number", Number],
        ["boolean", Boolean],
        ["array", Array],
        ["object", Object],
        ["function", Function]
    ]);

    registerType(name, type){
        if(typeof name !== "string" || !name.trim()) {
            throw new Error("Invalid type name: " + name);
        }

        if(typeof type !== "function") {
            throw new Error("Invalid type: " + type);
        }

        this.constructor.types.set(name.toLowerCase(), type);
    }

    split_path(path){
        if(!path) return [null, null, null];

        const match = path.match(/^([a-zA-Z0-9._-]+)(.*)/);

        if(!match) return [null, path, null];

        path = match[1];

        const lastIndex = path.lastIndexOf(".");
        const prefix = lastIndex === -1? "": path.slice(0, path.lastIndexOf(".") +1);
        if(prefix) path = path.slice(lastIndex + 1);

        return [prefix, path, match[2].trim()];
    }


    /**
     * Wraps an object with a reactive proxy
     * @param {string} prefix The prefix to bind to
     * @param {object} object The object to wrap
     * @param {boolean} recursive Whether to recursively bind all objects
     */

    wrap(prefix, object = {}, recursive = false){
        if(typeof prefix === "string") prefix += "."; else prefix = "";

        if(recursive) for(let key in object) {
            if(typeof object[key] === "object" && object[key] !== null && object[key].__isProxy === undefined && Object.getPrototypeOf(object[key]) === Object.prototype) {
                object[key] = this.wrap(prefix + key, object[key], true);
            }
        }

        if(object.__isProxy) return object;

        let binding = this.bindCache.get(prefix);

        if(!binding) {
            binding = { object, updated: true, keys: new Map };
            this.bindCache.set(prefix, binding);
        } else {
            binding.object = object;
        }

        this.render(binding);

        return new Proxy(object, {
            set: (target, key, value) => {
                // Wrap new nested objects dynamically
                if(recursive && typeof value === "object" && value !== null && !value.__isProxy) {
                    value = this.wrap(prefix + key, value, true);
                    target[key] = value;
                    return;
                }

                target[key] = value;
                binding.updated = true;
                this.renderKey(key, target, binding.keys.get(key));
                return true;
            },

            get: (target, key) => key === "__isProxy"? true: key === "__binding"? binding: target[key],

            deleteProperty: (target, key) => {
                delete target[key];
                this.renderKey(key, target, binding.keys.get(key));
            }
        })
    }

    /**
     * Binds an existing object property without wrapping
     * @param {string} path The path and key to bind to
     * @param {object} object The object with the property to bind
     */

    bind(path, object){
        const [prefix, key] = this.split_path(path);

        let binding = this.bindCache.get(prefix);
        if (!binding) {
            binding = { object: object, updated: true, keys: new Map() };
            this.bindCache.set(prefix, binding);
        }

        Object.defineProperty(object, key, {
            get: () => binding.object[key],
            set: (value) => {
                binding.object[key] = value;
                binding.updated = true;
                this.renderKey(key, binding.object, binding.keys.get(key));
            },

            configurable: true
        });

        return object;
    }

    renderAll(bindings){
        for(let binding of Array.isArray(bindings)? bindings: this.bindCache.values()) {            
            if(binding && binding.object && binding.updated) this.render(binding);
        }
    }

    /**
     * Renders a binding object
     * @param {object} binding The binding object to render
     * @param {string} specificKey A specific key to render
     */

    render(binding){
        if(!binding) return this.renderAll();
        if(!binding.object) return;

        binding.updated = false;

        for(let [key, cache] of binding.keys) {
            this.renderKey(key, binding.object, cache);
        }
    }

    renderKey(key, source, cache){
        if(!cache || cache.size === 0) return;

        const value = source[key];
        for(let target of cache) {
            this.renderValue(target, value);
        }
    }

    renderValue(target, value){
        if(typeof value === "function") value = value();

        if(!value && target.__reactive.or) {
            value = target.__reactive.or;
        }

        if(target.__reactive.default && (typeof value === "undefined" || value === null)) {
            value = target.__reactive.default;
        }

        // Try getting the type again
        if(typeof target.__reactive.type === "string") {
            target.__reactive.type = this.constructor.types.get(target.__reactive.type.toLowerCase()) || target.__reactive.type;
        }

        if(typeof target.__reactive.type === "function") {
            value = target.__reactive.type(value, target.__reactive.args || []);
        }

        if(target.__reactive.value_prefix) {
            value = target.__reactive.value_prefix + value;
        }

        if(value instanceof Element) {
            target.replaceChildren(value);
            return;
        }

        if(target.__reactive.attribute) {
            target.setAttribute(target.__reactive.attribute, value);
            return;
        }

        if(target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {

            if(target.type === "checkbox") target.checked = Boolean(value);
            else target.value = value;

        } else if(target.tagName === "IMG" || target.tagName === "VIDEO" || target.tagName === "AUDIO") {

            target.src = value;

        } else {

            if(target.__reactive.raw) target.innerHTML = value; else target.textContent = value;

        }
    }
}, { name: "Reactive", singular: true, global: true })
LS.LoadComponent(class Tabs extends LS.Component {
    constructor(element, options = {}) {
        super();

        this.order = [];
        this.tabs = new Map;
        this.activeTab = null;
        this.element = O(element);
        this.container = O(element);

        options = LS.Util.defaults({
            styled: options.unstyled? false: true,
            list: true,
            closeable: false,
            selector: "ls-tab, .ls-tab",
            mode: "default",
        }, options);
        
        if(options.styled) {
            this.container.class("ls-tabs-styled");
        }

        if(options.mode) {
            this.container.class("ls-tabs-mode-" + options.mode);
        }

        if(options.selector) {
            this.container.getAll(options.selector).forEach((tab, i) => {
                this.add(tab.getAttribute("tab-id") || tab.getAttribute("id") || tab.getAttribute("tab-title") || "tab-" + i, tab);
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

    set(id, force = false) {
        if(typeof id === "number") {
            id = this.order[id];
        }

        const tab = this.tabs.get(id);
        const currentTab = this.tabs.get(this.activeTab);

        if(!tab) {
            return false;
        }

        // const index = this.order.indexOf(id);

        if(this.activeTab === id && !force) {
            return false;
        }

        if(currentTab) {
            if(currentTab.element) {
                currentTab.element.class("tab-active", false);
            }

            if(currentTab.handle) {
                currentTab.handle.class("active", false);
            }
        }

        if(tab.element) {
            tab.element.class("tab-active");
        }

        this.emit("changed", [id, currentTab?.id || null]);

        if(tab.handle) {
            tab.handle.class("active");
        }

        this.activeTab = id;
        return true;
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
}, { name: 'Tabs', global: true });LS.LoadComponent(class Toast extends LS.Component {
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
            class: "ls-toast level-n2",
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
}, { global: true, singular: true, name: "Toast" });LS.LoadComponent(class Tooltips extends LS.Component {
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
            left: (
                box.width ? Math.min(Math.max(box.left + (box.width / 2) - (cbox.width / 2), 4), innerWidth - (cbox.width)) : box.x
            ) + "px",

            maxWidth: (innerWidth - 8) + "px",

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

            let element = O(mutation.target), attribute = mutation.attributeName;

            element.ls_hasTooltip = element.hasAttribute(attribute);
            element.ls_tooltip_isHint = element.hasAttribute("ls-hint");

            if(!element.ls_tooltipSetup) !this.setup(element);
        }
    }

    rescan(){
        this.addElements([...document.querySelectorAll(this.attributes.map(a=>`[${a}]`).join(","))].map(element => {
            return {
                target: element,
                attributeName: Object.keys(element.attr()).find(a=>this.attributes.includes(a))
            }
        }))
    }

    setup(element){
        element.ls_tooltipSetup = true;
     
        element.on("mouseenter", ()=>{
            if(!element.ls_hasTooltip) return;
            const value = element.ls_tooltip || element.getAttribute("ls-tooltip") || element.getAttribute("ls-hint");

            this.emit("set", [value, element]);

            if(element.ls_tooltip_isHint) return;

            this.set(value)
            this.show()

            this.position(element)
        })

        element.on("mousemove", () => this.position(element))

        element.on("mouseleave", () => {
            if(!element.ls_hasTooltip) return;

            this.emit("leave", [element.tooltip_value]);
            this.hide()
        })
    }
}, { global: true, singular: true, name: "Tooltips" });/*

    For older projects that used LS v2/v3/v4 modules or features, this patch aims to provide some
    backwards-compatibility to allow them to keep using v5 of the framework.

    It re-adds some deprecated features, and sort of brings back the old component system.

*/

(() => {
    const og_LoadComponents = LS.LoadComponents;

    LS.LoadComponents = function(components){
        /*
            Old (v4) component system backwards-compatibility for v5
        */

        if(Array.isArray(components)) return og_LoadComponents(components);

        for(let name in components){
            LS[name] = function ComponentInstance(id, ...attributes){
                if(LS[name].conf.isFunction) return (LS[name].class({})) (id, ...attributes);
                return LS[name].new(id, ...attributes);
            }

            LS[name].class = (components[name]) (LS[name]);

            LS[name].conf = {
                batch: true,
                events: true,
                ... LS[name].conf
            };

            if(LS[name].conf.events) LS[name].Events = new LS.EventHandler(LS[name]);

            if(LS[name].conf.singular){

                if(LS[name].conf.becomeClass) {
                    LS[name] = LS[name].class;
                    continue
                }

                LS[name] = LS[name].new("global");
            }

            LS[name].new = function (id, ...attributes){
                let ClassInstance = new((LS[name].class)({})) (id, ...attributes);
                if(LS[name].conf.events) ClassInstance.Events = new LS.EventHandler(ClassInstance);
                if(ClassInstance._init) ClassInstance._init();

                return ClassInstance
            }
        }
    }

    LS.Tiny.M.payloadSignature = function (title, dataArray = [], paddingSize = 128, base = 16){
        if(dataArray.length > paddingSize){
            throw "The length of data cannot exceed the padding size"
        }

        if(base < 16 || base > 36) throw "base must be a number between 16 and 36";

        let encoder = new TextEncoder();

        for(let i = 0; i < dataArray.length; i++){
            if(!(dataArray[i] instanceof Uint8Array) && typeof dataArray[i] !== "string") throw "Data can only be a string or an Uint8Array.";
            dataArray[i] = typeof dataArray[i] === "string"? encoder.encode(dataArray[i]): dataArray[i];
        }

        dataArray.push(crypto.getRandomValues(new Uint8Array(paddingSize - dataArray.length)));

        let data = dataArray.map(data => [...data].map(value => value.toString(base).padStart(2, "0")).join("")).join(":") + "0" + (base -1).toString(base)

        return `---signature block start "${M.uid()}${title? "-"+ title: ""}"---\n${data}\n---signature block end---`
    }

    LS.Tiny.M.parsePayloadSignature = function (signature){
        if(!signature.startsWith("---signature block start") || !signature.endsWith("\n---signature block end---")) throw "Invalid signature data";

        let header = signature.match(/---signature block start "(.*?)"---\n/)[1].split("-"), timestamp, id, instanceID;

        timestamp = parseInt(header[0], 36)
        id = parseInt(header[1], 36)
        instanceID = parseInt(header[2], 36)
        header = header[4] || null

        function decodeBody(hexString) {
            const byteArray = new Uint8Array(hexString.length / 2);

            for (let i = 0; i < hexString.length; i += 2) {
                byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), base);
            }
            
            return byteArray;
        }

        let rawBody = signature.match(/['"t]---\n(.*?)\n---signature block end/s)[1], base = parseInt(rawBody.slice(-2), 36) +1;
        
        let body = rawBody.split(":").map(payload => decodeBody(payload));
        
        let padding = body.pop()

        return { header, body, padding, timestamp, id, instanceID }
    }
})();