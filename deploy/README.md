# Deploy Court Files Frontend to EC2

This repo deploys to its **own** EC2 instance via GitHub Actions (separate from the API EC2).

## Architecture

```
GitHub Actions (npm run build) → rsync → Frontend EC2
                                        ↓
                              /var/www/court-files
                                        ↓
                              Nginx serves SPA (:80/:443)
```

The browser talks to the **API EC2** using `REACT_APP_API_URL` baked in at build time.

## One-time EC2 setup

1. Launch Ubuntu 22.04/24.04 EC2 (t3.micro is often enough for static files).
2. Security group inbound: **22** (your IP), **80**, **443**.
3. SSH in, clone/copy this repo once, then:

```bash
cd court_files
bash deploy/ec2-setup.sh
```

4. Edit Nginx `server_name`, point DNS, run Certbot for HTTPS.

## GitHub Actions secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Example |
|--------|---------|
| `EC2_HOST` | Frontend EC2 IP or `app.yourdomain.com` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Private key PEM for this instance |
| `EC2_APP_DIR` | Optional; default `/var/www/court-files` |
| `REACT_APP_API_URL` | `https://api.yourdomain.com/api` |

### SSH key

Use a **different** deploy key than the backend instance (recommended):

```bash
ssh-keygen -t ed25519 -C "github-actions-court-fe" -f court-fe-deploy -N ""
# Public → frontend EC2 authorized_keys
# Private → this repo's EC2_SSH_KEY secret
```

## Workflow

File: `.github/workflows/deploy-ec2.yml`

- Triggers on push to `main` / `master`, or manual **Run workflow**
- Builds CRA with `REACT_APP_API_URL`
- Syncs `build/` to `/var/www/court-files`
- Reloads Nginx

## Manual deploy

```bash
export REACT_APP_API_URL=https://api.yourdomain.com/api
npm ci && npm run build
rsync -az --delete -e "ssh -i your.pem" \
  build/ ubuntu@FE_EC2_HOST:/var/www/court-files/
ssh -i your.pem ubuntu@FE_EC2_HOST 'sudo nginx -t && sudo systemctl reload nginx'
```

## Cross-service checklist

After both EC2s are live:

| Setting | Where | Value |
|---------|--------|--------|
| `REACT_APP_API_URL` | Frontend GitHub secret | `https://api…/api` |
| `CORS_ORIGIN` | Backend EC2 `.env` | `https://app.yourdomain.com` |
| `FRONTEND_URL` | Backend EC2 `.env` | `https://app.yourdomain.com` |
| `API_PUBLIC_URL` | Backend EC2 `.env` | `https://api.yourdomain.com` |

## Notes

- No Node process is required on the frontend EC2 for production serving.
- Changing the API URL requires a **new frontend build** (CI secret + redeploy).
- SPA routes work via Nginx `try_files … /index.html`.
