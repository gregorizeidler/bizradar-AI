import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword, upgradeSubscription } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.profile?.company || '',
    phone: user?.profile?.phone || '',
    address: {
      street: user?.profile?.address?.street || '',
      city: user?.profile?.address?.city || '',
      state: user?.profile?.address?.state || '',
      zipCode: user?.profile?.address?.zipCode || '',
    },
  });

  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    language: user?.preferences?.language || 'pt-BR',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({
        name: profileData.name,
        profile: {
          company: profileData.company,
          phone: profileData.phone,
          address: profileData.address,
        },
        preferences,
      });

      if (!result.success) {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Erro ao salvar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setPasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setErrors({ password: result.error });
      }
    } catch (error) {
      setErrors({ password: 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newPlan) => {
    setLoading(true);
    try {
      const result = await upgradeSubscription(newPlan);
      
      if (result.success) {
        setUpgradeDialog(false);
      } else {
        setErrors({ upgrade: result.error });
      }
    } catch (error) {
      setErrors({ upgrade: 'Erro ao fazer upgrade' });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'individual',
      name: 'Individual',
      price: 'R$ 49',
      period: 'por análise',
      features: [
        '1 análise detalhada',
        'Mapeamento de concorrência',
        'Análise demográfica básica',
        'Suporte por email',
      ],
      current: user?.plan === 'individual',
    },
    {
      id: 'pro',
      name: 'PRO',
      price: 'R$ 399',
      period: 'por mês',
      features: [
        'Análises ilimitadas',
        'Mapeamento completo',
        'Sugestões de localização',
        'Exportação PDF/Excel',
        'Suporte prioritário',
        'API de integração',
      ],
      current: user?.plan === 'pro',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sob consulta',
      period: 'personalizado',
      features: [
        'Tudo do plano PRO',
        'Análises em lote',
        'Dashboard personalizado',
        'Consultoria especializada',
        'Suporte 24/7',
      ],
      current: user?.plan === 'enterprise',
    },
  ];

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <PersonIcon /> },
    { id: 'subscription', label: 'Assinatura', icon: <StarIcon /> },
    { id: 'security', label: 'Segurança', icon: <SecurityIcon /> },
    { id: 'preferences', label: 'Preferências', icon: <NotificationsIcon /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas informações pessoais e configurações
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip
                label={`Plano ${user?.plan?.toUpperCase() || 'INDIVIDUAL'}`}
                color="primary"
                size="small"
              />
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <List>
              {tabs.map((tab) => (
                <ListItem
                  key={tab.id}
                  button
                  selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon>{tab.icon}</ListItemIcon>
                  <ListItemText primary={tab.label} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações Pessoais
                  </Typography>
                  
                  {errors.general && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.general}
                    </Alert>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nome Completo"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profileData.email}
                        disabled
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Empresa"
                        value={profileData.company}
                        onChange={(e) => handleProfileChange('company', e.target.value)}
                        InputProps={{
                          startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Endereço
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Rua"
                        value={profileData.address.street}
                        onChange={(e) => handleProfileChange('address.street', e.target.value)}
                        InputProps={{
                          startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Cidade"
                        value={profileData.address.city}
                        onChange={(e) => handleProfileChange('address.city', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Estado"
                        value={profileData.address.state}
                        onChange={(e) => handleProfileChange('address.state', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="CEP"
                        value={profileData.address.zipCode}
                        onChange={(e) => handleProfileChange('address.zipCode', e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'subscription' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Planos e Assinatura
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {plans.map((plan) => (
                      <Grid item xs={12} md={4} key={plan.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            position: 'relative',
                            border: plan.current ? '2px solid' : '1px solid',
                            borderColor: plan.current ? 'primary.main' : 'divider',
                          }}
                        >
                          {plan.popular && (
                            <Chip
                              label="Mais Popular"
                              color="primary"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -12,
                                left: '50%',
                                transform: 'translateX(-50%)',
                              }}
                            />
                          )}
                          {plan.current && (
                            <Chip
                              label="Plano Atual"
                              color="success"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -12,
                                right: 16,
                              }}
                            />
                          )}
                          <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {plan.name}
                            </Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                              {plan.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {plan.period}
                            </Typography>
                            <List dense>
                              {plan.features.map((feature, index) => (
                                <ListItem key={index} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircleIcon color="success" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={feature}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                            {!plan.current && (
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => setUpgradeDialog(true)}
                                sx={{ mt: 2 }}
                              >
                                Fazer Upgrade
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Segurança
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Alterar Senha"
                        secondary="Mantenha sua conta segura com uma senha forte"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setPasswordDialog(true)}
                      >
                        Alterar
                      </Button>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preferências
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Notificações"
                        secondary="Receber notificações sobre análises e atualizações"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.notifications}
                            onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                          />
                        }
                        label=""
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        <LanguageIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Idioma"
                        secondary="Português (Brasil)"
                      />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      Salvar Preferências
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>
      </Grid>

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          {errors.password && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.password}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Senha Atual"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Nova Senha"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Confirmar Nova Senha"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialog} onClose={() => setUpgradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Fazer Upgrade</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Escolha o plano PRO para ter acesso a análises ilimitadas e recursos avançados.
          </Typography>
          
          {errors.upgrade && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.upgrade}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => handleUpgrade('pro')}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Upgrade para PRO'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
