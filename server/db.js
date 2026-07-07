const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// Vercel's serverless filesystem is read-only except /tmp, and /tmp is wiped
// between invocations/cold starts — data written there does not persist reliably.
const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'game.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function createUser({ username, passwordHash, salt }) {
  const result = db
    .prepare('INSERT INTO users (username, password_hash, salt, score, created_at) VALUES (?, ?, ?, 0, ?)')
    .run(username, passwordHash, salt, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

function getUserById(id) {
  return db.prepare('SELECT id, username, score FROM users WHERE id = ?').get(id);
}

function updateUserScore(id, score) {
  db.prepare('UPDATE users SET score = ? WHERE id = ?').run(score, id);
}

module.exports = { getUserByUsername, createUser, getUserById, updateUserScore };
