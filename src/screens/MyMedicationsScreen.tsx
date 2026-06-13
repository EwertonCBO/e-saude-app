import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, ProgressBar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getMedications, registerMedicationDose } from '../database/repositories';
import type { Medication } from '../types/domain';

export default function MyMedicationsScreen() {
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { revision, notifyDataChanged } = useAppData();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedications = useCallback(async () => {
    if (!userId) {
      return;
    }
    setMedications(await getMedications(db, userId));
    setIsLoading(false);
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications, revision]),
  );

  const registerDose = (medication: Medication) => {
    Alert.alert(
      'Registrar dose',
      `Confirmar o uso de uma unidade de ${medication.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await registerMedicationDose(db, medication.id);
            notifyDataChanged();
            await loadMedications();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>O estoque é atualizado ao registrar cada dose.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primaryGreen} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {medications.map((medication) => {
            const progress = medication.total
              ? medication.remaining / medication.total
              : 0;
            return (
              <View key={medication.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="pill" size={28} color={COLORS.primaryGreen} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.medName}>{medication.name}</Text>
                    <Text style={styles.medDosage}>{medication.dosage}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: medication.isCritical ? '#FFEBEE' : COLORS.primaryGreenSoft },
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: medication.isCritical ? '#B71C1C' : COLORS.primaryGreenDark },
                    ]}>
                      {medication.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="clock-outline" size={17} color={COLORS.neutralMedium} />
                  <Text style={styles.detailText}>{medication.frequency}</Text>
                </View>

                <View style={styles.stockContainer}>
                  <View style={styles.stockTextRow}>
                    <Text style={styles.stockLabel}>Estoque de uso</Text>
                    <Text style={[
                      styles.stockValue,
                      medication.isCritical && styles.textCritical,
                    ]}>
                      {medication.remaining} / {medication.total} un
                    </Text>
                  </View>
                  <ProgressBar
                    progress={progress}
                    color={medication.isCritical ? COLORS.error : COLORS.primaryGreen}
                    style={styles.progressBar}
                  />
                </View>

                <TouchableOpacity
                  style={styles.doseButton}
                  onPress={() => registerDose(medication)}
                  disabled={medication.remaining === 0}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.doseButtonText}>Registrar dose</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerSubtitle: { color: COLORS.neutralMedium, marginTop: 4, fontSize: 14 },
  loader: { marginTop: 48 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerText: { flex: 1 },
  medName: { fontSize: 17, fontWeight: 'bold', color: COLORS.neutralDark },
  medDosage: { fontSize: 14, color: COLORS.primaryGreenDark, marginTop: 2 },
  statusBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailText: { marginLeft: 7, color: COLORS.neutralMedium, fontSize: 13 },
  stockContainer: { backgroundColor: COLORS.offWhite, padding: 16, borderRadius: 12 },
  stockTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stockLabel: { fontSize: 13, color: COLORS.neutralMedium },
  stockValue: { fontSize: 15, fontWeight: 'bold', color: COLORS.neutralDark },
  textCritical: { color: COLORS.error },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: COLORS.divider },
  doseButton: {
    marginTop: 16,
    borderRadius: 22,
    paddingVertical: 11,
    backgroundColor: COLORS.primaryGreen,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseButtonText: { color: COLORS.white, fontWeight: 'bold', marginLeft: 8 },
});
