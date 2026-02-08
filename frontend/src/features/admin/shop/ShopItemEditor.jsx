import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, X, Upload, Save, Lock, GripVertical } from 'lucide-react';
import { api } from '../../../services/api';
import { getGamificationAssetPath } from '../../../utils/gamificationUtils';

const ShopItemEditor = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: 0,
        type: 'FRAME',
        rarity: 'COMMON',
        isLimited: false,
        imageUrl: '',
        unlockCriteria: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [criteriaType, setCriteriaType] = useState('NONE'); // NONE, COURSE_COMPLETION, QUIZ_SCORE
    const [criteriaData, setCriteriaData] = useState({}); // { referenceId, threshold }
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                cost: item.cost || 0,
                type: item.type || 'FRAME',
                rarity: item.rarity || 'COMMON',
                isLimited: item.isLimited || false,
                imageUrl: item.imageUrl || '',
                unlockCriteria: item.unlockCriteria || ''
            });
            setImagePreview(getGamificationAssetPath(item.imageUrl, item.type));

            if (item.unlockCriteria) {
                try {
                    const criteria = JSON.parse(item.unlockCriteria);
                    setCriteriaType(criteria.type);
                    setCriteriaData({
                        referenceId: criteria.referenceId,
                        threshold: criteria.threshold
                    });
                } catch (e) {
                    console.error("Failed to parse unlock criteria", e);
                }
            }
        }

        // Fetch courses and quizzes for dropdowns
        const fetchData = async () => {
            try {
                const [coursesRes, quizzesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/quizzes')
                ]);
                setCourses(coursesRes || []);
                setQuizzes(quizzesRes || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchData();
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCriteriaChange = (type, key, value) => {
        if (type === 'type') {
            setCriteriaType(value);
            setCriteriaData({}); // Reset data on type change
        } else {
            setCriteriaData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = formData.imageUrl;

            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);
                const uploadRes = await api.post('/admin/shop/upload', uploadData);
                finalImageUrl = uploadRes;
            }

            let finalCriteria = null;
            if (criteriaType !== 'NONE') {
                finalCriteria = JSON.stringify({
                    type: criteriaType,
                    ...criteriaData
                });
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
                unlockCriteria: finalCriteria,
                cost: parseInt(formData.cost),
                // Ensure ID is passed if updating
                ...(item && { id: item.id })
            };

            await onSave(payload);
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save item: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {item ? 'Edit Shop Item' : 'Create New Item'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="FRAME">Frame</option>
                                <option value="BACKGROUND">Background</option>
                                <option value="BADGE">Badge</option>
                                <option value="TITLE">Title</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost (XP)</label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rarity</label>
                            <select
                                name="rarity"
                                value={formData.rarity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="COMMON">Common</option>
                                <option value="RARE">Rare</option>
                                <option value="EPIC">Epic</option>
                                <option value="LEGENDARY">Legendary</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isLimited"
                                    checked={formData.isLimited}
                                    onChange={handleChange}
                                    className="rounded text-indigo-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Limited Edition</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Image</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400 text-xs text-center">No Image</div>
                                )}
                            </div>
                            <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center font-medium">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Recommended: PNG with transparency, 512x512px.</p>
                    </div>

                    {/* Unlock Criteria */}
                    <div className="border-t pt-4 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Unlock Requirements
                        </label>
                        <select
                            value={criteriaType}
                            onChange={(e) => handleCriteriaChange('type', null, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-3"
                        >
                            <option value="NONE">None (Available for purchase)</option>
                            <option value="COURSE_COMPLETION">Complete a Course</option>
                            <option value="QUIZ_SCORE">Achieve Quiz Score</option>
                        </select>

                        {criteriaType === 'COURSE_COMPLETION' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Select Course</label>
                                <select
                                    value={criteriaData.referenceId || ''}
                                    onChange={(e) => handleCriteriaChange('data', 'referenceId', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="">-- Select Course --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {criteriaType === 'QUIZ_SCORE' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Quiz</label>
                                    <select
                                        value={criteriaData.referenceId || ''}
                                        onChange={(e) => handleCriteriaChange('data', 'referenceId', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    >
                                        <option value="">-- Select Quiz --</option>
                                        {quizzes.map(q => (
                                            <option key={q.id} value={q.id}>{q.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Min Score</label>
                                    <input
                                        type="number"
                                        value={criteriaData.threshold || ''}
                                        onChange={(e) => handleCriteriaChange('data', 'threshold', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopItemEditor;
