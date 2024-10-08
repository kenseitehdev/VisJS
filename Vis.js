class manageState {
  #state = {};
  #listeners = new Set();
  set(key, value) {
    this.#state[key] = value;
    this.#listeners.forEach(listener => listener(this.#state));
  }get(key) {
    return this.#state[key];
  }subscribe(listener) {
    this.#listeners.add(listener);
  }unsubscribe(listener) {
    this.#listeners.delete(listener);
  }
}
const state = new manageState();
class CustomComponent extends HTMLElement {
  static observedAttributes = ['data-for', 'data-if', 'data-else', 'data-bind', 'data-on\\:click'];
static cdns = '';
  static cdnsLoaded = false;
  static cdnsLoadPromise = null;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {};
    this.eventListeners = [];
      plugins.forEach(plugin => plugin(this));
  }
async connectedCallback() {
    const style = document.createElement('style');
    style.textContent = CustomComponent.cdns;
    this.shadowRoot.appendChild(style);
    this.render();
    if (this.lifecycle?.mount) {
      this.lifecycle.mount();
    }
  }
 disconnectedCallback() {
    this.lifecycle?.destroy?.();
    this.cleanupEffects();
    this.removeEventListeners();
  }
  removeEventListeners() {
    this.eventListeners.forEach(({ event, handler }) => this.removeEventListener(event, handler));
    this.eventListeners = [];
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.styles}</style>
      ${this.template}`;
    this.applyDirectives();
  }
    processDataFor(el) {
    const [itemPart, listName] = el.getAttribute('data-for').split(' in ').map(str => str.trim());
    const [item, index] = itemPart.includes(',') ? itemPart.split(',').map(str => str.trim()) : [itemPart, null];
    const items = this.state[listName] || [];
    const fragment = document.createDocumentFragment();
    const templateContent = el.cloneNode(true);
    templateContent.removeAttribute('data-for');
    items.forEach((itemData, idx) => {
      const itemScope = { ...this.state, [item]: itemData, ...(index ? { [index]: idx } : {}) };
      const itemElement = templateContent.cloneNode(true);
      itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
      this.applyDirectives.call(itemElement, itemScope);
      fragment.appendChild(itemElement);
    });
    el.replaceWith(fragment);
  }
  processDataIf(el) {
    el.style.display = this.evaluateCondition(el.getAttribute('data-if')) ? 'block' : 'none';
  }processDataElse(el) {
    const prevEl = el.previousElementSibling;
    if (prevEl && prevEl.hasAttribute('data-if')) {
      el.style.display = !this.evaluateCondition(prevEl.getAttribute('data-if')) ? 'block' : 'none';
    }
  }processDataBind(el) {
    const [attr, bind] = el.getAttribute('data-bind').split(':').map(s => s.trim());
    el.setAttribute(attr, this.state[bind]);
  }processDataOnClick(el) {
    const handler = el.getAttribute('data-on:click');
    if (this[handler] instanceof Function) el.addEventListener('click', this[handler].bind(this));
  }replacePlaceholders(template, scope) {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => this.getNestedValue(key, scope) ?? match);
  }evaluateCondition(condition) {
    try {
      const cleanedCondition = condition.replace(/{{|}}/g, '').trim();
      return new Function('scope', `with (scope) { return ${cleanedCondition}; }`)(this.state);
    } catch {
      return false;
    }
  }getNestedValue(key, scope) {
    return key.split('.').reduce((acc, part) => acc?.[part], scope);
  }cleanupEffects() {
    this.effects?.forEach(effect => effect.cleanup?.());
    this.effects = [];
  }
}
function getAndRemoveCDNs() {
    const cdnResources = {
        css: [],
        js: []
    };
    const links = document.querySelectorAll('link');
    const scripts = document.querySelectorAll('script');
    links.forEach(link => {
        const rel = link.getAttribute('rel');
        const href = link.getAttribute('href');
        if (rel === 'stylesheet' && href && !href.includes('style.css')) {
            cdnResources.css.push(href);
        }
    });
    scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.includes('app.js') && !src.includes('script.js')) {
            cdnResources.js.push(src);
        }
    });
    return cdnResources;
}
function createComponent(config) {
  const { name, data, template, methods = {}, styles = "", onMount, onUpdate, onDestroy } = config;
  class Component extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
        this.prevState = { ...this.state };
        this.styles=styles;
      this.state = typeof data === 'function' ? data() : { ...data };
      this.methods=methods;
        this.template = sanitize(this.template);
      this.lifecycle = {
        isMounted: false,
        isUpdated: false,
        isDestroyed: false,
        mount: () => { this.lifecycle.isMounted = true; this.methods.onMount?.call(this); },
update: () => { 
          const hasChanges = this.hasStateChanged();
          this.lifecycle.isUpdated = hasChanges;
          hasChanges ? this.methods.onUpdate : "";
        },
        destroy: () => { this.lifecycle.isDestroyed = true; onDestroy?.call(this); },
      };
      Object.entries(methods).forEach(([key, method]) => {
        (typeof method === 'function') ? this[key] = method.bind(this) : console.warn(`Method ${key} is not a function and cannot be bound.`);
      });
      this.render();
    }
      hasStateChanged() {
      return Object.keys(this.state).some(key => this.state[key] !== this.prevState[key]);
    }setState(newState) {
      this.prevState = { ...this.state };
      this.state = { ...this.state, ...newState };       
        this.render();
    }
async connectedCallback() {
    this.classList.add('hidden');
    const style = document.createElement('style');
    style.textContent = CustomComponent.cdns;
    this.shadowRoot.appendChild(style);
    this.classList.remove('hidden');
    if (this.lifecycle?.mount) {
        this.lifecycle.mount();
    }
}
async render() {
    const cdnLists = getAndRemoveCDNs();
    this.shadowRoot.innerHTML = '';
    const cssPromises = cdnLists.css
        .filter(url => url.endsWith('.css'))
        .map(url =>
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch CSS: ${url}`);
                    return response.text();
                })
                .catch(error => {
                    console.error(`Failed to fetch CSS from ${url}:`, error);
                    return '';
                })
        );
    const cssResults = await Promise.all(cssPromises);
    cssResults.forEach(css => {
        if (css) { 
            const style = document.createElement('style');
            style.textContent = css;
            this.shadowRoot.appendChild(style);
        }
    });
    const jsPromises = cdnLists.js
        .filter(url => url.endsWith('.js')) 
        .map(url =>
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch JS: ${url}`);
                    return response.text();
                })
                .then(scriptContent => {
                    const script = document.createElement('script');
                    script.textContent = scriptContent;
                    document.head.appendChild(script);
                })
                .catch(error => {
                    console.error(`Failed to fetch JS from ${url}:`, error);
                })
        );
    await Promise.all(jsPromises);
    this.shadowRoot.innerHTML += `<style>${this.styles}</style>${this.parseTemplate(template, this.state)}`;
    this.attachEventListeners();
    this.attachNestedComponents();
    if (this.lifecycle && this.lifecycle.update) {
        this.lifecycle.update();
    }
}
    parseTemplate(template, state) {
      const container = document.createElement('div');
      container.innerHTML = template.trim().replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        return this.getNestedValue(key, state) ?? match;
      });
      this.processDirectives(container, state);
      return container.innerHTML;
    }processDirectives(container, state) {
      container.querySelectorAll('[data-for]').forEach(el => this.processDataFor(el, state));
      container.querySelectorAll('[data-if], [data-elif], [data-else]').forEach(el => this.processDataIfElse(el, state));
      container.querySelectorAll('[data-model]').forEach(el => this.processDataModel(el));
    }
    processDataModel(el) {
      const model = el.getAttribute('data-model');
      if (model in this.state) {
        el.value = this.state[model];
        el.addEventListener('input', () => {
          this.state[model] = el.value;
        });
      }
    }
    processDataFor(el, state) {
      const vForAttr = el.getAttribute('data-for');
      if (!vForAttr) return;
      const [itemPart, listName] = vForAttr.split(' in ').map(str => str.trim());
      const [item, index] = itemPart.includes(',') ? itemPart.replace(/[()]/g, '').split(',').map(str => str.trim()) : [itemPart, null];
      const items = state[listName] || [];
      const fragment = document.createDocumentFragment();
      const templateContent = el.cloneNode(true);
      templateContent.removeAttribute('data-for');
      (Array.isArray(items) ? items.map((value, idx) => ({ value, index: idx })) : Object.entries(items).map(([key, value]) => ({ key, value }))).forEach(({ value, index, key }) => {
        const itemScope = { ...state, [item]: value, ...(index !== undefined ? { [index]: index } : {}), ...(key !== undefined ? { [`${item}Key`]: key } : {}) };
        const itemElement = templateContent.cloneNode(true);
        itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
        this.processDirectives(itemElement, itemScope);
        fragment.appendChild(itemElement);
      });
      el.replaceWith(fragment);
    }processDataIfElse(el, state) {
      const condition = el.getAttribute('data-if') || el.getAttribute('data-elif') || el.getAttribute('data-else');
      const prevEl = el.previousElementSibling;
      const prevConditionMet = prevEl && (prevEl.hasAttribute('data-if') || prevEl.hasAttribute('data-elif'));
      const shouldRender = condition ? this.evaluateCondition(condition, state) : !prevConditionMet;
      if (!shouldRender) el.remove();
      else el.removeAttribute(condition.startsWith('data-if') ? 'data-if' : condition.startsWith('data-elif') ? 'data-elif' : 'data-else');
    }getNestedValue(key, scope) {
      return key.split('.').reduce((acc, part) => acc?.[part], scope);
    }replacePlaceholders(template, scope) {
      return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => this.getNestedValue(key, scope) ?? match);
    }evaluateCondition(condition, scope) {
      try {
        const cleanedCondition = condition.replace(/{{|}}/g, '').trim();
        return new Function('scope', `with (scope) { return ${cleanedCondition}; }`)(scope);
      } catch (error) {
        console.error('Error evaluating condition:', error);
        return false;
      }
    }
attachEventListeners() {
      this.shadowRoot.querySelectorAll('[data-on\\:click]').forEach(el => {
        const handler = el.getAttribute('data-on:click');
        if (this[handler] instanceof Function) el.addEventListener('click', this[handler].bind(this));
      });
      this.shadowRoot.querySelectorAll('[data-on\\:hover]').forEach(el => {
        const handler = el.getAttribute('data-on:hover');
        if (this[handler] instanceof Function) el.addEventListener('mouseover', this[handler].bind(this));
      });
      this.shadowRoot.querySelectorAll('[data-on\\:change]').forEach(el => {
        const handler = el.getAttribute('data-on:change');
        if (this[handler] instanceof Function) el.addEventListener('change', this[handler].bind(this));
      });
        this.shadowRoot.querySelectorAll('[data-on\\:mouseMove]').forEach(el => {
    const handler = el.getAttribute('data-on:mouseMove');
    if (this[handler] instanceof Function) el.addEventListener('mousemove', this[handler].bind(this));
  });
  this.shadowRoot.querySelectorAll('[data-on\\:keyPress]').forEach(el => {
    const handler = el.getAttribute('data-on:keyPress');
    if (this[handler] instanceof Function) el.addEventListener('keypress', this[handler].bind(this));
  });
  this.shadowRoot.querySelectorAll('[data-on\\:focus]').forEach(el => {
    const handler = el.getAttribute('data-on:focus');
    if (this[handler] instanceof Function) el.addEventListener('focus', this[handler].bind(this));
  });
      this.shadowRoot.querySelectorAll('[data-on\\:submit]').forEach(el => {
        const handler = el.getAttribute('data-on:submit');
        if (this[handler] instanceof Function) el.addEventListener('submit', this[handler].bind(this));
      });
    }
      attachNestedComponents() {
      this.shadowRoot.querySelectorAll('[data-component]').forEach(el => {
        const componentName = el.getAttribute('data-component');
        const ComponentClass = customElements.get(componentName);
        if (ComponentClass) {
          const componentInstance = new ComponentClass();
          componentInstance.state = this.state;
          el.appendChild(componentInstance);
        }
      });
    }
  }
  customElements.define(name, Component);
}
const createApp = (location, components) => { 
  const appRoot = document.getElementById(location);
  if (!appRoot) return;
    components.forEach(({ name }) => {
    try {
      appRoot.appendChild(document.createElement(name));
      appRoot.stateManager = state;
    } catch (error) {
    console.error(error);
    }
  });
  return appRoot;
};
const plugins = [];
function use(plugin) {
  if (typeof plugin === 'function') {
    plugins.push(plugin);
  } else {
    console.warn('Plugin should be a function');
  }
}
function sanitize(input) {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}
const Vis={App:{createApp,use},Component:{createComponent},Security:{sanitize,}};
export { Vis };
