import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon } from 'lucide-react';
import { api } from '../../../services/api';
import { getGamificationAssetPath } from '../../../utils/gamificationUtils';
import ShopItemEditor from './ShopItemEditor';
import AdminHeader from '../../dashboard/components/admin/AdminHeader';
import AdminNavbar from '../../dashboard/components/admin/AdminNavbar';

const AdminShopDashboard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, FRAME, BACKGROUND, BADGE, TITLE

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/shop/items');
            setItems(response || []);
        } catch (err) {
            console.error("Failed to fetch shop items", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem(null); // Create mode
        setIsEditorOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item); // Edit mode
        setIsEditorOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/admin/shop/items/${id}`);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete item.");
        }
    };

    const handleSave = async (itemPayload) => {
        try {
            if (editingItem) {
                // Update
                const res = await api.put(`/admin/shop/items/${editingItem.id}`, itemPayload);
                setItems(prev => prev.map(i => i.id === editingItem.id ? res : i));
            } else {
                // Create
                const res = await api.post('/admin/shop/items', itemPayload);
                setItems(prev => [...prev, res]);
            }
            setIsEditorOpen(false);
        } catch (err) {
            console.error("Save failed", err);
            throw err; // Re-throw to be handled by Editor's catch
        }
    };

    const filteredItems = filter === 'ALL' ? items : items.filter(i => i.type === filter);

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <AdminHeader />
            <AdminNavbar />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Administration</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage frames, backgrounds, and badges.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Item
                    </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm w-fit">
                    {['ALL', 'FRAME', 'BACKGROUND', 'BADGE', 'TITLE'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === type
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Items Grid/Table */}
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Rarity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={getGamificationAssetPath(item.imageUrl, item.type)}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${item.type === 'FRAME' ? 'bg-blue-100 text-blue-800' :
                                                    item.type === 'BACKGROUND' ? 'bg-purple-100 text-purple-800' :
                                                        item.type === 'BADGE' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{item.cost} XP</div>
                                            <div className={`text-xs font-bold 
                                            ${item.rarity === 'LEGENDARY' ? 'text-orange-500' :
                                                    item.rarity === 'EPIC' ? 'text-purple-500' :
                                                        item.rarity === 'RARE' ? 'text-blue-500' :
                                                            'text-gray-500'}`}>
                                                {item.rarity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.unlockCriteria && item.unlockCriteria.length > 5 ? (
                                                <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-xs w-fit">
                                                    Active Requirement
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {isEditorOpen && (
                <ShopItemEditor
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={() => setIsEditorOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminShopDashboard;
