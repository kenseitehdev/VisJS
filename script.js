import {Vis} from "./Vis.js";

Vis.Component.createComponent({
  name: 'counter-component',
  data: () => ({
    counterState: 0,
  }),
  methods: {
    increment() {
      this.state.counterState++;
      this.render();
    }
  },
  template: `
<div class="button-container">
  <button class="button" data-on:click="increment">Count: {{ counterState }}</button>
</div>
  `,
  styles: `
.button-container {
  display: flex;
  justify-content: center; /* Horizontal alignment */
}
.button {
  padding: 15px 30px;
  border: 2px solid royalblue;
  border-radius: 5px;
  background-color: royalblue;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: block; /* Ensure the button behaves as a block element */
  margin: 30px; /* Adjust margin if needed */
  transition: background-color 0.3s ease, border 0.3s ease, color 0.3s ease;
}
.button:hover {
  background-color: darkblue;
}
  `
});
Vis.Component.createComponent({
  name: 'todo-list',
  data: () => ({
    todoList: [
      { id: 1, text: "cleanupEffects in lifecycle functionality", done: false },
      { id: 2, text: "Error Handling functionality", done: false },
      { id: 3, text: "data-model functionality", done: false },
      { id: 4, text: "data-on:mouseMove functionality", done: false },
      { id: 5, text: "data-on:keypress functionality", done: false },
      { id: 6, text: "Add error modal and handling", done: false },
      { id: 7, text: "Implement input sanitization", done: false },
      { id: 8, text: "Implement Integrated XSS Protection", done: false },
      { id: 9, text: "Implement CSP (Content Security Policy)", done: false },
      { id: 10, text: "Cross-platform native support", done: false },
      { id: 11, text: "Add VDOM to ShadowDOM", done: false },
      { id: 12, text: "Module for remote, data cascading client update requests", done: false }
    ],
    newTodo: ""
  }),
  methods: {
    onMount() {
      this.isMounted ? console.log("mounted") : console.log("not mounted");
    },
      onUpdate(){
          this.render();
      },
addTodo(event) {
    event.preventDefault();
    try {
        const form = event.target;
        const inputField = form.querySelector('input[id="inputTodo"]');
        const newTodoText = inputField.value.trim();
        console.log(`new item : ${newTodoText}`);
        if (newTodoText) {
            this.state.todoList.push({
                id: this.state.todoList.length + 1,
                text: newTodoText,
                done: false
            });
            console.log(this.state.todoList);
            this.state.newTodo = "";
            inputField.value = "";
            this.render();
            
        } else {
            console.log(`input element value : ${newTodoText}`);
            console.error("Input element is empty or not found.");
        }
    } catch (e) {
        console.error(e);
    }
},
toggleTodo(event) {
  const id = event.target.dataset.id;
  if (id) {
    const todo = this.state.todoList.find(item => item.id === parseInt(id, 10));
    if (todo) {
      todo.done = !todo.done;
      this.render();
    } else {
      console.error(`Item with ID ${id} not found in todoList`);
    }
  } else {
    console.error('ID is undefined');
  }
},
 deleteTodo(event) {
      const id = event.target.dataset.id;
      if (id) {
        const index = this.state.todoList.findIndex(item => item.id === parseInt(id, 10));
        if (index !== -1) {
          this.state.todoList.splice(index, 1);
          console.log(`Deleted item with ID ${id}`);
          this.render();
        } else {
          console.error(`Item with ID ${id} not found in todoList`);
        }
      } else {
        console.error('ID is undefined');
      }
    },
    showAllTodos() {
      this.state.filter = 'all';
      this.render();
    },
    showActiveTodos() {
      this.state.filter = 'active';
      this.render();
    },
    showCompletedTodos() {
      this.state.filter = 'completed';
      this.render();
    },
    handleInputChange(event) {
      console.log('Input change event:', event);
      this.state.newTodo = event.target.value;
    },
handleInputChange(event) {
      console.log('Input change event:', event);
      this.state.newTodo = event.target.value;
    }
  },
  template: `
    <div class="todo-container">
      <h2>To-Do List</h2>
      <div class="input-container">
        <form data-on:submit="addTodo">
          <input id="inputTodo" type="text"  placeholder="Add a new task"/>
          <button type="submit">Add</button>
        </form>
      </div>
      <ul class="todo-list">
    <li class="todo-item" data-for="(todo, index) in todoList" :key="todo.id">
    {{ todo.id  }}.       <input type="checkbox" data-id="{{ todo.id }}" data-if="{{ todo.done }}" checked data-on:click="toggleTodo" /> 
          <input type="checkbox" data-id="{{ todo.id }}"  data-else data-on:click="toggleTodo" /> 
          <span :class="{ 'done': todo.done }">{{ todo.text }}</span>
          <button data-on:click="() => deleteTodo(index)" class="delete-button">Delete</button>
        </li>
      </ul>
    </div>
  `,
  styles: `
    form {
        width: 100%;
    }
    .todo-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 16px;
      font-family: Arial, sans-serif;
    }
    h2 {
      margin-top: 0;
    }
    .input-container {
      display: flex;
      margin-bottom: 16px;
      width: 100%;
    }
    input[type="text"] {
      width: 80%;
      padding: 8px 0;
      margin-right: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    .todo-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    .todo-item {
      display: flex;
      align-items: center;
      padding: 8px;
      margin-bottom: 4px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f9f9f9;
    }
    .todo-item input[type="checkbox"] {
      margin-right: 8px;
    }
    .todo-item span.done {
      text-decoration: line-through;
      color: #999;
    }
    .delete-button {
      margin-left: auto;
      background-color: #dc3545;
    }
    .delete-button:hover {
      background-color: #c82333;
    }
  `
});
Vis.Component.createComponent({
  name: 'message-component',
  data: () => ({
    showAlert: true,
  }),
  methods: {
    handleStartClick() {
      alert('Button clicked!');
    },
    toggleAlert() {
      const additionalContent = this.shadowRoot.querySelector('.additional-content');
      if (additionalContent.style.display === 'none') {
        additionalContent.style.display = 'block';
      } else {
        additionalContent.style.display = 'none';
      }
    },
    showDetails() {
      alert('Details shown!');
    }
  },
  template: `
    <div class="container">
      <div class="logo">
       
    <svg width="500" height="500" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <style>
            .background { fill: white; opacity: 0.2; }
            .icon { fill: royalblue; }
            .accent { fill: darkblue; }
          </style>
          <circle cx="50" cy="50" r="50" class="background" />
          <path class="icon" d="M25 25 L50 75 L75 25 Z" />
          <path class="accent" d="M25 25 L50 50 L75 25 Z" />
        </svg>
      </div>
      <div class="title">Welcome to Your Vis.js App</div>
      <div class="description">Edit <code> src/app.js </code> to start</div>
      <div class="btn-group my-2">
        <button class="button" data-on:click="handleStartClick">Get Started</button>
        <button class="button" data-on:click="handleStartClick">Read the Docs</button>
        <button class="button" data-on:click="handleStartClick">Ecosystem</button>
        <button class="button" data-on:click="handleStartClick">Examples</button>
      </div>
      <counter-component></counter-component>
      </div>
    <todo-list></todo-list>
    </div>
  `,
  styles: `
    ul{
        list-style:none;
    }
    .container .logo{
        display:flex;
        justify-content:center;
        align-items:center;
    }
    .container .description{

        display:flex;
        justify-content:center;
        align-items:center;
    }
    .container .title{
      justify-content:flex-start;
        align-items:center;
        text-align:center;
      margin:auto;
      padding:0px;
    }
    .title {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
      color: royalblue;
    }
    .description {
      font-size: 20px;
      color: #666;
    }
    .btn-group {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .button {
      padding: 15px 30px;
      border: 2px solid royalblue;
      border-radius: 5px;
      background-color: royalblue;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin: 30px 20px;
      transition: background-color 0.3s ease, border 0.3s ease, color 0.3s ease;
    }
    .button:hover {
      background-color: darkblue;
    }
    .button-outline {
      padding: 8px 16px;
      border: 2px solid royalblue;
      border-radius: 5px;
      color: royalblue;
      background-color: white;
      font-size: 16px;
      cursor: pointer;
      margin: 20px 0;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .button-outline:hover {
      background-color: royalblue;
      color: white;
    }
code{
    margin:20px;
}
  `
});

Vis.Component.createComponent({
  name: 'app-component',
  data: () => ({
    messageState: {}
  }),
  methods: {
    navigate(event, path) {
      event.preventDefault();
    },
    toggleNavbar() {
      const menu = document.querySelector('.navbar-menu');
      if (menu) {
        menu.classList.toggle('active');
      }
    }
  },
  template: `
    <div>
      <nav class="navbar">
        <div class="navbar-container">
          <div class="navbar-logo">
            <a href="/" @click="navigate($event, '/')">
              <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <style>
                  svg {
                    margin-left: 10px; 
                    margin-right: 10px;
                  }
                  .background { fill: white; opacity: 0.2; } /* 20% opacity */
                  .icon { fill: royalblue; } /* Royal Blue */
                  .accent { fill: darkblue; } /* Dark Blue */
                </style>
                <!-- Background Circle -->
                <circle cx="50" cy="50" r="50" class="background" />
                <!-- Main Icon: Enlarged Simplified V -->
                <path class="icon" d="M25 25 L50 75 L75 25 Z" />
                <!-- Accent Lines -->
                <path class="accent" d="M25 25 L50 50 L75 25 Z" />
              </svg>
              VisJS
            </a>
          </div>
          <ul class="navbar-menu">
            <li><a href="/" @click="navigate($event, '/')">Home</a></li>
            <li><a href="/about" @click="navigate($event, '/about')">About</a></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle">Services</a>
              <ul class="dropdown-menu">
                <li><a href="/service1" >Service 1</a></li>
                <li><a href="/service2" >Service 2</a></li>
                <li><a href="/service3" >Service 3</a></li>
              </ul>
            </li>
            <li><a href="/contact">Contact</a></li>
          </ul>
          <button id="navbar-menu" class="navbar-toggle" @click="toggleNavbar">☰</button>
        </div>
      </nav>
      <message-component :data="messageState"></message-component>

    </div>
  `,
  styles: `
    .navbar {
      background-color: RoyalBlue; /* Royal Blue */
      color: white;
      padding: 10px 20px;
      position: relative;
    }
    .navbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .navbar-logo a {
      color: white;
      text-decoration: none;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
    }
    .navbar-logo img {
      height: 30px;
      margin-right: 10px;
    }
    .navbar-menu {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .navbar-menu li {
      position: relative;
    }
    .navbar-menu a {
      color: white;
      text-decoration: none;
      padding: 10px 15px;
      display: block;
      transition: background-color 0.3s, color 0.3s;
    }
    .navbar-menu a:hover,
    .navbar-menu a.active {
      background-color: DarkBlue; /* Dark Blue */
      color: #fff;
      border-radius: 5px;
    }
    /* Dropdown Menu */
    .dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background-color: royalblue; /* Royal Blue */
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .dropdown-menu li {
      padding: 0;
    }
    .dropdown-menu a {
      padding: 10px 15px;
      display: block;
    }
    .dropdown:hover .dropdown-menu {
      display: block;
    }
    /* Responsive Navbar */
    .navbar-toggle {
      display: none;
      font-size: 24px;
      background: none;
      border: none;
      color: white;
    }
    @media (max-width: 768px) {
      .navbar-menu {
        display: none;
        flex-direction: column;
        width: 100%!important;
      }
      .navbar-menu.active {
        display: flex;
      }
      .navbar-toggle {
        display: block;
      }
    }
  `
});
const appComponent = { name: 'app-component' };
Vis.App.createApp('app', [appComponent]);
function toggleNavbar() {
  const menu = document.getElementById('navbar-menu');
  menu.classList.toggle('active');
}
