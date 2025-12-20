import { MODEL_NAME, TOKEN_LIMIT, TOKEN_LIMIT_ENABLED } from '../config';
import { translateWithGroq, translateWithSiliconFlow, LLMEnv } from './llmService';

type AIEnv = LLMEnv & { AI: { run: (model: string, inputs: any) => Promise<any> } };

export class TranslateService {
    private env: AIEnv;

    constructor(env: AIEnv) {
        this.env = env;
    }

    async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
        // Cap request size to avoid very long inputs; truncate extra content when enabled.
        const cappedText = TOKEN_LIMIT_ENABLED ? this.truncateToTokenLimit(text, TOKEN_LIMIT) : text;

        // Try layered translation
        try {
            // Layer 1: Groq (Llama 3.3 70B)
            return await translateWithGroq(cappedText, targetLanguage, this.env);
        } catch (error) {
            console.error('Groq translation failed, falling back to SiliconFlow:', error);
            try {
                // Layer 2: SiliconFlow (DeepSeek)
                return await translateWithSiliconFlow(cappedText, targetLanguage, this.env);
            } catch (error2) {
                console.error('SiliconFlow translation failed, falling back to Workers AI:', error2);
                // Layer 3: Workers AI (m2m100)
                return await this.translateWithWorkersAI(cappedText, targetLanguage, sourceLanguage);
            }
        }
    }

    private async translateWithWorkersAI(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
        // Keep chunks short to avoid model truncation; 250 is safer than 500 for long legal text blocks.
        const chunks = this.chunkBySentence(text, 250);
        const translatedParts: string[] = [];

        for (const chunk of chunks) {
            const inputs: Record<string, any> = {
                text: chunk,
                target_lang: targetLanguage,
            };

            if (sourceLanguage && sourceLanguage.trim().length > 0) {
                inputs.source_lang = sourceLanguage;
            }

            const result = await this.env.AI.run(MODEL_NAME, inputs);
            const translatedText = (result as any).translated_text || (result as any).translation || (result as any).output;

            if (!translatedText) {
                throw new Error('Workers AI Translation failed');
            }

            translatedParts.push(translatedText);
        }

        return translatedParts.join(' ');
    }

    // Simple sentence-based chunking to reduce truncation; merges sentences until maxLength reached.
    private chunkBySentence(text: string, maxLength: number): string[] {
        const sentences = text
            .split(/(?<=[\.\!\?。！？])/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const chunks: string[] = [];
        let current = '';

        const pushChunk = (value: string) => {
            const trimmed = value.trim();
            if (trimmed.length > 0) chunks.push(trimmed);
        };

        const forceSplit = (segment: string) => {
            let idx = 0;
            while (idx < segment.length) {
                pushChunk(segment.slice(idx, idx + maxLength));
                idx += maxLength;
            }
        };

        for (const sentence of sentences) {
            if (sentence.length > maxLength) {
                // current unfinished chunk first
                pushChunk(current);
                current = '';
                forceSplit(sentence);
                continue;
            }
            if ((current + ' ' + sentence).trim().length > maxLength && current.length > 0) {
                pushChunk(current);
                current = sentence;
            } else {
                current = (current + ' ' + sentence).trim();
            }
        }

        pushChunk(current);

        // Fallback: if no sentence delimiters found, split by raw length
        if (chunks.length === 0) {
            forceSplit(text);
        }

        return chunks;
    }

    // Rough token-based truncation: ASCII chars ~= 0.25 token, non-ASCII ~= 1 token.
    private truncateToTokenLimit(text: string, limit: number): string {
        let tokens = 0;
        let result = '';

        for (const ch of text) {
            const addition = ch.charCodeAt(0) <= 0x7f ? 0.25 : 1;
            if (tokens + addition > limit) break;
            tokens += addition;
            result += ch;
        }

        return result;
    }
}
