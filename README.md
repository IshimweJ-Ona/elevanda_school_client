# Elevanda School Client

Version 1 is a focused Parent Portal and Parent Authentication System. The current application contains a Node/Express backend, Prisma/MySQL database layer, and a React/Vite frontend for parent registration, login, approval waiting, dashboard, and profile management.

This version intentionally does not include student dashboards, teacher dashboards, finance dashboards, or a full admin UI. Admin approval exists through protected backend API endpoints so parent access can be controlled.

## Current Scope

Included:

- Parent public registration
- Parent login
- JWT access-token authentication
- Server-side sessions stored in the database
- Parent profile creation during registration
- Device record creation during registration
- Login blocking until admin approval
- Admin protected endpoints for pending device approval and denial
- Parent dashboard placeholder
- Parent profile/settings page
- Email attempt flow for registration, login, approval, and denial
- Local frontend and backend dev servers from one backend command

Not included in Version 1:

- Student dashboard implementation
- Teacher dashboard implementation
- Full admin frontend dashboard
- Fees/payments implementation
- Attendance/results implementation
- Password reset UI flow

## Repository Structure

```text
elevanda_school_client/
  backend/
    prisma/
      schema.prisma
      migrations/
    scripts/
      create-admin.js
    src/
      app.js
      server.js
      config/
      controllers/
      dtos/
      middlewares/
      routes/
      services/
      utils/
    package.json
  frontend/
    src/
      app/
        components/
        context/
        lib/
        pages/
        routes.tsx
      styles/
    package.json
  package.json
  README.md
```

## Tech Stack

Backend:

- Node.js
- Express
- Prisma ORM
- MySQL
- JSON Web Tokens
- Database-backed sessions
- Nodemailer email service with configurable SMTP or test transport

Frontend:

- React
- Vite
- React Router
- Tailwind CSS
- Lucide icons
- Sonner toast notifications

## Prerequisites

Install these before running the system:

- Node.js 20 or newer
- npm 10 or newer
- MySQL 8 or compatible MySQL server
- Git

Check versions:

```bash
node --version
npm --version
mysql --version
```

## Fresh Setup After Git Pull

From a clean machine or after cloning/pulling the repository:

```bash
git clone <your-repo-url>
cd elevanda_school_client
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Return to the backend folder:

```bash
cd ../backend
```

## Database Setup

Create a MySQL database. Example:

```sql
CREATE DATABASE elevanda_school_client CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Create or update `backend/.env`.

Example:

```env
PORT=5000
DATABASE_URL="mysql://root:your_password@localhost:3306/elevanda_school_client"

JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES="24h"

ADMIN_EMAIL="admin@school.local"
ADMIN_PHONE="+250780000000"
ADMIN_PASSWORD="Admin123!"
ADMIN_NAME="Administrator"

EMAIL_TEST=true
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="no-reply@elevandaschool.com"
EMAIL_SECURE=false

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
```

Important:

- `DATABASE_URL` and `JWT_SECRET` are required.
- Use a strong unique `JWT_SECRET` outside development.
- `EMAIL_TEST=true` is the safest local option because it avoids blocked SMTP/firewall issues.
- If using real SMTP, set `EMAIL_TEST=false` or remove it, then provide `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, and `EMAIL_SECURE`.

Generate Prisma Client:

```bash
npm run prisma:generate
```

Apply migrations:

```bash
npm run prisma:migrate
```

Seed/create the admin account:

```bash
npm run seed-admin
```

The admin is needed to approve parent devices/accounts through the protected device approval API.

## Running The App

Run both backend and frontend from the backend folder:

```bash
cd backend
npm run dev
```

Expected URLs:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

The terminal should show labeled logs:

```text
[backend] Backend running at http://localhost:5000
[frontend] Local: http://localhost:5173/
```

You can also run each side separately:

Backend only:

```bash
cd backend
npm run dev:server
```

Frontend only:

```bash
cd frontend
npm run dev -- --host localhost --port 5173
```

## Production Build Check

Build the frontend:

```bash
cd frontend
npm run build
```

Validate Prisma schema:

```bash
cd backend
npx prisma validate
```

Start backend in production mode:

```bash
cd backend
npm start
```

## Current Authentication Flow

### Parent Registration

Frontend route:

```text
/register
```

Backend endpoint:

```http
POST /api/auth/register
```

Expected payload:

```json
{
  "name": "Parent Name",
  "email": "parent@example.com",
  "phone_number": "+250780000001",
  "password": "Password123!"
}
```

What happens:

- User is created with role `PARENT`.
- User starts unverified.
- Parent profile row is created.
- Device row is created and starts unverified.
- Registration pending email is attempted.
- User is redirected to the registration pending page.

Supported Rwanda phone formats:

- `+2507XXXXXXXX`
- `2507XXXXXXXX`
- `07XXXXXXXX`

The backend normalizes accepted phone numbers to `+2507XXXXXXXX`.

### Parent Login Before Approval

Backend endpoint:

```http
POST /api/auth/login
```

Payload using email:

```json
{
  "email": "parent@example.com",
  "password": "Password123!"
}
```

Payload using phone:

```json
{
  "phone_number": "+250780000001",
  "password": "Password123!"
}
```

If the parent is not approved, login returns:

```json
{
  "message": "Your account is pending admin approval. You will be notified by email once your device is approved.",
  "code": "DEVICE_NOT_VERIFIED",
  "role": "PARENT"
}
```

The frontend sends the user to:

```text
/registration-pending
```

### Admin Login

Use the seeded admin credentials from `.env`.

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "admin@school.local",
  "password": "Admin123!"
}
```

The response contains a JWT token. Use that token for approval endpoints.

## Admin Approval API

There is no full admin frontend in Version 1. Use the API directly with an admin token.

### View Pending Devices

```http
GET /api/devices/pending
Authorization: Bearer <admin-token>
```

Example curl:

```bash
curl -H "Authorization: Bearer <admin-token>" http://localhost:5000/api/devices/pending
```

### Approve Parent Device

```http
PATCH /api/devices/verify/:deviceId
Authorization: Bearer <admin-token>
```

Example:

```bash
curl -X PATCH -H "Authorization: Bearer <admin-token>" http://localhost:5000/api/devices/verify/<device-id>
```

Approval updates:

- Device `isVerified` to `true`
- Device `verifiedAt`
- Device `verifiedById`
- User `isVerified` to `true`
- Approval email is attempted

After approval, the parent can log in and access protected parent routes.

### Deny Parent Device

```http
DELETE /api/devices/deny/:deviceId
Authorization: Bearer <admin-token>
```

Example:

```bash
curl -X DELETE -H "Authorization: Bearer <admin-token>" http://localhost:5000/api/devices/deny/<device-id>
```

Denial deletes the device record and attempts a denial email. The user remains unable to log in because no verified device exists.

## Protected Parent APIs

All protected APIs require:

```http
Authorization: Bearer <token>
```

### Current User Profile

```http
GET /api/user/profile
```

### Update User Profile

```http
PATCH /api/user/profile
```

Allowed fields:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone_number": "+250780000002",
  "password": "NewPassword123!"
}
```

### Parent Dashboard

```http
GET /api/parent/dashboard
```

This route is protected by:

- JWT authentication
- `PARENT` role check
- verified device check

Unapproved users cannot access this API.

## Frontend Routes

Public routes:

- `/login`
- `/register`
- `/registration-pending`
- `/device-verification`
- `/session-expired`

Protected routes:

- `/app/dashboard`
- `/app/parent`
- `/app/profile`

Protected routes are wrapped by `RequireAuth`. If there is no valid stored token/session, the user is sent to `/login`.

## Frontend Auth Persistence

The frontend stores auth data in local storage under:

```text
elevanda-school-auth
```

Stored data includes:

- `user`
- `token`

On page refresh:

- The frontend reads the stored token.
- It calls `/api/user/profile`.
- If the profile request fails, local auth data is cleared.

## Email System

The current implementation uses Nodemailer with two modes.

### Local Test Mode

Recommended for local development:

```env
EMAIL_TEST=true
```

In this mode, email messages are logged rather than sent through a real SMTP provider.

### SMTP Mode

Use this only when your provider and firewall allow SMTP:

```env
EMAIL_TEST=false
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-user
EMAIL_PASS=your-password
EMAIL_FROM=no-reply@elevandaschool.com
```

Email failures are caught and logged. They do not block registration, login, approval, or denial flows.

Email events currently attempted:

- Parent registration pending notice
- Login notification
- Approval decision notification
- Admin-created account notification helper

## Health Check

Backend health endpoint:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

## API Summary

Auth:

```text
POST /api/auth/register
POST /api/auth/login
```

User:

```text
GET   /api/user/profile
PATCH /api/user/profile
```

Parent:

```text
GET /api/parent/dashboard
```

Device approval:

```text
GET    /api/devices/pending
PATCH  /api/devices/verify/:deviceId
DELETE /api/devices/deny/:deviceId
```

Docs:

```text
GET /api/docs
```

## Current Database Models

The current Prisma schema contains:

- `User`
- `Parent`
- `Device`
- `Session`

Current enum:

- `user_role`
  - `ADMIN`
  - `PARENT`

Current approval fields:

- `User.isVerified`
- `Device.isVerified`
- `Device.verifiedAt`
- `Device.verifiedById`

## Security Notes

Current safeguards:

- JWT-based authentication
- Database session validation on every protected request
- Role middleware for admin-only and parent-only routes
- Device verification middleware for parent dashboard access
- Rate limiting
- Helmet security headers
- CORS allow-list from environment variables
- Passwords are hashed before storage

Operational recommendations:

- Use a strong `JWT_SECRET`.
- Do not commit `.env`.
- Use HTTPS in production.
- Use production-safe CORS origins only.
- Rotate admin credentials before deployment.
- Use a production-grade email provider if SMTP is unreliable.

## Troubleshooting

### Backend does not start

Check:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev:server
```

Confirm `.env` includes:

```env
DATABASE_URL=
JWT_SECRET=
```

### Prisma cannot connect to MySQL

Check that:

- MySQL server is running.
- Database exists.
- Username/password in `DATABASE_URL` are correct.
- Port is correct, usually `3306`.

Validate schema:

```bash
cd backend
npx prisma validate
```

### Parent cannot log in

Expected before approval. Check pending devices:

```bash
curl -H "Authorization: Bearer <admin-token>" http://localhost:5000/api/devices/pending
```

Then approve:

```bash
curl -X PATCH -H "Authorization: Bearer <admin-token>" http://localhost:5000/api/devices/verify/<device-id>
```

### Frontend cannot reach backend

Check:

- Backend is running at `http://localhost:5000`.
- Frontend is running at `http://localhost:5173`.
- `CORS_ORIGINS` contains `http://localhost:5173`.
- `VITE_API_BASE_URL` is either unset or set to `http://localhost:5000`.

Optional frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Email errors appear in terminal

For local development, use:

```env
EMAIL_TEST=true
```

Email warnings should not stop registration, login, or approval.

### Windows sandbox or permission errors

If a command fails with `EPERM` under a sandboxed terminal, run the same command in a normal terminal from the project directory:

```bash
cd elevanda_school_client/backend
npm run prisma:generate
```

or:

```bash
cd elevanda_school_client/frontend
npm run build
```

## Verified During Latest Audit

The following checks were run successfully on the current codebase:

```bash
cd backend
npx prisma validate
```

Result:

```text
The schema at prisma/schema.prisma is valid
```

Backend import check:

```bash
cd backend
node -e "require('./src/app'); console.log('backend app loaded')"
```

Result:

```text
backend app loaded
```

Frontend production build:

```bash
cd frontend
npm run build
```

Result:

```text
vite build completed successfully
```

## Recommended Manual End-to-End Test

1. Start MySQL.
2. Configure `backend/.env`.
3. Run:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed-admin
npm run dev
```

4. Open `http://localhost:5173/register`.
5. Register a parent.
6. Confirm the browser shows the pending approval page.
7. Log in as admin via `POST /api/auth/login`.
8. Call `GET /api/devices/pending` with the admin token.
9. Approve the device with `PATCH /api/devices/verify/:deviceId`.
10. Log in as the parent.
11. Confirm the parent reaches `/app/parent`.
12. Confirm `/api/parent/dashboard` works only with the approved parent token.

## Development Rules For Version 1

Keep Version 1 focused:

- Do not add student pages.
- Do not add teacher pages.
- Do not add full admin dashboards.
- Keep admin work limited to approval APIs unless a future version explicitly adds an admin frontend.
- Keep parent auth and approval behavior stable.

Future systems can be added later by extending the schema, adding role-specific route modules, and adding new frontend route groups.
