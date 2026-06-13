import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  {
    id: 0,
    title: 'Passo a passo simplificado',
    description: 'Saiba exatamente em qual etapa está seu tratamento: da consulta médica à receita emitida.',
    icon: 'timeline-check',
  },
  {
    id: 1,
    title: 'Envio de documentos fácil',
    description: 'Chega de burocracia. Tire fotos dos seus documentos e receitas médicas e anexe de maneira simples.',
    icon: 'file-document-outline',
  },
  {
    id: 2,
    title: 'Localização das farmácias',
    description: 'Use nosso mapa inteligente para achar o posto de distribuição de medicamento especial mais próximo.',
    icon: 'map-search-outline',
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useAuth();

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de Pular */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* LOGO SIMPLIFICADA */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="heart-pulse" size={60} color={COLORS.primaryGreen} />
          <Text style={styles.logoText}>Altocusto Fácil</Text>
        </View>

        {/* ILUSTRAÇÃO/ICONE */}
        <View style={styles.imageContainer}>
          <MaterialCommunityIcons name={slide.icon as any} size={130} color={COLORS.primaryGreenSoft} style={styles.mainIcon} />
        </View>

        {/* TEXTOS */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

      </View>

      {/* FOOTER: INDICADORES E BOTÃO */}
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlide === index && styles.activeIndicator
              ]}
            />
          ))}
        </View>

        <Button
          mode="contained"
          onPress={nextSlide}
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
          contentStyle={{ height: 50 }}
        >
          {currentSlide === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 24,
    alignItems: 'flex-end',
  },
  skipText: {
    color: COLORS.neutralMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    marginLeft: 8,
  },
  imageContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryGreenLight + '20', // Opacidade
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainIcon: {
    color: COLORS.primaryGreenDark,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.neutralMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 32,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.divider,
    marginHorizontal: 6,
  },
  activeIndicator: {
    backgroundColor: COLORS.primaryGreen,
    width: 24, // Expanded indicator
  },
  actionButton: {
    borderRadius: 25,
    backgroundColor: COLORS.primaryGreen,
  },
  actionButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
