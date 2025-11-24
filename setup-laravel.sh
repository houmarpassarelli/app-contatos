#!/bin/bash

# Script para inicializar projeto Laravel usando Docker
# Autor: UEX- Sistema de Cadastro de Contatos

# Usar imagem Docker com Composer para criar projeto Laravel
docker run --rm -v "$(pwd)/backend:/app" composer:latest create-project laravel/laravel . "12.*" --prefer-dist

echo "Laravel instalado com sucesso!"

# Instalar Laravel Sanctum
docker run --rm -v "$(pwd)/backend:/app" -w /app composer:latest require laravel/sanctum

echo "Setup concluído!"
