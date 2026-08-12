import { SlashCommandBuilder } from "discord.js";

import musicManager from "../music/musicManager.js";

export const data = new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song.");

export async function execute(interaction) {
    const music = musicManager.get(interaction.guild.id);
    const current = music.getCurrent();

    if (!current) {
        return interaction.reply("🎵 Nothing is currently playing.");
    }

    await interaction.reply(
        `🎵 **Now Playing**\n${current.title}`
    );
}