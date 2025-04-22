const connection = require('./db');

// Create a new booking
async function createBooking(booking) {
  const sql = `
    INSERT INTO bookings (user_id, vaccine_id, bookingDate, status, ticketId)
    VALUES (?, ?, ?, ?, ?)
  `;

  const bookingDate = booking.bookingDate || new Date();

  return new Promise((resolve, reject) => {
    connection.query(
      sql,
      [booking.user_id, booking.vaccine_id, bookingDate, booking.status || 'Pending', booking.ticketId],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
}

// Get booking by ID
async function getBookingById(id) {
  const sql = `
    SELECT bookings.*, users.fullname AS user_fullname, users.email AS user_email, vaccines.name AS vaccine_name, vaccines.hospital AS vaccine_hospital
    FROM bookings
    JOIN users ON bookings.user_id = users.id
    JOIN vaccines ON bookings.vaccine_id = vaccines.id
    WHERE bookings.id = ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
}

// Update booking by ID (partial update)
function updateBooking(id, updates, callback) {
  const fields = [];
  const values = [];

  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }

  if (fields.length === 0) {
    return callback(new Error('No fields to update'));
  }

  const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  connection.query(sql, values, callback);
}

// Delete booking by ID
function deleteBooking(id, callback) {
  const sql = `DELETE FROM bookings WHERE id = ?`;
  connection.query(sql, [id], callback);
}


// Get all bookings with vaccine and user relation (limited to 10)
async function getAllBookings(limit = 10, offset = 0) {
  const sql = `
    SELECT bookings.*, vaccines.name AS vaccine_name, vaccines.hospital AS vaccine_hospital, users.fullname AS user_fullname, users.email AS user_email
    FROM bookings
    JOIN vaccines ON bookings.vaccine_id = vaccines.id
    JOIN users ON bookings.user_id = users.id
    ORDER BY bookings.BookingDate DESC
    LIMIT ?
    OFFSET ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [limit, offset], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Get booking by ticket ID
async function getBookingByTicketId(ticketId) {
  const sql = `
    SELECT bookings.*, users.fullname AS user_fullname, users.email AS user_email, vaccines.name AS vaccine_name, vaccines.hospital AS vaccine_hospital
    FROM bookings
    JOIN users ON bookings.user_id = users.id
    JOIN vaccines ON bookings.vaccine_id = vaccines.id
    WHERE bookings.ticketId = ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [ticketId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
}



module.exports = {
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookings,
  getBookingByTicketId,
};
