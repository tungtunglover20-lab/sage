import { SlashCommandBuilder } from "discord.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import musicManager from "../music/musicManager.js";

export const data = new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current music.");

export async function execute(interaction) {
    const music = musicManager.get(interaction.guild.id);

    if (music.getStatus() === AudioPlayerStatus.Idle) {
        return interaction.reply({
            content: "❌ Nothing is currently playing.",
            ephemeral: true,
        });
    }

    music.pause();

    await interaction.reply("⏸️ Music paused.");
}
