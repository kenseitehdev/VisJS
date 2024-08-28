const defineCustomElement = (tagName, template) => {
  customElements.define(tagName, class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = `<template>${template}</template>`.content.cloneNode(true);
    }
    connectedCallback() {
      bindStateAndEvents(this.shadowRoot);
    }
  });
};
class manageState {
  #state = {};
  #listeners = new Set();
  set(key, value) {
    this.#state[key] = value;
    this.#listeners.forEach(listener => listener(this.#state));
  }
  get(key) {
    return this.#state[key];
  }
  subscribe(listener) {
    this.#listeners.add(listener);
  }
  unsubscribe(listener) {
    this.#listeners.delete(listener);
  }
}
const state = new manageState();
const createApp = (location, components) => {
  const appRoot = document.getElementById(location);
  if (!appRoot) return showError({ location: "createApp", message: `Element with ID "${location}" not found` });
  components.forEach(({ name }) => appRoot.appendChild(document.createElement(name)));
  return appRoot;
};
class CustomComponent extends HTMLElement {
  static observedAttributes = ['data-for', 'data-if', 'data-else', 'data-bind', 'data-on\\:click'];
constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {};
    this.eventListeners = [];
  }
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.lifecycle?.mount?.();
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
      ${this.template}
    `;
    this.applyDirectives();
  }
applyDirectives() {
    const root = this.shadowRoot;
    ['data-for', 'data-if', 'data-else', 'data-bind', 'data-on\\:click'].forEach(attr => {
      root.querySelectorAll(`[${attr}]`).forEach(el => this[`process${attr.replace(/[^a-zA-Z]/g, '')}`]?.(el));
    });
  }
rocessDataFor(el) {
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
  }
  processDataElse(el) {
    const prevEl = el.previousElementSibling;
    if (prevEl && prevEl.hasAttribute('data-if')) {
      el.style.display = !this.evaluateCondition(prevEl.getAttribute('data-if')) ? 'block' : 'none';
    }
  }
  processDataBind(el) {
    const [attr, bind] = el.getAttribute('data-bind').split(':').map(s => s.trim());
    el.setAttribute(attr, this.state[bind]);
  }
  processDataOnClick(el) {
    const handler = el.getAttribute('data-on:click');
    if (this[handler] instanceof Function) el.addEventListener('click', this[handler].bind(this));
  }
  replacePlaceholders(template, scope) {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => this.getNestedValue(key, scope) ?? match);
  }
  evaluateCondition(condition) {
    try {
      const cleanedCondition = condition.replace(/{{|}}/g, '').trim();
      return new Function('scope', `with (scope) { return ${cleanedCondition}; }`)(this.state);
    } catch {
      return false;
    }
  }
  getNestedValue(key, scope) {
    return key.split('.').reduce((acc, part) => acc?.[part], scope);
  }
  bindEvents() {}
  cleanupEffects() {
    this.effects?.forEach(effect => effect.cleanup?.());
    this.effects = [];
  }
}
function createComponent(config) {
  const { name, data, template, methods = {}, styles = "", onMount, onUpdate, onDestroy } = config;
  class Component extends CustomComponent {
    constructor() {
      super();
      this.prevState = { ...this.state };
      this.state = typeof data === 'function' ? data() : { ...data };
      Object.entries(methods).forEach(([key, method]) => {
        if (typeof method === 'function') this[key] = method.bind(this);
        else console.warn(`Method ${key} is not a function and cannot be bound.`);
      });
      this.lifecycle = {
        mount: () => { this.lifecycle.isMounted = true; onMount?.call(this); },
        update: () => { if (this.hasStateChanged()) { this.lifecycle.isUpdated = true; onUpdate?.call(this); } },
        destroy: () => { this.lifecycle.isDestroyed = true; onDestroy?.call(this); },
        isMounted: false,
        isUpdated: false,
        isDestroyed: false
      };
      this.render();
    }
    hasStateChanged() {
      return Object.keys(this.state).some(key => this.state[key] !== this.prevState[key]);
    }
    setState(newState) {
      this.prevState = { ...this.state };
      this.state = { ...this.state, ...newState };       this.render();
    }
      resetUpdateFlag() {
    setTimeout(() => {
      this.lifecycle.isUpdated = false;
    }, 0);
  }
bindEvents(){}
    connectedCallback() {
      this.render();
      this.isMounted=true;
    this.lifecycle.mount();
      this.bindEvents();
    }
    disconnectedCallback() {
      this.lifecycle.destroy();
      this.removeEventListeners();
    }
    removeEventListeners() {
      this.eventListeners?.forEach(({ event, handler }) => this.removeEventListener(event, handler));
      this.eventListeners = [];
    }
    render() {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        ${this.parseTemplate(template, this.state)}
      `;
      this.attachEventListeners();
      this.attachNestedComponents();
      this.lifecycle.update();
    }
    parseTemplate(template, state) {
      const container = document.createElement('div');
      container.innerHTML = template.trim().replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        return this.getNestedValue(key, state) ?? match;
      });
      this.processDirectives(container, state);
      return container.innerHTML;
    }
    processDirectives(container, state) {
      container.querySelectorAll('[data-for]').forEach(el => this.processVFor(el, state));
      container.querySelectorAll('[data-if], [data-elif], [data-else]').forEach(el => this.processVIfElse(el, state));
      container.querySelectorAll('[data-model]').forEach(el => this.processDataModel(el));
    }
    onMount() {
      }
      onUpdate() {
      }
      onDestroy() {
      }
    processDataModel(el) {
      const model = el.getAttribute('data-model');
      if (model in this.state) {
        el.value = this.state[model];
        el.addEventListener('input', () => {
          this.state[model] = el.value;
          this.render();
        });
      }
    }
    processVFor(el, state) {
      const vForAttr = el.getAttribute('data-for');
      if (!vForAttr) return;
      const [itemPart, listName] = vForAttr.split(' in ').map(str => str.trim());
      const [item, index] = itemPart.includes(',')
        ? itemPart.replace(/[()]/g, '').split(',').map(str => str.trim())
        : [itemPart, null];
      const items = state[listName] || [];
      const fragment = document.createDocumentFragment();
      const templateContent = el.cloneNode(true);
      templateContent.removeAttribute('data-for');
      (Array.isArray(items)
        ? items.map((value, idx) => ({ value, index: idx }))
        : Object.entries(items).map(([key, value]) => ({ key, value }))
      ).forEach(({ value, index, key }) => {
        const itemScope = { ...state, [item]: value, ...(index !== undefined ? { [index]: index } : {}), ...(key !== undefined ? { [`${item}Key`]: key } : {}) };
        const itemElement = templateContent.cloneNode(true);
        itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
        this.processDirectives(itemElement, itemScope);
        fragment.appendChild(itemElement);
      });
      el.replaceWith(fragment);
    }
    processVIfElse(el, state) {
      const condition = el.getAttribute('data-if') || el.getAttribute('data-elif') || el.getAttribute('data-else');
      const prevEl = el.previousElementSibling;
      const prevConditionMet = prevEl && (prevEl.hasAttribute('data-if') || prevEl.hasAttribute('data-elif'));
      const shouldRender = condition ? this.evaluateCondition(condition, state) : !prevConditionMet;
      if (!shouldRender) el.remove();
      else el.removeAttribute(condition.startsWith('data-if') ? 'data-if' : condition.startsWith('data-elif') ? 'data-elif' : 'data-else');
    }
    getNestedValue(key, scope) {
      return key.split('.').reduce((acc, part) => acc?.[part], scope);
    }
    replacePlaceholders(template, scope) {
      return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => this.getNestedValue(key, scope) ?? match);
    }
    evaluateCondition(condition, scope) {
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
const use = (plugin, options = {}) => {
    if(installedPlugins.includes(plugin)) {
      console.warn('Plugin is already installed');
      return;
    }
    (typeof plugin.install === 'function') ? plugin.install(Vis, options) : console.warn('Plugin does not have an install method');
    installedPlugins.push(plugin);
  };
const Component = { createComponent };
const App = {createApp, use, state};
const Vis = { App, Component};
export { Vis };
