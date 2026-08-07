/**
 * Tracks per-user, per-command cooldowns in memory.
 *
 * This is intentionally simple (Map-based, process-local) — sufficient for a
 * single-process bot on a Pterodactyl server. If D&D Sage is ever scaled
 * across multiple processes, this should move to a shared store (e.g. Redis)
 * behind the same interface.
 */
export class CooldownManager {
  constructor() {
    /** @type {Map<string, Map<string, number>>} commandName -> userId -> expiresAt (ms epoch) */
    this.timestamps = new Map();
  }

  /**
   * Checks whether a user is currently on cooldown for a command, without
   * starting or resetting the cooldown.
   * @param {string} commandName
   * @param {string} userId
   * @param {number} cooldownSeconds
   * @returns {{ onCooldown: boolean, secondsRemaining: number }}
   */
  check(commandName, userId, cooldownSeconds) {
    if (!cooldownSeconds || cooldownSeconds <= 0) {
      return { onCooldown: false, secondsRemaining: 0 };
    }

    const expiresAt = this.timestamps.get(commandName)?.get(userId);
    const now = Date.now();

    if (expiresAt && expiresAt > now) {
      return { onCooldown: true, secondsRemaining: Math.ceil((expiresAt - now) / 1000) };
    }

    return { onCooldown: false, secondsRemaining: 0 };
  }

  /**
   * Starts (or restarts) the cooldown window for a user on a command.
   * @param {string} commandName
   * @param {string} userId
   * @param {number} cooldownSeconds
   */
  trigger(commandName, userId, cooldownSeconds) {
    if (!cooldownSeconds || cooldownSeconds <= 0) return;

    if (!this.timestamps.has(commandName)) {
      this.timestamps.set(commandName, new Map());
    }
    this.timestamps.get(commandName).set(userId, Date.now() + cooldownSeconds * 1000);
  }
}

export default new CooldownManager();
