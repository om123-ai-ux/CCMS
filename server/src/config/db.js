const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  charset: 'utf8mb4'
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
    console.log(`[Database] Connected to "${config.db.database}" at ${config.db.host}:${config.db.port}`);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection
};
