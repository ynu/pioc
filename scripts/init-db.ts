import { initializeDatabase } from '../src/lib/database/init';

async function main() {
  try {
    await initializeDatabase();
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

main();
