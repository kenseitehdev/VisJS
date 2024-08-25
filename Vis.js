function defineCustomElement(tagName, template) {
  class CustomElement extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      const templateElement = document.createElement('template').innerHTML=template;
      shadow.appendChild(templateElement.content.cloneNode(true));
    }
    connectedCallback() {
      bindStateAndEvents(this.shadowRoot);
    }
  }
  customElements.define(tagName, CustomElement);
}
function createCustomElement(tagName) {
  return document.createElement(tagName);
}
function showError(error) {
  const message = error.message || "An unknown error occurred";
const location= error.location ||"";
  const errorInfo = `<span class="errMsg">${message}</span>`;
  let errorModal = document.querySelector('err-modal');
  if (!errorModal) {
    errorModal = createComponent({
      name: 'err-modal',
      data: () => ({
        isVisible: true,
        message: errorInfo,
          location: `Error at ${error.location}`
      }),
      methods: {
        showError(message, stack) {
          this.state.message = message;
          this.state.stack = stack;
          this.state.isVisible = true;
          this.render();
          setTimeout(() => {
            this.state.isVisible = false;
            this.render();
          }, 10000); 
        }
      },
      template: `
        <div id="err" class="error-modal" v-if="isVisible">
          <div class="border">

            <button class="closeBtn" v-on:click="showError('', '')">x</button>
          </div>
          <div class="modal-content">
       <span class="errHeader"> {{ location }}</span><p >{{ message }}</p>
          </div>
        </div>

      `,
      styles: `
        .errMsg{
            font-size:20px;
        }
        .errHeader {
          color: red;
          font-size: 34px;
        }
        .closeBtn {
          position: absolute;
          right: 10px;
          top: 5px;
          background-color: transparent;
          border: none;
          font-size: 1.5rem;
          color: white;
          cursor: pointer;
        }
        .border {
          background-color: red;
          height: 2.6rem;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          box-sizing: border-box;
          z-index: 10;
        }
        .error-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50%;
          max-width: 90%;
          background-color: rgba(9, 0, 5, 0.8);
          color: white;
          border-radius: 15px;
          z-index: 1000;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
          transition: opacity 0.3s ease, transform 0.3s ease;
          overflow: hidden;
          box-sizing: border-box;
          opacity: 1;
          padding: 2.6rem 20px 20px;
        }
        .modal-content {
          background-color: #1a1a1a;
          border-radius: 0 0 15px 15px;
          padding: 20px;
          box-sizing: border-box;
          white-space: pre-wrap;
        }
      `
    });
  }
}
function createApp(location, components) {
  const appRoot = document.getElementById(location);
  if (!appRoot) {
    showError({location:"createApp",message:`Element with ID "${location}" not found`});
    let errorModal = document.querySelector('err-modal');
    if (!errorModal) {
      errorModal = document.createElement('err-modal');
      document.body.appendChild(errorModal);
      bindStateAndEvents(errorModal);
    }
    return;
  }
  components.forEach(({ name }) => {
    const componentElement = document.createElement(name);
    appRoot.appendChild(componentElement);
  });
  return appRoot;
}
const globalRegistry = new Map();
export function registerPackage(name, pkg) {
  globalRegistry.set(name, pkg);
}
export function getPackage(name) {
  return globalRegistry.get(name);
}
function use(name, pkg) {
  pkg ? registerPackage(name, pkg):'';
    return getPackage(name);
}
function manageState(key, initialValue) {
  let storedValue = localStorage.getItem(key);
  let state = storedValue !== null ? JSON.parse(storedValue) : initialValue;
  let subscribers = [];
  const notifySubscribers = () => {
    subscribers.forEach(cb => cb(state));
  };
  const setState = (newState) => {
    state = newState;
    localStorage.setItem(key, JSON.stringify(state)); // Persist state
    notifySubscribers();
  };
  const getState = () => state;
  const subscribe = (cb) => {
    subscribers.push(cb);
    return () => {
      subscribers = subscribers.filter(sub => sub !== cb);
    };
  };
  const stateUpdated = (newState) => {
    state = newState;
    localStorage.setItem(key, JSON.stringify(state)); // Persist state
    notifySubscribers();
  };
  return { setState, getState, subscribe, stateUpdated };
}
function manageEffect(effectCallback, dependencies = []) {
  let previousDependencies = dependencies.map(dep => dep.get());
  let cleanup = null;
const execute = () => {
  cleanup && cleanup();
  cleanup = effectCallback();
};
  const getDependenciesState = () => dependencies.map(dep => dep.get());
  const hasDependenciesChanged = () => {
    const currentDependencies = getDependenciesState();
    return !currentDependencies.every((val, index) => val === previousDependencies[index]);
  };
const checkAndRunEffect = () => {
  hasDependenciesChanged() ? (previousDependencies = getDependenciesState(), execute()) : null;
};
  execute();
  dependencies.forEach(dep => dep.execute(checkAndRunEffect));
  return () => {
    cleanup ? cleanup():'';
    dependencies.forEach(dep => dep.set(null));
  };
}
function manageRef(initialValue) {
  let refValue = initialValue;
  return {
    get: () => refValue,
    set: value => { refValue = value; },
  };
}
function manageMemo(memoCallback, dependencies = []) {
  let memoValue = null;
  let previousDependencies = dependencies.map(dep => dep.get());
  const hasDependenciesChanged = () => {
    const currentDependencies = dependencies.map(dep => dep.get());
    return currentDependencies.length !== previousDependencies.length ||
      currentDependencies.some((val, index) => val !== previousDependencies[index]);
  };
  const updateMemo = () => {
    if (hasDependenciesChanged()) {
      previousDependencies = dependencies.map(dep => dep.get());
      memoValue = memoCallback();
    }
  };
  updateMemo();
  return () => {
    updateMemo();
    return memoValue;
  };
}
function manageCallback(callback, dependencies = []) {
  let previousDependencies = dependencies.map(dep => dep.get());
  const hasDependenciesChanged = () => {
    const currentDependencies = dependencies.map(dep => dep.get());
    return currentDependencies.length !== previousDependencies.length ||
      currentDependencies.some((val, index) => val !== previousDependencies[index]);
  };
  if (hasDependenciesChanged()) {
    previousDependencies = dependencies.map(dep => dep.get());
    return callback;
  }
  return () => {};
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
  cleanupEffects() {
    this.effects.forEach(cleanup => cleanup());
    this.effects = [];
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
    shadowRoot.querySelectorAll('[v-for]').forEach(el => {
      const [item, array] = el.getAttribute('v-for').split(' in ').map(s => s.trim());
      const items = this.state[array] || [];
      const template = el.innerHTML.trim(); 
      el.innerHTML = ''; 
      items.forEach(i => {
        const itemHtml = template.replace(new RegExp(`{{\\s*${item}\\s*}}`, 'g'), i);
        el.insertAdjacentHTML('beforeend', itemHtml);
      });
    });
    shadowRoot.querySelectorAll('[v-if]').forEach(el => {
      const condition = el.getAttribute('v-if');
        console.log(condition);
      el.style.display = this.evaluateCondition(condition) ? 'block' : 'none';
    });
    shadowRoot.querySelectorAll('[v-else]').forEach(el => {
      const prevEl = el.previousElementSibling;
      if (prevEl && prevEl.hasAttribute('v-if')) {
        const condition = prevEl.getAttribute('v-if');
        el.style.display = !this.evaluateCondition(condition) ? 'block' : 'none';
      }
    });
    shadowRoot.querySelectorAll('[v-bind]').forEach(el => {
      const [attr, bind] = el.getAttribute('v-bind').split(':').map(s => s.trim());
      el.setAttribute(attr, this.state[bind]);
    });
    shadowRoot.querySelectorAll('[v-on\\:click]').forEach(el => {
      const handler = el.getAttribute('v-on:click');
      el.addEventListener('click', () => {
        const [fn, args] = handler.split('(');
        if (this[fn]) {
          const parsedArgs = args ? args.replace(')', '').split(',').map(arg => arg.trim()) : [];
          this[fn](...parsedArgs);
        }
      });
    });
  }
  evaluateCondition(condition) {
    try {
      return new Function('return ' + condition).call(this.state);
    } catch (e) {
      this.showError('Error evaluating condition: ' + condition);
      return false;
    }
  }
  showError(message) {
    const shadowRoot = this.shadowRoot;
    const errorElement = shadowRoot.querySelector('.error-modal');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    } else {
      const errorModal = document.createElement('div');
      errorModal.className = 'error-modal';
      errorModal.textContent = message;
      errorModal.style.position = 'fixed';
      errorModal.style.top = '10px';
      errorModal.style.right = '10px';
      errorModal.style.padding = '10px';
      errorModal.style.backgroundColor = 'red';
      errorModal.style.color = 'white';
      errorModal.style.borderRadius = '5px';
      shadowRoot.appendChild(errorModal);
    }
  }
  bindEvents() {
    // This method can be used to attach event listeners
  }
}
class Context {
  constructor(initialState) {
    this.state = initialState;
    this.subscribers = new Set();
  }
  setState(newState) {
    this.state = newState;
    this.notifySubscribers();
  }
  getState() {
    return this.state;
  }
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}
function manageContext({ context, children }) {
  const contextElement = document.createElement('div');
  contextElement.style.display = 'none'; // Hidden context provider
  contextElement.addEventListener('context-update', () => {
    const state = context.getState();
    children.forEach(child => {
      typeof child.update === 'function'? child.update(state):''; 
    });
  });
  document.body.appendChild(contextElement);
  context.subscribe(() => {
    const event = new Event('context-update');
    contextElement.dispatchEvent(event);
  });
  return contextElement;
}
function createComponent(config) {
  const { name, data, template, methods, styles = "" } = config;

  class Component extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = typeof data === 'function' ? data() : { ...data };

      // Bind methods to the component
      for (const key in methods) {
        if (typeof methods[key] === 'function') {
          this[key] = methods[key].bind(this);
        }
      }

      this.render();
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
  container.innerHTML = template.trim(); // Trim to remove extra spaces

  // Replace placeholders with actual state values
  container.innerHTML = container.innerHTML.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    // Access nested state values
    const keys = key.split('.');
    let value = state;
    keys.forEach(k => {
      value = value[k];
    });
    return value !== undefined ? value : match;
  });

  // Process directives recursively
  this.processDirectives(container, state);

  return container.innerHTML;
}
    processDirectives(container, state) {
      // Handle `v-for` first to expand loops
      container.querySelectorAll('[v-for]').forEach(el => this.processVFor(el, state));

      // Handle `v-if`, `v-elif`, and `v-else` next for conditional rendering
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

      // Create a fragment to store generated elements
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

        // Recursively process nested directives within the loop
        this.processDirectives(itemElement, itemScope);

        fragment.appendChild(itemElement);
      });

      // Replace the original element with the processed fragment
      el.replaceWith(fragment);
    }

    processVIfElse(el, state) {
      const vIfAttr = el.getAttribute('v-if');
      const vElifAttr = el.getAttribute('v-elif');
      const vElseAttr = el.getAttribute('v-else');

      // Determine whether to show the element
      let shouldRender = false;
      if (vIfAttr) {
        shouldRender = this.evaluateCondition(vIfAttr, state);
      } else if (vElifAttr) {
        shouldRender = this.evaluateCondition(vElifAttr, state);
      } else if (vElseAttr) {
        // v-else should only render if no previous v-if or v-elif has been true
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
const Effect = { manageEffect, manageMemo, manageCallback };
const State = { manageState, manageRef, manageContext };
const Hook = { State, Effect };
const Component = { createComponent, Hook };
const Vis = { createApp, Component,use };
export { Vis };
