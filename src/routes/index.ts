import { TranslateService } from '../services/translateService';

/**
 * Cloudflare Worker style router entry. Handles POST /translate.
 */
export async function handleRoutes(request: Request, env: any): Promise<Response> {
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

    const translateService = new TranslateService(env);

    try {
        const translatedText = await translateService.translateText(text, targetLanguage, sourceLanguage);
        return new Response(JSON.stringify({ translatedText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Translation failed';
        return new Response(message, { status: 500 });
    }
}