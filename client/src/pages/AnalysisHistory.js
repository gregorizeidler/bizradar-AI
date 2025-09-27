import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAnalysis } from '../contexts/AnalysisContext';

const AnalysisHistory = () => {
  const navigate = useNavigate();
  const { getAnalyses, deleteAnalysis, exportAnalysis } = useAnalysis();
  
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    businessType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadAnalyses();
  }, [filters, pagination.current]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const result = await getAnalyses({
        page: pagination.current,
        limit: 10,
        ...filters,
      });

      if (result.success) {
        setAnalyses(result.data.analyses);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleView = (analysisId) => {
    navigate(`/analysis/${analysisId}`);
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('Tem certeza que deseja deletar esta análise?')) {
      const result = await deleteAnalysis(analysisId);
      if (result.success) {
        loadAnalyses();
      }
    }
  };

  const handleExport = async (analysisId) => {
    await exportAnalysis(analysisId);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'processing':
        return 'Processando';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    if (score >= 40) return '#f56565';
    return '#e53e3e';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Histórico de Análises
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize e gerencie todas as suas análises
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Buscar"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Endereço ou tipo de negócio"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="completed">Concluída</MenuItem>
                  <MenuItem value="processing">Processando</MenuItem>
                  <MenuItem value="error">Erro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Negócio</InputLabel>
                <Select
                  value={filters.businessType}
                  onChange={(e) => handleFilterChange('businessType', e.target.value)}
                  label="Tipo de Negócio"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="restaurante">Restaurante</MenuItem>
                  <MenuItem value="pizzaria">Pizzaria</MenuItem>
                  <MenuItem value="salao_beleza">Salão de Beleza</MenuItem>
                  <MenuItem value="farmacia">Farmácia</MenuItem>
                  <MenuItem value="supermercado">Supermercado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Ordenar por"
                >
                  <MenuItem value="createdAt">Data</MenuItem>
                  <MenuItem value="finalScore">Score</MenuItem>
                  <MenuItem value="businessType">Tipo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/analysis/new')}
                startIcon={<AnalyticsIcon />}
              >
                Nova Análise
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando análises...</Typography>
          </CardContent>
        </Card>
      ) : analyses.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de Negócio</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyses.map((analysis, index) => (
                  <motion.tr
                    key={analysis.id}
                    component={TableRow}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {analysis.businessType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {analysis.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(analysis.status)}
                        color={getStatusColor(analysis.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {analysis.finalScore ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: getScoreColor(analysis.finalScore) }}
                          >
                            {analysis.finalScore}%
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          --
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(analysis.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {analysis.status === 'completed' && (
                          <>
                            <Tooltip title="Ver Análise">
                              <IconButton
                                size="small"
                                onClick={() => handleView(analysis.id)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar">
                              <IconButton
                                size="small"
                                onClick={() => handleExport(analysis.id)}
                                color="primary"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(analysis.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.total}
              page={pagination.current}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>

          {/* Summary */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {pagination.count} de {pagination.totalRecords} análises
            </Typography>
          </Box>
        </>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AnalyticsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhuma análise encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filters.search || filters.status || filters.businessType
                ? 'Tente ajustar os filtros de busca'
                : 'Crie sua primeira análise para começar'
              }
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/analysis/new')}
              startIcon={<AnalyticsIcon />}
            >
              Nova Análise
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AnalysisHistory;
