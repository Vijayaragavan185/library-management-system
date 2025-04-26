// scripts/recover.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Vijay1825@',
  database: process.env.DB_NAME || 'library_management',
};

const backupDir = path.join(__dirname, '../backups');

// List available backups
const backups = fs.readdirSync(backupDir)
  .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
  .sort()
  .reverse(); // Most recent first

if (backups.length === 0) {
  console.error('No backups found!');
  process.exit(1);
}

console.log('Available backups:');
backups.forEach((backup, index) => {
  console.log(`${index + 1}. ${backup}`);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Select backup to restore (number): ', (answer) => {
  const index = parseInt(answer) - 1;
  if (isNaN(index) || index < 0 || index >= backups.length) {
    console.error('Invalid selection!');
    rl.close();
    process.exit(1);
  }

  const backupFile = path.join(backupDir, backups[index]);
  console.log(`Restoring from ${backupFile}...`);

  // Restore command
  const cmd = `mysql --host=${dbConfig.host} --user=${dbConfig.user} --password=${dbConfig.password} ${dbConfig.database} < ${backupFile}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Restore error: ${error.message}`);
      rl.close();
      return;
    }
    if (stderr) {
      console.error(`Restore stderr: ${stderr}`);
    }
    console.log(`Restore completed from ${backupFile}`);
    rl.close();
  });
});
