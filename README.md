# Personal Blogging Platform API

A RESTful backend API for managing personal blog posts through HTTP endpoints. The project exposes a lightweight CRUD layer around a MySQL database using Sequelize and Express, with validation, slug generation, filtering, and post status handling built into the controller layer.

## Overview

This project is a backend API for a personal blogging platform. It allows a developer or client application to create, retrieve, update, and delete blog post records stored in a relational database. The API provides a RESTful interface for publishing or drafting posts, adding tags, filtering the collection, and looking up individual posts by slug.

The application is implemented with Node.js, Express, Sequelize, and MySQL. It uses an ESM project layout (`"type": "module"`) and synchronizes the database model with `sequelize.sync({ alter: true })` at startup.

## Features

The current codebase implements the following features:

- Create a blog post with title, content, author, optional tags, and optional status.
- Retrieve all blogs with pagination.
- Retrieve a single blog by slug.
- Update an existing blog record by UUID id.
- Delete a blog record by UUID id.
- Generate a URL-friendly slug from a blog title.
- Enforce uniqueness of the generated slug.
- Support filtering on status, author, title search, pagination, and JSON tag lookup.
- Support publishing and draft lifecycle behavior through the `status` field and `publishedAt` timestamp.
- Validate incoming request payloads using `express-validator`.
- Centralized success and error JSON response helpers.
- MySQL database connectivity through Sequelize.

## Tech Stack

| Area | Technology |
| --- | --- |
| Language | JavaScript |
| Runtime | Node.js |
| Framework | Express 5.2.1 |
| Database | MySQL |
| ORM | Sequelize 6.37.8 |
| Validation | express-validator 7.3.2 |
| Environment variables | dotenv 17.4.2 |
| Database driver | mysql2 3.23.2 |
| Development server reload | nodemon 3.1.14 |

## Project Structure

```text
.
├── .env
├── .gitignore
├── package.json
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── blogController.js
│   ├── models/
│   │   └── Blog.js
│   ├── routes/
│   │   └── blogRoutes.js
│   ├── server.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── slug.js
│   └── validators/
│       └── blogValidator.js
└── package-lock.json
```

### Important files

- `package.json`: package metadata, scripts, and dependency declarations.
- `src/server.js`: Express app creation, JSON middleware, route registration, and database connection startup.
- `src/config/database.js`: SQL connection setup using Sequelize and environment variables.
- `src/models/Blog.js`: Blog model definition and field schema.
- `src/controllers/blogController.js`: CRUD handlers and query handling logic.
- `src/routes/blogRoutes.js`: Main REST router mounted under `/blogs`.
- `src/validators/blogValidator.js`: Request body validators for create and update operations.
- `src/utils/slug.js`: Slug generation helper.
- `src/utils/apiResponse.js`: Common API success/error response shapes.

## Database Design

The application defines a Sequelize model named `Blog` that maps to a MySQL table created through synchronization.

| Table / Model | Field | Type | Required | Unique | Default | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Blog` / `Blogs` | `id` | `UUID` | Yes | Primary key | `DataTypes.UUIDV4` | Auto-generated UUID primary key |
| `Blog` / `Blogs` | `title` | `STRING(255)` | Yes | No | None | Maximum length 255 enforced at validator layer |
| `Blog` / `Blogs` | `slug` | `STRING(225)` | Yes | Yes | None | Automatically generated from title |
| `Blog` / `Blogs` | `content` | `TEXT` | Yes | No | None | Post body |
| `Blog` / `Blogs` | `author` | `STRING(100)` | Yes | No | None | Maximum length 100 enforced at validator layer |
| `Blog` / `Blogs` | `tags` | `JSON` | No | No | `[]` | Stored as JSON array-like payload |
| `Blog` / `Blogs` | `status` | `ENUM('draft','published')` | No | No | `'draft'` | Status enum |
| `Blog` / `Blogs` | `publishedAt` | `DATE` | No | No | `NULL` | Nullable publish timestamp |
| `Blog` / `Blogs` | `createdAt` | `DATE` | System | No | Sequelize-managed | Timestamp |
| `Blog` / `Blogs` | `updatedAt` | `DATE` | System | No | Sequelize-managed | Timestamp |

### Relationships

No explicit model relationships are defined in the code. The database model is a single table with no foreign keys or joins.

## API Documentation

The API exposes both the router-mount route group and a direct `/api/blogs` route set in the server entry point.

### GET /

- HTTP method: `GET`
- Endpoint: `/`
- Description: Returns a simple welcome message.
- Parameters: None.
- Response: JSON success payload.

Example:

```http
GET /
```

Example response:

```json
{
  "status": "success",
  "message": "Welcome to my Personal Blog API",
  "data": null
}
```

### POST /blogs

- HTTP method: `POST`
- Endpoint: `/blogs`
- Description: Creates a new blog post.
- Required request body:
  - `title` string, required, max 255 characters
  - `content` string, required
  - `author` string, required, max 100 characters
  - Optional `tags` array
  - Optional `status` with value `draft` or `published`
- Response: `201 Created` with the created blog record.
- Validation error: `422` when validation fails.

Example request:

```http
POST /blogs
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the post body.",
  "author": "Okeleye Ayomide",
  "tags": ["news", "node"],
  "status": "draft"
}
```

Example success response:

```json
{
  "status": "success",
  "message": "Blog created successfully",
  "data": {
    "id": "b6bb67b6-5d2b-48a1-8c17-088431c49601",
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "This is the post body.",
    "author": "Okeleye Ayomide",
    "tags": ["news", "node"],
    "status": "draft",
    "publishedAt": null,
    "createdAt": "2026-08-09T00:00:00.000Z",
    "updatedAt": "2026-08-09T00:00:00.000Z"
  }
}
```

### GET /blogs

- HTTP method: `GET`
- Endpoint: `/blogs`
- Description: Returns a paginated collection of blog posts.
- Query parameters:
  - `status` optional, exact match filter on `draft` or `published`
  - `search` optional, filters `title` using SQL `LIKE` pattern `%keyword%`
  - `author` optional, exact author match
  - `tag` optional, SQL `JSON_CONTAINS` tag filter against `tags`
  - `page` optional, integer page number, default `1`
  - `limit` optional, integer page size, default `10`
- Success response: JSON object containing `total`, `page`, `totalPages`, and `blogs` rows.

Example request:

```http
GET /blogs?status=published&page=1&limit=5&search=release&author=Okeleye Ayomide&tag=node
```

Example success response:

```json
{
  "status": "success",
  "message": "Blogs fetched successfully",
  "data": {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "blogs": [
      {
        "id": "b6bb67b6-5d2b-48a1-8c17-088431c49601",
        "title": "My First Post",
        "slug": "my-first-post",
        "content": "This is the post body.",
        "author": "Okeleye Ayomide",
        "tags": ["news", "node"],
        "status": "draft",
        "publishedAt": null,
        "createdAt": "2026-08-09T00:00:00.000Z",
        "updatedAt": "2026-08-09T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /blogs/:slug

- HTTP method: `GET`
- Endpoint: `/blogs/:slug`
- Description: Returns a blog record by slug.
- Path parameter: `slug` required.
- Response: Single blog record when found.
- Error: `404` if the slug does not map to a blog post.

Example request:

```http
GET /blogs/my-first-post
```

Example success response:

```json
{
  "status": "success",
  "message": "Blog fetched successfully",
  "data": {
    "id": "b6bb67b6-5d2b-48a1-8c17-088431c49601",
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "This is the post body.",
    "author": "Okeleye Ayomide",
    "tags": ["news", "node"],
    "status": "draft",
    "publishedAt": null,
    "createdAt": "2026-08-09T00:00:00.000Z",
    "updatedAt": "2026-08-09T00:00:00.000Z"
  }
}
```

Example error response:

```json
{
  "status": "error",
  "message": "Blog doesn't exist"
}
```

### PATCH /blogs/:id

- HTTP method: `PATCH`
- Endpoint: `/blogs/:id`
- Description: Partially updates a blog post.
- Path parameter: `id` UUID primary key.
- Body: any of `title`, `content`, `author`, `tags`, `status`.
- Validation: only the fields present in the request body are validated as optional fields.
- Success response: updated blog record.
- Error: `404` if no record exists for the id.

Example request:

```http
PATCH /blogs/b6bb67b6-5d2b-48a1-8c17-088431c49601
Content-Type: application/json

{
  "status": "published"
}
```

Example success response:

```json
{
  "status": "success",
  "message": "Blog updated successfully",
  "data": {
    "id": "b6bb67b6-5d2b-48a1-8c17-088431c49601",
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "This is the post body.",
    "author": "Okeleye Ayomide",
    "tags": ["news", "node"],
    "status": "published",
    "publishedAt": "2026-08-09T12:28:26.000Z",
    "createdAt": "2026-08-09T00:00:00.000Z",
    "updatedAt": "2026-08-09T12:28:26.000Z"
  }
}
```

### DELETE /blogs/:id

- HTTP method: `DELETE`
- Endpoint: `/blogs/:id`
- Description: Deletes a blog post by UUID id.
- Path parameter: `id` UUID primary key.
- Success response: confirmation message.
- Error: `404` if no record exists.

Example request:

```http
DELETE /blogs/b6bb67b6-5d2b-48a1-8c17-088431c49601
```

Example success response:

```json
{
  "status": "success",
  "message": "Blog deleted successfully",
  "data": null
}
```

### POST /api/blogs

- HTTP method: `POST`
- Endpoint: `/api/blogs`
- Description: Same create handler wired directly in `src/server.js`.
- Request body: Same schema as `POST /blogs`.
- Validation: `createBlogValidation`.

### GET /api/blogs

- HTTP method: `GET`
- Endpoint: `/api/blogs`
- Description: Same list handler wired directly in `src/server.js`.
- Query parameters: `status`, `page`, `limit`, `search`, `author`, `tag`.

### GET /api/blogs/:id

- HTTP method: `GET`
- Endpoint: `/api/blogs/:id`
- Description: Same `getBlog` controller route defined directly in `src/server.js`.
- Path parameter: `id`, but the controller reads `req.params.slug` and queries by slug; this endpoint does not align with the controller’s parameter usage.
- Important note: The route path uses `:id`, but the controller reads a slug field from the URL parameter object.

### PUT /api/blogs/:id

- HTTP method: `PUT`
- Endpoint: `/api/blogs/:id`
- Description: Same update handler wired directly in `src/server.js`.
- Request body: Same as `PATCH /blogs/:id` update payload.
- Validation: `updateBlogValidation`.

### DELETE /api/blogs/:id

- HTTP method: `DELETE`
- Endpoint: `/api/blogs/:id`
- Description: Same delete handler wired directly in `src/server.js`.

## CRUD Operations

The API uses the controller pattern to separate route setup and database logic.

### Create

`createBlog` validates the request body, generates a slug, checks for slug uniqueness, creates a `publishedAt` timestamp only when `status` is `published`, then stores the record with Sequelize using `Blog.create()`.

### Read

- `getAllBlogs` executes a `findAndCountAll()` query with support for status, author, title search, tag JSON filtering, and pagination.
- `getBlog` executes `Blog.findOne({ where: { slug } })` and returns a 404 error if the slug is not found.

### Update

`updateBlog` loads the existing record by UUID id, validates incoming optional body fields, rebuilds a slug if the title changes, then updates the record through Sequelize. Status transitions drive `publishedAt`:

- Draft -> published: assign a new `Date()` to `publishedAt`.
- Published -> draft: set `publishedAt = null`.
- Other updates leave the timestamp unchanged unless the transition is between these two states.

### Delete

`deleteBlog` loads the record by UUID id, destroys the row, and returns a success response.

## Filtering / Searching

The list endpoint supports the following filters:

| Query parameter | Implementation | Behavior |
| --- | --- | --- |
| `status` | `where.status = status` | Exact status match for `draft` or `published` |
| `search` | `where.title = { [Op.like]: `%${search}%` }` | Case-sensitive SQL wildcard search against title string |
| `author` | `where.author = author` | Exact author match |
| `tag` | `JSON_CONTAINS(tags, JSON.stringify(tag))` | Tag lookup in JSON column using MySQL `JSON_CONTAINS` |
| `page` | `parseInt(page) || 1` | Page number used for pagination |
| `limit` | `parseInt(limit) || 10` | Page size used for pagination |

Example supported requests:

```http
GET /blogs?status=published
GET /blogs?search=Node
GET /blogs?author=Okeleye Ayomide
GET /blogs?tag=node
GET /blogs?page=2&limit=5
GET /blogs?status=draft&author=Okeleye Ayomide&tag=release
```

## Slug Generation

Slugs are generated from blog titles in `src/utils/slug.js`:

```js
text
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, "")
  .replace(/[\s_]+/g, "-")
  .replace(/^-+|-+$/g, "");
```

That means the title is lowercased, trimmed, special characters are removed, whitespace and underscores become hyphens, and leading/trailing hyphens are removed.

On create:

- The controller generates a base slug from `title`.
- It checks for an existing slug.
- If the slug already exists, it creates a unique slug such as `my-title-1`, `my-title-2`, and so on.

On update:

- If a new `title` is supplied, the controller regenerates the slug and re-checks uniqueness against all other blog ids.
- The `slug` is assigned to the new title-derived value even if the incoming payload does not include `slug`.

## Post Status / Publishing

The `Blog` model defines the `status` field as an enum with values:

- `draft`
- `published`

The model defaults `status` to `draft`.

`publishedAt` is nullable and only receives a value when the status is published at create or when a draft post is transitioned to published during update.

Runtime behavior:

- `POST /blogs`: if the incoming `status` is `published`, `publishedAt` is set to `new Date()`; otherwise it is `null`.
- `PATCH /blogs/:id`:
  - Draft -> published sets `publishedAt` to the current date.
  - Published -> draft sets `publishedAt` to `null`.

## Validation and Error Handling

Validation is implemented with `express-validator`.

### Create validation rules

`createBlogValidation` in `src/validators/blogValidator.js` validates:

- `title` must be present, trimmed, non-empty, and maximum 255 characters.
- `content` must be present and trimmed.
- `author` must be present, trimmed, non-empty, and maximum 100 characters.
- `tags` optional, must be an array.
- `status` optional, must be one of `draft` or `published`.

### Update validation rules

`updateBlogValidation` is similar but each field is optional and only validated when present.

### Error handling

The controller uses `validationResult(req)` before processing create and update payloads.

- On create validation failure, `createBlog` returns the first validation message with HTTP `422`.
- On update validation failure, `updateBlog` returns the first validation message with HTTP `400` because the helper is called without a status code.
- When a resource is missing, controllers return a JSON error payload:

```json
{
  "status": "error",
  "message": "Blog doesn't exist"
}
```

with an HTTP `404` code.

There is no custom central Express error middleware in the codebase. Exceptions that bubble out of the controller are passed to `next(error)`.

## Environment Variables

The project reads environment variables from `.env` via `dotenv/config`.

Required runtime configuration variables discovered in the code:

```env
PORT=3000
DB_NAME=blog_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
```

The repository currently contains a `.env` file with concrete local values, but README examples should only show placeholders. The application uses these variables in `src/config/database.js`:

```js
new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
);
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- A MySQL server that can accept a connection from the app

### Clone and install

```bash
git clone <repository-url>
cd "1. Personal Blogging Platform API"
npm install
```

### Environment configuration

Create a `.env` file at the project root:

```env
PORT=3000
DB_NAME=blog_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
```

The application does not define any additional environment variables.

### Database setup

The code expects a MySQL database to already be available. The database name is configured using `DB_NAME`.

During startup, `connectDB()` authenticates with MySQL and then runs:

```js
await sequelize.sync({ alter: true });
```

That statement synchronizes the Sequelize model definitions with the database schema and modifies tables as needed. No migrations directory or SQL migration file is present in the project.

### Run locally

Development mode:

```bash
npm run dev
```

Production-style startup:

```bash
npm start
```

Both scripts call the server entry point at `src/server.js`.

## Testing the API

The repository does not contain a Jest, Mocha, Supertest, or Postman collection test suite. The package manifest has a `test` script:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

That means the project currently does not have a passing automated test implementation.

You can test the API with HTTP clients such as curl or Postman. Example requests using curl:

```bash
curl http://localhost:3000/blogs
curl http://localhost:3000/blogs/my-first-post
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test title","content":"Test content","author":"Tester","tags":["api"],"status":"draft"}'
```

## Example Workflow

The following sequence shows the implemented workflow using actual endpoints.

### 1. Create a post

```http
POST /blogs
Content-Type: application/json

{
  "title": "Example Post",
  "content": "Example content for the blog post.",
  "author": "Okeleye Ayomide",
  "tags": ["example"],
  "status": "draft"
}
```

### 2. Retrieve posts

```http
GET /blogs?page=1&limit=10
```

### 3. Retrieve a single post

```http
GET /blogs/example-post
```

### 4. Update it

```http
PATCH /blogs/<id>
Content-Type: application/json

{
  "title": "Example Post Updated",
  "status": "published"
}
```

### 5. Delete it

```http
DELETE /blogs/<id>
```

## HTTP Status Codes

The API returns the following important status codes:

| HTTP Status | Meaning |
| --- | --- |
| `200 OK` | Successful GET or successful update/list/delete response payload |
| `201 Created` | Blog record successfully created |
| `400 Bad Request` | Default error response used by some validation/error paths |
| `404 Not Found` | Requested blog was not found by id or slug |
| `422 Unprocessable Entity` | Validation failure on create body payload |
| `500 Internal Server Error` | Runtime error can be passed to Express error pipeline; no custom error middleware is implemented |

## Security Considerations

The current codebase implements a small amount of request validation through `express-validator`, but it does not implement authentication, authorization, JWT, session management, API keys, CSRF, CORS rules, rate limiting, request throttling, or password hashing.

The app loads database credentials from environment variables and uses Express JSON parsing, but there is no application-level security layer beyond those basics.

### Future Improvements

Suggested future security and API-hardening improvements:

- Add authentication and authorization for write routes.
- Add API rate limiting.
- Add CORS configuration.
- Add structured error middleware.
- Add input sanitization and content security safeguards beyond current validation rules.

## Future Improvements

The project already has a working minimal CRUD API, but there are several natural improvements that are not currently implemented:

- Add Mongo-style or SQL query composition improvements for better advanced filtering.
- Add dedicated API versioning.
- Add authentication and permissions.
- Add test coverage and automated integration tests.
- Add migration tooling instead of using `sequelize.sync({ alter: true })` on startup.
- Add API documentation generation or Swagger.

## Learning Outcomes

This project demonstrates the following backend concepts:

- REST API design using Express routing.
- CRUD handlers for create, read, update, and delete operations.
- Request and response JSON handling.
- MySQL database access through Sequelize.
- Model definition with fields, timestamps, enums, and JSON data.
- Express-validator input validation.
- Query parameter parsing and filtering.
- Slug generation and uniqueness checks.
- Basic API error response shaping.

## Author

The package manifest identifies the author as `Okeleye Ayomide`.

## License

The package manifest declares the license as `ISC`.
