import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('foodgen.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS meal_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      emoji TEXT
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      suggested_for TEXT NOT NULL DEFAULT '["breakfast","lunch","dinner"]',
      cuisine TEXT NOT NULL DEFAULT 'Filipino',
      dietary_tags TEXT DEFAULT '[]',
      prep_time_minutes INTEGER NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'easy',
      emoji TEXT DEFAULT '🍽️',
      photo_path TEXT,
      youtube_link TEXT,
      ingredients TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]',
      calories INTEGER,
      is_favorite INTEGER DEFAULT 0,
      is_custom INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS day_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      week_of_year INTEGER NOT NULL,
      year INTEGER NOT NULL,
      breakfast_id INTEGER,
      lunch_id INTEGER,
      dinner_id INTEGER,
      snack_id INTEGER,
      is_generated INTEGER DEFAULT 0,
      FOREIGN KEY (breakfast_id) REFERENCES meals(id),
      FOREIGN KEY (lunch_id) REFERENCES meals(id),
      FOREIGN KEY (dinner_id) REFERENCES meals(id),
      FOREIGN KEY (snack_id) REFERENCES meals(id)
    );

    CREATE TABLE IF NOT EXISTS saved_week_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      week_of_year INTEGER NOT NULL,
      year INTEGER NOT NULL
    );
  `);
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DROP TABLE IF EXISTS saved_week_plans;
    DROP TABLE IF EXISTS day_plans;
    DROP TABLE IF EXISTS meals;
    DROP TABLE IF EXISTS meal_slots;
  `);
  db = null;
}