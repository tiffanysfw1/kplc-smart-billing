// db.js
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: 'tiffany', // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'kplc_smart_billing', // Your database name
  password: 'jemosop2000', // Your PostgreSQL password
  port: 5432, // PostgreSQL port, default is 5432
});

// Test the database connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Error connecting to PostgreSQL:", err));

// Export the pool object to use it in other files
module.exports = pool;
