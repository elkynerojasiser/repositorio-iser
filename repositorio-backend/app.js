import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './src/config/env.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import academicProgramRoutes from './src/routes/academicProgramRoutes.js';
import thesisTypeRoutes from './src/routes/thesisTypeRoutes.js';
import researchLineRoutes from './src/routes/researchLineRoutes.js';
import keywordEntityRoutes from './src/routes/keywordEntityRoutes.js';
import thesisRoutes from './src/routes/thesisRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import { authenticate } from './src/middlewares/auth.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    skip: () => env.nodeEnv === 'test',
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv });
});

/** Página simple para comprobar en el navegador que el servidor responde. */
app.get('/prueba', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>API repositorio — prueba</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1a1a1a; }
    h1 { font-size: 1.25rem; }
    a { color: #0b57d0; }
    code { background: #f2f2f2; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    ul { padding-left: 1.2rem; }
  </style>
</head>
<body>
  <h1>Servidor en marcha</h1>
  <p>La API del repositorio de trabajos de grado está respondiendo.</p>
  <ul>
    <li><a href="/health"><code>GET /health</code></a> — estado (JSON)</li>
    <li><code>GET /api/public/thesis</code> — catálogo (requiere <code>Authorization: Bearer …</code>)</li>
  </ul>
</body>
</html>`);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic-programs', academicProgramRoutes);
app.use('/api/thesis-types', thesisTypeRoutes);
app.use('/api/research-lines', researchLineRoutes);
app.use('/api/keywords', keywordEntityRoutes);
app.use('/api/thesis', thesisRoutes);
app.use('/api/public', authenticate, publicRoutes);
app.use('/api/chat', authenticate, chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
