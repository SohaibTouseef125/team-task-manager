import db from './src/config/database.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test if we can connect and query the users table
    const users = await db('users').select('*').limit(1);
    console.log('Users table query result:', users);
    
    console.log('Database connection is working!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Check if the users table exists
    try {
      const tables = await db.schema.hasTable('users');
      console.log('Users table exists:', tables);
      
      if (!tables) {
        console.log('The users table does not exist. You need to run migrations.');
      }
    } catch (schemaError) {
      console.error('Error checking schema:', schemaError.message);
    }
  } finally {
    await db.destroy();
  }
}

testConnection();