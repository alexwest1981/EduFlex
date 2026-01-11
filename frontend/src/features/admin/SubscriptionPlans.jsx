import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Check, X, Users, Package, HardDrive, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        price: 0,
        currency: 'SEK',
        billingInterval: 'MONTHLY',
        trialPeriodDays: 0,
        maxUsers: -1,
        maxCourses: -1,
        maxStorage: -1,
        features: [],
        active: true,
        isDefault: false,
        sortOrder: 0
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const data = await api.get('/subscription-plans');
            setPlans(data);
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await api.put(`/subscription-plans/${editingPlan.id}`, formData);
            } else {
                await api.post('/subscription-plans', formData);
            }
            fetchPlans();
            closeModal();
        } catch (error) {
            console.error('Failed to save plan:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await api.delete(`/subscription-plans/${id}`);
            fetchPlans();
        } catch (error) {
            console.error('Failed to delete plan:', error);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await api.patch(`/subscription-plans/${id}/toggle-status`);
            fetchPlans();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData(plan);
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                displayName: '',
                description: '',
                price: 0,
                currency: 'SEK',
                billingInterval: 'MONTHLY',
                trialPeriodDays: 0,
                maxUsers: -1,
                maxCourses: -1,
                maxStorage: -1,
                features: [],
                active: true,
                isDefault: false,
                sortOrder: plans.length
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlan(null);
    };

    const handleFeatureAdd = () => {
        const newFeature = prompt('Enter feature name:');
        if (newFeature) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature]
            }));
        }
    };

    const handleFeatureRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading subscription plans...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <DollarSign className="text-indigo-600" />
                        Subscription Plans
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage pricing tiers and subscription options
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                >
                    <Plus size={20} />
                    Create Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white dark:bg-[#1E1F20] rounded-2xl border-2 p-6 ${plan.isDefault
                            ? 'border-indigo-600'
                            : 'border-gray-200 dark:border-[#3c4043]'
                            } relative`}
                    >
                        {plan.isDefault && (
                            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                                DEFAULT
                            </div>
                        )}
                        {!plan.active && (
                            <div className="absolute top-4 right-4 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">
                                INACTIVE
                            </div>
                        )}

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {plan.displayName}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black text-indigo-600">
                                {plan.price.toFixed(0)}
                            </span>
                            <span className="text-gray-500">
                                {plan.currency}/{plan.billingInterval.toLowerCase()}
                            </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                            {plan.description}
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Users size={16} />
                                <span>{plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} Users</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Package size={16} />
                                <span>{plan.maxCourses === -1 ? 'Unlimited' : plan.maxCourses} Courses</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <HardDrive size={16} />
                                <span>{plan.maxStorage === -1 ? 'Unlimited' : `${plan.maxStorage} GB`} Storage</span>
                            </div>
                        </div>

                        {plan.features && plan.features.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-[#3c4043] pt-4 mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Features</p>
                                <ul className="space-y-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Check size={14} className="text-green-600" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => openModal(plan)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#282a2c] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3c4043] transition-colors text-sm font-bold"
                            >
                                <Edit size={16} />
                                Edit
                            </button>
                            <button
                                onClick={() => toggleStatus(plan.id)}
                                className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-bold ${plan.active
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                            >
                                {plan.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => handleDelete(plan.id)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-[#3c4043]">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Plan Name (Internal)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Price
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                    >
                                        <option value="SEK">SEK</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Trial Period (Days)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        value={formData.trialPeriodDays}
                                        onChange={(e) => setFormData({ ...formData, trialPeriodDays: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Billing Interval
                                </label>
                                <select
                                    value={formData.billingInterval}
                                    onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                >
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                    <option value="LIFETIME">Lifetime</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Max Users (-1 = unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxUsers}
                                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Max Courses (-1 = unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxCourses}
                                        onChange={(e) => setFormData({ ...formData, maxCourses: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Storage GB (-1 = unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxStorage}
                                        onChange={(e) => setFormData({ ...formData, maxStorage: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Features
                                </label>
                                <div className="space-y-2">
                                    {formData.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => {
                                                    const newFeatures = [...formData.features];
                                                    newFeatures[idx] = e.target.value;
                                                    setFormData({ ...formData, features: newFeatures });
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleFeatureRemove(idx)}
                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleFeatureAdd}
                                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-[#3c4043] rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                                    >
                                        + Add Feature
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Active</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Default Plan</label>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                                >
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlans;
