import 'tsconfig-paths/register';
import '../test.main';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { dataSource } from '@test/test.main';

module.exports = async (): Promise<void> => {
  console.log('🚀 Setting up test database...');
  await executeTestDBContainer();

  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();

    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
};

const executeTestDBContainer = async () => {
  const execPromise = promisify(exec);
  const projectRoot = path.resolve(__dirname, '../..');
  const composeFilePath = path.join(__dirname, 'docker-compose.test-db.yml');
  const containerName = 'test.db';

  try {
    await execPromise(`docker compose -f ${composeFilePath} down -v`, {
      cwd: projectRoot,
      env: process.env,
    }).catch(() => {});

    await execPromise(`docker compose -f ${composeFilePath} up -d`, {
      cwd: projectRoot,
      env: process.env,
    });

    await waitForHealthcheck(containerName);

    console.log('✅ Test DB container started');
  } catch (error) {
    console.error('❌ Failed to start test DB container:', error);
    throw error;
  }
};

const waitForHealthcheck = async (containerName: string, maxAttempts = 10): Promise<void> => {
  const execPromise = promisify(exec);
  const baseDelayMs = 500;
  const maxDelayMs = 10000;

  const calculateDelay = (attempt: number): number =>
    Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { stdout } = await execPromise(
        `docker inspect --format='{{.State.Health.Status}}' ${containerName}`,
      );

      if (stdout.trim() === 'healthy') {
        console.log('✅ Container is healthy');
        return;
      }
    } catch {
      // 컨테이너가 아직 없음 (정상)
    }

    const delayMs = calculateDelay(i);
    console.log(`⏳ Waiting for container... (${i + 1}/${maxAttempts})`);

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Container health check timeout');
};
