# Court Files

Frontend platform for advocates to register court cases, schedule hearings, track history, and share cause lists.

## Features

- Account registration with OTP verification (demo OTP shown on screen; no SMS backend)
- Forgot password sends a time-limited reset link by email (Gmail SMTP)
- Dashboard: today's, tomorrow's, and all-case counts
- Court tabs: Civil / Session / High Courts with shareable case lists
- Add New Case with parties, judge, advocate side, next hearing, client info
- Calendar with dots on hearing dates
- Search by name, case ID, or ID card
- Hearing history when updating next dates

Data is stored on the Court Files API (Express + Supabase); the API base URL
comes from the `REACT_APP_API_URL` environment variable.

## Scripts

```bash
npm start
npm test
npm run build
```

## Deploy to EC2 (CI/CD)

GitHub Actions → separate frontend EC2 (Nginx static SPA).

See **[deploy/README.md](./deploy/README.md)** for setup, secrets, and the workflow in `.github/workflows/deploy-ec2.yml`.

## Deploy to Vercel

`vercel.json` sets the Create React App preset and rewrites all routes to
`index.html` so React Router deep links work.

1. Import this repo as a new Vercel project (framework is auto-detected).
2. Set the environment variable in **Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | deployed API URL **including `/api`**, e.g. `https://your-backend.vercel.app/api` |

3. Deploy. Also add this frontend URL to the backend's `CORS_ORIGIN`.
