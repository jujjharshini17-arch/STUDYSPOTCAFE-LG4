
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET all students
router.get('/', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(rows);
  });
});

// 2. POST - Add a new student
router.post('/', (req, res) => {
  const { student_name, email } = req.body;

  if (!student_name || !email) {
    return res.status(400).json({
      error: 'Student name and email are required'
    });
  }

  const sql = `
    INSERT INTO students (student_name, email)
    VALUES (?, ?)
  `;

  db.run(sql, [student_name, email], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      student_id: this.lastID,
      student_name,
      email
    });
  });
});

module.exports = router;
