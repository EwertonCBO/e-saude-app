import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS } from '../theme';
import { authenticate } from '../database/repositories';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const db = useSQLiteContext();
  const { signIn } = useAuth();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!cpf || !password) {
      Alert.alert('Dados incompletos', 'Informe o CPF e a senha.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await authenticate(db, cpf, password);
      if (!user) {
        Alert.alert('Acesso não autorizado', 'CPF ou senha inválidos.');
        return;
      }
      await signIn(user.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* LOGO */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="heart" size={64} color={COLORS.primaryGreen} />
            <MaterialCommunityIcons name="plus" size={32} color={COLORS.white} style={styles.logoPlus} />
          </View>
          <Text variant="headlineLarge" style={styles.logoText}>
            Altocusto Fácil
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          <TextInput
            mode="outlined"
            placeholder="Digite seu CPF"
            value={cpf}
            onChangeText={setCpf}
            left={<TextInput.Icon icon="card-account-details-outline" color={COLORS.neutralMedium} />}
            style={styles.input}
            outlineColor={COLORS.divider}
            activeOutlineColor={COLORS.primary}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            left={<TextInput.Icon icon="lock-outline" color={COLORS.neutralMedium} />}
            style={styles.input}
            outlineColor={COLORS.divider}
            activeOutlineColor={COLORS.primary}
          />

          <View style={styles.demoCredentials}>
            <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primaryGreenDark} />
            <Text style={styles.demoCredentialsText}>
              Demonstração: CPF 123.456.789-00 e senha 1234
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.loginButton}
            labelStyle={styles.loginButtonLabel}
          >
            Entrar
          </Button>

        </View>

      </View>

      {/* Decorative Footer Area */}
      <View style={styles.footerDecoration}>
        <MaterialCommunityIcons name="city-variant-outline" size={100} color={COLORS.primaryGreenLight} style={{ opacity: 0.3 }} />
        <MaterialCommunityIcons name="hospital-building" size={120} color={COLORS.primaryGreen} style={{ opacity: 0.2, marginLeft: -20, marginTop: 20 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoPlus: {
    position: 'absolute',
  },
  logoText: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  demoCredentials: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreenSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  demoCredentialsText: {
    flex: 1,
    color: COLORS.primaryGreenDark,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
  },
  loginButton: {
    borderRadius: 24,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryGreen,
  },
  loginButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerDecoration: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    opacity: 0.8,
    zIndex: 1,
  },
});
