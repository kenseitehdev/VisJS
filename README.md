# VisJS

**VisJS** is an ultra-lightweight, robust frontend framework inspired by VueJS, ReactJS, AlpineJS, and Flask. It provides a minimalistic approach to building modern web applications with reactive components and a clear separation of concerns.

## Features

### Directives

- **`v-if`**: Conditionally render elements based on the value of a state.
- **`v-else`**: Render elements as an alternative when `v-if` condition is false.
- **`v-for`**: Render a list of elements based on an array or list from the state.
- **`v-bind`**: Bind dynamic data to attributes, classes, and styles:
  - `data`: Bind text content to an element.
  - `class`: Bind dynamic classes.
  - `style`: Bind inline styles.
- **`v-on`**: Attach event handlers to elements:
  - `click`: Handle click events.
  - `hover`: Handle hover events.

### Hooks

- **`manageState`**: Manage component state with reactivity.
- **`manageEffect`**: Run side effects in response to state changes.
- **`manageRef`**: Manage mutable references to values.
- **`manageMemo`**: Memoize expensive computations based on dependencies.
- **`manageCallback`**: Memoize callback functions based on dependencies.

### Lifecycle

- **`manageCreated`**: Handle component creation.
- **`manageMounted`**: Handle component mounting to the DOM.
- **`manageUpdated`**: Handle component updates.
- **`manageDestroyed`**: Handle component destruction.

### Shadow DOM

VisJS utilizes the Shadow DOM to encapsulate component styles and templates, ensuring they do not interfere with other parts of the application.

## Documentation

### API Reference

#### `defineCustomElement(tagName, template)`

Defines a custom element with the given tag name and template.

- **Parameters:**
  - `tagName`: The name of the custom element.
  - `template`: The HTML template string for the custom element.

#### `createCustomElement(tagName)`

Creates and returns a new custom element instance.

- **Parameters:**
  - `tagName`: The name of the custom element.

#### `createApp(location, components)`

Initializes the application by creating and appending components to the specified location.

- **Parameters:**
  - `location`: The ID of the element where the app will be rendered.
  - `components`: An array of component configurations.

#### `create(template, styling, tagName)`

Creates a new custom element with the provided template and styling.

- **Parameters:**
  - `template`: The HTML template.
  - `styling`: The CSS styling.
  - `tagName`: The name of the custom element.

#### `manageState(initialValue)`

Creates a reactive state with getter, setter, and subscription capabilities.

- **Parameters:**
  - `initialValue`: The initial value of the state.

#### `manageEffect(effectCallback, dependencies)`

Manages side effects based on dependencies.

- **Parameters:**
  - `effectCallback`: The effect callback function.
  - `dependencies`: An array of state dependencies.

#### `manageRef(initialValue)`

Manages mutable references.

- **Parameters:**
  - `initialValue`: The initial value of the reference.

#### `manageMemo(memoCallback, dependencies)`

Memoizes a computation based on dependencies.

- **Parameters:**
  - `memoCallback`: The computation callback.
  - `dependencies`: An array of dependencies.

#### `manageCallback(callback, dependencies)`

Memoizes a callback function based on dependencies.

- **Parameters:**
  - `callback`: The callback function.
  - `dependencies`: An array of dependencies.

#### `manageCreated(component, callback)`

Registers a callback to be executed when the component is created.

- **Parameters:**
  - `component`: The component instance.
  - `callback`: The callback function.

#### `manageMounted(component, callback)`

Registers a callback to be executed when the component is mounted.

- **Parameters:**
  - `component`: The component instance.
  - `callback`: The callback function.

#### `manageUpdated(component, callback)`

Registers a callback to be executed when the component is updated.

- **Parameters:**
  - `component`: The component instance.
  - `callback`: The callback function.

#### `manageDestroyed(component, callback)`

Registers a callback to be executed when the component is destroyed.

- **Parameters:**
  - `component`: The component instance.
  - `callback`: The callback function.

#### `bindStateAndEvents(root)`

Binds state and event handlers to elements within the specified root.

- **Parameters:**
  - `root`: The root element or shadow root.

#### `createComponent(config)`

Creates a new custom component based on the provided configuration.

- **Parameters:**
  - `config`: The component configuration object, including `name`, `data`, `template`, `methods`, and `styles`.

## Get Started

### Installation

Include the `VisJS` script in your HTML file:

```html
<script type="module">
  import { Vis } from './path/to/vis.js';
</script>
```

## Tutorial
### Define a Custom Element
#### Define a custom element with a template and styles:

```javascript
Vis.Component.create({
  name: 'my-component',
  data: () => ({ message: 'Hello, world!' }),
  template: `<div>{{ message }}</div>`,
  styles: `div { color: red; }`,
});
```
### Create an Application
#### Initialize the application and append components:

```javascript
Vis.createApp('app-root', [{ name: 'my-component' }]);
```
### Manage State
#### Use manageState to create a reactive state:

```javascript
const state = Vis.Hook.State.manageState('initial value');
Use Lifecycle Hooks
Register lifecycle hooks for your components:
```

```javascript
Vis.Hook.Lifecycle.manageCreated(myComponent, () => {
  console.log('Component created');
});
```

### Handle Effects and Memoization
#### Use manageEffect and manageMemo for effects and memoization:

```javascript
Vis.Hook.Effect.manageEffect(() => {
  console.log('Effect triggered');
}, [state]);

```

![image](https://github.com/user-attachments/assets/043dadae-d4aa-46d5-a287-7e54dd627e7d)

