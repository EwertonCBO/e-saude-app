import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ProgressBar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const MedicationCard = ({ 
  name, 
  dosage, 
  frequency, 
  remaining, 
  total, 
  status,
  isCritical 
}: any) => {
  const progress = remaining / total;
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="pill" size={28} color={COLORS.primaryGreen} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.medName}>{name}</Text>
          <Text style={styles.medDosage}>{dosage}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isCritical ? '#FFEBEE' : COLORS.primaryGreenSoft }]}>
          <MaterialCommunityIcons 
            name={status === 'Ativo' ? "check-circle" : "alert-circle"} 
            size={14} 
            color={isCritical ? '#B71C1C' : COLORS.primaryGreenDark} 
          />
          <Text style={[styles.statusText, { color: isCritical ? '#B71C1C' : COLORS.primaryGreenDark }]}>
             {status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.neutralMedium} />
          <Text style={styles.detailText}>{frequency}</Text>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver Bula</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stockContainer}>
        <View style={styles.stockTextRow}>
          <Text style={styles.stockLabel}>Estoque de uso</Text>
          <Text style={[styles.stockValue, isCritical ? styles.textCritical : null]}>
            {remaining} <Text style={styles.stockLabel}>/ {total} un</Text>
          </Text>
        </View>
        <ProgressBar 
           progress={progress} 
           color={isCritical ? COLORS.error : COLORS.primaryGreen} 
           style={styles.progressBar} 
        />
        {isCritical && (
           <Text style={styles.criticalWarning}>Solicite renovação urgente. Você tem poucos dias.</Text>
        )}
      </View>
    </View>
  );
};

export default function MyMedicationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Tratamentos Ativos</Text>
        <Text style={styles.headerSubtitle}>Acompanhe o uso contínuo das suas prescrições.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <MedicationCard
           name="Losartana Potássica"
           dosage="50mg"
           frequency="1 comprimido a cada 24h"
           remaining={5}
           total={30}
           status="Renovar"
           isCritical={true}
        />

        <MedicationCard
           name="Cloridrato de Metformina"
           dosage="850mg"
           frequency="1 comprimido após o almoço"
           remaining={45}
           total={60}
           status="Ativo"
           isCritical={false}
        />

      </ScrollView>
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
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  headerSubtitle: {
    color: COLORS.neutralMedium,
    marginTop: 4,
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  medDosage: {
    fontSize: 14,
    color: COLORS.primaryGreenDark,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    color: COLORS.neutralMedium,
    fontSize: 13,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.offWhite,
  },
  actionButtonText: {
    color: COLORS.primaryGreenDark,
    fontSize: 13,
    fontWeight: '600',
  },
  stockContainer: {
    backgroundColor: COLORS.offWhite,
    padding: 16,
    borderRadius: 12,
  },
  stockTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 13,
    color: COLORS.neutralMedium,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  textCritical: {
    color: COLORS.error,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.divider,
  },
  criticalWarning: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
    fontWeight: '500',
  }
});
