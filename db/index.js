const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');   // DB file lives in /db/app.db
const db = new sqlite3.Database(dbPath);

// Promise-wrapped helpers
module.exports = {
  all(sql, params = []) {
    return new Promise((resolve, reject) =>
      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) =>
      db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
    );
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) =>
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      })
    );
  },
  raw: db,      // low-level access if ever needed
  dbPath
};
