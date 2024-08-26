import {Vis} from "./Vis.js";

Vis.Component.createComponent({
  name: 'counter-component',
  data: () => ({
    counterState: 0,
  }),
  methods: {
    increment() {
      this.state.counterState++;
      this.render(); // Trigger re-render after state change
    }
  },
  template: `
<div class="button-container">
  <button class="button" v-on:click="increment">Count: {{ counterState }}</button>
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
      { text: "Refactor Directives to take obj input", done: false },
      { text: "Add VDOM to ShadowDOM", done: false },
      { text: "Current: Add VDOM to ShadowDOM", done: false },
      { text: "Security: Input Sanitation", done: false },
      { text: "Security: XSS Protection", done: false },
      { text: "Security: Content Security Policy", done: false },
      { text: "Refactor `manageState`, `manageEffect`, and `manageMemo` for consolidation", done: false },
      { text: "Add VDOM to ShadowDOM", done: false },
    ],
    showAlert: true,
    newTodo: ''  // Ensure this exists if used in addTodo method
  }),
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todoList.push({ text: this.newTodo, done: false });
        this.newTodo = '';
        this.update();
      }
    },
    toggleTodo(index) {
      this.todoList[index].done = !this.todoList[index].done;
      this.update();
    },
    deleteTodo(index) {
      this.todoList.splice(index, 1);
      this.update();
    }
  },
  template: `
    <div class="todo-container">
      <h2>To-Do List</h2>
      <button v-on:click="addTodo">Add</button>
      <ul>
        <li v-for="(todo, index) in todoList" :key="index">
          {{ index }} {{ todo.text }}
        </li>
      </ul>
    </div>
  `,
  styles: `
    /* Add your styles here */
  `
});

Vis.Component.createComponent({
  name: 'message-component',
  data: () => ({
todoList: [
    "1. Core Functionality",
    "&nbsp;&nbsp;&nbsp;&nbsp;a. Add nested v-for",
    "&nbsp;&nbsp;&nbsp;&nbsp;b. Add nested v-bind",
    "&nbsp;&nbsp;&nbsp;&nbsp;c. Add nested v-on",
    "&nbsp;&nbsp;&nbsp;&nbsp;d. Add v-on:hover",
    "&nbsp;&nbsp;&nbsp;&nbsp;e. Add v-on:submit",
    "&nbsp;&nbsp;&nbsp;&nbsp;f. Add v-on:change",
    "&nbsp;&nbsp;&nbsp;&nbsp;f. Add v-on:error",
    "&nbsp;&nbsp;&nbsp;&nbsp;g. Add object oriented iteration functionality",
    "&nbsp;&nbsp;&nbsp;&nbsp;h. Add VDOM to ShadowDOM",
    "&nbsp;&nbsp;&nbsp;&nbsp;i. Add two-way data binding",
    "&nbsp;&nbsp;&nbsp;&nbsp;j. Add global state",
    "&nbsp;&nbsp;&nbsp;&nbsp;k. Add state persistence",
    "2. Security",
    " &nbsp;&nbsp;&nbsp;&nbsp;a. Implement input sanitization – Protect against security vulnerabilities by sanitizing user inputs.",
    "&nbsp;&nbsp;&nbsp;&nbsp;b. Implement Integrated XSS Protection – Add cross-site scripting (XSS) protection to safeguard your application.",
    "&nbsp;&nbsp;&nbsp;&nbsp;c. Implement CSP (Content Security Policy) – Set up a Content Security Policy to prevent unauthorized resource loading.",
    "3. Improvements",
    "&nbsp;&nbsp;&nbsp;&nbsp;a. Refactor `manageState`, `manageEffect`, and `manageMemo` for consolidation – Evaluate the necessity and potential combination of these hooks to streamline framework usage.",
    "&nbsp;&nbsp;&nbsp;&nbsp;b. Assess `manageCallback` and `manageEffect` for potential combination – Determine if these functions should be merged or kept separate.",
    "4. New Features",
    "&nbsp;&nbsp;&nbsp;&nbsp;a. Short Term",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I. v-content",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II. v-on:mount",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III. v-on:destroy",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IV. v-on:update",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;V. v-component",
    "&nbsp;&nbsp;&nbsp;&nbsp;b. Long Term",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I. Cross-platform native support – Ensure that the application runs smoothly across different platforms.",
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II. Module for remote, data cascading client update requests – Implement features for handling remote updates and data synchronization.",
],
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
        <button class="button" v-on:click="handleStartClick">Get Started</button>
        <button class="button" v-on:click="handleStartClick">Read the Docs</button>
        <button class="button" v-on:click="handleStartClick">Ecosystem</button>
        <button class="button" v-on:click="handleStartClick">Examples</button>
      </div>
      <counter-component></counter-component>
        <span>Todo:</span>
<ul class="todo" v-for="(item, index) in todoList">
  <li v-bind="item" class="todo-item">
{{ item }}</li>
</ul>
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
      // Your navigation logic here
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
Vis.createApp('app', [appComponent]);
function toggleNavbar() {
  const menu = document.getElementById('navbar-menu');
  menu.classList.toggle('active');
}

