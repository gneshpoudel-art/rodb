require('dotenv').config();
const { createClient } = require('@libsql/client');

const dbUrl = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('Testing Turso connection...');
console.log('URL:', dbUrl ? dbUrl.split('-')[0] + '...' : 'NOT SET');
console.log('Token:', authToken ? 'SET' : 'NOT SET');

if (!dbUrl || !authToken) {
    console.log('ERROR: Credentials not set!');
    process.exit(1);
}

const db = createClient({ url: dbUrl, authToken });
db.execute('SELECT 1').then(() => {
    console.log('✓ Connection successful!');
    process.exit(0);
}).catch(err => {
    console.log('✗ Connection failed:', err.message);
    process.exit(1);
});
