const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Query error:', err);
  } else {
    console.log('Time:', res.rows[0]);
  }
});
