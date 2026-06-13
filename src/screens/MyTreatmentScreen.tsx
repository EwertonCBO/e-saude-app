import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getPrescription, getTreatmentSteps } from '../database/repositories';
import type { Prescription, TreatmentStep } from '../types/domain';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyTreatment'>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));
}

export default function MyTreatmentScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { revision } = useAppData();
  const [steps, setSteps] = useState<TreatmentStep[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId) {
      return;
    }
    const [nextSteps, nextPrescription] = await Promise.all([
      getTreatmentSteps(db, userId),
      getPrescription(db, userId),
    ]);
    setSteps(nextSteps);
    setPrescription(nextPrescription);
    setIsLoading(false);
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, revision]),
  );

  const openStep = (step: TreatmentStep) => {
    if (step.actionRoute === 'MyDocuments') {
      navigation.navigate('MyDocuments');
    }
    if (step.actionRoute === 'Locations') {
      navigation.navigate('MainTabs', { screen: 'Locations' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.neutralDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu tratamento</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={28} color={COLORS.primaryGreen} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={COLORS.primaryGreen} />
        ) : (
          <View style={styles.timeline}>
            <View style={styles.verticalLine} />
            {steps.map((step) => {
              const isWarning = step.status === 'warning';
              const isActive = step.status !== 'pending';
              const subtitle = step.title === 'Receita emitida' && prescription
                ? `Válida até ${formatDate(prescription.expiresAt)}`
                : step.subtitle;
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.stepContainer, isWarning && styles.warningContainer]}
                  onPress={() => openStep(step)}
                  disabled={!step.actionRoute}
                >
                  <View style={[
                    styles.iconContainer,
                    isActive && styles.iconActive,
                    isWarning && styles.iconWarning,
                  ]}>
                    <MaterialCommunityIcons
                      name={step.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={28}
                      color={isWarning ? COLORS.secondaryWarning : COLORS.primaryGreen}
                    />
                  </View>
                  <View style={styles.stepTextContainer}>
                    <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepSubtitle}>{subtitle}</Text>
                  </View>
                  {step.actionRoute && (
                    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  scrollContent: { padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.neutralDark },
  timeline: { position: 'relative' },
  verticalLine: {
    position: 'absolute',
    left: 35,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: COLORS.divider,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
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
  iconActive: { backgroundColor: COLORS.primaryGreenSoft },
  iconWarning: { backgroundColor: COLORS.white },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: COLORS.neutralDark, marginBottom: 4 },
  stepTitleActive: { color: COLORS.primaryGreenDark },
  stepSubtitle: { fontSize: 13, color: COLORS.neutralMedium },
});
