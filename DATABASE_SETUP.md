# Database Setup Instructions

## Prerequisites
- PostgreSQL installed and running on localhost:5432
- Node.js and npm installed

## Setup Steps

### 1. Initialize Database Schema
Run the database initialization script to create all necessary tables:

```bash
cd c:\Users\jcmac\Finance
node init-db.js
```

This script will:
- Create `users` table
- Create `transactions` table
- Create `recurring_expenses` table (new - for recurring bills/payments)
- Create indexes for performance
- Create useful views

### 2. Verify Database Setup
Check the health endpoint:

```bash
curl http://localhost:5000/health
```

### 3. Start the Backend Server
```bash
node app.js
```

You should see:
```
🚀 Server is running on http://localhost:5000
```

## Database Tables

### users
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- created_at
- updated_at

### transactions
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users.id)
- description
- amount
- category
- type (income or expense)
- date
- created_at
- updated_at

### recurring_expenses (NEW)
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users.id)
- name
- amount
- frequency (weekly, biweekly, or monthly)
- category
- description
- last_added
- created_at
- updated_at

## New API Endpoints

### Recurring Expenses
- `GET /recurring-expenses` - Get all recurring expenses for user
- `POST /recurring-expenses` - Create new recurring expense
- `PUT /recurring-expenses/:id` - Update recurring expense
- `DELETE /recurring-expenses/:id` - Delete recurring expense

### Transaction Management
- `DELETE /transactions/:id` - Delete a transaction (NEW)

## Troubleshooting

### "Table already exists" errors
This is normal if you've already run the init script. The script uses `CREATE TABLE IF NOT EXISTS` so it won't recreate tables.

### Connection refused errors
Make sure PostgreSQL is running:
```bash
# On Windows, check Services or:
postgres.exe
```

### Port 5000 already in use
Change the PORT in .env file or app.js, or kill the process using port 5000.

## Features

The Finance AI app now supports:
- ✅ Transaction tracking (income/expense)
- ✅ Recurring expense management (weekly, bi-weekly, monthly)
- ✅ Category-based expense tracking
- ✅ Dashboard with analytics
- ✅ Delete transactions
- ✅ Delete recurring expenses
- ✅ AI-powered financial advice

## Next Steps

1. Start the backend server: `node app.js`
2. Start the frontend app: `npm run dev` (from finance-app folder)
3. Navigate to http://localhost:5173
4. Register and start tracking expenses!
