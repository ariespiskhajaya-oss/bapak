#!/bin/bash
set -e

echo "→ Push ke GitHub..."
git push

echo ""
echo "→ Selesai. Jalankan ini di VPS:"
echo ""
echo "   cd /opt/bapak"
echo "   git pull"
echo "   pm2 restart bapak"
echo ""
