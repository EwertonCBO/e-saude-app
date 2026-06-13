import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 3;

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysFromToday(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export async function seedDemoData(db: SQLiteDatabase) {
  const prescriptionExpiration = daysFromToday(5);
  const nextBatch = daysFromToday(12);
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      DELETE FROM calendar_events;
      DELETE FROM teleconsultations;
      DELETE FROM notifications;
      DELETE FROM patient_documents;
      DELETE FROM treatment_steps;
      DELETE FROM prescriptions;
      DELETE FROM medications;
      DELETE FROM pharmacies;
      DELETE FROM users;
      DELETE FROM sqlite_sequence
      WHERE name IN (
        'calendar_events',
        'teleconsultations',
        'notifications',
        'patient_documents',
        'treatment_steps',
        'prescriptions',
        'medications',
        'pharmacies',
        'users'
      );
    `);

    const user = await tx.runAsync(
      'INSERT INTO users (name, cpf, password) VALUES (?, ?, ?)',
      'Ewerton',
      '12345678900',
      '1234',
    );

    const losartan = await tx.runAsync(
      `INSERT INTO medications
        (user_id, name, dosage, frequency, remaining, total, status, is_critical)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      user.lastInsertRowId,
      'Losartana Potássica',
      '50mg',
      '1 comprimido a cada 24h',
      5,
      30,
      'Renovar',
      1,
    );

    await tx.runAsync(
      `INSERT INTO medications
        (user_id, name, dosage, frequency, remaining, total, status, is_critical)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      user.lastInsertRowId,
      'Cloridrato de Metformina',
      '850mg',
      '1 comprimido após o almoço',
      45,
      60,
      'Ativo',
      0,
    );

    await tx.runAsync(
      'INSERT INTO prescriptions (user_id, medication_id, expires_at) VALUES (?, ?, ?)',
      user.lastInsertRowId,
      losartan.lastInsertRowId,
      prescriptionExpiration,
    );

    const steps = [
      ['Consulta médica', 'Consulta realizada', 'hospital-box', 1, 'complete', null],
      ['Exames realizados', 'Exames concluídos', 'flask', 2, 'complete', null],
      ['Receita emitida', 'Receita vigente', 'clipboard-text', 3, 'warning', null],
      ['Enviar documentos', 'Fotografe ou anexe os documentos necessários', 'camera-outline', 4, 'pending', 'MyDocuments'],
      ['Retirar medicamento', 'Consulte a unidade de retirada mais próxima', 'map-marker-outline', 5, 'pending', 'Locations'],
    ] as const;

    for (const step of steps) {
      await tx.runAsync(
        `INSERT INTO treatment_steps
          (user_id, title, subtitle, icon, position, status, action_route)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        user.lastInsertRowId,
        ...step,
      );
    }

    const documents = [
      ['prescription', 'Receita médica'],
      ['rg', 'RG'],
      ['cpf', 'CPF'],
    ] as const;

    for (const document of documents) {
      await tx.runAsync(
        `INSERT INTO patient_documents (user_id, type, title, status)
         VALUES (?, ?, ?, 'pending')`,
        user.lastInsertRowId,
        ...document,
      );
    }

    const pharmacies = [
      [
        'Farmácia de Alto Custo - Unidade Sé',
        'Consulte o horário antes de sair',
        'Rua Vinte e Quatro de Maio, 100 - Centro',
        -23.5489,
        -46.6388,
      ],
      [
        'Farmácia de Alto Custo - Várzea do Carmo',
        'Consulte o horário antes de sair',
        'Rua Leopoldo Miguez, 327 - Cambuci',
        -23.5569,
        -46.6246,
      ],
      [
        'Farmácia de Alto Custo - Vila Mariana',
        'Consulte o horário antes de sair',
        'Rua Domingos de Morais, 1500 - Vila Mariana',
        -23.5891,
        -46.6344,
      ],
    ] as const;

    for (const pharmacy of pharmacies) {
      await tx.runAsync(
        `INSERT INTO pharmacies
          (title, status, address, latitude, longitude)
         VALUES (?, ?, ?, ?, ?)`,
        ...pharmacy,
      );
    }

    await tx.runAsync(
      `INSERT INTO notifications
        (user_id, type, title, description, is_read, created_at)
       VALUES (?, 'warning', ?, ?, 0, ?)`,
      user.lastInsertRowId,
      'Renove sua receita',
      `Sua receita de Losartana Potássica vence em ${formatDateForSeed(prescriptionExpiration)}.`,
      now,
    );
    await tx.runAsync(
      `INSERT INTO notifications
        (user_id, type, title, description, is_read, created_at)
       VALUES (?, 'success', ?, ?, 0, ?)`,
      user.lastInsertRowId,
      'Medicamento disponível',
      'Seu medicamento Losartana Potássica 50mg está liberado para retirada.',
      now,
    );

    await tx.runAsync(
      `INSERT INTO calendar_events (user_id, type, title, event_date)
       VALUES (?, 'prescription_expiration', 'Vencimento da receita', ?)`,
      user.lastInsertRowId,
      prescriptionExpiration,
    );
    await tx.runAsync(
      `INSERT INTO calendar_events (user_id, type, title, event_date)
       VALUES (?, 'new_batch', 'Chegada de novo lote', ?)`,
      user.lastInsertRowId,
      nextBatch,
    );
  });
}

function formatDateForSeed(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        remaining INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        is_critical INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        medication_id INTEGER NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS treatment_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        icon TEXT NOT NULL,
        position INTEGER NOT NULL,
        status TEXT NOT NULL,
        action_route TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS patient_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        file_uri TEXT,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pharmacies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        event_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      DROP TABLE IF EXISTS medication_requests;

      DROP TABLE IF EXISTS pharmacies_v2;
      CREATE TABLE pharmacies_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );
      INSERT INTO pharmacies_v2 (id, title, status, address, latitude, longitude)
      SELECT id, title, status, address, latitude, longitude
      FROM pharmacies;
      DROP TABLE pharmacies;
      ALTER TABLE pharmacies_v2 RENAME TO pharmacies;
      UPDATE pharmacies
      SET status = 'Consulte o horário antes de sair';
    `);
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS teleconsultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        medication_name TEXT NOT NULL,
        request_reason TEXT NOT NULL,
        prescription_expires_at TEXT NOT NULL,
        notes TEXT,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    currentVersion = 3;
  }

  const userCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM users',
  );
  if (!userCount?.count) {
    await seedDemoData(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
