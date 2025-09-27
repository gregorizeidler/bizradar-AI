import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAnalysis } from '../contexts/AnalysisContext';

const NewAnalysis = () => {
  const navigate = useNavigate();
  const { user, canPerformAnalysis, getRemainingAnalyses } = useAuth();
  const { createAnalysis } = useAnalysis();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    cnae: '',
    address: '',
    searchRadius: 1000,
  });
  const [errors, setErrors] = useState({});

  const steps = ['Tipo de Negócio', 'Localização', 'Confirmar'];

  const businessTypes = [
    { label: 'Restaurante', value: 'restaurante', cnae: '5611' },
    { label: 'Pizzaria', value: 'pizzaria', cnae: '5611' },
    { label: 'Lanchonete', value: 'lanchonete', cnae: '5612' },
    { label: 'Café', value: 'cafe', cnae: '5611' },
    { label: 'Bar', value: 'bar', cnae: '5611' },
    { label: 'Salão de Beleza', value: 'salao_beleza', cnae: '9602' },
    { label: 'Barbearia', value: 'barbearia', cnae: '9602' },
    { label: 'Farmácia', value: 'farmacia', cnae: '4771' },
    { label: 'Supermercado', value: 'supermercado', cnae: '4711' },
    { label: 'Padaria', value: 'padaria', cnae: '1091' },
    { label: 'Academia', value: 'academia', cnae: '9313' },
    { label: 'Escola', value: 'escola', cnae: '8511' },
    { label: 'Clínica', value: 'clinica', cnae: '8630' },
    { label: 'Posto de Gasolina', value: 'posto_gasolina', cnae: '4731' },
    { label: 'Hotel', value: 'hotel', cnae: '5510' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpa erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    // Auto-preenche CNAE quando seleciona tipo de negócio
    if (field === 'businessType') {
      const selectedBusiness = businessTypes.find(b => b.value === value);
      if (selectedBusiness) {
        setFormData(prev => ({
          ...prev,
          cnae: selectedBusiness.cnae,
        }));
      }
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.businessType) {
          newErrors.businessType = 'Selecione o tipo de negócio';
        }
        if (!formData.cnae) {
          newErrors.cnae = 'CNAE é obrigatório';
        }
        break;
      case 1:
        if (!formData.address.trim()) {
          newErrors.address = 'Endereço é obrigatório';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!canPerformAnalysis()) {
      setErrors({ general: 'Limite de análises atingido. Faça upgrade do seu plano.' });
      return;
    }

    setLoading(true);
    
    try {
      const result = await createAnalysis(formData);
      
      if (result.success) {
        navigate(`/analysis/${result.data.analysisId}`);
      }
    } catch (error) {
      setErrors({ general: 'Erro ao criar análise. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Qual tipo de negócio você quer analisar?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Selecione o tipo de negócio para uma análise mais precisa
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={businessTypes}
                  getOptionLabel={(option) => option.label}
                  value={businessTypes.find(b => b.value === formData.businessType) || null}
                  onChange={(event, newValue) => {
                    handleChange('businessType', newValue?.value || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Negócio"
                      error={!!errors.businessType}
                      helperText={errors.businessType}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          CNAE: {option.cnae}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CNAE"
                  value={formData.cnae}
                  onChange={(e) => handleChange('cnae', e.target.value)}
                  error={!!errors.cnae}
                  helperText={errors.cnae || 'Código CNAE da atividade econômica'}
                  placeholder="Ex: 5611"
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Onde você pretende abrir o negócio?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Informe o endereço completo para análise precisa da região
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço Completo"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  error={!!errors.address}
                  helperText={errors.address || 'Ex: Rua das Flores, 123 - Centro, São Paulo/SP'}
                  placeholder="Rua, número, bairro, cidade, estado"
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Raio de Análise: {formData.searchRadius}m
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Defina o raio para busca de concorrentes
                </Typography>
                <Slider
                  value={formData.searchRadius}
                  onChange={(e, value) => handleChange('searchRadius', value)}
                  min={100}
                  max={5000}
                  step={100}
                  marks={[
                    { value: 500, label: '500m' },
                    { value: 1000, label: '1km' },
                    { value: 2000, label: '2km' },
                    { value: 5000, label: '5km' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}m`}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Confirme os dados da análise
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Revise as informações antes de iniciar a análise
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tipo de Negócio
                        </Typography>
                        <Typography variant="body1">
                          {businessTypes.find(b => b.value === formData.businessType)?.label}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          CNAE
                        </Typography>
                        <Typography variant="body1">{formData.cnae}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Endereço
                        </Typography>
                        <Typography variant="body1">{formData.address}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Raio de Análise
                        </Typography>
                        <Typography variant="body1">{formData.searchRadius}m</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    A análise levará aproximadamente 2-3 minutos para ser concluída.
                    Você será notificado quando estiver pronta.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Verifica se usuário pode fazer análise
  if (!canPerformAnalysis()) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AnalyticsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Limite de Análises Atingido
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Você atingiu o limite de análises do seu plano atual.
              Faça upgrade para continuar analisando.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/profile')}
            >
              Fazer Upgrade
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Nova Análise
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Descubra a probabilidade de sucesso do seu negócio
        </Typography>
        
        {/* Remaining Analyses */}
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`${getRemainingAnalyses()} análises restantes`}
            color={getRemainingAnalyses() === 'Ilimitado' ? 'success' : 'primary'}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
            >
              Voltar
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  endIcon={<AnalyticsIcon />}
                >
                  {loading ? 'Criando Análise...' : 'Iniciar Análise'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewAnalysis;
