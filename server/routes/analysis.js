const express = require('express');
const Analysis = require('../models/Analysis');
const { auth, checkAnalysisLimit, checkActiveSubscription } = require('../middleware/auth');
const receitaFederalService = require('../services/receitaFederalService');
const ibgeService = require('../services/ibgeService');
const openStreetMapService = require('../services/openStreetMapService');
const scoreService = require('../services/scoreService');

const router = express.Router();

/**
 * @route   POST /api/analysis
 * @desc    Criar nova análise de negócio
 * @access  Private
 */
router.post('/', auth, checkActiveSubscription, checkAnalysisLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const {
      businessType,
      cnae,
      address,
      searchRadius = 1000
    } = req.body;

    // Validações básicas
    if (!businessType || !cnae || !address) {
      return res.status(400).json({
        error: 'Tipo de negócio, CNAE e endereço são obrigatórios'
      });
    }

    if (searchRadius < 100 || searchRadius > 10000) {
      return res.status(400).json({
        error: 'Raio de busca deve estar entre 100m e 10km'
      });
    }

    // Geocodifica o endereço
    console.log('🔍 Geocodificando endereço...');
    const geocodeResult = await openStreetMapService.geocodeAddress(address);
    
    if (!geocodeResult) {
      return res.status(400).json({
        error: 'Endereço não encontrado. Verifique e tente novamente.'
      });
    }

    // Cria análise inicial
    const analysis = new Analysis({
      userId: req.userId,
      businessType,
      cnae,
      location: {
        address,
        coordinates: {
          lat: geocodeResult.lat,
          lng: geocodeResult.lng
        },
        neighborhood: '', // Será preenchido durante o processamento
        city: '', // Será extraído do endereço
        state: ''
      },
      searchRadius,
      status: 'processing'
    });

    await analysis.save();

    // Resposta imediata para o cliente
    res.status(201).json({
      message: 'Análise iniciada com sucesso',
      analysisId: analysis._id,
      status: 'processing',
      estimatedTime: '2-3 minutos'
    });

    // Processamento assíncrono
    processAnalysis(analysis._id, geocodeResult, req.user);

  } catch (error) {
    console.error('❌ Erro ao criar análise:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Processa análise de forma assíncrona
 */
async function processAnalysis(analysisId, geocodeResult, user) {
  const startTime = Date.now();
  
  try {
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return;

    console.log(`🔄 Processando análise ${analysisId}...`);

    const { lat, lng } = geocodeResult;
    const { businessType, cnae, searchRadius } = analysis;

    // Extrai informações da cidade do endereço geocodificado
    const addressParts = geocodeResult.displayName.split(', ');
    const city = addressParts[addressParts.length - 3] || '';
    const state = addressParts[addressParts.length - 2] || '';

    // 1. Busca concorrentes na Receita Federal
    console.log('📋 Buscando concorrentes formais...');
    const formalCompetitors = await receitaFederalService.searchCompaniesByCNAE(
      cnae, city, state, 50
    );

    // 2. Busca concorrentes informais no OpenStreetMap
    console.log('🗺️  Buscando dados geoespaciais...');
    const osmData = await openStreetMapService.searchPOIs(
      lat, lng, searchRadius, businessType
    );

    // 3. Busca dados demográficos do IBGE
    console.log('📊 Buscando dados demográficos...');
    const demographicData = await ibgeService.getDemographicData(
      null, city, state
    );

    // 4. Processa e filtra concorrentes por distância
    const processedFormalCompetitors = formalCompetitors
      .filter(competitor => competitor.coordinates)
      .map(competitor => ({
        ...competitor,
        distance: openStreetMapService.calculateDistance(
          lat, lng,
          competitor.coordinates.lat,
          competitor.coordinates.lng
        )
      }))
      .filter(competitor => competitor.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    const processedInformalCompetitors = osmData.competitors
      .filter(competitor => competitor.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    // 5. Monta dados para cálculo de score
    const analysisData = {
      businessType,
      cnae,
      location: {
        address: analysis.location.address,
        coordinates: { lat, lng },
        city,
        state
      },
      searchRadius,
      competitors: {
        formal: processedFormalCompetitors,
        informal: processedInformalCompetitors,
        total: processedFormalCompetitors.length + processedInformalCompetitors.length
      },
      demographics: demographicData,
      transportation: osmData.transportation
    };

    // 6. Calcula scores
    console.log('🧮 Calculando scores...');
    const scores = scoreService.calculateCompleteScore(analysisData);

    // 7. Gera sugestões
    const alternativeLocations = scoreService.suggestAlternativeLocations(analysisData);
    const relatedBusinesses = scoreService.suggestRelatedBusinesses(businessType);

    // 8. Atualiza análise no banco
    analysis.location.city = city;
    analysis.location.state = state;
    analysis.competitors.formal = processedFormalCompetitors;
    analysis.competitors.informal = processedInformalCompetitors;
    analysis.demographics = demographicData;
    analysis.transportation = osmData.transportation;
    analysis.scores = scores;
    analysis.alternativeLocations = alternativeLocations;
    analysis.relatedBusinesses = relatedBusinesses;
    analysis.status = 'completed';
    analysis.processingTime = Date.now() - startTime;

    await analysis.save();

    // 9. Incrementa contador de análises do usuário
    await user.incrementAnalysisCount();

    console.log(`✅ Análise ${analysisId} concluída em ${analysis.processingTime}ms`);

  } catch (error) {
    console.error(`❌ Erro ao processar análise ${analysisId}:`, error);
    
    // Marca análise como erro
    try {
      await Analysis.findByIdAndUpdate(analysisId, {
        status: 'error',
        errorMessage: error.message,
        processingTime: Date.now() - startTime
      });
    } catch (updateError) {
      console.error('❌ Erro ao atualizar status de erro:', updateError);
    }
  }
}

/**
 * @route   GET /api/analysis/:id
 * @desc    Obter análise específica
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!analysis) {
      return res.status(404).json({
        error: 'Análise não encontrada'
      });
    }

    res.json({
      analysis: analysis.status === 'completed' ? analysis : analysis.getSummary()
    });
  } catch (error) {
    console.error('❌ Erro ao buscar análise:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/analysis
 * @desc    Listar análises do usuário
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      businessType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Constrói filtros
    const filters = { userId: req.userId };
    if (status) filters.status = status;
    if (businessType) filters.businessType = businessType;

    // Configurações de paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Busca análises
    const analyses = await Analysis.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('businessType location.address scores.final status createdAt processingTime');

    const total = await Analysis.countDocuments(filters);

    // Formata resposta
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis._id,
      businessType: analysis.businessType,
      address: analysis.location.address,
      finalScore: analysis.scores?.final?.value || null,
      probability: analysis.scores?.final?.probability || null,
      status: analysis.status,
      createdAt: analysis.createdAt,
      processingTime: analysis.processingTime
    }));

    res.json({
      analyses: formattedAnalyses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: analyses.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Erro ao listar análises:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   DELETE /api/analysis/:id
 * @desc    Deletar análise
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!analysis) {
      return res.status(404).json({
        error: 'Análise não encontrada'
      });
    }

    await Analysis.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Análise deletada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar análise:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/analysis/:id/export
 * @desc    Exportar análise em PDF/Excel
 * @access  Private
 */
router.get('/:id/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!analysis) {
      return res.status(404).json({
        error: 'Análise não encontrada'
      });
    }

    if (analysis.status !== 'completed') {
      return res.status(400).json({
        error: 'Análise ainda não foi concluída'
      });
    }

    // Por enquanto, retorna JSON. Implementar PDF/Excel futuramente
    if (format === 'json') {
      res.json({
        analysis,
        exportedAt: new Date().toISOString(),
        format: 'json'
      });
    } else {
      res.status(400).json({
        error: 'Formato não suportado. Use: json'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao exportar análise:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/analysis/stats/dashboard
 * @desc    Estatísticas para dashboard
 * @access  Private
 */
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Estatísticas básicas
    const totalAnalyses = await Analysis.countDocuments({ userId });
    const completedAnalyses = await Analysis.countDocuments({ 
      userId, 
      status: 'completed' 
    });
    const processingAnalyses = await Analysis.countDocuments({ 
      userId, 
      status: 'processing' 
    });

    // Análises por tipo de negócio
    const analysesByType = await Analysis.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Análises recentes
    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('businessType location.address scores.final status createdAt');

    // Score médio
    const avgScoreResult = await Analysis.aggregate([
      { $match: { userId: req.userId, status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$scores.final.value' } } }
    ]);
    
    const averageScore = avgScoreResult.length > 0 ? 
      Math.round(avgScoreResult[0].avgScore) : null;

    res.json({
      stats: {
        total: totalAnalyses,
        completed: completedAnalyses,
        processing: processingAnalyses,
        averageScore
      },
      analysesByType: analysesByType.map(item => ({
        businessType: item._id,
        count: item.count
      })),
      recentAnalyses: recentAnalyses.map(analysis => ({
        id: analysis._id,
        businessType: analysis.businessType,
        address: analysis.location.address,
        finalScore: analysis.scores?.final?.value || null,
        status: analysis.status,
        createdAt: analysis.createdAt
      })),
      userLimits: {
        remainingAnalyses: req.user.getRemainingAnalyses(),
        currentPlan: req.user.plan,
        canPerformAnalysis: req.user.canPerformAnalysis()
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
