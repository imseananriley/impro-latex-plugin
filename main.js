var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.js
var main_exports = {};
__export(main_exports, {
  default: () => LatexPlugin
});
module.exports = __toCommonJS(main_exports);

// ../impro-riziles-fork2/impro-plugin/main.js
var SimpleUUID = class {
  constructor() {
    this._id = 0;
  }
  create() {
    return this._id++;
  }
};
var uuid = new SimpleUUID();
var callHandlers = /* @__PURE__ */ new Map();
var pendingHostCalls = /* @__PURE__ */ new Map();
function hostCall(method, ...args) {
  const hostCallId = uuid.create();
  return new Promise((resolve, reject) => {
    pendingHostCalls.set(hostCallId, { resolve, reject });
    self.postMessage({ type: "hostCall", method, hostCallId, args });
  });
}
var eventListeners = /* @__PURE__ */ new Map();
var registeredEvents = /* @__PURE__ */ new Set();
async function invokeListeners(listeners, event, args) {
  for (const listener of listeners) {
    try {
      await listener(...args);
    } catch (error) {
      console.error(`"${event}" listener threw:`, error);
    }
  }
}
async function dispatchEvent(event, args) {
  const listeners = eventListeners.get(event) ?? /* @__PURE__ */ new Set();
  switch (event) {
    case "post-context-menu":
    case "profile-context-menu": {
      const menu = new Menu();
      await invokeListeners(listeners, event, [menu, ...args]);
      return menu._serialize();
    }
    case "post-composer-open": {
      const composer = new Composer();
      await invokeListeners(listeners, event, [composer, ...args]);
      return composer._serialize();
    }
    default:
      console.warn(`No dispatch case for plugin event "${event}".`);
      return null;
  }
}
function addEventListener(event, listener) {
  let listeners = eventListeners.get(event);
  if (!listeners) {
    listeners = /* @__PURE__ */ new Set();
    eventListeners.set(event, listeners);
  }
  listeners.add(listener);
  if (!registeredEvents.has(event)) {
    registeredEvents.add(event);
    const handlerId = uuid.create();
    callHandlers.set(handlerId, (...args) => dispatchEvent(event, args));
    self.postMessage({
      type: "register",
      target: "eventListener",
      event,
      handlerId
    });
  }
}
var MenuItem = class {
  constructor() {
    this.title = "";
    this.icon = null;
    this._callback = () => {
    };
  }
  setTitle(title) {
    this.title = title;
    return this;
  }
  setIcon(icon) {
    this.icon = icon;
    return this;
  }
  onClick(callback) {
    this._callback = callback;
    return this;
  }
};
var Menu = class {
  constructor() {
    this.items = [];
  }
  addItem(builder) {
    const item = new MenuItem();
    builder(item);
    this.items.push(item);
    return this;
  }
  _serialize() {
    return this.items.map((item) => {
      const handlerId = uuid.create();
      callHandlers.set(handlerId, item._callback);
      const icon = item.icon instanceof VirtualEl ? item.icon._serialize() : item.icon;
      return { title: item.title, icon, handlerId };
    });
  }
};
var Composer = class {
  constructor() {
    this._ops = [];
    this._cursor = null;
  }
  setText(text) {
    this._ops.push({ op: "set", text: String(text) });
    return this;
  }
  appendText(text) {
    this._ops.push({ op: "append", text: String(text) });
    return this;
  }
  prependText(text) {
    this._ops.push({ op: "prepend", text: String(text) });
    return this;
  }
  setCursor(index) {
    this._cursor = index;
    return this;
  }
  _serialize() {
    return { ops: this._ops, cursor: this._cursor };
  }
};
var PluginData = class {
  getPost(uri) {
    return hostCall("getPost", { uri });
  }
  getProfile(did) {
    return hostCall("getProfile", { did });
  }
  // Like getProfile, but includes viewer relationship details not present
  // on the basic profile view: viewer.following, viewer.followedBy, and
  // viewer.knownFollowers (a summary of mutual followers).
  getDetailedProfile(did) {
    return hostCall("getDetailedProfile", { did });
  }
  // The full known-followers list for did (the summary on
  // getDetailedProfile's viewer.knownFollowers is capped to a handful).
  getKnownFollowers(did) {
    return hostCall("getKnownFollowers", { did });
  }
  getRecord(repo, collection, rkey) {
    return hostCall("getRecord", { repo, collection, rkey });
  }
};
var App = class {
  constructor() {
    this.currentUser = null;
    this.data = new PluginData();
  }
  on(event, listener) {
    addEventListener(event, listener);
  }
  refreshFeedFilters(feedURI = null) {
    return hostCall("refreshFeedFilters", feedURI);
  }
  // Actions on behalf of the signed-in user. Each method requires the
  // corresponding scope ("mute", "block", "feedFeedback") to be declared in
  // the plugin manifest's `permissions.actions` array, which the user must
  // grant at install time.
  muteActor(did) {
    return hostCall("muteActor", { did, mute: true });
  }
  unmuteActor(did) {
    return hostCall("muteActor", { did, mute: false });
  }
  blockActor(did) {
    return hostCall("blockActor", { did, block: true });
  }
  unblockActor(did) {
    return hostCall("blockActor", { did, block: false });
  }
  // Acts like the user clicking "Show less like this": sends the requestLess
  // feedback signal to the feed that served the post and collapses the post
  // behind a feedback message in feeds.
  showLessLikeThis(postUri, feedUri) {
    return hostCall("showLessLikeThis", { postUri, feedUri });
  }
  showMoreLikeThis(postUri, feedUri) {
    return hostCall("showMoreLikeThis", { postUri, feedUri });
  }
};
var registered = false;
var Plugin = class {
  constructor() {
    this.app = new App();
  }
  addSidebarItem(icon, title, callback = () => {
  }) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, callback);
    self.postMessage({
      type: "register",
      target: "sidebarItem",
      icon: icon instanceof VirtualEl ? icon._serialize() : icon,
      title,
      handlerId
    });
  }
  async loadData() {
    return hostCall("loadData");
  }
  async saveData(data) {
    await hostCall("saveData", { data });
  }
  addSettingTab(tab) {
    tab.plugin = this;
    const displayHandlerId = uuid.create();
    callHandlers.set(displayHandlerId, () => {
      tab.containerEl = new VirtualEl("div");
      tab.display();
      return tab.containerEl._serialize();
    });
    self.postMessage({
      type: "register",
      target: "settingTab",
      name: tab.name ?? null,
      displayHandlerId
    });
    this._settingTab = tab;
  }
  addFeedFilter(callback = () => {
  }) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, callback);
    self.postMessage({
      type: "register",
      target: "feedFilter",
      handlerId
    });
  }
  // callback(tokens, context) receives the rich-text token stream for one
  // post and returns a new token array (or the input unchanged). The host
  // batches all posts of a render into one call per plugin.
  //
  // options.handlesFacetTypes: array of facet feature $type strings this
  // transform owns, to prevent render flash of fallback text
  registerRichTextTransform(callback = (tokens) => tokens, options = {}) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, async (batch) => {
      const results = [];
      for (const { tokens, context } of batch) {
        try {
          const value = await callback(tokens, context);
          results.push({ value: serializeTransformTokens(value) });
        } catch (error) {
          results.push({ error: error?.message ?? String(error) });
        }
      }
      return results;
    });
    const handlesFacetTypes = Array.isArray(options.handlesFacetTypes) ? options.handlesFacetTypes.filter((type) => typeof type === "string") : [];
    self.postMessage({
      type: "register",
      target: "richTextTransform",
      handlerId,
      handlesFacetTypes
    });
  }
  registerSlot(name, callback = () => null) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, async (context) => {
      const result = await callback(context);
      if (result == null) return null;
      if (!(result instanceof VirtualEl)) {
        const description = result?.constructor?.name ?? typeof result;
        throw new Error(
          `Slot "${name}" must return a VirtualEl (or null), got ${description}`
        );
      }
      return result._serialize();
    });
    self.postMessage({
      type: "register",
      target: "slot",
      name,
      handlerId
    });
  }
  onload() {
  }
  onunload() {
  }
  static register() {
    if (registered) return;
    registered = true;
    const instance = new this();
    hostCall("getCurrentUser").then((user) => {
      instance.app.currentUser = user;
      return instance.onload();
    }).then(
      () => self.postMessage({ type: "ready" }),
      (error) => self.postMessage({
        type: "ready",
        error: error?.message ?? String(error)
      })
    );
  }
};
function serializeTransformTokens(tokens) {
  if (!Array.isArray(tokens)) return tokens;
  return tokens.map((token) => {
    if ((token?.type === "inline" || token?.type === "block") && token.node instanceof VirtualEl) {
      return { ...token, node: token.node._serialize() };
    }
    return token;
  });
}
var openModals = /* @__PURE__ */ new Map();
var IconComponent = class {
  constructor(containerEl) {
    this.el = containerEl.createEl("plugin-icon");
  }
  setIcon(name) {
    this.el.setAttr("icon", name);
    return this;
  }
};
var BlobImageComponent = class {
  constructor(containerEl) {
    this.el = containerEl.createEl("plugin-blob-image");
  }
  setDid(did) {
    this.el.setAttr("did", did);
    return this;
  }
  setCid(cid) {
    this.el.setAttr("cid", cid);
    return this;
  }
  setAlt(alt) {
    this.el.setAttr("alt", alt);
    return this;
  }
  setCdnPrefix(prefix) {
    this.el.setAttr("cdn-prefix", prefix);
    return this;
  }
};
var ProfilesListComponent = class {
  constructor(containerEl) {
    this.el = containerEl.createEl("plugin-profiles-list");
  }
  setDids(dids) {
    const value = Array.isArray(dids) ? dids.join(",") : String(dids ?? "");
    this.el.setAttr("dids", value);
    return this;
  }
  setEmptyMessage(message) {
    this.el.setAttr("empty-message", message);
    return this;
  }
};
var PostsFeedComponent = class {
  constructor(containerEl) {
    this.el = containerEl.createEl("plugin-posts-feed");
  }
  setUris(uris) {
    const value = Array.isArray(uris) ? uris.join(",") : String(uris ?? "");
    this.el.setAttr("uris", value);
    return this;
  }
  setEmptyMessage(message) {
    this.el.setAttr("empty-message", message);
    return this;
  }
};
var VirtualText = class {
  constructor(value) {
    this.value = value == null ? "" : String(value);
  }
  _serialize() {
    return { type: "text", value: this.value };
  }
};
var VirtualEl = class _VirtualEl {
  constructor(tag) {
    this.tag = tag;
    this.attrs = {};
    this.styles = {};
    this.children = [];
    this.events = {};
  }
  setStyle(name, value) {
    this.styles[String(name)] = value == null ? "" : String(value);
    return this;
  }
  onClick(fn) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, fn);
    this.events.click = handlerId;
    return this;
  }
  onChange(fn) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, fn);
    this.events.change = handlerId;
    return this;
  }
  onInput(fn) {
    const handlerId = uuid.create();
    callHandlers.set(handlerId, fn);
    this.events.input = handlerId;
    return this;
  }
  setText(text) {
    this.children = [];
    if (text != null && text !== "") this.children.push(new VirtualText(text));
    return this;
  }
  empty() {
    this.children = [];
    return this;
  }
  appendChild(child) {
    if (!(child instanceof _VirtualEl) && !(child instanceof VirtualText)) {
      throw new TypeError(
        "appendChild expects a VirtualEl or VirtualText instance"
      );
    }
    this.children.push(child);
    return this;
  }
  appendText(value) {
    this.children.push(new VirtualText(value));
    return this;
  }
  createText(value) {
    const node = new VirtualText(value);
    this.children.push(node);
    return node;
  }
  addClass(cls) {
    this.attrs.class = this.attrs.class ? `${this.attrs.class} ${cls}` : cls;
    return this;
  }
  setAttr(name, value) {
    this.attrs[name] = value === void 0 ? "" : value;
    return this;
  }
  createEl(tag, options = {}, callback) {
    const child = new _VirtualEl(tag);
    if (options.text != null) child.setText(options.text);
    if (options.cls) {
      child.attrs.class = Array.isArray(options.cls) ? options.cls.join(" ") : options.cls;
    }
    if (options.attr) Object.assign(child.attrs, options.attr);
    this.children.push(child);
    if (typeof callback === "function") callback(child);
    return child;
  }
  createDiv(options = {}, callback) {
    return this.createEl("div", options, callback);
  }
  createSpan(options = {}, callback) {
    return this.createEl("span", options, callback);
  }
  createProfilesList(callback) {
    const component = new ProfilesListComponent(this);
    if (typeof callback === "function") callback(component);
    return component;
  }
  createPostsFeed(callback) {
    const component = new PostsFeedComponent(this);
    if (typeof callback === "function") callback(component);
    return component;
  }
  createIcon(callback) {
    const component = new IconComponent(this);
    if (typeof callback === "function") callback(component);
    return component;
  }
  createBlobImage(callback) {
    const component = new BlobImageComponent(this);
    if (typeof callback === "function") callback(component);
    return component;
  }
  _serialize() {
    const serialized = {
      type: "element",
      tag: this.tag,
      attrs: this.attrs,
      events: this.events,
      children: this.children.map((child) => child._serialize())
    };
    if (Object.keys(this.styles).length > 0) serialized.styles = this.styles;
    return serialized;
  }
};
self.onmessage = async (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;
  if (message.type === "call") {
    const fn = callHandlers.get(message.handlerId);
    if (!fn) {
      self.postMessage({
        type: "result",
        callId: message.callId,
        error: `unknown handler ${message.handlerId}`
      });
      return;
    }
    try {
      const value = await fn(...message.args);
      self.postMessage({ type: "result", callId: message.callId, value });
    } catch (error) {
      self.postMessage({
        type: "result",
        callId: message.callId,
        error: error.message ?? String(error)
      });
    }
    return;
  }
  if (message.type === "hostResult") {
    const pending = pendingHostCalls.get(message.hostCallId);
    if (!pending) return;
    pendingHostCalls.delete(message.hostCallId);
    if (message.error) pending.reject(new Error(message.error));
    else pending.resolve(message.value);
    return;
  }
  if (message.type === "event") {
    switch (message.event) {
      case "modalDismissed": {
        const modal = openModals.get(message.data.modalId);
        if (modal) {
          openModals.delete(message.data.modalId);
          modal.onClose();
        }
        return;
      }
    }
    return;
  }
};

// src/main.js
var SUPERSCRIPTS = {
  0: "\u2070",
  1: "\xB9",
  2: "\xB2",
  3: "\xB3",
  4: "\u2074",
  5: "\u2075",
  6: "\u2076",
  7: "\u2077",
  8: "\u2078",
  9: "\u2079",
  "+": "\u207A",
  "-": "\u207B",
  "=": "\u207C",
  "(": "\u207D",
  ")": "\u207E",
  "n": "\u207F",
  "i": "\u2071",
  "j": "\u02B2",
  a: "\u1D43",
  b: "\u1D47",
  c: "\u1D9C",
  d: "\u1D48",
  e: "\u1D49",
  f: "\u1DA0",
  g: "\u1D4D",
  h: "\u02B0",
  k: "\u1D4F",
  l: "\u02E1",
  m: "\u1D50",
  o: "\u1D52",
  p: "\u1D56",
  r: "\u02B3",
  s: "\u02E2",
  t: "\u1D57",
  u: "\u1D58",
  v: "\u1D5B",
  w: "\u02B7",
  x: "\u02E3",
  y: "\u02B8",
  z: "\u1DBB"
};
var SUBSCRIPTS = {
  0: "\u2080",
  1: "\u2081",
  2: "\u2082",
  3: "\u2083",
  4: "\u2084",
  5: "\u2085",
  6: "\u2086",
  7: "\u2087",
  8: "\u2088",
  9: "\u2089",
  "+": "\u208A",
  "-": "\u208B",
  "=": "\u208C",
  "(": "\u208D",
  ")": "\u208E",
  a: "\u2090",
  e: "\u2091",
  h: "\u2095",
  i: "\u1D62",
  j: "\u2C7C",
  k: "\u2096",
  l: "\u2097",
  m: "\u2098",
  n: "\u2099",
  o: "\u2092",
  p: "\u209A",
  r: "\u1D63",
  s: "\u209B",
  t: "\u209C",
  u: "\u1D64",
  v: "\u1D65",
  x: "\u2093"
};
var SYMBOLS = {
  "\\alpha": "\u03B1",
  "\\beta": "\u03B2",
  "\\gamma": "\u03B3",
  "\\delta": "\u03B4",
  "\\epsilon": "\u03B5",
  "\\varepsilon": "\u03B5",
  "\\zeta": "\u03B6",
  "\\eta": "\u03B7",
  "\\theta": "\u03B8",
  "\\vartheta": "\u03D1",
  "\\iota": "\u03B9",
  "\\kappa": "\u03BA",
  "\\lambda": "\u03BB",
  "\\mu": "\u03BC",
  "\\nu": "\u03BD",
  "\\xi": "\u03BE",
  "\\pi": "\u03C0",
  "\\varpi": "\u03D6",
  "\\rho": "\u03C1",
  "\\varrho": "\u03F1",
  "\\sigma": "\u03C3",
  "\\varsigma": "\u03C2",
  "\\tau": "\u03C4",
  "\\upsilon": "\u03C5",
  "\\phi": "\u03C6",
  "\\varphi": "\u03C7",
  "\\chi": "\u03C7",
  "\\psi": "\u03C8",
  "\\omega": "\u03C9",
  "\\Gamma": "\u0393",
  "\\Delta": "\u0394",
  "\\Theta": "\u0398",
  "\\Lambda": "\u039B",
  "\\Xi": "\u039E",
  "\\Pi": "\u03A0",
  "\\Sigma": "\u03A3",
  "\\Phi": "\u03A6",
  "\\Psi": "\u03A8",
  "\\Omega": "\u03A9",
  "\\infty": "\u221E",
  "\\partial": "\u2202",
  "\\nabla": "\u2207",
  "\\sum": "\u2211",
  "\\prod": "\u220F",
  "\\int": "\u222B",
  "\\oint": "\u222E",
  "\\iint": "\u222C",
  "\\iiint": "\u222D",
  "\\sqrt": "\u221A",
  "\\times": "\xD7",
  "\\cdot": "\xB7",
  "\\div": "\xF7",
  "\\pm": "\xB1",
  "\\mp": "\u2213",
  "\\approx": "\u2248",
  "\\equiv": "\u2261",
  "\\propto": "\u221D",
  "\\sim": "\u223C",
  "\\neq": "\u2260",
  "\\le": "\u2264",
  "\\ge": "\u2265",
  "\\ll": "\u226A",
  "\\gg": "\u226B",
  "\\to": "\u2192",
  "\\rightarrow": "\u2192",
  "\\leftarrow": "\u2190",
  "\\leftrightarrow": "\u2194",
  "\\Rightarrow": "\u21D2",
  "\\Leftarrow": "\u21D0",
  "\\Leftrightarrow": "\u21D4",
  "\\mapsto": "\u21A6",
  "\\implies": "\u21D2",
  "\\iff": "\u21D4",
  "\\forall": "\u2200",
  "\\exists": "\u2203",
  "\\nexists": "\u2204",
  "\\in": "\u2208",
  "\\notin": "\u2209",
  "\\ni": "\u220B",
  "\\subset": "\u2282",
  "\\supset": "\u2283",
  "\\subseteq": "\u2286",
  "\\supseteq": "\u2287",
  "\\cup": "\u222A",
  "\\cap": "\u2229",
  "\\emptyset": "\u2205",
  "\\varnothing": "\u2205",
  "\\land": "\u2227",
  "\\lor": "\u2228",
  "\\lnot": "\xAC",
  "\\neg": "\xAC",
  "\\top": "\u22A4",
  "\\bot": "\u22A5",
  "\\angle": "\u2220",
  "\\parallel": "\u2225",
  "\\perp": "\u27C2",
  "\\circ": "\u2218",
  "\\hbar": "\u0127",
  "\\ell": "\u2113",
  "\\wp": "\u2118",
  "\\Re": "\u211C",
  "\\Im": "\u2111",
  "\\aleph": "\u2135",
  "\\degree": "\xB0",
  "\\prime": "\u2032",
  "\\dagger": "\u2020",
  "\\ddagger": "\u2021",
  "\\dots": "\u2026",
  "\\cdots": "\u22EF",
  "\\vdots": "\u22EE",
  "\\ddots": "\u22F1",
  "\\therefore": "\u2234",
  "\\because": "\u2235",
  "\\square": "\u25A1",
  "\\Box": "\u25A1",
  "\\triangle": "\u25B3",
  "\\oplus": "\u2295",
  "\\ominus": "\u2296",
  "\\otimes": "\u2297",
  "\\odot": "\u2299",
  "\\oslash": "\u2298",
  "\\star": "\u22C6",
  "\\bigstar": "\u2605"
};
function convertSuperscript(text) {
  return [...text].map((ch) => SUPERSCRIPTS[ch] || ch).join("");
}
function convertSubscript(text) {
  return [...text].map((ch) => SUBSCRIPTS[ch] || ch).join("");
}
function handleFrac(_match, num, den) {
  return "(" + convertFormula(num.trim()) + ")/(" + convertFormula(den.trim()) + ")";
}
function handleSqrt(_match, arg) {
  return "\u221A(" + convertFormula(arg.trim()) + ")";
}
function handleSupSub(text) {
  let result = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "^" && i + 1 < text.length) {
      let sup = "";
      i++;
      if (text[i] === "{") {
        let depth = 1;
        i++;
        while (i < text.length && depth > 0) {
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          if (depth > 0) sup += text[i];
          i++;
        }
      } else {
        sup = text[i];
        i++;
      }
      result += convertSuperscript(convertFormula(sup));
      continue;
    }
    if (text[i] === "_" && i + 1 < text.length) {
      let sub = "";
      i++;
      if (text[i] === "{") {
        let depth = 1;
        i++;
        while (i < text.length && depth > 0) {
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          if (depth > 0) sub += text[i];
          i++;
        }
      } else {
        sub = text[i];
        i++;
      }
      result += convertSubscript(convertFormula(sub));
      continue;
    }
    result += text[i];
    i++;
  }
  return result;
}
function convertFormula(formula) {
  if (!formula) return "";
  formula = formula.replace(/\\\\/g, "\n");
  formula = formula.replace(
    /\\frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    handleFrac
  );
  formula = formula.replace(
    /\\sqrt\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    handleSqrt
  );
  formula = formula.replace(
    /\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (_m, _root, arg) => "\u221A(" + convertFormula(arg.trim()) + ")"
  );
  for (const [tex, unicode] of Object.entries(SYMBOLS)) {
    formula = formula.replace(new RegExp(tex.replace(/\\/g, "\\\\"), "g"), unicode);
  }
  formula = handleSupSub(formula);
  return formula.trim();
}
function transformTokens(tokens) {
  const result = [];
  for (const token of tokens) {
    if (token.type !== "text") {
      result.push(token);
      continue;
    }
    const text = token.value;
    if (!text.includes("$")) {
      result.push(token);
      continue;
    }
    let lastIndex = 0;
    const combinedRegex = /(\$\$([^$]*?)\$\$)|(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g;
    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) result.push({ type: "text", value: before });
      if (match[1]) {
        const formula = convertFormula(match[2] || "");
        result.push({
          type: "block",
          node: {
            tag: "div",
            attrs: { class: "latex-math latex-math-display" },
            text: formula
          }
        });
      } else if (match[3] !== void 0) {
        const formula = convertFormula(match[3] || "");
        result.push({
          type: "inline",
          node: {
            tag: "span",
            attrs: { class: "latex-math latex-math-inline" },
            text: formula
          }
        });
      }
      lastIndex = match.index + match[0].length;
    }
    const after = text.slice(lastIndex);
    if (after) result.push({ type: "text", value: after });
  }
  return result;
}
var LatexPlugin = class extends Plugin {
  async onload() {
    this.registerRichTextTransform((tokens, _context) => transformTokens(tokens));
  }
  async onunload() {
  }
};
//# sourceMappingURL=main.js.map
