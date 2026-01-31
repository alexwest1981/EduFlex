import React, { useState } from 'react';
import { Upload, FileText, Check, Loader, Book, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AICourseCreator = ({ isOpen, onClose, onCourseCreated }) => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai-course/generate-preview', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to generate preview');

            const data = await response.json();
            setPreviewData(data);
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error('Kunde inte generera kursförslag. Försök igen.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai-course/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(previewData)
            });

            if (!response.ok) throw new Error('Failed to create course');

            toast.success('Kurs skapad!');
            onCourseCreated?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Kunde inte skapa kursen.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Book className="text-indigo-600" />
                        AI Course Creator
                    </h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold">Ladda upp kursmaterial</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Ladda upp en PDF, Word-fil eller PowerPoint. AI:n analyserar innehållet och skapar en kursstruktur åt dig.
                            </p>

                            <label className="block w-full max-w-md mx-auto cursor-pointer">
                                <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.pptx,.txt" />
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold">
                                            <FileText />
                                            {file.name}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">Klicka för att välja fil</span>
                                    )}
                                </div>
                            </label>

                            <button
                                onClick={handleGenerate}
                                disabled={!file || loading}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? <div className="flex items-center gap-2"><Loader className="animate-spin" /> Analyserar...</div> : 'Generera Kursförslag'}
                            </button>
                        </div>
                    )}

                    {step === 2 && previewData && (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Kurstitel</label>
                                    <input
                                        type="text"
                                        value={previewData.title}
                                        onChange={e => setPreviewData({ ...previewData, title: e.target.value })}
                                        className="w-full bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 font-bold text-indigo-900 dark:text-indigo-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Beskrivning</label>
                                    <textarea
                                        value={previewData.description}
                                        onChange={e => setPreviewData({ ...previewData, description: e.target.value })}
                                        className="w-full bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-sm text-indigo-700 dark:text-indigo-300 h-20 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Startdatum</label>
                                        <input
                                            type="date"
                                            value={previewData.startDate || ''}
                                            onChange={e => setPreviewData({ ...previewData, startDate: e.target.value })}
                                            className="w-full bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-sm text-indigo-700 dark:text-indigo-300"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Slutdatum</label>
                                        <input
                                            type="date"
                                            value={previewData.endDate || ''}
                                            onChange={e => setPreviewData({ ...previewData, endDate: e.target.value })}
                                            className="w-full bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-sm text-indigo-700 dark:text-indigo-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {previewData.modules?.map((module, mIdx) => (
                                    <div key={mIdx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">{module.title}</h4>
                                        <ul className="space-y-2">
                                            {module.lessons?.map((lesson, lIdx) => (
                                                <li key={lIdx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                                    {lesson.isQuiz ? <AlertCircle size={16} className="mt-0.5 text-orange-500" /> : <Check size={16} className="mt-0.5 text-green-500" />}
                                                    <div>
                                                        <span className="font-medium block text-gray-900 dark:text-gray-300">{lesson.title}</span>
                                                        <span className="text-xs opacity-80 line-clamp-2">{lesson.content}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {step === 2 && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                        <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">Tillbaka</button>
                        <button onClick={handleCreate} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            {loading && <Loader className="animate-spin" size={18} />}
                            Skapa Kurs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AICourseCreator;
