const axios = require('axios');

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * Busca concorrentes próximos usando Google Places Nearby Search
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} businessType - Tipo de negócio (ex: 'restaurant', 'store')
   * @param {number} radius - Raio em metros (máx 50000)
   * @returns {Promise<Array>} Lista de concorrentes
   */
  async findNearbyCompetitors(lat, lng, businessType, radius = 1000) {
    try {
      if (!this.apiKey) {
        console.log('🔄 Google Places API key não configurada, usando dados mock...');
        return this.getMockCompetitors(businessType);
      }

      const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: businessType,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          price_level: place.price_level || 0,
          vicinity: place.vicinity,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          types: place.types,
          business_status: place.business_status,
          opening_hours: place.opening_hours
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar concorrentes no Google Places:', error.message);
      return this.getMockCompetitors(businessType);
    }
  }

  /**
   * Obtém detalhes completos de um local específico
   * @param {string} placeId - ID do local no Google Places
   * @returns {Promise<Object>} Detalhes do local
   */
  async getPlaceDetails(placeId) {
    try {
      if (!this.apiKey) {
        return this.getMockPlaceDetails();
      }

      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,rating,user_ratings_total,price_level,opening_hours,reviews,photos,formatted_phone_number,website',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao obter detalhes do local:', error.message);
      return this.getMockPlaceDetails();
    }
  }

  /**
   * Calcula o Competitor Rating Index (CRI)
   * Mede a qualidade média dos concorrentes numa área
   * @param {Array} competitors - Lista de concorrentes
   * @returns {Object} Score CRI e análise
   */
  calculateCompetitorRatingIndex(competitors) {
    if (!competitors || competitors.length === 0) {
      return {
        score: 100, // Sem concorrentes = oportunidade máxima
        level: 'EXCELENTE',
        analysis: {
          total_competitors: 0,
          avg_rating: 0,
          avg_reviews: 0,
          high_quality_competitors: 0,
          market_saturation: 'BAIXA'
        }
      };
    }

    // Filtrar apenas concorrentes com dados válidos
    const validCompetitors = competitors.filter(c => c.rating > 0);
    
    if (validCompetitors.length === 0) {
      return {
        score: 80,
        level: 'BOM',
        analysis: {
          total_competitors: competitors.length,
          avg_rating: 0,
          avg_reviews: 0,
          high_quality_competitors: 0,
          market_saturation: 'MÉDIA'
        }
      };
    }

    // Calcular métricas
    const avgRating = validCompetitors.reduce((sum, c) => sum + c.rating, 0) / validCompetitors.length;
    const avgReviews = validCompetitors.reduce((sum, c) => sum + c.user_ratings_total, 0) / validCompetitors.length;
    const highQualityCompetitors = validCompetitors.filter(c => c.rating >= 4.0 && c.user_ratings_total >= 50).length;

    // Calcular CRI Score (0-100)
    let score = 100;
    
    // Penalizar por quantidade de concorrentes
    score -= Math.min(competitors.length * 5, 40);
    
    // Penalizar por qualidade alta dos concorrentes
    if (avgRating >= 4.5) score -= 25;
    else if (avgRating >= 4.0) score -= 15;
    else if (avgRating >= 3.5) score -= 5;
    
    // Penalizar por concorrentes estabelecidos (muitas avaliações)
    if (avgReviews >= 500) score -= 20;
    else if (avgReviews >= 100) score -= 10;
    
    // Penalizar por concorrentes de alta qualidade
    score -= highQualityCompetitors * 8;

    // Garantir que o score fique entre 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determinar nível
    let level, marketSaturation;
    if (score >= 80) {
      level = 'EXCELENTE';
      marketSaturation = 'BAIXA';
    } else if (score >= 60) {
      level = 'BOM';
      marketSaturation = 'MÉDIA';
    } else if (score >= 40) {
      level = 'REGULAR';
      marketSaturation = 'ALTA';
    } else {
      level = 'RUIM';
      marketSaturation = 'MUITO ALTA';
    }

    return {
      score,
      level,
      analysis: {
        total_competitors: competitors.length,
        avg_rating: Math.round(avgRating * 10) / 10,
        avg_reviews: Math.round(avgReviews),
        high_quality_competitors: highQualityCompetitors,
        market_saturation: marketSaturation
      }
    };
  }

  /**
   * Dados mock para desenvolvimento/testes
   */
  getMockCompetitors(businessType) {
    const mockData = {
      restaurant: [
        {
          id: 'mock_1',
          name: 'Restaurante Dom João',
          rating: 4.2,
          user_ratings_total: 156,
          price_level: 2,
          vicinity: 'Centro',
          location: { lat: -23.5505, lng: -46.6333 },
          types: ['restaurant', 'food'],
          business_status: 'OPERATIONAL'
        },
        {
          id: 'mock_2',
          name: 'Pizzaria Bella Vista',
          rating: 3.8,
          user_ratings_total: 89,
          price_level: 1,
          vicinity: 'Centro',
          location: { lat: -23.5515, lng: -46.6343 },
          types: ['restaurant', 'meal_delivery'],
          business_status: 'OPERATIONAL'
        }
      ],
      store: [
        {
          id: 'mock_3',
          name: 'Loja Central',
          rating: 4.0,
          user_ratings_total: 234,
          price_level: 2,
          vicinity: 'Centro',
          location: { lat: -23.5495, lng: -46.6323 },
          types: ['store', 'clothing_store'],
          business_status: 'OPERATIONAL'
        }
      ]
    };

    return mockData[businessType] || mockData.restaurant;
  }

  getMockPlaceDetails() {
    return {
      name: 'Local Mock',
      rating: 4.1,
      user_ratings_total: 127,
      price_level: 2,
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Segunda-feira: 08:00–18:00',
          'Terça-feira: 08:00–18:00',
          'Quarta-feira: 08:00–18:00',
          'Quinta-feira: 08:00–18:00',
          'Sexta-feira: 08:00–18:00',
          'Sábado: 09:00–17:00',
          'Domingo: Fechado'
        ]
      }
    };
  }
}

module.exports = new GooglePlacesService();
