# BizRadar AI - Probabilidade de Sucesso de Negócios

## 📋 Sobre o Projeto

O **BizRadar AI** é uma plataforma de **Inteligência Artificial** que revoluciona a análise de viabilidade comercial através de:

- **🤖 Assistente IA Conversacional**: ChatGPT integrado para consultas inteligentes
- **📸 Análise Visual**: Computer Vision para análise de fotos de localizações
- **🌐 Comparativo Multi-Cidade**: Análise simultânea de 10+ cidades brasileiras
- **🤝 Marketplace de Oportunidades**: Conecta investidores com oportunidades validadas
- **🔮 Predições com ML**: TensorFlow para análise preditiva e cenários futuros
- **📊 Dashboard Executivo**: Business Intelligence com KPIs e insights estratégicos
- **🏆 Algoritmos Proprietários**: CRI, PCS e 6+ fatores de análise avançada
- **🗺️ Geointeligência**: Integração com 5 APIs para dados precisos e atualizados

## 🎯 Fluxo de Análise 

### 📊 **Fluxo Tradicional (v1.0)**

```mermaid
graph TD
    A[🏢 Usuário insere dados do negócio] --> B{📍 Geocodificação do endereço}
    B --> C[🏛️ Receita Federal]
    B --> D[🗺️ OpenStreetMap]
    B --> E[📊 IBGE]
    B --> F[🌟 Google Places]
    
    C --> G[📋 Concorrentes Formais]
    D --> H[🏪 Concorrentes Informais]
    D --> I[🗺️ POIs Complementares]
    E --> J[👥 Dados Demográficos]
    F --> K[⭐ Ratings dos Concorrentes]
    
    G --> L[🧮 Motor de Score IA]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[📈 Score Saturação]
    L --> N[🎯 Score Oportunidade]
    L --> O[🏆 CRI Score]
    L --> P[🗺️ PCS Score]
    L --> Q[⭐ Score Final]
    
    M --> R[📊 Dashboard Inteligente]
    N --> R
    O --> R
    P --> R
    Q --> R
    
    R --> S[🗺️ Mapa Interativo]
    R --> T[💡 Insights IA]
    R --> U[📄 Relatório Avançado]
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style L fill:#764ba2,stroke:#333,stroke-width:3px,color:#fff
    style R fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
    style O fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style P fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
```

### 🤖 **Fluxo com IA Avançada (v2.0 - Atual)**

```mermaid
graph TD
    A[🏢 Usuário/Assistente IA] --> B{📍 Múltiplas Entradas}
    B --> C[📸 Foto da Localização]
    B --> D[💬 Consulta em Linguagem Natural]
    B --> E[🗺️ Endereço/Coordenadas]
    B --> F[🌐 Análise Multi-Cidade]
    
    C --> G[🤖 Vision AI Analysis]
    D --> H[🤖 ChatGPT-4 Processing]
    E --> I[🌐 Multi-Source Data Collection]
    F --> J[🏙️ Comparative City Analysis]
    
    I --> K[🏛️ Receita Federal]
    I --> L[🗺️ OpenStreetMap]
    I --> M[📊 IBGE]
    I --> N[🌟 Google Places]
    
    K --> O[🧠 Advanced AI Engine]
    L --> O
    M --> O
    N --> O
    G --> O
    H --> O
    J --> O
    
    O --> P[🏆 CRI Score]
    O --> Q[🗺️ PCS Score]
    O --> R[🔮 ML Predictions]
    O --> S[📊 BI Analytics]
    O --> T[📸 Visual Score]
    O --> U[⭐ Enhanced Final Score]
    
    P --> V[🤖 AI Assistant Response]
    Q --> V
    R --> V
    S --> V
    T --> V
    U --> V
    
    V --> W[💬 Conversational Interface]
    V --> X[📊 Executive Dashboard]
    V --> Y[🤝 Marketplace Integration]
    V --> Z[📈 Predictive Reports]
    V --> AA[🌐 Multi-City Comparison]
    
    style A fill:#667eea,stroke:#333,stroke-width:3px,color:#fff
    style O fill:#764ba2,stroke:#333,stroke-width:4px,color:#fff
    style V fill:#48bb78,stroke:#333,stroke-width:3px,color:#fff
    style G fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style J fill:#9b59b6,stroke:#333,stroke-width:2px,color:#fff
```

### 🔄 **Evolução do Sistema**

| Aspecto | v1.0 (Tradicional) | v2.0 (IA Avançada) |
|---------|-------------------|-------------------|
| **Entrada** | 📝 Formulário manual | 💬 Linguagem natural + 📸 Fotos |
| **Processamento** | 🧮 Algoritmos determinísticos | 🤖 IA + ML + Computer Vision |
| **Análise** | 🏙️ Cidade única | 🌐 Multi-cidade comparativa |
| **Saída** | 📊 Dashboard estático | 💬 Interface conversacional |
| **Predições** | ❌ Não disponível | 🔮 ML com cenários futuros |
| **Marketplace** | ❌ Não disponível | 🤝 Conecta investidores |
| **Interação** | 🖱️ Cliques e formulários | 💬 Chat inteligente |

## 🚀 Funcionalidades

### 🤖 **Assistente IA Conversacional**
- **ChatGPT-4 Integrado**: Consultas em linguagem natural
- **Contexto Inteligente**: Baseado no histórico do usuário
- **7 Tipos de Query**: Análise, estratégia, localização, scores, etc.
- **Respostas Estruturadas**: Insights acionáveis e próximos passos
- **Análise de Sentimento**: Para métricas de satisfação

### 📸 **Análise Visual com IA**
- **Computer Vision**: OpenAI Vision API para análise de fotos
- **Score Visual**: 0-100 baseado em elementos da imagem
- **Detecção Automática**: Estabelecimentos, fluxo, infraestrutura
- **Comparação Múltipla**: Análise simultânea de várias localizações
- **Insights Visuais**: Oportunidades e riscos identificados

### 🌐 **Análise Multi-Cidade**
- **10+ Cidades**: São Paulo, Rio, BH, Salvador, Brasília, etc.
- **Comparativo Inteligente**: Ranking baseado em múltiplos fatores
- **ROI por Região**: Cálculo de retorno e payback por cidade
- **Cenários de Risco**: Otimista, realista e pessimista
- **Recomendações Estratégicas**: Baseadas em dados regionais

### 🤝 **Marketplace de Oportunidades**
- **4 Categorias**: Premium, Oportunidade, Baixo Custo, Emergente
- **Matching Inteligente**: Baseado no perfil do investidor
- **Sistema de Interesse**: Conexão entre investidores e oportunidades
- **Filtros Avançados**: Por localização, investimento, score, ROI
- **Estatísticas em Tempo Real**: Métricas do marketplace

### 🔮 **Análise Preditiva com ML**
- **TensorFlow.js**: Rede neural para predições de sucesso
- **Análise Sazonal**: Padrões por tipo de negócio e região
- **Tendências de Mercado**: Projeções de 5 anos
- **Cenários de Risco**: Múltiplos cenários probabilísticos
- **Recomendações Temporais**: Melhor época para abertura

### 📊 **Dashboard Executivo com BI**
- **KPIs em Tempo Real**: 15+ métricas de performance
- **Análise de Tendências**: Gráficos temporais e sazonais
- **Segmentação Avançada**: Por tipo de negócio e região
- **Alertas Inteligentes**: Notificações automáticas de oportunidades
- **Relatórios Estratégicos**: Insights para tomada de decisão

### 🔍 **Análise Tradicional Aprimorada**
- **5 APIs Integradas**: Receita Federal, IBGE, OpenStreetMap, Google Places, Nominatim
- **Motor de IA**: 6 algoritmos ponderados com machine learning
- **CRI (Competitor Rating Index)**: Análise de qualidade dos concorrentes
- **PCS (POI Complementarity Score)**: Sinergia com pontos de interesse
- **Análise de Saturação**: Densidade de mercado vs. população
- **Mapeamento 360°**: Concorrentes formais, informais e ratings

### 🗺️ Visualização Geoespacial
- **Mapa Inteligente**: Leaflet/Mapbox com camadas dinâmicas
- **Heatmap Avançado**: Concorrência + ratings + POIs
- **Análise de Mobilidade**: Transporte público, acessibilidade
- **Sinergia Visual**: POIs complementares destacados
- **Sugestões IA**: Localizações alternativas otimizadas

### 📊 Dashboard e Relatórios
- **Dashboard IA**: Estatísticas em tempo real com insights inteligentes
- **Análise Temporal**: Histórico com tendências e padrões
- **Relatórios Avançados**: PDF/JSON com CRI e PCS detalhados
- **Insights Personalizados**: Recomendações baseadas em 10+ fatores
- **Alertas Inteligentes**: Notificações sobre mudanças no mercado

### 👥 Sistema de Usuários
- Autenticação JWT
- Planos de assinatura (Individual, PRO, Enterprise)
- Perfil de usuário e preferências
- Controle de limites por plano

## 🛠️ Tecnologias Utilizadas

```mermaid
graph LR
    subgraph "🖥️ Frontend"
        A[React 18] --> B[Material-UI]
        A --> C[React Router]
        A --> D[React Leaflet]
        A --> E[Recharts]
        A --> F[Framer Motion]
    end
    
    subgraph "⚙️ Backend"
        G[Node.js] --> H[Express.js]
        G --> I[MongoDB]
        G --> J[JWT Auth]
        G --> K[Axios]
        G --> L[Turf.js]
    end
    
    subgraph "🌐 APIs Externas"
        M[Receita Federal]
        N[IBGE]
        O[OpenStreetMap]
        P[Nominatim]
    end
    
    A -.->|HTTP Requests| G
    K -.->|Integração| M
    K -.->|Integração| N
    K -.->|Integração| O
    K -.->|Integração| P
    
    style A fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style G fill:#68a063,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style N fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style O fill:#45b7d1,stroke:#333,stroke-width:2px,color:#fff
```

### 🔧 Stack Detalhado

**Backend:**
- **Node.js** com Express.js - Servidor web robusto
- **MongoDB** com Mongoose - Banco de dados NoSQL
- **JWT** para autenticação - Segurança stateless
- **Axios** para integração com APIs - Cliente HTTP
- **Turf.js** para análise geoespacial - Cálculos geográficos

**Frontend:**
- **React 18** com Hooks - Interface moderna e reativa
- **Material-UI (MUI)** para componentes - Design system Google
- **React Router** para navegação - SPA routing
- **React Leaflet** para mapas - Mapas interativos
- **Recharts** para gráficos - Visualização de dados
- **Framer Motion** para animações - Micro-interações

**APIs e Tecnologias de IA:**
- **OpenAI GPT-4** - Assistente conversacional e análise de texto
- **OpenAI Vision** - Análise de imagens e computer vision
- **TensorFlow.js** - Machine learning e predições
- **Receita Federal** - Dados oficiais de empresas (CNPJs)
- **IBGE** - Demografia, censo e estatísticas
- **OpenStreetMap** - Dados geoespaciais via Overpass API
- **Google Places** - Ratings, avaliações e dados comerciais
- **Nominatim** - Geocodificação de endereços

## 🤖 Features de Inteligência Artificial

### 💬 **Assistente IA Conversacional**

```mermaid
graph LR
    A[👤 Pergunta do Usuário] --> B[🧠 Classificação da Query]
    B --> C[📊 Busca de Contexto]
    C --> D[🤖 GPT-4 Processing]
    D --> E[💡 Resposta Estruturada]
    E --> F[🎯 Ações Sugeridas]
    
    style B fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
```

**Tipos de Consulta Suportados:**
- 🏆 **Análise de Concorrência**: "Por que meu CRI está baixo?"
- 🗺️ **Análise de Localização**: "Que POIs complementam meu negócio?"
- 📍 **Recomendação de Local**: "Melhor lugar para pizzaria em SP?"
- 📊 **Interpretação de Scores**: "Como melhorar meu score final?"
- 💡 **Estratégias de Negócio**: "Como competir com concorrentes 5 estrelas?"
- 🏪 **Sugestão de Negócio**: "Que tipo de negócio funciona aqui?"

### 📸 **Análise Visual com Computer Vision**

```mermaid
graph TB
    A[📷 Upload da Imagem] --> B[🔍 OpenAI Vision API]
    B --> C[🏪 Detecção de Estabelecimentos]
    B --> D[🚶 Análise de Fluxo]
    B --> E[🏗️ Avaliação de Infraestrutura]
    
    C --> F[📊 Score Visual 0-100]
    D --> F
    E --> F
    
    F --> G[💡 Insights Automáticos]
    F --> H[⚠️ Riscos Identificados]
    F --> I[🎯 Oportunidades Detectadas]
    
    style B fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
```

**Capacidades de Análise Visual:**
- 🏪 **Estabelecimentos**: Identificação automática de tipos de negócio
- 🚶 **Densidade de Pessoas**: Análise de movimento e fluxo
- 🏗️ **Infraestrutura**: Qualidade de vias, sinalização, acessibilidade
- 🎯 **Oportunidades**: Gaps de mercado visíveis na imagem
- ⚠️ **Riscos**: Problemas estruturais ou de localização

### 🔮 **Machine Learning Preditivo**

```mermaid
graph TD
    A[📊 Dados Históricos] --> B[🧠 TensorFlow Neural Network]
    C[📈 Padrões Sazonais] --> B
    D[🌐 Tendências Regionais] --> B
    
    B --> E[🎯 Predição de Sucesso]
    B --> F[📅 Análise Sazonal]
    B --> G[📈 Projeções 5 Anos]
    
    E --> H[🎲 Cenários de Risco]
    F --> I[⏰ Timing Ideal]
    G --> J[📊 ROI Projetado]
    
    style B fill:#764ba2,stroke:#333,stroke-width:3px,color:#fff
    style E fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
```

**Predições Disponíveis:**
- 🎯 **Probabilidade de Sucesso**: 0-100% baseado em ML
- 📅 **Sazonalidade**: Melhores e piores meses por tipo de negócio
- 📈 **Tendências de Mercado**: Crescimento, concorrência, custos
- 🎲 **Cenários de Risco**: Otimista (25%), Realista (50%), Pessimista (25%)
- ⏰ **Timing Estratégico**: Melhor época para abertura

## 🧠 Algoritmos Avançados

### 🏆 Competitor Rating Index (CRI)

O **CRI** analisa a qualidade dos concorrentes usando dados do Google Places API:

```mermaid
graph LR
    A[📍 Localização] --> B[🔍 Google Places API]
    B --> C[⭐ Ratings]
    B --> D[📊 Reviews]
    B --> E[💰 Price Level]
    
    C --> F[🧮 Algoritmo CRI]
    D --> F
    E --> F
    
    F --> G[📈 Score 0-100]
    G --> H{Interpretação}
    
    H --> I[🟢 80-100: Concorrentes Fracos]
    H --> J[🟡 60-79: Competição Moderada]
    H --> K[🔴 0-59: Mercado Saturado]
    
    style F fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
```

**Fórmula CRI:**
- Score inicial: 100 pontos
- Penalização por quantidade de concorrentes: -5 pontos cada
- Penalização por rating alto (4.5+): -25 pontos
- Penalização por muitas reviews (500+): -20 pontos
- Penalização por concorrentes estabelecidos: -8 pontos cada

### 🗺️ POI Complementarity Score (PCS)

O **PCS** mede a sinergia com pontos de interesse usando OpenStreetMap:

```mermaid
graph TB
    A[📍 Localização] --> B[🗺️ OpenStreetMap API]
    B --> C[🏪 Supermercados: 20pts]
    B --> D[🏫 Escolas: 20pts]
    B --> E[🏥 Hospitais: 15pts]
    B --> F[🚌 Transporte: 12-18pts]
    B --> G[🍽️ Restaurantes: 10pts]
    
    C --> H[🧮 Algoritmo PCS]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[🎯 Combinações Sinérgicas]
    I --> J[🏢 Centro Comercial Completo]
    I --> K[🎓 Zona Escolar Comercial]
    I --> L[🚇 Hub de Transporte]
    
    H --> M[📈 Score 0-100]
    M --> N{Potencial de Tráfego}
    
    N --> O[🟢 80+: Muito Alto]
    N --> P[🟡 60-79: Alto]
    N --> Q[🔴 <40: Baixo]
    
    style H fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
```

**Fórmula PCS:**
- Pontuação por categoria de POI (máximo 2x valor base)
- Bônus por diversidade: +10-15 pontos
- Bônus por combinações sinérgicas: +8 pontos cada
- Score de acessibilidade: até +25 pontos

## 🌐 Análise Multi-Cidade e Marketplace

### 🏙️ **Comparativo Multi-Cidade**

```mermaid
graph TB
    A[🎯 Tipo de Negócio] --> B[🌐 Análise Simultânea]
    B --> C[🏙️ São Paulo]
    B --> D[🏖️ Rio de Janeiro]
    B --> E[⛰️ Belo Horizonte]
    B --> F[🌴 Salvador]
    B --> G[🏛️ Brasília]
    B --> H[🌊 Fortaleza]
    
    C --> I[📊 Ranking Inteligente]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[🏆 Melhor Cidade]
    I --> K[💰 Melhor Custo-Benefício]
    I --> L[📈 Maior ROI]
    I --> M[⚠️ Menor Risco]
    
    style B fill:#667eea,stroke:#333,stroke-width:3px,color:#fff
    style I fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
```

**Métricas Comparativas:**
- 📊 **Score de Viabilidade**: Análise completa por cidade
- 💰 **Investimento Inicial**: Custos estimados por região
- 📈 **ROI Projetado**: Retorno esperado em 12-24 meses
- ⏰ **Payback Period**: Tempo para recuperar investimento
- ⚠️ **Nível de Risco**: Baixo, médio ou alto por localização

### 🤝 **Marketplace de Oportunidades**

```mermaid
graph LR
    A[📊 Análises Validadas] --> B[🏪 Marketplace]
    B --> C[💎 Premium 80+]
    B --> D[🎯 Oportunidade 65+]
    B --> E[💰 Baixo Custo <100k]
    B --> F[🌱 Emergente 50+]
    
    C --> G[👥 Investidores]
    D --> G
    E --> G
    F --> G
    
    G --> H[🤝 Matching Inteligente]
    H --> I[📞 Conexão Direta]
    
    style B fill:#f39c12,stroke:#333,stroke-width:3px,color:#fff
    style H fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
```

**Categorias do Marketplace:**
- 💎 **Premium**: Oportunidades com score 80+ (alto potencial)
- 🎯 **Oportunidade**: Localizações viáveis com score 65+
- 💰 **Baixo Custo**: Investimento inicial menor que R$ 100k
- 🌱 **Emergente**: Mercados em desenvolvimento (score 50+)

**Sistema de Matching:**
- 🎯 **Perfil do Investidor**: Orçamento, tolerância ao risco, preferências
- 📊 **Score de Compatibilidade**: Algoritmo de matching personalizado
- 🔔 **Alertas Inteligentes**: Notificações de novas oportunidades
- 📈 **Histórico de Performance**: Track record das oportunidades

## 📦 Estrutura do Projeto

```mermaid
graph TD
    A[📁 bizradar-ai/] --> B[⚙️ server/]
    A --> C[🖥️ client/]
    A --> D[📄 package.json]
    A --> E[📚 README.md]
    A --> F[🔧 SETUP.md]
    
    B --> G[📊 models/]
    B --> H[🛣️ routes/]
    B --> I[🔌 services/]
    B --> J[🛡️ middleware/]
    B --> K[🚀 index.js]
    
    C --> L[📱 src/]
    C --> M[🌐 public/]
    
    L --> N[🧩 components/]
    L --> O[📄 pages/]
    L --> P[🔄 contexts/]
    L --> Q[⚛️ App.js]
    
    G --> G1[👤 User.js]
    G --> G2[📊 Analysis.js]
    
    H --> H1[🔐 auth.js]
    H --> H2[📈 analysis.js]
    H --> H3[👥 user.js]
    
    I --> I1[🏛️ receitaFederalService.js]
    I --> I2[📊 ibgeService.js]
    I --> I3[🗺️ openStreetMapService.js]
    I --> I4[🧮 scoreService.js]
    
    O --> O1[🏠 Home.js]
    O --> O2[📊 Dashboard.js]
    O --> O3[📝 NewAnalysis.js]
    O --> O4[📈 AnalysisResult.js]
    O --> O5[📋 AnalysisHistory.js]
    
    style A fill:#667eea,stroke:#333,stroke-width:3px,color:#fff
    style B fill:#764ba2,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style O fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
```

### 🗂️ Estrutura Detalhada

```
bizradar-ai/
├── 📁 server/                 # Backend Node.js + Express
│   ├── 📊 models/            # Esquemas MongoDB (User, Analysis)
│   ├── 🛣️ routes/            # Endpoints da API REST
│   ├── 🔌 services/          # Integrações com APIs externas
│   ├── 🛡️ middleware/        # Auth, rate limiting, validação
│   ├── 🚀 index.js          # Servidor principal Express
│   └── ⚙️ config.env        # Variáveis de ambiente
├── 📁 client/                # Frontend React SPA
│   ├── 📱 src/
│   │   ├── 🧩 components/    # Componentes reutilizáveis (Layout, etc)
│   │   ├── 📄 pages/         # Páginas da aplicação (Home, Dashboard)
│   │   ├── 🔄 contexts/      # Context API (Auth, Analysis)
│   │   ├── ⚛️ App.js        # Componente raiz + roteamento
│   │   └── 🎨 index.css     # Estilos globais
│   ├── 🌐 public/           # Assets estáticos (HTML, ícones)
│   └── 📦 package.json      # Dependências React
├── 📄 package.json          # Scripts principais do projeto
├── 📚 README.md             # Documentação completa
└── 🔧 SETUP.md              # Guia de instalação rápida
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- MongoDB
- NPM ou Yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/bizradar-ai.git
cd bizradar-ai
```

2. **Instale as dependências**
```bash
npm run install-all
```

3. **Configure as variáveis de ambiente**
```bash
# Copie e configure o arquivo de ambiente
cp server/config.env server/.env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bizradar
JWT_SECRET=seu_jwt_secret_aqui
NODE_ENV=development

# API Keys de IA (essenciais para features avançadas)
OPENAI_API_KEY=sua_chave_openai_gpt4_vision
GOOGLE_PLACES_API_KEY=sua_chave_google_places

# API Keys opcionais (para desenvolvimento)
SERPRO_API_KEY=sua_chave_serpro
IBGE_API_KEY=sua_chave_ibge
MAPBOX_ACCESS_TOKEN=seu_token_mapbox
```

### 🔑 Configuração das APIs

**Google Places API (para CRI):**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione existente
3. Ative a **Places API**
4. Gere uma API Key
5. Configure restrições (opcional)

**OpenStreetMap (para PCS):**
- ✅ **Gratuito** - Não requer API key
- Usa Overpass API pública
- Rate limit: ~10.000 requests/dia

**Receita Federal & IBGE:**
- ✅ **APIs públicas** - Não requerem autenticação
- Dados oficiais do governo brasileiro

4. **Inicie o MongoDB**
```bash
# No Windows
net start MongoDB

# No macOS/Linux
sudo systemctl start mongod
```

5. **Execute a aplicação**
```bash
# Desenvolvimento (backend + frontend)
npm run dev

# Ou execute separadamente:
npm run server  # Backend na porta 5000
npm run client  # Frontend na porta 3000
```

6. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Endpoints da API

### 🔐 Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil

### 📊 Análises Tradicionais
- `POST /api/analysis` - Criar nova análise (com CRI e PCS)
- `GET /api/analysis/:id` - Obter análise específica
- `GET /api/analysis` - Listar análises do usuário
- `DELETE /api/analysis/:id` - Deletar análise
- `GET /api/analysis/:id/export` - Exportar análise
- `GET /api/analysis/:id/cri` - Obter detalhes do CRI
- `GET /api/analysis/:id/pcs` - Obter detalhes do PCS

### 🤖 IA Conversacional
- `POST /api/ai/chat` - Consulta ao assistente IA
- `GET /api/ai/history/:userId` - Histórico de conversas
- `POST /api/ai/sentiment` - Análise de sentimento

### 📸 Análise Visual
- `POST /api/vision/analyze-image` - Análise de foto
- `POST /api/vision/analyze-video` - Análise de vídeo
- `GET /api/vision/history/:userId` - Histórico de análises visuais

### 🌐 Multi-Cidade
- `POST /api/multi-city/compare` - Comparar cidades
- `GET /api/multi-city/cities` - Lista de cidades disponíveis
- `GET /api/multi-city/analysis/:id` - Análise multi-cidade específica

### 🤝 Marketplace
- `GET /api/marketplace/opportunities` - Listar oportunidades
- `POST /api/marketplace/opportunities` - Criar oportunidade
- `GET /api/marketplace/opportunities/:id` - Oportunidade específica
- `POST /api/marketplace/interest` - Demonstrar interesse
- `GET /api/marketplace/my-opportunities/:userId` - Minhas oportunidades

### 🔮 Análise Preditiva
- `POST /api/predictive/success` - Predição de sucesso
- `POST /api/predictive/seasonal` - Análise sazonal
- `POST /api/predictive/market-trends` - Tendências de mercado

### 📊 Dashboard Executivo
- `GET /api/dashboard/kpis` - KPIs globais
- `GET /api/dashboard/user-metrics/:userId` - Métricas do usuário
- `GET /api/dashboard/market-trends` - Tendências de mercado
- `GET /api/dashboard/alerts/:userId` - Alertas e notificações

### 👤 Usuário
- `GET /api/user/subscription` - Informações da assinatura
- `PUT /api/user/subscription/upgrade` - Fazer upgrade do plano
- `GET /api/user/usage` - Estatísticas de uso

## 💰 Modelo de Negócio

```mermaid
graph TB
    subgraph "💼 Planos de Assinatura"
        A[💡 Básico<br/>Análises Limitadas]
        B[🚀 Profissional<br/>Recursos Avançados]
        C[🏢 Enterprise<br/>Solução Completa]
    end
    
    subgraph "🎯 Público-Alvo"
        D[👤 Empreendedores<br/>Iniciantes]
        E[💼 Consultorias<br/>de Negócios]
        F[🏪 Franquias]
        G[🏢 Empresas<br/>Grande Porte]
    end
    
    A --> D
    B --> E
    B --> F
    C --> G
    
    style A fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#45b7d1,stroke:#333,stroke-width:3px,color:#fff
    style C fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#e8f5e8,stroke:#333,stroke-width:1px,color:#333
    style E fill:#e8f5e8,stroke:#333,stroke-width:1px,color:#333
    style F fill:#e8f5e8,stroke:#333,stroke-width:1px,color:#333
    style G fill:#e8f5e8,stroke:#333,stroke-width:1px,color:#333
```

### 📊 Comparativo de Planos

| Funcionalidade | Básico | Profissional | Enterprise |
|---|:---:|:---:|:---:|
| **💰 Modelo** | Por análise | Assinatura mensal | Sob medida |
| **📊 Análises** | Limitadas | ♾️ Ilimitadas | ♾️ Ilimitadas |
| **🗺️ Mapeamento** | ✅ Básico | ✅ Completo | ✅ Avançado |
| **📈 Demografia** | ✅ Básica | ✅ Avançada | ✅ Personalizada |
| **🎯 Sugestões** | ❌ | ✅ Localizações | ✅ + Estratégias |
| **🚌 Transporte** | ❌ | ✅ | ✅ |
| **📄 Exportação** | ❌ | ✅ PDF/Excel | ✅ + Formatos |
| **🔌 API** | ❌ | ✅ | ✅ + Webhooks |
| **📞 Suporte** | 📧 Email | 🚀 Prioritário | 🌟 24/7 |
| **👥 Consultoria** | ❌ | ❌ | ✅ Especializada |

### 🎯 Segmentação de Mercado

**💡 Básico**
- 🎯 Empreendedores iniciantes
- 📊 Análises pontuais
- 🏪 Pequenos negócios locais
- 📧 Suporte por email

**🚀 Profissional - MAIS POPULAR**
- 🎯 Consultorias e corretores
- ♾️ Análises ilimitadas
- 🔌 API para integração
- 🚀 Suporte prioritário

**🏢 Enterprise**
- 🎯 Grandes empresas e franquias
- 📊 Análises em lote
- 👨‍💼 Consultoria especializada
- 🌟 Suporte 24/7 + SLA

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Executa backend + frontend
npm run server       # Executa apenas o backend
npm run client       # Executa apenas o frontend
npm run build        # Build de produção
npm run start        # Executa em produção
npm run install-all  # Instala todas as dependências
```

### Estrutura de Dados

**Usuário**
```javascript
{
  name: String,
  email: String,
  password: String (hash),
  plan: 'individual' | 'pro' | 'enterprise',
  subscription: {
    status: 'active' | 'inactive' | 'trial',
    analysisCount: Number,
    analysisLimit: Number
  }
}
```

**Análise**
```javascript
{
  userId: ObjectId,
  businessType: String,
  cnae: String,
  location: {
    address: String,
    coordinates: { lat: Number, lng: Number }
  },
  competitors: {
    formal: [Competitor],
    informal: [Competitor],
    google: [GooglePlaceCompetitor] // Novo: dados do Google Places
  },
  demographics: DemographicData,
  scores: {
    saturation: { value: Number, level: String },
    opportunity: { value: Number, level: String },
    competitorRating: { // Novo: CRI Score
      score: Number,
      level: String,
      analysis: {
        total_competitors: Number,
        avg_rating: Number,
        avg_reviews: Number,
        high_quality_competitors: Number,
        market_saturation: String
      }
    },
    poiComplementarity: { // Novo: PCS Score
      score: Number,
      level: String,
      analysis: {
        traffic_generators: [Object],
        complementary_businesses: [String],
        accessibility_score: Number,
        foot_traffic_potential: String
      }
    },
    final: { value: Number, probability: String }
  },
  insights: [Insight], // Expandido com insights de CRI e PCS
  status: 'processing' | 'completed' | 'error',
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testes

```bash
# Testes do backend
cd server && npm test

# Testes do frontend
cd client && npm test
```

## 📈 Deploy

```mermaid
graph TB
    subgraph "🔧 Desenvolvimento"
        A[💻 Código Local] --> B[🧪 Testes]
        B --> C[📝 Commit/Push]
    end
    
    subgraph "🚀 CI/CD Pipeline"
        C --> D[⚙️ Build Backend]
        C --> E[🎨 Build Frontend]
        D --> F[🧪 Testes Backend]
        E --> G[🧪 Testes Frontend]
        F --> H[📦 Docker Image]
        G --> H
    end
    
    subgraph "☁️ Produção"
        H --> I[🌐 Deploy Server]
        I --> J[🗄️ MongoDB Atlas]
        I --> K[🔒 SSL/HTTPS]
        I --> L[📊 Monitoring]
    end
    
    subgraph "🔄 Monitoramento"
        L --> M[📈 Analytics]
        L --> N[🚨 Alertas]
        L --> O[📋 Logs]
    end
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#48bb78,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#f39c12,stroke:#333,stroke-width:2px,color:#fff
    style J fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
```

### 🚀 Processo de Deploy

**1. 🔧 Preparação**
```bash
# Build do frontend
npm run build

# Configurar variáveis de ambiente
cp server/config.env server/.env
```

**2. 🐳 Docker (Recomendado)**
```bash
# Build da imagem
docker build -t bizradar-ai .

# Execute o container
docker run -p 5000:5000 bizradar-ai
```

**3. ☁️ Deploy em Produção**
- **Frontend**: Vercel, Netlify ou AWS S3
- **Backend**: Heroku, Railway ou AWS EC2
- **Banco**: MongoDB Atlas (cloud)
- **CDN**: Cloudflare para performance

**4. 📊 Monitoramento**
- **Uptime**: UptimeRobot
- **Performance**: New Relic ou DataDog
- **Logs**: LogRocket ou Sentry
- **Analytics**: Google Analytics + Mixpanel

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏆 Funcionalidades Implementadas

### 🔐 **Core System**
- ✅ **Sistema de Autenticação** (JWT + Context API)
- ✅ **Dashboard Interativo** (Estatísticas + Gráficos)
- ✅ **Interface Responsiva** (Mobile + Desktop)
- ✅ **Sistema de Planos** (Básico, Profissional, Enterprise)

### 🤖 **Inteligência Artificial Avançada**
- ✅ **Assistente IA Conversacional** (ChatGPT-4 integrado)
- ✅ **Análise Visual com Computer Vision** (OpenAI Vision API)
- ✅ **Machine Learning Preditivo** (TensorFlow.js)
- ✅ **Análise de Sentimento** (Para métricas de satisfação)
- ✅ **Processamento de Linguagem Natural** (7 tipos de consulta)

### 🌐 **Análise Multi-Dimensional**
- ✅ **Comparativo Multi-Cidade** (10+ cidades brasileiras)
- ✅ **Marketplace de Oportunidades** (4 categorias de investimento)
- ✅ **Análise Preditiva** (Cenários de 5 anos)
- ✅ **Dashboard Executivo** (15+ KPIs em tempo real)
- ✅ **Alertas Inteligentes** (Notificações automáticas)

### 🧠 **Algoritmos Proprietários**
- ✅ **Motor de Score Avançado** (6 fatores ponderados)
- ✅ **CRI - Competitor Rating Index** (Google Places API)
- ✅ **PCS - POI Complementarity Score** (OpenStreetMap)
- ✅ **Análise de Saturação** (Densidade vs. População)
- ✅ **Insights Inteligentes** (15+ tipos de recomendações)

### 🗺️ **Análise Geoespacial**
- ✅ **Mapas Interativos** (Leaflet + Camadas dinâmicas)
- ✅ **Mapeamento 360°** (Formais + Informais + Ratings)
- ✅ **Análise de Mobilidade** (Transporte público)
- ✅ **Sinergia Comercial** (POIs complementares)
- ✅ **Análise Visual de Localização** (Upload de fotos)

### 📊 **Data & Analytics**
- ✅ **Histórico de Análises** (Filtros + Exportação)
- ✅ **Relatórios Avançados** (PDF/JSON com CRI e PCS)
- ✅ **APIs Integradas** (4 fontes de dados)
- ✅ **Cache Inteligente** (Performance otimizada)

### 🛠️ **Desenvolvimento**
- ✅ **Dados Mock Realistas** (Para demonstração)
- ✅ **Fallback Systems** (Funcionamento sem APIs)
- ✅ **Documentação Completa** (README + Setup)
- ✅ **Arquitetura Escalável** (Microserviços)


**🚀 BizRadar AI - Análise Inteligente de Negócios**

</div>
