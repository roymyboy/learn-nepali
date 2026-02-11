import { DictionaryEntry, JsonDictionaryEntry } from '@/types';

// Base path for static hosting (e.g. /learn-nepali on GitHub Pages). Next.js does not prefix fetch() URLs.
const getDataBase = () => process.env.NEXT_PUBLIC_BASE_PATH || '';

// List of JSON files to load
const JSON_FILES = [
  'adverbs.json',
  'animals.json',
  'arts.json',
  'auxiliaries.json',
  'birds.json',
  'body.json',
  'clothing.json',
  'colors.json',
  'conjunctions.json',
  'determiners.json',
  'directions.json',
  'education.json',
  'family.json',
  'festival.json',
  'finance.json',
  'food.json',
  'fruits.json',
  'general.json',
  'geography.json',
  'governance.json',
  'health.json',
  'household.json',
  'interjections.json',
  'music.json',
  'nature.json',
  'numbers.json',
  'particles.json',
  'places.json',
  'postpositions.json',
  'professions.json',
  'pronouns.json',
  'religion.json',
  'sports.json',
  'technology.json',
  'time.json',
  'tools.json',
  'transport.json',
  'verbs.json'
];

// Cache for loaded data
let cachedData: DictionaryEntry[] | null = null;

// Search index for faster lookups
interface SearchIndex {
  wordIndex: Map<string, Set<number>>;
  romanizationIndex: Map<string, Set<number>>;
  definitionIndex: Map<string, Set<number>>;
  definitionExactIndex: Map<string, Set<number>>; // Track exact definition matches
  categoryIndex: Map<string, Set<number>>;
  entries: DictionaryEntry[];
}

let searchIndex: SearchIndex | null = null;

// Search result cache
const searchCache = new Map<string, DictionaryEntry[]>();

// Enhanced search result with match information
export interface SearchResult extends DictionaryEntry {
  matchInfo: {
    matchedFields: string[];
    matchScores: { [field: string]: number };
    highlightedText?: { [field: string]: string };
  };
}

// Search field types
export type SearchField = 'word' | 'romanization' | 'definitions' | 'category' | 'examples';

// Convert JSON entry to DictionaryEntry format
function convertJsonEntry(jsonEntry: JsonDictionaryEntry): DictionaryEntry | null {
  // Validate required fields
  if (!jsonEntry ||
    !jsonEntry.DevanagriWord ||
    !jsonEntry.romanization ||
    !jsonEntry.pos ||
    !jsonEntry.definitions ||
    !Array.isArray(jsonEntry.definitions)) {
    console.warn('Invalid entry found:', jsonEntry);
    return null;
  }

  return {
    word: jsonEntry.DevanagriWord,
    romanization: jsonEntry.romanization,
    pos: jsonEntry.pos,
    definitions: jsonEntry.definitions,
    examples: [jsonEntry.examples], // Convert single example to array
    examplesRomanized: [jsonEntry.examplesRomanized], // Convert single romanized example to array
    examplesEnglish: jsonEntry.exampleEnglish ? [jsonEntry.exampleEnglish] : undefined, // Convert single English example to array
    frequency: jsonEntry.frequency,
    category: jsonEntry.category
  };
}

// Load data from a single JSON file
async function loadJsonFile(filename: string): Promise<DictionaryEntry[]> {
  try {
    const response = await fetch(`${getDataBase()}/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const jsonData: JsonDictionaryEntry[] = await response.json();

    if (!Array.isArray(jsonData)) {
      console.error(`Invalid JSON structure in ${filename}: expected array`);
      return [];
    }

    return jsonData.map(convertJsonEntry).filter((entry): entry is DictionaryEntry => entry !== null);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

// Build search index for faster lookups
function buildSearchIndex(entries: DictionaryEntry[]): SearchIndex {
  const wordIndex = new Map<string, Set<number>>();
  const romanizationIndex = new Map<string, Set<number>>();
  const definitionIndex = new Map<string, Set<number>>();
  const definitionExactIndex = new Map<string, Set<number>>();
  const categoryIndex = new Map<string, Set<number>>();

  entries.forEach((entry, index) => {
    // Index words (Devanagari) - DO NOT lowercase Devanagari script
    if (entry.word) {
      // Index the full word as-is
      if (!wordIndex.has(entry.word)) {
        wordIndex.set(entry.word, new Set());
      }
      wordIndex.get(entry.word)!.add(index);

      // Also index individual words if multi-word
      const words = entry.word.split(/\s+/);
      if (words.length > 1) {
        words.forEach(word => {
          if (!wordIndex.has(word)) {
            wordIndex.set(word, new Set());
          }
          wordIndex.get(word)!.add(index);
        });
      }
    }

    // Index romanization (lowercase for case-insensitive search)
    if (entry.romanization) {
      const normalized = entry.romanization.toLowerCase();

      // Index the full romanization
      if (!romanizationIndex.has(normalized)) {
        romanizationIndex.set(normalized, new Set());
      }
      romanizationIndex.get(normalized)!.add(index);

      // Also index individual words if multi-word
      const romanizations = normalized.split(/\s+/);
      if (romanizations.length > 1) {
        romanizations.forEach(roman => {
          if (!romanizationIndex.has(roman)) {
            romanizationIndex.set(roman, new Set());
          }
          romanizationIndex.get(roman)!.add(index);
        });
      }
    }

    // Index definitions
    if (entry.definitions) {
      entry.definitions.forEach(def => {
        if (def) {
          const defLower = def.toLowerCase();

          // Check if this is an exact single-word definition or a short definition
          const trimmedDef = defLower.trim();
          // Remove common punctuation at the end
          const cleanDef = trimmedDef.replace(/[.,;:!?]$/, '').trim();

          // Check for exact single-word definitions
          if (cleanDef && !cleanDef.includes(' ')) {
            // This is a single-word definition - index as exact match
            if (!definitionExactIndex.has(cleanDef)) {
              definitionExactIndex.set(cleanDef, new Set());
            }
            definitionExactIndex.get(cleanDef)!.add(index);
          }

          // Also check if the definition starts with a single word followed by punctuation
          const firstWordMatch = trimmedDef.match(/^(\w+)[;,:]?\s/);
          if (firstWordMatch) {
            const firstWord = firstWordMatch[1].toLowerCase();
            if (firstWord.length > 2) {
              if (!definitionExactIndex.has(firstWord)) {
                definitionExactIndex.set(firstWord, new Set());
              }
              definitionExactIndex.get(firstWord)!.add(index);
            }
          }

          // Index all words in the definition
          // Remove punctuation and split into words
          const words = defLower.replace(/[.,;:!?'"()]/g, ' ').split(/\s+/);
          words.forEach(word => {
            word = word.trim();
            if (word.length > 2) { // Only index words longer than 2 characters
              if (!definitionIndex.has(word)) {
                definitionIndex.set(word, new Set());
              }
              definitionIndex.get(word)!.add(index);
            }
          });
        }
      });
    }

    // Index categories
    if (entry.category) {
      const normalized = entry.category.toLowerCase();
      if (!categoryIndex.has(normalized)) {
        categoryIndex.set(normalized, new Set());
      }
      categoryIndex.get(normalized)!.add(index);
    }
  });

  return {
    wordIndex,
    romanizationIndex,
    definitionIndex,
    definitionExactIndex,
    categoryIndex,
    entries
  };
}

// Load all dictionary data
export async function loadDictionaryData(): Promise<DictionaryEntry[]> {
  if (cachedData) {
    return cachedData;
  }

  const allData: DictionaryEntry[] = [];
  for (const file of JSON_FILES) {
    const data = await loadJsonFile(file);
    allData.push(...data);
  }
  cachedData = allData;

  // Build search index
  searchIndex = buildSearchIndex(allData);

  // Clear search cache when rebuilding index
  searchCache.clear();

  return allData;
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
}

// Enhanced search with detailed match information and exact match prioritization
function searchWithIndex(query: string, searchFields?: SearchField[]): SearchResult[] {
  if (!searchIndex) return [];

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  // Split query into words, keeping original case for Devanagari
  const queryWords = trimmedQuery.split(/\s+/);
  const lowerQueryWords = lowerQuery.split(/\s+/);

  const resultMap = new Map<number, {
    entry: DictionaryEntry;
    matchedFields: Set<string>;
    matchScores: { [field: string]: number };
    highlightedText: { [field: string]: string };
    exactMatch: boolean;
    matchType: 'exact' | 'partial' | 'fuzzy';
  }>();

  // Default search fields if none specified
  const fieldsToSearch = searchFields || ['word', 'romanization', 'definitions', 'category'];

  // Search in each index with detailed tracking
  queryWords.forEach((word, wordIndex) => {
    const lowerWord = lowerQueryWords[wordIndex];

    // Search in word index (Devanagari) - EXACT MATCHES FIRST
    if (fieldsToSearch.includes('word')) {
      // Exact matches in word index (highest priority) - use original case
      if (searchIndex!.wordIndex.has(word)) {
        searchIndex!.wordIndex.get(word)!.forEach(index => {
          const entry = searchIndex!.entries[index];
          if (!resultMap.has(index)) {
            resultMap.set(index, {
              entry,
              matchedFields: new Set(),
              matchScores: {},
              highlightedText: {},
              exactMatch: true,
              matchType: 'exact'
            });
          }
          const result = resultMap.get(index)!;
          result.matchedFields.add('word');
          result.matchScores.word = 1000; // Very high score for exact word match
          result.highlightedText.word = highlightMatch(entry.word, word);
          result.exactMatch = true;
          result.matchType = 'exact';
        });
      }

      // Partial matches in word index (medium priority)
      searchIndex!.wordIndex.forEach((indices, indexedWord) => {
        if (indexedWord.includes(word) && indexedWord !== word) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'partial'
              });
            }
            const result = resultMap.get(index)!;
            if (!result.exactMatch) { // Don't override exact matches
              result.matchedFields.add('word');
              result.matchScores.word = Math.max(result.matchScores.word || 0, 100); // Medium score for partial match
              result.highlightedText.word = highlightMatch(entry.word, word);
              result.matchType = 'partial';
            }
          });
        }
      });

      // Fuzzy matches for Devanagari words (lowest priority)
      searchIndex!.wordIndex.forEach((indices, indexedWord) => {
        const similarity = calculateSimilarity(word, indexedWord);
        if (similarity > 0.7 && indexedWord !== word && !indexedWord.includes(word)) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'fuzzy'
              });
            }
            const result = resultMap.get(index)!;
            if (!result.exactMatch) { // Don't override exact matches
              result.matchedFields.add('word');
              result.matchScores.word = Math.max(result.matchScores.word || 0, similarity * 50); // Lower score for fuzzy match
              result.highlightedText.word = highlightMatch(entry.word, word);
              result.matchType = 'fuzzy';
            }
          });
        }
      });
    }

    // Search in romanization index - EXACT MATCHES FIRST
    if (fieldsToSearch.includes('romanization')) {
      // Exact matches in romanization index (highest priority) - use lowercase
      if (searchIndex!.romanizationIndex.has(lowerWord)) {
        searchIndex!.romanizationIndex.get(lowerWord)!.forEach(index => {
          const entry = searchIndex!.entries[index];
          if (!resultMap.has(index)) {
            resultMap.set(index, {
              entry,
              matchedFields: new Set(),
              matchScores: {},
              highlightedText: {},
              exactMatch: true,
              matchType: 'exact'
            });
          }
          const result = resultMap.get(index)!;
          result.matchedFields.add('romanization');
          result.matchScores.romanization = 800; // Very high score for exact romanization match
          result.highlightedText.romanization = highlightMatch(entry.romanization, word);
          result.exactMatch = true;
          result.matchType = 'exact';
        });
      }

      // Partial matches in romanization index (medium priority)
      searchIndex!.romanizationIndex.forEach((indices, indexedRoman) => {
        if (indexedRoman.includes(lowerWord) && indexedRoman !== lowerWord) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'partial'
              });
            }
            const result = resultMap.get(index)!;
            if (!result.exactMatch) { // Don't override exact matches
              result.matchedFields.add('romanization');
              result.matchScores.romanization = Math.max(result.matchScores.romanization || 0, 80); // Medium score for partial match
              result.highlightedText.romanization = highlightMatch(entry.romanization, word);
              result.matchType = 'partial';
            }
          });
        }
      });

      // Fuzzy matches for romanization (lowest priority)
      searchIndex!.romanizationIndex.forEach((indices, indexedRoman) => {
        const similarity = calculateSimilarity(lowerWord, indexedRoman);
        if (similarity > 0.7 && indexedRoman !== lowerWord && !indexedRoman.includes(lowerWord)) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'fuzzy'
              });
            }
            const result = resultMap.get(index)!;
            if (!result.exactMatch) { // Don't override exact matches
              result.matchedFields.add('romanization');
              result.matchScores.romanization = Math.max(result.matchScores.romanization || 0, similarity * 40); // Lower score for fuzzy match
              result.highlightedText.romanization = highlightMatch(entry.romanization, word);
              result.matchType = 'fuzzy';
            }
          });
        }
      });
    }

    // Search in definitions - EXACT MATCHES FIRST
    if (fieldsToSearch.includes('definitions')) {
      // Check for exact single-word definitions (highest priority)
      if (searchIndex!.definitionExactIndex.has(lowerWord)) {
        searchIndex!.definitionExactIndex.get(lowerWord)!.forEach(index => {
          const entry = searchIndex!.entries[index];
          if (!resultMap.has(index)) {
            resultMap.set(index, {
              entry,
              matchedFields: new Set(),
              matchScores: {},
              highlightedText: {},
              exactMatch: true,
              matchType: 'exact'
            });
          }
          const result = resultMap.get(index)!;
          result.matchedFields.add('definitions');
          result.matchScores.definitions = 900; // Very high score for exact single-word definition
          result.highlightedText.definitions = highlightMatchInDefinitions(entry.definitions, lowerWord);
          result.exactMatch = true;
          result.matchType = 'exact';
        });
      }

      // Exact word matches in definitions (high priority)
      searchIndex!.definitionIndex.forEach((indices, defWord) => {
        if (defWord === lowerWord) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: true,
                matchType: 'exact'
              });
            }
            const result = resultMap.get(index)!;
            result.matchedFields.add('definitions');
            // Don't override if already has higher score from exact definition
            if (!result.matchScores.definitions || result.matchScores.definitions < 600) {
              result.matchScores.definitions = 600; // High score for exact word match in definition
              result.highlightedText.definitions = highlightMatchInDefinitions(entry.definitions, lowerWord);
              result.exactMatch = true;
              result.matchType = 'exact';
            }
          });
        }
      });

      // Partial matches in definitions (medium priority)
      searchIndex!.definitionIndex.forEach((indices, defWord) => {
        if (defWord.includes(lowerWord) && defWord !== lowerWord) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'partial'
              });
            }
            const result = resultMap.get(index)!;
            if (!result.exactMatch) { // Don't override exact matches
              result.matchedFields.add('definitions');
              const similarity = calculateSimilarity(lowerWord, defWord);
              result.matchScores.definitions = Math.max(result.matchScores.definitions || 0, similarity * 60); // Medium score for partial match
              result.highlightedText.definitions = highlightMatchInDefinitions(entry.definitions, word);
              result.matchType = 'partial';
            }
          });
        }
      });

      // Fuzzy matches in definitions (lowest priority)
      searchIndex!.definitionIndex.forEach((indices, defWord) => {
        const similarity = calculateSimilarity(lowerWord, defWord);
        if (similarity > 0.7 && defWord !== lowerWord && !defWord.includes(lowerWord)) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'fuzzy'
              });
            }
            const result = resultMap.get(index)!;
            if (!result.exactMatch) { // Don't override exact matches
              result.matchedFields.add('definitions');
              result.matchScores.definitions = Math.max(result.matchScores.definitions || 0, similarity * 30); // Lower score for fuzzy match
              result.highlightedText.definitions = highlightMatchInDefinitions(entry.definitions, word);
              result.matchType = 'fuzzy';
            }
          });
        }
      });
    }

    // Search in categories
    if (fieldsToSearch.includes('category')) {
      searchIndex!.categoryIndex.forEach((indices, category) => {
        if (category.includes(lowerWord)) {
          indices.forEach(index => {
            const entry = searchIndex!.entries[index];
            if (!resultMap.has(index)) {
              resultMap.set(index, {
                entry,
                matchedFields: new Set(),
                matchScores: {},
                highlightedText: {},
                exactMatch: false,
                matchType: 'partial'
              });
            }
            const result = resultMap.get(index)!;
            result.matchedFields.add('category');
            result.matchScores.category = 30; // Lower score for category match
            result.highlightedText.category = highlightMatch(entry.category || '', word);
          });
        }
      });
    }
  });

  // Convert to SearchResult format and sort with exact match prioritization
  return Array.from(resultMap.values())
    .map(({ entry, matchedFields, matchScores, highlightedText }) => {
      return {
        ...entry,
        matchInfo: {
          matchedFields: Array.from(matchedFields),
          matchScores,
          highlightedText
        }
      };
    })
    .sort((a, b) => {
      // First priority: Exact matches always come first
      const aExact = a.matchInfo.matchScores.word >= 1000 ||
        a.matchInfo.matchScores.romanization >= 800 ||
        a.matchInfo.matchScores.definitions >= 600;
      const bExact = b.matchInfo.matchScores.word >= 1000 ||
        b.matchInfo.matchScores.romanization >= 800 ||
        b.matchInfo.matchScores.definitions >= 600;

      if (aExact && !bExact) return -1; // a comes first
      if (!aExact && bExact) return 1;  // b comes first

      // Second priority: Total score for non-exact matches
      const scoreA = Object.values(a.matchInfo.matchScores).reduce((sum, score) => sum + score, 0);
      const scoreB = Object.values(b.matchInfo.matchScores).reduce((sum, score) => sum + score, 0);

      // Third priority: Number of matched fields
      const fieldsA = a.matchInfo.matchedFields.length;
      const fieldsB = b.matchInfo.matchedFields.length;

      if (scoreA !== scoreB) return scoreB - scoreA;
      return fieldsB - fieldsA;
    })
    .slice(0, 15);
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Helper function to highlight matches in definitions
function highlightMatchInDefinitions(definitions: string[], query: string): string {
  return definitions.map(def => highlightMatch(def, query)).join(' | ');
}

// Main search function that returns DictionaryEntry[] for backward compatibility
export async function searchWords(query: string): Promise<DictionaryEntry[]> {
  const results = await searchWordsEnhanced(query);
  // Convert SearchResult[] to DictionaryEntry[] by removing matchInfo
  return results.map(result => {
    // Strip matchInfo for backward-compatible DictionaryEntry[] return type
    const { matchInfo, ...entry } = result;
    void matchInfo;
    return entry;
  });
}

// Enhanced search with field-specific options
export async function searchWordsEnhanced(
  query: string,
  searchFields?: SearchField[]
): Promise<SearchResult[]> {
  const cacheKey = `${query}_${searchFields?.join(',') || 'all'}`;

  // Check cache first
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) as SearchResult[];
  }

  // Use indexed search if available
  if (searchIndex) {
    const results = searchWithIndex(query, searchFields);
    searchCache.set(cacheKey, results);
    return results;
  }

  // Fallback to original search method
  const dictionary = await loadDictionaryData();
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  dictionary.forEach(entry => {
    const matchedFields: string[] = [];
    const matchScores: { [field: string]: number } = {};
    const highlightedText: { [field: string]: string } = {};

    // Check exact word match (highest priority)
    if (entry.word && entry.word === query) {
      matchedFields.push('word');
      matchScores.word = 1000; // Very high score for exact match
      highlightedText.word = highlightMatch(entry.word, query);
    }
    // Check partial word match
    else if (entry.word && entry.word.includes(query)) {
      matchedFields.push('word');
      matchScores.word = 100; // Medium score for partial match
      highlightedText.word = highlightMatch(entry.word, query);
    }

    // Check exact romanization match (high priority)
    if (entry.romanization && entry.romanization.toLowerCase() === lowerQuery) {
      matchedFields.push('romanization');
      matchScores.romanization = 800; // Very high score for exact match
      highlightedText.romanization = highlightMatch(entry.romanization, query);
    }
    // Check partial romanization match
    else if (entry.romanization && entry.romanization.toLowerCase().includes(lowerQuery)) {
      matchedFields.push('romanization');
      matchScores.romanization = 80; // Medium score for partial match
      highlightedText.romanization = highlightMatch(entry.romanization, query);
    }

    // Check definitions match
    if (entry.definitions && entry.definitions.some(def => def && def.toLowerCase().includes(lowerQuery))) {
      matchedFields.push('definitions');
      matchScores.definitions = 60; // Medium score for definition match
      highlightedText.definitions = highlightMatchInDefinitions(entry.definitions, query);
    }

    // Check category match
    if (entry.category && entry.category.toLowerCase().includes(lowerQuery)) {
      matchedFields.push('category');
      matchScores.category = 30; // Lower score for category match
      highlightedText.category = highlightMatch(entry.category, query);
    }

    // Check examples match
    if (entry.examplesRomanized && entry.examplesRomanized.some(ex => ex && ex.toLowerCase().includes(lowerQuery))) {
      matchedFields.push('examples');
      matchScores.examples = 40; // Medium score for example match
      highlightedText.examples = entry.examplesRomanized.map(ex => highlightMatch(ex, query)).join(' | ');
    }

    if (matchedFields.length > 0) {
      results.push({
        ...entry,
        matchInfo: {
          matchedFields,
          matchScores,
          highlightedText
        }
      });
    }
  });

  // Sort with exact match prioritization
  const finalResults = results
    .sort((a, b) => {
      // First priority: Exact matches always come first
      const aExact = a.matchInfo.matchScores.word >= 1000 ||
        a.matchInfo.matchScores.romanization >= 800;
      const bExact = b.matchInfo.matchScores.word >= 1000 ||
        b.matchInfo.matchScores.romanization >= 800;

      if (aExact && !bExact) return -1; // a comes first
      if (!aExact && bExact) return 1;  // b comes first

      // Second priority: Total score for non-exact matches
      const scoreA = Object.values(a.matchInfo.matchScores).reduce((sum, score) => sum + score, 0);
      const scoreB = Object.values(b.matchInfo.matchScores).reduce((sum, score) => sum + score, 0);

      // Third priority: Number of matched fields
      const fieldsA = a.matchInfo.matchedFields.length;
      const fieldsB = b.matchInfo.matchedFields.length;

      if (scoreA !== scoreB) return scoreB - scoreA;
      return fieldsB - fieldsA;
    })
    .slice(0, 15);

  searchCache.set(cacheKey, finalResults);
  return finalResults;
}

// Search specifically in Devanagari words
export async function searchDevanagariWords(query: string): Promise<SearchResult[]> {
  return searchWordsEnhanced(query, ['word']);
}

// Search specifically in romanization
export async function searchRomanization(query: string): Promise<SearchResult[]> {
  return searchWordsEnhanced(query, ['romanization']);
}

// Lookup a verb by Devanagari or Romanization
export async function lookupVerb(query: string): Promise<DictionaryEntry | null> {
  // First try exact match
  const results = await searchWordsEnhanced(query, ['word', 'romanization']);

  // Filter for verbs
  const verbs = results.filter(r => r.pos.toLowerCase().includes('verb'));

  if (verbs.length > 0) {
    return verbs[0]; // Return best match
  }

  return null;
}

// Search specifically in definitions
export async function searchDefinitions(query: string): Promise<SearchResult[]> {
  return searchWordsEnhanced(query, ['definitions']);
}

// Multi-field search with explicit field selection
export async function searchInFields(
  query: string,
  fields: SearchField[]
): Promise<SearchResult[]> {
  return searchWordsEnhanced(query, fields);
}

// Advanced search with multiple criteria
export async function advancedSearch(options: {
  query?: string;
  category?: string;
  frequency?: 'high' | 'medium' | 'low';
  pos?: string;
  exactMatch?: boolean;
  fuzzyThreshold?: number;
  searchFields?: SearchField[];
}): Promise<SearchResult[]> {
  const {
    query,
    category,
    frequency,
    pos,
    exactMatch = false,
    fuzzyThreshold = 0.7,
    searchFields = ['word', 'romanization', 'definitions']
  } = options;

  let results: SearchResult[] = [];

  // Apply text search first if query is provided
  if (query) {
    results = await searchWordsEnhanced(query, searchFields);
  } else {
    // If no query, get all entries and convert to SearchResult format
    const dictionary = await loadDictionaryData();
    results = dictionary.map(entry => ({
      ...entry,
      matchInfo: {
        matchedFields: [],
        matchScores: {},
        highlightedText: {}
      }
    }));
  }

  // Filter by category
  if (category) {
    results = results.filter(result => result.category === category);
  }

  // Filter by frequency
  if (frequency) {
    results = results.filter(result => result.frequency === frequency);
  }

  // Filter by part of speech
  if (pos) {
    results = results.filter(result => result.pos === pos);
  }

  // Apply exact match filtering if requested
  if (exactMatch && query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(result =>
      result.word === query ||
      result.romanization.toLowerCase() === lowerQuery
    );
  }

  // Apply fuzzy threshold filtering if specified
  if (fuzzyThreshold < 1.0 && query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(result => {
      const wordSimilarity = result.word ? calculateSimilarity(query, result.word) : 0;
      const romanSimilarity = result.romanization ? calculateSimilarity(lowerQuery, result.romanization.toLowerCase()) : 0;
      const defSimilarity = result.definitions.some(def => {
        const words = def.toLowerCase().split(/\s+/);
        return words.some(word => calculateSimilarity(lowerQuery, word) >= fuzzyThreshold);
      });

      return wordSimilarity >= fuzzyThreshold ||
        romanSimilarity >= fuzzyThreshold ||
        defSimilarity ||
        result.word.includes(query) ||
        result.romanization.toLowerCase().includes(lowerQuery) ||
        result.definitions.some(def => def.toLowerCase().includes(lowerQuery));
    });
  }

  return results.slice(0, 50); // Return more results for advanced search
}

// Search for similar words (fuzzy search)
export async function findSimilarWords(word: string, threshold: number = 0.7): Promise<DictionaryEntry[]> {
  const dictionary = await loadDictionaryData();
  const results: Array<{ entry: DictionaryEntry; similarity: number }> = [];

  dictionary.forEach(entry => {
    let maxSimilarity = 0;

    // Check word similarity
    if (entry.word) {
      const wordSim = calculateSimilarity(word, entry.word);
      maxSimilarity = Math.max(maxSimilarity, wordSim);
    }

    // Check romanization similarity
    if (entry.romanization) {
      const romanSim = calculateSimilarity(word.toLowerCase(), entry.romanization.toLowerCase());
      maxSimilarity = Math.max(maxSimilarity, romanSim);
    }

    if (maxSimilarity >= threshold) {
      results.push({ entry, similarity: maxSimilarity });
    }
  });

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 20)
    .map(({ entry }) => entry);
}

// Get search suggestions based on partial input
export async function getSearchSuggestions(partialQuery: string, limit: number = 10): Promise<string[]> {
  if (!searchIndex || partialQuery.length < 2) return [];

  const suggestions = new Set<string>();
  const lowerQuery = partialQuery.toLowerCase();

  // Get suggestions from word index
  searchIndex.wordIndex.forEach((indices, word) => {
    if (word.startsWith(lowerQuery)) {
      suggestions.add(word);
    }
  });

  // Get suggestions from romanization index
  searchIndex.romanizationIndex.forEach((indices, roman) => {
    if (roman.startsWith(lowerQuery)) {
      suggestions.add(roman);
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

export async function getWordsByCategory(category: string): Promise<DictionaryEntry[]> {
  const dictionary = await loadDictionaryData();
  return dictionary.filter(entry => entry.category === category);
}

export async function getWordsByFrequency(frequency: 'high' | 'medium' | 'low'): Promise<DictionaryEntry[]> {
  const dictionary = await loadDictionaryData();
  return dictionary.filter(entry => entry.frequency === frequency);
}

// Clear search cache to free memory
export function clearSearchCache(): void {
  searchCache.clear();
}

// Get search statistics
export function getSearchStats(): {
  totalEntries: number;
  indexSize: number;
  cacheSize: number;
} {
  return {
    totalEntries: searchIndex?.entries.length || 0,
    indexSize: searchIndex ?
      searchIndex.wordIndex.size +
      searchIndex.romanizationIndex.size +
      searchIndex.definitionIndex.size +
      searchIndex.definitionExactIndex.size +
      searchIndex.categoryIndex.size : 0,
    cacheSize: searchCache.size
  };
}

export async function getRandomWords(count: number = 10): Promise<DictionaryEntry[]> {
  const dictionary = await loadDictionaryData();
  const words = Object.values(dictionary);
  const shuffled = words.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function getAvailableCategories(): Promise<string[]> {
  const dictionary = await loadDictionaryData();
  const categories = new Set<string>();
  dictionary.forEach(entry => {
    if (entry.category) {
      categories.add(entry.category);
    }
  });
  return Array.from(categories).sort();
}

export async function getAvailableFrequencies(): Promise<string[]> {
  const dictionary = await loadDictionaryData();
  const frequencies = new Set<string>();
  dictionary.forEach(entry => {
    frequencies.add(entry.frequency);
  });
  return Array.from(frequencies).sort((a, b) => {
    const order = { 'high': 1, 'medium': 2, 'low': 3 };
    return order[a as keyof typeof order] - order[b as keyof typeof order];
  });
}
// Learn Feature - Phrase Loading Functions
import { Phrase } from '@/types';

/**
 * Load phrases for the Learn feature
 * Combines verb phrases, additional phrases, and custom user phrases
 */
export async function loadPhrasesForLearning(): Promise<Phrase[]> {
  const allPhrases: Phrase[] = [];

  // 1. Load verb phrases from verbs.json (363 entries)
  try {
    const verbsResponse = await fetch(`${getDataBase()}/data/verbs.json`);
    if (verbsResponse.ok) {
      const verbs: JsonDictionaryEntry[] = await verbsResponse.json();

      // Transform verb entries into phrase format
      verbs.forEach(verb => {
        if (verb.examples && verb.examplesRomanized && verb.exampleEnglish) {
          allPhrases.push({
            devanagari: verb.examples,
            romanization: verb.examplesRomanized,
            english: verb.exampleEnglish,
            category: 'verbs',
            isCustom: false,
            verb: verb.DevanagriWord,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error loading verb phrases:', error);
  }

  // 2. Load additional phrases from phrases.json (~50 entries)
  try {
    const phrasesResponse = await fetch(`${getDataBase()}/data/phrases.json`);
    if (phrasesResponse.ok) {
      const phrases: Phrase[] = await phrasesResponse.json();
      allPhrases.push(...phrases.map(p => ({ ...p, isCustom: false })));
    }
  } catch (error) {
    console.error('Error loading phrases:', error);
  }

  // 3. Load custom user phrases from localStorage
  const customPhrases = loadCustomPhrases();
  allPhrases.push(...customPhrases);

  return allPhrases;
}

/**
 * Load custom user phrases from localStorage
 */
export function loadCustomPhrases(): Phrase[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('customPhrases');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading custom phrases:', error);
  }

  return [];
}

/**
 * Save a custom phrase to localStorage

 */
export function saveCustomPhrase(phrase: Phrase): void {
  if (typeof window === 'undefined') return;

  try {
    const customPhrases = loadCustomPhrases();
    const newPhrase = {
      ...phrase,
      isCustom: true,
    };

    customPhrases.push(newPhrase);
    localStorage.setItem('customPhrases', JSON.stringify(customPhrases));
  } catch (error) {
    console.error('Error saving custom phrase:', error);
  }
}

/**
 * Delete a custom phrase from localStorage
 */
export function deleteCustomPhrase(phraseToDelete: Phrase): void {
  if (typeof window === 'undefined') return;

  try {
    const customPhrases = loadCustomPhrases();
    const filtered = customPhrases.filter(
      p => p.devanagari !== phraseToDelete.devanagari ||
        p.english !== phraseToDelete.english
    );
    localStorage.setItem('customPhrases', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom phrase:', error);
  }
}

/**
 * Clear all custom phrases from localStorage
 */
export function clearCustomPhrases(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('customPhrases');
  } catch (error) {
    console.error('Error clearing custom phrases:', error);
  }
}

/**
 * Update a custom phrase in localStorage
 */
export function updateCustomPhrase(oldPhrase: Phrase, newPhrase: Phrase): void {
  if (typeof window === 'undefined') return;

  try {
    const customPhrases = loadCustomPhrases();
    const index = customPhrases.findIndex(
      p => p.devanagari === oldPhrase.devanagari &&
        p.romanization === oldPhrase.romanization &&
        p.english === oldPhrase.english
    );

    if (index !== -1) {
      customPhrases[index] = { ...newPhrase, isCustom: true };
      localStorage.setItem('customPhrases', JSON.stringify(customPhrases));
    }
  } catch (error) {
    console.error('Error updating custom phrase:', error);
  }
}
