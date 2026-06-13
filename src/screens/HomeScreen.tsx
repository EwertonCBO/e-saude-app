import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../theme';

// Configurando Calendário para PT-BR
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const InfoCard = ({ title, subtitle, icon, type, onPress }: any) => {
  const isWarning = type === 'warning';
  
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isWarning ? styles.cardWarning : styles.cardSuccess
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, isWarning ? styles.iconWarning : styles.iconSuccess]}>
        <MaterialCommunityIcons 
           name={icon} 
           size={28} 
           color={isWarning ? COLORS.secondaryWarning : COLORS.primaryGreen} 
        />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardSubtitle, isWarning ? styles.subtitleWarning : styles.subtitleSuccess]}>
          {subtitle}
        </Text>
      </View>
      {onPress && (
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
      )}
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }: any) {
  // Gerando Datas Dinâmicas Fictícias
  const today = new Date();
  const expireDate = new Date();
  expireDate.setDate(today.getDate() + 5);
  const expireDateString = expireDate.toISOString().split('T')[0];

  const batchDate = new Date();
  batchDate.setDate(today.getDate() + 12);
  const batchDateString = batchDate.toISOString().split('T')[0];

  const markedDates = {
    [expireDateString]: {
      marked: true,
      dotColor: COLORS.secondaryWarning,
      selected: true,
      selectedColor: COLORS.secondaryWarningLight,
      selectedTextColor: COLORS.secondaryWarning
    },
    [batchDateString]: {
      marked: true,
      dotColor: COLORS.primaryGreenDark,
      selected: true,
      selectedColor: COLORS.primaryGreenSoft,
      selectedTextColor: COLORS.primaryGreenDark
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={styles.greetingTitle}>Inicio</Text>
            <Text variant="titleLarge" style={styles.greeting}>
              Olá, <Text style={styles.name}>Ewerton</Text> 👋
            </Text>
          </View>
          <View style={styles.avatarContainer}>
             <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=ewerton' }} 
                style={styles.avatarImage} 
             />
          </View>
        </View>

        {/* Novo Calendário */}
        <View style={styles.calendarWrapper}>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: COLORS.primaryGreen,
              selectedDayTextColor: '#ffffff',
              todayTextColor: COLORS.primaryGreen,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: COLORS.primaryGreen,
              selectedDotColor: '#ffffff',
              arrowColor: COLORS.primaryGreen,
              monthTextColor: COLORS.neutralDark,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
            markedDates={markedDates}
          />
          {/* Legenda do Calendário */}
          <View style={styles.legendContainer}>
             <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.secondaryWarning }]} />
                <Text style={styles.legendText}>Vencimento Receita</Text>
             </View>
             <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primaryGreenDark }]} />
                <Text style={styles.legendText}>Chegada de Novo Lote</Text>
             </View>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {/* Alerta de Renovação Adicionado */}
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
               <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.secondaryWarning} />
               <Text style={styles.alertTitle}>Próxima renovação</Text>
            </View>
            <Text style={styles.alertDescription}>
               Sua receita tem vencimento nos próximos 5 dias. Não se esqueça de agendar sua consulta médica para renová-la.
            </Text>
          </View>

          <InfoCard
            type="warning"
            title="Receita:"
            subtitle="Vence em 5 dias"
            icon="clipboard-text"
            onPress={() => navigation.navigate('MyTreatment')}
          />
          
          <InfoCard
            type="success"
            title="Medicamento:"
            subtitle="Losartana 50mg"
            icon="pill"
          />
        </View>

        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('MyTreatment')}
          style={styles.mainButton}
          labelStyle={styles.mainButtonLabel}
          contentStyle={{ height: 56 }}
        >
          Ver meu tratamento
        </Button>

      </ScrollView>

      {/* Decorative Footer Area */}
      <View style={styles.footerDecoration} pointerEvents="none">
        <MaterialCommunityIcons name="hospital-building" size={140} color={COLORS.primaryGreen} style={{ opacity: 0.15, marginLeft: -20, marginBottom: -10 }} />
        <MaterialCommunityIcons name="city-variant-outline" size={100} color={COLORS.primaryGreenLight} style={{ opacity: 0.2, marginLeft: 20 }} />
      </View>
      
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
    zIndex: 2,
    paddingBottom: 90, // Adicionado para dar espaço ao footer se as coisas crescerem
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // Reduzido pois tem o calendário abaixo
    marginTop: 10,
  },
  greetingTitle: {
    fontSize: 20,
    color: COLORS.neutralDark,
    marginBottom: 8,
    fontWeight: '600',
  },
  greeting: {
    fontWeight: 'normal',
    color: COLORS.neutralDark,
    fontSize: 24,
  },
  name: {
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  calendarWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 8,
    paddingBottom: 16,
    marginBottom: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.neutralMedium,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardWarning: {
    borderColor: '#FBE8C4',
  },
  cardSuccess: {
    borderColor: COLORS.primaryGreenSoft,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconWarning: {
    backgroundColor: COLORS.secondaryWarningLight,
  },
  iconSuccess: {
    backgroundColor: COLORS.primaryGreenSoft,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitleWarning: {
    color: COLORS.secondaryWarning,
  },
  subtitleSuccess: {
    color: COLORS.primaryGreenDark,
  },
  mainButton: {
    borderRadius: 28,
    backgroundColor: COLORS.primaryGreen,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  alertCard: {
    backgroundColor: COLORS.secondaryWarningLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondaryWarning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#8A6818',
    marginLeft: 8,
    fontSize: 16,
  },
  alertDescription: {
    color: '#8A6818',
    fontSize: 14,
    lineHeight: 20,
  }
});
