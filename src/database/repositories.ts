import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  AppNotification,
  CalendarEvent,
  HomeData,
  Medication,
  PatientDocument,
  Pharmacy,
  Prescription,
  Teleconsultation,
  TreatmentStep,
  User,
} from '../types/domain';

type MedicationRow = Omit<Medication, 'isCritical'> & { isCritical: number };
type NotificationRow = Omit<AppNotification, 'isRead'> & { isRead: number };

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, '');
}

export async function authenticate(
  db: SQLiteDatabase,
  cpf: string,
  password: string,
) {
  return db.getFirstAsync<User>(
    `SELECT id, name, cpf
     FROM users
     WHERE cpf = ? AND password = ?`,
    normalizeCpf(cpf),
    password,
  );
}

export async function getUser(db: SQLiteDatabase, userId: number) {
  return db.getFirstAsync<User>(
    'SELECT id, name, cpf FROM users WHERE id = ?',
    userId,
  );
}

export async function getMedications(db: SQLiteDatabase, userId: number) {
  const rows = await db.getAllAsync<MedicationRow>(
    `SELECT id, name, dosage, frequency, remaining, total, status,
      is_critical AS isCritical
     FROM medications
     WHERE user_id = ?
     ORDER BY is_critical DESC, name`,
    userId,
  );
  return rows.map((row) => ({ ...row, isCritical: Boolean(row.isCritical) }));
}

export async function registerMedicationDose(
  db: SQLiteDatabase,
  medicationId: number,
) {
  await db.runAsync(
    `UPDATE medications
     SET remaining = MAX(remaining - 1, 0),
         is_critical = CASE WHEN remaining - 1 <= 7 THEN 1 ELSE is_critical END,
         status = CASE WHEN remaining - 1 <= 7 THEN 'Renovar' ELSE status END
     WHERE id = ?`,
    medicationId,
  );
}

export async function getPrescription(db: SQLiteDatabase, userId: number) {
  return db.getFirstAsync<Prescription>(
    `SELECT p.id, p.medication_id AS medicationId, m.name AS medicationName,
      p.expires_at AS expiresAt
     FROM prescriptions p
     JOIN medications m ON m.id = p.medication_id
     WHERE p.user_id = ?
     ORDER BY p.expires_at
     LIMIT 1`,
    userId,
  );
}

export async function getTreatmentSteps(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<TreatmentStep>(
    `SELECT id, title, subtitle, icon, position, status,
      action_route AS actionRoute
     FROM treatment_steps
     WHERE user_id = ?
     ORDER BY position`,
    userId,
  );
}

export async function getPharmacies(db: SQLiteDatabase) {
  return db.getAllAsync<Pharmacy>(
    `SELECT id, title, status, address, latitude, longitude
     FROM pharmacies
     ORDER BY id`,
  );
}

export async function getNotifications(db: SQLiteDatabase, userId: number) {
  const rows = await db.getAllAsync<NotificationRow>(
    `SELECT id, type, title, description, is_read AS isRead,
      created_at AS createdAt
     FROM notifications
     WHERE user_id = ?
     ORDER BY is_read, created_at DESC`,
    userId,
  );
  return rows.map((row) => ({ ...row, isRead: Boolean(row.isRead) }));
}

export async function getUnreadNotificationCount(
  db: SQLiteDatabase,
  userId: number,
) {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
    userId,
  );
  return result?.count ?? 0;
}

export async function markNotificationAsRead(
  db: SQLiteDatabase,
  notificationId: number,
) {
  await db.runAsync(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    notificationId,
  );
}

export async function getDocuments(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<PatientDocument>(
    `SELECT id, type, title, status, file_uri AS fileUri,
      updated_at AS updatedAt
     FROM patient_documents
     WHERE user_id = ?
     ORDER BY id`,
    userId,
  );
}

export async function attachDocument(
  db: SQLiteDatabase,
  userId: number,
  type: PatientDocument['type'],
  fileUri: string,
) {
  await db.runAsync(
    `UPDATE patient_documents
     SET status = 'attached', file_uri = ?, updated_at = ?
     WHERE user_id = ? AND type = ?`,
    fileUri,
    new Date().toISOString(),
    userId,
    type,
  );
}

export async function removeDocument(
  db: SQLiteDatabase,
  documentId: number,
) {
  await db.runAsync(
    `UPDATE patient_documents
     SET status = 'pending', file_uri = NULL, updated_at = NULL
     WHERE id = ?`,
    documentId,
  );
}

export async function getCalendarEvents(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<CalendarEvent>(
    `SELECT id, type, title, event_date AS eventDate
     FROM calendar_events
     WHERE user_id = ?
     ORDER BY event_date`,
    userId,
  );
}

export async function getTeleconsultations(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<Teleconsultation>(
    `SELECT id, medication_name AS medicationName,
      request_reason AS requestReason,
      prescription_expires_at AS prescriptionExpiresAt,
      notes, appointment_date AS appointmentDate,
      appointment_time AS appointmentTime, status,
      created_at AS createdAt
     FROM teleconsultations
     WHERE user_id = ?
     ORDER BY appointment_date, appointment_time`,
    userId,
  );
}

export async function getTeleconsultation(
  db: SQLiteDatabase,
  appointmentId: number,
) {
  return db.getFirstAsync<Teleconsultation>(
    `SELECT id, medication_name AS medicationName,
      request_reason AS requestReason,
      prescription_expires_at AS prescriptionExpiresAt,
      notes, appointment_date AS appointmentDate,
      appointment_time AS appointmentTime, status,
      created_at AS createdAt
     FROM teleconsultations
     WHERE id = ?`,
    appointmentId,
  );
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextBusinessDay() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return toDateString(date);
}

export async function createPrescriptionRenewalTeleconsultation(
  db: SQLiteDatabase,
  userId: number,
  input: {
    medicationName: string;
    requestReason: string;
    prescriptionExpiresAt: string;
    notes?: string;
  },
) {
  const appointmentDate = nextBusinessDay();
  const appointmentTime = '14:30';
  const createdAt = new Date().toISOString();
  let appointmentId = 0;

  await db.withExclusiveTransactionAsync(async (tx) => {
    const result = await tx.runAsync(
      `INSERT INTO teleconsultations (
        user_id, medication_name, request_reason,
        prescription_expires_at, notes, appointment_date,
        appointment_time, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      userId,
      input.medicationName.trim(),
      input.requestReason.trim(),
      input.prescriptionExpiresAt,
      input.notes?.trim() || null,
      appointmentDate,
      appointmentTime,
      createdAt,
    );
    appointmentId = result.lastInsertRowId;

    await tx.runAsync(
      `INSERT INTO calendar_events (user_id, type, title, event_date)
       VALUES (?, 'teleconsultation', 'Teleconsulta para renovação de receita', ?)`,
      userId,
      appointmentDate,
    );

    await tx.runAsync(
      `INSERT INTO notifications
        (user_id, type, title, description, is_read, created_at)
       VALUES (?, 'success', ?, ?, 0, ?)`,
      userId,
      'Teleconsulta agendada',
      `Sua avaliação para renovação de ${input.medicationName.trim()} foi agendada para ${appointmentDate.split('-').reverse().join('/')} às ${appointmentTime}.`,
      createdAt,
    );
  });

  return { appointmentId, appointmentDate, appointmentTime };
}

export async function getHomeData(
  db: SQLiteDatabase,
  userId: number,
): Promise<HomeData | null> {
  const [user, prescription, medications, events, appointments] = await Promise.all([
    getUser(db, userId),
    getPrescription(db, userId),
    getMedications(db, userId),
    getCalendarEvents(db, userId),
    getTeleconsultations(db, userId),
  ]);

  if (!user) {
    return null;
  }

  return {
    user,
    prescription,
    medication: medications[0] ?? null,
    events,
    appointments,
  };
}
