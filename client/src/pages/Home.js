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
  Avatar,
  Rating,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Análise Inteligente',
      description: 'IA avançada analisa concorrência, demografia e localização para calcular a probabilidade de sucesso do seu negócio.',
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      title: 'Mapeamento Geoespacial',
      description: 'Visualize concorrentes formais e informais em um mapa interativo com dados precisos de geolocalização.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Dados Demográficos',
      description: 'Acesse informações detalhadas sobre população, renda e perfil socioeconômico da região.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Resultados Rápidos',
      description: 'Análise completa em 2-3 minutos com relatórios detalhados e sugestões estratégicas.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Dados Confiáveis',
      description: 'Informações oficiais da Receita Federal, IBGE e OpenStreetMap para máxima precisão.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Score de Oportunidade',
      description: 'Algoritmo proprietário calcula score de saturação e oportunidade com base em múltiplas variáveis.',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empreendedora',
      avatar: 'M',
      rating: 5,
      comment: 'O BizRadar me ajudou a escolher a localização perfeita para minha padaria. Em 6 meses já estava no lucro!',
    },
    {
      name: 'João Santos',
      role: 'Consultor de Negócios',
      avatar: 'J',
      rating: 5,
      comment: 'Ferramenta essencial para meus clientes. As análises são precisas e os relatórios muito profissionais.',
    },
    {
      name: 'Ana Costa',
      role: 'Franqueada',
      avatar: 'A',
      rating: 5,
      comment: 'Evitei um grande prejuízo! A análise mostrou alta saturação na região que eu queria abrir minha loja.',
    },
  ];

  const plans = [
    {
      name: 'Individual',
      price: 'R$ 49',
      period: 'por análise',
      features: [
        '1 análise detalhada',
        'Mapeamento de concorrência',
        'Análise demográfica',
        'Score de oportunidade',
        'Suporte por email',
      ],
      popular: false,
    },
    {
      name: 'PRO',
      price: 'R$ 399',
      period: 'por mês',
      features: [
        'Análises ilimitadas',
        'Mapeamento completo',
        'Sugestões de localização',
        'Análise de transporte',
        'Exportação PDF/Excel',
        'Suporte prioritário',
        'API de integração',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: 'personalizado',
      features: [
        'Tudo do plano PRO',
        'Análises em lote',
        'Dashboard personalizado',
        'Consultoria especializada',
        'Suporte 24/7',
        'Treinamento da equipe',
      ],
      popular: false,
    },
  ];

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
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ color: 'white' }}
                  >
                    Entrar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    Cadastrar
                  </Button>
                </>
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
          py: { xs: 8, md: 12 },
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
              sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
            >
              Descubra a Probabilidade de Sucesso
              <br />
              do Seu Negócio
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, opacity: 0.9, maxWidth: 800, mx: 'auto' }}
            >
              Análise inteligente com IA que mapeia concorrência, analisa demografia
              e calcula suas chances de sucesso antes de investir
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => user ? navigate('/analysis/new') : navigate('/register')}
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
                endIcon={<ArrowForwardIcon />}
              >
                {user ? 'Nova Análise' : 'Começar Agora'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Saiba Mais
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Como Funciona
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6 }}
          >
            O que nossos clientes dizem
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', p: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            mr: 2,
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                      <Typography variant="body1">
                        "{testimonial.comment}"
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Escolha seu Plano
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Mais Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    />
                  )}
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.period}
                    </Typography>
                    <Box sx={{ textAlign: 'left', mb: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box
                          key={featureIndex}
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <StarIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      onClick={() => user ? navigate('/profile') : navigate('/register')}
                    >
                      {user ? 'Fazer Upgrade' : 'Começar Agora'}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
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
            Pronto para Descobrir o Potencial do Seu Negócio?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Junte-se a milhares de empreendedores que já usam o BizRadar AI
            para tomar decisões mais inteligentes
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => user ? navigate('/analysis/new') : navigate('/register')}
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
            endIcon={<ArrowForwardIcon />}
          >
            {user ? 'Fazer Nova Análise' : 'Começar Gratuitamente'}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: 'text.primary', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  BizRadar AI
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Inteligência artificial para empreendedores inteligentes.
                Análise de probabilidade de sucesso de negócios com dados precisos e confiáveis.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Links Úteis
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/about')}
                  sx={{ justifyContent: 'flex-start', p: 0 }}
                >
                  Sobre Nós
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/pricing')}
                  sx={{ justifyContent: 'flex-start', p: 0 }}
                >
                  Preços
                </Button>
                <Button
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', p: 0 }}
                >
                  Contato
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2024 BizRadar AI. Todos os direitos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
