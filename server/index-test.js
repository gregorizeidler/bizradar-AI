const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock data for testing
let mockUsers = [];
let mockAnalyses = [];
let currentUserId = 1;
let currentAnalysisId = 1;

// Mock auth middleware
const mockAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (token === 'mock-token') {
    req.userId = 1;
    req.user = mockUsers[0] || {
      _id: 1,
      name: 'Usuário Teste',
      email: 'teste@bizradar.com',
      plan: 'individual',
      subscription: {
        status: 'trial',
        analysisCount: 0,
        analysisLimit: 3
      }
    };
    next();
  } else {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  const user = {
    _id: currentUserId++,
    name,
    email,
    plan: 'individual',
    subscription: {
      status: 'trial',
      analysisCount: 0,
      analysisLimit: 3,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date()
  };
  
  mockUsers.push(user);
  
  res.status(201).json({
    message: 'Usuário criado com sucesso',
    token: 'mock-token',
    user
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  let user = mockUsers.find(u => u.email === email);
  if (!user) {
    // Create default user for testing
    user = {
      _id: currentUserId++,
      name: 'Usuário Teste',
      email,
      plan: 'individual',
      subscription: {
        status: 'trial',
        analysisCount: 0,
        analysisLimit: 3
      },
      createdAt: new Date()
    };
    mockUsers.push(user);
  }
  
  res.json({
    message: 'Login realizado com sucesso',
    token: 'mock-token',
    user
  });
});

app.get('/api/auth/me', mockAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/analysis', mockAuth, (req, res) => {
  const { businessType, cnae, address, searchRadius } = req.body;
  
  const analysis = {
    _id: currentAnalysisId++,
    userId: req.userId,
    businessType,
    cnae,
    location: {
      address,
      coordinates: {
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lng: -46.6333 + (Math.random() - 0.5) * 0.1
      },
      city: 'São Paulo',
      state: 'SP'
    },
    searchRadius,
    status: 'processing',
    createdAt: new Date()
  };
  
  mockAnalyses.push(analysis);
  
  // Simulate processing
  setTimeout(() => {
    const updatedAnalysis = {
      ...analysis,
      status: 'completed',
      competitors: {
        formal: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
          name: `${businessType} Concorrente ${i + 1}`,
          cnpj: `12.345.678/000${i + 1}-90`,
          distance: Math.floor(Math.random() * 1000) + 100,
          coordinates: {
            lat: analysis.location.coordinates.lat + (Math.random() - 0.5) * 0.01,
            lng: analysis.location.coordinates.lng + (Math.random() - 0.5) * 0.01
          }
        })),
        informal: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
          name: `${businessType} Informal ${i + 1}`,
          type: businessType.toLowerCase(),
          distance: Math.floor(Math.random() * 800) + 50,
          coordinates: {
            lat: analysis.location.coordinates.lat + (Math.random() - 0.5) * 0.01,
            lng: analysis.location.coordinates.lng + (Math.random() - 0.5) * 0.01
          }
        })),
        total: 0
      },
      demographics: {
        population: Math.floor(Math.random() * 500000) + 50000,
        averageIncome: Math.floor(Math.random() * 3000) + 1500,
        ageDistribution: {
          under18: 25000,
          age18to35: 35000,
          age36to55: 25000,
          over55: 15000
        },
        educationLevel: {
          elementary: 45,
          highSchool: 35,
          college: 15,
          graduate: 5
        }
      },
      scores: {
        saturation: {
          value: Math.floor(Math.random() * 100),
          level: ['baixa', 'média', 'alta'][Math.floor(Math.random() * 3)],
          description: 'Análise de saturação baseada na concorrência local'
        },
        opportunity: {
          value: Math.floor(Math.random() * 100),
          level: ['baixa', 'média', 'alta'][Math.floor(Math.random() * 3)],
          description: 'Oportunidade baseada em demografia e localização'
        },
        final: {
          value: Math.floor(Math.random() * 100),
          probability: `${Math.floor(Math.random() * 100)}% de chance de sucesso`,
          recommendation: 'Localização com potencial moderado para o tipo de negócio selecionado.'
        }
      },
      insights: [
        {
          type: 'opportunity',
          title: 'Boa Demografia',
          description: 'A região possui perfil demográfico favorável ao seu tipo de negócio.',
          priority: 'medium'
        },
        {
          type: 'warning',
          title: 'Concorrência Moderada',
          description: 'Existem alguns concorrentes na região. Considere estratégias de diferenciação.',
          priority: 'medium'
        }
      ],
      processingTime: 2500
    };
    
    updatedAnalysis.competitors.total = updatedAnalysis.competitors.formal.length + updatedAnalysis.competitors.informal.length;
    
    const index = mockAnalyses.findIndex(a => a._id === analysis._id);
    if (index !== -1) {
      mockAnalyses[index] = updatedAnalysis;
    }
  }, 3000);
  
  res.status(201).json({
    message: 'Análise iniciada com sucesso',
    analysisId: analysis._id,
    status: 'processing'
  });
});

app.get('/api/analysis/:id', mockAuth, (req, res) => {
  const analysis = mockAnalyses.find(a => a._id == req.params.id && a.userId === req.userId);
  
  if (!analysis) {
    return res.status(404).json({ error: 'Análise não encontrada' });
  }
  
  res.json({ analysis });
});

app.get('/api/analysis', mockAuth, (req, res) => {
  const userAnalyses = mockAnalyses
    .filter(a => a.userId === req.userId)
    .map(a => ({
      id: a._id,
      businessType: a.businessType,
      address: a.location.address,
      finalScore: a.scores?.final?.value || null,
      status: a.status,
      createdAt: a.createdAt
    }));
  
  res.json({
    analyses: userAnalyses,
    pagination: {
      current: 1,
      total: 1,
      count: userAnalyses.length,
      totalRecords: userAnalyses.length
    }
  });
});

app.get('/api/analysis/stats/dashboard', mockAuth, (req, res) => {
  const userAnalyses = mockAnalyses.filter(a => a.userId === req.userId);
  const completed = userAnalyses.filter(a => a.status === 'completed');
  
  res.json({
    stats: {
      total: userAnalyses.length,
      completed: completed.length,
      processing: userAnalyses.filter(a => a.status === 'processing').length,
      averageScore: completed.length > 0 ? 
        Math.round(completed.reduce((sum, a) => sum + (a.scores?.final?.value || 0), 0) / completed.length) : null
    },
    analysesByType: userAnalyses.reduce((acc, a) => {
      const existing = acc.find(item => item.businessType === a.businessType);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ businessType: a.businessType, count: 1 });
      }
      return acc;
    }, []),
    recentAnalyses: userAnalyses.slice(-5).map(a => ({
      id: a._id,
      businessType: a.businessType,
      address: a.location.address,
      finalScore: a.scores?.final?.value || null,
      status: a.status,
      createdAt: a.createdAt
    })),
    userLimits: {
      remainingAnalyses: Math.max(0, 3 - req.user.subscription.analysisCount),
      currentPlan: req.user.plan,
      canPerformAnalysis: req.user.subscription.analysisCount < 3
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'TEST MODE - Using mock data'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de TESTE rodando na porta ${PORT}`);
  console.log(`🧪 Modo: TESTE com dados mock (sem MongoDB)`);
  console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
