'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllConjugations } from '@/lib/conjugation';
import ConjugationTable from '@/components/ConjugationTable';
import { Subject, Tense } from '@/types';
import { loadPhrasesForLearning, lookupVerb } from '@/lib/dataLoader';

export default function ConjugatePage() {
    const [inputVerb, setInputVerb] = useState('');
    const [conjugations, setConjugations] = useState<Record<Subject, { devanagari: Record<Tense, string>; roman: Record<Tense, string> }> | null>(null);
    const [commonVerbs, setCommonVerbs] = useState<string[]>([]);
    const [resolvedVerb, setResolvedVerb] = useState<{ devanagari: string; roman: string; definitions?: string[] } | null>(null);
    const [script, setScript] = useState<'devanagari' | 'roman'>('devanagari');

    // Load some common verbs for suggestions
    useEffect(() => {
        async function loadVerbs() {
            try {
                // Pre-load data so lookups work
                await loadPhrasesForLearning();
                // ... logic to verify dictionary loads
                const defaults = ['खानु', 'जानु', 'गर्नु', 'बस्नु', 'सुत्नु', 'लेख्नु', 'पढ्नु', 'भन्नु', 'दिनु', 'लिनु'];
                setCommonVerbs(defaults);
            } catch (err) {
                console.error('Failed to load verbs', err);
            }
        }
        loadVerbs();
    }, []);

    // Debounce/effect approach or simple async handler
    const handleConjugate = async (verb: string) => {
        if (!verb.trim()) {
            setConjugations(null);
            setResolvedVerb(null);
            return;
        }

        let targetVerb = verb.trim();
        let targetRoman = '';

        // Try to lookup the verb
        try {
            const entry = await lookupVerb(targetVerb);
            if (entry) {
                targetVerb = entry.word;
                targetRoman = entry.romanization;
                setResolvedVerb({
                    devanagari: entry.word,
                    roman: entry.romanization,
                    definitions: entry.definitions
                });
                // Auto-switch to Roman if input was Roman-ish and user preference hasn't been explicitly set? 
                // For now let's stick to explicit toggle, but maybe default to input type could be cool.
                // If input matches romanization, maybe switch script?
                if (verb.trim().toLowerCase() === entry.romanization.toLowerCase()) {
                    setScript('roman');
                } else {
                    setScript('devanagari');
                }
            } else {
                setResolvedVerb(null);
                // Heuristic: if input looks like Roman (a-z), pass it as Roman root source
                if (/^[a-zA-Z]+$/.test(verb.trim())) {
                    targetRoman = verb.trim();
                    setScript('roman');
                }
            }

            // Generate conjugations for the (possibly resolved) verb
            // Note: getAllConjugations expects Devanagari ending in 'nu' mostly
            const result = getAllConjugations(targetVerb, targetRoman);
            setConjugations(result);
        } catch (e) {
            console.error(e);
            setConjugations(null);
            setResolvedVerb(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputVerb(val);
        handleConjugate(val);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
                        ← Back to Dictionary
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Nepali Verb Conjugator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter a verb (in Nepali) to see its conjugations.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Enter Verb (Devanagari or Romanized)
                            </label>
                            <input
                                type="text"
                                value={inputVerb}
                                onChange={handleInputChange}
                                list="common-verbs"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xl"
                                placeholder="e.g. khanu, janu, खानु"
                            />
                            <datalist id="common-verbs">
                                {commonVerbs.map(v => (
                                    <option key={v} value={v} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        {resolvedVerb ? (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                    Conjugating: <span className="font-bold text-gray-900 dark:text-white">{resolvedVerb.devanagari}</span>
                                    {resolvedVerb.roman !== inputVerb.toLowerCase() && ` (${resolvedVerb.roman})`}
                                </div>
                                {resolvedVerb.definitions && resolvedVerb.definitions.length > 0 && (
                                    <div className="mt-1 text-blue-600 dark:text-blue-400 font-medium">
                                        Meaning: {resolvedVerb.definitions.join(', ')}
                                    </div>
                                )}
                            </div>
                        ) : <div></div>}

                        {/* Script Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setScript('devanagari')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${script === 'devanagari' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                            >
                                Devanagari
                            </button>
                            <button
                                onClick={() => setScript('roman')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${script === 'roman' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                            >
                                Romanized
                            </button>
                        </div>
                    </div>
                </div>

                {conjugations && (
                    <ConjugationTable conjugations={conjugations} verb={resolvedVerb?.devanagari || inputVerb} script={script} />
                )}

                {!conjugations && inputVerb && (
                    <div className="text-center text-gray-500 mt-8">
                        Type a valid Nepali verb to see conjugations.
                        <br />
                        <span className="text-xs">(Try ending with &apos;नु&apos; like &apos;खानु&apos;)</span>
                    </div>
                )}
            </div>
        </div>
    );
}
