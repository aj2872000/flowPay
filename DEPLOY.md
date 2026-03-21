# FlowPay — Vercel Deployment Guide

## Important: cron jobs won't run on Vercel free tier

The retry job (billing-service) and webhook retry job (event-service) use
node-cron which requires a persistent process. On Vercel they won't run
automatically. For a demo this is fine — payments process immediately on
subscription creation and can be manually retried from the UI.

If you need background jobs later, use Vercel Cron Jobs (Pro plan) or
Railway/Render for those two services.

--

## Step 1 — MongoDB Atlas setup

1. Go to cloud.mongodb.com → create a FREE cluster (M0)
2. Database Access → Add user (e.g. flowpay / your-password)
3. Network Access → Add IP → Allow from anywhere: 0.0.0.0/0
4. Connect → Drivers → copy the connection string

You need 4 separate databases (one per service that uses MongoDB):
- flowpay_auth
- flowpay_accounts  
- flowpay_billing
- flowpay_events

The connection strings are the same except the database name at the end:
  mongodb+srv://user:pass@cluster.mongodb.net/flowpay_auth?retryWrites=true&w=majority
  mongodb+srv://user:pass@cluster.mongodb.net/flowpay_accounts?retryWrites=true&w=majority
  etc.

---

## Step 2 — Deploy each service to Vercel

Deploy in this order (gateway last, UI last):

### 2a. Using Vercel CLI (recommended)

```bash
npm install -g vercel

# Deploy auth-service
cd auth-service
vercel --prod
# Follow prompts, then set env vars:
vercel env add MONGO_URI production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production    # value: production
vercel env add CORS_ORIGIN production  # value: https://your-ui.vercel.app (set after UI deploy)
vercel --prod  # redeploy after env vars

# Repeat for each service:
cd ../account-service  && vercel --prod
cd ../billing-service  && vercel --prod
cd ../event-service    && vercel --prod
cd ../payment-simulator-service && vercel --prod
cd ../api-gateway      && vercel --prod
```

### 2b. Using Vercel Dashboard

1. Go to vercel.com → New Project → Import Git Repository
2. Set Root Directory to the service folder (e.g. auth-service)
3. Framework Preset: Other
4. Build Command: (leave empty)
5. Output Directory: (leave empty)
6. Add Environment Variables from .env.example
7. Deploy

Repeat for each of the 6 services.

---

## Step 3 — Wire the services together

After deploying all services, you'll have URLs like:
  auth:      https://flowpay-auth-xxx.vercel.app
  accounts:  https://flowpay-account-xxx.vercel.app
  billing:   https://flowpay-billing-xxx.vercel.app
  events:    https://flowpay-event-xxx.vercel.app
  simulator: https://flowpay-simulator-xxx.vercel.app
  gateway:   https://flowpay-gateway-xxx.vercel.app

Go to each service in Vercel Dashboard → Settings → Environment Variables
and update the URLs to point to the real deployed services.

billing-service needs:
  PAYMENT_SIMULATOR_URL = https://flowpay-simulator-xxx.vercel.app
  EVENT_SERVICE_URL     = https://flowpay-event-xxx.vercel.app

api-gateway needs:
  AUTH_SERVICE_URL      = https://flowpay-auth-xxx.vercel.app
  ACCOUNT_SERVICE_URL   = https://flowpay-account-xxx.vercel.app
  BILLING_SERVICE_URL   = https://flowpay-billing-xxx.vercel.app
  EVENT_SERVICE_URL     = https://flowpay-event-xxx.vercel.app
  PAYMENT_SIMULATOR_URL = https://flowpay-simulator-xxx.vercel.app

Redeploy each service after updating env vars.

---

## Step 4 — Deploy the UI

The UI (flow-pay-ui) is already Vercel-native — no changes needed.

1. Deploy flow-pay-ui to Vercel (root directory: flow-pay-ui)
2. Set: VITE_API_URL = https://flowpay-gateway-xxx.vercel.app
3. Remove the proxy from vite.config.js (not needed in production)

---

## Step 5 — Verify

Hit the health endpoints:
  curl https://flowpay-auth-xxx.vercel.app/health
  curl https://flowpay-gateway-xxx.vercel.app/health

Register an admin:
  curl -X POST https://flowpay-auth-xxx.vercel.app/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Admin","email":"admin@demo.com","password":"Admin123!"}'

Then promote to admin via MongoDB Atlas Data Explorer:
  Collection: users
  Filter: { "email": "admin@demo.com" }
  Update: { "$set": { "role": "admin" } }

---

## Limitations on Vercel free tier

| Feature          | Status  | Notes                                    |
|------------------|---------|------------------------------------------|
| Auth / login     | Works   |                                          |
| Plans / billing  | Works   |                                          |
| Payments         | Works   | Immediate charge on subscription create  |
| Automatic retry  | Limited | Cron job won't run; manual retry works   |
| Webhooks         | Works   | Fan-out on event publish                 |
| Webhook retry    | Limited | Cron job won't run                       |
| Cold start       | Slow    | First request ~2-3s; subsequent < 200ms  |

