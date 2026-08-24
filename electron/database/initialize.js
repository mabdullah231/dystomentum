import fs from 'node:fs';
import { getDatabase, getDatabasePath } from './connection';
export async function getSetupPreferences() {
  if (!fs.existsSync(getDatabasePath()))
    return null;
  const db = await getDatabase();
  const result = db.exec(`
  SELECT username, currency, theme, backup_path, automatic_backups, backup_frequency
  FROM setup_preferences
  WHERE id = 1
  `);
  const row = result[0]?.values[0];
  if (!row || row.length < 6)
    return null;
  return {
    username: String(row[0]),
    currency: String(row[1]),
    theme: String(row[2]),
    backupPath: String(row[3]),
    automaticBackups: Number(row[4]) === 1,
    frequency: String(row[5]),
  };
}
export async function initializeDatabase(preferences) {
  const db = await getDatabase();
  db.run(`
    CREATE TABLE IF NOT EXISTS _app (
      id INTEGER PRIMARY KEY CHECK (id = 1)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS setup_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL,
      currency TEXT NOT NULL,
      theme TEXT NOT NULL,
      backup_path TEXT NOT NULL,
      automatic_backups INTEGER NOT NULL,
      backup_frequency TEXT NOT NULL,
      completed_at TEXT NOT NULL
    )
  `);
  db.run(`
    INSERT INTO setup_preferences (
      id, username, currency, theme, backup_path, automatic_backups, backup_frequency, completed_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      currency = excluded.currency,
      theme = excluded.theme,
      backup_path = excluded.backup_path,
      automatic_backups = excluded.automatic_backups,
      backup_frequency = excluded.backup_frequency,
      completed_at = excluded.completed_at
  `, [
    preferences.username,
    preferences.currency,
    preferences.theme,
    preferences.backupPath,
    preferences.automaticBackups ? 1 : 0,
    preferences.frequency,
    new Date().toISOString(),
  ]);
  fs.writeFileSync(getDatabasePath(), Buffer.from(db.export()));
}
