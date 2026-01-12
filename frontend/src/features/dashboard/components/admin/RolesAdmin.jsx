import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Check, X, Lock } from 'lucide-react';
import { api } from '../../../../services/api';

const RolesAdmin = () => {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        defaultDashboard: 'STUDENT', // Default
        isSuperAdmin: false,
        permissions: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                api.roles.getAll(),
                api.roles.getPermissions()
            ]);
            setRoles(rolesData || []);
            setAllPermissions(permsData || []);
        } catch (error) {
            console.error("Failed to fetch roles data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            defaultDashboard: role.defaultDashboard || 'STUDENT',
            isSuperAdmin: role.superAdmin,
            permissions: role.permissions || []
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
            defaultDashboard: 'STUDENT',
            isSuperAdmin: false,
            permissions: []
        });
        setShowModal(true);
    };

    const handleDelete = async (roleId) => {
        if (!window.confirm("Är du säker på att du vill ta bort denna roll?")) return;
        try {
            await api.roles.delete(roleId);
            fetchData();
        } catch (error) {
            alert("Kunde inte ta bort rollen. Se till att inga användare har den tilldelad.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await api.roles.update(editingRole.id, formData);
            } else {
                await api.roles.create(formData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert("Kunde inte spara rollen: " + error.message);
        }
    };

    const togglePermission = (perm) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm];
            return { ...prev, permissions: newPerms };
        });
    };

    // Group permissions for better UI
    const permissionGroups = allPermissions.reduce((groups, perm) => {
        const prefix = perm.split('_')[0];
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(perm);
        return groups;
    }, {});

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Shield size={20} className="text-indigo-600" />
                        Rollhantering
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Skapa och redigera systemroller och behörigheter.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"
                >
                    <Plus size={14} /> Ny Roll
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                        <tr>
                            <th className="p-4">Rollnamn</th>
                            <th className="p-4">Layout</th>
                            <th className="p-4">Beskrivning</th>
                            <th className="p-4">Behörigheter</th>
                            <th className="p-4 text-right">Åtgärd</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {roles.map(role => (
                            <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                        {role.name}
                                        {role.superAdmin && <Lock size={12} className="text-amber-500" title="Super Admin" />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded">
                                        {role.defaultDashboard || '-'}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 dark:text-gray-400">{role.description}</td>
                                <td className="p-4">
                                    <span className="bg-gray-100 dark:bg-[#3c4043] text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-mono">
                                        {role.permissions?.length || 0} st
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2 text-gray-500">
                                    <button onClick={() => handleEdit(role)} className="p-2 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    {!['ADMIN', 'TEACHER', 'STUDENT'].includes(role.name) && (
                                        <button onClick={() => handleDelete(role.id)} className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                            <h3 className="text-xl font-bold dark:text-white">{editingRole ? 'Redigera Roll' : 'Skapa Ny Roll'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Rollnamn (Unikt, VERSALER)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white font-mono uppercase"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                        disabled={editingRole && editingRole.name === 'ADMIN'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Beskrivning</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Dashboard Layout (Vy)</label>
                                <select
                                    className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                    value={formData.defaultDashboard}
                                    onChange={e => setFormData({ ...formData, defaultDashboard: e.target.value })}
                                >
                                    <option value="ADMIN">ADMIN (Systemadministration)</option>
                                    <option value="PRINCIPAL">PRINCIPAL (Analys & Skolöversikt)</option>
                                    <option value="TEACHER">TEACHER (Lärarpanel)</option>
                                    <option value="MENTOR">MENTOR (Mentoröversikt)</option>
                                    <option value="STUDENT">STUDENT (Studentpanel)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Styr vilken startvy användarna med denna roll får.</p>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.isSuperAdmin}
                                        onChange={e => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                                        disabled={editingRole && editingRole.name === 'ADMIN'}
                                    />
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Super Admin (Fullständig åtkomst)</span>
                                </label>
                                <p className="text-xs text-gray-500 ml-7 mt-1">Ger automatiskt tillgång till ALLA funktioner oavsett valda behörigheter nedan.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white mb-3">Behörigheter</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(permissionGroups).map(([group, perms]) => (
                                        <div key={group} className="bg-gray-50 dark:bg-[#131314] p-3 rounded-lg border border-gray-100 dark:border-[#3c4043]">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 border-b border-gray-200 pb-1">{group}</h5>
                                            <div className="space-y-2">
                                                {perms.map(perm => (
                                                    <label key={perm} className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#282a2c] p-1 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            checked={formData.permissions.includes(perm)}
                                                            onChange={() => togglePermission(perm)}
                                                        />
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 break-all">{perm}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-lg">Avbryt</button>
                            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">Spara Roll</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesAdmin;
