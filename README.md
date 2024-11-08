# Food Delivery Web App

This project is a fullstack food delivery web application built with Next.js on the client side and NestJS on the server side, using a monorepo structure. The app utilizes GraphQL for server-client communication and MongoDB as the database, with Prisma as the ORM.

## Project Specifications

- **Type**: Fullstack NestJS + Next.js App
- **Title**: Food Delivery Web App
- **Package Manager**: Yarn

---

## Table of Contents

- [Food Delivery Web App](#food-delivery-web-app)
  - [Project Specifications](#project-specifications)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
    - [Client Side](#client-side)
    - [Server Side](#server-side)
    - [Database](#database)
    - [Additional Libraries](#additional-libraries)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Folder Structure](#folder-structure)
  - [Development Notes](#development-notes)

---

## Tech Stack

### Client Side

- **Framework**: Next.js
- **Router**: App Router (Next.js)
- **UI Library**: ShadcnUI

### Server Side

- **Framework**: NestJS
- **API**: GraphQL
- **Structure**: Monorepo

### Database

- **Database**: MongoDB
- **ORM**: Prisma

### Additional Libraries

- **Email Handling**: Nodemailer

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/food-delivery-web-app.git
   cd food-delivery-web-app
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Set up the database:**

   - Make sure MongoDB is installed and running.
   - Configure Prisma to connect to your MongoDB instance (see [Configuration](#configuration)).

4. **Generate Prisma Client:**

   ```bash
   yarn prisma generate
   ```
5. **Make Changes to the database (Recommended using migration feature):**

   ```bash
   yarn prisma db push
   ```


## Configuration

1. **Environment Variables**:

   - Create a `.env` file in the root directory with the following variables:

     ```env
     DATABASE_URL=mongodb://localhost:27017/food_delivery
     EMAIL_HOST=smtp.example.com
     EMAIL_PORT=587
     EMAIL_USER=your-email@example.com
     EMAIL_PASS=your-email-password
     ```

2. **Prisma Configuration**:

   - Configure Prisma schema in `prisma/schema.prisma` with MongoDB.

3. **Nodemailer Configuration**:

   - Set up email configuration in the `.env` file for sending email notifications (e.g., order confirmation).

---

## Running the Application

1. **Start the NestJS Server**:

   ```bash
   cd server/
   
   yarn start:dev <service>
   ```

2. **Run Next.js Client**:

   ```bash
   cd client/

   yarn dev
   ```

3. **Access the Application**:

   - The client should be running at [http://localhost:3000](http://localhost:3000)
   - The GraphQL API should be available at [http://localhost:4000/graphql](http://localhost:4000/graphql)

---

## Folder Structure

```plaintext
server/
├── apps/
│   ├── gateway/
│   └── users/
│       ├── email-templates/             # For storing email templates related to user operations
│       ├── src/
│       │   ├── dto/                     # Data Transfer Objects (DTOs) for data validation and transformation
│       │   ├── email/                   # Service or utilities for email-related functionality
│       │   ├── entities/                # Defines the entities/models (e.g., User entity) for the application
│       │   ├── guards/                  # Custom guards for authentication and authorization
│       │   ├── types/                   # Type definitions for GraphQL and TypeScript
│       │   ├── resolvers/
│       │   │   └── user.resolver.ts     # User-specific GraphQL resolvers for handling queries and mutations
│       │   ├── services/
│       │   │   └── users.service.ts     # User service for business logic and data operations
│       │   └── users.module.ts          # Module definition for the users feature
│       └── main.ts                      # Entry point for the app, if each feature module has its own server
├── config/
│   ├── graphql.config.ts                # GraphQL configuration (e.g., schema, playground settings)
│   ├── app.config.ts                    # General application configuration (port, global settings)
│   └── env.config.ts                    # Environment-specific configurations
├── dist/                                # Compiled code output directory (typically for TypeScript compilation)
├── node_modules/                        # Node.js dependencies
├── prisma/                              # Prisma schema and migration files for database interaction
├── test/                                # Test files and setup (unit, integration tests)
├── utils/                               # Shared utility functions across the app
├── .dockerignore                        # Files to ignore when building a Docker image
├── .env                                 # Environment variables for the development environment
├── .eslintrc.js                         # ESLint configuration for consistent code style
├── .gitignore                           # Files to ignore in Git
├── .prettierrc                          # Prettier configuration for code formatting
├── Dockerfile                           # Dockerfile for containerizing the application
├── nest-cli.json                        # NestJS CLI configuration
├── package.json                         # Project metadata and dependencies
├── tsconfig.app.json                    # TypeScript configuration for application code
└── tsconfig.json                        # General TypeScript configuration

```

## Development Notes

- **GraphQL API**: Built with NestJS, this GraphQL API handles authentication, user management, food item management, and order processing.
- **Database**: MongoDB is used as the primary data store, accessed via Prisma ORM.
- **Email Notifications**: Nodemailer is used in the NestJS server to send order-related notifications to users.
  
---