import React, { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { attachDocument, getDocuments, removeDocument } from '../database/repositories';
import type { PatientDocument } from '../types/domain';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyDocuments'>;
const DOCUMENTS_DIRECTORY = `${FileSystem.documentDirectory}patient-documents/`;

async function persistFile(sourceUri: string, originalName?: string) {
  const directoryInfo = await FileSystem.getInfoAsync(DOCUMENTS_DIRECTORY);
  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOCUMENTS_DIRECTORY, { intermediates: true });
  }

  const extension = originalName?.split('.').pop() ?? sourceUri.split('.').pop() ?? 'jpg';
  const destination = `${DOCUMENTS_DIRECTORY}${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export default function MyDocumentsScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { revision, notifyDataChanged } = useAppData();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    if (!userId) {
      return;
    }
    setDocuments(await getDocuments(db, userId));
    setIsLoading(false);
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments, revision]),
  );

  const saveDocument = async (
    type: PatientDocument['type'],
    sourceUri: string,
    originalName?: string,
  ) => {
    if (!userId) {
      return;
    }
    const storedUri = await persistFile(sourceUri, originalName);
    await attachDocument(db, userId, type, storedUri);
    notifyDataChanged();
    await loadDocuments();
  };

  const photographPrescription = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o uso da câmera para fotografar a receita.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      await saveDocument('prescription', result.assets[0].uri, result.assets[0].fileName ?? undefined);
    }
  };

  const pickDocument = async (type: PatientDocument['type']) => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ['image/*', 'application/pdf'],
    });
    if (!result.canceled) {
      await saveDocument(type, result.assets[0].uri, result.assets[0].name);
    }
  };

  const chooseDocumentType = () => {
    Alert.alert('Tipo de documento', 'Qual documento deseja anexar?', [
      { text: 'RG', onPress: () => pickDocument('rg') },
      { text: 'CPF', onPress: () => pickDocument('cpf') },
      { text: 'Receita', onPress: () => pickDocument('prescription') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const openDocument = (document: PatientDocument) => {
    if (!document.fileUri) {
      pickDocument(document.type);
      return;
    }
    Alert.alert(document.title, 'O documento está armazenado neste aparelho.', [
      {
        text: 'Abrir',
        onPress: async () => {
          const uri = Platform.OS === 'android'
            ? await FileSystem.getContentUriAsync(document.fileUri!)
            : document.fileUri!;
          await Linking.openURL(uri);
        },
      },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await FileSystem.deleteAsync(document.fileUri!, { idempotent: true });
          await removeDocument(db, document.id);
          notifyDataChanged();
          await loadDocuments();
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.neutralDark} />
            <Text style={styles.headerTitle}>Meus documentos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={27} color={COLORS.primaryGreen} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionCard} onPress={photographPrescription}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="camera-outline" size={28} color={COLORS.primaryGreen} />
          </View>
          <Text style={styles.actionText}>Fotografar receita</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={chooseDocumentType}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="folder-upload-outline" size={28} color={COLORS.primaryGreen} />
          </View>
          <Text style={styles.actionText}>Anexar documento</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.primaryGreen} />
        ) : (
          <View style={styles.listContainer}>
            {documents.map((document) => {
              const isAttached = document.status === 'attached';
              return (
                <TouchableOpacity
                  key={document.id}
                  style={styles.documentRow}
                  onPress={() => openDocument(document)}
                >
                  <View style={styles.rowContent}>
                    <View style={[styles.checkbox, isAttached && styles.checkboxActive]}>
                      {isAttached && (
                        <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.rowTitle}>{document.title}</Text>
                      <Text style={styles.rowStatus}>
                        {isAttached ? 'Anexado' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.neutralMedium} />
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
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.neutralDark, marginLeft: 8 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
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
  actionText: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.neutralDark },
  loader: { marginTop: 32 },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
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
  checkboxActive: { backgroundColor: COLORS.primaryGreen, borderColor: COLORS.primaryGreen },
  rowTitle: { fontSize: 16, color: COLORS.neutralDark },
  rowStatus: { fontSize: 12, color: COLORS.neutralMedium, marginTop: 2 },
});
