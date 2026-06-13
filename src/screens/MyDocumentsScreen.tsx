import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const DocumentRow = ({ title, isChecked, onPress }: any) => {
  return (
    <View style={styles.documentRow}>
      <TouchableOpacity style={styles.rowContent} onPress={onPress}>
        <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
          {isChecked && <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />}
        </View>
        <Text style={styles.rowTitle}>{title}</Text>
      </TouchableOpacity>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
    </View>
  );
};

export default function MyDocumentsScreen({ navigation }: any) {
  const [checkedItems, setCheckedItems] = React.useState({
    receita: true,
    rg: true,
    cpf: true,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.neutralDark} />
            <Text variant="titleLarge" style={styles.headerTitle}>Meus Documentos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="camera-outline" size={28} color={COLORS.primaryGreen} />
          </View>
          <Text style={styles.actionText}>Fotografar Receita</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="folder-upload-outline" size={28} color={COLORS.primaryGreen} />
          </View>
          <Text style={styles.actionText}>Anexar Documentos</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
        </TouchableOpacity>

        <View style={styles.listContainer}>
          <DocumentRow 
            title="Receita médica" 
            isChecked={checkedItems.receita} 
            onPress={() => setCheckedItems(prev => ({...prev, receita: !prev.receita}))} 
          />
          <Divider />
          <DocumentRow 
            title="RG" 
            isChecked={checkedItems.rg} 
            onPress={() => setCheckedItems(prev => ({...prev, rg: !prev.rg}))} 
          />
          <Divider />
          <DocumentRow 
            title="CPF" 
            isChecked={checkedItems.cpf} 
            onPress={() => setCheckedItems(prev => ({...prev, cpf: !prev.cpf}))} 
          />
        </View>

        <Button 
          mode="contained" 
          icon={() => <MaterialCommunityIcons name="circle-slice-8" size={18} color={COLORS.white} />}
          style={styles.bottomButton}
          labelStyle={styles.bottomButtonLabel}
          onPress={() => navigation.goBack()}
        >
          Fotografar
        </Button>

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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutralDark,
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.divider,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  rowTitle: {
    fontSize: 16,
    color: COLORS.neutralDark,
  },
  bottomButton: {
    borderRadius: 24,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryGreenSoft,
  },
  bottomButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryGreenDark,
  },
});
