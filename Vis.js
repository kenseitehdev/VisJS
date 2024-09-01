const defineCustomElement = (tagName, template) => {
  customElements.define(tagName, class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = `<template>${template}</template>`.content.cloneNode(true);
    }connectedCallback() {
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
  }get(key) {
    return this.#state[key];
  }subscribe(listener) {
    this.#listeners.add(listener);
  }unsubscribe(listener) {
    this.#listeners.delete(listener);
  }
}
const state = new manageState();
function getCdnLinks() {
  const cdnLinks = {
    stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href),
    scripts: Array.from(document.querySelectorAll('script[src]')).map(script => script.src)
  };
  return cdnLinks;
}
function loadStylesheets(shadowRoot, stylesheets) {
  stylesheets.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    shadowRoot.appendChild(link);
  });
}
function loadScripts(shadowRoot, scripts) {
  scripts.forEach(src => {
    if (!loadedResources.scripts.has(src)) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => console.log(`Script ${src} loaded.`);
      script.onerror = (error) => console.error(`Failed to load script ${src}.`, error);
      shadowRoot.appendChild(script);
      loadedResources.scripts.add(src);
    }
  });
}
class CustomComponent extends HTMLElement {
  static observedAttributes = ['data-for', 'data-if', 'data-else', 'data-bind', 'data-on\\:click'];
constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {};
    this.eventListeners = [];
  }connectedCallback() {
    this.render();
    this.bindEvents();
    this.lifecycle?.mount?.();
  }disconnectedCallback() {
    this.lifecycle?.destroy?.();
    this.cleanupEffects();
    this.removeEventListeners();
  }removeEventListeners() {
    this.eventListeners.forEach(({ event, handler }) => this.removeEventListener(event, handler));
    this.eventListeners = [];
  }render() {
    this.shadowRoot.innerHTML = `
      <style>${this.styles}</style>
      ${this.template}
    `;
    this.applyDirectives();
  }applyDirectives() {
    const root = this.shadowRoot;
    ['data-for', 'data-if', 'data-else', 'data-bind', 'data-on\\:click'].forEach(attr => {
      root.querySelectorAll(`[${attr}]`).forEach(el => this[`process${attr.replace(/[^a-zA-Z]/g, '')}`]?.(el));
    });
  }processDataFor(el) {
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
  }bindEvents() {}
  cleanupEffects() {
    this.effects?.forEach(effect => effect.cleanup?.());
    this.effects = [];
  }
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
    }hasStateChanged() {
      return Object.keys(this.state).some(key => this.state[key] !== this.prevState[key]);
    }setState(newState) {
      this.prevState = { ...this.state };
      this.state = { ...this.state, ...newState };       
        this.render();
    }resetUpdateFlag() {
    setTimeout(() => {
      this.lifecycle.isUpdated = false;
    }, 0);
  }bindEvents(){}
    connectedCallback() {
      this.render();
      this.isMounted=true;
    this.lifecycle.mount();
      this.bindEvents();
    }disconnectedCallback() {
      this.lifecycle.destroy();
      this.removeEventListeners();
    }removeEventListeners() {
      this.eventListeners?.forEach(({ event, handler }) => this.removeEventListener(event, handler));
      this.eventListeners = [];
    }
     getGlobalStyles = () => {
  const styleSheets = Array.from(document.styleSheets);
  let globalStyles = '';

  styleSheets.forEach(sheet => {
    try {
      Array.from(sheet.cssRules).forEach(rule => {
        globalStyles += rule.cssText;
      });
    } catch (e) {
      console.warn('Unable to read stylesheet:', e);
    }
  });
  return globalStyles;
}
render() {
        const style = document.createElement('style');
    style.textContent = this.getGlobalStyles();
    this.shadowRoot.appendChild(style);
      this.shadowRoot.innerHTML= `<style>${this.styles}</style>${this.parseTemplate(template, this.state)}`;
      this.attachEventListeners();
      this.attachNestedComponents();
      this.lifecycle.update();
    }parseTemplate(template, state) {
      const container = document.createElement('div');
      container.innerHTML = template.trim().replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        return this.getNestedValue(key, state) ?? match;
      });
      this.processDirectives(container, state);
      return container.innerHTML;
    }processDirectives(container, state) {
      container.querySelectorAll('[data-for]').forEach(el => this.processVFor(el, state));
      container.querySelectorAll('[data-if], [data-elif], [data-else]').forEach(el => this.processVIfElse(el, state));
      container.querySelectorAll('[data-model]').forEach(el => this.processDataModel(el));
    }onMount() {}
      onUpdate() {}
      onDestroy() {}
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
    }processVIfElse(el, state) {
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
  const events = {
    'data-on\\:click': 'click',
    'data-on\\:hover': 'mouseover',
    'data-on\\:change': 'change',
    'data-on\\:mouseMove': 'mousemove',
    'data-on\\:keyPress': 'keypress',
    'data-on\\:focus': 'focus',
    'data-on\\:submit': 'submit'
  };
  for (const [dataAttr, eventType] of Object.entries(events)) {
    this.shadowRoot.querySelectorAll(`[${dataAttr}]`).forEach(el => {
      const handler = el.getAttribute(dataAttr);
      if (this[handler] instanceof Function) {
        el.addEventListener(eventType, this[handler].bind(this));
      }
    });
  }
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
  if (installedPlugins.includes(plugin)) {
    console.warn('Plugin is already installed');
    return;
  }
  if (typeof plugin.install === 'function') {
    try {
      plugin.install(Vis, options);
    } catch (error) {
      showError({ location: 'use', message: error.message });
    }
  } else {
    console.warn('Plugin does not have an install method');
  }
  installedPlugins.push(plugin);
};
const createApp = (location, components) => { 
  const appRoot = document.getElementById(location);
  if (!appRoot) {
    return;
  }components.forEach(({ name }) => {
    try {
      appRoot.appendChild(document.createElement(name));
    } catch (error) {
      showError({ location: "createApp", message: `Failed to create component ${name}: ${error.message}` });
    }
  });
  return appRoot;
};
function sanitize(input) {
   const element = document.createElement('template');
    element.innerText = input;
    return element.innerHTML;  
}
const Security = { sanitize,};
const Component = { createComponent };
const App = { createApp, use, state };
const Vis = { App, Component, Security };
export { Vis };
