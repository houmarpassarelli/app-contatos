#!/bin/bash

# Script para build de produção otimizado
# Autor: UEX- Sistema de Cadastro de Contatos
# Stack: Laravel 12 + React 18
# Uso: ./build-prod.sh

set -e  # Exit on error

IMAGE_NAME="uex-contacts"
IMAGE_TAG="latest"

# Verificar se Docker está instalado e rodando
if ! command -v docker &> /dev/null; then
    echo "Docker não está instalado"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Docker daemon não está rodando"
    exit 1
fi

# Verificar se os arquivos necessários existem
if [ ! -f "Dockerfile" ]; then
    echo "Dockerfile não encontrado"
    exit 1
fi

if [ ! -f "backend/composer.json" ]; then
    echo "backend/composer.json não encontrado"
    exit 1
fi

if [ ! -f "backend/composer.lock" ]; then
    echo "backend/composer.lock não encontrado. Execute 'composer install' primeiro."
    exit 1
fi

if [ ! -f "backend/.env.production" ]; then
    echo "backend/.env.production não encontrado"
    echo "   Usando backend/.env.example como base"
    if [ ! -f "backend/.env.example" ]; then
        echo "backend/.env.example também não encontrado"
        exit 1
    fi
fi

if [ ! -f "frontend/package.json" ]; then
    echo "frontend/package.json não encontrado"
    exit 1
fi

# Executar testes do backend antes do build (opcional, pode ser comentado se desejar)
echo ""
if docker compose ps backend &> /dev/null; then
    docker compose exec -T backend php artisan test --stop-on-failure || {
        echo "Testes falharam! Deseja continuar? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Build cancelado"
            exit 1
        fi
    }
else
    echo "Container backend não está rodando. Pulando testes."
fi

# Build da imagem Docker
echo ""
echo "   Stack: Laravel 12 + React 18"
echo "   Image: $IMAGE_NAME:$IMAGE_TAG"
echo ""

BUILD_START=$(date +%s)

docker build \
    --tag $IMAGE_NAME:$IMAGE_TAG \
    .

BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

# Obter informações da imagem
IMAGE_SIZE=$(docker images $IMAGE_NAME:$IMAGE_TAG --format "{{.Size}}")
IMAGE_ID=$(docker images $IMAGE_NAME:$IMAGE_TAG --format "{{.ID}}")

echo ""
echo "Informações da imagem:"
echo "   Nome: $IMAGE_NAME:$IMAGE_TAG"
echo "   ID: $IMAGE_ID"
echo "   Tamanho: $IMAGE_SIZE"
echo "   Tempo de build: ${BUILD_TIME}s"
echo "   Stack: Laravel 12 + React 18"
echo ""
echo "Para executar em produção:"
echo "   docker run -d -p 80:80 \\"
echo "     --name uex-contacts \\"
echo "     -e APP_KEY=\${APP_KEY} \\"
echo "     -e DB_HOST=\${DB_HOST} \\"
echo "     -e DB_DATABASE=\${DB_DATABASE} \\"
echo "     -e DB_USERNAME=\${DB_USERNAME} \\"
echo "     -e DB_PASSWORD=\${DB_PASSWORD} \\"
echo "     -e GOOGLE_MAPS_API_KEY=\${GOOGLE_MAPS_API_KEY} \\"
echo "     $IMAGE_NAME:$IMAGE_TAG"
echo ""
