import React, { useState, useEffect, useRef } from 'react';
import {
    X, FileQuestion, ClipboardList, BookOpen, ChevronRight,
    ChevronLeft, Loader2, Send, Tag, Plus, Check, Upload, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import { api } from '../../../services/api';
import SubjectIcon from './SubjectIcon';

const DIFFICULTY_LEVELS = [
    { value: 'BEGINNER', label: 'Nybörjare' },
    { value: 'INTERMEDIATE', label: 'Medel' },
    { value: 'ADVANCED', label: 'Avancerad' }
];

const GRADE_LEVELS = [
    { value: 'F-3', label: 'F-3' },
    { value: '4-6', label: '4-6' },
    { value: '7-9', label: '7-9' },
    { value: 'GY', label: 'Gymnasiet' },
    { value: 'VUX', label: 'Vuxenutbildning' }
];

// Fallback subjects in case API fails
const FALLBACK_SUBJECTS = [
    { name: 'MATEMATIK', displayName: 'Matematik', iconName: 'calculator', color: '#8B5CF6' },
    { name: 'SVENSKA', displayName: 'Svenska', iconName: 'book-open', color: '#EC4899' },
    { name: 'ENGELSKA', displayName: 'Engelska', iconName: 'globe', color: '#3B82F6' },
    { name: 'FYSIK', displayName: 'Fysik', iconName: 'atom', color: '#F59E0B' },
    { name: 'KEMI', displayName: 'Kemi', iconName: 'flask-conical', color: '#10B981' },
    { name: 'BIOLOGI', displayName: 'Biologi', iconName: 'leaf', color: '#22C55E' },
    { name: 'HISTORIA', displayName: 'Historia', iconName: 'landmark', color: '#A855F7' },
    { name: 'SAMHALLSKUNSKAP', displayName: 'Samhällskunskap', iconName: 'users', color: '#6366F1' },
    { name: 'GEOGRAFI', displayName: 'Geografi', iconName: 'map', color: '#14B8A6' },
    { name: 'RELIGIONSKUNSKAP', displayName: 'Religionskunskap', iconName: 'heart', color: '#F43F5E' },
    { name: 'TEKNIK', displayName: 'Teknik', iconName: 'cog', color: '#64748B' },
    { name: 'PROGRAMMERING', displayName: 'Programmering', iconName: 'code', color: '#0EA5E9' },
    { name: 'IDROTT', displayName: 'Idrott & Hälsa', iconName: 'activity', color: '#EF4444' },
    { name: 'MUSIK', displayName: 'Musik', iconName: 'music', color: '#D946EF' },
    { name: 'BILD', displayName: 'Bild', iconName: 'palette', color: '#F97316' },
    { name: 'SLOJD', displayName: 'Slöjd', iconName: 'hammer', color: '#78716C' },
    { name: 'HEM_KONSUMENTKUNSKAP', displayName: 'Hem- & konsumentkunskap', iconName: 'utensils', color: '#84CC16' },
    { name: 'MODERSMAL', displayName: 'Modersmål', iconName: 'message-circle', color: '#06B6D4' },
    { name: 'SPRAK_ANNAT', displayName: 'Annat Språk', iconName: 'languages', color: '#8B5CF6' },
    { name: 'OVRIGT', displayName: 'Övrigt', iconName: 'folder', color: '#94A3B8' }
];

// Parse CSV content into quiz questions
const parseCSV = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { questions: [], error: 'CSV måste ha minst en rubrikrad och en fråga' };

    const questions = [];
    const header = lines[0].toLowerCase();

    // Detect CSV format
    // Format 1: question,correct_answer,wrong1,wrong2,wrong3
    // Format 2: question,option1,option2,option3,option4,correct_index
    // Format 3: question;correct_answer;wrong1;wrong2;wrong3 (semicolon)

    const delimiter = header.includes(';') ? ';' : ',';

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted values with commas inside
        const values = parseCSVLine(line, delimiter);

        if (values.length < 2) continue;

        const questionText = values[0]?.trim();
        if (!questionText) continue;

        // Try to parse as format with correct_index at end
        const lastValue = values[values.length - 1]?.trim();
        const correctIndex = parseInt(lastValue);

        let options = [];
        let correctAnswer = 0;

        if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < values.length - 2) {
            // Format: question, opt1, opt2, opt3, opt4, correct_index
            options = values.slice(1, -1).map(v => v.trim()).filter(v => v);
            correctAnswer = correctIndex;
        } else {
            // Format: question, correct_answer, wrong1, wrong2, wrong3
            // First answer after question is correct
            options = values.slice(1).map(v => v.trim()).filter(v => v);
            correctAnswer = 0;
            // Shuffle options but track correct answer
            const correctText = options[0];
            options = shuffleArray([...options]);
            correctAnswer = options.indexOf(correctText);
        }

        if (options.length >= 2) {
            questions.push({
                text: questionText,
                options: options.map((text, idx) => ({
                    text,
                    isCorrect: idx === correctAnswer
                })),
                type: 'MULTIPLE_CHOICE'
            });
        }
    }

    if (questions.length === 0) {
        return { questions: [], error: 'Kunde inte tolka några frågor från CSV-filen. Kontrollera formatet.' };
    }

    return { questions, error: null };
};

// Parse a single CSV line handling quoted values
const parseCSVLine = (line, delimiter = ',') => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);

    return values.map(v => v.replace(/^"|"$/g, '').trim());
};

// Fisher-Yates shuffle
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const PublishModal = ({ onClose, onPublished, userId }) => {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState(null); // 'csv' or 'existing'
    const [contentType, setContentType] = useState('QUIZ'); // 'QUIZ', 'LESSON', 'ASSIGNMENT'
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);

    // CSV upload state (only for quizzes)
    const [csvFile, setCsvFile] = useState(null);
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [csvError, setCsvError] = useState(null);
    const [quizTitle, setQuizTitle] = useState('');
    const fileInputRef = useRef(null);

    // Existing content state
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Metadata form
    const [formData, setFormData] = useState({
        subject: '',
        difficulty: 'INTERMEDIATE',
        gradeLevel: '7-9',
        description: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (mode === 'existing') {
            loadExistingContent();
        }
    }, [mode, contentType]);

    const loadSubjects = async () => {
        try {
            const data = await api.community.getSubjects();
            // Use fallback if API returns empty or invalid data
            if (Array.isArray(data) && data.length > 0) {
                setSubjects(data);
            } else {
                console.warn('API returned empty subjects, using fallback');
                setSubjects(FALLBACK_SUBJECTS);
            }
        } catch (err) {
            console.error('Failed to load subjects, using fallback:', err);
            setSubjects(FALLBACK_SUBJECTS);
        }
    };

    const loadExistingContent = async () => {
        setLoading(true);
        try {
            let data;
            if (contentType === 'QUIZ') {
                data = await api.quiz.getMy(userId);
            } else if (contentType === 'LESSON') {
                data = await api.lessons.getMy(userId);
            } else if (contentType === 'ASSIGNMENT') {
                data = await api.assignments.getMy(userId);
            }
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(`Failed to load ${contentType.toLowerCase()}s:`, err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        setCsvError(null);
        setParsedQuestions([]);

        try {
            const content = await file.text();
            const { questions, error } = parseCSV(content);

            if (error) {
                setCsvError(error);
            } else {
                setParsedQuestions(questions);
                // Auto-generate title from filename
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                if (!quizTitle) {
                    setQuizTitle(nameWithoutExt.replace(/[-_]/g, ' '));
                }
            }
        } catch (err) {
            setCsvError('Kunde inte läsa filen: ' + err.message);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        if (item.description) {
            setFormData(prev => ({ ...prev, description: item.description }));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase().replace(/[^a-zåäö0-9]/g, '');
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    const handlePublish = async () => {
        if (!formData.subject) return;

        setPublishing(true);
        try {
            const publishData = {
                subject: formData.subject,
                difficulty: formData.difficulty,
                gradeLevel: formData.gradeLevel,
                publicDescription: formData.description,
                tags: formData.tags
            };

            let result;

            if (mode === 'csv') {
                // CSV upload only works for quizzes
                const quizData = {
                    title: quizTitle,
                    description: formData.description,
                    questions: parsedQuestions,
                    timeLimit: null,
                    passingScore: 70
                };

                const createdQuiz = await api.quiz.createGlobal(userId, quizData);
                result = await api.community.publishQuiz(createdQuiz.id, publishData);
            } else {
                // Publish existing content based on type
                if (contentType === 'QUIZ') {
                    result = await api.community.publishQuiz(selectedItem.id, publishData);
                } else if (contentType === 'LESSON') {
                    result = await api.community.publishLesson(selectedItem.id, publishData);
                } else if (contentType === 'ASSIGNMENT') {
                    result = await api.community.publishAssignment(selectedItem.id, publishData);
                }
            }

            onPublished?.(result);
            onClose();
        } catch (err) {
            console.error('Failed to publish:', err);
            alert('Kunde inte publicera: ' + err.message);
        } finally {
            setPublishing(false);
        }
    };

    const canProceedToStep2 = mode === 'csv'
        ? (parsedQuestions.length > 0 && quizTitle.trim().length >= 3 && formData.subject)
        : (selectedItem !== null);

    const canPublish = formData.subject && formData.description.trim().length >= 10 &&
        (mode === 'csv' ? (parsedQuestions.length > 0 && quizTitle.trim()) : selectedItem);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-[#3c4043]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Dela i Community
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Steg {step} av 2: {step === 1 ? 'Välj innehåll' : 'Metadata & publicering'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg transition-colors"
                        >
                            <X className="text-gray-500" size={20} />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-1 bg-gray-100 dark:bg-[#282a2c] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {step === 1 ? (
                        <Step1
                            mode={mode}
                            setMode={setMode}
                            contentType={contentType}
                            setContentType={setContentType}
                            // CSV props
                            csvFile={csvFile}
                            parsedQuestions={parsedQuestions}
                            csvError={csvError}
                            quizTitle={quizTitle}
                            setQuizTitle={setQuizTitle}
                            fileInputRef={fileInputRef}
                            handleFileChange={handleFileChange}
                            subjects={subjects}
                            formData={formData}
                            setFormData={setFormData}
                            // Existing props
                            items={items}
                            selectedItem={selectedItem}
                            onSelectItem={handleSelectItem}
                            loading={loading}
                        />
                    ) : (
                        <Step2
                            mode={mode}
                            quizTitle={quizTitle}
                            questionCount={mode === 'csv' ? parsedQuestions.length : (selectedItem?.questions?.length || 0)}
                            subjects={subjects}
                            formData={formData}
                            setFormData={setFormData}
                            tagInput={tagInput}
                            setTagInput={setTagInput}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-[#3c4043] flex justify-between">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} />
                            Tillbaka
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            disabled={!canProceedToStep2}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Nästa
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={!canPublish || publishing}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {publishing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Skickar...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Skicka för granskning
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Step 1: Choose source (CSV or existing)
const Step1 = ({
    mode, setMode, contentType, setContentType,
    csvFile, parsedQuestions, csvError, quizTitle, setQuizTitle, fileInputRef, handleFileChange,
    subjects, formData, setFormData,
    items, selectedItem, onSelectItem, loading
}) => {
    return (
        <div className="space-y-6">
            {/* Content Type Selection (only for existing mode) */}
            {mode === 'existing' && (
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                        Vad vill du dela?
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setContentType('QUIZ')}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${contentType === 'QUIZ'
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                                }`}
                        >
                            <FileQuestion size={20} className={`mx-auto ${contentType === 'QUIZ' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <p className={`mt-1 text-sm font-medium ${contentType === 'QUIZ' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                Quiz
                            </p>
                        </button>
                        <button
                            onClick={() => setContentType('LESSON')}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${contentType === 'LESSON'
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                                }`}
                        >
                            <BookOpen size={20} className={`mx-auto ${contentType === 'LESSON' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <p className={`mt-1 text-sm font-medium ${contentType === 'LESSON' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                Lektion
                            </p>
                        </button>
                        <button
                            onClick={() => setContentType('ASSIGNMENT')}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${contentType === 'ASSIGNMENT'
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                                }`}
                        >
                            <ClipboardList size={20} className={`mx-auto ${contentType === 'ASSIGNMENT' ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <p className={`mt-1 text-sm font-medium ${contentType === 'ASSIGNMENT' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                Uppgift
                            </p>
                        </button>
                    </div>
                </div>
            )}

            {/* Mode Selection */}
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Hur vill du dela?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setMode('csv')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${mode === 'csv'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                            }`}
                    >
                        <Upload size={24} className={mode === 'csv' ? 'text-indigo-600' : 'text-gray-400'} />
                        <p className={`mt-2 font-medium ${mode === 'csv' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            Ladda upp CSV
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Importera frågor från fil
                        </p>
                    </button>

                    <button
                        onClick={() => setMode('existing')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${mode === 'existing'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                            }`}
                    >
                        <FileQuestion size={24} className={mode === 'existing' ? 'text-indigo-600' : 'text-gray-400'} />
                        <p className={`mt-2 font-medium ${mode === 'existing' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            Välj befintlig resurs
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Från Resursbanken
                        </p>
                    </button>
                </div>
            </div>

            {/* CSV Upload Mode */}
            {mode === 'csv' && (
                <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                        <label className="block font-medium text-gray-900 dark:text-white mb-2">
                            CSV-fil med frågor *
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-[#3c4043] rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                        >
                            {csvFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileSpreadsheet className="text-indigo-600" size={24} />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900 dark:text-white">{csvFile.name}</p>
                                        <p className="text-sm text-green-600">
                                            {parsedQuestions.length} frågor identifierade
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Klicka för att välja CSV-fil
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Format: fråga, rätt svar, fel1, fel2, fel3
                                    </p>
                                </div>
                            )}
                        </button>

                        {csvError && (
                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
                                <p className="text-sm text-red-700 dark:text-red-300">{csvError}</p>
                            </div>
                        )}
                    </div>

                    {/* Quiz Title */}
                    {parsedQuestions.length > 0 && (
                        <>
                            <div>
                                <label className="block font-medium text-gray-900 dark:text-white mb-2">
                                    Quiz-titel *
                                </label>
                                <input
                                    type="text"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    placeholder="T.ex. Algebra Grundkurs"
                                    className="w-full px-4 py-3 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg"
                                />
                            </div>

                            {/* Subject Selection */}
                            <div>
                                <label className="block font-medium text-gray-900 dark:text-white mb-2">
                                    Ämne *
                                </label>
                                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                    {subjects.map((subject) => (
                                        <button
                                            key={subject.name}
                                            onClick={() => setFormData(prev => ({ ...prev, subject: subject.name }))}
                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${formData.subject === subject.name
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                                                }`}
                                        >
                                            <SubjectIcon iconName={subject.iconName} color={subject.color} size={16} />
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                                {subject.displayName}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-gray-50 dark:bg-[#282a2c] rounded-xl p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Förhandsgranskning</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {parsedQuestions.slice(0, 5).map((q, idx) => (
                                        <div key={idx} className="text-sm">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <span className="font-medium text-indigo-600">#{idx + 1}</span> {q.text}
                                            </p>
                                            <p className="text-xs text-gray-500 ml-4">
                                                {q.options.length} svarsalternativ
                                            </p>
                                        </div>
                                    ))}
                                    {parsedQuestions.length > 5 && (
                                        <p className="text-xs text-gray-400 italic">
                                            ...och {parsedQuestions.length - 5} fler frågor
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* CSV Format Help */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">CSV-format</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            Varje rad ska innehålla: fråga, rätt svar, fel svar 1, fel svar 2, fel svar 3
                        </p>
                        <code className="block text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded font-mono text-blue-800 dark:text-blue-200">
                            Vad är 2+2?,4,3,5,6<br />
                            Huvudstad i Sverige?,Stockholm,Göteborg,Malmö,Uppsala
                        </code>
                    </div>
                </div>
            )}

            {/* Existing Content Mode */}
            {mode === 'existing' && (
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                        Välj {contentType === 'QUIZ' ? 'quiz' : contentType === 'LESSON' ? 'lektion' : 'uppgift'} att dela
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {contentType === 'QUIZ' ? <FileQuestion className="mx-auto mb-2 text-gray-300" size={48} /> :
                                contentType === 'LESSON' ? <BookOpen className="mx-auto mb-2 text-gray-300" size={48} /> :
                                    <ClipboardList className="mx-auto mb-2 text-gray-300" size={48} />}
                            <p>Du har inga {contentType === 'QUIZ' ? 'quiz' : contentType === 'LESSON' ? 'lektioner' : 'uppgifter'} att dela.</p>
                            <p className="text-sm mt-1">Skapa först i Resursbanken.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectItem(item)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedItem?.id === item.id
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {contentType === 'QUIZ' && `${item.questions?.length || 0} frågor`}
                                                {contentType === 'LESSON' && 'Lektion'}
                                                {contentType === 'ASSIGNMENT' && 'Uppgift'}
                                                {item.description && ` • ${item.description.substring(0, 50)}...`}
                                            </p>
                                        </div>
                                        {selectedItem?.id === item.id && (
                                            <Check className="text-indigo-600" size={20} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Step 2: Metadata
const Step2 = ({
    mode, quizTitle, questionCount,
    subjects, formData, setFormData,
    tagInput, setTagInput, onAddTag, onRemoveTag
}) => {
    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center">
                    <FileQuestion className="text-indigo-600 dark:text-indigo-300" size={24} />
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">{quizTitle}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">
                        {questionCount} frågor • {mode === 'csv' ? 'Från CSV' : 'Befintligt quiz'}
                    </p>
                </div>
            </div>

            {/* Subject (only show if not already selected in step 1 for CSV) */}
            {mode === 'existing' && (
                <div>
                    <label className="block font-medium text-gray-900 dark:text-white mb-2">
                        Ämne *
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                        {subjects.map((subject) => (
                            <button
                                key={subject.name}
                                onClick={() => setFormData(prev => ({ ...prev, subject: subject.name }))}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${formData.subject === subject.name
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-200 dark:border-[#3c4043] hover:border-gray-300'
                                    }`}
                            >
                                <SubjectIcon iconName={subject.iconName} color={subject.color} size={16} />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {subject.displayName}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Difficulty & Grade Level */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium text-gray-900 dark:text-white mb-2">
                        Svårighetsgrad
                    </label>
                    <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg"
                    >
                        {DIFFICULTY_LEVELS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium text-gray-900 dark:text-white mb-2">
                        Årskurs
                    </label>
                    <select
                        value={formData.gradeLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg"
                    >
                        {GRADE_LEVELS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block font-medium text-gray-900 dark:text-white mb-2">
                    Taggar (max 5)
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-[#282a2c] rounded-full text-sm"
                        >
                            <Tag size={12} className="text-gray-400" />
                            {tag}
                            <button
                                onClick={() => onRemoveTag(tag)}
                                className="ml-1 text-gray-400 hover:text-red-500"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                {formData.tags.length < 5 && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
                            placeholder="Lägg till tagg..."
                            className="flex-1 px-3 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm"
                        />
                        <button
                            onClick={onAddTag}
                            className="px-3 py-2 bg-gray-100 dark:bg-[#3c4043] hover:bg-gray-200 dark:hover:bg-[#5f6368] rounded-lg transition-colors"
                        >
                            <Plus size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block font-medium text-gray-900 dark:text-white mb-2">
                    Beskrivning för Community *
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beskriv vad andra lärare får med detta quiz. Vad testar det? Vilka lärandemål uppfylls?"
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Minst 10 tecken ({formData.description.length}/10)
                </p>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Observera:</strong> Ditt quiz granskas av en administratör innan det publiceras i Community.
                    Du får en notifikation när det godkänts eller avvisats.
                </p>
            </div>
        </div>
    );
};

export default PublishModal;
