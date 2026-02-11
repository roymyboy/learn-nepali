"use client";
import { useState, useEffect } from 'react';
import { DictionaryEntry } from '@/types';
import { searchWords, getWordsByCategory, getWordsByFrequency, getRandomWords, getAvailableCategories, getAvailableFrequencies } from '../lib/dataLoader';

export default function DictionarySearch({ children }: { children?: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<DictionaryEntry | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableFrequencies, setAvailableFrequencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize with random words and load available categories/frequencies
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [randomWords, categories, frequencies] = await Promise.all([
          getRandomWords(10),
          getAvailableCategories(),
          getAvailableFrequencies()
        ]);

        setResults(randomWords);
        setAvailableCategories(categories);
        setAvailableFrequencies(frequencies);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    try {
      if (searchQuery.trim()) {
        const searchResults = await searchWords(searchQuery);
        setResults(searchResults);
      } else if (selectedCategory) {
        const categoryResults = await getWordsByCategory(selectedCategory);
        setResults(categoryResults);
      } else if (selectedFrequency) {
        const frequencyResults = await getWordsByFrequency(selectedFrequency as 'high' | 'medium' | 'low');
        setResults(frequencyResults);
      } else {
        const randomWords = await getRandomWords(10);
        setResults(randomWords);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setSelectedFrequency('');
    setQuery('');

    try {
      if (category) {
        const categoryResults = await getWordsByCategory(category);
        setResults(categoryResults);
      } else {
        const randomWords = await getRandomWords(10);
        setResults(randomWords);
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    setSelectedFrequency(frequency);
    setSelectedCategory('');
    setQuery('');

    try {
      if (frequency) {
        const frequencyResults = await getWordsByFrequency(frequency as 'high' | 'medium' | 'low');
        setResults(frequencyResults);
      } else {
        const randomWords = await getRandomWords(10);
        setResults(randomWords);
      }
    } catch (error) {
      console.error('Error filtering by frequency:', error);
    }
  };

  const frequencyColors = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-white',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-white',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-white'
  };

  // Create category options from available categories
  const categories = [
    { value: '', label: 'All Categories' },
    ...availableCategories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  ];

  // Create frequency options from available frequencies
  const frequencies = [
    { value: '', label: 'All Frequencies' },
    ...availableFrequencies.map(freq => ({
      value: freq,
      label: freq.charAt(0).toUpperCase() + freq.slice(1) + ' Frequency'
    }))
  ];

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Nepali-English Dictionary with Romanization</p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dictionary...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xl text-gray-600 dark:text-gray-300">Nepali-English Dictionary with Romanization</p>
      </div>

      {/* Action Buttons */}
      {children && (
        <div className="flex justify-center gap-4 mb-8">
          {children}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search Nepali words, romanization, or English..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 text-lg"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-3">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-3">Frequency</label>
          <select
            value={selectedFrequency}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
          >
            {frequencies.map((frequency) => (
              <option key={frequency.value} value={frequency.value}>
                {frequency.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Results ({results.length})</h3>
            {!query && !selectedCategory && !selectedFrequency && (
              <button
                onClick={async () => {
                  try {
                    const randomWords = await getRandomWords(10);
                    setResults(randomWords);
                  } catch (error) {
                    console.error('Error loading random words:', error);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Show Different Words
              </button>
            )}
          </div>

          {/* Card Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((entry, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                onClick={() => setSelectedCard(entry)}
              >
                {/* Word Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white break-words">{entry.word}</h4>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${frequencyColors[entry.frequency]}`}>
                        {entry.frequency}
                      </span>
                      {entry.category && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-full text-xs text-center">
                          {entry.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Romanization and POS */}
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">{entry.romanization}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">{entry.pos}</div>
                  </div>
                </div>

                {/* Definitions */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Definitions</h5>
                  <ul className="space-y-1">
                    {entry.definitions.slice(0, 2).map((def, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                        <span className="text-blue-600 dark:text-blue-400 mr-2 mt-1 text-xs">•</span>
                        <span className="line-clamp-2">{def}</span>
                      </li>
                    ))}
                    {entry.definitions.length > 2 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                        +{entry.definitions.length - 2} more definitions
                      </li>
                    )}
                  </ul>
                </div>

                {/* Example */}
                {entry.examples.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Example</h5>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-3 border-blue-200 dark:border-blue-600">
                      <div className="text-gray-900 dark:text-white text-base mb-1">{entry.examples[0]}</div>
                      {entry.examplesRomanized?.[0] && (
                        <div className="text-gray-900 dark:text-white text-base mb-1">{entry.examplesRomanized[0]}</div>
                      )}
                      {entry.examplesEnglish?.[0] && (
                        <div className="text-gray-900 dark:text-white text-base">{entry.examplesEnglish[0]}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Overlay for Enlarged Card */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-8 w-[60vw] max-h-[90vh] overflow-y-auto shadow-2xl transform scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>

            {/* Enlarged Card Content */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white break-words">{selectedCard.word}</h2>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${frequencyColors[selectedCard.frequency]}`}>
                    {selectedCard.frequency}
                  </span>
                  {selectedCard.category && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-full text-sm text-center">
                      {selectedCard.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Romanization and POS */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                <div className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">{selectedCard.romanization}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">{selectedCard.pos}</div>
              </div>
            </div>

            {/* All Definitions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Definitions</h3>
              <ul className="space-y-2">
                {selectedCard.definitions.map((def, index) => (
                  <li key={index} className="text-base text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1 text-sm">•</span>
                    <span>{def}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* All Examples */}
            {selectedCard.examples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Examples</h3>
                <div className="space-y-3">
                  {selectedCard.examples.map((example, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-200 dark:border-blue-600">
                      <div className="text-gray-900 dark:text-white text-lg mb-1">{example}</div>
                      {selectedCard.examplesRomanized?.[index] && (
                        <div className="text-gray-900 dark:text-white text-lg mb-1">{selectedCard.examplesRomanized[index]}</div>
                      )}
                      {selectedCard.examplesEnglish?.[index] && (
                        <div className="text-gray-900 dark:text-white text-lg">{selectedCard.examplesEnglish[index]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No results message */}
      {query && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No words found matching &quot;{query}&quot;</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try searching with different terms or browse by category</p>
        </div>
      )}

      {/* Initial help text */}
      {!query && results.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to Use?</h3>
          <p className="text-gray-600 dark:text-gray-400">Search for Nepali words in Devanagari, Romanization or English words to find Nepali translations</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Use category and frequency filters to explore vocabulary</p>
        </div>
      )}
    </div>
  );
}
