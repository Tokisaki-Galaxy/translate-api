// Default translation model for Cloudflare Workers AI
export const MODEL_NAME = '@cf/meta/m2m100-1.2b';

// Enforce a per-request token cap (approx) to avoid huge inputs
export const TOKEN_LIMIT_ENABLED = true;
export const TOKEN_LIMIT = 1000; // approximate tokens; truncate beyond this

// Simple in-memory rate limit (per isolate) for /translate
export const RATE_LIMIT_ENABLED = true;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 10; // requests per IP per window
