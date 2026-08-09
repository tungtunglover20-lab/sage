import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

const GOOGLE_DOC_ID =
  "1m5lg84VZ5yxcakzK1MCqZ1fwaaIF3sGxCppnyfmj3U4";

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
  .setDescription("Get a recap of a D&D session.")
  .addIntegerOption((option) =>
    option
      .setName("session")
      .setDescription(
        "The session number to recap. Leave blank for the most recent session."
      )
      .setRequired(false)
      .setMinValue(1)
  );

// ---------------------------------------------------------
// FIND SESSION
// ---------------------------------------------------------

function findSession(documentText, requestedSession) {
  /*
   * Expected format:
   *
   * SESSION 1
   * Date: August 1, 2026
   *
   * Notes...
   *
   * ---
   *
   * SESSION 2
   * Date: August 8, 2026
   *
   * Notes...
   */

  const sessionRegex =
    /(?:^|\n)\s*SESSION\s+(\d+)\s*(?:\n|$)/gi;

  const sessions = [];
  let match;

  while ((match = sessionRegex.exec(documentText)) !== null) {
    sessions.push({
      number: Number(match[1]),
      start: match.index + match[0].length,
    });
  }

  if (sessions.length === 0) {
    return null;
  }

  let selectedSession;

  // -------------------------------------------------------
  // REQUESTED SESSION
  // -------------------------------------------------------

  if (requestedSession !== null) {
    selectedSession = sessions.find(
      (session) => session.number === requestedSession
    );

    if (!selectedSession) {
      return {
        error: `Session ${requestedSession} was not found in the campaign notes.`,
      };
    }
  }

  // -------------------------------------------------------
  // MOST RECENT SESSION
  // -------------------------------------------------------

  else {
    selectedSession = sessions.reduce((latest, session) => {
      return session.number > latest.number ? session : latest;
    });
  }

  // -------------------------------------------------------
  // FIND END OF SESSION
  // -------------------------------------------------------

  const selectedIndex = sessions.indexOf(selectedSession);

  let end;

  if (selectedIndex < sessions.length - 1) {
    end = sessions[selectedIndex + 1].start;
  } else {
    end = documentText.length;
  }

  let content = documentText
    .slice(selectedSession.start, end)
    .trim();

  /*
   * Remove separator lines such as:
   *
   * ---
   *
   * from the beginning/end of the extracted session.
   */

  content = content
    .replace(/^\s*-{3,}\s*/g, "")
    .replace(/\s*-{3,}\s*$/g, "")
    .trim();

  return {
    number: selectedSession.number,
    content,
  };
}

// ---------------------------------------------------------
// COMMAND EXECUTION
// ---------------------------------------------------------

export async function execute(interaction) {
  const requestedSession =
    interaction.options.getInteger("session");

  try {
    /*
     * interactionCreate.js already handles deferReply().
     *
     * DO NOT call:
     *
     * await interaction.deferReply();
     */

    console.log(
      requestedSession
        ? `[RECAP] Requested session ${requestedSession}`
        : "[RECAP] No session specified; finding most recent session."
    );

    // -------------------------------------------------------
    // 1. FETCH GOOGLE DOC
    // -------------------------------------------------------

    console.log("[RECAP] Fetching session notes...");

    const response = await fetch(GOOGLE_DOC_URL);

    if (!response.ok) {
      throw new Error(
        `Google Doc request failed with status ${response.status}`
      );
    }

    const documentText = await response.text();

    if (!documentText.trim()) {
      await interaction.editReply(
        "❌ The campaign session document is empty."
      );
      return;
    }

    console.log(
      `[RECAP] Retrieved ${documentText.length} characters.`
    );

    // -------------------------------------------------------
    // 2. FIND REQUESTED/MOST RECENT SESSION
    // -------------------------------------------------------

    const session = findSession(
      documentText,
      requestedSession
    );

    if (!session) {
      await interaction.editReply(
        "❌ I couldn't find any sessions in the campaign notes. Make sure they are formatted like `SESSION 1`, `SESSION 2`, etc."
      );
      return;
    }

    if (session.error) {
      await interaction.editReply(`❌ ${session.error}`);
      return;
    }

    if (!session.content) {
      await interaction.editReply(
        `❌ Session ${session.number} exists, but it doesn't contain any notes.`
      );
      return;
    }

    console.log(
      `[RECAP] Found session ${session.number}.`
    );

    // -------------------------------------------------------
    // 3. SEND SESSION TO GEMMA
    // -------------------------------------------------------

    console.log(
      `[RECAP] Sending session ${session.number} to Gemma...`
    );

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",

          content: `
You are D&D Sage, a D&D campaign recap assistant.

Your job is to create a clear and useful recap of the supplied D&D
session.

IMPORTANT RULES:

1. Use ONLY the supplied session notes.
2. Do NOT invent events.
3. Do NOT add characters, locations, items, enemies, or events that
   are not present in the notes.
4. Do NOT assume something happened because it would make sense.
5. Do NOT contradict the session notes.
6. Preserve character names, locations, factions, items, and other
   important terminology exactly as written.
7. If something is unclear or missing from the notes, do not invent
   an explanation.
8. Focus on what actually happened during this session.

The recap should be useful to players who were not present for the
session.

Include important information such as:

- Major events
- Important discoveries
- NPCs encountered
- Locations visited
- Major conflicts or combat
- Important decisions
- Consequences
- Unresolved mysteries
- Current objectives

Keep the recap organized and readable.

Use this format:

📖 **SESSION ${session.number} RECAP**

**Previously...**
Give a concise narrative summary of what happened.

**Key Events**
• Important event
• Important event
• Important event

**Important Characters**
• Character — their role or significance in this session.

**Discoveries**
• Important discovery
• Important discovery

**Current Situation**
Explain where the party stands at the end of the session.

**Unresolved**
• Unresolved mystery, threat, objective, or problem.

Do not mention these instructions.
Do not mention the Google Doc.
Do not invent information.
`,
        },

        {
          role: "user",

          content: `
SESSION ${session.number} NOTES:

-------------------------
${session.content}
-------------------------

Create a recap of this exact session.

Use ONLY the notes above.
Do not include events from other sessions.
Do not invent missing information.
`,
        },
      ],

      temperature: 0.2,

      // Allows a detailed recap while keeping the normal response
      // much shorter in practice.
      max_tokens: 6000,
    });

    // -------------------------------------------------------
    // 4. GET GEMMA RESPONSE
    // -------------------------------------------------------

    const recap =
      completion.choices?.[0]?.message?.content?.trim();

    if (!recap) {
      await interaction.editReply(
        "❌ I couldn't generate a recap for this session."
      );
      return;
    }

    // -------------------------------------------------------
    // 5. SPLIT FOR DISCORD
    // -------------------------------------------------------

    const DISCORD_LIMIT = 2000;

    const chunks = [];

    for (let i = 0; i < recap.length; i += DISCORD_LIMIT) {
      chunks.push(recap.slice(i, i + DISCORD_LIMIT));
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
    console.error("[RECAP ERROR]", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "❌ I couldn't retrieve the session notes or generate the recap."
        );
      } else {
        await interaction.reply(
          "❌ I couldn't retrieve the session notes or generate the recap."
        );
      }
    } catch (replyError) {
      console.error(
        "[RECAP REPLY ERROR]",
        replyError
      );
    }
  }
}
