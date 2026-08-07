import pino from 'pino';
import config from '../config/env.js';

/**
 * Application-wide logger. JSON output in production (suitable for log
 * aggregation), human-readable colorized output otherwise.
 */
const logger = pino({
  level: config.app.logLevel,
  transport: config.app.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
});

export default logger;
