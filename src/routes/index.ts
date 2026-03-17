import { TranslateService } from '../services/translateService';
import { RATE_LIMIT_ENABLED } from '../config';
import { validateTranslationInput } from '../utils/inputValidation';

/**
 * Returns true if the request carries a valid pre-authorized UUID that should
 * bypass rate limiting.  The secret `authorized_uuid` must be a JSON object
 * whose *values* are the accepted UUIDs, e.g.
 *   {"test":"3db14426-30d0-4c20-b04b-16149757ccf2","test2":"93eab89b-..."}
 * The request must supply the UUID as:  Authorization: Bearer <uuid>
 */
function isAuthorized(request: Request, env: any): boolean {
    const authHeader = request.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) return false;

    // Validate UUID format before checking against stored values
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(token)) return false;

    const normalizedToken = token.toLowerCase();

    let authorizedUUIDs: Record<string, string>;
    try {
        authorizedUUIDs = JSON.parse(env.authorized_uuid ?? '{}');
    } catch {
        return false;
    }

    return Object.keys(authorizedUUIDs).some((k) => {
        const value = authorizedUUIDs[k];
        return typeof value === 'string' && value.toLowerCase() === normalizedToken;
    });
}

/**
 * Cloudflare Worker style router entry. Handles POST /translate.
 */
export async function handleRoutes(request: Request, env: any): Promise<Response> {
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

    if (RATE_LIMIT_ENABLED && env.TRANSLATE_API_RATE_LIMITER && !isAuthorized(request, env)) {
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