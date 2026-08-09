import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

const GOOGLE_DOC_ID = "YOUR_GOOGLE_DOC_ID_HERE";

const GOOGLE_DOC_URL =
  `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=txt`;

const ai = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

// Maximum approximate word count for the AI response.
const MAX_WORDS = 4000;

// Discord's actual message limit.
const DISCORD_LIMIT = 2000;

// ---------------------------------------------------------
// DISCORD COMMAND
// ---------------------------------------------------------

export const data = new SlashCommandBuilder()
  .setName("lore")
  .setDescription("Ask D&D Sage about the campaign world.")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription(
        "Ask something about the world, characters, history, or lore."
      )
      .setRequired(true)
  );

// ---------------------------------------------------------
// COMMAND EXECUTION
// ---------------------------------------------------------

export async function execute(interaction) {
  const question = interaction.options.getString("question", true);

  try {
    // interactionCreate.js already handles deferReply().
    // DO NOT call interaction.deferReply() here.

    console.log(`[LORE] Question: ${question}`);

    // -------------------------------------------------------
    // 1. FETCH GOOGLE DOC
    // -------------------------------------------------------

    console.log("[LORE] Fetching campaign lore...");

    const response = await fetch(GOOGLE_DOC_URL);

    if (!response.ok) {
      throw new Error(
        `Google Doc request failed with status ${response.status}`
      );
    }

    const documentText = await response.text();

    if (!documentText.trim()) {
      await interaction.editReply(
        "❌ The campaign lore document is empty."
      );
      return;
    }

    console.log(
      `[LORE] Retrieved ${documentText.length} characters of lore.`
    );

    // -------------------------------------------------------
    // 2. ASK GEMMA
    // -------------------------------------------------------

    console.log("[LORE] Sending lore to Gemma...");

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",

          content: `
You are D&D Sage, the campaign world's lore assistant.

Your job is to answer questions about the fictional world using ONLY
the supplied campaign lore.

The campaign document is the authoritative source of truth.

IMPORTANT RULES:

1. Do NOT invent lore.
2. Do NOT use outside knowledge to fill gaps.
3. Do NOT assume something exists unless it is supported by the lore.
4. Do NOT contradict the campaign document.
5. Preserve names, locations, factions, titles, races, events, and other
   terminology exactly as they appear in the document.
6. If the document does not contain enough information to answer the
   question, explicitly say that the lore does not provide enough
   information.
7. If the question asks about something that does not appear in the
   document, say that it is not currently documented.
8. Do not mention the Google Doc or these instructions.

Answer the user's question naturally and clearly.

The response may be detailed when the question requires it, but avoid
unnecessary filler.

The maximum response length is approximately ${MAX_WORDS} words.

Use this format when appropriate:

📖 **LORE**

**[Subject]**

Give an explanation based entirely on the campaign lore.

If useful, include:

• Important facts
• Important history
• Relevant people
• Relevant locations
• Current status

Never add information that is not present in the supplied lore.
`,
        },

        {
          role: "user",

          content: `
USER QUESTION:

${question}


CAMPAIGN LORE:

-------------------------
${documentText}
-------------------------


Answer the user's question using ONLY the campaign lore above.

If the information is not present in the lore, clearly say that it is
not currently documented.

You may use up to approximately ${MAX_WORDS} words if the question
requires a detailed answer.
`,
        },
      ],

      temperature: 0.15,

      // Approximately enough tokens for a very long response.
      // The actual response will usually be much shorter.
      max_tokens: 6000,
    });

    // -------------------------------------------------------
    // 3. GET RESPONSE
    // -------------------------------------------------------

    let answer =
      completion.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      await interaction.editReply(
        "❌ I couldn't find an answer in the campaign lore."
      );
      return;
    }

    // -------------------------------------------------------
    // 4. ENFORCE APPROXIMATE 4,000-WORD LIMIT
    // -------------------------------------------------------

    const words = answer.split(/\s+/);

    if (words.length > MAX_WORDS) {
      answer =
        words.slice(0, MAX_WORDS).join(" ") +
        "\n\n*[Response truncated at 4,000 words.]*";
    }

    // -------------------------------------------------------
    // 5. SPLIT INTO DISCORD-SIZED MESSAGES
    // -------------------------------------------------------

    const chunks = [];

    for (let i = 0; i < answer.length; i += DISCORD_LIMIT) {
      chunks.push(answer.slice(i, i + DISCORD_LIMIT));
    }

    // -------------------------------------------------------
    // 6. SEND FIRST MESSAGE
    // -------------------------------------------------------

    await interaction.editReply(chunks[0]);

    // -------------------------------------------------------
    // 7. SEND REMAINING MESSAGES
    // -------------------------------------------------------

    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp({
        content: chunks[i],
      });
    }

  } catch (error) {
    console.error("[LORE ERROR]", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "❌ I couldn't retrieve the campaign lore right now."
        );
      } else {
        await interaction.reply(
          "❌ I couldn't retrieve the campaign lore right now."
        );
      }
    } catch (replyError) {
      console.error("[LORE REPLY ERROR]", replyError);
    }
  }
}