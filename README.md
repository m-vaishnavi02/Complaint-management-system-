# ComplaintDesk — Full-Stack Complaint Management System

A production-grade, three-tier application built with:
- **Database** — MySQL
- **Backend** — Spring Boot (Java 17) REST API on port `8080`
- **Middleware** — Node.js + Express BFF (Backend-for-Frontend) on port `5000`
- **Frontend** — React 18 SPA on port `3000`

---

## Project Structure

```
cms/
├── database/
│   └── schema.sql               ← MySQL schema + 15 seed records
├── backend-spring/              ← Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/cms/
│       ├── CmsApplication.java
│       ├── config/CorsConfig.java
│       ├── model/Complaint.java
│       ├── repository/ComplaintRepository.java
│       ├── service/ComplaintService.java
│       └── controller/
│           ├── ComplaintController.java
│           ├── AnalyticsController.java
│           └── GlobalExceptionHandler.java
├── backend-node/                ← Node.js BFF proxy + rate limiting
│   ├── package.json
│   ├── server.js
│   └── .env
└── frontend/                    ← React 18 SPA
    ├── package.json
    └── src/
        ├── index.js
        ├── App.jsx
        ├── api/complaintsApi.js
        ├── context/ToastContext.jsx
        ├── styles/global.css
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Badges.jsx
        │   ├── ComplaintModal.jsx
        │   └── DetailModal.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Complaints.jsx
            └── Analytics.jsx
```

---

## Prerequisites

| Tool    | Version  |
|---------|----------|
| Java    | 17+      |
| Maven   | 3.8+     |
| Node.js | 18+      |
| MySQL   | 8.0+     |

---

## Setup — Step by Step

### 1. Database

```bash
# Log into MySQL
mysql -u root -p

# Run the schema (creates DB, tables, and seeds 15 records)
mysql -u root -p < database/schema.sql
```

### 2. Spring Boot Backend (port 8080)

Edit the database credentials in:
```
backend-spring/src/main/resources/application.properties
```

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Then run:
```bash
cd backend-spring
mvn clean install -DskipTests
mvn spring-boot:run
```

Verify: http://localhost:8080/api/complaints

### 3. Node.js BFF (port 5000)

```bash
cd backend-node
npm install
npm run dev         # development (nodemon)
# or
npm start           # production
```

The Node.js server proxies all `/api/*` requests to Spring Boot at `http://localhost:8080`.

Verify: http://localhost:5000/health

### 4. React Frontend (port 3000)

```bash
cd frontend
npm install
npm start
```

The React app proxies API calls to Node.js at `http://localhost:5000` via the `proxy` field in `package.json`.

Open: **http://localhost:3000**

---

## API Reference

All endpoints are exposed through Node.js at `http://localhost:5000/api` (and directly at Spring Boot `http://localhost:8080/api`).

### Complaints

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/complaints`     | Paginated list with filters + sort   |
| GET    | `/api/complaints/:id` | Get single complaint by DB id        |
| POST   | `/api/complaints`     | Create new complaint                 |
| PUT    | `/api/complaints/:id` | Update existing complaint            |
| DELETE | `/api/complaints/:id` | Delete complaint                     |

**GET /api/complaints — query params:**

| Param    | Default      | Description                    |
|----------|--------------|--------------------------------|
| search   | ""           | Search name, id, issue, cat    |
| status   | ""           | Filter by status               |
| category | ""           | Filter by category             |
| priority | ""           | Filter by priority             |
| page     | 0            | Page number (0-indexed)        |
| size     | 10           | Items per page                 |
| sortBy   | createdDate  | Field to sort by               |
| sortDir  | desc         | asc or desc                    |

**POST/PUT body (JSON):**
```json
{
  "customerName": "Arjun Mehta",
  "email": "arjun@example.com",
  "phone": "9876543210",
  "category": "Billing",
  "priority": "High",
  "status": "Open",
  "issue": "Charged twice for November subscription.",
  "notes": "Bank statement submitted."
}
```

### Analytics

| Endpoint                              | Description                      |
|---------------------------------------|----------------------------------|
| GET `/api/analytics/summary`          | Key metrics (total, open, etc.)  |
| GET `/api/analytics/by-status`        | Count per status                 |
| GET `/api/analytics/by-category`      | Count per category               |
| GET `/api/analytics/by-priority`      | Count per priority               |
| GET `/api/analytics/resolution-by-category` | Resolution rate by category |
| GET `/api/analytics/monthly-trend`    | Last 8 months complaint counts   |

---

## Features

### Core Management
- Full CRUD for complaints (Create, Read, Update, Delete)
- Auto-generated complaint IDs (CMP-001, CMP-002, …)
- Fields: ID, customer name, email, phone, category, priority, status, issue, notes

### Search & Filter
- Live search across ID, name, issue, and category (debounced 350ms)
- Independent filters: status, category, priority
- Clear all filters button

### Sorting & Pagination
- Click any column header to sort ascending/descending
- Server-side pagination (10 items per page by default)
- Smart ellipsis pagination controls

### Analytics
- Summary metrics: total, open, in-progress, resolved, high-priority, resolution rate
- Category bar chart
- Status donut chart
- Resolution rate by category
- Priority distribution
- Monthly trend chart (last 8 months)

### Exception Handling
- Client-side validation: name, email, 10-digit phone, issue length
- Server-side validation: Spring Boot `@Valid` annotations
- Global exception handler returns structured JSON errors
- Toast notifications for all user actions
- Rate limiting (200 req/min) on Node.js BFF

---

## Architecture

```
Browser (React :3000)
       │
       │  HTTP /api/*
       ▼
Node.js BFF (:5000)
  • CORS
  • Rate limiting (express-rate-limit)
  • Request logging (morgan)
  • Proxy layer (axios)
       │
       │  HTTP /api/*
       ▼
Spring Boot (:8080)
  • REST Controllers
  • Service layer
  • JPA Repository
  • Bean Validation
  • Global Exception Handler
       │
       │  JDBC
       ▼
MySQL (:3306)
  complaint_db
  └── complaints table
```

---

## Validation Rules

| Field        | Rule                                        |
|--------------|---------------------------------------------|
| customerName | Required, min 2 chars, max 100 chars        |
| email        | Required, valid email format                |
| phone        | Required, exactly 10 digits                 |
| category     | Required, must be one of the 6 categories   |
| priority     | Required: High / Medium / Low               |
| status       | Required: Open / In Progress / Resolved / Closed |
| issue        | Required, min 10 characters                 |
| notes        | Optional                                    |

---

## Environment Variables (Node.js)

Create `backend-node/.env`:
```env
PORT=5000
SPRING_URL=http://localhost:8080
```

---

## Production Build

```bash
# Build React for production
cd frontend && npm run build

# Copy build to Spring Boot static resources (optional)
cp -r build/* ../backend-spring/src/main/resources/static/

# Build Spring Boot fat JAR
cd ../backend-spring && mvn clean package -DskipTests
java -jar target/complaint-management-1.0.0.jar
```
