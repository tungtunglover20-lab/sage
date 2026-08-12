import { SlashCommandBuilder } from "discord.js";

import musicManager from "../music/musicManager.js";

export const data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue.");

export async function execute(interaction) {
    const music = musicManager.get(interaction.guild.id);

    const current = music.getCurrent();
    const queue = music.getQueue();

    if (!current && queue.length === 0) {
        return interaction.reply("🎵 The queue is empty.");
    }

    let message = "🎵 **Music Queue**\n\n";

    if (current) {
        message += `▶️ **Now Playing:** ${current.title}\n\n`;
    }

    if (queue.length > 0) {
        message += "**Up Next:**\n";

        queue.forEach((song, index) => {
            message += `${index + 1}. ${song.title}\n`;
        });
    } else {
        message += "Nothing else is queued.";
    }

    await interaction.reply(message);
}
