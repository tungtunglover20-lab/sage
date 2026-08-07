import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription("Checks whether D&D Sage is online and reports latency.");

export const cooldown = 3;
export const deferReply = false;

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {{ logger: import('pino').Logger }} context
 */
export async function execute(interaction, { logger }) {
  const start = Date.now();

  await interaction.reply({
    embeds: [createEmbed({ title: '🏓 Pong!' }).setDescription('Measuring round-trip latency…')],
  });

  const roundTripMs = Date.now() - start;
  const wsPingMs = Math.round(interaction.client.ws.ping);

  const resultEmbed = createEmbed({ title: '🏓 Pong!' }).addFields(
    { name: 'Round-trip latency', value: `${roundTripMs}ms`, inline: true },
    { name: 'Websocket heartbeat', value: `${wsPingMs}ms`, inline: true },
  );

  await interaction.editReply({ embeds: [resultEmbed] });
  logger.debug({ roundTripMs, wsPingMs }, 'Handled /ping');
}
