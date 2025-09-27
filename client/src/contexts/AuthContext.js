import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configura interceptor do axios para incluir token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verifica se usuário está logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      
      toast.success('Conta criada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar conta';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logout realizado com sucesso!');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      
      setUser(response.data.user);
      toast.success('Perfil atualizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao atualizar perfil';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/password', {
        currentPassword,
        newPassword,
      });
      
      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao alterar senha';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      const { token: newToken } = response.data;
      
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return { success: true };
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      logout();
      return { success: false };
    }
  };

  const upgradeSubscription = async (newPlan) => {
    try {
      const response = await axios.put('/api/user/subscription/upgrade', {
        newPlan,
      });
      
      // Atualiza dados do usuário
      const userResponse = await axios.get('/api/auth/me');
      setUser(userResponse.data.user);
      
      toast.success(`Plano atualizado para ${newPlan} com sucesso!`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer upgrade';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getSubscriptionInfo = async () => {
    try {
      const response = await axios.get('/api/user/subscription');
      return { success: true, data: response.data.subscription };
    } catch (error) {
      console.error('Erro ao buscar informações da assinatura:', error);
      return { success: false, error: error.response?.data?.error };
    }
  };

  const canPerformAnalysis = () => {
    if (!user) return false;
    
    const { plan, subscription } = user;
    
    // Planos PRO e Enterprise têm análises ilimitadas
    if (plan === 'pro' || plan === 'enterprise') {
      return true;
    }
    
    // Verifica limite para plano individual
    return subscription.analysisCount < subscription.analysisLimit;
  };

  const getRemainingAnalyses = () => {
    if (!user) return 0;
    
    const { plan, subscription } = user;
    
    if (plan === 'pro' || plan === 'enterprise') {
      return 'Ilimitado';
    }
    
    return Math.max(0, subscription.analysisLimit - subscription.analysisCount);
  };

  const isSubscriptionActive = () => {
    if (!user) return false;
    
    const { subscription } = user;
    
    // Verifica status
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return false;
    }
    
    // Verifica data de expiração
    if (subscription.endDate && new Date() > new Date(subscription.endDate)) {
      return false;
    }
    
    return true;
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    upgradeSubscription,
    getSubscriptionInfo,
    canPerformAnalysis,
    getRemainingAnalyses,
    isSubscriptionActive,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
