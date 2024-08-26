const defineCustomElement = (tagName, template) => {
  customElements.define(tagName, class extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      const templateElement = document.createElement('template');
      templateElement.innerHTML = template;
      shadow.appendChild(templateElement.content.cloneNode(true));
    }
    connectedCallback() {
      bindStateAndEvents(this.shadowRoot);
    }
  });
};
const createApp = (location, components) => {
  const appRoot = document.getElementById(location);
  if (!appRoot) return showError({ location: "createApp", message: `Element with ID "${location}" not found` });
  components.forEach(({ name }) => appRoot.appendChild(document.createElement(name)));
  return appRoot;
};
class CustomComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.lifecycle = {
      mount: this.mount.bind(this),
      update: this.update.bind(this),
      destroy: this.destroy.bind(this),
      isMounted: false,
      isUpdated: false,
      isDestroyed: false
    };
    this.effects = [];
    this.eventListeners = [];
  }
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.lifecycle.mount();
  }
  disconnectedCallback() {
    this.lifecycle.destroy();
    this.cleanupEffects();
    this.removeEventListeners();
  }
  removeEventListeners() {
    this.eventListeners.forEach(({ event, handler }) => this.removeEventListener(event, handler));
    this.eventListeners = [];
  }
  render() {
    const { shadowRoot } = this;
    shadowRoot.innerHTML = `
      <style>${this.styles}</style>
      ${this.template}
    `;
    this.applyDirectives();
  }
  applyDirectives() {
    const { shadowRoot } = this;
    shadowRoot.querySelectorAll('[v-for]').forEach(el => this.processVFor(el));
    shadowRoot.querySelectorAll('[v-if]').forEach(el => this.applyIf(el));
    shadowRoot.querySelectorAll('[v-else]').forEach(el => this.applyElse(el));
    shadowRoot.querySelectorAll('[v-bind]').forEach(el => this.applyBind(el));
    shadowRoot.querySelectorAll('[v-on\\:click]').forEach(el => this.attachEvent(el, 'click'));
  }
  applyIf(el) {
    el.style.display = this.evaluateCondition(el.getAttribute('v-if')) ? 'block' : 'none';
  }
  applyElse(el) {
    const prevEl = el.previousElementSibling;
    if (prevEl && prevEl.hasAttribute('v-if')) {
      el.style.display = !this.evaluateCondition(prevEl.getAttribute('v-if')) ? 'block' : 'none';
    }
  }
  applyBind(el) {
    const [attr, bind] = el.getAttribute('v-bind').split(':').map(s => s.trim());
    el.setAttribute(attr, this.state[bind]);
  }
  attachEvent(el, event) {
    const handler = el.getAttribute(`v-on:${event}`);
    el.addEventListener(event, () => {
      const [fn, args] = handler.split('(');
      if (this[fn]) {
        const parsedArgs = args ? args.replace(')', '').split(',').map(arg => arg.trim()) : [];
        this[fn](...parsedArgs);
      }
    });
  }
  processVFor(el) {
    const vForAttr = el.getAttribute('v-for');
    if (!vForAttr) return;
    const [itemPart, listName] = vForAttr.split(' in ').map(str => str.trim());
    const [item, index] = itemPart.includes(',')
      ? itemPart.replace('(', '').replace(')', '').split(',').map(str => str.trim())
      : [itemPart, null];
    const items = this.state[listName] || [];
    const fragment = document.createDocumentFragment();
    const templateContent = el.cloneNode(true);
    templateContent.removeAttribute('v-for');
    items.forEach((itemData, idx) => {
      const itemScope = { ...this.state, [item]: itemData, ...(index && { [index]: idx }) };
      const itemElement = templateContent.cloneNode(true);
      itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
      this.applyDirectives.call(itemElement, itemScope);
      fragment.appendChild(itemElement);
    });
    el.replaceWith(fragment);
  }
  replacePlaceholders(template, scope) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => scope[key] !== undefined ? scope[key] : '');
  }
  evaluateCondition(condition) {
    try {
      const cleanedCondition = condition.replace(/{{|}}/g, '').trim();
      return new Function('scope', `with (scope) { return ${cleanedCondition}; }`)(this.state);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }
  bindEvents() {}
  cleanupEffects() {}
  showError(message) {
    console.error(message);
  }
}
function createComponent(config) {
  const { name, data, template, methods = {}, styles = "", onMount, onUpdate, onDestroy } = config;
  class Component extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = typeof data === 'function' ? data() : { ...data };
      this.lifecycle = {
        isMounted: false,
        isUpdated: false,
        isDestroyed: false,
        mount: () => { this.lifecycle.isMounted = true; onMount?.call(this); },
        update: () => { this.lifecycle.isUpdated = true; onUpdate?.call(this); },
        destroy: () => { this.lifecycle.isDestroyed = true; onDestroy?.call(this); },
      };
      Object.entries(methods).forEach(([key, method]) => {
        if (typeof method === 'function') this[key] = method.bind(this);
        else console.warn(`Method ${key} is not a function and cannot be bound.`);
      });
      this.render();
    }
    connectedCallback() {
      this.render();
      //this.bindEvents();
      this.lifecycle.mount();
    }
    disconnectedCallback() {
      this.lifecycle.destroy();
      //this.cleanupEffects();
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
      container.querySelectorAll('[v-for]').forEach(el => this.processVFor(el, state));
      container.querySelectorAll('[v-if], [v-elif], [v-else]').forEach(el => this.processVIfElse(el, state));
    }
processVFor(el, state) {
  const vForAttr = el.getAttribute('v-for');
  if (!vForAttr) return;

  // Parse the v-for attribute
  const [itemPart, listName] = vForAttr.split(' in ').map(str => str.trim());
  const [item, index] = itemPart.includes(',')
    ? itemPart.replace(/[()]/g, '').split(',').map(str => str.trim())
    : [itemPart, null];

  // Get the list from state, default to an empty array
  const items = state[listName] || [];

  // Create a fragment to hold the generated content
  const fragment = document.createDocumentFragment();
  const templateContent = el.cloneNode(true);
  templateContent.removeAttribute('v-for');

  // Iterate through the items (array or object)
  (Array.isArray(items)
    ? items.map((value, idx) => ({ value, index: idx })) // For arrays
    : Object.entries(items).map(([key, value]) => ({ key, value }))) // For objects
  .forEach(({ value, index, key }) => {
    // Define the scope for each iteration
    const itemScope = { ...state, [item]: value, ...(index !== undefined ? { [index]: index } : {}), ...(key !== undefined ? { [`${item}Key`]: key } : {}) };

    // Clone and update the template for each item
    const itemElement = templateContent.cloneNode(true);
    itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
    this.processDirectives(itemElement, itemScope);

    // Append the processed element to the fragment
    fragment.appendChild(itemElement);
  });

  // Replace the original element with the new content
  el.replaceWith(fragment);
}
    processVIfElse(el, state) {
      const condition = el.getAttribute('v-if') || el.getAttribute('v-elif') || el.getAttribute('v-else');
      const prevEl = el.previousElementSibling;
      const prevConditionMet = prevEl && (prevEl.hasAttribute('v-if') || prevEl.hasAttribute('v-elif'));
      const shouldRender = condition ? this.evaluateCondition(condition, state) : !prevConditionMet;
      if (!shouldRender) el.remove();
      else el.removeAttribute(condition.startsWith('v-if') ? 'v-if' : condition.startsWith('v-elif') ? 'v-elif' : 'v-else');
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
      this.shadowRoot.querySelectorAll('[v-on\\:click]').forEach(el => {
        const handler = el.getAttribute('v-on:click');
        if (this[handler] instanceof Function) el.addEventListener('click', this[handler]);
      });
    }
  }
  customElements.define(name, Component);
}
const Component = { createComponent };
const Vis = { createApp, Component };
export { Vis };
