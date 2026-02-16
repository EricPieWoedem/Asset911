# Assets911 Backend README

## Getting Started

To start the app, follow these steps:

1. Clone this repository to your local machine:

   ```shell
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```shell
   cd <project-directory>
   ```

3. Install all dependencies using Yarn:

   ```shell
   yarn
   ```

## Development Server

To start the development server, use the following command:

```shell
yarn run dev
```

This will launch the Node.js server, allowing you to develop and test your backend.

## Project Structure

The project structure may look like this:

```
/
|-- config/
|-- controllers/
|-- models/
|-- node_modules/
|-- routes/
|-- utils/
|-- .gitIgnore
|-- index.js
|-- package.json
|-- readme.md
|-- yarn.lock
```

- `node_modules`: Contains all the project's dependencies.

- `config`: Contains database and jwt configurations.
- `controllers`: Controllers for handling various routes and business logic.
- `models`: Mongoose models for interacting with the database.
- `routes`: Express.js routes for defining API endpoints.
- `index.js`: The main application file where you set up your Express app.

- `package.json`: Contains project metadata and dependencies.

- `README.md`: This file, providing instructions on setting up and running the app.

- `yarn.lock`: Yarn's lock file, ensuring consistent dependency versions.

Happy coding!
