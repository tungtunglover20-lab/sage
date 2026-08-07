import 'dotenv/config';
import { ConfigError } from '../utils/errors.js';

/**
 * Reads a required environment variable.
 * @param {string} name
 * @returns {string}
 * @throws {ConfigError} if the variable is missing or empty
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new ConfigError(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value.trim();
}

/**
 * Reads an optional environment variable.
 * @param {string} name
 * @param {string|null} [fallback]
 * @returns {string|null}
 */
function optionalEnv(name, fallback = null) {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : fallback;
}

const nodeEnv = optionalEnv('NODE_ENV', 'production');

/**
 * Frozen, validated application configuration. Importing this module is what
 * triggers validation — if required env vars are missing, this throws
 * immediately at startup rather than failing confusingly later.
 */
const config = Object.freeze({
  discord: Object.freeze({
    token: requireEnv('DISCORD_TOKEN'),
    clientId: requireEnv('1535142266921025586'),
    guildId: optionalEnv('1530628952564044036'),
  }),
  openRouter: Object.freeze({
    apiKey: requireEnv('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'),
    baseUrl: optionalEnv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    model: optionalEnv('OPENROUTER_MODEL', 'google/gemma-4-26b-a4b-it'),
    embeddingModel: optionalEnv('OPENROUTER_EMBEDDING_MODEL', 'openai/text-embedding-3-small'),
  }),
  app: Object.freeze({
    nodeEnv,
    logLevel: optionalEnv('LOG_LEVEL', 'info'),
    isProduction: nodeEnv === 'production',
  }),
});

export default config;
