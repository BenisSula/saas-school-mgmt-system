import app from './app';
import http from 'http';
import { wsManager } from './lib/websocket';
import { getPool } from './db/connection';
import { runMigrations } from './db/runMigrations';
import { seedDemoTenant } from './seed/demoTenant';
import { validateRequiredEnvVars } from './lib/envValidation';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

function listenWithRetry(server: http.Server, startPort: number, attempts = 5): void {
  let currentPort = startPort;
  let remaining = Math.max(1, attempts);
  const tryListen = () => {
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && remaining > 1) {
        remaining -= 1;
        currentPort += 1;
        console.warn(`Port ${currentPort - 1} in use. Retrying on ${currentPort}...`);
        setTimeout(() => {
          server.listen(currentPort);
        }, 200);
      } else {
        console.error('Failed to bind server:', err);
        process.exit(1);
      }
    });
    server.listen(currentPort, () => {
      console.log(`Backend server listening on port ${currentPort}`);
    });
  };
  tryListen();
}

async function startServer(): Promise<void> {
  // Validate required environment variables (especially JWT secrets)
  try {
    validateRequiredEnvVars();
  } catch (error) {
    console.error('❌ Environment validation failed:', (error as Error).message);
    process.exit(1);
  }

  const pool = getPool();

  try {
    await runMigrations(pool);

    const shouldSeedDemo =
      process.env.AUTO_SEED_DEMO === 'true' ||
      (process.env.AUTO_SEED_DEMO === undefined &&
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test');

    if (shouldSeedDemo) {
      await seedDemoTenant(pool);
    }

    await pool.query('SELECT 1');
    const server = http.createServer(app);
    // Initialize WebSocket manager (safe even if 'ws' not installed; it will log a warning)
    try {
      wsManager.initialize(server);
    } catch {
      // noop
    }
    listenWithRetry(server, PORT, 5);
  } catch (error) {
    console.error('Failed to start server due to DB connection error', error);
    process.exit(1);
  }
}

void startServer();
