#!/usr/bin/env bash
# Set up Let's Encrypt SSL certificates for production.
# Requires: certbot, nginx stopped on port 80, DNS pointing to this server.
set -euo pipefail

DOMAIN="${1:-ecommkh.khmerhomeservices.com}"
EMAIL="${2:-admin@khmerhomeservices.com}"
CERT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Let's Encrypt setup for ${DOMAIN} ==="

# Check for certbot
if ! command -v certbot &>/dev/null; then
  echo "certbot not found. Installing..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get update && sudo apt-get install -y certbot
  elif command -v yum &>/dev/null; then
    sudo yum install -y certbot
  else
    echo "Please install certbot manually: https://certbot.eff.org/instructions"
    exit 1
  fi
fi

echo "Requesting certificate..."
sudo certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email "${EMAIL}" \
  -d "${DOMAIN}" \
  --cert-path "${CERT_DIR}/${DOMAIN}.crt" \
  --key-path "${CERT_DIR}/${DOMAIN}.key"

echo ""
echo "Certificate obtained:"
echo "  Cert: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
echo "  Key:  /etc/letsencrypt/live/${DOMAIN}/privkey.pem"
echo ""
echo "To auto-renew, add this cron job:"
echo "  0 3 * * * certbot renew --quiet --deploy-hook 'docker restart nginx'"
echo ""
echo "Update nginx.conf to reference:"
echo "  ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;"
echo "  ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;"
