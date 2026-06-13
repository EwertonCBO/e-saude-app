import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MyMedicationsScreen from '../screens/MyMedicationsScreen';
import StatusScreen from '../screens/StatusScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SchedulingScreen from '../screens/SchedulingScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';
import MyTreatmentScreen from '../screens/MyTreatmentScreen';
import MyDocumentsScreen from '../screens/MyDocumentsScreen';
import GlobalHeader from '../components/GlobalHeader';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getUnreadNotificationCount } from '../database/repositories';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { revision } = useAppData();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    getUnreadNotificationCount(db, userId).then(setUnreadCount);
  }, [db, revision, userId]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => (
          <GlobalHeader
            title={
              route.name === 'Home'
                ? 'Início'
                : route.name === 'Medications'
                  ? 'Medicamentos'
                  : route.name === 'Scheduling'
                    ? 'Agendamentos'
                    : 'Onde ir'
            }
            unreadCount={unreadCount}
            onNotificationsPress={() => navigation.navigate('Notifications')}
          />
        ),
        tabBarActiveTintColor: COLORS.primaryGreen,
        tabBarInactiveTintColor: COLORS.neutralMedium,
      })}
    >
      <Tab.Screen 
        name="Home"
        component={HomeScreen} 
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Medications"
        component={MyMedicationsScreen} 
        options={{
          title: 'Medicamentos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scheduling"
        component={SchedulingScreen}
        options={{
          title: 'Agendamentos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Locations"
        component={StatusScreen}
        options={{
          title: 'Onde Ir',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading, hasCompletedOnboarding, userId } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  if (!userId) {
    return <LoginScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MyTreatment" component={MyTreatmentScreen} />
      <Stack.Screen name="MyDocuments" component={MyDocumentsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
  },
});
