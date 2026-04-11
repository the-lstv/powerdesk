(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var require_beta_js_animation_automationgraph_color_compiletemplate_dragdrop_imagecropper_knob_menu_modal_network_node_patcher_range_reactive_resize_shortcutmanager_tabs_timeline_toast_tooltips_chrome108_firefox102 = __commonJS({
    "beta:js:\0,animation,automationgraph,color,compiletemplate,dragdrop,imagecropper,knob,menu,modal,network,node,patcher,range,reactive,resize,shortcutmanager,tabs,timeline,toast,tooltips:chrome108,firefox102"(exports, module) {
      ((exports2) => {
        const instance = exports2();
        if (typeof module !== "undefined") {
          module.exports = instance;
        }
        if (instance.isWeb) {
          let bodyAvailable2 = function() {
            instance._events.completed("ready", [document.body]);
          };
          var bodyAvailable = bodyAvailable2;
          const global = typeof window !== "undefined" ? window : globalThis;
          global.LS = instance;
          instance._events.prepareEvent("ready", { deopt: true });
          instance._events.alias("ready", "body-available");
          if (!window.LS_DEFER_INIT) {
            instance.init({
              globalizeTiny: window.LS_DONT_GLOBALIZE_TINY !== true,
              globalPrototype: window.ls_do_not_prototype !== true,
              ...window.LS_INIT_OPTIONS || null
            });
            delete window.LS_INIT_OPTIONS;
          }
          delete window.LS_DEFER_INIT;
          if (document.body) bodyAvailable2();
          else window.addEventListener("DOMContentLoaded", bodyAvailable2);
        }
        instance._events.prepareEvent("component-loaded", { deopt: true });
        return instance;
      })(() => {
        const CONTEXT_FIELDS = ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "fetch", "XMLHttpRequest", "requestAnimationFrame", "EventSource", "WebSocket", "queueMicrotask", "EventTarget", "MessageChannel", "MessagePort", "Worker"];
        class EventEmitter {
          static REMOVE_LISTENER = /* @__PURE__ */ Symbol("event-remove");
          static optimize = true;
          static EventObject = class EventObject {
            listeners = [];
            free = [];
            // Still keeping freelist because listener order needs to be preserved
            compiled = null;
            // Compild function
            aliases = null;
            completed = false;
            warned = false;
            break = false;
            results = false;
            async = false;
            await = false;
            deopt = false;
            data = null;
            // Data used for completed events
            _isEvent = true;
            remove(index) {
              const listeners2 = this.listeners;
              if (listeners2[index] == null) return;
              this.compiled = null;
              if (listeners2.length === 1 || listeners2.length === this.free.length + 1) {
                listeners2.length = 0;
                this.free.length = 0;
                return;
              }
              listeners2[index] = null;
              this.free.push(index);
            }
            emit(data) {
              return EventEmitter.emit(this, data);
            }
            /**
             * Recompile the event's internal emit function for performance.
             * Compilation may get skipped in which case the normal emit loop is used.
             */
            recompile() {
              const listeners = this.listeners;
              const listenersCount = listeners.length;
              if (listenersCount < 2 || listenersCount >= 950 || EventEmitter.optimize === false || this.deopt === true) return;
              const collectResults = this.results === true;
              const breakOnFalse = this.break === true;
              const parts = [];
              parts.push("(function(RL,listeners,event){var l=listeners;");
              for (let i = 0; i < listenersCount; i++) {
                const li = listeners[i];
                if (li === null) continue;
                parts.push("var f", i, "=l[", i, "].callback;");
              }
              if (this.await === true) {
                parts.push("l=undefined;return(async function(a,b,c,d,e){var v");
              } else {
                parts.push("l=undefined;return(function(a,b,c,d,e){var v");
              }
              if (collectResults) parts.push(",r=[]");
              parts.push(";");
              for (let i = 0; i < listenersCount; i++) {
                const li = listeners[i];
                if (li === null) continue;
                parts.push("v=");
                if (this.await === true) {
                  parts.push("await f");
                } else {
                  parts.push("f");
                }
                parts.push(i, "(a,b,c,d,e);");
                if (breakOnFalse) {
                  parts.push("if(v===false)return", collectResults ? " r" : "", ";");
                }
                if (li.once) {
                  if (collectResults) {
                    parts.push("if(v!==RL)r.push(v);");
                  }
                  parts.push("event.remove(", i, ");");
                } else {
                  if (collectResults) {
                    parts.push("if(v===RL){event.remove(", i, ")}else{r.push(v)};");
                  } else {
                    parts.push("if(v===RL){event.remove(", i, ")};");
                  }
                }
              }
              if (collectResults) parts.push("return r;");
              parts.push("})})");
              const factory = eval(parts.join(""));
              this.compiled = factory(EventEmitter.REMOVE_LISTENER, listeners, this);
            }
          };
          /**
           * @param {object} target Kept for compatibility; Binds the event handler methods to a target object.
           * @param {object} options Event handler options.
           */
          constructor(target, options = void 0) {
            EventEmitter.prepareHandler(this, options);
            if (target) {
              if (target.emit === void 0) target.emit = this.emit.bind(this);
              if (target.quickEmit === void 0) target.quickEmit = this.quickEmit.bind(this);
              if (target.on === void 0) target.on = this.on.bind(this);
              if (target.once === void 0) target.once = this.once.bind(this);
            }
          }
          static prepareHandler(target, options = void 0) {
            target.events = /* @__PURE__ */ new Map();
            if (typeof options === "object") target.eventOptions = options;
          }
          /**
           * Prepare or update an event object with given name and options.
           * @param {string|symbol} name Name of the event.
           * @param {object} options Event options.
           * @returns {EventObject} Prepared event object.
           * 
           * @warning If you are going to use the event reference, remember to dispose of it properly to avoid memory leaks.
           */
          prepareEvent(name, options = void 0) {
            let event = this.events.get(name);
            if (!event) {
              event = new EventEmitter.EventObject();
              this.events.set(name, event);
            }
            if (name === "destroy") {
              event.deopt = true;
            }
            if (options) {
              if (options.completed !== void 0) {
                event.completed = options.completed;
                if (!event.completed) event.data = null;
              }
              if (options.break !== void 0) event.break = !!options.break;
              if (options.results !== void 0) event.results = !!options.results;
              if (options.async !== void 0) event.async = !!options.async;
              if (options.await !== void 0) {
                event.await = !!options.await;
                event.compiled = null;
              }
              if (options.deopt !== void 0) {
                event.deopt = !!options.deopt;
                event.compiled = null;
              }
              if (options.data !== void 0) event.data = options.data;
            }
            return event;
          }
          on(name, callback, options) {
            if (name === "destroyed") name = "destroy";
            const event = name._isEvent ? name : this.events.get(name) || this.prepareEvent(name);
            if (event.completed) {
              if (event.data) Array.isArray(event.data) ? callback.apply(null, event.data) : callback(event.data);
              else callback();
              if (options && options.once) return;
            }
            options ||= {};
            options.callback = callback;
            const free = event.free;
            if (free.length > 0) {
              event.listeners[free.pop()] = options;
            } else {
              const amount = event.listeners.push(options);
              if (amount > (this.eventOptions?.maxListeners || 1e3) && !event.warned) {
                console.warn(`EventEmitter: Possible memory leak detected. ${event.listeners.length} listeners added for event '${name.toString()}'.`);
                event.warned = true;
              }
            }
            event.compiled = null;
          }
          off(name, callback) {
            const event = name._isEvent ? name : this.events.get(name);
            if (!event) return;
            const listeners2 = event.listeners;
            for (let i = 0; i < listeners2.length; i++) {
              const listener = listeners2[i];
              if (!listener) continue;
              if (listener.callback === callback) {
                event.remove(i);
              }
            }
          }
          once(name, callback, options) {
            options ??= {};
            options.once = true;
            return this.on(name, callback, options);
          }
          /**
           * Emit an event with the given name and data.
           * @param {string|object} name Name of the event to emit or it's reference
           * @param {Array} data Array of values to pass
           * @param {object} event Optional emit options override
           * @returns {null|Array|Promise<null|Array>} Array of results (if options.results is true) or null. If event.await is true, returns a Promise.
           */
          emit(name, data) {
            const event = name._isEvent ? name : this.events?.get(name);
            if (!event || event.listeners.length === 0) return event && event.await ? Promise.resolve(null) : null;
            const listeners2 = event.listeners;
            const listenerCount = listeners2.length;
            const collectResults2 = event.results === true;
            const isArray = data && Array.isArray(data);
            if (!isArray) data = [data];
            const dataLen = isArray ? data.length : 0;
            let a = void 0, b = void 0, c = void 0, d = void 0, e = void 0;
            if (dataLen > 0) a = data[0];
            if (dataLen > 1) b = data[1];
            if (dataLen > 2) c = data[2];
            if (dataLen > 3) d = data[3];
            if (dataLen > 4) e = data[4];
            if (event.await === true) {
              if (!event.compiled) {
                event.recompile();
              }
              if (event.compiled) {
                return event.compiled(a, b, c, d, e);
              }
              const breakOnFalse3 = event.break === true;
              const returnData2 = collectResults2 ? [] : null;
              return (async () => {
                for (let i = 0; i < listeners2.length; i++) {
                  const listener = listeners2[i];
                  if (listener === null) continue;
                  let result = dataLen < 6 ? listener.callback(a, b, c, d, e) : listener.callback.apply(null, data);
                  if (result && typeof result.then === "function") {
                    result = await result;
                  }
                  if (collectResults2) returnData2.push(result);
                  if (listener.once || result === EventEmitter.REMOVE_LISTENER) {
                    event.remove(i);
                  }
                  if (breakOnFalse3 && result === false) break;
                }
                return returnData2;
              })();
            }
            if (listenerCount === 1) {
              const listener = listeners2[0];
              if (listener === null) return null;
              let result = listener.callback(a, b, c, d, e);
              if (listener.once || result === EventEmitter.REMOVE_LISTENER) {
                event.remove(0);
              }
              return collectResults2 ? [result] : null;
            }
            if (!event.compiled) {
              event.recompile();
            }
            if (event.compiled) {
              return event.compiled(a, b, c, d, e);
            }
            const breakOnFalse2 = event.break === true;
            const returnData = collectResults2 ? [] : null;
            if (dataLen < 6) {
              for (let i = 0; i < listeners2.length; i++) {
                const listener = listeners2[i];
                if (listener === null) continue;
                let result = listener.callback(a, b, c, d, e);
                if (collectResults2) returnData.push(result);
                if (listener.once || result === EventEmitter.REMOVE_LISTENER) {
                  event.remove(i);
                }
                if (breakOnFalse2 && result === false) break;
              }
            } else {
              for (let i = 0; i < listeners2.length; i++) {
                const listener = listeners2[i];
                if (listener === null) continue;
                let result = listener.callback.apply(null, data);
                if (collectResults2) returnData.push(result);
                if (listener.once || result === EventEmitter.REMOVE_LISTENER) {
                  event.remove(i);
                }
                if (breakOnFalse2 && result === false) break;
              }
            }
            return returnData;
          }
          /**
           * Faster emit, without checking or collecting return values. Limited to 5 arguments.
           * @warning This does not guarantee EventEmitter.REMOVE_LISTENER or any other return value functionality. Async events are not supported with quickEmit.
           * @param {string|object} event Event name or reference.
           * @param {*} a First argument.
           * @param {*} b Second argument.
           * @param {*} c Third argument.
           * @param {*} d Fourth argument.
           * @param {*} e Fifth argument.
           */
          quickEmit(name, a, b, c, d, e) {
            const event = name._isEvent ? name : this.events.get(name);
            if (!event || event.listeners.length === 0) return false;
            if (event.await === true) {
              throw new Error("quickEmit cannot be used with async/await events.");
            }
            if (event.listeners.length === 1) {
              const listener = event.listeners[0];
              listener.callback(a, b, c, d, e);
              if (listener.once) {
                event.remove(0);
              }
              return;
            }
            if (!event.compiled) {
              event.recompile();
            }
            if (event.compiled) {
              event.compiled(a, b, c, d, e);
              return;
            }
            const listeners2 = event.listeners;
            for (let i = 0, len = listeners2.length; i < len; i++) {
              const listener = listeners2[i];
              if (listener === null) continue;
              if (listener.once) {
                event.remove(i);
              }
              listener.callback(a, b, c, d, e);
            }
          }
          flush() {
            this.events.clear();
          }
          destroy() {
            this.events.clear();
            this.eventOptions = null;
            this.events = null;
          }
          /**
           * Create an alias for an existing event.
           * They will become identical and share listeners.
           * @param {*} name Original event name.
           * @param {*} alias Alias name.
           */
          alias(name, alias) {
            const event = (name._isEvent ? name : this.events.get(name)) || this.prepareEvent(name);
            event.aliases ??= [];
            if (!event.aliases.includes(alias)) event.aliases.push(alias);
            this.events.set(alias, event);
          }
          completed(name, data = void 0, options = null) {
            this.emit(name, data);
            options ??= {};
            options.completed = true;
            options.data = data;
            this.prepareEvent(name, options);
          }
        }
        class Context extends EventEmitter {
          #destroyables = /* @__PURE__ */ new Set();
          #timers = /* @__PURE__ */ new Set();
          #rAF = [];
          #externalEvents = [];
          #aggresiveCleanup = false;
          #deleteProperties = true;
          constructor(options = {}) {
            super();
            this.destroyed = false;
            if (options.aggresiveCleanup) this.#aggresiveCleanup = true;
            if (options.deleteProperties === false) this.#deleteProperties = false;
            this.prepareEvent("destroy", { deopt: true });
            this.alias("destroy", "destroyed");
          }
          createElement(tagName, content) {
            return this.addDestroyable(LS.Create(tagName, content));
          }
          /**
           * Element selector that searches within own container.
           */
          selectElement(selector, one = false) {
            if (!this.container) return null;
            return LS.Tiny.Q(this.container, selector, one);
          }
          addDestroyable(...destroyables) {
            for (const item of destroyables) {
              if (!item || this.destroyed) continue;
              if (item instanceof LS.Component) {
                Context.bind(item, this);
              }
              this.#destroyables.add(item);
              if (destroyables.length === 1) return item;
            }
          }
          removeDestroyable(destroyable, destroy = false) {
            this.#destroyables.delete(destroyable);
            if (destroy) this.destroyOne(destroyable, false);
          }
          setTimeout(callback, delay, ...args) {
            const timer = Context.setTimeout(() => {
              this.#timers.delete(ref);
              callback(...args);
            }, delay);
            const ref = [timer, 0];
            this.#timers.add(ref);
            return timer;
          }
          setInterval(callback, interval, ...args) {
            const timer = Context.setInterval(() => {
              callback(...args);
            }, interval);
            this.#timers.add([timer, 1]);
            return timer;
          }
          clearTimeout(timeout) {
            for (const timer of this.#timers) {
              const [id, type] = timer;
              if (type === 0 && id === timeout) {
                Context.clearTimeout(id);
                this.#timers.delete(timer);
                return;
              }
            }
          }
          clearInterval(interval) {
            for (const timer of this.#timers) {
              const [id, type] = timer;
              if (type === 1 && id === interval) {
                Context.clearInterval(id);
                this.#timers.delete(timer);
                return;
              }
            }
          }
          clearIntervals() {
            for (const timer of this.#timers) {
              const [id, type] = timer;
              if (type === 1) {
                Context.clearInterval(id);
                this.#timers.delete(timer);
              }
            }
          }
          clearTimeouts() {
            for (const timer of this.#timers) {
              const [id, type] = timer;
              if (type === 0) {
                Context.clearTimeout(id);
                this.#timers.delete(timer);
              }
            }
          }
          clearRAF() {
            for (const id of this.#rAF) {
              cancelAnimationFrame(id);
            }
            this.#rAF.length = 0;
          }
          createComponent(component, ...options) {
            if (this.destroyed) return null;
            const instance = new component(...options);
            this.addDestroyable(instance);
            LS.Context.bind(instance, this);
            return instance;
          }
          requestAnimationFrame(callback) {
            if (this.destroyed) return null;
            const id = LS.Context.requestAnimationFrame(callback);
            this.#rAF.push(id);
            return id;
          }
          destroyOne(destroyable, _remove = true, _explicit = true) {
            try {
              if (_remove) this.#destroyables.delete(destroyable);
              if (typeof destroyable === "function") {
                if (!_explicit) return;
                const isClass = LS.Util.isClass(destroyable);
                if (!isClass) {
                  destroyable();
                }
                return;
              }
              if (destroyable === null || destroyable === void 0 || typeof destroyable !== "object" && typeof destroyable !== "function") return;
              if (typeof Element !== "undefined" && destroyable instanceof Element) {
                destroyable.remove();
                return;
              }
              if (typeof NodeList !== "undefined" && (destroyable instanceof NodeList || Array.isArray(destroyable))) {
                destroyable.forEach((item) => this.destroyOne(item, false, _explicit));
                destroyable.length = 0;
                return;
              }
              if (typeof AbortController !== "undefined" && destroyable instanceof AbortController) {
                destroyable.abort();
                return;
              }
              if (LS.isWeb) {
                if (destroyable instanceof ResizeObserver || destroyable instanceof MutationObserver || destroyable instanceof IntersectionObserver || destroyable instanceof AudioContext) {
                  destroyable.disconnect();
                  return;
                }
              }
              if (destroyable instanceof EventEmitter) {
                destroyable.events?.clear?.();
              }
              if (typeof destroyable.destroy === "function") destroyable.destroy();
            } catch (error) {
              console.error("Error destroying:", error);
            }
          }
          addExternalEventListener(target, event, callback, options) {
            const cap = typeof options === "boolean" ? options : !!options?.capture;
            const addListener = target.addEventListener || target.on;
            if (typeof addListener === "function") addListener.call(target, event, callback, cap);
            this.#externalEvents.push([target, event, callback, cap]);
          }
          removeExternalEventListener(target, event, callback, options) {
            const cap = typeof options === "boolean" ? options : !!options?.capture;
            const index = this.#externalEvents.findIndex(([t, e, c, o]) => t === target && e === event && c === callback && o === cap);
            if (index !== -1) {
              const removeListener = target.removeEventListener || target.off;
              if (typeof removeListener === "function") removeListener.call(target, event, callback, cap);
              this.#externalEvents.splice(index, 1);
            }
          }
          destroy() {
            if (this.destroyed) return;
            this.destroyed = true;
            this.quickEmit("destroy");
            if (this.events) this.events.clear();
            for (const timer of this.#timers) {
              const [id, type] = timer;
              if (type === 0) Context.clearTimeout(id);
              else Context.clearInterval(id);
            }
            this.#timers.clear();
            this.#timers = null;
            this.clearRAF();
            this.#rAF = null;
            for (const [target, event, callback, options] of this.#externalEvents) {
              const removeListener = target.removeEventListener || target.off;
              if (typeof removeListener === "function") removeListener.call(target, event, callback, options);
            }
            this.#externalEvents = null;
            super.destroy();
            if (this.ctx && this.hasOwnProperty("ctx")) {
              try {
                this.ctx = null;
              } catch {
              }
            }
            if (this.#deleteProperties) {
              for (const key of Object.keys(this)) {
                if (key === "destroyed") continue;
                const value = this[key];
                if (this.#destroyables.has(value)) {
                  this.destroyOne(value, true);
                } else if (this.#aggresiveCleanup) {
                  this.destroyOne(value, false, false);
                }
                delete this[key];
              }
            }
            for (const destroyable of this.#destroyables) {
              this.destroyOne(destroyable, false);
            }
            this.#destroyables.clear();
            this.#destroyables = null;
            if (this.container && this.container instanceof Element) {
              this.container.remove();
              this.container = null;
            }
          }
          static #ctxBinds = /* @__PURE__ */ new WeakMap();
          static get(item) {
            return this.#ctxBinds.get(item) || null;
          }
          static bind(item, context) {
            this.#ctxBinds.set(item, context);
          }
        }
        let initialized = false;
        const LS = {
          isWeb: typeof window !== "undefined",
          version: "5.2.9-beta",
          v: 5,
          REMOVE_LISTENER: EventEmitter.REMOVE_LISTENER,
          init(options) {
            if (!this.isWeb) return;
            if (initialized) {
              console.warn("LS has already been initialized, attempt has been ignored.");
              return;
            }
            initialized = true;
            options = LS.Util.defaults({
              globalPrototype: true,
              theme: null,
              accent: null,
              autoScheme: true,
              adaptiveTheme: false,
              globalizeTiny: false
            }, options);
            if (options.globalPrototype) LS.prototypeTiny();
            if (options.theme || options.accent || options.autoScheme || options.autoAccent) {
              const colorOptions = {
                theme: options.theme,
                accent: options.accent,
                autoAccent: options.autoAccent,
                autoScheme: options.autoScheme,
                adaptiveTheme: options.adaptiveTheme
              };
              if (LS.Color) LS.Color.initOptions(colorOptions);
              else LS.__deferedColorOptions = colorOptions;
            }
            if (options.optimizeEvents !== void 0) this.EventEmitter.optimize = !!options.optimizeEvents;
            if (options.globalizeTiny) {
              for (let key in this.Tiny) {
                window[key] = this.Tiny[key];
              }
            }
            if (options.enforceContextSafety === true) {
              const er = (field) => `[Memory Safety Violation] Global access to ${field} is disabled by the site settings. Remember to only use scoped context.${field} in contexts (or LS.Context.global for global access)!`;
              const deny = (field) => ({
                get() {
                  throw new Error(er(field));
                },
                set() {
                  throw new Error(er(field));
                }
              });
              for (const field of options.contextSafetyFields || CONTEXT_FIELDS) {
                if (window[field]) {
                  try {
                    Object.defineProperty(window, field, deny(field));
                  } catch (e) {
                    console.warn(`LS.init: Could not enforce memory safety for ${field}:`, e);
                  }
                }
              }
            }
            this._topLayer = this.Create({ id: "ls-top-layer", style: "position: fixed" });
            LS.once("ready", () => {
              document.body.append(this._topLayer);
            });
            LS._events.quickEmit("init");
          },
          EventEmitter,
          EventHandler: EventEmitter,
          // Backward compatibility
          /**
           * Dynamic utility for creating elements
           * @param {*} tagName Element tag (or options)
           * @param {Array|String|Object} content Content or options
           * @returns Created element
           */
          Create(tagName = "div", content) {
            if (typeof tagName !== "string") {
              content = tagName;
              if (content) {
                tagName = content.tag || content.tagName || "div";
                delete content.tag;
                delete content.tagName;
              } else if (content === null) return null;
            }
            if (!content) return document.createElement(tagName);
            content = typeof content === "string" ? { html: content } : Array.isArray(content) ? { inner: content } : content || {};
            if (content.svg || tagName === "svg" && content.ns === void 0) {
              content.ns = "http://www.w3.org/2000/svg";
            }
            const { class: className, tooltip, ns, inner, content: innerContent, html, text, accent, style, reactive, attr, options, attributes, sanitize, ...rest } = content;
            const element = Object.assign(
              ns ? document.createElementNS(ns, tagName) : document.createElement(tagName),
              rest
            );
            if (tagName.toLowerCase() === "ls-select" && options) {
              element._lsSelectOptions = options;
            }
            if (accent) element.setAttribute("ls-accent", accent);
            if (attr || attributes) LS.TinyFactory.attrAssign.call(element, attr || attributes);
            if (tooltip) {
              if (!LS.Tooltips) {
                element.setAttribute("title", tooltip);
              } else {
                element.setAttribute("ls-tooltip", tooltip);
                LS.Tooltips.updateElement(element);
              }
            }
            if (reactive) {
              if (!LS.Reactive) {
                console.warn("Reactive bindings are not available, please include the Reactive module to use this feature.");
                LS.on("component-loaded", (component) => {
                  if (component.name.toLowerCase() === "reactive") {
                    LS.Reactive.bindElement(element, reactive);
                    return LS.EventEmitter.REMOVE_LISTENER;
                  }
                });
              } else {
                LS.Reactive.bindElement(element, reactive);
              }
            }
            if (className) {
              element.className = Array.isArray(className) ? className.filter(Boolean).join(" ") : className;
            }
            if (typeof style === "string") element.style.cssText = style;
            else if (typeof style === "object") LS.TinyFactory.applyStyle.call(element, style);
            const contentToAdd = inner || innerContent;
            if (contentToAdd) {
              element.append(...LS.Util.resolveElements(contentToAdd));
            }
            if (html) {
              if (contentToAdd) {
                console.warn("LS.Create: 'html' is being overriden by inner content. Only use one of: inner, html, or text.");
              } else {
                element.innerHTML = html;
              }
            }
            if (text) {
              if (contentToAdd || html) {
                console.warn("LS.Create: 'text' is being overriden by inner content or html. Only use one of: inner, html, or text.");
              } else {
                element.textContent = text;
              }
            }
            if (sanitize) {
              LS.Util.sanitize(element);
            }
            return element;
          },
          Util: {
            /**
             * https://stackoverflow.com/a/66120819/14541617
             */
            isClass(func) {
              if (!(func && func.constructor === Function) || func.prototype === void 0)
                return false;
              if (Function.prototype !== Object.getPrototypeOf(func))
                return true;
              return Object.getOwnPropertyNames(func.prototype).length > 1;
            },
            /**
             * Gets URL parameters as an object or a specific parameter by name.
             * From my testing, this is 8x faster than URLSearchParams for all parameters and 11x faster to get a single parameter.
             * Meaning that for most usecases where duplicate keys are not a concern, this is almost always faster and likely cleaner.
             * https://jsbm.dev/XMZyoeowQqoPm
             * 
             * @param {string|null} getOne Name of the parameter to get, or null to get all parameters as an object.
             * @param {string} baseUrl URL or search string to parse, defaults to current location's search string.
             * @returns {object|string|null} Object with all parameters, specific parameter value, or null if not found.
             * 
             * @example LS.Util.parseURLParams(location.search, "q");
             * @example LS.Util.parseURLParams().q;
             */
            parseURLParams(baseUrl = typeof location !== "undefined" ? location.search : "", getOne = null) {
              const index = baseUrl.indexOf("?");
              const url = baseUrl.slice(index + 1);
              if (!url.length) {
                return getOne ? null : {};
              }
              let i = 0, vi = 0, cparam = null, result = getOne ? null : {};
              for (; i < url.length; i++) {
                const char = url.charCodeAt(i);
                const atEnd = i === url.length - 1;
                const isDelimiter = char === 61 || char === 38 || char === 35;
                if (isDelimiter || atEnd) {
                  const sliceEnd = atEnd && !isDelimiter ? i + 1 : i;
                  const param = url.slice(vi, sliceEnd);
                  if ((char === 38 || atEnd && !isDelimiter || char === 35) && cparam !== null) {
                    const value = decodeURIComponent(param);
                    if (getOne && cparam === getOne) return value;
                    if (!getOne) result[cparam] = value;
                    cparam = null;
                    vi = i + 1;
                    if (char === 35) break;
                    continue;
                  }
                  if (param.length !== 0) {
                    if (!getOne) result[param] = "";
                    cparam = param;
                    vi = i + 1;
                  }
                  if (char === 35) {
                    break;
                  }
                }
              }
              return getOne ? null : result;
            },
            /**
             * The same as LS.Util.parseURLParams but with parameters reversed for backward compatibility.
             * @deprecated
             */
            params(get = null, baseUrl = typeof location !== "undefined" ? location.search : "") {
              return LS.Util.parseURLParams(baseUrl, get);
            },
            /**
             * Iterates over an iterable object and builds an array with the results of the provided function.
             * Equivalent to Array.prototype.map but works on anything that is iterable.
             * @deprecated
             */
            map(it, fn) {
              const r = [];
              for (let i = 0; i < it.length; i++) {
                r.push(fn(it[i], i));
              }
              return r;
            },
            resolveElements(...array) {
              return array.flat().filter(Boolean).map((element) => {
                return typeof element === "string" ? document.createTextNode(element) : typeof element === "object" && !(element instanceof Node) ? LS.Create(element) : element;
              });
            },
            /**
             * Deep-clones an Object/Set/Map/Array with filtering support, faster than structuredClone and apparently even the klona library.
             * Very experimental - may not always be reliable for complex objects and as of now ignores functions and prototypes (maybe I'll expand it later).
             * I recommend to use only on relatively simple/predictable objects.
             * https://jsbm.dev/wFkz6UCGJevxw
             * 
             * @param {*} obj Object to clone
             * @returns Cloned object
             * @experimental
             */
            clone(obj, filter) {
              if (typeof obj !== "object" || obj === null || obj === void 0) return obj;
              const mkClone = LS.Util.clone;
              if (Array.isArray(obj)) {
                const len = obj.length;
                if (len === 0) return [];
                if (len === 1) return [mkClone(obj[0], filter)];
                const a = [];
                for (let i = 0; i < len; i++) {
                  a.push(mkClone(obj[i], filter));
                }
                return a;
              }
              if (obj.constructor === Map) {
                const m = /* @__PURE__ */ new Map();
                for (const [key, value] of obj) {
                  m.set(key, mkClone(value, filter));
                }
                return m;
              }
              if (obj.constructor === Set) {
                const s = /* @__PURE__ */ new Set();
                for (const value of obj) {
                  s.add(mkClone(value, filter));
                }
                return s;
              }
              if (obj.constructor === DataView) return new obj.constructor(mkClone(obj.buffer, filter), obj.byteOffset, obj.byteLength);
              if (obj.constructor === ArrayBuffer) return obj.slice(0);
              if (obj.constructor === Date) return new Date(obj);
              if (obj.constructor === RegExp) return new RegExp(obj);
              const clone = {};
              const keys = Object.getOwnPropertyNames(obj);
              const klen = keys.length;
              if (klen === 0) return clone;
              if (typeof filter === "function") {
                for (let i = 0; i < klen; i++) {
                  const k = keys[i];
                  if (filter(k, obj[k]) === void 0) continue;
                  clone[k] = mkClone(obj[k], filter);
                }
              } else {
                for (let i = 0; i < klen; i++) {
                  const k = keys[i];
                  clone[k] = mkClone(obj[k], filter);
                }
              }
              return clone;
            },
            /**
             * TouchHandle API; fast, powerful and very useful for any kind of UI where a mouse drag motion happens.
             * Compatible with any pointer type, pointerLock, and reliably handles browser setup.
             */
            TouchHandle: class TouchHandle extends EventEmitter {
              constructor(element, options = {}) {
                super();
                this.options = {
                  buttons: [0, 1, 2],
                  disablePointerEvents: true,
                  frameTimed: false,
                  legacyEvents: false,
                  ...options
                };
                this.targets = /* @__PURE__ */ new Set();
                this.activeTarget = null;
                if (element) this.addTarget(element && LS.Tiny.O(element));
                if (Array.isArray(this.options.targets)) {
                  for (const t of this.options.targets) this.addTarget(t);
                }
                this._cursor = this.options.cursor || null;
                this.seeking = false;
                this.attached = false;
                this.pointerLockSet = false;
                this.pointerLockActive = false;
                this.pointerLockPreviousX = 0;
                this.pointerLockPreviousY = 0;
                this.dragTarget = null;
                this.frameQueued = false;
                this.latestMoveEvent = null;
                this.activePointerId = null;
                this._moveEventRef = this.prepareEvent("move");
                this.prepareEvent("start", { deopt: true });
                this.prepareEvent("end", { deopt: true });
                this.onStart = this.onStart.bind(this);
                this.onMove = this.onMove.bind(this);
                this.onRelease = this.onRelease.bind(this);
                this.cancel = this.cancel.bind(this);
                this.onPointerLockChange = this.onPointerLockChange.bind(this);
                this.frameHandler = this.frameHandler.bind(this);
                this._eventData = {
                  x: 0,
                  y: 0,
                  dx: 0,
                  dy: 0,
                  offsetX: 0,
                  offsetY: 0,
                  startX: 0,
                  startY: 0,
                  cancel: this.cancel,
                  isTouch: false,
                  cancelled: false,
                  domEvent: null
                };
                this.attach();
              }
              addTarget(target) {
                if (!target || this.targets.has(target)) return;
                this.targets.add(target);
                if (this.attached) this.#attachTargetListeners(target);
              }
              removeTarget(target) {
                if (!target || !this.targets.has(target)) return;
                this.targets.delete(target);
                this.#detachTargetListeners(target);
                if (this.activeTarget === target) this.activeTarget = null;
              }
              clearTargets() {
                for (const el of this.targets) this.#detachTargetListeners(el);
                this.targets.clear();
                this.activeTarget = null;
              }
              #attachTargetListeners(target) {
                target.addEventListener("pointerdown", this.onStart, { passive: false });
                target.style.touchAction = "none";
                target.style.userSelect = "none";
                target.classList.add("ls-draggable");
                if (this.options.startEvents) {
                  for (const evt of this.options.startEvents) {
                    target.addEventListener(evt, this.onStart);
                  }
                }
              }
              #detachTargetListeners(target) {
                target.removeEventListener("pointerdown", this.onStart);
                target.style.touchAction = "";
                target.style.userSelect = "";
                target.classList.remove("ls-draggable");
                if (this.options.startEvents) {
                  for (const evt of this.options.startEvents) {
                    target.removeEventListener(evt, this.onStart);
                  }
                }
              }
              attach() {
                if (this.attached) return;
                for (const target of this.targets) this.#attachTargetListeners(target);
                document.addEventListener("pointercancel", this.onRelease);
                if (this.options.pointerLock) {
                  document.addEventListener("pointerlockchange", this.onPointerLockChange);
                  this.pointerLockSet = true;
                }
                this.attached = true;
              }
              detach(destroying = false) {
                if (this.attached) {
                  this.onRelease(destroying ? { type: "destroy" } : {});
                  document.removeEventListener("pointercancel", this.onRelease);
                  for (const target of this.targets) {
                    this.#detachTargetListeners(target);
                  }
                  if (this.options.pointerLock) {
                    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
                  }
                  this.attached = false;
                }
              }
              get cursor() {
                return this._cursor;
              }
              set cursor(value) {
                this._cursor = value;
                if (this.seeking) {
                  document.documentElement.style.cursor = value || "";
                }
              }
              onStart(event) {
                if (this.options.exclude) {
                  if (typeof this.options.exclude === "string") {
                    if (event.target.matches(this.options.exclude)) return;
                  } else if (event.target !== event.currentTarget) {
                    return;
                  }
                }
                if (event.pointerType === "mouse" && !this.options.buttons.includes(event.button)) return;
                const target = event.currentTarget;
                this.activeTarget = target;
                this.seeking = true;
                this._eventData.cancelled = false;
                const isTouch = event.pointerType === "touch";
                const x = event.clientX;
                const y = event.clientY;
                this.activePointerId = event.pointerId;
                if (this.options.legacyEvents) {
                  this.emit("start", [event, this.cancel, x, y]);
                  if (this.options.onStart) this.options.onStart(event, this.cancel, x, y);
                } else {
                  this._eventData.x = x;
                  this._eventData.y = y;
                  this._eventData.dx = 0;
                  this._eventData.dy = 0;
                  this._eventData.offsetX = 0;
                  this._eventData.offsetY = 0;
                  this._eventData.startX = x;
                  this._eventData.startY = y;
                  this._eventData.domEvent = event;
                  this._eventData.isTouch = isTouch;
                  this.emit("start", [this._eventData]);
                  if (this.options.onStart) this.options.onStart(this._eventData);
                }
                if (this._eventData.cancelled) {
                  this.seeking = false;
                  return;
                }
                if (event.cancelable) event.preventDefault();
                target.classList.add("is-dragging");
                target.setPointerCapture(event.pointerId);
                if (this.options.pointerLock) {
                  if (!this.pointerLockSet) {
                    document.addEventListener("pointerlockchange", this.onPointerLockChange);
                    this.pointerLockSet = true;
                  }
                  if (!isTouch) {
                    this.pointerLockPreviousX = event.clientX;
                    this.pointerLockPreviousY = event.clientY;
                    target.requestPointerLock();
                  }
                } else if (this.pointerLockSet) {
                  document.removeEventListener("pointerlockchange", this.onPointerLockChange);
                  this.pointerLockSet = false;
                }
                this.dragTarget = event.target;
                this.dragTarget.classList.add("ls-drag-target");
                const docEl = document.documentElement;
                docEl.classList.add("ls-dragging");
                if (this.options.disablePointerEvents) docEl.style.pointerEvents = "none";
                if (!docEl.style.cursor) docEl.style.cursor = this._cursor || "grab";
                document.addEventListener("pointermove", this.onMove);
                document.addEventListener("pointerup", this.onRelease);
              }
              onMove(event) {
                if (this._eventData.cancelled || event.pointerId !== this.activePointerId) return;
                if (this.options.frameTimed) {
                  this.latestMoveEvent = event;
                  if (!this.frameQueued) {
                    this.frameQueued = true;
                    LS.Context.requestAnimationFrame(this.frameHandler);
                  }
                  return;
                }
                this.processMove(event);
              }
              frameHandler() {
                this.frameQueued = false;
                if (this.latestMoveEvent) {
                  this.processMove(this.latestMoveEvent);
                  this.latestMoveEvent = null;
                }
              }
              processMove(event) {
                const isTouch = event.pointerType === "touch";
                if (!isTouch && event.cancelable) event.preventDefault();
                let x, y;
                const prevX = this._eventData.x;
                const prevY = this._eventData.y;
                if (!this.pointerLockActive) {
                  x = event.clientX;
                  y = event.clientY;
                }
                if (this.options.pointerLock) {
                  if (this.pointerLockActive) {
                    x = this.pointerLockPreviousX += !isNaN(event.movementX) ? event.movementX : 0;
                    y = this.pointerLockPreviousY += !isNaN(event.movementY) ? event.movementY : 0;
                  } else if (isTouch) {
                    event.movementX = Math.round(x - this.pointerLockPreviousX);
                    event.movementY = Math.round(y - this.pointerLockPreviousY);
                    this.pointerLockPreviousX = x;
                    this.pointerLockPreviousY = y;
                  }
                }
                if (this.options.legacyEvents) {
                  if (this.options.onMove) this.options.onMove(x, y, event, this.cancel);
                  this.quickEmit(this._moveEventRef, x, y, event, this.cancel);
                } else {
                  this._eventData.dx = x - prevX;
                  this._eventData.dy = y - prevY;
                  this._eventData.offsetX = x - this._eventData.startX;
                  this._eventData.offsetY = y - this._eventData.startY;
                  this._eventData.x = x;
                  this._eventData.y = y;
                  this._eventData.domEvent = event;
                  this._eventData.isTouch = isTouch;
                  if (this.options.onMove) this.options.onMove(this._eventData);
                  this.quickEmit(this._moveEventRef, this._eventData);
                }
              }
              onRelease(event) {
                this.cleanupDragState();
                const isDestroy = event.type === "destroy";
                if (this.options.legacyEvents) {
                  this.emit(isDestroy ? "destroy" : "end", [event]);
                } else {
                  this._eventData.domEvent = event;
                  this.emit(isDestroy ? "destroy" : "end", [this._eventData]);
                }
                if (this.pointerLockActive) {
                  document.exitPointerLock();
                }
                if (isDestroy) {
                  if (this.options.onDestroy) {
                    if (this.options.legacyEvents) {
                      this.options.onDestroy(event);
                    } else {
                      this.options.onDestroy(this._eventData);
                    }
                  }
                } else if (this.options.onEnd) {
                  if (this.options.legacyEvents) {
                    this.options.onEnd(event);
                  } else {
                    this.options.onEnd(this._eventData);
                  }
                }
                const captureTarget = this.activeTarget;
                if (captureTarget && typeof event.pointerId === "number" && captureTarget.hasPointerCapture(event.pointerId)) {
                  captureTarget.releasePointerCapture(event.pointerId);
                }
                this._eventData.domEvent = null;
              }
              onPointerLockChange() {
                const lockEl = document.pointerLockElement;
                this.pointerLockActive = !!lockEl && lockEl === this.activeTarget;
              }
              cancel() {
                this._eventData.cancelled = true;
              }
              cleanupDragState() {
                this.seeking = false;
                this._eventData.cancelled = false;
                this.frameQueued = false;
                this.latestMoveEvent = null;
                if (this.activeTarget) {
                  this.activeTarget.classList.remove("is-dragging");
                }
                if (this.dragTarget) {
                  this.dragTarget.classList.remove("ls-drag-target");
                  this.dragTarget = null;
                }
                const docEl = document.documentElement;
                docEl.classList.remove("ls-dragging");
                docEl.style.pointerEvents = "";
                docEl.style.cursor = "";
                this.activeTarget = null;
                document.removeEventListener("pointermove", this.onMove);
                document.removeEventListener("pointerup", this.onRelease);
              }
              destroy() {
                if (this.destroyed) return false;
                this.detach(true);
                this.clearTargets();
                this._moveEventRef = null;
                super.destroy();
                this.options = null;
                this._eventData = null;
                this.destroyed = true;
                return true;
              }
            },
            // These methods are slow (~5x compared to spread), but primarily exist because the spread operator doesn't copy property descriptors & disconnects the original object.
            // Something like native template objects would be nice 🤔
            defaults(defaults, target = {}) {
              if (typeof target !== "object") throw "The target must be an object";
              for (const key of Object.keys(defaults)) {
                if (!(key in target)) {
                  Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(defaults, key));
                }
              }
              return target;
            },
            // Could be optimized further
            staticDefaults(defaults) {
              const cache = Object.keys(defaults).map((key) => [
                key,
                Object.getOwnPropertyDescriptor(defaults, key)
              ]);
              return function(target) {
                if (typeof target !== "object") throw "The target must be an object";
                for (const [key, descriptor] of cache) {
                  if (!(key in target)) {
                    if (typeof descriptor.value === "object" && descriptor.value !== null) {
                      descriptor = { ...descriptor, value: LS.Util.clone(descriptor.value) };
                    }
                    Object.defineProperty(target, key, descriptor);
                  }
                }
                return target;
              };
            },
            /**
             * Copies text to the clipboard on any browser.
             * @param {*} text 
             * @returns {Promise}
             */
            copy(text) {
              return new Promise((resolve) => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text).then(() => {
                    resolve();
                  }).catch((error) => {
                    resolve(error);
                  });
                } else {
                  let temp = document.createElement("textarea");
                  temp.value = text;
                  document.body.appendChild(temp);
                  temp.select();
                  document.execCommand("copy");
                  document.body.removeChild(temp);
                  resolve();
                }
              });
            },
            // Allowlist of harmless tags in sanitize(): i, b, strong, kbd, code, pre, em, u, s, mark, small, sub, sup, br, span
            allowedTags: ["I", "B", "STRONG", "KBD", "CODE", "PRE", "EM", "U", "S", "MARK", "SMALL", "SUB", "SUP", "BR", "SPAN"],
            /**
             * Sanitize a node, stripping all elements not on an allowlist, and removes all attributes.
             * @param {*} node
             * 
             * @example
             * const dangerous = LS.Create({ html: "<script>console.log('Unsafe HTML')</script>" });
             * LS.Util.sanitize(dangerous); // Removes <script>
             * 
             * @example
             * // This can also be done directly when creating:
             * LS.Create("span", { html: "..unsafe html..", sanitize: true })
             */
            sanitize(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (!LS.Util.allowedTags.includes(node.tagName)) {
                  const fragment = document.createDocumentFragment();
                  while (node.firstChild) {
                    fragment.appendChild(node.firstChild);
                  }
                  if (node.parentNode) {
                    node.parentNode.replaceChild(fragment, node);
                  }
                  return;
                }
              }
              while (node.attributes && node.attributes.length > 0) {
                node.removeAttribute(node.attributes[0].name);
              }
              let child = node.firstChild;
              while (child) {
                const next = child.nextSibling;
                this.sanitize(child);
                child = next;
              }
            },
            normalize(string, space = " ") {
              return string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, space).trim();
            },
            /**
             * A simple switch that triggers a callback when its value changes, but does nothing if it doesn't.
             */
            Switch: class Switch {
              constructor(onSet) {
                this.value = false;
                this.onSet = onSet;
              }
              set(value) {
                if (this.value === value) return;
                this.value = value;
                this.onSet(this.value);
              }
              on() {
                this.set(true);
              }
              off() {
                this.set(false);
              }
              toggle() {
                this.set(!this.value);
              }
              destroy() {
                this.onSet = null;
                this.value = null;
              }
            },
            /**
             * A switch between two elements, showing one and hiding the other.
             * Useful for loading indicators for example
             */
            ElementSwitch: class ElementSwitch {
              constructor(element1 = null, element2 = null, options = null) {
                this.elements = Array.isArray(element1) ? element1 : element1 instanceof NodeList ? Array.from(element1) : [element1, element2];
                this.options = LS.Util.defaults({
                  initial: 0,
                  mode: "display",
                  parent: null,
                  onSet: null
                }, options || {});
                if (this.options.mode === "dom" && !this.options.parent) {
                  throw new Error("ElementSwitch in 'dom' mode requires a parent element in options.parent");
                }
                this.value = -1;
                if (this.options.initial > -1) this.set(this.options.initial);
              }
              front() {
                this.set(this.elements.length - 1);
              }
              back() {
                this.set(0);
              }
              get frontElement() {
                return this.elements[this.elements.length - 1];
              }
              get backElement() {
                return this.elements[0];
              }
              toggle() {
                this.set(this.value === 0 ? 1 : 0);
              }
              set(index) {
                if (this.value === index) return;
                this.value = index;
                if (this.options.mode === "dom" && this.options.parent) {
                  for (let i = 0; i < this.elements.length; i++) {
                    if (!this.elements[i]) continue;
                    if (i === index) {
                      this.options.parent.appendChild(this.elements[i]);
                    } else {
                      this.elements[i].remove();
                    }
                  }
                } else {
                  for (let i = 0; i < this.elements.length; i++) {
                    if (this.elements[i]) this.elements[i].style[this.options.mode === "display" ? "display" : "visibility"] = i === index ? "" : this.options.mode === "display" ? "none" : "hidden";
                  }
                }
                if (this.options.onSet) this.options.onSet(this.value);
              }
              destroy() {
                for (let i = 0; i < this.elements.length; i++) {
                  this.elements[i]?.remove();
                  this.elements[i] = null;
                }
                this.elements = null;
                this.value = null;
                this.options = null;
              }
            },
            /**
             * Schedules a callback to run on the next animation frame, avoiding multiple calls within the same frame.
             * Also has an "active" mode and FPS limit and time sync options.
             * 
             * In passive mode (default), you call schedule() whenever.
             * In active mode (start/stop methods), it works like a ticker.
             */
            FrameScheduler: class FrameScheduler {
              /**
               * @param {Function} callback - The function to call on each frame.
               * @param {Object} [options] - Optional settings.
               * @param {number} [options.limiter] - Minimum ms between frames (rate limit).
               * @param {boolean} [options.deltaTime] - If true, pass delta time to callback.
               * @param {number} [options.speed] - Playback speed multiplier (default: 1).
               */
              constructor(callback, options = {}) {
                this.callback = callback;
                this.queued = false;
                this.running = false;
                this.limiter = options.limiter || null;
                this.deltaTime = options.deltaTime || false;
                this.speed = options.speed ?? 1;
                this._lastFrame = 0;
                this._rafId = null;
                if (this.deltaTime) this._prevTimestamp = null;
              }
              #frame = (timestamp) => {
                if (this.limiter) {
                  if (timestamp - this._lastFrame < this.limiter) {
                    this._rafId = LS.Context.requestAnimationFrame(this.#frame);
                    return;
                  }
                  this._lastFrame = timestamp;
                }
                this.queued = false;
                if (this.callback) {
                  if (this.running && this.deltaTime) {
                    const delta = this._prevTimestamp !== null ? (timestamp - this._prevTimestamp) * this.speed : 0;
                    this._prevTimestamp = timestamp;
                    this.callback(delta, timestamp);
                  } else if (this.deltaTime) {
                    this.callback(0, timestamp);
                  } else {
                    this.callback(timestamp);
                  }
                }
                if (this.running) this.schedule();
              };
              limitFPS(fps) {
                this.limiter = fps > 0 ? 1e3 / fps : null;
              }
              removeLimiter() {
                this.limiter = null;
              }
              setSpeed(multiplier) {
                this.speed = multiplier;
              }
              start() {
                if (this.running) return;
                this.running = true;
                if (this.deltaTime) this._prevTimestamp = null;
                this.schedule();
              }
              stop() {
                this.running = false;
                this.cancel();
              }
              schedule() {
                if (this.queued) return;
                this.queued = true;
                this._rafId = LS.Context.requestAnimationFrame(this.#frame);
              }
              cancel() {
                this.queued = false;
                if (this._rafId) {
                  cancelAnimationFrame(this._rafId);
                  this._rafId = null;
                }
              }
              destroy() {
                this.cancel();
                this.callback = null;
                if (this.deltaTime) this._prevTimestamp = null;
              }
            },
            /**
             * Ensures a callback is only run once.
             * Top 5 useless abstractions
             */
            RunOnce: class RunOnce {
              constructor(callback, runNow = false) {
                this.callback = callback;
                this.hasRun = false;
                if (runNow) return this.run();
              }
              run() {
                if (this.hasRun) return false;
                this.hasRun = true;
                this.callback(...arguments);
                this.callback = null;
                return true;
              }
              bind(context) {
                return this.run.bind(context || this);
              }
            },
            validateUUID(uuid) {
              if (typeof uuid !== "string" || uuid.length !== 36) return false;
              for (let i = 0; i < 36; i++) {
                const c = uuid.charCodeAt(i);
                if (i === 14) {
                  if (c >= 48 && c <= 53) continue;
                } else if (i === 19) {
                  if (c === 56 || c === 57 || c === 97 || c === 98 || c === 65 || c === 66) continue;
                } else if (i === 8 || i === 13 || i === 18 || i === 23 ? c === 45 : c >= 48 && c <= 57 || // 0-9
                c >= 97 && c <= 102 || // a-f
                c >= 65 && c <= 70) {
                  continue;
                }
                return false;
              }
              return true;
            },
            /**
             * Fast utilities for optimization
             * They must remain simple & best-case as much as possible as to be safely relied on
             */
            fast: {
              /**
               * Convert a hexadecimal character to its integer value (0-15), or -1 if it's not a valid hex character.
               * @param {*} h ASCII code of the character (e.g. from charCodeAt)
               * @returns {number} Integer value of the hex character, or -1 if invalid
               */
              // "(c > 57? c + 9: c) & 15" is technically faster (~20%) but doesn't handle invalid characters; it's not worth the tradeoff
              h2i: (c) => c >= 48 && c <= 57 ? c - 48 : c >= 97 && c <= 102 ? c - 87 : c >= 65 && c <= 70 ? c - 55 : -1,
              twoh2i: (high, low) => LS.Util.fast.h2i(high) << 4 | LS.Util.fast.h2i(low)
            }
          },
          /**
           * Note: Tiny is deprecated since 5.3.0
           * It is not going to be removed as of now, but there are now more modern approaches in LS.
           * @deprecated
           */
          Tiny: {
            /**
             * Element selector utility
             */
            Q(selector, subSelector, one = false) {
              if (!selector) return LS.TinyWrap(one ? null : []);
              const isElement = selector instanceof Element;
              const target = isElement ? selector : document;
              if (isElement && !subSelector) return one ? selector : [selector];
              const actualSelector = isElement ? subSelector || "*" : selector || "*";
              let elements = one ? target.querySelector(actualSelector) : target.querySelectorAll(actualSelector);
              return elements;
            },
            /**
             * Single element selector
             */
            O(selector, subSelector) {
              if (!selector) selector = document.body;
              return LS.Tiny.Q(selector, subSelector, true);
            },
            /**
             * Element builder utility
             * Replaced by LS.Create
             */
            N: null,
            // Defined later by LS.Create for backward compatibility
            /**
             * @deprecated
             */
            M: {
              _GlobalID: {
                count: 0,
                prefix: Math.round(Math.random() * 1e3).toString(36) + Math.round(Math.random() * 1e3).toString(36)
              },
              ShiftDown: false,
              ControlDown: false,
              lastKey: null,
              on(...events) {
                let fn = events.find((event) => typeof event === "function");
                for (const event of events) {
                  if (typeof event !== "string") continue;
                  window.addEventListener(event, fn);
                }
                return LS.Tiny.M;
              },
              get GlobalID() {
                LS.Tiny.M._GlobalID.count++;
                return `${Date.now().toString(36)}-${LS.Tiny.M._GlobalID.count.toString(36)}-${LS.Tiny.M._GlobalID.prefix}`;
              },
              uid() {
                return LS.Tiny.M.GlobalID + "-" + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
              }
            },
            _prototyped: false
          },
          /**
           * @deprecated
           */
          TinyWrap(elements) {
            if (!elements) return null;
            if (LS.Tiny._prototyped) return elements;
            function wrap(element) {
              return element._lsWrapped || (element._lsWrapped = new Proxy(element, {
                get(target, key) {
                  return LS.TinyFactory[key] || target[key];
                },
                set(target, key, value) {
                  return target[key] = value;
                }
              }));
            }
            return Array.isArray(elements) ? elements.map(wrap) : wrap(elements);
          },
          /**
           * TinyFactory (utilities for HTML elements)
           * @deprecated
           */
          TinyFactory: {
            isElement: true,
            /**
             * Get, set or get all attributes of the element.
             * @param {*} get Attribute name to get
             * @param {*} set Value to set
             * @returns {string|Object|HTMLElement}
             * @deprecated
             */
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
            /**
             * Assign multiple attributes to the element.
             * @param {Object|string|string[]} attributes Attributes to assign
             * @return {HTMLElement} The element itself for chaining
             * @deprecated
             */
            attrAssign(attributes) {
              if (typeof attributes === "string") {
                this.setAttribute(attributes, "");
                return this;
              } else if (Array.isArray(attributes)) {
                for (const attr of attributes) {
                  if (typeof attr === "object") {
                    this.attrAssign(attr);
                  } else if (attr) {
                    this.setAttribute(attr, "");
                  }
                }
                return this;
              }
              for (const [key, value] of Object.entries(attributes)) {
                this.setAttribute(key, value || "");
              }
              return this;
            },
            /**
             * Removes one or more attributes from the element.
             * @deprecated
             */
            delAttr(...attributes) {
              attributes = attributes.flat(2);
              attributes.forEach((attribute) => this.removeAttribute(attribute));
              return this;
            },
            /**
             * Adds, removes or toggles class name/s on the element.
             * @param {string|string[]} names Class name/s to add, remove or toggle
             * @param {number|string} [action=1] Action to perform: 1 or "add" to add, 0 or "remove" to remove, 2 or "toggle" to toggle
             * @return {HTMLElement} The element itself for chaining
             * @deprecated
             */
            class(names, action = 1) {
              if (typeof names == "undefined") return this;
              action = action == "add" || !!action && action !== "remove" ? action == 2 || action == "toggle" ? "toggle" : "add" : "remove";
              for (let className of typeof names === "string" ? names.split(" ") : names) {
                if (typeof className !== "string" || className.length < 1) continue;
                this.classList[action](className);
              }
              return this;
            },
            /**
             * Checks if the element has the specified class name/s.
             * @param  {...any} names Class names to check
             * @returns 
             */
            hasClass(...names) {
              if (names.length === 0) return false;
              if (names.length === 1) return this.classList.contains(names[0]);
              for (const name of names.flat()) {
                if (!this.classList.contains(name)) return false;
              }
              return true;
            },
            /**
             * Selects a single matching element within this element.
             * @param {*} selector
             * @deprecated
             */
            get(selector = "*") {
              return LS.Tiny.O(this, selector);
            },
            /**
             * Selects all matching elements within this element.
             * @param {*} selector
             * @deprecated
             */
            getAll(selector = "*") {
              return LS.Tiny.Q(this, selector);
            },
            /**
             * Adds elements to this element with the element DSL.
             * @param  {...any} elements Elements to add
             * @deprecated
             */
            add(...elements) {
              this.append(...LS.Util.resolveElements(...elements));
              return this;
            },
            /**
             * Adds element(s) before this element and returns itself.
             */
            addBefore(target) {
              LS.Util.resolveElements(target).forEach((element) => this.parentNode.insertBefore(element, this));
              return this;
            },
            /**
             * Adds element(s) after this element and returns itself.
             */
            addAfter(target) {
              LS.Util.resolveElements(target).forEach((element) => this.parentNode.insertBefore(element, this.nextSibling));
              return this;
            },
            /**
             * Adds element to another element and returns itself.
             * Useful shorthand eg. when you are defaulting to a new element (eg. existingElement || LS.Create().addTo(parent))
             * @param {*} element
             * @returns this
             */
            addTo(element) {
              LS.Tiny.O(element).add(this);
              return this;
            },
            /**
             * Wraps this element inside another element and returns the wrapper.
             * @deprecated
             */
            wrapIn(element) {
              this.addAfter(LS.Tiny.O(element));
              element.appendChild(this);
              return this;
            },
            /**
             * Checks if the element is currently in the viewport.
             * @returns {boolean}
             * @deprecated
             */
            isInView() {
              var rect = this.getBoundingClientRect();
              return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.left < (window.innerWidth || document.documentElement.clientWidth) && rect.bottom > 0 && rect.right > 0;
            },
            /**
             * Checks if the entire element is currently in the viewport.
             * @returns {boolean}
             * @deprecated
             */
            isEntirelyInView() {
              var rect = this.getBoundingClientRect();
              return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
            },
            /**
             * Adds any number of event listeners to the element.
             * @param  {...any} events Event names followed by the callback function
             * @deprecated
             */
            on(...events) {
              let func = events.find((e) => typeof e == "function");
              for (const evt of events) {
                if (typeof evt != "string") continue;
                this.addEventListener(evt, func);
              }
              return this;
            },
            /**
             * Removes event listeners from the element.
             * @deprecated
             */
            off(...events) {
              let func = events.find((e) => typeof e == "function");
              for (const evt of events) {
                if (typeof evt != "string") continue;
                this.removeEventListener(evt, func);
              }
              return this;
            },
            applyStyle(rules) {
              if (typeof rules !== "object") throw new Error('First attribute of "applyStyle" must be an object');
              for (let rule in rules) {
                if (!rules.hasOwnProperty(rule)) continue;
                let value = rules[rule];
                if (!rule.startsWith("--")) rule = rule.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
                this.style.setProperty(rule, value);
              }
            },
            /**
             * @deprecated
             */
            clear() {
              console.error("Warning: TinyFactory.clear() is deprecated, please avoid it.");
              this.innerHTML = "";
              return this;
            }
          },
          prototypeTiny() {
            if (LS.Tiny._prototyped) return;
            LS.Tiny._prototyped = true;
            console.debug("Warning: TinyFactory has been prototyped globally to all HTML elements. You can now use all its featuers seamlessly. Beware that this may conflict with other libraries or future changes or cause confusion, please use with caution!");
            Object.assign(HTMLElement.prototype, LS.TinyFactory);
          },
          /**
           * A global modal escape stack.
           * @experimental New
           */
          Stack: class Stack {
            static {
              this.items = [];
            }
            static _init() {
              if (this.container) return;
              window.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                  this.pop();
                }
              });
              this.container = LS.Create({
                class: "ls-modal-layer level-1"
              });
              this.container.addEventListener("click", (event) => {
                if (event.target === this.container && LS.Stack.length > 0 && LS.Stack.top.canClickAway !== false) {
                  LS.Stack.pop();
                }
              });
              LS.once("ready", () => {
                LS._topLayer.add(this.container);
              });
            }
            static push(item) {
              if (this.items.indexOf(item) !== -1) {
                this.remove(item);
              }
              if (item.hasShade) {
                this.container.classList.add("is-open");
              }
              this.items.push(item);
              return item;
            }
            static pop() {
              if (this.items.length === 0) return null;
              const item = this.top;
              if (item && item.isCloseable !== false) {
                item.close?.();
              }
              return item;
            }
            static remove(item) {
              const index = this.items.indexOf(item);
              if (index > -1) {
                this.items.splice(index, 1);
              }
              if (this.items.length === 0 || !this.items.some((i) => i.hasShade)) {
                this.container.classList.remove("is-open");
              }
            }
            static indexOf(item) {
              return this.items.indexOf(item);
            }
            static get length() {
              return this.items.length;
            }
            static get top() {
              return this.items[this.items.length - 1] || null;
            }
          },
          StackItem: class StackItem {
            constructor(modal) {
              this.ref = modal;
            }
            get zIndex() {
              return LS.Stack.indexOf(this);
            }
            close() {
              LS.Stack.remove(this);
              if (this.ref && this.ref.close) {
                this.ref.close();
              }
            }
          },
          /**
           * @concept
           * @experimental Direction undecided, so far an abstract concept
           */
          Context,
          toNode(expr) {
            if (typeof expr === "string") {
              return document.createTextNode(expr);
            }
            if (!expr) {
              return null;
            }
            if (expr instanceof Node) {
              return expr;
            }
            return LS.Create(expr);
          },
          // Legacy alias
          __dynamicInnerToNode: function(expr) {
            return this.toNode(expr);
          },
          components: /* @__PURE__ */ new Map(),
          Component: class Component extends EventEmitter {
            constructor() {
              super();
              this.__check();
            }
            /**
             * Memory safety feature;
             * Allows components to be bound to a context
             */
            get ctx() {
              return LS.Context.get(this) || LS.Context.global;
            }
            __check() {
              if (!this._component || !LS.components.has(this._component.name)) {
                throw new Error("This class has to be extended and loaded as a component with LS.LoadComponent.");
              }
              if (this.init) this.init();
            }
            destroy() {
              console.warn(`[LS] Component ${this._component.name} does not implement destroy method!`);
              this.events.clear();
              return false;
            }
          },
          DestroyableComponent: class DestroyableComponent extends Context {
            constructor() {
              super();
              LS.Component.prototype.__check.call(this);
            }
            get ctx() {
              return this;
            }
            destroy() {
              super.destroy();
              if (this._component.singular) {
                this._component.instance.destroyed = true;
                LS.UnregisterComponent(this._component.name);
              }
            }
          },
          LoadComponent(componentClass, options = {}) {
            const name = (options.name || componentClass.name).toLowerCase();
            if (LS.components.has(name)) {
              console.warn(`[LS] Duplicate component name ${name}, ignored!`);
              return;
            }
            const component = {
              isConstructor: typeof componentClass === "function",
              class: componentClass,
              metadata: options.metadata,
              global: !!options.global,
              hasEvents: options.events !== false,
              singular: !!options.singular,
              name
            };
            if (!component.isConstructor) {
              Object.setPrototypeOf(componentClass, LS.Component.prototype);
              componentClass._component = component;
              if (component.hasEvents) {
                LS.EventEmitter.prepareHandler(componentClass);
              }
            } else {
              componentClass.prototype._component = component;
            }
            LS.components.set(name, component);
            if (component.global) {
              LS[options.name] = options.singular && component.isConstructor ? component.instance = new componentClass() : componentClass;
            }
            LS.emit("component-loaded", [component]);
            return component;
          },
          GetComponent(name) {
            return LS.components.get(name.toLowerCase());
          },
          UnregisterComponent(name) {
            name = name.toLowerCase();
            const component = LS.components.get(name);
            if (!component) return false;
            if (component.instance && !component.instance.destroyed) {
              const destroyMethod = component.isConstructor ? component.instance.destroy : component.class.destroy;
              if (typeof destroyMethod === "function") {
                destroyMethod.call(component.instance);
              } else {
                console.warn(`[LS] Component ${name} does not implement destroy method!`);
              }
            }
            if (component.global) {
              delete LS[name];
            }
            LS.components.delete(name);
            LS.emit("component-unloaded", [component]);
            return true;
          }
        };
        LS.Context.global = new LS.Context();
        LS._events = LS.Context.global;
        ["emit", "quickEmit", "on", "once", "off"].forEach((method) => {
          LS[method] = LS.Context.global[method].bind(LS.Context.global);
        });
        if (LS.isWeb) {
          for (const field of CONTEXT_FIELDS) {
            const ref = window[field];
            if (LS.Util.isClass(ref)) {
              Context[field] = function() {
                return new ref(...arguments);
              };
            } else {
              Context[field] = function() {
                return ref(...arguments);
              };
            }
          }
          LS.SelectAll = LS.Tiny.Q;
          LS.Select = LS.Tiny.O;
          LS.Misc = LS.Tiny.M;
          LS.Tiny.N = LS.Create;
          LS.Stack._init();
          window.addEventListener("keydown", (event) => {
            LS.Tiny.M.lastKey = event.key;
            if (event.key == "Shift") LS.Tiny.M.ShiftDown = true;
            if (event.key == "Control") LS.Tiny.M.ControlDown = true;
          });
          window.addEventListener("keyup", (event) => {
            LS.Tiny.M.lastKey = event.key;
            if (event.key == "Shift") LS.Tiny.M.ShiftDown = false;
            if (event.key == "Control") LS.Tiny.M.ControlDown = false;
          });
          window.addEventListener("mousedown", () => LS.Tiny.M.mouseDown = true);
          window.addEventListener("mouseup", () => LS.Tiny.M.mouseDown = false);
        }
        return LS;
      });
      (() => {
        const transforms = {
          up: "translateY(10px)",
          down: "translateY(-10px)",
          left: "translateX(10px)",
          right: "translateX(-10px)",
          forward: "scale(1.1)",
          backward: "scale(0.9)"
        };
        const activeAnimations = /* @__PURE__ */ new WeakMap();
        LS.LoadComponent({
          DEFAULT_DURATION: 450,
          DEFAULT_EASING: "linear(0, 0.0018, 0.007 1.17%, 0.0334, 0.0758, 0.1306 5.54%, 0.2505 8.16%, 0.6477 16.03%, 0.7622 18.65%, 0.8498, 0.9229 23.32%, 0.9878 25.94%, 1.0308 28.27%, 1.0643 30.9%, 1.0791, 1.0886 34.39%, 1.094, 1.0944 38.48%, 1.0903 40.81%, 1.0814 43.43%, 1.0362 53.05%, 1.0184 57.42%, 1.0059, 0.9976 65.58%, 0.9925 70.25%, 0.991 75.79%, 0.9996 99.98%)",
          // Users should have the choice to turn this setting on/off per-site.
          get prefersReducedMotion() {
            const saved = localStorage.getItem("ls-reduced-motion");
            return saved === "true" ? true : saved === "false" ? false : window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
          },
          isRendered(element) {
            if (!element || !element.isConnected) return false;
            if (getComputedStyle(element).display === "none") return false;
            return element.getClientRects().length > 0;
          },
          set prefersReducedMotion(value) {
            if (value === null) {
              localStorage.removeItem("ls-reduced-motion");
            } else {
              localStorage.setItem("ls-reduced-motion", String(!!value));
            }
          },
          _cancelAll(element) {
            if (!element) return;
            element?.getAnimations?.().forEach((anim) => anim.cancel());
            const pending = activeAnimations.get(element);
            if (pending) {
              pending.cancelled = true;
              activeAnimations.delete(element);
            }
          },
          async fadeOut(element, duration = LS.Animation.DEFAULT_DURATION, direction = null, preserveTransform = false) {
            if (!element) return Promise.resolve();
            const options = typeof duration === "object" && duration !== null ? duration : { duration, direction, preserveTransform };
            this._cancelAll(element);
            const tracker = { cancelled: false };
            activeAnimations.set(element, tracker);
            element.classList.add("animating");
            const currentTransform = options.preserveTransform ? getComputedStyle(element).transform : "none";
            const baseTransform = currentTransform === "none" ? "" : currentTransform;
            const directionTransform = options.direction ? transforms[options.direction] || options.direction : "";
            const combinedEndTransform = directionTransform && baseTransform ? `${baseTransform} ${directionTransform}` : directionTransform || baseTransform;
            const animation = element.animate([
              { opacity: 1, ...options.preserveTransform || options.direction ? { transform: baseTransform || "none" } : null },
              { opacity: 0, ...options.preserveTransform || options.direction ? { transform: combinedEndTransform || "none" } : null }
            ], {
              duration: options.duration ?? LS.Animation.DEFAULT_DURATION,
              easing: options.easing ?? LS.Animation.DEFAULT_EASING,
              fill: "forwards"
            });
            try {
              await animation.finished;
              if (!tracker.cancelled && element.isConnected && this.isRendered(element)) {
                animation.commitStyles();
              }
            } catch (e) {
              if (e.name !== "AbortError") throw e;
            } finally {
              animation.cancel();
              element.classList.remove("animating");
              if (activeAnimations.get(element) === tracker) {
                activeAnimations.delete(element);
                if (!tracker.cancelled && element.isConnected) {
                  element.style.display = "none";
                }
              }
            }
          },
          async fadeIn(element, duration = LS.Animation.DEFAULT_DURATION, direction = null, preserveTransform = false) {
            if (!element) return Promise.resolve();
            const options = typeof duration === "object" && duration !== null ? duration : { duration, direction, preserveTransform };
            this._cancelAll(element);
            const tracker = { cancelled: false };
            activeAnimations.set(element, tracker);
            element.style.display = "";
            element.classList.add("animating");
            const currentTransform = options.preserveTransform ? getComputedStyle(element).transform : "none";
            const baseTransform = currentTransform === "none" ? "" : currentTransform;
            const directionTransform = options.direction ? transforms[options.direction] || options.direction : "";
            const combinedStartTransform = directionTransform && baseTransform ? `${baseTransform} ${directionTransform}` : directionTransform || baseTransform;
            const animation = element.animate([
              { opacity: 0, ...options.preserveTransform || options.direction ? { transform: combinedStartTransform || "none" } : null },
              { opacity: 1, ...options.preserveTransform || options.direction ? { transform: baseTransform || "none" } : null }
            ], {
              duration: options.duration ?? LS.Animation.DEFAULT_DURATION,
              easing: options.easing ?? LS.Animation.DEFAULT_EASING,
              fill: "forwards"
            });
            try {
              await animation.finished;
              if (!tracker.cancelled && this.isRendered(element)) animation.commitStyles();
            } catch (e) {
              if (e.name !== "AbortError") throw e;
            } finally {
              animation.cancel();
              element.classList.remove("animating");
              if (activeAnimations.get(element) === tracker) {
                activeAnimations.delete(element);
              }
            }
          },
          async slideInToggle(newElement, oldElement = null, duration = LS.Animation.DEFAULT_DURATION) {
            if (!newElement) return;
            if (newElement === oldElement) {
              this._cancelAll(newElement);
              const tracker = { cancelled: false };
              activeAnimations.set(newElement, tracker);
              newElement.style.display = "";
              newElement.classList.add("animating");
              const animation = newElement.animate([
                { opacity: 0 },
                { opacity: 1 }
              ], {
                duration,
                easing: LS.Animation.DEFAULT_EASING,
                fill: "forwards"
              });
              try {
                await animation.finished;
                if (!tracker.cancelled && this.isRendered(newElement)) animation.commitStyles();
              } catch (e) {
                if (e.name !== "AbortError") throw e;
              } finally {
                animation.cancel();
                newElement.classList.remove("animating");
                if (activeAnimations.get(newElement) === tracker) {
                  activeAnimations.delete(newElement);
                }
              }
              return;
            }
            this._cancelAll(newElement);
            this._cancelAll(oldElement);
            const newTracker = { cancelled: false };
            const oldTracker = oldElement ? { cancelled: false } : null;
            activeAnimations.set(newElement, newTracker);
            if (oldElement) activeAnimations.set(oldElement, oldTracker);
            let oldAnimation;
            if (oldElement && oldElement.isConnected) {
              oldElement.classList.add("animating");
              oldAnimation = oldElement.animate([
                { transform: "translateX(0)", opacity: 1 },
                { transform: "translateX(-20px)", opacity: 0 }
              ], {
                duration,
                easing: LS.Animation.DEFAULT_EASING,
                fill: "forwards"
              });
            }
            newElement.style.display = "";
            newElement.classList.add("animating");
            const newAnimation = newElement.animate([
              { transform: "translateX(20px)", opacity: 0 },
              { transform: "translateX(0)", opacity: 1 }
            ], {
              duration,
              easing: LS.Animation.DEFAULT_EASING,
              fill: "forwards"
            });
            try {
              await Promise.all([
                newAnimation.finished.catch((e) => {
                  if (e.name !== "AbortError") throw e;
                }),
                oldAnimation ? oldAnimation.finished.catch((e) => {
                  if (e.name !== "AbortError") throw e;
                }) : Promise.resolve()
              ]);
              if (oldElement && oldElement.isConnected && !oldTracker.cancelled) {
                if (this.isRendered(oldElement)) oldAnimation.commitStyles();
                oldElement.style.display = "none";
              }
              if (newElement.isConnected && !newTracker.cancelled && this.isRendered(newElement)) {
                newAnimation.commitStyles();
              }
            } catch (e) {
              if (e.name !== "AbortError") throw e;
            } finally {
              oldAnimation?.cancel();
              newAnimation.cancel();
              oldElement?.classList.remove("animating");
              newElement.classList.remove("animating");
              if (activeAnimations.get(newElement) === newTracker) {
                activeAnimations.delete(newElement);
              }
              if (oldElement && activeAnimations.get(oldElement) === oldTracker) {
                activeAnimations.delete(oldElement);
              }
            }
          },
          transforms
        }, { name: "Animation", global: true });
      })();
      /**
       * Automation graph component for LS.
       * Migrated from v3 - still work in progress.
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      LS.LoadComponent(class AutomationGraph extends LS.Component {
        static POINT_TYPES = {
          LINEAR: "linear",
          HALF_SINE: "half_sine",
          EXPONENTIAL: "exponential",
          STAIRS: "stairs",
          HOLD: "hold",
          PULSE: "pulse",
          SINE: "sine",
          BEZIER: "bezier"
        };
        static contextMenuItems = [
          { type: "radio", group: "curve_type", text: "Linear", value: "linear", checked: true },
          { type: "radio", group: "curve_type", text: "Exponential", value: "exponential" },
          { type: "radio", group: "curve_type", text: "Hold", value: "hold" },
          { type: "radio", group: "curve_type", text: "Stairs", value: "stairs" },
          { type: "radio", group: "curve_type", text: "Sine Wave", value: "sine" },
          { type: "radio", group: "curve_type", text: "Half Sine Wave", value: "half_sine" },
          { type: "radio", group: "curve_type", text: "Pulse Wave", value: "pulse" },
          { type: "radio", group: "curve_type", text: "Bezier Curve", value: "bezier" },
          { type: "separator" },
          { text: "Type In Value", action: "type_in_value" },
          { text: "Reset Value", action: "reset_value" },
          { type: "separator" },
          { text: "Delete Point", action: "delete_point" }
        ];
        static contextMenu = null;
        static gradientIndex = 0;
        /**
         * Constructor
         * @param {*} options
         * @property {boolean} render - If false, the component will not render (data model only)
         * @property {Element} element - Parent element where to append the svg element
         */
        constructor(options = {}) {
          super();
          this.name = "AutomationGraph";
          if (options instanceof Element) options = { element: options };
          this.options = LS.Util.defaults({
            element: null,
            render: true,
            // If false, the component will not create an element (data model only)
            minTime: 0,
            maxTime: 460,
            minValue: 0,
            maxValue: 1,
            width: 460,
            height: 100,
            value: 0,
            // Initial value
            rightClickToCreate: true,
            snapToColumns: 0,
            allowAltUnsnap: false,
            bounds: true,
            stretch: false
          }, options);
          const minTime = Number.isFinite(this.options.minTime) ? this.options.minTime : 0;
          const maxTime = Number.isFinite(this.options.maxTime) ? this.options.maxTime : minTime + 1;
          this.options.minTime = Math.min(minTime, maxTime);
          this.options.maxTime = Math.max(minTime, maxTime);
          if (this.options.maxTime === this.options.minTime) {
            this.options.maxTime = this.options.minTime + 1;
          }
          const minValue = Number.isFinite(this.options.minValue) ? this.options.minValue : 0;
          const maxValue = Number.isFinite(this.options.maxValue) ? this.options.maxValue : minValue + 1;
          this.options.minValue = Math.min(minValue, maxValue);
          this.options.maxValue = Math.max(minValue, maxValue);
          if (this.options.maxValue === this.options.minValue) {
            this.options.maxValue = this.options.minValue + 1;
          }
          if (!Number.isFinite(this.options.width) || this.options.width <= 0) {
            this.options.width = this.options.maxTime - this.options.minTime;
          }
          if (!Number.isFinite(this.options.height) || this.options.height <= 0) {
            this.options.height = 100;
          }
          if (!Number.isFinite(this.options.value)) {
            this.options.value = this.options.minValue;
          }
          this.options.value = Math.max(this.options.minValue, Math.min(this.options.maxValue, this.options.value));
          if (!Number.isFinite(this.options.snapToColumns) || this.options.snapToColumns < 0) {
            this.options.snapToColumns = 0;
          }
          this.options.allowAltUnsnap = this.options.allowAltUnsnap !== false;
          if (this.options.bounds !== "expand") {
            this.options.bounds = this.options.bounds !== false;
          }
          this.options.stretch = this.options.stretch === true;
          this.gradientId = `ls-automation-gradient-${++this.constructor.gradientIndex}`;
          this.scale = 1;
          this.frameScheduler = new LS.Util.FrameScheduler(() => this.#render());
          this.items = [];
          this.startPoint = { time: this.options.minTime, value: this.options.value, type: "start" };
          this.__needsSort = false;
          this._dragState = null;
          this.handle = null;
          this.focusedItem = null;
          this.element = null;
          if (this.options.render && this.options.element) {
            this.setElement(this.options.element);
          }
          if (this.options.items) {
            this.reset(this.options.items);
          }
          if (!this.contextMenu && LS.Menu) {
            this.contextMenu = new LS.Menu({
              items: this.constructor.contextMenuItems
            });
            this.contextMenu.on("select", (item) => {
              const focused = this.focusedItem;
              if (!focused) return;
              switch (item.action) {
                case "delete_point":
                  if (focused !== this.startPoint) {
                    this.remove(focused);
                    this.focusedItem = null;
                  }
                  break;
                case "type_in_value": {
                  const value = prompt("Enter new value:", focused.value);
                  if (value !== null) {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                      focused.value = Math.max(this.options.minValue, Math.min(this.options.maxValue, num));
                      this.frameScheduler.schedule();
                    }
                  }
                  break;
                }
                case "reset_value":
                  focused.value = this.options.value;
                  this.frameScheduler.schedule();
                  break;
              }
            });
            this.contextMenu.on("check", (item) => {
              const focused = this.focusedItem;
              if (!focused || focused === this.startPoint) return;
              focused.type = item.value;
              this.frameScheduler.schedule();
            });
          }
        }
        setElement(target) {
          if (target === this.options.element && this.element) return;
          if (!target) {
            if (!this.options.render) return;
            this.options.render = false;
            this.options.element = null;
            if (this.element) {
              this.element.remove();
              this.element = null;
            }
            if (this.handle) {
              this.handle.destroy();
              this.handle = null;
            }
            return;
          }
          this.options.render = true;
          this.options.element = target;
          if (!this.element) {
            this.#createDOM();
          }
          if (this.element.parentNode !== target) {
            target.appendChild(this.element);
          }
          this.updateSize();
          this.frameScheduler.schedule();
        }
        #createDOM() {
          this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          this.element.classList.add("ls-automation-graph");
          this.element.setAttribute("tabindex", "0");
          this.element.style.outline = "none";
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
          gradient.setAttribute("id", this.gradientId);
          gradient.setAttribute("x1", "0%");
          gradient.setAttribute("y1", "0%");
          gradient.setAttribute("x2", "0%");
          gradient.setAttribute("y2", "100%");
          const stops = [
            { offset: "0%", style: "stop-color:var(--accent);stop-opacity:12%" },
            { offset: "100%", style: "stop-color:var(--accent);stop-opacity:4%" }
          ];
          for (const stopData of stops) {
            const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop.setAttribute("offset", stopData.offset);
            stop.setAttribute("style", stopData.style);
            gradient.appendChild(stop);
          }
          defs.appendChild(gradient);
          this.element.appendChild(defs);
          this.pathGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
          this.element.appendChild(this.pathGroup);
          this.handleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
          this.element.appendChild(this.handleGroup);
          this.strokePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          this.strokePath.setAttribute("fill", "none");
          this.strokePath.setAttribute("stroke", "var(--accent)");
          this.strokePath.setAttribute("stroke-width", "2");
          this.pathGroup.appendChild(this.strokePath);
          this.fillPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          this.fillPath.setAttribute("fill", `url(#${this.gradientId})`);
          this.fillPath.setAttribute("stroke", "none");
          this.pathGroup.appendChild(this.fillPath);
          this.handle = new LS.Util.TouchHandle(this.element, {
            cursor: this.options.cursor || "none",
            buttons: [0],
            onStart: (event) => {
              const item = event.domEvent.target.__automationItem;
              const type = event.domEvent.target.__automationHandleType;
              this.handle.options.pointerLock = type === "center";
              if (!item) {
                this.focusedItem = null;
                this.frameScheduler.schedule();
                return event.cancel();
              }
              this.focusedItem = item;
              this._dragState = {
                item,
                type,
                startX: event.x,
                startY: event.y,
                startCurvature: item.curvature || 0,
                startTime: item.time,
                startValue: item.value
              };
              event.domEvent.stopPropagation();
              event.domEvent.preventDefault();
              this.frameScheduler.schedule();
            },
            onMove: (event) => this.#onMouseMove(event),
            onEnd: () => this._dragState = null
          });
          this.element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target.__automationItem) {
              this.focusedItem = e.target.__automationItem;
              if (this.contextMenu) {
                for (const menuItem of this.contextMenu.items) {
                  if (menuItem.type === "radio" && menuItem.group === "curve_type") {
                    menuItem.checked = menuItem.value === this.focusedItem.type;
                  }
                }
                this.contextMenu.render();
                this.contextMenu.open(e.clientX, e.clientY);
              }
              this.frameScheduler.schedule();
            } else if (this.options.rightClickToCreate) {
              const rect = this.element.getBoundingClientRect();
              const relX = e.clientX - rect.left;
              const relY = e.clientY - rect.top;
              let time = this.x2t(relX);
              const snapStep = this.options.snapToColumns;
              const shouldSnap = snapStep > 0 && !(this.options.allowAltUnsnap && e.altKey);
              if (shouldSnap) {
                time = Math.round(time / snapStep) * snapStep;
              }
              if (this.options.bounds === true) {
                time = Math.max(this.options.minTime, Math.min(this.options.maxTime, time));
              }
              let value;
              if (e.shiftKey || window.M && window.M.ShiftDown) {
                value = this.getValueAtTime(time);
              } else {
                value = this.y2v(relY);
                if (this.options.bounds === true) {
                  value = Math.max(this.options.minValue, Math.min(this.options.maxValue, value));
                }
              }
              const newItem = this.add({ time, value, type: this.constructor.POINT_TYPES.LINEAR });
              this.focusedItem = newItem;
            }
          });
          this.element.addEventListener("keydown", (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && this.focusedItem && this.focusedItem !== this.startPoint) {
              this.remove(this.focusedItem);
              this.focusedItem = null;
            }
          });
        }
        updateSize(width, height) {
          if (Number.isFinite(width) && width > 0) {
            this.options.width = width;
          }
          if (Number.isFinite(height) && height > 0) {
            this.options.height = height;
          }
          if (this.element) {
            this.element.setAttribute("width", this.options.width);
            this.element.setAttribute("height", this.options.height);
          }
          this.frameScheduler.schedule();
        }
        updateScale(scale) {
          if (!Number.isFinite(scale) || scale <= 0 || scale === this.scale) return;
          this.scale = scale;
          this.frameScheduler.schedule();
        }
        updateSnapToColumns(columns = 0) {
          const snap = Number(columns);
          this.options.snapToColumns = Number.isFinite(snap) && snap > 0 ? snap : 0;
        }
        updateBounds(bounds = true) {
          this.options.bounds = bounds === "expand" ? "expand" : bounds !== false;
        }
        updateStretch(stretch = false) {
          this.options.stretch = stretch === true;
          this.frameScheduler.schedule();
        }
        resize(delta) {
          const currentDuration = this.options.maxTime - this.options.minTime;
          this.resizeToPX(currentDuration + delta);
        }
        resizeToPX(width) {
          const currentDuration = this.options.maxTime - this.options.minTime;
          if (!Number.isFinite(width) || currentDuration <= 0 || width <= 0) return;
          const ratio = width / currentDuration;
          for (let item of this.items) {
            item.time = this.options.minTime + (item.time - this.options.minTime) * ratio;
          }
          this.options.maxTime = this.options.minTime + width;
          this.frameScheduler.schedule();
        }
        /**
         * Point data structure
         * @param {*} item
         * @property {number} time - Where the point starts
         * @property {number} value - Target value of the point
         * @property {string} type - Shape of the point (linear, exponential, hold, etc)
         * @property {number} curvature - (For curved points) Curvature amount / Frequency
         * @property {Object} outHandle - (For bezier curves) Handle out position
         * @property {number} outHandle.dx - X position of the out handle
         * @property {number} outHandle.dy - Y position of the out handle
         * @property {Object} inHandle - (For bezier curves) Handle in position
         * @property {number} inHandle.dx - X position of the in handle
         * @property {number} inHandle.dy - Y position of the in handle
         */
        add(item, scheduleRender = true) {
          if (!this.#normalizeItem(item)) return null;
          this.items.push(item);
          this.__needsSort = true;
          if (scheduleRender) {
            this.frameScheduler.schedule();
          }
          return item;
        }
        remove(item, scheduleRender = true) {
          const index = this.items.indexOf(item);
          if (index !== -1) {
            this.items.splice(index, 1);
            if (item._pathNode) {
              item._pathNode.remove();
              item._pathNode = null;
            }
            if (item._handleNode) {
              item._handleNode.remove();
              item._handleNode = null;
            }
            if (item._centerHandleNode) {
              item._centerHandleNode.remove();
              item._centerHandleNode = null;
            }
            if (this.focusedItem === item) {
              this.focusedItem = null;
            }
          }
          if (scheduleRender) {
            this.frameScheduler.schedule();
          }
        }
        // time to x
        t2x(t) {
          if (this.options.stretch) {
            const range = this.options.maxTime - this.options.minTime;
            const width = Number.isFinite(this.options.width) && this.options.width > 0 ? this.options.width : 1;
            if (range > 0) {
              return (t - this.options.minTime) / range * width;
            }
          }
          const scale = this.scale > 0 ? this.scale : 1;
          return (t - this.options.minTime) * scale;
        }
        // value to y
        v2y(v) {
          const height = this.options.height;
          const range = this.options.maxValue - this.options.minValue;
          if (range <= 0) {
            return height / 2;
          }
          return height - (v - this.options.minValue) / range * height;
        }
        // x to time
        x2t(x) {
          if (this.options.stretch) {
            const range = this.options.maxTime - this.options.minTime;
            const width = Number.isFinite(this.options.width) && this.options.width > 0 ? this.options.width : 1;
            if (range > 0 && width > 0) {
              return this.options.minTime + x / width * range;
            }
          }
          const scale = this.scale > 0 ? this.scale : 1;
          return x / scale + this.options.minTime;
        }
        // y to value
        y2v(y) {
          const height = this.options.height;
          const range = this.options.maxValue - this.options.minValue;
          if (height <= 0 || range <= 0) {
            return this.options.minValue;
          }
          return this.options.minValue + (height - y) / height * range;
        }
        #normalizeItem(item) {
          if (!item || typeof item !== "object") return false;
          const clampBounds = this.options.bounds === true;
          if (!Number.isFinite(item.time)) {
            item.time = this.options.minTime;
          }
          if (clampBounds) {
            item.time = Math.max(this.options.minTime, Math.min(this.options.maxTime, item.time));
          }
          if (!Number.isFinite(item.value)) {
            item.value = this.options.value;
          }
          if (clampBounds) {
            item.value = Math.max(this.options.minValue, Math.min(this.options.maxValue, item.value));
          }
          if (!Number.isFinite(item.curvature)) {
            item.curvature = 0;
          }
          switch (item.type) {
            case this.constructor.POINT_TYPES.LINEAR:
            case this.constructor.POINT_TYPES.HALF_SINE:
            case this.constructor.POINT_TYPES.EXPONENTIAL:
            case this.constructor.POINT_TYPES.STAIRS:
            case this.constructor.POINT_TYPES.HOLD:
            case this.constructor.POINT_TYPES.PULSE:
            case this.constructor.POINT_TYPES.SINE:
            case this.constructor.POINT_TYPES.BEZIER:
              break;
            default:
              item.type = this.constructor.POINT_TYPES.LINEAR;
          }
          if (item.inHandle && typeof item.inHandle === "object") {
            item.inHandle = {
              dx: Number.isFinite(item.inHandle.dx) ? item.inHandle.dx : 0,
              dy: Number.isFinite(item.inHandle.dy) ? item.inHandle.dy : 0
            };
          } else {
            item.inHandle = null;
          }
          if (item.outHandle && typeof item.outHandle === "object") {
            item.outHandle = {
              dx: Number.isFinite(item.outHandle.dx) ? item.outHandle.dx : 0,
              dy: Number.isFinite(item.outHandle.dy) ? item.outHandle.dy : 0
            };
          } else {
            item.outHandle = null;
          }
          return true;
        }
        #createPointHandle(item) {
          const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          handle.classList.add("ls-automation-point-handle");
          handle.setAttribute("r", "6");
          handle.setAttribute("fill", "var(--accent)");
          handle.setAttribute("fill-opacity", "0.8");
          handle.setAttribute("stroke", "var(--accent)");
          handle.style.cursor = item === this.startPoint ? "ns-resize" : "move";
          handle.__automationItem = item;
          handle.__automationHandleType = "point";
          return handle;
        }
        #createCenterHandle(item) {
          const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
          const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          hitArea.setAttribute("r", "10");
          hitArea.setAttribute("fill", "transparent");
          hitArea.style.cursor = "ns-resize";
          hitArea.__automationItem = item;
          hitArea.__automationHandleType = "center";
          const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          handle.classList.add("ls-automation-center-handle");
          handle.setAttribute("r", "4");
          handle.setAttribute("fill", "none");
          handle.setAttribute("stroke-width", "1");
          handle.setAttribute("stroke", "var(--accent)");
          handle.style.pointerEvents = "none";
          group.style.cursor = "ns-resize";
          group.__automationItem = item;
          group.__automationHandleType = "center";
          group._visualNode = handle;
          group.appendChild(hitArea);
          group.appendChild(handle);
          group.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            e.preventDefault();
            item.curvature = 0;
            this.frameScheduler.schedule();
          });
          return group;
        }
        #render() {
          if (this.__needsSort) this.sortItems();
          if (!this.options.render || !this.element) return;
          let d = "";
          let fillD = "";
          const startX = this.t2x(this.startPoint.time);
          const startY = this.v2y(this.startPoint.value);
          d = `M ${startX} ${startY}`;
          fillD = `M ${startX} ${this.options.height} L ${startX} ${startY}`;
          if (!this.startPoint._handleNode) {
            this.startPoint._handleNode = this.#createPointHandle(this.startPoint);
            this.handleGroup.appendChild(this.startPoint._handleNode);
          } else if (this.startPoint._handleNode.parentNode !== this.handleGroup) {
            this.handleGroup.appendChild(this.startPoint._handleNode);
          }
          this.startPoint._handleNode.setAttribute("cx", startX);
          this.startPoint._handleNode.setAttribute("cy", startY);
          if (this.focusedItem === this.startPoint) {
            this.startPoint._handleNode.setAttribute("stroke-width", "2");
            this.startPoint._handleNode.setAttribute("fill", "#eee");
            this.startPoint._handleNode.setAttribute("r", "5");
          } else {
            this.startPoint._handleNode.setAttribute("stroke-width", "1");
            this.startPoint._handleNode.setAttribute("fill", "#fff");
            this.startPoint._handleNode.setAttribute("r", "4");
          }
          for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const prev = i > 0 ? this.items[i - 1] : this.startPoint;
            const x = this.t2x(item.time);
            const y = this.v2y(item.value);
            if (!item._handleNode) {
              item._handleNode = this.#createPointHandle(item);
              this.handleGroup.appendChild(item._handleNode);
            } else if (item._handleNode.parentNode !== this.handleGroup) {
              this.handleGroup.appendChild(item._handleNode);
            }
            item._handleNode.setAttribute("cx", x);
            item._handleNode.setAttribute("cy", y);
            if (this.focusedItem === item) {
              item._handleNode.setAttribute("stroke-width", "2");
              item._handleNode.setAttribute("fill", "var(--accent-60)");
              item._handleNode.setAttribute("r", "8");
            } else {
              item._handleNode.setAttribute("stroke-width", "1");
              item._handleNode.setAttribute("fill", "var(--accent)");
              item._handleNode.setAttribute("r", "6");
            }
            const prevX = this.t2x(prev.time);
            const prevY = this.v2y(prev.value);
            const pathData = this._calculatePath(prevX, prevY, x, y, item);
            d += " " + pathData.d;
            fillD += " " + pathData.d;
            if (item.type !== this.constructor.POINT_TYPES.HOLD) {
              if (!item._centerHandleNode) {
                item._centerHandleNode = this.#createCenterHandle(item);
                this.handleGroup.appendChild(item._centerHandleNode);
              } else if (item._centerHandleNode.parentNode !== this.handleGroup) {
                this.handleGroup.appendChild(item._centerHandleNode);
              }
              item._centerHandleNode.setAttribute("transform", `translate(${pathData.center.x} ${pathData.center.y})`);
            } else {
              if (item._centerHandleNode) {
                item._centerHandleNode.remove();
                item._centerHandleNode = null;
              }
            }
          }
          if (this.items.length > 0) {
            const lastItem = this.items[this.items.length - 1];
            const lastX = this.t2x(lastItem.time);
            fillD += ` L ${lastX} ${this.options.height} Z`;
          } else {
            const endX = this.t2x(this.options.maxTime);
            fillD += ` L ${endX} ${this.options.height} Z`;
            d += ` H ${endX}`;
          }
          this.strokePath.setAttribute("d", d);
          this.fillPath.setAttribute("d", fillD);
        }
        _calculatePath(x0, y0, x1, y1, item) {
          let d = "";
          let center = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
          switch (item.type) {
            case this.constructor.POINT_TYPES.LINEAR:
            case this.constructor.POINT_TYPES.EXPONENTIAL: {
              const curv = Number.isFinite(item.curvature) ? item.curvature : 0;
              if (Math.abs(curv) < 1e-3) {
                d = `L ${x1} ${y1}`;
                center = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
              } else {
                const midX = (x0 + x1) / 2;
                const midY = (y0 + y1) / 2;
                const cpX = midX;
                let cpY = midY + curv * (this.options.height / 2);
                const minY = Math.min(y0, y1);
                const maxY = Math.max(y0, y1);
                cpY = Math.max(minY, Math.min(maxY, cpY));
                d = `Q ${cpX} ${cpY} ${x1} ${y1}`;
                center = {
                  x: 0.25 * x0 + 0.5 * cpX + 0.25 * x1,
                  y: 0.25 * y0 + 0.5 * cpY + 0.25 * y1
                };
              }
              break;
            }
            case this.constructor.POINT_TYPES.HOLD:
              d = `H ${x1} V ${y1}`;
              center = { x: (x0 + x1) / 2, y: y0 };
              break;
            case this.constructor.POINT_TYPES.STAIRS: {
              const steps = Math.max(1, Math.floor(Math.abs(item.curvature || 0) * 20) + 1);
              const dx = (x1 - x0) / steps;
              const dy = (y1 - y0) / steps;
              d = "";
              for (let i = 0; i < steps; i++) {
                d += `H ${x0 + (i + 1) * dx} V ${y0 + (i + 1) * dy}`;
              }
              center = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
              break;
            }
            case this.constructor.POINT_TYPES.HALF_SINE: {
              const points = 50;
              d = "";
              for (let i = 1; i <= points; i++) {
                const t = i / points;
                const xx = x0 + t * (x1 - x0);
                const yy = y0 + (1 - Math.cos(Math.PI * t)) * 0.5 * (y1 - y0);
                d += ` L ${xx} ${yy}`;
              }
              center = { x: (x0 + x1) / 2, y: y0 + 0.5 * (y1 - y0) };
              break;
            }
            case this.constructor.POINT_TYPES.SINE: {
              const freq = Math.max(0.5, Math.abs(item.curvature || 0) * 10);
              const omega = freq * Math.PI * 2;
              const amp = (y1 - y0) / 2;
              const points = 50;
              d = "";
              for (let i = 1; i <= points; i++) {
                const t = i / points;
                const xx = x0 + t * (x1 - x0);
                const wave = Math.sin(t * omega) - t * Math.sin(omega);
                const yy = y0 + t * (y1 - y0) + amp * wave;
                d += ` L ${xx} ${yy}`;
              }
              const centerT = 0.5;
              const centerWave = Math.sin(centerT * omega) - centerT * Math.sin(omega);
              center = {
                x: (x0 + x1) / 2,
                y: y0 + centerT * (y1 - y0) + amp * centerWave
              };
              break;
            }
            case this.constructor.POINT_TYPES.PULSE: {
              const pFreq = Math.max(1, Math.abs(item.curvature || 0) * 10);
              const pAmp = Math.abs(y1 - y0) / 2;
              d = "";
              for (let i = 1; i <= 50; i++) {
                const t = i / 50;
                const xx = x0 + t * (x1 - x0);
                const phase = t * pFreq % 1;
                const pulse = phase < 0.5 ? 1 : -1;
                const envelope = Math.sin(Math.PI * t);
                const yy = y0 + t * (y1 - y0) + pulse * pAmp * envelope;
                d += ` L ${xx} ${yy}`;
              }
              center = { x: (x0 + x1) / 2, y: y0 + 0.5 * (y1 - y0) };
              break;
            }
            case this.constructor.POINT_TYPES.BEZIER: {
              const cp1x = x0 + (item.outHandle ? item.outHandle.dx : (x1 - x0) / 3);
              const cp1y = y0 + (item.outHandle ? item.outHandle.dy : 0);
              const cp2x = x1 + (item.inHandle ? item.inHandle.dx : -(x1 - x0) / 3);
              const cp2y = y1 + (item.inHandle ? item.inHandle.dy : 0);
              d = `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x1} ${y1}`;
              center = {
                x: 0.125 * x0 + 0.375 * cp1x + 0.375 * cp2x + 0.125 * x1,
                y: 0.125 * y0 + 0.375 * cp1y + 0.375 * cp2y + 0.125 * y1
              };
              break;
            }
            default:
              d = `L ${x1} ${y1}`;
          }
          return { d, center };
        }
        getCenterLocation(item) {
          const index = this.items.indexOf(item);
          if (index < 0) return null;
          const prev = index === 0 ? this.startPoint : this.items[index - 1];
          const x0 = this.t2x(prev.time);
          const y0 = this.v2y(prev.value);
          const x1 = this.t2x(item.time);
          const y1 = this.v2y(item.value);
          return this._calculatePath(x0, y0, x1, y1, item).center;
        }
        #onMouseMove(event) {
          if (!this._dragState || !event) return;
          const x = event.x;
          const y = event.y;
          const { item, type } = this._dragState;
          if (type === "point") {
            const rect = this.element.getBoundingClientRect();
            const relX = x - rect.left;
            const relY = y - rect.top;
            const shiftDown = !!(event.domEvent && event.domEvent.shiftKey) || window.M && window.M.ShiftDown;
            const altDown = !!(event.domEvent && event.domEvent.altKey);
            const snapStep = this.options.snapToColumns;
            const shouldSnap = snapStep > 0 && !(this.options.allowAltUnsnap && altDown);
            let proposedTime = this.x2t(relX);
            let proposedValue = this.y2v(relY);
            if (shouldSnap) {
              const pointerTime = this.x2t(relX);
              const deltaFromStart = pointerTime - this._dragState.startTime;
              proposedTime = this._dragState.startTime + Math.round(deltaFromStart / snapStep) * snapStep;
            }
            const minOverflow = Math.max(0, this.options.minTime - proposedTime);
            const maxOverflow = Math.max(0, proposedTime - this.options.maxTime);
            const lowOverflow = Math.max(0, this.options.minValue - proposedValue);
            const highOverflow = Math.max(0, proposedValue - this.options.maxValue);
            if (this.options.bounds === "expand" && (minOverflow > 0 || maxOverflow > 0 || lowOverflow > 0 || highOverflow > 0)) {
              this.emit("expand", [{
                minTime: minOverflow,
                maxTime: maxOverflow,
                minValue: lowOverflow,
                maxValue: highOverflow,
                item,
                sourceEvent: event.domEvent
              }]);
            }
            if (item === this.startPoint) {
              if (this.options.bounds === true) {
                item.value = Math.max(this.options.minValue, Math.min(this.options.maxValue, proposedValue));
              } else {
                item.value = proposedValue;
              }
            } else {
              const index = this.items.indexOf(item);
              let minT = this.options.bounds === true ? this.options.minTime : -Infinity;
              let maxT = this.options.bounds === true ? this.options.maxTime : Infinity;
              if (index > 0) minT = this.items[index - 1].time;
              if (index < this.items.length - 1) maxT = this.items[index + 1].time;
              item.time = Math.max(minT, Math.min(maxT, proposedTime));
              if (shiftDown) {
                item.value = this._dragState.startValue;
              } else {
                if (this.options.bounds === true) {
                  item.value = Math.max(this.options.minValue, Math.min(this.options.maxValue, proposedValue));
                } else {
                  item.value = proposedValue;
                }
              }
            }
            this.frameScheduler.schedule();
          } else if (type === "center") {
            const index = this.items.indexOf(item);
            if (index < 0) return;
            const prev = index === 0 ? this.startPoint : this.items[index - 1];
            const x0 = this.t2x(prev.time);
            const y0 = this.v2y(prev.value);
            const x1 = this.t2x(item.time);
            const y1 = this.v2y(item.value);
            const rect = this.element.getBoundingClientRect();
            const mouseY = y - rect.top;
            const midY = (y0 + y1) / 2;
            const diffY = mouseY - midY;
            const divisor = Math.max(1, this.options.height * 0.25);
            item.curvature = diffY / divisor;
            this.frameScheduler.schedule();
          }
        }
        render() {
          this.frameScheduler.schedule();
        }
        binarySearch(time) {
          let low = 0;
          let high = this.items.length - 1;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midTime = this.items[mid].time;
            if (midTime <= time) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }
          return low - 1;
        }
        getValueAtTime(time) {
          if (this.__needsSort) this.sortItems();
          if (!Number.isFinite(time) || this.items.length === 0) return this.startPoint.value;
          if (time <= this.startPoint.time) return this.startPoint.value;
          if (time >= this.items[this.items.length - 1].time) return this.items[this.items.length - 1].value;
          let index = this.binarySearch(time);
          let prevItem, nextItem;
          if (index === -1) {
            prevItem = this.startPoint;
            nextItem = this.items[0];
          } else {
            prevItem = this.items[index];
            nextItem = this.items[index + 1];
          }
          if (!nextItem) return prevItem.value;
          const t0 = prevItem.time;
          const t1 = nextItem.time;
          const v0 = prevItem.value;
          const v1 = nextItem.value;
          if (t1 === t0) return v1;
          const ratio = Math.max(0, Math.min(1, (time - t0) / (t1 - t0)));
          switch (nextItem.type) {
            case this.constructor.POINT_TYPES.HOLD:
              return v0;
            case this.constructor.POINT_TYPES.STAIRS: {
              const steps = Math.max(1, Math.floor(Math.abs(nextItem.curvature || 0) * 20) + 1);
              const stepIndex = Math.min(steps, Math.floor(ratio * steps));
              const vStep = (v1 - v0) / steps;
              return v0 + stepIndex * vStep;
            }
            case this.constructor.POINT_TYPES.LINEAR:
            case this.constructor.POINT_TYPES.EXPONENTIAL: {
              const curv = Number.isFinite(nextItem.curvature) ? nextItem.curvature : 0;
              if (Math.abs(curv) < 1e-6) {
                return v0 + (v1 - v0) * ratio;
              }
              const midY = (v0 + v1) / 2;
              const range = this.options.maxValue - this.options.minValue;
              let cpVal = midY - curv * (range / 2);
              const minV = Math.min(v0, v1);
              const maxV = Math.max(v0, v1);
              cpVal = Math.max(minV, Math.min(maxV, cpVal));
              const t = ratio;
              return (1 - t) * (1 - t) * v0 + 2 * (1 - t) * t * cpVal + t * t * v1;
            }
            case this.constructor.POINT_TYPES.HALF_SINE:
              return v0 + (1 - Math.cos(Math.PI * ratio)) * 0.5 * (v1 - v0);
            case this.constructor.POINT_TYPES.SINE: {
              const freq = Math.max(0.5, Math.abs(nextItem.curvature || 0) * 10);
              const omega = freq * Math.PI * 2;
              const amp = (v1 - v0) / 2;
              const wave = Math.sin(ratio * omega) - ratio * Math.sin(omega);
              return v0 + ratio * (v1 - v0) + amp * wave;
            }
            case this.constructor.POINT_TYPES.PULSE: {
              const pFreq = Math.max(1, Math.abs(nextItem.curvature || 0) * 10);
              const pAmp = (v1 - v0) / 2;
              const pMidV = (v0 + v1) / 2;
              const phase = ratio * pFreq % 1;
              const pOffset = (phase < 0.5 ? 1 : -1) * pAmp;
              return pMidV + pOffset;
            }
            case this.constructor.POINT_TYPES.BEZIER:
              return v0 + (v1 - v0) * ratio;
            default:
              return v0 + (v1 - v0) * ratio;
          }
        }
        sortItems() {
          this.items = this.items.filter((item) => this.#normalizeItem(item));
          this.items.sort((a, b) => a.time - b.time);
          if (this.options.bounds !== true) {
            this.__needsSort = false;
            return;
          }
          let previousTime = this.options.minTime;
          for (const item of this.items) {
            if (item.time < previousTime) {
              item.time = previousTime;
            }
            previousTime = item.time;
          }
          this.__needsSort = false;
        }
        reset(replacingItems = null) {
          const nextItems = Array.isArray(replacingItems) ? replacingItems.slice() : [];
          for (let i = this.items.length - 1; i >= 0; i--) {
            this.remove(this.items[i], false);
          }
          this.items = [];
          for (const item of nextItems) {
            this.add(item, false);
          }
          if (this.focusedItem !== this.startPoint && this.focusedItem && !this.items.includes(this.focusedItem)) {
            this.focusedItem = null;
          }
          if (this.items.length > 1) {
            this.sortItems();
          } else {
            this.__needsSort = false;
          }
          this.frameScheduler.schedule();
        }
        export() {
          return {
            startPoint: this.cloneItem(this.startPoint),
            items: this.items.map((item) => this.cloneItem(item))
          };
        }
        cloneItem(item) {
          return {
            time: Number.isFinite(item.time) ? item.time : 0,
            value: Number.isFinite(item.value) ? item.value : 0,
            type: item.type,
            curvature: Number.isFinite(item.curvature) ? item.curvature : 0,
            inHandle: item.inHandle ? { dx: item.inHandle.dx, dy: item.inHandle.dy } : null,
            outHandle: item.outHandle ? { dx: item.outHandle.dx, dy: item.outHandle.dy } : null
          };
        }
        destroy() {
          for (let i = this.items.length - 1; i >= 0; i--) {
            this.remove(this.items[i], false);
          }
          this.frameScheduler.destroy();
          if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
          }
          this.element = null;
          if (this.handle) {
            this.handle.destroy();
            this.handle = null;
          }
          if (this.startPoint && this.startPoint._handleNode) {
            this.startPoint._handleNode.remove();
            this.startPoint._handleNode = null;
          }
          this.startPoint = null;
          this._dragState = null;
          this.focusedItem = null;
          if (this.contextMenu) {
            this.contextMenu.destroy();
            this.contextMenu = null;
          }
          this.items.length = 0;
        }
      }, { name: "AutomationGraph", global: true });
      (() => {
        const fast = LS.Util.fast;
        LS.Color = class Color {
          constructor(r, g, b, a) {
            if (r && (r instanceof Uint8Array || r instanceof Uint8ClampedArray || r instanceof ArrayBuffer)) {
              this.data = r instanceof ArrayBuffer ? new Uint8Array(r) : r;
              this.offset = typeof g === "number" ? g : 0;
              return;
            }
            if (Array.isArray(r) && r.length >= 3) {
              this.data = r;
              this.offset = typeof g === "number" ? g : 0;
              return;
            }
            this.data = [0, 0, 0, 255];
            this.offset = 0;
            if (typeof r !== "undefined") {
              Color.parse(r, g, b, a, this.data, this.offset);
            }
          }
          // Direct Buffer Access
          get r() {
            return this.data[this.offset];
          }
          set r(value) {
            this.data[this.offset] = value;
          }
          get g() {
            return this.data[this.offset + 1];
          }
          set g(value) {
            this.data[this.offset + 1] = value;
          }
          get b() {
            return this.data[this.offset + 2];
          }
          set b(value) {
            this.data[this.offset + 2] = value;
          }
          get a() {
            return this.data[this.offset + 3] / 255;
          }
          set a(value) {
            this.data[this.offset + 3] = Math.round(value * 255);
          }
          get int() {
            return (this.data[this.offset] << 16 | this.data[this.offset + 1] << 8 | this.data[this.offset + 2]) >>> 0;
          }
          get hexInt() {
            return this.data[this.offset] << 16 | this.data[this.offset + 1] << 8 | this.data[this.offset + 2] | 1 << 24;
          }
          get hex() {
            return "#" + this.hexInt.toString(16).slice(1);
          }
          get rgb() {
            return `rgb(${this.data[this.offset]}, ${this.data[this.offset + 1]}, ${this.data[this.offset + 2]})`;
          }
          get rgba() {
            return `rgba(${this.data[this.offset]}, ${this.data[this.offset + 1]}, ${this.data[this.offset + 2]}, ${this.data[this.offset + 3] / 255})`;
          }
          getHSL(out = [0, 0, 0]) {
            const data = this.data;
            const o = this.offset;
            const r = data[o] * (1 / 255);
            const g = data[o + 1] * (1 / 255);
            const b = data[o + 2] * (1 / 255);
            const max = r > g ? r > b ? r : b : g > b ? g : b;
            const min = r < g ? r < b ? r : b : g < b ? g : b;
            const l = (max + min) * 0.5;
            let h = 0, s = 0;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
              else if (max === g) h = (b - r) / d + 2;
              else h = (r - g) / d + 4;
              h *= 1 / 6;
            }
            out[0] = Math.round(h * 360);
            out[1] = Math.round(s * 100);
            out[2] = Math.round(l * 100);
            return out;
          }
          get hsl() {
            return this.getHSL([0, 0, 0]);
          }
          get hsb() {
            let r = this.data[this.offset] / 255;
            let g = this.data[this.offset + 1] / 255;
            let b = this.data[this.offset + 2] / 255;
            let max = Math.max(r, g, b);
            let min = Math.min(r, g, b);
            let v = max;
            let h, s;
            let delta = max - min;
            s = max === 0 ? 0 : delta / max;
            if (max === min) {
              h = 0;
            } else {
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
            v = Math.round(v * 100);
            return [h, s, v];
          }
          get color() {
            return [this.data[this.offset], this.data[this.offset + 1], this.data[this.offset + 2], this.data[this.offset + 3] / 255];
          }
          get pixel() {
            return [this.data[this.offset], this.data[this.offset + 1], this.data[this.offset + 2], this.data[this.offset + 3]];
          }
          browse(channel = 0) {
            return this.data[this.offset + channel];
          }
          copyTo(target, offset = 0) {
            target[offset] = this.data[this.offset];
            target[offset + 1] = this.data[this.offset + 1];
            target[offset + 2] = this.data[this.offset + 2];
            target[offset + 3] = this.data[this.offset + 3];
            return target;
          }
          get floatPixel() {
            return [Math.fround(this.data[this.offset] / 255), Math.fround(this.data[this.offset + 1] / 255), Math.fround(this.data[this.offset + 2] / 255), Math.fround(this.data[this.offset + 3] / 255)];
          }
          get luma() {
            return 0.2126 * this.data[this.offset] + 0.7152 * this.data[this.offset + 1] + 0.0722 * this.data[this.offset + 2];
          }
          get brightness() {
            return Math.sqrt(
              0.299 * (this.data[this.offset] * this.data[this.offset]) + 0.587 * (this.data[this.offset + 1] * this.data[this.offset + 1]) + 0.114 * (this.data[this.offset + 2] * this.data[this.offset + 2])
            );
          }
          get bit() {
            return this.brightness >= 127.5 ? 1 : 0;
          }
          get isDark() {
            return this.brightness < 127.5;
          }
          hue(hue) {
            let [h, s, l] = this.hsl;
            h = Math.max(Math.min(hue, 360), 0);
            this.setHSL(h, s, l);
            return this;
          }
          /**
           * Linear interpolation between current color and target color by a given ratio
           * @param {Color|array|number|string} target Target color
           * @param {number} progress Interpolation factor (0-1)
           * @param {Color|array} source Optional source color (otherwise uses and mutates current color)
           */
          lerp(target, progress = 0.5, source = null) {
            if (progress <= 0) {
              return this;
            } else if (progress >= 1) {
              return this.set(target);
            }
            let r2, g2, b2, a2;
            if (target instanceof Color) {
              r2 = target.r;
              g2 = target.g;
              b2 = target.b;
              a2 = target.a;
            } else if (Array.isArray(target)) {
              r2 = target[0];
              g2 = target[1];
              b2 = target[2];
              a2 = target[3] !== void 0 ? target[3] > 1 ? target[3] / 255 : target[3] : 1;
            } else {
              const c = new Color(target);
              r2 = c.r;
              g2 = c.g;
              b2 = c.b;
              a2 = c.a;
            }
            const d = this.data, o = this.offset;
            const p = Math.max(0, Math.min(1, progress));
            const q = 1 - p;
            const r = source ? source.data[o] : d[o];
            const g = source ? source.data[o + 1] : d[o + 1];
            const b = source ? source.data[o + 2] : d[o + 2];
            const a = source ? source.data[o + 3] : d[o + 3];
            d[o] = Math.round(r * q + r2 * p);
            d[o + 1] = Math.round(g * q + g2 * p);
            d[o + 2] = Math.round(b * q + b2 * p);
            const currentA = d[o + 3] / 255;
            d[o + 3] = Math.round((currentA * q + a2 * p) * 255);
            return this;
          }
          saturation(percent) {
            let [h, s, l] = this.hsl;
            s = Math.max(Math.min(percent, 100), 0);
            this.setHSL(h, s, l);
            return this;
          }
          lightness(percent) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(percent, 100), 0);
            this.setHSL(h, s, l);
            return this;
          }
          tone(hue, saturation, lightness) {
            let [h, s, l] = this.hsl;
            this.setHSL(hue || h, s / 100 * saturation, typeof lightness === "number" ? lightness : l);
            return this;
          }
          lighten(percent) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(l + percent, 100), 0);
            this.setHSL(h, s, l);
            return this;
          }
          saturate(percent) {
            let [h, s, l] = this.hsl;
            s = Math.max(Math.min(s + percent, 100), 0);
            this.setHSL(h, s, l);
            return this;
          }
          darken(percent) {
            let [h, s, l] = this.hsl;
            l = Math.max(Math.min(l - percent, 100), 0);
            this.setHSL(h, s, l);
            return this;
          }
          hueShift(deg) {
            let [h, s, l] = this.hsl;
            h = (h + deg) % 360;
            this.setHSL(h, s, l);
            return this;
          }
          /**
           * Multiplies each channel by the given factor
           * Provide null to skip a channel
           */
          multiply(factorR, factorG, factorB, factorA) {
            const d = this.data, o = this.offset;
            return this.setClamped(
              factorR === null ? null : Math.round(d[o] * factorR),
              factorG === null ? null : Math.round(d[o + 1] * factorG),
              factorB === null ? null : Math.round(d[o + 2] * factorB),
              factorA === null ? null : d[o + 3] / 255 * factorA
            );
          }
          /**
           * Divides each channel by the given factor
           * Provide null to skip a channel
           */
          divide(factorR, factorG, factorB, factorA) {
            const d = this.data, o = this.offset;
            return this.setClamped(
              factorR === null ? null : Math.round(d[o] / factorR),
              factorG === null ? null : Math.round(d[o + 1] / factorG),
              factorB === null ? null : Math.round(d[o + 2] / factorB),
              factorA === null ? null : d[o + 3] / 255 / factorA
            );
          }
          add(r2, g2, b2, a2) {
            let color = new Color(r2, g2, b2, a2);
            const d = this.data, o = this.offset;
            return this.setClamped(
              d[o] + color.r,
              d[o + 1] + color.g,
              d[o + 2] + color.b,
              d[o + 3] / 255 + color.a
            );
          }
          subtract(r2, g2, b2, a2) {
            let color = new Color(r2, g2, b2, a2);
            const d = this.data, o = this.offset;
            return this.setClamped(
              d[o] - color.r,
              d[o + 1] - color.g,
              d[o + 2] - color.b,
              d[o + 3] / 255 - color.a
            );
          }
          /**
           * Mixes this color with another one by the given weight (0 to 1)
           */
          mix(val, weight = 0.5) {
            let r2, g2, b2, a2;
            if (val instanceof Color) {
              r2 = val.r;
              g2 = val.g;
              b2 = val.b;
              a2 = val.a;
            } else if (Array.isArray(val)) {
              r2 = val[0];
              g2 = val[1];
              b2 = val[2];
              a2 = val[3] !== void 0 ? val[3] > 1 ? val[3] / 255 : val[3] : 1;
            } else {
              const c = new Color(val);
              r2 = c.r;
              g2 = c.g;
              b2 = c.b;
              a2 = c.a;
            }
            const d = this.data, o = this.offset;
            d[o] = Math.round(d[o] * (1 - weight) + r2 * weight);
            d[o + 1] = Math.round(d[o + 1] * (1 - weight) + g2 * weight);
            d[o + 2] = Math.round(d[o + 2] * (1 - weight) + b2 * weight);
            let currentA = d[o + 3] / 255;
            d[o + 3] = Math.round((currentA * (1 - weight) + a2 * weight) * 255);
            return this;
          }
          /**
           * Sets the alpha channel to a value
           */
          alpha(v) {
            this.data[this.offset + 3] = Math.min(Math.max(v, 0), 1) * 255;
            return this;
          }
          #f(n, h, a, l) {
            const kn = (n + h / 30) % 12;
            const t = Math.min(kn - 3, 9 - kn);
            return l - a * Math.max(-1, Math.min(t, 1));
          }
          setHSL(h, s, l, alpha) {
            let hsl;
            if (h == null || Number.isNaN(h)) h = (hsl ??= this.hsl)[0];
            if (s == null || Number.isNaN(s)) s = (hsl ??= this.hsl)[1];
            if (l == null || Number.isNaN(l)) l = (hsl ??= this.hsl)[2];
            s *= 0.01;
            l *= 0.01;
            const a = s * Math.min(l, 1 - l);
            const data = this.data;
            const o = this.offset;
            data[o] = Math.round(255 * this.#f(0, h, a, l));
            data[o + 1] = Math.round(255 * this.#f(8, h, a, l));
            data[o + 2] = Math.round(255 * this.#f(4, h, a, l));
            if (Number.isFinite(alpha)) {
              const clamped = alpha <= 0 ? 0 : alpha >= 1 ? 1 : alpha;
              data[o + 3] = Math.round(clamped * 255);
            }
            return this;
          }
          setHSB(h, s, b, alpha) {
            let hsb;
            if (h === null || typeof h === "undefined" || isNaN(h)) h = hsb ? hsb[0] : (hsb = this.hsb)[0];
            if (s === null || typeof s === "undefined" || isNaN(s)) s = hsb ? hsb[1] : (hsb = this.hsb)[1];
            if (b === null || typeof b === "undefined" || isNaN(b)) b = hsb ? hsb[2] : (hsb = this.hsb)[2];
            s /= 100;
            b /= 100;
            h = (h % 360 + 360) % 360;
            let i = Math.floor(h / 60) % 6;
            let f = h / 60 - i;
            let p = b * (1 - s);
            let q = b * (1 - f * s);
            let t = b * (1 - (1 - f) * s);
            let r, g, b2;
            switch (i) {
              case 0:
                r = b;
                g = t;
                b2 = p;
                break;
              case 1:
                r = q;
                g = b;
                b2 = p;
                break;
              case 2:
                r = p;
                g = b;
                b2 = t;
                break;
              case 3:
                r = p;
                g = q;
                b2 = b;
                break;
              case 4:
                r = t;
                g = p;
                b2 = b;
                break;
              case 5:
                r = b;
                g = p;
                b2 = q;
                break;
            }
            this.data[this.offset] = Math.round(r * 255);
            this.data[this.offset + 1] = Math.round(g * 255);
            this.data[this.offset + 2] = Math.round(b2 * 255);
            if (typeof alpha === "number" && !isNaN(alpha)) {
              this.data[this.offset + 3] = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
            }
            return this;
          }
          /**
           * Sets the color channels and clamps them to valid ranges
           */
          setClamped(r, g, b, a) {
            const d = this.data, o = this.offset;
            if (typeof r !== "number" || isNaN(r)) r = d[o];
            if (typeof g !== "number" || isNaN(g)) g = d[o + 1];
            if (typeof b !== "number" || isNaN(b)) b = d[o + 2];
            if (typeof a !== "number" || isNaN(a)) a = d[o + 3] / 255;
            d[o] = Math.max(0, Math.min(255, r));
            d[o + 1] = Math.max(0, Math.min(255, g));
            d[o + 2] = Math.max(0, Math.min(255, b));
            d[o + 3] = Math.max(0, Math.min(1, a)) * 255;
            return this;
          }
          /**
           * Sets the color from any valid input
           */
          set(r, g, b, a) {
            Color.parse(r, g, b, a, this.data, this.offset);
            return this;
          }
          /**
           * Sets the color from a hex string, faster for hex inputs than the generic set() method
           */
          setHex(hex) {
            Color.parseHex(hex, this.data, this.offset);
            return this;
          }
          /**
           * Creates a copy of this color, optionally into a provided target and offset
           */
          clone(target = void 0, offset = 0) {
            const c = new Color(target, offset);
            this.copyTo(c.data, c.offset);
            return c;
          }
          toString() {
            return this.rgba;
          }
          toArray() {
            return [this.data[this.offset], this.data[this.offset + 1], this.data[this.offset + 2], this.data[this.offset + 3]];
          }
          toJSON() {
            return {
              r: this.data[this.offset],
              g: this.data[this.offset + 1],
              b: this.data[this.offset + 2],
              a: this.data[this.offset + 3]
            };
          }
          *[Symbol.iterator]() {
            yield this.data[this.offset];
            yield this.data[this.offset + 1];
            yield this.data[this.offset + 2];
            yield this.data[this.offset + 3];
          }
          [Symbol.toPrimitive](hint) {
            if (hint === "number") {
              return this.int;
            }
            return this.rgba;
          }
          get [Symbol.toStringTag]() {
            return "Color";
          }
          valueOf() {
            return this.int;
          }
          /**
           * Creates a Uint8Array pixel with RGBA values
           * @returns {Uint8Array}
           */
          toUint8Array() {
            return new Uint8Array(this.data.slice(this.offset, this.offset + 4));
          }
          /**
           * Creates a WebGL texture with this color
           * @param {WebGLRenderingContext} gl WebGL context
           * @returns {WebGLTexture}
           */
          toTexture(gl) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              // level
              gl.RGBA,
              // internal format
              1,
              1,
              // width, height
              0,
              // border
              gl.RGBA,
              // format
              gl.UNSIGNED_BYTE,
              // type
              this.toUint8Array()
              // pixel data
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            return texture;
          }
          /**
           * Creates an ImageData object with this color
           * @returns {ImageData}
           */
          toImageData() {
            if (!Color.context) Color._createProcessingCanvas();
            const imageData = Color.context.createImageData(1, 1);
            this.copyTo(imageData.data);
            return imageData;
          }
          /**
           * Creates a div element with this color as background
           * @param {number|string} w Optional width
           * @param {number|string} h Optional height
           * @returns {Element}
           */
          toDiv(w, h) {
            const div = document.createElement("div");
            div.style.backgroundColor = this.rgba;
            if (w !== null && w !== void 0) div.style.width = typeof w === "number" ? w + "px" : w;
            if (h !== null && h !== void 0) div.style.height = typeof h === "number" ? h + "px" : h;
            return LS.Select(div);
          }
          /**
           * Sets the sitewide accent from this color
           */
          applyAsAccent() {
            if (!LS.isWeb) return;
            Color.setAccent(this);
            return this;
          }
          /**
           * Creates or updates a sitewide named accent
           */
          toAccent(name = "default") {
            if (!LS.isWeb) return;
            Color.update(name, this);
            return this;
          }
          /**
           * Generates a CSS accent from this color
           */
          toAccentCSS() {
            return Color.generate(this);
          }
          // --- Special methods for multiple pixels
          /**
           * Set offset by pixel index
           */
          at(index) {
            this.offset = index * 4;
            return this;
          }
          /**
           * Set offset by raw index (snapped to pixel index)
           */
          setOffset(index) {
            this.at(Math.floor(index / 4));
            return this;
          }
          next(by = 1) {
            this.offset += by * 4;
            return this;
          }
          get pixelCount() {
            return this.data.length / 4;
          }
          get atEnd() {
            return this.offset + 4 >= this.data.length;
          }
          /**
           * Fills the color data with the given color starting from the current offset. If limit is provided, fills up to that many pixels, otherwise fills to the end of the array.
           * @param {*} r
           * @param {number} g
           * @param {number} b
           * @param {number} a
           * @param {number} offset Optional offset in pixels
           * @param {number} limit Optional maximum number of pixels to fill
          */
          fill(r, g, b, a, offset = 0, limit = -1) {
            Color.parse(r, g, b, a, this.data, offset);
            const sub = Array.isArray(this.data) ? null : this.data.subarray(offset, offset + 4);
            const length = this.data.length;
            for (let i = offset + 4; i < (limit === -1 ? length : Math.min(limit * 4 || length, length)); i += 4) {
              if (sub) {
                this.data.set(sub, i);
              } else {
                this.data[i] = this.data[offset];
                this.data[i + 1] = this.data[offset + 1];
                this.data[i + 2] = this.data[offset + 2];
                this.data[i + 3] = this.data[offset + 3];
              }
            }
            return this;
          }
          // --- Special methods for theme management
          static #settingAccent = null;
          static #settingTheme = null;
          static autoSchemeEnabled = false;
          static {
            this.events = new LS.EventEmitter();
            this.colors = /* @__PURE__ */ new Map();
            if (LS.isWeb) {
              this.style = document.createElement("style");
              document.head.appendChild(this.style);
              this.sheet = this.style.sheet;
              this.style.id = "ls-colors-style";
              if (window.matchMedia) {
                window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (thing) => {
                  if (this.autoSchemeEnabled) {
                    this.setAdaptiveTheme();
                  }
                  this.events.emit("scheme-changed", [thing.matches]);
                });
              }
              if (LS.__deferedColorOptions) {
                this.initOptions(LS.__deferedColorOptions);
                delete LS.__deferedColorOptions;
              }
            }
          }
          static initOptions(options) {
            if (options.theme) this.setTheme(options.theme, false, false);
            if (options.accent) this.setAccent(options.accent, false, false);
            if (options.autoAccent) this.autoAccent();
            if (options.autoScheme) {
              this.autoSchemeEnabled = true;
              this.setAdaptiveTheme();
            }
          }
          static on(event, listener) {
            this.events.on(event, listener);
          }
          static once(event, listener) {
            this.events.once(event, listener);
          }
          static off(event, listener) {
            this.events.off(event, listener);
          }
          /**
           * Parses a color from various input formats and writes it into the target array at the given offset. Strings are case-insensitive and trimmed.
           * Supports:
           * - Hex strings (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
           * - Integer RGB/RGBA (0xRRGGBB, 0xRRGGBBAA)
           * - RGB/RGBA strings (rgb(255, 0, 0), rgba(255, 0, 0, 0.5))
           * - HSL/HSLA strings (hsl(120, 100%, 50%), hsla(120, 100%, 50%, 0.5))
           * - HSB/HSBA strings (hsb(120, 100%, 100%), hsba(120, 100%, 100%, 0.5))
           * - Named CSS colors
           * - Arrays [r, g, b], [r, g, b, a]
           * - Objects { r, g, b }, { r, g, b, a }
           * - Another Color instance
           * - Integer values for r, g, b, a (0-255 for r, g, b and 0-1 for a)
           * - Any valid CSS color string (as a fallback, using the browser's parser)
           * 
           * @param {*} r
           * @param {number} g
           * @param {number} b
           * @param {number} a
           * @param {Array} target
           * @param {number} offset
           * @returns {Array} Target array with parsed color
           * @example
           * Color.parse("#ff0000"); // Note: if you only need to parse hex colors, use Color.parseHex for better performance
           * Color.parse("rgba(255, 0, 0, 0.5)");
           * Color.parse("hsl(120, 100%, 50%)");
           * Color.parse("hsb(120, 100%, 100%)");
           * Color.parse("red");
           * Color.parse([255, 0, 0]);
           * Color.parse({ r: 255, g: 0, b: 0 });
           * Color.parse(new Color());
           * Color.parse(255, 0, 0, 0.5);
           */
          static parse(r, g, b, a, target, offset = 0) {
            target ??= [0, 0, 0, 1];
            if (typeof r === "string") {
              r = r.trim().toLowerCase();
              if (r.length === 0) {
                target[offset] = 0;
                target[offset + 1] = 0;
                target[offset + 2] = 0;
                target[offset + 3] = 255;
                return target;
              }
              if (r.charCodeAt(0) === 35) {
                return Color.parseHex(r, target, offset);
              } else if (r.startsWith("rgb(") || r.startsWith("rgba(")) {
                let match = r.match(/rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([0-9.]+%?))?\s*\)/);
                if (match) {
                  [r, g, b] = match.slice(1, 4).map(Number);
                  let alpha2 = match[4];
                  if (alpha2) {
                    a = Math.max(0, Math.min(1, alpha2.endsWith("%") ? parseFloat(alpha2) / 100 : parseFloat(alpha2)));
                  } else {
                    a = 1;
                  }
                } else {
                  throw new Error("Color " + r + " could not be parsed.");
                }
              } else if (r.startsWith("hsl(") || r.startsWith("hsla(")) {
                let match = r.match(/hsla?\(\s*([0-9.]+)(?:deg)?\s*[, ]\s*([0-9.]+)%?\s*[, ]\s*([0-9.]+)%?\s*(?:[,/]\s*([0-9.]+%?))?\s*\)/);
                if (match) {
                  const temp = new Color();
                  const alpha2 = match[4] ? match[4].endsWith("%") ? parseFloat(match[4]) / 100 : parseFloat(match[4]) : 1;
                  temp.setHSL(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), alpha2);
                  target[offset] = temp.data[0];
                  target[offset + 1] = temp.data[1];
                  target[offset + 2] = temp.data[2];
                  target[offset + 3] = temp.data[3];
                  return target;
                } else {
                  throw new Error("Color " + r + " could not be parsed.");
                }
              } else if (r.startsWith("hsb(") || r.startsWith("hsba(")) {
                let match = r.match(/hsba?\(\s*([0-9.]+)(?:deg)?\s*[, ]\s*([0-9.]+)%?\s*[, ]\s*([0-9.]+)%?\s*(?:[,/]\s*([0-9.]+%?))?\s*\)/);
                if (match) {
                  const temp = new Color();
                  const alpha2 = match[4] ? match[4].endsWith("%") ? parseFloat(match[4]) / 100 : parseFloat(match[4]) : 1;
                  temp.setHSB(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), alpha2);
                  target[offset] = temp.data[0];
                  target[offset + 1] = temp.data[1];
                  target[offset + 2] = temp.data[2];
                  target[offset + 3] = temp.data[3];
                  return target;
                } else {
                  throw new Error("Color " + r + " could not be parsed.");
                }
              } else if (Color.namedColors.has(r)) {
                [r, g, b, a] = Color.namedColors.get(r);
                target[offset] = r;
                target[offset + 1] = g;
                target[offset + 2] = b;
                target[offset + 3] = a !== void 0 ? a : 255;
                return target;
              } else {
                if (!Color.context) {
                  Color._createProcessingCanvas();
                }
                Color.context.fillStyle = "#000000";
                Color.context.fillStyle = r;
                return Color.parseHex(Color.context.fillStyle, target, offset);
              }
            } else if (r instanceof Color) {
              const d = r.data, o = r.offset;
              target[offset] = d[o];
              target[offset + 1] = d[o + 1];
              target[offset + 2] = d[o + 2];
              target[offset + 3] = d[o + 3];
              return target;
            } else if (Array.isArray(r)) {
              [r, g, b, a] = r;
            } else if (typeof r === "object" && r !== null) {
              ({ r = 255, g = 255, b = 255, a = 1 } = r);
            }
            target[offset] = typeof r === "number" && !isNaN(r) ? r : 0;
            target[offset + 1] = typeof g === "number" && !isNaN(g) ? g : 0;
            target[offset + 2] = typeof b === "number" && !isNaN(b) ? b : 0;
            let alpha = 255;
            if (typeof a === "number" && !isNaN(a)) {
              alpha = Math.round(a * 255);
            }
            target[offset + 3] = alpha;
            return target;
          }
          static clamp(target) {
            if (typeof target[0] !== "number" || isNaN(target[0])) target[0] = 0;
            if (typeof target[1] !== "number" || isNaN(target[1])) target[1] = 0;
            if (typeof target[2] !== "number" || isNaN(target[2])) target[2] = 0;
            if (typeof target[3] !== "number" || isNaN(target[3])) target[3] = 255;
            target[0] = Math.round(Math.min(255, Math.max(0, target[0])));
            target[1] = Math.round(Math.min(255, Math.max(0, target[1])));
            target[2] = Math.round(Math.min(255, Math.max(0, target[2])));
            target[3] = Math.round(Math.min(255, Math.max(0, target[3])));
            return target;
          }
          /**
           * Fast hex code parsing. Uses fast.twoh2i, which is zero-allocation and more than 15x faster than parseInt.
           * Pretty much as fast as JavaScript can realistically get.
           * 
           * Note: invalid hex characters result in -1. To validate, check if the result array doesn't contain -1 in any channel.
           * This library will automatically treat such as 0 after clamping; you may or may not want that behavior (eg. #ggg => #000, and the opposite for typed arrays!).
           * https://jsbm.dev/YUQagaiMDfxOv
           * 
           * Note: This does not check the first character for '#', it assumes it's already checked
           * 
           * @param {string} hex Hex string in the format #RGB, #RGBA, #RRGGBB or #RRGGBBAA
           * @param {Array|Uint8Array} target Optional target array to write the result to (default: [0, 0, 0, 255])
           * @param {number} offset Optional offset in the target array to write to (default: 0)
           * @returns {Array} [r, g, b, a] with r, g, b in 0-255 and a in 0-255
           */
          static parseHex(hex, target, offset = 0) {
            const len = hex.length;
            if (len < 4 || len > 9) {
              throw new Error("Invalid hex string: " + hex.slice(0, 10) + (len > 10 ? "..." : ""));
            }
            target ??= [0, 0, 0, 255];
            if (len <= 5) {
              const fasth2i = fast.h2i;
              target[offset] = fasth2i(hex.charCodeAt(1)) * 17;
              target[offset + 1] = fasth2i(hex.charCodeAt(2)) * 17;
              target[offset + 2] = fasth2i(hex.charCodeAt(3)) * 17;
              if (len === 5) target[offset + 3] = fasth2i(hex.charCodeAt(4)) * 17;
            } else {
              const fasth2i = fast.twoh2i;
              target[offset] = fasth2i(hex.charCodeAt(1), hex.charCodeAt(2));
              target[offset + 1] = fasth2i(hex.charCodeAt(3), hex.charCodeAt(4));
              target[offset + 2] = fasth2i(hex.charCodeAt(5), hex.charCodeAt(6));
              if (len === 9) target[offset + 3] = fasth2i(hex.charCodeAt(7), hex.charCodeAt(8));
            }
            return target;
          }
          static validateHex(hex) {
            const len = hex.length;
            if (hex.charCodeAt(0) !== 35 || len !== 4 && len !== 5 && len !== 7 && len !== 9) {
              return false;
            }
            for (let i = 1; i < len; i++) {
              const c = hex.charCodeAt(i);
              if (!(c >= 48 && c <= 57) || // 0-9
              c >= 65 && c <= 70 || // A-F
              c >= 97 && c <= 102)
                return false;
            }
            return true;
          }
          static fromHSL(h, s, l) {
            return new Color().setHSL(h, s, l);
          }
          static fromHSB(h, s, b) {
            return new Color().setHSB(h, s, b);
          }
          static fromHex(hex) {
            return new Color(Color.parseHex(hex));
          }
          static fromInt(int) {
            let r = int >> 16 & 255;
            let g = int >> 8 & 255;
            let b = int & 255;
            return new Color(r, g, b);
          }
          static fromPixel(pixel) {
            return new Color(pixel[0], pixel[1], pixel[2], pixel[3] / 255);
          }
          static fromUint8(data, offset = 0, alpha = true) {
            return new Color(data[offset], data[offset + 1], data[offset + 2], alpha ? data[offset + 3] / 255 : 1);
          }
          static fromObject(obj) {
            return new Color(obj.r, obj.g, obj.b, obj.a);
          }
          static fromArray(arr) {
            return new Color(arr[0], arr[1], arr[2], arr[3]);
          }
          static fromNamed(name) {
            if (Color.namedColors.has(name)) {
              return Color.fromArray(Color.namedColors.get(name));
            }
            throw new Error("Unknown color name: " + name);
          }
          static fromCSS(colorString) {
            if (!Color.context) {
              Color._createProcessingCanvas();
            }
            Color.context.fillStyle = "#000000";
            Color.context.fillStyle = colorString;
            return new Color(Color.context.fillStyle);
          }
          static random() {
            return new Color(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
          }
          static trueRandom() {
            return new Color([...crypto.getRandomValues(new Uint8Array(3))]);
          }
          static get lightModePreffered() {
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
          }
          static get theme() {
            return document.body.getAttribute("ls-theme");
          }
          static set theme(theme) {
            this.setTheme(theme);
          }
          static get accent() {
            return document.body.getAttribute("ls-accent");
          }
          static set accent(color) {
            this.setAccent(color);
          }
          static generate(r, g, b) {
            const color = r instanceof Color ? r.clone() : new Color(r, g, b);
            let style = "";
            const hsl = color.getHSL();
            const h = hsl[0];
            const s = hsl[1];
            const sat = s * 0.12;
            for (let i = 1; i <= 9; i++) {
              const v = i * 10;
              color.setHSL(h, s, v);
              style += `--accent-${v}:${color.hex};`;
              if (i === 3 || i === 4 || i === 5 || i === 9) {
                const vv = v + 5;
                color.setHSL(h, s, vv);
                style += `--accent-${vv}:${color.hex};`;
              }
            }
            color.setHSL(h, sat, 6);
            style += `--base-6:${color.hex};`;
            color.setHSL(h, sat, 8);
            style += `--base-8:${color.hex};`;
            for (let i = 1; i <= 9; i++) {
              const v = i * 10;
              const tone = color.setHSL(h, sat, v).hex;
              const midTone = color.setHSL(h, sat, v + 5).hex;
              style += `--base-${v}:${tone};--base-${v + 5}:${midTone};`;
            }
            color.setHSL(h, sat, 98);
            style += `--base-98:${color.hex};`;
            return style;
          }
          static add(name, r, g, b) {
            if (this.colors.has(name)) return false;
            return this.update(name, r, g, b);
          }
          static ensureRule(name) {
            let accent = this.colors.get(name);
            if (!accent) {
              accent = {};
              this.colors.set(name, accent);
            }
            if (!accent.selector) {
              const safeName = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(String(name)) : String(name).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
              accent.selector = `[ls-accent="${safeName}"]`;
              const ruleIndex = this.sheet.insertRule(`${accent.selector} {}`, this.sheet.cssRules.length);
              accent.ruleIndex = ruleIndex;
            }
            return accent;
          }
          static update(name, r, g, b) {
            const accent = this.ensureRule(name);
            const color = r instanceof Color ? r : new Color(r, g, b);
            accent.color = color;
            const rule = this.sheet.cssRules[accent.ruleIndex];
            if (!(rule instanceof CSSStyleRule)) {
              throw new Error(`Rule at index ${accent.ruleIndex} is not a CSSStyleRule.`);
            }
            rule.style.cssText = this.generate(color);
            return accent;
          }
          static apply(element, r, g, b) {
            let color = r instanceof Color ? r : new Color(r, g, b);
            element.style.cssText += this.generate(color);
            element.setAttribute("ls-accent", "");
          }
          static remove(name) {
            let color = this.colors.get(name);
            if (!color) return false;
            this.colors.delete(name);
            let cssText = "";
            for (const entry of this.colors.values()) {
              if (entry.selector && entry.cssText) {
                cssText += `${entry.selector}{${entry.cssText}}`;
              }
            }
            this.style.textContent = cssText;
            return true;
          }
          static setAccent(accent, store = true, doBatch = true) {
            if (this.#settingAccent) {
              this.#settingAccent = accent;
              return this;
            }
            this.#settingAccent = accent;
            if (!LS.ready) {
              LS.once("ready", () => this.#applyPendingAccent(store));
              return this;
            }
            if (!doBatch) {
              this.#applyPendingAccent(store);
              return this;
            }
            LS.Context.requestAnimationFrame(() => this.#applyPendingAccent(store));
            return this;
          }
          static #applyPendingAccent(store) {
            if (!this.#settingAccent) return;
            let accent = this.#settingAccent;
            document.body.classList.add("no-transitions");
            if (typeof accent !== "string" || (accent[0] === "#" || accent.startsWith("rgb") || accent.startsWith("hsl"))) {
              const color = accent instanceof Color ? accent : new Color(accent);
              accent = color.hex;
              Color.update("custom", color);
              document.body.setAttribute("ls-accent", "custom");
            } else {
              document.body.setAttribute("ls-accent", accent);
            }
            this.events.emit("accent-changed", [accent]);
            if (store) {
              if (accent === "white") {
                localStorage.removeItem("ls-accent");
              } else {
                localStorage.setItem("ls-accent", accent);
              }
            }
            this.#settingAccent = null;
            LS.Context.setTimeout(() => {
              if (this.#settingAccent) return;
              document.body.classList.remove("no-transitions");
            }, 0);
          }
          static setTheme(theme, store = true, doBatch = true) {
            if (this.#settingTheme) {
              this.#settingTheme = theme;
              return this;
            }
            this.#settingTheme = theme;
            if (!LS.ready) {
              LS.once("ready", () => this.#applyPendingTheme(store));
              return this;
            }
            if (!doBatch) {
              this.#applyPendingTheme(store);
              return this;
            }
            LS.Context.requestAnimationFrame(() => this.#applyPendingTheme(store));
            return this;
          }
          static #applyPendingTheme(store) {
            if (!this.#settingTheme) return;
            const theme = this.#settingTheme;
            document.body.setAttribute("ls-theme", theme);
            document.body.classList.add("no-transitions");
            this.events.emit("theme-changed", [theme]);
            if (store) localStorage.setItem("ls-theme", theme);
            this.#settingTheme = null;
            LS.Context.setTimeout(() => {
              if (this.#settingTheme) return;
              document.body.classList.remove("no-transitions");
            }, 0);
          }
          static setAdaptiveTheme() {
            Color.setTheme(localStorage.getItem("ls-theme") || (this.lightModePreffered ? "light" : "dark"), false);
            return this;
          }
          /**
           * @deprecated
           */
          static autoScheme() {
            this.setAdaptiveTheme();
            this.autoSchemeEnabled = true;
            return this;
          }
          static autoAccent() {
            if (localStorage.hasOwnProperty("ls-accent")) {
              const accent = localStorage.getItem("ls-accent");
              Color.setAccent(accent, false);
            }
            return this;
          }
          static fromBuffer(buffer, offset = 0) {
            return new Color(buffer, offset);
          }
          static fromImage(image, sampleGap = 16, maxResolution = 200) {
            if (!(image instanceof HTMLImageElement)) {
              throw new TypeError("The first argument must be an image element");
            }
            image.crossOrigin = "Anonymous";
            sampleGap += sampleGap % 4;
            let pixelIndex = -4, sum = [0, 0, 0], sampleCount = 0;
            if (!Color.canvas) {
              Color._createProcessingCanvas();
            }
            if (Color.context && Color.context.getImageData) {
              Color.context.willReadFrequently = true;
            }
            if (!Color.context) return new Color(0, 0, 0);
            const scale = Math.min(1, maxResolution / Math.max(image.naturalWidth, image.naturalHeight));
            Color.canvas.width = Math.ceil(image.naturalWidth * scale);
            Color.canvas.height = Math.ceil(image.naturalHeight * scale);
            Color.context.drawImage(image, 0, 0, Color.canvas.width, Color.canvas.height);
            let imageData;
            try {
              imageData = Color.context.getImageData(0, 0, Color.canvas.width, Color.canvas.height);
            } catch (error) {
              console.error(error);
              return new Color(0, 0, 0);
            }
            for (let i = imageData.data.length; (pixelIndex += sampleGap) < i; ) {
              ++sampleCount;
              sum[0] += imageData.data[pixelIndex];
              sum[1] += imageData.data[pixelIndex + 1];
              sum[2] += imageData.data[pixelIndex + 2];
            }
            return new Color(sum[0] = ~~(sum[0] / sampleCount), sum[1] = ~~(sum[1] / sampleCount), sum[2] = ~~(sum[2] / sampleCount));
          }
          static _createProcessingCanvas() {
            if (!Color.canvas) {
              const canvas = document.createElement("canvas");
              Color.canvas = canvas;
              Color.context = canvas.getContext("2d");
            }
          }
          static namedColors = /* @__PURE__ */ new Map([
            ["aliceblue", [240, 248, 255]],
            ["antiquewhite", [250, 235, 215]],
            ["aqua", [0, 255, 255]],
            ["aquamarine", [127, 255, 212]],
            ["azure", [240, 255, 255]],
            ["beige", [245, 245, 220]],
            ["bisque", [255, 228, 196]],
            ["black", [0, 0, 0]],
            ["blanchedalmond", [255, 235, 205]],
            ["blue", [0, 0, 255]],
            ["blueviolet", [138, 43, 226]],
            ["brown", [165, 42, 42]],
            ["burlywood", [222, 184, 135]],
            ["cadetblue", [95, 158, 160]],
            ["chartreuse", [127, 255, 0]],
            ["chocolate", [210, 105, 30]],
            ["coral", [255, 127, 80]],
            ["cornflowerblue", [100, 149, 237]],
            ["cornsilk", [255, 248, 220]],
            ["crimson", [220, 20, 60]],
            ["cyan", [0, 255, 255]],
            ["darkblue", [0, 0, 139]],
            ["darkcyan", [0, 139, 139]],
            ["darkgoldenrod", [184, 134, 11]],
            ["darkgray", [169, 169, 169]],
            ["darkgreen", [0, 100, 0]],
            ["darkgrey", [169, 169, 169]],
            ["darkkhaki", [189, 183, 107]],
            ["darkmagenta", [139, 0, 139]],
            ["darkolivegreen", [85, 107, 47]],
            ["darkorange", [255, 140, 0]],
            ["darkorchid", [153, 50, 204]],
            ["darkred", [139, 0, 0]],
            ["darksalmon", [233, 150, 122]],
            ["darkseagreen", [143, 188, 143]],
            ["darkslateblue", [72, 61, 139]],
            ["darkslategray", [47, 79, 79]],
            ["darkslategrey", [47, 79, 79]],
            ["darkturquoise", [0, 206, 209]],
            ["darkviolet", [148, 0, 211]],
            ["deeppink", [255, 20, 147]],
            ["deepskyblue", [0, 191, 255]],
            ["dimgray", [105, 105, 105]],
            ["dimgrey", [105, 105, 105]],
            ["dodgerblue", [30, 144, 255]],
            ["firebrick", [178, 34, 34]],
            ["floralwhite", [255, 250, 240]],
            ["forestgreen", [34, 139, 34]],
            ["fuchsia", [255, 0, 255]],
            ["gainsboro", [220, 220, 220]],
            ["ghostwhite", [248, 248, 255]],
            ["gold", [255, 215, 0]],
            ["goldenrod", [218, 165, 32]],
            ["gray", [128, 128, 128]],
            ["green", [0, 128, 0]],
            ["greenyellow", [173, 255, 47]],
            ["grey", [128, 128, 128]],
            ["honeydew", [240, 255, 240]],
            ["hotpink", [255, 105, 180]],
            ["indianred", [205, 92, 92]],
            ["indigo", [75, 0, 130]],
            ["ivory", [255, 255, 240]],
            ["khaki", [240, 230, 140]],
            ["lavender", [230, 230, 250]],
            ["lavenderblush", [255, 240, 245]],
            ["lawngreen", [124, 252, 0]],
            ["lemonchiffon", [255, 250, 205]],
            ["lightblue", [173, 216, 230]],
            ["lightcoral", [240, 128, 128]],
            ["lightcyan", [224, 255, 255]],
            ["lightgoldenrodyellow", [250, 250, 210]],
            ["lightgray", [211, 211, 211]],
            ["lightgreen", [144, 238, 144]],
            ["lightgrey", [211, 211, 211]],
            ["lightpink", [255, 182, 193]],
            ["lightsalmon", [255, 160, 122]],
            ["lightseagreen", [32, 178, 170]],
            ["lightskyblue", [135, 206, 250]],
            ["lightslategray", [119, 136, 153]],
            ["lightslategrey", [119, 136, 153]],
            ["lightsteelblue", [176, 196, 222]],
            ["lightyellow", [255, 255, 224]],
            ["lime", [0, 255, 0]],
            ["limegreen", [50, 205, 50]],
            ["linen", [250, 240, 230]],
            ["magenta", [255, 0, 255]],
            ["maroon", [128, 0, 0]],
            ["mediumaquamarine", [102, 205, 170]],
            ["mediumblue", [0, 0, 205]],
            ["mediumorchid", [186, 85, 211]],
            ["mediumpurple", [147, 112, 219]],
            ["mediumseagreen", [60, 179, 113]],
            ["mediumslateblue", [123, 104, 238]],
            ["mediumspringgreen", [0, 250, 154]],
            ["mediumturquoise", [72, 209, 204]],
            ["mediumvioletred", [199, 21, 133]],
            ["midnightblue", [25, 25, 112]],
            ["mintcream", [245, 255, 250]],
            ["mistyrose", [255, 228, 225]],
            ["moccasin", [255, 228, 181]],
            ["navajowhite", [255, 222, 173]],
            ["navy", [0, 0, 128]],
            ["oldlace", [253, 245, 230]],
            ["olive", [128, 128, 0]],
            ["olivedrab", [107, 142, 35]],
            ["orange", [255, 165, 0]],
            ["orangered", [255, 69, 0]],
            ["orchid", [218, 112, 214]],
            ["palegoldenrod", [238, 232, 170]],
            ["palegreen", [152, 251, 152]],
            ["paleturquoise", [175, 238, 238]],
            ["palevioletred", [219, 112, 147]],
            ["papayawhip", [255, 239, 213]],
            ["peachpuff", [255, 218, 185]],
            ["peru", [205, 133, 63]],
            ["pink", [255, 192, 203]],
            ["plum", [221, 160, 221]],
            ["powderblue", [176, 224, 230]],
            ["purple", [128, 0, 128]],
            ["rebeccapurple", [102, 51, 153]],
            ["red", [255, 0, 0]],
            ["rosybrown", [188, 143, 143]],
            ["royalblue", [65, 105, 225]],
            ["saddlebrown", [139, 69, 19]],
            ["salmon", [250, 128, 114]],
            ["sandybrown", [244, 164, 96]],
            ["seagreen", [46, 139, 87]],
            ["seashell", [255, 245, 238]],
            ["sienna", [160, 82, 45]],
            ["silver", [192, 192, 192]],
            ["skyblue", [135, 206, 235]],
            ["slateblue", [106, 90, 205]],
            ["slategray", [112, 128, 144]],
            ["slategrey", [112, 128, 144]],
            ["snow", [255, 250, 250]],
            ["springgreen", [0, 255, 127]],
            ["steelblue", [70, 130, 180]],
            ["tan", [210, 180, 140]],
            ["teal", [0, 128, 128]],
            ["thistle", [216, 191, 216]],
            ["tomato", [255, 99, 71]],
            ["turquoise", [64, 224, 208]],
            ["violet", [238, 130, 238]],
            ["wheat", [245, 222, 179]],
            ["white", [255, 255, 255]],
            ["whitesmoke", [245, 245, 245]],
            ["yellow", [255, 255, 0]],
            ["yellowgreen", [154, 205, 50]],
            ["transparent", [0, 0, 0, 0]]
          ]);
        };
      })();
      LS.CompileTemplate = (() => {
        class ifNode {
          constructor(condition, thenValue, elseValue) {
            this.__lsIf = true;
            this.branches = [{ condition, value: thenValue }];
            this.hasElse = typeof elseValue !== "undefined";
            this.elseValue = elseValue;
          }
          elseIf(cond, value) {
            this.branches.push({ condition: cond, value });
            return this;
          }
          else(value) {
            this.hasElse = true;
            this.elseValue = value;
            return this;
          }
        }
        const symbolProxy = new Proxy({}, {
          get(target, prop) {
            return Symbol(prop);
          }
        });
        const iterProxy = new Proxy({}, {
          get(target, prop) {
            return /* @__PURE__ */ Symbol(`__iter__.${String(prop)}`);
          }
        });
        const logic = {
          // Conditional node
          if(condition, thenValue, elseValue) {
            return new ifNode(condition, thenValue, elseValue);
          },
          // Export node
          export(name, input) {
            input.__exportName = name;
            return input;
          },
          // Concat strings
          concat(...args) {
            return { __lsConcat: true, args };
          },
          // Join with separator
          join(sep, ...args) {
            return { __lsJoin: true, sep, args };
          },
          // Or
          or(...args) {
            return { __lsOr: true, args };
          },
          // Loop
          map(source, fn) {
            return { __lsMap: true, source, fn };
          }
        };
        return (templateBuilder, asString = false) => {
          let template = typeof templateBuilder === "function" ? templateBuilder(symbolProxy, logic) : templateBuilder;
          if (!Array.isArray(template)) {
            template = [template];
          }
          const lines = [];
          let varCounter = 0;
          const exports2 = [];
          function stripWhitespace(value) {
            return (value ?? "").toString().replace(/\s+/g, "");
          }
          const iterPrefix = "__iter__.";
          function dataRef(sym, iterVar) {
            const desc = stripWhitespace(sym && sym.description) || "";
            let prefix = "d.", key = desc;
            if (iterVar && desc.startsWith(iterPrefix)) {
              key = desc.slice(iterPrefix.length);
              prefix = `${iterVar}.`;
            }
            return `${prefix}${key.replace(/[^a-zA-Z0-9_$.]/g, "_").replace(/\.\.*/g, ".")}`;
          }
          function jsValue(value, iterVar = null) {
            if (typeof value === "symbol") return dataRef(value, iterVar);
            if (value === void 0) return "undefined";
            if (value && typeof value === "object") {
              if (value.__lsOr) {
                const argExprs = value.args.map((arg) => `(${jsValue(arg, iterVar)})`);
                return argExprs.join(" || ");
              }
              if (value.__lsJoin) {
                const argExprs = value.args.map((arg) => jsValue(arg, iterVar));
                return `[${argExprs.join(",")}].filter(Boolean).join(${JSON.stringify(value.sep)})`;
              }
              if (value.__lsConcat) {
                const argExprs = value.args.map((arg) => `String(${jsValue(arg, iterVar)})`);
                return `(${argExprs.join(" + ")})`;
              }
            }
            return JSON.stringify(value);
          }
          function isIfNode(value) {
            return !!(value && typeof value === "object" && value.__lsIf);
          }
          function isMapNode(value) {
            return !!(value && typeof value === "object" && value.__lsMap);
          }
          function containsConditional(value) {
            if (isIfNode(value)) return true;
            if (Array.isArray(value)) return value.some(containsConditional);
            return false;
          }
          function textNodeExpr(value, iterVar = null) {
            return `document.createTextNode(${jsValue(value, iterVar)})`;
          }
          function conditionExpr(condition, iterVar = null) {
            return `!!(${jsValue(condition, iterVar)})`;
          }
          function getVarName(prefix = "e") {
            return `${prefix}${varCounter++}`;
          }
          function emitToArray(arrayVar, value, iterVar = null) {
            if (value === null || value === void 0) return;
            if (isIfNode(value)) {
              const branches = value.branches || [];
              if (branches.length > 0) {
                lines.push(`if(${conditionExpr(branches[0].condition, iterVar)}){`);
                const branchValue = branches[0].value;
                if (Array.isArray(branchValue)) {
                  for (const v of branchValue) emitToArray(arrayVar, v, iterVar);
                } else {
                  emitToArray(arrayVar, branchValue, iterVar);
                }
                for (let i = 1; i < branches.length; i++) {
                  lines.push(`}else if(${conditionExpr(branches[i].condition, iterVar)}){`);
                  const branchValue2 = branches[i].value;
                  if (Array.isArray(branchValue2)) {
                    for (const v of branchValue2) emitToArray(arrayVar, v, iterVar);
                  } else {
                    emitToArray(arrayVar, branchValue2, iterVar);
                  }
                }
                if (value.hasElse) {
                  lines.push(`}else{`);
                  const elseValue = value.elseValue;
                  if (Array.isArray(elseValue)) {
                    for (const v of elseValue) emitToArray(arrayVar, v, iterVar);
                  } else {
                    emitToArray(arrayVar, elseValue, iterVar);
                  }
                }
                lines.push(`}`);
              } else if (value.hasElse) {
                const elseValue = value.elseValue;
                if (Array.isArray(elseValue)) {
                  for (const v of elseValue) emitToArray(arrayVar, v, iterVar);
                } else {
                  emitToArray(arrayVar, elseValue, iterVar);
                }
              }
              return;
            }
            if (isMapNode(value)) {
              const arrVar = getVarName("a");
              const itVar = getVarName("i");
              const mapItemTemplate = value.fn?.(iterProxy, logic);
              lines.push(`var ${arrVar}=${jsValue(value.source)}||[];`);
              lines.push(`for(const ${itVar} of ${arrVar}){`);
              emitToArray(arrayVar, mapItemTemplate, itVar);
              lines.push(`}`);
              return;
            }
            if (Array.isArray(value)) {
              const wrapperVar = getVarName();
              lines.push(`var ${wrapperVar}=document.createElement("div");`);
              for (const v of value) emitToElement(wrapperVar, v, iterVar);
              lines.push(`${arrayVar}.push(${wrapperVar});`);
              return;
            }
            if (typeof value === "string" || typeof value === "symbol" || typeof value === "number" || typeof value === "boolean") {
              lines.push(`${arrayVar}.push(${textNodeExpr(value, iterVar)});`);
              return;
            }
            if (typeof value !== "object") return;
            const nodeVar = processItem(value, null, iterVar);
            if (nodeVar) lines.push(`${arrayVar}.push(${nodeVar});`);
          }
          function emitToElement(parentVar, value, iterVar = null) {
            if (value === null || value === void 0) return;
            if (isIfNode(value)) {
              const branches = value.branches || [];
              if (branches.length > 0) {
                lines.push(`if(${conditionExpr(branches[0].condition, iterVar)}){`);
                const branchValue = branches[0].value;
                if (Array.isArray(branchValue)) {
                  for (const v of branchValue) emitToElement(parentVar, v, iterVar);
                } else {
                  emitToElement(parentVar, branchValue, iterVar);
                }
                for (let i = 1; i < branches.length; i++) {
                  lines.push(`}else if(${conditionExpr(branches[i].condition, iterVar)}){`);
                  const branchValue2 = branches[i].value;
                  if (Array.isArray(branchValue2)) {
                    for (const v of branchValue2) emitToElement(parentVar, v, iterVar);
                  } else {
                    emitToElement(parentVar, branchValue2, iterVar);
                  }
                }
                if (value.hasElse) {
                  lines.push(`}else{`);
                  const elseValue = value.elseValue;
                  if (Array.isArray(elseValue)) {
                    for (const v of elseValue) emitToElement(parentVar, v, iterVar);
                  } else {
                    emitToElement(parentVar, elseValue, iterVar);
                  }
                }
                lines.push(`}`);
              } else if (value.hasElse) {
                const elseValue = value.elseValue;
                if (Array.isArray(elseValue)) {
                  for (const v of elseValue) emitToElement(parentVar, v, iterVar);
                } else {
                  emitToElement(parentVar, elseValue, iterVar);
                }
              }
              return;
            }
            if (isMapNode(value)) {
              const arrVar = getVarName("a");
              const itVar = getVarName("i");
              const mapItemTemplate = value.fn?.(iterProxy, logic);
              lines.push(`var ${arrVar}=${jsValue(value.source)}||[];`);
              lines.push(`for(const ${itVar} of ${arrVar}){`);
              emitToElement(parentVar, mapItemTemplate, itVar);
              lines.push(`}`);
              return;
            }
            if (Array.isArray(value)) {
              const wrapperVar = getVarName();
              lines.push(`var ${wrapperVar}=document.createElement("div");`);
              for (const v of value) emitToElement(wrapperVar, v, iterVar);
              lines.push(`${parentVar}.appendChild(${wrapperVar});`);
              return;
            }
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              lines.push(`${parentVar}.appendChild(${textNodeExpr(value, iterVar)});`);
              return;
            }
            if (typeof value === "symbol") {
              lines.push(`${parentVar}.appendChild(LS.toNode(${jsValue(value, iterVar)}));`);
              return;
            }
            if (typeof value !== "object") return;
            const nodeVar = processItem(value, null, iterVar);
            if (nodeVar) lines.push(`${parentVar}.appendChild(${nodeVar});`);
          }
          function processItem(item, assignTo = null, iterVar = null) {
            if (typeof item === "symbol") {
              const dynVar = assignTo || getVarName("dyn");
              const valueExpr = jsValue(item, iterVar);
              lines.push(`var ${dynVar}=LS.toNode(${valueExpr});`);
              return dynVar;
            }
            if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
              if (assignTo) {
                lines.push(`var ${assignTo}=document.createTextNode(${jsValue(item, iterVar)});`);
                return assignTo;
              }
              return `document.createTextNode(${jsValue(item, iterVar)})`;
            }
            if (typeof item !== "object" || item === null) {
              return null;
            }
            if (isIfNode(item)) {
              throw new Error("CompileTemplate error: conditional nodes (logic.if) must be used as children/root values, not as an element object.");
            }
            if (typeof Element !== "undefined" && item instanceof Element) {
              throw new Error("CompileTemplate error: you can't pass a live Element to a template.");
            }
            const {
              tag,
              tagName: tn,
              __exportName,
              class: className,
              tooltip,
              ns,
              accent,
              style,
              inner,
              content: innerContent,
              reactive,
              attr,
              options,
              attributes,
              sanitize,
              state,
              ...rest
            } = item;
            const tagName = tag || tn || "div";
            const varName = assignTo || getVarName();
            const needsExport = !!__exportName;
            if (ns) {
              lines.push(`var ${varName}=document.createElementNS(${JSON.stringify(ns)},${JSON.stringify(tagName)});`);
            } else {
              lines.push(`var ${varName}=document.createElement(${JSON.stringify(tagName)});`);
            }
            if (needsExport) {
              exports2.push({ name: __exportName, varName });
            }
            for (const [key, value] of Object.entries(rest)) {
              if (typeof value === "function") {
                console.warn(`CompileTemplate: function property "${key}" will be ignored`);
              } else if (value !== null && value !== void 0) {
                lines.push(`${varName}.${key}=${jsValue(value, iterVar)};`);
              }
            }
            if (accent) {
              lines.push(`${varName}.setAttribute("ls-accent",${jsValue(accent, iterVar)});`);
            }
            if (tooltip) {
              lines.push(`${varName}.setAttribute("ls-tooltip",${jsValue(tooltip, iterVar)});LS.Tooltips.updateElement(${varName});`);
            }
            if (reactive) {
              lines.push(`if(!LS.Reactive){LS.on&&LS.on("component-loaded",(c)=>{if(c&&c.name&&c.name.toLowerCase&&c.name.toLowerCase()==="reactive"){LS.Reactive.bindElement(${varName},${jsValue(reactive, iterVar)});return LS.REMOVE_LISTENER;}});}else{LS.Reactive.bindElement(${varName},${jsValue(reactive, iterVar)});}`);
            }
            if (state) {
              lines.push(`${varName}.setAttribute("data-ls-state",${jsValue(state, iterVar)});`);
            }
            const attrs = attr || attributes;
            if (attrs) {
              if (Array.isArray(attrs)) {
                for (const a of attrs) {
                  if (typeof a === "string") {
                    lines.push(`${varName}.setAttribute(${JSON.stringify(a)},"");`);
                  } else if (typeof a === "object" && a !== null) {
                    for (const [aKey, aValue] of Object.entries(a)) {
                      lines.push(`${varName}.setAttribute(${JSON.stringify(aKey)},${jsValue(aValue ?? "", iterVar)});`);
                    }
                  }
                }
              } else if (typeof attrs === "object") {
                for (const [aKey, aValue] of Object.entries(attrs)) {
                  lines.push(`${varName}.setAttribute(${JSON.stringify(aKey)},${jsValue(aValue ?? "", iterVar)});`);
                }
              }
            }
            if (className) {
              if (Array.isArray(className)) {
                lines.push(`${varName}.className=${JSON.stringify(className.filter(Boolean).join(" "))};`);
              } else {
                lines.push(`${varName}.className=${jsValue(className, iterVar)};`);
              }
            }
            if (style) {
              if (typeof style === "string") {
                lines.push(`${varName}.style.cssText=${JSON.stringify(style)};`);
              } else if (typeof style === "object") {
                const styleEntries = Object.entries(style);
                if (styleEntries.length > 0) {
                  const staticParts = [];
                  const dynamicParts = [];
                  for (const [rule, value] of styleEntries) {
                    const prop = rule.startsWith("--") ? rule : rule.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
                    if (typeof value === "symbol") {
                      dynamicParts.push({ prop, value });
                    } else {
                      staticParts.push(`${prop}:${value}`);
                    }
                  }
                  if (dynamicParts.length === 0) {
                    lines.push(`${varName}.style.cssText=${JSON.stringify(staticParts.join(";"))};`);
                  } else if (staticParts.length === 0) {
                    const parts2 = dynamicParts.map((d) => `${JSON.stringify(d.prop + ":")}+${dataRef(d.value, iterVar)}`);
                    lines.push(`${varName}.style.cssText=${parts2.join('+";"+')};`);
                  } else {
                    const dynamicExprs = dynamicParts.map((d) => `${JSON.stringify(";" + d.prop + ":")}+${dataRef(d.value, iterVar)}`);
                    lines.push(`${varName}.style.cssText=${JSON.stringify(staticParts.join(";"))}+${dynamicExprs.join("+")};`);
                  }
                }
              }
            }
            if (tagName.toLowerCase() === "ls-select" && options) {
              lines.push(`${varName}._lsSelectOptions=${jsValue(options, iterVar)};`);
            }
            const contentToAdd = inner || innerContent;
            if (contentToAdd !== void 0 && contentToAdd !== null) {
              if (contentToAdd.__lsOr) {
                throw new Error("CompileTemplate error: logic.or cannot be used as element content via inner at this time. Consider { textContent: logic.or(...) } or logic.if(a, b, c) instead.");
              }
              if (isMapNode(contentToAdd)) {
                emitToElement(varName, contentToAdd, iterVar);
              } else if (typeof contentToAdd === "symbol") {
                lines.push(`${varName}.append(LS.toNode(${dataRef(contentToAdd, iterVar)}));`);
              } else if (typeof contentToAdd === "string") {
                lines.push(`${varName}.textContent=${jsValue(contentToAdd, iterVar)};`);
              } else if (typeof contentToAdd === "number") {
                lines.push(`${varName}.textContent=${JSON.stringify(String(contentToAdd))};`);
              } else {
                const children = Array.isArray(contentToAdd) ? contentToAdd : [contentToAdd];
                const validChildren = children.filter((c) => c !== null && c !== void 0);
                const hasConditional = validChildren.some(containsConditional);
                if (hasConditional) {
                  for (const child of validChildren) {
                    emitToElement(varName, child, iterVar);
                  }
                } else {
                  if (validChildren.length === 1) {
                    const child = validChildren[0];
                    if (typeof child === "string" || typeof child === "symbol") {
                      const childExpr = processItem(child, null, iterVar);
                      if (childExpr) {
                        lines.push(`${varName}.appendChild(${childExpr});`);
                      }
                    } else if (Array.isArray(child)) {
                      emitToElement(varName, child, iterVar);
                    } else {
                      const childVar = processItem(child, null, iterVar);
                      if (childVar) {
                        lines.push(`${varName}.appendChild(${childVar});`);
                      }
                    }
                  } else if (validChildren.length > 1) {
                    const childRefs = [];
                    for (const child of validChildren) {
                      if (typeof child === "string" || typeof child === "symbol") {
                        const expr = processItem(child, null, iterVar);
                        if (expr) childRefs.push(expr);
                      } else if (Array.isArray(child)) {
                        const wrapperVar = getVarName();
                        lines.push(`var ${wrapperVar}=document.createElement("div");`);
                        for (const v of child) emitToElement(wrapperVar, v, iterVar);
                        childRefs.push(wrapperVar);
                      } else {
                        const childVar = processItem(child, null, iterVar);
                        if (childVar) childRefs.push(childVar);
                      }
                    }
                    if (childRefs.length > 0) {
                      lines.push(`${varName}.append(${childRefs.join(",")});`);
                    }
                  }
                }
              }
            }
            if (sanitize) {
              lines.push(`LS.Util.sanitize(${varName});`);
            }
            return varName;
          }
          const rootHasConditional = template.some(containsConditional);
          if (rootHasConditional) {
            lines.push(`var __root=[];`);
            for (const item of template) {
              emitToArray(`__root`, item, null);
            }
            lines.push(`var __rootValue=__root.length===1?__root[0]:__root;`);
          } else {
            if (template.length === 1) {
              const item = template[0];
              if (Array.isArray(item)) {
                const wrapperVar = getVarName();
                lines.push(`var ${wrapperVar}=document.createElement("div");`);
                for (const v of item) emitToElement(wrapperVar, v, null);
                lines.push(`var __rootValue=${wrapperVar};`);
              } else if (typeof item === "string" || typeof item === "symbol") {
                lines.push(`var __rootValue=${textNodeExpr(item, null)};`);
              } else {
                const rootVar = processItem(item, null, null);
                lines.push(`var __rootValue=${rootVar};`);
              }
            } else if (template.length > 1) {
              const rootRefs = [];
              for (const item of template) {
                if (Array.isArray(item)) {
                  const wrapperVar = getVarName();
                  lines.push(`var ${wrapperVar}=document.createElement("div");`);
                  for (const v of item) emitToElement(wrapperVar, v, null);
                  rootRefs.push(wrapperVar);
                } else if (typeof item === "string" || typeof item === "symbol") {
                  const nodeVar = getVarName();
                  lines.push(`var ${nodeVar}=${textNodeExpr(item, null)};`);
                  rootRefs.push(nodeVar);
                } else {
                  const nodeVar = processItem(item, null, null);
                  if (nodeVar) rootRefs.push(nodeVar);
                }
              }
              lines.push(`var __rootValue=[${rootRefs.join(",")}];`);
            } else {
              lines.push(`var __rootValue=null;`);
            }
          }
          const retParts = [];
          for (const exp of exports2) {
            retParts.push(`${JSON.stringify(exp.name)}:${exp.varName}`);
          }
          retParts.push(`root:__rootValue`);
          lines.push(`return{${retParts.join(",")}};`);
          const fnBody = `'use strict';${lines.join("")}`;
          if (asString) return `function(d){${fnBody}}`;
          try {
            return new Function("d", fnBody);
          } catch (e) {
            console.error("CompileTemplate error:", e, "\nGenerated code:", fnBody);
            throw e;
          }
        };
      })();
      /**
       * Provides draggable elements and droppable zones with preview, snapping,
       * constraints, optional cloning, and auto-scrolling.
       * 
       * Based on the original LSv3 implementation.
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      LS.LoadComponent(class DragDrop extends LS.Component {
        static DROP_TARGET_DEFAULTS = {
          id: null,
          outsideParent: false,
          relativeMouse: false,
          animate: false,
          dropPreview: true,
          absoluteX: false,
          absoluteY: false,
          preserveHeight: true,
          overflow: false,
          container: null,
          scrollContainer: null,
          sameParent: false,
          strictDrop: true,
          movementOnly: false,
          multiList: null,
          lockX: false,
          lockY: false,
          scrollY: true,
          scrollX: true,
          clone: false,
          allowedTargets: [],
          getters: {},
          snapEnabled: false,
          snapArea: 5,
          tolerance: 5,
          swap: false,
          handle: null
        };
        #handlers = /* @__PURE__ */ new Map();
        #state = {
          moving: false,
          engaged: false,
          current: null,
          items: [],
          multi: false,
          parent: null,
          previewBox: null,
          dragArea: null,
          target: null,
          prevX: 0,
          prevY: 0,
          currentX: 0,
          currentY: 0,
          velocityX: 0,
          velocityY: 0,
          initialX: 0,
          initialY: 0,
          boundX: 0,
          boundY: 0,
          relative: null,
          scrollAllowed: false,
          snapValues: null
        };
        /**
         * Creates a DragDrop manager with specified options.
         * @param {*} options Options
         * @property {boolean} outsideParent - If true, drag only starts when cursor leaves the parent element.
         * @property {boolean} relativeMouse - If true, the element is positioned relative to the mouse cursor offset at start.
         * @property {boolean} animate - If true, applies inertial animation (tilt/velocity) during drag.
         * @property {boolean} dropPreview - If true, shows a placeholder box in the drop zone.
         * @property {boolean} absoluteX - If true, calculates absolute X position relative to container (useful for free positioning).
         * @property {boolean} absoluteY - If true, calculates absolute Y position relative to container (useful for free positioning).
         * @property {boolean} preserveHeight - If true, the drag area maintains the height of the dragged element.
         * @property {boolean} overflow - If false, constrains the element within the container boundaries (when absolute positioning is used).
         * @property {HTMLElement|string|null} container - The boundary container for the drag operation. Defaults to parent.
         * @property {HTMLElement|string|null} scrollContainer - The container that should scroll when dragging near edges. Defaults to container or parent.
         * @property {boolean} sameParent - If true, forces drop hover detection on the original parent immediately.
         * @property {boolean} strictDrop - If true, requires the mouse to be directly over a drop zone element. If false, uses the last valid hovered zone.
         * @property {boolean} movementOnly - If true, disables dropping logic entirely; element just moves visually.
         * @property {boolean} lockX - If true, prevents movement along the X-axis.
         * @property {boolean} lockY - If true, prevents movement along the Y-axis.
         * @property {boolean} scrollY - If true, enables auto-scrolling vertically.
         * @property {boolean} scrollX - If true, enables auto-scrolling horizontally.
         * @property {boolean} clone - If true, drags a copy of the element instead of the original.
         * @property {Array<string>} allowedTargets - List of allowed drop zone identifiers/types.
         * @property {Object} getters - Configuration for dynamic values (e.g., `snapAt`).
         * @property {Array<HTMLElement>} [getters.snapAt] - Array of elements to snap to.
         * @property {number} snapArea - Distance in pixels within which snapping occurs.
         * @property {number} tolerance - Distance in pixels mouse must move before drag initiates.
         * @property {boolean} swap - (Unused in current logic) Intended for swapping elements.
         * @property {HTMLElement|string|null} handle - Specific element to act as the drag handle. Defaults to the target element itself.
         * @property {Set<HTMLElement>} multiList - Optional set of elements to drag at once.
         */
        constructor(options = {}) {
          super();
          this.options = LS.Util.defaults(this.constructor.DROP_TARGET_DEFAULTS, options);
          this.draggables = /* @__PURE__ */ new Set();
          this.dropzones = /* @__PURE__ */ new Set();
          this.frameScheduler = new LS.Util.FrameScheduler(() => this.#render());
          this.#state.dragArea = LS.Create({ class: "ls-drag-area", style: "position: fixed; pointer-events: none; display: none; top: 0; left: 0" });
          this.#state.snapLine = LS.Create({ class: "ls-drag-snap-line", style: "position: fixed; pointer-events: none; display: none; width: 1px; background: var(--accent-60); z-index: 10000; top: 0; left: 0" });
          this.#state.previewBox = LS.Create({ class: "ls-drop-preview", style: "display: none" });
          LS.once("ready", () => {
            LS._topLayer.appendChild(this.#state.dragArea);
            LS._topLayer.appendChild(this.#state.snapLine);
          });
        }
        /**
         * Makes an element draggable.
         * @param {*} target Element or selector
         * @returns 
         */
        set(target, options = {}) {
          const element = LS.Tiny.O(target);
          element.lsDragEnabled = true;
          element.lsDragOptions = options || {};
          this.draggables.add(element);
          const scrollParent = this.#getFather(true, element, this.options);
          if (scrollParent) scrollParent.on("mouseenter", () => {
            this.#state.scrollAllowed = true;
          });
          const handle = LS.Tiny.O(this.options.handle || element);
          const touchHandler = new LS.Util.TouchHandle(handle, {
            buttons: [0],
            cursor: "grabbing",
            disablePointerEvents: false,
            ...this.options.handleOptions || {},
            onStart: (event) => this.#onInputStart(event),
            onMove: (event) => this.#onInputMove(event.x, event.y),
            onEnd: () => this.#onInputEnd()
          });
          this.#handlers.set(element, touchHandler);
          return this;
        }
        /**
         * Removes drag capability from an element.
         * @param {*} target Element or selector
         */
        remove(target) {
          const el = LS.Tiny.O(target);
          if (this.#handlers.has(el)) {
            this.#handlers.get(el).destroy();
            this.#handlers.delete(el);
          }
          this.draggables.delete(el);
          delete el.lsDragEnabled;
          delete el.lsDragOptions;
          return this;
        }
        /**
         * Marks an element as a drop zone (where elements can be dropped).
         * @param {*} zone Element or selector
         * @returns 
         */
        dropZone(zone) {
          const element = LS.Tiny.O(zone);
          element.lsDrop = true;
          element.lsDropTarget = this.options.id;
          element.classList.add("ls-drop");
          this.dropzones.add(element);
          element.addEventListener("mouseenter", () => {
            if (!this.#state.moving || this.options.movementOnly) return;
            this.#dropHover(element);
          });
          return this;
        }
        get dragging() {
          return this.#state.moving;
        }
        get currentElement() {
          return this.#state.current;
        }
        #onInputStart(event) {
          let enable = true;
          const element = event.domEvent.target;
          this.emit("dragStart", [element, event, () => {
            enable = false;
          }]);
          if (!element.lsDragEnabled || !enable) {
            event.cancel();
            return;
          }
          const state = this.#state;
          state.items = [];
          state.prevX = state.initialX = event.x;
          state.velocityX = 0;
          state.initialY = event.y;
          state.prevY = state.initialY;
          state.velocityY = 0;
          state.currentX = event.x;
          state.currentY = event.y;
          state.object = element.lsDragOptions?.object || null;
          const box = element.getBoundingClientRect();
          state.relative = { box, x: state.initialX - box.left, y: state.initialY - box.top };
          if (state.dragArea) {
            state.dragArea.style.transform = `translate3d(${box.left}px, ${box.top}px, 0)`;
            if (this.options.preserveHeight) state.dragArea.style.height = box.height + "px";
          }
          state.parent = LS.Tiny.O(element.parentElement);
          state.engaged = true;
          state.current = element;
          state.moving = false;
        }
        #onInputMove(x, y) {
          const state = this.#state;
          if (!state.engaged) return;
          state.currentX = x;
          state.currentY = y;
          if (!state.moving) {
            if (Math.abs(state.initialX - x) >= this.options.tolerance || Math.abs(state.initialY - y) >= this.options.tolerance) {
              if (this.options.outsideParent && state.current.parentElement.matches(":hover")) {
                return;
              }
              this.#dropHover(this.options.sameParent ? this.#getFather(false, state.current, this.options) : LS.Tiny.O(state.current.parentElement));
              state.scrollAllowed = this.#getFather(false, state.current, this.options).matches(":hover");
              state.moving = true;
              for (const child of state.dragArea.children) child.remove();
              state.multi = this.options.multiList && this.options.multiList.size > 0;
              const sourceItems = state.multi ? Array.from(this.options.multiList) : [state.current];
              state.items = sourceItems.map((item) => {
                if (!(item instanceof HTMLElement)) {
                  item = item.element || item.container || item.timelineElement || null;
                  if (!item || !(item instanceof HTMLElement)) throw new Error("DragDrop: Invalid multiList item, must be HTMLElement or contain 'element' property.");
                }
                const parent = item.parentElement;
                const nextSibling = item.nextElementSibling;
                const computed = getComputedStyle(item);
                const prevMargin = computed.margin;
                const rect = item.getBoundingClientRect();
                let element = this.options.clone ? LS.Tiny.O(item.cloneNode(true)) : item;
                element.style.margin = "0";
                element.classList.add("ls-held");
                state.dragArea.add(element);
                return {
                  original: item,
                  rect,
                  element,
                  parent,
                  nextSibling,
                  prevMargin,
                  display: computed.display,
                  borderRadius: computed.borderRadius
                };
              });
              state.dragArea.style.display = "block";
              if (this.options.snapEnabled) {
                state.snapValues = null;
                let snap = this.options.getters?.snapAt;
                if (snap === void 0) snap = this.draggables;
                if (snap && (Array.isArray(snap) || snap instanceof Set)) {
                  state.snapValues = [];
                  const cw = state.dragArea.clientWidth;
                  const vh = window.innerHeight;
                  const vw = window.innerWidth;
                  for (const element of snap) {
                    if (element === state.current) continue;
                    const box = element.getBoundingClientRect();
                    if (box.width === 0 && box.height === 0) continue;
                    if (box.bottom < -50 || box.top > vh + 50 || box.right < -50 || box.left > vw + 50) continue;
                    state.snapValues.push(
                      { dest: box.left, line: box.left, top: box.top, height: box.height },
                      { dest: box.right, line: box.right, top: box.top, height: box.height },
                      { dest: box.left - cw, line: box.left, top: box.top, height: box.height },
                      { dest: box.right - cw, line: box.right, top: box.top, height: box.height }
                    );
                  }
                }
              }
              if (this.options.sameParent) {
                this.#dropHover(this.#getFather(false, state.current, this.options));
              }
              this.emit("drag", [state.items]);
              this.frameScheduler.schedule();
            }
          } else {
            this.frameScheduler.schedule();
          }
        }
        #onInputEnd() {
          const state = this.#state;
          state.engaged = false;
          if (!state.moving) return;
          state.moving = false;
          if (!state.dragArea || !this.options) return;
          const drop = this.options.movementOnly ? state.parent : !this.options.strictDrop ? state.target : LS.Tiny.O(document.elementsFromPoint(state.currentX, state.currentY).reverse().find((e) => e.lsDrop));
          const success = drop && drop.lsDrop && this.#isAllowed(state.current, drop);
          state.items.forEach((item) => {
            item.original.style.margin = item.prevMargin;
            item.original.classList.remove("ls-held");
            if (this.options.clone) item.dragged.remove();
          });
          if (success) {
            const event = {
              source: state.current,
              items: state.items.map((i) => i.original),
              target: drop,
              boundX: state.boundX,
              boundY: state.boundY,
              boundWidth: state.dragArea.clientWidth,
              boundHeight: state.dragArea.clientHeight,
              object: state.object || null
            };
            this.emit("drop", [event, drop]);
          }
          if (!success && !this.options.clone) {
            state.items.forEach((item) => {
              this.emit("cancel", [item.original]);
              if (item.nextSibling) {
                item.parent.insertBefore(item.original, item.nextSibling);
              } else {
                item.parent.appendChild(item.original);
              }
            });
          } else if (!success && this.options.clone) {
            this.emit("cancel", []);
          }
          state.items = [];
          state.current = null;
          state.previewBox.remove();
          if (state.snapLine) state.snapLine.style.display = "none";
          state.moving = false;
          state.engaged = false;
          state.dragArea.style.display = "none";
        }
        #render() {
          const state = this.#state;
          if (!state.moving || !state.current) return;
          let x = state.currentX, y = state.currentY;
          const rect = state.dragArea.getBoundingClientRect();
          const parentBox = this.#getFatherBox(false, state.current, this.options);
          const scrollBox = this.#getFatherBox(true, state.current, this.options);
          if (this.options.relativeMouse && state.relative) {
            x -= state.relative.x;
            y -= state.relative.y;
          }
          if (this.options.lockX || LS.Tiny.M.ShiftDown && state.prevX !== null) x = state.prevX;
          if (this.options.lockY) y = state.prevY;
          if (this.options.snapEnabled) {
            const snapValues = state.snapValues;
            let snapped = false;
            if (Array.isArray(snapValues)) {
              for (const snap of snapValues) {
                if (snap.dest - x > -this.options.snapArea && snap.dest - x < this.options.snapArea) {
                  x = snap.dest;
                  if (state.snapLine) {
                    const top = Math.min(snap.top, y);
                    const height = Math.max(snap.top + snap.height, y + rect.height) - top;
                    state.snapLine.style.transform = `translate3d(${snap.line}px, ${top}px, 0)`;
                    state.snapLine.style.height = height + "px";
                    state.snapLine.style.display = "block";
                  }
                  snapped = true;
                  break;
                }
              }
            }
            if (!snapped && state.snapLine) state.snapLine.style.display = "none";
          }
          if (this.options.animate) {
            if (x !== state.prevX) {
              state.velocityX = x - state.prevX;
            } else {
              state.velocityX += state.velocityX > 0 ? -1 : 1;
            }
            if (y !== state.prevY) {
              state.velocityY = state.prevY - y;
            } else {
              state.velocityY += state.velocityY > 0 ? -1 : 1;
            }
            state.dragArea.style.transform = ` translate3d(${x - rect.width / 2}px, ${y + state.velocityY}px, 0) rotate(${state.velocityX}deg)`;
          } else {
            state.dragArea.style.transform = ` translate3d(${x}px, ${y}px, 0)`;
          }
          state.prevX = x;
          state.prevY = y;
          if (this.options.absoluteX) {
            state.boundX = rect.left - parentBox.left + this.#getFather(false, state.current, this.options).scrollLeft;
            if (!this.options.overflow && state.boundX < 0) state.boundX = 0;
            if (this.options.dropPreview) state.previewBox.style.left = state.boundX + "px";
          }
          if (this.options.absoluteY) {
            state.boundY = rect.top - parentBox.top + this.#getFather(false, state.current, this.options).scrollTop;
            if (!this.options.overflow && state.boundY < 0) state.boundY = 0;
            if (this.options.dropPreview) state.previewBox.style.top = state.boundY + "px";
          }
          if (state.scrollAllowed) {
            const sp = this.#getFather(true, state.current, this.options);
            if (this.options.scrollY) {
              if (state.currentY > scrollBox.bottom) sp.scrollBy(null, Math.min(40, state.currentY - scrollBox.bottom));
              if (state.currentY < scrollBox.top) sp.scrollBy(null, Math.min(40, -(scrollBox.top - state.currentY)));
            }
            if (this.options.scrollX) {
              if (state.currentX > scrollBox.right - 20) sp.scrollBy(Math.min(40, (state.currentX - (scrollBox.right - 20)) / 2), null);
              if (state.currentX < scrollBox.left + 20) sp.scrollBy(Math.min(40, -(scrollBox.left + 20 - state.currentX) / 2), null);
            }
          }
          if (state.moving && state.dragArea) this.frameScheduler.schedule();
        }
        render() {
          this.frameScheduler.schedule();
        }
        #getFatherBox(scrollBox, current, opts) {
          return this.#getFather(scrollBox, current, opts).getBoundingClientRect();
        }
        #getFather(scroll, current, opts) {
          const container = (scroll ? opts.scrollContainer : opts.container) || opts.container || (current ? current.parentElement : null);
          return LS.Tiny.O(container || document.body);
        }
        #isAllowed(source, target) {
          if (target === this.#getFather(false, source, this.options)) return true;
          if (!target.lsDrop) return false;
          if (this.options.allowedTargets && this.options.allowedTargets.length > 0) {
            return this.options.allowedTargets.includes(target.lsDropTarget);
          }
          return true;
        }
        #dropHover(drop) {
          const state = this.#state;
          if (!this.#isAllowed(state.current, drop)) return;
          state.target = drop;
          if (!state.multi && state.moving && state.dragArea && this.options.dropPreview) {
            for (const item of state.items) {
              const isAbsolute = this.options.absoluteX || this.options.absoluteY;
              const style = {
                height: item.rect.height + "px",
                width: item.rect.width + "px",
                margin: item.prevMargin,
                display: item.display,
                position: isAbsolute ? "absolute" : "relative",
                borderRadius: item.borderRadius,
                pointerEvents: "none"
              };
              LS.TinyFactory.applyStyle.call(state.previewBox, style);
              if (this.options.absoluteX) {
                state.previewBox.style.marginRight = state.previewBox.style.marginLeft = "0px";
              }
              if (this.options.absoluteY) {
                state.previewBox.style.marginTop = state.previewBox.style.marginBottom = "0px";
              }
              drop.appendChild(state.previewBox);
            }
          }
        }
        destroy() {
          for (const [el, handler] of this.#handlers) {
            if (el.lsDragEnabled) {
              el.lsDragEnabled = false;
              delete el.lsDragOptions;
            }
            handler.destroy();
          }
          this.#handlers.clear();
          this.draggables.clear();
          this.dropzones.clear();
          if (this.#state.dragArea) this.#state.dragArea.remove();
          if (this.#state.previewBox) this.#state.previewBox.remove();
          if (this.#state.snapLine) this.#state.snapLine.remove();
          this.frameScheduler.cancel();
          this.frameScheduler = null;
        }
      }, { name: "DragDrop", global: true });
      LS.LoadComponent(class ImageCropper extends LS.Component {
        constructor(image, options = {}) {
          super();
          options = LS.Util.defaults({
            width: 100,
            height: 100,
            styled: true,
            inheritResolution: false
          }, options);
          if (options.width <= 0 || options.height <= 0) {
            throw new Error("Invalid dimensions for ImageCropper: width and height must be positive numbers.");
          }
          let src = null;
          if (image instanceof File) {
            src = URL.createObjectURL(image);
          } else if (typeof image === "string") {
            src = image;
          } else if (image instanceof HTMLImageElement || image instanceof HTMLVideoElement) {
            src = image.src;
          }
          if (image instanceof File && /(webm|mp4|mkv)$/i.test(image.type) || typeof src === "string" && /(webm|mp4|mkv)$/i.test(src) || image instanceof HTMLVideoElement) {
            if (!options.animated) {
              throw new Error("Animated sources are not allowed unless 'animated' option is set to true.");
            }
            if (image instanceof HTMLVideoElement) {
              this.image = image;
            } else {
              this.image = document.createElement("video");
              this.image.src = src;
            }
            this.image.muted = true;
            this.image.loop = true;
            this.image.playsInline = true;
            this.image.onloadedmetadata = () => this.prepareImage();
          } else {
            if (image instanceof HTMLImageElement) {
              this.image = image;
            } else {
              this.image = new Image();
              this.image.src = src;
            }
            this.image.onload = () => this.prepareImage();
          }
          this.image.draggable = false;
          this.image.onerror = (e) => {
            URL.revokeObjectURL(src);
            if (typeof this.options.onError === "function") this.options.onError(e);
            else console.error(e);
          };
          if (image instanceof File) this.originalFile = image;
          this.image.classList.add("ls-image-cropper-image");
          this.image.style.minHeight = options.height + "px";
          this.image.style.minWidth = options.width + "px";
          this.image.addEventListener("load", () => this.prepareImage());
          if (this.image.complete) {
            this.prepareImage();
          }
          this.options = options;
          this.container = LS.Create({
            class: "ls-image-cropper",
            inner: [
              this.image,
              LS.Create({
                class: "ls-image-cropper-overlay",
                style: {
                  width: options.width + "px",
                  height: options.height + "px",
                  borderRadius: options.shape === "circle" ? "50%" : "0"
                }
              })
            ]
          });
          this.wrapper = LS.Create({
            class: "ls-image-cropper-wrapper",
            inner: [
              this.container,
              LS.Create({
                class: "ls-image-cropper-controls",
                inner: [
                  LS.Create("input", {
                    type: "range",
                    min: this.options.minScale || 1,
                    max: this.options.maxScale || 3,
                    step: 0.01,
                    value: this.options.initialScale || 1,
                    oninput: (e) => {
                      this.scale = parseFloat(e.target.value);
                      this.applyTransform();
                    }
                  }),
                  LS.Create("button", {
                    class: "clear square",
                    inner: LS.Create("i", { class: "bi-arrow-clockwise" }),
                    onclick: () => this.changeRotation(90)
                  })
                ]
              })
            ]
          });
          this.wrapper.style.position = "relative";
          this.processingOverlay = LS.Create("div", {
            class: "ls-image-cropper-processing",
            style: { display: "none" },
            inner: [
              LS.Create("div", { class: "processing-text", textContent: "Processing, please wait..." }),
              LS.Create("progress", { class: "processing-progress", max: 100, value: 0 })
            ]
          });
          this.wrapper.appendChild(this.processingOverlay);
          this.processing = false;
          if (options.styled !== false) {
            this.container.classList.add("ls-image-cropper-styled");
          }
          this.rotation = this.options.rotation || 0;
          this.scale = this.options.initialScale || 1;
          const minScale = this.options.minScale || 1;
          const maxScale = this.options.maxScale || 3;
          let isDragging = false;
          let startX, startY, startTranslateX, startTranslateY;
          const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.translateX = startTranslateX + dx;
            this.translateY = startTranslateY + dy;
            this.applyTransform();
          };
          const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };
          this.container.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startTranslateX = this.translateX;
            startTranslateY = this.translateY;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          });
          this.container.addEventListener("wheel", (e) => {
            e.preventDefault();
            const zoomFactor = 1 - e.deltaY * 1e-3;
            this.scale = this.clamp(this.scale * zoomFactor, minScale, maxScale);
            this.applyTransform();
            const input = this.wrapper.querySelector('input[type="range"]');
            if (input) {
              input.value = this.scale;
            }
          });
          this.isAnimatedSource = options.animated && image instanceof File && /(gif|webm|mp4)$/i.test(image.type);
          this.originalFile = image instanceof File ? image : null;
          if (this.isAnimatedSource) {
            this.wrapper.classList.add("ls-image-cropper-animated");
          }
        }
        prepareImage() {
          const imgW = this.image.naturalWidth || this.image.videoWidth;
          const imgH = this.image.naturalHeight || this.image.videoHeight;
          const scale = Math.max(this.options.width / imgW, this.options.height / imgH);
          this.image.style.width = imgW * scale + "px";
          this.image.style.height = imgH * scale + "px";
          this.baseWidth = parseFloat(this.image.style.width);
          this.baseHeight = parseFloat(this.image.style.height);
          this.image.style.transformOrigin = "center center";
          this.translateX = 0;
          this.translateY = 0;
          this.applyTransform();
        }
        clamp(value, min, max) {
          return Math.max(min, Math.min(max, value));
        }
        applyTransform() {
          const currentWidth = this.baseWidth * this.scale;
          const currentHeight = this.baseHeight * this.scale;
          const angleRad = (this.rotation || 0) * Math.PI / 180;
          const cos = Math.abs(Math.cos(angleRad));
          const sin = Math.abs(Math.sin(angleRad));
          const rotWidth = currentWidth * cos + currentHeight * sin;
          const rotHeight = currentWidth * sin + currentHeight * cos;
          const halfDiffX = (rotWidth - this.options.width) / 2;
          const halfDiffY = (rotHeight - this.options.height) / 2;
          this.translateX = this.clamp(this.translateX, -halfDiffX, halfDiffX);
          this.translateY = this.clamp(this.translateY, -halfDiffY, halfDiffY);
          this.image.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0) rotate(${this.rotation}deg) scale(${this.scale})`;
        }
        async cropAnimated() {
          if (this.processing) return;
          this.processing = true;
          this.processingOverlay.style.display = "flex";
          try {
            return await new Promise((resolve, reject) => {
              const proceedVideo = (media, x, y, width, height, duration) => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                const stream = canvas.captureStream(30);
                const recorder = new MediaRecorder(stream, {
                  mimeType: "video/webm; codecs=vp8",
                  videoBitsPerSecond: this.options.videoBitsPerSecond || 5e5
                });
                const chunks = [];
                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => {
                  const blob = new Blob(chunks, { type: "video/webm" });
                  URL.revokeObjectURL(media.src);
                  if (typeof this.options.onResult === "function") {
                    this.options.onResult(this._getResult(blob));
                  }
                  resolve(blob);
                };
                recorder.start();
                media.play();
                const draw = () => {
                  ctx.drawImage(media, x, y, width, height, 0, 0, width, height);
                  const elapsed = media.currentTime;
                  const percent = Math.min(elapsed / duration * 100, 100);
                  this.processingOverlay.querySelector(".processing-progress").value = percent;
                  if (!media.paused && !media.ended) {
                    LS.Context.requestAnimationFrame(draw);
                  }
                };
                draw();
                this.ctx.setTimeout(() => {
                  recorder.stop();
                  media.pause();
                }, duration * 1e3);
              };
              const proceedGif = (arrayBuffer, cropX, cropY, cropW, cropH) => {
                const { GifReader } = window.omggif;
                const bytes = new Uint8Array(arrayBuffer);
                const reader = new GifReader(bytes);
                const gifW = reader.width;
                const gifH = reader.height;
                const fullCanvas = document.createElement("canvas");
                fullCanvas.width = gifW;
                fullCanvas.height = gifH;
                const fullCtx = fullCanvas.getContext("2d");
                const fullImageData = fullCtx.createImageData(gifW, gifH);
                const prevImageData = fullCtx.createImageData(gifW, gifH);
                const cropCanvas = document.createElement("canvas");
                cropCanvas.width = cropW;
                cropCanvas.height = cropH;
                const cropCtx = cropCanvas.getContext("2d");
                const stream = cropCanvas.captureStream(30);
                const recorder = new MediaRecorder(stream, {
                  mimeType: "video/webm; codecs=vp8",
                  videoBitsPerSecond: this.options.videoBitsPerSecond || 5e5
                });
                const chunks = [];
                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => {
                  const blob = new Blob(chunks, { type: "video/webm" });
                  if (typeof this.options.onResult === "function") {
                    this.options.onResult(this._getResult(blob));
                  }
                  resolve(blob);
                };
                recorder.start();
                let frameIndex = 0;
                const drawFrame = () => {
                  const info = reader.frameInfo(frameIndex);
                  if (info.disposal === 2) {
                    for (let y = 0; y < info.height; y++) {
                      for (let x = 0; x < info.width; x++) {
                        const idx = ((y + info.y) * gifW + (x + info.x)) * 4;
                        fullImageData.data[idx + 0] = 0;
                        fullImageData.data[idx + 1] = 0;
                        fullImageData.data[idx + 2] = 0;
                        fullImageData.data[idx + 3] = 0;
                      }
                    }
                  } else if (info.disposal === 3) {
                    fullImageData.data.set(prevImageData.data);
                  }
                  prevImageData.data.set(fullImageData.data);
                  reader.decodeAndBlitFrameRGBA(frameIndex, fullImageData.data);
                  fullCtx.putImageData(fullImageData, 0, 0);
                  cropCtx.clearRect(0, 0, cropW, cropH);
                  cropCtx.drawImage(
                    fullCanvas,
                    cropX,
                    cropY,
                    cropW,
                    cropH,
                    0,
                    0,
                    cropW,
                    cropH
                  );
                  const totalFrames = reader.numFrames();
                  const percentGif = (frameIndex + 1) / totalFrames * 100;
                  this.processingOverlay.querySelector(".processing-progress").value = percentGif;
                  frameIndex++;
                  if (frameIndex < reader.numFrames()) {
                    this.ctx.setTimeout(drawFrame, info.delay * 10 || 100);
                  } else {
                    recorder.stop();
                  }
                };
                drawFrame();
              };
              const maxLen = this.options.maxAnimatedLength || 30;
              const overlay = this.container.querySelector(
                ".ls-image-cropper-overlay"
              );
              const overlayRect = overlay.getBoundingClientRect();
              const imgRect = this.image.getBoundingClientRect();
              const isGif = this.originalFile.type === "image/gif";
              if (isGif) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const mediaW = this.image.naturalWidth;
                  const mediaH = this.image.naturalHeight;
                  const scaleX = mediaW / imgRect.width;
                  const scaleY = mediaH / imgRect.height;
                  const x = (overlayRect.left - imgRect.left) * scaleX;
                  const y = (overlayRect.top - imgRect.top) * scaleY;
                  const width = overlayRect.width * scaleX;
                  const height = overlayRect.height * scaleY;
                  proceedGif(e.target.result, x, y, width, height);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(this.originalFile);
              } else {
                const media = document.createElement("video");
                media.src = URL.createObjectURL(this.originalFile);
                media.muted = true;
                media.playsInline = true;
                media.onloadedmetadata = () => {
                  const mediaW = media.videoWidth;
                  const mediaH = media.videoHeight;
                  const scaleX = mediaW / imgRect.width;
                  const scaleY = mediaH / imgRect.height;
                  const x = (overlayRect.left - imgRect.left) * scaleX;
                  const y = (overlayRect.top - imgRect.top) * scaleY;
                  const width = overlayRect.width * scaleX;
                  const height = overlayRect.height * scaleY;
                  const duration = Math.min(
                    maxLen,
                    media.duration || maxLen
                  );
                  proceedVideo(media, x, y, width, height, duration);
                };
                media.onerror = reject;
              }
            });
          } catch (e) {
            if (typeof this.options.onError === "function") {
              this.options.onError(e);
            }
            throw e;
          } finally {
            this.processingOverlay.style.display = "none";
            this.processing = false;
          }
        }
        crop() {
          if (this.processing) return;
          if (this.options.animated && this.isAnimatedSource) return this.cropAnimated();
          const overlay = this.container.querySelector(".ls-image-cropper-overlay");
          const overlayRect = overlay.getBoundingClientRect();
          const imageRect = this.image.getBoundingClientRect();
          const scaleX = this.image.naturalWidth / imageRect.width;
          const scaleY = this.image.naturalHeight / imageRect.height;
          const x = (overlayRect.left - imageRect.left) * scaleX;
          const y = (overlayRect.top - imageRect.top) * scaleY;
          const width = overlayRect.width * scaleX;
          const height = overlayRect.height * scaleY;
          const destWidth = this.options.inheritResolution ? width : this.options.finalWidth || this.options.width;
          const destHeight = this.options.inheritResolution ? height : this.options.finalHeight || this.options.height;
          const canvas = document.createElement("canvas");
          canvas.width = destWidth;
          canvas.height = destHeight;
          const ctx = canvas.getContext("2d");
          const angle = (this.rotation || 0) * Math.PI / 180;
          ctx.save();
          ctx.translate(destWidth / 2, destHeight / 2);
          ctx.rotate(angle);
          ctx.drawImage(
            this.image,
            x,
            y,
            width,
            height,
            -destWidth / 2,
            -destHeight / 2,
            destWidth,
            destHeight
          );
          ctx.restore();
          canvas.toBlob((blob) => {
            if (typeof this.options.onResult === "function") {
              this.options.onResult(this._getResult(blob));
            }
          }, "image/webp");
        }
        changeRotation(delta) {
          this.rotation = (this.rotation + delta) % 360;
          this.applyTransform();
        }
        _getResult(blob) {
          const result = {
            blob,
            animated: this.isAnimatedSource,
            width: this.options.finalWidth || this.options.width,
            height: this.options.finalHeight || this.options.height
          };
          if (this.options.createURL) {
            result.url = URL.createObjectURL(blob);
          }
          if (this.image && this.image.src && this.image.src.startsWith("blob:")) {
            URL.revokeObjectURL(this.image.src);
          }
          return result;
        }
        destroy() {
          if (this.image) {
            this.image.onload = null;
            this.image.onerror = null;
            this.image = null;
          }
          if (this.container) {
            this.container.remove();
            this.container = null;
          }
          if (this.image && this.image.src && this.image.src.startsWith("blob:")) {
            URL.revokeObjectURL(this.image.src);
          }
          this.flush();
        }
      }, { name: "ImageCropper", global: true });
      (() => {
        "use strict";
        function GifWriter(buf, width, height, gopts) {
          var p = 0;
          var gopts = gopts === void 0 ? {} : gopts;
          var loop_count = gopts.loop === void 0 ? null : gopts.loop;
          var global_palette = gopts.palette === void 0 ? null : gopts.palette;
          if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
            throw new Error("Width/Height invalid.");
          function check_palette_and_num_colors(palette) {
            var num_colors = palette.length;
            if (num_colors < 2 || num_colors > 256 || num_colors & num_colors - 1) {
              throw new Error(
                "Invalid code/color length, must be power of 2 and 2 .. 256."
              );
            }
            return num_colors;
          }
          buf[p++] = 71;
          buf[p++] = 73;
          buf[p++] = 70;
          buf[p++] = 56;
          buf[p++] = 57;
          buf[p++] = 97;
          var gp_num_colors_pow2 = 0;
          var background = 0;
          if (global_palette !== null) {
            var gp_num_colors = check_palette_and_num_colors(global_palette);
            while (gp_num_colors >>= 1) ++gp_num_colors_pow2;
            gp_num_colors = 1 << gp_num_colors_pow2;
            --gp_num_colors_pow2;
            if (gopts.background !== void 0) {
              background = gopts.background;
              if (background >= gp_num_colors)
                throw new Error("Background index out of range.");
              if (background === 0)
                throw new Error("Background index explicitly passed as 0.");
            }
          }
          buf[p++] = width & 255;
          buf[p++] = width >> 8 & 255;
          buf[p++] = height & 255;
          buf[p++] = height >> 8 & 255;
          buf[p++] = (global_palette !== null ? 128 : 0) | // Global Color Table Flag.
          gp_num_colors_pow2;
          buf[p++] = background;
          buf[p++] = 0;
          if (global_palette !== null) {
            for (var i = 0, il = global_palette.length; i < il; ++i) {
              var rgb = global_palette[i];
              buf[p++] = rgb >> 16 & 255;
              buf[p++] = rgb >> 8 & 255;
              buf[p++] = rgb & 255;
            }
          }
          if (loop_count !== null) {
            if (loop_count < 0 || loop_count > 65535)
              throw new Error("Loop count invalid.");
            buf[p++] = 33;
            buf[p++] = 255;
            buf[p++] = 11;
            buf[p++] = 78;
            buf[p++] = 69;
            buf[p++] = 84;
            buf[p++] = 83;
            buf[p++] = 67;
            buf[p++] = 65;
            buf[p++] = 80;
            buf[p++] = 69;
            buf[p++] = 50;
            buf[p++] = 46;
            buf[p++] = 48;
            buf[p++] = 3;
            buf[p++] = 1;
            buf[p++] = loop_count & 255;
            buf[p++] = loop_count >> 8 & 255;
            buf[p++] = 0;
          }
          var ended = false;
          this.addFrame = function(x, y, w, h, indexed_pixels, opts) {
            if (ended === true) {
              --p;
              ended = false;
            }
            opts = opts === void 0 ? {} : opts;
            if (x < 0 || y < 0 || x > 65535 || y > 65535)
              throw new Error("x/y invalid.");
            if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
              throw new Error("Width/Height invalid.");
            if (indexed_pixels.length < w * h)
              throw new Error("Not enough pixels for the frame size.");
            var using_local_palette = true;
            var palette = opts.palette;
            if (palette === void 0 || palette === null) {
              using_local_palette = false;
              palette = global_palette;
            }
            if (palette === void 0 || palette === null)
              throw new Error("Must supply either a local or global palette.");
            var num_colors = check_palette_and_num_colors(palette);
            var min_code_size = 0;
            while (num_colors >>= 1) ++min_code_size;
            num_colors = 1 << min_code_size;
            var delay = opts.delay === void 0 ? 0 : opts.delay;
            var disposal = opts.disposal === void 0 ? 0 : opts.disposal;
            if (disposal < 0 || disposal > 3)
              throw new Error("Disposal out of range.");
            var use_transparency = false;
            var transparent_index = 0;
            if (opts.transparent !== void 0 && opts.transparent !== null) {
              use_transparency = true;
              transparent_index = opts.transparent;
              if (transparent_index < 0 || transparent_index >= num_colors)
                throw new Error("Transparent color index.");
            }
            if (disposal !== 0 || use_transparency || delay !== 0) {
              buf[p++] = 33;
              buf[p++] = 249;
              buf[p++] = 4;
              buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
              buf[p++] = delay & 255;
              buf[p++] = delay >> 8 & 255;
              buf[p++] = transparent_index;
              buf[p++] = 0;
            }
            buf[p++] = 44;
            buf[p++] = x & 255;
            buf[p++] = x >> 8 & 255;
            buf[p++] = y & 255;
            buf[p++] = y >> 8 & 255;
            buf[p++] = w & 255;
            buf[p++] = w >> 8 & 255;
            buf[p++] = h & 255;
            buf[p++] = h >> 8 & 255;
            buf[p++] = using_local_palette === true ? 128 | min_code_size - 1 : 0;
            if (using_local_palette === true) {
              for (var i2 = 0, il2 = palette.length; i2 < il2; ++i2) {
                var rgb2 = palette[i2];
                buf[p++] = rgb2 >> 16 & 255;
                buf[p++] = rgb2 >> 8 & 255;
                buf[p++] = rgb2 & 255;
              }
            }
            p = GifWriterOutputLZWCodeStream(
              buf,
              p,
              min_code_size < 2 ? 2 : min_code_size,
              indexed_pixels
            );
            return p;
          };
          this.end = function() {
            if (ended === false) {
              buf[p++] = 59;
              ended = true;
            }
            return p;
          };
          this.getOutputBuffer = function() {
            return buf;
          };
          this.setOutputBuffer = function(v) {
            buf = v;
          };
          this.getOutputBufferPosition = function() {
            return p;
          };
          this.setOutputBufferPosition = function(v) {
            p = v;
          };
        }
        function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
          buf[p++] = min_code_size;
          var cur_subblock = p++;
          var clear_code = 1 << min_code_size;
          var code_mask = clear_code - 1;
          var eoi_code = clear_code + 1;
          var next_code = eoi_code + 1;
          var cur_code_size = min_code_size + 1;
          var cur_shift = 0;
          var cur = 0;
          function emit_bytes_to_buffer(bit_block_size) {
            while (cur_shift >= bit_block_size) {
              buf[p++] = cur & 255;
              cur >>= 8;
              cur_shift -= 8;
              if (p === cur_subblock + 256) {
                buf[cur_subblock] = 255;
                cur_subblock = p++;
              }
            }
          }
          function emit_code(c) {
            cur |= c << cur_shift;
            cur_shift += cur_code_size;
            emit_bytes_to_buffer(8);
          }
          var ib_code = index_stream[0] & code_mask;
          var code_table = {};
          emit_code(clear_code);
          for (var i = 1, il = index_stream.length; i < il; ++i) {
            var k = index_stream[i] & code_mask;
            var cur_key = ib_code << 8 | k;
            var cur_code = code_table[cur_key];
            if (cur_code === void 0) {
              cur |= ib_code << cur_shift;
              cur_shift += cur_code_size;
              while (cur_shift >= 8) {
                buf[p++] = cur & 255;
                cur >>= 8;
                cur_shift -= 8;
                if (p === cur_subblock + 256) {
                  buf[cur_subblock] = 255;
                  cur_subblock = p++;
                }
              }
              if (next_code === 4096) {
                emit_code(clear_code);
                next_code = eoi_code + 1;
                cur_code_size = min_code_size + 1;
                code_table = {};
              } else {
                if (next_code >= 1 << cur_code_size) ++cur_code_size;
                code_table[cur_key] = next_code++;
              }
              ib_code = k;
            } else {
              ib_code = cur_code;
            }
          }
          emit_code(ib_code);
          emit_code(eoi_code);
          emit_bytes_to_buffer(1);
          if (cur_subblock + 1 === p) {
            buf[cur_subblock] = 0;
          } else {
            buf[cur_subblock] = p - cur_subblock - 1;
            buf[p++] = 0;
          }
          return p;
        }
        function GifReader(buf) {
          var p = 0;
          if (buf[p++] !== 71 || buf[p++] !== 73 || buf[p++] !== 70 || buf[p++] !== 56 || (buf[p++] + 1 & 253) !== 56 || buf[p++] !== 97) {
            throw new Error("Invalid GIF 87a/89a header.");
          }
          var width = buf[p++] | buf[p++] << 8;
          var height = buf[p++] | buf[p++] << 8;
          var pf0 = buf[p++];
          var global_palette_flag = pf0 >> 7;
          var num_global_colors_pow2 = pf0 & 7;
          var num_global_colors = 1 << num_global_colors_pow2 + 1;
          var background = buf[p++];
          buf[p++];
          var global_palette_offset = null;
          var global_palette_size = null;
          if (global_palette_flag) {
            global_palette_offset = p;
            global_palette_size = num_global_colors;
            p += num_global_colors * 3;
          }
          var no_eof = true;
          var frames = [];
          var delay = 0;
          var transparent_index = null;
          var disposal = 0;
          var loop_count = null;
          this.width = width;
          this.height = height;
          while (no_eof && p < buf.length) {
            switch (buf[p++]) {
              case 33:
                switch (buf[p++]) {
                  case 255:
                    if (buf[p] !== 11 || // 21 FF already read, check block size.
                    // NETSCAPE2.0
                    buf[p + 1] == 78 && buf[p + 2] == 69 && buf[p + 3] == 84 && buf[p + 4] == 83 && buf[p + 5] == 67 && buf[p + 6] == 65 && buf[p + 7] == 80 && buf[p + 8] == 69 && buf[p + 9] == 50 && buf[p + 10] == 46 && buf[p + 11] == 48 && // Sub-block
                    buf[p + 12] == 3 && buf[p + 13] == 1 && buf[p + 16] == 0) {
                      p += 14;
                      loop_count = buf[p++] | buf[p++] << 8;
                      p++;
                    } else {
                      p += 12;
                      while (true) {
                        var block_size = buf[p++];
                        if (!(block_size >= 0)) throw Error("Invalid block size");
                        if (block_size === 0) break;
                        p += block_size;
                      }
                    }
                    break;
                  case 249:
                    if (buf[p++] !== 4 || buf[p + 4] !== 0)
                      throw new Error("Invalid graphics extension block.");
                    var pf1 = buf[p++];
                    delay = buf[p++] | buf[p++] << 8;
                    transparent_index = buf[p++];
                    if ((pf1 & 1) === 0) transparent_index = null;
                    disposal = pf1 >> 2 & 7;
                    p++;
                    break;
                  // Plain Text Extension could be present and we just want to be able
                  // to parse past it.  It follows the block structure of the comment
                  // extension enough to reuse the path to skip through the blocks.
                  case 1:
                  // Plain Text Extension (fallthrough to Comment Extension)
                  case 254:
                    while (true) {
                      var block_size = buf[p++];
                      if (!(block_size >= 0)) throw Error("Invalid block size");
                      if (block_size === 0) break;
                      p += block_size;
                    }
                    break;
                  default:
                    throw new Error(
                      "Unknown graphic control label: 0x" + buf[p - 1].toString(16)
                    );
                }
                break;
              case 44:
                var x = buf[p++] | buf[p++] << 8;
                var y = buf[p++] | buf[p++] << 8;
                var w = buf[p++] | buf[p++] << 8;
                var h = buf[p++] | buf[p++] << 8;
                var pf2 = buf[p++];
                var local_palette_flag = pf2 >> 7;
                var interlace_flag = pf2 >> 6 & 1;
                var num_local_colors_pow2 = pf2 & 7;
                var num_local_colors = 1 << num_local_colors_pow2 + 1;
                var palette_offset = global_palette_offset;
                var palette_size = global_palette_size;
                var has_local_palette = false;
                if (local_palette_flag) {
                  var has_local_palette = true;
                  palette_offset = p;
                  palette_size = num_local_colors;
                  p += num_local_colors * 3;
                }
                var data_offset = p;
                p++;
                while (true) {
                  var block_size = buf[p++];
                  if (!(block_size >= 0)) throw Error("Invalid block size");
                  if (block_size === 0) break;
                  p += block_size;
                }
                frames.push({
                  x,
                  y,
                  width: w,
                  height: h,
                  has_local_palette,
                  palette_offset,
                  palette_size,
                  data_offset,
                  data_length: p - data_offset,
                  transparent_index,
                  interlaced: !!interlace_flag,
                  delay,
                  disposal
                });
                break;
              case 59:
                no_eof = false;
                break;
              default:
                throw new Error("Unknown gif block: 0x" + buf[p - 1].toString(16));
                break;
            }
          }
          this.numFrames = function() {
            return frames.length;
          };
          this.loopCount = function() {
            return loop_count;
          };
          this.frameInfo = function(frame_num) {
            if (frame_num < 0 || frame_num >= frames.length)
              throw new Error("Frame index out of range.");
            return frames[frame_num];
          };
          this.decodeAndBlitFrameBGRA = function(frame_num, pixels) {
            var frame = this.frameInfo(frame_num);
            var num_pixels = frame.width * frame.height;
            var index_stream = new Uint8Array(num_pixels);
            GifReaderLZWOutputIndexStream(
              buf,
              frame.data_offset,
              index_stream,
              num_pixels
            );
            var palette_offset2 = frame.palette_offset;
            var trans = frame.transparent_index;
            if (trans === null) trans = 256;
            var framewidth = frame.width;
            var framestride = width - framewidth;
            var xleft = framewidth;
            var opbeg = (frame.y * width + frame.x) * 4;
            var opend = ((frame.y + frame.height) * width + frame.x) * 4;
            var op = opbeg;
            var scanstride = framestride * 4;
            if (frame.interlaced === true) {
              scanstride += width * 4 * 7;
            }
            var interlaceskip = 8;
            for (var i = 0, il = index_stream.length; i < il; ++i) {
              var index = index_stream[i];
              if (xleft === 0) {
                op += scanstride;
                xleft = framewidth;
                if (op >= opend) {
                  scanstride = framestride * 4 + width * 4 * (interlaceskip - 1);
                  op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                  interlaceskip >>= 1;
                }
              }
              if (index === trans) {
                op += 4;
              } else {
                var r = buf[palette_offset2 + index * 3];
                var g = buf[palette_offset2 + index * 3 + 1];
                var b = buf[palette_offset2 + index * 3 + 2];
                pixels[op++] = b;
                pixels[op++] = g;
                pixels[op++] = r;
                pixels[op++] = 255;
              }
              --xleft;
            }
          };
          this.decodeAndBlitFrameRGBA = function(frame_num, pixels) {
            var frame = this.frameInfo(frame_num);
            var num_pixels = frame.width * frame.height;
            var index_stream = new Uint8Array(num_pixels);
            GifReaderLZWOutputIndexStream(
              buf,
              frame.data_offset,
              index_stream,
              num_pixels
            );
            var palette_offset2 = frame.palette_offset;
            var trans = frame.transparent_index;
            if (trans === null) trans = 256;
            var framewidth = frame.width;
            var framestride = width - framewidth;
            var xleft = framewidth;
            var opbeg = (frame.y * width + frame.x) * 4;
            var opend = ((frame.y + frame.height) * width + frame.x) * 4;
            var op = opbeg;
            var scanstride = framestride * 4;
            if (frame.interlaced === true) {
              scanstride += width * 4 * 7;
            }
            var interlaceskip = 8;
            for (var i = 0, il = index_stream.length; i < il; ++i) {
              var index = index_stream[i];
              if (xleft === 0) {
                op += scanstride;
                xleft = framewidth;
                if (op >= opend) {
                  scanstride = framestride * 4 + width * 4 * (interlaceskip - 1);
                  op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                  interlaceskip >>= 1;
                }
              }
              if (index === trans) {
                op += 4;
              } else {
                var r = buf[palette_offset2 + index * 3];
                var g = buf[palette_offset2 + index * 3 + 1];
                var b = buf[palette_offset2 + index * 3 + 2];
                pixels[op++] = r;
                pixels[op++] = g;
                pixels[op++] = b;
                pixels[op++] = 255;
              }
              --xleft;
            }
          };
        }
        function GifReaderLZWOutputIndexStream(code_stream, p, output, output_length) {
          var min_code_size = code_stream[p++];
          var clear_code = 1 << min_code_size;
          var eoi_code = clear_code + 1;
          var next_code = eoi_code + 1;
          var cur_code_size = min_code_size + 1;
          var code_mask = (1 << cur_code_size) - 1;
          var cur_shift = 0;
          var cur = 0;
          var op = 0;
          var subblock_size = code_stream[p++];
          var code_table = new Int32Array(4096);
          var prev_code = null;
          while (true) {
            while (cur_shift < 16) {
              if (subblock_size === 0) break;
              cur |= code_stream[p++] << cur_shift;
              cur_shift += 8;
              if (subblock_size === 1) {
                subblock_size = code_stream[p++];
              } else {
                --subblock_size;
              }
            }
            if (cur_shift < cur_code_size)
              break;
            var code = cur & code_mask;
            cur >>= cur_code_size;
            cur_shift -= cur_code_size;
            if (code === clear_code) {
              next_code = eoi_code + 1;
              cur_code_size = min_code_size + 1;
              code_mask = (1 << cur_code_size) - 1;
              prev_code = null;
              continue;
            } else if (code === eoi_code) {
              break;
            }
            var chase_code = code < next_code ? code : prev_code;
            var chase_length = 0;
            var chase = chase_code;
            while (chase > clear_code) {
              chase = code_table[chase] >> 8;
              ++chase_length;
            }
            var k = chase;
            var op_end = op + chase_length + (chase_code !== code ? 1 : 0);
            if (op_end > output_length) {
              console.log("Warning, gif stream longer than expected.");
              return;
            }
            output[op++] = k;
            op += chase_length;
            var b = op;
            if (chase_code !== code)
              output[op++] = k;
            chase = chase_code;
            while (chase_length--) {
              chase = code_table[chase];
              output[--b] = chase & 255;
              chase >>= 8;
            }
            if (prev_code !== null && next_code < 4096) {
              code_table[next_code++] = prev_code << 8 | k;
              if (next_code >= code_mask + 1 && cur_code_size < 12) {
                ++cur_code_size;
                code_mask = code_mask << 1 | 1;
              }
            }
            prev_code = code;
          }
          if (op !== output_length) {
            console.log("Warning, gif stream shorter than expected.");
          }
          return output;
        }
        try {
          exports.GifWriter = GifWriter;
          exports.GifReader = GifReader;
        } catch (e) {
          window.omggif = { GifWriter, GifReader };
        }
      })();
      /**
       * Knob Component
       * A rotary knob input component with SVG-based rendering, touch support, and customizable styles.
       * Works as a native custom element <ls-knob> with input-like behavior.
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      (() => {
        const PRESETS = {
          default: {
            pointer: "dot"
          },
          chrome: {
            arcFill: false,
            arcWidth: 5,
            pointer: "line",
            pointerGlow: true
          },
          flat: {
            arcFill: false,
            arcBackground: true
          },
          progress: {
            arcGap: [180, 540],
            arcFill: false,
            pointer: "none"
          },
          numeric: {
            arc: false,
            arcBackground: false,
            pointer: "none",
            showTooltip: false,
            digit: true
          },
          numericPlain: {
            arc: false,
            arcBackground: false,
            pointer: "none",
            showTooltip: false,
            digit: true
          }
        };
        const DEFAULT_STYLE = {
          arcGap: [220, 500],
          arc: true,
          arcSpread: 0,
          arcWidth: 15,
          arcRounded: true,
          pointerGlow: false,
          arcBackground: false,
          arcFill: true,
          digit: false,
          pointer: "none"
        };
        const DEFAULTS = {
          min: 0,
          max: 100,
          step: 1,
          value: 0,
          preset: "default",
          sensitivity: 0.5,
          disabled: false,
          showTooltip: true,
          numeric: false,
          valueDisplayFormatter: null,
          label: null,
          bipolar: "auto"
          // "auto" = true when min < 0 < max, or explicit true/false
        };
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        function polarToCartesian(cx, cy, radius, angleInDegrees) {
          const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
          return {
            x: cx + radius * Math.cos(angleInRadians),
            y: cy + radius * Math.sin(angleInRadians)
          };
        }
        function describeArc(x, y, radius, spread, startAngle, endAngle, fill) {
          const innerStart = polarToCartesian(x, y, radius, endAngle);
          const innerEnd = polarToCartesian(x, y, radius, startAngle);
          const outerStart = polarToCartesian(x, y, radius + spread, endAngle);
          const outerEnd = polarToCartesian(x, y, radius + spread, startAngle);
          const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
          const d = [
            "M",
            outerStart.x,
            outerStart.y,
            "A",
            radius + spread,
            radius + spread,
            0,
            largeArcFlag,
            0,
            outerEnd.x,
            outerEnd.y,
            ...fill ? [
              "L",
              innerEnd.x,
              innerEnd.y,
              "A",
              radius,
              radius,
              0,
              largeArcFlag,
              1,
              innerStart.x,
              innerStart.y,
              "L",
              outerStart.x,
              outerStart.y,
              "Z"
            ] : []
          ].join(" ");
          return d;
        }
        LS.LoadComponent(class Knob extends LS.Component {
          static presets = PRESETS;
          static defaultStyle = DEFAULT_STYLE;
          /**
           * Creates a new Knob instance
           * @param {HTMLElement} element - Container element
           * @param {Object} options - Configuration options
           */
          constructor(element, options = {}) {
            super();
            this.element = element instanceof HTMLElement ? element : typeof element === "string" ? LS.Select(element) : document.createElement("ls-knob");
            if (!this.element) throw new Error("Knob: No valid element provided");
            this.element.knob = this;
            this.options = LS.Util.defaults(DEFAULTS, options);
            this.style = { ...DEFAULT_STYLE };
            this.#value = clamp(this.options.value, this.options.min, this.options.max);
            this.#percentage = 0;
            this.#arcAngle = 0;
            this.#initialized = false;
            this.svg = null;
            this.arc = null;
            this.back = null;
            this.rotor = null;
            this.stator = null;
            this.digitElement = null;
            this.labelElement = null;
            this.frameScheduler = new LS.Util.FrameScheduler(() => this.#render());
            this.enabled = !this.options.disabled;
            this.handle = null;
            this.#setup();
          }
          // Private state
          #value = 0;
          #rawValue = 0;
          // Unsnapped value for smooth interpolation during drag
          #percentage = 0;
          #arcAngle = 0;
          #initialized = false;
          #startValue = 0;
          #isDragging = false;
          #lastRenderedDigit = null;
          #lastPointerStartTime = 0;
          #lastPointerStartX = 0;
          #lastPointerStartY = 0;
          get value() {
            return this.#value;
          }
          set value(newValue) {
            const clamped = clamp(Number(newValue) || 0, this.options.min, this.options.max);
            const stepped = Math.round(clamped / this.options.step) * this.options.step;
            const final = clamp(stepped, this.options.min, this.options.max);
            const rounded = Math.round(final * 1e10) / 1e10;
            if (rounded === this.#value) return;
            this.#value = rounded;
            if (!this.#isDragging) {
              this.#rawValue = rounded;
            }
            this.frameScheduler.schedule();
          }
          // Internal setter that bypasses stepping (for smooth drag)
          #setRawValue(newValue) {
            const clamped = clamp(Number(newValue) || 0, this.options.min, this.options.max);
            this.#rawValue = clamped;
            const stepped = Math.round(clamped / this.options.step) * this.options.step;
            const final = clamp(stepped, this.options.min, this.options.max);
            const rounded = Math.round(final * 1e10) / 1e10;
            const changed = rounded !== this.#value;
            this.#value = rounded;
            this.frameScheduler.schedule();
            return changed;
          }
          get min() {
            return this.options.min;
          }
          set min(val) {
            this.options.min = Number(val) || 0;
            this.value = this.#value;
          }
          get max() {
            return this.options.max;
          }
          set max(val) {
            this.options.max = Number(val) || 100;
            this.value = this.#value;
          }
          get step() {
            return this.options.step;
          }
          set step(val) {
            this.options.step = Math.max(1e-3, Number(val) || 1);
          }
          get disabled() {
            return !this.enabled;
          }
          set disabled(val) {
            this.enabled = !val;
            this.element.classList.toggle("ls-knob-disabled", !this.enabled);
            if (this.handle) {
              this.handle.enabled = this.enabled;
            }
          }
          #setup() {
            this.element.classList.add("ls-knob");
            if (!this.element.querySelector("svg")) {
              this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              this.element.appendChild(this.svg);
            } else {
              this.svg = this.element.querySelector("svg");
            }
            this.svg.setAttribute("width", "200");
            this.svg.setAttribute("height", "200");
            this.svg.setAttribute("viewBox", "0 0 200 200");
            if (!this.element.querySelector(".ls-knob-stator")) {
              this.stator = LS.Create({ class: "ls-knob-stator" });
              this.element.appendChild(this.stator);
            } else {
              this.stator = this.element.querySelector(".ls-knob-stator");
            }
            this.arc = this.svg.querySelector(".ls-knob-arc");
            this.back = this.svg.querySelector(".ls-knob-back");
            this.rotor = this.element.querySelector(".ls-knob-rotor");
            const preset = this.element.getAttribute("preset") || (this.options.numeric ? "numeric" : this.options.preset);
            this.setPreset(preset, true);
            this.handle = new LS.Util.TouchHandle(this.element, {
              pointerLock: true,
              buttons: [0]
            });
            this.handle.cursor = "none";
            this.handle.enabled = this.enabled;
            this.handle.on("start", (event) => {
              if (!this.enabled) return event.cancel();
              if (this.#shouldResetFromPointerStart(event.domEvent)) {
                event.cancel();
                this.reset();
                return;
              }
              this.#startValue = this.#value;
              this.#rawValue = this.#value;
              this.#isDragging = true;
              this.element.classList.add("ls-knob-active");
              this.#showTooltip();
            });
            this.handle.on("move", (event) => {
              if (!this.enabled || !event.domEvent) return;
              const range = this.options.max - this.options.min;
              const pixelsForFullRange = 200;
              const delta = -event.domEvent.movementY / pixelsForFullRange * range * this.options.sensitivity;
              const newRawValue = this.#rawValue + delta;
              const changed = this.#setRawValue(newRawValue);
              if (changed) {
                this.#emitInput();
              }
              this.#showTooltip();
            });
            this.handle.on("end", () => {
              this.#isDragging = false;
              this.element.classList.remove("ls-knob-active");
              this.#hideTooltip();
              this.#rawValue = this.#value;
              if (this.#startValue !== this.#value) {
                this.#emitChange();
              }
            });
            this.element.setAttribute("tabindex", "0");
            this.element.setAttribute("role", "slider");
            this.element.addEventListener("keydown", this.__keydownHandler = (e) => {
              if (!this.enabled) return;
              const largeStep = this.options.step * 10;
              let handled = true;
              switch (e.key) {
                case "ArrowUp":
                case "ArrowRight":
                  this.value += e.shiftKey ? largeStep : this.options.step;
                  break;
                case "ArrowDown":
                case "ArrowLeft":
                  this.value -= e.shiftKey ? largeStep : this.options.step;
                  break;
                case "Home":
                  this.value = this.options.min;
                  break;
                case "End":
                  this.value = this.options.max;
                  break;
                default:
                  handled = false;
              }
              if (handled) {
                e.preventDefault();
                this.#emitInput();
                this.#emitChange();
              }
            });
            this.element.addEventListener("wheel", this.__wheelHandler = (e) => {
              if (!this.enabled) return;
              e.preventDefault();
              const delta = -Math.sign(e.deltaY) * this.options.step;
              this.value += delta;
              this.#emitInput();
              this.#emitChange();
            }, { passive: false });
            this.#initialized = true;
            this.#initializeVisuals();
            this.frameScheduler.schedule();
          }
          #initializeVisuals() {
            if (this.style.arc) {
              if (!this.arc) {
                this.arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this.arc.classList.add("ls-knob-arc");
                this.svg.appendChild(this.arc);
              }
              if (this.style.arcFill) {
                this.arc.setAttribute("fill", "var(--accent-60)");
                this.arc.removeAttribute("stroke");
              } else {
                this.arc.setAttribute("fill", "transparent");
                this.arc.setAttribute("stroke", "var(--accent-60)");
                this.arc.setAttribute("stroke-linecap", this.style.arcRounded ? "round" : "butt");
                this.arc.setAttribute("stroke-width", this.style.arcWidth + "%");
                const rect = this.element.getBoundingClientRect();
                if (rect.height > 0) {
                  this.element.style.setProperty(
                    "--knob-stroke-width",
                    rect.height * (this.style.arcWidth / 100) + "px"
                  );
                }
              }
              this.arc.style.display = "";
            } else if (this.arc) {
              this.arc.style.display = "none";
            }
            if (this.style.arcBackground) {
              if (!this.back) {
                this.back = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this.back.classList.add("ls-knob-back");
                this.back.setAttribute("fill", "transparent");
                if (this.arc) {
                  this.svg.insertBefore(this.back, this.arc);
                } else {
                  this.svg.appendChild(this.back);
                }
              }
              this.back.classList.add("ls-knob-arc-full");
              this.back.setAttribute("stroke", "var(--accent-transparent)");
              this.back.setAttribute("stroke-width", this.style.arcWidth + "%");
              this.back.setAttribute("stroke-linecap", this.style.arcRounded ? "round" : "butt");
              this.back.setAttribute("d", this.#computeArc(false, this.style.arcGap[1]));
              this.back.style.display = "";
            } else if (this.back) {
              this.back.style.display = "none";
            }
            if (this.style.pointer !== "none") {
              if (!this.rotor) {
                this.rotor = LS.Create({ class: "ls-knob-rotor" });
                this.stator.appendChild(this.rotor);
              }
              this.rotor.style.display = "";
            } else if (this.rotor) {
              this.rotor.style.display = "none";
            }
            if (this.style.digit) {
              if (!this.digitElement) {
                this.digitElement = LS.Create({ class: "ls-knob-digit" });
                this.stator.appendChild(this.digitElement);
              }
              this.digitElement.style.display = "";
              this.#lastRenderedDigit = null;
              this.#updateDigitDisplay();
            } else if (this.digitElement) {
              this.digitElement.style.display = "none";
              this.#lastRenderedDigit = null;
            }
            this.stator.classList.toggle("ls-knob-glow", !!this.style.pointerGlow);
            this.#updateLabel();
          }
          #render() {
            if (!this.#initialized) return;
            const range = this.options.max - this.options.min;
            this.#percentage = range > 0 ? (this.#value - this.options.min) / range * 100 : 0;
            this.#arcAngle = this.style.arcGap[0] + this.#percentage / 100 * (this.style.arcGap[1] - this.style.arcGap[0]);
            this.element.setAttribute("aria-valuenow", this.#value);
            this.element.setAttribute("aria-valuemin", this.options.min);
            this.element.setAttribute("aria-valuemax", this.options.max);
            if (this.style.pointer !== "none" && this.rotor) {
              this.rotor.style.transform = `rotate(${this.#arcAngle}deg)`;
            }
            if (this.style.arc && this.arc) {
              const isBipolar = this.#isBipolar();
              if (isBipolar) {
                const zeroPercent = (0 - this.options.min) / range * 100;
                const zeroAngle = this.style.arcGap[0] + zeroPercent / 100 * (this.style.arcGap[1] - this.style.arcGap[0]);
                if (this.#value >= 0) {
                  this.arc.setAttribute("d", this.#computeArc(this.style.arcFill, this.#arcAngle, zeroAngle));
                } else {
                  this.arc.setAttribute("d", this.#computeArc(this.style.arcFill, zeroAngle, this.#arcAngle));
                }
              } else {
                this.arc.setAttribute("d", this.#computeArc(this.style.arcFill, this.#arcAngle));
              }
            }
            this.#updateDigitDisplay();
          }
          #isBipolar() {
            if (this.options.bipolar === "auto") {
              return this.options.min < 0 && this.options.max > 0;
            }
            return !!this.options.bipolar;
          }
          #computeArc(fill = true, endAngle = this.#arcAngle, startAngle = this.style.arcGap[0]) {
            let adjustedEnd = endAngle;
            let adjustedStart = startAngle;
            if (Math.abs(adjustedEnd - adjustedStart) % 180 < 0.01) {
              adjustedEnd -= 0.1;
            }
            if (adjustedStart > adjustedEnd) {
              [adjustedStart, adjustedEnd] = [adjustedEnd, adjustedStart];
            }
            if (Math.abs(adjustedEnd - adjustedStart) < 0.5) {
              return "";
            }
            return describeArc(
              100,
              100,
              this.style.arcSpread,
              100 - (fill ? 0 : this.style.arcWidth),
              adjustedStart,
              adjustedEnd,
              fill
            );
          }
          #updateDigitDisplay() {
            if (!this.style.digit || !this.digitElement) return;
            const text = this.#formatValue(this.#value);
            if (text instanceof HTMLElement) {
              if (this.digitElement.firstChild !== text) {
                this.digitElement.textContent = "";
                this.digitElement.appendChild(text);
                this.#lastRenderedDigit = text;
              }
              return;
            }
            if (text !== this.#lastRenderedDigit) {
              this.digitElement.textContent = text;
              this.#lastRenderedDigit = text;
            }
          }
          #emitInput() {
            this.quickEmit("input", this.#value);
            this.element.dispatchEvent(new Event("input", { bubbles: true }));
          }
          #emitChange() {
            this.quickEmit("change", this.#value);
            this.element.dispatchEvent(new Event("change", { bubbles: true }));
          }
          reset() {
            const resetValue = this.options.defaultValue !== void 0 ? this.options.defaultValue : this.#isBipolar() ? 0 : this.options.min;
            if (this.#value === resetValue) return;
            this.value = resetValue;
            this.#emitChange();
            this.#emitInput();
          }
          #shouldResetFromPointerStart(domEvent) {
            if (!domEvent || domEvent.button !== 0) return false;
            const now = performance.now();
            const x = domEvent.clientX;
            const y = domEvent.clientY;
            const interval = now - this.#lastPointerStartTime;
            const dx = x - this.#lastPointerStartX;
            const dy = y - this.#lastPointerStartY;
            const distanceSq = dx * dx + dy * dy;
            this.#lastPointerStartTime = now;
            this.#lastPointerStartX = x;
            this.#lastPointerStartY = y;
            const DOUBLE_START_MS = 300;
            const MAX_DISTANCE_PX = 12;
            return interval > 0 && interval <= DOUBLE_START_MS && distanceSq <= MAX_DISTANCE_PX * MAX_DISTANCE_PX;
          }
          #showTooltip() {
            if (!this.options.showTooltip || !LS.Tooltips || this.style.showTooltip === false) return;
            const displayValue = this.#formatValue(this.#value);
            LS.Tooltips.position(this.element).show(displayValue);
          }
          #hideTooltip() {
            if (!this.options.showTooltip || !LS.Tooltips) return;
            LS.Tooltips.hide();
          }
          #formatValue(value) {
            if (typeof this.options.valueDisplayFormatter === "function") {
              return this.options.valueDisplayFormatter(value);
            }
            return Number(value.toFixed(2)).toString();
          }
          #updateLabel() {
            if (this.options.label) {
              if (!this.labelElement) {
                this.labelElement = LS.Create({ class: "ls-knob-label" });
                this.element.appendChild(this.labelElement);
              }
              if (typeof this.options.label === "string") {
                this.labelElement.textContent = this.options.label;
              } else if (this.options.label instanceof HTMLElement) {
                this.labelElement.textContent = "";
                this.labelElement.appendChild(this.options.label);
              }
              this.labelElement.style.display = "";
            } else if (this.labelElement) {
              this.labelElement.style.display = "none";
            }
          }
          /**
           * Set the knob preset/style
           * @param {string|Object} preset - Preset name or style object
           * @param {boolean} quiet - If true, skip re-render
           */
          setPreset(preset, quiet = false) {
            if (typeof preset === "string") {
              if (this.style.name === preset) return;
              const presetName = preset;
              const presetStyle = PRESETS[preset] || {};
              this.style = { ...DEFAULT_STYLE, ...presetStyle, name: presetName };
            } else if (typeof preset === "object") {
              this.style = { ...DEFAULT_STYLE, ...preset };
            }
            const newPresetName = this.style.name || "custom";
            if (this.element.getAttribute("preset") !== newPresetName) {
              this.element.setAttribute("preset", newPresetName);
            }
            if (this.element.getAttribute("knob-pointer") !== this.style.pointer) {
              this.element.setAttribute("knob-pointer", this.style.pointer);
            }
            const digitAttribute = this.style.digit ? "true" : "false";
            if (this.element.getAttribute("knob-digit") !== digitAttribute) {
              this.element.setAttribute("knob-digit", digitAttribute);
            }
            if (!quiet && this.#initialized) {
              this.#initializeVisuals();
              this.frameScheduler.schedule();
            }
          }
          /**
           * Update style options
           * @param {Object} styleOptions - Style properties to update
           */
          updateStyle(styleOptions = {}) {
            Object.assign(this.style, styleOptions);
            this.element.setAttribute("knob-pointer", this.style.pointer);
            this.element.setAttribute("knob-digit", this.style.digit ? "true" : "false");
            this.#initializeVisuals();
            this.frameScheduler.schedule();
          }
          /**
           * Update knob options
           * @param {Object} options - Options to update (min, max, step, etc.)
           */
          updateOptions(options = {}) {
            Object.assign(this.options, options);
            this.value = this.#value;
            if ("label" in options) {
              this.#updateLabel();
            }
          }
          get label() {
            return this.options.label;
          }
          set label(val) {
            this.options.label = val;
            this.#updateLabel();
          }
          get bipolar() {
            return this.options.bipolar;
          }
          set bipolar(val) {
            this.options.bipolar = val;
            this.frameScheduler.schedule();
          }
          /**
           * Force a render update
           */
          render() {
            this.#initializeVisuals();
            this.frameScheduler.schedule();
          }
          /**
           * Clean up all resources
           */
          destroy() {
            this.frameScheduler.destroy();
            if (this.handle) {
              this.handle.destroy();
              this.handle = null;
            }
            if (this.__keydownHandler) {
              this.element.removeEventListener("keydown", this.__keydownHandler);
              this.__keydownHandler = null;
            }
            if (this.__wheelHandler) {
              this.element.removeEventListener("wheel", this.__wheelHandler);
              this.__wheelHandler = null;
            }
            this.element.classList.remove("ls-knob", "ls-knob-active", "ls-knob-disabled");
            this.element.removeAttribute("tabindex");
            this.element.removeAttribute("role");
            this.element.removeAttribute("aria-valuenow");
            this.element.removeAttribute("aria-valuemin");
            this.element.removeAttribute("aria-valuemax");
            this.element.removeAttribute("preset");
            this.element.removeAttribute("knob-pointer");
            this.element.removeAttribute("knob-digit");
            this.events.clear();
            this.svg = null;
            this.arc = null;
            this.back = null;
            this.rotor = null;
            this.stator = null;
            this.digitElement = null;
            this.labelElement = null;
            this.element = null;
            this.#initialized = false;
          }
        }, { global: true, name: "Knob" });
        customElements.define("ls-knob", class LSKnob extends HTMLElement {
          static observedAttributes = ["value", "min", "max", "step", "preset", "disabled", "label", "show-tooltip", "bipolar", "numeric"];
          constructor() {
            super();
            this.knob = null;
            this.__pendingValue = null;
          }
          connectedCallback() {
            if (this.knob) return;
            if (!LS.GetComponent("Knob")) {
              LS.on("component-loaded", (name) => {
                if (name === "Knob") this.connectedCallback();
                return LS.REMOVE_LISTENER;
              });
              return;
            }
            const options = {
              min: this.hasAttribute("min") ? parseFloat(this.getAttribute("min")) : 0,
              max: this.hasAttribute("max") ? parseFloat(this.getAttribute("max")) : 100,
              step: this.hasAttribute("step") ? parseFloat(this.getAttribute("step")) : 1,
              value: this.__pendingValue ?? (this.hasAttribute("value") ? parseFloat(this.getAttribute("value")) : 0),
              preset: this.getAttribute("preset") || "default",
              disabled: this.hasAttribute("disabled"),
              label: this.getAttribute("label") || null,
              showTooltip: !this.hasAttribute("show-tooltip") || this.getAttribute("show-tooltip") !== "false",
              numeric: this.hasAttribute("numeric") && this.getAttribute("numeric") !== "false",
              bipolar: this.hasAttribute("bipolar") ? this.getAttribute("bipolar") === "auto" ? "auto" : this.getAttribute("bipolar") !== "false" : "auto"
            };
            this.knob = new LS.Knob(this, options);
            this.knob.on("input", (value) => {
              this.setAttribute("value", value);
            });
            this.knob.on("change", (value) => {
              this.setAttribute("value", value);
            });
            this.__pendingValue = null;
          }
          disconnectedCallback() {
            if (this.knob && this.knob.options.destroyOnDisconnect) this.destroy();
          }
          attributeChangedCallback(name, oldValue, newValue) {
            if (!this.knob) {
              if (name === "value") {
                this.__pendingValue = parseFloat(newValue) || 0;
              }
              return;
            }
            switch (name) {
              case "value":
                const numValue = parseFloat(newValue) || 0;
                if (this.knob.value !== numValue) {
                  this.knob.value = numValue;
                }
                break;
              case "min":
                this.knob.min = parseFloat(newValue) || 0;
                break;
              case "max":
                this.knob.max = parseFloat(newValue) || 100;
                break;
              case "step":
                this.knob.step = parseFloat(newValue) || 1;
                break;
              case "preset":
                if (newValue && newValue !== oldValue) {
                  this.knob.setPreset(newValue);
                }
                break;
              case "disabled":
                this.knob.disabled = this.hasAttribute("disabled");
                break;
              case "label":
                this.knob.label = newValue || null;
                break;
              case "show-tooltip":
                this.knob.options.showTooltip = newValue !== "false";
                break;
              case "bipolar":
                this.knob.bipolar = newValue === "auto" ? "auto" : newValue !== "false";
                break;
              case "numeric":
                this.knob.setPreset(newValue === "false" ? "default" : "numeric");
                break;
            }
          }
          get value() {
            return this.knob?.value ?? this.__pendingValue ?? 0;
          }
          set value(val) {
            if (this.knob) {
              this.knob.value = val;
              this.setAttribute("value", this.knob.value);
            } else {
              this.__pendingValue = parseFloat(val) || 0;
            }
          }
          get min() {
            return this.knob?.min ?? parseFloat(this.getAttribute("min")) ?? 0;
          }
          set min(val) {
            this.setAttribute("min", val);
          }
          get max() {
            return this.knob?.max ?? parseFloat(this.getAttribute("max")) ?? 100;
          }
          set max(val) {
            this.setAttribute("max", val);
          }
          get step() {
            return this.knob?.step ?? parseFloat(this.getAttribute("step")) ?? 1;
          }
          set step(val) {
            this.setAttribute("step", val);
          }
          get disabled() {
            return this.hasAttribute("disabled");
          }
          set disabled(val) {
            if (val) {
              this.setAttribute("disabled", "");
            } else {
              this.removeAttribute("disabled");
            }
          }
          get label() {
            return this.knob?.label ?? this.getAttribute("label");
          }
          set label(val) {
            if (val) {
              this.setAttribute("label", val);
            } else {
              this.removeAttribute("label");
            }
          }
          get showTooltip() {
            return this.knob?.options.showTooltip ?? this.getAttribute("show-tooltip") !== "false";
          }
          set showTooltip(val) {
            this.setAttribute("show-tooltip", val ? "true" : "false");
          }
          get numeric() {
            if (this.knob) {
              return this.knob.style.name === "numeric" || !!this.knob.style.digit;
            }
            return this.hasAttribute("numeric") && this.getAttribute("numeric") !== "false";
          }
          set numeric(val) {
            this.setAttribute("numeric", val ? "true" : "false");
          }
          get bipolar() {
            return this.knob?.bipolar ?? this.getAttribute("bipolar");
          }
          set bipolar(val) {
            if (val === "auto") {
              this.setAttribute("bipolar", "auto");
            } else {
              this.setAttribute("bipolar", val ? "true" : "false");
            }
          }
          get defaultValue() {
            return this.knob?.defaultValue ?? this.getAttribute("data-default");
          }
          set defaultValue(val) {
            if (this.knob) {
              this.knob.defaultValue = val;
            } else {
              this.setAttribute("data-default", val);
            }
          }
          reset() {
            if (this.knob) {
              this.knob.reset();
            }
          }
          /**
           * Set a custom value formatter for the tooltip
           * @param {Function} formatter - Function that takes value and returns display string
           */
          setValueFormatter(formatter) {
            if (this.knob) {
              this.knob.options.valueDisplayFormatter = formatter;
            }
          }
          /**
           * Set the knob preset
           * @param {string} preset - Preset name
           */
          setPreset(preset) {
            this.knob?.setPreset(preset);
          }
          /**
           * Update style options
           * @param {Object} options - Style options
           */
          updateStyle(options) {
            this.knob?.updateStyle(options);
          }
          /**
           * Destroy the knob instance
           */
          destroy() {
            if (this.knob) {
              this.knob.destroy();
              this.knob = null;
            }
            this.__pendingValue = null;
          }
        });
      })();
      /**
       * Menu Component
       * Primary abstract menu class used for dropdowns, context menus, select menus, etc.
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      LS.LoadComponent(class Menu extends LS.Component {
        static index = 0;
        static groups = {};
        static contextMenuBindings = /* @__PURE__ */ new WeakMap();
        static contextMenus = /* @__PURE__ */ new Set();
        static openMenus = /* @__PURE__ */ new Set();
        static globalClickListenerBound = false;
        static zIndexCounter = 1e4;
        static DEFAULTS = {
          topLayer: true,
          fixed: true,
          selectable: false,
          closeOnSelect: true,
          closeable: true,
          adjacentElement: null,
          openOnAdjacentClick: true,
          adjacentMode: "click",
          ephemeral: false,
          searchable: false,
          inheritAdjacentWidth: false,
          group: null
        };
        static addContextMenu(element, itemsProvider, options = {}) {
          if (!(element instanceof HTMLElement)) return null;
          if (!Array.isArray(itemsProvider) && typeof itemsProvider !== "function") return null;
          let binding = this.contextMenuBindings.get(element);
          if (!binding || !binding.menu || binding.menu.destroyed) {
            if (binding && binding.handler) {
              element.removeEventListener("contextmenu", binding.handler);
            }
            const menu = new LS.Menu({
              adjacentElement: element,
              adjacentMode: "context",
              openOnAdjacentClick: false,
              items: Array.isArray(itemsProvider) ? itemsProvider : [],
              ...options
            });
            this.contextMenus.add(menu);
            binding = {
              menu,
              itemsProvider,
              options,
              handler: null
            };
            binding.handler = (e) => {
              e.preventDefault();
              e.stopPropagation();
              for (const contextMenu of this.contextMenus) {
                if (!contextMenu || contextMenu.destroyed) {
                  this.contextMenus.delete(contextMenu);
                  continue;
                }
                if (contextMenu !== menu && contextMenu.isOpen) {
                  contextMenu.close();
                }
              }
              const sourceItems = typeof binding.itemsProvider === "function" ? binding.itemsProvider(e, menu) : binding.itemsProvider;
              const nextItems = Array.isArray(sourceItems) ? sourceItems : [];
              if (menu.items !== nextItems) {
                menu.replaceItems(nextItems);
              } else {
                menu.render();
              }
              menu.open(e.clientX, e.clientY);
            };
            element.addEventListener("contextmenu", binding.handler);
            this.contextMenuBindings.set(element, binding);
            return menu;
          }
          binding.itemsProvider = itemsProvider;
          binding.options = options || {};
          this.contextMenus.add(binding.menu);
          if ("closeOnSelect" in binding.options) binding.menu.options.closeOnSelect = binding.options.closeOnSelect;
          if ("closeable" in binding.options) binding.menu.options.closeable = binding.options.closeable;
          if ("selectable" in binding.options) binding.menu.options.selectable = binding.options.selectable;
          if ("fixed" in binding.options) binding.menu.options.fixed = binding.options.fixed;
          if ("inheritAdjacentWidth" in binding.options) binding.menu.options.inheritAdjacentWidth = binding.options.inheritAdjacentWidth;
          if (Array.isArray(binding.itemsProvider)) {
            if (binding.menu.items !== binding.itemsProvider) {
              binding.menu.replaceItems(binding.itemsProvider);
            } else {
              binding.menu.render();
            }
          } else {
            binding.menu.render();
          }
          return binding.menu;
        }
        /**
         * Menu constructor
         * @param {*} element (optional) Container element or null to create a new one
         * @param {*} options Menu options
         * @property {boolean} options.topLayer If true, the menu is added to the top layer
         * @property {boolean} options.selectable If true, the menu behaves like a select
         * @property {boolean} options.closeOnSelect If true, the menu closes when an item is selected
         * @property {boolean} options.closeable If true, the menu can be closed
         * @property {Element} options.adjacentElement If provided, the menu opens next to this element
         * @property {string} options.adjacentMode 'click' (default) or 'context' to open on right-click
         * @property {boolean} options.openOnAdjacentClick If true, clicking the adjacentElement toggles the menu
         * @property {boolean} options.inheritAdjacentWidth If true, the menu inherits the width of the adjacentElement
         * @property {boolean} options.fixed If true, the menu position is fixed rather than static
         * @property {boolean} options.ephemeral If true, the menu is destroyed when closed
         * @property {boolean} options.searchable If true, the menu has a search box to filter items
         * @property {string} options.group If set, only one menu in the group can be open at a time
         */
        constructor(element, options = null) {
          super();
          this.isOpen = false;
          this.items = [];
          this.selectedItem = null;
          this.focusedItem = null;
          this.activeSubmenu = null;
          this.parentMenu = null;
          this.__previousActiveElement = null;
          const isElement = element instanceof HTMLElement;
          if (!isElement) {
            options = options || element;
          }
          options = options || {};
          this.container = isElement ? element : LS.Create({
            class: "ls-menu"
          });
          this.container.style.display = "none";
          this.container.classList.add("ls-menu-container");
          this.container.tabIndex = -1;
          if (!this.constructor.globalClickListenerBound) {
            const MenuClass = this.constructor;
            document.addEventListener("pointerdown", MenuClass.__globalPointerHandler = (e) => {
              if (!MenuClass.openMenus.size) return;
              for (const menu of MenuClass.openMenus) {
                menu.#handleDocumentClick(e.target);
              }
            }, true);
            this.constructor.globalClickListenerBound = true;
          }
          if (options.items) {
            this.items = options.items;
            delete options.items;
          }
          this.options = LS.Util.defaults(this.constructor.DEFAULTS, options || {});
          if (this.options.group) {
            if (!this.constructor.groups[this.options.group]) {
              this.constructor.groups[this.options.group] = /* @__PURE__ */ new Set();
            }
            this.constructor.groups[this.options.group].add(this);
          }
          if (this.options.topLayer) {
            LS.once("ready", () => {
              this.container.addTo(LS._topLayer.querySelector(".ls-dropdown-layer") || LS.Create({
                class: "ls-dropdown-layer"
              }).addTo(LS._topLayer));
            });
          }
          this.searchInput = null;
          this.searchContainer = null;
          if (this.options.adjacentElement) {
            this.options.adjacentElement.__menu = this;
            if (this.options.openOnAdjacentClick) {
              if (this.options.adjacentMode === "context") {
                this.options.adjacentElement.addEventListener("contextmenu", this.__adjacentClickHandler = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.open(e.clientX, e.clientY);
                });
              } else {
                this.options.adjacentElement.addEventListener("pointerdown", this.__adjacentClickHandler = (e) => {
                  e.stopPropagation();
                  this.toggle();
                });
              }
              this.options.adjacentElement.addEventListener("keydown", this.__adjacentKeyHandler = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!this.isOpen) {
                    this.open();
                    this.navigate(1);
                  } else {
                    this.close();
                  }
                } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  if (!this.isOpen) {
                    this.open();
                  }
                  this.navigate(e.key === "ArrowDown" ? 1 : -1);
                }
              });
              if (this.options.group && this.options.adjacentMode !== "context") {
                this.options.adjacentElement.addEventListener("mouseenter", this.__adjacentHoverHandler = () => {
                  const group = this.constructor.groups[this.options.group];
                  if (!group) return;
                  let anyOpen = false;
                  for (const menu of group) {
                    if (menu.isOpen) {
                      anyOpen = true;
                      break;
                    }
                  }
                  if (anyOpen && !this.isOpen) {
                    this.open();
                  }
                });
              }
            }
          }
          if (this.options.ephemeral) {
            this.on("close", () => {
              this.destroy();
            });
          }
          this.frameScheduler = null;
          this.container.addEventListener("keydown", (e) => this.#handleKeyDown(e));
        }
        #ensureSearchElements() {
          if (!this.options.searchable || this.searchInput) return;
          this.searchInput = LS.Create("input", {
            type: "text",
            class: "ls-menu-search",
            placeholder: "Search...",
            attributes: {
              autocomplete: "off"
            }
          });
          this.searchContainer = LS.Create("div", {
            class: "ls-menu-search-container",
            inner: this.searchInput
          });
          this.searchInput.addEventListener("input", () => {
            this.#filterItems(this.searchInput.value);
          });
          this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              this.navigate(1);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (this.focusedItem) {
                this.#handleItemClick(this.focusedItem);
              }
            }
          });
        }
        #render() {
          const hasIcons = this.items.some((i) => i.icon);
          this.container.classList.toggle("ls-menu-has-icons", hasIcons);
          this.container.classList.toggle("ls-menu-no-icons", !hasIcons);
          const currentItems = [];
          for (const item of this.items) {
            if (!item.hidden) {
              currentItems.push(item);
            }
          }
          while (currentItems[0] && (currentItems[0].type === "separator" || currentItems[0].element?.tagName === "HR")) {
            currentItems.shift();
          }
          while (currentItems[currentItems.length - 1] && (currentItems[currentItems.length - 1].type === "separator" || currentItems[currentItems.length - 1].element?.tagName === "HR")) {
            currentItems.pop();
          }
          const nextChildren = [];
          if (this.searchContainer) {
            nextChildren.push(this.searchContainer);
          }
          for (const item of currentItems) {
            if (!item.element) {
              this.#createItemElement(item);
            }
            this.#updateItemElement(item);
            nextChildren.push(item.element);
          }
          const existingChildren = this.container.children;
          let changed = existingChildren.length !== nextChildren.length;
          if (!changed) {
            for (let i = 0; i < nextChildren.length; i++) {
              if (existingChildren[i] !== nextChildren[i]) {
                changed = true;
                break;
              }
            }
          }
          if (changed) {
            this.container.replaceChildren(...nextChildren);
          }
        }
        #filterItems(query) {
          const normalizedQuery = LS.Util.normalize(query);
          let firstVisible = null;
          for (const item of this.items) {
            if (!item.element) continue;
            if (item.type === "separator" || item.type === "label") {
              if (normalizedQuery) {
                item.element.style.display = "none";
              } else {
                item.element.style.display = "";
              }
              continue;
            }
            const text = item.text || "";
            const normalizedText = LS.Util.normalize(text);
            const match = normalizedText.includes(normalizedQuery);
            item.element.style.display = match ? "" : "none";
            if (match && !firstVisible && !item.disabled) {
              firstVisible = item;
            }
          }
          if (firstVisible) {
            this.focus(firstVisible);
          } else {
            this.focusedItem = null;
            this.items.forEach((i) => {
              if (i.element) i.element.classList.remove("focused");
            });
          }
        }
        #createItemElement(item) {
          if (item.type === "separator") {
            item.element = LS.Create("hr", {
              class: "ls-menu-separator"
            });
            return;
          }
          if (item.type === "label") {
            item.element = LS.Create({
              class: "ls-menu-label",
              textContent: item.text
            });
            return;
          }
          if (item.type === "checkbox" || item.type === "radio") {
            const input = LS.Create("input", {
              type: item.type,
              checked: !!item.checked,
              disabled: !!item.disabled,
              tabindex: -1
            });
            if (item.type === "radio" && item.group) {
              input.name = item.group;
            }
            item.element = LS.Create("label", {
              class: `ls-${item.type} ls-menu-item`,
              content: [
                input,
                LS.Create("span"),
                document.createTextNode(" " + item.text)
              ],
              tabindex: -1
            });
            item.inputElement = input;
            item.element.addEventListener("click", (event) => {
              event.stopPropagation();
              if (item.disabled) {
                event.preventDefault();
              }
            });
            item.element.addEventListener("mouseenter", () => {
              if (item.disabled) return;
              this.#handleItemHover(item);
            });
            input.addEventListener("change", () => {
              this.#handleItemClick(item);
            });
            return;
          }
          const label = LS.Create("span");
          label.innerHTML = item.text;
          LS.Util.sanitize(label);
          label.classList.add("ls-menu-item-label");
          const inner = [label];
          if (item.icon) {
            inner.unshift(LS.Create("i", { class: item.icon + " ls-menu-item-icon" }));
          }
          if (item.items || item.type === "submenu") {
            inner.push({ class: "ls-menu-submenu-arrow" });
          }
          item.element = LS.Create({
            class: "ls-list-item ls-menu-item",
            attributes: { "role": "option", tabindex: "-1" },
            inner
          });
          if (item.disabled) {
            item.element.classList.add("disabled");
          }
          item.element.dataset.value = item.value;
          item.element.addEventListener("pointerup", (event) => {
            event.stopPropagation();
            if (item.disabled) return;
            this.#handleItemClick(item);
          });
          item.element.addEventListener("mouseenter", () => {
            if (item.disabled) return;
            this.#handleItemHover(item);
          });
          if (!item.items && item.submenu) {
            item.submenu.destroy();
            item.submenu = null;
          }
        }
        #ensureSubmenu(item) {
          if (!item || !item.items) return null;
          if (!item.submenu || item.submenu.destroyed) {
            item.submenu = new LS.Menu(null, {
              fixed: true,
              selectable: this.options.selectable,
              closeable: true
            });
            item.submenu.parentMenu = this;
            item.submenu.on("select", (data) => this.emit("select", [data]));
            item.submenu.on("check", (data) => this.emit("check", [data]));
          }
          if (item.submenu.items !== item.items) {
            item.submenu.replaceItems(item.items);
          }
          return item.submenu;
        }
        #updateItemElement(item) {
          if (!item.element) return;
          if (item === this.focusedItem) {
            item.element.classList.add("focused");
            item.element.setAttribute("tabindex", "0");
          } else {
            item.element.classList.remove("focused");
            item.element.setAttribute("tabindex", "-1");
          }
          if (this.options.selectable && item === this.selectedItem) {
            item.element.classList.add("selected");
          } else {
            item.element.classList.remove("selected");
          }
          if (item.type === "checkbox" || item.type === "radio") {
            if (item.inputElement) {
              item.inputElement.checked = !!item.checked;
              item.inputElement.disabled = !!item.disabled;
            }
            if (item.checked) {
              item.element.classList.add("checked");
            } else {
              item.element.classList.remove("checked");
            }
          }
          if (item.disabled) {
            item.element.classList.add("disabled");
          } else {
            item.element.classList.remove("disabled");
          }
        }
        #handleItemClick(item) {
          if (item.items) {
            if (item.submenu && !item.submenu.isOpen) {
              this.#openSubmenu(item);
            }
            return;
          }
          if (item.type === "checkbox") {
            if (item.inputElement) {
              item.checked = item.inputElement.checked;
            } else {
              item.checked = !item.checked;
            }
            this.render();
            this.emit("check", [item]);
            if (typeof item.action === "function") item.action(item);
            return;
          }
          if (item.type === "radio") {
            if (item.inputElement) {
              if (item.inputElement.checked) {
                if (item.group) {
                  this.items.forEach((i) => {
                    if (i.type === "radio" && i.group === item.group && i !== item) {
                      i.checked = false;
                    }
                  });
                }
                item.checked = true;
                this.render();
                this.emit("check", [item]);
                if (typeof item.action === "function") item.action(item);
              }
            } else if (!item.checked) {
              if (item.group) {
                this.items.forEach((i) => {
                  if (i.type === "radio" && i.group === item.group) {
                    i.checked = false;
                  }
                });
              }
              item.checked = true;
              this.render();
              this.emit("check", [item]);
              if (typeof item.action === "function") item.action(item);
            }
            return;
          }
          this.select(item);
          if (typeof item.action === "function") item.action(item);
          if (this.options.closeOnSelect) {
            this.closeAll();
          }
        }
        #handleItemHover(item) {
          if (!this.isOpen) return;
          if (this.activeSubmenu && this.activeSubmenu !== item.submenu) {
            this.activeSubmenu.close();
            this.activeSubmenu = null;
          }
          this.focus(item);
          if (item.items) {
            this.#openSubmenu(item);
          }
        }
        #openSubmenu(item) {
          if (!this.isOpen) return;
          if (!item || !item.items) return;
          let menu = this;
          while (menu) {
            if (!menu.isOpen) return;
            menu = menu.parentMenu;
          }
          const submenu = this.#ensureSubmenu(item);
          if (!submenu) return;
          const rect = item.element.getBoundingClientRect();
          submenu.open(rect.right, rect.top, {
            anchorRect: rect
          });
          this.activeSubmenu = submenu;
        }
        #closeTree(restoreFocus = true) {
          if (this.items) {
            for (const item of this.items) {
              if (!item.submenu) continue;
              if (item.submenu.isOpen || item.submenu.activeSubmenu) {
                item.submenu.#closeTree(false);
              }
            }
          }
          this.activeSubmenu = null;
          if (this.isOpen) {
            this.close(restoreFocus);
          }
        }
        #handleDocumentClick(target) {
          if (!this.isOpen || !this.container) return;
          if (this.container.contains(target)) return;
          if (this.options.adjacentElement && this.options.adjacentElement.contains(target)) {
            if (this.options.adjacentMode !== "context") return;
          }
          let parent = this.parentMenu;
          while (parent) {
            if (parent.container && parent.container.contains(target)) return;
            parent = parent.parentMenu;
          }
          this.close();
        }
        #handleKeyDown(event) {
          const key = event.key;
          if (key === "ArrowDown") {
            event.preventDefault();
            this.navigate(1);
          } else if (key === "ArrowUp") {
            event.preventDefault();
            this.navigate(-1);
          } else if (key === "ArrowRight") {
            event.preventDefault();
            if (this.focusedItem && this.focusedItem.items) {
              this.#openSubmenu(this.focusedItem);
              if (this.focusedItem.submenu && this.focusedItem.submenu.isOpen) {
                this.focusedItem.submenu.navigate(1);
              }
            } else if (this.options.group && this.options.adjacentMode !== "context") {
              this.#navigateGroup(1);
            }
          } else if (key === "ArrowLeft") {
            event.preventDefault();
            if (this.parentMenu) {
              this.close();
              if (this.parentMenu.focusedItem) {
                this.parentMenu.focus(this.parentMenu.focusedItem);
              } else {
                this.parentMenu.container.focus();
              }
            } else if (this.options.group && this.options.adjacentMode !== "context") {
              this.#navigateGroup(-1);
            }
          } else if (key === "Enter" || key === " ") {
            event.preventDefault();
            if (this.focusedItem) {
              if ((this.focusedItem.type === "checkbox" || this.focusedItem.type === "radio") && this.focusedItem.inputElement) {
                this.focusedItem.inputElement.click();
              } else {
                this.#handleItemClick(this.focusedItem);
              }
            }
          } else if (key === "Escape") {
            event.preventDefault();
            this.close();
          } else if (key === "Tab") {
            this.close();
          }
        }
        #navigateGroup(direction) {
          const groupName = this.options.group;
          if (!groupName) return;
          const groupSet = this.constructor.groups[groupName];
          if (!groupSet || groupSet.size < 2) return;
          const menus = Array.from(groupSet).filter((m) => m.options.adjacentElement && document.body.contains(m.options.adjacentElement));
          menus.sort((a, b) => {
            return a.options.adjacentElement.compareDocumentPosition(b.options.adjacentElement) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          });
          const currentIndex = menus.indexOf(this);
          if (currentIndex === -1) return;
          let nextIndex = currentIndex + direction;
          if (nextIndex >= menus.length) nextIndex = 0;
          if (nextIndex < 0) nextIndex = menus.length - 1;
          const nextMenu = menus[nextIndex];
          this.close();
          nextMenu.open();
          nextMenu.navigate(1);
        }
        render(force = false) {
          if (force) {
            this.#render();
            return;
          }
          if (!this.isOpen) return;
          if (!this.frameScheduler) {
            this.frameScheduler = new LS.Util.FrameScheduler(() => this.#render());
          }
          this.frameScheduler.schedule();
        }
        focus(item) {
          if (this.focusedItem && this.focusedItem.element) {
            this.focusedItem.element.classList.remove("focused");
            this.focusedItem.element.setAttribute("tabindex", "-1");
          }
          this.focusedItem = item;
          if (this.focusedItem && this.focusedItem.element) {
            this.focusedItem.element.classList.add("focused");
            this.focusedItem.element.setAttribute("tabindex", "0");
            this.focusedItem.element.focus();
            if (this.focusedItem.element.scrollIntoView) {
              this.focusedItem.element.scrollIntoView({ block: "nearest" });
            }
          }
        }
        select(item, emitEvent = true) {
          if (typeof item === "number") {
            item = this.items[item] || null;
          }
          if (typeof item === "string") {
            item = this.items.find((i) => i.value === item) || this.items[0];
          }
          if (!item) return;
          if (this.options.selectable) {
            this.selectedItem = item;
          }
          if (emitEvent) {
            this.emit("select", [item]);
          }
          this.render();
        }
        /**
         * Add a new item to the menu
         * @param {*} item 
         * @property {string} item.text Text of the item
         * @property {string} item.icon (optional) Icon class for the item
         * @property {string} item.value Value of the item
         * @property {string} item.type Type of the item: "option" (default), "separator", "label", "checkbox", "radio", "submenu"
         * @property {boolean} item.checked For checkbox and radio types, whether the item is checked
         * @property {string} item.group For radio types, the group name
         * @property {Array} item.items For submenu type, the array of submenu items
         * @property {boolean} item.disabled If true, the item is disabled
         * @property {function} item.action Function to call when the item is selected
         */
        add(item) {
          this.items.push(item);
          this.render();
        }
        /**
         * Replaces menu items
         * @param {Array} items Array of items.
         */
        replaceItems(items) {
          const nextItems = Array.isArray(items) ? items : [];
          if (this.items === nextItems) {
            this.render();
            return;
          }
          for (const item of this.items) {
            if (!item.submenu) continue;
            if (nextItems.includes(item)) continue;
            item.submenu.destroy();
            item.submenu = null;
          }
          this.items = nextItems;
          if (this.selectedItem && !this.items.includes(this.selectedItem)) {
            this.selectedItem = null;
          }
          if (this.focusedItem && !this.items.includes(this.focusedItem)) {
            this.focusedItem = null;
          }
          this.render();
        }
        remove(item) {
          const index = this.items.indexOf(item);
          if (index === -1) return;
          this.items.splice(index, 1);
          if (item.submenu) {
            item.submenu.destroy();
            item.submenu = null;
          }
          if (item.element) {
            item.element.remove();
            item.element = null;
          }
          this.render();
        }
        addItems(items) {
          if (!items || items.length === 0) return;
          this.items.push(...items);
          this.render();
        }
        toggle() {
          if (this.isOpen) {
            this.close();
          } else {
            this.open();
          }
        }
        open(x, y, positionOptions = null) {
          if (this.options.group && this.constructor.groups[this.options.group]) {
            for (const menu of this.constructor.groups[this.options.group]) {
              if (menu !== this && (menu.isOpen || menu.activeSubmenu)) {
                menu.#closeTree(false);
              }
            }
          }
          this.#ensureSearchElements();
          this.render(true);
          this.container.style.zIndex = ++this.constructor.zIndexCounter;
          if (this.options.fixed) {
            let posX = x;
            let posY = y;
            let anchorRect = positionOptions && positionOptions.anchorRect ? positionOptions.anchorRect : null;
            const viewportPadding = 8;
            if (posX === void 0 || posY === void 0) {
              if (this.options.adjacentElement) {
                const rect2 = this.options.adjacentElement.getBoundingClientRect();
                anchorRect = anchorRect || rect2;
                posX = rect2.left;
                posY = rect2.bottom;
                if (this.options.inheritAdjacentWidth) {
                  this.container.style.minWidth = rect2.width + "px";
                }
              } else {
                if (!this.options.inheritAdjacentWidth) {
                  this.container.style.minWidth = "";
                }
                posX = 0;
                posY = 0;
              }
            } else {
              if (!this.options.inheritAdjacentWidth) {
                this.container.style.minWidth = "";
              } else {
                const width = this.options.adjacentElement ? this.options.adjacentElement.getBoundingClientRect().width : null;
                if (width) {
                  this.container.style.minWidth = width + "px";
                }
              }
            }
            this.container.style.position = "fixed";
            this.container.style.left = posX + "px";
            this.container.style.top = posY + "px";
            this.container.style.maxWidth = "";
            this.container.style.maxHeight = "";
            const prevVisibility = this.container.style.visibility;
            this.container.style.visibility = "hidden";
            this.container.style.display = "block";
            const rect = this.container.getBoundingClientRect();
            const menuW = rect.width;
            const menuH = rect.height;
            const maxX = Math.max(viewportPadding, window.innerWidth - menuW - viewportPadding);
            const maxY = Math.max(viewportPadding, window.innerHeight - menuH - viewportPadding);
            if (posX + menuW > window.innerWidth - viewportPadding) {
              if (anchorRect) {
                const leftCandidate = anchorRect.left - menuW;
                if (leftCandidate >= viewportPadding) {
                  posX = leftCandidate;
                } else {
                  posX = maxX;
                }
              } else {
                posX = maxX;
              }
            }
            if (posY + menuH > window.innerHeight - viewportPadding) {
              if (anchorRect) {
                const aboveCandidate = anchorRect.top - menuH;
                if (aboveCandidate >= viewportPadding) {
                  posY = aboveCandidate;
                } else {
                  posY = maxY;
                }
              } else {
                posY = maxY;
              }
            }
            if (posX < viewportPadding) posX = viewportPadding;
            if (posY < viewportPadding) posY = viewportPadding;
            this.container.style.left = posX + "px";
            this.container.style.top = posY + "px";
            this.container.style.maxWidth = Math.max(0, window.innerWidth - posX - viewportPadding) + "px";
            this.container.style.maxHeight = Math.max(0, window.innerHeight - posY - viewportPadding) + "px";
            this.container.style.visibility = prevVisibility || "";
          }
          if (LS.Animation) {
            LS.Animation.fadeIn(this.container, 200, "down");
          } else {
            this.container.style.display = "block";
          }
          this.__previousActiveElement = document.activeElement;
          if (this.options.searchable && this.searchInput) {
            this.searchInput.value = "";
            this.#filterItems("");
            this.searchInput.focus();
          } else {
            if (this.selectedItem) {
              this.focus(this.selectedItem);
            } else {
              this.navigate(1);
            }
          }
          if (this.isOpen) return;
          this.isOpen = true;
          this.constructor.openMenus.add(this);
          this.emit("open");
        }
        close(restoreFocus = true) {
          if (!this.isOpen) return;
          if (restoreFocus && this.__previousActiveElement) {
            this.__previousActiveElement.focus();
          }
          this.__previousActiveElement = null;
          if (this.activeSubmenu) {
            this.activeSubmenu.#closeTree(false);
            this.activeSubmenu = null;
          }
          this.isOpen = false;
          this.constructor.openMenus.delete(this);
          this.emit("close");
          if (LS.Animation) {
            LS.Animation.fadeOut(this.container, 200, "down");
          } else {
            this.container.style.display = "none";
          }
        }
        closeAll() {
          this.close();
          if (this.parentMenu) {
            this.parentMenu.closeAll();
          }
        }
        navigate(direction) {
          if (this.items.length === 0) return;
          let currentIndex = this.items.indexOf(this.focusedItem);
          let newIndex = currentIndex;
          let count = 0;
          do {
            newIndex += direction;
            if (newIndex >= this.items.length) newIndex = 0;
            if (newIndex < 0) newIndex = this.items.length - 1;
            const item = this.items[newIndex];
            const isVisible = !item.element || item.element.style.display !== "none";
            if (item.type !== "separator" && item.type !== "label" && !item.disabled && isVisible) {
              this.focus(item);
              return;
            }
            count++;
          } while (count < this.items.length);
        }
        cloneOption(option) {
          return {
            text: option.text,
            icon: option.icon,
            value: option.value,
            type: option.type || "option",
            checked: option.checked,
            group: option.group,
            items: option.items ? option.items.map((i) => this.cloneOption(i)) : void 0
          };
        }
        export() {
          return this.items.map((item) => this.cloneOption(item));
        }
        destroy() {
          if (this.frameScheduler) {
            this.frameScheduler.destroy();
            this.frameScheduler = null;
          }
          this.container.remove();
          this.events.clear();
          this.constructor.contextMenus.delete(this);
          this.constructor.openMenus.delete(this);
          if (this.options.group && this.constructor.groups[this.options.group]) {
            this.constructor.groups[this.options.group].delete(this);
          }
          if (this.options.adjacentElement) {
            const contextBinding = this.constructor.contextMenuBindings.get(this.options.adjacentElement);
            if (contextBinding && contextBinding.menu === this) {
              this.options.adjacentElement.removeEventListener("contextmenu", contextBinding.handler);
              this.constructor.contextMenuBindings.delete(this.options.adjacentElement);
            }
            this.options.adjacentElement.__menu = null;
            if (this.__adjacentClickHandler) {
              this.options.adjacentElement.removeEventListener("pointerdown", this.__adjacentClickHandler);
              this.options.adjacentElement.removeEventListener("contextmenu", this.__adjacentClickHandler);
            }
            if (this.__adjacentKeyHandler) {
              this.options.adjacentElement.removeEventListener("keydown", this.__adjacentKeyHandler);
            }
            if (this.__adjacentHoverHandler) {
              this.options.adjacentElement.removeEventListener("mouseenter", this.__adjacentHoverHandler);
            }
          }
          this.items.forEach((item) => {
            if (item.submenu) item.submenu.destroy();
          });
          if (this.searchInput) {
            this.searchInput.remove();
            this.searchInput = null;
          }
          if (this.searchContainer) {
            this.searchContainer.remove();
            this.searchContainer = null;
          }
          this.container = null;
          this.items = null;
          this.selectedItem = null;
          this.focusedItem = null;
          this.isOpen = false;
          this.__previousActiveElement = null;
          this.destroyed = true;
        }
      }, { global: true, name: "Menu" });
      customElements.define("ls-select", class LSSelect extends HTMLElement {
        constructor() {
          super();
          this.__pendingValue = null;
        }
        connectedCallback() {
          if (this.menu) return;
          if (!this.__pendingValue) this.__pendingValue = this.getAttribute("value");
          if (!LS.GetComponent("Menu")) {
            console.error("LSSelect requires LS.Menu component to be loaded.");
            LS.on("component-loaded", (component) => {
              if (component.name === "Menu") {
                this.connectedCallback();
                return LS.REMOVE_LISTENER;
              }
            });
            return;
          }
          this.menu = new LS.Menu({
            fixed: true,
            searchable: this.hasAttribute("searchable"),
            selectable: true,
            adjacentElement: this,
            inheritAdjacentWidth: true
          });
          this.menu.on("select", (item) => {
            this.#updateValue();
            this.dispatchEvent(new Event("change", { bubbles: true, detail: { value: item.value, item } }));
            this.dispatchEvent(new Event("input", { bubbles: true, detail: { value: item.value, item } }));
            if (this.onchange) this.onchange({ target: this, value: item.value, item });
            if (this.oninput) this.oninput({ target: this, value: item.value, item });
          });
          this.menu.on("open", (item) => {
            this.setAttribute("aria-expanded", "true");
          });
          this.menu.on("close", (item) => {
            this.setAttribute("aria-expanded", "false");
          });
          this.setAttribute("role", "combobox");
          this.setAttribute("tabindex", "0");
          this.#generateMenu();
        }
        // Sadly there is no "garbageCollectedCallback"
        // So lifecycle management is manual and up to the user when using ls-select!!
        // disconnectedCallback() {
        //     this.destroy();
        // }
        connectedMoveCallback() {
        }
        #generateMenu() {
          let selectedOption = null;
          this.label = this.querySelector(".ls-select-label") || LS.Create({
            class: "ls-select-label"
          });
          this.content = LS.Create({
            class: "ls-select-content",
            inner: [
              this.label,
              { class: "ls-select-arrow" }
            ]
          }).addTo(this);
          if (!this._lsSelectOptions) {
            if (this.hasAttribute("ls-options-values")) {
              this.getAttribute("ls-options-values").split(",").forEach((value) => {
                let selected = false;
                value = value.trim();
                if (value.startsWith("[") && value.endsWith("]")) {
                  value = value.substring(1, value.length - 1).trim();
                  selected = !selectedOption;
                }
                const option = {
                  value,
                  text: value,
                  selected
                };
                this.menu.add(option);
                if (selected) {
                  selectedOption = option;
                }
              });
            }
            for (const optionElement of this.querySelectorAll("ls-option, option, optgroup")) {
              const isSelected = (optionElement.selected || optionElement.getAttribute("selected") !== null) && !selectedOption;
              const option = optionElement.tagName.toLowerCase() === "optgroup" ? {
                type: "label",
                text: optionElement.getAttribute("label") || ""
              } : {
                value: optionElement.value || optionElement.getAttribute("value") || optionElement.textContent,
                text: optionElement.getAttribute("label") || optionElement.textContent,
                selected: isSelected
              };
              optionElement.remove();
              this.menu.add(option);
              if (isSelected) {
                selectedOption = option;
              }
            }
          } else {
            this.menu.items = this._lsSelectOptions;
            delete this._lsSelectOptions;
          }
          this.menu.select(this.__pendingValue || selectedOption || 0, false);
          this.#updateValue();
          this.__pendingValue = null;
        }
        addOption(option) {
          this.menu.add(option);
        }
        toggle() {
          this.menu.toggle();
        }
        open() {
          this.menu.open();
        }
        close() {
          this.menu.close();
        }
        #updateValue() {
          const item = this.menu.selectedItem;
          this.label.textContent = item?.text || "";
          this.setAttribute("data-value", item?.value || "");
        }
        selectOption(value) {
          if (!this.menu) {
            this.__pendingValue = value;
            return;
          }
          this.menu.select(value, false);
          this.#updateValue();
        }
        get value() {
          return this.menu.selectedItem?.value || "";
        }
        set value(value) {
          this.selectOption(value);
        }
        destroy() {
          if (this.menu) {
            this.menu.destroy();
            this.menu = null;
          }
          this.content.remove();
          this.content = null;
          this.label = null;
          this.__pendingValue = null;
        }
      });
      (() => {
        function closeModal() {
          if (this instanceof HTMLElement) this.closest(".ls-modal").lsComponent.close();
          else {
            LS.Stack.pop();
          }
        }
        LS.LoadComponent(class Modal extends LS.Component {
          static DEFAULTS = {
            styled: true,
            fadeInDuration: 300,
            fadeOutDuration: 300
          };
          constructor(options = {}, template = {}) {
            super();
            this.options = LS.Util.defaults(this.constructor.DEFAULTS, options);
            this.isOpen = false;
            this.container = this.constructor.TEMPLATE({
              inner: this.options.content || null,
              // Template
              title: template.title || null,
              content: template.content || null,
              buttons: template.buttons || null,
              closeModal
            }).root;
            this.container.lsComponent = this;
            if (template.onOpen) {
              this.on("open", template.onOpen);
            }
            if (template.onClose) {
              this.on("close", template.onClose);
            }
            template = null;
            this.container.style.display = "none";
            if (this.options.styled !== false) {
              this.container.classList.add("ls-modal-styled");
            }
            this.container.style.width = this.options.width ? typeof this.options.width === "number" ? this.options.width + "px" : this.options.width : "450px";
            if (this.options.height) {
              this.container.style.height = typeof this.options.height === "number" ? this.options.height + "px" : this.options.height;
            }
            LS.Stack.container.add(this.container);
            if (this.options.open) {
              this.open();
            }
          }
          get isCloseable() {
            return this.options.closeable !== false;
          }
          get hasShade() {
            return this.options.shade !== false;
          }
          open() {
            if (this.isOpen || this.destroyed) return;
            this.previousFocus = document.activeElement;
            this.isOpen = true;
            if (LS.Stack.length > 0) {
              const topModal = LS.Modal.top;
              if (topModal && topModal.container) {
                topModal.container.classList.remove("ls-top-modal");
              }
            }
            LS.Stack.push(this);
            this.container.classList.add("open");
            this.container.classList.add("ls-top-modal");
            LS.Context.setTimeout(() => {
              if (!this.isOpen || this.destroyed) return;
              const focusable = this.container.querySelector("input, button, select, textarea, [tabindex]:not([tabindex='-1'])");
              if (focusable) {
                focusable.focus();
              } else {
                this.container.focus();
              }
            }, 0);
            this.container.style.zIndex = LS.Stack.length;
            if (LS.Animation && this.options.animate !== false) {
              LS.Animation.fadeIn(this.container, this.options.fadeInDuration || 300, this.options.fadeInDirection || "forward");
            }
            this.emit("open");
            return this;
          }
          close(refocus = true) {
            if (!this.isOpen || this.destroyed) return;
            this.isOpen = false;
            this.container.classList.remove("open");
            this.container.classList.remove("ls-top-modal");
            LS.Stack.remove(this);
            this.ctx.setTimeout(() => {
              if (this.isOpen || this.destroyed) return;
              if (LS.Stack.length === 0) {
                if (refocus) (this.previousFocus || document.body).focus();
              } else {
                const top = LS.Modal.top;
                if (top && top.container) {
                  if (refocus) top.container.classList.add("ls-top-modal");
                  if (refocus && this.previousFocus) {
                    this.previousFocus.focus();
                  } else {
                    top.container.focus();
                  }
                }
              }
            }, 0);
            if (LS.Animation && this.options.animate !== false) {
              LS.Animation.fadeOut(this.container, this.options.fadeOutDuration || 300, this.options.fadeOutDirection || "backward");
            }
            if (this.options.ephemeral) {
              this.destroy(true);
            }
            this.emit("close");
            return this;
          }
          destroy(delayed = false) {
            if (this.destroyed) return;
            if (this.isOpen) {
              this.close(false);
            }
            LS.Stack.remove(this);
            if (delayed) {
              LS.Context.setTimeout(() => {
                this.container.remove();
                this.container = null;
              }, this.options.fadeOutDuration || 300);
            } else {
              this.container.remove();
              this.container = null;
            }
            this.options = null;
            this.previousFocus = null;
            this.emit("destroy");
            this.events.clear();
            this.destroyed = true;
            return;
          }
          static get top() {
            return LS.Stack.top;
          }
          static closeAll() {
            for (const modal of LS.Stack.items) {
              if (modal instanceof LS.Modal) modal.close(false);
            }
            document.body.focus();
          }
          static closeTop() {
            return LS.Stack.pop();
          }
          static buildEphemeral(options = {}, modalOptions = {}) {
            modalOptions.ephemeral = true;
            modalOptions.open = true;
            return LS.Modal.build(options, modalOptions);
          }
          static TEMPLATE(d) {
            "use strict";
            var e0 = document.createElement("div");
            e0.tabIndex = "0";
            e0.className = "ls-modal";
            if (!!d.inner) {
              e0.appendChild(LS.toNode(d.inner));
            } else {
              if (!!d.title) {
                var e1 = document.createElement("h2");
                e1.className = "ls-modal-title";
                e1.append(LS.toNode(d.title));
                e0.appendChild(e1);
              }
              if (!!d.content) {
                var e2 = document.createElement("div");
                e2.className = "ls-modal-body";
                e2.append(LS.toNode(d.content));
                e0.appendChild(e2);
              }
              if (!!d.buttons) {
                var e3 = document.createElement("div");
                e3.className = "ls-modal-footer";
                var a4 = d.buttons || [];
                for (const i5 of a4) {
                  var e6 = document.createElement("button");
                  e6.textContent = i5.label || "Button";
                  e6.onclick = i5.onClick || i5.onclick || d.closeModal;
                  e6.setAttribute("ls-accent", i5.accent || null);
                  e6.className = ["ls-modal-button", i5.class].filter(Boolean).join(" ");
                  e3.appendChild(e6);
                }
                e0.appendChild(e3);
              }
            }
            var __rootValue = e0;
            return { root: __rootValue };
          }
          // static TEMPLATE = /* @BUILD compile-template */ LS.CompileTemplate((data, logic) => ({
          //     class: "ls-modal",
          //     tabIndex: "0",
          //     inner: logic.if(data.inner, data.inner, [
          //         logic.if(data.title, { tag: "h2", class: "ls-modal-title", inner: data.title }),
          //         logic.if(data.content, { tag: "div", class: "ls-modal-body", inner: data.content }),
          //         logic.if(data.buttons, {
          //             tag: "div",
          //             class: "ls-modal-footer",
          //             inner: logic.map(data.buttons, (button) => ({
          //                 tag: "button",
          //                 class: logic.join(" ", `ls-modal-button`, button.class),
          //                 accent: logic.or(button.accent, null),
          //                 textContent: logic.or(button.label, 'Button'),
          //                 onclick: logic.or(button.onClick, button.onclick, data.closeModal)
          //             }))
          //         })
          //     ])
          // }));
          static build(template = {}, modalOptions = {}) {
            return new LS.Modal(modalOptions, template);
          }
        }, { name: "Modal", global: true });
      })();
      LS.WebSocket = class WebSocketWrapper extends LS.EventEmitter {
        #options;
        constructor(url, options = {}) {
          super();
          if (!url) throw "No URL specified";
          if (url.startsWith("http://")) url = "ws://" + url.slice(7);
          if (url.startsWith("https://")) url = "wss://" + url.slice(8);
          if (!url.startsWith("ws://") && !url.startsWith("wss://")) url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + (url.startsWith("/") ? "" : "/") + url;
          this.addEventListener = this.on;
          this.removeEventListener = this.off;
          if (Array.isArray(options) || typeof options === "string") {
            options = { protocols: options };
          }
          if (typeof options !== "object" || options === null || typeof options === "undefined") options = {};
          this.#options = LS.Util.defaults({
            autoReconnect: true,
            reconnectInterval: 2e3,
            autoConnect: true,
            delayMessages: true,
            protocols: null,
            initialPayload: null
          }, options);
          this.queue = [];
          this.url = url;
          if (this.#options.autoConnect) this.connect();
        }
        get readyState() {
          return this.socket ? this.socket.readyState : 3;
        }
        get bufferedAmount() {
          return this.socket ? this.socket.bufferedAmount : 0;
        }
        get protocol() {
          return this.socket ? this.socket.protocol : "";
        }
        connect() {
          if (this.destroyed) throw "WebSocket is destroyed";
          if (this.socket && this.socket.readyState === 1) return;
          if (this.socket) {
            this.socket.close();
            this.socket = null;
          }
          this.socket = new LS.Context.WebSocket(this.url, this.#options.protocols || null);
          this.socket.addEventListener("open", (event) => {
            if (this.#options.initialPayload) {
              this.send(this.#options.initialPayload);
            }
            if (this.queue && this.queue.length > 0) {
              for (let message of this.queue) this.socket.send(message);
              this.queue.length = 0;
            }
            this.emit("open", [event]);
          });
          this.socket.addEventListener("message", (event) => {
            this.emit("message", [event.data, event]);
          });
          this.socket.addEventListener("close", async (event) => {
            if (this.destroyed) return;
            let prevent = false;
            this.emit("close", [event, () => {
              prevent = true;
            }]);
            if (!prevent && this.#options.autoReconnect) {
              this.reconnectTimeout = (this.#options.context || LS.Context).setTimeout(() => this.connect(), this.#options.reconnectInterval);
            }
          });
          this.socket.addEventListener("error", (event) => {
            this.emit("error", [event]);
          });
        }
        send(data) {
          if (this.destroyed) throw "WebSocket is destroyed";
          if (data instanceof Uint8Array) data = data.buffer;
          if (typeof data !== "string" && !(data instanceof ArrayBuffer) && !(data instanceof Blob)) {
            if (typeof data === "object") data = JSON.stringify(data);
            else data = String(data);
          }
          if (!this.socket || this.socket.readyState !== 1) {
            if (this.#options.delayMessages) this.queue.push(data);
            return false;
          }
          this.socket.send(data);
          return true;
        }
        close(code, message) {
          if (this.socket) this.socket.close(code, message);
        }
        destroy() {
          this.close();
          (this.#options.context && this.#options.context || LS.Context).clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
          this.emit("destroy");
          this.events.clear();
          this.socket = null;
          this.queue = null;
          this.#options = null;
          this.url = null;
          this.events = null;
          this.destroyed = true;
        }
      };
      LS.LoadComponent(class Node2 extends LS.EventEmitter {
        constructor(options = {}) {
          super();
          if (typeof options.onSignal === "function") {
            this.on("signal", options.onSignal);
          }
          this.signalEmitter = this.prepareEvent("signal");
          if (options.hasChildren) {
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
          if (!(child instanceof Node2)) {
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
      }, { name: "Node", global: true });
      /**
       * Patcher component for LS.
       * Migrated from v3 - still work in progress.
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      LS.LoadComponent(class Patcher extends LS.Component {
        static Node = class Node extends LS.Node {
        };
        constructor(options = {}) {
          super();
          this.name = "Patcher";
          if (options instanceof Element) options = { element: options };
          this.options = LS.Util.defaults({
            element: LS.Create()
          }, options);
          this.element = this.options.element;
          this.frameScheduler = new LS.Util.FrameScheduler(() => this.#render());
          this.handle = new LS.Util.TouchHandle(this.element, {
            onStart: (event) => {
              this.frameScheduler.start();
            },
            onMove: (event) => {
              this.#camera.position[0] += event.dx;
              this.#camera.position[1] += event.dy;
            },
            onEnd: (event) => {
              this.frameScheduler.stop();
            }
          });
          this.nodes = /* @__PURE__ */ new Set();
          this.element.classList.add("ls-patcher");
          this.renderTarget = null;
        }
        #camera = {
          position: [0, 0],
          zoom: 1
        };
        #render() {
          this.element.style.transform = `translate3d(${this.#camera.position[0]}px, ${this.#camera.position[1]}px, 0) scale(${this.#camera.zoom})`;
        }
        render() {
          this.frameScheduler.schedule();
        }
        setRenderTarget(node) {
          this.renderTarget = node;
          this.render();
        }
        destroy() {
          this.frameScheduler.destroy();
        }
      }, { name: "Patcher", global: true });
      /**
       * Range Component
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      LS.LoadComponent(class Range extends LS.Component {
        constructor(target = null, options = {}) {
          super();
          this.options = Object.assign({
            slider: true,
            style: null,
            vertical: false,
            tooltip: false
          }, options);
          this.element = target || LS.Create("ls-range");
          this.dots = LS.Create({ class: "ls-range-dots" }).addTo(this.element);
          this.handle = this.options.slider === false ? null : LS.Create({ class: "ls-range-handle" }).addTo(this.element);
          this.element.appendChild(LS.Create({ class: "ls-range-progress", inner: this.bar = LS.Create({ class: "ls-range-bar" }) }));
          this.element.classList.add("ls-range");
          if (this.options.style) {
            this.element.classList.add(this.options.style);
          }
          if (this.options.vertical) {
            this.element.classList.add("ls-range-vertical");
          }
          if (this.options.slider === false) {
            this.element.classList.add("ls-range-no-slider");
          }
          this._dotDensity = 8;
          this._renderedDotCount = -1;
          this._value = 0;
          this.element.setAttribute("tabindex", "0");
          this.element.setAttribute("role", "slider");
          this.element.setAttribute("aria-orientation", this.options.vertical ? "vertical" : "horizontal");
          const min = this.toNumber(this.element.getAttribute("min"), 0);
          const max = this.toNumber(this.element.getAttribute("max"), 100);
          this._min = Math.min(min, max);
          this._max = Math.max(min, max);
          this._step = this.normalizeStep(this.element.getAttribute("step"));
          this.element.setAttribute("aria-valuemin", this._min);
          this.element.setAttribute("aria-valuemax", this._max);
          let box;
          this.touchHandle = new LS.Util.TouchHandle(this.element, {
            onStart: (event) => {
              this.element.focus();
              box = this.element.getBoundingClientRect();
            },
            onMove: (event) => {
              const percentage = this.options.vertical ? Math.min(1, Math.max(0, 1 - (event.y - box.top) / box.height)) : Math.min(1, Math.max(0, (event.x - box.left) / box.width));
              this.value = this.min + percentage * (this.max - this.min);
              if (this.options.tooltip) {
                LS.Tooltips.position(this.handle).set(String(this.value)).show();
              }
              this.quickEmit("input", this.value);
            },
            onEnd: (event) => {
              if (this.options.tooltip) {
                LS.Tooltips.hide();
              }
              this.quickEmit("change", this.value);
            }
          });
          this.onKeyDown = this.#handleKeyDown.bind(this);
          this.element.addEventListener("keydown", this.onKeyDown);
          if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(() => this.renderDots());
            this.resizeObserver.observe(this.element);
          }
          this.value = this.element.getAttribute("value") || 0;
        }
        getStep() {
          const range = this.max - this.min;
          const fallback = range > 0 ? range / 100 : 1;
          const unit = this.step > 0 ? this.step : fallback;
          return unit;
        }
        #handleKeyDown(event) {
          const key = event.key;
          const step = this.getStep();
          let nextValue = this.value;
          let handled = true;
          switch (key) {
            case "ArrowRight":
              nextValue += this.options.vertical ? 0 : step;
              break;
            case "ArrowLeft":
              nextValue -= this.options.vertical ? 0 : step;
              break;
            case "ArrowUp":
              nextValue += step;
              break;
            case "ArrowDown":
              nextValue -= step;
              break;
            case "PageUp":
              nextValue += step * 10;
              break;
            case "PageDown":
              nextValue -= step * 10;
              break;
            case "Home":
              nextValue = this.min;
              break;
            case "End":
              nextValue = this.max;
              break;
            default:
              handled = false;
          }
          if (!handled) {
            return;
          }
          event.preventDefault();
          const previousValue = this.value;
          this.value = nextValue;
          if (this.value !== previousValue) {
            this.quickEmit("input", this.value);
            this.quickEmit("change", this.value);
          }
        }
        set value(val) {
          this._value = this.snapToStep(val);
          this.element.setAttribute("aria-valuenow", this._value);
          this.render();
        }
        get value() {
          return this._value;
        }
        set min(val) {
          this._min = this.toNumber(val, 0);
          if (this._max < this._min) {
            this._max = this._min;
          }
          this.element.setAttribute("aria-valuemin", this._min);
          this.value = this._value;
        }
        get min() {
          return this._min;
        }
        set max(val) {
          this._max = this.toNumber(val, 100);
          if (this._min > this._max) {
            this._min = this._max;
          }
          this.element.setAttribute("aria-valuemax", this._max);
          this.value = this._value;
        }
        get max() {
          return this._max;
        }
        set step(val) {
          this._step = this.normalizeStep(val);
          this.value = this._value;
        }
        get step() {
          return this._step;
        }
        toNumber(val, fallback = 0) {
          const number = Number(val);
          return Number.isFinite(number) ? number : fallback;
        }
        normalizeStep(val) {
          const step = this.toNumber(val, 0);
          return step > 0 ? step : 0;
        }
        getStepPrecision() {
          if (!this.step) return 0;
          const stepString = String(this.step);
          if (stepString.includes("e-")) {
            return Number(stepString.split("e-")[1]) || 0;
          }
          const decimals = stepString.split(".")[1];
          return decimals ? decimals.length : 0;
        }
        snapToStep(val) {
          let result = this.toNumber(val, this.min);
          result = Math.min(this.max, Math.max(this.min, result));
          if (this.step > 0) {
            const steps = Math.round((result - this.min) / this.step);
            const snapped = this.min + steps * this.step;
            result = Number(snapped.toFixed(this.getStepPrecision()));
            result = Math.min(this.max, Math.max(this.min, result));
          }
          return result;
        }
        /**
         * Needs work.
         */
        renderDots() {
          if (!this.step || this.max <= this.min) {
            if (this._renderedDotCount !== 0) {
              this.dots.innerHTML = "";
              this._renderedDotCount = 0;
            }
            return;
          }
          const steps = Math.floor((this.max - this.min) / this.step);
          const dotCount = steps + 1;
          const width = this.element.clientWidth || this.element.getBoundingClientRect().width;
          if (width <= 0) {
            if (this._renderedDotCount !== 0) {
              this.dots.innerHTML = "";
              this._renderedDotCount = 0;
            }
            return;
          }
          const maxDots = Math.floor(width / this._dotDensity) + 1;
          if (dotCount <= 1 || dotCount > maxDots) {
            if (this._renderedDotCount !== 0) {
              this.dots.innerHTML = "";
              this._renderedDotCount = 0;
            }
            return;
          }
          if (this._renderedDotCount === dotCount) {
            return;
          }
          const fragment = document.createDocumentFragment();
          for (let index = 0; index < dotCount; index++) {
            const dot = document.createElement("span");
            if (index !== 0 && index !== dotCount - 1) {
              dot.classList.add("ls-range-dot");
            }
            fragment.appendChild(dot);
          }
          this.dots.replaceChildren(fragment);
          this._renderedDotCount = dotCount;
        }
        render() {
          const range = this.max - this.min;
          const percentage = range > 0 ? (this._value - this.min) / range : 0;
          this.element.style.setProperty("--range-value", percentage * 100 + "%");
          this.renderDots();
        }
        destroy() {
          if (this.resizeObserver) {
            this.resizeObserver.disconnect();
          }
          if (this.onKeyDown) {
            this.element.removeEventListener("keydown", this.onKeyDown);
          }
          this.touchHandle.destroy();
        }
      }, { global: true, name: "Range" });
      customElements.define("ls-range", class LSRange extends HTMLElement {
        constructor() {
          super();
        }
        getBooleanAttribute(name, fallback = false) {
          const value = this.getAttribute(name);
          if (value === null) {
            return fallback;
          }
          if (value === "" || value === name) {
            return true;
          }
          const normalized = String(value).toLowerCase();
          if (["0", "false", "off", "no"].includes(normalized)) {
            return false;
          }
          return true;
        }
        connectedCallback() {
          this.lsRange = new LS.Range(this, {
            slider: this.getBooleanAttribute("slider", true),
            style: this.getAttribute("style-class") || this.getAttribute("range-style") || null,
            vertical: this.getBooleanAttribute("vertical", false),
            tooltip: this.getBooleanAttribute("tooltip", false)
          });
          const onConnected = this.getAttribute("onconnected");
          if (onConnected) {
            new Function(onConnected).call(this);
          }
          this.lsRange.on("input", (value) => {
            this.dispatchEvent(new InputEvent("input", { detail: value }));
          });
          this.lsRange.on("change", (value) => {
            this.dispatchEvent(new InputEvent("change", { detail: value }));
          });
        }
        set value(val) {
          if (this.lsRange) {
            this.lsRange.value = val;
            return;
          }
          this.setAttribute("value", val);
        }
        get value() {
          if (this.lsRange) {
            return this.lsRange.value;
          }
          return this.getAttribute("value");
        }
        set min(val) {
          if (this.lsRange) {
            this.lsRange.min = val;
            return;
          }
          this.setAttribute("min", val);
        }
        get min() {
          if (this.lsRange) {
            return this.lsRange.min;
          }
          return this.getAttribute("min");
        }
        set max(val) {
          if (this.lsRange) {
            this.lsRange.max = val;
            return;
          }
          this.setAttribute("max", val);
        }
        get max() {
          if (this.lsRange) {
            return this.lsRange.max;
          }
          return this.getAttribute("max");
        }
        set step(val) {
          if (this.lsRange) {
            this.lsRange.step = val;
            return;
          }
          this.setAttribute("step", val);
        }
        get step() {
          if (this.lsRange) {
            return this.lsRange.step;
          }
          return this.getAttribute("step");
        }
        set vertical(val) {
          this.setAttribute("vertical", val ? "true" : "false");
        }
        get vertical() {
          return this.getBooleanAttribute("vertical", false);
        }
        set slider(val) {
          this.setAttribute("slider", val ? "true" : "false");
        }
        get slider() {
          return this.getBooleanAttribute("slider", true);
        }
        set tooltip(val) {
          this.setAttribute("tooltip", val ? "true" : "false");
        }
        get tooltip() {
          return this.getBooleanAttribute("tooltip", false);
        }
      });
      (() => {
        let LSReactive;
        class ReactiveBinding extends LS.EventEmitter {
          constructor(object, prefix, options = {}) {
            super();
            const existing = LSReactive.objectCache.get(prefix);
            if (existing && !existing.destroyed) {
              return existing;
            }
            if (typeof prefix === "string") {
              if (!prefix.endsWith(".")) prefix += ".";
            } else prefix = "";
            this.prefix = prefix;
            this.object = object;
            this.options = options;
            this.mappings = /* @__PURE__ */ new Map();
            this.updated = true;
            this.mutated = false;
            this.mutatedKeys = /* @__PURE__ */ new Set();
            LSReactive.objectCache.set(this.prefix, this);
            this._pending = /* @__PURE__ */ new Set();
            this._renderScheduled = false;
            this.destroyed = false;
            this.proxyCache = /* @__PURE__ */ new WeakMap();
            if (this.options.extends && this.options.extends.__isProxy) {
              this.rebindHandler = this.options.extends.__bind?.on("swap", (newObj) => {
                if (this.destroyed) return;
                this.options.extends = this.options.extends.__bind.proxy;
                this.updated = true;
                this.render();
                this.emit("extendsSwap", [newObj]);
              });
            }
            this.#processPending();
          }
          registerProperty(virtualKey, physicalKey = null, defaultValue = void 0) {
            if (physicalKey === null) physicalKey = "_" + virtualKey;
            if (!this.object.hasOwnProperty(physicalKey) && typeof defaultValue !== "undefined") {
              this.object[physicalKey] = defaultValue;
            }
            Object.defineProperty(this.object, virtualKey, {
              get: () => {
                return this.#get(this.object, physicalKey, "", false);
              },
              set: (value) => {
                this.#set(this.object, physicalKey, value);
              },
              enumerable: true,
              configurable: true
            });
          }
          get proxy() {
            if (this.destroyed) return null;
            return this.#createProxy(this.object);
          }
          #createProxy(object, objectPath = "") {
            if (this.proxyCache.has(object)) {
              return this.proxyCache.get(object);
            }
            if (objectPath && !objectPath.endsWith(".")) {
              objectPath += ".";
            }
            const proxy = new Proxy(object, {
              set: (target, key, value) => {
                if (this.destroyed) throw new TypeError("Can't access a proxy of a destroyed ReactiveBinding");
                return this.#set(target, key, value, objectPath);
              },
              get: (target, key) => {
                if (this.destroyed) throw new TypeError("Can't access a proxy of a destroyed ReactiveBinding");
                if (key === "__isProxy") return true;
                if (key === "__bind") return this;
                if (key === "hasOwnProperty") return target.hasOwnProperty.bind(target);
                return this.#get(target, key, objectPath);
              },
              deleteProperty: (target, key) => {
                if (this.destroyed) throw new TypeError("Can't access a proxy of a destroyed ReactiveBinding");
                delete target[key];
                this.renderKey(objectPath + key);
                return true;
              }
            });
            this.proxyCache.set(object, proxy);
            object = null;
            return proxy;
          }
          #set(object, key, value, objectPath = "") {
            if (this.destroyed) return false;
            const fullPath = objectPath + key;
            if (this.options.extends) {
              if (!this.mutated) {
                this.emit("mutated");
                this.mutated = true;
              }
              this.mutatedKeys.add(fullPath);
            }
            object[key] = value;
            this.updated = true;
            this.renderKey(fullPath);
            return true;
          }
          #isDeepObject(value) {
            return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof RegExp) && !(value instanceof Function) && !(value instanceof Element);
          }
          #get(object, key, objectPath = "", nest = true) {
            if (this.destroyed) return null;
            const hasOwn = object.hasOwnProperty(key);
            if (hasOwn && !this.options.extends) {
              if (!hasOwn) return void 0;
              const value = object[key];
              if (!nest || this.options.shallow) return value;
              if (!this.#isDeepObject(value)) return value;
              const fullPath = objectPath + key;
              return this.#createProxy(value, fullPath);
            } else {
              const fullPath = objectPath + key;
              const value = this.walkObjectPath(fullPath, this.options.extends, false);
              if (!nest || this.options.shallow) return value;
              if (!this.#isDeepObject(value)) return value;
              object[key] = {};
              return this.#createProxy(object[key], fullPath);
            }
          }
          #processPending() {
            if (this.destroyed) return;
            const pendingTargets = LSReactive.pending.get(this.prefix);
            if (pendingTargets) {
              for (const target of pendingTargets) {
                this.addTarget(target.__reactive_binding.path, target);
              }
              LSReactive.pending.delete(this.prefix);
            }
          }
          addTarget(path, target) {
            if (this.options.collapseValue && path === null) path = "_value";
            const cache = this.mappings.get(path);
            if (cache) cache.add(target);
            else this.mappings.set(path, /* @__PURE__ */ new Set([target]));
            this.renderValue(target, this.walkObjectPath(path), path);
          }
          removeTarget(path, target) {
            if (this.options.collapseValue && path === null) path = "_value";
            const cache = this.mappings.get(path);
            if (cache) {
              cache.delete(target);
              if (cache.size === 0) {
                this.mappings.delete(path);
              }
            }
          }
          /**
           * Renders all or specific keys in the binding.
           * @param {array|Set<string>} [keys] An optional set of keys to render, defaults to all keys
           * @returns {void}
           */
          render(keys) {
            this.updated = false;
            for (const key of keys || this.mappings.keys()) {
              this.renderKey(key);
            }
          }
          swapObject(newObject) {
            if (this.destroyed) return;
            this.object = newObject;
            this.proxyCache = /* @__PURE__ */ new WeakMap();
            this.updated = true;
            this.render();
            this.emit("swap", [newObject]);
          }
          /**
           * Renders a specific key in the binding.
           * @param {*} key The key to render
           * @returns {void}
           */
          renderKey(key) {
            if (this.destroyed || this.options.propagate === false && !this.mappings.has(key)) return;
            this._pending.add(key);
            if (this.options.propagate !== false) {
              const parts2 = Array.isArray(key) ? key : key.split(".");
              for (let i = parts2.length - 1; i > 0; i--) {
                parts2.pop();
                const parentKey = parts2.join(".");
                this._pending.add(parentKey);
              }
            }
            if (this._renderScheduled) return;
            this._renderScheduled = true;
            LS.Context.queueMicrotask(() => {
              if (this.destroyed) return;
              this._renderScheduled = false;
              for (const key2 of this._pending) {
                this.renderKeyImmediate(key2);
              }
              this._pending.clear();
            });
          }
          /**
           * Renders a specific key in the binding immediately without batching.
           * @param {*} key The key to render
           * @returns {void}
          */
          renderKeyImmediate(key) {
            if (this.destroyed) return;
            const cache = this.mappings.get(key);
            if (!cache || cache.size === 0) return;
            for (let target of cache) {
              this.renderValue(target, this.walkObjectPath(key), key);
            }
          }
          /**
           * This is currently a bottleneck and should be optimized ("obj.key" being fastest, "obj.a.b" being the slowest, especially with extends)
           * 
           * Though from my benchmarks, this is the fastest known way to walk a path.
           * 
           * @param {string|Array<string>} path The path to walk
           * @param {object} [object=this.object] The object to walk
           * @param {boolean} [fp=true] Whether to fallback to extends
           * @returns {*} The value at the path, or undefined if not found
           */
          walkObjectPath(path, object = this.object, fp = true) {
            if (object[path] !== void 0) return object[path];
            const ext = fp && this.options.extends;
            if (ext && ext[path] !== void 0) return ext[path];
            if (!path) return this.options.collapseValue ? object._value || ext._value : object;
            const parts2 = Array.isArray(path) ? path : path.split(".");
            let current = object;
            let fallback = ext;
            let usingFallback = false;
            for (const part of parts2) {
              if (!part) continue;
              const next = !usingFallback && current ? current[part] : void 0;
              if (next !== void 0) {
                current = next;
                if (!usingFallback && fallback) {
                  const candidate = fallback[part];
                  fallback = candidate !== void 0 ? candidate : void 0;
                }
                continue;
              }
              if (fallback) {
                const fbNext = fallback[part];
                if (fbNext === void 0) return void 0;
                current = fbNext;
                fallback = fbNext;
                usingFallback = true;
                continue;
              }
              return void 0;
            }
            return current;
          }
          renderValue(target, value, path = null) {
            if (this.destroyed || this.options.render === false) return;
            const config = target && target.__reactive_binding;
            if (!config) {
              this.removeTarget(path, target);
              return;
            }
            if (typeof this.options.render === "function") {
              try {
                this.options.render.call(this, target, value);
              } catch (e) {
                console.error("Error in custom render function for binding", this.prefix, e);
              }
              return;
            }
            try {
              if (typeof value === "function") value = value();
              if (typeof config.type === "string") {
                config.type = LSReactive.types.get(config.type.toLowerCase()) || config.type;
              }
              if (typeof config.type === "function") {
                value = config.type(value, config.args || [], target, this.proxy);
              }
              if (config.render === false) return;
              if (config.default && (typeof value === "undefined" || value === null)) {
                value = config.default;
              }
              if (!value && config.or) {
                value = config.or;
              }
              if (config.compare) {
                value === config.compare;
              }
              if (config.prependValue) {
                value = config.prependValue + value;
              }
              if (value instanceof Element) {
                target.replaceChildren(value);
                return;
              }
              if (config.attribute) {
                target.setAttribute(config.attribute, value);
                return;
              }
              if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
                if (target.type === "checkbox") target.checked = Boolean(value);
                else target.value = value;
              } else if (target.tagName === "IMG" || target.tagName === "VIDEO" || target.tagName === "AUDIO") {
                target.src = value;
              } else {
                if (config.raw) target.innerHTML = value;
                else target.textContent = value;
              }
            } catch (e) {
              console.error("Error rendering target", target, "in binding", this.prefix, e);
            }
          }
          /**
           * Resets the binding to its initial state by clearing values.
           * This is slower but keeps the original reference.
           * @returns {boolean} True if the reset was successful
           */
          reset(reRender = false) {
            for (const key of Object.keys(this.object)) {
              delete this.object[key];
            }
            this.mutated = false;
            this.render(reRender ? null : this.mutatedKeys);
            this.emit("reset", [this.mutatedKeys]);
            this.mutatedKeys.clear();
            return true;
          }
          /**
           * Applies mutated values to the original extended object and resets self.
           * Only works for forked bindings with an extends option set.
           * @returns {boolean} True if the sync was successful
           */
          sync() {
            if (!this.options.extends || !this.mutated) return false;
            const ext = this.options.extends;
            for (const key of this.mutatedKeys) {
              const value = this.walkObjectPath(key, this.object, false);
              if (value !== void 0) {
                const parts2 = key.split(".");
                let target = ext;
                for (let i = 0; i < parts2.length - 1; i++) {
                  if (target[parts2[i]] === void 0) {
                    target[parts2[i]] = {};
                  }
                  target = target[parts2[i]];
                }
                target[parts2[parts2.length - 1]] = value;
              }
            }
            this.reset();
            this.emit("sync");
            return true;
          }
          /**
           * Drops and unbinds all connected elements to this binding.
           * @returns {void}
          */
          dropAll() {
            for (const cache of this.mappings.values()) {
              for (const element of cache) {
                LSReactive.unbindElement(element);
              }
            }
            this.mappings.clear();
          }
          destroy() {
            LSReactive.objectCache.delete(this.prefix);
            this.object = null;
            if (this.rebindHandler) {
              if (this.options.extends && this.options.extends.__bind) {
                this.options.extends.__bind.off(this.rebindHandler);
              }
              this.rebindHandler = null;
            }
            this.options = null;
            this.dropAll();
            this.proxyCache = null;
            this._renderScheduled = false;
            this._pending.clear();
            this._pending = null;
            this.prefix = null;
            this.destroyed = true;
            this.emit("destroy");
            this.events.clear();
            this.events = null;
          }
        }
        class ReactiveScope {
          constructor(parent = null) {
          }
        }
        LS.LoadComponent(class Reactive extends LS.Component {
          EMPTY_PATH = Object.freeze([null, null, null]);
          types = /* @__PURE__ */ new Map([
            ["string", String],
            ["number", Number],
            ["boolean", Boolean],
            ["array", Array],
            ["object", Object],
            ["function", Function],
            ["date", Date],
            ["regexp", RegExp],
            ["json", (value) => {
              try {
                return JSON.parse(value);
              } catch (e) {
                console.warn("Reactive: Failed to parse JSON value:", value);
                return null;
              }
            }],
            ["int", (value) => parseInt(value, 10)],
            ["float", (value) => parseFloat(value)],
            ["formatdate", (value, args) => {
              const date = new Date(value);
              if (args[0]) {
                return date.toLocaleDateString(void 0, { dateStyle: args[0] });
              }
              return date.toLocaleDateString();
            }]
          ]);
          registerType(name, func) {
            if (typeof name !== "string" || !name.trim()) {
              throw new Error("Invalid type name: " + name);
            }
            if (typeof func !== "function") {
              throw new Error("Invalid type function: " + func);
            }
            this.types.set(name.toLowerCase(), func);
          }
          constructor() {
            super();
            this.objectCache = /* @__PURE__ */ new Map();
            this.pending = /* @__PURE__ */ new Map();
            this.v = 2;
            LSReactive = this;
            window.addEventListener("DOMContentLoaded", () => {
              this.scan();
            });
          }
          createBinding(object, prefix, options = {}) {
            if (typeof prefix === "string") {
              if (!prefix.endsWith(".")) prefix += ".";
            } else prefix = "";
            if (this.objectCache.has(prefix)) {
              const existing = this.objectCache.get(prefix);
              if (!existing.destroyed) {
                existing.destroy();
              }
            }
            return new ReactiveBinding(object, prefix, options);
          }
          /**
           * Wraps an object with a reactive proxy.
           * The proxy will get the following extra properties:
           * * `__isProxy` - A boolean indicating that this is a reactive proxy
           * * `__binding` - The binding instance
           * @param {string} prefix The prefix to bind to
           * @param {object} object The object to wrap
           * @param {object} options Options for the binding
           * @param {boolean} options.shallow Whether to only wrap the top-level object
           * @param {boolean|function} options.render Disables rendering if set to false, or replaces with a custom render function
           * @param {boolean} options.propagate Whether to propagate changes to parent bindings (eg. if user.data.name changes, user.data and user also update)
           * @param {boolean} options.extends Fallback object to use when the key is not found
           * @param {boolean} options.collapseValue Whether to collapse references to the object itself to its _value property (eg. if "test" is {_value: 5} and we bind {{ test }}, 5 will be used instead of the object)
           * @returns {Proxy} The reactive proxy object
           */
          wrap(prefix, object, options = {}) {
            const binding = this.createBinding(object, prefix, options);
            return binding.proxy;
          }
          /**
           * Forks an object into a new reactive proxy without mutating the original object.
           * Mutating this proxy will affect only the new object.
           * @param {*} prefix The prefix to bind to
           * @param {*} object The object to fork
           * @param {*} data New object to patch new values to, defaults to an empty object
           * @param {*} options Options for the binding (same as wrap())
           * @returns {Proxy} The reactive proxy object
           */
          fork(prefix, object, data, options = {}) {
            options.extends = object;
            return this.wrap(prefix, data || {}, options);
          }
          /**
           * Creates a shallow reactive reference object with a single "value" property.
           * @param {string} prefix The prefix to bind to
           * @param {*} value The initial value of the reference
           * @returns {object} The reference object with a "value" property
           * 
           * @example
           * const countRef = reactive.valueRef("count", 0);
           * countRef.value = 5;
           * 
           * // In HTML: {{ countRef }} <!-- This will update to 5 -->
           */
          valueRef(prefix, value) {
            const refObject = { value };
            const binding = this.createBinding(refObject, prefix, { shallow: true, propagate: false, collapseValue: true });
            binding.registerProperty("value", "_value", value);
            return refObject;
          }
          /**
           * Destroys a binding by its prefix.
           * @param {*} prefix The prefix of the binding to destroy
           * @returns {boolean} True if the binding was found and destroyed
           */
          destroyBinding(prefix) {
            const binding = this.objectCache.get(prefix);
            if (binding) {
              binding.destroy();
              return true;
            }
            return false;
          }
          /**
           * Destroys all bindings.
           * @returns {void}
           */
          destroyAll() {
            for (const binding of this.objectCache.values()) {
              binding.destroy();
            }
            this.objectCache.clear();
          }
          /**
           * Splits a path into prefix, key name and extras
           * Eg. "user.name extra stuff" => [ "user.", "name", " extra stuff" ]
           * Note that leading whitespace is trimmed so joining won't produce the exact original string
           * @param {*} path The path to split
           * @returns {Array} An array like [prefix, name, extra]
           */
          splitPath(path) {
            if (!path) return this.EMPTY_PATH;
            let padding = true, start = 0, firstDot = -1, end = null;
            const strEnd = path.length - 1;
            for (let i = 0; i < path.length; i++) {
              const char = path.charCodeAt(i);
              if (padding && this.#matchWhitespace(char)) {
                if (i === strEnd) {
                  return this.EMPTY_PATH;
                }
                if (!padding) {
                  end = i;
                  break;
                }
                start++;
                continue;
              } else padding = false;
              if (char === 46) {
                if (firstDot === -1) firstDot = i;
                continue;
              }
              if (!this.#matchKeyword(char)) {
                end = i;
                break;
              }
            }
            const dotFound = firstDot !== -1;
            const identEnd = end === null ? path.length : end;
            return [
              dotFound ? path.slice(start, firstDot + 1) : path.slice(start, identEnd) + ".",
              dotFound ? path.slice(firstDot + 1, identEnd) : null,
              end ? path.slice(end) : null
            ];
          }
          /**
           * A light parser to parse extra properties, eg. "username || anonymous".
           * @param {string} expr The expression to parse
           * @param {Object} result An optional object to fill with results
           * @returns {Object} An object with parsed properties
          */
          parseExpression(expr, result = {}) {
            let i = 0, state = 0, v_start = 0, v_property = null, string_char = null, len = expr.length;
            for (; i < len; i++) {
              const char = expr.charCodeAt(i);
              if (state === 3) {
                if (char === string_char) {
                  result[v_property] = expr.slice(v_start, i);
                  state = 0;
                }
                continue;
              }
              if (this.#matchWhitespace(char)) continue;
              if (state === 0) {
                if (char === 58) {
                  v_start = i + 1;
                  state = 4;
                  continue;
                }
                state = 1;
              }
              if (state === 4) {
                if (this.#matchKeyword(expr.charCodeAt(i + 1)) && i !== len - 1) continue;
                const type = expr.slice(v_start, i + 1).toLowerCase();
                result.type = this.types.get(type) || type;
                if (expr.charCodeAt(i + 1) === 40) {
                  i++;
                  v_start = i + 1;
                  state = 5;
                  continue;
                }
                state = 1;
              }
              if (state === 5) {
                let args = [];
                while (i < len && expr.charCodeAt(i) !== 41) {
                  const startChar = expr.charCodeAt(i);
                  if (!this.#matchWhitespace(startChar)) {
                    let arg_start = i;
                    while (i < len) {
                      const char2 = expr.charCodeAt(i);
                      if (char2 === 44 || char2 === 41) break;
                      i++;
                    }
                    let arg_end = i;
                    while (arg_end > arg_start && this.#matchWhitespace(expr.charCodeAt(arg_end - 1))) {
                      arg_end--;
                    }
                    args.push(expr.slice(arg_start, arg_end));
                    if (expr.charCodeAt(i) === 44) i++;
                  } else {
                    i++;
                  }
                }
                result.args = args;
                state = 1;
              }
              if (state === 2) {
                if (this.#matchStringChar(char)) {
                  string_char = char;
                  v_start = i + 1;
                  state = 3;
                }
                continue;
              }
              switch (char) {
                case 124:
                  if (expr.charCodeAt(i + 1) === 124) {
                    i++;
                    v_property = "or";
                    state = 2;
                    break;
                  }
                  console.warn("You have a syntax error in key: " + expr);
                  return result;
                // Invalid
                case 63:
                  if (expr.charCodeAt(i + 1) === 63) {
                    i++;
                    v_property = "default";
                    state = 2;
                    break;
                  }
                  console.warn("You have a syntax error in key: " + expr);
                  return result;
                // Invalid
                case 61:
                  if (expr.charCodeAt(i + 1) === 61) {
                    i++;
                    v_property = "compare";
                    state = 2;
                    break;
                  }
                  console.warn("You have a syntax error in key: " + expr);
                  return result;
                // Invalid
                case 33:
                  result.raw = true;
                  break;
              }
            }
            return result;
          }
          #matchKeyword(char) {
            return char >= 48 && char <= 57 || // 0-9
            char >= 65 && char <= 90 || // A-Z
            char >= 97 && char <= 122 || // a-z
            char === 95 || // _
            char === 45;
          }
          #matchWhitespace(char) {
            return char === 32 || char === 9 || char === 10 || char === 13;
          }
          #matchStringChar(char) {
            return char === 34 || char === 39 || char === 96;
          }
          parseBindingString(bindingString, expression = {}) {
            let prependValue = null;
            if (this.#matchStringChar(bindingString.charCodeAt(0))) {
              const string_char = bindingString.charAt(0);
              const end = bindingString.indexOf(string_char, 1);
              if (end === -1) {
                console.warn("Invalid reactive attribute: " + bindingString);
                return null;
              }
              prependValue = bindingString.slice(1, end);
              bindingString = bindingString.slice(end + 1);
            }
            if (prependValue !== null) {
              expression.prependValue = prependValue;
            }
            const parts2 = this.splitPath(bindingString);
            expression.prefix = parts2[0];
            expression.path = parts2[1];
            if (parts2[2] !== null) this.parseExpression(parts2[2], expression);
            return expression;
          }
          #hash(string) {
            let hash = 0, i, chr;
            if (string.length === 0) return hash;
            for (i = 0; i < string.length; i++) {
              chr = string.charCodeAt(i);
              hash = (hash << 5) - hash + chr;
              hash |= 0;
            }
            return hash;
          }
          /**
           * Scans the document or specific element for elements with the data-reactive attribute and caches them
           * @param {HTMLElement} scanTarget The target element to scan
           */
          scan(scanTarget = document.body) {
            for (let target of scanTarget.querySelectorAll(`[data-reactive]`)) {
              this.bindElement(target);
            }
          }
          /**
           * Binds an element to the reactive system
           * @param {HTMLElement} target The target element to bind
           * @param {string} [override] Optional override for the binding string
           * @returns {void}
           */
          bindElement(target, override) {
            const bindingString = override || target.getAttribute("data-reactive");
            if (!bindingString || target.__bindHash && target.__bindHash === this.#hash(bindingString)) return;
            if (target.__bindHash) this.unbindElement(target, true);
            target.__bindHash = this.#hash(bindingString);
            const parsed = this.parseBindingString(bindingString);
            if (!parsed || !parsed.prefix) return;
            target.__reactive_binding = parsed;
            let binding = this.objectCache.get(parsed.prefix);
            if (!binding) {
              const pending = this.pending.get(parsed.prefix);
              if (pending) pending.push(target);
              else this.pending.set(parsed.prefix, [target]);
              return;
            }
            binding.addTarget(parsed.path, target);
          }
          /**
           * Unbinds an element from the reactive system
           * @param {HTMLElement} target The target element to unbind
           * @param {boolean} keepAttribute Whether to keep the data-reactive attribute
           * @returns {void}
           */
          unbindElement(target, keepAttribute = false) {
            if (!target) return;
            if (!keepAttribute) {
              target.removeAttribute("data-reactive");
            }
            if (!target.__bindHash) return;
            const binding = this.objectCache.get(target.__reactive_binding.prefix);
            if (binding) {
              binding.removeTarget(target.__reactive_binding.path, target);
            }
            if (target.__reactive_binding) {
              target.__reactive_binding = null;
              delete target.__reactive_binding;
            }
            target.__bindHash = null;
            delete target.__bindHash;
          }
          /**
           * Gets the value at a specific path in the reactive system
           * @param {string} fullPath The full path to get the value from
           * @returns {*} The value at the specified path, or undefined if not found
           */
          valueAt(fullPath) {
            const [prefix, path] = this.splitPath(fullPath);
            const binding = this.objectCache.get(prefix);
            if (!binding) return void 0;
            return binding.walkObjectPath(path);
          }
          /**
           * Renders all bindings in the cache (everything from any bound element)
           * @param {Array<ReactiveBinding>} bindings An array of bindings to render, defaults to all bindings in the cache
           */
          renderAll(bindings) {
            for (let binding of Array.isArray(bindings) ? bindings : this.objectCache.values()) {
              if (binding && binding.object && binding.updated) binding.render();
            }
          }
          /**
           * Renders a binding object
           * @param {object} binding The binding object to render
           */
          render(binding) {
            if (typeof binding === "undefined") return this.renderAll();
            if (binding.object && binding.updated) return binding.render();
            return null;
          }
        }, { name: "Reactive", singular: true, global: true });
      })();
      LS.LoadComponent(class Resize extends LS.Component {
        constructor() {
          super();
          this.targets = /* @__PURE__ */ new WeakMap();
        }
        /**
         * Adds a resize handle to a target element. It can be called multiple times on the same element to change sides or options (upsert).
         *
         * Certain options (anchor, size) can also be set per specific handle with CSS (eg. element > .ls-resize-handle.ls-top { --ls-resize-handle-size: 8px; --ls-resize-anchor: 0.5 })
         * @param {*} target - The target element to resize.
         * @param {*} options - The options for the resize handle.
         * 
         * Sides and corners can be specified in four ways:
         * - As a CSS-style array of booleans/numbers (e.g. { sides: [true, false, true, false] }), clockwise
         * - As an array of strings (e.g. { sides: ["top", "bottom"] })
         * - As keys { top: true, right: false, bottom: true, left: false }
         * - All at once { sides: "all" }
         * 
         * Other options:
         * @param {boolean} [options.styled=true] - Whether to apply default visual styles, eg. highlight on hover. Otherwise only functional styles will apply.
         * @param {boolean|Array|string} [options.sides=true] - Which sides to add handles to. Can be a boolean (true = all sides), an array of booleans/numbers [top, right, bottom, left], or an array of strings ["top", "right", "bottom", "left"].
         * @param {boolean|Array|string} [options.corners=false] - Which corners to add handles to. Can be a boolean (true = all corners), an array of booleans/numbers [top-left, top-right, bottom-right, bottom-left], or an array of strings ["top-left", "top-right", "bottom-right", "bottom-left"].
         * @param {boolean} [options.top] - Whether to add a handle to the top side.
         * @param {boolean} [options.right] - Whether to add a handle to the right side.
         * @param {boolean} [options.bottom] - Whether to add a handle to the bottom side.
         * @param {boolean} [options.left] - Whether to add a handle to the left side.
         * @param {boolean} [options.topLeft] - Whether to add a handle to the top-left corner.
         * @param {boolean} [options.topRight] - Whether to add a handle to the top-right corner.
         * @param {boolean} [options.bottomRight] - Whether to add a handle to the bottom-right corner.
         * @param {boolean} [options.bottomLeft] - Whether to add a handle to the bottom-left corner.
         * @param {number|string} [options.handleSize] - Size of the side handles (thickness).
         * @param {number|string} [options.cornerSize] - Size of the corner handles (square size).
         * @param {string} [options.anchor=0.5] - Whether handles should be outside, inside, or in the center of the edge. (0 = inside, 0.5 = center, 1 = outside)
         * @param {boolean} [options.cursors=true] - Whether to set the cursor when dragging (this does not effect the CSS cursor style of the handle itself).
         * @param {boolean} [options.boundsCursors=true] - Set the cursor to a single direction when dragging past min/max.
         * @param {number} [options.snapArea=40] - Pixel threshold for snapping.
         * @param {boolean} [options.snapCollapse=false] - If true, shrinking within snapArea snaps to collapsed height/width.
         * @param {boolean} [options.snapExpand=false] - If true, expanding within snapArea of parent height snaps to 100% height/width.
         * @param {boolean} [options.snapVertical=false] - If true, enables snapping vertically.
         * @param {boolean} [options.snapHorizontal=false] - If true, enables snapping horizontally.
         * @param {number} [options.minWidth=20] - Minimum width of the target element (overrides CSS min-width value).
         * @param {number} [options.minHeight=20] - Minimum height of the target element (overrides CSS min-height value).
         * @param {number} [options.maxWidth=null] - Maximum width of the target element (overrides CSS max-width value).
         * @param {number} [options.maxHeight=null] - Maximum height of the target element (overrides CSS max-height value).
         * @param {string|object} [options.boundary=null] - Boundary to constrain resizing. Can be "viewport" or a rect object {x, y, width, height}.
         * @param {string} [options.store=null] - Key name for storage. If set, updates will be persistent and saved into a storage object.
         * @param {boolean} [options.storeStringify=true] - Whether to stringify the stored data.
         * @param {object} [options.storage=null] - Custom storage object (must implement getItem/setItem). Default is localStorage.
         * @param {boolean} [options.translate] - Use translate3d instead of left/top
         * @returns An object with the registered handles
         * Events on handle:
         * - resize: Emitted when the element is resized with the new width, height, and state.
         * - start: Emitted when resizing starts.
         * - end: Emitted when resizing ends.
         * @example
         * LS.Resize.set(element, {
         *     sides: ["top", "bottom"],
         *     corners: [1, 0, 1, 0]
         * });
         */
        set(target, options) {
          let entry = this.targets.get(target);
          if (!options) {
            options = {
              top: true,
              right: true,
              bottom: true,
              left: true
            };
          }
          if (!entry) {
            entry = {
              target,
              options: null,
              handler: null,
              states: {},
              handles: {},
              restored: false,
              storage: null,
              storageKey: null
            };
            const handler = this.#createHandler(entry);
            entry.handler = handler;
            this.targets.set(target, entry);
          }
          options = LS.Util.defaults({
            styled: entry.options?.styled ?? true,
            cursors: entry.options?.cursors ?? true,
            boundsCursors: entry.options?.boundsCursors ?? true,
            snapArea: entry.options?.snapArea ?? 40,
            snapCollapse: entry.options?.snapCollapse ?? false,
            snapExpand: entry.options?.snapExpand ?? false,
            snapVertical: entry.options?.snapVertical ?? false,
            snapHorizontal: entry.options?.snapHorizontal ?? false,
            // --- boundary option ---
            boundary: entry.options?.boundary ?? null,
            // "viewport" or {x, y, width, height}
            // --- persistence options ---
            store: entry.options?.store ?? null,
            // string key
            storeStringify: entry.options?.storeStringify ?? true,
            storage: entry.options?.storage ?? null,
            // custom storage (must implement getItem/setItem)
            translate: entry.options?.translate ?? false
            // use transform: translate3d instead of left/top
          }, options || {});
          entry.options = options;
          if (options.sides === "all" || options.sides === true) {
            options.top = true;
            options.right = true;
            options.bottom = true;
            options.left = true;
          } else if (Array.isArray(options.sides)) {
            const s = options.sides;
            if (s.length === 4 && s.every((v) => typeof v !== "string")) {
              options.top = !!s[0];
              options.right = !!s[1];
              options.bottom = !!s[2];
              options.left = !!s[3];
            } else {
              options.top = s.includes("top");
              options.right = s.includes("right");
              options.bottom = s.includes("bottom");
              options.left = s.includes("left");
            }
          }
          if (options.corners === "all" || options.corners === true) {
            options.topLeft = true;
            options.topRight = true;
            options.bottomRight = true;
            options.bottomLeft = true;
          } else if (Array.isArray(options.corners)) {
            const c = options.corners;
            if (c.length === 4 && c.every((v) => typeof v !== "string")) {
              options.topLeft = !!c[0];
              options.topRight = !!c[1];
              options.bottomRight = !!c[2];
              options.bottomLeft = !!c[3];
            } else {
              options.topLeft = c.includes("top-left");
              options.topRight = c.includes("top-right");
              options.bottomRight = c.includes("bottom-right");
              options.bottomLeft = c.includes("bottom-left");
            }
          }
          const storeKey = typeof options?.store === "string" ? options.store : options.store === true ? "ls-resize-" + target.id : null;
          const storage = options.storage || (typeof window !== "undefined" ? window.localStorage : null);
          entry.storeKey = storeKey;
          entry.storage = storage;
          if (storeKey && !entry.restored && storage) {
            try {
              const raw = storage.getItem(storeKey);
              if (raw) {
                const data = typeof raw === "string" ? JSON.parse(raw) : raw;
                if (data && typeof data === "object") {
                  if (data.width != null) target.style.width = typeof data.width === "number" ? `${data.width}px` : data.width;
                  if (data.height != null) target.style.height = typeof data.height === "number" ? `${data.height}px` : data.height;
                  if (options.translate) {
                    if (data.translateX != null || data.translateY != null) {
                      const tx = data.translateX ?? 0;
                      const ty = data.translateY ?? 0;
                      target.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                    }
                  } else {
                    if (data.left != null) target.style.left = typeof data.left === "number" ? `${data.left}px` : data.left;
                    if (data.top != null) target.style.top = typeof data.top === "number" ? `${data.top}px` : data.top;
                  }
                  if (data.state === "collapsed") target.classList.add("ls-resize-collapsed");
                  else if (data.state === "expanded") target.classList.add("ls-resize-expanded");
                }
              }
            } catch (e) {
            }
            entry.restored = true;
          }
          if (options.handleSize) {
            target.style.setProperty("--ls-resize-handle-size", typeof options.handleSize === "number" ? `${options.handleSize}px` : options.handleSize);
          }
          if (options.cornerSize) {
            target.style.setProperty("--ls-resize-corner-size", typeof options.cornerSize === "number" ? `${options.cornerSize}px` : options.cornerSize);
          }
          if (options.anchor) {
            target.style.setProperty("--ls-resize-anchor", options.anchor);
          }
          let i = 0;
          for (let side of ["top", "right", "bottom", "left", "topLeft", "topRight", "bottomRight", "bottomLeft"]) {
            const isCorner = i >= 4;
            i++;
            if (options[side]) {
              if (entry.handles.hasOwnProperty(side)) continue;
              const element = document.createElement("div");
              element.className = `ls-resize-handle ls-${side}` + (options.styled ? " ls-resize-handle-styled" : "") + (isCorner ? " ls-resize-handle-corner" : "");
              element.dataset.side = side;
              entry.handles[side] = element;
              entry.handler.addTarget(element);
              target.appendChild(element);
            } else if (entry.handles.hasOwnProperty(side)) {
              entry.handles[side].remove();
              entry.handler.removeTarget(entry.handles[side]);
              delete entry.handles[side];
            }
          }
          this.targets.set(target, entry);
          return entry;
        }
        #createHandler(entry) {
          let side;
          let minWidth, minHeight, maxWidth, maxHeight;
          let isWest, isEast, isNorth, isSouth;
          let affectsWidth, affectsHeight;
          let startWidth, startHeight;
          let startPosX, startPosY;
          let absolutePositioned = false;
          let boundaryRect = null;
          let targetOffsetX = 0;
          let targetOffsetY = 0;
          let endWidth, endHeight;
          let handler = new LS.Util.TouchHandle(null, {
            frameTimed: true,
            onStart: (event) => {
              targetOffsetX = 0;
              targetOffsetY = 0;
              side = event.domEvent.target?.dataset?.side;
              if (!side) return event.cancel();
              handler.emit("start", [side, event.cancel]);
              if (event.cancelled) return;
              this.emit("resize-start", [{ target: entry.target, side }]);
              const rect = entry.target.getBoundingClientRect();
              const style = window.getComputedStyle(entry.target);
              if (entry.options.cursors !== false) {
                const cur = this.constructor.cursorMap[side];
                if (cur) {
                  handler.cursor = cur;
                }
              }
              isWest = side === "left" || side === "topLeft" || side === "bottomLeft";
              isEast = side === "right" || side === "topRight" || side === "bottomRight";
              isNorth = side === "top" || side === "topLeft" || side === "topRight";
              isSouth = side === "bottom" || side === "bottomLeft" || side === "bottomRight";
              affectsWidth = isWest || isEast;
              affectsHeight = isNorth || isSouth;
              minWidth = entry.options.minWidth || parseFloat(style.minWidth) || 20;
              minHeight = entry.options.minHeight || parseFloat(style.minHeight) || 20;
              maxWidth = entry.options.maxWidth || parseFloat(style.maxWidth) || Infinity;
              maxHeight = entry.options.maxHeight || parseFloat(style.maxHeight) || Infinity;
              startWidth = rect.width;
              startHeight = rect.height;
              if (entry.options.translate) {
                const transform = style.transform;
                let mat = transform.match(/^matrix3d\((.+)\)$/);
                if (mat) {
                  startPosX = parseFloat(mat[1].split(", ")[12]);
                  startPosY = parseFloat(mat[1].split(", ")[13]);
                } else {
                  mat = transform.match(/^matrix\((.+)\)$/);
                  if (mat) {
                    startPosX = parseFloat(mat[1].split(", ")[4]);
                    startPosY = parseFloat(mat[1].split(", ")[5]);
                  } else {
                    startPosX = 0;
                    startPosY = 0;
                  }
                }
              } else {
                startPosX = !isNaN(parseFloat(style.left)) ? parseFloat(style.left) : entry.target.offsetLeft;
                startPosY = !isNaN(parseFloat(style.top)) ? parseFloat(style.top) : entry.target.offsetTop;
              }
              absolutePositioned = style.position === "absolute" || style.position === "fixed";
              if (entry.options.boundary === "viewport") {
                boundaryRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
              } else if (entry.options.boundary && typeof entry.options.boundary === "object") {
                boundaryRect = entry.options.boundary;
              } else {
                boundaryRect = null;
              }
              if (boundaryRect && absolutePositioned) {
                if (style.position === "fixed") {
                  targetOffsetX = 0;
                  targetOffsetY = 0;
                } else {
                  const offsetParent = entry.target.offsetParent || document.body;
                  const parentRect = offsetParent.getBoundingClientRect();
                  targetOffsetX = parentRect.left + window.scrollX - (boundaryRect.x || 0);
                  targetOffsetY = parentRect.top + window.scrollY - (boundaryRect.y || 0);
                  if (entry.options.translate) {
                    targetOffsetX += entry.target.offsetLeft;
                    targetOffsetY += entry.target.offsetTop;
                  }
                }
              }
            },
            onMove: (event) => {
              let newWidth = startWidth;
              let newHeight = startHeight;
              let newPosX = startPosX;
              let newPosY = startPosY;
              let rawWidthCandidate = startWidth;
              let rawHeightCandidate = startHeight;
              if (isWest) rawWidthCandidate = startWidth - event.offsetX;
              else if (isEast) rawWidthCandidate = startWidth + event.offsetX;
              if (isNorth) rawHeightCandidate = startHeight - event.offsetY;
              else if (isSouth) rawHeightCandidate = startHeight + event.offsetY;
              if (isWest) {
                let candidate = startWidth - event.offsetX;
                if (candidate < minWidth) {
                  candidate = minWidth;
                  event.offsetX = startWidth - candidate;
                } else if (candidate > maxWidth) {
                  candidate = maxWidth;
                  event.offsetX = startWidth - candidate;
                }
                newWidth = candidate;
                newPosX = startPosX + event.offsetX;
              } else if (isEast) {
                let candidate = startWidth + event.offsetX;
                if (candidate < minWidth) candidate = minWidth;
                if (candidate > maxWidth) candidate = maxWidth;
                newWidth = candidate;
              }
              if (isNorth) {
                let candidate = startHeight - event.offsetY;
                if (candidate < minHeight) {
                  candidate = minHeight;
                  event.offsetY = startHeight - candidate;
                } else if (candidate > maxHeight) {
                  candidate = maxHeight;
                  event.offsetY = startHeight - candidate;
                }
                newHeight = candidate;
                newPosY = startPosY + event.offsetY;
              } else if (isSouth) {
                let candidate = startHeight + event.offsetY;
                if (candidate < minHeight) candidate = minHeight;
                if (candidate > maxHeight) candidate = maxHeight;
                newHeight = candidate;
              }
              let widthSnappedCollapsed = false, heightSnappedCollapsed = false;
              let widthSnappedExpanded = false, heightSnappedExpanded = false;
              const snapArea = entry.options.snapArea || 40;
              if (entry.options.snapHorizontal && affectsWidth) {
                if (entry.options.snapCollapse && rawWidthCandidate < snapArea) {
                  newWidth = 0;
                  widthSnappedCollapsed = true;
                } else if (entry.options.snapExpand && entry.target.parentElement) {
                  const pw = entry.target.parentElement.getBoundingClientRect().width;
                  if (rawWidthCandidate > pw - snapArea) {
                    newWidth = pw;
                    widthSnappedExpanded = true;
                  }
                }
              }
              if (entry.options.snapVertical && affectsHeight) {
                if (entry.options.snapCollapse && rawHeightCandidate < snapArea) {
                  newHeight = 0;
                  heightSnappedCollapsed = true;
                } else if (entry.options.snapExpand && entry.target.parentElement) {
                  const ph = entry.target.parentElement.getBoundingClientRect().height;
                  if (rawHeightCandidate > ph - snapArea) {
                    newHeight = ph;
                    heightSnappedExpanded = true;
                  }
                }
              }
              const snappedCollapsed = widthSnappedCollapsed || heightSnappedCollapsed;
              const snappedExpanded = widthSnappedExpanded || heightSnappedExpanded;
              const horizExpanded = widthSnappedExpanded && entry.options.snapExpand;
              const vertExpanded = heightSnappedExpanded && entry.options.snapExpand;
              if (absolutePositioned) {
                if (entry.options.translate) {
                  if (isWest || isNorth) {
                    entry.target.style.transform = `translate3d(${newPosX}px, ${newPosY}px, 0)`;
                  }
                } else {
                  if (isWest) entry.target.style.left = newPosX + "px";
                  if (isNorth) entry.target.style.top = newPosY + "px";
                }
              }
              if (affectsWidth || widthSnappedCollapsed || widthSnappedExpanded) {
                if (horizExpanded) entry.target.style.width = "100%";
                else entry.target.style.width = newWidth + "px";
              }
              if (affectsHeight || heightSnappedCollapsed || heightSnappedExpanded) {
                if (vertExpanded) entry.target.style.height = "100%";
                else entry.target.style.height = newHeight + "px";
              }
              if (snappedCollapsed) {
                entry.target.classList.add("ls-resize-collapsed");
                entry.target.classList.remove("ls-resize-expanded");
              } else if (snappedExpanded) {
                entry.target.classList.add("ls-resize-expanded");
                entry.target.classList.remove("ls-resize-collapsed");
              } else {
                entry.target.classList.remove("ls-resize-collapsed");
                entry.target.classList.remove("ls-resize-expanded");
              }
              if (boundaryRect) {
                const bx = boundaryRect.x || 0;
                const by = boundaryRect.y || 0;
                const bw = boundaryRect.width;
                const bh = boundaryRect.height;
                if (absolutePositioned) {
                  const leftInBoundary = newPosX + targetOffsetX;
                  if (leftInBoundary < bx) {
                    const diff = bx - leftInBoundary;
                    newPosX += diff;
                    if (isWest) {
                      newWidth -= diff;
                    }
                  }
                  const topInBoundary = newPosY + targetOffsetY;
                  if (topInBoundary < by) {
                    const diff = by - topInBoundary;
                    newPosY += diff;
                    if (isNorth) {
                      newHeight -= diff;
                    }
                  }
                  const rightInBoundary = newPosX + targetOffsetX + newWidth;
                  if (rightInBoundary > bx + bw) {
                    const diff = rightInBoundary - (bx + bw);
                    if (isEast) {
                      newWidth -= diff;
                    } else if (isWest) {
                      newPosX -= diff;
                    }
                  }
                  const bottomInBoundary = newPosY + targetOffsetY + newHeight;
                  if (bottomInBoundary > by + bh) {
                    const diff = bottomInBoundary - (by + bh);
                    if (isSouth) {
                      newHeight -= diff;
                    } else if (isNorth) {
                      newPosY -= diff;
                    }
                  }
                } else {
                  if (newWidth > bw) newWidth = bw;
                  if (newHeight > bh) newHeight = bh;
                }
                if (newWidth < minWidth) newWidth = minWidth;
                if (newHeight < minHeight) newHeight = minHeight;
              }
              entry.states[side] = "normal";
              if (snappedCollapsed || entry.target.classList.contains("ls-resize-collapsed")) entry.states[side] = "collapsed";
              else if (snappedExpanded || entry.target.classList.contains("ls-resize-expanded")) entry.states[side] = "expanded";
              const evtd = [side, newWidth, newHeight, newPosX, newPosY, entry.states[side]];
              handler.emit("resize", evtd);
              evtd.unshift({ target: entry.target, side, handler });
              this.emit("resize", evtd);
              endWidth = newWidth;
              endHeight = newHeight;
              if (entry.options.cursors !== false && entry.options.boundsCursors !== false) {
                const canExpandWidth = newWidth < maxWidth;
                const canShrinkWidth = newWidth > minWidth;
                const canExpandHeight = newHeight < maxHeight;
                const canShrinkHeight = newHeight > minHeight;
                let cur = handler.cursor;
                if (isWest || isEast) {
                  if (canExpandWidth && canShrinkWidth) cur = "ew-resize";
                  else if (canExpandWidth && !canShrinkWidth) cur = isWest ? "w-resize" : "e-resize";
                  else if (!canExpandWidth && canShrinkWidth) cur = isWest ? "e-resize" : "w-resize";
                  else cur = "not-allowed";
                } else if (isNorth || isSouth) {
                  if (canExpandHeight && canShrinkHeight) cur = "ns-resize";
                  else if (canExpandHeight && !canShrinkHeight) cur = isNorth ? "n-resize" : "s-resize";
                  else if (!canExpandHeight && canShrinkHeight) cur = isNorth ? "s-resize" : "n-resize";
                  else cur = "not-allowed";
                }
                handler.cursor = cur;
              }
            },
            onEnd: (event) => {
              try {
                const data = {
                  width: entry.target.style.width || null,
                  height: entry.target.style.height || null,
                  state: entry.target.classList.contains("ls-resize-collapsed") ? "collapsed" : entry.target.classList.contains("ls-resize-expanded") ? "expanded" : "normal"
                };
                if (entry.options.translate) {
                  const transform = window.getComputedStyle(entry.target).transform;
                  let mat = transform.match(/^matrix3d\((.+)\)$/);
                  if (mat) {
                    data.translateX = parseFloat(mat[1].split(", ")[12]);
                    data.translateY = parseFloat(mat[1].split(", ")[13]);
                  } else {
                    mat = transform.match(/^matrix\((.+)\)$/);
                    if (mat) {
                      data.translateX = parseFloat(mat[1].split(", ")[4]);
                      data.translateY = parseFloat(mat[1].split(", ")[5]);
                    } else {
                      data.translateX = 0;
                      data.translateY = 0;
                    }
                  }
                } else {
                  data.left = entry.target.style.left || null;
                  data.top = entry.target.style.top || null;
                }
                if (entry.storage) entry.storage.setItem(entry.storeKey, entry.options?.storeStringify !== false ? JSON.stringify(data) : data);
              } catch (e) {
                console.error(e);
              }
              this.emit("resize-end", [{ target: entry.target, handler, side }, endHeight, endWidth, entry.states[side]?.currentState || "normal"]);
              handler.emit("resize-end", [side, endHeight, endWidth, entry.states[side]?.currentState || "normal"]);
            }
          });
          return handler;
        }
        static cursorMap = {
          top: "ns-resize",
          bottom: "ns-resize",
          left: "ew-resize",
          right: "ew-resize",
          topLeft: "nwse-resize",
          bottomRight: "nwse-resize",
          topRight: "nesw-resize",
          bottomLeft: "nesw-resize"
        };
        remove(target) {
          const entry = this.targets.get(target);
          if (entry) {
            entry.handler?.destroy();
            for (const side in entry.handles) {
              entry.handles[side].remove();
            }
            entry.target = null;
            entry.options = null;
            entry.handler = null;
            entry.states = null;
            entry.handles = null;
            entry.restored = false;
            entry.storage = null;
            entry.storageKey = null;
            this.targets.delete(target);
            if (entry._removalObserver) {
              entry._removalObserver.disconnect();
              delete entry._removalObserver;
            }
            return true;
          }
          return false;
        }
        getHandle(target, side) {
          const entry = this.targets.get(target);
          if (entry && entry.handles[side]) {
            return entry.handles[side];
          }
          return null;
        }
        getTarget(element) {
          return this.targets.get(element) || null;
        }
      }, { name: "Resize", singular: true, global: true });
      LS.ShortcutManager = class ShortcutManager extends LS.EventEmitter {
        constructor({ target = document, signal = null, shortcuts = {} } = {}) {
          super();
          this.shortcuts = /* @__PURE__ */ new Map();
          this.mappings = /* @__PURE__ */ new Map();
          this.handler = this.#handleKeyDown.bind(this);
          this.target = target;
          this.target.addEventListener("keydown", this.handler, signal ? { signal } : void 0);
          if (shortcuts) for (const [shortcut, handler] of Object.entries(shortcuts)) {
            this.register(shortcut, handler);
          }
        }
        /**
         * Registers a keyboard shortcut.
         * @param {string|array<string>} shortcut Shortcut (eg. "Ctrl+S" or ["Ctrl+S", "Cmd+S"])
         * @param {*} handler Callback
         * @returns 
         */
        register(shortcut, handler = null) {
          if (Array.isArray(shortcut)) {
            for (const item of shortcut) {
              this.register(item, handler);
            }
            return this;
          }
          const parts2 = shortcut.toLowerCase().split("+");
          this.shortcuts.set(shortcut, {
            key: parts2.find((part) => !["ctrl", "control", "shift", "alt", "super", "meta", "cmd", "command"].includes(part)),
            ctrl: parts2.includes("ctrl") || parts2.includes("control"),
            shift: parts2.includes("shift"),
            alt: parts2.includes("alt"),
            meta: parts2.includes("super") || parts2.includes("meta") || parts2.includes("cmd") || parts2.includes("command"),
            handler
          });
          return this;
        }
        unregister(shortcut) {
          if (Array.isArray(shortcut)) {
            for (const item of shortcut) {
              this.unregister(item);
            }
            return this;
          }
          this.shortcuts.delete(shortcut);
          return this;
        }
        /**
         * Applies a map of keys to shortcuts.
         * @param {Object} mapping Mapping of shortcut to handler OR 
         * 
         * FIXME: Complexity is O(n^2)
         * 
         * @example
         * shortcutManager.map({
         *    "SAVE": "Ctrl+S"
         * });
         * 
         * shortcutManager.assign("SAVE", () => { ... });
         * 
         * // Later, you may want to customize the mapping:
         * shortcutManager.map({
         *    "SAVE": "Shift+S" // <= updates the previous mapping
         * });
         */
        map(mapping) {
          for (const [key, shortcut] of Object.entries(mapping)) {
            for (const [existingShortcut, data] of this.shortcuts.entries()) {
              if (data.handler === key) {
                this.unregister(existingShortcut);
              }
            }
            this.register(shortcut, key);
          }
          return this;
        }
        /**
         * Assigns a handler for a key to later be mapped.
         * This is different from register() as it maps to a key instead of a hard-coded shortcut.
         * @param {string} key Key
         * @param {*} handler Callback
         */
        assign(key, handler) {
          this.mappings.set(key, handler);
          return this;
        }
        unassign(key) {
          this.mappings.delete(key);
          return this;
        }
        reset() {
          this.shortcuts.clear();
          this.mappings.clear();
          return this;
        }
        destroy() {
          this.reset();
          this.events.clear();
          this.target.removeEventListener("keydown", this.handler);
        }
        triggerMapping(key) {
          const handler = this.mappings.get(key);
          if (typeof handler === "function") {
            handler();
            return true;
          }
          return false;
        }
        #handleKeyDown(event) {
          const target = event.target;
          if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
            return;
          }
          for (const shortcut of this.shortcuts.values()) {
            if (this.#matchesShortcut(event, shortcut)) {
              event.preventDefault();
              this.emit("activated", [shortcut, event]);
              const handler = typeof shortcut.handler === "function" ? shortcut.handler : this.mappings.get(shortcut.handler);
              if (typeof handler === "function") {
                handler(event, shortcut);
                return;
              }
            }
          }
        }
        #matchesShortcut(event, shortcut) {
          if (shortcut.ctrl !== event.ctrlKey) return false;
          if (shortcut.shift !== event.shiftKey) return false;
          if (shortcut.alt !== event.altKey) return false;
          if (shortcut.meta !== event.metaKey) return false;
          const eventKey = event.key.toLowerCase();
          if (eventKey === shortcut.key) return true;
          if (shortcut.key === "space" && event.code === "Space") return true;
          if (shortcut.key === "enter" && eventKey === "enter") return true;
          if (shortcut.key === "esc" && eventKey === "escape") return true;
          return false;
        }
      };
      LS.LoadComponent(class Tabs extends LS.Component {
        static defaults = LS.Util.staticDefaults({
          styled: true,
          list: true,
          closeable: false,
          reordableList: true,
          selector: "ls-tab, .ls-tab",
          mode: "default",
          slideAnimation: false
        });
        #reorderState = {
          id: null,
          moved: false,
          axis: "x",
          offsets: null
        };
        constructor(element, options = {}) {
          super();
          this.order = [];
          this.tabs = /* @__PURE__ */ new Map();
          this.activeTab = null;
          this.element = this.container = element ? LS.Select(element) : LS.Create("div");
          this.options = options = this.constructor.defaults(options);
          console.log(options);
          this.element.classList.add("ls-tabs");
          if (options.styled && !options.unstyled) {
            this.container.classList.add("ls-tabs-styled");
          }
          if (options.mode) {
            this.container.classList.add("ls-tabs-mode-" + options.mode);
          }
          if (options.selector) {
            this.element.querySelectorAll(options.selector).forEach((tab) => {
              this.add(tab);
            });
          }
          this.prepareEvent("close", { results: true });
          if (options.list) {
            this.frameScheduler = new LS.Util.FrameScheduler(() => this.#renderList());
            this.element.classList.add("ls-tabs-has-list");
            this.list = LS.Create({
              class: "ls-tabs-list"
            });
            this.container = LS.Create({
              class: "ls-tabs-content",
              inner: [...this.element.children]
            });
            this.element.add(this.list, this.container);
            this.frameScheduler.schedule();
          } else {
            this.element.classList.add("ls-tabs-content");
          }
        }
        get index() {
          return this.order.indexOf(this.activeTab);
        }
        add(id, content, options = {}) {
          if (id instanceof Element) {
            options ??= content || {};
            content = id;
            id = options.id || content.getAttribute("tab-id") || content.getAttribute("id") || content.getAttribute("tab-title");
          }
          if (!id) {
            id = "tab-" + (this.tabs.size + 1);
          }
          if (this.tabs.has(id)) {
            return false;
          }
          if (!content) {
            content = LS.Create("div", {
              inner: "Tab " + (this.tabs.size + 1)
            });
          }
          const tab = { id, element: content, title: options.title || content.getAttribute("tab-title") || content.getAttribute("title") };
          this.tabs.set(id, tab);
          this.order.push(id);
          this.container.add(content);
          content.classList.add("ls-tab-content");
          this.renderList();
          return id;
        }
        remove(id) {
          const tab = this.tabs.get(id);
          if (!tab) {
            return false;
          }
          const index = this.order.indexOf(id);
          if (tab.reorderHandle) {
            tab.reorderHandle.destroy();
            tab.reorderHandle = null;
          }
          if (this.#reorderState.id === id) {
            this.#reorderState.id = null;
            this.#reorderState.moved = false;
            this.#reorderState.axis = "x";
            this.#reorderState.offsets = null;
          }
          tab.element.remove();
          if (tab.handle) tab.handle.remove();
          this.tabs.delete(id);
          this.order.splice(index, 1);
          this.emit("removed", [id]);
          return true;
        }
        setClosestNextTo(id) {
          const index = this.order.indexOf(id);
          if (index === -1) {
            return false;
          }
          if (index === this.order.length - 1) {
            this.set(this.order[index - 1]);
          } else {
            this.set(this.order[index + 1]);
          }
        }
        set(id, force = false) {
          if (typeof id === "number") {
            id = this.order[id];
          }
          const tab = this.tabs.get(id);
          const oldTab = this.tabs.get(this.activeTab);
          if (!tab) {
            return false;
          }
          if (this.activeTab === id && !force) {
            return false;
          }
          if (oldTab) {
            if (oldTab.element) {
              oldTab.element.classList.remove("tab-active");
            }
            if (oldTab.handle) {
              oldTab.handle.classList.remove("active");
            }
          }
          if (tab.element) {
            tab.element.classList.add("tab-active");
            if (this.options.slideAnimation && LS.Animation && !this.firstRender) {
              LS.Animation.slideInToggle(tab.element, oldTab?.element || null);
            }
            this.firstRender = false;
          }
          this.activeTab = id;
          this.emit("changed", [id, oldTab?.id || null]);
          if (tab.handle) {
            tab.handle.classList.add("active");
          }
          return true;
        }
        first() {
          this.set(this.order[0]);
        }
        last() {
          this.set(this.order[this.order.length - 1]);
        }
        currentElement() {
          return this.tabs.get(this.activeTab)?.element || null;
        }
        next(loop = false) {
          const index = this.index;
          if (index === -1) {
            return false;
          }
          if (index !== this.order.length - 1) {
            return this.set(this.order[index + 1]);
          }
          if (loop) {
            return this.set(this.order[0]);
          }
          return false;
        }
        previous(loop = false) {
          const index = this.index;
          if (index === -1) {
            return false;
          }
          if (index !== 0) {
            return this.set(this.order[index - 1]);
          }
          if (loop) {
            return this.set(this.order[this.order.length - 1]);
          }
          return false;
        }
        #renderList() {
          if (!this.list || !this.options.list) return;
          for (this.list.children.length; this.list.children.length > 0; this.list.children[0].remove()) ;
          this.order.forEach((id) => {
            const tab = this.tabs.get(id);
            if (!tab) return;
            if (!tab.handle) {
              tab.handle = LS.Create({
                class: "ls-tab-handle",
                inner: tab.title || id,
                onpointerdown: () => {
                  this.set(id);
                }
              });
              tab.handle.dataset.tabId = id;
              if (this.options.reordableList) {
                tab.reorderHandle ??= new LS.Util.TouchHandle(tab.handle, {
                  buttons: [0],
                  cursor: "grabbing",
                  disablePointerEvents: false,
                  onStart: (event) => {
                    if (event.domEvent.target.closest(".ls-tab-close")) {
                      return event.cancel();
                    }
                    const handles = this.order.map((tabId) => this.tabs.get(tabId)?.handle).filter(Boolean);
                    if (!handles.length) {
                      return event.cancel();
                    }
                    let axis = "x";
                    if (handles.length > 1) {
                      const firstRect = handles[0].getBoundingClientRect();
                      const secondRect = handles[1].getBoundingClientRect();
                      const horizontalDistance = Math.abs(secondRect.left + secondRect.width / 2 - (firstRect.left + firstRect.width / 2));
                      const verticalDistance = Math.abs(secondRect.top + secondRect.height / 2 - (firstRect.top + firstRect.height / 2));
                      axis = horizontalDistance >= verticalDistance ? "x" : "y";
                    }
                    const offsets = this.order.map((tabId) => {
                      const handle = this.tabs.get(tabId)?.handle;
                      if (!handle) return null;
                      const rect = handle.getBoundingClientRect();
                      return axis === "x" ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
                    }).filter((offset) => typeof offset === "number");
                    if (!offsets.length) {
                      return event.cancel();
                    }
                    this.#reorderState.id = id;
                    this.#reorderState.moved = false;
                    this.#reorderState.axis = axis;
                    this.#reorderState.offsets = offsets;
                    tab.handle.classList.add("ls-tab-handle-reordering");
                    tab.handle.style.pointerEvents = "none";
                  },
                  onMove: (event) => {
                    if (this.#reorderState.id !== id) return;
                    const offsets = this.#reorderState.offsets;
                    if (!offsets || !offsets.length) return;
                    const position = this.#reorderState.axis === "x" ? event.x : event.y;
                    let toIndex = 0;
                    if (position <= offsets[0]) {
                      toIndex = 0;
                    } else if (position >= offsets[offsets.length - 1]) {
                      toIndex = offsets.length - 1;
                    } else {
                      let low = 0;
                      let high = offsets.length - 1;
                      while (low < high) {
                        const mid = low + (high - low >> 1);
                        if (position > offsets[mid]) {
                          low = mid + 1;
                        } else {
                          high = mid;
                        }
                      }
                      toIndex = low;
                      if (toIndex > 0) {
                        const prev = offsets[toIndex - 1];
                        const next = offsets[toIndex];
                        if (Math.abs(position - prev) <= Math.abs(next - position)) {
                          toIndex = toIndex - 1;
                        }
                      }
                    }
                    const fromIndex = this.order.indexOf(id);
                    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
                    this.order.splice(fromIndex, 1);
                    this.order.splice(toIndex, 0, id);
                    this.#reorderState.moved = true;
                    this.renderList();
                  },
                  onEnd: () => {
                    tab.handle.classList.remove("ls-tab-handle-reordering");
                    tab.handle.style.pointerEvents = "";
                    tab.handle.style.transform = "";
                    if (this.#reorderState.id !== id) return;
                    const moved = this.#reorderState.moved;
                    this.#reorderState.id = null;
                    this.#reorderState.moved = false;
                    this.#reorderState.axis = "x";
                    this.#reorderState.offsets = null;
                    if (moved) {
                      this.emit("reordered", [id, [...this.order]]);
                      this.renderList();
                    }
                  }
                });
              }
              if (this.options.closeable) {
                tab.handle.add(LS.Create("button", {
                  class: "clear circle ls-tab-close",
                  innerHTML: "&times;",
                  onclick: () => {
                    const results = this.emit("close", [id]);
                    console.log(results);
                    if (results && results.some((result) => result === false)) return;
                    if (this.activeTab === id) {
                      this.setClosestNextTo(id);
                    }
                    this.remove(id);
                    this.renderList();
                  }
                }));
              }
            }
            tab.handle.classList.toggle("active", this.activeTab === id);
            tab.handle.dataset.tabId = id;
            this.list.add(tab.handle);
          });
        }
        renderList() {
          if (this.frameScheduler) this.frameScheduler.schedule();
        }
        destroy() {
          this.emit("destroy");
          if (this.frameScheduler) {
            this.frameScheduler.destroy();
            this.frameScheduler = null;
          }
          this.element.remove();
          this.element = null;
          this.container = null;
          this.list = null;
          this.order.length = 0;
          for (const tab of this.tabs.values()) {
            if (tab.reorderHandle) {
              tab.reorderHandle.destroy();
              tab.reorderHandle = null;
            }
          }
          this.tabs.clear();
          this.events.clear();
          return null;
        }
      }, { name: "Tabs", global: true });
      /**
       * An efficient timeline component, optimized for long timelines with many items via virtual scrolling.
       * It handles: drag and drop, resizing, markers, touch controls, and virtual scrolling by automatically unloading off-screen items.
       * 
       * Based on the original LSv3 implementation, rewritten from scratch.
       * 
       * @author lstv.space
       * @license GPL-3.0
       */
      (() => {
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const DEFAULTS = {
          element: null,
          chunkSize: "auto",
          reservedRows: 5,
          zoom: 200,
          offset: 0,
          minZoom: 0.1,
          maxZoom: 1e3,
          markerSpacing: 100,
          markerMetric: "time",
          resizable: true,
          autoAppendRows: true,
          allowAutomationClips: false,
          autoCreateAutomationClips: false,
          snapping: false,
          itemHeaderHeight: 20,
          startingRows: 15,
          rowHeight: 45,
          snapEnabled: true,
          remapAutomationTargets: true,
          framerateLimit: 90
        };
        const TEMPLATE = function(d) {
          "use strict";
          var e0 = document.createElement("div");
          e0.setAttribute("tabindex", "0");
          var e1 = document.createElement("div");
          e1.className = "ls-timeline-markers";
          var e2 = document.createElement("div");
          e2.className = "ls-timeline-player-head";
          var e3 = document.createElement("div");
          e3.className = "ls-timeline-selection-rect";
          e3.style.cssText = "position: absolute; pointer-events: none; display: none; border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 50%, rgba(0, 0, 0, 0.2) 50%); z-index: 100;";
          var e4 = document.createElement("div");
          e4.className = "ls-timeline-snap-line";
          e4.style.cssText = "position: fixed; top: 0; left: 0; width: 1px; background: var(--accent-60); z-index: 1000; pointer-events: none; display: none;";
          var e5 = document.createElement("div");
          e5.className = "ls-timeline-scroll-container";
          var e6 = document.createElement("div");
          e6.className = "ls-timeline-spacer";
          e6.style.cssText = "height: 1px; width: 0px;";
          var e7 = document.createElement("div");
          e7.className = "ls-timeline-rows";
          e5.append(e6, e7);
          e0.append(e1, e2, e3, e4, e5);
          var __rootValue = e0;
          return { "markerContainer": e1, "playerHead": e2, "selectionRect": e3, "snapLine": e4, "scrollContainer": e5, "spacerElement": e6, "rowContainer": e7, root: __rootValue };
        };
        LS.LoadComponent(class Timeline extends LS.Component {
          /**
           * Timeline component options configuration
           * @property {HTMLElement|null} element - The DOM element to attach the timeline to
           * @property {number|"auto"} chunkSize - Size of chunks for virtual scrolling. "auto" adjusts based on item count
           * @property {number} reservedRows - Number of rows to pre-allocate
           * @property {number} zoom - Initial zoom level (pixels per time unit)
           * @property {number} offset - Initial horizontal scroll offset in pixels
           * @property {number|"auto"} minZoom - Minimum allowed zoom level. "auto" fits content to viewport width
           * @property {number} maxZoom - Maximum allowed zoom level
           * @property {number} markerSpacing - Minimum spacing between time markers in pixels
           * @property {"time"|"number"|Function} markerMetric - Format for time markers. "time" shows HH:MM:SS, "number" shows raw values, or custom function(time, step)
           * @property {boolean} resizable - Enable resizing of timeline items
           * @property {boolean} autoAppendRows - Automatically add new rows when items are dropped on the last row
           */
          constructor(options = {}) {
            super({
              dependencies: ["Menu", "Resize"]
            });
            this.options = LS.Util.defaults(DEFAULTS, options);
            const element = TEMPLATE();
            this.container = element.root;
            this.scrollContainer = element.scrollContainer;
            this.rowContainer = element.rowContainer;
            this.spacerElement = element.spacerElement;
            this.markerContainer = element.markerContainer;
            this.playerHead = element.playerHead;
            this.selectionRect = element.selectionRect;
            this.snapLine = element.snapLine;
            if (this.options.element) {
              this.options.element.appendChild(this.container);
            }
            this.container.classList.add("ls-timeline");
            this.container.__lsComponent = this;
            this.items = [];
            this.itemMap = /* @__PURE__ */ new Map();
            this.rowElements = [];
            this.markerPool = [];
            this.activeMarkers = [];
            this.selectedItems = /* @__PURE__ */ new Set();
            this.__rendered = /* @__PURE__ */ new Set();
            this.__needsSort = false;
            this.maxDuration = 0;
            this.#duration = 0;
            this.__spacerWidth = 0;
            this.frameScheduler = new LS.Util.FrameScheduler(() => this.#render());
            if (this.options.framerateLimit > 0) this.frameScheduler.limitFPS(this.options.framerateLimit);
            this.reserveRows(this.options.reservedRows);
            let dragType = null, rect = null;
            let selectStartWorldX = 0, selectStartWorldY = 0, lastCursorY = 0;
            let velocityX = 0, lastMoveTime = 0, inertiaRaf = null;
            let edgeScrollSpeedX = 0, edgeScrollSpeedY = 0, edgeScrollRaf = null, lastCursorX = 0;
            const stopInertia = () => {
              if (inertiaRaf) cancelAnimationFrame(inertiaRaf);
              inertiaRaf = null;
            };
            const stopEdgeScroll = () => {
              if (edgeScrollRaf) cancelAnimationFrame(edgeScrollRaf);
              edgeScrollRaf = null;
              edgeScrollSpeedX = 0;
              edgeScrollSpeedY = 0;
            };
            const updateSelectionBox = (x, y) => {
              const currentX = x;
              const currentY = y;
              const scrollLeft = this.offset;
              const scrollTop = this.scrollContainer.scrollTop;
              const startScreenX = selectStartWorldX - scrollLeft;
              const startScreenY = selectStartWorldY - scrollTop;
              const left = Math.min(startScreenX, currentX);
              const top = Math.min(startScreenY, currentY);
              const width = Math.abs(currentX - startScreenX);
              const height = Math.abs(currentY - startScreenY);
              this.selectionRect.style.transform = `translate3d(${left}px, ${top}px, 0)`;
              this.selectionRect.style.width = `${width}px`;
              this.selectionRect.style.height = `${height}px`;
              const worldLeft = left + scrollLeft;
              const worldRight = worldLeft + width;
              const timeStart = worldLeft / this.#zoom;
              const timeEnd = worldRight / this.#zoom;
              const rowRect = this.rowContainer.getBoundingClientRect();
              const containerRect = this.container.getBoundingClientRect();
              const relativeRowTop = rowRect.top - containerRect.top;
              const boxTopRel = top - relativeRowTop;
              const boxBottomRel = boxTopRel + height;
              const rowHeight = this.rowElements.length > 0 ? this.rowElements[0].offsetHeight : 30;
              if (rowHeight <= 0) return;
              const rowStart = Math.floor(boxTopRel / rowHeight);
              const rowEnd = Math.floor(boxBottomRel / rowHeight);
              const candidates = this.getRange(timeStart, timeEnd, false);
              this.selectedItems.clear();
              for (const item of candidates) {
                if (item.row >= rowStart && item.row <= rowEnd) {
                  const itemEnd = item.start + item.duration;
                  if (itemEnd > timeStart && item.start < timeEnd) {
                    this.selectedItems.add(item);
                  }
                }
              }
              this.frameScheduler.schedule();
            };
            const processEdgeScroll = () => {
              if (edgeScrollSpeedX !== 0 || edgeScrollSpeedY !== 0) {
                this.offset += edgeScrollSpeedX;
                this.scrollContainer.scrollTop += edgeScrollSpeedY;
                if (dragType === "seek") {
                  const worldX = lastCursorX + this.offset;
                  this.setSeek(worldX / this.#zoom);
                } else if (dragType === "select") {
                  updateSelectionBox(lastCursorX, lastCursorY);
                } else if (dragState.draggingItems) {
                  const rect2 = this.container.getBoundingClientRect();
                  updateDragItemPosition(lastCursorX + rect2.left, lastCursorY + rect2.top);
                }
                edgeScrollRaf = this.ctx.requestAnimationFrame(processEdgeScroll);
              } else {
                stopEdgeScroll();
              }
            };
            const processInertia = () => {
              if (Math.abs(velocityX) > 0.5) {
                this.offset -= velocityX;
                velocityX *= 0.92;
                inertiaRaf = this.ctx.requestAnimationFrame(processInertia);
              } else {
                stopInertia();
              }
            };
            const dragState = {};
            const updateDragItemPosition = (x, y) => {
              if (this.options.snapEnabled && !dragState.disableSnapping) {
                const snapValues = dragState.snapValues;
                const snapArea = 10;
                let snapped = false;
                if (Array.isArray(snapValues)) {
                  const currentItemTop = y - (dragState.dragOffsetY || 0);
                  const currentItemHeight = dragState.itemHeight || 0;
                  for (const snap of snapValues) {
                    if (snap.dest - x > -snapArea && snap.dest - x < snapArea) {
                      x = snap.dest;
                      if (this.snapLine) {
                        const top = Math.min(snap.top, y);
                        const height = Math.max(snap.top + snap.height, currentItemTop + currentItemHeight) - top;
                        this.snapLine.style.transform = `translate3d(${snap.line}px, ${top}px, 0)`;
                        this.snapLine.style.height = `${height}px`;
                        this.snapLine.style.display = "block";
                      }
                      snapped = true;
                      break;
                    }
                  }
                }
                if (!snapped && this.snapLine) this.snapLine.style.display = "none";
              } else {
                if (this.snapLine) this.snapLine.style.display = "none";
              }
              const rect2 = this.container.getBoundingClientRect();
              const currentWorldX = x - rect2.left + this.offset;
              const currentWorldY = y - rect2.top + this.scrollContainer.scrollTop;
              const deltaWorldX = currentWorldX - dragState.startWorldX;
              const deltaWorldY = currentWorldY - dragState.startWorldY;
              let deltaTime = deltaWorldX / this.#zoom;
              const rowOffset = Math.round(deltaWorldY / this.rowHeight);
              let minResultStart = Infinity;
              for (const entry of dragState._initialPositions) {
                const newStart = entry.start + deltaTime;
                if (newStart < minResultStart) minResultStart = newStart;
              }
              if (minResultStart < 0) {
                deltaTime -= minResultStart;
              }
              let minResultRow = Infinity;
              for (const entry of dragState._initialPositions) {
                const newRow = entry.row + rowOffset;
                if (newRow < minResultRow) minResultRow = newRow;
              }
              const clampedRowOffset = minResultRow < 0 ? rowOffset - minResultRow : rowOffset;
              for (const entry of dragState._initialPositions) {
                entry.item.start = entry.start + deltaTime;
                entry.item.row = entry.row + clampedRowOffset;
              }
              this.__needsSort = true;
              this.frameScheduler.schedule();
            };
            this.dragHandle = new LS.Util.TouchHandle(this.container, {
              exclude: ".ls-resize-handle, .ls-automation-point-handle, .ls-automation-center-handle",
              frameTimed: true,
              onStart: (event) => {
                if (event.domEvent.button === 2) return event.cancel();
                stopInertia();
                stopEdgeScroll();
                this.dragHandle.options.pointerLock = false;
                rect = this.container.getBoundingClientRect();
                const itemElement = event.domEvent.button === 0 ? event.domEvent.target.closest(".ls-timeline-item") : null;
                this.dragHandle.options.disablePointerEvents = !itemElement;
                if (itemElement) {
                  dragState.draggingItems = true;
                  dragState.itemElement = itemElement;
                  dragState.item = itemElement.__timelineItem || this.items.find((i) => i.element === itemElement);
                  dragState.startX = event.x;
                  dragState.startY = event.y;
                  dragState.startWorldX = event.x - rect.left + this.offset;
                  dragState.startWorldY = event.y - rect.top + this.scrollContainer.scrollTop;
                  dragState.disableSnapping = false;
                  dragState.isCloning = event.domEvent.shiftKey;
                  let itemsToMove = this.selectedItems.size && this.selectedItems.has(dragState.item) ? Array.from(this.selectedItems) : [dragState.item];
                  if (this.options.snapEnabled) {
                    dragState.snapValues = [];
                    const cw = dragState.item.duration * this.#zoom;
                    const vh = window.innerHeight;
                    const vw = window.innerWidth;
                    const itemRect = dragState.itemElement.getBoundingClientRect();
                    const dragOffset = event.x - itemRect.left;
                    dragState.dragOffsetY = event.y - itemRect.top;
                    dragState.itemHeight = itemRect.height;
                    for (const item of this.items) {
                      const element2 = item.timelineElement;
                      if (!element2 || element2 === dragState.itemElement) continue;
                      if (itemsToMove.includes(item)) continue;
                      const box = element2.getBoundingClientRect();
                      if (box.width === 0 && box.height === 0) continue;
                      if (box.bottom < -50 || box.top > vh + 50 || box.right < -50 || box.left > vw + 50) continue;
                      dragState.snapValues.push(
                        { dest: box.left + dragOffset, line: box.left, top: box.top, height: box.height },
                        { dest: box.right + dragOffset, line: box.right, top: box.top, height: box.height },
                        { dest: box.left - cw + dragOffset, line: box.left, top: box.top, height: box.height },
                        { dest: box.right - cw + dragOffset, line: box.right, top: box.top, height: box.height }
                      );
                    }
                  } else dragState.snapValues = [];
                  dragState._initialPositions = itemsToMove.map((itm) => ({
                    item: itm,
                    start: itm.start,
                    row: itm.row || 0
                  }));
                  if (dragState.isCloning) {
                    const clonedItems = [];
                    const cloneMap = /* @__PURE__ */ new Map();
                    const idMap = /* @__PURE__ */ new Map();
                    for (const itm of itemsToMove) {
                      const cloned = this.cloneItem(itm);
                      cloned.start = itm.start;
                      cloned.row = itm.row || 0;
                      this.add(cloned);
                      clonedItems.push(cloned);
                      cloneMap.set(itm, cloned);
                      idMap.set(itm.id, cloned.id);
                    }
                    if (this.options.remapAutomationTargets) {
                      this.remapAutomationTargets(clonedItems, idMap);
                    }
                    dragState.clonedItems = clonedItems;
                    dragState._initialPositions = clonedItems.map((itm) => ({
                      item: itm,
                      start: itm.start,
                      row: itm.row || 0
                    }));
                    this.selectedItems.clear();
                    for (const cloned of clonedItems) {
                      this.selectedItems.add(cloned);
                    }
                    if (cloneMap.has(dragState.item)) {
                      dragState.item = cloneMap.get(dragState.item);
                      dragState.itemElement = dragState.item.timelineElement;
                    }
                    itemsToMove = clonedItems;
                  }
                  return;
                } else {
                  dragState.draggingItems = false;
                }
                const touchEvent = event.domEvent.type.startsWith("touch");
                const button = touchEvent ? event.domEvent.target === this.scrollContainer || this.scrollContainer.contains(event.domEvent.target) ? 1 : 0 : event.domEvent.button;
                if (event.domEvent.ctrlKey && button === 0) {
                  dragType = "select";
                } else if (event.domEvent.ctrlKey && button === 1) {
                  dragType = "zoom-v";
                  this.dragHandle.options.pointerLock = true;
                } else {
                  dragType = button === 0 ? "seek" : button === 1 ? "pan" : button === 2 ? "delete" : null;
                }
                if (!dragType) {
                  event.cancel();
                  return;
                }
                rect = this.container.getBoundingClientRect();
                selectStartWorldX = event.x - rect.left + this.offset;
                selectStartWorldY = event.y - rect.top + this.scrollContainer.scrollTop;
                velocityX = 0;
                lastMoveTime = performance.now();
                if (dragType === "select") {
                  this.selectionRect.style.display = "block";
                  this.selectionRect.style.width = "0px";
                  this.selectionRect.style.height = "0px";
                  this.dragHandle.cursor = "crosshair";
                  if (!event.domEvent.shiftKey) {
                    this.selectedItems.clear();
                    this.frameScheduler.schedule();
                  }
                } else {
                  this.dragHandle.cursor = dragType === "pan" ? "grabbing" : dragType === "seek" ? "ew-resize" : dragType === "zoom-v" ? "none" : "no-drop";
                  if (dragType === "seek") {
                    this.deselectAll();
                  }
                }
                this.quickEmit("drag-start", dragType);
              },
              onMove: (event) => {
                const rect2 = this.container.getBoundingClientRect();
                const cursorX = event.x - rect2.left;
                const cursorY = event.y - rect2.top;
                lastCursorX = cursorX;
                lastCursorY = cursorY;
                if (dragState.draggingItems) {
                  const threshold = 50;
                  const maxSpeed = 15;
                  edgeScrollSpeedX = 0;
                  edgeScrollSpeedY = 0;
                  if (cursorX < threshold) edgeScrollSpeedX = -maxSpeed * ((threshold - cursorX) / threshold);
                  else if (cursorX > rect2.width - threshold) edgeScrollSpeedX = maxSpeed * ((cursorX - (rect2.width - threshold)) / threshold);
                  if (cursorY < threshold) edgeScrollSpeedY = -maxSpeed * ((threshold - cursorY) / threshold);
                  else if (cursorY > rect2.height - threshold) edgeScrollSpeedY = maxSpeed * ((cursorY - (rect2.height - threshold)) / threshold);
                  if ((edgeScrollSpeedX !== 0 || edgeScrollSpeedY !== 0) && !edgeScrollRaf) {
                    edgeScrollRaf = this.ctx.requestAnimationFrame(processEdgeScroll);
                  }
                  updateDragItemPosition(event.x, event.y);
                  return;
                }
                const now = performance.now();
                this.__isDragging = true;
                if (dragType === "pan") {
                  this.offset -= event.dx;
                  this.scrollContainer.scrollTop -= event.dy;
                  velocityX = event.dx;
                  this.quickEmit("drag-move", dragType, event.dx, event.dy);
                } else if (dragType === "zoom-v") {
                  const sensitivity = 0.5;
                  const oldHeight = this.rowHeight;
                  const targetHeight = oldHeight - event.dy * sensitivity;
                  this.rowHeight = targetHeight;
                  const newHeight = this.rowHeight;
                  if (newHeight !== oldHeight) {
                    const rect3 = this.scrollContainer.getBoundingClientRect();
                    const mouseY = event.startY - rect3.top;
                    const oldScrollTop = this.scrollContainer.scrollTop;
                    const contentY = oldScrollTop + mouseY;
                    const ratio = newHeight / oldHeight;
                    this.scrollContainer.scrollTop = contentY * ratio - mouseY;
                  }
                  this.quickEmit("drag-move", dragType, 0, event.dy);
                } else if (dragType === "seek" || dragType === "select") {
                  if (dragType === "seek") {
                    const worldX = cursorX + this.offset;
                    const time = worldX / this.#zoom;
                    this.setSeek(time);
                  } else {
                    updateSelectionBox(cursorX, cursorY);
                  }
                  const threshold = 50;
                  const maxSpeed = 15;
                  edgeScrollSpeedX = 0;
                  edgeScrollSpeedY = 0;
                  if (cursorX < threshold) {
                    edgeScrollSpeedX = -maxSpeed * ((threshold - cursorX) / threshold);
                  } else if (cursorX > rect2.width - threshold) {
                    edgeScrollSpeedX = maxSpeed * ((cursorX - (rect2.width - threshold)) / threshold);
                  }
                  if (dragType === "select") {
                    if (cursorY < threshold) edgeScrollSpeedY = -maxSpeed * ((threshold - cursorY) / threshold);
                    else if (cursorY > rect2.height - threshold) edgeScrollSpeedY = maxSpeed * ((cursorY - (rect2.height - threshold)) / threshold);
                  }
                  if ((edgeScrollSpeedX !== 0 || edgeScrollSpeedY !== 0) && !edgeScrollRaf) {
                    edgeScrollRaf = this.ctx.requestAnimationFrame(processEdgeScroll);
                  }
                  this.quickEmit("drag-move", dragType, cursorX, cursorY);
                } else if (dragType === "delete") {
                }
                lastMoveTime = now;
              },
              onEnd: () => {
                if (dragType === "pan") {
                  if (performance.now() - lastMoveTime < 50) {
                    processInertia();
                  }
                } else if (dragType === "select") {
                  this.selectionRect.style.display = "none";
                }
                if (dragState.draggingItems && dragState._initialPositions) {
                  const hasChanged = dragState._initialPositions.some(
                    (entry) => entry.item.start !== entry.start || entry.item.row !== entry.row
                  );
                  if (hasChanged || dragState.isCloning) {
                    if (dragState.isCloning) {
                      this.emitAction({
                        type: "clone",
                        items: dragState.clonedItems.map((item) => ({
                          id: item.id,
                          data: this.cloneItem(item)
                        }))
                      });
                    } else {
                      this.emitAction({
                        type: "move",
                        changes: dragState._initialPositions.map((entry) => ({
                          id: entry.item.id,
                          before: { start: entry.start, row: entry.row },
                          after: { start: entry.item.start, row: entry.item.row }
                        }))
                      });
                    }
                  }
                  dragState._initialPositions = null;
                  dragState.clonedItems = null;
                  dragState.isCloning = false;
                  dragState.draggingItems = false;
                }
                if (this.snapLine) this.snapLine.style.display = "none";
                stopEdgeScroll();
                this.ctx.setTimeout(() => this.__isDragging = false, 10);
                this.quickEmit("drag-end", dragType);
                dragType = null;
              }
            });
            this.focusedItem = null;
            this.container.addEventListener("contextmenu", (event) => {
              event.preventDefault();
              const itemElement = event.target.closest(".ls-timeline-item");
              if (itemElement) {
                this.contextMenu.close();
                this.focusedItem = itemElement.__timelineItem;
                this.selectedItems.clear();
                this.selectedItems.add(this.focusedItem);
                this.frameScheduler.schedule();
                this.itemContextMenu.open(event.clientX, event.clientY);
              } else {
                this.itemContextMenu.close();
                this.contextMenu.open(event.clientX, event.clientY);
              }
            });
            this.container.addEventListener("pointerdown", () => {
              this.container.focus();
            });
            const self = this;
            this.contextMenu = new LS.Menu({
              items: [
                { text: "Paste Item(s)", icon: "bi-clipboard", action: () => {
                  if (!this.clipboard.length) return;
                  const pastedItems = [];
                  const idMap = /* @__PURE__ */ new Map();
                  for (const entry of this.clipboard) {
                    const newItem = this.cloneItem(entry.data);
                    newItem.start = this.seek + entry.offset;
                    newItem.row = entry.row;
                    idMap.set(entry.data.id, newItem.id);
                    pastedItems.push(newItem);
                    this.add(newItem);
                  }
                  if (this.options.remapAutomationTargets) {
                    this.remapAutomationTargets(pastedItems, idMap);
                  }
                  this.frameScheduler.schedule();
                }, get hidden() {
                  return self.clipboard.length === 0;
                } },
                { type: "separator" },
                { text: "Select All", icon: "bi-check2-all", action: () => this.selectAll() },
                { text: "Deselect All", icon: "bi-x-lg", action: () => this.deselectAll() }
              ]
            });
            this.itemContextMenu = new LS.Menu({
              items: [
                { text: "Copy Item(s)", icon: "bi-clipboard", action: () => {
                  if (this.selectedItems.size === 0) return;
                  let minStart = Infinity;
                  for (const item of this.selectedItems) {
                    if (item.start < minStart) minStart = item.start;
                  }
                  this.clipboard = Array.from(this.selectedItems, (item) => ({
                    data: this.cloneItem(item),
                    row: item.row || 0,
                    offset: item.start - minStart
                  }));
                } },
                { text: "Cut Item(s)", icon: "bi-scissors", action: () => {
                  if (this.selectedItems.size === 0) return;
                  let minStart = Infinity;
                  for (const item of this.selectedItems) {
                    if (item.start < minStart) minStart = item.start;
                  }
                  this.clipboard = Array.from(this.selectedItems, (item) => ({
                    data: this.cloneItem(item),
                    row: item.row || 0,
                    offset: item.start - minStart
                  }));
                  this.deleteSelected();
                } },
                { type: "separator" },
                { text: "Delete Item(s)", icon: "bi-trash", action: () => {
                  this.deleteSelected();
                } }
              ]
            });
            this.container.addEventListener("click", (event) => {
              if (this.__isDragging) return;
              const itemElement = event.target.closest(".ls-timeline-item");
              if (itemElement) {
                const item = itemElement.__timelineItem || this.items.find((i) => i.element === itemElement);
                if (item) {
                  this.select(item);
                }
              } else {
                this.deselectAll();
              }
            });
            document.addEventListener("wheel", this.__wheelHandler = (event) => {
              if (!event.ctrlKey) return;
              if (event.target !== this.container && !this.container.contains(event.target)) return;
              event.preventDefault();
              const rect2 = this.container.getBoundingClientRect();
              const cursorX = event.clientX - rect2.left;
              const currentZoom = this.#zoom;
              const zoomDelta = currentZoom * 0.16 * (event.deltaY > 0 ? -1 : 1);
              this.zoom = currentZoom + zoomDelta;
              const worldX = (cursorX + this.offset) / currentZoom;
              this.offset = worldX * this.zoom - cursorX;
            }, { passive: false });
            this.container.addEventListener("dragover", this.__nativeDragOverHandler = (event) => {
              const dt = event.dataTransfer;
              if (!dt) return;
              const types = dt.types ? Array.from(dt.types) : [];
              if (!types.includes("Files")) return;
              event.preventDefault();
              try {
                dt.dropEffect = "copy";
              } catch (_) {
              }
            });
            this.container.addEventListener("drop", this.__nativeDropHandler = (event) => {
              const dt = event.dataTransfer;
              if (!dt || !dt.files || dt.files.length === 0) return;
              event.preventDefault();
              const containerRect = this.container.getBoundingClientRect();
              const cursorX = event.clientX - containerRect.left;
              const cursorY = event.clientY - containerRect.top;
              const worldX = cursorX + this.#offset;
              const timeOffset = worldX / this.#zoom;
              let rowIndex = 0;
              let matched = false;
              for (let i = 0; i < this.rowElements.length; i++) {
                const r = this.rowElements[i].getBoundingClientRect();
                if (event.clientY >= r.top && event.clientY <= r.bottom) {
                  rowIndex = i;
                  matched = true;
                  break;
                }
              }
              if (!matched && this.rowElements.length > 0) {
                const firstRect = this.rowElements[0].getBoundingClientRect();
                const lastRect = this.rowElements[this.rowElements.length - 1].getBoundingClientRect();
                if (event.clientY < firstRect.top) {
                  rowIndex = 0;
                } else if (event.clientY > lastRect.bottom) {
                  rowIndex = this.rowElements.length - 1;
                }
              }
              this.quickEmit(this.__fileProcessEventRef, dt.files, rowIndex, timeOffset);
            });
            this.zoom = this.options.zoom;
            this.offset = this.options.offset;
            let previousScrollLeft = this.#offset;
            this.scrollContainer.addEventListener("scroll", (event) => {
              this.#offset = this.scrollContainer.scrollLeft;
              if (this.#offset !== previousScrollLeft) {
                previousScrollLeft = this.#offset;
                this.frameScheduler.schedule();
              }
            });
            if (this.options.resizable && !LS.Resize) {
              console.warn("LS.Timeline: LS.Resize component is required for resizable timeline items.");
            }
            this.clipboard = [];
            this.__actionEventRef = this.prepareEvent("action");
            this.container.addEventListener("keydown", (event) => {
              if (event.key === "Delete" || event.key === "Backspace") {
                this.deleteSelected();
                return;
              }
              if (!event.ctrlKey) return;
              const key = event.key.toLowerCase();
              if (key === "a") {
                event.preventDefault();
                this.selectedItems.clear();
                for (const item of this.items) this.selectedItems.add(item);
                this.frameScheduler.schedule();
              } else if (key === "c") {
                event.preventDefault();
                if (this.selectedItems.size === 0) return;
                let minStart = Infinity;
                for (const item of this.selectedItems) {
                  if (item.start < minStart) minStart = item.start;
                }
                this.clipboard = Array.from(this.selectedItems, (item) => ({
                  data: this.cloneItem(item),
                  row: item.row || 0,
                  offset: item.start - minStart
                }));
              } else if (key === "v") {
                event.preventDefault();
                if (!this.clipboard.length) return;
                const pastedItems = [];
                const idMap = /* @__PURE__ */ new Map();
                for (const entry of this.clipboard) {
                  const newItem = this.cloneItem(entry.data);
                  newItem.start = this.seek + entry.offset;
                  newItem.row = entry.row;
                  idMap.set(entry.data.id, newItem.id);
                  pastedItems.push(newItem);
                  this.add(newItem);
                }
                if (this.options.remapAutomationTargets) {
                  this.remapAutomationTargets(pastedItems, idMap);
                }
                this.frameScheduler.schedule();
              }
            });
            this.rowHeight = this.options.rowHeight;
            this.reserveRows(this.options.startingRows);
            this.frameScheduler.schedule();
            this.__seekEventRef = this.prepareEvent("seek");
            this.__fileProcessEventRef = this.prepareEvent("file-dropped");
            this.enabled = true;
          }
          // --- Camera state values (do not influence content) ---
          #offset = 0;
          #zoom = 1;
          #rowHeight = 30;
          get rowHeight() {
            return this.#rowHeight;
          }
          set rowHeight(value) {
            value = clamp(value, 20, 500);
            if (value === this.#rowHeight) return;
            this.#rowHeight = value;
            this.container.style.setProperty("--ls-timeline-row-height", `${value}px`);
            this.frameScheduler.schedule();
          }
          get zoom() {
            return this.#zoom;
          }
          set zoom(value) {
            let minZoom = this.options.minZoom;
            if (minZoom === "auto") {
              if (this.#duration > 0 && this.container.clientWidth > 0) {
                minZoom = this.container.clientWidth / this.#duration;
              } else {
                minZoom = 1e-6;
              }
            }
            value = clamp(value, minZoom, this.options.maxZoom);
            if (value === this.#zoom) return;
            this.#zoom = value;
            this.frameScheduler.schedule();
          }
          get offset() {
            return this.#offset;
          }
          set offset(value) {
            value = Math.max(0, value);
            if (value === this.#offset) return;
            this.scrollContainer.scrollLeft = value;
            this.#offset = value;
            this.frameScheduler.schedule();
          }
          // --- Player state values (do influence content) ---
          #seek = 0;
          #duration = 0;
          get seek() {
            return this.#seek;
          }
          set seek(value) {
            this.#seek = Math.max(0, value);
            this.updateHeadPosition();
          }
          setSeek(value) {
            value = Math.max(0, value);
            if (this.#seek === value) return;
            this.#seek = value;
            this.quickEmit(this.__seekEventRef, value);
            this.updateHeadPosition();
          }
          get duration() {
            return this.#duration;
          }
          getItemById(id) {
            return this.itemMap.get(id);
          }
          binarySearch(time) {
            const items = this.items;
            let low = 0;
            let high = items.length - 1;
            while (low <= high) {
              const mid = low + high >>> 1;
              if (items[mid].start < time) {
                low = mid + 1;
              } else {
                high = mid - 1;
              }
            }
            return low;
          }
          sortItems() {
            this.items.sort((a, b) => (a.start || 0) - (b.start || 0));
            let totalDuration = 0;
            this.maxDuration = 0;
            for (let i = 0; i < this.items.length; i++) {
              const item = this.items[i];
              if (!item.id) {
                item.id = LS.Misc.uid();
                this.itemMap.set(item.id, item);
              }
              if (!item.duration || item.duration < 0) item.duration = 0;
              if (!item.start || item.start < 0) item.start = 0;
              if (!item.row || item.row < 0) item.row = 0;
              if (item.duration > this.maxDuration) this.maxDuration = item.duration;
              if (!item.data) item.data = {};
              const end = item.start + item.duration;
              if (end > totalDuration) totalDuration = end;
            }
            this.__needsSort = false;
            this.quickEmit("sorted", this.maxDuration);
            if (totalDuration !== this.#duration) {
              this.#duration = totalDuration;
              this.quickEmit("duration-changed", this.#duration);
            }
          }
          reserveRows(number) {
            while (this.rowElements.length < number) {
              const rowElement = LS.Create({
                class: "ls-timeline-row"
              });
              this.rowContainer.add(rowElement);
              this.rowElements.push(rowElement);
            }
          }
          addTrack() {
            this.reserveRows(this.rowElements.length + 1);
          }
          clearUnusedRows() {
            const highestUsedRow = this.items.reduce((max, item) => Math.max(max, item.row || 0), 0);
            for (let i = this.rowElements.length - 1; i > highestUsedRow; i--) {
              const rowElement = this.rowElements.pop();
              rowElement.remove();
            }
          }
          #render() {
            if (!this.enabled || document.hidden || document.fullscreenElement) return;
            const zoom = this.#zoom;
            const offset = this.#offset;
            const items = this.items;
            const rowElements = this.rowElements;
            const selectedItems = this.selectedItems;
            const rendered = this.__rendered;
            const options = this.options;
            const viewportWidth = this.container.clientWidth;
            const worldRight = offset + viewportWidth;
            if (this.__needsSort) {
              this.sortItems();
            }
            const endPadding = viewportWidth * 0.5;
            const contentWidth = this.#duration * zoom;
            const spacerWidth = contentWidth + endPadding > worldRight + endPadding ? contentWidth + endPadding : worldRight + endPadding;
            if (this.__spacerWidth - spacerWidth > 1 || spacerWidth - this.__spacerWidth > 1) {
              this.spacerElement.style.width = spacerWidth + "px";
              this.__spacerWidth = spacerWidth;
            }
            this.markerContainer.style.transform = `translate3d(${-offset}px, 0, 0)`;
            const minMarkerDist = options.markerSpacing;
            const invZoom = 1 / zoom;
            const minTimeStep = minMarkerDist * invZoom;
            const step = Math.pow(2, Math.ceil(Math.log2(minTimeStep)));
            const invStep = 1 / step;
            const startTime = Math.floor(offset * invZoom * invStep) * step;
            const endTime = worldRight * invZoom;
            const endTimePlusStep = endTime + step;
            let markerIndex = 0;
            const activeMarkers = this.activeMarkers;
            const markerPool = this.markerPool;
            const markerContainer = this.markerContainer;
            for (let time = startTime; time <= endTimePlusStep; time += step) {
              const t = time * 1e3 + 0.5 | 0;
              const tNorm = t * 1e-3;
              if (tNorm < 0) continue;
              let marker;
              if (markerIndex < activeMarkers.length) {
                marker = activeMarkers[markerIndex];
              } else {
                marker = markerPool.pop();
                if (!marker) {
                  marker = document.createElement("div");
                  marker.className = "ls-timeline-marker";
                }
                markerContainer.appendChild(marker);
                activeMarkers.push(marker);
              }
              const pos = tNorm * zoom;
              if (marker.__pos !== pos) {
                marker.style.transform = `translateX(${pos}px)`;
                marker.__pos = pos;
              }
              if (marker.__time !== tNorm) {
                marker.textContent = this.formatMarker(tNorm, step);
                marker.__time = tNorm;
              }
              markerIndex++;
            }
            const activeLen = activeMarkers.length;
            if (markerIndex < activeLen) {
              for (let i = activeLen - 1; i >= markerIndex; i--) {
                const marker = activeMarkers[i];
                marker.remove();
                markerPool.push(marker);
              }
              activeMarkers.length = markerIndex;
            }
            const itemCount = items.length;
            const chunkSize = options.chunkSize === "auto" ? itemCount < 1e3 ? 2e3 : itemCount < 5e3 ? 500 : 100 : options.chunkSize;
            const invChunkSize = 1 / chunkSize;
            const chunkStart = Math.floor((offset - chunkSize) * invChunkSize) * chunkSize;
            const chunkEnd = Math.ceil((worldRight + chunkSize) * invChunkSize) * chunkSize;
            const minX = chunkStart - offset;
            const maxX = chunkEnd - offset;
            const maxDuration = this.maxDuration;
            const visibleStartTime = chunkStart * invZoom;
            const searchStartTime = visibleStartTime - maxDuration > 0 ? visibleStartTime - maxDuration : 0;
            const startIndex = this.binarySearch(searchStartTime);
            const rowHeight = this.#rowHeight;
            const autoCreateAutomation = options.autoCreateAutomationClips;
            const itemHeaderHeight = options.itemHeaderHeight;
            const automationHeight = rowHeight - itemHeaderHeight;
            for (let i = startIndex; i < itemCount; i++) {
              const item = items[i];
              const itemStart = item.start;
              const itemDuration = item.duration;
              const computedX = itemStart * zoom - offset;
              if (computedX > maxX) {
                break;
              }
              const computedWidth = itemDuration * zoom;
              if (computedWidth <= 0 || computedX + computedWidth < minX) {
                continue;
              }
              const itemElement = item.timelineElement || this.createTimelineElement(item);
              const itemRow = item.row || 0;
              if (computedWidth !== item.__previousWidth) {
                itemElement.style.width = computedWidth + "px";
                item.__previousWidth = computedWidth;
              }
              const isSelected = selectedItems.has(item);
              if (isSelected !== item.__wasSelected) {
                if (isSelected) {
                  itemElement.classList.add("selected");
                } else {
                  itemElement.classList.remove("selected");
                }
                item.__wasSelected = isSelected;
              }
              itemElement.style.transform = `translate3d(${computedX}px, 0, 0)`;
              const requiredRows = itemRow + 1;
              if (rowElements.length < requiredRows) {
                this.reserveRows(requiredRows);
              }
              const rowElement = rowElements[itemRow];
              const needsAppend = !itemElement.isConnected || itemElement.parentNode !== rowElement;
              if (needsAppend) {
                rowElement.appendChild(itemElement);
              }
              if (item.type === "automation") {
                const clip = item.__automationClip;
                if (needsAppend) {
                  if (!clip && autoCreateAutomation) {
                    const data = item.data || (item.data = {});
                    data.points = data.points || [];
                    item.__automationClip = new LS.AutomationGraph({ items: data.points, value: data.value || 0 });
                  }
                  if (item.__automationClip) {
                    item.__automationClip.setElement(itemElement);
                    item.__automationClip.updateScale(zoom);
                    item.__automationClip.updateSize(computedWidth, automationHeight);
                  }
                } else if (clip) {
                  clip.updateScale(zoom);
                  if (computedWidth !== item.__previousWidth || rowHeight !== item.__previousHeight) {
                    clip.updateSize(computedWidth, automationHeight);
                    item.__previousHeight = rowHeight;
                  }
                }
              }
              rendered.add(itemElement);
              itemElement.__eligible = true;
            }
            for (const child of rendered) {
              if (child.__eligible) {
                child.__eligible = false;
              } else {
                const timelineItem = child.__timelineItem;
                if (timelineItem && timelineItem.type === "automation" && timelineItem.__automationClip) {
                  timelineItem.__automationClip.setElement(null);
                }
                child.remove();
                rendered.delete(child);
              }
            }
            const headPos = this.#seek * zoom - offset;
            if (this.__headPos !== headPos) {
              this.playerHead.style.transform = `translate3d(${headPos}px, 0, 0)`;
              this.__headPos = headPos;
            }
          }
          #updateHeadPosition() {
            const zoom = this.#zoom;
            const offset = this.#offset;
            const headPos = this.#seek * zoom - offset;
            if (this.__headPos !== headPos) {
              this.playerHead.style.transform = `translate3d(${headPos}px, 0, 0)`;
              this.__headPos = headPos;
            }
            this.__headPositionQueued = false;
          }
          updateHeadPosition() {
            if (this.__headPositionQueued) return;
            this.__headPositionQueued = true;
            this.ctx.requestAnimationFrame(() => this.#updateHeadPosition());
          }
          formatMarker(time, step) {
            if (this.options.markerMetric === "number") return time.toString();
            if (typeof this.options.markerMetric === "function") return this.options.markerMetric(time, step);
            const absTime = Math.abs(time);
            const d = Math.floor(absTime / 86400);
            const h = Math.floor(absTime % 86400 / 3600);
            const m = Math.floor(absTime % 3600 / 60);
            const s = Math.floor(absTime % 60);
            if (time < 60) return absTime.toFixed(1) + "s";
            if (d > 0) return `${d}d ${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
            if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
            return `${m}:${s.toString().padStart(2, "0")}`;
          }
          render(updateItems = false) {
            if (updateItems) {
              this.__needsSort = true;
            }
            this.frameScheduler.schedule();
          }
          select(item) {
            this.selectedItems.clear();
            this.selectedItems.add(item);
            this.focusedItem = item;
            this.quickEmit("item-select", item);
            this.frameScheduler.schedule();
          }
          deselectAll() {
            if (this.selectedItems.size > 0) {
              this.selectedItems.clear();
              this.frameScheduler.schedule();
              this.quickEmit("item-deselect");
            }
            this.focusedItem = null;
          }
          selectAll() {
            this.selectedItems.clear();
            for (const item of this.items) this.selectedItems.add(item);
            this.frameScheduler.schedule();
          }
          /**
           * Timeline item data structure
           * @property {number} start - Start time of the item
           * @property {number} duration - Duration of the item
           * @property {number} [row=0] - Row index where the item is placed
           * @property {string} [label=""] - Display label for the item
           * @property {string|null} [color=null] - Accent color for the item
           * @property {*} [data=null] - Custom data associated with the item
           */
          add(item) {
            this.items.push(item);
            if (item.id) this.itemMap.set(item.id, item);
            this.__needsSort = true;
            this.frameScheduler.schedule();
          }
          cloneItem(item, keepId = false) {
            const id = keepId ? item.id : LS.Misc.uid();
            return {
              start: item.start,
              duration: item.duration,
              id,
              row: item.row || 0,
              label: item.label || id,
              color: item.color || null,
              data: item.data && LS.Util.clone(item.data, (key, value) => {
                if (key.startsWith("_") || value instanceof Element || typeof value === "function") return void 0;
                return true;
              }),
              type: item.type || null,
              ...item.cover ? { cover: item.cover } : null,
              ...item.waveform ? { waveform: item.waveform } : null
            };
          }
          /**
           * Remaps automation target nodeIds in cloned/pasted items.
           * If an automation clip's target was also cloned, update the target reference to point to the new clone.
           * @param {Array} items - The cloned/pasted items to process
           * @param {Map} idMap - Map from original item IDs to new item IDs
           */
          remapAutomationTargets(items, idMap) {
            for (const item of items) {
              if (item.type === "automation" && item.data && Array.isArray(item.data.targets)) {
                for (const target of item.data.targets) {
                  if (target.nodeId && idMap.has(target.nodeId)) {
                    target.nodeId = idMap.get(target.nodeId);
                    item.__dirty = true;
                  }
                }
              }
            }
          }
          cut(itemOrTime, offset) {
            if (typeof itemOrTime === "number") {
              const time = itemOrTime;
              const intersecting = this.getIntersectingAt(time);
              const newItems = [];
              for (const item2 of intersecting) {
                const newItem2 = this.cut(item2, time);
                if (newItem2) newItems.push(newItem2);
              }
              return newItems;
            }
            const item = itemOrTime;
            let splitTime;
            if (typeof offset === "string" && offset.endsWith("%")) {
              const percent = parseFloat(offset);
              splitTime = item.start + item.duration * (percent / 100);
            } else {
              splitTime = offset;
            }
            if (splitTime <= item.start + 1e-4 || splitTime >= item.start + item.duration - 1e-4) {
              return null;
            }
            const newItem = this.cloneItem(item);
            const originalDuration = item.duration;
            const originalEndTime = item.start + item.duration;
            item.duration = splitTime - item.start;
            newItem.start = splitTime;
            newItem.duration = originalEndTime - splitTime;
            this.add(newItem);
            this.emitAction({
              type: "cut",
              originalId: item.id,
              originalDuration,
              afterDuration: item.duration,
              newItemId: newItem.id,
              newItemData: this.cloneItem(newItem)
            });
            return newItem;
          }
          getIntersectingAt(time) {
            if (this.__needsSort) {
              this.sortItems();
            }
            const searchStart = time - this.maxDuration;
            let i = this.binarySearch(searchStart);
            const result = [];
            const items = this.items;
            const len = items.length;
            for (; i < len; i++) {
              const item = items[i];
              if (item.start > time) {
                break;
              }
              if (item.start + item.duration >= time) {
                result.push(item);
              }
            }
            return result;
          }
          getRange(start, end, containedOnly = false) {
            if (this.__needsSort) {
              this.sortItems();
            }
            const result = [];
            const searchStart = containedOnly ? start : start - this.maxDuration;
            const startIndex = this.binarySearch(searchStart);
            for (let i = startIndex; i < this.items.length; i++) {
              const item = this.items[i];
              if (item.start > end) {
                break;
              }
              const itemEnd = item.start + item.duration;
              if (containedOnly) {
                if (itemEnd <= end) {
                  result.push(item);
                }
              } else {
                if (itemEnd >= start) {
                  result.push(item);
                }
              }
            }
            return result;
          }
          createTimelineElement(item) {
            item.timelineElement = LS.Create({
              class: "ls-timeline-item" + (item.type ? ` ls-timeline-item-${item.type}` : "") + (item.cover ? " ls-timeline-item-cover" : ""),
              inner: { tag: "span", textContent: item.label || (item.data && item.data.label ? item.data.label : "") },
              accent: item.color || null,
              style: item.cover ? `background-image: url('${item.cover}'); background-size: cover; background-position: center;` : ""
            });
            Object.defineProperty(item, "label", {
              get: () => {
                const span = item.timelineElement.querySelector("span");
                return span ? span.textContent : "";
              },
              set: (value) => {
                const span = item.timelineElement.querySelector("span");
                if (span) span.textContent = value;
              }
            });
            Object.defineProperty(item, "color", {
              get: () => {
                return item.timelineElement.getAttribute("ls-accent");
              },
              set: (value) => {
                if (value) {
                  item.timelineElement.setAttribute("ls-accent", value);
                } else {
                  item.timelineElement.removeAttribute("ls-accent");
                }
              }
            });
            item.timelineElement.__timelineItem = item;
            if (LS.Resize && this.options.resizable) {
              const entry = LS.Resize.set(item.timelineElement, {
                left: true,
                right: true,
                translate: true,
                anchor: 0,
                minWidth: 5
              });
              const resizeHandler = (width, side) => {
                if (side === "left") {
                  const newDuration = width / this.#zoom;
                  const endTime = item.start + item.duration;
                  item.start = endTime - newDuration;
                  item.duration = newDuration;
                } else {
                  item.duration = width / this.#zoom;
                }
                if (item.type === "automation" && item.__automationClip) {
                  item.__automationClip.updateSize(width, this.rowHeight - this.options.itemHeaderHeight);
                }
                if (this.selectedItems.size > 1) {
                  for (const selectedItem of this.selectedItems) {
                    if (selectedItem === item) continue;
                    if (side === "left") {
                      const newDuration = width / this.#zoom;
                      const endTime = selectedItem.start + selectedItem.duration;
                      selectedItem.start = endTime - newDuration;
                      selectedItem.duration = newDuration;
                    } else {
                      selectedItem.duration = width / this.#zoom;
                    }
                  }
                }
                LS.Tooltips.set(this.formatMarker(item.duration)).position(item.timelineElement).show();
                this.frameScheduler.schedule();
              };
              entry.handler.on("resize", (side, width) => {
                resizeHandler(width, side);
              });
              entry.handler.on("resize-end", () => {
                this.__needsSort = true;
                LS.Tooltips.hide();
                this.frameScheduler.schedule();
              });
            }
            return item.timelineElement;
          }
          /**
           * Remove an item from the timeline, but keeps it alive to be added later.
           * Use if you think you might want to re-add the item later (eg. multiple timelines).
           * Optionally destroys it.
           * @param {*} item Item to remove
           * @param {*} destroy Whether to destroy the item
           * @returns {void}
           */
          remove(item, destroy = false) {
            const index = this.items.indexOf(item);
            if (index >= 0) {
              this.items.splice(index, 1);
              this.__needsSort = true;
              this.frameScheduler.schedule();
            }
            if (item.id) this.itemMap.delete(item.id);
            if (item.type === "automation" && item.__automationClip) {
              item.__automationClip?.destroy?.();
              item.__automationClip = null;
            }
            if (this.focusedItem === item) {
              this.focusedItem = null;
            }
            if (item.timelineElement && item.timelineElement.parentNode) {
              item.timelineElement.remove();
            }
            this.quickEmit("item-removed", item);
            if (destroy) {
              this.destroyTimelineElement(item);
              this.quickEmit("item-cleanup", item);
            }
          }
          /**
           * Destroy an item and remove it from the timeline. Clears any associated resources.
           * Use if you want to permanently delete an item.
           * @param {*} item Item to destroy
           * @returns {void}
           */
          destroyItem(item) {
            return this.remove(item, true);
          }
          /**
           * Clears and removes the timeline element associated with an item.
           * @param {*} item 
           */
          destroyTimelineElement(item) {
            if (item.timelineElement) {
              if (LS.Resize) LS.Resize.remove(item.timelineElement);
              if (item.timelineElement.parentNode) item.timelineElement.remove();
            }
            item.timelineElement = null;
          }
          deleteSelected() {
            const itemsToDelete = [];
            if (this.focusedItem && !this.selectedItems.has(this.focusedItem)) {
              itemsToDelete.push(this.focusedItem);
            }
            for (const item of this.selectedItems) {
              itemsToDelete.push(item);
            }
            if (itemsToDelete.length === 0) return;
            this.emitAction({
              type: "delete",
              items: itemsToDelete.map((item) => ({
                id: item.id,
                data: this.cloneItem(item)
              }))
            });
            for (const item of itemsToDelete) {
              this.destroyItem(item);
            }
            this.focusedItem = null;
            this.selectedItems.clear();
            this.frameScheduler.schedule();
          }
          reset(destroyItems = true, replacingItems = null) {
            if (this.destroyed) return;
            for (let item of this.items) {
              if (destroyItems) {
                this.destroyItem(item);
              } else if (item.timelineElement && item.timelineElement.parentNode) {
                if (item.type === "automation" && item.__automationClip) {
                  item.__automationClip.setElement(null);
                }
                item.timelineElement.remove();
              }
            }
            this.maxDuration = 0;
            this.#duration = 0;
            this.clearUnusedRows();
            this.reserveRows(this.options.startingRows);
            this.items = replacingItems || [];
            this.itemMap.clear();
            if (replacingItems) {
              for (const item of this.items) {
                if (!item.id) item.id = LS.Misc.uid();
                this.itemMap.set(item.id, item);
              }
              this.sortItems();
            }
            this.frameScheduler.schedule();
          }
          transformCoords(x, y) {
            const rowsRect = this.rowContainer.getBoundingClientRect();
            const time = (x - rowsRect.left + this.#offset) / this.#zoom;
            let rowIndex = 0;
            if (y !== void 0) {
              let matched = false;
              for (let i = 0; i < this.rowElements.length; i++) {
                const r = this.rowElements[i].getBoundingClientRect();
                if (y >= r.top && y <= r.bottom) {
                  rowIndex = i;
                  matched = true;
                  break;
                }
              }
              if (!matched && this.rowElements.length > 0) {
                const firstRect = this.rowElements[0].getBoundingClientRect();
                const lastRect = this.rowElements[this.rowElements.length - 1].getBoundingClientRect();
                if (y < firstRect.top) {
                  rowIndex = 0;
                } else if (y > lastRect.bottom) {
                  rowIndex = this.rowElements.length - 1;
                }
              }
            }
            return { time, row: rowIndex };
          }
          export() {
            if (this.__needsSort) {
              this.sortItems();
            }
            return this.items.map((item) => this.cloneItem(item, true));
          }
          /**
           * Emit an action event for external history management.
           * External code should listen to the "action" event and store the action for undo/redo.
           * @param {Object} action - The action data to emit
           */
          emitAction(action) {
            action.source = this;
            this.quickEmit(this.__actionEventRef, action);
          }
          /**
           * Apply an undo operation with the given action state.
           * Called by external history manager with the action to undo.
           * @param {Object} action - The action state to undo
           * @returns {boolean} Whether the undo was applied successfully
           */
          applyUndo(action) {
            if (!action || !action.type) return false;
            switch (action.type) {
              case "move":
                for (const change of action.changes) {
                  const item = this.getItemById(change.id);
                  if (item) {
                    item.start = change.before.start;
                    item.row = change.before.row;
                  }
                }
                this.__needsSort = true;
                break;
              case "clone":
              case "add":
                for (const entry of action.items) {
                  const item = this.getItemById(entry.id);
                  if (item) {
                    this.remove(item, true);
                  }
                }
                break;
              case "delete":
                for (const entry of action.items) {
                  const restoredItem = this.cloneItem(entry.data);
                  restoredItem.id = entry.id;
                  this.items.push(restoredItem);
                  this.itemMap.set(restoredItem.id, restoredItem);
                }
                this.__needsSort = true;
                break;
              case "resize":
                for (const change of action.changes) {
                  const item = this.getItemById(change.id);
                  if (item) {
                    item.start = change.before.start;
                    item.duration = change.before.duration;
                  }
                }
                this.__needsSort = true;
                break;
              case "cut":
                if (action.newItemId) {
                  const newItem = this.getItemById(action.newItemId);
                  if (newItem) this.remove(newItem, true);
                }
                const originalItem = this.getItemById(action.originalId);
                if (originalItem && action.originalDuration !== void 0) {
                  originalItem.duration = action.originalDuration;
                }
                this.__needsSort = true;
                break;
              default:
                return false;
            }
            this.frameScheduler.schedule();
            return true;
          }
          /**
           * Apply a redo operation with the given action state.
           * Called by external history manager with the action to redo.
           * @param {Object} action - The action state to redo
           * @returns {boolean} Whether the redo was applied successfully
           */
          applyRedo(action) {
            if (!action || !action.type) return false;
            switch (action.type) {
              case "move":
                for (const change of action.changes) {
                  const item = this.getItemById(change.id);
                  if (item) {
                    item.start = change.after.start;
                    item.row = change.after.row;
                  }
                }
                this.__needsSort = true;
                break;
              case "clone":
              case "add":
                for (const entry of action.items) {
                  const item = this.cloneItem(entry.data);
                  item.id = entry.id;
                  this.items.push(item);
                  this.itemMap.set(item.id, item);
                }
                this.__needsSort = true;
                break;
              case "delete":
                for (const entry of action.items) {
                  const item = this.getItemById(entry.id);
                  if (item) {
                    this.remove(item, true);
                  }
                }
                break;
              case "resize":
                for (const change of action.changes) {
                  const item = this.getItemById(change.id);
                  if (item) {
                    item.start = change.after.start;
                    item.duration = change.after.duration;
                  }
                }
                this.__needsSort = true;
                break;
              case "cut":
                const cutItem = this.getItemById(action.originalId);
                if (cutItem && action.newItemData) {
                  cutItem.duration = action.afterDuration;
                  const newItem = this.cloneItem(action.newItemData);
                  newItem.id = action.newItemId;
                  this.items.push(newItem);
                  this.itemMap.set(newItem.id, newItem);
                }
                this.__needsSort = true;
                break;
              default:
                return false;
            }
            this.frameScheduler.schedule();
            return true;
          }
          destroy() {
            this.reset(true);
            this.frameScheduler.destroy();
            this.frameScheduler = null;
            this.container.remove();
            this.clipboard = null;
            this.__actionEventRef = null;
            this.container = null;
            this.markerPool = null;
            this.activeMarkers = null;
            this.selectedItems.clear();
            this.selectedItems = null;
            this.items = null;
            this.itemMap = null;
            this.__rendered = null;
            this.focusedItem = null;
            this.rowElements = null;
            this.spacerElement = null;
            this.playerHead = null;
            this.rowContainer = null;
            this.scrollContainer = null;
            this.markerContainer = null;
            this.selectionRect = null;
            this.snapLine = null;
            this.__seekEventRef = null;
            this.__fileProcessEventRef = null;
            document.removeEventListener("wheel", this.__wheelHandler);
            this.__wheelHandler = null;
            if (this.container && this.__nativeDragOverHandler) {
              this.container.removeEventListener("dragover", this.__nativeDragOverHandler);
              this.__nativeDragOverHandler = null;
            }
            if (this.container && this.__nativeDropHandler) {
              this.container.removeEventListener("drop", this.__nativeDropHandler);
              this.__nativeDropHandler = null;
            }
            if (this.contextMenu) {
              this.contextMenu.destroy();
              this.contextMenu = null;
            }
            if (this.itemContextMenu) {
              this.itemContextMenu.destroy();
              this.itemContextMenu = null;
            }
            this.dragHandle.destroy();
            this.dragHandle = null;
            this.destroyed = true;
            this.emit("destroy");
            this.events.clear();
          }
        }, { name: "Timeline", global: true });
      })();
      LS.LoadComponent(class Toast extends LS.DestroyableComponent {
        constructor(content, options = {}) {
          super();
          this.element = this.constructor.TEMPLATE({
            content,
            accent: options.accent,
            icon: options.icon,
            closeClicked: (e) => {
              this.close();
            }
          }).root;
          this.constructor.openToasts.add(this);
          this.constructor.container.appendChild(this.element);
          this.closeCallback = options.onClose;
          this.setTimeout(() => {
            this.element.class("open");
          }, 1);
          this.setTimeout(() => {
            this.close();
          }, options.timeout || 5e3);
        }
        update(content) {
          if (this.element) this.element.querySelector(".ls-toast-content").textContent = content;
        }
        close() {
          this.element.class("open", 0);
          this.constructor.openToasts.delete(this);
          if (this.closeCallback) this.closeCallback();
          this.closeCallback = null;
          this.setTimeout(() => {
            this.element.remove();
            this.element = null;
            super.destroy();
          }, 150);
        }
        static {
          this.container = LS.Create({
            class: "ls-toast-layer"
          });
          LS.once("ready", () => {
            LS._topLayer.add(this.container);
          });
          this.TEMPLATE = function(d) {
            "use strict";
            var e0 = document.createElement("div");
            e0.setAttribute("ls-accent", d.accent);
            e0.className = "ls-toast level-n2";
            if (!!d.icon) {
              var e1 = document.createElement("i");
              e1.className = d.icon;
              e0.appendChild(e1);
            }
            var e2 = document.createElement("div");
            e2.className = "ls-toast-content";
            e2.textContent = d.content;
            e0.appendChild(e2);
            if (!!d.uncancellable) {
            } else {
              var e3 = document.createElement("button");
              e3.innerHTML = "&times;";
              e3.onclick = d.closeClicked;
              e3.className = "elevated circle ls-toast-close";
              e0.appendChild(e3);
            }
            var __rootValue = e0;
            return { root: __rootValue };
          };
          this.openToasts = /* @__PURE__ */ new Set();
        }
        static closeAll() {
          for (let toast of this.openToasts) {
            toast.close();
          }
        }
        static show(content, options = {}) {
          return new this(content, options);
        }
        static destroy() {
          this.container.remove();
          this.openToasts.clear();
        }
      }, { global: true, name: "Toast" });
      LS.LoadComponent(class Tooltips extends LS.DestroyableComponent {
        constructor() {
          super({
            cleanupRating: "full"
          });
          this.container = this.createElement({ class: "ls-tooltip-layer" });
          this.contentElement = this.createElement({ class: "ls-tooltip-content" });
          this.container.append(this.contentElement);
          this.attributes = ["ls-tooltip", "ls-hint"];
          this.__onMouseEnter = this._onMouseEnter.bind(this);
          this.__onMouseMove = this._onMouseMove.bind(this);
          this.__onMouseLeave = this._onMouseLeave.bind(this);
          this.frameScheduler = this.addDestroyable(new LS.Util.FrameScheduler(() => this.#render()));
          LS.once("ready", () => {
            LS._topLayer.append(this.container);
            this.rescan();
          });
        }
        position(x, y) {
          this.__x = x;
          this.__y = y;
          this.__positionChanged = true;
          this.render();
          return this;
        }
        set(text) {
          if (text === this.__value) return this;
          this.__value = text;
          this.__valueChanged = true;
          this.render();
          return this;
        }
        #render() {
          if (this.__valueChanged) {
            this.__valueChanged = false;
            let ltIndex = this.__value.indexOf("<");
            if (ltIndex !== -1 && this.__value.indexOf(">", ltIndex) !== -1) {
              const temp = document.createElement("span");
              temp.innerHTML = this.__value;
              LS.Util.sanitize(temp);
              this.contentElement.replaceChildren(...temp.childNodes);
            } else {
              this.contentElement.textContent = this.__value;
            }
          }
          if (this.__positionChanged) {
            this.__positionChanged = false;
            let x = this.__x;
            let y = this.__y;
            let box, element = null;
            if (x instanceof Element) {
              element = x;
              box = x.getBoundingClientRect();
            } else if (typeof x == "number") {
              box = { x };
            } else {
              return;
            }
            let cbox = this.contentElement.getBoundingClientRect();
            let isDetached = element?.hasAttribute?.("ls-tooltip-detached") && typeof y?.clientX === "number";
            if (isDetached) {
              this.contentElement.style.left = Math.min(Math.max(y.clientX + 12, 4), innerWidth - cbox.width) + "px";
              this.contentElement.style.top = Math.min(Math.max(y.clientY + 12, 4), innerHeight - cbox.height) + "px";
            } else {
              this.contentElement.style.left = (box.width ? Math.min(Math.max(box.left + box.width / 2 - cbox.width / 2, 4), innerWidth - cbox.width) : box.x) + "px";
              this.contentElement.style.maxWidth = innerWidth - 8 + "px";
              if (typeof y === "number") {
                this.contentElement.style.top = y + "px";
              } else {
                let pos_top = box.top - cbox.height;
                let pos_above_fits = pos_top >= 20;
                this.contentElement.style.top = `calc(${pos_above_fits ? pos_top : box.top + box.height}px ${pos_above_fits ? "-" : "+"} var(--ui-tooltip-rise, 5px))`;
              }
            }
          }
        }
        render() {
          this.frameScheduler.schedule();
        }
        show(text = null) {
          if (text) this.set(text);
          this.container.classList.add("shown");
          return this;
        }
        hide() {
          this.container.classList.remove("shown");
          return this;
        }
        addElements(mutations) {
          if (!Array.isArray(mutations) && !(mutations instanceof MutationRecord) && !(mutations instanceof NodeList)) mutations = [mutations];
          for (const mutation of mutations) {
            const element = mutation instanceof Element ? mutation : mutation?.target;
            if (!element) continue;
            const attributeName = mutation.attributeName || null;
            if (attributeName && !this.attributes.includes(attributeName)) continue;
            this.updateElement(element);
          }
        }
        updateElement(element) {
          element.ls_tooltip_isHint = element.hasAttribute("ls-hint");
          element.ls_hasTooltip = element.ls_tooltip_isHint || this.attributes.some((attr) => element.hasAttribute(attr));
          if (!element.ls_tooltipSetup) this.setup(element);
          else if (!element.ls_hasTooltip) this.unbind(element);
        }
        rescan() {
          this.addElements(document.querySelectorAll(this.attributes.map((a) => `[${a}]`).join(",")));
        }
        setup(element) {
          element.ls_tooltipSetup = true;
          element.addEventListener("mouseenter", this.__onMouseEnter);
          element.addEventListener("mousemove", this.__onMouseMove);
          element.addEventListener("mouseleave", this.__onMouseLeave);
        }
        unbind(element) {
          if (!element.ls_tooltipSetup) return;
          element.ls_tooltipSetup = false;
          element.removeEventListener("mouseenter", this.__onMouseEnter);
          element.removeEventListener("mousemove", this.__onMouseMove);
          element.removeEventListener("mouseleave", this.__onMouseLeave);
        }
        unbindAll() {
          const elements = document.querySelectorAll(this.attributes.map((a) => `[${a}]`).join(","));
          for (const element of elements) {
            this.unbind(element);
          }
        }
        _onMouseEnter(event) {
          const element = event.target;
          if (!element.ls_hasTooltip) return;
          element.ls_tooltip = element.getAttribute("ls-tooltip") || element.getAttribute("ls-hint") || element.getAttribute("title") || element.getAttribute("aria-label") || element.getAttribute("alt") || "";
          this.emit("set", [element.ls_tooltip, element]);
          if (element.ls_tooltip_isHint) return;
          this.position(0, 0).show(element.ls_tooltip).position(element, event);
        }
        _onMouseMove(event) {
          const element = event.target;
          if (!element.ls_hasTooltip) return;
          this.position(element, event);
        }
        _onMouseLeave(event) {
          const element = event.target;
          if (!element.ls_hasTooltip) return;
          this.emit("leave", [element.ls_tooltip]);
          this.hide();
        }
        destroy() {
          this.unbindAll();
          super.destroy();
        }
      }, { global: true, singular: true, name: "Tooltips" });
    }
  });
  require_beta_js_animation_automationgraph_color_compiletemplate_dragdrop_imagecropper_knob_menu_modal_network_node_patcher_range_reactive_resize_shortcutmanager_tabs_timeline_toast_tooltips_chrome108_firefox102();
})();