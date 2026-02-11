'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phrase, LanguageDirection } from '@/types';
import { loadPhrasesForLearning, saveCustomPhrase, updateCustomPhrase, deleteCustomPhrase } from '@/lib/dataLoader';
import Flashcard from '@/components/Flashcard';
import LearnControls from '@/components/LearnControls';
import AddPhraseForm from '@/components/AddPhraseForm';
import EditPhraseModal from '@/components/EditPhraseModal';

export default function LearnPage() {
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [languageDirection, setLanguageDirection] = useState<LanguageDirection>('nepali-to-english');
    const [stillLearning, setStillLearning] = useState<number[]>([]);
    const [know, setKnow] = useState<number[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load phrases on mount
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const loadedPhrases = await loadPhrasesForLearning();
            setPhrases(loadedPhrases);
            setStillLearning(loadedPhrases.map((_, i) => i));
            setIsLoading(false);
        }
        loadData();
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (showAddForm) return; // Disable keyboard controls when form is open

            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                setIsFlipped(prev => !prev);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleStillLearning();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleKnow();
            } else if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                if (currentPhrase && currentPhrase.isCustom) {
                    setEditingPhrase(currentPhrase);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, stillLearning, showAddForm, editingPhrase]);

    const handleFlip = () => {
        setIsFlipped(prev => !prev);
    };

    const moveToNextCard = useCallback(() => {
        setIsFlipped(false);
        if (stillLearning.length > 0) {
            setCurrentIndex(stillLearning[0]);
        }
    }, [stillLearning]);

    const handleStillLearning = () => {
        if (stillLearning.length === 0) return;

        const current = stillLearning[0];
        const remaining = stillLearning.slice(1);

        // Move current card to end of still learning queue
        setStillLearning([...remaining, current]);
        moveToNextCard();
    };

    const handleKnow = () => {
        if (stillLearning.length === 0) return;

        const current = stillLearning[0];
        const remaining = stillLearning.slice(1);

        setStillLearning(remaining);
        setKnow([...know, current]);
        moveToNextCard();
    };

    const handleReset = () => {
        setStillLearning(phrases.map((_, i) => i));
        setKnow([]);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleSavePhrase = (newPhrase: Phrase) => {
        saveCustomPhrase(newPhrase);
        setPhrases([...phrases, newPhrase]);
        setStillLearning([...stillLearning, phrases.length]);
        setShowAddForm(false);
        alert('Phrase saved successfully!');
    };

    const handleUpdatePhrase = (updatedPhrase: Phrase) => {
        if (!editingPhrase) return;

        updateCustomPhrase(editingPhrase, updatedPhrase);
        const updatedPhrases = phrases.map(p =>
            p === editingPhrase ? updatedPhrase : p
        );
        setPhrases(updatedPhrases);
        setEditingPhrase(null);
        alert('Phrase updated successfully!');
    };

    const handleDeletePhrase = () => {
        if (!editingPhrase) return;

        if (!confirm('Are you sure you want to delete this phrase?')) return;

        deleteCustomPhrase(editingPhrase);
        const phraseIndex = phrases.indexOf(editingPhrase);
        const updatedPhrases = phrases.filter(p => p !== editingPhrase);
        setPhrases(updatedPhrases);

        // Update learning queues
        setStillLearning(stillLearning.filter(i => i !== phraseIndex).map(i => i > phraseIndex ? i - 1 : i));
        setKnow(know.filter(i => i !== phraseIndex).map(i => i > phraseIndex ? i - 1 : i));

        setEditingPhrase(null);
        alert('Phrase deleted successfully!');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading phrases...</p>
                </div>
            </div>
        );
    }

    const currentPhrase = stillLearning.length > 0 ? phrases[stillLearning[0]] : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Learn Nepali Phrases
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Practice with flashcards • Use arrow keys to navigate
                    </p>
                </div>

                {/* Controls */}
                <LearnControls
                    languageDirection={languageDirection}
                    onLanguageDirectionChange={setLanguageDirection}
                    stillLearningCount={stillLearning.length}
                    knowCount={know.length}
                    totalCount={phrases.length}
                    onReset={handleReset}
                    onToggleAddPhrase={() => setShowAddForm(!showAddForm)}
                />

                {/* Add Phrase Form */}
                {showAddForm && (
                    <AddPhraseForm
                        onSave={handleSavePhrase}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                {/* Flashcard or Completion Message */}
                {stillLearning.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Congratulations!
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                            You've completed all {phrases.length} phrases!
                        </p>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Practice Again
                        </button>
                    </div>
                ) : currentPhrase ? (
                    <div>
                        <Flashcard
                            front={languageDirection === 'nepali-to-english' ? currentPhrase.romanization : currentPhrase.english}
                            frontSubtext={languageDirection === 'nepali-to-english' ? currentPhrase.devanagari : undefined}
                            back={languageDirection === 'nepali-to-english' ? currentPhrase.english : currentPhrase.romanization}
                            backSubtext={languageDirection === 'english-to-nepali' ? currentPhrase.devanagari : undefined}
                            isFlipped={isFlipped}
                            onFlip={handleFlip}
                        />

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 justify-center mt-8">
                            <button
                                onClick={handleStillLearning}
                                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <span>←</span> Still Learning
                            </button>
                            <button
                                onClick={handleKnow}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                I Know This <span>→</span>
                            </button>
                        </div>

                        {/* Edit Button for Custom Phrases */}
                        {currentPhrase.isCustom && (
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => setEditingPhrase(currentPhrase)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    ✏️ Edit Phrase (E)
                                </button>
                            </div>
                        )}

                        {/* Keyboard Hints */}
                        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                            <p>Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">←</kbd> Still Learning •
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-2">→</kbd> Know •
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-2">Space</kbd> Flip
                                {currentPhrase.isCustom && <> • <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-2">E</kbd> Edit</>}
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* Back to Home */}
                <div className="text-center mt-12">
                    <a
                        href="/"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        ← Back to Dictionary

                        {/* Edit Phrase Modal */}
                        {editingPhrase && (
                            <EditPhraseModal
                                phrase={editingPhrase}
                                onSave={handleUpdatePhrase}
                                onDelete={handleDeletePhrase}
                                onCancel={() => setEditingPhrase(null)}
                            />
                        )}
                    </a>
                </div>
            </div>
        </div>
    );
}
