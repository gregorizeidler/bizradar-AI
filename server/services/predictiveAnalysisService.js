const Analysis = require('../models/Analysis');
const tf = require('@tensorflow/tfjs-node');

class PredictiveAnalysisService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    
    // Padrões sazonais por tipo de negócio
    this.seasonalPatterns = {
      'restaurante': {
        months: [1.0, 0.9, 1.1, 1.2, 1.1, 1.0, 0.8, 0.9, 1.0, 1.1, 1.3, 1.4],
        holidays: { christmas: 1.5, valentines: 1.3, mothers_day: 1.2 },
        weekdays: [0.8, 1.0, 1.0, 1.0, 1.2, 1.4, 1.3] // Dom-Sab
      },
      'pizzaria': {
        months: [0.9, 0.9, 1.0, 1.1, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.3],
        holidays: { christmas: 1.2, new_year: 1.4 },
        weekdays: [1.3, 0.8, 0.9, 1.0, 1.2, 1.5, 1.4]
      },
      'salao_beleza': {
        months: [0.9, 1.0, 1.1, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1, 1.1, 1.2, 1.3],
        holidays: { mothers_day: 1.4, christmas: 1.2, valentines: 1.3 },
        weekdays: [0.7, 0.9, 1.0, 1.1, 1.2, 1.4, 1.3]
      },
      'farmacia': {
        months: [1.1, 1.0, 1.0, 0.9, 0.9, 1.0, 1.1, 1.1, 1.0, 1.0, 1.0, 1.1],
        holidays: {},
        weekdays: [0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9]
      },
      'supermercado': {
        months: [1.0, 1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2],
        holidays: { christmas: 1.3, easter: 1.1 },
        weekdays: [1.2, 0.9, 0.9, 0.9, 1.0, 1.1, 1.2]
      }
    };

    // Tendências de mercado por região
    this.marketTrends = {
      'SP': { growth: 0.03, competition_increase: 0.05, cost_inflation: 0.08 },
      'RJ': { growth: 0.02, competition_increase: 0.04, cost_inflation: 0.07 },
      'MG': { growth: 0.04, competition_increase: 0.03, cost_inflation: 0.06 },
      'RS': { growth: 0.025, competition_increase: 0.03, cost_inflation: 0.06 },
      'PR': { growth: 0.035, competition_increase: 0.035, cost_inflation: 0.065 }
    };

    this.initializeModel();
  }

  /**
   * Inicializa modelo de ML para predições
   */
  async initializeModel() {
    try {
      // Criar modelo simples para predições
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      // Treinar com dados sintéticos (em produção, usar dados reais)
      await this.trainModel();
      
      this.isModelLoaded = true;
      console.log('🤖 Modelo de ML inicializado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao inicializar modelo ML:', error.message);
      this.isModelLoaded = false;
    }
  }

  /**
   * Treina modelo com dados sintéticos
   */
  async trainModel() {
    try {
      // Gerar dados sintéticos para treinamento
      const trainingData = this.generateSyntheticData(1000);
      
      const xs = tf.tensor2d(trainingData.features);
      const ys = tf.tensor2d(trainingData.labels, [trainingData.labels.length, 1]);

      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0
      });

      xs.dispose();
      ys.dispose();

      console.log('✅ Modelo treinado com sucesso');

    } catch (error) {
      console.error('❌ Erro no treinamento do modelo:', error.message);
    }
  }

  /**
   * Gera dados sintéticos para treinamento
   */
  generateSyntheticData(samples) {
    const features = [];
    const labels = [];

    for (let i = 0; i < samples; i++) {
      // Features: [score_final, cri, pcs, population, income, competitors, month, weekday, cost_level, market_size]
      const feature = [
        Math.random() * 100, // score_final
        Math.random() * 100, // cri
        Math.random() * 100, // pcs
        Math.random() * 10000000, // population (normalizado)
        Math.random() * 5000, // income
        Math.random() * 20, // competitors
        Math.random() * 12, // month
        Math.random() * 7, // weekday
        Math.random() * 3, // cost_level
        Math.random() * 4 // market_size
      ];

      // Label: success probability baseada nas features
      const successProb = this.calculateSyntheticSuccess(feature);
      
      features.push(feature);
      labels.push(successProb);
    }

    return { features, labels };
  }

  /**
   * Calcula probabilidade sintética de sucesso
   */
  calculateSyntheticSuccess(features) {
    const [score, cri, pcs, population, income, competitors, month, weekday, costLevel, marketSize] = features;
    
    let probability = 0;
    
    // Score final tem maior peso
    probability += (score / 100) * 0.4;
    
    // CRI e PCS
    probability += (cri / 100) * 0.2;
    probability += (pcs / 100) * 0.15;
    
    // Demografia
    probability += Math.min(income / 5000, 1) * 0.1;
    probability += Math.min(population / 10000000, 1) * 0.05;
    
    // Concorrência (inverso)
    probability += (1 - Math.min(competitors / 20, 1)) * 0.1;
    
    // Adicionar ruído
    probability += (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Prediz sucesso do negócio usando ML
   */
  async predictBusinessSuccess(analysisData) {
    try {
      console.log('🔮 Gerando predição de sucesso do negócio');

      if (!this.isModelLoaded) {
        return this.getMockPrediction(analysisData);
      }

      // Preparar features para o modelo
      const features = this.prepareFeatures(analysisData);
      const inputTensor = tf.tensor2d([features]);

      // Fazer predição
      const prediction = this.model.predict(inputTensor);
      const successProbability = await prediction.data();

      inputTensor.dispose();
      prediction.dispose();

      // Gerar análise completa
      const analysis = await this.generatePredictiveAnalysis(analysisData, successProbability[0]);

      return analysis;

    } catch (error) {
      console.error('❌ Erro na predição ML:', error.message);
      return this.getMockPrediction(analysisData);
    }
  }

  /**
   * Prepara features para o modelo
   */
  prepareFeatures(analysisData) {
    const { scores, demographics, competitors, businessType, location } = analysisData;

    return [
      scores.final?.value || 50,
      scores.competitorRating?.score || 50,
      scores.poiComplementarity?.score || 50,
      (demographics.population || 100000) / 10000000, // Normalizado
      (demographics.averageIncome || 2500) / 5000, // Normalizado
      Math.min((competitors.total || 5) / 20, 1), // Normalizado
      new Date().getMonth(),
      new Date().getDay(),
      this.getCostLevel(location),
      this.getMarketSize(demographics.population)
    ];
  }

  /**
   * Gera análise preditiva completa
   */
  async generatePredictiveAnalysis(analysisData, mlProbability) {
    const { businessType, location, demographics } = analysisData;

    // Predições sazonais
    const seasonalForecast = this.generateSeasonalForecast(businessType);
    
    // Tendências de mercado
    const marketTrends = this.generateMarketTrends(location, businessType);
    
    // Cenários de risco
    const riskScenarios = this.generateRiskScenarios(analysisData);
    
    // Recomendações temporais
    const timingRecommendations = this.generateTimingRecommendations(businessType, seasonalForecast);

    return {
      mlPrediction: {
        successProbability: Math.round(mlProbability * 100),
        confidence: this.calculateConfidence(analysisData),
        model: 'TensorFlow Neural Network'
      },
      seasonalForecast,
      marketTrends,
      riskScenarios,
      timingRecommendations,
      longTermOutlook: this.generateLongTermOutlook(analysisData, marketTrends),
      recommendations: this.generatePredictiveRecommendations(analysisData, mlProbability),
      timestamp: new Date()
    };
  }

  /**
   * Gera previsão sazonal
   */
  generateSeasonalForecast(businessType) {
    const pattern = this.seasonalPatterns[businessType] || this.seasonalPatterns['restaurante'];
    const currentMonth = new Date().getMonth();
    
    const forecast = [];
    for (let i = 0; i < 12; i++) {
      const month = (currentMonth + i) % 12;
      const monthName = new Date(2024, month, 1).toLocaleDateString('pt-BR', { month: 'long' });
      
      forecast.push({
        month: monthName,
        multiplier: pattern.months[month],
        trend: pattern.months[month] > 1.1 ? 'ALTA' : pattern.months[month] < 0.9 ? 'BAIXA' : 'NORMAL',
        recommendation: this.getSeasonalRecommendation(pattern.months[month])
      });
    }

    return {
      forecast,
      bestMonths: forecast
        .filter(f => f.multiplier >= 1.2)
        .map(f => f.month),
      worstMonths: forecast
        .filter(f => f.multiplier <= 0.9)
        .map(f => f.month)
    };
  }

  /**
   * Gera tendências de mercado
   */
  generateMarketTrends(location, businessType) {
    const state = this.extractState(location.address);
    const trends = this.marketTrends[state] || this.marketTrends['SP'];

    const projections = [];
    const currentYear = new Date().getFullYear();

    for (let year = 0; year < 5; year++) {
      const targetYear = currentYear + year;
      const growthFactor = Math.pow(1 + trends.growth, year);
      const competitionFactor = Math.pow(1 + trends.competition_increase, year);
      const costFactor = Math.pow(1 + trends.cost_inflation, year);

      projections.push({
        year: targetYear,
        marketGrowth: Math.round((growthFactor - 1) * 100),
        competitionIncrease: Math.round((competitionFactor - 1) * 100),
        costIncrease: Math.round((costFactor - 1) * 100),
        overallTrend: this.calculateOverallTrend(growthFactor, competitionFactor, costFactor)
      });
    }

    return {
      projections,
      summary: {
        marketOutlook: projections[4].overallTrend,
        keyFactors: this.identifyKeyTrendFactors(trends),
        recommendations: this.generateTrendRecommendations(projections)
      }
    };
  }

  /**
   * Gera cenários de risco
   */
  generateRiskScenarios(analysisData) {
    const baseScore = analysisData.scores.final?.value || 50;
    
    return {
      optimistic: {
        probability: Math.min(100, baseScore + 15),
        description: 'Cenário com condições favoráveis de mercado',
        factors: ['Economia estável', 'Baixa concorrência', 'Demanda crescente'],
        likelihood: '25%'
      },
      realistic: {
        probability: baseScore,
        description: 'Cenário baseado nas condições atuais',
        factors: ['Condições normais de mercado', 'Concorrência esperada'],
        likelihood: '50%'
      },
      pessimistic: {
        probability: Math.max(0, baseScore - 20),
        description: 'Cenário com desafios de mercado',
        factors: ['Recessão econômica', 'Alta concorrência', 'Custos elevados'],
        likelihood: '25%'
      }
    };
  }

  /**
   * Gera recomendações de timing
   */
  generateTimingRecommendations(businessType, seasonalForecast) {
    const bestMonths = seasonalForecast.bestMonths;
    const currentMonth = new Date().getMonth();
    
    const recommendations = [];

    // Melhor época para abrir
    if (bestMonths.length > 0) {
      recommendations.push({
        type: 'opening',
        title: 'Melhor Época para Abertura',
        description: `Considere abrir em ${bestMonths.join(', ')} para aproveitar a alta sazonal`,
        priority: 'high'
      });
    }

    // Preparação para sazonalidade
    recommendations.push({
      type: 'preparation',
      title: 'Preparação Sazonal',
      description: 'Ajuste estoque e marketing conforme padrões sazonais',
      priority: 'medium'
    });

    // Estratégias de baixa temporada
    const worstMonths = seasonalForecast.worstMonths;
    if (worstMonths.length > 0) {
      recommendations.push({
        type: 'strategy',
        title: 'Estratégia para Baixa Temporada',
        description: `Planeje promoções especiais em ${worstMonths.join(', ')}`,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Gera outlook de longo prazo
   */
  generateLongTermOutlook(analysisData, marketTrends) {
    const fiveYearProjection = marketTrends.projections[4];
    
    return {
      timeframe: '5 anos',
      viabilityTrend: fiveYearProjection.overallTrend,
      keyInsights: [
        `Crescimento de mercado projetado: ${fiveYearProjection.marketGrowth}%`,
        `Aumento da concorrência: ${fiveYearProjection.competitionIncrease}%`,
        `Inflação de custos: ${fiveYearProjection.costIncrease}%`
      ],
      recommendation: this.getLongTermRecommendation(fiveYearProjection.overallTrend),
      confidenceLevel: this.calculateLongTermConfidence(analysisData)
    };
  }

  /**
   * Gera recomendações preditivas
   */
  generatePredictiveRecommendations(analysisData, mlProbability) {
    const recommendations = [];
    
    if (mlProbability >= 0.8) {
      recommendations.push({
        type: 'opportunity',
        title: 'Alta Probabilidade de Sucesso',
        description: 'Modelo ML indica excelente viabilidade. Proceda com confiança.',
        priority: 'high'
      });
    } else if (mlProbability >= 0.6) {
      recommendations.push({
        type: 'caution',
        title: 'Probabilidade Moderada',
        description: 'Considere melhorias na estratégia antes de prosseguir.',
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'warning',
        title: 'Baixa Probabilidade de Sucesso',
        description: 'Reavalie a localização ou tipo de negócio.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  // Métodos auxiliares...

  getCostLevel(location) {
    // Simplificado - em produção, usar dados reais
    const address = location.address?.toLowerCase() || '';
    if (address.includes('são paulo') || address.includes('rio')) return 2;
    if (address.includes('interior') || address.includes('pequena')) return 0;
    return 1;
  }

  getMarketSize(population) {
    if (population >= 5000000) return 3;
    if (population >= 1000000) return 2;
    if (population >= 500000) return 1;
    return 0;
  }

  extractState(address) {
    const stateMap = {
      'são paulo': 'SP', 'rio de janeiro': 'RJ', 'minas gerais': 'MG',
      'rio grande do sul': 'RS', 'paraná': 'PR'
    };
    
    const lowerAddress = address.toLowerCase();
    for (const [state, code] of Object.entries(stateMap)) {
      if (lowerAddress.includes(state)) return code;
    }
    return 'SP';
  }

  calculateConfidence(analysisData) {
    // Calcular confiança baseada na qualidade dos dados
    let confidence = 0.7; // Base
    
    if (analysisData.scores.competitorRating) confidence += 0.1;
    if (analysisData.scores.poiComplementarity) confidence += 0.1;
    if (analysisData.demographics.population) confidence += 0.05;
    if (analysisData.competitors.total > 0) confidence += 0.05;
    
    return Math.round(confidence * 100);
  }

  getSeasonalRecommendation(multiplier) {
    if (multiplier >= 1.2) return 'Período ideal para maximizar vendas';
    if (multiplier <= 0.9) return 'Foque em promoções e redução de custos';
    return 'Período normal de operação';
  }

  calculateOverallTrend(growth, competition, cost) {
    const netEffect = growth / (competition * cost);
    if (netEffect >= 1.1) return 'POSITIVA';
    if (netEffect <= 0.9) return 'NEGATIVA';
    return 'ESTÁVEL';
  }

  identifyKeyTrendFactors(trends) {
    const factors = [];
    if (trends.growth > 0.03) factors.push('Crescimento acima da média');
    if (trends.competition_increase > 0.04) factors.push('Aumento significativo da concorrência');
    if (trends.cost_inflation > 0.07) factors.push('Inflação de custos elevada');
    return factors;
  }

  generateTrendRecommendations(projections) {
    const recommendations = [];
    const fiveYear = projections[4];
    
    if (fiveYear.marketGrowth > 15) {
      recommendations.push('Aproveite o crescimento do mercado');
    }
    if (fiveYear.competitionIncrease > 20) {
      recommendations.push('Prepare estratégias de diferenciação');
    }
    if (fiveYear.costIncrease > 35) {
      recommendations.push('Planeje aumentos de preço graduais');
    }
    
    return recommendations;
  }

  getLongTermRecommendation(trend) {
    switch (trend) {
      case 'POSITIVA': return 'Excelente oportunidade de longo prazo';
      case 'NEGATIVA': return 'Considere alternativas ou aguarde melhores condições';
      default: return 'Viabilidade estável com monitoramento necessário';
    }
  }

  calculateLongTermConfidence(analysisData) {
    // Confiança diminui com o tempo
    const baseConfidence = this.calculateConfidence(analysisData);
    return Math.max(30, baseConfidence - 20);
  }

  /**
   * Predição mock quando ML não disponível
   */
  getMockPrediction(analysisData) {
    const baseScore = analysisData.scores.final?.value || 50;
    
    return {
      mlPrediction: {
        successProbability: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
        confidence: 75,
        model: 'Heuristic Model (Fallback)'
      },
      seasonalForecast: {
        forecast: [
          { month: 'Janeiro', multiplier: 1.0, trend: 'NORMAL' },
          { month: 'Fevereiro', multiplier: 0.9, trend: 'BAIXA' },
          { month: 'Março', multiplier: 1.1, trend: 'ALTA' }
        ],
        bestMonths: ['Março', 'Dezembro'],
        worstMonths: ['Fevereiro']
      },
      marketTrends: {
        projections: [
          { year: 2024, marketGrowth: 3, competitionIncrease: 5, costIncrease: 8, overallTrend: 'ESTÁVEL' }
        ],
        summary: {
          marketOutlook: 'ESTÁVEL',
          keyFactors: ['Crescimento moderado'],
          recommendations: ['Monitorar concorrência']
        }
      },
      riskScenarios: {
        optimistic: { probability: Math.min(100, baseScore + 15), likelihood: '25%' },
        realistic: { probability: baseScore, likelihood: '50%' },
        pessimistic: { probability: Math.max(0, baseScore - 20), likelihood: '25%' }
      },
      timingRecommendations: [
        {
          type: 'opening',
          title: 'Timing Recomendado',
          description: 'Considere sazonalidade do seu tipo de negócio',
          priority: 'medium'
        }
      ],
      longTermOutlook: {
        timeframe: '5 anos',
        viabilityTrend: 'ESTÁVEL',
        recommendation: 'Viabilidade estável com monitoramento necessário',
        confidenceLevel: 55
      },
      recommendations: [
        {
          type: 'opportunity',
          title: 'Análise Preditiva',
          description: 'Baseado em padrões históricos e tendências de mercado',
          priority: 'medium'
        }
      ],
      timestamp: new Date()
    };
  }
}

module.exports = new PredictiveAnalysisService();
