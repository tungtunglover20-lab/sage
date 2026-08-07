import { Events, ActivityType } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

/**
 * @param {import('discord.js').Client<true>} client
 * @param {{ logger: import('pino').Logger }} context
 */
export function execute(client, { logger }) {
  logger.info({ tag: client.user.tag, servers: client.guilds.cache.size }, 'D&D Sage is online');
  client.user.setActivity('/ask about the rules', { type: ActivityType.Listening });
}
