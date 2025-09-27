import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      id: 'individual',
      name: 'Individual',
      price: 'R$ 49',
      period: 'por análise',
      description: 'Perfeito para empreendedores iniciantes',
      features: [
        '1 análise detalhada',
        'Mapeamento de concorrência',
        'Análise demográfica básica',
        'Score de oportunidade',
        'Relatório em PDF',
        'Suporte por email',
      ],
      limitations: [
        'Limitado a 1 análise',
        'Sem análises comparativas',
        'Suporte básico',
      ],
      popular: false,
      color: 'primary',
    },
    {
      id: 'pro',
      name: 'PRO',
      price: 'R$ 399',
      period: 'por mês',
      description: 'Ideal para consultores e empresas',
      features: [
        'Análises ilimitadas',
        'Mapeamento completo de concorrência',
        'Análise demográfica avançada',
        'Sugestões de localização alternativa',
        'Análise de transporte público',
        'Exportação em PDF/Excel',
        'Dashboard personalizado',
        'Suporte prioritário',
        'API de integração',
        'Análises em lote',
      ],
      limitations: [],
      popular: true,
      color: 'success',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sob consulta',
      period: 'personalizado',
      description: 'Soluções customizadas para grandes empresas',
      features: [
        'Tudo do plano PRO',
        'Análises em lote ilimitadas',
        'Dashboard personalizado',
        'Integração com CRM/ERP',
        'Consultoria especializada',
        'Suporte 24/7',
        'Treinamento da equipe',
        'SLA garantido',
        'Relatórios customizados',
        'White-label disponível',
      ],
      limitations: [],
      popular: false,
      color: 'warning',
    },
  ];

  const faqs = [
    {
      question: 'Como funciona o período de teste?',
      answer: 'Novos usuários recebem 3 análises gratuitas no plano Individual para testar a plataforma. Não é necessário cartão de crédito.',
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o final do período pago.',
    },
    {
      question: 'Os dados são atualizados com que frequência?',
      answer: 'Nossos dados são atualizados mensalmente com informações da Receita Federal, IBGE e OpenStreetMap para garantir máxima precisão.',
    },
    {
      question: 'Há desconto para pagamento anual?',
      answer: 'Sim, oferecemos 20% de desconto para assinaturas anuais do plano PRO. Entre em contato para mais detalhes.',
    },
    {
      question: 'Posso fazer upgrade ou downgrade do meu plano?',
      answer: 'Sim, você pode alterar seu plano a qualquer momento. As mudanças entram em vigor imediatamente.',
    },
    {
      question: 'Há suporte técnico disponível?',
      answer: 'Sim, oferecemos suporte por email para todos os planos, suporte prioritário para PRO e suporte 24/7 para Enterprise.',
    },
  ];

  const handleSelectPlan = (planId) => {
    if (user) {
      if (planId === 'individual') {
        navigate('/analysis/new');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                BizRadar AI
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ color: 'white' }}
              >
                Início
              </Button>
              {user ? (
                <Button
                  variant="contained"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Entrar
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Escolha o Plano Ideal
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
            >
              Análise inteligente de negócios para empreendedores de todos os tamanhos.
              Comece gratuitamente e escale conforme sua necessidade.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'success.main' : 'divider',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: plan.popular ? 'scale(1.08)' : 'scale(1.03)',
                    },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Mais Popular"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {plan.name}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {plan.description}
                    </Typography>
                    
                    <Box sx={{ my: 3 }}>
                      <Typography variant="h3" fontWeight="bold" color={`${plan.color}.main`}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'left', mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Incluído:
                      </Typography>
                      <List dense>
                        {plan.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ py: 0.5 }}>
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
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      color={plan.color}
                      fullWidth
                      size="large"
                      onClick={() => handleSelectPlan(plan.id)}
                      sx={{ py: 1.5 }}
                    >
                      {user ? (
                        user.plan === plan.id ? 'Plano Atual' : 
                        plan.id === 'individual' ? 'Fazer Análise' : 'Fazer Upgrade'
                      ) : (
                        plan.id === 'enterprise' ? 'Entrar em Contato' : 'Começar Agora'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Comparison */}
      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Compare os Recursos
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Análise Básica
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Mapeamento de concorrentes" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Dados demográficos" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Score de oportunidade" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Análise Avançada
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Sugestões de localização" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Análise de transporte" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Insights personalizados" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recursos Enterprise
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="API de integração" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Consultoria especializada" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Suporte 24/7" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Perguntas Frequentes
        </Typography>
        
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="medium">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        ))}
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Pronto para Começar?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Experimente gratuitamente e descubra o potencial do seu negócio
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(user ? '/analysis/new' : '/register')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            {user ? 'Fazer Nova Análise' : 'Começar Gratuitamente'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Pricing;
