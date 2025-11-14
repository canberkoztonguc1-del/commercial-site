// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');              // db helpers (get/all/run)

const router = express.Router();

/* GET /login
   show the login form; if already logged in, go home */
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { title: 'Login' });
});

/* POST /login
   look up user - compare - set session - redirect */
router.post('/login', async (req, res) => {
  try {
    const { username = '', password = '' } = req.body;

    // find user by username
    const user = await db.get(
      'SELECT id, username, password_hash, role FROM users WHERE username = ?',
      [username.trim()]
    );

    // invalid username
    if (!user) {
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid username or password.',
        values: { username }
      });
    }

    // invalid password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid username or password.',
        values: { username }
      });
    }

    // success → remember user in session
    req.session.user = { id: user.id, username: user.username, role: user.role };
    const nextUrl = req.session.returnTo || '/';
delete req.session.returnTo;
res.redirect(nextUrl);

  } catch (e) {
    console.error('Login error:', e);
    res.status(500).render('login', { title: 'Login', error: 'Server error. Please try again.' });
  }
});

/* GET /logout
   clear session and return to home */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
