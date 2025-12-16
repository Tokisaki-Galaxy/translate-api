# Cloudflare Worker Translation Backend

This project is a translation backend built using Cloudflare Workers. It provides an API for translating text between different languages. The backend is designed to be lightweight and efficient, leveraging the capabilities of Cloudflare's serverless platform.

## Project Structure

- `src/worker.ts`: Entry point for the Cloudflare Worker, handling incoming requests and routing them to the appropriate services.
- `src/config.ts`: Contains configuration options such as the default Workers AI model name used by the translation service.
- `src/services/translateService.ts`: Exports the `TranslateService` class, which includes the `translateText` method for translating text based on the target language.
- `src/routes/index.ts`: Exports `handleRoutes`, a Cloudflare Worker–style router handling `POST /translate` and validating input.
- `src/koreader/translate.lua`: Lua script for Koreader that calls the Cloudflare Worker API for translation and processes the results.

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd cloudflare-worker-translation
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment variables in `src/config.ts`:
   - Set `MODEL_NAME` (default `@cf/meta/m2m100-1.2b`) if you want to use a different Workers AI model.

Workers AI access:
- `wrangler.toml` already binds `ai = { binding = "AI" }`; ensure your Cloudflare account has Workers AI enabled.
- No external API token is needed when using `env.AI.run` inside the Worker.

4. Run locally with Wrangler (uses `wrangler.toml` with `main = "src/worker.ts"`):
   ```
   npm run start
   ```
   Wrangler will start a dev server at `http://127.0.0.1:8787` by default.

5. Deploy the Cloudflare Worker:
   ```
   npm run deploy
   ```

## Usage

Once deployed, you can use the translation API by sending a POST request to the worker's endpoint with the following JSON body:

```json
{
  "text": "Hello, world!",
  "targetLanguage": "es"
}
```

The response will contain the translated text.

### Local test via curl

```bash
curl -X POST "http://127.0.0.1:8787/translate" ^
   -H "Content-Type: application/json" ^
   -d "{\"text\":\"Hello\",\"targetLanguage\":\"zh\"}"
```

## Koreader Integration

To use the translation service in Koreader, include the `src/koreader/translate.lua` script in your Koreader setup. This script will handle the API calls to the Cloudflare Worker and return the translated results.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.