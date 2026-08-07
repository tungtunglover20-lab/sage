import { readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Loads every event module under `eventsDir` and binds it to the Discord
 * client. Each module must export `name` (a discord.js Events key) and
 * `execute` (the handler), and may optionally export `once` (default false).
 *
 * Every handler receives the shared `context` object as its final argument,
 * giving command and event code access to the logger, loaded commands, and
 * client without manual wiring.
 * @param {string} eventsDir
 * @param {import('discord.js').Client} client
 * @param {{ logger: import('pino').Logger }} context
 * @returns {Promise<void>}
 */
export async function loadEvents(eventsDir, client, context) {
  const files = readdirSync(eventsDir).filter((file) => extname(file) === '.js');

  for (const file of files) {
    const filePath = join(eventsDir, file);
    const eventModule = await import(pathToFileURL(filePath).href);

    if (!eventModule.name || !eventModule.execute) {
      context.logger.warn({ filePath }, 'Skipped event file: missing required "name" or "execute" export');
      continue;
    }

    const handler = (...args) => eventModule.execute(...args, context);

    if (eventModule.once) {
      client.once(eventModule.name, handler);
    } else {
      client.on(eventModule.name, handler);
    }

    context.logger.debug({ event: eventModule.name, once: Boolean(eventModule.once) }, 'Loaded event');
  }
}
