'use client';

import { useState } from 'react';
import { Phrase } from '@/types';

interface EditPhraseModalProps {
    phrase: Phrase;
    onSave: (updatedPhrase: Phrase) => void;
    onDelete: () => void;
    onCancel: () => void;
}

export default function EditPhraseModal({ phrase, onSave, onDelete, onCancel }: EditPhraseModalProps) {
    const [devanagari, setDevanagari] = useState(phrase.devanagari || '');
    const [romanization, setRomanization] = useState(phrase.romanization);
    const [english, setEnglish] = useState(phrase.english);
    const [category, setCategory] = useState(phrase.category || 'custom');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!romanization.trim() || !english.trim() || !category.trim()) {
            alert('Please fill in Romanization, English, and Category');
            return;
        }

        const updatedPhrase: Phrase = {
            ...phrase,
            devanagari: devanagari.trim(),
            romanization: romanization.trim(),
            english: english.trim(),
            category: category.trim(),
        };

        onSave(updatedPhrase);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Phrase</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nepali (Devanagari)
                        </label>
                        <input
                            type="text"
                            value={devanagari}
                            onChange={(e) => setDevanagari(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl"
                            placeholder="म भात खान्छु (optional)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Romanization *
                        </label>
                        <input
                            type="text"
                            value={romanization}
                            onChange={(e) => setRomanization(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="ma bhat khanchu"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            English Translation *
                        </label>
                        <input
                            type="text"
                            value={english}
                            onChange={(e) => setEnglish(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="I eat rice"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category *
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., greetings, food, travel"
                            required
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
