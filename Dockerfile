# Multi-stage Dockerfile para produção
# Build otimizado com cache de dependências e health checks
# Stack: Laravel 12 (Backend) + React 18 (Frontend)

#==============================================================================
# Stage 1: Build do Frontend React
#==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar apenas package files primeiro (melhor caching)
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copiar o resto do frontend e fazer build
COPY frontend ./
RUN npm run build

#==============================================================================
# Stage 2: Composer Dependencies
#==============================================================================
FROM composer:latest AS composer-builder

WORKDIR /app

# Copiar apenas composer files primeiro (melhor caching)
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --no-progress \
    --ignore-platform-reqs

#==============================================================================
# Stage 3: Backend Laravel com Nginx (Produção)
#==============================================================================
FROM php:8.3-fpm-alpine

# Instalar dependências do sistema e extensões PHP
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# Configurar OPcache para produção
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.memory_consumption=256'; \
        echo 'opcache.interned_strings_buffer=16'; \
        echo 'opcache.max_accelerated_files=10000'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.save_comments=1'; \
        echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Criar diretórios necessários
RUN mkdir -p /var/www/html /run/nginx /var/log/supervisor /var/log/php-fpm

WORKDIR /var/www/html

# Copiar vendor do stage anterior (melhor caching)
COPY --from=composer-builder /app/vendor ./vendor

# Copiar arquivos do backend
COPY backend .

# Copiar build do frontend para public
COPY --from=frontend-builder /app/dist ./public/assets

# Copiar arquivo .env de produção
COPY backend/.env.production ./.env

# Limpar arquivos desnecessários para reduzir tamanho da imagem
RUN rm -rf tests/ \
    storage/logs/*.log \
    .git/ \
    .github/ \
    .editorconfig \
    .gitignore \
    .gitattributes \
    phpunit.xml \
    README.md

# Gerar chave da aplicação (se não vier via env) e otimizações Laravel
RUN php artisan config:clear \
    && php artisan cache:clear \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan optimize

# Ajustar permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Configuração do Nginx
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Configuração customizada do PHP-FPM
COPY docker/php-fpm/www.conf /usr/local/etc/php-fpm.d/www.conf

# Configuração do Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

EXPOSE 80

# Executar como root (supervisor precisa de permissões para gerenciar processos)
USER root

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
