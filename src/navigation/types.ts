import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Medications: undefined;
  Scheduling: undefined;
  Locations: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  MyTreatment: undefined;
  MyDocuments: undefined;
  Notifications: undefined;
  AppointmentDetails: { appointmentId: number };
};
