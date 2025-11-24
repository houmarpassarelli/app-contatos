#!/bin/bash

# Script para executar testes do backend
# Autor: UEX - Sistema de Cadastro de Contatos

echo "Executando testes do backend..."

docker compose exec backend php artisan test

echo ""
echo "Testes concluídos!"
