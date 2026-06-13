import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MyMedicationsScreen from '../screens/MyMedicationsScreen';
import StatusScreen from '../screens/StatusScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MyTreatmentScreen from '../screens/MyTreatmentScreen';
import MyDocumentsScreen from '../screens/MyDocumentsScreen';
import NewRequestScreen from '../screens/NewRequestScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryGreen,
        tabBarInactiveTintColor: COLORS.neutralMedium,
      }}
    >
      <Tab.Screen 
        name="Início" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Medicamentos" 
        component={MyMedicationsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Onde Ir" 
        component={StatusScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Notificações" 
        component={NotificationsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
          ),
          tabBarBadge: 2,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MyTreatment" component={MyTreatmentScreen} />
      <Stack.Screen name="MyDocuments" component={MyDocumentsScreen} />
      <Stack.Screen name="NewRequest" component={NewRequestScreen} />
    </Stack.Navigator>
  );
}
