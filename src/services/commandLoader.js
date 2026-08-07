import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';

/**
 * Recursively walks a directory and returns absolute paths of every .js file
 * found. Supports organizing commands into subfolders later (e.g. by category)
 * without any loader changes.
 * @param {string} dir
 * @returns {string[]}
 */
function walkJsFiles(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walkJsFiles(fullPath));
    } else if (extname(entry) === '.js') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Loads every command module under `commandsDir` into a Collection keyed by
 * command name. Each module must export `data` (a SlashCommandBuilder) and
 * `execute` (an async handler), and may optionally export `cooldown`
 * (seconds, default 0) and `deferReply` (default true).
 * @param {string} commandsDir
 * @param {import('pino').Logger} logger
 * @returns {Promise<Collection<string, object>>}
 */
export async function loadCommands(commandsDir, logger) {
  const commands = new Collection();
  const files = walkJsFiles(commandsDir);

  for (const filePath of files) {
    const commandModule = await import(pathToFileURL(filePath).href);

    if (!commandModule.data || !commandModule.execute) {
      logger.warn({ filePath }, 'Skipped command file: missing required "data" or "execute" export');
      continue;
    }

    commands.set(commandModule.data.name, {
      data: commandModule.data,
      execute: commandModule.execute,
      cooldown: commandModule.cooldown ?? 0,
      deferReply: commandModule.deferReply ?? true,
    });

    logger.debug({ command: commandModule.data.name }, 'Loaded command');
  }

  logger.info({ count: commands.size }, 'Commands loaded');
  return commands;
}
