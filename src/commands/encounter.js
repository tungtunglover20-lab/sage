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
SNOWY MOUNTAINS / ARCTIC

Common / Low-Level:
- Ice Mephit
- Kobold
- Goblin
- Wolf
- Winter Wolf Pup / young cold-adapted predators
- Giant Owl
- Giant Goat
- Polar Bear
- Blood Hawk
- Mountain Goat
- Stirge
- Snowy Owl

Moderate:
- Winter Wolf
- Yeti
- Ogre
- Troll
- Harpy
- Griffon
- Manticores
- Werewolf
- Revenant
- Wight
- Elemental creatures associated with ice or wind
- Remorhaz
- Mammoth
- Giant Elk
- Frost-themed undead
- Cold-themed monstrosities

High-Level:
- Frost Giant
- Frost Giant Everlasting One
- Young White Dragon
- Adult White Dragon
- Ancient White Dragon
- Remorhaz
- Mammoth herds
- Roc
- Cloud Giant
- Storm Giant
- Death Knight
- Powerful winter-themed undead
- High-level elemental creatures

Very High-Level / Rare:
- Ancient White Dragon
- Adult or Elder Frost Giant variants
- Roc
- Storm Giant
- Powerful ice elementals
- Legendary cold-associated monsters

The encounter should not always use giants or dragons. Arctic encounters can
include predators, wandering humanoids, monsters hunting for food, hostile
tribes, undead, elementals, territorial beasts, or strange creatures adapted
to the cold.

Creatures should feel natural in frozen mountains, glaciers, tundra, icy caves,
snow-covered valleys, and mountain passes.
`,

  forest: `
FOREST / WOODLAND

Common / Low-Level:
- Wolf
- Dire Wolf
- Black Bear
- Brown Bear
- Boar
- Giant Boar
- Giant Badger
- Giant Weasel
- Giant Spider
- Giant Wolf Spider
- Giant Owl
- Giant Elk
- Elk
- Deer
- Panther
- Tiger
- Giant Frog
- Poisonous Snake
- Giant Poisonous Snake
- Twig Blight
- Needle Blight
- Vine Blight
- Goblin
- Hobgoblin
- Bugbear
- Kobold
- Bandit
- Scout
- Cultist
- Stirge
- Blink Dog
- Satyr
- Sprite
- Pixie

Moderate:
- Owlbear
- Ettercap
- Dryad
- Green Hag
- Sea Hag
- Dire Wolf
- Giant Constrictor Snake
- Giant Crocodile near forest waterways
- Troll
- Worg
- Werewolf
- Wererat
- Displacer Beast
- Phase Spider
- Grick
- Shambling Mound
- Awakened Tree
- Awakened Shrub
- Treant
- Centaur
- Harpy
- Gnoll
- Lizardfolk
- Yuan-ti
- Revenant
- Wight
- Specter
- Will-o'-Wisp
- Banshee
- Giant Vulture
- Giant Eagle
- Griffin

High-Level:
- Young Green Dragon
- Young Black Dragon
- Adult Green Dragon
- Adult Black Dragon
- Ancient Green Dragon
- Ancient Black Dragon
- Treant
- Oni
- Green Hag covens
- Powerful fey
- Unicorn
- Abominable Yeti
- Behirs
- Hydra
- Purple Worm
- Powerful undead
- Powerful yuan-ti
- High-level monstrosities

Very High-Level / Rare:
- Ancient Green Dragon
- Ancient Black Dragon
- Powerful archfey
- Ancient Treant-like creatures
- Unicorn
- Hydra
- High-level fey creatures
- Legendary forest monsters

Forests should have enormous variety. Encounters may be peaceful, territorial,
predatory, magical, fey-related, undead, humanoid, or completely unexpected.

Ancient forests should favor powerful fey, dragons, treants, hags, undead,
and magical beasts. Ordinary forests should favor beasts, humanoids, and
smaller monsters.
`,

  grassland: `
GRASSLAND / PLAINS

Common / Low-Level:
- Wolf
- Dire Wolf
- Hyena
- Giant Hyena
- Lion
- Tiger
- Panther
- Cheetah
- Boar
- Giant Boar
- Axe Beak
- Giant Goat
- Elk
- Giant Elk
- Vulture
- Giant Vulture
- Giant Eagle
- Hawk
- Blood Hawk
- Gnoll
- Goblin
- Hobgoblin
- Bugbear
- Bandit
- Scout
- Centaur
- Tribal Warrior
- Aarakocra
- Giant Ant
- Ankheg
- Stirge

Moderate:
- Giant Hyena packs
- Centaur bands
- Gnoll warbands
- Werewolf
- Worg
- Griffon
- Hippogriff
- Manticore
- Bulette
- Ankheg
- Ogre
- Troll
- Chimera
- Minotaur
- Harpy
- Wyvern
- Giant Scorpion
- Giant Constrictor Snake
- Gorgon
- Phase Spider
- Revenant
- Wight

High-Level:
- Young Blue Dragon
- Young Green Dragon
- Adult Blue Dragon
- Adult Green Dragon
- Roc
- Purple Worm
- Hydra
- Chimera
- Adult Wyvern groups
- Powerful gnoll warbands
- High-level giants
- Powerful monstrosities

Very High-Level / Rare:
- Ancient Blue Dragon
- Ancient Green Dragon
- Ancient Brass Dragon
- Roc
- Purple Worm
- Powerful giants
- Legendary beasts
- Dragon hunting parties
- Massive monster migrations

Grassland encounters should emphasize visibility and open-space combat.
Large packs, mounted creatures, roaming predators, nomadic groups, monster
herds, caravans, and creatures crossing enormous distances are all appropriate.
`,

  desert: `
DESERT / WASTELAND

Common / Low-Level:
- Giant Lizard
- Giant Gecko
- Giant Hyena
- Hyena
- Jackal
- Giant Rat
- Giant Scorpion
- Giant Spider
- Poisonous Snake
- Giant Poisonous Snake
- Constrictor Snake
- Giant Eagle
- Vulture
- Giant Vulture
- Dust Mephit
- Fire Snake
- Kobold
- Goblin
- Bandit
- Scout
- Gnoll
- Tribal Warrior
- Animated objects and constructs around ruins

Moderate:
- Giant Scorpion
- Giant Constrictor Snake
- Mummy
- Minotaur
- Gnoll Fang of Yeenoghu
- Lamia
- Death Dog
- Yuan-ti
- Harpy
- Air Elemental
- Fire Elemental
- Earth Elemental
- Salamander
- Gorgon
- Bulette
- Ankheg
- Manticore
- Chimera
- Werewolf
- Wight
- Revenant
- Wraith
- Dust Devil-like elementals

High-Level:
- Young Blue Dragon
- Young Brass Dragon
- Adult Blue Dragon
- Adult Brass Dragon
- Efreeti
- Fire Elemental
- Adult Purple Worm
- Sphinxes
- Greater mummies
- Powerful yuan-ti
- Powerful undead
- Roc
- Phoenix-like creatures
- High-level elementals

Very High-Level / Rare:
- Ancient Blue Dragon
- Ancient Brass Dragon
- Adult or Ancient Purple Dragon variants
- Adult Purple Worm
- Androsphinx
- Gynosphinx
- Efreeti
- Powerful elemental beings
- Legendary undead
- Massive desert monsters

Desert encounters should consider heat, dehydration, visibility, sandstorms,
buried ruins, underground creatures, caravans, nomadic groups, undead tombs,
and creatures adapted to extreme temperatures.
`,

  swamp: `
SWAMP / MARSH / BOG

Common / Low-Level:
- Giant Frog
- Giant Toad
- Giant Crocodile
- Crocodile
- Giant Lizard
- Giant Snake
- Poisonous Snake
- Giant Poisonous Snake
- Giant Spider
- Giant Rat
- Stirge
- Blood Hawk
- Mud Mephit
- Lizardfolk
- Bullywug
- Kobold
- Goblin
- Bandit
- Scout
- Giant Leech
- Swarm of Insects
- Swarm of Rats
- Swarm of Poisonous Snakes

Moderate:
- Giant Crocodile
- Giant Constrictor Snake
- Shambling Mound
- Vine Blight
- Needle Blight
- Twig Blight
- Green Hag
- Sea Hag
- Bheur Hag
- Ettercap
- Troll
- Hydra
- Will-o'-Wisp
- Wight
- Wraith
- Ghoul
- Ghast
- Lizardfolk warriors
- Yuan-ti
- Giant Toad
- Giant Snapping Turtle
- Otyugh
- Chuul
- Black Dragon wyrmling
- Young Black Dragon

High-Level:
- Young Black Dragon
- Adult Black Dragon
- Green Hag coven
- Hydra
- Shambling Mound
- Aboleth near deep water
- Powerful undead
- Powerful yuan-ti
- Oni
- Troll groups
- Giant crocodile groups
- High-level monstrosities

Very High-Level / Rare:
- Ancient Black Dragon
- Adult Black Dragon
- Ancient Green Dragon
- Hydra
- Aboleth
- Powerful hags
- Legendary undead
- Ancient swamp monstrosities

Swamp encounters should heavily favor ambushes, difficult terrain, poisonous
creatures, hidden predators, undead, hags, lizardfolk, yuan-ti, and plant
monsters.
`,

  jungle: `
JUNGLE / TROPICAL WILDERNESS

Common / Low-Level:
- Monkey
- Ape
- Giant Ape
- Panther
- Tiger
- Jaguar
- Giant Lizard
- Giant Frog
- Giant Toad
- Giant Spider
- Giant Poisonous Snake
- Constrictor Snake
- Giant Constrictor Snake
- Poisonous Snake
- Crocodile
- Giant Crocodile
- Pteranodon
- Deinonychus
- Velociraptor
- Triceratops
- Hadrosaurus
- Lizardfolk
- Kobold
- Goblin
- Bullywug
- Grung
- Stirge
- Swarm of Insects

Moderate:
- Allosaurus
- Ankylosaurus
- Triceratops
- Giant Crocodile
- Giant Ape
- Girallon
- Ettercap
- Troll
- Yuan-ti
- Yuan-ti cultists
- Wyvern
- Manticore
- Choldrith
- Chitine
- Phase Spider
- Displacer Beast
- Hydra
- Shambling Mound
- Green Hag
- Green Hag covens
- Couatl
- Giant Constrictor Snake
- Giant Toad

High-Level:
- Tyrannosaurus Rex
- Young Green Dragon
- Adult Green Dragon
- Young Black Dragon
- Adult Black Dragon
- Hydra
- Yuan-ti Abomination
- Yuan-ti Anathema
- Giant Ape
- Powerful dinosaurs
- Powerful plant monsters
- Powerful fey
- Couatl
- Guardian creatures

Very High-Level / Rare:
- Ancient Green Dragon
- Ancient Black Dragon
- Yuan-ti Anathema
- Hydra
- Powerful dinosaurs
- Legendary jungle predators
- Powerful fey
- Ancient jungle guardians

Jungles should be extremely diverse and dangerous. Favor dinosaurs, reptiles,
giant insects, snakes, apes, plant creatures, yuan-ti, dragons, and hidden
civilizations.
`,

  mountains: `
MOUNTAINS / HIGH ALTITUDE

Common / Low-Level:
- Goat
- Giant Goat
- Wolf
- Dire Wolf
- Mountain Lion
- Panther
- Giant Eagle
- Blood Hawk
- Hawk
- Vulture
- Giant Vulture
- Kobold
- Goblin
- Orc
- Hobgoblin
- Bugbear
- Bandit
- Scout
- Harpy
- Stirge
- Giant Spider
- Giant Goat
- Aarakocra

Moderate:
- Griffon
- Hippogriff
- Manticore
- Wyvern
- Ogre
- Troll
- Ettin
- Minotaur
- Chimera
- Bulette
- Roper
- Cave Bear
- Cave Fisher
- Piercer
- Darkmantle
- Gargoyle
- Galeb Duhr
- Air Elemental
- Earth Elemental
- Stone Giant
- Hill Giant
- Young White Dragon
- Young Blue Dragon

High-Level:
- Frost Giant
- Stone Giant
- Fire Giant
- Cloud Giant
- Young Blue Dragon
- Adult Blue Dragon
- Adult White Dragon
- Adult Red Dragon
- Roc
- Behir
- Purple Worm
- Remorhaz
- Powerful elementals
- Powerful giants
- High-level dragons

Very High-Level / Rare:
- Ancient Red Dragon
- Ancient Blue Dragon
- Ancient White Dragon
- Storm Giant
- Cloud Giant
- Fire Giant
- Frost Giant
- Roc
- Behir
- Purple Worm
- Legendary mountain monsters

Mountain encounters should emphasize cliffs, caves, narrow passes, altitude,
flying predators, giants, dragons, and creatures adapted to rocky terrain.
`,

  underdark: `
UNDERDARK / DEEP CAVES

Common / Low-Level:
- Giant Rat
- Giant Spider
- Wolf Spider
- Giant Centipede
- Giant Scorpion
- Darkmantle
- Piercer
- Violet Fungus
- Shriekers
- Myconid
- Kobold
- Goblin
- Grimlock
- Troglodyte
- Duergar
- Drow
- Giant Lizard
- Cave Fisher
- Stirge

Moderate:
- Hook Horror
- Grick
- Grick Alpha
- Roper
- Umber Hulk
- Ettercap
- Carrion Crawler
- Chuul
- Otyugh
- Basilisk
- Mimic
- Spectator
- Minotaur
- Troll
- Drow warriors
- Drow priestesses
- Duergar
- Kuo-toa
- Aboleth
- Cloaker
- Gelatinous Cube
- Black Pudding
- Grell
- Mindwitness
- Drider

High-Level:
- Beholder
- Death Tyrant
- Mind Flayer
- Elder Brain
- Drider
- Aboleth
- Purple Worm
- Roper
- Ulitharid
- Drow elite warriors
- Drow spellcasters
- Powerful demons
- Powerful aberrations
- Adult dragons living underground

Very High-Level / Rare:
- Beholder
- Death Tyrant
- Elder Brain
- Ulitharid
- Ancient Purple Worm-like threats
- Ancient dragons
- Powerful demons
- Legendary aberrations

Underdark encounters should favor aberrations, subterranean predators,
fungal creatures, drow, duergar, kuo-toa, mind flayers, dangerous
environmental hazards, and creatures that hunt in darkness.
`,

  coast: `
COAST / BEACH / SHORELINE

Common / Low-Level:
- Crab
- Giant Crab
- Giant Octopus
- Reef Shark
- Quipper
- Sahuagin
- Merfolk
- Kuo-toa
- Harpy
- Sea Hag
- Giant Eagle
- Blood Hawk
- Crocodile
- Giant Lizard
- Bandit
- Pirate
- Scout
- Kobold
- Goblin
- Stirge

Moderate:
- Giant Shark
- Hunter Shark
- Giant Octopus
- Merrow
- Sahuagin Priestess
- Sea Hag
- Water Elemental
- Air Elemental
- Harpy
- Chuul
- Manticore
- Wyvern
- Plesiosaurus
- Giant Crocodile
- Kraken Priest cultists
- Wight
- Ghost
- Revenant

High-Level:
- Giant Shark
- Killer Whale
- Dragon Turtle
- Young Bronze Dragon
- Young Black Dragon
- Adult Bronze Dragon
- Adult Black Dragon
- Storm Giant
- Kraken cults
- Powerful sea hags
- Elementals
- Aboleth

Very High-Level / Rare:
- Ancient Bronze Dragon
- Ancient Black Dragon
- Dragon Turtle
- Storm Giant
- Kraken
- Aboleth
- Legendary sea monsters

Coastal encounters should include tides, cliffs, caves, storms, shipwrecks,
pirates, aquatic monsters, sea creatures, and creatures moving between land
and water.
`,

  ocean: `
OPEN OCEAN / DEEP SEA

Common / Low-Level:
- Quipper
- Reef Shark
- Hunter Shark
- Dolphin
- Giant Seahorse
- Giant Crab
- Giant Octopus
- Merfolk
- Sahuagin
- Kuo-toa
- Sea Hag
- Reef predators
- Swarms of fish

Moderate:
- Hunter Shark
- Giant Shark
- Giant Octopus
- Giant Squid
- Merrow
- Sahuagin Priestess
- Water Elemental
- Sea Hag
- Chuul
- Plesiosaurus
- Elasmosaurus
- Aboleth
- Kuo-toa groups
- Sahuagin warbands

High-Level:
- Killer Whale
- Giant Shark
- Dragon Turtle
- Storm Giant
- Young Bronze Dragon
- Adult Bronze Dragon
- Adult Black Dragon
- Aboleth
- Powerful water elementals
- Kraken cults
- Sea monster groups

Very High-Level / Rare:
- Ancient Bronze Dragon
- Dragon Turtle
- Storm Giant
- Kraken
- Aboleth
- Legendary sea monsters
- Ancient aquatic dragons

Ocean encounters can include creatures attacking ships, underwater
encounters, storms, wrecks, islands, aquatic civilizations, sea monsters,
and creatures following or hunting the party.
`,

  urban: `
URBAN / CITY

Common / Low-Level:
- Bandit
- Thug
- Guard
- Scout
- Spy
- Cultist
- Cult Fanatic
- Noble
- Assassin apprentice / low-level assassins
- Goblin
- Kobold
- Kenku
- Wererat
- Giant Rat
- Swarm of Rats
- Mimic
- Doppelganger
- Stirge
- Flying Sword
- Animated Armor

Moderate:
- Assassin
- Veteran
- Bandit Captain
- Mage
- Priest
- Cult Fanatic
- Werewolf
- Wererat
- Weretiger
- Doppelganger
- Mimic
- Invisible Stalker
- Gargoyle
- Specter
- Wraith
- Ghost
- Vampire Spawn
- Otyugh
- Roper
- Oni
- Cambion
- Devil cultists
- Powerful criminal groups

High-Level:
- Vampire
- Adult dragons hiding in civilization
- Rakshasa
- Powerful devils
- Powerful demons
- Liches and undead agents
- Archmages
- High-level assassins
- Powerful shapeshifters
- Oni
- Powerful cult leaders

Very High-Level / Rare:
- Ancient dragons
- Vampire Lords
- Liches
- Rakshasa
- Powerful fiends
- Archmages
- Legendary assassins
- Powerful undead

Urban encounters should account for guards, crowds, laws, witnesses,
criminal organizations, cults, hidden monsters, assassins, political
conflicts, and creatures attempting to remain hidden.
`,

  ruins: `
ANCIENT RUINS / ABANDONED STRUCTURES

Common / Low-Level:
- Skeleton
- Zombie
- Ghoul
- Cultist
- Bandit
- Goblin
- Kobold
- Giant Rat
- Giant Spider
- Stirge
- Swarm of Bats
- Swarm of Rats
- Mimic
- Flying Sword
- Animated Armor
- Specter
- Shadow
- Skeleton Archer
- Gargoyle

Moderate:
- Wight
- Wraith
- Ghast
- Mummy
- Mummy Lord servants
- Ghost
- Revenant
- Mimic
- Rug of Smothering
- Helmed Horror
- Gargoyle
- Flesh Golem
- Stone Golem
- Shield Guardian
- Wyrmling dragons
- Cult Fanatics
- Yuan-ti
- Deathlock
- Spectator
- Basilisk

High-Level:
- Mummy Lord
- Death Knight
- Vampire
- Lich servants
- Adult dragons
- Golems
- Beholders
- Powerful undead
- Powerful constructs
- Deathlocks
- Powerful cults
- Demons
- Devils

Very High-Level / Rare:
- Lich
- Death Knight
- Ancient dragons
- Mummy Lord
- Beholder
- Death Tyrant
- Powerful constructs
- Legendary undead
- Powerful fiends

Ruins should frequently contain traps, cursed objects, ancient magic,
undead, constructs, cultists, treasure guardians, and monsters that have
claimed the abandoned structure as a lair.
`,

  volcanic: `
VOLCANIC / LAVA FIELDS

Common / Low-Level:
- Magma Mephit
- Smoke Mephit
- Fire Snake
- Magmin
- Kobold
- Goblin
- Azer
- Giant Lizard
- Giant Scorpion
- Hell Hound pup / weaker fire creatures
- Salamander scouts
- Fire cultists
- Lava-adapted beasts

Moderate:
- Fire Elemental
- Azer
- Salamander
- Magma Mephit groups
- Hell Hound
- Gargoyle
- Earth Elemental
- Magmin groups
- Fire cultists
- Salamander warriors
- Young Red Dragon
- Young Brass Dragon
- Chimera

High-Level:
- Adult Red Dragon
- Adult Brass Dragon
- Fire Elemental
- Salamander nobles
- Efreeti
- Fire Giant
- Hell Hound groups
- Powerful elementals
- Powerful constructs
- Red Dragon cults
- Phoenix-like creatures

Very High-Level / Rare:
- Ancient Red Dragon
- Ancient Brass Dragon
- Fire Giant
- Efreeti
- Powerful fire elementals
- Legendary volcanic creatures
- Powerful salamander leaders
- Phoenix

Volcanic encounters should emphasize extreme heat, lava, ash, unstable
terrain, fire damage hazards, fire-resistant creatures, elementals,
salamanders, giants, dragons, and creatures worshiping elemental powers.
`,

  wilderness: `
GENERAL WILDERNESS / ROADS / REMOTE AREAS

Use a broad mixture of creatures from the surrounding environment.

Common:
- Wolf
- Dire Wolf
- Bear
- Boar
- Giant Spider
- Giant Snake
- Giant Owl
- Giant Eagle
- Goblin
- Hobgoblin
- Bugbear
- Kobold
- Orc
- Bandit
- Scout
- Gnoll
- Harpy
- Centaur
- Stirge
- Giant Vulture
- Worg
- Ogre
- Giant Goat

Moderate:
- Owlbear
- Troll
- Ettin
- Manticore
- Griffon
- Wyvern
- Displacer Beast
- Phase Spider
- Chimera
- Minotaur
- Werewolf
- Giant Crocodile
- Giant Constrictor Snake
- Bulette
- Ankheg
- Gorgon
- Hydra
- Elementals
- Undead
- Cultists
- Monster hunting parties

High-Level:
- Dragons
- Giants
- Roc
- Purple Worm
- Hydra
- Powerful undead
- Powerful monstrosities
- Powerful fey
- Powerful fiends
- High-level humanoid groups

Very High-Level / Rare:
- Ancient dragons
- Storm Giants
- Powerful legendary creatures
- Liches
- Powerful fiends
- Legendary beasts

Wilderness encounters should be the most varied category and should borrow
from nearby terrain when appropriate.
`,
};

// ---------------------------------------------------------
// ENCOUNTER HISTORY / ANTI-REPETITION
// ---------------------------------------------------------

const MAX_HISTORY_PER_TERRAIN = 30;
const MAX_GENERATION_ATTEMPTS = 3;

// Stores recently generated encounters.
//
// Example:
// encounterHistory.get("forest") = [
//   {
//     difficulty: "Medium",
//     encounter: "2 Ettercaps",
//     full: "..."
//   }
// ]

const encounterHistory = new Map();

function getEncounterHistory(terrain) {
  if (!encounterHistory.has(terrain)) {
    encounterHistory.set(terrain, []);
  }

  return encounterHistory.get(terrain);
}

function normalizeEncounter(text) {
  if (!text) return "";

  return text
    .toLowerCase()
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEncounterLine(text) {
  if (!text) return "";

  const match = text.match(
    /\*\*Encounter:\*\*\s*([\s\S]*?)(?=\*\*Difficulty:\*\*|\*\*CR:\*\*|$)/i
  );

  if (!match) {
    return normalizeEncounter(text.slice(0, 300));
  }

  return normalizeEncounter(match[1]);
}

function isDuplicateEncounter(text, history) {
  const currentEncounter = extractEncounterLine(text);

  if (!currentEncounter) return false;

  return history.some((previous) => {
    const previousEncounter = normalizeEncounter(previous.encounter);

    if (!previousEncounter) return false;

    // Exact encounter match
    if (currentEncounter === previousEncounter) {
      return true;
    }

    // Prevent the model from simply adding/removing a tiny amount
    // of text while keeping the exact same encounter.
    if (
      currentEncounter.includes(previousEncounter) ||
      previousEncounter.includes(currentEncounter)
    ) {
      return true;
    }

    return false;
  });
}

function saveEncounter(terrain, difficulty, encounter) {
  const history = getEncounterHistory(terrain);

  const encounterLine = extractEncounterLine(encounter);

  history.push({
    difficulty,
    encounter: encounterLine,
    full: encounter,
    timestamp: Date.now(),
  });

  // Keep only the most recent encounters.
  while (history.length > MAX_HISTORY_PER_TERRAIN) {
    history.shift();
  }
}

function buildRecentEncounterContext(terrain) {
  const history = getEncounterHistory(terrain);

  if (history.length === 0) {
    return `
There are no previous encounters for this terrain.

You have complete freedom to choose an encounter.
`;
  }

  return `
RECENTLY GENERATED ENCOUNTERS FOR THIS TERRAIN:

${history
  .slice()
  .reverse()
  .map(
    (entry, index) =>
      `${index + 1}. [${entry.difficulty}] ${entry.encounter}`
  )
  .join("\n")}

ANTI-REPETITION RULES:

- DO NOT generate an encounter identical to any encounter above.
- DO NOT reuse the same creature combination from the encounters above.
- Avoid using the same primary creature repeatedly.
- If a creature appeared recently, prefer a different creature.
- Do not simply change the number of monsters to make a repeated encounter
  look different.
- Do not simply change the encounter description while keeping the same
  monsters.
- Try to use creatures that have NOT appeared recently.
- Easy, Medium, and Hard encounters all share this history.
- A creature used in an Easy encounter should NOT immediately reappear in
  a Medium or Hard encounter unless the available creature pool is very small.
- Variety is more important than choosing the most obvious monster.

The new encounter should feel substantially different from the recent
encounters above.
`;
}


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

    const recentHistory = buildRecentEncounterContext(terrain);

    // -------------------------------------------------------
    // GENERATE ENCOUNTER
    // -------------------------------------------------------

    let encounter = null;
    let selectedDifficulty = "Unknown";

    for (
      let attempt = 1;
      attempt <= MAX_GENERATION_ATTEMPTS;
      attempt++
    ) {
      console.log(
        `[ENCOUNTER] Generation attempt ${attempt}/${MAX_GENERATION_ATTEMPTS}`
      );

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

IMPORTANT RANDOMIZATION RULES:

- Every generated encounter should be meaningfully different.
- DO NOT repeatedly use the same monsters.
- DO NOT repeatedly use the same monster combination.
- DO NOT always choose the most obvious monster for the terrain.
- Use the full variety of creatures provided in TERRAIN INFORMATION.
- Prefer creatures that have not appeared recently.
- Vary between beasts, humanoids, monstrosities, undead, elementals,
  fey, aberrations, dragons, environmental encounters, and other
  appropriate creature types.
- Do not make every encounter a combat against a famous monster.
- Do not make every encounter a boss fight.
- Most encounters should be ordinary encounters appropriate for travel.
- Occasionally generate unusual or memorable encounters.
- The encounter can be one creature, multiple creatures, or a mixture.
- Consider action economy.
- Consider the combined strength of multiple monsters.
- A large group of weaker creatures can be appropriate instead of one
  powerful creature.
- A solo monster should generally have enough power or action economy
  to avoid being trivially defeated by the entire party.
- Do not invent creatures that aren't appropriate for the terrain unless
  there is a compelling explanation.

DIFFICULTY:

Choose ONE difficulty:

- Easy
- Medium
- Hard

Do NOT intentionally create Deadly encounters.

The difficulty should actually reflect the party's level and size.

IMPORTANT:

Easy, Medium, and Hard all share the same encounter history.

A monster used recently in an Easy encounter should not simply be reused
in a Medium or Hard encounter.

${recentHistory}

PARTY LEVEL:
${level}

PARTY SIZE:
${partySize}

TERRAIN:
${terrain}

TERRAIN INFORMATION:
${terrainInfo}

CR RULES:

Use D&D 5e CR and encounter-building principles as a guideline.

Do not invent CR values.

If you know the creature's standard 5e CR, include it.

If you are uncertain about a creature's exact CR, do not make up a
number. Instead write "CR varies by source" or omit the CR.

OUTPUT FORMAT:

⚔️ **RANDOM ENCOUNTER**

**Terrain:** [terrain]
**Party:** [party size] Level [level] characters

**Encounter:**
[Creature(s) and quantity]

**Difficulty:**
[Easy / Medium / Hard]

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
Generate a RANDOM D&D 5e encounter.

Party:
${partySize} players
Level ${level}

Terrain:
${terrain}

${recentHistory}

REQUIREMENTS:

1. The encounter must fit the terrain.
2. The encounter must be appropriate for the party.
3. Choose Easy, Medium, or Hard difficulty.
4. Do NOT intentionally create Deadly difficulty.
5. Do NOT repeat a recent encounter.
6. Do NOT reuse the same creature combination from the recent history.
7. Prefer creatures that have not appeared recently.
8. Make the encounter meaningfully different from previous encounters.
9. Do not automatically choose dragons, giants, or other famous monsters.
10. Use variety.
11. Make it feel like something the party could naturally encounter
    while traveling through this environment.

Generate exactly ONE encounter.
`,
          },
        ],

        temperature: 1.1,
        max_tokens: 1400,
      });

      const generated =
        completion.choices?.[0]?.message?.content?.trim();

      if (!generated) {
        continue;
      }

      // ---------------------------------------------------
      // CHECK FOR DUPLICATE
      // ---------------------------------------------------

      const duplicate = isDuplicateEncounter(
        generated,
        getEncounterHistory(terrain)
      );

      if (duplicate) {
        console.log(
          `[ENCOUNTER] Duplicate detected on attempt ${attempt}.`
        );

        if (attempt < MAX_GENERATION_ATTEMPTS) {
          continue;
        }

        // If all attempts somehow duplicate, accept the final
        // result rather than failing the command completely.
        console.log(
          "[ENCOUNTER] Maximum attempts reached. Accepting final result."
        );
      }

      encounter = generated;

      // ---------------------------------------------------
      // EXTRACT DIFFICULTY
      // ---------------------------------------------------

      const difficultyMatch = generated.match(
        /\*\*Difficulty:\*\*\s*(Easy|Medium|Hard)/i
      );

      if (difficultyMatch) {
        selectedDifficulty =
          difficultyMatch[1].charAt(0).toUpperCase() +
          difficultyMatch[1].slice(1).toLowerCase();
      }

      break;
    }

    // -------------------------------------------------------
    // NO RESPONSE
    // -------------------------------------------------------

    if (!encounter) {
      await interaction.editReply(
        "❌ I couldn't generate an encounter right now."
      );

      return;
    }

    // -------------------------------------------------------
    // SAVE TO HISTORY
    // -------------------------------------------------------

    saveEncounter(
      terrain,
      selectedDifficulty,
      encounter
    );

    console.log(
      `[ENCOUNTER] Generated ${selectedDifficulty} encounter.`
    );

    console.log(
      `[ENCOUNTER] History for ${terrain}: ${
        getEncounterHistory(terrain).length
      } encounters`
    );

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
