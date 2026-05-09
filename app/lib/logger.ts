/**
 * app/lib/logger.ts — Winston logger with OpenObserve transport
 *
 * Provides a structured, server-side logger that ships log entries to two
 * destinations simultaneously:
 *
 *   1. OpenObserveTransport
 *      Batches each log entry as a JSON object and POSTs it to the
 *      OPENOBSERVE_LOGS_ENDPOINT URL using HTTP Basic authentication.  Each
 *      payload is a single-element JSON array as required by OpenObserve's
 *      /api/{org}/{stream}/_json bulk-ingest endpoint.
 *
 *   2. Console transport (winston.transports.Console)
 *      Emits human-readable, colourised output to stdout during development
 *      and structured output in production.
 *
 * Log level is controlled via the LOG_LEVEL environment variable and defaults
 * to 'info' when that variable is absent or empty.
 *
 * Usage:
 *   import logger from '@/app/lib/logger';
 *   logger.info('User signed in', { userId: '123', provider: 'google' });
 *   logger.error('Database connection failed', { error: err.message });
 */

import TransportStream, {
  type TransportStreamOptions,
} from 'winston-transport';
import winston from 'winston';

// ---------------------------------------------------------------------------
// Structured log entry shape
// ---------------------------------------------------------------------------

/**
 * The JSON object that is placed inside the array POSTed to OpenObserve.
 * Every field except the spread metadata fields is always present.
 */
interface OpenObserveLogEntry {
  /** ISO-8601 timestamp generated at log time. */
  timestamp: string;
  /** Winston severity level string (e.g. 'info', 'error'). */
  level: string;
  /** Human-readable log message. */
  message: string;
  /** Identifies the application emitting the log. */
  service: string;
  /** The NODE_ENV value at process start (development | production | test). */
  environment: string;
  /** Any additional key-value pairs forwarded from the caller's metadata. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// OpenObserveTransport
// ---------------------------------------------------------------------------

/**
 * Custom Winston transport that forwards log entries to the OpenObserve
 * HTTP/JSON bulk-ingest endpoint.
 *
 * Constructor options extend the standard TransportStreamOptions so callers
 * can supply a per-transport log level or custom format if desired, in
 * addition to the transport-specific options below.
 */
interface OpenObserveTransportOptions extends TransportStreamOptions {
  /**
   * Full ingestion URL, e.g.
   * `http://localhost:5080/api/default/workouter/_json`
   *
   * Defaults to the OPENOBSERVE_LOGS_ENDPOINT environment variable.
   */
  endpoint?: string;

  /**
   * HTTP Basic-Auth username.
   * Defaults to the OPENOBSERVE_USERNAME environment variable.
   */
  username?: string;

  /**
   * HTTP Basic-Auth password.
   * Defaults to the OPENOBSERVE_PASSWORD environment variable.
   */
  password?: string;
}

class OpenObserveTransport extends TransportStream {
  private readonly endpoint: string;
  private readonly authHeader: string;

  constructor(opts: OpenObserveTransportOptions = {}) {
    super(opts);

    // Resolve endpoint — prefer explicit option, then environment variable,
    // then fall back to the canonical self-hosted default so local development
    // works without any configuration.
    this.endpoint =
      opts.endpoint ??
      process.env.OPENOBSERVE_LOGS_ENDPOINT ??
      'http://localhost:5080/api/default/workouter/_json';

    const username =
      opts.username ?? process.env.OPENOBSERVE_USERNAME ?? '';
    const password =
      opts.password ?? process.env.OPENOBSERVE_PASSWORD ?? '';

    // Build the Basic-Auth header value once at construction time to avoid
    // re-encoding the credentials on every log call.
    this.authHeader =
      'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  }

  /**
   * Winston calls `log()` for every record that passes the level filter.
   *
   * `info` is the raw log object produced by winston's format pipeline.
   * It always contains at least `level` and `message`; any additional
   * fields passed by the caller are spread onto the entry verbatim.
   */
  override log(
    info: winston.Logform.TransformableInfo,
    next: () => void
  ): void {
    // Signal to Winston that this transport has accepted the record so that
    // back-pressure and the internal event loop behave correctly.
    setImmediate(() => this.emit('logged', info));

    // Destructure the well-known Winston fields from the info object and
    // collect any remaining caller-supplied metadata into `rest`.
    const { level, message, ...rest } = info;

    // Build the structured log entry that OpenObserve will index.
    const entry: OpenObserveLogEntry = {
      timestamp: new Date().toISOString(),
      level: String(level),
      message: String(message),
      service: process.env.npm_package_name ?? 'workouter-fe',
      environment: process.env.NODE_ENV ?? 'development',
      // Spread any caller-provided metadata fields (e.g. userId, traceId, …)
      // directly onto the top-level log entry so they become first-class
      // indexed fields in OpenObserve rather than a nested sub-object.
      ...rest,
    };

    // POST the entry wrapped in a JSON array — OpenObserve's _json endpoint
    // always expects an array even when ingesting a single record.
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
      },
      body: JSON.stringify([entry]),
    }).catch((err: unknown) => {
      // Emit the error through the stream so that Winston's error handlers
      // (and optionally the caller) can react without crashing the process.
      this.emit(
        'error',
        err instanceof Error
          ? err
          : new Error(`OpenObserve transport error: ${String(err)}`)
      );
    });

    // Call next() so Winston can forward the record to the following
    // transport in the chain without waiting for the HTTP request.
    next();
  }
}

// ---------------------------------------------------------------------------
// Logger instance
// ---------------------------------------------------------------------------

/**
 * Singleton Winston logger shared across the entire server-side application.
 *
 * Two transports are always active:
 *   • OpenObserveTransport — ships structured JSON to OpenObserve
 *   • Console              — emits human-readable output to stdout
 *
 * The effective log level is read once at module load time from LOG_LEVEL,
 * defaulting to 'info' when the variable is absent or empty.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',

  // json() format ensures each record is serialised as a compact JSON string
  // before being handed to the transports' log() methods.
  format: winston.format.json(),

  transports: [
    // ── OpenObserve HTTP transport ──────────────────────────────────────
    new OpenObserveTransport(),

    // ── Console transport ───────────────────────────────────────────────
    // In non-production environments colourised, human-readable output is
    // more convenient.  In production the raw JSON format set above is used
    // so that log aggregators can parse the output without extra work.
    new winston.transports.Console({
      format:
        process.env.NODE_ENV !== 'production'
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          : winston.format.json(),
    }),
  ],
});

export { OpenObserveTransport };
export default logger;
