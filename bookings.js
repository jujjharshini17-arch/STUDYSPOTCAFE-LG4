
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all bookings with student and carrel details (JOIN)
router.get('/', (req, res) => {
  const sql = `
    SELECT
      bookings.booking_id,
      bookings.student_id,
      students.student_name,
      bookings.carrel_id,
      carrels.name AS carrel_name
    FROM bookings
    JOIN students
      ON bookings.student_id = students.student_id
    JOIN carrels
      ON bookings.carrel_id = carrels.carrel_id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.status(200).json(rows);
  });
});

// POST create a new booking
router.post('/', (req, res) => {
  const { student_id, carrel_id } = req.body;

  // Input validation
  if (
    !Number.isInteger(student_id) ||
    student_id <= 0 ||
    !Number.isInteger(carrel_id) ||
    carrel_id <= 0
  ) {
    return res.status(400).json({
      error: 'Valid student_id and carrel_id are required'
    });
  }

  const sql = `
    INSERT INTO bookings (student_id, carrel_id)
    VALUES (?, ?)
  `;

  db.run(sql, [student_id, carrel_id], function (err) {
    if (err) {
      return res.status(400).json({
        error: err.message
      });
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking_id: this.lastID
    });
  });
});

module.exports = router;
