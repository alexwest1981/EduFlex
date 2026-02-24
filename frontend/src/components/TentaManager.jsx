import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Save, X, CheckCircle, Circle,
    Calendar, Clock, Bell, Settings, ChevronRight, ChevronLeft,
    Mail, MessageSquare, Smartphone, Info
} from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

const TentaManager = ({ courseId, teacherId, onClose, onSave }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1); // 1: Questions, 2: Config, 3: Scheduling
    const [isLoading, setIsLoading] = useState(false);

    const [exam, setExam] = useState({
        quizData: {
            title: '',
            description: '',
            questions: [],
            isExam: true,
            durationMinutes: 60,
            gradingType: 'MANUAL'
        },
        startTime: '',
        endTime: '',
        courseId: courseId,
        teacherId: teacherId,
        notifySms: false,
        notifyEmail: true,
        notifyPush: true,
        notifyInternal: true
    });

    // Helper: Set default end time (2 hours after start)
    useEffect(() => {
        if (exam.startTime && !exam.endTime) {
            const start = new Date(exam.startTime);
            const end = new Date(start.getTime() + 120 * 60000); // +120 min
            setExam(prev => ({ ...prev, endTime: end.toISOString().slice(0, 16) }));
        }
    }, [exam.startTime]);

    // --- Question Logic (Reused from QuizEditor) ---
    const addQuestion = () => {
        const newQuestions = [
            ...exam.quizData.questions,
            { text: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }
        ];
        setExam({ ...exam, quizData: { ...exam.quizData, questions: newQuestions } });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...exam.quizData.questions];
        newQuestions[index][field] = value;
        setExam({ ...exam, quizData: { ...exam.quizData, questions: newQuestions } });
    };

    const removeQuestion = (index) => {
        const newQuestions = exam.quizData.questions.filter((_, i) => i !== index);
        setExam({ ...exam, quizData: { ...exam.quizData, questions: newQuestions } });
    };

    const addOption = (qIndex) => {
        const newQuestions = [...exam.quizData.questions];
        newQuestions[qIndex].options.push({ text: '', isCorrect: false });
        setExam({ ...exam, quizData: { ...exam.quizData, questions: newQuestions } });
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const newQuestions = [...exam.quizData.questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setExam({ ...exam, quizData: { ...exam.quizData, questions: newQuestions } });
    };

    const toggleCorrect = (qIndex, oIndex) => {
        const newQuestions = [...exam.quizData.questions];
        newQuestions[qIndex].options[oIndex].isCorrect = !newQuestions[qIndex].options[oIndex].isCorrect;
        setExam({ ...exam, quizData: { ...exam.quizData, questions: newQuestions } });
    };

    const handleSave = async () => {
        if (!exam.quizData.title) return alert("Tentamen måste ha en titel.");
        if (!exam.startTime || !exam.endTime) return alert("Du måste ange start- och sluttid.");

        setIsLoading(true);
        try {
            await api.quiz.bookExam(exam);
            if (onSave) onSave();
            if (onClose) onClose();
        } catch (e) {
            console.error(e);
            alert("Kunde inte boka tentamen: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-[#3c4043]">

                {/* Header / Stepper */}
                <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Tenta Manager</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Boka examination & meddela studenter</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 px-8">
                        {[
                            { id: 1, label: 'Innehåll', icon: Plus },
                            { id: 2, label: 'Inställningar', icon: Settings },
                            { id: 3, label: 'Bokning', icon: Bell }
                        ].map((s) => (
                            <div key={s.id} className={`flex items-center gap-2 transition-all ${step === s.id ? 'text-indigo-600 scale-105' : 'text-gray-400 opacity-50'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-[#3c4043]'}`}>
                                    {s.id}
                                </div>
                                <span className="font-bold text-sm">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#3c4043] rounded-xl transition-colors">
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#1E1F20]">
                    <div className="max-w-4xl mx-auto">

                        {/* STEP 1: CONTENT */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <section className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Tentamens Titel</label>
                                        <input
                                            className="w-full text-3xl font-black bg-transparent border-b-4 border-gray-100 dark:border-[#3c4043] focus:border-indigo-500 outline-none pb-2 text-gray-900 dark:text-white placeholder-gray-200"
                                            placeholder="T.ex. Sluttentamen Webbdesign"
                                            value={exam.quizData.title}
                                            onChange={e => setExam({ ...exam, quizData: { ...exam.quizData, title: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Beskrivning</label>
                                        <textarea
                                            className="w-full p-4 bg-gray-50 dark:bg-[#131314] rounded-2xl border border-gray-200 dark:border-[#3c4043] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            rows="3"
                                            placeholder="Instruktioner till studenterna..."
                                            value={exam.quizData.description}
                                            onChange={e => setExam({ ...exam, quizData: { ...exam.quizData, description: e.target.value } })}
                                        />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">Frågor ({exam.quizData.questions.length})</h3>
                                    </div>

                                    {exam.quizData.questions.map((q, qIndex) => (
                                        <div key={qIndex} className="bg-gray-50 dark:bg-[#131314] p-8 rounded-3xl border border-gray-100 dark:border-[#3c4043] relative animate-in zoom-in-95">
                                            <button onClick={() => removeQuestion(qIndex)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={20} />
                                            </button>

                                            <div className="mb-6">
                                                <label className="block text-xs font-bold text-indigo-500 uppercase mb-2">Fråga {qIndex + 1}</label>
                                                <input
                                                    className="w-full font-bold bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-xl p-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Skriv din fråga här..."
                                                    value={q.text}
                                                    onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-3 pl-6 border-l-4 border-indigo-100 dark:border-indigo-900/30">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => toggleCorrect(qIndex, oIndex)}
                                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-green-100 text-green-600 shadow-sm shadow-green-200' : 'bg-white dark:bg-[#1E1F20] text-gray-300 border border-gray-200 dark:border-[#3c4043]'}`}
                                                        >
                                                            {opt.isCorrect ? <CheckCircle size={22} /> : <Circle size={22} />}
                                                        </button>
                                                        <input
                                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-[#3c4043] focus:border-indigo-500 py-2 text-gray-900 dark:text-white outline-none font-medium"
                                                            placeholder={`Svarsalternativ ${oIndex + 1}`}
                                                            value={opt.text}
                                                            onChange={e => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                                <button onClick={() => addOption(qIndex)} className="text-xs font-black text-indigo-500 flex items-center gap-2 mt-4 hover:translate-x-1 transition-transform">
                                                    <Plus size={16} /> LÄGG TILL ALTERNATIV
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button onClick={addQuestion} className="w-full py-8 border-4 border-dashed border-gray-100 dark:border-[#3c4043] rounded-3xl text-gray-400 hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-2 group">
                                        <Plus size={32} className="group-hover:scale-125 transition-transform" />
                                        <span className="font-black uppercase tracking-widest text-sm">Lägg till ny fråga</span>
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* STEP 2: CONFIGURATION */}
                        {step === 2 && (
                            <div className="space-y-12 animate-in slide-in-from-right-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-50 dark:bg-[#131314] p-8 rounded-3xl border border-gray-100 dark:border-[#3c4043]">
                                        <h3 className="font-black flex items-center gap-2 mb-6 dark:text-white"><Clock size={20} className="text-indigo-500" /> Tidsbegränsning</h3>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                className="w-32 p-4 bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] text-2xl font-black text-center dark:text-white"
                                                value={exam.quizData.durationMinutes}
                                                onChange={e => setExam({ ...exam, quizData: { ...exam.quizData, durationMinutes: parseInt(e.target.value) } })}
                                            />
                                            <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">Minuter</span>
                                        </div>
                                        <p className="mt-4 text-xs text-gray-400 font-medium italic">Studenter har denna tid på sig att slutföra tentamen när de väl startat.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-[#131314] p-8 rounded-3xl border border-gray-100 dark:border-[#3c4043]">
                                        <h3 className="font-black flex items-center gap-2 mb-6 dark:text-white"><Settings size={20} className="text-indigo-500" /> Rättningsmetod</h3>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'MANUAL', label: 'Manuell rättning', desc: 'Du rättar allt själv.' },
                                                { id: 'AUTO', label: 'Automatisk (MCQ)', desc: 'Systemet rättar direkt.' },
                                                { id: 'AI', label: 'AI Rättning (Gemini)', desc: 'AI förslår betyg & feedback.' }
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setExam({ ...exam, quizData: { ...exam.quizData, gradingType: method.id } })}
                                                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${exam.quizData.gradingType === method.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent bg-white dark:bg-[#1E1F20] hover:bg-gray-50'}`}
                                                >
                                                    <div className="font-black text-sm dark:text-white uppercase">{method.label}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{method.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex gap-4">
                                    <Info className="text-amber-500 shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-black text-amber-800 dark:text-amber-400 text-sm uppercase">Säkerhetsläge: Exam Integrity Pro</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-500 font-medium mt-1">När du skapar en "Tenta" aktiveras automatiskt integritetsövervakning. Detta innebär att fönsterbyten loggas och att studenten måste stanna i tentaläget.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SCHEDULING & NOTIFICATIONS */}
                        {step === 3 && (
                            <div className="space-y-10 animate-in slide-in-from-right-4">
                                <div className="bg-gray-50 dark:bg-[#131314] p-8 rounded-3xl border border-gray-100 dark:border-[#3c4043]">
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><Calendar className="text-indigo-500" size={20} /> Kalenderbokning</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Öppnas (Start)</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] dark:text-white font-bold"
                                                value={exam.startTime}
                                                onChange={e => setExam({ ...exam, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Stängs (Slut)</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] dark:text-white font-bold"
                                                value={exam.endTime}
                                                onChange={e => setExam({ ...exam, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2"><Bell className="text-indigo-500" size={20} /> Notifiera studenter</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'notifyInternal', label: 'Internt Inbox', icon: MessageSquare, color: 'indigo' },
                                            { id: 'notifyPush', label: 'Push (PWA)', icon: Smartphone, color: 'purple' },
                                            { id: 'notifyEmail', label: 'E-post', icon: Mail, color: 'blue' },
                                            { id: 'notifySms', label: 'SMS', icon: Smartphone, color: 'green' }
                                        ].map(channel => {
                                            const Icon = channel.icon;
                                            const active = exam[channel.id];
                                            return (
                                                <button
                                                    key={channel.id}
                                                    onClick={() => setExam({ ...exam, [channel.id]: !active })}
                                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${active
                                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                                        : 'border-transparent bg-gray-50 dark:bg-[#131314] text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    <Icon size={32} />
                                                    <span className="font-black text-xs uppercase text-center">{channel.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-center text-xs text-gray-400 font-medium">Systemet filtrerar bort kanaler som studenten har valt bort i sin profil.</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer / Controls */}
                <div className="p-8 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                    <div>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all uppercase tracking-widest text-xs"
                            >
                                <ChevronLeft size={20} /> Tillbaka
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-2xl font-black text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3c4043] transition-all uppercase tracking-widest text-xs"
                        >
                            Avbryt
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-4 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-105 transition-all uppercase tracking-widest text-sm"
                            >
                                Nästa Steg <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-4 px-12 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-200 dark:shadow-none hover:bg-green-700 hover:scale-105 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                            >
                                {isLoading ? 'Bokar...' : <><Save size={20} /> SLUTFÖR & BOKA</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TentaManager;
