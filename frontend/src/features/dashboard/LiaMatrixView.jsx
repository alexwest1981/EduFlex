import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Plus, Download, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, X } from 'lucide-react';
import api from '../../services/api';

const LiaMatrixView = ({ users, courses }) => {
    const { t } = useTranslation();
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const emptyForm = {
        studentId: '', courseId: '', companyName: '', companyOrgNumber: '', supervisorName: '',
        supervisorEmail: '', supervisorPhone: '', startDate: '', endDate: '',
        agreementSigned: false, midtermEvaluationDone: false, finalEvaluationDone: false, status: 'PLANNED'
    };
    const [formData, setFormData] = useState(emptyForm);

    const fetchPlacements = async () => {
        setLoading(true);
        try {
            const res = await api.admin.liaPlacements.getAll();
            setPlacements(res.data || []);
        } catch (err) {
            console.error("Failed to fetch LIA Placements:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlacements();
    }, []);

    const openCreateModal = () => {
        setFormData(emptyForm);
        setEditMode(false);
        setEditingId(null);
        setShowModal(true);
    };

    const openEditModal = (placement) => {
        setFormData({
            studentId: placement.student.id,
            courseId: placement.course.id,
            companyName: placement.companyName || '',
            companyOrgNumber: placement.companyOrgNumber || '',
            supervisorName: placement.supervisorName || '',
            supervisorEmail: placement.supervisorEmail || '',
            supervisorPhone: placement.supervisorPhone || '',
            startDate: placement.startDate || '',
            endDate: placement.endDate || '',
            agreementSigned: placement.agreementSigned || false,
            midtermEvaluationDone: placement.midtermEvaluationDone || false,
            finalEvaluationDone: placement.finalEvaluationDone || false,
            status: placement.status || 'PLANNED'
        });
        setEditMode(true);
        setEditingId(placement.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker på att du vill ta bort denna LIA-placering?")) return;
        try {
            await api.admin.liaPlacements.delete(id);
            fetchPlacements();
        } catch (err) {
            console.error("Failed to delete placement:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.admin.liaPlacements.update(editingId, formData);
            } else {
                await api.admin.liaPlacements.create(formData);
            }
            setShowModal(false);
            fetchPlacements();
        } catch (err) {
            console.error("Failed to save placement:", err);
            alert("Kunde inte spara LIA-placeringen.");
        }
    };

    const filteredPlacements = (placements || []).filter(p =>
        p.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getComplianceIcon = (val) => val ? <ShieldCheck className="text-green-500 w-5 h-5 mx-auto" /> : <ShieldAlert className="text-red-500 w-5 h-5 mx-auto" />;

    return (
        <div className="animate-in fade-in duration-500 mb-20 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" /> MYH LIA Compliance Matrix
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Översikt över alla LIA-avtal och obligatoriska bedömningar.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="search"
                        placeholder="Sök student / företag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border rounded-full text-sm bg-white dark:bg-[#1E1F20] border-gray-200 dark:border-[#3c4043] focus:ring-2 focus:ring-indigo-500 dark:text-white w-64 shadow-sm"
                    />
                    <button onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-bold shadow-sm transition-all text-sm">
                        <Plus size={16} /> Lägg till Placering
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
            ) : (
                <div className="overflow-hidden shadow-sm border border-gray-200 dark:border-[#3c4043] rounded-2xl bg-white dark:bg-[#1c1c1e]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-[#131314] text-xs uppercase font-black text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c4043]">
                                <tr>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Företag & Handledare</th>
                                    <th className="px-5 py-4">Datum & Status</th>
                                    <th className="px-5 py-4 text-center">Avtal Sign.</th>
                                    <th className="px-5 py-4 text-center">Mitt-Bet.</th>
                                    <th className="px-5 py-4 text-center">Slut-Bet.</th>
                                    <th className="px-5 py-4 text-center">Åtgärder</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {filteredPlacements.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-[#252527] transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{p.student?.fullName}</div>
                                            <div className="text-xs text-gray-500">{p.course?.name}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{p.companyName || '-'}</div>
                                            <div className="text-xs text-gray-500">{p.supervisorName || '-'}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                                {p.startDate} till {p.endDate}
                                            </div>
                                            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-sm ${p.status === 'ONGOING' ? 'bg-amber-100 text-amber-800' : p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">{getComplianceIcon(p.agreementSigned)}</td>
                                        <td className="px-5 py-4">{getComplianceIcon(p.midtermEvaluationDone)}</td>
                                        <td className="px-5 py-4">{getComplianceIcon(p.finalEvaluationDone)}</td>
                                        <td className="px-5 py-4 flex gap-2 justify-center">
                                            <button onClick={() => openEditModal(p)} className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 rounded-md transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-md transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPlacements.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-8 text-center text-gray-500">Inga LIA-placeringar hittades.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
                        <div className="p-5 border-b border-gray-200 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {editMode ? 'Redigera LIA-placering' : 'Skapa Ny LIA-placering'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-300 rounded p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Student</label>
                                    <select required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })}>
                                        <option value="">Välj...</option>
                                        {users.filter(u => u.roles && u.roles.some(r => r.name === 'STUDENT')).map(u => (
                                            <option key={u.id} value={u.id}>{u.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Kurs/Utbildning</label>
                                    <select required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                                        <option value="">Välj...</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input className="p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Företagsnamn" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} required />
                                <input className="p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Org.nummer" value={formData.companyOrgNumber} onChange={e => setFormData({ ...formData, companyOrgNumber: e.target.value })} />
                                <input className="p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Handledare Namn" value={formData.supervisorName} onChange={e => setFormData({ ...formData, supervisorName: e.target.value })} required />
                                <input type="email" className="p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Handledare E-post" value={formData.supervisorEmail} onChange={e => setFormData({ ...formData, supervisorEmail: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-xs font-bold shadow-sm mb-1">Startdatum</label><input type="date" required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold shadow-sm mb-1">Slutdatum</label><input type="date" required className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold shadow-sm mb-1">Status</label>
                                    <select className="w-full p-2 border rounded-lg dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="PLANNED">Planerad</option>
                                        <option value="ONGOING">Pågående</option>
                                        <option value="COMPLETED">Avslutad</option>
                                        <option value="CANCELLED">Avbruten</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl space-y-4">
                                <h4 className="text-xs font-black text-amber-800 dark:text-amber-500 uppercase flex items-center gap-1"><ShieldAlert size={14} /> MYH Compliance (Obligatoriskt)</h4>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={formData.agreementSigned} onChange={e => setFormData({ ...formData, agreementSigned: e.target.checked })} />
                                    <span className="text-sm font-semibold dark:text-gray-300">LIA-avtal signerat & uppladdat</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={formData.midtermEvaluationDone} onChange={e => setFormData({ ...formData, midtermEvaluationDone: e.target.checked })} />
                                    <span className="text-sm font-semibold dark:text-gray-300">Mitt-bedömning utförd</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={formData.finalEvaluationDone} onChange={e => setFormData({ ...formData, finalEvaluationDone: e.target.checked })} />
                                    <span className="text-sm font-semibold dark:text-gray-300">Slut-bedömning (Betyg) inskickad</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-[#3c4043]">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg font-bold transition">Avbryt</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center gap-2">
                                    <ShieldCheck size={18} /> Spara Placering
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiaMatrixView;
