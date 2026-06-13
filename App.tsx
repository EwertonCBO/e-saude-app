import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { theme, COLORS } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { migrateDatabase } from './src/database/migrations';
import { AuthProvider } from './src/context/AuthContext';
import { AppDataProvider } from './src/context/AppDataContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SQLiteProvider databaseName="Altocusto.db" onInit={migrateDatabase}>
          <AuthProvider>
            <AppDataProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.offWhite}
                translucent={Platform.OS === 'android'}
              />
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </AppDataProvider>
          </AuthProvider>
        </SQLiteProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
