import React, { useState } from 'react';
import { Loader2, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const PracticeQuizSetupModal = ({ course, currentUser, onClose, onStartQuiz }) => {
    const [difficulty, setDifficulty] = useState(3);
    const [questionCount, setQuestionCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await api.ai.generatePractice({
                courseId: course.id,
                difficulty,
                questionCount
            });

            if (response.success) {
                onStartQuiz(response);
            } else {
                setError(response.errorMessage || 'Kunde inte generera quiz.');
            }
        } catch (e) {
            console.error(e);
            setError(e.message || 'Ett fel uppstod vid generering.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-[#3c4043]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Starta Övningsquiz</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">AI-genererat quiz baserat på {course.name}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Difficulty Slider */}
                    <div>
                        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <span>Svårighetsgrad</span>
                            <span className="text-indigo-600 font-bold">{difficulty} / 5</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Lätt</span>
                            <span>Medel</span>
                            <span>Svår</span>
                        </div>
                    </div>

                    {/* Question Count */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Antal frågor
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[3, 5, 10].map(count => (
                                <button
                                    key={count}
                                    onClick={() => setQuestionCount(count)}
                                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${questionCount === count
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white dark:bg-[#282a2c] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {count} frågor
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
                        <BookOpen className="shrink-0 text-blue-600 dark:text-blue-400" size={20} />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-bold mb-1">Hur fungerar det?</p>
                            AI:n analyserar kursens innehåll och taggar för att skapa unika frågor varje gång.
                            Ditt resultat sparas så läraren kan se att du övar!
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-8">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        {isGenerating ? 'Genererar...' : 'Starta Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeQuizSetupModal;
