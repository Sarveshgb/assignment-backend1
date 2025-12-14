# Sports Travel Package - Backend API

A robust Node.js REST API for managing sports travel packages, leads, and quote generation with complex pricing logic.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Pricing Logic](#pricing-logic)
- [Lead Workflow](#lead-workflow)
- [Deployment](#deployment)
- [Production Improvements](#production-improvements)

## ✨ Features

### Core Functionality
- ✅ **Lead Management** - Create, read, update leads with status tracking
- ✅ **Status Workflow** - Enforced lead status transitions with history
- ✅ **Quote Generation** - Complex pricing calculation with multiple rules
- ✅ **Events & Packages** - Manage sporting events and travel packages
- ✅ **Pagination & Filtering** - Efficient data retrieval
- ✅ **Input Validation** - Comprehensive request validation using Joi
- ✅ **Database Migrations** - Automated schema setup
- ✅ **Seed Data** - Sample events, packages, and leads

### Business Logic
- Complex pricing calculator with 6 different rules
- Automatic lead status updates on quote generation
- Status transition validation (prevents illegal jumps)
- Complete audit trail via status history

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v4.18) - Web framework
- **PostgreSQL** (v14+) - Relational database
- **node-postgres (pg)** - PostgreSQL client

### Libraries & Tools
- **Joi** - Schema validation
- **date-fns** - Date manipulation
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-reload

### Why These Choices?

**PostgreSQL over MongoDB:**
- ✅ ACID compliance for financial data (quotes, pricing)
- ✅ Complex relationships (leads → quotes → packages → events)
- ✅ Strong data integrity with foreign keys
- ✅ Better for reporting and analytics queries

**Express.js over Fastify/Koa:**
- ✅ Mature ecosystem with extensive middleware
- ✅ Large community and documentation
- ✅ Easier onboarding for team members
- ⚠️ Trade-off: Slightly slower than Fastify

**Joi over Yup:**
- ✅ More comprehensive validation rules
- ✅ Better error messages
- ✅ Synchronous validation (simpler code)

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js v18+ 
- PostgreSQL v14+
- npm or yarn

# Optional
- Postman (for API testing)
- pgAdmin (for database management)
```

### Installation

1. **Clone and navigate:**
   ```bash
   cd sports-travel-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create PostgreSQL database:**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE sports_travel_db;
   \q
   ```

5. **Run migrations and seed:**
   ```bash
   npm run migrate
   npm run seed
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

Server will start at `http://localhost:3000`

### Quick Start (All-in-One)

```bash
npm install
npm run reset  # Runs migration + seed
npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Leads** |
| POST | `/leads` | Create new lead |
| GET | `/leads` | Get all leads (paginated) |
| GET | `/leads/:id` | Get single lead with history |
| PATCH | `/leads/:id/status` | Update lead status |
| **Events** |
| GET | `/events` | Get all events |
| GET | `/events/:id` | Get single event |
| GET | `/events/:id/packages` | Get packages for event |
| **Quotes** |
| POST | `/quotes/generate` | Generate quote with pricing |
| GET | `/quotes` | Get all quotes |
| GET | `/quotes/:id` | Get single quote |

### Detailed API Reference

#### 1. Create Lead

```http
POST /api/leads
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "Interested in F1 Japan package",
  "event_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "message": "Interested in F1 Japan package",
    "event_id": 1,
    "status": "New",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Lead created successfully"
}
```

#### 2. Get Leads (with Pagination & Filters)

```http
GET /api/leads?page=1&limit=10&status=New&event_id=1&month=6
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `status` (optional) - Filter by status
- `event_id` (optional) - Filter by event
- `month` (optional, 1-12) - Filter by creation month

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": "New",
      "event_name": "F1 Japan Grand Prix",
      "event_date": "2025-10-18",
      "status_changes": 1,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### 3. Update Lead Status

```http
PATCH /api/leads/1/status
Content-Type: application/json

{
  "status": "Contacted",
  "notes": "Initial phone call completed"
}
```

**Valid Status Transitions:**
- `New` → `Contacted`
- `Contacted` → `Quote Sent` or `Closed Lost`
- `Quote Sent` → `Interested` or `Closed Lost`
- `Interested` → `Closed Won` or `Closed Lost`
- `Closed Won` → (final state)
- `Closed Lost` → (final state)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "Contacted",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "Lead status updated from 'New' to 'Contacted'"
}
```

**Error Response (Invalid Transition):**
```json
{
  "success": false,
  "message": "Invalid status transition from 'New' to 'Interested'",
  "validTransitions": ["Contacted"]
}
```

#### 4. Get Events

```http
GET /api/events
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "F1 Japan Grand Prix",
      "description": "Experience the thrill of Formula 1 racing...",
      "location": "Suzuka, Japan",
      "event_date": "2025-10-18",
      "category": "Motorsport",
      "image_url": "/images/f1-japan.png",
      "package_count": "2",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### 5. Get Event Packages

```http
GET /api/events/1/packages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "name": "F1 Japan Grand Prix",
      "event_date": "2025-10-18"
    },
    "packages": [
      {
        "id": 1,
        "name": "F1 Japan - Premium Package",
        "description": "VIP access to all race days...",
        "base_price": "89999.00",
        "duration_days": 4,
        "inclusions": ["Race tickets (3 days)", "VIP hospitality", ...],
        "max_travelers": 10
      }
    ]
  }
}
```

#### 6. Generate Quote

```http
POST /api/quotes/generate
Content-Type: application/json

{
  "lead_id": 1,
  "package_id": 1,
  "travelers": 4,
  "travel_date": "2025-06-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quote_id": 1,
    "lead_id": 1,
    "package": {
      "id": 1,
      "name": "F1 Japan - Premium Package",
      "event": "F1 Japan Grand Prix"
    },
    "travelers": 4,
    "travel_date": "2025-06-01",
    "pricing": {
      "base_price": 89999.00,
      "adjustments": [
        {
          "type": "Early-Bird Discount",
          "description": "Booked 120+ days in advance",
          "percentage": -10,
          "amount": -8999.90
        },
        {
          "type": "Group Discount",
          "description": "4 travelers (4+ people)",
          "percentage": -8,
          "amount": -7199.92
        },
        {
          "type": "Weekend Surcharge",
          "description": "Event on weekend",
          "percentage": 8,
          "amount": 7199.92
        }
      ],
      "final_price": 81000.10
    },
    "lead_status": "Quote Sent"
  },
  "message": "Quote generated successfully"
}
```

## 🗄️ Database Schema

### Tables

#### events
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
description     TEXT
location        VARCHAR(255) NOT NULL
event_date      DATE NOT NULL
category        VARCHAR(100)
image_url       VARCHAR(500)
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### packages
```sql
id              SERIAL PRIMARY KEY
event_id        INTEGER REFERENCES events(id)
name            VARCHAR(255) NOT NULL
description     TEXT
base_price      DECIMAL(10, 2) NOT NULL
duration_days   INTEGER NOT NULL
inclusions      TEXT[]
max_travelers   INTEGER
image_url       VARCHAR(500)
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### leads
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) NOT NULL
phone           VARCHAR(50) NOT NULL
message         TEXT
event_id        INTEGER REFERENCES events(id)
status          VARCHAR(50) DEFAULT 'New'
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP

CHECK: status IN ('New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost')
```

#### lead_status_history
```sql
id              SERIAL PRIMARY KEY
lead_id         INTEGER REFERENCES leads(id)
from_status     VARCHAR(50)
to_status       VARCHAR(50) NOT NULL
changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
notes           TEXT
```

#### quotes
```sql
id                      SERIAL PRIMARY KEY
lead_id                 INTEGER REFERENCES leads(id)
package_id              INTEGER REFERENCES packages(id)
travelers               INTEGER NOT NULL
travel_date             DATE NOT NULL
base_price              DECIMAL(10, 2) NOT NULL
seasonal_multiplier     DECIMAL(5, 2) DEFAULT 0
early_bird_discount     DECIMAL(5, 2) DEFAULT 0
last_minute_surcharge   DECIMAL(5, 2) DEFAULT 0
group_discount          DECIMAL(5, 2) DEFAULT 0
weekend_surcharge       DECIMAL(5, 2) DEFAULT 0
final_price             DECIMAL(10, 2) NOT NULL
created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Relationships

```
events (1) ──< (N) packages
events (1) ──< (N) leads
packages (1) ──< (N) quotes
leads (1) ──< (N) quotes
leads (1) ──< (N) lead_status_history
```

## 💰 Pricing Logic

The quote generator calculates final price using these rules (applied in order):

### 1. Base Price
Starting price from the package

### 2. Seasonal Multiplier
- **June, July, December**: +20%
- **April, May, September**: +10%
- **Other months**: 0%

### 3. Early-Bird Discount
- **≥120 days before event**: -10%
- **<120 days**: 0%

### 4. Last-Minute Surcharge
- **<15 days before event**: +25%
- **≥15 days**: 0%

### 5. Group Discount
- **≥4 travelers**: -8%
- **<4 travelers**: 0%

### 6. Weekend Surcharge
- **Event on Saturday or Sunday**: +8%
- **Event on weekday**: 0%

### Example Calculation

```
Base Price: ₹89,999
Event Date: October 18, 2025 (Saturday)
Travel Date: June 1, 2025
Travelers: 4

Calculations:
1. Base: ₹89,999.00
2. Seasonal (October): +0% = ₹0
3. Early Bird (139 days): -10% = -₹8,999.90
4. Last Minute: +0% = ₹0
5. Group (4 people): -8% = -₹7,199.92
6. Weekend: +8% = +₹7,199.92

Final Price: ₹81,000.10
```

## 🔄 Lead Workflow

### Status Flow Diagram

```
New
 ↓
Contacted
 ↓
Quote Sent
 ↓
Interested
 ↓
Closed Won / Closed Lost
```

### Status Descriptions

- **New**: Initial lead created
- **Contacted**: First contact made with lead
- **Quote Sent**: Quote generated and sent to lead
- **Interested**: Lead expressed interest in proceeding
- **Closed Won**: Deal successfully closed
- **Closed Lost**: Lead did not convert

### Automatic Transitions

- Quote generation automatically updates status to "Quote Sent"

### Status History

Every status change is recorded in `lead_status_history` with:
- Previous status
- New status
- Timestamp
- Optional notes

## 🚀 Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create sports-travel-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
heroku run npm run seed
```

### Option 2: Railway

1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically on push

### Option 3: DigitalOcean App Platform

1. Create new app from GitHub
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

### Option 4: AWS (EC2 + RDS)

```bash
# EC2 Setup
1. Launch EC2 instance (Ubuntu)
2. Install Node.js and PostgreSQL client
3. Clone repository
4. Install dependencies
5. Use PM2 for process management

# RDS Setup
1. Create PostgreSQL RDS instance
2. Configure security groups
3. Update .env with RDS credentials

# PM2 Commands
pm2 start src/server.js --name sports-travel-api
pm2 startup
pm2 save
```

## 🔧 Production Improvements

### High Priority

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, Sales, Customer)
   - API key authentication for external integrations

2. **Rate Limiting**
   - Prevent abuse with express-rate-limit
   - Different limits for authenticated vs. public endpoints

3. **Logging & Monitoring**
   - Winston for structured logging
   - Sentry for error tracking
   - New Relic or Datadog for APM

4. **Database Optimizations**
   - Connection pooling configuration
   - Query optimization and indexing
   - Read replicas for scaling

5. **Caching**
   - Redis for frequently accessed data
   - Cache events and packages
   - Cache invalidation strategy

### Medium Priority

6. **Email Notifications**
   - Send quote to lead's email
   - Status change notifications
   - Admin alerts for new leads

7. **File Uploads**
   - Upload package images to S3/Cloudinary
   - Event brochures and documents

8. **Advanced Filtering**
   - Full-text search for leads
   - Date range filters
   - Multi-field sorting

9. **Webhooks**
   - Notify external systems on events
   - CRM integration (Salesforce, HubSpot)

10. **API Versioning**
    - `/api/v1/` prefix
    - Backward compatibility

### Nice to Have

11. **GraphQL API**
    - Alternative to REST
    - Better for complex queries

12. **Real-time Updates**
    - WebSocket for live status updates
    - Socket.io integration

13. **Automated Testing**
    - Jest for unit tests
    - Supertest for integration tests
    - 80%+ code coverage

14. **CI/CD Pipeline**
    - GitHub Actions
    - Automated testing
    - Automated deployment

15. **Documentation**
    - Swagger/OpenAPI spec
    - Auto-generated API docs
    - Postman collection

## 📝 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm run reset      # Drop, migrate, and seed database
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -l | grep sports_travel_db

# Test connection
psql -U postgres -d sports_travel_db -c "SELECT 1;"
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 📄 License

MIT

---

**Built with ❤️ for Sports Travel Package Platform**
