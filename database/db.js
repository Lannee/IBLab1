const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../database.sqlite');

let db = null;

const initializeDatabase = () => {
  try {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    console.log('Connected to SQLite database with better-sqlite3');
    createTables();
  } catch (error) {
    console.error('Error opening database:', error.message);
    throw error;
  }
};

const createTables = () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `;

  const postsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `;

  db.exec(usersTable);
  db.exec(postsTable);
};

const dbQuery = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return params.length > 0 ? stmt.all(...params) : stmt.all();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const dbGet = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return params.length > 0 ? stmt.get(...params) : stmt.get();
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
};

const dbRun = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = params.length > 0 ? stmt.run(...params) : stmt.run();
    
    return {
      lastID: result.lastInsertRowid,
      changes: result.changes
    };
  } catch (error) {
    console.error('Database run error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  dbQuery,
  dbGet,
  dbRun
};