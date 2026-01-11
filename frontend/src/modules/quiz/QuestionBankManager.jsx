import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Filter } from 'lucide-react';
import { useAppData } from '../../hooks/useAppData';
import { api } from '../../services/api';

const QuestionBankManager = () => {
    const { user } = useAppData();
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemsFilter, setItemsFilter] = useState('ALL');

    // New Item State
    const [isCreating, setIsCreating] = useState(false);
    const [newItem, setNewItem] = useState({
        questionText: '',
        category: 'General',
        difficulty: 'MEDIUM',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    useEffect(() => {
        if (user) {
            loadQuestions();
            loadCategories();
        }
    }, [user]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await api.questionBank.getMy(user.id);
            setQuestions(data);
        } catch (error) {
            console.error("Failed to load questions", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await api.questionBank.getCategories(user.id);
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const handleSave = async () => {
        if (!newItem.questionText || !newItem.correctAnswer) return;

        try {
            await api.questionBank.add(user.id, newItem);
            setIsCreating(false);
            setNewItem({
                questionText: '',
                category: 'General',
                difficulty: 'MEDIUM',
                type: 'MULTIPLE_CHOICE',
                options: ['', '', '', ''],
                correctAnswer: ''
            });
            loadQuestions();
            loadCategories();
        } catch (error) {
            alert('Failed to save question');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.questionBank.delete(id);
            setQuestions(questions.filter(q => q.id !== id));
        } catch (e) {
            alert('Could not delete');
        }
    };

    const filteredQuestions = itemsFilter === 'ALL'
        ? questions
        : questions.filter(q => q.category === itemsFilter);

    if (loading) return <div>Loading bank...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-edu-black">Question Bank 🏦</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-edu-primary text-white px-4 py-2 rounded-lg hover:bg-edu-primary-dark"
                >
                    <Plus size={20} /> New Question
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    className={`px-3 py-1 rounded-full text-sm ${itemsFilter === 'ALL' ? 'bg-edu-black text-white' : 'bg-gray-100'}`}
                    onClick={() => setItemsFilter('ALL')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`px-3 py-1 rounded-full text-sm ${itemsFilter === cat ? 'bg-edu-black text-white' : 'bg-gray-100'}`}
                        onClick={() => setItemsFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200 animate-fade-in">
                    <h3 className="font-bold mb-4">Create Question</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                list="categories"
                            />
                            <datalist id="categories">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Difficulty</label>
                            <select
                                className="w-full p-2 border rounded"
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
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows={3}
                            value={newItem.questionText}
                            onChange={e => setNewItem({ ...newItem, questionText: e.target.value })}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Options (and Correct Answer)</label>
                        {newItem.options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    type="radio"
                                    name="correct"
                                    checked={newItem.correctAnswer === opt && opt !== ''}
                                    onChange={() => setNewItem({ ...newItem, correctAnswer: opt })}
                                    className="mt-3"
                                />
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={e => {
                                        const newOpts = [...newItem.options];
                                        newOpts[idx] = e.target.value;
                                        setNewItem({ ...newItem, options: newOpts });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-edu-primary text-white px-4 py-2 rounded-lg hover:bg-edu-primary-dark"
                        >
                            <Save size={18} /> Save to Bank
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {filteredQuestions.map(q => (
                    <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start group hover:shadow-md transition-all">
                        <div>
                            <div className="flex gap-2 mb-1">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">{q.category}</span>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${q.difficulty === 'HARD' ? 'bg-red-100 text-red-800' :
                                    q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>{q.difficulty}</span>
                            </div>
                            <p className="font-medium text-gray-900">{q.questionText}</p>
                            <p className="text-sm text-gray-500 mt-1">Answer: {q.correctAnswer}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(q.id)}
                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {filteredQuestions.length === 0 && !isCreating && (
                    <div className="text-center py-12 text-gray-400">
                        No questions found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionBankManager;
