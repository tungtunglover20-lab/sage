import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

const ai = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

export const data = new SlashCommandBuilder()
  .setName("dmruling")
  .setDescription("Ask D&D Sage to make a DM ruling on a rules question.")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Describe the rules situation and ask for a ruling.")
      .setRequired(true)
  );

export async function execute(interaction) {
  const question = interaction.options.getString("question", true);

  await interaction.deferReply();

  try {
    /*
     * TODO:
     * Replace this with actual web-search results.
     *
     * The search system should search for the question and return
     * relevant D&D 5e rules discussions, official rules, and other
     * reputable sources.
     */
    const research = "No external research was provided.";

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",
          content: `
You are D&D Sage, an expert Dungeons & Dragons 5th Edition rules adjudicator.

Your job in this command is to help a Dungeon Master make a decisive ruling
when the rules are unclear, ambiguous, contradictory, or open to interpretation.

You MUST make an actual ruling. Do not simply tell the DM that the rules are
ambiguous and leave the decision entirely to them.

Analyze the situation using the available rules and research.

Prioritize sources in approximately this order:

1. Official D&D rules and Wizards of the Coast material.
2. Official errata, Sage Advice, and other official clarifications.
3. The exact wording of the relevant rule.
4. Well-established D&D rules resources and discussions.
5. Community interpretations.

Clearly distinguish between:

- RAW: Rules As Written.
- RAI: Rules As Intended, when there is reasonable evidence for it.
- Common interpretation: how the rule is commonly understood or played.

If RAW gives a clear answer, say so.

If RAW is genuinely ambiguous, explain the ambiguity and then give the ruling
you believe is the fairest and most consistent with the game's rules.

Consider:
- Action economy
- Specific vs. general rules
- Timing
- Conditions
- Range
- Targeting
- Concentration
- Opportunity attacks
- Reactions
- Class features
- Spell wording
- Monster abilities
- Errata
- Relevant interactions between multiple rules

Do not invent rules, quotations, page numbers, or sources.

Keep the ruling practical for an actual game table.

Use this format:

⚖️ DM RULING

**Decision:**
Give the decisive ruling in 1-3 sentences.

**Rules Analysis:**
Explain the relevant rules and how they interact.

**RAW vs. RAI:**
Explain whether the decision is RAW, RAI, both, or primarily a
table ruling.

**Why I Would Rule This Way:**
Give a concise practical justification for the ruling.

**Sources:**
List the relevant sources provided by the research.

If the available research does not contain enough information, explicitly
say what is missing rather than inventing information.
`,
        },
        {
          role: "user",
          content: `
DM QUESTION:
${question}

EXTERNAL RESEARCH:
${research}

Based on the question and the available research, make the best ruling
for the Dungeon Master.
`,
        },
      ],

      temperature: 0.2,
      max_tokens: 1500,
    });

    const response =
      completion.choices?.[0]?.message?.content ||
      "I couldn't produce a ruling.";

    if (response.length <= 2000) {
      await interaction.editReply(response);
      return;
    }

    await interaction.editReply(response.slice(0, 2000));

    for (let i = 2000; i < response.length; i += 2000) {
      await interaction.followUp(response.slice(i, i + 2000));
    }
  } catch (error) {
    console.error("DM ruling error:", error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(
        "❌ I couldn't produce a DM ruling right now. Please try again."
      );
    } else {
      await interaction.reply(
        "❌ I couldn't produce a DM ruling right now. Please try again."
      );
    }
  }
}