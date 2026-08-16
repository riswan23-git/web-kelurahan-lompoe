const path = require('path');
const mysql = require(require.resolve('mysql2/promise', { paths: [path.join(__dirname, '..', 'backend')] }));
const fs = require('fs');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'db_lompoe'
    });

    const [tables] = await conn.query('SHOW TABLES');
    let sqlDump = '-- DB LOMPOE BACKUP FOR CLOUD DEPLOYMENT\nSET FOREIGN_KEY_CHECKS = 0;\n\n';

    for (const tRow of tables) {
      const tableName = Object.values(tRow)[0];
      const [createTable] = await conn.query('SHOW CREATE TABLE `' + tableName + '`');
      sqlDump += createTable[0]['Create Table'] + ';\n\n';

      const [rows] = await conn.query('SELECT * FROM `' + tableName + '`');
      for (const row of rows) {
        const keys = Object.keys(row).map(k => '`' + k + '`').join(', ');
        const vals = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'number') return v;
          if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'";
          return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r') + "'";
        }).join(', ');
        sqlDump += 'INSERT INTO `' + tableName + '` (' + keys + ') VALUES (' + vals + ');\n';
      }
      sqlDump += '\n';
    }

    sqlDump += 'SET FOREIGN_KEY_CHECKS = 1;\n';
    const outputPath = path.join(__dirname, '..', 'backend', 'db_lompoe_cloud_backup.sql');
    fs.writeFileSync(outputPath, sqlDump);
    console.log('Successfully created:', outputPath);
    await conn.end();
  } catch (err) {
    console.error('Export error:', err.message);
  }
})();
