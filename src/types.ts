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


