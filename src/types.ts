export interface DictionaryEntry {
  word: string;
  romanization: string;
  pos: string;
  definitions: string[];
  examples: string[];
  examplesRomanized?: string[]; // Romanized versions of examples
  examplesEnglish?: string[]; // English translations of examples
  frequency: 'high' | 'medium' | 'low';
  category?: string;
}

// Interface for JSON data structure
export interface JsonDictionaryEntry {
  DevanagriWord: string;
  romanization: string;
  pos: string;
  definitions: string[];
  examples: string;
  examplesRomanized: string;
  exampleEnglish?: string;
  frequency: 'high' | 'medium' | 'low';
  category: string;
}


// Learn Feature Types
export interface Phrase {
  devanagari: string;
  romanization: string;
  english: string;
  category?: string;
  isCustom?: boolean;
  verb?: string;
  subject?: Subject;
  tense?: Tense;
}

export type Subject = 'ma' | 'haami' | 'timi' | 'tapaai' | 'uha';
export type Tense = 'present' | 'past' | 'future';
export type LanguageDirection = 'nepali-to-english' | 'english-to-nepali';

export interface VerbRoot {
  root: string;
  romanRoot?: string;
  type: 'consonant' | 'vowel';
  isIrregular: boolean;
  dictionaryForm?: string;
}
