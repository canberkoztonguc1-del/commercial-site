// middleware/auth-middleware.js
exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    // remember where the user wanted to go
    req.session.returnTo = req.originalUrl || req.url;
    return res.redirect('/login');
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl || req.url;
    return res.redirect('/login');
  }
  if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
  next();
};
