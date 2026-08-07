import { Client, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import config from './config/env.js';
import logger from './utils/logger.js';
import { loadCommands } from './services/commandLoader.js';
import { loadEvents } from './services/eventLoader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Bootstraps and starts D&D Sage: builds the Discord client, loads commands
 * and events, wires up process-level error handling, and logs in.
 */
async function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  const commands = await loadCommands(join(__dirname, 'commands'), logger);
  const context = { logger, commands, client };

  await loadEvents(join(__dirname, 'events'), client, context);

  registerProcessErrorHandlers(client, logger);

  await client.login(config.discord.token);
}

/**
 * Ensures uncaught errors are logged instead of silently crashing or hanging
 * the process — important on a Pterodactyl server where the only feedback
 * you get is the console log.
 * @param {import('discord.js').Client} client
 * @param {import('pino').Logger} logger
 */
function registerProcessErrorHandlers(client, logger) {
  process.on('unhandledRejection', (error) => {
    logger.error({ err: error }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception — shutting down');
    process.exit(1);
  });

  client.on('error', (error) => {
    logger.error({ err: error }, 'Discord client error');
  });

  client.on('shardDisconnect', (event, shardId) => {
    logger.warn({ shardId, code: event.code }, 'Discord shard disconnected');
  });
}

main().catch((error) => {
  logger.fatal({ err: error }, 'Fatal error during startup');
  process.exit(1);
});
