const path = require('path');
const express = require('express');
const session = require('express-session');
const { getUserByUsername, createUser, getUserById, updateUserScore } = require('./db');
const { hashPassword, verifyPassword } = require('./auth');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (getUserByUsername(username)) {
    return res.status(400).json({ error: 'Username is already taken' });
  }
  const { salt, hash } = hashPassword(password);
  const id = createUser({ username, passwordHash: hash, salt });
  req.session.userId = id;
  res.status(201).json({ username, score: 0 });
});

app.post('/api/signin', (req, res) => {
  const { username, password } = req.body || {};
  const user = typeof username === 'string' ? getUserByUsername(username) : null;
  if (!user || typeof password !== 'string' || !verifyPassword(password, user.salt, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  req.session.userId = user.id;
  res.json({ username: user.username, score: user.score });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  const user = req.session.userId ? getUserById(req.session.userId) : null;
  if (!user) return res.json({ user: null });
  res.json({ username: user.username, score: user.score });
});

app.post('/api/score', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { score } = req.body || {};
  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'score must be a number' });
  }
  updateUserScore(req.session.userId, score);
  res.json({ score });
});

app.use(express.static(path.join(__dirname, '..', 'build')));

// Only bind a port for local dev (`npm run dev:server` / `npm start`) — on Vercel this
// module is imported and invoked per-request as a serverless function, not run standalone.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
