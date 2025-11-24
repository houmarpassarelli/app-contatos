# UEX Contatos - Sistema de Gerenciamento de Contatos

Sistema de cadastro e gerenciamento de contatos desenvolvido com **Laravel 12** (backend) e **React 18** (frontend), com integração ViaCEP e Google Maps para geolocalização.

**Stack Tecnológica:** Laravel + React + MySQL + Docker

## 📋 Características

### Backend (Laravel 12.x)
- ✅ API RESTful com autenticação Laravel Sanctum
- ✅ CRUD de contatos
- ✅ Validação de CPF (algoritmo oficial)
- ✅ Integração ViaCEP (busca de endereços)
- ✅ Integração Google Maps Geocoding API
- ✅ Filtros, ordenação e paginação
- ✅ Testes unitários e de integração (PHPUnit)
- ✅ Policies de autorização
- ✅ Health check endpoint

### Frontend (React 18)
- ✅ Hooks e Context API
- ✅ React Router DOM
- ✅ Material Design 3 (@material/web)
- ✅ Tema claro/escuro (Material You)
- ✅ Design responsivo (mobile-first)
- ✅ Integração completa com API
- ✅ Componentes MD3: Button, TextField, Card, IconButton, Icon

### Docker & DevOps
- ✅ docker-compose para desenvolvimento
- ✅ Dockerfile multi-stage para produção
- ✅ Nginx + PHP-FPM otimizado
- ✅ Health checks automatizados
- ✅ Rate limiting e headers de segurança

## 🚀 Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd uex-tecnologia
```

### 2. Configure as variáveis de ambiente

#### Backend
```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` e configure:
- `GOOGLE_MAPS_API_KEY` - Sua chave da Google Maps Geocoding API

#### Frontend
```bash
cp frontend/.env.example frontend/.env
```

### 3. Inicie o ambiente de desenvolvimento

```bash
./start-dev.sh
```

Este script irá:
- Iniciar os containers Docker (MySQL, Backend, Frontend)
- Executar as migrations do banco de dados
- Disponibilizar os serviços

## 🌐 Acessando a Aplicação

Após iniciar, os serviços estarão disponíveis em:

- **Backend API**: http://localhost:8000
- **Frontend React**: http://localhost:5173
- **MySQL**: localhost:3306

## 🧪 Executando Testes

```bash
./run-tests.sh
```

Os testes incluem:
- Validação de CPF
- Autenticação (register, login, logout)
- CRUD de contatos
- Políticas de autorização

## 🏗️ Build para Produção

O script de build foi otimizado com validações automáticas, testes e informações detalhadas.

### Pré-requisitos

1. Configure as variáveis de ambiente:
```bash
cp .env.production.example .env.production
# Edite .env.production com suas credenciais
```

2. Certifique-se de ter o composer.lock atualizado:
```bash
docker-compose exec backend composer install
```

### Build da Imagem

```bash
./build-prod.sh
```

O script irá:
- ✅ Validar todos os arquivos necessários
- ✅ Executar testes do backend (se disponível)
- ✅ Criar imagem Docker otimizada
- ✅ Exibir informações de tamanho e tempo de build
- ✅ Fornecer instruções de deploy

### Deploy em Produção

#### Opção 1: Docker Run (simples)
```bash
docker run -d -p 80:80 \
  --name uex-contacts \
  -e APP_KEY=${APP_KEY} \
  -e DB_HOST=${DB_HOST} \
  -e DB_DATABASE=${DB_DATABASE} \
  -e DB_USERNAME=${DB_USERNAME} \
  -e DB_PASSWORD=${DB_PASSWORD} \
  -e GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY} \
  uex-contacts:latest
```

#### Opção 2: Docker Compose (recomendado)
```bash
# Configure as variáveis
cp .env.production.example .env.production
# Edite .env.production

# Inicie todos os serviços (MySQL + App)
docker-compose -f docker-compose.prod.yml up -d

# Execute migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Verifique os logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Recursos de Produção

A imagem de produção inclui:
- ✅ **Multi-stage build** - Reduz tamanho final
- ✅ **OPcache** - Cache de bytecode PHP
- ✅ **Health Check** - Endpoint `/api/health`
- ✅ **Rate Limiting** - Proteção contra força bruta
- ✅ **Headers de Segurança** - CSP, X-Frame-Options, etc
- ✅ **PHP-FPM otimizado** - Pool dinâmico configurado
- ✅ **Logs estruturados** - Nginx + PHP-FPM
- ✅ **Gzip** - Compressão de assets

## 📚 Estrutura do Projeto

```
uex-tecnologia/
├── backend/                 # Laravel 12.x API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── tests/
├── frontend/                # React 18
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── services/
│   ├── public/
│   └── package.json
├── docker/                  # Configurações Docker
│   ├── nginx/
│   ├── php-fpm/
│   ├── mysql/
│   └── supervisor/
├── docker-compose.yml       # Desenvolvimento
├── docker-compose.prod.yml  # Produção
├── Dockerfile               # Multi-stage build
├── build-prod.sh            # Build para produção
├── start-dev.sh             # Start ambiente dev
└── run-tests.sh             # Executar testes
```

## 🔌 API Endpoints

### Health Check (Pública)
- `GET /api/health` - Verifica status da aplicação e banco de dados

### Autenticação (Públicas)
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/reset-password` - Resetar senha

### Autenticação (Protegidas)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário

### Contatos (Protegidas)
- `GET /api/contacts` - Listar contatos (com filtros e paginação)
- `POST /api/contacts` - Criar contato
- `GET /api/contacts/{id}` - Ver contato
- `PUT /api/contacts/{id}` - Atualizar contato
- `DELETE /api/contacts/{id}` - Excluir contato

### Endereços (Protegidas)
- `GET /api/addresses/search?uf=XX&city=XXX&street=XXX` - Buscar endereços (ViaCEP)
- `GET /api/addresses/{cep}` - Buscar por CEP

### Conta (Protegidas)
- `DELETE /api/account` - Excluir conta (requer confirmação de senha)

## 🛠️ Tecnologias Utilizadas

### Backend
- Laravel 12.x
- PHP 8.3
- MySQL 8.0
- Laravel Sanctum (autenticação)
- PHPUnit (testes)
- Guzzle HTTP (integrações externas)

### Frontend
- React 18
- Vite 5
- Material Design 3 (@material/web v2.4.1)
- React Router DOM
- Context API (gerenciamento de estado)
- Axios (HTTP client)
- Google Maps JavaScript API
- Material Symbols (ícones oficiais MD3)
- Roboto Font (tipografia oficial MD3)

### DevOps & Infraestrutura
- Docker & Docker Compose
- Nginx (web server + reverse proxy)
- PHP-FPM (otimizado)
- Supervisor (process manager)
- Alpine Linux (base images)

## 📝 Funcionalidades

### Usuário
- [x] Cadastro de usuário
- [x] Login/Logout
- [x] Recuperação de senha
- [x] Exclusão de conta (com confirmação)

### Contatos
- [x] Criar contato com endereço completo
- [x] Validação de CPF (algoritmo oficial)
- [x] CPF único por usuário
- [x] Busca de endereço via ViaCEP
- [x] Geocoding automático (Google Maps)
- [x] Listar contatos (filtro, ordenação, paginação)
- [x] Editar contato
- [x] Excluir contato

### Interface
- [x] Tema claro/escuro (Material You)
- [x] Design responsivo (mobile-first)
- [x] Material Design 3 oficial (@material/web)
- [x] Feedback visual de validações
- [x] Animações e transições MD3
- [x] Elevação e superfícies MD3
- [x] Ícones Material Symbols

## 👨‍💻 Desenvolvimento

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Executar migrations
docker-compose exec backend php artisan migrate

# Acessar console do backend
docker-compose exec backend bash

# Instalar dependências npm (frontend)
docker-compose exec frontend npm install
```
---

**Para analise e definição da documentação, incluindo comentários no código, foi usado o Claude Code**
