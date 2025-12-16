import { MODEL_NAME } from '../config';

type AIEnv = { AI: { run: (model: string, inputs: any) => Promise<any> } };

export class TranslateService {
    private env: AIEnv;

    constructor(env: AIEnv) {
        this.env = env;
    }

    async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
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
}