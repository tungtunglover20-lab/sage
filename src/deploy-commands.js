import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import config from './config/env.js';
import logger from './utils/logger.js';
import { loadCommands } from './services/commandLoader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Registers every command in src/commands with Discord. Registers to a single
 * guild (near-instant) if DISCORD_GUILD_ID is set, otherwise registers
 * globally (can take up to an hour to propagate to all servers).
 * Run with: npm run deploy
 */
async function deployCommands() {
  const commands = await loadCommands(join(__dirname, 'commands'), logger);
  const body = [...commands.values()].map((command) => command.data.toJSON());

  const rest = new REST().setToken(config.discord.token);

  const route = config.discord.guildId
    ? Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId)
    : Routes.applicationCommands(config.discord.clientId);

  logger.info(
    { scope: config.discord.guildId ? `guild:${config.discord.guildId}` : 'global', count: body.length },
    'Deploying slash commands',
  );

  const result = await rest.put(route, { body });

  logger.info({ count: result.length }, 'Slash commands deployed successfully');
}

deployCommands().catch((error) => {
  logger.error({ err: error }, 'Failed to deploy slash commands');
  process.exitCode = 1;
});
