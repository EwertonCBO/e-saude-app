import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const NotificationCard = ({ title, description, type, onPress }: any) => {
  const isWarning = type === 'warning';
  
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isWarning ? styles.cardWarning : styles.cardSuccess
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, isWarning ? styles.iconWarning : styles.iconSuccess]}>
          <MaterialCommunityIcons 
             name={isWarning ? 'clipboard-text' : 'pill'} 
             size={24} 
             color={isWarning ? COLORS.secondaryWarning : COLORS.primaryGreen} 
          />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.neutralDark} />
            <Text variant="titleLarge" style={styles.headerTitle}>Notificações</Text>
          </TouchableOpacity>
          <View>
             <MaterialCommunityIcons name="bell-badge" size={28} color={COLORS.primaryGreen} />
          </View>
        </View>

        <NotificationCard
           type="warning"
           title="Renove sua receita!"
           description="Sua receita de Losartana vence em 5 dias, agende uma consulta médica para reavaliar."
           onPress={() => {}}
        />

        <NotificationCard
           type="success"
           title="Hora de retirar seu medicamento:"
           description="Seu medicamento Losartana 50mg Diário está liberado para retirada."
           onPress={() => {}}
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
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    marginLeft: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardWarning: {
    backgroundColor: COLORS.secondaryWarningLight,
    borderColor: '#fdebcc',
  },
  cardSuccess: {
    backgroundColor: COLORS.primaryGreenSoft,
    borderColor: '#d9eee7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWarning: {
    backgroundColor: COLORS.white,
  },
  iconSuccess: {
    backgroundColor: COLORS.white,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.neutralMedium,
    lineHeight: 20,
    marginLeft: 52, // Align with title text
  },
});
