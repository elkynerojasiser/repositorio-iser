import { env } from '../config/env.js';

const prefix = () => `[${new Date().toISOString()}]`;

export const logger = {
  info: (...args) => {
    if (env.nodeEnv !== 'test') console.log(prefix(), ...args);
  },
  warn: (...args) => console.warn(prefix(), ...args),
  error: (...args) => console.error(prefix(), ...args),
};
