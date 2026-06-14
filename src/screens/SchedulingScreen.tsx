import React, { useCallback, useState, useRef } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import {
  createPrescriptionRenewalTeleconsultation,
  getPrescription,
  getTeleconsultations,
} from '../database/repositories';
import type { Teleconsultation } from '../types/domain';
import type { RootStackParamList } from '../navigation/types';

const APPOINTMENT_OPTIONS = [
  { title: 'Triagem Odontológica', icon: 'tooth-outline', enabled: false },
  { title: 'Médico da Família', icon: 'doctor', enabled: false },
  { title: 'Enfermeiro', icon: 'medical-bag', enabled: false },
  {
    title: 'Renovação de Receita de Alto Custo',
    icon: 'file-document-refresh-outline',
    enabled: true,
  },
] as const;

const RENEWAL_REASONS = [
  'Receita próxima do vencimento',
  'Receita vencida',
  'Alteração no tratamento',
  'Outro',
] as const;

const HIGH_COST_MEDICATIONS = [
  'Adalimumabe (Humira)',
  'Infliximabe (Remicade)',
  'Etanercepte (Enbrel)',
  'Rituximabe (MabThera)',
  'Secuquinumabe (Cosentyx)',
  'Ustequinumabe (Stelara)',
  'Vedolizumabe (Entyvio)',
  'Golimumabe (Simponi)',
  'Tocilizumabe (Actemra)',
  'Omalizumabe (Xolair)',
];

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));
}

export default function SchedulingScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useAuth();
  const { revision, notifyDataChanged } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [requestReason, setRequestReason] = useState<string>(RENEWAL_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [appointments, setAppointments] = useState<Teleconsultation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasPreFilled = useRef(false);

  const loadData = useCallback(async () => {
    if (!userId) {
      return;
    }
    const [prescription, nextAppointments] = await Promise.all([
      getPrescription(db, userId),
      getTeleconsultations(db, userId),
    ]);
    if (prescription && !hasPreFilled.current) {
      setMedicationName(prescription.medicationName);
      setExpirationDate(new Date(`${prescription.expiresAt}T12:00:00`));
      hasPreFilled.current = true;
    }
    setAppointments(nextAppointments);
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, revision]),
  );

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setExpirationDate(date);
    }
  };

  const filteredMedications = HIGH_COST_MEDICATIONS.filter(med => 
    med.toLowerCase().includes(medicationName.toLowerCase())
  );

  const submit = async () => {
    const finalReason = requestReason === 'Outro'
      ? otherReason.trim()
      : requestReason;

    if (!userId || !medicationName.trim() || !finalReason) {
      Alert.alert('Dados incompletos', 'Informe o medicamento e o motivo da solicitação.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPrescriptionRenewalTeleconsultation(db, userId, {
        medicationName,
        requestReason: finalReason,
        prescriptionExpiresAt: toDateString(expirationDate),
        notes,
      });
      notifyDataChanged();
      setShowForm(false);
      setRequestReason(RENEWAL_REASONS[0]);
      setOtherReason('');
      setNotes('');
      await loadData();
      Alert.alert(
        'Solicitação registrada',
        'Solicitação registrada com sucesso. Em breve um profissional de saúde realizará a avaliação para renovação da receita.',
        [
          {
            text: 'Ver agendamento',
            onPress: () => navigation.navigate('AppointmentDetails', {
              appointmentId: result.appointmentId,
            }),
          },
        ],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!showForm ? (
          <>
            <Text style={styles.intro}>
              Escolha o atendimento que deseja solicitar.
            </Text>
            {APPOINTMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.title}
                style={[styles.optionCard, !option.enabled && styles.optionDisabled]}
                onPress={() => option.enabled && setShowForm(true)}
                disabled={!option.enabled}
              >
                <View style={[
                  styles.optionIcon,
                  option.enabled && styles.optionIconActive,
                ]}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={29}
                    color={option.enabled ? COLORS.white : COLORS.neutralMedium}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>
                    {option.enabled
                      ? 'Solicite avaliação remota para atualizar sua receita.'
                      : 'Disponível em breve'}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={option.enabled ? 'chevron-right' : 'lock-outline'}
                  size={24}
                  color={option.enabled ? COLORS.primaryGreen : COLORS.neutralMedium}
                />
              </TouchableOpacity>
            ))}

            {appointments.length > 0 && (
              <View style={styles.appointmentsSection}>
                <Text style={styles.sectionTitle}>Próximas teleconsultas</Text>
                {appointments.map((appointment) => (
                  <TouchableOpacity
                    key={appointment.id}
                    style={styles.appointmentCard}
                    onPress={() => navigation.navigate('AppointmentDetails', {
                      appointmentId: appointment.id,
                    })}
                  >
                    <MaterialCommunityIcons
                      name="video-outline"
                      size={27}
                      color={COLORS.primaryGreenDark}
                    />
                    <View style={styles.appointmentText}>
                      <Text style={styles.appointmentTitle}>Renovação de receita</Text>
                      <Text style={styles.appointmentSubtitle}>
                        {formatDate(appointment.appointmentDate)} às {appointment.appointmentTime}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.formCard}>
            <TouchableOpacity style={styles.formBack} onPress={() => setShowForm(false)}>
              <MaterialCommunityIcons name="chevron-left" size={25} color={COLORS.primaryGreenDark} />
              <Text style={styles.formBackText}>Escolher outro atendimento</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Renovação de Receita de Alto Custo</Text>
            <View style={styles.autocompleteContainer}>
              <TextInput
                mode="outlined"
                label="Nome do medicamento"
                value={medicationName}
                onChangeText={(text) => {
                  setMedicationName(text);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                style={styles.input}
              />
              {showSuggestions && filteredMedications.length > 0 && (
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.suggestionsList}>
                  {filteredMedications.map(med => (
                    <TouchableOpacity 
                      key={med} 
                      style={styles.suggestionItem}
                      onPress={() => {
                        setMedicationName(med);
                        setShowSuggestions(false);
                      }}
                    >
                      <Text style={styles.suggestionText}>{med}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            <Text style={styles.fieldLabel}>Motivo da solicitação</Text>
            <View style={styles.reasonList}>
              {RENEWAL_REASONS.map((reason) => {
                const isSelected = requestReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      isSelected && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setRequestReason(reason)}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={isSelected ? COLORS.primaryGreen : COLORS.neutralMedium}
                    />
                    <Text style={[
                      styles.reasonText,
                      isSelected && styles.reasonTextSelected,
                    ]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {requestReason === 'Outro' && (
              <TextInput
                mode="outlined"
                label="Descreva o motivo"
                value={otherReason}
                onChangeText={setOtherReason}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            )}
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowDatePicker(true)}
            >
              <View>
                <Text style={styles.dateLabel}>Data de vencimento da receita</Text>
                <Text style={styles.dateValue}>{formatDate(toDateString(expirationDate))}</Text>
              </View>
              <MaterialCommunityIcons name="calendar-outline" size={25} color={COLORS.primaryGreenDark} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
              />
            )}
            <TextInput
              mode="outlined"
              label="Observações (opcional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <Button
              mode="contained"
              icon="video-plus-outline"
              onPress={submit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
              contentStyle={styles.submitContent}
            >
              Solicitar teleconsulta
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 20, paddingBottom: 40 },
  intro: { color: COLORS.neutralMedium, fontSize: 15, marginBottom: 18 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryGreenSoft,
    elevation: 2,
  },
  optionDisabled: { opacity: 0.62, elevation: 0 },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
    marginRight: 14,
  },
  optionIconActive: { backgroundColor: COLORS.primaryGreen },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.neutralDark },
  optionSubtitle: { color: COLORS.neutralMedium, fontSize: 13, marginTop: 3, lineHeight: 18 },
  appointmentsSection: { marginTop: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.neutralDark, marginBottom: 12 },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreenSoft,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },
  appointmentText: { flex: 1, marginLeft: 12 },
  appointmentTitle: { fontWeight: 'bold', color: COLORS.neutralDark },
  appointmentSubtitle: { color: COLORS.primaryGreenDark, marginTop: 3, fontSize: 13 },
  formCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, elevation: 2 },
  formBack: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  formBackText: { color: COLORS.primaryGreenDark, fontWeight: '600' },
  formTitle: { fontSize: 21, fontWeight: 'bold', color: COLORS.neutralDark, marginBottom: 20 },
  fieldLabel: {
    color: COLORS.neutralDark,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },
  reasonList: {
    marginBottom: 15,
  },
  reasonOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 13,
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  reasonOptionSelected: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreenSoft,
  },
  reasonText: {
    color: COLORS.neutralDark,
    fontSize: 14,
    marginLeft: 10,
  },
  reasonTextSelected: {
    color: COLORS.primaryGreenDark,
    fontWeight: '600',
  },
  input: { marginBottom: 15, backgroundColor: COLORS.white },
  autocompleteContainer: { zIndex: 1 },
  suggestionsList: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryGreenSoft,
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 15,
    maxHeight: 180,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.offWhite,
  },
  suggestionText: {
    color: COLORS.neutralDark,
    fontSize: 14,
  },
  dateField: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: COLORS.neutralMedium,
    borderRadius: 5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateLabel: { color: COLORS.neutralMedium, fontSize: 12 },
  dateValue: { color: COLORS.neutralDark, fontSize: 16, marginTop: 3 },
  submitButton: { borderRadius: 27, backgroundColor: COLORS.primaryGreen, marginTop: 4 },
  submitContent: { height: 54 },
});
