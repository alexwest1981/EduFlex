import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Edit, Trash2, Copy, Search, Plus } from 'lucide-react';

export const QuizLibrary = () => {
    const { currentUser } = useAppContext();
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);

    // Copy Modal State
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [targetCourseId, setTargetCourseId] = useState('');

    useEffect(() => {
        loadLibrary();
        loadCourses();
    }, [currentUser]);

    const loadLibrary = async () => {
        setIsLoading(true);
        try {
            // New endpoint we defined in planning or need to define?
            // "api.quiz.getMy" already exists and returns quizzes by author.
            // QuizController.getMyQuizzes uses findByAuthorId. This works for library.
            const data = await api.quiz.getMy(currentUser.id);
            setQuizzes(data || []);
        } catch (e) {
            console.error("Library load error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            const role = currentUser?.roles?.includes('ADMIN') ? 'ADMIN' : 'TEACHER';
            const data = await api.courses.getOptions(currentUser?.id, role);
            setCourses(data || []);
        } catch (e) { console.error(e); }
    };

    const handleCopy = async () => {
        if (!selectedQuiz || !targetCourseId) return;
        try {
            // Need a "copy" or "clone" endpoint, or just create a new one with same data.
            // For simplicity, we fetch the full quiz details (if needed) and POST as new.
            // But we already have the quiz object in `selectedQuiz`.
            // We just strip the ID and set the new course.

            const quizCopy = {
                ...selectedQuiz,
                id: null,
                course: { id: targetCourseId },
                title: `${selectedQuiz.title} (Kopia)`
            };

            await api.quiz.create(targetCourseId, currentUser.id, quizCopy);
            alert("Quiz kopierat till kursen!");
            setCopyModalOpen(false);
        } catch (e) {
            alert("Fel vid kopiering.");
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043]">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-[#3c4043] outline-none"
                        placeholder="Sök i bibliotek..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Visar {filteredQuizzes.length} av {quizzes.length} quiz
                </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#131314] text-gray-500 font-bold border-b border-gray-200 dark:border-[#3c4043]">
                        <tr>
                            <th className="p-4">Titel</th>
                            <th className="p-4">Nuvarande Kurs</th>
                            <th className="p-4">Frågor</th>
                            <th className="p-4">Skapad</th>
                            <th className="p-4 text-right">Åtgärder</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {filteredQuizzes.map(q => (
                            <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-[#3c4043]/50">
                                <td className="p-4 font-medium">{q.title}</td>
                                <td className="p-4 text-gray-500">{q.course ? q.course.name || q.course.title || "Globalt" : "Ingen"}</td>
                                <td className="p-4">{q.questions?.length || 0}</td>
                                <td className="p-4 text-gray-500">TODO: Date</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => { setSelectedQuiz(q); setCopyModalOpen(true); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Kopiera till kurs">
                                        <Copy size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredQuizzes.length === 0 && <div className="p-8 text-center text-gray-500">Inga quiz hittades i ditt bibliotek.</div>}
            </div>

            {/* Copy Modal */}
            {copyModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Kopiera "{selectedQuiz?.title}"</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Välj Kurs</label>
                            <select
                                className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043]"
                                value={targetCourseId}
                                onChange={e => setTargetCourseId(e.target.value)}
                            >
                                <option value="">-- Välj Kurs --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setCopyModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3c4043]">Avbryt</button>
                            <button onClick={handleCopy} disabled={!targetCourseId} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Kopiera</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
