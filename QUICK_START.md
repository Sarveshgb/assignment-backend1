# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check PostgreSQL (should be 14+)
psql --version
```

## Step-by-Step Setup

### 1. Database Setup

```bash
# Start PostgreSQL service (if not running)
# macOS with Homebrew:
brew services start postgresql

# Ubuntu/Debian:
sudo service postgresql start

# Windows:
# Start from Services or pgAdmin

# Create database
psql -U postgres
CREATE DATABASE sports_travel_db;
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd sports-travel-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (update database credentials)
nano .env  # or use your preferred editor

# Run migrations and seed data
npm run reset

# Start development server
npm run dev
```

### 3. Verify Installation

```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

### 4. Test API Endpoints

```bash
# Get all events
curl http://localhost:3000/api/events

# Create a lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "message": "Test inquiry"
  }'

# Generate a quote
curl -X POST http://localhost:3000/api/quotes/generate \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": 1,
    "package_id": 1,
    "travelers": 4,
    "travel_date": "2025-06-01"
  }'
```

## Common Issues & Solutions

### Issue: Database connection failed

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# Verify credentials in .env
cat .env | grep DB_

# Test connection manually
psql -U postgres -d sports_travel_db
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
echo "PORT=3001" >> .env
```

### Issue: Migration fails

**Solution:**
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE IF EXISTS sports_travel_db;
CREATE DATABASE sports_travel_db;
\q

# Run migrations again
npm run migrate
npm run seed
```

## Using Postman

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json`

2. **Set Environment:**
   - Create new environment
   - Add variable: `base_url` = `http://localhost:3000/api`

3. **Test Endpoints:**
   - Start with "Health Check"
   - Then try "Get All Events"
   - Create a lead
   - Generate a quote

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints in Postman
- Check the pricing logic in `src/utils/pricing.js`
- Review the database schema in `src/database/migrate.js`

## Development Workflow

```bash
# Make changes to code
# Server auto-reloads with nodemon

# Reset database if schema changes
npm run reset

# Check logs in terminal
# All requests are logged automatically
```

## Production Deployment

See the [Deployment section in README.md](README.md#-deployment) for:
- Heroku deployment
- Railway deployment
- AWS deployment
- Environment variable configuration

---

**Need help?** Check the troubleshooting section in README.md
