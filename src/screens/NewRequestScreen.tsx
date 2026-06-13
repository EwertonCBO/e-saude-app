import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

export default function NewRequestScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [medication, setMedication] = useState('');
  const [delivery, setDelivery] = useState('home');

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Qual medicamento você precisa?</Text>
      <TextInput
        mode="outlined"
        label="Nome do Medicamento"
        value={medication}
        onChangeText={setMedication}
        style={styles.input}
        theme={{ colors: { primary: COLORS.primary } }}
      />
      <Button
        mode="contained"
        disabled={!medication}
        onPress={() => setStep(2)}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        buttonColor={COLORS.primary}
      >
        Avançar
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleLarge" style={styles.stepTitle}>Como deseja receber?</Text>
      
      <RadioButton.Group onValueChange={value => setDelivery(value)} value={delivery}>
        <View style={styles.radioOption}>
          <RadioButton value="home" color={COLORS.primary} />
          <Text style={styles.radioLabel}>Receber em Casa (Delivery SMS)</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton value="pickup" color={COLORS.primary} />
          <Text style={styles.radioLabel}>Retirar na Farmácia Cidadã</Text>
        </View>
      </RadioButton.Group>

      <View style={styles.buttonGroup}>
        <Button
          mode="outlined"
          onPress={() => setStep(1)}
          style={[styles.button, styles.buttonHalf]}
          textColor={COLORS.primary}
        >
          Voltar
        </Button>
        <Button
          mode="contained"
          onPress={() => setStep(3)}
          style={[styles.button, styles.buttonHalf]}
          labelStyle={styles.buttonLabel}
          buttonColor={COLORS.primary}
        >
          Finalizar
        </Button>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={[styles.stepContainer, styles.centerAlign]}>
      <Text variant="headlineMedium" style={styles.successTitle}>Sucesso!</Text>
      <Text variant="titleMedium" style={styles.successText}>
        Sua solicitação de {medication} foi enviada.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Status')}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        buttonColor={COLORS.success}
      >
        Acompanhar Status
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Home')}
        textColor={COLORS.primary}
        style={{ marginTop: 16 }}
      >
        Voltar ao Início
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Nova Solicitação</Text>
          <Text variant="bodyLarge" style={styles.stepIndicator}>Passo {step} de 3</Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepIndicator: {
    color: '#666',
    marginTop: 8,
  },
  stepContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stepTitle: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
    fontSize: 18,
  },
  button: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  radioLabel: {
    fontSize: 18,
    color: COLORS.neutralDark,
    marginLeft: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buttonHalf: {
    width: '48%',
  },
  centerAlign: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 32,
    color: COLORS.neutralDark,
    lineHeight: 24,
  },
});
