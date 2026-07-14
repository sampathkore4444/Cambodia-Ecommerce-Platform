#!/usr/bin/env bash
# Generate self-signed SSL certificates for development.
# For production, use certbot/Let's Encrypt instead.
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="${1:-ecommkh.khmerhomeservices.com}"
DAYS=365

echo "Generating self-signed certificate for ${DOMAIN}..."

openssl req -x509 -nodes -days "${DAYS}" \
  -newkey rsa:2048 \
  -keyout "${CERT_DIR}/${DOMAIN}.key" \
  -out "${CERT_DIR}/${DOMAIN}.crt" \
  -subj "/C=KH/ST=Phnom Penh/L=Phnom Penh/O=KhmerMarket/OU=Dev/CN=${DOMAIN}" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:localhost,IP:127.0.0.1"

echo "Certificates written to:"
echo "  Key:  ${CERT_DIR}/${DOMAIN}.key"
echo "  Cert: ${CERT_DIR}/${DOMAIN}.crt"
echo ""
echo "These are for DEVELOPMENT only. Use Let's Encrypt for production."
