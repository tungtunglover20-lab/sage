
import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import { tavily } from "@tavily/core";
import config from "../config/env.js";

const ai = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

const search = tavily({
  apiKey: process.env.TAVILY_API_KEY,
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

  try {
    /*
     * IMPORTANT:
     * interactionCreate.js already defers the interaction.
     * Do NOT call interaction.deferReply() here.
     */

    // ---------------------------------------------------------
    // 1. SEARCH THE WEB
    // ---------------------------------------------------------

    console.log(`[DM RULING] Searching web for: ${question}`);

    const results = await search.search(question, {
      searchDepth: "advanced",
      maxResults: 6,
      includeAnswer: true,
    });

    if (!results?.results?.length) {
      await interaction.editReply(
        "❌ I couldn't find enough reliable information online to make a ruling."
      );
      return;
    }

    // ---------------------------------------------------------
    // 2. FORMAT THE RESEARCH FOR GEMMA
    // ---------------------------------------------------------

    const research = results.results
      .map((result, index) => {
        return [
          `SOURCE ${index + 1}`,
          `Title: ${result.title || "Unknown"}`,
          `URL: ${result.url || "Unknown"}`,
          `Content:`,
          result.content || "No content available.",
        ].join("\n");
      })
      .join("\n\n==============================\n\n");

    // ---------------------------------------------------------
    // 3. ASK GEMMA TO ANALYZE THE RESEARCH
    // ---------------------------------------------------------

    console.log("[DM RULING] Sending research to Gemma...");

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",

          content: `
You are D&D Sage, an expert Dungeons & Dragons 5th Edition rules adjudicator.

Your job is to help a Dungeon Master make a decisive ruling when a rules
question is unclear, ambiguous, contradictory, or open to interpretation.

You MUST make an actual ruling.

Do NOT simply tell the DM that the rules are ambiguous and leave the decision
entirely to them.

Analyze the DM's question using the supplied web research.

IMPORTANT SOURCE RULES:

1. Prefer official D&D/Wizards of the Coast sources whenever available.
2. Prefer official rules text and official errata.
3. Prefer established D&D rules references over random discussions.
4. Community discussions may be useful for identifying common interpretations,
   but they should not automatically be treated as authoritative.
5. Do not invent rules, quotations, page numbers, URLs, or sources.
6. Do not claim that a source says something unless the supplied research
   actually supports that claim.
7. If the research conflicts, explain the conflict.
8. If the research is insufficient, explicitly say so.

Distinguish between:

RAW = Rules As Written.
RAI = Rules As Intended, when there is reasonable evidence for that interpretation.
Common Interpretation = How the rule is commonly understood or played.

If RAW gives a clear answer, say so.

If RAW is genuinely ambiguous, explain the ambiguity and then make the ruling
you believe is fairest and most consistent with the game's rules.

Consider relevant interactions involving:

- Action economy
- Bonus actions
- Reactions
- Specific vs. general rules
- Timing
- Conditions
- Range
- Targeting
- Concentration
- Opportunity attacks
- Class features
- Feats
- Spells
- Monster abilities
- Equipment
- Errata
- Multiple interacting rules

Do not overcomplicate the answer.

The response should be useful to a DM who needs to make a decision at the
actual game table.

Use EXACTLY this structure:

⚖️ **DM RULING**

**Question:**
Repeat the question given to you.
  
**Decision:**
Give the decisive answer in 1-3 sentences.

**Rules Analysis:**
Explain the relevant rules and how they interact.

**RAW vs. RAI:**
Explain whether the ruling is RAW, RAI, both, or primarily a table ruling.

**Why I Would Rule This Way:**
Give a concise practical justification.

Do NOT include a "Sources" section yourself.
The bot will add the verified source links separately.

Do not mention being an AI.

Do not say that you personally searched the internet.
You were given research by the bot.

Be confident but honest about uncertainty.
`,
        },

        {
          role: "user",

          content: `
DM QUESTION:

${question}


WEB RESEARCH:

${research}


Using the supplied research, analyze the DM's question and make the best
decisive ruling possible.

Remember:

- Do not invent information.
- Do not invent sources.
- Distinguish RAW from RAI.
- Give the DM an actual ruling.
`,
        },
      ],

      temperature: 0.2,
      max_tokens: 1800,
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I couldn't produce a ruling.";

    // ---------------------------------------------------------
    // 4. BUILD SOURCE LIST
    // ---------------------------------------------------------

    const sources = results.results
      .slice(0, 6)
      .map((result, index) => {
        const title = result.title || `Source ${index + 1}`;
        const url = result.url;

        if (!url) {
          return `**${index + 1}.** ${title}`;
        }

        return `**${index + 1}.** [${title}](${url})`;
      })
      .join("\n");

    const finalResponse = `${answer}

📚 **Sources**

${sources}`;

    // ---------------------------------------------------------
    // 5. SEND THE RESPONSE
    // ---------------------------------------------------------

    if (finalResponse.length <= 2000) {
      await interaction.editReply(finalResponse);
      return;
    }

    /*
     * Discord messages have a 2000-character limit.
     *
     * Send the main ruling first, then split the remaining content
     * into follow-up messages.
     */

    await interaction.editReply(finalResponse.slice(0, 2000));

    for (let i = 2000; i < finalResponse.length; i += 2000) {
      await interaction.followUp({
        content: finalResponse.slice(i, i + 2000),
      });
    }
  } catch (error) {
    console.error("[DM RULING ERROR]", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "❌ I couldn't produce a DM ruling right now. Please try again."
        );
      } else {
        await interaction.reply(
          "❌ I couldn't produce a DM ruling right now. Please try again."
        );
      }
    } catch (replyError) {
      console.error("[DM RULING REPLY ERROR]", replyError);
    }
  }
}

