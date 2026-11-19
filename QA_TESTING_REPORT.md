# CCMS Integration QA Report

## Scope and environment

The integration pass covered the local React + Express + MySQL application, role-based APIs, persistence and history, production bundle serving, and the Postman deliverables. The requested specification files (`SIMPLE_PROJECT_SPECIFICATION.md`, `DATABASE_SCHEMA.md`, `API_DOCUMENTATION.md`, and `DEVELOPMENT_STEPS.md`) were not present; available project documentation and implemented routes were used as the contract.

The machine reported Node.js 24.12.0 (the requested Node.js 22 runtime was not available). Local MySQL was reachable using the existing server configuration. No credential values from `server/.env` are included here.

## Executed results

| Area | Result |
|---|---|
| Database initialization | Passed. `npm run db:init` completed and was re-run idempotently; the `users`, `complaints`, and `complaint_history` tables, foreign keys, and `previous_status` history migration were verified. |
| Live API / MySQL integration | Passed: 65 assertions. Covered registration/login, JWT and current-user handling, role restrictions, complaint create/list/detail/history, admin assignment, staff scoping, status changes, history fields, persistence, and absence of password hashes in returned user data. Temporary integration records were cleaned after that run. |
| Backend automated tests | Passed: `npm test` completed with all 4 Jest/Supertest tests passing. |
| Frontend production build | Passed: `npm run build` generated the Vite bundle and copied it to `server/public`; the generated `client/dist` and served bundle file lists matched. |
| Express serving and API routing | Passed: a post-build smoke test returned HTTP 200 for `/` and a nested SPA route, `healthy` from `/api/health`, and HTTP 404 for an unknown `/api` route. |
| Vite development proxy | Passed: `/api` requests reached the Express health endpoint through the configured proxy. |
| Browser student workflow | Passed: registration, login, student dashboard, complaint submission, complaint detail, and history were exercised. |
| Browser admin workflow | Passed: admin login/dashboard, complaint list, staff assignment, and status change to `IN_PROGRESS` were exercised. |
| Browser staff workflow | Passed: assigned worklist/detail and a `RESOLVED` update were exercised. The worklist showed the resolved ticket and count afterward. |
| Student tracking after resolution | Passed: the student reopened the complaint and saw the `RESOLVED` status and the staff history entry `IN_PROGRESS` → `RESOLVED`. |
| Responsive registration | Passed: the registration page was checked at mobile width with no horizontal overflow. |
| Postman export files | Collection and environment JSON syntax plus collection structure were validated. The collection was not run inside the Postman application in this QA pass. |

## Postman artifacts

- `postman/CCMS.postman_collection.json` includes health, registration/login, current user, student statistics and complaint lifecycle, admin statistics/user and complaint list/staff creation/assignment/status, staff statistics/worklist/status, and authorization checks.
- `postman/CCMS.postman_environment.json` supplies `baseUrl`, the student/admin/staff tokens, `complaintId`, and local demo login inputs. The collection saves JWTs and IDs after the corresponding requests.

Import both files into Postman, choose **CCMS Local**, and run the collection in order. Registration and staff creation are opt-in via their environment flags; the default seeded demo accounts avoid creating new users during routine runs. Complaint requests create and update database rows, so use a test database. The sample accounts are seeded for local evaluation only; change their credentials or use accounts in your own database before sharing or deploying an instance.

## Production runbook

1. Install Node.js 22 LTS (or newer) and MySQL 8.
2. Create the database and application user; copy `server/.env.example` to `server/.env`, then set the local MySQL credentials and a strong, unique `JWT_SECRET`.
3. From the project root, install packages with `npm run install:all`.
4. Initialize the schema and local seed accounts with `npm run db:init`.
5. Build the React app and copy the bundle into Express static hosting with `npm run build`.
6. Start the single production server with `npm start`.
7. Open `http://localhost:5000`; refresh a nested frontend route to exercise SPA fallback, and check `http://localhost:5000/api/health`.

The frontend uses same-origin `/api` paths, and Express serves both the APIs and `server/public`; no separate production frontend server is required. Do not run `npm run db:init -- --force` against data you need: the force option drops the CCMS tables.

## Remaining issues and limits

- Node.js 22 itself was not available for this validation; verification ran on Node.js 24.12.0.
- The Postman collection was created for the verified API contract, but it was not imported or executed in the Postman application.
- AWS/S3 storage, Docker, and a separately hosted frontend are intentionally not part of this local deployment.
- The project seeds predictable demo credentials when the users table is empty. They are for local evaluation only and must be replaced/removed for any non-demo deployment.
