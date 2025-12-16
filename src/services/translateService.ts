import { MODEL_NAME } from '../config';

type AIEnv = { AI: { run: (model: string, inputs: any) => Promise<any> } };

export class TranslateService {
    private env: AIEnv;

    constructor(env: AIEnv) {
        this.env = env;
    }

    async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
        const chunks = this.chunkBySentence(text, 500); // keep each chunk shorter for model limits
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
                throw new Error('Translation failed');
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

        for (const sentence of sentences) {
            if ((current + ' ' + sentence).trim().length > maxLength && current.length > 0) {
                chunks.push(current.trim());
                current = sentence;
            } else {
                current = (current + ' ' + sentence).trim();
            }
        }

        if (current.length > 0) {
            chunks.push(current.trim());
        }

        // Fallback: if no sentence delimiters found, split by raw length
        if (chunks.length === 0) {
            const parts: string[] = [];
            let index = 0;
            while (index < text.length) {
                parts.push(text.slice(index, index + maxLength));
                index += maxLength;
            }
            return parts;
        }

        return chunks;
    }
}