import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Trash2, PlusCircle, Award, CheckCircle, AlertTriangle, Save, ChevronRight } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';

// --- QUIZ BUILDER (SKAPA / REDIGERA) ---
// --- QUIZ BUILDER (SKAPA / REDIGERA) ---
export const QuizBuilderModal = ({ onClose, onSubmit, initialData, isPro }) => {
    const { currentUser } = useAppContext();
    const [quizTitle, setQuizTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseId, setCourseId] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableTo, setAvailableTo] = useState('');

    // Bank Import State
    const [showBankImport, setShowBankImport] = useState(false);
    const [bankQuestions, setBankQuestions] = useState([]);
    const [selectedBankIds, setSelectedBankIds] = useState([]);
    const [bankCategoryFilter, setBankCategoryFilter] = useState('');

    // Options
    const [courseOptions, setCourseOptions] = useState([]);

    const [questions, setQuestions] = useState([
        { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
    ]);

    useEffect(() => {
        // Load Course Options
        if (currentUser) {
            const isAdmin = (currentUser.role === 'ADMIN') || (currentUser.roles && currentUser.roles.includes('ADMIN'));
            const role = isAdmin ? 'ADMIN' : 'TEACHER';
            api.courses.getOptions(currentUser.id, role).then(setCourseOptions).catch(console.error);
        }
    }, [currentUser]);

    useEffect(() => {
        if (initialData && initialData.id) {
            setQuizTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setCourseId(initialData.course?.id || '');
            setAvailableFrom(initialData.availableFrom || '');
            setAvailableTo(initialData.availableTo || '');

            if (initialData.questions?.length > 0) {
                setQuestions(initialData.questions.map(q => ({
                    ...q,
                    options: q.options || [{ text: '', isCorrect: true }, { text: '', isCorrect: false }]
                })));
            }
        }
    }, [initialData]);

    const loadBankQuestions = async () => {
        try {
            const data = await api.questionBank.getMy(currentUser.id);
            setBankQuestions(data || []);
        } catch (error) {
            console.error(error);
            alert("Kunde inte hämta frågor från banken");
        }
    };

    const handleOpenBank = () => {
        loadBankQuestions();
        setShowBankImport(true);
    };

    const handleImportSelected = () => {
        const selectedQuestions = bankQuestions.filter(q => selectedBankIds.includes(q.id));
        const newQuizQuestions = selectedQuestions.map(q => ({
            text: q.questionText,
            options: q.options.map(opt => ({
                text: opt,
                isCorrect: opt === q.correctAnswer
            }))
        }));

        setQuestions([...questions, ...newQuizQuestions]);
        setShowBankImport(false);
        setSelectedBankIds([]);
    };

    const updateQuestion = (idx, field, val) => {
        const newQ = [...questions];
        newQ[idx][field] = val;
        setQuestions(newQ);
    };

    const updateOption = (qIdx, oIdx, field, val) => {
        const newQ = [...questions];
        newQ[qIdx].options[oIdx][field] = val;
        setQuestions(newQ);
    };

    const setCorrectOption = (qIdx, oIdx) => {
        const newQ = [...questions];
        newQ[qIdx].options.forEach(o => o.isCorrect = false);
        newQ[qIdx].options[oIdx].isCorrect = true;
        setQuestions(newQ);
    };

    const addOption = (qIdx) => {
        const newQ = [...questions];
        newQ[qIdx].options.push({ text: '', isCorrect: false });
        setQuestions(newQ);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting quiz, title:", quizTitle);
        if (!quizTitle || quizTitle.trim() === '') {
            alert("Ange en titel");
            return;
        }

        const quizData = {
            title: quizTitle,
            description,
            course: courseId ? { id: courseId } : null,
            availableFrom: availableFrom || null,
            availableTo: availableTo || null,
            questions: questions.map(q => ({
                text: q.text,
                options: q.options.map(o => ({
                    text: o.text,
                    isCorrect: o.isCorrect === true
                }))
            }))
        };
        onSubmit(quizData, initialData ? initialData.id : null);
    };

    const filteredBankQuestions = bankCategoryFilter
        ? bankQuestions.filter(q => q.category === bankCategoryFilter)
        : bankQuestions;

    const uniqueCategories = [...new Set(bankQuestions.map(q => q.category))];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className={`bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#3c4043] ${showBankImport ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2"><HelpCircle /> {initialData ? 'Redigera Quiz' : 'Skapa Quiz (Manuellt)'}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-8 overflow-y-auto flex-1 bg-gray-50 dark:bg-[#131314]">
                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kurs</label>
                                <select
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white"
                                    value={courseId}
                                    onChange={e => setCourseId(e.target.value)}
                                >
                                    <option value="">-- Ingen Kurs (Globalt) --</option>
                                    {courseOptions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tillgänglig Från</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white"
                                    value={availableFrom}
                                    onChange={e => setAvailableFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">T.o.m (Stänger)</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white"
                                    value={availableTo}
                                    onChange={e => setAvailableTo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quiz Titel</label>
                            <input className="w-full p-2 rounded-lg border border-gray-300 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white font-bold text-lg" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="t.ex. Java Basics" />
                        </div>
                        <textarea className="w-full p-3 bg-white dark:bg-[#1E1F20] rounded-lg border border-gray-300 dark:border-[#3c4043] text-sm text-gray-900 dark:text-white outline-none" rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Beskrivning..." />
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] relative shadow-sm group">
                                <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Fråga {qIdx + 1}</label>
                                    <input className="w-full font-medium bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-lg p-3 text-gray-900 dark:text-white" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Skriv frågan här..." />
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/30">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-3">
                                            <input type="radio" name={`correct-${qIdx}`} checked={opt.isCorrect === true} onChange={() => setCorrectOption(qIdx, oIdx)} className="w-5 h-5 accent-green-600 cursor-pointer" />
                                            <input className="flex-1 bg-transparent border-b border-gray-200 dark:border-[#3c4043] py-1 text-sm text-gray-900 dark:text-white outline-none" value={opt.text} onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)} placeholder={`Alternativ ${oIdx + 1}`} />
                                        </div>
                                    ))}
                                    <button onClick={() => addOption(qIdx)} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-2 flex items-center gap-1"><PlusCircle size={14} /> Lägg till alternativ</button>
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <button onClick={() => setQuestions([...questions, { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }])} className="flex-1 py-4 border-2 border-dashed border-gray-300 dark:border-[#3c4043] rounded-xl text-gray-500 dark:text-gray-400 hover:border-indigo-500 font-bold flex items-center justify-center gap-2">
                                <PlusCircle size={20} /> Lägg till ny fråga
                            </button>
                            {isPro && (
                                <button onClick={handleOpenBank} className="flex-1 py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 font-bold flex items-center justify-center gap-2">
                                    <Award size={20} /> Hämta från Frågebank
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3c4043]">Avbryt</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Save size={18} /> Spara Quiz</button>
                </div>
            </div >

            {/* BANK IMPORT MODAL (OVERLAY) */}
            {showBankImport && (
                <div className="fixed inset-0 z-[60] flex justify-center items-center p-8 bg-black/40">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                            <h3 className="text-lg font-bold dark:text-white">Välj frågor från Banken</h3>
                            <button onClick={() => setShowBankImport(false)}><X size={20} /></button>
                        </div>

                        <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex gap-2 overflow-x-auto">
                            <button
                                onClick={() => setBankCategoryFilter('')}
                                className={`px-3 py-1 rounded-full text-sm font-bold ${!bankCategoryFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                Alla
                            </button>
                            {uniqueCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setBankCategoryFilter(cat)}
                                    className={`px-3 py-1 rounded-full text-sm font-bold ${bankCategoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-2">
                            {filteredBankQuestions.length === 0 ? <p className="text-gray-500 text-center">Inga frågor hittades.</p> :
                                filteredBankQuestions.map(q => (
                                    <div
                                        key={q.id}
                                        onClick={() => {
                                            if (selectedBankIds.includes(q.id)) setSelectedBankIds(selectedBankIds.filter(id => id !== q.id));
                                            else setSelectedBankIds([...selectedBankIds, q.id]);
                                        }}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${selectedBankIds.includes(q.id) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-300'}`}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">{q.questionText}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{q.category}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${q.difficulty === 'HARD' ? 'bg-red-100 text-red-800' :
                                                    q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                    }`}>{q.difficulty}</span>
                                            </div>
                                        </div>
                                        {selectedBankIds.includes(q.id) && <CheckCircle size={20} className="text-indigo-600" />}
                                    </div>
                                ))
                            }
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                            <span className="font-bold text-gray-500">{selectedBankIds.length} valda</span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowBankImport(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold">Avbryt</button>
                                <button onClick={handleImportSelected} disabled={selectedBankIds.length === 0} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">Importera Valda</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export const QuizGeneratorModal = ({ onClose, onSubmit }) => {
    const { currentUser } = useAppContext();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [count, setCount] = useState(10);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            api.questionBank.getCategories(currentUser.id).then(setCategories).catch(console.error);
        }
    }, [currentUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !category) {
            alert("Vänligen ange titel och välj kategori.");
            return;
        }
        setIsLoading(true);
        // Simulate slight delay for UX
        setTimeout(() => {
            onSubmit({ title, description: `Genererat quiz (${category})`, generationParams: { category, count } }, null);
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200 dark:border-[#3c4043]">
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Award /> Generera Quiz (AI)</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg flex gap-3 text-indigo-800 dark:text-indigo-200 text-sm">
                        <Award className="shrink-0" />
                        <p>Välj ett ämne från din frågebank så skapar vi ett färdigt quiz med slumpade frågor åt dig direkt.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Titel på Quiz</label>
                        <input className="w-full p-2 rounded border dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" value={title} onChange={e => setTitle(e.target.value)} placeholder="t.ex. Java Slutprov" autoFocus />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Kategori</label>
                        <select className="w-full p-2 rounded border dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">-- Välj Kategori --</option>
                            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                        {categories.length === 0 && <p className="text-xs text-red-500 mt-1">Inga kategorier hittades. Importera frågor först via Frågebanken.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Antal Frågor</label>
                        <input type="number" className="w-full p-2 rounded border dark:bg-[#1E1F20] dark:border-[#3c4043] dark:text-white" value={count} onChange={e => setCount(parseInt(e.target.value))} min="1" max="50" />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#3c4043]">Avbryt</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? 'Genererar...' : 'Generera Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- QUIZ RUNNER (GÖRA PROVET) ---
export const QuizRunnerModal = ({ quiz, onClose, onSubmit }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (qId, optionId) => {
        if (submitted) return;
        setAnswers({ ...answers, [qId]: optionId });
    };

    const finishQuiz = () => {
        let correctCount = 0;
        quiz.questions.forEach(q => {
            const selectedOptionId = answers[q.id];
            const correctOpt = q.options.find(o => o.isCorrect);
            if (selectedOptionId && correctOpt && selectedOptionId === correctOpt.id) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setSubmitted(true);
        if (onSubmit) onSubmit(quiz.id, correctCount, quiz.questions.length);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#3c4043]">
                <div className="bg-indigo-600 p-8 text-white shrink-0 flex justify-between items-start">
                    <div><h2 className="text-2xl font-bold">{quiz.title}</h2><p className="text-indigo-100 mt-1">{quiz.description}</p></div>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-8 overflow-y-auto bg-gray-50 dark:bg-[#131314] flex-1">
                    {submitted && (
                        <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-900 text-green-800 dark:text-green-300 p-6 rounded-xl text-center mb-8">
                            <Award size={48} className="mx-auto mb-3" /><h3 className="text-2xl font-bold">Resultat: {score} / {quiz.questions.length}</h3>
                        </div>
                    )}
                    <div className="space-y-8">
                        {quiz.questions.map((q, idx) => {
                            const selectedOptId = answers[q.id];
                            const isCorrect = submitted && selectedOptId && q.options.find(o => o.id === selectedOptId)?.isCorrect;
                            return (
                                <div key={q.id} className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                                    <h4 className="font-bold text-lg mb-4 flex gap-3 text-gray-900 dark:text-white">
                                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0">{idx + 1}</span> {q.text}
                                        {submitted && isCorrect && <CheckCircle size={24} className="text-green-500 ml-auto" />}
                                        {submitted && !isCorrect && selectedOptId && <AlertTriangle size={24} className="text-red-500 ml-auto" />}
                                    </h4>
                                    <div className="space-y-3 pl-11">
                                        {q.options.map((opt) => {
                                            const isSelected = answers[q.id] === opt.id;
                                            let cls = "bg-gray-50 dark:bg-[#131314] border-gray-200 dark:border-[#3c4043]";
                                            if (isSelected) cls = "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500";
                                            if (submitted && opt.isCorrect) cls = "!bg-green-100 dark:!bg-green-900/30 !border-green-500";
                                            else if (submitted && isSelected && !opt.isCorrect) cls = "!bg-red-100 dark:!bg-red-900/30 !border-red-500";
                                            return (
                                                <div key={opt.id} onClick={() => handleSelect(q.id, opt.id)} className={`p-4 rounded-lg cursor-pointer border transition-all flex items-center justify-between ${cls}`}>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{opt.text}</span>
                                                    {isSelected && !submitted && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {!submitted ? (
                    <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] flex justify-end gap-3">
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 font-bold px-4">Avbryt</button>
                        <button onClick={finishQuiz} disabled={Object.keys(answers).length < quiz.questions.length} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 shadow-lg disabled:opacity-50">Lämna in Quiz</button>
                    </div>
                ) : (
                    <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] flex justify-end"><button onClick={onClose} className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-3 px-8 rounded-xl">Stäng</button></div>
                )}
            </div>
        </div>
    );
};
