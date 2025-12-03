// Smart database connector - uses mock data in development
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.ORACLE_USER;

console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 Oracle User configured:', !!process.env.ORACLE_USER);

// Use mock database in development or if no Oracle credentials are set
if (isDevelopment) {
  console.log('🎭 Using MOCK database for development');
  module.exports = require('./mockDB');
} else {
  console.log('🚀 Using REAL Oracle database for production');
  
  // Original Oracle DB code
  const oracledb = require('oracledb');
  
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.autoCommit = true;

  const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING
  };

  async function executeQuery(query, params = []) {
    let conn;
    try {
      conn = await oracledb.getConnection(dbConfig);
      const result = await conn.execute(query, params, { autoCommit: true });
      console.log('✅ Oracle Query executed successfully');
      return result;
    } catch (err) {
      console.error('❌ Oracle Query execution failed:', err.message);
      throw err;
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('❌ Error closing connection:', err);
        }
      }
    }
  }

  async function testConnection() {
    try {
      const result = await executeQuery('SELECT 1 FROM DUAL');
      console.log('✅ Oracle database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Oracle database connection test failed');
      return false;
    }
  }

  module.exports = {
    executeQuery,
    testConnection
  };
}