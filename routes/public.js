// routes/public.js
const express = require('express');
const router = express.Router();

// --- Home page ---
router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// --- About page ---
router.get('/about', (req, res) => {
  res.render('about', { title: 'About', isAbout: true });
});
// --- Contact form (GET) --
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact',
    isContact: true,
    values: { name: '', email: '', message: '' }
  });
});

// --- Contact form (POST) ---
router.post('/contact', (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const message = (req.body.message || '').trim();
  const botField = (req.body.company || '').trim(); // hidden honeypot

  // check bot
  if (botField) {
    return res.status(400).render('contact', {
      title: 'Contact',
      isContact: true,
      values: { name, email, message },
      error: 'something went wrong'
    });
  }

  // validation
  if (!name || !email || !message) {
    return res.status(400).render('contact', {
      title: 'Contact',
      isContact: true,
      values: { name, email, message },
      error: 'please fill all fields'
    });
  }

  // no DB or email integration: just show success
  res.render('contact', {
    title: 'Contact',
    isContact: true,
    values: { name: '', email: '', message: '' },
    success: true
  });
});

module.exports = router;
