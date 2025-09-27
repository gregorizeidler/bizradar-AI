const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class VisionAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.visionPrompt = `
    Você é um especialista em análise comercial visual. Analise esta imagem de uma localização comercial e forneça insights detalhados sobre:

    ANÁLISE VISUAL:
    1. 🏪 ESTABELECIMENTOS VISÍVEIS
       - Tipos de negócios identificados
       - Estado de conservação
       - Nível de movimento aparente
    
    2. 🚶 FLUXO DE PESSOAS
       - Densidade de pedestres
       - Perfil demográfico aparente
       - Horário provável (manhã/tarde/noite)
    
    3. 🏗️ INFRAESTRUTURA
       - Qualidade das vias
       - Sinalização comercial
       - Acessibilidade
       - Estacionamento
    
    4. 🎯 OPORTUNIDADES COMERCIAIS
       - Gaps de mercado visíveis
       - Tipos de negócio que funcionariam
       - Pontos fortes da localização
    
    5. ⚠️ RISCOS E DESAFIOS
       - Problemas aparentes
       - Concorrência direta
       - Limitações da localização
    
    FORMATO DE RESPOSTA:
    - Use emojis para destacar pontos
    - Seja específico e objetivo
    - Forneça score visual (0-100)
    - Sugira próximos passos
    `;
  }

  /**
   * Configura upload de imagens
   */
  configureImageUpload() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/vision');
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `vision_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.'));
        }
      }
    });
  }

  /**
   * Analisa imagem usando OpenAI Vision
   */
  async analyzeImage(imagePath, additionalContext = {}) {
    try {
      console.log(`📸 Analisando imagem: ${imagePath}`);

      if (!this.openai.apiKey) {
        return this.getMockVisionAnalysis(imagePath, additionalContext);
      }

      // Converter imagem para base64
      const imageBase64 = await this.imageToBase64(imagePath);
      
      // Construir prompt contextual
      const contextualPrompt = this.buildVisionPrompt(additionalContext);
      
      // Analisar com OpenAI Vision
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: contextualPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      });

      const analysis = response.choices[0].message.content;
      
      // Extrair score e insights estruturados
      const structuredAnalysis = this.parseVisionAnalysis(analysis);
      
      // Limpar arquivo temporário
      await this.cleanupTempFile(imagePath);
      
      return {
        ...structuredAnalysis,
        rawAnalysis: analysis,
        timestamp: new Date(),
        imageProcessed: true
      };

    } catch (error) {
      console.error('❌ Erro na análise de visão:', error.message);
      await this.cleanupTempFile(imagePath);
      return this.getMockVisionAnalysis(imagePath, additionalContext);
    }
  }

  /**
   * Converte imagem para base64
   */
  async imageToBase64(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      throw new Error(`Erro ao processar imagem: ${error.message}`);
    }
  }

  /**
   * Constrói prompt contextual para análise
   */
  buildVisionPrompt(context) {
    let prompt = this.visionPrompt;
    
    if (context.businessType) {
      prompt += `\nTIPO DE NEGÓCIO PRETENDIDO: ${context.businessType}`;
    }
    
    if (context.location) {
      prompt += `\nLOCALIZAÇÃO: ${context.location}`;
    }
    
    if (context.timeOfDay) {
      prompt += `\nHORÁRIO DA FOTO: ${context.timeOfDay}`;
    }
    
    prompt += `\n\nForneça uma análise detalhada e um score visual de 0-100 para esta localização.`;
    
    return prompt;
  }

  /**
   * Extrai dados estruturados da análise
   */
  parseVisionAnalysis(analysis) {
    // Extrair score (procura por números seguidos de % ou /100)
    const scoreMatch = analysis.match(/(\d+)(?:%|\/100)/);
    const visualScore = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    
    // Extrair estabelecimentos mencionados
    const businessTypes = this.extractBusinessTypes(analysis);
    
    // Extrair nível de movimento
    const trafficLevel = this.extractTrafficLevel(analysis);
    
    // Extrair oportunidades
    const opportunities = this.extractOpportunities(analysis);
    
    // Extrair riscos
    const risks = this.extractRisks(analysis);
    
    return {
      visualScore,
      level: this.getScoreLevel(visualScore),
      businessTypes,
      trafficLevel,
      opportunities,
      risks,
      insights: this.generateVisualInsights(visualScore, businessTypes, trafficLevel)
    };
  }

  /**
   * Extrai tipos de negócio da análise
   */
  extractBusinessTypes(analysis) {
    const businessKeywords = [
      'restaurante', 'lanchonete', 'padaria', 'farmácia', 'supermercado',
      'loja', 'salão', 'barbearia', 'academia', 'escola', 'banco',
      'posto', 'hotel', 'bar', 'café', 'mercado'
    ];
    
    const found = [];
    const lowerAnalysis = analysis.toLowerCase();
    
    businessKeywords.forEach(keyword => {
      if (lowerAnalysis.includes(keyword)) {
        found.push(keyword);
      }
    });
    
    return found;
  }

  /**
   * Extrai nível de tráfego da análise
   */
  extractTrafficLevel(analysis) {
    const lowerAnalysis = analysis.toLowerCase();
    
    if (lowerAnalysis.includes('muito movimento') || lowerAnalysis.includes('alta densidade')) {
      return 'ALTO';
    }
    if (lowerAnalysis.includes('pouco movimento') || lowerAnalysis.includes('baixa densidade')) {
      return 'BAIXO';
    }
    if (lowerAnalysis.includes('movimento moderado') || lowerAnalysis.includes('média densidade')) {
      return 'MÉDIO';
    }
    
    return 'MÉDIO'; // Default
  }

  /**
   * Extrai oportunidades da análise
   */
  extractOpportunities(analysis) {
    const opportunities = [];
    const lowerAnalysis = analysis.toLowerCase();
    
    if (lowerAnalysis.includes('gap') || lowerAnalysis.includes('oportunidade')) {
      opportunities.push('Gap de mercado identificado');
    }
    if (lowerAnalysis.includes('movimento') || lowerAnalysis.includes('fluxo')) {
      opportunities.push('Bom fluxo de pessoas');
    }
    if (lowerAnalysis.includes('infraestrutura') || lowerAnalysis.includes('acesso')) {
      opportunities.push('Infraestrutura adequada');
    }
    
    return opportunities;
  }

  /**
   * Extrai riscos da análise
   */
  extractRisks(analysis) {
    const risks = [];
    const lowerAnalysis = analysis.toLowerCase();
    
    if (lowerAnalysis.includes('concorrência') || lowerAnalysis.includes('competição')) {
      risks.push('Alta concorrência visível');
    }
    if (lowerAnalysis.includes('problema') || lowerAnalysis.includes('dificuldade')) {
      risks.push('Problemas de infraestrutura');
    }
    if (lowerAnalysis.includes('pouco movimento') || lowerAnalysis.includes('isolado')) {
      risks.push('Baixo fluxo de pessoas');
    }
    
    return risks;
  }

  /**
   * Gera insights baseados na análise visual
   */
  generateVisualInsights(score, businessTypes, trafficLevel) {
    const insights = [];
    
    if (score >= 80) {
      insights.push({
        type: 'opportunity',
        title: 'Localização Excelente',
        description: 'Análise visual indica alta viabilidade comercial',
        priority: 'high'
      });
    }
    
    if (trafficLevel === 'ALTO') {
      insights.push({
        type: 'opportunity',
        title: 'Alto Fluxo de Pessoas',
        description: 'Movimento intenso detectado na imagem',
        priority: 'high'
      });
    }
    
    if (businessTypes.length > 3) {
      insights.push({
        type: 'warning',
        title: 'Área Comercial Saturada',
        description: `${businessTypes.length} tipos de negócio identificados`,
        priority: 'medium'
      });
    }
    
    return insights;
  }

  /**
   * Determina nível do score
   */
  getScoreLevel(score) {
    if (score >= 80) return 'EXCELENTE';
    if (score >= 60) return 'BOM';
    if (score >= 40) return 'REGULAR';
    return 'RUIM';
  }

  /**
   * Análise mock quando Vision API não disponível
   */
  getMockVisionAnalysis(imagePath, context) {
    return {
      visualScore: 75,
      level: 'BOM',
      businessTypes: ['restaurante', 'loja', 'farmácia'],
      trafficLevel: 'MÉDIO',
      opportunities: [
        'Boa infraestrutura viária',
        'Diversidade comercial',
        'Movimento de pedestres'
      ],
      risks: [
        'Concorrência estabelecida',
        'Necessidade de diferenciação'
      ],
      insights: [
        {
          type: 'opportunity',
          title: 'Análise Visual Positiva',
          description: 'Localização apresenta características favoráveis',
          priority: 'medium'
        }
      ],
      rawAnalysis: `📸 **Análise Visual da Localização**

🏪 **Estabelecimentos Identificados:**
- Restaurantes e lanchonetes
- Lojas de variedades
- Farmácia
- Outros comércios locais

🚶 **Fluxo de Pessoas:** MÉDIO
- Movimento constante de pedestres
- Perfil diversificado de público
- Horário comercial ativo

🏗️ **Infraestrutura:**
- Vias em bom estado
- Sinalização adequada
- Acessibilidade razoável

🎯 **Score Visual: 75/100**

💡 **Recomendações:**
- Localização viável para negócios
- Considere diferenciação da concorrência
- Analise horários de pico`,
      timestamp: new Date(),
      imageProcessed: false // Mock
    };
  }

  /**
   * Remove arquivo temporário
   */
  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ Arquivo temporário removido: ${filePath}`);
    } catch (error) {
      console.error('❌ Erro ao remover arquivo temporário:', error.message);
    }
  }

  /**
   * Analisa múltiplas imagens (para comparação)
   */
  async analyzeMultipleImages(imagePaths, context = {}) {
    const analyses = [];
    
    for (const imagePath of imagePaths) {
      const analysis = await this.analyzeImage(imagePath, {
        ...context,
        isComparison: true,
        imageIndex: analyses.length + 1
      });
      analyses.push(analysis);
    }
    
    // Gerar comparativo
    const comparison = this.generateComparison(analyses);
    
    return {
      individual: analyses,
      comparison,
      bestOption: this.findBestOption(analyses),
      timestamp: new Date()
    };
  }

  /**
   * Gera comparativo entre múltiplas análises
   */
  generateComparison(analyses) {
    const scores = analyses.map(a => a.visualScore);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      averageScore: Math.round(avgScore),
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      recommendation: avgScore >= 70 ? 
        'Localização com bom potencial visual' : 
        'Considere outras opções de localização'
    };
  }

  /**
   * Encontra melhor opção entre as análises
   */
  findBestOption(analyses) {
    return analyses.reduce((best, current) => 
      current.visualScore > best.visualScore ? current : best
    );
  }
}

module.exports = new VisionAnalysisService();
