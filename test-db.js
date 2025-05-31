const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'auditsuite',
  password: 'postgres',
  port: 5433,
});

async function testConnection() {
  try {
    console.log('Testing connection...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    const result = await client.query('SELECT current_user, version()');
    console.log('Query result:', result.rows[0]);
    client.release();
    await pool.end();
    console.log('Connection test completed successfully!');
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 