import { VerbRoot, Subject, Tense } from '@/types';

/**
 * Japanese-style conjugation engine adapted for Nepali
 * Handles Present, Past, and Future tenses for all major subjects
 */

// Mapping of subjects to their display text
export const SUBJECTS: Record<Subject, string> = {
    ma: 'म',           // I
    haami: 'हामी',     // We
    timi: 'तिमी',      // You (informal)
    tapaai: 'तपाईं',   // You (formal)
    uha: 'उहाँ',       // He/She (formal)
};

// Common irregular verbs that don't follow standard rules
const IRREGULAR_VERBS: Record<string, { root: string; type: 'consonant' | 'vowel' }> = {
    'हुनु': { root: 'हु', type: 'consonant' },  // to be (special handling needed)
    'जानु': { root: 'जा', type: 'vowel' },      // to go
    'लिनु': { root: 'लि', type: 'vowel' },       // to take
    'दिनु': { root: 'दि', type: 'vowel' },       // to give
};

/**
 * Extract verb root from dictionary form (infinitive)
 * Rule: Remove 'नु' from the end
 */
export function extractVerbRoot(dictionaryForm: string): VerbRoot {
    const normalized = dictionaryForm.trim();

    // Check if it's an irregular verb
    if (IRREGULAR_VERBS[normalized]) {
        return {
            root: IRREGULAR_VERBS[normalized].root,
            type: IRREGULAR_VERBS[normalized].type,
            isIrregular: true,
            dictionaryForm: normalized,
        };
    }

    // Remove 'नु' from the end
    if (normalized.endsWith('नु')) {
        const root = normalized.slice(0, -2);

        // Determine if root ends in consonant or vowel
        // Vowel endings in Devanagari: अ आ इ ई उ ऊ ए ऐ ओ औ
        // But in writing, we check actual character. 
        // If exact character match logic is complex, we can use a heuristic:
        // If the last character is a vowel modifier or vowel itself.

        // Simplified vowel check:
        // Roots ending in a vowel sound typically end with specific matras or vowel characters.
        // Ideally we'd have a robust Devanagari parser.
        // specific patterns: 'aa' (khaa), 'i' (di), 'u' (ru), 'au' (aau)

        const vowelEndings = ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
        const lastChar = root[root.length - 1];
        // Check slightly deeper for composite characters if needed, but last char check usually sufficient
        const isVowelEnding = vowelEndings.some(v => lastChar === v);

        return {
            root,
            type: isVowelEnding ? 'vowel' : 'consonant',
            isIrregular: false,
            dictionaryForm: normalized,
        };
    }

    // Fallback
    return {
        root: normalized,
        type: 'consonant',
        isIrregular: false,
        dictionaryForm: normalized,
    };
}

/**
 * Conjugate verb in present tense
 * Simple Present (Samanya Bartaman)
 */
export function conjugatePresentTense(verbRoot: VerbRoot, subject: Subject, script: 'devanagari' | 'roman' = 'devanagari'): string {
    const { root, type } = verbRoot;

    if (script === 'roman') {
        // Romanization logic
        // Need a map of Roman roots if not provided in VerbRoot
        // For now, assuming input verb was Devanagari, so we need to map Devanagari root to Roman or rely on passed Roman root
        // This is tricky without a dictionary lookup inside here.
        // Better approach: getAllConjugations should take an optional romanRoot

        const romanRoot = verbRoot.romanRoot || '';

        if (verbRoot.dictionaryForm === 'हुनु') {
            switch (subject) {
                case 'ma': return 'chhu';
                case 'haami': return 'chhaun';
                case 'timi': return 'chhau';
                case 'tapaai': return 'hunuhunchha';
                case 'uha': return 'hunuhunchha';
            }
        }

        switch (subject) {
            case 'ma': return type === 'vowel' ? `${romanRoot}nchhu` : `${romanRoot}chhu`;
            case 'haami': return type === 'vowel' ? `${romanRoot}nchhaun` : `${romanRoot}chhaun`;
            case 'timi': return type === 'vowel' ? `${romanRoot}nchhau` : `${romanRoot}chchau`;
            case 'tapaai': case 'uha': return `${romanRoot}nuhunchha`;
            default: return romanRoot;
        }
    }

    // ... Devanagari logic (kept as is, but specific to script='devanagari')
    // Hunu (to be) is special in present tense (Ho/Chha/Hunchha variations)
    if (verbRoot.dictionaryForm === 'हुनु') {
        switch (subject) {
            case 'ma': return 'छु'; // or hunchhu
            case 'haami': return 'छौं';
            case 'timi': return 'छौ';
            case 'tapaai': return 'हुनुहुन्छ';
            case 'uha': return 'हुनुहुन्छ';
        }
    }

    switch (subject) {
        case 'ma':
            return type === 'vowel' ? `${root}न्छु` : `${root}छु`;

        case 'haami':
            return type === 'vowel' ? `${root}न्छौं` : `${root}छौं`;

        case 'timi':
            return type === 'vowel' ? `${root}न्छौ` : `${root}छौ`;

        case 'tapaai':
        case 'uha':
            return `${root}नुहुन्छ`; // High respect form is consistent

        default:
            return root;
    }
}

export function conjugatePastTense(verbRoot: VerbRoot, subject: Subject, script: 'devanagari' | 'roman' = 'devanagari'): string {
    const { root } = verbRoot;

    if (script === 'roman') {
        const romanRoot = verbRoot.romanRoot || '';
        if (verbRoot.dictionaryForm === 'जानु') {
            const gaRoot = 'ga';
            switch (subject) {
                case 'ma': return `${gaRoot}e`;
                case 'haami': return `${gaRoot}yaun`;
                case 'timi': return `${gaRoot}yau`;
                case 'tapaai': case 'uha': return 'janubhayo';
            }
        }
        if (verbRoot.dictionaryForm === 'हुनु') {
            const bhaRoot = 'bha';
            switch (subject) {
                case 'ma': return `${bhaRoot}e`;
                case 'haami': return `${bhaRoot}yaun`;
                case 'timi': return `${bhaRoot}yau`;
                case 'tapaai': case 'uha': return 'hunubhayo';
            }
        }

        switch (subject) {
            case 'ma': return `${romanRoot}e`;
            case 'haami': return `${romanRoot}yaun`;
            case 'timi': return `${romanRoot}yau`;
            case 'tapaai': case 'uha': return `${romanRoot}nubhayo`;
            default: return romanRoot;
        }
    }

    // Handling for Janu (to go) -> Gayo
    if (verbRoot.dictionaryForm === 'जानु') {
        const gaRoot = 'ग';
        switch (subject) {
            case 'ma': return `${gaRoot}एँ`;
            case 'haami': return `${gaRoot}यौं`;
            case 'timi': return `${gaRoot}यौ`;
            case 'tapaai':
            case 'uha': return `जानुभयो`; // Formal keeps dictionary root often
        }
    }

    // Hunu (to be) -> Bhayo
    if (verbRoot.dictionaryForm === 'हुनु') {
        const bhaRoot = 'भ';
        switch (subject) {
            case 'ma': return `${bhaRoot}एँ`;
            case 'haami': return `${bhaRoot}यौं`;
            case 'timi': return `${bhaRoot}यौ`;
            case 'tapaai':
            case 'uha': return `हुनुभयो`;
        }
    }

    switch (subject) {
        case 'ma':
            // Vowel roots often add 'e' (khanu -> khae), Consonant add 'e' (garnu -> gare)
            return `${root}एँ`; // Simple approximation

        case 'haami':
            return `${root}यौं`;

        case 'timi':
            return `${root}यौ`;

        case 'tapaai':
        case 'uha':
            return `${root}नुभयो`;

        default:
            return root;
    }
}

export function conjugateFutureTense(verbRoot: VerbRoot, subject: Subject, script: 'devanagari' | 'roman' = 'devanagari'): string {
    const { root } = verbRoot;

    if (script === 'roman') {
        const romanRoot = verbRoot.romanRoot || '';
        switch (subject) {
            case 'ma': return `${romanRoot}nechhu`;
            case 'haami': return `${romanRoot}nechhaun`;
            case 'timi': return `${romanRoot}nechhau`;
            case 'tapaai': case 'uha': return `${romanRoot}nuhunechha`; // or nuhunchha sometimes used for future formal
            default: return romanRoot;
        }
    }

    // Future tense is remarkably regular usually
    // Root + ne + chhu/chhau/etc.

    switch (subject) {
        case 'ma':
            return `${root}नेछु`;

        case 'haami':
            return `${root}नेछौं`;

        case 'timi':
            return `${root}नेछौ`;

        case 'tapaai':
        case 'uha':
            return `${root}नुहुनेछ`;

        default:
            return root;
    }
}

export interface ConjugationResult {
    present: string;
    past: string;
    future: string;
}

export function getAllConjugations(verb: string, romanVerb?: string): Record<Subject, { devanagari: ConjugationResult; roman: ConjugationResult }> {
    const root = extractVerbRoot(verb);

    // Attempt to extract roman root if provided
    if (romanVerb) {
        // Simple heuristic: remove 'nu' from end
        const romanRootStr = romanVerb.trim().toLowerCase().endsWith('nu')
            ? romanVerb.trim().slice(0, -2)
            : romanVerb.trim();
        root.romanRoot = romanRootStr;
    }

    const result = {} as Record<Subject, { devanagari: ConjugationResult; roman: ConjugationResult }>;

    (Object.keys(SUBJECTS) as Subject[]).forEach(subject => {
        result[subject] = {
            devanagari: {
                present: conjugatePresentTense(root, subject, 'devanagari'),
                past: conjugatePastTense(root, subject, 'devanagari'),
                future: conjugateFutureTense(root, subject, 'devanagari'),
            },
            roman: {
                present: conjugatePresentTense(root, subject, 'roman'),
                past: conjugatePastTense(root, subject, 'roman'),
                future: conjugateFutureTense(root, subject, 'roman'),
            }
        };
    });

    return result;
}
