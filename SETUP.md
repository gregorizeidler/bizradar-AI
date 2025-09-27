# 🚀 Setup do BizRadar AI

## Guia Rápido de Instalação

### 1. Pré-requisitos

Certifique-se de ter instalado:
- **Node.js 16+** (https://nodejs.org/)
- **MongoDB** (https://www.mongodb.com/try/download/community)
- **Git** (https://git-scm.com/)

### 2. Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd bizradar-ai

# 2. Instale todas as dependências
npm run install-all

# 3. Configure as variáveis de ambiente
cp server/config.env server/.env
```

### 3. Configuração do Banco de Dados

**MongoDB Local:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

**MongoDB Atlas (Cloud):**
1. Crie uma conta em https://www.mongodb.com/atlas
2. Crie um cluster gratuito
3. Obtenha a string de conexão
4. Atualize `MONGODB_URI` no arquivo `.env`

### 4. Variáveis de Ambiente

Edite o arquivo `server/.env`:

```env
# Básico (obrigatório)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bizradar
JWT_SECRET=meu_jwt_secret_super_seguro_aqui
NODE_ENV=development

# APIs Externas (opcional para desenvolvimento)
SERPRO_API_KEY=sua_chave_serpro_aqui
IBGE_API_KEY=sua_chave_ibge_aqui
MAPBOX_ACCESS_TOKEN=seu_token_mapbox_aqui

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache
CACHE_TTL_SECONDS=3600
```

### 5. Executar a Aplicação

```bash
# Desenvolvimento (backend + frontend simultaneamente)
npm run dev

# Ou execute separadamente:
npm run server  # Backend: http://localhost:5000
npm run client  # Frontend: http://localhost:3000
```

### 6. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm run install-all

# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Testes
npm test
```

## 📋 Checklist de Verificação

- [ ] Node.js 16+ instalado
- [ ] MongoDB rodando
- [ ] Dependências instaladas (`npm run install-all`)
- [ ] Arquivo `.env` configurado
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Frontend acessível em http://localhost:3000
- [ ] Backend respondendo em http://localhost:5000/api/health

## 🐛 Solução de Problemas

### Erro de Conexão com MongoDB
```bash
# Verifique se o MongoDB está rodando
mongosh --eval "db.adminCommand('ismaster')"

# Ou inicie o serviço
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Porta já em uso
```bash
# Mude a porta no arquivo .env
PORT=5001

# Ou mate o processo na porta
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -ti:5000 | xargs kill -9
```

### Dependências não instaladas
```bash
# Limpe o cache e reinstale
npm cache clean --force
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

### Erro de CORS
- Verifique se o frontend está rodando na porta 3000
- Confirme a configuração de CORS no `server/index.js`

## 📚 Próximos Passos

1. **Cadastre-se** na aplicação
2. **Crie sua primeira análise** em "Nova Análise"
3. **Explore o dashboard** com estatísticas
4. **Teste diferentes tipos de negócio**
5. **Configure APIs externas** para dados reais

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o [README.md](README.md) para documentação completa
2. Consulte os logs do console para erros específicos
3. Verifique se todas as dependências estão instaladas
4. Confirme se o MongoDB está rodando

## 🎯 Dados de Teste

Para facilitar os testes, você pode usar:

**Endereços de exemplo:**
- Rua Augusta, 123 - Consolação, São Paulo/SP
- Av. Paulista, 1000 - Bela Vista, São Paulo/SP
- Rua das Flores, 456 - Centro, Rio de Janeiro/RJ

**Tipos de negócio:**
- Restaurante (CNAE: 5611)
- Pizzaria (CNAE: 5611)
- Salão de Beleza (CNAE: 9602)
- Farmácia (CNAE: 4771)

---

✅ **Pronto! Sua aplicação BizRadar AI está funcionando!**
