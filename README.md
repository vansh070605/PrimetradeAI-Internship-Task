# Task Management System

A production-ready full-stack task management API with JWT authentication, role-based access control, and a React frontend.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── controllers/  # HTTP request/response layer
│   │   ├── services/     # Business logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── middlewares/  # Auth, RBAC, validation, error handling
│   │   ├── routes/       # Express routers
│   │   ├── validators/   # Joi schemas
│   │   └── utils/        # Logger, ApiError, ApiResponse
│   ├── config/           # Swagger config
│   ├── app.js            # Express app factory
│   ├── server.js         # Entry point
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── api/          # Axios instance
│       ├── context/      # Auth context
│       ├── components/   # Navbar, TaskCard, TaskForm
│       └── pages/        # Login, Register, Dashboard
│
└── docker-compose.yml
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB 6+ running locally (or Docker)

### Backend

```bash
cd backend
cp .env.example .env      # Edit JWT_SECRET at minimum
npm install
npm run dev               # Starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # Starts on http://localhost:5173
```

### API Docs

Swagger UI: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Docker (Full Stack)

```bash
# From project root
docker compose up --build
```

Services:
- Backend → http://localhost:5000
- MongoDB → localhost:27017

---

## Environment Variables

| Variable         | Description                        | Default                  |
|------------------|------------------------------------|--------------------------|
| `PORT`           | Server port                        | `5000`                   |
| `NODE_ENV`       | Environment                        | `development`            |
| `MONGO_URI`      | MongoDB connection string          | Required                 |
| `JWT_SECRET`     | JWT signing secret                 | Required (change this!)  |
| `JWT_EXPIRES_IN` | JWT expiry                         | `7d`                     |
| `CLIENT_URL`     | Allowed CORS origin                | `http://localhost:5173`  |

---

## API Reference

### Auth

| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | `/api/v1/auth/register`   | No   | Register new user        |
| POST   | `/api/v1/auth/login`      | No   | Login, receive JWT       |
| GET    | `/api/v1/auth/me`         | Yes  | Get current user profile |

### Tasks

| Method | Endpoint              | Auth  | Description                          |
|--------|-----------------------|-------|--------------------------------------|
| POST   | `/api/v1/tasks`       | Yes   | Create task                          |
| GET    | `/api/v1/tasks`       | Yes   | List tasks (own / all for admin)     |
| GET    | `/api/v1/tasks/:id`   | Yes   | Get single task                      |
| PUT    | `/api/v1/tasks/:id`   | Yes   | Update task                          |
| DELETE | `/api/v1/tasks/:id`   | Yes   | Delete task                          |

Query params for `GET /tasks`: `status`, `priority`, `page`, `limit`, `sortBy`, `order`

---

## Sample cURL Requests

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'

# Create Task (use token from login response)
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Build the API","description":"Ship it","priority":"high"}'

# Get Tasks with filter
curl http://localhost:5000/api/v1/tasks?status=todo&page=1 \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Update Task
curl -X PUT http://localhost:5000/api/v1/tasks/<TASK_ID> \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Delete Task
curl -X DELETE http://localhost:5000/api/v1/tasks/<TASK_ID> \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## Security Features

| Feature              | Implementation                          |
|----------------------|-----------------------------------------|
| Password hashing     | bcrypt with 12 salt rounds              |
| Authentication       | JWT HS256, configurable expiry          |
| Route protection     | `protect` middleware on all task routes |
| RBAC                 | `requireRole` middleware                |
| Input validation     | Joi schemas, unknown fields stripped    |
| NoSQL injection      | `express-mongo-sanitize`                |
| Security headers     | `helmet`                                |
| Rate limiting        | 100 req/15min global; 10/15min auth     |
| Payload limit        | 10kb max request body                   |
| Error sanitization   | Stacks only in development              |

---

## Scalability Notes

### Stateless JWT Authentication
JWT tokens are self-contained — no server-side session storage. This means:
- Any API server instance can validate any token without shared state
- Horizontal scaling (adding more backend pods) requires zero coordination
- The token carries `id` and `role`, reducing DB lookups for auth decisions

### Horizontal Scaling Path
1. **Now**: Single Node.js instance + MongoDB
2. **Next**: PM2 cluster mode (use all CPU cores on one machine)
3. **Then**: Multiple containers behind a load balancer (Nginx / AWS ALB)
4. **Production**: Kubernetes with HPA based on request throughput

### Database Scaling
- Compound indexes on `{ user, status }` and `{ user, createdAt }` prevent collection scans
- MongoDB supports replica sets (read scaling) and sharding (write scaling)
- For read-heavy workloads: add Redis caching layer for task lists

### Future Improvements
- **Caching**: Redis cache for frequently read task lists (invalidate on write)
- **Microservices**: Split auth service from task service, use JWT as service identity
- **Message Queue**: RabbitMQ/Kafka for async notifications (task due alerts)
- **Search**: Elasticsearch for full-text task search
- **Observability**: OpenTelemetry traces + Prometheus metrics + Grafana dashboards
- **Refresh Tokens**: Short-lived access tokens + refresh token rotation for better security

---

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Runtime     | Node.js 20 LTS                                 |
| Framework   | Express 4                                      |
| Database    | MongoDB 7 + Mongoose 8                         |
| Auth        | JWT (jsonwebtoken) + bcryptjs                  |
| Validation  | Joi                                            |
| Security    | Helmet, CORS, express-mongo-sanitize           |
| Rate Limit  | express-rate-limit                             |
| Logging     | Winston + winston-daily-rotate-file + Morgan   |
| Docs        | Swagger UI + swagger-jsdoc                     |
| Frontend    | React 18 + Vite + React Router v6 + Axios      |
| Container   | Docker + Docker Compose                        |

---

## 👤 Author

**Vansh Agrawal**

> Submitted as part of the PrimetradeAI Backend Engineering Internship Task.
> Built with Node.js · Express · MongoDB · React · JWT · Docker.
