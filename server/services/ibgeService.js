const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 24 hours (demographic data doesn't change frequently)
const cache = new NodeCache({ stdTTL: 86400 });

class IBGEService {
  constructor() {
    this.baseURL = 'https://servicodados.ibge.gov.br/api/v1';
    this.censusURL = 'https://apisidra.ibge.gov.br/values';
  }

  /**
   * Busca dados demográficos de uma cidade
   * @param {string} cityCode - Código IBGE da cidade
   * @param {string} cityName - Nome da cidade
   * @param {string} state - Estado (UF)
   */
  async getDemographicData(cityCode, cityName, state) {
    const cacheKey = `demographics_${cityCode || cityName}_${state}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('📊 Dados demográficos obtidos do cache');
      return cached;
    }

    try {
      // Busca código da cidade se não fornecido
      if (!cityCode) {
        cityCode = await this.getCityCode(cityName, state);
      }

      // Busca dados populacionais
      const populationData = await this.getPopulationData(cityCode);
      
      // Busca dados de renda
      const incomeData = await this.getIncomeData(cityCode);
      
      // Busca dados de educação
      const educationData = await this.getEducationData(cityCode);

      const demographicData = {
        cityCode,
        cityName,
        state,
        population: populationData.total,
        populationDensity: populationData.density,
        averageIncome: incomeData.average,
        medianIncome: incomeData.median,
        ageDistribution: populationData.ageDistribution,
        educationLevel: educationData,
        economicActivity: await this.getEconomicActivity(cityCode),
        lastUpdate: new Date().toISOString()
      };

      cache.set(cacheKey, demographicData);
      console.log(`📊 Dados demográficos processados para ${cityName}/${state}`);
      
      return demographicData;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do IBGE:', error.message);
      
      // Retorna dados mock em caso de erro
      return this.generateMockDemographics(cityName, state);
    }
  }

  /**
   * Busca código IBGE da cidade
   */
  async getCityCode(cityName, state) {
    try {
      const response = await axios.get(`${this.baseURL}/localidades/municipios`, {
        timeout: 10000
      });

      const city = response.data.find(c => 
        c.nome.toLowerCase().includes(cityName.toLowerCase()) &&
        c.microrregiao.mesorregiao.UF.sigla === state.toUpperCase()
      );

      return city ? city.id : null;
    } catch (error) {
      console.error('❌ Erro ao buscar código da cidade:', error.message);
      return null;
    }
  }

  /**
   * Busca dados populacionais
   */
  async getPopulationData(cityCode) {
    try {
      // Simulação de dados reais do IBGE
      // Em produção, usar APIs específicas do SIDRA
      
      const basePopulation = Math.floor(Math.random() * 500000) + 50000;
      
      return {
        total: basePopulation,
        density: Math.floor(basePopulation / (Math.random() * 1000 + 100)),
        ageDistribution: {
          under18: Math.floor(basePopulation * 0.25),
          age18to35: Math.floor(basePopulation * 0.35),
          age36to55: Math.floor(basePopulation * 0.25),
          over55: Math.floor(basePopulation * 0.15)
        }
      };
    } catch (error) {
      throw new Error('Erro ao buscar dados populacionais');
    }
  }

  /**
   * Busca dados de renda
   */
  async getIncomeData(cityCode) {
    try {
      // Simulação baseada em dados reais brasileiros
      const baseIncome = Math.floor(Math.random() * 3000) + 1500;
      
      return {
        average: baseIncome,
        median: Math.floor(baseIncome * 0.8),
        distribution: {
          upTo1SM: 0.35,      // Até 1 salário mínimo
          from1to3SM: 0.40,   // De 1 a 3 salários mínimos
          from3to5SM: 0.15,   // De 3 a 5 salários mínimos
          from5to10SM: 0.08,  // De 5 a 10 salários mínimos
          above10SM: 0.02     // Acima de 10 salários mínimos
        }
      };
    } catch (error) {
      throw new Error('Erro ao buscar dados de renda');
    }
  }

  /**
   * Busca dados de educação
   */
  async getEducationData(cityCode) {
    try {
      return {
        elementary: Math.floor(Math.random() * 40) + 30,    // 30-70%
        highSchool: Math.floor(Math.random() * 30) + 25,    // 25-55%
        college: Math.floor(Math.random() * 20) + 10,       // 10-30%
        graduate: Math.floor(Math.random() * 10) + 2        // 2-12%
      };
    } catch (error) {
      throw new Error('Erro ao buscar dados de educação');
    }
  }

  /**
   * Busca dados de atividade econômica
   */
  async getEconomicActivity(cityCode) {
    try {
      return {
        primarySector: Math.floor(Math.random() * 20) + 5,    // Agricultura, pecuária
        secondarySector: Math.floor(Math.random() * 30) + 15, // Indústria
        tertiarySector: Math.floor(Math.random() * 40) + 50,  // Serviços
        unemployment: Math.floor(Math.random() * 10) + 5      // Taxa de desemprego
      };
    } catch (error) {
      throw new Error('Erro ao buscar dados de atividade econômica');
    }
  }

  /**
   * Busca dados de PIB municipal
   */
  async getMunicipalGDP(cityCode) {
    try {
      const response = await axios.get(`${this.baseURL}/agregados/5938/periodos/2019/variaveis/37?localidades=N6[${cityCode}]`, {
        timeout: 10000
      });

      return {
        total: response.data[0]?.resultados[0]?.series[0]?.serie['2019'] || 0,
        perCapita: 0 // Calcular com base na população
      };
    } catch (error) {
      console.error('❌ Erro ao buscar PIB municipal:', error.message);
      return { total: 0, perCapita: 0 };
    }
  }

  /**
   * Gera dados demográficos mock para desenvolvimento
   */
  generateMockDemographics(cityName, state) {
    const population = Math.floor(Math.random() * 500000) + 50000;
    const averageIncome = Math.floor(Math.random() * 3000) + 1500;

    return {
      cityCode: '0000000',
      cityName,
      state,
      population,
      populationDensity: Math.floor(population / (Math.random() * 1000 + 100)),
      averageIncome,
      medianIncome: Math.floor(averageIncome * 0.8),
      ageDistribution: {
        under18: Math.floor(population * 0.25),
        age18to35: Math.floor(population * 0.35),
        age36to55: Math.floor(population * 0.25),
        over55: Math.floor(population * 0.15)
      },
      educationLevel: {
        elementary: 45,
        highSchool: 35,
        college: 15,
        graduate: 5
      },
      economicActivity: {
        primarySector: 10,
        secondarySector: 25,
        tertiarySector: 60,
        unemployment: 8
      },
      lastUpdate: new Date().toISOString(),
      isMock: true
    };
  }

  /**
   * Lista estados brasileiros
   */
  async getStates() {
    try {
      const response = await axios.get(`${this.baseURL}/localidades/estados`, {
        timeout: 10000
      });

      return response.data.map(state => ({
        id: state.id,
        name: state.nome,
        abbreviation: state.sigla
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar estados:', error.message);
      return [];
    }
  }

  /**
   * Lista cidades de um estado
   */
  async getCitiesByState(stateId) {
    try {
      const response = await axios.get(`${this.baseURL}/localidades/estados/${stateId}/municipios`, {
        timeout: 10000
      });

      return response.data.map(city => ({
        id: city.id,
        name: city.nome
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar cidades:', error.message);
      return [];
    }
  }

  /**
   * Calcula índice de desenvolvimento baseado nos dados demográficos
   */
  calculateDevelopmentIndex(demographicData) {
    let score = 0;
    
    // Renda (peso 40%)
    if (demographicData.averageIncome > 3000) score += 40;
    else if (demographicData.averageIncome > 2000) score += 30;
    else if (demographicData.averageIncome > 1500) score += 20;
    else score += 10;
    
    // Educação (peso 30%)
    const collegeRate = demographicData.educationLevel.college + demographicData.educationLevel.graduate;
    if (collegeRate > 25) score += 30;
    else if (collegeRate > 15) score += 20;
    else if (collegeRate > 10) score += 15;
    else score += 5;
    
    // Atividade econômica (peso 30%)
    if (demographicData.economicActivity.unemployment < 6) score += 30;
    else if (demographicData.economicActivity.unemployment < 10) score += 20;
    else if (demographicData.economicActivity.unemployment < 15) score += 10;
    else score += 5;
    
    return Math.min(100, score);
  }
}

module.exports = new IBGEService();
