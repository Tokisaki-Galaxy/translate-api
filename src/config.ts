// Default translation model for Cloudflare Workers AI
export const MODEL_NAME = '@cf/meta/m2m100-1.2b';

// Enforce a per-request token cap (approx) to avoid huge inputs
export const TOKEN_LIMIT_ENABLED = true;
export const TOKEN_LIMIT = 1000; // approximate tokens; truncate beyond this

// LLM Models API Endpoints
export const GROQ_MODEL = 'llama-3.3-70b-versatile';
export const SILICONFLOW_MODEL = 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B';

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// Simple in-memory rate limit (per isolate) for /translate
export const RATE_LIMIT_ENABLED = true;
// 以下参数已由 wrangler.toml 接管，可以删除或仅作注释参考
// export const RATE_LIMIT_WINDOW_MS = 60_000;
// export const RATE_LIMIT_MAX = 10; 
