const geolib = require('geolib');
const googlePlacesService = require('./googlePlacesService');
const openStreetMapService = require('./openStreetMapService');

class ScoreService {
  constructor() {
    // Pesos para diferentes fatores na análise (atualizados com novos algoritmos)
    this.weights = {
      competition: 0.3,      // 30% - Concorrência (incluindo CRI)
      demographics: 0.2,     // 20% - Demografia
      location: 0.15,        // 15% - Localização
      transportation: 0.1,   // 10% - Transporte
      competitorRating: 0.15, // 15% - Competitor Rating Index (CRI)
      poiComplementarity: 0.1 // 10% - POI Complementaridade Score (PCS)
    };

    // Benchmarks para diferentes tipos de negócio
    this.businessBenchmarks = {
      'restaurante': { idealCompetitors: 3, maxCompetitors: 8, populationPerCompetitor: 5000 },
      'pizzaria': { idealCompetitors: 2, maxCompetitors: 6, populationPerCompetitor: 8000 },
      'salao_beleza': { idealCompetitors: 2, maxCompetitors: 5, populationPerCompetitor: 3000 },
      'farmacia': { idealCompetitors: 1, maxCompetitors: 3, populationPerCompetitor: 10000 },
      'supermercado': { idealCompetitors: 1, maxCompetitors: 2, populationPerCompetitor: 15000 },
      'padaria': { idealCompetitors: 2, maxCompetitors: 4, populationPerCompetitor: 4000 },
      'academia': { idealCompetitors: 1, maxCompetitors: 3, populationPerCompetitor: 8000 },
      'escola': { idealCompetitors: 2, maxCompetitors: 4, populationPerCompetitor: 2000 },
      'clinica': { idealCompetitors: 2, maxCompetitors: 5, populationPerCompetitor: 6000 },
      'lanchonete': { idealCompetitors: 3, maxCompetitors: 7, populationPerCompetitor: 4000 }
    };
  }

  /**
   * Calcula score completo de uma análise com novos algoritmos CRI e PCS
   * @param {Object} analysisData - Dados da análise
   */
  async calculateCompleteScore(analysisData) {
    try {
      // Scores tradicionais
      const competitionScore = this.calculateCompetitionScore(analysisData);
      const demographicsScore = this.calculateDemographicsScore(analysisData);
      const locationScore = this.calculateLocationScore(analysisData);
      const transportationScore = this.calculateTransportationScore(analysisData);

      // Novos algoritmos avançados
      const competitorRatingScore = await this.calculateCompetitorRatingIndex(analysisData);
      const poiComplementarityScore = await this.calculatePOIComplementarityScore(analysisData);

      // Score final ponderado com todos os fatores
      const finalScore = Math.round(
        competitionScore.value * this.weights.competition +
        demographicsScore.value * this.weights.demographics +
        locationScore.value * this.weights.location +
        transportationScore.value * this.weights.transportation +
        competitorRatingScore.score * this.weights.competitorRating +
        poiComplementarityScore.score * this.weights.poiComplementarity
      );

      const saturationScore = this.calculateSaturationScore(analysisData);
      const opportunityScore = this.calculateOpportunityScore(analysisData);

      return {
        saturation: saturationScore,
        opportunity: opportunityScore,
        final: {
          value: finalScore,
          probability: this.getProbabilityText(finalScore),
          recommendation: this.getRecommendation(finalScore, analysisData)
        },
        breakdown: {
          competition: competitionScore,
          demographics: demographicsScore,
          location: locationScore,
          transportation: transportationScore,
          competitorRating: competitorRatingScore,
          poiComplementarity: poiComplementarityScore
        },
        insights: this.generateInsights(analysisData, {
          competition: competitionScore,
          demographics: demographicsScore,
          location: locationScore,
          transportation: transportationScore,
          competitorRating: competitorRatingScore,
          poiComplementarity: poiComplementarityScore,
          final: finalScore
        })
      };
    } catch (error) {
      console.error('❌ Erro ao calcular scores:', error.message);
      throw new Error('Erro no cálculo dos scores');
    }
  }

  /**
   * Calcula score de saturação do mercado
   */
  calculateSaturationScore(analysisData) {
    const { businessType, competitors, demographics, searchRadius } = analysisData;
    const benchmark = this.businessBenchmarks[businessType] || this.businessBenchmarks['restaurante'];
    
    const totalCompetitors = competitors.total || 0;
    const population = demographics.population || 50000;
    
    // Calcula densidade de concorrentes por população
    const competitorDensity = (totalCompetitors / population) * 10000; // Por 10k habitantes
    const idealDensity = 10000 / benchmark.populationPerCompetitor;
    
    // Score baseado na densidade (invertido - menos concorrentes = melhor score)
    let saturationValue = Math.max(0, 100 - (competitorDensity / idealDensity) * 100);
    
    // Ajusta baseado no raio de busca
    const radiusAdjustment = Math.min(1.2, searchRadius / 1000); // Raio maior = mais área = menos saturação
    saturationValue = Math.min(100, saturationValue * radiusAdjustment);
    
    const level = this.getSaturationLevel(saturationValue);
    
    return {
      value: Math.round(saturationValue),
      level,
      description: this.getSaturationDescription(level, totalCompetitors, population),
      competitorDensity: Math.round(competitorDensity * 100) / 100,
      benchmark: {
        ideal: Math.round(idealDensity * 100) / 100,
        current: Math.round(competitorDensity * 100) / 100
      }
    };
  }

  /**
   * Calcula score de oportunidade
   */
  calculateOpportunityScore(analysisData) {
    const { demographics, transportation, location } = analysisData;
    
    let opportunityValue = 0;
    
    // Fator demográfico (40%)
    const incomeScore = this.getIncomeScore(demographics.averageIncome);
    const populationScore = this.getPopulationScore(demographics.population);
    const demographicScore = (incomeScore + populationScore) / 2;
    opportunityValue += demographicScore * 0.4;
    
    // Fator de transporte (30%)
    const transportScore = this.getTransportScore(transportation);
    opportunityValue += transportScore * 0.3;
    
    // Fator de localização (30%)
    const locationScore = this.getLocationScore(location);
    opportunityValue += locationScore * 0.3;
    
    const level = this.getOpportunityLevel(opportunityValue);
    
    return {
      value: Math.round(opportunityValue),
      level,
      description: this.getOpportunityDescription(level, demographics),
      factors: {
        demographics: Math.round(demographicScore),
        transportation: Math.round(transportScore),
        location: Math.round(locationScore)
      }
    };
  }

  /**
   * Calcula score de concorrência
   */
  calculateCompetitionScore(analysisData) {
    const { businessType, competitors } = analysisData;
    const benchmark = this.businessBenchmarks[businessType] || this.businessBenchmarks['restaurante'];
    
    const totalCompetitors = competitors.total || 0;
    const formalCompetitors = competitors.formal?.length || 0;
    const informalCompetitors = competitors.informal?.length || 0;
    
    // Score baseado no número de concorrentes
    let competitionScore = 100;
    
    if (totalCompetitors <= benchmark.idealCompetitors) {
      competitionScore = 90; // Ótimo
    } else if (totalCompetitors <= benchmark.maxCompetitors) {
      competitionScore = 70 - ((totalCompetitors - benchmark.idealCompetitors) * 10);
    } else {
      competitionScore = Math.max(20, 50 - (totalCompetitors - benchmark.maxCompetitors) * 5);
    }
    
    // Penaliza mais concorrentes formais (têm mais recursos)
    const formalPenalty = formalCompetitors * 5;
    const informalPenalty = informalCompetitors * 2;
    
    competitionScore = Math.max(0, competitionScore - formalPenalty - informalPenalty);
    
    return {
      value: Math.round(competitionScore),
      level: this.getCompetitionLevel(competitionScore),
      breakdown: {
        total: totalCompetitors,
        formal: formalCompetitors,
        informal: informalCompetitors,
        benchmark: benchmark
      }
    };
  }

  /**
   * Calcula score demográfico
   */
  calculateDemographicsScore(analysisData) {
    const { demographics } = analysisData;
    
    const incomeScore = this.getIncomeScore(demographics.averageIncome);
    const populationScore = this.getPopulationScore(demographics.population);
    const educationScore = this.getEducationScore(demographics.educationLevel);
    const ageScore = this.getAgeScore(demographics.ageDistribution);
    
    const demographicsScore = (incomeScore + populationScore + educationScore + ageScore) / 4;
    
    return {
      value: Math.round(demographicsScore),
      level: this.getDemographicsLevel(demographicsScore),
      breakdown: {
        income: incomeScore,
        population: populationScore,
        education: educationScore,
        age: ageScore
      }
    };
  }

  /**
   * Calcula score de localização
   */
  calculateLocationScore(analysisData) {
    // Implementação baseada em amenidades próximas, tráfego, etc.
    const baseScore = 70; // Score base para localização
    
    return {
      value: baseScore,
      level: this.getLocationLevel(baseScore),
      factors: ['Localização central', 'Boa visibilidade']
    };
  }

  /**
   * Calcula score de transporte
   */
  calculateTransportationScore(analysisData) {
    const { transportation } = analysisData;
    
    if (!transportation) {
      return { value: 50, level: 'médio' };
    }
    
    const busScore = Math.min(50, (transportation.busStops?.length || 0) * 10);
    const subwayScore = Math.min(30, (transportation.subwayStations?.length || 0) * 15);
    const accessibilityScore = 20; // Score base de acessibilidade
    
    const transportScore = busScore + subwayScore + accessibilityScore;
    
    return {
      value: Math.round(transportScore),
      level: this.getTransportLevel(transportScore),
      breakdown: {
        busStops: transportation.busStops?.length || 0,
        subwayStations: transportation.subwayStations?.length || 0
      }
    };
  }

  /**
   * Calcula Competitor Rating Index (CRI) usando Google Places API
   * Mede a qualidade média dos concorrentes numa área
   * @param {Object} analysisData - Dados da análise
   * @returns {Promise<Object>} Score CRI e análise
   */
  async calculateCompetitorRatingIndex(analysisData) {
    try {
      const { location, businessType, searchRadius } = analysisData;
      const { lat, lng } = location.coordinates;

      // Mapear tipo de negócio para Google Places
      const googleBusinessType = this.mapBusinessTypeToGoogle(businessType);
      
      // Buscar concorrentes no Google Places
      const competitors = await googlePlacesService.findNearbyCompetitors(
        lat, lng, googleBusinessType, searchRadius || 1000
      );

      // Calcular CRI
      const criResult = googlePlacesService.calculateCompetitorRatingIndex(competitors);

      console.log(`🏆 CRI calculado: ${criResult.score} (${criResult.level}) - ${competitors.length} concorrentes analisados`);

      return {
        ...criResult,
        competitors: competitors.slice(0, 10), // Limitar para não sobrecarregar resposta
        methodology: 'Google Places API + Rating Analysis'
      };
    } catch (error) {
      console.error('❌ Erro ao calcular CRI:', error.message);
      return {
        score: 60,
        level: 'REGULAR',
        analysis: {
          total_competitors: 0,
          avg_rating: 0,
          avg_reviews: 0,
          high_quality_competitors: 0,
          market_saturation: 'DESCONHECIDA'
        },
        competitors: [],
        methodology: 'Fallback (erro na API)'
      };
    }
  }

  /**
   * Calcula POI Complementaridade Score (PCS) usando OpenStreetMap
   * Mede presença de POIs que geram tráfego complementar
   * @param {Object} analysisData - Dados da análise
   * @returns {Promise<Object>} Score PCS e análise
   */
  async calculatePOIComplementarityScore(analysisData) {
    try {
      const { location, searchRadius } = analysisData;
      const { lat, lng } = location.coordinates;

      // Buscar POIs complementares
      const pois = await openStreetMapService.findComplementaryPOIs(
        lat, lng, searchRadius || 1000
      );

      // Calcular PCS
      const pcsResult = openStreetMapService.calculatePOIComplementarityScore(pois);

      console.log(`🗺️ PCS calculado: ${pcsResult.score} (${pcsResult.level}) - Potencial: ${pcsResult.analysis.foot_traffic_potential}`);

      return {
        ...pcsResult,
        pois: this.summarizePOIs(pois), // Resumir POIs para resposta
        methodology: 'OpenStreetMap Overpass API + POI Analysis'
      };
    } catch (error) {
      console.error('❌ Erro ao calcular PCS:', error.message);
      return {
        score: 50,
        level: 'REGULAR',
        analysis: {
          traffic_generators: [],
          complementary_businesses: [],
          accessibility_score: 0,
          foot_traffic_potential: 'DESCONHECIDO'
        },
        pois: {},
        methodology: 'Fallback (erro na API)'
      };
    }
  }

  /**
   * Mapeia tipos de negócio para categorias do Google Places
   */
  mapBusinessTypeToGoogle(businessType) {
    const mapping = {
      'restaurante': 'restaurant',
      'pizzaria': 'restaurant',
      'lanchonete': 'restaurant',
      'cafe': 'cafe',
      'bar': 'bar',
      'salao_beleza': 'beauty_salon',
      'barbearia': 'hair_care',
      'farmacia': 'pharmacy',
      'supermercado': 'supermarket',
      'padaria': 'bakery',
      'escola': 'school',
      'clinica': 'hospital',
      'academia': 'gym',
      'posto_gasolina': 'gas_station',
      'banco': 'bank',
      'hotel': 'lodging'
    };

    return mapping[businessType.toLowerCase()] || 'store';
  }

  /**
   * Resume POIs para resposta mais limpa
   */
  summarizePOIs(pois) {
    const summary = {};
    
    Object.keys(pois).forEach(category => {
      if (pois[category].length > 0) {
        summary[category] = {
          count: pois[category].length,
          examples: pois[category].slice(0, 3).map(poi => poi.name)
        };
      }
    });

    return summary;
  }

  // Métodos auxiliares para scores específicos
  getIncomeScore(averageIncome) {
    if (averageIncome >= 4000) return 90;
    if (averageIncome >= 3000) return 80;
    if (averageIncome >= 2000) return 70;
    if (averageIncome >= 1500) return 60;
    return 40;
  }

  getPopulationScore(population) {
    if (population >= 100000) return 90;
    if (population >= 50000) return 80;
    if (population >= 25000) return 70;
    if (population >= 10000) return 60;
    return 40;
  }

  getEducationScore(education) {
    const collegeRate = (education.college || 0) + (education.graduate || 0);
    if (collegeRate >= 30) return 90;
    if (collegeRate >= 20) return 80;
    if (collegeRate >= 15) return 70;
    if (collegeRate >= 10) return 60;
    return 40;
  }

  getAgeScore(ageDistribution) {
    const workingAge = (ageDistribution.age18to35 || 0) + (ageDistribution.age36to55 || 0);
    const total = Object.values(ageDistribution).reduce((sum, val) => sum + (val || 0), 0);
    const workingAgePercentage = (workingAge / total) * 100;
    
    if (workingAgePercentage >= 70) return 90;
    if (workingAgePercentage >= 60) return 80;
    if (workingAgePercentage >= 50) return 70;
    return 60;
  }

  getTransportScore(transportation) {
    if (!transportation) return 50;
    
    const busScore = Math.min(40, (transportation.busStops?.length || 0) * 8);
    const subwayScore = Math.min(40, (transportation.subwayStations?.length || 0) * 20);
    
    return Math.min(100, busScore + subwayScore + 20);
  }

  getLocationScore(location) {
    // Score base para localização (pode ser expandido com mais fatores)
    return 70;
  }

  // Métodos para determinar níveis
  getSaturationLevel(value) {
    if (value >= 80) return 'baixa';
    if (value >= 60) return 'média';
    if (value >= 40) return 'alta';
    return 'muito_alta';
  }

  getOpportunityLevel(value) {
    if (value >= 80) return 'muito_alta';
    if (value >= 65) return 'alta';
    if (value >= 50) return 'média';
    return 'baixa';
  }

  getCompetitionLevel(value) {
    if (value >= 80) return 'baixa';
    if (value >= 60) return 'média';
    if (value >= 40) return 'alta';
    return 'muito_alta';
  }

  getDemographicsLevel(value) {
    if (value >= 80) return 'excelente';
    if (value >= 65) return 'boa';
    if (value >= 50) return 'regular';
    return 'ruim';
  }

  getLocationLevel(value) {
    if (value >= 80) return 'excelente';
    if (value >= 65) return 'boa';
    if (value >= 50) return 'regular';
    return 'ruim';
  }

  getTransportLevel(value) {
    if (value >= 80) return 'excelente';
    if (value >= 65) return 'bom';
    if (value >= 50) return 'regular';
    return 'ruim';
  }

  // Métodos para descrições
  getSaturationDescription(level, competitors, population) {
    const descriptions = {
      'baixa': `Excelente! Apenas ${competitors} concorrentes para ${population.toLocaleString()} habitantes. Mercado com boa oportunidade.`,
      'média': `Moderado. ${competitors} concorrentes na região. Ainda há espaço para novos negócios.`,
      'alta': `Saturado. ${competitors} concorrentes competindo pelo mesmo público. Requer diferenciação.`,
      'muito_alta': `Muito saturado. ${competitors} concorrentes na área. Considere outra localização.`
    };
    return descriptions[level];
  }

  getOpportunityDescription(level, demographics) {
    const descriptions = {
      'muito_alta': `Excelente oportunidade! População de ${demographics.population?.toLocaleString()} com renda média de R$ ${demographics.averageIncome?.toLocaleString()}.`,
      'alta': `Boa oportunidade de negócio. Demografia favorável para o empreendimento.`,
      'média': `Oportunidade moderada. Alguns fatores demográficos são favoráveis.`,
      'baixa': `Oportunidade limitada. Demografia pode não ser ideal para este tipo de negócio.`
    };
    return descriptions[level];
  }

  getProbabilityText(score) {
    if (score >= 85) return `${score}% - Excelente chance de sucesso`;
    if (score >= 70) return `${score}% - Boa chance de sucesso`;
    if (score >= 55) return `${score}% - Chance moderada de sucesso`;
    if (score >= 40) return `${score}% - Chance baixa de sucesso`;
    return `${score}% - Risco alto de insucesso`;
  }

  getRecommendation(score, analysisData) {
    if (score >= 85) {
      return 'Localização excelente! Recomendamos fortemente a abertura do negócio nesta região.';
    } else if (score >= 70) {
      return 'Boa localização para o negócio. Considere estratégias de diferenciação da concorrência.';
    } else if (score >= 55) {
      return 'Localização com potencial moderado. Analise cuidadosamente a concorrência e o público-alvo.';
    } else if (score >= 40) {
      return 'Localização com desafios significativos. Considere outras opções ou um modelo de negócio diferenciado.';
    } else {
      return 'Não recomendamos esta localização. Busque alternativas com menor concorrência ou melhor demografia.';
    }
  }

  /**
   * Gera insights personalizados baseados na análise (incluindo CRI e PCS)
   */
  generateInsights(analysisData, scores) {
    const insights = [];
    const { businessType, competitors, demographics, location } = analysisData;

    // Insights sobre concorrência tradicional
    if (scores.competition.value < 50) {
      insights.push({
        type: 'warning',
        title: 'Alta Concorrência',
        description: `${competitors.total} concorrentes na região. Considere estratégias de diferenciação.`,
        priority: 'high'
      });
    } else if (scores.competition.value > 80) {
      insights.push({
        type: 'opportunity',
        title: 'Baixa Concorrência',
        description: 'Excelente! Poucos concorrentes na região representam uma grande oportunidade.',
        priority: 'high'
      });
    }

    // Insights sobre Competitor Rating Index (CRI)
    if (scores.competitorRating) {
      if (scores.competitorRating.score >= 80) {
        insights.push({
          type: 'opportunity',
          title: 'Concorrentes de Baixa Qualidade',
          description: `CRI ${scores.competitorRating.score}: Concorrentes com avaliações baixas. Oportunidade para se destacar com qualidade superior.`,
          priority: 'high'
        });
      } else if (scores.competitorRating.score <= 40) {
        insights.push({
          type: 'warning',
          title: 'Concorrentes Estabelecidos',
          description: `CRI ${scores.competitorRating.score}: Concorrentes com alta qualidade e muitas avaliações. Mercado competitivo.`,
          priority: 'high'
        });
      }

      // Insight sobre saturação do mercado baseado no CRI
      if (scores.competitorRating.analysis.market_saturation === 'MUITO ALTA') {
        insights.push({
          type: 'warning',
          title: 'Mercado Saturado',
          description: `${scores.competitorRating.analysis.total_competitors} concorrentes com nota média ${scores.competitorRating.analysis.avg_rating.toFixed(1)}. Considere diferenciação ou localização alternativa.`,
          priority: 'medium'
        });
      }
    }

    // Insights sobre POI Complementaridade (PCS)
    if (scores.poiComplementarity) {
      if (scores.poiComplementarity.score >= 70) {
        insights.push({
          type: 'opportunity',
          title: 'Excelente Sinergia Local',
          description: `PCS ${scores.poiComplementarity.score}: ${scores.poiComplementarity.analysis.foot_traffic_potential.toLowerCase()} potencial de tráfego. Ótima localização para captar clientes.`,
          priority: 'high'
        });
      } else if (scores.poiComplementarity.score <= 30) {
        insights.push({
          type: 'warning',
          title: 'Baixo Tráfego de Pedestres',
          description: `PCS ${scores.poiComplementarity.score}: Poucos geradores de tráfego próximos. Considere investir mais em marketing.`,
          priority: 'medium'
        });
      }

      // Insights sobre combinações complementares
      if (scores.poiComplementarity.analysis.complementary_businesses.length > 0) {
        insights.push({
          type: 'opportunity',
          title: 'Sinergia Comercial',
          description: `Localização em ${scores.poiComplementarity.analysis.complementary_businesses.join(', ')}. Aproveite o fluxo compartilhado.`,
          priority: 'medium'
        });
      }
    }

    // Insights demográficos
    if (demographics.averageIncome > 3000) {
      insights.push({
        type: 'opportunity',
        title: 'Renda Elevada',
        description: `Renda média de R$ ${demographics.averageIncome.toLocaleString()} indica bom poder de compra.`,
        priority: 'medium'
      });
    }

    // Insights sobre transporte
    if (scores.transportation.value > 70) {
      insights.push({
        type: 'opportunity',
        title: 'Boa Acessibilidade',
        description: 'Localização bem servida por transporte público, facilitando o acesso de clientes.',
        priority: 'medium'
      });
    }

    // Sugestões específicas por tipo de negócio
    const businessInsights = this.getBusinessSpecificInsights(businessType, analysisData);
    insights.push(...businessInsights);

    return insights.slice(0, 10); // Aumentado para 10 insights devido aos novos algoritmos
  }

  /**
   * Gera insights específicos por tipo de negócio
   */
  getBusinessSpecificInsights(businessType, analysisData) {
    const insights = [];
    const { demographics, transportation } = analysisData;

    switch (businessType.toLowerCase()) {
      case 'restaurante':
      case 'pizzaria':
        if (demographics.ageDistribution.age18to35 > demographics.population * 0.3) {
          insights.push({
            type: 'opportunity',
            title: 'Público Jovem',
            description: 'Grande concentração de jovens adultos, ideal para delivery e redes sociais.',
            priority: 'medium'
          });
        }
        break;

      case 'salao_beleza':
        if (demographics.averageIncome > 2500) {
          insights.push({
            type: 'opportunity',
            title: 'Mercado Premium',
            description: 'Renda elevada permite serviços de maior valor agregado.',
            priority: 'medium'
          });
        }
        break;

      case 'escola':
        if (demographics.ageDistribution.under18 > demographics.population * 0.2) {
          insights.push({
            type: 'opportunity',
            title: 'Demanda Educacional',
            description: 'Alta concentração de crianças e adolescentes na região.',
            priority: 'high'
          });
        }
        break;
    }

    return insights;
  }

  /**
   * Sugere localizações alternativas
   */
  suggestAlternativeLocations(analysisData, radius = 2000) {
    // Esta função seria expandida com dados reais de outras localizações
    const alternatives = [];
    
    // Simulação de localizações alternativas
    const directions = ['Norte', 'Sul', 'Leste', 'Oeste'];
    directions.forEach((direction, index) => {
      alternatives.push({
        address: `${radius/1000}km ao ${direction} da localização original`,
        coordinates: {
          lat: analysisData.location.coordinates.lat + (index % 2 === 0 ? 0.01 : -0.01),
          lng: analysisData.location.coordinates.lng + (index < 2 ? 0.01 : -0.01)
        },
        distance: radius,
        reason: `Menor concentração de concorrentes ${direction.toLowerCase()}`,
        opportunityScore: Math.floor(Math.random() * 30) + 60
      });
    });

    return alternatives.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Sugere negócios correlatos de sucesso
   */
  suggestRelatedBusinesses(businessType) {
    const relatedBusinesses = {
      'restaurante': [
        { type: 'Delivery', reason: 'Complementa operação presencial', successRate: 85 },
        { type: 'Café', reason: 'Atende diferentes horários', successRate: 78 },
        { type: 'Doces e sobremesas', reason: 'Produtos complementares', successRate: 72 }
      ],
      'salao_beleza': [
        { type: 'Estética', reason: 'Serviços complementares', successRate: 82 },
        { type: 'Manicure', reason: 'Sinergia de serviços', successRate: 88 },
        { type: 'Produtos de beleza', reason: 'Venda de produtos', successRate: 75 }
      ],
      'supermercado': [
        { type: 'Farmácia', reason: 'Conveniência para clientes', successRate: 80 },
        { type: 'Padaria', reason: 'Produtos frescos diários', successRate: 85 },
        { type: 'Açougue', reason: 'Especialização em carnes', successRate: 77 }
      ]
    };

    return relatedBusinesses[businessType] || [];
  }
}

module.exports = new ScoreService();
