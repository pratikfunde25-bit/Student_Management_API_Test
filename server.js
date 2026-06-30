const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(env.port, () => {
    console.log(`API running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);

  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startServer();
