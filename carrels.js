
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET all carrels (with optional zone search)
router.get('/', (req, res) => {
  const { zone } = req.query;

  let sql = 'SELECT * FROM carrels';
  let params = [];

  if (zone) {
    sql += ' WHERE zone = ?';
    params.push(zone);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(rows);
  });
});

// 2. GET carrels summary (GROUP BY zone)
router.get('/summary', (req, res) => {
  const sql = `
    SELECT zone, COUNT(*) AS total_carrels
    FROM carrels
    GROUP BY zone
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(rows);
  });
});

// 3. GET one carrel by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM carrels WHERE carrel_id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Carrel not found' });
    }

    res.status(200).json(row);
  });
});

// 4. POST - Add a new carrel
router.post('/', (req, res) => {
  const { name, zone } = req.body;

  // Validation
  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof zone !== 'string' ||
    zone.trim() === ''
  ) {
    return res.status(400).json({
      error: 'Name and zone are required'
    });
  }

  const sql = `
    INSERT INTO carrels (name, zone)
    VALUES (?, ?)
  `;

  db.run(sql, [name.trim(), zone.trim()], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      carrel_id: this.lastID,
      name: name.trim(),
      zone: zone.trim()
    });
  });
});

// 5. PUT - Update a carrel
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, zone } = req.body;

  // Validation
  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof zone !== 'string' ||
    zone.trim() === ''
  ) {
    return res.status(400).json({
      error: 'Name and zone are required'
    });
  }

  const sql = `
    UPDATE carrels
    SET name = ?, zone = ?
    WHERE carrel_id = ?
  `;

  db.run(sql, [name.trim(), zone.trim(), id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Carrel not found' });
    }

    res.status(200).json({
      message: 'Carrel updated successfully'
    });
  });
});

// 6. DELETE - Delete a carrel
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM carrels WHERE carrel_id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Carrel not found' });
    }

    res.status(200).json({
      message: 'Carrel deleted successfully'
    });
  });
});

module.exports = router;
