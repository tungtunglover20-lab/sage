import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

// Put the ID of your public Google Doc here.
//
// Example Google Doc URL:
//
// https://docs.google.com/document/d/1ABC123xyz456/edit
//
// The ID is:
// 1ABC123xyz456

const GOOGLE_DOC_ID = "YOUR_GOOGLE_DOC_ID_HERE";

const GOOGLE_DOC_URL =
  `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=txt`;

const ai = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

// ---------------------------------------------------------
// DISCORD COMMAND
// ---------------------------------------------------------

export const data = new SlashCommandBuilder()
  .setName("recap")
  .setDescription("Get a recap of the most recent D&D session.");

// ---------------------------------------------------------
// COMMAND EXECUTION
// ---------------------------------------------------------

export async function execute(interaction) {
  try {
    /*
     * interactionCreate.js already handles deferReply().
     *
     * DO NOT call:
     *
     * await interaction.deferReply();
     */

    console.log("[RECAP] Fetching campaign notes...");

    // -------------------------------------------------------
    // 1. FETCH GOOGLE DOC
    // -------------------------------------------------------

    const response = await fetch(GOOGLE_DOC_URL);

    if (!response.ok) {
      throw new Error(
        `Google Doc request failed with status ${response.status}`
      );
    }

    const documentText = await response.text();

    if (!documentText.trim()) {
      await interaction.editReply(
        "❌ The campaign notes document is empty."
      );
      return;
    }

    console.log(
      `[RECAP] Retrieved ${documentText.length} characters of campaign notes.`
    );

    // -------------------------------------------------------
    // 2. SEND NOTES TO GEMMA
    // -------------------------------------------------------

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",

          content: `
You are D&D Sage, a campaign recap assistant.

Your job is to create a clear and concise recap of the most recent
Dungeons & Dragons session using ONLY the supplied campaign notes.

IMPORTANT RULES:

1. Do NOT invent events.
2. Do NOT add characters, locations, items, enemies, or events that
   are not present in the notes.
3. Do NOT contradict the campaign notes.
4. Do not assume that something happened simply because it would make
   sense in a D&D campaign.
5. Preserve the names of characters, locations, factions, items, and
   other important terminology exactly as they appear in the notes.
6. Focus on what actually happened.
7. If the notes do not contain enough information for a proper recap,
   say so instead of making information up.

The recap should be useful to players who missed the previous session.

Include:

- Major events
- Important discoveries
- Important NPCs encountered
- Important locations visited
- Major combat or conflicts
- Important decisions made by the party
- Important consequences
- Unresolved mysteries or current objectives

Do not include unnecessary commentary.

Use this format:

📖 **LAST SESSION**

**Previously...**
Write a concise narrative summary of the session.

**Key Events**
• Event
• Event
• Event

**Important Characters**
• Character — brief explanation of their role in the session.

**Discoveries**
• Discovery
• Discovery

**Current Situation**
Explain where the party currently stands and what they are
currently dealing with.

**Unresolved**
• Mystery, threat, objective, or other unresolved matter.

Keep the entire response concise enough for a Discord message whenever
possible.
`,
        },

        {
          role: "user",

          content: `
Here are the campaign notes:

-------------------------
CAMPAIGN NOTES
-------------------------

${documentText}

-------------------------
END CAMPAIGN NOTES
-------------------------

Create a recap of the MOST RECENT SESSION contained in these notes.

Do not summarize older sessions unless they are necessary to understand
the most recent session.

Do not invent missing information.
`,
        },
      ],

      temperature: 0.2,
      max_tokens: 1800,
    });

    // -------------------------------------------------------
    // 3. GET GEMMA'S RESPONSE
    // -------------------------------------------------------

    const recap =
      completion.choices?.[0]?.message?.content?.trim();

    if (!recap) {
      await interaction.editReply(
        "❌ I couldn't generate a session recap."
      );
      return;
    }

    // -------------------------------------------------------
    // 4. SEND TO DISCORD
    // -------------------------------------------------------

    if (recap.length <= 2000) {
      await interaction.editReply(recap);
      return;
    }

    // Discord has a 2000-character message limit.

    await interaction.editReply(recap.slice(0, 2000));

    for (let i = 2000; i < recap.length; i += 2000) {
      await interaction.followUp({
        content: recap.slice(i, i + 2000),
      });
    }

  } catch (error) {
    console.error("[RECAP ERROR]", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "❌ I couldn't retrieve the campaign notes or generate the recap."
        );
      } else {
        await interaction.reply(
          "❌ I couldn't retrieve the campaign notes or generate the recap."
        );
      }
    } catch (replyError) {
      console.error("[RECAP REPLY ERROR]", replyError);
    }
  }
}