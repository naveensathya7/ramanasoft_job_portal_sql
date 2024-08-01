const mysql = require('mysql');
const env = require('dotenv');

env.config();

const pool = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'job-portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
