// routes/products.js
const express = require('express');
const db = require('../db');

const router = express.Router();

// list with pagination (?page=) and optional search (?q=)
router.get('/products', async (req, res) => {
  try {
    const limit = 3;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const q = (req.query.q || '').trim();
    const like = '%' + q + '%';

    // total rows
    const countSql = q
      ? `SELECT COUNT(*) AS n
         FROM products p
         JOIN categories c ON c.id = p.category_id
         JOIN brands b ON b.id = p.brand_id
         WHERE p.title LIKE ? OR c.name LIKE ? OR b.name LIKE ?`
      : `SELECT COUNT(*) AS n FROM products`;
    const countArgs = q ? [like, like, like] : [];
    const { n: total = 0 } = await db.get(countSql, countArgs);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    // page rows
    const listSql = q
      ? `SELECT p.id, p.title, p.price, p.image,
               c.name AS category_name, b.name AS brand_name
         FROM products p
         JOIN categories c ON c.id = p.category_id
         JOIN brands b ON b.id = p.brand_id
         WHERE p.title LIKE ? OR c.name LIKE ? OR b.name LIKE ?
         ORDER BY p.id DESC
         LIMIT ? OFFSET ?`
      : `SELECT p.id, p.title, p.price, p.image,
               c.name AS category_name, b.name AS brand_name
         FROM products p
         JOIN categories c ON c.id = p.category_id
         JOIN brands b ON b.id = p.brand_id
         ORDER BY p.id DESC
         LIMIT ? OFFSET ?`;
    const listArgs = q ? [like, like, like, limit, offset] : [limit, offset];
    const products = await db.all(listSql, listArgs);

    res.render('products', {
      title: 'Products',
      products,
      page: safePage,
      totalPages,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
      prevPage: safePage - 1,
      nextPage: safePage + 1,
      q
    });
  } catch (e) {
    console.error('products list error:', e);
    res.status(500).send('error loading products');
  }
});

// detail
router.get('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(404).render('404', { title: 'Not found' });

    const product = await db.get(
      `SELECT p.*, c.name AS category_name, b.name AS brand_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       JOIN brands b ON b.id = p.brand_id
       WHERE p.id = ?`,
      [id]
    );
    if (!product) return res.status(404).render('404', { title: 'Not found' });

    res.render('product-detail', { title: product.title, product });
  } catch (e) {
    console.error('product detail error:', e);
    res.status(500).send('error loading product');
  }
});

module.exports = router;
