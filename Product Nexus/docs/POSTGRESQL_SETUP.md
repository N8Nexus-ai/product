# 🐘 PostgreSQL - Guia Rápido

## ✅ PostgreSQL Já Está Configurado!

O Nexus Sales OS já vem **100% configurado** para usar PostgreSQL. Aqui está como usar:

---

## 🚀 Opção 1: Docker (Recomendado - Mais Fácil)

### Já está no `docker-compose.yml`!

```bash
# Iniciar PostgreSQL automaticamente
docker-compose up -d postgres

# Verificar se está rodando
docker-compose ps postgres

# Ver logs
docker-compose logs postgres
```

**Pronto!** O PostgreSQL está rodando na porta **5432**.

**Credenciais padrão:**
- **Host:** localhost (ou `postgres` dentro do Docker)
- **Porta:** 5432
- **Usuário:** postgres
- **Senha:** postgres
- **Database:** nexus_sales_os

---

## 🔧 Opção 2: PostgreSQL Local (Sem Docker)

### Instalar PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Instalar normalmente

### Criar Database

```bash
# Acessar PostgreSQL
psql -U postgres

# Criar database
CREATE DATABASE nexus_sales_os;

# Criar usuário (opcional)
CREATE USER nexus_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE nexus_sales_os TO nexus_user;

# Sair
\q
```

### Configurar no .env

```env
# Se PostgreSQL local
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/nexus_sales_os

# Ou com usuário customizado
DATABASE_URL=postgresql://nexus_user:sua_senha@localhost:5432/nexus_sales_os
```

---

## 📊 Verificar Conexão

### Teste Rápido

```bash
# Via Docker
docker-compose exec postgres psql -U postgres -d nexus_sales_os -c "SELECT version();"

# Via linha de comando local
psql -U postgres -d nexus_sales_os -c "SELECT version();"
```

### Via Backend

```bash
# Rodar migrations (cria as tabelas)
cd backend
npm run migrate

# Se der certo, você verá:
# ✅ Database migrated successfully
```

---

## 🗄️ Estrutura do Banco

### Tabelas Principais

O Prisma Schema já define todas as tabelas:

1. **users** - Usuários do sistema
2. **companies** - Clientes (empresas)
3. **leads** - Leads capturados
4. **lead_activities** - Histórico de atividades
5. **campaigns** - Campanhas de ads
6. **integrations** - Integrações configuradas
7. **daily_metrics** - Métricas agregadas
8. **system_logs** - Logs do sistema

### Ver Tabelas Criadas

```bash
# Via Docker
docker-compose exec postgres psql -U postgres -d nexus_sales_os -c "\dt"

# Via linha de comando
psql -U postgres -d nexus_sales_os -c "\dt"
```

---

## 🔍 Comandos Úteis

### Acessar PostgreSQL

```bash
# Via Docker
docker-compose exec postgres psql -U postgres -d nexus_sales_os

# Local
psql -U postgres -d nexus_sales_os
```

### Comandos SQL Úteis

```sql
-- Ver todas as tabelas
\dt

-- Ver estrutura de uma tabela
\d leads

-- Contar leads
SELECT COUNT(*) FROM leads;

-- Ver últimos 10 leads
SELECT id, name, email, status, score, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver leads qualificados
SELECT COUNT(*) FROM leads WHERE status = 'QUALIFIED';

-- Ver leads por fonte
SELECT source, COUNT(*) 
FROM leads 
GROUP BY source;

-- Sair
\q
```

---

## 🛠️ Gerenciar Database

### Prisma Studio (Interface Visual)

```bash
cd backend
npm run prisma:studio
```

Abre em: http://localhost:5555

**Interface visual para:**
- Ver dados
- Editar registros
- Criar novos registros
- Filtrar e buscar

### Migrations

```bash
cd backend

# Ver status das migrations
npx prisma migrate status

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npm run migrate:deploy

# Reset database (⚠️ CUIDADO - apaga tudo!)
npx prisma migrate reset
```

### Backup

```bash
# Via Docker
docker-compose exec postgres pg_dump -U postgres nexus_sales_os > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U postgres nexus_sales_os < backup.sql

# Local
pg_dump -U postgres nexus_sales_os > backup.sql
psql -U postgres nexus_sales_os < backup.sql
```

---

## 🔐 Segurança

### Produção

**⚠️ IMPORTANTE:** Mude as senhas padrão!

```bash
# No docker-compose.yml, altere:
POSTGRES_PASSWORD=sua_senha_super_segura_aqui

# No .env, use senha forte:
DATABASE_URL=postgresql://postgres:senha_forte@localhost:5432/nexus_sales_os
```

### Boas Práticas

1. ✅ Use senhas fortes (32+ caracteres)
2. ✅ Não commite `.env` com credenciais
3. ✅ Use SSL em produção
4. ✅ Faça backups regulares
5. ✅ Limite acesso por IP (firewall)

---

## 📊 Performance

### Índices

O schema já cria índices nas colunas mais usadas:

```sql
-- Ver índices
\di

-- Índices automáticos:
-- - leads.company_id
-- - leads.status
-- - leads.source
-- - leads.email
```

### Otimizações

Se tiver muitos dados (>100k leads):

```sql
-- Analisar queries lentas
EXPLAIN ANALYZE SELECT * FROM leads WHERE status = 'QUALIFIED';

-- Vacuum (limpar espaço)
VACUUM ANALYZE;

-- Reindexar
REINDEX DATABASE nexus_sales_os;
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ou localmente
sudo systemctl status postgresql

# Verificar porta
netstat -an | grep 5432
```

### Erro: "Database does not exist"

**Solução:**
```bash
# Criar database
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE nexus_sales_os;"

# Ou localmente
createdb nexus_sales_os
```

### Erro: "Password authentication failed"

**Solução:**
```bash
# Verificar senha no .env
cat .env | grep DATABASE_URL

# Resetar senha (Docker)
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'nova_senha';"
```

### Erro: "Too many connections"

**Solução:**
```sql
-- Ver conexões ativas
SELECT count(*) FROM pg_stat_activity;

-- Matar conexões antigas
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';
```

---

## 📚 Recursos

### Documentação Oficial
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)

### Ferramentas
- **pgAdmin:** Interface gráfica (https://www.pgadmin.org/)
- **DBeaver:** Cliente universal (https://dbeaver.io/)
- **Prisma Studio:** Já incluído no projeto

---

## ✅ Checklist

- [ ] PostgreSQL instalado/rodando
- [ ] Database `nexus_sales_os` criado
- [ ] Variável `DATABASE_URL` configurada no `.env`
- [ ] Migrations rodadas (`npm run migrate`)
- [ ] Prisma Studio funcionando
- [ ] Backup configurado (opcional)

---

**Pronto!** Seu PostgreSQL está configurado e funcionando! 🎉

Se tiver dúvidas, consulte:
- [Guia de Instalação](./setup/README.md)
- [Troubleshooting](./troubleshooting/common-issues.md)

