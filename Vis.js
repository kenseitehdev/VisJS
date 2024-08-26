function defineCustomElement(tagName, template) {
  class CustomElement extends HTMLElement {
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
  }
  customElements.define(tagName, CustomElement);
}
function createApp(location, components) {
  const appRoot = document.getElementById(location);
  if (!appRoot) {
    showError({ location: "createApp", message: `Element with ID "${location}" not found` });
    return;
  }
  components.forEach(({ name }) => {
    const componentElement = document.createElement(name);
    appRoot.appendChild(componentElement);
  });
  return appRoot;
}
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
    this.eventListeners.forEach(({ event, handler }) => {
      this.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
  render() {
    const shadowRoot = this.shadowRoot;
    shadowRoot.innerHTML = `
      <style>
        ${this.styles}
      </style>
      ${this.template}
    `;
    this.applyDirectives();
  }
  applyDirectives() {
    this.shadowRoot.querySelectorAll('[v-for]').forEach(el => {
      this.processVFor(el);
    });
    this.shadowRoot.querySelectorAll('[v-if]').forEach(el => {
      this.applyIf(el);
    });
    this.shadowRoot.querySelectorAll('[v-else]').forEach(el => {
      this.applyElse(el);
    });
    this.shadowRoot.querySelectorAll('[v-bind]').forEach(el => {
      this.applyBind(el);
    });
    this.shadowRoot.querySelectorAll('[v-on\\:click]').forEach(el => {
      this.attachEvent(el, 'click');
    });
  }
  applyIf(el) {
    const condition = el.getAttribute('v-if');
    el.style.display = this.evaluateCondition(condition) ? 'block' : 'none';
  }
  applyElse(el) {
    const prevEl = el.previousElementSibling;
    if (prevEl && prevEl.hasAttribute('v-if')) {
      const condition = prevEl.getAttribute('v-if');
      el.style.display = !this.evaluateCondition(condition) ? 'block' : 'none';
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
      const itemScope = { ...this.state, [item]: itemData };
      if (index !== null) {
        itemScope[index] = idx;
      }
      const itemElement = templateContent.cloneNode(true);
      itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
      this.applyDirectives.call(itemElement, itemScope);
      fragment.appendChild(itemElement);
    });
    el.replaceWith(fragment);
  }
  replacePlaceholders(template, scope) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return scope[key] !== undefined ? scope[key] : '';
    });
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
  bindEvents() {
  }
  cleanupEffects() {
  }
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
        mount: this.mount.bind(this),
        update: this.update.bind(this),
        destroy: this.destroy.bind(this),
      };
      if (methods && typeof methods === 'object') {
        for (const key in methods) {
          if (typeof methods[key] === 'function') {
            this[key] = methods[key].bind(this);
          } else {
            console.warn(`Method ${key} is not a function and cannot be bound.`);
          }
        }
      }
      this.render();
    }
    mount() {
      this.lifecycle.isMounted = true;
      if (typeof onMount === 'function') onMount.call(this);
    }
    update() {
      this.lifecycle.isUpdated = true;
      if (typeof onUpdate === 'function') onUpdate.call(this);
    }
    destroy() {
      this.lifecycle.isDestroyed = true;
      if (typeof onDestroy === 'function') onDestroy.call(this);
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
  bindEvents() {
  }
  cleanupEffects() {
  }
  showError(message) {
    console.error(message);
  }
    render() {
      const parsedTemplate = this.parseTemplate(template, this.state);
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        ${parsedTemplate}
      `;
      this.attachEventListeners();
    }
    parseTemplate(template, state) {
      const container = document.createElement('div');
      container.innerHTML = template.trim();
      container.innerHTML = container.innerHTML.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        const keys = key.split('.');
        let value = state;
        keys.forEach(k => {
          value = value[k];
        });
        return value !== undefined ? value : match;
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
      const [itemPart, listName] = vForAttr.split(' in ').map(str => str.trim());
      const [item, index] = itemPart.includes(',')
        ? itemPart.replace('(', '').replace(')', '').split(',').map(str => str.trim())
        : [itemPart, null];
      const items = state[listName] || [];
      const fragment = document.createDocumentFragment();
      const templateContent = el.cloneNode(true);
      templateContent.removeAttribute('v-for');
      items.forEach((itemData, idx) => {
        const itemScope = { ...state, [item]: itemData };
        if (index !== null) {
          itemScope[index] = idx;
        }
        const itemElement = templateContent.cloneNode(true);
        itemElement.innerHTML = this.replacePlaceholders(itemElement.innerHTML, itemScope).trim();
        this.processDirectives(itemElement, itemScope);
        fragment.appendChild(itemElement);
      });
      el.replaceWith(fragment);
    }
    processVIfElse(el, state) {
      const vIfAttr = el.getAttribute('v-if');
      const vElifAttr = el.getAttribute('v-elif');
      const vElseAttr = el.getAttribute('v-else');
      let shouldRender = false;
      if (vIfAttr) {
        shouldRender = this.evaluateCondition(vIfAttr, state);
      } else if (vElifAttr) {
        shouldRender = this.evaluateCondition(vElifAttr, state);
      } else if (vElseAttr) {
        const prevSiblings = Array.from(el.previousElementSibling ? el.previousElementSibling.parentNode.children : []);
        const prevConditionMet = prevSiblings.some(sibling => sibling.getAttribute('v-if') || sibling.getAttribute('v-elif'));
        shouldRender = !prevConditionMet;
      }
      if (!shouldRender) {
        el.remove();
      } else {
        el.removeAttribute(vIfAttr ? 'v-if' : vElifAttr ? 'v-elif' : 'v-else');
      }
    }
    replacePlaceholders(template, scope) {
      return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        return scope[key] !== undefined ? scope[key] : '';
      });
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
      removeEventListeners(){

      }
    attachEventListeners() {
      this.shadowRoot.querySelectorAll('[v-on\\:click]').forEach(el => {
        const event = el.getAttribute('v-on:click');
        if (this[event] && typeof this[event] === 'function') {
          el.addEventListener('click', this[event]);
        }
      });
    }
  }
  customElements.define(name, Component);
}
const Component = { createComponent };
const Vis = { createApp, Component };
export { Vis };
