import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function LoginScreen({ navigation }: any) {
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
            AutoCusto Fácil
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          <TextInput
            mode="outlined"
            placeholder="Digite seu CPF"
            left={<TextInput.Icon icon="card-account-details-outline" color={COLORS.neutralMedium} />}
            style={styles.input}
            outlineColor={COLORS.divider}
            activeOutlineColor={COLORS.primary}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            placeholder="Digite sua senha"
            secureTextEntry
            left={<TextInput.Icon icon="lock-outline" color={COLORS.neutralMedium} />}
            style={styles.input}
            outlineColor={COLORS.divider}
            activeOutlineColor={COLORS.primary}
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.loginButton}
            labelStyle={styles.loginButtonLabel}
          >
            Entrar
          </Button>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Não possui uma conta? </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.neutralMedium,
    fontSize: 14,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.primaryGreen,
    fontSize: 15,
    fontWeight: 'bold',
  }
});
