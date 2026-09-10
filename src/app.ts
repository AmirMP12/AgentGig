import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import { config } from './config/env';
import { initializeDatabase } from './database/database';
import { paymentPoller } from './services/paymentPoller';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize SQLite Tables and Indexes
initializeDatabase();

app.use('/api', taskRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platformHandle: config.platformHandleDisplay,
    mockMode: config.isMockMode,
    storage: 'Pure Typescript Persistent JSON Engine',
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`⚡ AgentGig Server running on port ${config.port}`);
    console.log(`🏷️ Platform Moove Handle: ${config.platformHandleDisplay}`);
    console.log(`💾 Database: Persistent JSON (data/agentgig-storage.json)`);

    // Start autonomous payment poller loop
    paymentPoller.start();
  });
}

// Graceful Shutdown
process.on('SIGINT', () => {
  paymentPoller.stop();
  process.exit(0);
});

export default app;