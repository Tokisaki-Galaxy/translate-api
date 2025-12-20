import { franc } from 'franc';

/**
 * Check if text is purely symbols or special characters (no letters or numbers).
 * If true, the text should be returned as-is without translation.
 * 
 * @param text - The input text to check
 * @returns true if text contains only symbols/special characters, false otherwise
 */
export function isPureSymbols(text: string): boolean {
    // Remove all whitespace first to check meaningful content
    const trimmed = text.trim();
    
    // Empty or whitespace-only text is considered pure symbols
    if (trimmed.length === 0) {
        return true;
    }
    
    // Check if text contains any alphanumeric characters (letters or numbers)
    // If it doesn't contain any, it's pure symbols/special characters
    // This regex matches any Unicode letter or number
    const hasAlphanumeric = /[\p{L}\p{N}]/u.test(trimmed);
    
    return !hasAlphanumeric;
}

/**
 * Detect if the input text is human language using franc library.
 * Returns true if text is likely human language, false otherwise.
 * 
 * franc supports 400+ languages including rare ones, which helps avoid
 * treating uncommon languages as gibberish.
 * 
 * @param text - The input text to check
 * @param minLength - Minimum text length required for reliable detection (default: 10)
 * @returns true if text appears to be human language, false otherwise
 */
export function isHumanLanguage(text: string, minLength: number = 10): boolean {
    const trimmed = text.trim();
    
    // Very short texts are hard to reliably detect
    if (trimmed.length < minLength) {
        // For very short inputs, be permissive and assume it might be human language
        // unless it's pure symbols (which is checked separately)
        return true;
    }
    
    // franc returns 'und' (undetermined) if it cannot detect a language
    // or if the text appears to be random/gibberish
    const detectedLanguage = franc(trimmed);
    
    // 'und' means undetermined - likely not human language or too ambiguous
    return detectedLanguage !== 'und';
}

/**
 * Validate input text before translation.
 * Returns the original text if it should not be translated (pure symbols or non-human language).
 * 
 * @param text - The input text to validate
 * @returns Object with shouldTranslate flag and the text
 */
export function validateTranslationInput(text: string): { shouldTranslate: boolean; text: string } {
    // Step 1: Check if text is pure symbols/special characters
    if (isPureSymbols(text)) {
        return { shouldTranslate: false, text };
    }
    
    // Step 2: Check if text is human language
    if (!isHumanLanguage(text)) {
        return { shouldTranslate: false, text };
    }
    
    // Text passed all checks, should be translated
    return { shouldTranslate: true, text };
}
