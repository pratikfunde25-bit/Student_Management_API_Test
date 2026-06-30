# Production-Ready Student Management API

A robust, scalable, and industry-standard Student Management API built with Node.js, Express, and MongoDB. This project is explicitly designed to demonstrate **enterprise-grade concepts** while keeping the core business logic (CRUD operations on Students) simple and understandable.

## 🚀 Features & Implementation Guide

This project includes all the key features required for a modern, production-ready system. Here's a breakdown of how each concept is implemented in the codebase so you can learn from it:

### 1. Authentication & Authorization (JWT & RBAC)
- **Authentication**: Users must log in via `/api/v1/auth/login`. This returns a JSON Web Token (JWT) signed with a secret key (`src/utils/jwt.js`).
- **Authorization**: The `protect` middleware (`src/middlewares/auth.js`) intercepts requests, verifies the JWT, and ensures the user exists and hasn't changed their password recently.
- **Role-Based Access Control (RBAC)**: The `authorize` middleware restricts access to specific roles (`ADMIN`, `TEACHER`, `STUDENT`). For example, only an Admin can delete a student.

### 2. Security Best Practices
- **Helmet**: Adds 14 standard security HTTP headers (`src/app.js`).
- **CORS**: Prevents unauthorized domains from making requests.
- **Password Hashing**: Uses `bcryptjs` with a cost factor of 12 inside a Mongoose `pre('save')` hook in `User.js`.
- **Field-level Encryption**: The `guardianPhone` field is encrypted before being stored in the database and decrypted when retrieved, using Node's native `crypto` module (`src/utils/crypto.js` and `Student.js` virtuals).
- **Rate Limiting**: Defends against brute-force attacks and DDoS by limiting requests per IP (`src/middlewares/rateLimiter.js`).
- **Data Sanitization**: Defends against NoSQL injection (`express-mongo-sanitize`) and XSS attacks (`src/middlewares/sanitizeInput.js`).

### 3. Data Validation
- Requests are strictly validated before hitting the controller using `Zod` (`src/validators/`). This guarantees the shape of the data and catches malformed requests early.

### 4. Advanced Data Modeling (MongoDB)
- **Indexes**: Compound Indexes and Text Indexes are implemented in `Student.js` and `User.js` to ensure fast queries and efficient full-text search.
- **Virtuals**: Used in `Student.js` to compute `fullName` dynamically without storing it, and to transparently handle encryption for phone numbers.
- **Hooks**: Mongoose pre/post hooks are used for standardizing data (e.g., trimming names before save) and hashing passwords.

### 5. Aggregations
- The `/api/v1/students/stats` route uses a powerful MongoDB Aggregation Pipeline (`src/services/studentService.js`) to group students by class and status, demonstrating how to generate analytics efficiently at the database layer.

### 6. Transactions (ACID Properties)
- MongoDB Transactions are implemented in `src/services/studentService.js` (see `createStudent` and `deleteStudent`).
- If any operation fails within the transaction block, all changes are rolled back automatically, preventing partial data writes and ensuring data consistency.

### 7. Centralized Error Handling
- A custom `AppError` class is used to throw operational errors.
- The `errorHandler.js` middleware catches all errors, normalizes them (e.g., standardizing MongoDB duplicate key errors or validation errors), and sends a consistent JSON response.
- `asyncHandler.js` automatically wraps asynchronous controllers to catch promise rejections, removing the need for repetitive `try-catch` blocks.

### 8. API Documentation (Swagger/OpenAPI)
- Swagger UI is integrated. Once the server is running, visit `http://localhost:3000/api-docs` to view and interact with the API endpoints directly.

---

## 🛠️ Data Replication & Sharding (High Availability)

To demonstrate how data replication works in production, we have provided a `docker-compose.yml` file that spins up a **MongoDB Replica Set** with 3 nodes (1 Primary, 2 Secondaries).

### Why Replication?
Replication provides redundancy and increases data availability. If the primary database goes down, a secondary node is automatically elected as the new primary (failover), ensuring zero downtime.

### How to run the Replica Set:
1. Ensure you have Docker and Docker Compose installed.
2. Run the following command in the root directory:
   ```bash
   docker-compose up -d
   ```
3. Initialize the replica set:
   ```bash
   chmod +x scripts/mongo-setup.sh
   ./scripts/mongo-setup.sh
   ```
4. You can now connect your API to `mongodb://localhost:27017,localhost:27018,localhost:27019/student-db?replicaSet=rs0`. *(Note: Update your `.env` file accordingly)*

### What about Sharding?
While Replication creates copies of data across servers (High Availability), **Sharding** splits data across multiple servers (Horizontal Scaling). Sharding is used when your dataset exceeds the storage or memory capacity of a single machine. In a sharded cluster, MongoDB automatically balances chunks of data across shards using a Shard Key.

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and copy the contents from `.env.example`. Make sure to set:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `ENCRYPTION_KEY` (Must be 32 bytes/characters long)

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. View Documentation
Visit `http://localhost:3000/api-docs` to view the Swagger UI.

---

## 📖 Code Comments
To further aid your learning, **JSDoc comments** have been added to all Models, Controllers, Services, and Middlewares explaining exactly what each piece of code does and why it was chosen for a production environment.
