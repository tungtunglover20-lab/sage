/**
 * Base class for all application-specific errors.
 *
 * Carries a machine-readable `code` and an `isOperational` flag distinguishing
 * expected failure modes (bad config, a flaky upstream API, a malformed PDF)
 * from programming errors. Command handlers use `isOperational` to decide
 * whether it's safe to show `error.message` to the Discord user, or whether
 * to show a generic message and rely on the logs instead.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, isOperational?: boolean, cause?: unknown }} [options]
   */
  constructor(message, { code = 'APP_ERROR', isOperational = true, cause } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/** Missing or invalid configuration (env vars, required files/directories). */
export class ConfigError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'CONFIG_ERROR', ...options });
  }
}

/** A slash command failed in a way that should be reported to the user. */
export class CommandError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'COMMAND_ERROR', ...options });
  }
}

/** The OpenRouter API call failed or returned an unusable response. */
export class AIProviderError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'AI_PROVIDER_ERROR', ...options });
  }
}

/** The vector store failed to read, write, or query. */
export class VectorStoreError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'VECTOR_STORE_ERROR', ...options });
  }
}

/** A PDF rulebook could not be read, opened, or parsed. */
export class PdfProcessingError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'PDF_PROCESSING_ERROR', ...options });
  }
}
