const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticação JWT
 */
const auth = async (req, res, next) => {
  try {
    // Extrai token do header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Remove "Bearer " do início do token
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso inválido'
      });
    }

    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Busca o usuário no banco
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          error: 'Usuário não encontrado'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          error: 'Conta desativada'
        });
      }

      // Adiciona dados do usuário à requisição
      req.userId = user._id;
      req.user = user;
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para verificar plano do usuário
 */
const checkPlan = (requiredPlans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    const userPlan = req.user.plan;
    
    if (!requiredPlans.includes(userPlan)) {
      return res.status(403).json({
        error: 'Plano insuficiente para acessar este recurso',
        currentPlan: userPlan,
        requiredPlans
      });
    }

    next();
  };
};

/**
 * Middleware para verificar limite de análises
 */
const checkAnalysisLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    // Verifica se usuário pode realizar análise
    if (!req.user.canPerformAnalysis()) {
      return res.status(403).json({
        error: 'Limite de análises atingido',
        currentPlan: req.user.plan,
        analysisCount: req.user.subscription.analysisCount,
        analysisLimit: req.user.subscription.analysisLimit,
        message: 'Faça upgrade do seu plano para análises ilimitadas'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Erro ao verificar limite de análises:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para verificar se assinatura está ativa
 */
const checkActiveSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuário não autenticado'
    });
  }

  const subscription = req.user.subscription;
  
  // Verifica se assinatura está ativa
  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return res.status(403).json({
      error: 'Assinatura inativa',
      subscriptionStatus: subscription.status,
      message: 'Renove sua assinatura para continuar usando o serviço'
    });
  }

  // Verifica se assinatura não expirou
  if (subscription.endDate && new Date() > subscription.endDate) {
    return res.status(403).json({
      error: 'Assinatura expirada',
      expiredAt: subscription.endDate,
      message: 'Renove sua assinatura para continuar usando o serviço'
    });
  }

  next();
};

/**
 * Middleware opcional de autenticação (não bloqueia se não autenticado)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next(); // Continua sem autenticação
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continua sem autenticação
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.userId = user._id;
        req.user = user;
      }
    } catch (jwtError) {
      // Ignora erros de JWT no modo opcional
      console.log('Token inválido no modo opcional:', jwtError.message);
    }

    next();
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação opcional:', error);
    next(); // Continua mesmo com erro
  }
};

/**
 * Middleware para rate limiting por usuário
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.userId) {
      return next(); // Sem rate limit para usuários não autenticados
    }

    const userId = req.userId.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpa requisições antigas
    if (requests.has(userId)) {
      const userRequests = requests.get(userId);
      const validRequests = userRequests.filter(time => time > windowStart);
      requests.set(userId, validRequests);
    } else {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    // Verifica limite
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições',
        message: `Limite de ${maxRequests} requisições por ${windowMs / 60000} minutos atingido`,
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }

    // Adiciona requisição atual
    userRequests.push(now);
    requests.set(userId, userRequests);

    next();
  };
};

module.exports = {
  auth,
  checkPlan,
  checkAnalysisLimit,
  checkActiveSubscription,
  optionalAuth,
  userRateLimit
};
