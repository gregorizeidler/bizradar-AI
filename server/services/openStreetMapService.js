const axios = require('axios');
const NodeCache = require('node-cache');
const turf = require('@turf/turf');

// Cache for 6 hours
const cache = new NodeCache({ stdTTL: 21600 });

class OpenStreetMapService {
  constructor() {
    this.overpassURL = 'https://overpass-api.de/api/interpreter';
    this.nominatimURL = 'https://nominatim.openstreetmap.org';
  }

  /**
   * Busca pontos de interesse (POIs) em um raio específico
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Raio em metros
   * @param {string} businessType - Tipo de negócio para buscar concorrentes
   */
  async searchPOIs(lat, lng, radius, businessType) {
    const cacheKey = `pois_${lat}_${lng}_${radius}_${businessType}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🗺️  POIs obtidos do cache');
      return cached;
    }

    try {
      const competitors = await this.searchCompetitors(lat, lng, radius, businessType);
      const transportation = await this.searchTransportation(lat, lng, radius);
      const amenities = await this.searchAmenities(lat, lng, radius);
      
      const result = {
        competitors,
        transportation,
        amenities,
        searchCenter: { lat, lng },
        searchRadius: radius,
        timestamp: new Date().toISOString()
      };

      cache.set(cacheKey, result);
      console.log(`🗺️  Encontrados ${competitors.length} concorrentes no OSM`);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao consultar OpenStreetMap:', error.message);
      throw new Error('Erro ao consultar dados geoespaciais');
    }
  }

  /**
   * Busca concorrentes informais no OpenStreetMap
   */
  async searchCompetitors(lat, lng, radius, businessType) {
    const tags = this.getBusinessTags(businessType);
    
    try {
      const competitors = [];
      
      for (const tag of tags) {
        const query = this.buildOverpassQuery(lat, lng, radius, tag);
        const response = await axios.post(this.overpassURL, query, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 15000
        });

        const elements = response.data.elements || [];
        
        for (const element of elements) {
          if (element.tags && element.tags.name) {
            const competitor = {
              id: element.id,
              name: element.tags.name,
              type: element.tags.amenity || element.tags.shop || element.tags.cuisine,
              coordinates: {
                lat: element.lat || element.center?.lat,
                lng: element.lon || element.center?.lon
              },
              address: await this.reverseGeocode(
                element.lat || element.center?.lat,
                element.lon || element.center?.lon
              ),
              tags: element.tags,
              source: 'openstreetmap'
            };

            if (competitor.coordinates.lat && competitor.coordinates.lng) {
              competitor.distance = this.calculateDistance(
                lat, lng,
                competitor.coordinates.lat,
                competitor.coordinates.lng
              );
              competitors.push(competitor);
            }
          }
        }
      }

      return competitors.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('❌ Erro ao buscar concorrentes:', error.message);
      return [];
    }
  }

  /**
   * Busca transporte público próximo
   */
  async searchTransportation(lat, lng, radius) {
    try {
      const busQuery = `
        [out:json][timeout:25];
        (
          node["highway"="bus_stop"](around:${radius},${lat},${lng});
          node["public_transport"="stop_position"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const subwayQuery = `
        [out:json][timeout:25];
        (
          node["railway"="station"](around:${radius},${lat},${lng});
          node["public_transport"="station"]["railway"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const [busResponse, subwayResponse] = await Promise.all([
        axios.post(this.overpassURL, busQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 15000
        }),
        axios.post(this.overpassURL, subwayQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 15000
        })
      ]);

      const busStops = (busResponse.data.elements || []).map(stop => ({
        id: stop.id,
        name: stop.tags?.name || 'Ponto de ônibus',
        type: 'bus_stop',
        coordinates: { lat: stop.lat, lng: stop.lon },
        distance: this.calculateDistance(lat, lng, stop.lat, stop.lon)
      }));

      const subwayStations = (subwayResponse.data.elements || []).map(station => ({
        id: station.id,
        name: station.tags?.name || 'Estação',
        type: 'subway_station',
        coordinates: { lat: station.lat, lng: station.lon },
        distance: this.calculateDistance(lat, lng, station.lat, station.lon)
      }));

      return {
        busStops: busStops.sort((a, b) => a.distance - b.distance).slice(0, 10),
        subwayStations: subwayStations.sort((a, b) => a.distance - b.distance).slice(0, 5)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar transporte público:', error.message);
      return { busStops: [], subwayStations: [] };
    }
  }

  /**
   * Busca amenidades próximas (bancos, escolas, hospitais, etc.)
   */
  async searchAmenities(lat, lng, radius) {
    try {
      const amenityQuery = `
        [out:json][timeout:25];
        (
          node["amenity"~"^(bank|school|hospital|pharmacy|supermarket|shopping|university)$"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const response = await axios.post(this.overpassURL, amenityQuery, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const amenities = (response.data.elements || []).map(amenity => ({
        id: amenity.id,
        name: amenity.tags?.name || amenity.tags?.amenity,
        type: amenity.tags?.amenity,
        coordinates: { lat: amenity.lat, lng: amenity.lon },
        distance: this.calculateDistance(lat, lng, amenity.lat, amenity.lon)
      }));

      return amenities.sort((a, b) => a.distance - b.distance).slice(0, 20);
    } catch (error) {
      console.error('❌ Erro ao buscar amenidades:', error.message);
      return [];
    }
  }

  /**
   * Geocodificação de endereço para coordenadas
   */
  async geocodeAddress(address) {
    const cacheKey = `geocode_${address}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.nominatimURL}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'br'
        },
        timeout: 10000
      });

      if (response.data && response.data.length > 0) {
        const result = {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name,
          boundingBox: response.data[0].boundingbox
        };

        cache.set(cacheKey, result);
        return result;
      }

      throw new Error('Endereço não encontrado');
    } catch (error) {
      console.error('❌ Erro na geocodificação:', error.message);
      throw new Error('Erro ao converter endereço em coordenadas');
    }
  }

  /**
   * Geocodificação reversa (coordenadas para endereço)
   */
  async reverseGeocode(lat, lng) {
    const cacheKey = `reverse_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.nominatimURL}/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          zoom: 18,
          addressdetails: 1
        },
        timeout: 10000
      });

      if (response.data) {
        const address = response.data.address || {};
        const result = [
          address.road,
          address.house_number,
          address.neighbourhood || address.suburb,
          address.city || address.town || address.village,
          address.state
        ].filter(Boolean).join(', ');

        cache.set(cacheKey, result);
        return result;
      }

      return 'Endereço não encontrado';
    } catch (error) {
      console.error('❌ Erro na geocodificação reversa:', error.message);
      return 'Endereço não disponível';
    }
  }

  /**
   * Constrói query Overpass para busca específica
   */
  buildOverpassQuery(lat, lng, radius, tag) {
    return `
      [out:json][timeout:25];
      (
        node[${tag}](around:${radius},${lat},${lng});
        way[${tag}](around:${radius},${lat},${lng});
        relation[${tag}](around:${radius},${lat},${lng});
      );
      out center geom;
    `;
  }

  /**
   * Mapeia tipos de negócio para tags do OpenStreetMap
   */
  getBusinessTags(businessType) {
    const tagMap = {
      'restaurante': ['"amenity"="restaurant"', '"cuisine"'],
      'pizzaria': ['"amenity"="restaurant"', '"cuisine"="pizza"'],
      'lanchonete': ['"amenity"="fast_food"'],
      'cafe': ['"amenity"="cafe"'],
      'bar': ['"amenity"="bar"', '"amenity"="pub"'],
      'salao_beleza': ['"shop"="hairdresser"', '"shop"="beauty"'],
      'barbearia': ['"shop"="hairdresser"'],
      'farmacia': ['"amenity"="pharmacy"'],
      'supermercado': ['"shop"="supermarket"'],
      'padaria': ['"shop"="bakery"'],
      'escola': ['"amenity"="school"'],
      'clinica': ['"amenity"="clinic"', '"amenity"="hospital"'],
      'academia': ['"leisure"="fitness_centre"'],
      'posto_gasolina': ['"amenity"="fuel"'],
      'banco': ['"amenity"="bank"'],
      'hotel': ['"tourism"="hotel"'],
      'shopping': ['"shop"="mall"', '"amenity"="marketplace"']
    };

    return tagMap[businessType.toLowerCase()] || ['"shop"', '"amenity"'];
  }

  /**
   * Calcula distância entre duas coordenadas usando fórmula de Haversine
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const from = turf.point([lng1, lat1]);
    const to = turf.point([lng2, lat2]);
    return turf.distance(from, to, { units: 'meters' });
  }

  /**
   * Analisa densidade de tráfego baseado em vias próximas
   */
  async analyzeTrafficDensity(lat, lng, radius) {
    try {
      const roadQuery = `
        [out:json][timeout:25];
        (
          way["highway"~"^(primary|secondary|tertiary|trunk|motorway)$"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const response = await axios.post(this.overpassURL, roadQuery, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const roads = response.data.elements || [];
      
      // Calcula score baseado no número e tipo de vias
      let trafficScore = 0;
      roads.forEach(road => {
        const highway = road.tags?.highway;
        switch (highway) {
          case 'motorway':
          case 'trunk':
            trafficScore += 10;
            break;
          case 'primary':
            trafficScore += 7;
            break;
          case 'secondary':
            trafficScore += 5;
            break;
          case 'tertiary':
            trafficScore += 3;
            break;
          default:
            trafficScore += 1;
        }
      });

      return {
        score: Math.min(100, trafficScore),
        level: this.getTrafficLevel(trafficScore),
        roadsCount: roads.length,
        mainRoads: roads.slice(0, 5).map(road => ({
          name: road.tags?.name || 'Via sem nome',
          type: road.tags?.highway,
          coordinates: road.geometry || []
        }))
      };
    } catch (error) {
      console.error('❌ Erro ao analisar tráfego:', error.message);
      return { score: 50, level: 'médio', roadsCount: 0, mainRoads: [] };
    }
  }

  /**
   * Determina nível de tráfego baseado no score
   */
  getTrafficLevel(score) {
    if (score >= 50) return 'alto';
    if (score >= 25) return 'médio';
    if (score >= 10) return 'baixo';
    return 'muito_baixo';
  }

  /**
   * Busca áreas comerciais próximas
   */
  async findCommercialAreas(lat, lng, radius) {
    try {
      const commercialQuery = `
        [out:json][timeout:25];
        (
          way["landuse"="commercial"](around:${radius},${lat},${lng});
          way["landuse"="retail"](around:${radius},${lat},${lng});
          relation["landuse"="commercial"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const response = await axios.post(this.overpassURL, commercialQuery, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const areas = response.data.elements || [];
      
      return areas.map(area => ({
        id: area.id,
        name: area.tags?.name || 'Área comercial',
        type: area.tags?.landuse,
        center: area.center || { lat: area.lat, lon: area.lon },
        distance: area.center ? this.calculateDistance(
          lat, lng, area.center.lat, area.center.lon
        ) : 0
      })).sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('❌ Erro ao buscar áreas comerciais:', error.message);
      return [];
    }
  }

  /**
   * Busca POIs complementares para calcular PCS (POI Complementaridade Score)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Raio em metros
   * @returns {Promise<Object>} POIs categorizados
   */
  async findComplementaryPOIs(lat, lng, radius = 1000) {
    const cacheKey = `complementary_pois_${lat}_${lng}_${radius}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('🗺️  POIs complementares obtidos do cache');
      return cached;
    }

    try {
      const query = this.buildPOIQuery(lat, lng, radius);
      
      const response = await axios.post(this.overpassURL, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 20000
      });

      const result = this.parsePOIResponse(response.data);
      cache.set(cacheKey, result);
      
      console.log('🗺️  POIs complementares encontrados:', Object.keys(result).filter(k => result[k].length > 0));
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar POIs complementares:', error.message);
      return this.getMockPOIs();
    }
  }

  /**
   * Calcula POI Complementaridade Score (PCS)
   * Mede presença de POIs que geram tráfego complementar
   * @param {Object} pois - POIs categorizados
   * @returns {Object} Score PCS e análise
   */
  calculatePOIComplementarityScore(pois) {
    let score = 0;
    const analysis = {
      traffic_generators: [],
      complementary_businesses: [],
      accessibility_score: 0,
      foot_traffic_potential: 'BAIXO'
    };

    // Pontuação por categoria de POI
    const poiScores = {
      // Geradores de tráfego alto
      supermarket: 20,
      school: 20,
      hospital: 15,
      bank: 15,
      pharmacy: 15,
      
      // Geradores de tráfego médio
      restaurant: 10,
      cafe: 8,
      shop: 8,
      bus_stop: 12,
      subway_station: 18,
      
      // Geradores de tráfego baixo
      park: 5,
      church: 5,
      post_office: 8,
      atm: 5,
      fuel: 10
    };

    // Calcular score baseado nos POIs encontrados
    Object.keys(pois).forEach(category => {
      const count = pois[category].length;
      if (count > 0 && poiScores[category]) {
        const categoryScore = Math.min(poiScores[category] * count, poiScores[category] * 2); // Máximo 2x o valor base
        score += categoryScore;
        
        analysis.traffic_generators.push({
          type: category,
          count: count,
          score: categoryScore
        });
      }
    });

    // Bônus por diversidade (ter POIs de diferentes categorias)
    const categoriesWithPOIs = Object.keys(pois).filter(cat => pois[cat].length > 0);
    if (categoriesWithPOIs.length >= 5) score += 15;
    else if (categoriesWithPOIs.length >= 3) score += 10;

    // Bônus especial para combinações complementares
    const hasComplementaryCombo = this.checkComplementaryCombinations(pois);
    if (hasComplementaryCombo.length > 0) {
      score += hasComplementaryCombo.length * 8;
      analysis.complementary_businesses = hasComplementaryCombo;
    }

    // Calcular score de acessibilidade
    analysis.accessibility_score = this.calculateAccessibilityScore(pois);
    score += analysis.accessibility_score;

    // Garantir que o score fique entre 0-100
    score = Math.min(100, Math.round(score));

    // Determinar potencial de tráfego
    if (score >= 80) analysis.foot_traffic_potential = 'MUITO ALTO';
    else if (score >= 60) analysis.foot_traffic_potential = 'ALTO';
    else if (score >= 40) analysis.foot_traffic_potential = 'MÉDIO';
    else if (score >= 20) analysis.foot_traffic_potential = 'BAIXO';
    else analysis.foot_traffic_potential = 'MUITO BAIXO';

    return {
      score,
      level: this.getScoreLevel(score),
      analysis
    };
  }

  /**
   * Verifica combinações complementares de negócios
   */
  checkComplementaryCombinations(pois) {
    const combinations = [];
    
    // Combinação: Supermercado + Farmácia + Banco
    if (pois.supermarket?.length > 0 && pois.pharmacy?.length > 0 && pois.bank?.length > 0) {
      combinations.push('Centro Comercial Completo');
    }
    
    // Combinação: Escola + Restaurante/Lanchonete
    if (pois.school?.length > 0 && (pois.restaurant?.length > 0 || pois.cafe?.length > 0)) {
      combinations.push('Zona Escolar Comercial');
    }
    
    // Combinação: Transporte + Comércio
    if ((pois.bus_stop?.length > 0 || pois.subway_station?.length > 0) && pois.shop?.length > 0) {
      combinations.push('Hub de Transporte Comercial');
    }
    
    // Combinação: Hospital + Farmácia
    if (pois.hospital?.length > 0 && pois.pharmacy?.length > 0) {
      combinations.push('Corredor da Saúde');
    }

    return combinations;
  }

  /**
   * Calcula score de acessibilidade baseado em transporte público
   */
  calculateAccessibilityScore(pois) {
    let accessScore = 0;
    
    if (pois.subway_station?.length > 0) accessScore += 20;
    if (pois.bus_stop?.length > 0) accessScore += Math.min(pois.bus_stop.length * 5, 15);
    if (pois.fuel?.length > 0) accessScore += 5; // Posto de gasolina indica acesso rodoviário
    
    return Math.min(accessScore, 25); // Máximo 25 pontos para acessibilidade
  }

  /**
   * Constrói query Overpass para buscar POIs complementares
   */
  buildPOIQuery(lat, lng, radius) {
    return `
      [out:json][timeout:30];
      (
        // Comércio essencial
        node["shop"="supermarket"](around:${radius},${lat},${lng});
        node["shop"="convenience"](around:${radius},${lat},${lng});
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        node["amenity"="bank"](around:${radius},${lat},${lng});
        node["amenity"="atm"](around:${radius},${lat},${lng});
        
        // Serviços públicos
        node["amenity"="school"](around:${radius},${lat},${lng});
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
        node["amenity"="post_office"](around:${radius},${lat},${lng});
        
        // Alimentação
        node["amenity"="restaurant"](around:${radius},${lat},${lng});
        node["amenity"="cafe"](around:${radius},${lat},${lng});
        node["amenity"="fast_food"](around:${radius},${lat},${lng});
        
        // Transporte
        node["highway"="bus_stop"](around:${radius},${lat},${lng});
        node["railway"="subway_entrance"](around:${radius},${lat},${lng});
        node["amenity"="fuel"](around:${radius},${lat},${lng});
        
        // Lazer e outros
        node["leisure"="park"](around:${radius},${lat},${lng});
        node["amenity"="place_of_worship"](around:${radius},${lat},${lng});
        node["shop"](around:${radius},${lat},${lng});
      );
      out geom;
    `;
  }

  /**
   * Processa resposta da API Overpass para POIs
   */
  parsePOIResponse(data) {
    if (!data.elements) return this.getMockPOIs();

    const pois = {
      supermarket: [],
      convenience: [],
      pharmacy: [],
      bank: [],
      atm: [],
      school: [],
      hospital: [],
      clinic: [],
      post_office: [],
      restaurant: [],
      cafe: [],
      fast_food: [],
      bus_stop: [],
      subway_station: [],
      fuel: [],
      park: [],
      church: [],
      shop: []
    };

    data.elements.forEach(element => {
      const poi = {
        id: `osm_poi_${element.id}`,
        name: element.tags?.name || 'POI sem nome',
        location: {
          lat: element.lat,
          lng: element.lon
        },
        tags: element.tags
      };

      // Categorizar POI
      if (element.tags?.shop === 'supermarket') pois.supermarket.push(poi);
      else if (element.tags?.shop === 'convenience') pois.convenience.push(poi);
      else if (element.tags?.amenity === 'pharmacy') pois.pharmacy.push(poi);
      else if (element.tags?.amenity === 'bank') pois.bank.push(poi);
      else if (element.tags?.amenity === 'atm') pois.atm.push(poi);
      else if (element.tags?.amenity === 'school') pois.school.push(poi);
      else if (element.tags?.amenity === 'hospital') pois.hospital.push(poi);
      else if (element.tags?.amenity === 'clinic') pois.clinic.push(poi);
      else if (element.tags?.amenity === 'post_office') pois.post_office.push(poi);
      else if (element.tags?.amenity === 'restaurant') pois.restaurant.push(poi);
      else if (element.tags?.amenity === 'cafe') pois.cafe.push(poi);
      else if (element.tags?.amenity === 'fast_food') pois.fast_food.push(poi);
      else if (element.tags?.highway === 'bus_stop') pois.bus_stop.push(poi);
      else if (element.tags?.railway === 'subway_entrance') pois.subway_station.push(poi);
      else if (element.tags?.amenity === 'fuel') pois.fuel.push(poi);
      else if (element.tags?.leisure === 'park') pois.park.push(poi);
      else if (element.tags?.amenity === 'place_of_worship') pois.church.push(poi);
      else if (element.tags?.shop) pois.shop.push(poi);
    });

    return pois;
  }

  /**
   * Determina nível do score
   */
  getScoreLevel(score) {
    if (score >= 80) return 'EXCELENTE';
    if (score >= 60) return 'BOM';
    if (score >= 40) return 'REGULAR';
    if (score >= 20) return 'RUIM';
    return 'MUITO RUIM';
  }

  /**
   * POIs mock para desenvolvimento
   */
  getMockPOIs() {
    return {
      supermarket: [
        { id: 'poi_1', name: 'Supermercado Central', location: { lat: -23.5500, lng: -46.6330 } }
      ],
      pharmacy: [
        { id: 'poi_2', name: 'Farmácia Popular', location: { lat: -23.5510, lng: -46.6340 } }
      ],
      bank: [
        { id: 'poi_3', name: 'Banco do Brasil', location: { lat: -23.5495, lng: -46.6325 } }
      ],
      school: [
        { id: 'poi_4', name: 'Escola Municipal', location: { lat: -23.5520, lng: -46.6350 } }
      ],
      bus_stop: [
        { id: 'poi_5', name: 'Ponto de Ônibus Central', location: { lat: -23.5505, lng: -46.6335 } },
        { id: 'poi_6', name: 'Ponto Rua Principal', location: { lat: -23.5515, lng: -46.6345 } }
      ],
      restaurant: [
        { id: 'poi_7', name: 'Restaurante Bom Sabor', location: { lat: -23.5508, lng: -46.6338 } }
      ],
      convenience: [],
      atm: [],
      hospital: [],
      clinic: [],
      post_office: [],
      cafe: [],
      fast_food: [],
      subway_station: [],
      fuel: [],
      park: [],
      church: [],
      shop: []
    };
  }
}

module.exports = new OpenStreetMapService();
