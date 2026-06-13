import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

// Usando o asset local do mapa de São Paulo
const STATIC_MAP_IMAGE = require('../../assets/mapa.png');

const PHARMACIES = [
  {
    id: 1,
    title: 'Farmácia de Alto Custo - Unidade Sé',
    status: 'Aberta agora • Fecha às 17h',
    address: 'Rua Vinte e Quatro de Maio, 100 - Centro',
    topPos: '35%',
    leftPos: '30%'
  },
  {
    id: 2,
    title: 'Farmácia de Alto Custo - Várzea do Carmo',
    status: 'Aberta agora • Fecha às 18h',
    address: 'Rua Leopoldo Miguez, 327 - Cambuci',
    topPos: '45%',
    leftPos: '60%'
  },
  {
    id: 3,
    title: 'Farmácia de Alto Custo - Vila Mariana',
    status: 'Aberta agora • Fecha às 16:30h',
    address: 'Rua Domingos de Morais, 1500 - Vila Mariana',
    topPos: '60%',
    leftPos: '45%'
  }
];

export default function StatusScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width); 
    
    if (index !== activeIndex && index >= 0 && index < PHARMACIES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Onde Ir</Text>
        <Text style={styles.headerSubtitle}>Arraste os cartões embaixo para encontrar a farmácia de alto custo mais próxima do seu endereço.</Text>
      </View>

      <View style={styles.mapContainer}>
        {/* Renderização de Imagem Estática Simulando o Mapa */}
        <Image 
           source={STATIC_MAP_IMAGE} 
           style={styles.staticMapImage}
           resizeMode="cover"
        />
        
        {/* Camada escurecedora por cima da imagem para os pinos destacarem */}
        <View style={styles.mapOverlay} />

        {/* Pinos Falsos Interativos */}
        {PHARMACIES.map((pharmacy, index) => {
          const isActive = index === activeIndex;

          return (
            <View 
               key={pharmacy.id}
               style={[
                 styles.pinPositioner, 
                 { top: pharmacy.topPos as any, left: pharmacy.leftPos as any, zIndex: isActive ? 10 : 1 }
               ]}
            >
              <View style={[styles.markerContainer, isActive && styles.markerActive]}>
                <MaterialCommunityIcons 
                   name="medical-bag" 
                   size={isActive ? 28 : 18} 
                   color={COLORS.white} 
                />
              </View>
              {/* Título flutuante apenas no ativo */}
              {isActive && (
                 <View style={styles.activePinTooltip}>
                    <Text style={styles.tooltipText}>{pharmacy.title}</Text>
                 </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Janela de Informações flutuante interativa (O BottomSheet) */}
      <View style={styles.bottomSheetContainer}>
        <ScrollView 
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {PHARMACIES.map((pharmacy) => (
            <View key={pharmacy.id} style={styles.cardWrapper}>
              <View style={styles.bottomSheetCard}>
                <Text style={styles.sheetTitle}>{pharmacy.title}</Text>
                
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.neutralMedium} />
                    <Text style={styles.infoText}>{pharmacy.status}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.neutralMedium} />
                    <Text style={styles.infoText} numberOfLines={2}>{pharmacy.address}</Text>
                </View>

                <TouchableOpacity style={styles.routeButton}>
                  <Text style={styles.routeButtonText}>Traçar Rota no App</Text>
                  <MaterialCommunityIcons name="gavel" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        {/* Paginador (Bolinhas) */}
        <View style={styles.pagination}>
           {PHARMACIES.map((_, index) => (
              <View 
                key={index} 
                style={[styles.dot, activeIndex === index && styles.dotActive]} 
              />
           ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    zIndex: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  headerSubtitle: {
    color: COLORS.neutralMedium,
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#D1E3DD', // Fallback color
    position: 'relative',
    overflow: 'hidden',
  },
  staticMapImage: {
    width: width,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0.8,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(230, 244, 240, 0.4)', // Esverdeado claro pra mascarar
  },
  pinPositioner: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerContainer: {
    backgroundColor: COLORS.primaryGreenLight,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  markerActive: {
    backgroundColor: COLORS.primaryGreenDark,
    padding: 12,
    borderRadius: 30,
    elevation: 6,
    transform: [{ scale: 1.1 }]
  },
  activePinTooltip: {
    backgroundColor: COLORS.neutralDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  tooltipText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  cardWrapper: {
    width: width,
    paddingHorizontal: 20,
  },
  bottomSheetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.neutralDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 16,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.neutralMedium,
    fontSize: 14,
    flexShrink: 1,
  },
  routeButton: {
    marginTop: 16,
    backgroundColor: COLORS.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
  },
  routeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#rgba(0,0,0,0.2)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primaryGreen,
  }
});
