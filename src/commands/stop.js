import { SlashCommandBuilder } from "discord.js";

import musicManager from "../music/musicManager.js";

export const data = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop music and leave the voice channel.");

export async function execute(interaction) {
    const music = musicManager.get(interaction.guild.id);

    music.stop();
    music.destroy();

    await interaction.reply(
        "⏹️ Stopped the music and left the voice channel."
    );
}