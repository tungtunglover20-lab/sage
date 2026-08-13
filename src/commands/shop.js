import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";
import config from "../config/env.js";

const ai = new OpenAI({
  apiKey: config.openRouter.apiKey,
  baseURL: config.openRouter.baseUrl,
});

export const data = new SlashCommandBuilder()
  .setName("shop")
  .setDescription("Generate a shop and its inventory for the campaign.")
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("Where the shop is located.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Type of shop.")
      .setRequired(false)
      .addChoices(
        { name: "General Store", value: "general" },
        { name: "Blacksmith", value: "blacksmith" },
        { name: "Armorer", value: "armorer" },
        { name: "Weaponsmith", value: "weaponsmith" },
        { name: "Alchemist", value: "alchemist" },
        { name: "Herbalist", value: "herbalist" },
        { name: "Tailor", value: "tailor" },
        { name: "Jeweler", value: "jeweler" },
        { name: "Adventurer's Supply", value: "adventurer" },
        { name: "Bookshop", value: "bookshop" },
        { name: "Stable", value: "stable" },
        { name: "Random", value: "random" }
      )
  )
  .addIntegerOption((option) =>
    option
      .setName("party_level")
      .setDescription("Average party level, used to scale rare supplies.")
      .setMinValue(1)
      .setMaxValue(20)
      .setRequired(false)
  );

export async function execute(interaction) {
  const location = interaction.options.getString("location", true);
  const type = interaction.options.getString("type") || "random";
  const partyLevel = interaction.options.getInteger("party_level");

  try {
    console.log(
      `[SHOP] Generating ${type} shop in ${location}${
        partyLevel ? ` for level ${partyLevel}` : ""
      }`
    );

    const completion = await ai.chat.completions.create({
      model: config.openRouter.model,

      messages: [
        {
          role: "system",
          content: `
You are D&D Sage, an expert Dungeon Master and realistic medieval fantasy
shop generator.

Your job is to generate ONE believable shop for an ongoing D&D 5e campaign.

IMPORTANT CAMPAIGN SETTING:

This is a LOW-MAGIC fantasy world.

Magic exists, but it is rare and valuable.

Ordinary merchants should NOT have magical items.

The vast majority of shops should contain completely mundane equipment.

STRICT MAGIC RULES:

- Do NOT generate rare, very rare, or legendary magic items.
- Do NOT generate uncommon magic items as normal merchandise.
- If a magic item appears at all, it must be UNCOMMON or weaker.
- Magic items should be extremely rare.
- Most generated shops should contain ZERO permanent magic items.
- One-use magical items are much more acceptable than permanent magic items.
- Appropriate one-use magical items include:
  - Basic healing potions
  - Weak utility potions
  - Simple single-use scrolls
  - Other minor consumable magical items
- Do NOT generate bags of holding, +2 weapons, +3 weapons,
  legendary weapons, powerful wands, powerful rings, or similar items.
- Do NOT give normal blacksmiths magical weapons.
- Do NOT give normal merchants powerful magical equipment.
- A +1 weapon or +1 armor should be extraordinarily unusual and should
  generally NOT appear in a randomly generated shop.
- If you include a magic item, explain why the merchant has it.
- Magic should feel special rather than normal.

ECONOMY:

Use gold pieces (gp), silver pieces (sp), and copper pieces (cp).

Prices should be believable for a medieval fantasy economy.

Do not make everything absurdly expensive.

Do not make everything suspiciously cheap.

Common mundane goods should generally be affordable.

LOCATION:

The shop is located in:

${location}

SHOP TYPE:

${type}

${
  partyLevel
    ? `AVERAGE PARTY LEVEL:
${partyLevel}

Use this only to determine whether slightly better equipment or adventuring
supplies would reasonably be available. Do NOT use party level as an excuse
to generate powerful magic items.`
    : ""
}

SHOP GENERATION RULES:

- Create a believable shop name.
- Create a believable merchant.
- Give the merchant a short personality.
- Make the shop fit its location.
- Make the inventory appropriate for the shop type.
- Consider the wealth of the surrounding area.
- Consider whether the location is rural, urban, wealthy, poor, dangerous,
  remote, etc.
- Do not generate items that would obviously be unavailable in the location.
- Do not make every shop identical.
- Avoid excessive magical equipment.
- Avoid excessive exotic equipment.
- Mundane equipment should make up the overwhelming majority of the inventory.
- Include approximately 8-15 items.
- Items can have quantities.
- Include prices for every item.
- Include a short description for unusual items.
- The shop should feel like a real place that players could visit.

ITEM CATEGORIES:

Depending on the shop, appropriate merchandise can include:

Blacksmith:
- Swords
- Axes
- Spears
- Daggers
- Tools
- Nails
- Horseshoes
- Chains
- Farming equipment
- Basic shields
- Basic armor components

Armorer:
- Leather armor
- Studded leather
- Shields
- Chain shirt
- Chain mail
- Splint
- Helmets
- Gauntlets
- Repair services

General Store:
- Rope
- Torches
- Lanterns
- Oil
- Rations
- Waterskins
- Blankets
- Flint and steel
- Backpacks
- Basic tools
- Camping supplies

Alchemist:
- Antitoxin
- Basic healing potions
- Common solvents
- Acid
- Antiseptics
- Smoke-producing mixtures
- Basic reagents

Herbalist:
- Medicinal herbs
- Bandages
- Antitoxin ingredients
- Common herbs
- Herbal remedies
- Basic healing supplies

Adventurer's Supply:
- Rope
- Pitons
- Torches
- Rations
- Bedrolls
- Caltrops
- Hunting traps
- Crowbars
- Lanterns
- Oil
- Maps
- Basic climbing equipment

Do not treat this list as mandatory. Generate naturally.

OUTPUT FORMAT:

🏪 **[SHOP NAME]**

**Location:** [location]
**Type:** [shop type]

**Owner**
[Name] — [short personality description]

**Description**
[2-4 sentences describing the shop and its atmosphere.]

**Inventory**

**[Item]** — [price]
[Short description if necessary]

**[Item]** — [price]
[Short description if necessary]

Continue until there are approximately 8-15 items.

**Magic Items**
[If none exist, say:
"None — this shop carries no magical merchandise."]

If there are magical items, list them separately and explain why they are
available.

**Merchant**
Give one short detail about the merchant's personality, habits, or attitude
toward customers.

Keep the response concise enough for Discord.

NEVER generate magic items simply because the party is high level.

A high-level adventurer visiting a mundane village should still find a
mostly mundane village shop.
`,
        },
        {
          role: "user",
          content: `
Generate a shop for the following campaign location:

LOCATION:
${location}

SHOP TYPE:
${type}

${
  partyLevel
    ? `AVERAGE PARTY LEVEL:
${partyLevel}`
    : "No party level was provided. Generate a normal shop."
}

Remember that this is a low-magic world. Keep magical items extremely rare
and prioritize believable mundane merchandise.
`,
        },
      ],

      temperature: 0.8,
      max_tokens: 1800,
    });

    const response =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a shop right now.";

    // Discord message limit handling
    if (response.length <= 2000) {
      await interaction.editReply(response);
      return;
    }

    await interaction.editReply(response.slice(0, 2000));

    for (let i = 2000; i < response.length; i += 2000) {
      await interaction.followUp(response.slice(i, i + 2000));
    }
  } catch (error) {
    console.error("[SHOP] Shop generation error:", error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(
        "❌ I couldn't generate a shop right now. Please try again."
      );
    } else {
      await interaction.reply(
        "❌ I couldn't generate a shop right now. Please try again."
      );
    }
  }
}