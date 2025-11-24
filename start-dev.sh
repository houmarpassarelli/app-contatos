#!/bin/bash

# Script para iniciar ambiente de desenvolvimento
# Autor: UEX -Sistema de Cadastro de Contatos

echo "Iniciando ambiente de desenvolvimento..."

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

# Inicia os containers
echo "Iniciando containers..."
docker compose up

echo "Aguardando MySQL inicializar..."
sleep 10

# Executa migrations
echo "Executando migrations..."
docker compose exec backend php artisan migrate --force

echo ""
echo "Ambiente iniciado com sucesso!"
