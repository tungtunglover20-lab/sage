import {
    SlashCommandBuilder,
    PermissionFlagsBits,
} from "discord.js";

import musicManager from "../music/musicManager.js";

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play audio from a direct audio URL.")
    .addStringOption(option =>
        option
            .setName("url")
            .setDescription("Direct URL to an audio stream/file")
            .setRequired(true)
    );

export async function execute(interaction) {
    const member = interaction.member;

    if (!member?.voice?.channel) {
        return interaction.reply({
            content: "❌ You need to be in a voice channel first.",
            ephemeral: true,
        });
    }

    const url = interaction.options.getString("url");

    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch {
        return interaction.reply({
            content: "❌ That isn't a valid URL.",
            ephemeral: true,
        });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return interaction.reply({
            content: "❌ Only HTTP and HTTPS audio URLs are supported.",
            ephemeral: true,
        });
    }

    await interaction.deferReply();

    try {
        const music = musicManager.get(interaction.guild.id);

        const wasPlaying = music.getCurrent() !== null;

        await music.add(
            url,
            url,
            member.voice.channel
        );

        if (wasPlaying) {
            await interaction.editReply(
                `🎵 Added to the queue.\n<${url}>`
            );
        } else {
            await interaction.editReply(
                `🎵 Now attempting to play:\n<${url}>`
            );
        }
    } catch (error) {
        console.error("[Play]", error);

        await interaction.editReply(
            "❌ I couldn't play that audio source."
        );
    }
}
