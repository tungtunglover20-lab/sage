import { EmbedBuilder } from 'discord.js';

const BRAND_COLOR = 0x8b2f2f; // deep rulebook-cover red
const ERROR_COLOR = 0xcc4444;
const FOOTER_TEXT = 'D&D Sage';

/**
 * Creates a branded embed pre-configured with D&D Sage's color, footer, and timestamp.
 * @param {import('discord.js').EmbedData} [data] - Optional initial embed data (title, description, fields, etc).
 * @returns {EmbedBuilder}
 */
export function createEmbed(data = {}) {
  return new EmbedBuilder(data).setColor(BRAND_COLOR).setFooter({ text: FOOTER_TEXT }).setTimestamp();
}

/**
 * Creates a branded error embed for consistent failure messaging.
 * @param {string} message - User-facing description of what went wrong.
 * @returns {EmbedBuilder}
 */
export function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR)
    .setTitle('Something went wrong')
    .setDescription(message)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}
