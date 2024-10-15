
# Doppelgangers.AI Backend

This is the backend service for Doppelgangers.AI, built using NestJS. The service includes authentication (JWT, Google Auth), AI integrations, and various modules for chat, user management, and more.

## Quick Start

To start the database and MinIO services, ensure you have Docker installed, then run:

```bash
docker-compose up -d
```

This will start the required dependencies such as the PostgreSQL database and MinIO storage. You will need to start the Node.js service separately using the following command:

```bash
yarn start:dev
```

## Scripts

The `package.json` includes several useful scripts for development, testing, and deployment:

- `yarn start`: Start the NestJS server.
- `yarn start:dev`: Start the server in development mode with `nodemon`.
- `yarn start:prod`: Start the production build of the server.
- `yarn test`: Run unit tests with `jest`.
- `yarn test:watch`: Run tests in watch mode.
- `yarn test:cov`: Run tests and generate coverage reports.
- `yarn migration:create`: Create a new migration.
- `yarn migration:run`: Run all pending migrations.
- `yarn migration:revert`: Revert the last migration.
- `yarn migration:generate`: Generate a new migration file.
- `yarn format`: Format the codebase using `prettier`.

## Environment Variables

You need to set up a `.env` file with the following variables:

```env
# Application
APP_ENV=dev
APP_URL=http://localhost:5173

# JWT AUTH
JWT_SECRET_KEY= # don't forget to change this
JWT_EXPIRATION_TIME=259200

# DATABASE
DB_TYPE=postgres
DB_USERNAME=doppelgangers
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=doppelgangers
DB_SYNC=false
DB_PATH=./db

# Google Authentication (https://console.developers.google.com/)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...

# Email Service (Mandrill API)
MANDRILL_API_KEY=...

# Environment
NODE_ENV=local

# MinIO Storage Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_ROOT_USER=your_minio_access_key
MINIO_ROOT_PASSWORD=your_minio_secret_key
MINIO_REGION=us-east-1

# Twitter API Integration
TWITTER_API_KEY=...
TWITTER_API_SECRET_KEY=...
TWITTER_CLIENT_KEY=...
TWITTER_CLIENT_SECRET=...

# ChatBotKit Secret
CHATBOTKIT_SECRET=...

# Telegram Integration
TELEGRAM_API_ID=...
TELEGRAM_API_HASH=...
PHONE_EXAMPLE=+37498312345
PASSWORD_EXAMPLE=...
```

## Project Structure

```plaintext
dpback
├── Dockerfile
├── Dockerfile-nginx
├── Dockerfile-prod
├── LICENSE
├── README.md
├── db
├── docker-compose.yml
├── encoding-check.ts
├── init
├── nest-cli.json
├── nodemon-debug.json
├── nodemon.json
├── ormconfig.js
├── package.json
├── src
│   ├── cli.ts
│   ├── core
│   │   ├── constants
│   │   └── index.ts
│   ├── main.hmr.ts
│   ├── main.ts
│   ├── migrations
│   ├── modules
│   │   ├── ai
│   │   ├── api
│   │   ├── chat
│   │   ├── twitter
│   │   ├── user
│   │   ├── vault
│   │   └── common
│   ├── swagger
│   └── utils
├── tsconfig.json
├── tsconfig.spec.json
└── yarn.lock
```

This is a high-level overview of the project’s structure. Each module under `src/modules/` represents a feature, such as authentication, chat, or AI integration.

## Key Modules

### AI Module
Handles AI integration and communication with services like OpenAI.

### Auth Module
Manages user authentication via JWT and Google OAuth2.

### Chat Module
Facilitates the chat functionality and related services.

### Vault Module
Contains the Telegram integration and user vault-related operations.

### Process Module
Responsible for handling background processes and parsers, including Instagram data parsing.

## Running Migrations

To run database migrations, use the following command:

```bash
yarn migration:run
```

## Swagger Documentation

Swagger is set up for easy API exploration. Once the service is running, you can access it at:

```
http://localhost:5173/api/docs
```