import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, Play } from 'lucide-react';
import { api } from '../../services/api';

const FlashcardGenerator = ({ onDeckCreated }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await api.get('/courses/my');
            setCourses(data || []);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedCourse) return;

        try {
            setIsGenerating(true);
            const deck = await api.post(`/flashcards/generate/course/${selectedCourse}`);
            if (onDeckCreated) onDeckCreated(deck);
        } catch (error) {
            console.error('Failed to generate deck:', error);
            alert('Kunde inte skapa flashcards just nu. Försök igen senare.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-100 dark:border-[#3c4043] shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                <Sparkles className="text-indigo-500" />
                Skapa nya Flashcards med AI
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                Välj en kurs så skapar EduAI automatiskt en kortlek med de viktigaste begreppen och frågorna från materialet.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Välj Kurs
                    </label>
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Loader2 size={16} className="animate-spin" /> Laddar kurser...
                        </div>
                    ) : (
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                            <option value="">-- Välj en kurs --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.courseCode} - {course.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!selectedCourse || isGenerating}
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${!selectedCourse || isGenerating
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Genererar frågor med AI...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generera Flashcards
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FlashcardGenerator;
