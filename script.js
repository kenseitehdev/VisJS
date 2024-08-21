import {Vis} from "./Vis.js";

Vis.Component.createComponent({
  name: 'counter-component',
  data: () => ({
    counterState: 0
  }),
  methods: {
    increment() {
      this.state.counterState++;
      this.render();
    }
  },
  template: `
    <button class="button" v-on:click="increment">Count: <span>{{ counterState }}</span></button>
  `,
  styles: `.button {
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
    }`
});

Vis.Component.createComponent({
  name: 'message-component',
  data: () => ({
todoList: [
  "1. Line by line organization, analysis, efficient refactor and improvement",
  "2. Simplification of API – Create a straightforward API to make further integration easier.",
  "3. Implement integrated Complex Nested Loops – Handle complex nested loops in rendering or data processing.",
  "4. Implement input sanitization – Protect against security vulnerabilities by sanitizing user inputs.",
  "5. Implement Integrated XSS Protection – Add cross-site scripting (XSS) protection to safeguard your application.",
  "6. Implement CSP (Content Security Policy) – Set up a Content Security Policy to prevent unauthorized resource loading.",
  "7. Cross-platform native support – Ensure that the application runs smoothly across different platforms.",
  "8. Module for remote, data cascading client update requests – Implement features for handling remote updates and data synchronization.",
  "9. Develop and organize state",
  "10. Type checking",
  "11. Add VDOM to shadow DOM",
  "12. Make framework modular",
  "13. Develop error handling more",
  "14. Develop State Persistence",
  "15. Optimize rendering",
  "16. Integrate lifecycle system in Component",
  "17. Basic lightweight Router",
  "18. Form Handling",
  "19. Implement dependency management",
  "20. Add comprehensive error handling",
  "21. UI and theming support",
  "22. Integrate testing utilities",
  "23. Add performance optimization features"
],

    ],
    showAlert: true
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
        <ul class="todo" v-for="item in todoList">
          <li class"todo-item">{{ item }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    .todo {
      list-style: none;
      text-align: left;
    }
    .todo-item {
      list-style: none;
      text-align: left;
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      margin-top:0px;
      justify-content: flex-start;
      overflow:hidden;
      align-items: center;  
      background-color: #F0F0F0;
      margin:0px;
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
        width: 100%;
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
window.counterState = Vis.Component.Hook.State.manageState(0);
const appComponent = { name: 'app-component' };
Vis.createApp('app', [appComponent]);
function toggleNavbar() {
  const menu = document.getElementById('navbar-menu');
  menu.classList.toggle('active');
}

