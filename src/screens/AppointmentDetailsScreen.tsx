import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS } from '../theme';
import { getTeleconsultation } from '../database/repositories';
import type { Teleconsultation } from '../types/domain';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentDetails'>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export default function AppointmentDetailsScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();
  const [appointment, setAppointment] = useState<Teleconsultation | null>(null);

  useFocusEffect(
    useCallback(() => {
      getTeleconsultation(db, route.params.appointmentId).then(setAppointment);
    }, [db, route.params.appointmentId]),
  );

  if (!appointment) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isAppointmentDay = today === appointment.appointmentDate;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.neutralDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da teleconsulta</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <MaterialCommunityIcons name="bell-outline" size={27} color={COLORS.primaryGreen} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="video-outline" size={36} color={COLORS.white} />
          </View>
          <Text style={styles.heroTitle}>Renovação de Receita de Alto Custo</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Agendada</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Detail icon="calendar-outline" label="Data" value={formatDate(appointment.appointmentDate)} />
          <Detail icon="clock-outline" label="Horário" value={appointment.appointmentTime} />
          <Detail icon="pill" label="Medicamento" value={appointment.medicationName} />
          <Detail icon="text-box-outline" label="Motivo" value={appointment.requestReason} />
          {appointment.notes && (
            <Detail icon="note-text-outline" label="Observações" value={appointment.notes} />
          )}
        </View>

        <Button
          mode="contained"
          icon="video"
          disabled={!isAppointmentDay}
          onPress={() => Alert.alert(
            'Sala de teleconsulta',
            'A sala virtual de demonstração foi acessada com sucesso.',
          )}
          style={styles.videoButton}
          contentStyle={styles.videoButtonContent}
        >
          Acessar teleconsulta
        </Button>
        {!isAppointmentDay && (
          <Text style={styles.availabilityText}>
            A sala ficará disponível na data e no horário agendados.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={22}
          color={COLORS.primaryGreenDark}
        />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    minHeight: 62,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.neutralDark },
  content: { padding: 20 },
  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreenSoft,
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreen,
    marginBottom: 14,
  },
  heroTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.neutralDark, textAlign: 'center' },
  statusBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 12,
  },
  statusText: { color: COLORS.primaryGreenDark, fontWeight: 'bold', fontSize: 12 },
  detailsCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, elevation: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreenSoft,
    marginRight: 12,
  },
  detailText: { flex: 1 },
  detailLabel: { color: COLORS.neutralMedium, fontSize: 12, marginBottom: 3 },
  detailValue: { color: COLORS.neutralDark, fontSize: 15, lineHeight: 21 },
  videoButton: { borderRadius: 27, backgroundColor: COLORS.primaryGreen, marginTop: 20 },
  videoButtonContent: { height: 54 },
  availabilityText: { color: COLORS.neutralMedium, textAlign: 'center', fontSize: 12, marginTop: 10 },
});
