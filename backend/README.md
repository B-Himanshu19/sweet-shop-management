# Backend API - Sweet Shop Management System

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run development server:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

5. Build for production:
```bash
npm run build
npm start
```

## API Documentation

See main README.md for API endpoint documentation.

## Database

The application uses SQLite by default. The database file will be created automatically on first run.

To use PostgreSQL instead:
1. Install `pg` package
2. Update database connection in `src/database/database.ts`
3. Set `DB_CONNECTION_STRING` in `.env`

