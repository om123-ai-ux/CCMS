const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = config.port;

async function startServer() {
  console.log('----------------------------------------------------');
  console.log(' Campus Complaint Management System (CCMS) Server   ');
  console.log(` Environment : ${config.nodeEnv}`);
  console.log(' Attachments : Local uploads');
  console.log('----------------------------------------------------');

  await testConnection();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CCMS is running at http://localhost:${PORT}`);
    console.log(`[API] Health check available at http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((error) => {
  console.error('[Server] Failed to start:', error.message);
  process.exitCode = 1;
});
