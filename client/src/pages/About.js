import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Inteligência Artificial',
      description: 'Algoritmos avançados de machine learning analisam milhares de variáveis para calcular a probabilidade de sucesso do seu negócio.',
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      title: 'Análise Geoespacial',
      description: 'Mapeamento preciso de concorrentes, fluxo de pessoas e pontos de interesse usando dados do OpenStreetMap.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Dados Demográficos',
      description: 'Informações detalhadas sobre população, renda, educação e perfil socioeconômico da região através do IBGE.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Dados Oficiais',
      description: 'Integração com Receita Federal, IBGE e outras fontes oficiais para máxima confiabilidade das informações.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Resultados Rápidos',
      description: 'Análise completa em poucos minutos com relatórios detalhados e insights acionáveis.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Score Proprietário',
      description: 'Algoritmo exclusivo que combina múltiplas variáveis para gerar um score de oportunidade único.',
    },
  ];

  const team = [
    {
      name: 'Dr. Carlos Silva',
      role: 'CEO & Fundador',
      description: 'PhD em Ciência de Dados, ex-Google. Especialista em análise preditiva e machine learning.',
      avatar: 'C',
    },
    {
      name: 'Ana Costa',
      role: 'CTO',
      description: 'Engenheira de Software sênior, ex-Microsoft. Especialista em arquitetura de sistemas e APIs.',
      avatar: 'A',
    },
    {
      name: 'João Santos',
      role: 'Head de Produto',
      description: 'MBA em Gestão de Produtos, ex-Nubank. Especialista em UX e desenvolvimento de produtos.',
      avatar: 'J',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Análises Realizadas' },
    { number: '5,000+', label: 'Empreendedores Atendidos' },
    { number: '85%', label: 'Taxa de Precisão' },
    { number: '24/7', label: 'Suporte Disponível' },
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
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ color: 'white' }}
              >
                Início
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
                Começar Agora
              </Button>
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
              Sobre o BizRadar AI
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9, maxWidth: 800, mx: 'auto' }}
            >
              Revolucionamos a análise de viabilidade de negócios com inteligência artificial,
              ajudando empreendedores a tomar decisões mais inteligentes e reduzir riscos.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Nossa Missão
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                Democratizar o acesso à análise de viabilidade de negócios através da tecnologia.
              </Typography>
              <Typography variant="body1" paragraph>
                Acreditamos que todo empreendedor merece ter acesso às mesmas ferramentas de análise
                que grandes corporações usam para avaliar oportunidades de negócio. Nossa plataforma
                combina dados oficiais, inteligência artificial e análise geoespacial para fornecer
                insights precisos e acionáveis.
              </Typography>
              <Typography variant="body1">
                Desde 2023, já ajudamos milhares de empreendedores a tomar decisões mais informadas,
                reduzindo o risco de investimentos e aumentando as chances de sucesso.
              </Typography>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  p: 4,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Tecnologia Avançada
                </Typography>
                <Typography variant="body1">
                  Algoritmos de machine learning processam milhões de dados
                  para gerar análises precisas em tempo real.
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Nossos Números
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h2"
                      fontWeight="bold"
                      color="primary.main"
                      gutterBottom
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Technology Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Nossa Tecnologia
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

      {/* Team Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Nossa Equipe
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2.5rem',
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {member.name}
                    </Typography>
                    <Chip
                      label={member.role}
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {member.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Nossos Valores
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                  Transparência
                </Typography>
                <Typography variant="body1">
                  Fornecemos informações claras sobre nossas metodologias e fontes de dados,
                  garantindo total transparência em nossas análises.
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                  Precisão
                </Typography>
                <Typography variant="body1">
                  Utilizamos apenas dados oficiais e algoritmos rigorosamente testados
                  para garantir a máxima precisão em nossas análises.
                </Typography>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                  Inovação
                </Typography>
                <Typography variant="body1">
                  Estamos sempre evoluindo nossa tecnologia para oferecer
                  as melhores ferramentas de análise do mercado.
                </Typography>
              </Card>
            </motion.div>
          </Grid>
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
            Pronto para Começar?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Junte-se a milhares de empreendedores que já usam o BizRadar AI
            para tomar decisões mais inteligentes
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
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
            Começar Gratuitamente
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
