const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

// Use environment variables
const dbConfig = {
  user: process.env.ORACLE_USER || 'system',
  password: process.env.ORACLE_PASSWORD || 'leo',
  connectString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XE'
};

console.log('🔧 Database Configuration:', {
  user: dbConfig.user,
  connectString: dbConfig.connectString
});

async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, params, { autoCommit: true });
    return result;
  } catch (err) {
    console.error('❌ Query execution failed:', err.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('❌ Error closing connection:', err);
      }
    }
  }
}

async function testConnection() {
  try {
    const result = await executeQuery('SELECT 1 as connection_test FROM dual');
    console.log('✅ Oracle database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Oracle database connection failed');
    return false;
  }
}

module.exports = {
  executeQuery,
  testConnection
};