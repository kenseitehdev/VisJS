import {Vis} from "./Vis.js";

Vis.Component.createComponent({
  name: 'todo-list',
  data: () => ({
todoList: [

  { id: 1, header: "Vis.Component.createComponent", text:"Templating Engine", done: false },
  { id: 2, header: "Vis.Component.createComponent ", text:"Optimize directive parsing and handling", done: false },

  { id: 3, header: "Vis.Security.xss", text:"Integrate XSS Protection", done: false },
  { id: 4, header: "Vis.Security.csp", text:"Implement Content Security Policy", done: false },
  { id: 5, header: "Vis.Debug.error", text:"Develop Error Management", done: false },
  { id: 6, header: "Vis.Debug ", text:"Improve Error Modal design and UX", done: false },
  { id: 7, header: "Vis.Debug.test ", text:"Add unit tests and integration tests", done: false },

  { id: 8, header: "Ecosystem", text:"Module for remote, data cascading client update requests", done: false },
  { id: 9, header: "Ecosystem", text:"Routing", done: false },
  { id: 10, header: "Ecosystem", text:"Cross-platform native support", done: false },
],
    newTodo: ""
  }),
  methods: {
    onMount() {
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
        if (newTodoText) {
            this.state.todoList.push({
                id: this.state.todoList.length + 1,
                header: "new item",
                text: newTodoText,
                done: false
            });
            this.state.newTodo = "";
            inputField.value = "";
            this.render();
            
        } else {
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
    handleInputChange(event) {
      console.log('Input change event:', event);
      this.state.newTodo = event.target.value;
    },
  },
  template: `
    <div class="todo-container">
      <h2  >To-Do List</h2>
      <div class="input-container">
        <form data-on:submit="addTodo">
          <input id="inputTodo" type="text"  placeholder="Add a new task"/>
          <button type="submit" class="bg-blue-800 text-white px-8 rounded-lg py-2">Add</button>
        </form>
      </div>
<ul class="todo-list">
  <li class="todo-item" data-for="(todo, index) in todoList" :key="todo.id">
    {{ todo.id }}.
    <input
      type="checkbox"
      data-id="{{ todo.id }}"
      data-if="{{ todo.done }}"
      checked
class="p-4"
      data-on:click="toggleTodo"
    />
    <input
      type="checkbox"
      data-id="{{ todo.id }}"
      data-else
    class="p-4"
      data-on:click="toggleTodo"
    />
    <div class="todo-content">
      <span class="todo-header" :class="{ 'done': todo.done }">
        <b>{{ todo.header }}</b>
      </span>
      <span class="todo-text">
        {{ todo.text }}
      </span>
    </div>
    <button
      data-on:click="() => deleteTodo(index)"
      class="delete-button"
    >
      ❌
    </button>
  </li>
</ul>
    </div>
  `,
  styles: `
.todo-content {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.todo-header {
  flex: 1;
  margin-right: 2em;
}

.todo-text {
  flex: 1;
}

    form {
        width: 100%;
    }
    .todo-container {
      max-width: 80%;
      margin: 0 auto;
      padding: 16px;
      font-family: Arial, sans-serif;
    }
    h2 {
      margin-top: 0;
        font-size:large;
        font-weight:bold!important;
    }
    input[type="text"] {
      width: 88%;
      padding: 8px 0;
      margin-right: 8px;
        margin-bottom:20px;
      border: 1px solid #ddd;
      border-radius: 4px;
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
      color: #dc3545;
        background-color:rgba(0,0,0,0);
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
      onMount(){
      },
  },
  template: `
    <div class="mx-auto">
      <div class="">
       
    <svg width="800"class="justify-content-center mx-auto " viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
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
      <div class="title text-center my-12">Welcome to Your VisJS App</div>
      <div class="description w-full text-center mx-auto my-12">Edit <code> src/app.js </code> to start</div>
      </div>
    <todo-list></todo-list>
    </div>
  `,
  styles: `
    .title {
      font-size: 36px;
      font-weight: bold;
      color: royalblue;
        text-align:center;
    }
    .description {
      font-size: 20px;
      color: #666;
        text-align:center;
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
<ul class="navbar-menu ">
  <li><a href="/docs/guide" data-on:click="navigate($event, '/docs')">Docs</a></li>
  <li><a href="/ecosystem" data-on:click="navigate($event, '/ecosystem')">Ecosystem</a></li>
  <li class="dropdown">
    <a href="#" data-on:click="toggleDropdown($event)" class="dropdown-toggle">Community</a>
    <ul class="dropdown-menu">
      <li><a href="/forum">Forum</a></li>
      <li><a href="/chat">Chat</a></li>
      <li><a href="/meetups">Meetups</a></li>
    </ul>
  </li>
  <li><a href="/showcase" data-on:click="navigate($event, '/showcase')">Examples</a></li>
    <li><a href="https://github.com/kenseitehdev/VisJS" data-on:click="navigate($event, '/github')">Github</a></li>

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
