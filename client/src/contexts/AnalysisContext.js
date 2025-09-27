import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis deve ser usado dentro de um AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [analyses, setAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Criar nova análise
  const createAnalysis = async (analysisData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/analysis', analysisData);
      
      const newAnalysis = {
        id: response.data.analysisId,
        status: 'processing',
        ...analysisData,
        createdAt: new Date().toISOString(),
      };
      
      setAnalyses(prev => [newAnalysis, ...prev]);
      setCurrentAnalysis(newAnalysis);
      
      toast.success('Análise iniciada com sucesso!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar análise';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Buscar análise específica
  const getAnalysis = async (analysisId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analysis/${analysisId}`);
      
      setCurrentAnalysis(response.data.analysis);
      return { success: true, data: response.data.analysis };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao buscar análise';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Listar análises do usuário
  const getAnalyses = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/analysis?${params}`);
      
      setAnalyses(response.data.analyses);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao buscar análises';
      console.error('Erro ao buscar análises:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Deletar análise
  const deleteAnalysis = async (analysisId) => {
    try {
      await axios.delete(`/api/analysis/${analysisId}`);
      
      setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
      
      if (currentAnalysis?.id === analysisId) {
        setCurrentAnalysis(null);
      }
      
      toast.success('Análise deletada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao deletar análise';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Exportar análise
  const exportAnalysis = async (analysisId, format = 'json') => {
    try {
      const response = await axios.get(`/api/analysis/${analysisId}/export?format=${format}`);
      
      // Cria download do arquivo
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise-${analysisId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Análise exportada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao exportar análise';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Buscar estatísticas do dashboard
  const getDashboardStats = async () => {
    try {
      const response = await axios.get('/api/analysis/stats/dashboard');
      
      setDashboardStats(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Polling para verificar status de análises em processamento
  const pollAnalysisStatus = useCallback(async (analysisId, onUpdate) => {
    const poll = async () => {
      try {
        const response = await axios.get(`/api/analysis/${analysisId}`);
        const analysis = response.data.analysis;
        
        if (onUpdate) {
          onUpdate(analysis);
        }
        
        // Atualiza análise atual se for a mesma
        if (currentAnalysis?.id === analysisId) {
          setCurrentAnalysis(analysis);
        }
        
        // Atualiza na lista
        setAnalyses(prev => 
          prev.map(a => a.id === analysisId ? { ...a, ...analysis } : a)
        );
        
        // Continua polling se ainda está processando
        if (analysis.status === 'processing') {
          setTimeout(poll, 3000); // Verifica a cada 3 segundos
        } else if (analysis.status === 'completed') {
          toast.success('Análise concluída!');
        } else if (analysis.status === 'error') {
          toast.error('Erro no processamento da análise');
        }
      } catch (error) {
        console.error('Erro no polling:', error);
        // Para o polling em caso de erro
      }
    };
    
    poll();
  }, [currentAnalysis]);

  // Buscar estatísticas de uso
  const getUsageStats = async (period = '30') => {
    try {
      const response = await axios.get(`/api/user/usage?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de uso:', error);
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Limpar análise atual
  const clearCurrentAnalysis = () => {
    setCurrentAnalysis(null);
  };

  // Atualizar análise na lista
  const updateAnalysisInList = (analysisId, updates) => {
    setAnalyses(prev => 
      prev.map(analysis => 
        analysis.id === analysisId 
          ? { ...analysis, ...updates }
          : analysis
      )
    );
  };

  // Filtrar análises por status
  const getAnalysesByStatus = (status) => {
    return analyses.filter(analysis => analysis.status === status);
  };

  // Obter análises recentes
  const getRecentAnalyses = (limit = 5) => {
    return analyses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  // Calcular estatísticas básicas
  const getBasicStats = () => {
    const total = analyses.length;
    const completed = analyses.filter(a => a.status === 'completed').length;
    const processing = analyses.filter(a => a.status === 'processing').length;
    const errors = analyses.filter(a => a.status === 'error').length;
    
    const completedAnalyses = analyses.filter(a => a.status === 'completed' && a.finalScore);
    const averageScore = completedAnalyses.length > 0
      ? Math.round(completedAnalyses.reduce((sum, a) => sum + a.finalScore, 0) / completedAnalyses.length)
      : null;
    
    return {
      total,
      completed,
      processing,
      errors,
      averageScore,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const value = {
    // State
    analyses,
    currentAnalysis,
    loading,
    dashboardStats,
    
    // Actions
    createAnalysis,
    getAnalysis,
    getAnalyses,
    deleteAnalysis,
    exportAnalysis,
    getDashboardStats,
    pollAnalysisStatus,
    getUsageStats,
    clearCurrentAnalysis,
    updateAnalysisInList,
    
    // Helpers
    getAnalysesByStatus,
    getRecentAnalyses,
    getBasicStats,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};
