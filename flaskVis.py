import os
import subprocess
import json
def create_scaffold(project_name):
    # Create project directory
    os.makedirs(project_name, exist_ok=True)
    # Create backend directory structure
    backend_dir = os.path.join(project_name, 'backend')
    os.makedirs(backend_dir, exist_ok=True)
    os.makedirs(os.path.join(backend_dir, 'app'), exist_ok=True)
    # Create frontend directory structure
    frontend_dir = os.path.join(project_name, 'frontend')
    os.makedirs(frontend_dir, exist_ok=True)
    os.makedirs(os.path.join(frontend_dir, 'src', 'components'), exist_ok=True)
    # Create backend files
    with open(os.path.join(backend_dir, 'app.py'), 'w') as f:
        f.write("""
from flask import Flask, render_template
from flask_restful import Api

                app = Flask(__name__)
api = Api(app)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
""")

    with open(os.path.join(backend_dir, 'requirements.txt'), 'w') as f:
        f.write("""
Flask
Flask-RESTful
Flask-Login
SQLAlchemy
""")

    with open(os.path.join(backend_dir, 'app', '__init__.py'), 'w') as f:
        f.write("")

    with open(os.path.join(backend_dir, 'app', 'routes.py'), 'w') as f:
        f.write("""
from . import app

@app.route('/api/hello')
def hello():
    return {'message': 'Hello from Flask!'}
""")

    # Create frontend files
    with open(os.path.join(frontend_dir, 'index.html'), 'w') as f:
        f.write("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>VisJS + Flask</title>
</head>
<body>
    <div id="app">
        <h1>Welcome to VisJS + Flask</h1>
        <div id="helloWorld"></div>
    </div>
    <script src="app.js"></script>
</body>
</html>
""")

    with open(os.path.join(frontend_dir, 'styles.css'), 'w') as f:
        f.write("""
body {
    font-family: Arial, sans-serif;
    text-align: center;
    background-color: #f0f0f0;
}

#app {
    margin-top: 20px;
}
""")

    with open(os.path.join(frontend_dir, 'app.js'), 'w') as f:
        f.write("""
import { Vis } from 'visjs-microframework';
import HelloWorld from './src/components/helloWorld.js';

const app = Vis.createApp('app', [
    { name: 'hello-world' }
]);

HelloWorld();
""")

    with open(os.path.join(frontend_dir, 'src', 'components', 'helloWorld.js'), 'w') as f:
        f.write("""
import { defineCustomElement, createCustomElement } from 'visjs-microframework';

const template = `
  <style>
    .greeting {
      color: royalblue;
      font-size: 2em;
    }
  </style>
  <div class="greeting">Hello from VisJS Component!</div>
`;

export default function HelloWorld() {
  defineCustomElement('hello-world', template);
}
""")

    # Create frontend package.json
    package_json = {
        "name": f"{project_name}-frontend",
        "version": "1.0.0",
        "scripts": {
            "start": "npx live-server"
        },
        "dependencies": {
            "tailwindcss": "^3.0.0",
            "visjs-microframework": "^0.7.0"
        },
        "devDependencies": {
            "live-server": "^1.2.1"
        }
    }

    with open(os.path.join(frontend_dir, 'package.json'), 'w') as f:
        json.dump(package_json, f, indent=4)

    # Instructions for user
    print(f"Scaffold for {project_name} created successfully!")
    print("To start working on your project:")
    print(f"1. Navigate to your project directory: cd {project_name}")
    print(f"2. To start the Flask server, navigate to backend and run:")
    print("    pipenv install && pipenv run flask run")
    print(
        "3. To start the frontend live server, navigate to frontend and run:")
    print("    npm install && npm run start")


def main():
    project_name = input("Enter the project name: ")
    create_scaffold(project_name)


if __name__ == "__main__":
    main()

