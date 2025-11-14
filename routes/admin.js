// routes/admin.js
const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth-middleware');
const bcrypt = require('bcrypt'); // for password hashing

const router = express.Router();

// list all products (admin)
router.get('/admin/products', requireAdmin, async (req, res) => {
  try {
    const products = await db.all(
      `select p.id, p.title, p.price, p.image,
              c.name as category_name, b.name as brand_name
       from products p
       join categories c on c.id = p.category_id
       join brands b on b.id = p.brand_id
       order by p.id desc`
    );
    res.render('admin-products', { title: 'Admin - Products', products });
  } catch (e) {
    console.error('admin products error:', e);
    res.status(500).send('error loading products');
  }
});

// list all users (admin)
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await db.all(
      `select id, username, role
       from users
       order by id desc`
    );
    res.render('admin-users', { title: 'Admin - Users', users });
  } catch (e) {
    console.error('admin users error:', e);
    res.status(500).send('error loading users');
  }
});

// show create product form
router.get('/admin/products/new', requireAdmin, async (req, res) => {
  try {
    const categories = await db.all('select id, name from categories order by name');
    const brands = await db.all('select id, name from brands order by name');
    res.render('admin-product-new', {
      title: 'Admin - New Product',
      categories,
      brands,
    });
  } catch (e) {
    console.error('new product form error:', e);
    res.status(500).send('error loading form');
  }
});

// create product
router.post('/admin/products', requireAdmin, async (req, res) => {
  try {
    const {
      title = '',
      price = '',
      category_id = '',
      brand_id = '',
      image = '',
      description = '',
    } = req.body;

    if (!title.trim() || !price || !category_id || !brand_id) {
      return res.status(400).send('missing required fields');
    }

    await db.run(
      `insert into products (title, price, category_id, brand_id, image, description)
       values (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        Number(price),
        Number(category_id),
        Number(brand_id),
        image.trim() || null,
        description.trim() || null,
      ]
    );

    res.redirect('/admin/products');
  } catch (e) {
    console.error('create product error:', e);
    res.status(500).send('error creating product');
  }
});

// show edit product form
router.get('/admin/products/:id/edit', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('bad id');

    const product = await db.get(
      `select id, title, price, category_id, brand_id, image, description
       from products
       where id = ?`,
      [id]
    );
    if (!product) return res.status(404).send('not found');

    const categories = await db.all('select id, name from categories order by name');
    const brands = await db.all('select id, name from brands order by name');

    res.render('admin-product-edit', {
      title: 'Admin - Edit Product',
      product,
      categories,
      brands,
    });
  } catch (e) {
    console.error('edit form error:', e);
    res.status(500).send('error loading form');
  }
});

// save product edits
router.post('/admin/products/:id/edit', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('bad id');

    const {
      title = '',
      price = '',
      category_id = '',
      brand_id = '',
      image = '',
      description = '',
    } = req.body;

    if (!title.trim() || !price || !category_id || !brand_id) {
      return res.status(400).send('missing required fields');
    }

    await db.run(
      `update products
       set title = ?, price = ?, category_id = ?, brand_id = ?, image = ?, description = ?
       where id = ?`,
      [
        title.trim(),
        Number(price),
        Number(category_id),
        Number(brand_id),
        image.trim() || null,
        description.trim() || null,
        id,
      ]
    );

    res.redirect('/admin/products');
  } catch (e) {
    console.error('update product error:', e);
    res.status(500).send('error updating product');
  }
});

// delete product
router.post('/admin/products/:id/delete', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('bad id');

    await db.run(`delete from products where id = ?`, [id]);

    res.redirect('/admin/products');
  } catch (e) {
    console.error('delete product error:', e);
    res.status(500).send('error deleting product');
  }
});

// show create user form
router.get('/admin/users/new', requireAdmin, async (req, res) => {
  try {
    res.render('admin-user-new', {
      title: 'Admin - New User',
      roles: ['admin', 'user'],
      values: { username: '', role: 'user' }
    });
  } catch (e) {
    console.error('new user form error:', e);
    res.status(500).send('error loading form');
  }
});

// create user
router.post('/admin/users', requireAdmin, async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';
    const role = (req.body.role || 'user').trim();

    if (!username || !password || password.length < 6) {
      return res.status(400).render('admin-user-new', {
        title: 'Admin - New User',
        roles: ['admin', 'user'],
        values: { username, role },
        error: 'please fill all fields (password 6+ chars)'
      });
    }
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).render('admin-user-new', {
        title: 'Admin - New User',
        roles: ['admin', 'user'],
        values: { username, role: 'user' },
        error: 'invalid role'
      });
    }
    // delete user
router.post('/admin/users/:id/delete', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('bad id');

    // do not let me delete myself
    if (req.session.user && id === req.session.user.id) {
      return res.status(400).send('cannot delete your own account');
    }

    // find target user
    const user = await db.get('select id, role from users where id = ?', [id]);
    if (!user) return res.redirect('/admin/users');

    // do not delete the last admin (safety)
    if (user.role === 'admin') {
      const { n } = await db.get('select count(*) as n from users where role = "admin"');
      if (n <= 1) {
        return res.status(400).send('cannot delete the last admin');
      }
    }

    await db.run('delete from users where id = ?', [id]);
    res.redirect('/admin/users');
  } catch (e) {
    console.error('delete user error:', e);
    res.status(500).send('error deleting user');
  }
});


    const exists = await db.get('select id from users where username = ?', [username]);
    if (exists) {
      return res.status(400).render('admin-user-new', {
        title: 'Admin - New User',
        roles: ['admin', 'user'],
        values: { username, role },
        error: 'username already exists'
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.run(
      'insert into users (username, password_hash, role) values (?,?,?)',
      [username, hash, role]
    );

    res.redirect('/admin/users');
  } catch (e) {
    console.error('create user error:', e);
    res.status(500).render('admin-user-new', {
      title: 'Admin - New User',
      roles: ['admin', 'user'],
      values: { username: req.body?.username || '', role: req.body?.role || 'user' },
      error: 'server error'
    });
  }
});
// show edit user form
router.get('/admin/users/:id/edit', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('bad id');

    const user = await db.get('select id, username, role from users where id = ?', [id]);
    if (!user) return res.status(404).send('not found');

    res.render('admin-user-edit', {
      title: 'Admin - Edit User',
      user,
      roles: ['admin', 'user']
    });
  } catch (e) {
    console.error('edit user form error:', e);
    res.status(500).send('error loading form');
  }
});

// save user edits
router.post('/admin/users/:id/edit', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('bad id');

    const username = (req.body.username || '').trim();
    const role = (req.body.role || 'user').trim();
    const newPassword = req.body.new_password || '';

    if (!username) {
      return res.status(400).render('admin-user-edit', {
        title: 'Admin - Edit User',
        user: { id, username, role },
        roles: ['admin', 'user'],
        error: 'username is required'
      });
    }
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).render('admin-user-edit', {
        title: 'Admin - Edit User',
        user: { id, username, role: 'user' },
        roles: ['admin', 'user'],
        error: 'invalid role'
      });
    }

    // if changing username, make sure it’s unique
    const exists = await db.get(
      'select id from users where username = ? and id != ?',
      [username, id]
    );
    if (exists) {
      return res.status(400).render('admin-user-edit', {
        title: 'Admin - Edit User',
        user: { id, username, role },
        roles: ['admin', 'user'],
        error: 'username already exists'
      });
    }

    // do not demote the last admin
    const original = await db.get('select role from users where id = ?', [id]);
    if (!original) return res.status(404).send('not found');
    if (original.role === 'admin' && role !== 'admin') {
      const { n } = await db.get('select count(*) as n from users where role = "admin"');
      if (n <= 1) {
        return res.status(400).render('admin-user-edit', {
          title: 'Admin - Edit User',
          user: { id, username, role: original.role },
          roles: ['admin', 'user'],
          error: 'cannot remove role admin from the last admin'
        });
      }
    }

    // update base fields
    await db.run('update users set username = ?, role = ? where id = ?', [
      username,
      role,
      id,
    ]);

    // optional password change
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 6) {
        return res.status(400).render('admin-user-edit', {
          title: 'Admin - Edit User',
          user: { id, username, role },
          roles: ['admin', 'user'],
          error: 'new password must be at least 6 chars'
        });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await db.run('update users set password_hash = ? where id = ?', [hash, id]);

      // if i changed my own password, keep session as-is (no logout required here)
    }

    res.redirect('/admin/users');
  } catch (e) {
    console.error('update user error:', e);
    res.status(500).render('admin-user-edit', {
      title: 'Admin - Edit User',
      user: { id: Number(req.params.id) || 0, username: req.body?.username || '', role: req.body?.role || 'user' },
      roles: ['admin', 'user'],
      error: 'server error'
    });
  }
});


module.exports = router;
