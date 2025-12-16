import { MODEL_NAME } from '../config';

type AIEnv = { AI: { run: (model: string, inputs: any) => Promise<any> } };

export class TranslateService {
    private env: AIEnv;

    constructor(env: AIEnv) {
        this.env = env;
    }

    async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
        const inputs: Record<string, any> = {
            text,
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

        return translatedText;
    }
}