/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const path = require('path');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please enter a migration name!');
  console.error('Example: npm run migration:create AddNewColumnToTable');
  process.exit(1);
}

const migrationsPath = path.join('src', 'migrations');

try {
  console.log(`Creating migration: ${migrationName}`);

  const command = `npm run build && npx typeorm migration:generate -d dist/typeOrm.config.js ${migrationsPath}/${migrationName}`;

  execSync(command, { stdio: 'inherit' });

  console.log(`Migration created successfully: ${migrationsPath}/${migrationName}`);
} catch (error) {
  console.error('Error creating migration:', error.message);
  process.exit(1);
}