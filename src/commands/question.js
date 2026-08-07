import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

export const data = new SlashCommandBuilder()
  .setName("question")
  .setDescription("Ask D&D Sage any question.")
  .addStringOption((option) =>
    option
      .setName("prompt")
      .setDescription("Your question")
      .setRequired(true)
  );

export async function execute(interaction) {
  const prompt = interaction.options.getString("prompt", true);

  try {
    const completion = await client.chat.completions.create({
      model: config.openRouter.model,
      messages: [
        {
          role: "system",
          content:
            "You are D&D Sage, an expert on Dungeons & Dragons 5th Edition. Answer rules questions accurately and concisely. If you are unsure, say so rather than inventing a rule. When possible, explain the reasoning behind the rule. Do not homebrew or speculate unless the user explicitly asks for a homebrew answer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response =
      completion.choices[0]?.message?.content ?? "No response.";

    if (response.length <= 2000) {
      await interaction.editReply(response);
    } else {
      for (let i = 0; i < response.length; i += 2000) {
        if (i === 0) {
          await interaction.editReply(response.slice(i, i + 2000));
        } else {
          await interaction.followUp(response.slice(i, i + 2000));
        }
      }
    }
  } catch (err) {
    console.error(err);

    await interaction.editReply(
      "❌ An error occurred while contacting the AI."
    );
  }
}
