const scoreService = require('./scoreService');
const ibgeService = require('./ibgeService');
const googlePlacesService = require('./googlePlacesService');
const openStreetMapService = require('./openStreetMapService');

class MultiCityAnalysisService {
  constructor() {
    // Dados das principais cidades brasileiras
    this.cities = {
      'sao_paulo': {
        name: 'São Paulo',
        state: 'SP',
        coordinates: { lat: -23.5505, lng: -46.6333 },
        population: 12396372,
        averageIncome: 3500,
        businessCost: 'ALTO',
        marketSize: 'MUITO_GRANDE'
      },
      'rio_janeiro': {
        name: 'Rio de Janeiro',
        state: 'RJ',
        coordinates: { lat: -22.9068, lng: -43.1729 },
        population: 6775561,
        averageIncome: 3200,
        businessCost: 'ALTO',
        marketSize: 'GRANDE'
      },
      'belo_horizonte': {
        name: 'Belo Horizonte',
        state: 'MG',
        coordinates: { lat: -19.9167, lng: -43.9345 },
        population: 2530701,
        averageIncome: 2800,
        businessCost: 'MÉDIO',
        marketSize: 'MÉDIO'
      },
      'salvador': {
        name: 'Salvador',
        state: 'BA',
        coordinates: { lat: -12.9714, lng: -38.5014 },
        population: 2886698,
        averageIncome: 2400,
        businessCost: 'MÉDIO',
        marketSize: 'MÉDIO'
      },
      'brasilia': {
        name: 'Brasília',
        state: 'DF',
        coordinates: { lat: -15.7801, lng: -47.9292 },
        population: 3094325,
        averageIncome: 4200,
        businessCost: 'ALTO',
        marketSize: 'MÉDIO'
      },
      'fortaleza': {
        name: 'Fortaleza',
        state: 'CE',
        coordinates: { lat: -3.7319, lng: -38.5267 },
        population: 2703391,
        averageIncome: 2200,
        businessCost: 'BAIXO',
        marketSize: 'MÉDIO'
      },
      'recife': {
        name: 'Recife',
        state: 'PE',
        coordinates: { lat: -8.0476, lng: -34.8770 },
        population: 1653461,
        averageIncome: 2300,
        businessCost: 'BAIXO',
        marketSize: 'MÉDIO'
      },
      'porto_alegre': {
        name: 'Porto Alegre',
        state: 'RS',
        coordinates: { lat: -30.0346, lng: -51.2177 },
        population: 1492530,
        averageIncome: 3100,
        businessCost: 'MÉDIO',
        marketSize: 'MÉDIO'
      },
      'curitiba': {
        name: 'Curitiba',
        state: 'PR',
        coordinates: { lat: -25.4284, lng: -49.2733 },
        population: 1963726,
        averageIncome: 3300,
        businessCost: 'MÉDIO',
        marketSize: 'MÉDIO'
      },
      'goiania': {
        name: 'Goiânia',
        state: 'GO',
        coordinates: { lat: -16.6869, lng: -49.2648 },
        population: 1536097,
        averageIncome: 2600,
        businessCost: 'BAIXO',
        marketSize: 'PEQUENO'
      }
    };

    // Fatores de custo por região
    this.costFactors = {
      'ALTO': { rent: 1.5, labor: 1.3, marketing: 1.4 },
      'MÉDIO': { rent: 1.0, labor: 1.0, marketing: 1.0 },
      'BAIXO': { rent: 0.7, labor: 0.8, marketing: 0.8 }
    };
  }

  /**
   * Compara oportunidades entre múltiplas cidades
   */
  async compareMultipleCities(businessType, selectedCities = null) {
    try {
      console.log(`🌐 Iniciando análise multi-cidade para: ${businessType}`);

      const citiesToAnalyze = selectedCities || Object.keys(this.cities);
      const analyses = [];

      // Analisar cada cidade
      for (const cityKey of citiesToAnalyze) {
        if (!this.cities[cityKey]) continue;

        const cityAnalysis = await this.analyzeCityOpportunity(cityKey, businessType);
        analyses.push(cityAnalysis);
      }

      // Gerar ranking e comparativo
      const ranking = this.generateCityRanking(analyses);
      const comparison = this.generateDetailedComparison(analyses, businessType);
      const recommendations = this.generateRecommendations(ranking, businessType);

      return {
        businessType,
        totalCitiesAnalyzed: analyses.length,
        ranking,
        comparison,
        recommendations,
        detailedAnalyses: analyses,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Erro na análise multi-cidade:', error.message);
      throw new Error('Erro ao comparar cidades');
    }
  }

  /**
   * Analisa oportunidade em uma cidade específica
   */
  async analyzeCityOpportunity(cityKey, businessType) {
    const city = this.cities[cityKey];
    const { lat, lng } = city.coordinates;

    try {
      // Buscar dados da cidade
      const [competitors, pois, demographics] = await Promise.all([
        this.getCityCompetitors(lat, lng, businessType),
        this.getCityPOIs(lat, lng),
        this.getCityDemographics(city)
      ]);

      // Calcular scores
      const scores = await this.calculateCityScores({
        city,
        businessType,
        competitors,
        pois,
        demographics
      });

      // Calcular custos estimados
      const costs = this.calculateBusinessCosts(city, businessType);

      // Calcular ROI estimado
      const roi = this.calculateROIEstimate(scores, costs, demographics);

      return {
        cityKey,
        city: {
          name: city.name,
          state: city.state,
          population: city.population,
          averageIncome: city.averageIncome
        },
        scores,
        costs,
        roi,
        competitors: {
          total: competitors.length,
          avgRating: this.calculateAverageRating(competitors),
          topCompetitors: competitors.slice(0, 3)
        },
        marketInsights: this.generateMarketInsights(city, businessType, scores),
        opportunityLevel: this.getOpportunityLevel(scores.final)
      };

    } catch (error) {
      console.error(`❌ Erro ao analisar ${city.name}:`, error.message);
      return this.getMockCityAnalysis(cityKey, businessType);
    }
  }

  /**
   * Busca concorrentes na cidade
   */
  async getCityCompetitors(lat, lng, businessType) {
    try {
      const googleBusinessType = this.mapBusinessTypeToGoogle(businessType);
      const competitors = await googlePlacesService.findNearbyCompetitors(
        lat, lng, googleBusinessType, 5000 // Raio maior para cidades
      );
      return competitors;
    } catch (error) {
      console.error('❌ Erro ao buscar concorrentes:', error.message);
      return this.getMockCompetitors(businessType);
    }
  }

  /**
   * Busca POIs da cidade
   */
  async getCityPOIs(lat, lng) {
    try {
      const pois = await openStreetMapService.findComplementaryPOIs(lat, lng, 3000);
      return pois;
    } catch (error) {
      console.error('❌ Erro ao buscar POIs:', error.message);
      return {};
    }
  }

  /**
   * Obtém dados demográficos da cidade
   */
  async getCityDemographics(city) {
    try {
      // Usar dados do IBGE ou dados mock baseados na cidade
      return {
        population: city.population,
        averageIncome: city.averageIncome,
        educationLevel: this.getEducationLevel(city),
        ageDistribution: this.getAgeDistribution(city),
        economicActivity: this.getEconomicActivity(city)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar demografia:', error.message);
      return this.getMockDemographics(city);
    }
  }

  /**
   * Calcula scores para a cidade
   */
  async calculateCityScores(data) {
    const { city, businessType, competitors, pois, demographics } = data;

    // Simular análise completa
    const analysisData = {
      businessType,
      location: { coordinates: city.coordinates },
      competitors: { total: competitors.length, formal: competitors, informal: [] },
      demographics,
      searchRadius: 3000
    };

    // Usar scoreService existente
    const scores = await scoreService.calculateCompleteScore(analysisData);

    // Ajustar scores baseado no contexto da cidade
    const adjustedScores = this.adjustScoresForCity(scores, city);

    return adjustedScores;
  }

  /**
   * Ajusta scores baseado no contexto da cidade
   */
  adjustScoresForCity(scores, city) {
    // Ajustar baseado no tamanho do mercado
    let marketSizeBonus = 0;
    switch (city.marketSize) {
      case 'MUITO_GRANDE': marketSizeBonus = 10; break;
      case 'GRANDE': marketSizeBonus = 5; break;
      case 'MÉDIO': marketSizeBonus = 0; break;
      case 'PEQUENO': marketSizeBonus = -5; break;
    }

    // Ajustar score final
    const adjustedFinal = Math.min(100, Math.max(0, 
      scores.final.value + marketSizeBonus
    ));

    return {
      ...scores,
      final: {
        ...scores.final,
        value: adjustedFinal,
        adjustments: {
          marketSizeBonus,
          originalScore: scores.final.value
        }
      }
    };
  }

  /**
   * Calcula custos estimados do negócio
   */
  calculateBusinessCosts(city, businessType) {
    const baseCosts = this.getBaseCosts(businessType);
    const costFactor = this.costFactors[city.businessCost];

    return {
      initialInvestment: Math.round(baseCosts.initial * costFactor.rent),
      monthlyRent: Math.round(baseCosts.rent * costFactor.rent),
      laborCosts: Math.round(baseCosts.labor * costFactor.labor),
      marketingCosts: Math.round(baseCosts.marketing * costFactor.marketing),
      totalMonthly: Math.round(
        (baseCosts.rent * costFactor.rent) +
        (baseCosts.labor * costFactor.labor) +
        (baseCosts.marketing * costFactor.marketing)
      ),
      costLevel: city.businessCost
    };
  }

  /**
   * Custos base por tipo de negócio
   */
  getBaseCosts(businessType) {
    const costs = {
      'restaurante': { initial: 150000, rent: 8000, labor: 12000, marketing: 3000 },
      'pizzaria': { initial: 100000, rent: 6000, labor: 8000, marketing: 2500 },
      'salao_beleza': { initial: 80000, rent: 4000, labor: 6000, marketing: 2000 },
      'farmacia': { initial: 200000, rent: 10000, labor: 15000, marketing: 3500 },
      'supermercado': { initial: 300000, rent: 15000, labor: 20000, marketing: 5000 },
      'lanchonete': { initial: 60000, rent: 3500, labor: 5000, marketing: 1500 }
    };

    return costs[businessType] || costs['restaurante'];
  }

  /**
   * Calcula ROI estimado
   */
  calculateROIEstimate(scores, costs, demographics) {
    const revenueMultiplier = this.getRevenueMultiplier(scores.final.value);
    const populationFactor = Math.min(2.0, demographics.population / 1000000);
    const incomeFactor = demographics.averageIncome / 3000;

    const estimatedMonthlyRevenue = costs.totalMonthly * revenueMultiplier * populationFactor * incomeFactor;
    const monthlyProfit = estimatedMonthlyRevenue - costs.totalMonthly;
    const paybackMonths = monthlyProfit > 0 ? Math.ceil(costs.initialInvestment / monthlyProfit) : null;

    return {
      estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue),
      estimatedMonthlyProfit: Math.round(monthlyProfit),
      paybackPeriodMonths: paybackMonths,
      annualROI: paybackMonths ? Math.round((monthlyProfit * 12 / costs.initialInvestment) * 100) : 0,
      riskLevel: this.getRiskLevel(scores.final.value, paybackMonths)
    };
  }

  /**
   * Multiplicador de receita baseado no score
   */
  getRevenueMultiplier(score) {
    if (score >= 80) return 2.5;
    if (score >= 70) return 2.0;
    if (score >= 60) return 1.5;
    if (score >= 50) return 1.2;
    return 1.0;
  }

  /**
   * Nível de risco do investimento
   */
  getRiskLevel(score, paybackMonths) {
    if (!paybackMonths || paybackMonths > 36) return 'ALTO';
    if (score >= 70 && paybackMonths <= 18) return 'BAIXO';
    if (score >= 60 && paybackMonths <= 24) return 'MÉDIO';
    return 'ALTO';
  }

  /**
   * Gera ranking das cidades
   */
  generateCityRanking(analyses) {
    return analyses
      .sort((a, b) => {
        // Ordenar por score final, depois por ROI
        if (b.scores.final.value !== a.scores.final.value) {
          return b.scores.final.value - a.scores.final.value;
        }
        return (b.roi.annualROI || 0) - (a.roi.annualROI || 0);
      })
      .map((analysis, index) => ({
        position: index + 1,
        city: analysis.city,
        score: analysis.scores.final.value,
        roi: analysis.roi.annualROI,
        payback: analysis.roi.paybackPeriodMonths,
        riskLevel: analysis.roi.riskLevel,
        opportunityLevel: analysis.opportunityLevel,
        highlight: index === 0 ? 'MELHOR_OPCAO' : index < 3 ? 'TOP_3' : null
      }));
  }

  /**
   * Gera comparativo detalhado
   */
  generateDetailedComparison(analyses, businessType) {
    const scores = analyses.map(a => a.scores.final.value);
    const rois = analyses.map(a => a.roi.annualROI || 0);
    const costs = analyses.map(a => a.costs.totalMonthly);

    return {
      businessType,
      summary: {
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        averageScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
        bestROI: Math.max(...rois),
        averageROI: Math.round(rois.reduce((sum, r) => sum + r, 0) / rois.length),
        lowestCost: Math.min(...costs),
        highestCost: Math.max(...costs)
      },
      insights: this.generateComparisonInsights(analyses)
    };
  }

  /**
   * Gera insights do comparativo
   */
  generateComparisonInsights(analyses) {
    const insights = [];

    // Melhor custo-benefício
    const bestValue = analyses.reduce((best, current) => {
      const bestRatio = (best.scores.final.value / best.costs.totalMonthly) * 1000;
      const currentRatio = (current.scores.final.value / current.costs.totalMonthly) * 1000;
      return currentRatio > bestRatio ? current : best;
    });

    insights.push({
      type: 'opportunity',
      title: 'Melhor Custo-Benefício',
      description: `${bestValue.city.name} oferece a melhor relação score/custo`,
      city: bestValue.city.name
    });

    // Menor risco
    const lowestRisk = analyses.filter(a => a.roi.riskLevel === 'BAIXO');
    if (lowestRisk.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Menor Risco',
        description: `${lowestRisk.length} cidade(s) com risco baixo identificada(s)`,
        cities: lowestRisk.map(a => a.city.name)
      });
    }

    // Maior potencial
    const highestScore = analyses.reduce((max, current) => 
      current.scores.final.value > max.scores.final.value ? current : max
    );

    insights.push({
      type: 'opportunity',
      title: 'Maior Potencial',
      description: `${highestScore.city.name} tem o maior score de viabilidade`,
      score: highestScore.scores.final.value
    });

    return insights;
  }

  /**
   * Gera recomendações finais
   */
  generateRecommendations(ranking, businessType) {
    const recommendations = [];

    // Recomendação principal
    const topCity = ranking[0];
    recommendations.push({
      type: 'primary',
      title: `Recomendação Principal: ${topCity.city.name}`,
      description: `Melhor combinação de score (${topCity.score}%) e ROI (${topCity.roi}%)`,
      action: 'Fazer análise detalhada desta cidade'
    });

    // Alternativa de baixo custo
    const lowCostOptions = ranking.filter(city => 
      city.city.name !== topCity.city.name && 
      ['Fortaleza', 'Recife', 'Goiânia'].includes(city.city.name)
    );

    if (lowCostOptions.length > 0) {
      recommendations.push({
        type: 'alternative',
        title: `Alternativa de Baixo Custo: ${lowCostOptions[0].city.name}`,
        description: 'Menor investimento inicial e custos operacionais',
        action: 'Considerar para orçamento limitado'
      });
    }

    // Mercado emergente
    const emergingMarkets = ranking.filter(city => 
      city.score >= 60 && city.score < 75
    );

    if (emergingMarkets.length > 0) {
      recommendations.push({
        type: 'opportunity',
        title: 'Mercados Emergentes',
        description: `${emergingMarkets.length} cidade(s) com potencial de crescimento`,
        action: 'Monitorar para entrada futura'
      });
    }

    return recommendations;
  }

  // Métodos auxiliares e dados mock...
  
  mapBusinessTypeToGoogle(businessType) {
    const mapping = {
      'restaurante': 'restaurant',
      'pizzaria': 'restaurant',
      'lanchonete': 'restaurant',
      'salao_beleza': 'beauty_salon',
      'farmacia': 'pharmacy',
      'supermercado': 'supermarket'
    };
    return mapping[businessType] || 'store';
  }

  calculateAverageRating(competitors) {
    if (!competitors.length) return 0;
    const total = competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0);
    return Math.round((total / competitors.length) * 10) / 10;
  }

  getOpportunityLevel(score) {
    if (score >= 80) return 'EXCELENTE';
    if (score >= 70) return 'BOA';
    if (score >= 60) return 'MODERADA';
    return 'BAIXA';
  }

  getEducationLevel(city) {
    // Dados estimados baseados no perfil da cidade
    const profiles = {
      'São Paulo': { college: 35, graduate: 15, highSchool: 40, elementary: 10 },
      'Rio de Janeiro': { college: 30, graduate: 12, highSchool: 45, elementary: 13 },
      'Brasília': { college: 45, graduate: 20, highSchool: 30, elementary: 5 }
    };
    return profiles[city.name] || { college: 25, graduate: 8, highSchool: 50, elementary: 17 };
  }

  getAgeDistribution(city) {
    // Distribuição etária estimada
    return {
      under18: 20,
      age18to35: 35,
      age36to55: 30,
      over55: 15
    };
  }

  getEconomicActivity(city) {
    return {
      services: 60,
      industry: 25,
      commerce: 15
    };
  }

  // Dados mock para fallback
  getMockCityAnalysis(cityKey, businessType) {
    const city = this.cities[cityKey];
    return {
      cityKey,
      city: {
        name: city.name,
        state: city.state,
        population: city.population,
        averageIncome: city.averageIncome
      },
      scores: {
        final: { value: 65 },
        competitorRating: { score: 70 },
        poiComplementarity: { score: 60 }
      },
      costs: {
        totalMonthly: 15000,
        initialInvestment: 120000
      },
      roi: {
        annualROI: 25,
        paybackPeriodMonths: 24,
        riskLevel: 'MÉDIO'
      },
      competitors: { total: 8, avgRating: 4.1 },
      opportunityLevel: 'MODERADA'
    };
  }

  getMockCompetitors(businessType) {
    return [
      { name: 'Concorrente 1', rating: 4.2, user_ratings_total: 150 },
      { name: 'Concorrente 2', rating: 3.8, user_ratings_total: 89 }
    ];
  }

  getMockDemographics(city) {
    return {
      population: city.population,
      averageIncome: city.averageIncome,
      educationLevel: { college: 25, graduate: 8, highSchool: 50, elementary: 17 },
      ageDistribution: { under18: 20, age18to35: 35, age36to55: 30, over55: 15 }
    };
  }
}

module.exports = new MultiCityAnalysisService();
