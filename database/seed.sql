INSERT OR IGNORE INTO students (student_id, student_name, email) VALUES
    (1, 'Aarav Sharma', 'aarav.sharma@example.edu'),
    (2, 'Maya Patel', 'maya.patel@example.edu'),
    (3, 'Rohan Iyer', 'rohan.iyer@example.edu');

INSERT OR IGNORE INTO carrels (carrel_id, name, zone) VALUES
    (1, 'Silent Corner 1', 'Quiet'),
    (2, 'Silent Corner 2', 'Quiet'),
    (3, 'Window Seat', 'Quiet'),
    (4, 'Discussion Table 1', 'Group'),
    (5, 'Discussion Table 2', 'Group');

INSERT OR IGNORE INTO bookings (booking_id, student_id, carrel_id) VALUES
    (1, 1, 1),
    (2, 2, 4),
    (3, 3, 3);
