# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Backend API

Browser requests use the same-origin `API_PROXY` prefix. During development,
Vite proxies `API_PROXY/*` to `API_URL` and removes the proxy prefix. In production, the
edge proxy must provide the same behavior by routing `/api/*` directly to the
backend and stripping `/api` before forwarding.

React Router loaders and actions bypass that proxy. They use `API_URL` directly
and convert the incoming HTTP-only `authToken` cookie into an Authorization
bearer header for server-to-server requests.

## Configuration

`server-runtime-config.server.ts` validates `process.env` with Zod and exposes
the validated server-only values without transforming or deriving fields. The
API loader and action wrappers provide it as `serverConfig`, alongside `api`.

`public-runtime-config.ts` validates only browser-safe environment values. The
root layout writes that unchanged result to `window.ENV` before the client
bundle runs. Isomorphic components can import `publicRuntimeConfig` without
importing any server configuration. Callers are responsible for conversions
and derived values.

`API_URL` remains server-only. `API_PROXY`, `API_TIMEOUT_MS`, and `NODE_ENV` are
included in the public configuration.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
