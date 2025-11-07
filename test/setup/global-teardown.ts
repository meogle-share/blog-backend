import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

config({ path: '.env.test' });

const stopTestDBContainer = async () => {
  const execPromise = promisify(exec);
  const projectRoot = path.resolve(__dirname, '../..');
  const composeFilePath = path.join(__dirname, 'docker-compose.test-db.yml');

  try {
    await execPromise(`docker compose -f ${composeFilePath} stop`, { cwd: projectRoot });
    console.log('🛑 Test DB container stopped');
  } catch (error) {
    console.error('❌ Failed to stop test DB container:', error);
    throw error;
  }
};

module.exports = async (): Promise<void> => {
  console.log('🧹 Cleaning up test database...');

  try {
    await stopTestDBContainer();
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
};
