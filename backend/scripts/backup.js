// scripts/backup.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Vijay1825@',
  database: process.env.DB_NAME || 'library_management',
};

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Create backup command
const cmd = `mysqldump --host=${dbConfig.host} --user=${dbConfig.user} --password=${dbConfig.password} ${dbConfig.database} > ${backupFile}`;

// Execute backup
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Backup stderr: ${stderr}`);
    return;
  }
  console.log(`Backup completed: ${backupFile}`);
});
