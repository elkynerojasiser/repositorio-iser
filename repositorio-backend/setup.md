Create a backend project using Node.js, Express, and MySQL for a web platform that manages a repository of undergraduate thesis projects for an educational institution.

The project must follow a clean and scalable architecture using the following structure:

* src/

  * config/ (database connection, environment config)
  * models/ (Sequelize or Prisma models)
  * controllers/ (request handling logic)
  * services/ (business logic)
  * routes/ (API routes)
  * middlewares/ (auth, role validation, error handling)
  * utils/ (helper functions)
* uploads/ (for storing PDF files)
* app.js
* server.js

Technical requirements:

* Use Express.js
* Use MySQL as database
* Use Sequelize ORM (preferred)
* Use JWT for authentication
* Use bcrypt for password hashing
* Use Multer for PDF file uploads
* Use dotenv for environment variables

Core features to implement:

1. Authentication:

* User registration
* User login
* JWT token generation and validation

2. Role-based access:

* Roles: admin, editor, public
* Middleware to restrict routes by role

3. Users module:

* CRUD operations for users (admin only)

4. Thesis (trabajos de grado) module:

* Create, read, update, delete thesis records
* Each thesis must include:

  * title
  * author
  * abstract
  * keywords
  * year
  * academic program
  * PDF file (uploaded and stored locally)
* Save PDF file path in database

5. Academic programs module:

* CRUD operations

6. Public endpoints:

* List all thesis
* Search thesis by title, author, keywords, year, or academic program
* Get thesis details
* Endpoint to download/view PDF

Additional requirements:

* Implement validation using express-validator
* Use proper error handling middleware
* Use RESTful API conventions
* Include basic logging
* Use async/await

Database design:

* users table (id, name, email, password, role_id, status, created_at)
* roles table (id, name)
* thesis table (id, title, author, abstract, keywords, year, program_id, file_path, user_id, created_at)
* academic_programs table (id, name)

Also:

* Provide initial database migrations or SQL schema
* Include sample seed data for roles (admin, editor, public)
* Include instructions to run the project

Make the code modular, clean, and ready for production-level scaling.
