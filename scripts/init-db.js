const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../db'); // uses db/raw from db/index.js

(async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    const seed   = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');

    db.raw.serialize(async () => {
      try {
        db.raw.exec('PRAGMA foreign_keys = ON;');

        // 1) apply schema
        await new Promise((res, rej) => db.raw.exec(schema, e => (e ? rej(e) : res())));
        console.log('Schema OK');

        // 2) seed base data
        await new Promise((res, rej) => db.raw.exec(seed, e => (e ? rej(e) : res())));
        console.log('Seed OK');

        // 3) upsert admin with hashed password
        const username = 'admin';
        const password = 'wdf#2025';
        const hash = await bcrypt.hash(password, 10);

        await new Promise((res, rej) =>
          db.raw.run(
            `INSERT INTO users (username, password_hash, role)
             VALUES (?, ?, ?)
             ON CONFLICT(username) DO UPDATE SET
               password_hash = excluded.password_hash,
               role = 'admin'`,
            [username, hash, 'admin'],
            e => (e ? rej(e) : res())
          )
        );
        console.log('Admin user ready:', username);

        console.log('DB file:', db.dbPath);
        process.exit(0);
      } catch (e) {
        console.error('Init error:', e);
        process.exit(1);
      }
    });
  } catch (e) {
    console.error('Read file error:', e);
    process.exit(1);
  }
})();
