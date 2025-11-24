# Guia de Deploy em Produção - UEX Contatos

Este documento detalha todas as otimizações e configurações para deploy em produção.

**Stack:** Laravel 12 + React 18 + MySQL 8 + Docker

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Melhorias Implementadas](#melhorias-implementadas)
3. [Configuração Inicial](#configuração-inicial)
4. [Build da Aplicação](#build-da-aplicação)
5. [Deploy](#deploy)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema foi otimizado para produção com foco em:
- ✅ **Segurança** - Headers HTTP, rate limiting, validações
- ✅ **Performance** - OPcache, Gzip, cache de rotas/views
- ✅ **Confiabilidade** - Health checks, logs estruturados
- ✅ **Escalabilidade** - PHP-FPM dinâmico, configurações otimizadas

---

## Melhorias Implementadas

### 1. Backend Laravel

#### Health Check Endpoint
- **Arquivo**: `backend/app/Http/Controllers/Api/HealthController.php`
- **Rota**: `GET /api/health`
- **Funcionalidade**: Verifica status da aplicação e conexão com banco de dados
- **Uso**: Monitoramento e health checks do Docker

#### Configurações de Produção
- **Arquivo**: `backend/.env.production`
- **Destaques**:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `LOG_LEVEL=warning`
  - `SESSION_DRIVER=cookie`
  - `CACHE_STORE=file`
  - Cookies seguros habilitados

### 2. Dockerfile Otimizado

#### Multi-stage Build (3 stages)
```dockerfile
# Stage 1: Build Frontend (Node)
# Stage 2: Composer Dependencies
# Stage 3: Produção (PHP + Nginx)
```

#### Otimizações Implementadas
- **Cache de camadas** - Composer e npm instalados separadamente
- **OPcache habilitado** - Cache de bytecode PHP
- **Limpeza de arquivos** - Testes, .git, documentação removidos
- **Health Check integrado** - Verifica `/api/health` a cada 30s
- **Permissões corretas** - www-data com acesso apropriado

#### Configuração OPcache
```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
```

### 3. Nginx - Segurança e Performance

#### Headers de Segurança
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` configurado

#### Rate Limiting
- **Autenticação**: 5 requisições/minuto (login/register)
- **API geral**: 10 requisições/segundo
- **Proteção**: Contra força bruta e DDoS

#### Compressão Gzip
- Habilitado para text, JSON, JavaScript, CSS
- Nível de compressão: 6
- Tamanho mínimo: 256 bytes

### 4. PHP-FPM Otimizado

**Arquivo**: `docker/php-fpm/www.conf`

#### Process Manager - Dynamic
```ini
pm = dynamic
pm.max_children = 20
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 6
pm.max_requests = 1000
```

#### Configurações de Segurança
```ini
disable_functions = exec,passthru,shell_exec,system,...
expose_php = Off
allow_url_include = Off
```

#### Limites de Recursos
```ini
memory_limit = 256M
max_execution_time = 30
upload_max_filesize = 20M
```

### 5. MySQL Otimizado

**Arquivo**: `docker/mysql/my.cnf`

#### Configurações de Performance
```ini
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
```

#### Slow Query Log
- Habilitado para queries > 2 segundos
- Arquivo: `/var/log/mysql/slow-query.log`

### 6. Script de Build Aprimorado

**Arquivo**: `build-prod.sh`

#### Validações Automáticas
- ✅ Docker instalado e rodando
- ✅ Dockerfile existe
- ✅ composer.lock presente
- ✅ Arquivos .env configurados
- ✅ Frontend escolhido existe

#### Testes Automatizados
- Executa `php artisan test` antes do build
- Permite continuar se testes falharem (com confirmação)

#### Informações Detalhadas
- Tempo de build
- Tamanho da imagem
- ID da imagem
- Instruções de deploy

### 7. Docker Compose para Produção

**Arquivo**: `docker-compose.prod.yml`

#### Serviços Incluídos
- **MySQL 8.0** - Banco de dados com health check
- **App (Laravel + Nginx)** - Aplicação principal
- **Redis** (opcional) - Cache e sessions

#### Health Checks
- MySQL: `mysqladmin ping`
- App: `curl /api/health`

#### Volumes Persistentes
- `mysql_data` - Dados do banco
- `app_storage` - Storage do Laravel
- `app_logs` - Logs da aplicação

---

## Configuração Inicial

### 1. Clone e Configuração

```bash
git clone <repositorio>
cd uex-tecnologia
```

### 2. Configure Variáveis de Ambiente

```bash
# Para Docker Compose
cp .env.production.example .env.production
nano .env.production

# Preencha:
# - APP_KEY (gere com: php artisan key:generate)
# - DB_PASSWORD e DB_ROOT_PASSWORD
# - GOOGLE_MAPS_API_KEY
# - Credenciais SMTP
```

### 3. Gere APP_KEY

```bash
# Localmente (se tiver PHP)
php artisan key:generate --show

# Ou via Docker
docker run --rm php:8.3-cli php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
```

---

## Build da Aplicação

### Build da Imagem Docker

```bash
./build-prod.sh
```

### Saída Esperada

```
🔍 Validando ambiente...
📋 Verificando arquivos necessários...
✅ Todos os arquivos necessários encontrados

🧪 Executando testes do backend...
✅ Testes passaram

🏗️  Iniciando build para produção...
   Stack: Laravel 12 + React 18
   Image: uex-contacts:latest

✅ Build concluído com sucesso!

📊 Informações da imagem:
   Nome: uex-contacts:latest
   ID: abc123...
   Tamanho: 450MB
   Tempo de build: 180s
   Stack: Laravel 12 + React 18
```

---

## Deploy

### Opção 1: Docker Run (Servidor Único)

```bash
docker run -d \
  --name uex-contacts \
  --restart unless-stopped \
  -p 80:80 \
  -e APP_KEY="${APP_KEY}" \
  -e DB_HOST="${DB_HOST}" \
  -e DB_DATABASE="${DB_DATABASE}" \
  -e DB_USERNAME="${DB_USERNAME}" \
  -e DB_PASSWORD="${DB_PASSWORD}" \
  -e GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}" \
  uex-contacts:latest
```

### Opção 2: Docker Compose (Recomendado)

```bash
# 1. Inicie os serviços
docker-compose -f docker-compose.prod.yml up -d

# 2. Aguarde MySQL estar saudável (health check)
docker-compose -f docker-compose.prod.yml ps

# 3. Execute migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# 4. Verifique logs
docker-compose -f docker-compose.prod.yml logs -f app

# 5. Teste health check
curl http://localhost/api/health
```

### Resultado Esperado do Health Check

```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T12:00:00+00:00",
  "environment": "production",
  "services": {
    "database": {
      "status": "up",
      "database": "uex_contacts"
    }
  }
}
```

---

## Monitoramento

### 1. Logs da Aplicação

```bash
# Logs do container
docker logs uex-app-prod -f

# Logs do Docker Compose
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos do Nginx
docker exec uex-app-prod tail -f /var/log/nginx/access.log
docker exec uex-app-prod tail -f /var/log/nginx/error.log

# Logs específicos do PHP-FPM
docker exec uex-app-prod tail -f /var/log/php-fpm/www-error.log
docker exec uex-app-prod tail -f /var/log/php-fpm/www-slow.log
```

### 2. Health Checks

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Health check da aplicação
curl http://localhost/api/health

# Health check do MySQL
docker exec uex-mysql-prod mysqladmin ping -h localhost -u root -p
```

### 3. Métricas de Performance

```bash
# CPU e Memória
docker stats uex-app-prod uex-mysql-prod

# Processos PHP-FPM
docker exec uex-app-prod ps aux | grep php-fpm

# Status do OPcache (adicione endpoint se necessário)
docker exec uex-app-prod php -r "print_r(opcache_get_status());"
```

---

## Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker logs uex-app-prod

# Verificar health check
docker inspect uex-app-prod | grep -A 10 Health

# Entrar no container
docker exec -it uex-app-prod sh
```

### Problema: Banco de dados não conecta

```bash
# Verificar se MySQL está rodando
docker ps | grep mysql

# Testar conexão
docker exec uex-app-prod php artisan tinker
# > DB::connection()->getPdo();

# Verificar variáveis de ambiente
docker exec uex-app-prod env | grep DB_
```

### Problema: 502 Bad Gateway

```bash
# Verificar se PHP-FPM está rodando
docker exec uex-app-prod ps aux | grep php-fpm

# Ver logs do PHP-FPM
docker exec uex-app-prod tail -f /var/log/php-fpm/www-error.log

# Reiniciar PHP-FPM
docker exec uex-app-prod supervisorctl restart php-fpm
```

### Problema: Rate Limit Errors (429)

```bash
# Ajustar configuração do Nginx
# Edite: docker/nginx/nginx.conf
# Aumente: rate=10r/s para rate=20r/s

# Rebuild a imagem
./build-prod.sh vue
docker-compose -f docker-compose.prod.yml up -d --force-recreate app
```

### Problema: Lentidão

```bash
# 1. Verificar cache do Laravel
docker exec uex-app-prod php artisan config:cache
docker exec uex-app-prod php artisan route:cache
docker exec uex-app-prod php artisan view:cache

# 2. Verificar OPcache
docker exec uex-app-prod php -i | grep opcache

# 3. Verificar slow queries
docker exec uex-mysql-prod cat /var/log/mysql/slow-query.log

# 4. Aumentar recursos do PHP-FPM
# Edite: docker/php-fpm/www.conf
# pm.max_children = 20 -> 30
```

---

## Backup e Restore

### Backup do Banco de Dados

```bash
# Backup automático
docker exec uex-mysql-prod mysqldump \
  -u root -p${DB_ROOT_PASSWORD} \
  uex_contacts > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup com gzip
docker exec uex-mysql-prod mysqldump \
  -u root -p${DB_ROOT_PASSWORD} \
  uex_contacts | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore do Banco de Dados

```bash
# Restore de backup
docker exec -i uex-mysql-prod mysql \
  -u root -p${DB_ROOT_PASSWORD} \
  uex_contacts < backup.sql

# Restore de backup gzip
gunzip < backup.sql.gz | docker exec -i uex-mysql-prod mysql \
  -u root -p${DB_ROOT_PASSWORD} \
  uex_contacts
```

---

## Segurança - Checklist

- [ ] `APP_DEBUG=false` em produção
- [ ] `APP_KEY` gerado e único
- [ ] Senhas fortes do banco de dados
- [ ] HTTPS habilitado (use proxy reverso como Traefik/Nginx)
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] Firewall configurado (apenas portas 80/443)
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados
- [ ] Atualizações de segurança aplicadas

---

## Performance - Checklist

- [ ] OPcache habilitado
- [ ] Cache do Laravel configurado (config/route/view)
- [ ] Gzip habilitado
- [ ] Assets com cache de longo prazo
- [ ] PHP-FPM otimizado para recursos disponíveis
- [ ] MySQL com innodb_buffer_pool_size adequado
- [ ] Slow query log monitorado
- [ ] Health checks funcionando

---

**Para analise e definição da documentação, incluindo comentários no código, foi usado o Claude Code**
