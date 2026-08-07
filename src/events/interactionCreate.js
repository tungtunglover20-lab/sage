import { Events, MessageFlags } from 'discord.js';
import cooldownManager from '../utils/cooldown.js';
import { createErrorEmbed } from '../utils/embeds.js';
import { CommandError } from '../utils/errors.js';

export const name = Events.InteractionCreate;
export const once = false;

/**
 * Central slash-command dispatcher: looks up the invoked command, enforces
 * its cooldown, defers the reply if requested, runs it, and routes any
 * failure through a single, consistent error handler.
 * @param {import('discord.js').Interaction} interaction
 * @param {{ logger: import('pino').Logger, commands: import('discord.js').Collection }} context
 */
export async function execute(interaction, context) {
  if (!interaction.isChatInputCommand()) return;

  const { logger, commands } = context;
  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.warn({ commandName: interaction.commandName }, 'Received unknown command');
    return;
  }

  const cooldownCheck = cooldownManager.check(command.data.name, interaction.user.id, command.cooldown);
  if (cooldownCheck.onCooldown) {
    await interaction.reply({
      content: `Slow down — you can use \`/${command.data.name}\` again in ${cooldownCheck.secondsRemaining}s.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    if (command.deferReply) {
      await interaction.deferReply();
    }

    cooldownManager.trigger(command.data.name, interaction.user.id, command.cooldown);

    await command.execute(interaction, context);

    logger.info(
      { command: command.data.name, user: interaction.user.tag, guild: interaction.guildId },
      'Command executed',
    );
  } catch (error) {
    await handleCommandError(interaction, command, error, logger);
  }
}

/**
 * Reports a command failure to the user with a friendly embed and logs the
 * underlying error with full detail. Known, operational errors (CommandError)
 * show their own message; anything unexpected shows a generic one so
 * internal details never leak to Discord.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {{ data: { name: string } }} command
 * @param {unknown} error
 * @param {import('pino').Logger} logger
 */
async function handleCommandError(interaction, command, error, logger) {
  const isKnownError = error instanceof CommandError;
  const userMessage = isKnownError
    ? error.message
    : 'An unexpected error occurred while running that command. This has been logged.';

  logger.error({ err: error, command: command.data.name, user: interaction.user.tag }, 'Command execution failed');

  const payload = { embeds: [createErrorEmbed(userMessage)] };

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply(payload).catch(() => {});
  } else {
    await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
