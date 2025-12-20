import React, { useState } from 'react';
import { X, MessageSquare, Star, Send } from 'lucide-react';

const EvaluationModal = ({ course, onClose, onSubmit }) => {
    // Skapa state för svaren: { questionIndex: { score: 5, comment: '' } }
    const [answers, setAnswers] = useState({});

    const handleScoreChange = (qIndex, score) => {
        setAnswers(prev => ({
            ...prev,
            [qIndex]: { ...prev[qIndex], score: parseInt(score) }
        }));
    };

    const handleCommentChange = (qIndex, comment) => {
        setAnswers(prev => ({
            ...prev,
            [qIndex]: { ...prev[qIndex], comment }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validera att alla frågor har fått ett betyg
        const allAnswered = course.evaluation.questions.every((_, idx) => answers[idx]?.score);
        if (!allAnswered) {
            alert("Vänligen ge ett betyg på alla frågor.");
            return;
        }
        onSubmit(course.id, answers);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-indigo-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-indigo-900">Kursutvärdering</h2>
                        <p className="text-indigo-700 text-sm">{course.name} ({course.courseCode})</p>
                    </div>
                    <button onClick={onClose}><X className="text-indigo-400 hover:text-indigo-700"/></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm border">
                        Dina svar är anonyma och hjälper oss att förbättra utbildningen.
                        Ge betyg 1-10 och skriv gärna en kommentar.
                    </p>

                    {course.evaluation.questions.map((q, idx) => (
                        <div key={idx} className="border-b pb-6 last:border-0">
                            <h3 className="font-bold text-gray-800 mb-4 flex gap-3">
                                <span className="bg-indigo-100 text-indigo-700 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">
                                    {idx + 1}
                                </span>
                                {q}
                            </h3>

                            {/* Betyg 1-10 */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 mb-2">Ditt betyg (1 = Dåligt, 10 = Utmärkt)</label>
                                <div className="flex gap-1 flex-wrap">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleScoreChange(idx, num)}
                                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                                answers[idx]?.score === num
                                                    ? 'bg-indigo-600 text-white scale-110 shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Kommentar */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                                    <MessageSquare size={12}/> Kommentar (Valfritt)
                                </label>
                                <textarea
                                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Skriv din åsikt här..."
                                    rows="2"
                                    value={answers[idx]?.comment || ''}
                                    onChange={(e) => handleCommentChange(idx, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Avbryt</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                        <Send size={16}/> Skicka in utvärdering
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluationModal;