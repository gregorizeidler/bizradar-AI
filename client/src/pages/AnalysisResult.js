import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useAnalysis } from '../contexts/AnalysisContext';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AnalysisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAnalysis, exportAnalysis, pollAnalysisStatus } = useAnalysis();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const result = await getAnalysis(id);
      
      if (result.success) {
        setAnalysis(result.data);
        
        // Se ainda está processando, inicia polling
        if (result.data.status === 'processing') {
          pollAnalysisStatus(id, (updatedAnalysis) => {
            setAnalysis(updatedAnalysis);
          });
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao carregar análise');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const result = await exportAnalysis(id);
    if (!result.success) {
      setError('Erro ao exportar análise');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'error';
    return 'error';
  };

  const getScoreColorHex = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    if (score >= 40) return '#f56565';
    return '#e53e3e';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'opportunity':
        return <CheckCircleIcon color="success" />;
      case 'suggestion':
        return <LightbulbIcon color="info" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Carregando análise...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Análise não encontrada
        </Alert>
      </Box>
    );
  }

  // Se ainda está processando
  if (analysis.status === 'processing') {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={80} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Processando Análise
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Estamos analisando os dados da sua localização.
              Isso pode levar alguns minutos.
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Buscando concorrentes, dados demográficos e calculando scores...
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={loadAnalysis}
                startIcon={<RefreshIcon />}
              >
                Atualizar Status
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Se houve erro no processamento
  if (analysis.status === 'error') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro no processamento da análise: {analysis.errorMessage}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/analysis/new')}>
          Nova Análise
        </Button>
      </Box>
    );
  }

  const { scores, location, competitors, demographics, insights, alternativeLocations } = analysis;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Resultado da Análise
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {analysis.businessType} - {location.address}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Exportar Análise">
            <IconButton onClick={handleExport} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}>
            <IconButton onClick={() => setShowMap(!showMap)} color="primary">
              <MapIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Score Cards */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Score Final
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    mb: 2,
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={scores.final.value}
                    size={120}
                    thickness={6}
                    sx={{
                      color: getScoreColorHex(scores.final.value),
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {scores.final.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      pontos
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {scores.final.probability}
                </Typography>
                <Chip
                  label={scores.final.value >= 70 ? 'Recomendado' : 'Atenção'}
                  color={getScoreColor(scores.final.value)}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Saturação do Mercado
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={100 - scores.saturation.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColorHex(scores.saturation.value),
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {scores.saturation.level}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {scores.saturation.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Oportunidade
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={scores.opportunity.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColorHex(scores.opportunity.value),
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {scores.opportunity.level}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {scores.opportunity.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Map */}
        {showMap && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mapa da Região
                  </Typography>
                  <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
                    <MapContainer
                      center={[location.coordinates.lat, location.coordinates.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* Localização principal */}
                      <Marker position={[location.coordinates.lat, location.coordinates.lng]}>
                        <Popup>
                          <strong>Sua Localização</strong><br />
                          {location.address}
                        </Popup>
                      </Marker>

                      {/* Raio de busca */}
                      <Circle
                        center={[location.coordinates.lat, location.coordinates.lng]}
                        radius={analysis.searchRadius}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                      />

                      {/* Concorrentes */}
                      {competitors.formal?.map((competitor, index) => (
                        competitor.coordinates && (
                          <Marker
                            key={`formal-${index}`}
                            position={[competitor.coordinates.lat, competitor.coordinates.lng]}
                          >
                            <Popup>
                              <strong>{competitor.name}</strong><br />
                              CNPJ: {competitor.cnpj}<br />
                              Distância: {Math.round(competitor.distance)}m
                            </Popup>
                          </Marker>
                        )
                      ))}

                      {competitors.informal?.map((competitor, index) => (
                        competitor.coordinates && (
                          <Marker
                            key={`informal-${index}`}
                            position={[competitor.coordinates.lat, competitor.coordinates.lng]}
                          >
                            <Popup>
                              <strong>{competitor.name}</strong><br />
                              Tipo: {competitor.type}<br />
                              Distância: {Math.round(competitor.distance)}m
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estatísticas da Região
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Concorrentes Encontrados"
                    secondary={`${competitors.total} (${competitors.formal?.length || 0} formais, ${competitors.informal?.length || 0} informais)`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="População da Região"
                    secondary={demographics.population?.toLocaleString() || 'N/A'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Renda Média"
                    secondary={demographics.averageIncome ? `R$ ${demographics.averageIncome.toLocaleString()}` : 'N/A'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Raio de Análise"
                    secondary={`${analysis.searchRadius}m`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Insights e Recomendações
              </Typography>
              
              {insights && insights.length > 0 ? (
                <List>
                  {insights.map((insight, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {getInsightIcon(insight.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={insight.title}
                          secondary={insight.description}
                        />
                      </ListItem>
                      {index < insights.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum insight disponível
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendation */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recomendação Final
              </Typography>
              <Alert 
                severity={scores.final.value >= 70 ? 'success' : scores.final.value >= 50 ? 'warning' : 'error'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body1">
                  {scores.final.recommendation}
                </Typography>
              </Alert>

              {alternativeLocations && alternativeLocations.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Localizações Alternativas
                  </Typography>
                  <Grid container spacing={2}>
                    {alternativeLocations.slice(0, 3).map((location, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {location.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {location.reason}
                            </Typography>
                            <Chip
                              label={`Score: ${location.opportunityScore}%`}
                              color={getScoreColor(location.opportunityScore)}
                              size="small"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/analysis/new')}
        >
          Nova Análise
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/history')}
        >
          Ver Histórico
        </Button>
      </Box>
    </Box>
  );
};

export default AnalysisResult;
