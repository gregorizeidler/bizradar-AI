const Analysis = require('../models/Analysis');
const User = require('../models/User');
const mongoose = require('mongoose');

// Schema para oportunidades do marketplace
const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  businessType: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  scores: {
    final: { type: Number, required: true },
    cri: { type: Number },
    pcs: { type: Number },
    saturation: { type: Number },
    opportunity: { type: Number }
  },
  investment: {
    initial: { type: Number, required: true },
    monthly: { type: Number, required: true },
    paybackMonths: { type: Number }
  },
  roi: {
    estimated: { type: Number },
    period: { type: String }
  },
  marketData: {
    competitors: { type: Number },
    avgRating: { type: Number },
    population: { type: Number },
    averageIncome: { type: Number }
  },
  tags: [{ type: String }],
  category: { 
    type: String, 
    enum: ['PREMIUM', 'OPORTUNIDADE', 'BAIXO_CUSTO', 'EMERGENTE'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ANALISE'],
    default: 'DISPONIVEL' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interestedUsers: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['INTERESSADO', 'NEGOCIANDO', 'DESISTIU'], default: 'INTERESSADO' }
  }],
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Opportunity = mongoose.model('Opportunity', OpportunitySchema);

class MarketplaceService {
  constructor() {
    this.categories = {
      'PREMIUM': {
        name: 'Oportunidades Premium',
        description: 'Localizações de alto potencial com score 80+',
        minScore: 80,
        color: '#f39c12'
      },
      'OPORTUNIDADE': {
        name: 'Boas Oportunidades',
        description: 'Localizações viáveis com bom potencial',
        minScore: 65,
        color: '#48bb78'
      },
      'BAIXO_CUSTO': {
        name: 'Baixo Investimento',
        description: 'Oportunidades com menor custo inicial',
        maxInvestment: 100000,
        color: '#4ecdc4'
      },
      'EMERGENTE': {
        name: 'Mercados Emergentes',
        description: 'Regiões em desenvolvimento com potencial futuro',
        minScore: 50,
        color: '#667eea'
      }
    };
  }

  /**
   * Lista oportunidades disponíveis no marketplace
   */
  async listOpportunities(filters = {}) {
    try {
      console.log('🏪 Listando oportunidades do marketplace');

      const query = { status: 'DISPONIVEL' };
      
      // Aplicar filtros
      if (filters.businessType) {
        query.businessType = filters.businessType;
      }
      
      if (filters.city) {
        query['location.city'] = new RegExp(filters.city, 'i');
      }
      
      if (filters.state) {
        query['location.state'] = filters.state;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.minScore) {
        query['scores.final'] = { $gte: filters.minScore };
      }
      
      if (filters.maxInvestment) {
        query['investment.initial'] = { $lte: filters.maxInvestment };
      }

      // Ordenação
      let sortBy = { createdAt: -1 }; // Mais recentes primeiro
      if (filters.sortBy === 'score') {
        sortBy = { 'scores.final': -1 };
      } else if (filters.sortBy === 'investment') {
        sortBy = { 'investment.initial': 1 };
      } else if (filters.sortBy === 'roi') {
        sortBy = { 'roi.estimated': -1 };
      }

      const opportunities = await Opportunity.find(query)
        .sort(sortBy)
        .limit(filters.limit || 20)
        .populate('createdBy', 'name email')
        .lean();

      // Adicionar estatísticas
      const stats = await this.getMarketplaceStats();

      return {
        opportunities: opportunities.map(opp => this.formatOpportunityForListing(opp)),
        stats,
        filters: this.getAvailableFilters(),
        total: opportunities.length
      };

    } catch (error) {
      console.error('❌ Erro ao listar oportunidades:', error.message);
      throw new Error('Erro ao carregar marketplace');
    }
  }

  /**
   * Obtém detalhes de uma oportunidade específica
   */
  async getOpportunityDetails(opportunityId, userId = null) {
    try {
      const opportunity = await Opportunity.findById(opportunityId)
        .populate('createdBy', 'name email')
        .populate('interestedUsers.userId', 'name email');

      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // Incrementar visualizações
      await Opportunity.findByIdAndUpdate(opportunityId, { $inc: { views: 1 } });

      // Verificar se usuário já demonstrou interesse
      const userInterest = userId ? 
        opportunity.interestedUsers.find(u => u.userId._id.toString() === userId) : 
        null;

      // Buscar oportunidades similares
      const similarOpportunities = await this.findSimilarOpportunities(opportunity);

      return {
        opportunity: this.formatOpportunityDetails(opportunity),
        userInterest,
        similarOpportunities,
        contactInfo: this.getContactInfo(opportunity, userId)
      };

    } catch (error) {
      console.error('❌ Erro ao obter detalhes da oportunidade:', error.message);
      throw error;
    }
  }

  /**
   * Cria nova oportunidade no marketplace
   */
  async createOpportunity(analysisId, userId, additionalData = {}) {
    try {
      console.log(`🆕 Criando oportunidade para análise ${analysisId}`);

      // Buscar análise
      const analysis = await Analysis.findById(analysisId);
      if (!analysis) {
        throw new Error('Análise não encontrada');
      }

      // Verificar se já existe oportunidade para esta análise
      const existingOpportunity = await Opportunity.findOne({ 
        'location.coordinates.lat': analysis.location.coordinates.lat,
        'location.coordinates.lng': analysis.location.coordinates.lng,
        businessType: analysis.businessType,
        status: 'DISPONIVEL'
      });

      if (existingOpportunity) {
        throw new Error('Já existe uma oportunidade similar nesta localização');
      }

      // Determinar categoria
      const category = this.determineCategory(analysis);

      // Calcular investimento estimado
      const investment = this.calculateInvestmentEstimate(analysis);

      // Gerar tags
      const tags = this.generateTags(analysis);

      // Criar oportunidade
      const opportunity = new Opportunity({
        title: additionalData.title || this.generateTitle(analysis),
        description: additionalData.description || this.generateDescription(analysis),
        businessType: analysis.businessType,
        location: {
          address: analysis.location.address,
          coordinates: analysis.location.coordinates,
          city: this.extractCity(analysis.location.address),
          state: this.extractState(analysis.location.address)
        },
        scores: {
          final: analysis.scores.final.value,
          cri: analysis.scores.competitorRating?.score,
          pcs: analysis.scores.poiComplementarity?.score,
          saturation: analysis.scores.saturation?.value,
          opportunity: analysis.scores.opportunity?.value
        },
        investment,
        roi: this.calculateROI(analysis, investment),
        marketData: {
          competitors: analysis.competitors?.total || 0,
          avgRating: this.calculateAvgRating(analysis.competitors),
          population: analysis.demographics?.population,
          averageIncome: analysis.demographics?.averageIncome
        },
        tags,
        category,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias
      });

      await opportunity.save();

      console.log(`✅ Oportunidade criada: ${opportunity._id}`);
      return opportunity;

    } catch (error) {
      console.error('❌ Erro ao criar oportunidade:', error.message);
      throw error;
    }
  }

  /**
   * Demonstra interesse em uma oportunidade
   */
  async expressInterest(opportunityId, userId, message = '') {
    try {
      const opportunity = await Opportunity.findById(opportunityId);
      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // Verificar se já demonstrou interesse
      const existingInterest = opportunity.interestedUsers.find(
        u => u.userId.toString() === userId
      );

      if (existingInterest) {
        throw new Error('Você já demonstrou interesse nesta oportunidade');
      }

      // Adicionar interesse
      opportunity.interestedUsers.push({
        userId,
        contactedAt: new Date(),
        status: 'INTERESSADO',
        message
      });

      await opportunity.save();

      // Notificar criador da oportunidade
      await this.notifyOpportunityCreator(opportunity, userId);

      return {
        success: true,
        message: 'Interesse registrado com sucesso',
        contactInfo: this.getContactInfo(opportunity, userId)
      };

    } catch (error) {
      console.error('❌ Erro ao expressar interesse:', error.message);
      throw error;
    }
  }

  /**
   * Busca oportunidades baseada em critérios inteligentes
   */
  async searchOpportunities(searchParams) {
    try {
      const { 
        businessType, 
        budget, 
        location, 
        minScore, 
        preferredStates,
        riskTolerance 
      } = searchParams;

      let query = { status: 'DISPONIVEL' };
      
      // Filtros inteligentes
      if (businessType) {
        query.businessType = businessType;
      }
      
      if (budget) {
        query['investment.initial'] = { $lte: budget };
      }
      
      if (minScore) {
        query['scores.final'] = { $gte: minScore };
      }
      
      if (preferredStates && preferredStates.length > 0) {
        query['location.state'] = { $in: preferredStates };
      }

      // Filtro por tolerância ao risco
      if (riskTolerance === 'BAIXO') {
        query['scores.final'] = { $gte: 70 };
        query['investment.paybackMonths'] = { $lte: 24 };
      } else if (riskTolerance === 'ALTO') {
        query['scores.final'] = { $gte: 50 };
      }

      const opportunities = await Opportunity.find(query)
        .sort({ 'scores.final': -1, 'roi.estimated': -1 })
        .limit(50)
        .lean();

      // Aplicar scoring personalizado
      const scoredOpportunities = opportunities.map(opp => ({
        ...opp,
        personalizedScore: this.calculatePersonalizedScore(opp, searchParams)
      })).sort((a, b) => b.personalizedScore - a.personalizedScore);

      return {
        opportunities: scoredOpportunities.map(opp => this.formatOpportunityForListing(opp)),
        searchParams,
        total: scoredOpportunities.length,
        recommendations: this.generateSearchRecommendations(scoredOpportunities, searchParams)
      };

    } catch (error) {
      console.error('❌ Erro na busca de oportunidades:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do marketplace
   */
  async getMarketplaceStats() {
    try {
      const [
        totalOpportunities,
        byCategory,
        byBusinessType,
        avgInvestment,
        avgScore
      ] = await Promise.all([
        Opportunity.countDocuments({ status: 'DISPONIVEL' }),
        Opportunity.aggregate([
          { $match: { status: 'DISPONIVEL' } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Opportunity.aggregate([
          { $match: { status: 'DISPONIVEL' } },
          { $group: { _id: '$businessType', count: { $sum: 1 } } }
        ]),
        Opportunity.aggregate([
          { $match: { status: 'DISPONIVEL' } },
          { $group: { _id: null, avg: { $avg: '$investment.initial' } } }
        ]),
        Opportunity.aggregate([
          { $match: { status: 'DISPONIVEL' } },
          { $group: { _id: null, avg: { $avg: '$scores.final' } } }
        ])
      ]);

      return {
        total: totalOpportunities,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byBusinessType: byBusinessType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        averageInvestment: avgInvestment[0]?.avg || 0,
        averageScore: Math.round(avgScore[0]?.avg || 0)
      };

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error.message);
      return {};
    }
  }

  // Métodos auxiliares...

  determineCategory(analysis) {
    const score = analysis.scores.final.value;
    const investment = this.calculateInvestmentEstimate(analysis).initial;

    if (score >= 80) return 'PREMIUM';
    if (investment <= 100000) return 'BAIXO_CUSTO';
    if (score >= 65) return 'OPORTUNIDADE';
    return 'EMERGENTE';
  }

  calculateInvestmentEstimate(analysis) {
    const baseCosts = {
      'restaurante': { initial: 150000, monthly: 25000 },
      'pizzaria': { initial: 100000, monthly: 18000 },
      'salao_beleza': { initial: 80000, monthly: 12000 },
      'farmacia': { initial: 200000, monthly: 30000 },
      'supermercado': { initial: 300000, monthly: 45000 },
      'lanchonete': { initial: 60000, monthly: 10000 }
    };

    const costs = baseCosts[analysis.businessType] || baseCosts['restaurante'];
    
    // Ajustar baseado na localização (mock)
    const locationMultiplier = analysis.scores.final.value > 75 ? 1.2 : 1.0;

    return {
      initial: Math.round(costs.initial * locationMultiplier),
      monthly: Math.round(costs.monthly * locationMultiplier),
      paybackMonths: Math.ceil((costs.initial * locationMultiplier) / (costs.monthly * 0.3))
    };
  }

  calculateROI(analysis, investment) {
    const score = analysis.scores.final.value;
    const monthlyProfit = investment.monthly * 0.3; // 30% de margem estimada
    const annualProfit = monthlyProfit * 12;
    const roi = (annualProfit / investment.initial) * 100;

    return {
      estimated: Math.round(roi),
      period: '12 meses'
    };
  }

  generateTags(analysis) {
    const tags = [];
    
    if (analysis.scores.final.value >= 80) tags.push('Alto Potencial');
    if (analysis.scores.competitorRating?.score >= 70) tags.push('Baixa Concorrência');
    if (analysis.scores.poiComplementarity?.score >= 70) tags.push('Boa Localização');
    if (analysis.demographics?.averageIncome >= 3000) tags.push('Renda Alta');
    
    tags.push(analysis.businessType);
    
    return tags;
  }

  generateTitle(analysis) {
    const businessNames = {
      'restaurante': 'Restaurante',
      'pizzaria': 'Pizzaria',
      'salao_beleza': 'Salão de Beleza',
      'farmacia': 'Farmácia',
      'supermercado': 'Supermercado',
      'lanchonete': 'Lanchonete'
    };

    const businessName = businessNames[analysis.businessType] || 'Negócio';
    const city = this.extractCity(analysis.location.address);
    const score = analysis.scores.final.value;

    return `${businessName} em ${city} - Score ${score}%`;
  }

  generateDescription(analysis) {
    const score = analysis.scores.final.value;
    const city = this.extractCity(analysis.location.address);
    
    return `Excelente oportunidade para ${analysis.businessType} em ${city}. 
    Score de viabilidade: ${score}%. 
    Análise completa com CRI e PCS disponível. 
    Localização estratégica com bom potencial de retorno.`;
  }

  extractCity(address) {
    // Lógica simples para extrair cidade do endereço
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || 'Cidade';
  }

  extractState(address) {
    // Lógica simples para extrair estado
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1]?.trim() || '';
    return lastPart.split(' ')[0] || 'SP';
  }

  calculateAvgRating(competitors) {
    if (!competitors?.formal?.length) return 0;
    const total = competitors.formal.reduce((sum, comp) => sum + (comp.rating || 0), 0);
    return Math.round((total / competitors.formal.length) * 10) / 10;
  }

  calculatePersonalizedScore(opportunity, searchParams) {
    let score = opportunity.scores.final;
    
    // Bônus por match com orçamento
    if (searchParams.budget && opportunity.investment.initial <= searchParams.budget) {
      score += 10;
    }
    
    // Bônus por localização preferida
    if (searchParams.preferredStates?.includes(opportunity.location.state)) {
      score += 5;
    }
    
    // Bônus por tolerância ao risco
    if (searchParams.riskTolerance === 'BAIXO' && opportunity.scores.final >= 70) {
      score += 15;
    }
    
    return Math.min(100, score);
  }

  formatOpportunityForListing(opportunity) {
    return {
      id: opportunity._id,
      title: opportunity.title,
      businessType: opportunity.businessType,
      location: {
        city: opportunity.location.city,
        state: opportunity.location.state
      },
      score: opportunity.scores.final,
      investment: opportunity.investment.initial,
      roi: opportunity.roi.estimated,
      category: opportunity.category,
      tags: opportunity.tags,
      views: opportunity.views,
      featured: opportunity.featured,
      createdAt: opportunity.createdAt
    };
  }

  formatOpportunityDetails(opportunity) {
    return {
      ...opportunity.toObject(),
      categoryInfo: this.categories[opportunity.category]
    };
  }

  async findSimilarOpportunities(opportunity) {
    return await Opportunity.find({
      _id: { $ne: opportunity._id },
      businessType: opportunity.businessType,
      'location.state': opportunity.location.state,
      status: 'DISPONIVEL'
    }).limit(3).lean();
  }

  getContactInfo(opportunity, userId) {
    // Lógica para determinar informações de contato baseada no plano do usuário
    return {
      canContact: true,
      method: 'platform', // ou 'direct' para planos premium
      message: 'Entre em contato através da plataforma'
    };
  }

  getAvailableFilters() {
    return {
      businessTypes: ['restaurante', 'pizzaria', 'salao_beleza', 'farmacia', 'supermercado', 'lanchonete'],
      categories: Object.keys(this.categories),
      states: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE'],
      investmentRanges: [
        { label: 'Até R$ 50k', max: 50000 },
        { label: 'R$ 50k - R$ 100k', min: 50000, max: 100000 },
        { label: 'R$ 100k - R$ 200k', min: 100000, max: 200000 },
        { label: 'Acima de R$ 200k', min: 200000 }
      ]
    };
  }

  generateSearchRecommendations(opportunities, searchParams) {
    const recommendations = [];
    
    if (opportunities.length === 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'Amplie sua busca',
        description: 'Tente aumentar o orçamento ou considerar outros estados'
      });
    } else if (opportunities.length < 5) {
      recommendations.push({
        type: 'suggestion',
        title: 'Poucas opções encontradas',
        description: 'Considere outros tipos de negócio ou regiões'
      });
    }
    
    return recommendations;
  }

  async notifyOpportunityCreator(opportunity, interestedUserId) {
    // Implementar sistema de notificações
    console.log(`📧 Notificando criador da oportunidade ${opportunity._id} sobre interesse de ${interestedUserId}`);
  }
}

module.exports = new MarketplaceService();
