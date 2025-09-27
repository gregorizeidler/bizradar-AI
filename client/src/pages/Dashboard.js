import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useAnalysis } from '../contexts/AnalysisContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDashboardStats, getRecentAnalyses, pollAnalysisStatus } = useAnalysis();
  
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResult] = await Promise.all([
        getDashboardStats(),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
        setRecentAnalyses(statsResult.data.recentAnalyses || []);
        
        // Inicia polling para análises em processamento
        const processingAnalyses = statsResult.data.recentAnalyses?.filter(
          analysis => analysis.status === 'processing'
        ) || [];
        
        processingAnalyses.forEach(analysis => {
          pollAnalysisStatus(analysis.id, (updatedAnalysis) => {
            setRecentAnalyses(prev => 
              prev.map(a => a.id === analysis.id ? updatedAnalysis : a)
            );
          });
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'processing':
        return <ScheduleIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    if (score >= 40) return '#f56565';
    return '#e53e3e';
  };

  // Dados para gráficos
  const businessTypeData = stats?.analysesByType?.map(item => ({
    name: item.businessType,
    count: item.count,
  })) || [];

  const scoreDistributionData = [
    { name: 'Excelente (80-100)', value: 0, color: '#48bb78' },
    { name: 'Bom (60-79)', value: 0, color: '#ed8936' },
    { name: 'Regular (40-59)', value: 0, color: '#f56565' },
    { name: 'Ruim (0-39)', value: 0, color: '#e53e3e' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Carregando Dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo de volta, {user?.name}! Aqui está um resumo das suas análises.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total de Análises
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.stats?.total || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'primary.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <AnalyticsIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Concluídas
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.stats?.completed || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'success.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <CheckCircleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Score Médio
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.stats?.averageScore || '--'}
                      {stats?.stats?.averageScore && '%'}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'info.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Análises Restantes
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.userLimits?.remainingAnalyses || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'warning.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <StarIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Analyses */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Análises Recentes
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/history')}
                  >
                    Ver Todas
                  </Button>
                </Box>
                
                {recentAnalyses.length > 0 ? (
                  <List>
                    {recentAnalyses.map((analysis, index) => (
                      <React.Fragment key={analysis.id}>
                        <ListItem
                          sx={{
                            px: 0,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              borderRadius: 1,
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: 'primary.light' }}>
                              {getStatusIcon(analysis.status)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {analysis.businessType}
                                </Typography>
                                <Chip
                                  label={analysis.status === 'processing' ? 'Processando' : 
                                         analysis.status === 'completed' ? 'Concluída' : 'Erro'}
                                  color={getStatusColor(analysis.status)}
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {analysis.address}
                                </Typography>
                                {analysis.finalScore && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                      Score:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      sx={{ color: getScoreColor(analysis.finalScore) }}
                                    >
                                      {analysis.finalScore}%
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                          {analysis.status === 'completed' && (
                            <Tooltip title="Ver Análise">
                              <IconButton
                                onClick={() => navigate(`/analysis/${analysis.id}`)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </ListItem>
                        {index < recentAnalyses.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AnalyticsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Nenhuma análise ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Crie sua primeira análise para começar
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/analysis/new')}
                    >
                      Nova Análise
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions & Charts */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Ações Rápidas
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/analysis/new')}
                        disabled={!stats?.userLimits?.canPerformAnalysis}
                      >
                        Nova Análise
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/history')}
                      >
                        Ver Histórico
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/profile')}
                      >
                        Meu Perfil
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Business Types Chart */}
            {businessTypeData.length > 0 && (
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Tipos de Negócio
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={businessTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#667eea" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )}

            {/* Plan Info */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card
                  sx={{
                    background: user?.plan === 'pro' 
                      ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
                      : user?.plan === 'enterprise'
                      ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Plano {user?.plan?.toUpperCase() || 'INDIVIDUAL'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                      {stats?.userLimits?.remainingAnalyses === 'Ilimitado' 
                        ? 'Análises ilimitadas'
                        : `${stats?.userLimits?.remainingAnalyses} análises restantes`
                      }
                    </Typography>
                    {user?.plan === 'individual' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/profile')}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        Fazer Upgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
