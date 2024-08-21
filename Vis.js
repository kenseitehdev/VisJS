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
function createCustomElement(tagName) {
  return document.createElement(tagName);
}
function createApp(location, components) {
  const appRoot = document.getElementById(location);
  if (!appRoot) {
    console.error(`Element with ID ${location} not found.`);
    return;
  }

  components.forEach(({ name }) => {
    const componentElement = createCustomElement(name);
    appRoot.appendChild(componentElement);
  });
  bindStateAndEvents(appRoot);
  return appRoot;
}
function update (){
  console.log("update");
}
function manageState(initialValue) {
  let state = initialValue;
  let subscribers = [];
  const setState = (newState) => {
    state = newState;
    subscribers.forEach(cb => cb());
  };
  const getState = () => state;
  const subscribe = (cb) => {
    subscribers.push(cb);
  };
  return { setState, getState, subscribe };
}
function manageEffect(effectCallback, dependencies = []) {
  let previousDependencies = dependencies.map(dep => dep.getState());
  let cleanup = null;
  const runEffect = () => {
    if (cleanup) cleanup();
    cleanup = effectCallback();
  };
  const getDependenciesState = () => dependencies.map(dep => dep.getState());
  const hasDependenciesChanged = () => {
    const currentDependencies = getDependenciesState();
    return !currentDependencies.every((val, index) => val === previousDependencies[index]);
  };
  const checkAndRunEffect = () => {
    if (hasDependenciesChanged()) {
      previousDependencies = getDependenciesState();
      runEffect();
    }
  };
  runEffect();
  dependencies.forEach(dep => dep.subscribe(checkAndRunEffect));
  return () => {
    if (cleanup) cleanup();
    dependencies.forEach(dep => dep.unsubscribe(checkAndRunEffect));
  };
}
function manageRef(initialValue) {
  let refValue = initialValue;
  return {
    get: () => refValue,
    set: (value) => { refValue = value; },
  };
}
function manageMemo(memoCallback, dependencies = []) {
  let memoValue = null;
  let previousDependencies = [];
  const hasDependenciesChanged = () => {
    return !dependencies.every((dep, index) => dep === previousDependencies[index]);
  };
  const updateMemo = () => {
    if (hasDependenciesChanged()) {
      previousDependencies = dependencies.slice();
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
  let memoCallback = callback;
  let previousDependencies = [];
  const hasDependenciesChanged = () => {
    if (dependencies.length !== previousDependencies.length) {
      return true;
    }
    return dependencies.some((dep, index) => dep !== previousDependencies[index]);
  };
  if (hasDependenciesChanged()) {
    previousDependencies = [...dependencies]; 
    memoCallback = callback;
  }
  return memoCallback;
}
function manageCreated(component, callback) {
    component.lifecycle.created.push(callback);
    if (!component.hasBeenCreated) {
        component.hasBeenCreated = true;
        component.lifecycle.created.forEach(fn => fn.call(component));
    }
}
function manageMounted(component, callback) {
    component.lifecycle.mounted.push(callback);
    if (component.isMounted) {
        callback.call(component);
    }
}
function manageUpdated(component, callback) {
    component.lifecycle.updated.push(callback);
    if (component.isUpdated) {
        callback.call(component);
    }
}
function manageDestroyed(component, callback) {
    component.lifecycle.destroyed.push(callback);
    if (component.isDestroyed) {
        callback.call(component);
    }
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
                .replace(new RegExp(`{{\\s*${item}
.index\\s*}}`, 'g'), index);
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
  }
  connectedCallback() {
    this.render();
    this.bindEvents();
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
  }
}
function createComponent(config) {
  const { name, data, template, methods,dependencies = {}, styles = "" } = config;
  class Component extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = typeof data === 'function' ? data() : { ...data };
      for (const key in methods) {
        if (methods.hasOwnProperty(key)) {
          this[key] = methods[key].bind(this);
        }
      }
      this.render();
    }
    render() {
      const templateString = this.interpolateTemplate(template);
      this.shadowRoot.innerHTML= `
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
const State={
  manageState,
  manageRef
}
const Effect={
  manageEffect,
  manageMemo,
  manageCallback,
}
const Lifecycle={
  manageCreated,
  manageMounted,
  manageUpdated,
  manageDestroyed
}
const Hook={
  State,
  Effect,
  Lifecycle
}
const Component = {
  createComponent,
  render: (component) => component.tagName,
  update,
  Hook
};
const Vis = {
  createApp,
  Component,
};
export {Vis};
