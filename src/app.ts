import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import { config } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', taskRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platformHandle: config.platformHandleDisplay,
    mockMode: config.isMockMode,
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`⚡ AgentGig Server running on port ${config.port}`);
    console.log(`🏷️ Platform Moove Handle: ${config.platformHandleDisplay}`);
    console.log(`🔧 Mode: ${config.isMockMode ? 'Mock / Sandbox' : 'Live Moove API'}`);
  });
}

export default app;