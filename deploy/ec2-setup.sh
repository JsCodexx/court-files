#!/usr/bin/env bash
# One-time bootstrap for the Court Files frontend EC2 instance (Ubuntu 22.04/24.04).
# Run as a sudo-capable user: bash deploy/ec2-setup.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/court-files}"
APP_USER="${APP_USER:-$USER}"

echo "==> Updating packages"
sudo apt-get update -y
sudo apt-get install -y curl nginx rsync ufw

echo "==> App directory: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> Firewall (SSH + HTTP/HTTPS)"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable || true

echo "==> Nginx site"
if [ -f "$(dirname "$0")/nginx-frontend.conf" ]; then
  sudo cp "$(dirname "$0")/nginx-frontend.conf" /etc/nginx/sites-available/court-files
  sudo ln -sf /etc/nginx/sites-available/court-files /etc/nginx/sites-enabled/court-files
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl enable nginx
  sudo systemctl reload nginx
fi

cat <<EOF

Setup complete.

Next steps:
  1. Edit /etc/nginx/sites-available/court-files — set server_name to your domain.
  2. Point DNS A record for app.yourdomain.com to this EC2 public IP.
  3. TLS: sudo apt-get install -y certbot python3-certbot-nginx
         sudo certbot --nginx -d app.yourdomain.com
  4. Add GitHub Actions secrets (see deploy/README.md):
       EC2_HOST, EC2_USER, EC2_SSH_KEY
       REACT_APP_API_URL=https://api.yourdomain.com/api
  5. Push to main/master to deploy, or run workflow_dispatch.

Note: Frontend EC2 only needs Nginx — no Node.js runtime for serving the SPA.

EOF
