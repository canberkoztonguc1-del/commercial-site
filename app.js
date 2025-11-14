// app.js
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');

const db = require('./db');
const publicRoutes = require('./routes/public');
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// static assets and body parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true  turn on only when running https
    },
  })
);

// put user and simple nav flags on all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = !!(req.session.user && req.session.user.role === 'admin');

  const p = req.path || '/';
  res.locals.isHome = p === '/';
  res.locals.isProducts = p.startsWith('/products');
  res.locals.isAbout = p === '/about';
  res.locals.isContact = p === '/contact';
  next();
});

// handlebars setup with small helper i use in selects
app.engine(
  'hbs',
  exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/', publicRoutes);
app.use('/', productsRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);

// simple db health check
app.get('/health/db', async (req, res) => {
  try {
    const row = await db.get('SELECT 1 AS ok');
    res.json({ db: 'up', ok: row?.ok === 1 });
  } catch (e) {
    res.status(500).json({ db: 'down', error: String(e) });
  }
});

// start server
app.listen(PORT, () => console.log('http://localhost:' + PORT));
