# Cloudflare Worker Translation Backend

<p align="center">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

[中文文档](README_CN.md)

> [!IMPORTANT]
> **Public API Endpoint:** `https://translate.api.tokisaki.top/translate` (Free for public use)

This project is a high-performance translation backend built on Cloudflare Workers. It features a layered translation architecture integrating multiple LLMs for maximum reliability and quality.

## 🌟 Features

- **Layered Translation Flow**:
  1. **Groq (Llama 3.3 70B)**: Primary high-speed, high-quality engine.
  2. **SiliconFlow (DeepSeek-R1)**: Secondary powerful LLM fallback.
  3. **Cloudflare Workers AI (m2m100)**: Final fallback to ensure 100% uptime.
- **Smart Token Truncation**: Automatically truncates long inputs (default 1000 tokens) to prevent abuse.
- **Native Rate Limiting**: Leverages Cloudflare's Rate Limiting API for precise per-IP throttling.
- **Anti-Spam Filter**: Automatically detects and skips translation for pure symbols or non-human content.
- **KOReader Integration**: Includes a drop-in Lua script for seamless e-reader translation.

## Project Structure

- `src/worker.ts`: Entry point for the Cloudflare Worker.
- `src/services/translateService.ts`: Core logic for layered translation and token management.
- `src/services/llmService.ts`: API wrappers for Groq and SiliconFlow.
- `src/config.ts`: Configuration for models and limits.
- `src/koreader/`: Lua scripts for KOReader integration.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Tokisaki-Galaxy/translate-api
   cd translate-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Secrets:
   You need to set the following secrets in Cloudflare:
   ```bash
   npx wrangler secret put GROQ_API_KEY
   npx wrangler secret put SILICONFLOW_API_KEY
   ```

4. Run locally:
   ```bash
   npm run start
   ```

5. Deploy:
   ```bash
   npm run deploy
   ```

## Usage

### API Endpoint
- **Method:** `POST /translate`
- **Body:**
  ```json
  {
    "text": "Hello, world!",
    "targetLanguage": "zh"
  }
  ```
- **Response:**
  ```json
  {
    "translatedText": "你好，世界！",
    "modelUsed": "Groq (llama-3.3-70b-versatile)"
  }
  ```

## Koreader Integration

[Click This](https://github.com/Tokisaki-Galaxy/kindle-koreader-custom-translator)

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
