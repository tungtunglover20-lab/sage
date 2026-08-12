import { SlashCommandBuilder } from "discord.js";

import musicManager from "../music/musicManager.js";

export const data = new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume paused music.");

export async function execute(interaction) {
    const music = musicManager.get(interaction.guild.id);

    if (!music.getCurrent()) {
        return interaction.reply({
            content: "❌ Nothing is currently playing.",
            ephemeral: true,
        });
    }

    music.resume();

    await interaction.reply("▶️ Music resumed.");
}