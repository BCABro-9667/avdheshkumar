# Avdhesh Kumar Portfolio + CMS

A full-stack personal portfolio platform built with **React + Vite + TypeScript** on the frontend and **Express + MongoDB** on the backend.  
It includes a public portfolio website, a protected admin CMS, inquiry management, dynamic SEO controls, media uploads, likes, and donation/payment flows.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Admin CMS Capabilities](#admin-cms-capabilities)
- [Build and Deployment](#build-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Notes for Production](#notes-for-production)

---

## Overview

This repository serves a content-driven developer portfolio with:

- Public pages (home, about, projects, blog, gallery, contact)
- Project and blog detail pages
- A protected `/admin` panel for content management
- Dynamic sitemap and robots generation
- Optional MongoDB persistence with in-memory fallback when DB is unavailable

The app runs as a single Node process during development (`tsx server.ts`) and serves both API routes and frontend.

---

## Key Features

### Public Website
- Portfolio landing experience with multiple sections and dedicated pages
- Project/blog filtering and search
- Gallery and testimonials
- Contact form and popup lead capture
- User feedback modal
- Like counters for projects and blog posts

### Admin Panel
- JWT-based authentication
- Dashboard stats
- CRUD for Projects, Blogs, Gallery, and Categories
- SEO settings per page
- Social/profile settings management
- Resume upload
- Inquiry management (contact/popup/feedback)

### Backend/Platform
- MongoDB models for all content domains
- Cloudinary integration for media uploads
- Razorpay order creation + signature verification
- Dynamic `sitemap.xml` and `robots.txt`
- Safe operation in limited environments via in-memory fallbacks

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide Icons

### Backend
- Node.js + Express 4
- TypeScript (tsx runtime in dev)
- Mongoose 9
- JWT (`jsonwebtoken`)
- Multer (memory storage)
- Cloudinary SDK
- Razorpay SDK

### Tooling
- esbuild (server bundling for production)
- TypeScript compiler (`tsc`) for lint/type checks

---

## Project Structure

```text
.
├── server.ts                  # Express server + API routes + Vite/static serving
├── src/
│   ├── App.tsx               # Main client-side router/view switcher
│   ├── components/           # UI components + admin components
│   ├── pages/                # Dedicated page components
│   ├── context/              # Shared React context (site settings)
│   └── server/
│       ├── db.ts             # Mongo connection + default seeding
│       ├── models.ts         # Mongoose models
│       ├── auth.ts           # JWT generation/verification middleware
│       ├── adminAuthUtil.ts  # Admin auth strategies + diagnostics
│       ├── cloudinary.ts     # Upload/delete helpers
│       ├── razorpay.ts       # Payment utility functions
│       └── phonepe.ts        # Sandbox-friendly PhonePe utility module
├── public/                   # Static assets
├── .env.example              # Environment variable template
├── netlify.toml              # Netlify SPA redirects/build config
├── vercel.json               # Vercel rewrite config
└── package.json              # scripts + dependencies
```

---

## How It Works

1. `server.ts` boots Express and attempts MongoDB connection.
2. If MongoDB is connected, API reads/writes from DB.
3. If MongoDB is unavailable, many endpoints gracefully fallback to in-memory seed data.
4. In development, Vite middleware is mounted for live frontend serving.
5. In production, built assets from `dist/` are served statically with SPA fallback.

---

## Getting Started

### 1) Prerequisites
- Node.js 20+
- npm 10+
- (Optional) MongoDB database
- (Optional) Cloudinary account
- (Optional) Razorpay account

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

```bash
cp .env.example .env
```

Fill required values in `.env` (see [Environment Variables](#environment-variables)).

### 4) Run development server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

### 5) Build for production

```bash
npm run build
npm run start
```

---

## Environment Variables

Use `.env.example` as a base.

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Gemini integration key |
| `APP_URL` | Recommended | Absolute app URL (used in sitemap/robots/payment callbacks) |
| `MONGODB_URI` | Optional (strongly recommended) | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |
| `JWT_SECRET` | Recommended | JWT signing secret |
| `ADMIN_EMAIL` | Recommended | Admin login email |
| `ADMIN_PASSWORD` | Recommended | Admin login password |
| `RAZORPAY_KEY_ID` | Optional | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret key |
| `PHONEPE_MERCHANT_ID` | Optional | PhonePe merchant ID |
| `PHONEPE_SALT_KEY` | Optional | PhonePe salt key |
| `PHONEPE_SALT_INDEX` | Optional | PhonePe salt index |
| `PHONEPE_ENV` | Optional | `SANDBOX` or `PRODUCTION` |
| `PHONEPE_HOST_URL` | Optional | PhonePe base URL override |

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev | `npm run dev` | Start Express + Vite middleware in development |
| Build | `npm run build` | Build frontend + bundle server to `dist/server.cjs` |
| Start | `npm run start` | Run production server from `dist/server.cjs` |
| Preview | `npm run preview` | Vite preview |
| Clean | `npm run clean` | Remove build outputs |
| Lint/Typecheck | `npm run lint` | Type-check code (`tsc --noEmit`) |

---

## API Reference

### Auth
- `POST /api/auth/login`
- `GET /api/auth/diagnostic`
- `GET /api/auth/verify` (protected)

### Public Content
- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /api/blog` / `GET /api/blogs`
- `GET /api/blog/:slug`
- `GET /api/gallery`
- `GET /api/categories`
- `GET /api/seo`
- `GET /api/seo/:page`
- `GET /api/settings`

### Public Engagement
- `POST /api/contact`
- `POST /api/popup-lead`
- `POST /api/feedback`
- `GET /api/likes`
- `POST /api/projects/:id/like`
- `POST /api/blog/:id/like`

### Donations / Payments
- `GET /api/donations/supporters`
- `POST /api/razorpay/create-order`
- `POST /api/razorpay/verify`
- `GET /api/donations/verify/:txId`
- `POST /api/donations/simulate-success`

### Admin (Protected)
- `GET /api/admin/stats`
- `POST /api/admin/upload`
- `GET/POST/PUT/DELETE /api/admin/projects...`
- `GET/POST/PUT/DELETE /api/admin/blog...`
- `GET/POST/PUT/DELETE /api/admin/gallery...`
- `GET/POST/PUT/DELETE /api/admin/categories...`
- `PUT /api/admin/seo/:page`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/admin/resume/upload`
- `GET /api/admin/inquiries`
- `PUT /api/admin/inquiries/:id/status`
- `DELETE /api/admin/inquiries/:id`

### SEO Utility Endpoints
- `GET /sitemap.xml`
- `GET /robots.txt`

---

## Admin CMS Capabilities

Inside `/admin`, authenticated users can:

- Manage projects (including slug normalization and publish states)
- Manage blog posts with SEO metadata
- Manage gallery entries and media cleanup
- Manage categories by content type (`project`, `blog`, `gallery`)
- Update site-wide social/resume settings
- Upload resume documents
- Review and update inquiry statuses (`unread`, `read`, `replied`, `archived`)

---

## Build and Deployment

### Netlify
- Uses `netlify.toml`
- Build command: `npm run build`
- Publish directory: `dist`
- SPA rewrite: all routes to `/index.html`

### Vercel
- Uses `vercel.json`
- Rewrites public routes to `/index.html`
- Preserves `/api/*` rewrites

### Production Runtime
- Build creates:
  - Frontend assets in `dist/`
  - Bundled server at `dist/server.cjs`
- Start command:
  ```bash
  npm run start
  ```

---

## Troubleshooting

### MongoDB not connected
If `MONGODB_URI` is missing/invalid, app still runs with in-memory fallback for many features. Set a valid URI for persistent data.

### Admin login fails
Check:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `GET /api/auth/diagnostic` response

### Media uploads not working
Verify Cloudinary env variables and account credentials.

### Payment verification issues
Ensure Razorpay keys are configured and signatures are verified against the same secret.

---

## Notes for Production

- Replace all fallback/default credentials with secure production values.
- Use strong `JWT_SECRET` and private environment handling.
- Ensure `APP_URL` matches deployed domain.
- Configure proper CORS/rate limiting/WAF policies at hosting/network layer.
- Store secrets in deployment platform secret managers (never commit real secrets).

---

If you use this repository as a starter, feel free to customize branding, seed data, and admin settings to match your own portfolio identity.
