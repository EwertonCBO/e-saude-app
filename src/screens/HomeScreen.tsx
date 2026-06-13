import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getHomeData } from '../database/repositories';
import { seedDemoData } from '../database/migrations';
import type { HomeData } from '../types/domain';
import type { RootStackParamList } from '../navigation/types';

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

function daysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86400000));
}

export default function HomeScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, signOut } = useAuth();
  const { revision, notifyDataChanged } = useAppData();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId) {
      return;
    }
    setData(await getHomeData(db, userId));
    setIsLoading(false);
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, revision]),
  );

  const resetDemo = () => {
    Alert.alert(
      'Restaurar demonstração',
      'Documentos, estoque e alterações locais voltarão ao estado inicial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await FileSystem.deleteAsync(
              `${FileSystem.documentDirectory}patient-documents/`,
              { idempotent: true },
            );
            await seedDemoData(db);
            notifyDataChanged();
            await loadData();
          },
        },
      ],
    );
  };

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  const expirationDays = data.prescription ? daysUntil(data.prescription.expiresAt) : null;
  const markedDates = Object.fromEntries(
    data.events.map((event) => {
      const isExpiration = event.type === 'prescription_expiration';
      const isAppointment = event.type === 'teleconsultation';
      return [
        event.eventDate,
        {
          marked: true,
          dotColor: isExpiration
            ? COLORS.secondaryWarning
            : isAppointment
              ? '#2471A3'
              : COLORS.primaryGreenDark,
          selected: true,
          selectedColor: isExpiration
            ? COLORS.secondaryWarningLight
            : isAppointment
              ? '#DDEEFF'
              : COLORS.primaryGreenSoft,
          selectedTextColor: isExpiration
            ? COLORS.secondaryWarning
            : isAppointment
              ? '#1B4F72'
              : COLORS.primaryGreenDark,
        },
      ];
    }),
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, <Text style={styles.name}>{data.user.name}</Text>
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={resetDemo}>
              <MaterialCommunityIcons name="database-refresh-outline" size={25} color={COLORS.primaryGreenDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={signOut}>
              <MaterialCommunityIcons name="logout" size={25} color={COLORS.neutralMedium} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            style={styles.calendar}
            theme={{
              calendarBackground: COLORS.white,
              textSectionTitleColor: '#b6c1cd',
              todayTextColor: COLORS.primaryGreen,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: COLORS.primaryGreen,
              monthTextColor: COLORS.neutralDark,
              textMonthFontWeight: 'bold',
            }}
            markedDates={markedDates}
            onDayPress={({ dateString }) => {
              const appointment = data.appointments.find(
                (item) => item.appointmentDate === dateString,
              );
              if (appointment) {
                navigation.navigate('AppointmentDetails', {
                  appointmentId: appointment.id,
                });
              }
            }}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.secondaryWarning }]} />
              <Text style={styles.legendText}>Vencimento da receita</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primaryGreenDark }]} />
              <Text style={styles.legendText}>Chegada de lote</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2471A3' }]} />
              <Text style={styles.legendText}>Teleconsulta</Text>
            </View>
          </View>
        </View>

        {data.prescription && expirationDays !== null && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Scheduling' })}
          >
            <View style={styles.alertHeader}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.secondaryWarning} />
              <Text style={styles.alertTitle}>Renovação da receita</Text>
            </View>
            <Text style={styles.alertDescription}>
              A receita de {data.prescription.medicationName} vence em {expirationDays} dias.
            </Text>
          </TouchableOpacity>
        )}

        {data.medication && (
          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name="pill" size={28} color={COLORS.primaryGreen} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{data.medication.name}</Text>
              <Text style={styles.cardSubtitle}>
                {data.medication.dosage} • {data.medication.remaining} unidades
              </Text>
            </View>
          </View>
        )}

        <Button
          mode="contained"
          icon="calendar-clock-outline"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Scheduling' })}
          style={styles.mainButton}
          contentStyle={styles.buttonContent}
        >
          Agendar teleconsulta
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('MyTreatment')}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          textColor={COLORS.primaryGreenDark}
        >
          Ver meu tratamento
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  loading: { flex: 1, justifyContent: 'center', backgroundColor: COLORS.offWhite },
  scrollContent: { padding: 24, paddingBottom: 90 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: { color: COLORS.neutralDark, fontSize: 24 },
  name: { fontWeight: 'bold' },
  headerActions: { flexDirection: 'row' },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  calendarWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 8,
    paddingBottom: 16,
    marginBottom: 20,
    elevation: 3,
  },
  calendar: { borderRadius: 16 },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 4, marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: COLORS.neutralMedium },
  alertCard: {
    backgroundColor: COLORS.secondaryWarningLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondaryWarning,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertTitle: { fontWeight: 'bold', color: '#8A6818', marginLeft: 8, fontSize: 16 },
  alertDescription: { color: '#8A6818', fontSize: 14, lineHeight: 20 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.neutralDark, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.neutralMedium },
  mainButton: { borderRadius: 28, backgroundColor: COLORS.primaryGreen, marginTop: 4 },
  secondaryButton: { borderRadius: 28, borderColor: COLORS.primaryGreen, marginTop: 12 },
  buttonContent: { height: 54 },
});
