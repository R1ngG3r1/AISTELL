# ---- Tahap 1: build frontend (React + Vite) ----
FROM node:20-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Tahap 2: aplikasi PHP + Apache ----
FROM php:8.3-apache
RUN apt-get update && apt-get install -y --no-install-recommends git unzip libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install pdo_mysql gd zip bcmath \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

RUN a2dismod mpm_event mpm_worker || true \
 && rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* \
 && a2enmod mpm_prefork

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri "s#/var/www/html#${APACHE_DOCUMENT_ROOT}#g" /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction
COPY . .
COPY --from=assets /app/public/build ./public/build
RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x docker/start.sh

CMD ["docker/start.sh"]
