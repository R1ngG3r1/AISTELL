#!/bin/sh
set -e

# Railway memberi nomor port lewat variabel PORT.
PORT="${PORT:-8080}"
sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

mkdir -p storage/app/private storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache

php artisan migrate --force

# Data awal (admin + layanan) hanya dibuat saat SEED_ON_BOOT=true (deploy pertama).
if [ "$SEED_ON_BOOT" = "true" ]; then
  php artisan db:seed --class=AdminSeeder --force
  php artisan db:seed --class=ServiceSeeder --force
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

# Pastikan hanya satu MPM (prefork) yang aktif
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.*
a2enmod mpm_prefork >/dev/null 2>&1 || true

# Diagnosis: tampilkan MPM yang termuat dan file asalnya
echo "=== mods-enabled (mpm) ==="; ls /etc/apache2/mods-enabled | grep mpm || true
echo "=== LoadModule mpm ==="; grep -rn "LoadModule mpm" /etc/apache2 || true

exec apache2-foreground
