import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Check, X, Folder, AlertCircle, Upload, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuestionBankManager = ({ currentUser }) => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Filtering State
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // New Question Form State
    const [newItem, setNewItem] = useState({
        text: '',
        category: 'General',
        difficulty: 'MEDIUM',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    useEffect(() => {
        loadQuestions();
        loadCategories();
    }, [currentUser]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const data = await api.questionBank.getMy(currentUser.id);
            setQuestions(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const cats = await api.questionBank.getCategories(currentUser.id);
            setCategories(cats || []);
        } catch (error) { console.error(error); }
    };

    const handleAddOption = () => {
        setNewItem({ ...newItem, options: [...newItem.options, ''] });
    };

    const handleSave = async () => {
        if (!newItem.text || newItem.options.some(o => !o) || !newItem.correctAnswer) {
            alert(t('quiz.bank_fill_all'));
            return;
        }

        try {
            await api.questionBank.add(currentUser.id, {
                questionText: newItem.text,
                category: newItem.category,
                difficulty: newItem.difficulty,
                type: newItem.type,
                options: newItem.options,
                correctAnswer: newItem.correctAnswer
            });
            setShowForm(false);
            setNewItem({
                text: '',
                category: 'General',
                difficulty: 'MEDIUM',
                type: 'MULTIPLE_CHOICE',
                options: ['', '', '', ''],
                correctAnswer: ''
            });
            loadQuestions();
            loadCategories();
        } catch (e) {
            alert(t('quiz.bank_save_error'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('quiz.bank_delete_confirm'))) return;
        try {
            await api.questionBank.delete(id);
            loadQuestions();
            loadCategories();
        } catch (e) { console.error(e); }
    };

    // Filter Logic
    const filteredQuestions = selectedCategory
        ? questions.filter(q => q.category === selectedCategory)
        : questions;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Folder size={24} className="text-indigo-500" /> {t('quiz.my_bank')}
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> {t('quiz.new_question')}
                </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center bg-gray-50 dark:bg-[#131314] p-3 rounded-xl border border-dashed border-gray-200 dark:border-[#3c4043]">
                {/* FILTER DROPDOWN */}
                <select
                    className="p-2 rounded-lg border border-gray-300 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white text-sm font-bold min-w-[150px]"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                >
                    <option value="">{t('quiz.all_categories')}</option>
                    {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>

                <div className="h-6 w-px bg-gray-300 dark:bg-[#3c4043] mx-2"></div>

                {/* CSV IMPORT (Legacy Support) */}
                <input
                    type="file"
                    id="csvImport"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                            try {
                                const text = evt.target.result;
                                const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
                                if (lines.length <= 1) return;

                                const newItems = [];
                                for (let i = 1; i < lines.length; i++) {
                                    const cols = lines[i].split(';');
                                    if (cols.length < 4) continue;

                                    const category = cols[0].trim();
                                    const questionText = cols[1].trim();
                                    const difficulty = cols[2].trim().toUpperCase(); 

                                    const lastCol = cols[cols.length - 1].trim();
                                    const options = cols.slice(2, cols.length - 1).map(o => o.trim());

                                    const correctIndex = parseInt(lastCol) - 1;
                                    const correctAnswer = (correctIndex >= 0 && correctIndex < options.length) ? options[correctIndex] : options[0];

                                    if (questionText && options.length >= 2) {
                                        newItems.push({
                                            questionText,
                                            category,
                                            difficulty: 'MEDIUM',
                                            type: 'MULTIPLE_CHOICE',
                                            options,
                                            correctAnswer
                                        });
                                    }
                                }

                                if (newItems.length > 0) {
                                    await api.questionBank.import(currentUser.id, newItems);
                                    alert(t('quiz.imported_msg', { count: newItems.length }));
                                    loadQuestions();
                                    loadCategories();
                                }
                            } catch (err) {
                                console.error(err);
                                alert(t('quiz.import_error'));
                            }
                        };
                        reader.readAsText(file);
                        e.target.value = null;
                    }}
                />
                <button
                    onClick={() => document.getElementById('csvImport').click()}
                    className="bg-white hover:bg-gray-100 dark:bg-[#1E1F20] dark:hover:bg-[#3c4043] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-200 dark:border-[#3c4043]"
                >
                    <Upload size={14} /> {t('quiz.import_csv')}
                </button>
            </div>

            {
                showForm && (
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-md animate-in fade-in slide-in-from-top-4">
                        <h4 className="font-bold mb-4 dark:text-white">{t('quiz.create_bank_question')}</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('common.category')}</label>
                                <input
                                    type="text"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                    placeholder={t('quiz.category_placeholder')}
                                    list="categoryList"
                                />
                                <datalist id="categoryList">
                                    {categories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('quiz.difficulty')}</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                    value={newItem.difficulty}
                                    onChange={e => setNewItem({ ...newItem, difficulty: e.target.value })}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('quiz.question')}</label>
                            <textarea
                                value={newItem.text}
                                onChange={e => setNewItem({ ...newItem, text: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">{t('quiz.options_and_correct')}</label>
                            {newItem.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={newItem.correctAnswer === opt && opt !== ''}
                                        onChange={() => setNewItem({ ...newItem, correctAnswer: opt })}
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...newItem.options];
                                            newOpts[idx] = e.target.value;
                                            setNewItem({ ...newItem, options: newOpts });
                                        }}
                                        className="flex-1 p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                        placeholder={t('quiz.option_index', { index: idx + 1 })}
                                    />
                                    <button
                                        onClick={() => {
                                            const newOpts = newItem.options.filter((_, i) => i !== idx);
                                            setNewItem({ ...newItem, options: newOpts });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddOption} className="text-sm text-indigo-500 font-bold hover:underline">+ {t('quiz.add_option')}</button>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">{t('common.cancel')}</button>
                            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{t('quiz.save_to_bank')}</button>
                        </div>
                    </div>
                )
            }

            {
                loading ? (
                    <div className="text-center py-10 text-gray-500">{t('quiz.loading_bank')}</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-[#131314] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">{t('quiz.bank_empty')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                            <div key={q.id} className="bg-white dark:bg-[#1E1F20] p-4 rounded-lg border border-gray-200 dark:border-[#3c4043] flex justify-between items-start group hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="text-xs font-bold uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                            {q.category || t('quiz.uncategorized')}
                                        </span>
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${q.difficulty === 'HARD' ? 'bg-red-100 text-red-800' :
                                                q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {q.difficulty || 'MEDIUM'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{q.questionText}</h4>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {t('quiz.correct_answer')} <span className="text-green-600 font-medium">{q.correctAnswer || (q.options ? q.options[0] : 'Unknown')}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(q.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500 italic">{t('quiz.no_questions_category')}</div>
                        )}
                    </div>
                )
            }
        </div>
    );
};
