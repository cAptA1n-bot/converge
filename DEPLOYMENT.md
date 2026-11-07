# Deployment Guide — Converge Platform

This guide explains how to deploy the Converge platform with the **Backend on Render** and the **Frontend on Vercel**.

---

## Architecture Overview

```
┌─────────────────────────────────┐           ┌───────────────────────────────────┐
│       Frontend (Vercel)         │           │        Backend (Render)           │
│  https://converge.vercel.app    │           │  https://converge-api.onrender.com │
│                                 │           │                                   │
│  • Next.js 16 App Router        │ ──CORS──> │  • Node.js / Express 5            │
│  • NEXT_PUBLIC_API_URL          │ <─Cookie─ │  • JWT in HTTP-Only Cookie        │
│  • credentials: "include"       │           │  • SameSite=None; Secure          │
└─────────────────────────────────┘           └───────────────────────────────────┘
                                                                │
                                                                ▼
                                              ┌───────────────────────────────────┐
                                              │       Database (MongoDB Atlas)    │
                                              └───────────────────────────────────┘
```

---

## Step 1: Deploy Backend to Render

### Option A: Using the Render Blueprint (`render.yaml`) — Recommended

1. Push your repository to GitHub.
2. Log in to [Render](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect the [`render.yaml`](./render.yaml) file.
5. Provide the required environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string (at least 32 characters).
   - `FRONTEND_URL`: Temporary or final Vercel URL (e.g. `https://your-app.vercel.app` or `http://localhost:3000`).
6. Click **Apply**.

### Option B: Manual Web Service Setup on Render

1. Log in to [Render](https://dashboard.render.com) and click **New +** → **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Name**: `converge-backend`
   - **Region**: Oregon (or your preferred region)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** and set:
   - **Health Check Path**: `/api/v1/health`
5. Add the **Environment Variables**:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables `SameSite=None; Secure` cookies for cross-domain auth |
   | `PORT` | `5000` | Port used by the service |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB connection URI |
   | `JWT_SECRET` | `your_secret_key` | Secret key for JWT signing |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Vercel domain (without trailing slash) |
6. Click **Create Web Service**.
7. Once deployed, copy your Render service URL (e.g., `https://converge-backend.onrender.com`).
8. Verify it by visiting `https://converge-backend.onrender.com/api/v1/health` in your browser. You should see `{"success":true,"message":"API is running"}`.

---

## Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name**: `converge` (or your choice)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend/my-app` (Required).
5. Open the **Environment Variables** section and add:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api/v1` |
   *(Ensure you include `/api/v1` and do not add a trailing slash)*
6. Click **Deploy**.
7. Vercel will build and deploy the Next.js application.
8. Copy your production Vercel URL (e.g. `https://converge-eight.vercel.app`).

---

## Step 3: Link Vercel Domain in Render Backend

1. Return to your [Render Dashboard](https://dashboard.render.com).
2. Select your `converge-backend` service → **Environment**.
3. Update `FRONTEND_URL` with your actual Vercel URL:
   ```
   FRONTEND_URL=https://converge-eight.vercel.app
   ```
   *(Note: The backend automatically allows any `*.vercel.app` deployment, but setting your canonical domain ensures strict CORS production compliance).*
4. Save changes. Render will automatically redeploy.

---

## Verification Checklist

- [ ] **Health Check**: Open `https://your-backend.onrender.com/api/v1/health` — Returns `200 OK`.
- [ ] **Landing Page**: Open `https://your-frontend.vercel.app` — Renders the Converge landing page with logo, hero, and featured jobs.
- [ ] **Registration**: Register as a new Fresher and Freelancer on Vercel.
- [ ] **Authentication Cookie**: In browser DevTools → Application → Cookies, verify `token` is received with `SameSite=None` and `Secure=true`.
- [ ] **Session Restoration**: Refresh the page on Vercel and verify the user session remains logged in.
- [ ] **Full Flow**:
  - Freelancer posts a project opportunity (`/jobs/create`).
  - Fresher submits an application with cover letter and proposed budget (`/jobs/:jobId`).
  - Freelancer reviews and updates candidate status on `/dashboard/applications`.

