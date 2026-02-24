import React, { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, FileText, Settings, Tag, Shield, Terminal, Award, Link2, Zap, Upload, Trash2, Search, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminUserTable, AdminCourseRegistry } from './components/admin/AdminTables';
import RolesAdmin from './components/admin/RolesAdmin';
import { CreateUserModal, CreateCourseModal, EditCourseModal, EditUserModal } from './components/admin/AdminModals';
import AdminMeritManager from './components/admin/AdminMeritManager';
import AICourseCreator from '../courses/AICourseCreator';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useModules } from '../../context/ModuleContext';
import SubscriptionPlans from '../admin/SubscriptionPlans';
import InvoiceManagement from '../admin/InvoiceManagement';
import PaymentGatewaySettings from '../admin/PaymentGatewaySettings';
import PromoCodeManagement from '../admin/PromoCodeManagement';
import LogDashboard from '../system/LogDashboard';
import RealTimeLogViewer from '../system/RealTimeLogViewer';
import { HardDrive, Building2 } from 'lucide-react';
import SchoolStructureManagement from '../principal/SchoolStructureManagement';

import GuardianManager from './components/admin/GuardianManager';
import IntegrationHub from '../admin/IntegrationHub';
import AiAuditDashboard from '../admin/AiAuditDashboard';
import AuditLogDashboard from '../admin/AuditLogDashboard';
import DeployPanel from '../admin/DeployPanel';

const AdminGlobalDocuments = () => {
    const [docs, setDocs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const inputClass = "w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white border-gray-300 text-gray-900 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white";

    const fetchDocs = async () => {
        try { setDocs(await api.documents.getAll()); } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchDocs(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        const file = e.target.file.files[0];
        const title = e.target.title.value;
        if (!file || !title) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${window.location.origin}/api/documents/upload`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
            });
            e.target.reset();
            fetchDocs();
        } catch (err) { alert('Uppladdning misslyckades.'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Radera fil?')) return;
        try { await api.documents.delete(id); fetchDocs(); } catch (e) { alert('Fel vid radering.'); }
    };

    const filtered = docs.filter(d =>
        (d.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.filename || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2"><Upload size={20} /> Ladda upp global fil</h3>
                <form onSubmit={handleUpload} className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]"><label className="text-xs font-bold text-gray-500 mb-1 block">Fil</label><input name="file" type="file" className={inputClass} required /></div>
                    <div className="flex-1 min-w-[200px]"><label className="text-xs font-bold text-gray-500 mb-1 block">Titel</label><input name="title" className={inputClass} placeholder="Dokumentnamn" required /></div>
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 h-[42px]">Ladda upp</button>
                </form>
            </div>
            <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input placeholder="Sök dokument..." className={inputClass + " pl-9"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <div className="overflow-x-auto border border-gray-200 dark:border-[#3c4043] rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c4043]">
                        <tr><th className="px-4 py-3">Titel</th><th className="px-4 py-3">Ägare</th><th className="px-4 py-3 text-right">Åtgärd</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {filtered.length === 0
                            ? <tr><td colSpan="3" className="p-8 text-center text-gray-500 dark:text-gray-400">Inga dokument hittades.</td></tr>
                            : filtered.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50">
                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                        <div className="font-medium">{d.title || 'Namnlös'}</div>
                                        {d.filename && d.filename !== d.title && <div className="text-xs text-gray-400">{d.filename}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.owner?.fullName || 'System'}</td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(d.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg"><Trash2 size={16} /></button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminStorageStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.documents.getAdminStats()
            .then(setStats)
            .catch(err => console.error("Failed to fetch storage stats", err))
            .finally(() => setLoading(false));
    }, []);

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    if (loading) return <div className="p-8 text-center bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-100 dark:border-[#3c4043]">Laddar...</div>;
    if (!stats) return <div className="p-8 text-center bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-100 dark:border-[#3c4043]">Kunde inte hämta statistik.</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3c4043]">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Lagring</p>
                    <h3 className="text-2xl font-black text-indigo-600">{formatBytes(stats.totalUsed)}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Används i hela systemet</p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3c4043]">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Totala Filer</p>
                    <h3 className="text-2xl font-black text-indigo-600">{stats.totalDocuments} st</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Uppladdade dokument</p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3c4043]">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Användare</p>
                    <h3 className="text-2xl font-black text-indigo-600">{stats.totalUsers} st</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Användare i systemet</p>
                </div>
            </div>
        </div>
    );
};

const AdministrationPanel = ({ users, courses, teachers, fetchStats }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isModuleActive } = useModules();
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem('admin_panel_tab') || 'users');

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        localStorage.setItem('admin_panel_tab', tab);
    };

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Är du säker på att du vill ta bort denna kurs? Detta går inte att ångra.")) {
            try {
                await api.courses.delete(courseId);
                fetchStats();
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("Kunde inte ta bort kursen. Kontrollera att den inte har aktiva studenter.");
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Är du säker på att du vill ta bort denna användare? Detta går inte att ångra.")) {
            try {
                await api.users.delete(userId);
                fetchStats();
            } catch (error) {
                console.error("Failed to delete user", error);
                alert("Kunde inte ta bort användaren.");
            }
        }
    };

    const menuItems = [
        {
            category: 'Allmänt',
            items: [
                { id: 'users', label: 'Användare', icon: Users },
                { id: 'guardians', label: 'Vårdnadshavare', icon: Users },
                { id: 'courses', label: 'Kurser', icon: BookOpen },
                { id: 'structure', label: 'Skolstruktur', icon: Building2 },
                { id: 'merits', label: 'Meriter', icon: Award },
                { id: 'roles', label: 'Roller', icon: Shield },
            ]
        },
        {
            category: 'Ekonomi',
            hidden: !isModuleActive('REVENUE'),
            items: [
                { id: 'revenue', label: t('admin_tabs.revenue') || 'Översikt', icon: DollarSign },
                { id: 'revenue-plans', label: t('admin_tabs.subscription_plans') || 'Planer', icon: Tag },
                { id: 'revenue-invoices', label: t('admin_tabs.invoices') || 'Fakturor', icon: FileText },
                { id: 'revenue-payments', label: t('admin_tabs.payment_settings') || 'Betalningar', icon: Settings },
                { id: 'revenue-promocodes', label: t('admin_tabs.promo_codes') || 'Rabattkoder', icon: Tag },
            ]
        },
        {
            category: 'System',
            items: [
                { id: 'storage', label: 'Lagring', icon: HardDrive },
                { id: 'content', label: 'Dokument (Global)', icon: Upload },
                { id: 'logs', label: 'Systemloggar (Fil)', icon: FileText },
                { id: 'terminal', label: 'Debug Terminal (Live)', icon: Terminal },
                { id: 'audit-log', label: 'Audit Log', icon: Shield },
                { id: 'integrations', label: 'Integration Hub', icon: Link2 },
                { id: 'ai-audit', label: 'AI Audit', icon: Zap },
                { id: 'deploy', label: 'Deploy', icon: Server },
            ]
        }
    ];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Render Helpers
    const renderContent = () => {
        switch (activeTab) {
            case 'users': return <AdminUserTable users={users} onNewUser={() => setShowUserModal(true)} onEdit={(u) => { setUserToEdit(u); setShowEditUserModal(true); }} onDelete={handleDeleteUser} />;
            case 'courses': return (
                <AdminCourseRegistry
                    courses={courses}
                    onNewCourse={() => setShowCourseModal(true)}
                    onAiCourseClick={() => setShowAiModal(true)}
                    onEdit={(c) => { setCourseToEdit(c); setShowEditCourseModal(true); }}
                    onManage={(id) => navigate(`/course/${id}`)}
                    onDelete={handleDeleteCourse}
                />
            );
            case 'merits': return <AdminMeritManager users={users} />;
            case 'structure': return <SchoolStructureManagement />;
            case 'guardians': return <GuardianManager />;
            case 'roles': return <RolesAdmin />;
            case 'storage': return <AdminStorageStats />;
            case 'content': return <AdminGlobalDocuments />;
            case 'logs': return <LogDashboard />;
            case 'terminal': return <RealTimeLogViewer />;
            case 'audit-log': return <AuditLogDashboard />;
            case 'integrations': return <IntegrationHub />;
            case 'ai-audit': return <AiAuditDashboard />;
            case 'deploy': return <DeployPanel />;

            // Revenue
            case 'revenue': return <SubscriptionPlans />; // Fallback or Overview
            case 'revenue-plans': return <SubscriptionPlans />;
            case 'revenue-invoices': return <InvoiceManagement />;
            case 'revenue-payments': return <PaymentGatewaySettings />;
            case 'revenue-promocodes': return <PromoCodeManagement />;

            default: return <div className="p-8 text-center text-gray-500">Välj en kategori i menyn</div>;
        }
    };

    return (
        <div className="flex bg-gray-50 dark:bg-[#151718] min-h-[600px] rounded-lg border border-gray-200 dark:border-[#3c4043] overflow-hidden">
            {/* SIDEBAR */}
            <aside className={`bg-white dark:bg-[#1e2022] w-64 border-r border-gray-200 dark:border-[#3c4043] flex-shrink-0 flex flex-col ${mobileMenuOpen ? 'block absolute z-50 h-full' : 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-[#3c4043] flex items-center justify-between">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">Admin</h2>
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(false)}>X</button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    {menuItems.map((group, idx) => !group.hidden && (
                        <div key={idx}>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                {group.category}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282a2c]'
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-white dark:bg-[#1e2022] border-b border-gray-200 dark:border-[#3c4043] flex justify-between items-center">
                    <span className="font-bold">Meny</span>
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-x-auto">
                    {renderContent()}
                </div>
            </main>

            {/* MODALS */}
            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
            <EditUserModal isOpen={showEditUserModal} onClose={() => setShowEditUserModal(false)} onUserUpdated={fetchStats} userToEdit={userToEdit} />
            <CreateCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} onCourseCreated={fetchStats} teachers={teachers} />
            <EditCourseModal isOpen={showEditCourseModal} onClose={() => setShowEditCourseModal(false)} onCourseUpdated={fetchStats} teachers={teachers} courseToEdit={courseToEdit} />

            <AICourseCreator
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                onCourseCreated={() => {
                    fetchStats();
                    setShowAiModal(false);
                }}
            />
        </div>
    );
};

export default AdministrationPanel;
