const path = require('path');
const dotenv = require('dotenv');

// Load .env from server dir or root dir
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: Number.parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'ccms_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ccms_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};

if (config.jwt.secret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters.');
}

module.exports = config;
