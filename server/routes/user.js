const express = require('express');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { auth, checkPlan } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/user/subscription
 * @desc    Obter informações da assinatura
 * @access  Private
 */
router.get('/subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('plan subscription');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const subscription = {
      plan: user.plan,
      status: user.subscription.status,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      analysisCount: user.subscription.analysisCount,
      analysisLimit: user.subscription.analysisLimit,
      remainingAnalyses: user.getRemainingAnalyses(),
      canPerformAnalysis: user.canPerformAnalysis(),
      daysRemaining: user.subscription.endDate ? 
        Math.max(0, Math.ceil((user.subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null
    };

    res.json({ subscription });
  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   PUT /api/user/subscription/upgrade
 * @desc    Fazer upgrade do plano
 * @access  Private
 */
router.put('/subscription/upgrade', auth, async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    const validPlans = ['individual', 'pro', 'enterprise'];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({
        error: 'Plano inválido',
        validPlans
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verifica se é realmente um upgrade
    const planHierarchy = { individual: 1, pro: 2, enterprise: 3 };
    if (planHierarchy[newPlan] <= planHierarchy[user.plan]) {
      return res.status(400).json({
        error: 'Novo plano deve ser superior ao atual',
        currentPlan: user.plan,
        requestedPlan: newPlan
      });
    }

    // Atualiza plano e limites
    user.plan = newPlan;
    user.subscription.status = 'active';
    
    // Define novos limites baseado no plano
    switch (newPlan) {
      case 'pro':
        user.subscription.analysisLimit = 999999; // Ilimitado
        user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
        break;
      case 'enterprise':
        user.subscription.analysisLimit = 999999; // Ilimitado
        user.subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 ano
        break;
    }

    await user.save();

    res.json({
      message: `Plano atualizado para ${newPlan} com sucesso`,
      subscription: {
        plan: user.plan,
        status: user.subscription.status,
        endDate: user.subscription.endDate,
        analysisLimit: user.subscription.analysisLimit,
        remainingAnalyses: user.getRemainingAnalyses()
      }
    });
  } catch (error) {
    console.error('❌ Erro ao fazer upgrade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/user/usage
 * @desc    Obter estatísticas de uso
 * @access  Private
 */
router.get('/usage', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { period = '30' } = req.query; // dias
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Análises no período
    const analysesInPeriod = await Analysis.countDocuments({
      userId,
      createdAt: { $gte: startDate }
    });

    // Análises por status
    const analysesByStatus = await Analysis.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Análises por dia (últimos 7 dias)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Analysis.countDocuments({
        userId,
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Tipos de negócio mais analisados
    const topBusinessTypes = await Analysis.aggregate([
      { $match: { userId } },
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Tempo médio de processamento
    const avgProcessingTime = await Analysis.aggregate([
      { 
        $match: { 
          userId, 
          status: 'completed',
          processingTime: { $exists: true, $ne: null }
        } 
      },
      { $group: { _id: null, avgTime: { $avg: '$processingTime' } } }
    ]);

    res.json({
      usage: {
        analysesInPeriod,
        analysesByStatus: analysesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        dailyAnalyses: last7Days,
        topBusinessTypes: topBusinessTypes.map(item => ({
          businessType: item._id,
          count: item.count
        })),
        averageProcessingTime: avgProcessingTime.length > 0 ? 
          Math.round(avgProcessingTime[0].avgTime / 1000) : null // em segundos
      },
      period: parseInt(period)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de uso:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/user/preferences
 * @desc    Obter preferências do usuário
 * @access  Private
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('preferences profile');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      preferences: user.preferences,
      profile: user.profile
    });
  } catch (error) {
    console.error('❌ Erro ao buscar preferências:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   PUT /api/user/preferences
 * @desc    Atualizar preferências do usuário
 * @access  Private
 */
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences, profile } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Atualiza preferências
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Atualiza perfil
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      message: 'Preferências atualizadas com sucesso',
      preferences: user.preferences,
      profile: user.profile
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar preferências:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/user/export
 * @desc    Exportar dados do usuário (LGPD)
 * @access  Private
 */
router.get('/export', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const analyses = await Analysis.find({ userId: req.userId });

    const userData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscription: user.subscription,
        profile: user.profile,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      analyses: analyses.map(analysis => ({
        id: analysis._id,
        businessType: analysis.businessType,
        location: analysis.location,
        scores: analysis.scores,
        status: analysis.status,
        createdAt: analysis.createdAt
      })),
      exportedAt: new Date().toISOString(),
      totalAnalyses: analyses.length
    };

    res.json(userData);
  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/user/plans
 * @desc    Listar planos disponíveis
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'individual',
        name: 'Individual',
        price: 49,
        currency: 'BRL',
        period: 'por análise',
        features: [
          '1 análise detalhada',
          'Mapeamento de concorrência',
          'Análise demográfica básica',
          'Score de oportunidade',
          'Suporte por email'
        ],
        limits: {
          analyses: 1,
          support: 'email'
        },
        popular: false
      },
      {
        id: 'pro',
        name: 'PRO',
        price: 399,
        currency: 'BRL',
        period: 'por mês',
        features: [
          'Análises ilimitadas',
          'Mapeamento completo de concorrência',
          'Análise demográfica avançada',
          'Sugestões de localização alternativa',
          'Análise de transporte público',
          'Exportação em PDF/Excel',
          'Suporte prioritário',
          'API de integração'
        ],
        limits: {
          analyses: 'unlimited',
          support: 'priority'
        },
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Sob consulta',
        currency: 'BRL',
        period: 'personalizado',
        features: [
          'Tudo do plano PRO',
          'Análises em lote',
          'Dashboard personalizado',
          'Integração com CRM',
          'Consultoria especializada',
          'Suporte 24/7',
          'Treinamento da equipe',
          'SLA garantido'
        ],
        limits: {
          analyses: 'unlimited',
          support: '24/7'
        },
        popular: false
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('❌ Erro ao listar planos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/user/feedback
 * @desc    Enviar feedback sobre o serviço
 * @access  Private
 */
router.post('/feedback', auth, async (req, res) => {
  try {
    const { rating, message, category = 'general' } = req.body;

    if (!rating || !message) {
      return res.status(400).json({
        error: 'Avaliação e mensagem são obrigatórias'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Avaliação deve estar entre 1 e 5'
      });
    }

    // Em um sistema real, salvaria no banco de dados
    console.log('📝 Feedback recebido:', {
      userId: req.userId,
      rating,
      message,
      category,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Feedback enviado com sucesso. Obrigado pela sua opinião!'
    });
  } catch (error) {
    console.error('❌ Erro ao enviar feedback:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
