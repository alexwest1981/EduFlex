import React, { useState, useEffect } from 'react';
import { Award, Upload, Search, Trash2, Shield, User } from 'lucide-react';
import { api } from '../../../../services/api';
import toast from 'react-hot-toast';

const AdminMeritManager = ({ users }) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [merits, setMerits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState('CERTIFICATE');

    const fetchMerits = async (userId) => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await api.documents.getMerits(userId);
            setMerits(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUserId) fetchMerits(selectedUserId);
    }, [selectedUserId]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedUserId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('official', 'true');

        try {
            // Vi använder relative URL för att nyttja Vite's proxy (undviker CORS-strul och hårdkodning)
            const response = await fetch(`/api/documents/user/${selectedUserId}?category=${category}&official=true`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Tenant-ID': localStorage.getItem('force_tenant') || '' // Enkel tenant-hantering om det behövs
                },
                body: formData
            });

            if (response.ok) {
                toast.success("Merit uppladdad!");
                fetchMerits(selectedUserId);
            } else {
                toast.error("Uppladdning misslyckades");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ett fel uppstod");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3c4043]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Award className="text-indigo-600" size={20} />
                    Hantera Elevers Meriter
                </h3>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Välj Elev</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">-- Välj en student --</option>
                            {users.filter(u => u.role?.name === 'STUDENT' || u.role === 'STUDENT').map(u => (
                                <option key={u.id} value={u.id}>{u.fullName} ({u.username})</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Typ av Merit</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="CERTIFICATE">Kursbevis</option>
                            <option value="TRANSCRIPT">Betygsutdrag</option>
                            <option value="ENROLLMENT_PROOF">Studieintyg</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <label className={`
                            flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95
                            ${(!selectedUserId || uploading) ? 'opacity-50 pointer-events-none' : ''}
                        `}>
                            {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Upload size={18} />}
                            {uploading ? 'Laddar upp...' : 'Ladda upp merit'}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={!selectedUserId || uploading} />
                        </label>
                    </div>
                </div>
            </div>

            {selectedUserId && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm border border-gray-100 dark:border-[#3c4043] overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <h4 className="font-bold text-sm text-gray-700">Aktiva meriter för vald elev</h4>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Hämtar...</div>
                    ) : merits.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 italic">Inga meriter registrerade för denna elev.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr className="text-left text-[10px] uppercase font-bold text-gray-400">
                                    <th className="px-6 py-4">Typ</th>
                                    <th className="px-6 py-4">Filnamn</th>
                                    <th className="px-6 py-4">Datum</th>
                                    <th className="px-6 py-4 text-right">Åtgärder</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {merits.map(merit => (
                                    <tr key={merit.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                {merit.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm text-gray-700">{merit.fileName}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{merit.uploadedAt}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Radera denna officiella merit?")) {
                                                        // Här behöver vi en bypass för "official" eftersom admin SKA kunna radera
                                                        // Men för nu, låt oss bara försöka (backend blockerar om vi inte fixar roll-check)
                                                        toast.error("Administrativ borttagning kommer i nästa steg!");
                                                    }
                                                }}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminMeritManager;
