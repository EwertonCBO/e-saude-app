export type NotificationType = 'warning' | 'success' | 'info';
export type DocumentStatus = 'pending' | 'attached';

export interface User {
  id: number;
  name: string;
  cpf: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  remaining: number;
  total: number;
  status: string;
  isCritical: boolean;
}

export interface Prescription {
  id: number;
  medicationId: number;
  medicationName: string;
  expiresAt: string;
}

export interface TreatmentStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  position: number;
  status: 'complete' | 'warning' | 'pending';
  actionRoute: 'MyDocuments' | 'Locations' | null;
}

export interface Pharmacy {
  id: number;
  title: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

export interface PatientDocument {
  id: number;
  type: 'prescription' | 'rg' | 'cpf';
  title: string;
  status: DocumentStatus;
  fileUri: string | null;
  updatedAt: string | null;
}

export interface CalendarEvent {
  id: number;
  type: 'prescription_expiration' | 'new_batch' | 'teleconsultation';
  title: string;
  eventDate: string;
}

export interface Teleconsultation {
  id: number;
  medicationName: string;
  requestReason: string;
  prescriptionExpiresAt: string;
  notes: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface HomeData {
  user: User;
  prescription: Prescription | null;
  medication: Medication | null;
  events: CalendarEvent[];
  appointments: Teleconsultation[];
}
