import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const TimelineStep = ({ title, subtitle, icon, isActive, isWarning, onPress }: any) => {
  return (
    <TouchableOpacity 
      style={[
        styles.stepContainer, 
        isWarning && styles.warningContainer
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, isActive ? styles.iconActive : null, isWarning ? styles.iconWarning : null]}>
        <MaterialCommunityIcons name={icon} size={28} color={isWarning ? COLORS.secondaryWarning : COLORS.primaryGreen} />
      </View>
      <View style={styles.stepTextContainer}>
        <Text style={[styles.stepTitle, isActive ? styles.stepTitleActive : null]}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
      {onPress && (
         <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
      )}
    </TouchableOpacity>
  );
};

export default function MyTreatmentScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.neutralDark} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={styles.headerTitle}>Meu Tratamento</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notificações')}>
            <MaterialCommunityIcons name="bell-badge-outline" size={28} color={COLORS.primaryGreen} />
          </TouchableOpacity>
        </View>

        <View style={styles.timeline}>
          {/* Vertical Lines */}
          <View style={styles.verticalLine}></View>

          <TimelineStep 
            title="Consulta médica"
            subtitle="Consulta realizada"
            icon="hospital-box"
            isActive={true}
          />

          <TimelineStep 
            title="Exames realizados"
            subtitle="Exames concluídos"
            icon="flask"
            isActive={true}
          />

          <TimelineStep 
            title="Receita emitida"
            subtitle="Vence em 5 dias"
            icon="clipboard-text"
            isActive={true}
            isWarning={true}
          />

          <TimelineStep 
            title="Enviar documentos"
            subtitle="Fotografe e envie os documentos necessários"
            icon="camera-outline"
            isActive={false}
            onPress={() => navigation.navigate('MyDocuments')}
          />

          <TimelineStep 
            title="Retirar medicamento"
            subtitle="Leve os documentos e retire seu medicamento"
            icon="map-marker-outline"
            isActive={false}
          />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  timeline: {
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 35,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: COLORS.divider,
    zIndex: 0,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 1,
  },
  warningContainer: {
    backgroundColor: COLORS.secondaryWarningLight,
    borderWidth: 1,
    borderColor: '#FBE8C4',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconActive: {
    backgroundColor: COLORS.primaryGreenSoft,
  },
  iconWarning: {
    backgroundColor: COLORS.white,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutralDark,
    marginBottom: 4,
  },
  stepTitleActive: {
    color: COLORS.primaryGreenDark,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.neutralMedium,
  },
});
