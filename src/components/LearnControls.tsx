'use client';

import { LanguageDirection } from '@/types';

interface LearnControlsProps {
    languageDirection: LanguageDirection;
    onLanguageDirectionChange: (direction: LanguageDirection) => void;
    stillLearningCount: number;
    knowCount: number;
    totalCount: number;
    onReset: () => void;
    onToggleAddPhrase: () => void;
}

export default function LearnControls({
    languageDirection,
    onLanguageDirectionChange,
    stillLearningCount,
    knowCount,
    totalCount,
    onReset,
    onToggleAddPhrase,
}: LearnControlsProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Language Direction Toggle */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Direction:
                </label>
                <select
                    value={languageDirection}
                    onChange={(e) => onLanguageDirectionChange(e.target.value as LanguageDirection)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="nepali-to-english">Nepali → English</option>
                    <option value="english-to-nepali">English → Nepali</option>
                </select>
            </div>

            {/* Progress Display */}
            <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stillLearningCount}</span> still learning •
                    <span className="font-semibold text-green-600 dark:text-green-400 ml-2">{knowCount}</span> know •
                    <span className="ml-2">{totalCount} total</span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={onToggleAddPhrase}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                    + Add Phrase
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
