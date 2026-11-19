# CCMS Frontend

The React application uses Vite, Tailwind CSS, React Router, and Axios. API requests use relative `/api` paths.

## Development

Run the Express server with `npm run server` from the repository root, then start Vite with `npm run dev` from `client/`. Vite proxies `/api` and `/uploads` to the Express server.

## Production build

Run `npm run build` from the repository root, or `npm run build` from this directory. Vite first creates `client/dist`; the build script then copies it into `server/public` for Express to serve.
