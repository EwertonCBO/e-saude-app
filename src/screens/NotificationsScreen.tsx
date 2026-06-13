import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getNotifications, markNotificationAsRead } from '../database/repositories';
import type { AppNotification } from '../types/domain';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { revision, notifyDataChanged } = useAppData();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      return;
    }
    setNotifications(await getNotifications(db, userId));
    setIsLoading(false);
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications, revision]),
  );

  const readNotification = async (notification: AppNotification) => {
    if (notification.isRead) {
      return;
    }
    await markNotificationAsRead(db, notification.id);
    notifyDataChanged();
    await loadNotifications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={30} color={COLORS.neutralDark} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Notificações</Text>
          <Text style={styles.headerSubtitle}>Toque em um aviso para marcá-lo como lido.</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primaryGreen} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {notifications.map((notification) => {
            const isWarning = notification.type === 'warning';
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.card,
                  isWarning ? styles.cardWarning : styles.cardSuccess,
                  notification.isRead && styles.cardRead,
                ]}
                onPress={() => readNotification(notification)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={isWarning ? 'clipboard-alert-outline' : 'bell-check-outline'}
                      size={24}
                      color={isWarning ? COLORS.secondaryWarning : COLORS.primaryGreen}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{notification.title}</Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardDescription}>{notification.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: { fontSize: 23, fontWeight: 'bold', color: COLORS.neutralDark },
  headerSubtitle: { color: COLORS.neutralMedium, marginTop: 4, fontSize: 13 },
  loader: { marginTop: 48 },
  scrollContent: { padding: 24 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardWarning: { backgroundColor: COLORS.secondaryWarningLight, borderColor: '#fdebcc' },
  cardSuccess: { backgroundColor: COLORS.primaryGreenSoft, borderColor: '#d9eee7' },
  cardRead: { opacity: 0.58 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: COLORS.white,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.neutralDark, flex: 1 },
  cardDescription: { fontSize: 14, color: COLORS.neutralMedium, lineHeight: 20, marginLeft: 52 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primaryGreen },
});
