import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, Plus, FileText, Eye, XCircle, Users,
    Calendar, Clock, BarChart3, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const statusLabels = { DRAFT: 'Utkast', ACTIVE: 'Aktiv', CLOSED: 'Stängd' };
const statusColors = {
    DRAFT: 'bg-gray-500/10 text-gray-500',
    ACTIVE: 'bg-emerald-500/10 text-emerald-600',
    CLOSED: 'bg-slate-500/10 text-slate-500',
};

const SurveyDistributionManager = () => {
    const navigate = useNavigate();
    const [distributions, setDistributions] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSendForm, setShowSendForm] = useState(false);

    // Send form state
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [deadline, setDeadline] = useState('');
    const [sending, setSending] = useState(false);

    const loadData = async () => {
        try {
            const [dists, tmpls, rls] = await Promise.all([
                api.elevhalsa.getDistributions(),
                api.elevhalsa.getTemplates(),
                api.elevhalsa.getSurveyRoles(),
            ]);
            setDistributions(dists || []);
            setTemplates(tmpls || []);
            setRoles(rls || []);
        } catch (err) {
            toast.error('Kunde inte ladda data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSend = async () => {
        if (!selectedTemplate || !selectedRole) {
            toast.error('Välj mall och målgrupp');
            return;
        }
        setSending(true);
        try {
            await api.elevhalsa.distribute({
                templateId: parseInt(selectedTemplate),
                targetRole: selectedRole,
                deadline: deadline || null,
            });
            toast.success('Enkät utskickad!');
            setShowSendForm(false);
            setSelectedTemplate('');
            setSelectedRole('');
            setDeadline('');
            loadData();
        } catch (err) {
            toast.error('Kunde inte skicka enkät');
        } finally {
            setSending(false);
        }
    };

    const handleClose = async (distId) => {
        if (!window.confirm('Vill du stänga detta utskick? Inga fler svar kan skickas in.')) return;
        try {
            await api.elevhalsa.closeDistribution(distId);
            toast.success('Utskick stängt');
            loadData();
        } catch (err) {
            toast.error('Kunde inte stänga utskicket');
        }
    };

    const getRoleLabel = (roleName) => {
        const role = roles.find(r => r.name === roleName);
        return role?.description || roleName?.replace('ROLE_', '') || 'Okänd';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/health-dashboard/survey/new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-medium hover:bg-brand-teal/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Skapa mall
                </button>
                <button onClick={() => setShowSendForm(!showSendForm)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <Send className="w-4 h-4" />
                    Skicka enkät
                </button>
            </div>

            {/* Send Form */}
            {showSendForm && (
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Send className="w-4 h-4 text-indigo-500" />
                        Nytt utskick
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Enkätmall</label>
                            <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white">
                                <option value="">Välj mall...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Målgrupp (roll)</label>
                            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white">
                                <option value="">Välj roll...</option>
                                {roles.map(r => (
                                    <option key={r.name} value={r.name}>{r.description || r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Deadline (valfri)</label>
                            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowSendForm(false)}
                            className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                            Avbryt
                        </button>
                        <button onClick={handleSend} disabled={sending}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            <Send className="w-3.5 h-3.5" />
                            {sending ? 'Skickar...' : 'Skicka ut'}
                        </button>
                    </div>
                </div>
            )}

            {/* Templates List */}
            {templates.length > 0 && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-white/5">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand-teal" />
                            Enkätmallar ({templates.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {templates.map(t => (
                            <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{t.title}</p>
                                    <p className="text-xs text-gray-400">{t.questions?.length || 0} frågor</p>
                                </div>
                                <button onClick={() => navigate(`/health-dashboard/survey/edit/${t.id}`)}
                                    className="text-xs text-brand-teal font-medium hover:underline flex items-center gap-1">
                                    Redigera <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Distributions Table */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-white/5">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        Utskick ({distributions.length})
                    </h3>
                </div>
                {distributions.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm italic">
                        Inga utskick ännu. Skapa en mall och skicka ut den.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-black/10 text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Enkät</th>
                                    <th className="px-5 py-3">Målgrupp</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Skickad</th>
                                    <th className="px-5 py-3">Deadline</th>
                                    <th className="px-5 py-3 text-right">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {distributions.map(d => (
                                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {d.template?.title || 'Okänd'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <Users className="w-3.5 h-3.5" />
                                                {getRoleLabel(d.targetRole)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[d.status] || ''}`}>
                                                {statusLabels[d.status] || d.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {d.sentAt ? new Date(d.sentAt).toLocaleDateString('sv-SE') : '-'}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {d.deadline ? (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(d.deadline).toLocaleDateString('sv-SE')}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => navigate(`/health-dashboard/survey/results/${d.id}`)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                    title="Visa resultat">
                                                    <Eye className="w-4 h-4 text-indigo-500" />
                                                </button>
                                                {d.status === 'ACTIVE' && (
                                                    <button onClick={() => handleClose(d.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Stäng utskick">
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurveyDistributionManager;
