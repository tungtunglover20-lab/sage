import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Lists every command D&D Sage currently supports.');

export const cooldown = 3;
export const deferReply = false;

export async function execute(interaction, { commands }) {
  const sorted = [...commands.values()].sort((a, b) => a.data.name.localeCompare(b.data.name));

  const embed = createEmbed({ title: '📖 D&D Sage — Commands' })
    .setDescription("Here's everything I can currently do. More rules-lookup commands are on the way.")
    .addFields(sorted.map((command) => ({ name: `/${command.data.name}`, value: command.data.description })));

  await interaction.reply({ embeds: [embed] });
}