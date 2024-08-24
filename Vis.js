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
  bindStateAndEvents(appRoot);
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
function bindStateAndEvents(root) {
  const content = root.shadowRoot || root;
  const ifElements = content.querySelectorAll('[v-if], [v-else]');
  let lastIfElement = null;
  ifElements.forEach(el => {
    if (el.hasAttribute('v-if')) {
      const ifAttr = el.getAttribute('v-if');
      if (ifAttr && window[ifAttr]) {
        const binding = window[ifAttr];
        const updateVisibility = () => {
          if (binding.getState()) {
            el.style.display = 'block';
            if (lastIfElement) {
              lastIfElement.style.display = 'none';
            }
          } else {
            el.style.display = 'none';
          }
        };
        updateVisibility();
        binding.subscribe(updateVisibility);
        lastIfElement = el;
      }
    } else if (el.hasAttribute('v-else')) {
      if (!lastIfElement || lastIfElement.style.display === 'none') {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }
  });
  const forElements = content.querySelectorAll('[v-for]');
  forElements.forEach(el => {
    const forAttr = el.getAttribute('v-for');
    if (forAttr) {
      const [item, items] = forAttr.split(' in ').map(str => str.trim());
      const bindingItems = window[items];
      if (bindingItems) {
        const updateForLoop = () => {
          const itemsArray = bindingItems.getState();
          if (!Array.isArray(itemsArray)) return;
          const container = el;
          if (container) {
            const templateContent = el.cloneNode(true);
            container.innerHTML = ''; 
            itemsArray.forEach((itemValue, index) => {
              const itemElement = templateContent.cloneNode(true);
              itemElement.removeAttribute('v-for');
              itemElement.setAttribute('data-index', index);
              itemElement.innerHTML = itemElement.innerHTML
                .replace(new RegExp(`{{\\s*${item}\\s*}}`, 'g'), itemValue)
                .replace(new RegExp(`{{\\s*${item}.index\\s*}}`, 'g'), index);
              container.appendChild(itemElement);
            });
          } else {
            console.error('Container element is null.');
          }
        };
        updateForLoop();
        bindingItems.subscribe(updateForLoop);
      }
    }
  });
  const bindableElements = content.querySelectorAll('[v-bind\\:data], [v-bind\\:class], [v-bind\\:style], [v-on\\:hover], [v-on\\:click]');
  bindableElements.forEach(el => {
    const bindDataAttr = el.getAttribute('v-bind:data');
    if (bindDataAttr && window[bindDataAttr]) {
      const bindingData = window[bindDataAttr];
      el.textContent = bindingData.getState();
      bindingData.subscribe(() => {
        el.textContent = bindingData.getState();
      });
    }
    const bindClassAttr = el.getAttribute('v-bind:class');
    if (bindClassAttr && window[bindClassAttr]) {
      const bindingClass = window[bindClassAttr];
      el.className = bindingClass.getState();
      bindingClass.subscribe(() => {
        el.className = bindingClass.getState();
      });
    }
    const bindStyleAttr = el.getAttribute('v-bind:style');
    if (bindStyleAttr && window[bindStyleAttr]) {
      const bindingStyle = window[bindStyleAttr];
      el.style.cssText = bindingStyle.getState();
      bindingStyle.subscribe(() => {
        el.style.cssText = bindingStyle.getState();
      });
    }
    const clickAttr = el.getAttribute('v-on:click');
    if (clickAttr && window[clickAttr]) {
      const binding = window[clickAttr];
      el.addEventListener('click', () => {
        binding.setState(binding.getState() + 1);
      });
    }
    const hoverAttr = el.getAttribute('v-on:hover');
    if (hoverAttr && window[hoverAttr]) {
      const binding = window[hoverAttr];
      el.addEventListener('mouseover', () => {
        binding.setState(binding.getState() + 1);
      });
    }
  });
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
  const { name, data, template, methods, dependencies = {}, styles = "" } = config;
  class Component extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = typeof data === 'function' ? data() : { ...data };
    for (const key in methods) {
        if (typeof methods[key] === 'function') this[key] = methods[key].bind(this);
}
      this.render();
    }
    render() {
      const templateString = this.interpolateTemplate(template);
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        ${templateString}
      `;
      this.attachEventListeners();
    }
    interpolateTemplate(template) {
      let interpolated = template.replace(/{{\s*(\w+)\s*}}/g, (match, p1) => {
        return this.state[p1] !== undefined ? this.state[p1] : match;
      });
      interpolated = this.processVIfElse(interpolated);
      interpolated = this.processVFor(interpolated);
      return interpolated;
    }
    processVIfElse(template) {
      return template.replace(/<template v-if="(.*?)">(.*?)<\/template>\s*(<template v-else>(.*?)<\/template>)?/gs, (match, condition, ifContent, _, elseContent) => {
        const conditionValue = this.evaluateCondition(condition);
        return conditionValue ? ifContent : (elseContent || '');
      });
    }
    evaluateCondition(condition) {
      try {
        return new Function('state', `with (state) { return ${condition}; }`)(this.state);
      } catch {
        return false;
      }
    }
    processVFor(template) {
      const container = document.createElement('div');
      container.innerHTML = template;
      const vForElements = container.querySelectorAll('[v-for]');
      vForElements.forEach(el => {
        const vForAttr = el.getAttribute('v-for');
        if (vForAttr) {
          const [item, listName] = vForAttr.split(' in ').map(str => str.trim());
          const items = this.state[listName] || [];
          const templateContent = el.innerHTML.trim();
          el.innerHTML = '';
          items.forEach(itemData => {
            const itemScope = { ...itemData, [item]: itemData };
            const itemHtml = templateContent.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
              return itemScope[key] !== undefined ? itemScope[key] : '';
            });
            el.insertAdjacentHTML('beforeend', itemHtml);
          });
        }
      });
      return container.innerHTML;
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
