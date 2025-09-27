const OpenAI = require('openai');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const scoreService = require('./scoreService');
const googlePlacesService = require('./googlePlacesService');
const openStreetMapService = require('./openStreetMapService');

class AIAssistantService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.systemPrompt = `
    Você é o BizRadar AI Assistant, especialista em análise de negócios e localização comercial.
    
    EXPERTISE:
    - Análise de viabilidade comercial
    - Interpretação de scores CRI e PCS
    - Estratégias de posicionamento
    - Análise demográfica e geoespacial
    - Recomendações de localização
    
    DADOS DISPONÍVEIS:
    - CRI (Competitor Rating Index): Qualidade dos concorrentes
    - PCS (POI Complementarity Score): Sinergia com pontos de interesse
    - Demografia: População, renda, educação
    - Concorrentes: Formais (Receita Federal) e informais (OpenStreetMap)
    - Ratings: Google Places com avaliações reais
    
    ESTILO DE RESPOSTA:
    - Profissional mas acessível
    - Baseado em dados concretos
    - Insights acionáveis
    - Explicações didáticas
    - Sugestões práticas
    
    FORMATO:
    - Use emojis para destacar pontos importantes
    - Estruture respostas em tópicos quando apropriado
    - Cite dados específicos (scores, percentuais)
    - Ofereça próximos passos claros
    `;
  }

  /**
   * Processa query do usuário e gera resposta contextual
   */
  async processQuery(userId, message, context = {}) {
    try {
      console.log(`🤖 Processando query do usuário ${userId}: "${message}"`);

      // Buscar contexto do usuário
      const userContext = await this.getUserContext(userId);
      
      // Determinar tipo de query
      const queryType = this.classifyQuery(message);
      
      // Buscar dados relevantes
      const relevantData = await this.gatherRelevantData(userId, message, queryType, context);
      
      // Construir prompt contextual
      const contextualPrompt = this.buildContextualPrompt(message, userContext, relevantData, queryType);
      
      // Gerar resposta com OpenAI
      const response = await this.generateAIResponse(contextualPrompt);
      
      // Extrair ações sugeridas
      const suggestions = this.extractActionSuggestions(response, queryType);
      
      // Salvar interação
      await this.saveInteraction(userId, message, response, queryType);
      
      return {
        response,
        suggestions,
        queryType,
        relevantData: this.sanitizeDataForResponse(relevantData),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Erro no AI Assistant:', error.message);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Classifica o tipo de query do usuário
   */
  classifyQuery(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cri') || lowerMessage.includes('concorrente') || lowerMessage.includes('rating')) {
      return 'competitor_analysis';
    }
    if (lowerMessage.includes('pcs') || lowerMessage.includes('poi') || lowerMessage.includes('tráfego')) {
      return 'location_analysis';
    }
    if (lowerMessage.includes('melhor localização') || lowerMessage.includes('onde abrir')) {
      return 'location_recommendation';
    }
    if (lowerMessage.includes('score') || lowerMessage.includes('análise')) {
      return 'score_interpretation';
    }
    if (lowerMessage.includes('estratégia') || lowerMessage.includes('como competir')) {
      return 'strategy_advice';
    }
    if (lowerMessage.includes('tipo de negócio') || lowerMessage.includes('que negócio')) {
      return 'business_suggestion';
    }
    
    return 'general_inquiry';
  }

  /**
   * Busca contexto do usuário
   */
  async getUserContext(userId) {
    try {
      const user = await User.findById(userId);
      const recentAnalyses = await Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return {
        user: {
          plan: user?.plan || 'basic',
          analysisCount: user?.subscription?.analysisCount || 0
        },
        recentAnalyses: recentAnalyses.map(analysis => ({
          id: analysis._id,
          businessType: analysis.businessType,
          location: analysis.location.address,
          scores: analysis.scores,
          createdAt: analysis.createdAt
        }))
      };
    } catch (error) {
      console.error('❌ Erro ao buscar contexto do usuário:', error.message);
      return { user: {}, recentAnalyses: [] };
    }
  }

  /**
   * Coleta dados relevantes baseados na query
   */
  async gatherRelevantData(userId, message, queryType, context) {
    const data = {};

    try {
      // Se há análise específica no contexto
      if (context.analysisId) {
        const analysis = await Analysis.findById(context.analysisId);
        if (analysis) {
          data.currentAnalysis = analysis;
        }
      }

      // Para recomendações de localização
      if (queryType === 'location_recommendation' && context.coordinates) {
        const { lat, lng } = context.coordinates;
        data.locationData = {
          coordinates: { lat, lng },
          pois: await openStreetMapService.findComplementaryPOIs(lat, lng, 1000),
          competitors: await googlePlacesService.findNearbyCompetitors(lat, lng, 'restaurant', 1000)
        };
      }

      // Análises recentes do usuário
      data.userHistory = await Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

    } catch (error) {
      console.error('❌ Erro ao coletar dados relevantes:', error.message);
    }

    return data;
  }

  /**
   * Constrói prompt contextual para OpenAI
   */
  buildContextualPrompt(message, userContext, relevantData, queryType) {
    let prompt = `PERGUNTA DO USUÁRIO: "${message}"\n\n`;
    
    prompt += `TIPO DE CONSULTA: ${queryType}\n\n`;
    
    // Contexto do usuário
    if (userContext.user.plan) {
      prompt += `PLANO DO USUÁRIO: ${userContext.user.plan}\n`;
    }
    
    // Análises recentes
    if (userContext.recentAnalyses.length > 0) {
      prompt += `ANÁLISES RECENTES:\n`;
      userContext.recentAnalyses.forEach((analysis, index) => {
        prompt += `${index + 1}. ${analysis.businessType} em ${analysis.location}\n`;
        if (analysis.scores.final) {
          prompt += `   Score Final: ${analysis.scores.final.value}%\n`;
        }
        if (analysis.scores.competitorRating) {
          prompt += `   CRI: ${analysis.scores.competitorRating.score}\n`;
        }
        if (analysis.scores.poiComplementarity) {
          prompt += `   PCS: ${analysis.scores.poiComplementarity.score}\n`;
        }
      });
      prompt += `\n`;
    }
    
    // Análise atual se disponível
    if (relevantData.currentAnalysis) {
      const analysis = relevantData.currentAnalysis;
      prompt += `ANÁLISE ATUAL:\n`;
      prompt += `Negócio: ${analysis.businessType}\n`;
      prompt += `Localização: ${analysis.location.address}\n`;
      prompt += `Score Final: ${analysis.scores.final?.value || 'N/A'}%\n`;
      prompt += `CRI: ${analysis.scores.competitorRating?.score || 'N/A'}\n`;
      prompt += `PCS: ${analysis.scores.poiComplementarity?.score || 'N/A'}\n`;
      
      if (analysis.scores.competitorRating?.analysis) {
        const cri = analysis.scores.competitorRating.analysis;
        prompt += `Concorrentes: ${cri.total_competitors} (rating médio: ${cri.avg_rating})\n`;
      }
      
      if (analysis.scores.poiComplementarity?.analysis) {
        const pcs = analysis.scores.poiComplementarity.analysis;
        prompt += `Potencial de tráfego: ${pcs.foot_traffic_potential}\n`;
        if (pcs.complementary_businesses.length > 0) {
          prompt += `Sinergias: ${pcs.complementary_businesses.join(', ')}\n`;
        }
      }
      prompt += `\n`;
    }
    
    prompt += `INSTRUÇÕES:\n`;
    prompt += `- Responda de forma clara e acionável\n`;
    prompt += `- Use dados específicos quando disponíveis\n`;
    prompt += `- Ofereça insights práticos\n`;
    prompt += `- Sugira próximos passos\n`;
    prompt += `- Mantenha tom profissional mas acessível\n`;
    
    return prompt;
  }

  /**
   * Gera resposta usando OpenAI
   */
  async generateAIResponse(prompt) {
    if (!this.openai.apiKey) {
      return this.getMockAIResponse(prompt);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Erro na API OpenAI:', error.message);
      return this.getMockAIResponse(prompt);
    }
  }

  /**
   * Resposta mock quando OpenAI não disponível
   */
  getMockAIResponse(prompt) {
    if (prompt.includes('CRI') || prompt.includes('concorrente')) {
      return `🏆 **Análise de Concorrência (CRI)**

Com base nos dados disponíveis, vejo que você está analisando a competição na região. O CRI (Competitor Rating Index) considera:

📊 **Fatores Principais:**
- Quantidade de concorrentes
- Rating médio dos estabelecimentos
- Número de avaliações
- Nível de preços

💡 **Recomendações:**
- Se o CRI está alto (80+): Ótima oportunidade, concorrentes fracos
- Se o CRI está baixo (40-): Mercado saturado, considere diferenciação
- Analise os reviews dos concorrentes para identificar gaps

🎯 **Próximos Passos:**
1. Verifique o PCS para confirmar potencial de tráfego
2. Analise reviews negativos dos concorrentes
3. Considere estratégias de diferenciação`;
    }

    if (prompt.includes('PCS') || prompt.includes('tráfego')) {
      return `🗺️ **Análise de Localização (PCS)**

O PCS (POI Complementarity Score) avalia a sinergia da localização:

🎯 **Geradores de Tráfego:**
- Supermercados e escolas: Alto impacto
- Transporte público: Facilita acesso
- Serviços complementares: Cria sinergia

📈 **Interpretação:**
- PCS 80+: Excelente potencial de tráfego
- PCS 60-79: Bom fluxo de pessoas
- PCS <40: Localização isolada

💡 **Dicas:**
- Busque "centros comerciais completos"
- Proximidade com escolas é valiosa
- Transporte público aumenta alcance`;
    }

    return `🤖 **Assistente BizRadar AI**

Olá! Estou aqui para ajudar com sua análise de negócios. 

📊 **Posso ajudar com:**
- Interpretação de scores CRI e PCS
- Análise de concorrência
- Recomendações de localização
- Estratégias de posicionamento

💡 **Para uma resposta mais precisa, me conte:**
- Que tipo de negócio você quer abrir?
- Qual região está considerando?
- Tem alguma análise específica em mente?

🚀 **Vamos encontrar a melhor oportunidade para seu negócio!**`;
  }

  /**
   * Extrai sugestões de ação da resposta
   */
  extractActionSuggestions(response, queryType) {
    const suggestions = [];

    // Sugestões baseadas no tipo de query
    switch (queryType) {
      case 'competitor_analysis':
        suggestions.push({
          action: 'analyze_competitors',
          title: 'Analisar Concorrentes Detalhadamente',
          description: 'Ver perfil completo dos concorrentes principais'
        });
        break;
        
      case 'location_recommendation':
        suggestions.push({
          action: 'new_analysis',
          title: 'Fazer Nova Análise',
          description: 'Analisar localização específica com CRI e PCS'
        });
        break;
        
      case 'strategy_advice':
        suggestions.push({
          action: 'view_insights',
          title: 'Ver Insights Detalhados',
          description: 'Acessar recomendações estratégicas completas'
        });
        break;
    }

    // Sugestões gerais sempre disponíveis
    suggestions.push({
      action: 'export_analysis',
      title: 'Exportar Relatório',
      description: 'Baixar análise completa em PDF'
    });

    return suggestions;
  }

  /**
   * Salva interação para histórico
   */
  async saveInteraction(userId, query, response, queryType) {
    try {
      // Aqui você pode salvar no banco se quiser histórico de conversas
      console.log(`💾 Salvando interação: ${userId} - ${queryType}`);
    } catch (error) {
      console.error('❌ Erro ao salvar interação:', error.message);
    }
  }

  /**
   * Sanitiza dados para resposta
   */
  sanitizeDataForResponse(data) {
    // Remove dados sensíveis e limita tamanho da resposta
    return {
      hasCurrentAnalysis: !!data.currentAnalysis,
      hasLocationData: !!data.locationData,
      userHistoryCount: data.userHistory?.length || 0
    };
  }

  /**
   * Resposta de fallback em caso de erro
   */
  getFallbackResponse(message) {
    return {
      response: `🤖 Desculpe, estou com dificuldades técnicas no momento. 

📞 **Enquanto isso, posso sugerir:**
- Verificar suas análises recentes no dashboard
- Explorar o mapa interativo
- Consultar os insights automáticos

🔄 **Tente novamente em alguns instantes!**`,
      suggestions: [
        {
          action: 'view_dashboard',
          title: 'Ver Dashboard',
          description: 'Acessar painel principal'
        }
      ],
      queryType: 'error',
      relevantData: {},
      timestamp: new Date()
    };
  }

  /**
   * Análise de sentimento da query (para métricas)
   */
  analyzeSentiment(message) {
    const positiveWords = ['bom', 'ótimo', 'excelente', 'perfeito', 'sucesso'];
    const negativeWords = ['ruim', 'péssimo', 'problema', 'dificuldade', 'preocupado'];
    
    const lowerMessage = message.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
    const hasNegative = negativeWords.some(word => lowerMessage.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }
}

module.exports = new AIAssistantService();
