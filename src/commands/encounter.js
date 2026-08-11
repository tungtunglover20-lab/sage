import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

// Discord role allowed to use /encounter.
//
// Add this to your Railway environment variables:
//
// ENCOUNTER_ROLE_ID=123456789012345678

const ENCOUNTER_ROLE_ID = process.env.ENCOUNTER_ROLE_ID;

const ai = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

// ---------------------------------------------------------
// DISCORD COMMAND
// ---------------------------------------------------------

export const data = new SlashCommandBuilder()
  .setName("encounter")
  .setDescription(
    "Generate a random encounter appropriate for your party and terrain."
  )
  .addIntegerOption((option) =>
    option
      .setName("level")
      .setDescription("The level of the party.")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(20)
  )
  .addIntegerOption((option) =>
    option
      .setName("party_size")
      .setDescription("Number of player characters in the party.")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(12)
  )
  .addStringOption((option) =>
    option
      .setName("terrain")
      .setDescription("The terrain where the encounter occurs.")
      .setRequired(true)
      .addChoices(
        { name: "Arctic / Snowy Mountains", value: "arctic" },
        { name: "Forest", value: "forest" },
        { name: "Grassland / Plains", value: "grassland" },
        { name: "Desert", value: "desert" },
        { name: "Swamp", value: "swamp" },
        { name: "Jungle", value: "jungle" },
        { name: "Mountains", value: "mountains" },
        { name: "Underdark / Caves", value: "underdark" },
        { name: "Coast / Beach", value: "coast" },
        { name: "Ocean", value: "ocean" },
        { name: "Urban / City", value: "urban" },
        { name: "Ruins", value: "ruins" },
        { name: "Volcanic", value: "volcanic" },
        { name: "Road / Wilderness", value: "wilderness" }
      )
  );

// ---------------------------------------------------------
// TERRAIN DESCRIPTIONS
// ---------------------------------------------------------

const TERRAIN_INFO = {
  arctic: `
Snowy mountains, frozen valleys, glaciers, icy caves, and tundra.
Possible creatures include frost giants, yetis, remorhazes, winter wolves,
white dragons, ice mephits, kobolds, and other cold-adapted creatures.
`,

  forest: `
Dense forests, ancient woods, woodland clearings, and overgrown paths.
Possible creatures include wolves, bears, ettercaps, owlbears, treants,
dryads, hags, giant spiders, displacer beasts, and green dragons.
`,

  grassland: `
Open plains, rolling hills, farmland, and vast grasslands.
Possible creatures include gnolls, centaurs, lions, dire wolves,
ankhegs, bulettes, wyverns, and other roaming predators.
`,

  desert: `
Harsh deserts, dunes, rocky wastelands, and ancient desert ruins.
Possible creatures include giant scorpions, giant snakes, gnolls,
mummies, elementals, bulettes, blue dragons, and desert predators.
`,

  swamp: `
Murky wetlands, flooded forests, bogs, and stagnant waterways.
Possible creatures include crocodiles, shambling mounds, hags,
giant frogs, hydras, lizardfolk, black dragons, and undead.
`,

  jungle: `
Dense tropical jungle, enormous trees, ruins, and humid wilderness.
Possible creatures include dinosaurs, yuan-ti, giant apes, trolls,
chimeras, snakes, wyverns, and green dragons.
`,

  mountains: `
Rocky mountain ranges, cliffs, high passes, and mountain caves.
Possible creatures include giants, griffons, wyverns, rocs,
manticores, dragons, and mountain predators.
`,

  underdark: `
Massive underground caverns, tunnels, fungal forests, and subterranean
settlements.
Possible creatures include drow, duergar, umber hulks, beholders,
mind flayers, hook horrors, ropers, and other subterranean monsters.
`,

  coast: `
Rocky coastlines, beaches, cliffs, caves, and coastal settlements.
Possible creatures include sahuagin, merfolk, harpies, sea hags,
giant crabs, wyverns, and coastal dragons.
`,

  ocean: `
Open ocean, deep waters, islands, underwater ruins, and ships.
Possible creatures include sahuagin, sharks, krakens, merfolk,
sea serpents, giant octopuses, and aquatic dragons.
`,

  urban: `
Cities, streets, alleys, marketplaces, sewers, and noble districts.
Possible creatures include bandits, cultists, assassins, mimics,
wererats, vampires, devils, and other creatures capable of operating
in civilization.
`,

  ruins: `
Ancient ruins, abandoned structures, forgotten temples, and collapsed
civilizations.
Possible creatures include undead, cultists, constructs, mimics,
golems, ghosts, wraiths, and other creatures attracted to ruins.
`,

  volcanic: `
Volcanic mountains, lava fields, ash-covered terrain, and fire-filled
caverns.
Possible creatures include fire elementals, salamanders, hell hounds,
magmins, red dragons, azers, and other fire-associated creatures.
`,

  wilderness: `
Remote roads, wilderness trails, forests, hills, and undeveloped land.
Use a broad variety of creatures appropriate to the surrounding
environment and party level.
`,
};

// ---------------------------------------------------------
// COMMAND EXECUTION
// ---------------------------------------------------------

export async function execute(interaction) {
  const level = interaction.options.getInteger("level", true);
  const partySize = interaction.options.getInteger("party_size", true);
  const terrain = interaction.options.getString("terrain", true);

  // -------------------------------------------------------
  // ROLE CHECK
  // -------------------------------------------------------

  if (!ENCOUNTER_ROLE_ID) {
    console.error(
      "[ENCOUNTER] ENCOUNTER_ROLE_ID is not configured."
    );

    await interaction.editReply(
      "❌ The encounter command has not been configured with an authorized role."
    );

    return;
  }

  const member = interaction.member;

  if (!member.roles.cache.has(ENCOUNTER_ROLE_ID)) {
    await interaction.editReply(
      "❌ You do not have permission to use `/encounter`."
    );

    return;
  }

  try {
    // interactionCreate.js already handles deferReply().
    // DO NOT call interaction.deferReply() here.

    console.log(
      `[ENCOUNTER] Level ${level}, ${partySize} players, terrain: ${terrain}`
    );

    const terrainInfo =
      TERRAIN_INFO[terrain] || TERRAIN_INFO.wilderness;

    // -------------------------------------------------------
    // GENERATE ENCOUNTER
    // -------------------------------------------------------

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",

          content: `
You are D&D Sage, an expert D&D 5e encounter generator.

Your job is to generate ONE random encounter appropriate for the supplied
party and terrain.

The encounter MUST feel natural for the specified environment.

The encounter should be balanced around the party's level and size.

IMPORTANT:

- The encounter should be challenging but not absurdly deadly.
- Do not automatically choose a single monster.
- You may choose one powerful creature.
- You may choose several weaker creatures.
- You may choose a mixture of creatures.
- Randomize the encounter rather than always choosing the most obvious
  creature.
- Creatures should make sense for the terrain.
- Do not use creatures that obviously don't belong in the environment
  unless there is a compelling explanation.
- Consider action economy.
- Consider the combined strength of multiple monsters.
- A large group of weak creatures can be appropriate instead of one
  powerful creature.
- A solo monster should generally have enough power or action economy
  to avoid being trivially defeated by the entire party.
- Do not make every encounter a boss fight.
- Most encounters should be ordinary encounters appropriate for travel.
- Occasionally generate unusual or memorable encounters.

PARTY LEVEL:
${level}

PARTY SIZE:
${partySize}

TERRAIN:
${terrain}

TERRAIN INFORMATION:
${terrainInfo}

ENCOUNTER DIFFICULTY:

Aim primarily for encounters in the EASY through HARD range.

Avoid intentionally generating a DEADLY encounter unless the creature
combination is still reasonably survivable and you clearly label it.

Use D&D 5e CR and encounter-building principles as a guideline.

Do not invent CR values.

If you know the creature's standard 5e CR, include it.

If you are uncertain about a creature's exact CR, do not make up a
number. Instead write "CR varies by source" or omit the CR.

The encounter can contain:

- One creature
- Two or more creatures
- A group of weaker creatures
- A strong creature with weaker supporting creatures

Make the encounter feel RANDOM.

Do not always pick dragons, giants, or other famous monsters simply
because the party is high level.

OUTPUT FORMAT:

⚔️ **RANDOM ENCOUNTER**

**Terrain:** [terrain]
**Party:** [party size] Level [level] characters

**Encounter:**
[Creature(s) and quantity]

**Difficulty:**
[Easy / Medium / Hard / Deadly]

**CR:**
[CR information if known]

**Encounter Description:**
Give a short atmospheric description of what the party encounters.

**How They Behave:**
Explain what the creatures are doing when encountered and whether
they immediately attack, are territorial, are hunting, are traveling,
or have another motivation.

**DM Notes:**
Give a few useful details the DM can use during the encounter.

Keep the response practical and concise.
`,
        },

        {
          role: "user",

          content: `
Generate a random D&D encounter for:

Party:
${partySize} players
Level ${level}

Terrain:
${terrain}

Remember:

- The encounter must fit the terrain.
- The encounter must be appropriate for the party.
- It can be one strong creature or multiple weaker creatures.
- Randomize the encounter.
- Avoid automatically choosing the strongest possible monster.
- Make it feel like something the party could naturally encounter
  while traveling through this environment.
`,
        },
      ],

      temperature: 0.9,
      max_tokens: 1400,
    });

    // -------------------------------------------------------
    // GET RESPONSE
    // -------------------------------------------------------

    const encounter =
      completion.choices?.[0]?.message?.content?.trim();

    if (!encounter) {
      await interaction.editReply(
        "❌ I couldn't generate an encounter right now."
      );

      return;
    }

    // -------------------------------------------------------
    // SEND RESPONSE
    // -------------------------------------------------------

    const DISCORD_LIMIT = 2000;

    if (encounter.length <= DISCORD_LIMIT) {
      await interaction.editReply(encounter);
      return;
    }

    await interaction.editReply(
      encounter.slice(0, DISCORD_LIMIT)
    );

    for (
      let i = DISCORD_LIMIT;
      i < encounter.length;
      i += DISCORD_LIMIT
    ) {
      await interaction.followUp({
        content: encounter.slice(i, i + DISCORD_LIMIT),
      });
    }

  } catch (error) {
    console.error("[ENCOUNTER ERROR]", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          "❌ I couldn't generate an encounter right now."
        );
      } else {
        await interaction.reply(
          "❌ I couldn't generate an encounter right now."
        );
      }
    } catch (replyError) {
      console.error(
        "[ENCOUNTER REPLY ERROR]",
        replyError
      );
    }
  }
}