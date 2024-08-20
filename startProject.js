#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

// Define the directory structure and files
const TEMPLATE_STRUCTURE = {
  'build/': {},
  'src/components/': {
    'helloWorld.js': `export function helloWorld() {
  console.log('Hello, World!');
}`
  },
  'src/pages/': {},
  'App.js': `import './styles.css';
import { helloWorld } from './src/components/helloWorld';

helloWorld();`,
  'package.json': `{
  "name": "visjs-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "tailwindcss": "^3.0.0",
    "vite": "^3.0.0"
  }
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VisJS Project</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./App.js"></script>
</body>
</html>`,
  'styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
  'vite.config.js': `import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  plugins: [tailwindcss()],
});`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
  'router.js': `// Example lightweight router configuration
// This can be customized as needed

export function configureRouter() {
  // Router setup code here
}`
};

// Prompt user for project name
async function promptUser() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter your project name:',
      default: 'visjs-project',
    }
  ]);
  return answers.projectName;
}

// Create the directory structure and files
function createProject(projectName) {
  const projectPath = path.join(process.cwd(), projectName);

  function createStructure(basePath, structure) {
    for (const [key, value] of Object.entries(structure)) {
      const fullPath = path.join(basePath, key);

      if (typeof value === 'object' && !Array.isArray(value)) {
        fs.ensureDirSync(fullPath);
        createStructure(fullPath, value);
      } else if (typeof value === 'string') {
        fs.writeFileSync(fullPath, value);
      }
    }
  }

  createStructure(projectPath, TEMPLATE_STRUCTURE);
}

// Main function
async function main() {
  try {
    const projectName = await promptUser();
    createProject(projectName);
    console.log(chalk.green(`Project ${projectName} has been successfully created!`));
  } catch (error) {
    console.error(chalk.red('Error creating project:'), error);
  }
}

main();
