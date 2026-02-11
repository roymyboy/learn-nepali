import { VerbRoot, Subject, Tense, Phrase } from '@/types';

/**
 * Conjugation Engine for Nepali Verbs
 * Based on rules from "Conjugating in Nepali.pdf" and "Tenses in Nepali.pdf"
 */

// Subject pronouns in Nepali
export const SUBJECTS = {
  ma: 'म',           // I
  haami: 'हामी',     // We
  timi: 'तिमी',      // You (informal)
  tapaai: 'तपाईं',   // You (formal)
  uha: 'उहाँ',       // He/She (formal)
} as const;

// Common irregular verbs
const IRREGULAR_VERBS: Record<string, { root: string; type: 'consonant' | 'vowel' }> = {
  'हुनु': { root: 'हु', type: 'consonant' },  // to be
  'जानु': { root: 'जा', type: 'vowel' },      // to go
};

/**
 * Extract verb root from dictionary form (infinitive)
 * Rule: Remove 'नु' from the end
 */
export function extractVerbRoot(dictionaryForm: string): VerbRoot {
  // Check if it's an irregular verb
  if (IRREGULAR_VERBS[dictionaryForm]) {
    return {
      root: IRREGULAR_VERBS[dictionaryForm].root,
      type: IRREGULAR_VERBS[dictionaryForm].type,
      isIrregular: true,
      dictionaryForm,
    };
  }

  // Remove 'नु' from the end
  if (dictionaryForm.endsWith('नु')) {
    const root = dictionaryForm.slice(0, -2);
    
    // Determine if root ends in consonant or vowel
    // Vowel endings in Devanagari: अ आ इ ई उ ऊ ए ऐ ओ औ
    const vowelEndings = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ'];
    const lastChar = root[root.length - 1];
    const isVowelEnding = vowelEndings.some(v => lastChar.includes(v));

    return {
      root,
      type: isVowelEnding ? 'vowel' : 'consonant',
      isIrregular: false,
      dictionaryForm,
    };
  }

  // If doesn't end in नु, return as-is (might already be a root)
  return {
    root: dictionaryForm,
    type: 'consonant',
    isIrregular: false,
    dictionaryForm,
  };
}

/**
 * Conjugate verb in present tense
 */
export function conjugatePresentTense(verbRoot: VerbRoot, subject: Subject): string {
  const { root, type } = verbRoot;

  switch (subject) {
    case 'ma':
      return type === 'vowel' ? `${root}न्छु` : `${root}छु`;
    
    case 'haami':
    case 'timi':
      return type === 'vowel' ? `${root}न्छौ` : `${root}छौ`;
    
    case 'tapaai':
    case 'uha':
      return `${root}नुहुन्छ`;
    
    default:
      return root;
  }
}

/**
 * Conjugate verb in past tense
 */
export function conjugatePastTense(verbRoot: VerbRoot, subject: Subject): string {
  const { root } = verbRoot;

  switch (subject) {
    case 'ma':
      return `${root}एँ`;
    
    case 'haami':
    case 'timi':
      return `${root}यौ`;
    
    case 'tapaai':
    case 'uha':
      return `${root}नुभयो`;
    
    default:
      return root;
  }
}

/**
 * Conjugate verb in future tense
 */
export function conjugateFutureTense(verbRoot: VerbRoot, subject: Subject): string {
  const { root } = verbRoot;

  switch (subject) {
    case 'ma':
      return `${root}नेछु`;
    
    case 'haami':
    case 'timi':
      return `${root}नेछौ`;
    
    case 'tapaai':
    case 'uha':
      return `${root}नुहुनेछ`;
    
    default:
      return root;
  }
}

/**
 * Add ergative case marker to subject for transitive verbs in past tense
 */
export function addErgativeCase(subject: Subject): string {
  const subjectWord = SUBJECTS[subject];
  return `${subjectWord}ले`;
}

/**
 * Detect verb in a Nepali phrase
 * This is a simplified detection - looks for common verb patterns
 */
export function detectVerbInPhrase(phrase: string): string | null {
  // Common verb endings in present tense
  const presentEndings = ['छु', 'छौ', 'न्छ', 'न्छु', 'न्छौ', 'नुहुन्छ'];
  // Past tense endings
  const pastEndings = ['एँ', 'यौ', 'नुभयो', 'ए'];
  // Future tense endings
  const futureEndings = ['नेछु', 'नेछौ', 'नुहुनेछ'];

  const allEndings = [...presentEndings, ...pastEndings, ...futureEndings];
  
  // Split phrase into words
  const words = phrase.split(' ');
  
  // Find word that ends with verb pattern
  for (const word of words) {
    for (const ending of allEndings) {
      if (word.endsWith(ending)) {
        return word;
      }
    }
  }
  
  return null;
}

/**
 * Detect subject and tense from a phrase
 */
export function detectSubjectAndTense(phrase: string): { subject: Subject | null; tense: Tense | null } {
  let subject: Subject | null = null;
  let tense: Tense | null = null;

  // Detect subject
  if (phrase.includes('म ') || phrase.startsWith('म')) subject = 'ma';
  else if (phrase.includes('हामी')) subject = 'haami';
  else if (phrase.includes('तिमी')) subject = 'timi';
  else if (phrase.includes('तपाईं')) subject = 'tapaai';
  else if (phrase.includes('उहाँ') || phrase.includes('उनी')) subject = 'uha';

  // Detect tense by verb endings
  if (phrase.includes('छु') || phrase.includes('छौ') || phrase.includes('न्छ') || phrase.includes('नुहुन्छ')) {
    tense = 'present';
  } else if (phrase.includes('एँ') || phrase.includes('यौ') || phrase.includes('नुभयो')) {
    tense = 'past';
  } else if (phrase.includes('नेछु') || phrase.includes('नेछौ') || phrase.includes('नुहुनेछ')) {
    tense = 'future';
  }

  return { subject, tense };
}

/**
 * Conjugate a phrase to a different subject while maintaining the same tense
 */
export function conjugatePhrase(
  phrase: Phrase,
  targetSubject: Subject,
  targetTense?: Tense
): Phrase | null {
  // This is a simplified version - would need more sophisticated parsing
  // For now, return null to indicate this needs manual implementation
  return null;
}

/**
 * Generate all conjugations for a given phrase (all subjects in same tense)
 */
export function generateAllConjugations(basePhrase: Phrase): Phrase[] {
  // This would generate variations for all subjects
  // For now, return empty array - this needs the full phrase parsing logic
  return [];
}
