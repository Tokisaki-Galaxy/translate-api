import { GROQ_API_URL, GROQ_MODEL, SILICONFLOW_API_URL, SILICONFLOW_MODEL } from '../config';

export interface LLMEnv {
    GROQ_API_KEY: string;
    SILICONFLOW_API_KEY: string;
    TRANSLATE_API_RATE_LIMITER: {
        limit: (options: { key: string }) => Promise<{ success: boolean }>;
    };
}

async function fetchLLM(url: string, apiKey: string, model: string, text: string, targetLang: string) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: `You are a professional translator. Translate the following text to ${targetLang}. Only return the translated text, no explanations.` },
                { role: 'user', content: text }
            ],
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM request failed (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    if (!data.choices || data.choices.length === 0) {
        throw new Error('LLM returned no choices');
    }
    return data.choices[0].message.content.trim();
}

export async function translateWithGroq(text: string, targetLang: string, env: LLMEnv) {
    if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');
    return fetchLLM(GROQ_API_URL, env.GROQ_API_KEY, GROQ_MODEL, text, targetLang);
}

export async function translateWithSiliconFlow(text: string, targetLang: string, env: LLMEnv) {
    if (!env.SILICONFLOW_API_KEY) throw new Error('SILICONFLOW_API_KEY is not set');
    return fetchLLM(SILICONFLOW_API_URL, env.SILICONFLOW_API_KEY, SILICONFLOW_MODEL, text, targetLang);
}
