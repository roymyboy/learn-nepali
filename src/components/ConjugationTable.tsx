import { Subject, Tense } from '@/types';
import { SUBJECTS } from '@/lib/conjugation';

interface ConjugationTableProps {
    conjugations: Record<Subject, { devanagari: Record<Tense, string>; roman: Record<Tense, string> }>;
    verb: string;
    script: 'devanagari' | 'roman';
}

const TENSES: { key: Tense; label: string }[] = [
    { key: 'past', label: 'Past (भूत)' },
    { key: 'present', label: 'Present (वर्तमान)' },
    { key: 'future', label: 'Future (भविष्यत्)' },
];

const SUBJECT_ORDER: Subject[] = ['ma', 'haami', 'timi', 'tapaai', 'uha'];

export default function ConjugationTable({ conjugations, verb, script }: ConjugationTableProps) {
    return (
        <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Conjugations for <span className="text-blue-600 dark:text-blue-400">{verb}</span>
                </h3>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300">
                            Subject
                        </th>
                        {TENSES.map(tense => (
                            <th key={tense.key} className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300">
                                {tense.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {SUBJECT_ORDER.map((subject, index) => (
                        <tr
                            key={subject}
                            className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
                        >
                            <td className="p-4 border-b border-gray-100 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                                <span className="text-lg">{SUBJECTS[subject]}</span>
                                <span className="block text-xs text-gray-500 font-normal capitalize">{subject}</span>
                            </td>
                            {TENSES.map(tense => (
                                <td key={tense.key} className="p-4 border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-lg">
                                    {conjugations[subject][script][tense.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="p-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30">
                Rules based on standard formal/informal usage. Regional variations may exist.
            </div>
        </div>
    );
}
