const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

class ReceitaFederalService {
  constructor() {
    this.baseURL = 'https://publica.cnpj.ws/cnpj';
    this.serproURL = 'https://gateway.apiserpro.serpro.gov.br/consulta-cnpj-df/v2';
  }

  /**
   * Busca empresas por CNAE em uma região específica
   * @param {string} cnae - Código CNAE
   * @param {string} city - Cidade
   * @param {string} state - Estado
   * @param {number} limit - Limite de resultados
   */
  async searchCompaniesByCNAE(cnae, city, state, limit = 100) {
    const cacheKey = `cnae_${cnae}_${city}_${state}_${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('📋 Dados da Receita Federal obtidos do cache');
      return cached;
    }

    try {
      // Simula busca na Receita Federal (API real requer autenticação)
      const mockData = this.generateMockCompanies(cnae, city, state, limit);
      
      // Em produção, usar API real:
      // const response = await axios.get(`${this.serproURL}/cnpj`, {
      //   headers: {
      //     'Authorization': `Bearer ${process.env.SERPRO_API_KEY}`
      //   },
      //   params: { cnae, municipio: city, uf: state, limite: limit }
      // });

      cache.set(cacheKey, mockData);
      console.log(`📋 Encontradas ${mockData.length} empresas na Receita Federal`);
      
      return mockData;
    } catch (error) {
      console.error('❌ Erro ao consultar Receita Federal:', error.message);
      throw new Error('Erro ao consultar dados da Receita Federal');
    }
  }

  /**
   * Busca dados de uma empresa específica por CNPJ
   * @param {string} cnpj - CNPJ da empresa
   */
  async getCompanyByCNPJ(cnpj) {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    const cacheKey = `cnpj_${cleanCNPJ}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Usando API pública gratuita (limitada)
      const response = await axios.get(`${this.baseURL}/${cleanCNPJ}`, {
        timeout: 10000
      });

      const companyData = {
        cnpj: cleanCNPJ,
        name: response.data.razao_social || response.data.nome_fantasia,
        cnae: response.data.cnae_fiscal,
        address: this.formatAddress(response.data),
        status: response.data.situacao_cadastral,
        openingDate: response.data.data_inicio_atividade,
        coordinates: null // Será geocodificado posteriormente
      };

      cache.set(cacheKey, companyData);
      return companyData;
    } catch (error) {
      console.error(`❌ Erro ao buscar CNPJ ${cleanCNPJ}:`, error.message);
      return null;
    }
  }

  /**
   * Gera dados mock para desenvolvimento
   */
  generateMockCompanies(cnae, city, state, limit) {
    const businessTypes = {
      '5611': ['Restaurante', 'Lanchonete', 'Pizzaria', 'Hamburgueria'],
      '9602': ['Salão de Beleza', 'Barbearia', 'Estética', 'Spa'],
      '4711': ['Supermercado', 'Mercadinho', 'Conveniência', 'Empório'],
      '8511': ['Escola', 'Colégio', 'Curso', 'Instituto'],
      '8630': ['Clínica', 'Consultório', 'Laboratório', 'Hospital']
    };

    const names = businessTypes[cnae] || ['Empresa', 'Comércio', 'Serviços', 'Negócio'];
    const streets = ['Rua das Flores', 'Av. Principal', 'Rua do Comércio', 'Av. Central', 'Rua da Paz'];
    
    const companies = [];
    const count = Math.min(limit, Math.floor(Math.random() * 20) + 5);

    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const randomNumber = Math.floor(Math.random() * 1000) + 1;
      
      companies.push({
        cnpj: this.generateRandomCNPJ(),
        name: `${randomName} ${city} ${i + 1}`,
        cnae: cnae,
        address: `${randomStreet}, ${randomNumber} - ${city}/${state}`,
        status: 'ATIVA',
        openingDate: this.getRandomDate(),
        coordinates: this.getRandomCoordinatesNear(city, state)
      });
    }

    return companies;
  }

  generateRandomCNPJ() {
    const digits = [];
    for (let i = 0; i < 14; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    return digits.join('').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  getRandomDate() {
    const start = new Date(2010, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  getRandomCoordinatesNear(city, state) {
    // Coordenadas aproximadas de algumas cidades brasileiras
    const cityCoords = {
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
      'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
      'Brasília': { lat: -15.8267, lng: -47.9218 },
      'Salvador': { lat: -12.9714, lng: -38.5014 }
    };

    const baseCoord = cityCoords[city] || { lat: -23.5505, lng: -46.6333 };
    
    // Adiciona variação aleatória de até 0.05 graus (aproximadamente 5km)
    return {
      lat: baseCoord.lat + (Math.random() - 0.5) * 0.1,
      lng: baseCoord.lng + (Math.random() - 0.5) * 0.1
    };
  }

  formatAddress(data) {
    const parts = [];
    if (data.logradouro) parts.push(data.logradouro);
    if (data.numero) parts.push(data.numero);
    if (data.bairro) parts.push(data.bairro);
    if (data.municipio) parts.push(data.municipio);
    if (data.uf) parts.push(data.uf);
    
    return parts.join(', ');
  }

  /**
   * Lista os CNAEs mais comuns por categoria
   */
  getCommonCNAEs() {
    return {
      'Alimentação': {
        '5611': 'Restaurantes e similares',
        '5612': 'Serviços ambulantes de alimentação',
        '1091': 'Fabricação de produtos de padaria',
        '4724': 'Comércio varejista de hortifrutigranjeiros'
      },
      'Beleza e Estética': {
        '9602': 'Cabeleireiros, manicure e pedicure',
        '9603': 'Atividades funerárias',
        '8690': 'Atividades de atenção à saúde humana'
      },
      'Varejo': {
        '4711': 'Comércio varejista de mercadorias em geral',
        '4712': 'Comércio varejista de mercadorias em geral',
        '4713': 'Lojas de departamentos ou magazines'
      },
      'Educação': {
        '8511': 'Educação infantil - creche',
        '8512': 'Educação infantil - pré-escola',
        '8513': 'Ensino fundamental'
      },
      'Saúde': {
        '8630': 'Atividade médica ambulatorial',
        '8640': 'Atividade odontológica',
        '8650': 'Atividades de profissionais da nutrição'
      }
    };
  }
}

module.exports = new ReceitaFederalService();
