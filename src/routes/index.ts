import { TranslateService } from '../services/translateService';
import { RATE_LIMIT_ENABLED } from '../config';
import { validateTranslationInput } from '../utils/inputValidation';

/**
 * Cloudflare Worker style router entry. Handles POST /translate.
 */
export async function handleRoutes(request: Request, env: any): Promise<Response> {
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

    if (RATE_LIMIT_ENABLED && env.TRANSLATE_API_RATE_LIMITER) {
        const { success } = await env.TRANSLATE_API_RATE_LIMITER.limit({ key: ip });
        if (!success) {
            return new Response('Too Many Requests', { status: 429 });
        }
    }

    const url = new URL(request.url);

    if (request.method !== 'POST' || url.pathname !== '/translate') {
        return new Response('Not Found', { status: 404 });
    }

    let payload: { text?: string; targetLanguage?: string; sourceLanguage?: string };
    try {
        payload = await request.json();
    } catch (error) {
        return new Response('Invalid JSON body', { status: 400 });
    }

    const { text, targetLanguage, sourceLanguage } = payload ?? {};
    if (!text || !targetLanguage) {
        return new Response('Invalid request: text and targetLanguage are required', { status: 400 });
    }

    // Anti-spam validation: check for pure symbols and non-human language
    const validation = validateTranslationInput(text);
    if (!validation.shouldTranslate) {
        // Return the original text without translation
        return new Response(JSON.stringify({ translatedText: validation.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const translateService = new TranslateService(env);

    try {
        const result = await translateService.translateText(text, targetLanguage, sourceLanguage);
        return new Response(JSON.stringify({ 
            translatedText: result.translatedText,
            modelUsed: result.modelUsed 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Translation failed';
        return new Response(message, { status: 500 });
    }
}