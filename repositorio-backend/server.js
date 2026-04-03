import app from './app.js';
import { env } from './src/config/env.js';
import { sequelize } from './src/models/index.js';
import { logger } from './src/utils/logger.js';

async function main() {
  await sequelize.authenticate();
  logger.info('Conexión a la base de datos verificada.');

  if (env.syncDb) {
    await sequelize.sync({ alter: false });
    logger.warn('SYNC_DB=true: esquema sincronizado con Sequelize (solo para desarrollo).');
  }

  app.listen(env.port, () => {
    logger.info(`API escuchando en http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  logger.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
});
