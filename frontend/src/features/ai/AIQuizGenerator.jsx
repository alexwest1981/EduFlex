import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  ArrowLeft,
  BookOpen
} from 'lucide-react';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Enkel', description: 'Grundläggande förståelse' },
  { value: 'MEDIUM', label: 'Medel', description: 'Blandad svårighetsgrad' },
  { value: 'HARD', label: 'Svår', description: 'Kräver djupare analys' }
];

export default function AIQuizGenerator() {
  const { currentUser: user } = useAppContext();
  const navigate = useNavigate();

  // State
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null); // Full status object: { available, moduleEnabled, apiConfigured, message }
  const [isSaving, setIsSaving] = useState(false);
  const [addToBank, setAddToBank] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Check AI availability on mount
  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await api.get('/ai/quiz/status');
      setAiStatus(response);
    } catch (err) {
      setAiStatus({ available: false, moduleEnabled: false, apiConfigured: false, message: 'Kunde inte kontrollera AI-status' });
    }
  };

  // File drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/rtf'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|docx|doc|txt|rtf|odt)$/i)) {
      setError('Ogiltigt filformat. Ladda upp PDF, DOCX, DOC, TXT, RTF eller ODT.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Filen är för stor. Max 10 MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Auto-generate title from filename
    if (!title) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(`Quiz: ${baseName}`);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      let response;

      if (inputMode === 'file' && file) {
        // Use fetch directly for multipart/form-data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('questionCount', questionCount);
        formData.append('difficulty', difficulty);
        formData.append('language', 'sv');
        formData.append('title', title || 'AI-genererat Quiz');

        const token = localStorage.getItem('token');
        const fetchResponse = await fetch('/api/ai/quiz/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json().catch(() => ({}));
          throw new Error(errorData.errorMessage || `HTTP ${fetchResponse.status}`);
        }
        response = await fetchResponse.json();
      } else if (inputMode === 'text' && textInput.trim()) {
        // Use api.post for JSON body (remove /api prefix since api.js adds it)
        response = await api.post('/ai/quiz/generate-from-text', {
          text: textInput,
          questionCount,
          difficulty,
          language: 'sv',
          title: title || 'AI-genererat Quiz'
        });
      } else {
        setError('Välj en fil eller skriv in text att generera quiz från.');
        setIsGenerating(false);
        return;
      }

      if (response.success) {
        setGeneratedQuiz(response);
      } else {
        setError(response.errorMessage || 'Kunde inte generera quiz.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Ett fel uppstod vid quiz-generering.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuiz) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await api.post('/ai/quiz/save', {
        userId: user.id,
        addToQuestionBank: addToBank,
        generatedQuiz: {
          title: generatedQuiz.title,
          questions: generatedQuiz.questions
        }
      });

      if (response.success) {
        navigate(`/course/${response.quizId}`); // Navigate to course or quiz view
      } else {
        setError(response.error || 'Kunde inte spara quizet.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Kunde inte spara quizet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuestionEdit = (index, field, value) => {
    const updated = { ...generatedQuiz };
    updated.questions = [...updated.questions];
    updated.questions[index] = { ...updated.questions[index], [field]: value };
    setGeneratedQuiz(updated);
  };

  const handleOptionEdit = (qIndex, oIndex, value) => {
    const updated = { ...generatedQuiz };
    updated.questions = [...updated.questions];
    updated.questions[qIndex] = { ...updated.questions[qIndex] };
    updated.questions[qIndex].options = [...updated.questions[qIndex].options];
    updated.questions[qIndex].options[oIndex] = value;
    setGeneratedQuiz(updated);
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const updated = { ...generatedQuiz };
    updated.questions = [...updated.questions];
    updated.questions[qIndex] = { ...updated.questions[qIndex], correctIndex: oIndex };
    setGeneratedQuiz(updated);
  };

  const removeQuestion = (index) => {
    const updated = { ...generatedQuiz };
    updated.questions = updated.questions.filter((_, i) => i !== index);
    setGeneratedQuiz(updated);
  };

  // Render not available state
  if (aiStatus && !aiStatus.available) {
    const isModuleDisabled = !aiStatus.moduleEnabled;
    const isApiNotConfigured = !aiStatus.apiConfigured;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className={`border rounded-xl p-6 ${isModuleDisabled
          ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-start gap-4">
            <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isModuleDisabled
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-yellow-600 dark:text-yellow-400'
            }`} />
            <div>
              <h3 className={`font-semibold ${isModuleDisabled
                ? 'text-gray-700 dark:text-gray-200'
                : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {isModuleDisabled
                  ? 'AI Quiz-modulen är inte aktiverad'
                  : 'AI Quiz-generering är inte tillgänglig'}
              </h3>
              <p className={`mt-1 ${isModuleDisabled
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {isModuleDisabled
                  ? 'Kontakta administratören för att aktivera AI Quiz-modulen under System → Moduler.'
                  : isApiNotConfigured
                    ? 'Kontakta administratören för att konfigurera Gemini API-nyckel.'
                    : aiStatus.message || 'Ett okänt fel uppstod.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (aiStatus === null) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Render preview/edit mode
  if (generatedQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setGeneratedQuiz(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Tillbaka
          </button>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={addToBank}
                onChange={(e) => setAddToBank(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Lägg till i Frågebanken
            </label>
            <button
              onClick={handleSave}
              disabled={isSaving || generatedQuiz.questions.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Spara Quiz
            </button>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Förhandsgranskning
            </h1>
          </div>

          <input
            type="text"
            value={generatedQuiz.title}
            onChange={(e) => setGeneratedQuiz({ ...generatedQuiz, title: e.target.value })}
            className="w-full text-lg font-semibold px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
          />

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {generatedQuiz.questions.length} frågor
            </span>
            {generatedQuiz.sourceDocumentName && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {generatedQuiz.sourceDocumentName}
              </span>
            )}
            <span>
              Genererat på {(generatedQuiz.processingTimeMs / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {generatedQuiz.questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => setEditingIndex(editingIndex === qIndex ? null : qIndex)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    {qIndex + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {question.text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuestion(qIndex);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {editingIndex === qIndex ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {editingIndex === qIndex && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                  {/* Question text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fråga
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionEdit(qIndex, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Svarsalternativ (klicka för att markera rätt svar)
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <button
                            onClick={() => handleCorrectAnswerChange(qIndex, oIndex)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${question.correctIndex === oIndex
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                              }`}
                          >
                            {question.correctIndex === oIndex && <Check className="w-4 h-4" />}
                          </button>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionEdit(qIndex, oIndex, e.target.value)}
                            className={`flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${question.correctIndex === oIndex
                                ? 'border-green-300 dark:border-green-700'
                                : 'border-gray-200 dark:border-gray-600'
                              }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Förklaring
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => handleQuestionEdit(qIndex, 'explanation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {generatedQuiz.questions.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Alla frågor har tagits bort. Gå tillbaka för att generera nya.
          </div>
        )}
      </div>
    );
  }

  // Render generation form
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Quiz-generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generera quiz-frågor automatiskt från PDF, Word eller text
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Input Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setInputMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${inputMode === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <Upload className="w-5 h-5" />
            Ladda upp fil
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${inputMode === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <Edit3 className="w-5 h-5" />
            Skriv text
          </button>
        </div>

        {/* File Upload */}
        {inputMode === 'file' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : file
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Dra och släpp en fil här, eller{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    klicka för att välja
                    <input
                      type="file"
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                      accept=".pdf,.docx,.doc,.txt,.rtf,.odt"
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PDF, DOCX, DOC, TXT, RTF eller ODT (max 10 MB)
                </p>
              </>
            )}
          </div>
        )}

        {/* Text Input */}
        {inputMode === 'text' && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Klistra in eller skriv texten som quiz-frågorna ska baseras på..."
            className="w-full h-48 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        )}
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Inställningar</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz-titel"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Antal frågor
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[3, 5, 7, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n} frågor
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Svårighetsgrad
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || (inputMode === 'file' && !file) || (inputMode === 'text' && !textInput.trim())}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Genererar quiz...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generera Quiz
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        AI:n analyserar innehållet och genererar relevanta flervalsfrågor.
        Du kan redigera och justera frågorna innan du sparar.
      </p>
    </div>
  );
}
