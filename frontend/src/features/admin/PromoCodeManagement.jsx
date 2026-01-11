import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit, X } from 'lucide-react';
import { api } from '../../services/api';

const PromoCodeManagement = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        validFrom: '',
        validUntil: '',
        maxUses: -1,
        isActive: true
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const data = await api.get('/promocodes');
            setPromoCodes(data);
        } catch (error) {
            console.error('Failed to load promo codes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;
        try {
            await api.delete(`/promocodes/${id}`);
            fetchPromoCodes();
        } catch (error) {
            console.error('Failed to delete promo code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.validFrom) payload.validFrom = null;
            if (!payload.validUntil) payload.validUntil = null;

            if (editingCode) {
                await api.put(`/promocodes/${editingCode.id}`, payload);
            } else {
                await api.post('/promocodes', payload);
            }
            fetchPromoCodes();
            closeModal();
        } catch (error) {
            console.error('Failed to save promo code:', error);
        }
    };

    const openModal = (code = null) => {
        if (code) {
            setEditingCode(code);
            setFormData({
                ...code,
                validFrom: code.validFrom ? code.validFrom.substring(0, 16) : '',
                validUntil: code.validUntil ? code.validUntil.substring(0, 16) : ''
            });
        } else {
            setEditingCode(null);
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: 0,
                validFrom: '',
                validUntil: '',
                maxUses: -1,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCode(null);
    };

    if (isLoading) return <div className="p-8 text-center">Loading promo codes...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Tag className="text-indigo-600" />
                        Promo Codes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage discount codes and coupons
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                >
                    <Plus size={20} />
                    Create Promo Code
                </button>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Discount</th>
                            <th className="p-4">Usage</th>
                            <th className="p-4">Valid Period</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-[#3c4043]">
                        {promoCodes.map((code) => (
                            <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <td className="p-4 font-mono font-bold text-indigo-600">
                                    {code.code}
                                </td>
                                <td className="p-4 text-gray-900 dark:text-white">
                                    {code.discountType === 'PERCENTAGE' ? `${code.discountValue}%` : `$${code.discountValue}`}
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                    {code.currentUses} / {code.maxUses === -1 ? '∞' : code.maxUses}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    <div>{code.validFrom ? new Date(code.validFrom).toLocaleDateString() : 'Start'} - </div>
                                    <div>{code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'End'}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {code.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(code)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(code.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-[#3c4043]">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {editingCode ? 'Edit Promo Code' : 'Create Promo Code'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Code</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white uppercase"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Value</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valid From</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valid Until</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Max Uses (-1 = unltd)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Active</label>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                                >
                                    {editingCode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoCodeManagement;
