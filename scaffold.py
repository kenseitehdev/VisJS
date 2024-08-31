import os
import argparse

def create_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

def create_file(path):
    if not os.path.exists(path):
        with open(path, 'w') as file:
            pass

def setup_project(project_name, location):
    base_dir = os.path.join(location, project_name)
    
    # Create base directory
    create_directory(base_dir)
    
    # Create app directory and files
    app_dir = os.path.join(base_dir, 'app')
    create_directory(app_dir)
    create_file(os.path.join(app_dir, '__init__.py'))
    create_directory(os.path.join(app_dir, 'migrations'))
    create_file(os.path.join(app_dir, 'models.py'))
    create_file(os.path.join(app_dir, 'routes.py'))
    create_file(os.path.join(app_dir, 'serializer.py'))
    create_file(os.path.join(app_dir, 'tests.py'))
    create_file(os.path.join(app_dir, 'views.py'))

    # Create other files in base directory
    create_file(os.path.join(base_dir, 'app.db'))
    create_file(os.path.join(base_dir, 'app.py'))
    create_file(os.path.join(base_dir, 'manage.py'))
    create_file(os.path.join(base_dir, 'routes.py'))
    create_file(os.path.join(base_dir, 'settings.py'))

    # Create templates directory and files
    templates_dir = os.path.join(base_dir, 'templates')
    create_directory(templates_dir)
    create_file(os.path.join(templates_dir, 'app.js'))
    create_directory(os.path.join(templates_dir, 'assets'))
    create_directory(os.path.join(templates_dir, 'components'))
    create_file(os.path.join(templates_dir, 'index.html'))
    create_file(os.path.join(templates_dir, 'package.json'))
    create_directory(os.path.join(templates_dir, 'pages'))
    create_directory(os.path.join(templates_dir, 'router'))
    create_directory(os.path.join(templates_dir, 'store'))
    create_directory(os.path.join(templates_dir, 'tests'))

    print(f"Project structure for '{project_name}' created successfully at '{base_dir}'.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Create a project structure.")
    parser.add_argument('project_name', type=str, help='The name of the project.')
    parser.add_argument('location', type=str, help='The location where the project directory will be created.')

    args = parser.parse_args()
    setup_project(args.project_name, args.location)

