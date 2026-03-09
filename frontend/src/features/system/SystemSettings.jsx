import React, { useState, useEffect } from 'react';
import {
    Palette, ShieldCheck, Zap, Server, Database, Lock, Sparkles,
    Settings, ToggleLeft, Package, Bell, Users, FileText,
    MessageSquare, Calendar, CreditCard, BarChart3, Briefcase,
    GraduationCap, BookOpen, Globe, Shield, Cpu, HardDrive,
    Download, RefreshCw, Trash2, Plus, AlertTriangle, Clock, CheckCircle2,
    Link2, Cloud, Eye, EyeOff, Key, Save, Gamepad2, Trophy, Hash, Smartphone, Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useBranding } from '../../context/BrandingContext';
import ThemeModal from './ThemeModal';
import { useModules } from '../../context/ModuleContext';
import { api } from '../../services/api';
import TenantManagement from '../admin/TenantManagement';
import SkolverketManager from '../admin/SkolverketManager';
import PdfTemplateEditor from '../admin/PdfTemplateEditor';
import LanguageManager from './LanguageManager';

// Mappa modulnycklar till ikoner
const moduleIcons = {
    'REVENUE': CreditCard,
    'ANALYTICS': BarChart3,
    'MESSAGING': MessageSquare,
    'CALENDAR': Calendar,
    'NOTIFICATIONS': Bell,
    'DOCUMENTS': FileText,
    'COURSES': BookOpen,
    'USERS': Users,
    'REPORTS': FileText,
    'INTEGRATIONS': Globe,
    'SECURITY': Shield,
    'BACKUP': HardDrive,
    'API': Cpu,
    'ENTERPRISE': Briefcase,
    'EDUCATION': GraduationCap,
    'AI_QUIZ': Sparkles,
    'GAMIFICATION': Trophy,
    'EDUGAME': Gamepad2,
    // Fallback
    'DEFAULT': Package
};

const getModuleIcon = (moduleKey) => {
    return moduleIcons[moduleKey] || moduleIcons['DEFAULT'];
};

const SystemSettings = ({ asTab = false }) => {
    const navigate = useNavigate();
    const { themeId, themes } = useTheme();
    const { modules, refreshModules } = useModules();
    const { currentUser, systemSettings, updateSystemSetting } = useAppContext();
    const { hasAccess } = useBranding();
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [toggling, setToggling] = useState(null);
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem('system_settings_tab') || 'theme');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [licenseInfo, setLicenseInfo] = useState(null);
    const [licenseLoading, setLicenseLoading] = useState(true);

    // Backup & Database state
    const [backups, setBackups] = useState([]);
    const [backupStatus, setBackupStatus] = useState(null);
    const [backupLoading, setBackupLoading] = useState(true);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [dbConnections, setDbConnections] = useState([]);
    const [dbLoading, setDbLoading] = useState(true);
    const [showAddDbModal, setShowAddDbModal] = useState(false);
    const [switchingDb, setSwitchingDb] = useState(null);
    // Integrations State
    const [slackForm, setSlackForm] = useState({
        webhookUrl: '',
        isActive: false
    });
    const [integrationsLoading, setIntegrationsLoading] = useState(false);

    // AI State
    const [aiStatus, setAiStatus] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [savingApiKey, setSavingApiKey] = useState(false);



    const currentTheme = themes.find(t => t.id === themeId) || themes[0];
    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';


    const fetchIntegrationData = async () => {
        try {
            const data = await api.admin.integrations.get('SLACK');
            if (data) {
                setSlackForm({
                    webhookUrl: data.webhookUrl || '',
                    isActive: data.active || false
                });
            }
        } catch (err) {
            console.error('Failed to fetch Slack settings:', err);
        }
    };

    const fetchAiStatus = async () => {
        setAiLoading(true);
        try {
            const status = await api.get('/ai/quiz/status');
            setAiStatus(status);
        } catch (e) {
            console.error('Failed to fetch AI status:', e);
            setAiStatus({ available: false, moduleEnabled: false, apiConfigured: false, message: 'Kunde inte hämta AI-status' });
        } finally {
            setAiLoading(false);
        }
    };

    const handleSaveApiKey = async () => {
        if (!apiKeyInput.trim()) {
            alert('Ange en API-nyckel');
            return;
        }
        setSavingApiKey(true);
        try {
            const response = await api.post('/ai/quiz/config/api-key', { apiKey: apiKeyInput });
            if (response.success) {
                setApiKeyInput('');
                setShowApiKey(false);
                await fetchAiStatus();
                alert('API-nyckel sparad!');
            } else {
                alert(response.message || 'Kunde inte spara API-nyckel');
            }
        } catch (e) {
            console.error('Failed to save API key:', e);
            alert('Kunde inte spara API-nyckel: ' + (e.message || 'Okänt fel'));
        } finally {
            setSavingApiKey(false);
        }
    };

    const fetchBackupData = async () => {
        setBackupLoading(true);
        try {
            const [backupList, status] = await Promise.all([
                api.admin.listBackups(),
                api.admin.getBackupStatus()
            ]);
            setBackups(backupList || []);
            setBackupStatus(status);
        } catch (e) {
            console.error('Failed to fetch backup data:', e);
        } finally {
            setBackupLoading(false);
        }
    };

    const fetchDatabaseConnections = async () => {
        setDbLoading(true);
        try {
            const data = await api.admin.getDatabaseConnections();
            setDbConnections(data?.connections || []);
        } catch (e) {
            console.error('Failed to fetch database connections:', e);
        } finally {
            setDbLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            await api.admin.createBackup();
            await fetchBackupData();
            alert('Backup skapad!');
        } catch (e) {
            alert('Kunde inte skapa backup: ' + e.message);
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleDeleteBackup = async (backupId) => {
        if (!window.confirm('Är du säker på att du vill ta bort denna backup?')) return;
        try {
            await api.admin.deleteBackup(backupId);
            await fetchBackupData();
        } catch (e) {
            alert('Kunde inte ta bort backup: ' + e.message);
        }
    };

    const handleDownloadBackup = (backupId) => {
        const url = api.admin.downloadBackup(backupId);
        const token = localStorage.getItem('token');
        window.open(`${url}?token=${token}`, '_blank');
    };

    const handleSwitchDatabase = async (connectionId) => {
        const password = window.prompt('Ange ditt admin-lösenord för att bekräfta:');
        if (!password) return;

        setSwitchingDb(connectionId);
        try {
            await api.admin.switchDatabase(connectionId, password);
            alert('Databas bytt! Systemet kan behöva startas om.');
            await fetchDatabaseConnections();
        } catch (e) {
            alert('Kunde inte byta databas: ' + e.message);
        } finally {
            setSwitchingDb(null);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        if (!date) return 'Okänt';
        return new Date(date).toLocaleString('sv-SE');
    };

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        localStorage.setItem('system_settings_tab', tab);
    };

    const isModuleAllowedByPlan = (moduleKey) => {
        if (!licenseInfo || !licenseInfo.tier) return true;
        const tier = licenseInfo.tier;
        if (tier === 'ENTERPRISE') return true;

        const proRequired = ['QUIZ_PRO', 'CHAT', 'FORUM', 'SCORM', 'AI_QUIZ', 'AI_TUTOR'];
        const enterpriseRequired = ['GAMIFICATION', 'EDUGAME', 'ANALYTICS', 'ENTERPRISE_WHITELABEL', 'REVENUE'];

        if (tier === 'BASIC') {
            return !proRequired.includes(moduleKey) && !enterpriseRequired.includes(moduleKey);
        }
        if (tier === 'PRO') {
            return !enterpriseRequired.includes(moduleKey);
        }
        return true;
    };

    const handleToggleModule = async (key, currentStatus) => {
        if (!isModuleAllowedByPlan(key)) {
            alert(`Denna modul kräver en högre licensnivå (PRO eller ENTERPRISE).`);
            return;
        }
        setToggling(key);
        try {
            await api.modules.toggle(key, !currentStatus);
            await refreshModules();
        } catch (e) {
            alert("Kunde inte ändra modulstatus: " + e.message);
        } finally {
            setToggling(null);
        }
    };

    const handleSaveSlack = async () => {
        setIntegrationsLoading(true);
        try {
            await api.admin.integrations.save('SLACK', {
                webhookUrl: slackForm.webhookUrl,
                isActive: slackForm.isActive
            });
            alert('Slack-integration sparad');
        } catch (err) {
            alert('Kunde inte spara Slack-integration');
        } finally {
            setIntegrationsLoading(false);
        }
    };

    // Hämta licensinformation
    useEffect(() => {
        api.system.checkLicense()
            .then(data => {
                setLicenseInfo(data);
                setLicenseLoading(false);
            })
            .catch(() => setLicenseLoading(false));
    }, []);

    // Hämta backup-data när server-tabben är aktiv
    useEffect(() => {
        if (activeTab === 'server' && isAdmin) {
            fetchBackupData();
            fetchDatabaseConnections();
        }
    }, [activeTab, isAdmin]);

    // Hämta AI-status när AI-tabben är aktiv
    useEffect(() => {
        if (activeTab === 'ai') {
            fetchAiStatus();
        }
        if (activeTab === 'integrations' && isAdmin) {
            fetchIntegrationData();
        }
    }, [activeTab, isAdmin]);

    const isMaster = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === 'www.eduflexlms.se' ||
        window.location.hostname === 'eduflexlms.se';

    const menuItems = [
        {
            category: 'Konfiguration',
            items: [
                ...(isAdmin ? [
                    ...(isMaster && (licenseInfo?.tier === 'PRO' || licenseInfo?.tier === 'ENTERPRISE') ? [{ id: 'tenants', label: 'Tenants', icon: Server }] : []),
                    { id: 'skolverket', label: 'Skolverket', icon: Database }
                ] : [])
            ]
        },
        {
            category: 'Utseende',
            items: [
                { id: 'theme', label: 'Tema & Utseende', icon: Palette },
                ...(isAdmin ? [
                    { id: 'pdf-templates', label: 'PDF-mallar', icon: FileText },
                    { id: 'whitelabel', label: 'Enterprise Whitelabel', icon: Sparkles }
                ] : []),
            ]
        },
        {
            category: 'Licens & Status',
            items: [
                { id: 'license', label: 'Licensstatus', icon: ShieldCheck },
                ...(isAdmin ? [
                    { id: 'server', label: 'Serverinställningar', icon: Server }
                ] : []),
            ]
        },
        {
            category: 'AI & Automation',
            items: [
                { id: 'ai', label: 'AI-inställningar', icon: Sparkles },
                ...(isAdmin ? [{ id: 'ai-audit', label: 'AI Audit Logg', icon: ShieldCheck }] : []),
            ]
        },
        {
            category: 'Moduler',
            items: [
                { id: 'modules', label: 'Systemmoduler', icon: Database },
                { id: 'languages', label: 'Språkhantering', icon: Globe },
            ]
        },
        {
            category: 'Integrationer',
            items: [
                ...(isAdmin ? [{ id: 'integrations', label: 'Webhooks & Appar', icon: Globe }] : []),
            ]
        },
        {
            category: 'Kommunikation',
            items: [
                ...(isAdmin ? [{ id: 'notifs', label: 'Notissystem', icon: Bell }] : []),
            ]
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'tenants':
                return <TenantManagement />;
            case 'skolverket':
                return <SkolverketManager />;
            case 'theme':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Tema & Utseende</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Anpassa systemets färger och känsla.</p>
                        </div>

                        <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-blue/10 transition-all duration-500"></div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                                    <Palette size={28} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-[var(--text-primary)]">Aktivt Tema</h3>
                                    <p className="text-sm text-[var(--text-secondary)] font-bold">Nuvarande utseende för systemet</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-6 bg-[var(--bg-main)] rounded-2xl mb-8 border border-[var(--border-main)]">
                                <div className="w-16 h-16 rounded-2xl shadow-xl ring-2 ring-white/5" style={{ backgroundColor: currentTheme.colors[600] }}></div>
                                <div>
                                    <span className="font-black text-[var(--text-primary)] text-xl block mb-1">{currentTheme.name}</span>
                                    <p className="text-sm text-[var(--text-secondary)] font-mono opacity-70">Primärfärg: {currentTheme.colors[600]}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsThemeModalOpen(true)}
                                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                <Zap size={22} fill="currentColor" /> Öppna Temahanterare
                            </button>
                        </div>
                    </div>
                );

            case 'pdf-templates':
                return <PdfTemplateEditor />;

            case 'whitelabel':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Enterprise Whitelabel</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Fullt anpassningsbar branding för din organisation.</p>
                        </div>

                        <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all duration-500"></div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                                    <Sparkles size={28} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-[var(--text-primary)]">Whitelabel-status</h3>
                                    <p className="text-sm text-[var(--text-secondary)] font-bold">Anpassa logotyp, färger och mer</p>
                                </div>
                            </div>

                            <div className="p-6 bg-[var(--bg-main)] rounded-2xl mb-8 border border-[var(--border-main)]">
                                {hasAccess ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-black text-green-500 text-lg">ENTERPRISE-licens aktiv</span>
                                            <p className="text-sm text-[var(--text-secondary)] font-bold">Full tillgång till whitelabel-funktioner</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                                            <Lock size={22} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <span className="font-black text-amber-500 text-lg">Kräver ENTERPRISE-licens</span>
                                            <p className="text-sm text-[var(--text-secondary)] font-bold">Uppgradera för att låsa upp</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/enterprise/whitelabel')}
                                className={`w-full py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${hasAccess
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                    }`}
                                disabled={!hasAccess}
                            >
                                <Sparkles size={22} fill={hasAccess ? "currentColor" : "none"} /> {hasAccess ? 'Öppna Whitelabel' : 'Uppgradera för access'}
                            </button>
                        </div>
                    </div>
                );

            case 'license':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Licensstatus</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Information om din nuvarande plan och licensstatus.</p>
                        </div>

                        {licenseLoading ? (
                            <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl">
                                <div className="animate-pulse space-y-6">
                                    <div className="h-14 bg-white/5 rounded-2xl w-1/3"></div>
                                    <div className="h-20 bg-white/5 rounded-2xl"></div>
                                    <div className="h-20 bg-white/5 rounded-2xl"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[var(--text-primary)] border border-white/5">
                                                <Key size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-[var(--text-primary)]">Licensnyckel</h3>
                                                <p className="text-xs text-[var(--text-secondary)] font-mono font-bold opacity-50 tracking-widest">{licenseInfo?.licenseKey?.substring(0, 12)}••••••••</p>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] rounded-xl transition-all border border-white/5">
                                            <RefreshCw size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue">
                                                    <Users size={18} />
                                                </div>
                                                <span className="font-black text-[var(--text-secondary)] text-sm">Användarlicenser</span>
                                            </div>
                                            <span className="text-lg font-black text-[var(--text-primary)]">
                                                {licenseInfo?.userLimit || '100'} / <span className="text-brand-blue">Obegränsad</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue">
                                                    <Clock size={18} />
                                                </div>
                                                <span className="font-black text-[var(--text-secondary)] text-sm">Giltig till</span>
                                            </div>
                                            <span className={`text-lg font-black ${licenseInfo?.isExpiringSoon ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                                                {licenseInfo?.expiry || 'Obegränsad'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Behöver du mer kraft?</h3>
                                        <p className="text-[var(--text-secondary)] font-bold mb-6">Uppgradera till Enterprise för obegränsade domäner, dedikerad support och full kontroll.</p>
                                        <button className="w-full py-4 bg-white text-black rounded-2xl font-black shadow-xl hover:bg-brand-blue hover:text-white transition-all transform group-hover:scale-[1.02]">
                                            Kontakta Sales
                                        </button>
                                    </div>
                                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all"></div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'server':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        {/* Server Health Header */}
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Serverinställningar</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Hantera backuper, databaser och se systemets driftstatus.</p>
                        </div>

                        {/* Backups Card */}
                        <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                        <HardDrive size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[var(--text-primary)]">System-backuper</h3>
                                        <p className="text-sm text-[var(--text-secondary)] font-bold italic">Senaste backup: {formatDate(backupStatus?.lastBackup)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreateBackup}
                                    disabled={creatingBackup}
                                    className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {creatingBackup ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                                    Skapa Backup Nu
                                </button>
                            </div>

                            <div className="space-y-3">
                                {backupLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="animate-spin text-brand-blue" size={32} />
                                    </div>
                                ) : backups.length === 0 ? (
                                    <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-[var(--text-secondary)] font-bold">Inga backuper hittades.</p>
                                    </div>
                                ) : (
                                    backups.map(backup => (
                                        <div key={backup.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                                    <Database size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[var(--text-primary)]">{backup.filename}</p>
                                                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">{formatDate(backup.createdAt)} • {formatBytes(backup.size)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleDownloadBackup(backup.id)} className="p-2.5 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white rounded-xl transition-all border border-white/5">
                                                    <Download size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteBackup(backup.id)} className="p-2.5 bg-white/5 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 rounded-xl transition-all border border-white/5">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Database Connections */}
                        <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[var(--text-primary)]">Databasanslutningar</h3>
                                        <p className="text-sm text-[var(--text-secondary)] font-bold">Välj aktiv databas för systemet.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddDbModal(true)}
                                    className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Lägg till Databas
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dbLoading ? (
                                    <div className="col-span-2 flex items-center justify-center py-12">
                                        <RefreshCw className="animate-spin text-purple-500" size={32} />
                                    </div>
                                ) : (
                                    dbConnections.map(conn => (
                                        <div key={conn.id} className={`p-5 rounded-2xl border transition-all ${conn.active
                                            ? 'bg-purple-500/5 border-purple-500/40 ring-1 ring-purple-500/20'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${conn.active ? 'bg-purple-500 text-white' : 'bg-white/5 text-[var(--text-secondary)]'}`}>
                                                        <Database size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[var(--text-primary)]">{conn.name}</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">{conn.host}</p>
                                                    </div>
                                                </div>
                                                {conn.active && (
                                                    <span className="text-[10px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-lg tracking-widest">AKTIV</span>
                                                )}
                                            </div>
                                            {!conn.active && (
                                                <button
                                                    onClick={() => handleSwitchDatabase(conn.id)}
                                                    disabled={switchingDb === conn.id}
                                                    className="w-full py-2.5 bg-white/5 hover:bg-purple-500 hover:text-white text-[var(--text-primary)] rounded-xl font-black text-xs transition-all border border-white/5 border-dashed"
                                                >
                                                    {switchingDb === conn.id ? <RefreshCw size={14} className="animate-spin mx-auto" /> : 'Byt till denna databas'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );


            case 'ai': {
                const aiModule = modules.find(m => m.moduleKey === 'AI_QUIZ');
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">AI-inställningar</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Uppgradera din lärplattform med nästa generations intelligens.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* API Status & Config */}
                            <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-600/20 shadow-lg shadow-purple-600/10">
                                        <Cpu size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-[var(--text-primary)]">API-konfiguration</h3>
                                        <p className="text-sm text-[var(--text-secondary)] font-bold">Konfigurera Google Gemini API-nyckel</p>
                                    </div>
                                </div>

                                {/* Current Key Status */}
                                {aiStatus?.maskedApiKey && (
                                    <div className="flex items-center justify-between p-5 bg-[var(--bg-main)] rounded-2xl mb-6 border border-[var(--border-main)] hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <CheckCircle2 size={24} className="text-green-500" />
                                            <div>
                                                <span className="text-sm font-black text-[var(--text-secondary)]">Nuvarande nyckel: </span>
                                                <code className="text-sm font-mono bg-white/5 px-2.5 py-1 rounded-lg text-[var(--text-primary)] border border-white/5 shadow-inner">
                                                    {aiStatus.maskedApiKey}
                                                </code>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black tracking-widest border ${aiStatus.keySource === 'database'
                                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            : 'bg-white/5 text-white/40 border-white/5'
                                            }`}>
                                            {aiStatus.keySource === 'database' ? 'DATABAS' : 'MILJÖVARIABEL'}
                                        </span>
                                    </div>
                                )}

                                {/* API Key Input */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                        {aiStatus?.apiConfigured ? 'Uppdatera API-nyckel' : 'Ange Gemini API-nyckel'}
                                    </label>
                                    <div className="relative group/input">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={apiKeyInput}
                                            onChange={(e) => setApiKeyInput(e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="w-full px-5 py-4 pr-14 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-main)] text-[var(--text-primary)] font-mono text-sm focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-inner group-hover/input:border-white/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-[var(--text-secondary)] hover:text-brand-blue hover:bg-white/5 rounded-xl transition-all"
                                        >
                                            {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSaveApiKey}
                                        disabled={savingApiKey || !apiKeyInput.trim()}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-purple-600 text-white disabled:bg-white/5 disabled:text-white/20 rounded-2xl font-black shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:shadow-none disabled:border border-white/5"
                                    >
                                        {savingApiKey ? (
                                            <RefreshCw size={20} className="animate-spin" />
                                        ) : (
                                            <Save size={20} />
                                        )}
                                        {savingApiKey ? 'Sparar...' : 'Spara API-nyckel'}
                                    </button>
                                    <p className="text-xs text-[var(--text-secondary)] font-bold px-1">
                                        Skapa en API-nyckel på <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Google AI Studio</a>
                                    </p>
                                </div>
                            </div>



                            {/* Actions Card */}
                            <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl overflow-hidden group">
                                <h3 className="font-black text-xl text-[var(--text-primary)] mb-6">Åtgärder</h3>

                                <div className="space-y-4">
                                    {/* Toggle Module */}
                                    {aiModule && (
                                        <button
                                            onClick={() => handleToggleModule('AI_QUIZ', aiModule.active)}
                                            disabled={toggling === 'AI_QUIZ'}
                                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${aiModule.active
                                                ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                                : 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-xl border ${aiModule.active ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                                    <ToggleLeft size={24} />
                                                </div>
                                                <span className={`font-black text-lg ${aiModule.active ? 'text-red-500' : 'text-green-500'}`}>
                                                    {aiModule.active ? 'Inaktivera AI Quiz-modul' : 'Aktivera AI Quiz-modul'}
                                                </span>
                                            </div>
                                            {toggling === 'AI_QUIZ' && (
                                                <RefreshCw size={22} className="animate-spin text-[var(--text-secondary)]" />
                                            )}
                                        </button>
                                    )}

                                    {/* Open AI Quiz Generator */}
                                    <button
                                        onClick={() => navigate('/ai-quiz')}
                                        disabled={!aiStatus?.available}
                                        className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl relative overflow-hidden group/btn ${aiStatus?.available
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                        <Sparkles size={24} fill={aiStatus?.available ? "currentColor" : "none"} />
                                        Öppna AI Quiz-generatorn
                                    </button>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-brand-blue/5 rounded-3xl p-8 border border-brand-blue/20 shadow-xl relative overflow-hidden">
                                <div className="absolute -right-8 -bottom-8 bg-brand-blue/10 w-32 h-32 rounded-full blur-3xl"></div>
                                <h3 className="font-black text-xl text-brand-blue mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-brand-blue/10 rounded-xl">
                                        <FileText size={22} />
                                    </div>
                                    Så fungerar AI Quiz
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <li className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <span className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-brand-blue/20">1</span>
                                        <span className="text-[var(--text-secondary)] font-bold text-sm leading-relaxed">Ladda upp ett dokument eller klistra in text</span>
                                    </li>
                                    <li className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <span className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-brand-blue/20">2</span>
                                        <span className="text-[var(--text-secondary)] font-bold text-sm leading-relaxed">Välj antal frågor och svårighetsgrad</span>
                                    </li>
                                    <li className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <span className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-brand-blue/20">3</span>
                                        <span className="text-[var(--text-secondary)] font-bold text-sm leading-relaxed">AI:n genererar flervalsfrågor direkt</span>
                                    </li>
                                    <li className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <span className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-brand-blue/20">4</span>
                                        <span className="text-[var(--text-secondary)] font-bold text-sm leading-relaxed">Redigera och spara som ett quiz i din kurs</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'ai-audit':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">AI Audit Logg</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Granska och spåra alla AI-beslut i systemet.</p>
                        </div>

                        <div className="bg-[var(--bg-card)] rounded-3xl p-12 border border-[var(--border-main)] shadow-2xl text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-8 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative z-10">
                                <Sparkles size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4 relative z-10">Öppna AI Audit Portal</h3>
                            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-10 font-bold relative z-10 leading-relaxed text-lg">
                                Vi har en dedikerad portal för att söka, filtrera och analysera AI-beslut i detalj.
                            </p>
                            <button
                                onClick={() => navigate('/admin/ai-audit')}
                                className="px-10 py-5 bg-brand-blue text-white rounded-2xl font-black shadow-2xl shadow-brand-blue/30 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 mx-auto relative z-10 text-xl"
                            >
                                <Sparkles size={24} fill="currentColor" />
                                Gå till AI Audit Portal
                            </button>
                        </div>
                    </div>
                );


            case 'modules': {
                const categorizedModules = {};
                const usedKeys = new Set();
                const moduleCategories = {
                    'Kärnfunktioner': ['COURSES', 'USERS', 'RESOURCES'],
                    'Kommunikation': ['NOTIFICATIONS', 'MAIL_SERVICE', 'SMS_SERVICE'],
                    'AI & Intelligens': ['AI_COACH', 'AI_TUTOR', 'CONTENT_AI', 'AI_AUDIT', 'AI_QUIZ'],
                    'Försäljning & ButIK': ['SALES', 'CHECKOUT', 'COUPONS', 'SUBSCRIPTIONS', 'REVENUE'],
                    'Analys & Rapportering': ['ANALYTICS', 'REPORTS', 'COMPLIANCE'],
                    'Integrationer': ['SKOLVERKET', 'LADOK', 'GOOGLE_CLASSROOM', 'TEAMS'],
                    'Gamification': ['GAMIFICATION', 'EDUGAME', 'BADGES', 'LEADERBOARD', 'SHOP'],
                    'Utseende': ['DARK_MODE', 'ENTERPRISE_WHITELABEL']
                };

                Object.entries(moduleCategories).forEach(([category, keys]) => {
                    const categoryModules = keys
                        .map(key => modules.find(m => m.moduleKey === key))
                        .filter(Boolean);
                    if (categoryModules.length > 0) {
                        categorizedModules[category] = categoryModules;
                        categoryModules.forEach(m => usedKeys.add(m.moduleKey));
                    }
                });

                // Add any uncategorized modules to "Övrigt"
                const uncategorized = modules.filter(m => !usedKeys.has(m.moduleKey));
                if (uncategorized.length > 0) {
                    categorizedModules['Övrigt'] = [...(categorizedModules['Övrigt'] || []), ...uncategorized];
                }

                const handleSyncModules = async () => {
                    try {
                        setToggling('__sync__');
                        const result = await api.modules.init();
                        if (result.success) {
                            await refreshModules();
                            alert(`Moduler synkroniserade! ${result.moduleCount} moduler totalt.`);
                        }
                    } catch (e) {
                        alert('Kunde inte synkronisera moduler: ' + e.message);
                    } finally {
                        setToggling(null);
                    }
                };

                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Systemmoduler</h2>
                                <p className="text-[var(--text-secondary)] font-bold">Aktivera eller inaktivera funktioner globalt. Vissa moduler kräver PRO/ENTERPRISE-licens.</p>
                            </div>
                            <button
                                onClick={handleSyncModules}
                                disabled={toggling === '__sync__'}
                                className="flex items-center gap-3 px-6 py-3 bg-brand-blue text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={toggling === '__sync__' ? 'animate-spin' : ''} />
                                {toggling === '__sync__' ? 'Synkar...' : 'Synka moduler'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(categorizedModules).map(([category, categoryModules]) => (
                                <div key={category} className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-xl">
                                    {/* Category Header */}
                                    <div className="px-6 py-4 bg-white/5 border-b border-[var(--border-main)]">
                                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">{category}</h3>
                                    </div>

                                    {/* Modules Grid */}
                                    <div className="divide-y divide-[var(--border-main)]">
                                        {categoryModules.map(mod => {
                                            const ModuleIcon = getModuleIcon(mod.moduleKey);
                                            let dependencyMet = true;
                                            let dependencyMsg = "";

                                            if (mod.moduleKey === 'EDUGAME') {
                                                const gamificationMod = modules.find(m => m.moduleKey === 'GAMIFICATION');
                                                if (!gamificationMod || !gamificationMod.active) {
                                                    dependencyMet = false;
                                                    dependencyMsg = "Kräver Gamification Engine";
                                                }
                                            }

                                            const allowedByPlan = isModuleAllowedByPlan(mod.moduleKey);
                                            const isDisabled = !dependencyMet || !allowedByPlan;

                                            return (
                                                <div key={mod.moduleKey} className={`flex items-center gap-6 px-6 py-5 transition-all ${!dependencyMet ? 'bg-black/20 opacity-40' : 'hover:bg-white/5'}`}>
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border ${mod.active ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 shadow-lg shadow-brand-blue/10' : 'bg-white/5 text-white/20 border-white/5'}`}>
                                                        <ModuleIcon size={24} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-black text-[var(--text-primary)] text-base">{mod.name}</h4>
                                                            {mod.requiresLicense && (
                                                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg font-black tracking-widest border border-amber-500/10">PRO</span>
                                                            )}
                                                            <span className="text-[10px] text-[var(--text-secondary)] font-mono opacity-50">v{mod.version}</span>
                                                        </div>
                                                        <p className="text-sm text-[var(--text-secondary)] font-bold line-clamp-1">{mod.description}</p>
                                                        {!dependencyMet && (
                                                            <div className="flex items-center gap-2 text-xs text-red-500 mt-2 font-black">
                                                                <AlertTriangle size={14} /> {dependencyMsg}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-shrink-0 hidden sm:block">
                                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl tracking-widest border transition-all ${mod.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-white/20 border-white/5'}`}>
                                                            {mod.active ? 'AKTIV' : 'INAKTIV'}
                                                        </span>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        <button
                                                            onClick={() => handleToggleModule(mod.moduleKey, mod.active)}
                                                            disabled={toggling === mod.moduleKey || isDisabled}
                                                            className={`relative w-14 h-7 rounded-2xl transition-all duration-300 border-2 ${mod.active ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-white/5 border-white/5'} ${(toggling === mod.moduleKey || isDisabled) ? 'opacity-30 cursor-not-allowed shadow-none' : 'hover:scale-105 active:scale-95'}`}
                                                        >
                                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-xl transition-all duration-300 ${mod.active ? 'translate-x-7' : 'translate-x-0'}`}>
                                                                {toggling === mod.moduleKey && <RefreshCw size={12} className="absolute inset-0 m-auto animate-spin text-brand-blue" />}
                                                                {!allowedByPlan && <Lock size={12} className="absolute inset-0 m-auto text-amber-500" />}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-center gap-6 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest pt-4 ml-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <span>Aktiv modul</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/10">PRO</span>
                                    <span>Kräver PRO/ENTERPRISE-licens</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }


            case 'notifs': {
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Globala Notisinställningar</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Styr vilka kanaler som är aktiva för hela systemet och konfigurera Web Push.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Email Channel */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-blue/10 transition-all duration-500"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl border border-brand-blue/20">
                                        <MessageSquare size={24} />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={systemSettings['notify_mail_active'] === 'true'}
                                            onChange={(e) => updateSystemSetting('notify_mail_active', e.target.checked ? 'true' : 'false')}
                                        />
                                        <div className="w-12 h-6 bg-white/5 border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue peer-checked:after:bg-white peer-checked:after:opacity-100"></div>
                                    </label>
                                </div>
                                <h3 className="font-black text-xl text-[var(--text-primary)] mb-2 relative z-10">E-post</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-bold relative z-10">Skicka notiser via systemets SMTP-tjänst.</p>
                            </div>

                            {/* SMS Channel */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all duration-500"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20">
                                        <Smartphone size={24} />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={systemSettings['notify_sms_active'] === 'true'}
                                            onChange={(e) => updateSystemSetting('notify_sms_active', e.target.checked ? 'true' : 'false')}
                                        />
                                        <div className="w-12 h-6 bg-white/5 border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white peer-checked:after:opacity-100"></div>
                                    </label>
                                </div>
                                <h3 className="font-black text-xl text-[var(--text-primary)] mb-2 relative z-10">SMS</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-bold relative z-10">Kräver konfigurerad SMS-provider API.</p>
                            </div>

                            {/* Push Channel */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all duration-500"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20">
                                        <Globe size={24} />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={systemSettings['notify_push_active'] === 'true'}
                                            onChange={(e) => updateSystemSetting('notify_push_active', e.target.checked ? 'true' : 'false')}
                                        />
                                        <div className="w-12 h-6 bg-white/5 border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500 peer-checked:after:bg-white peer-checked:after:opacity-100"></div>
                                    </label>
                                </div>
                                <h3 className="font-black text-xl text-[var(--text-primary)] mb-2 relative z-10">Push (PWA)</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-bold relative z-10">Realtidsnotiser direkt i webbläsaren.</p>
                            </div>
                        </div>

                        {/* PWA / VAPID CONFIG */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-500"></div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] mb-8 flex items-center gap-4 relative z-10">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
                                    <Key size={24} />
                                </div>
                                Web Push Konfiguration
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">VAPID Public Key</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl text-sm font-mono focus:ring-2 focus:ring-brand-blue outline-none transition-all text-[var(--text-primary)] shadow-inner"
                                            placeholder="Nyckel för klienten..."
                                            defaultValue={systemSettings['vapid_public_key'] || ''}
                                            onBlur={(e) => updateSystemSetting('vapid_public_key', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">VAPID Private Key</label>
                                        <input
                                            type="password"
                                            className="w-full px-5 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl text-sm font-mono focus:ring-2 focus:ring-brand-blue outline-none transition-all text-[var(--text-primary)] shadow-inner"
                                            placeholder="Nyckel för backend..."
                                            defaultValue={systemSettings['vapid_private_key'] || ''}
                                            onBlur={(e) => updateSystemSetting('vapid_private_key', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="p-5 bg-brand-blue/5 rounded-2xl border-l-[6px] border-brand-blue shadow-lg">
                                    <p className="text-sm font-bold text-brand-blue flex items-center gap-2">
                                        <Zap size={16} fill="currentColor" />
                                        VAPID-nycklar används för att signera notiser så att webbläsaren kan verifiera att de kommer från din server.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'integrations': {
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">API-Integrationer & Webhooks</h2>
                            <p className="text-[var(--text-secondary)] font-bold">Hantera uppkopplingar mot externa tjänster.</p>
                        </div>

                        <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-blue/10 transition-all duration-500"></div>

                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue border border-brand-blue/20 shadow-lg shadow-brand-blue/10">
                                    <Hash size={28} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-[var(--text-primary)]">Slack App & Incoming Webhook</h3>
                                    <p className="text-sm text-[var(--text-secondary)] font-bold">Koppla EduFlex till Slack</p>
                                </div>
                                <div className="ml-auto">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={slackForm.isActive}
                                            onChange={(e) => setSlackForm({ ...slackForm, isActive: e.target.checked })}
                                        />
                                        <div className="w-12 h-6 bg-white/5 border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:border-white/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue peer-checked:after:bg-white peer-checked:after:opacity-100"></div>
                                    </label>
                                </div>
                            </div>

                            <div className={`space-y-6 relative z-10 transition-all duration-500 ${slackForm.isActive ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Webhook URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://hooks.slack.com/services/..."
                                        value={slackForm.webhookUrl}
                                        onChange={(e) => setSlackForm({ ...slackForm, webhookUrl: e.target.value })}
                                        className="w-full px-5 py-4 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-main)] text-[var(--text-primary)] focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm shadow-inner transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="bg-brand-blue/5 text-brand-blue p-6 rounded-2xl border border-brand-blue/20 shadow-lg flex items-start gap-4">
                                    <div className="p-2 bg-brand-blue/10 rounded-xl">
                                        <AlertTriangle size={20} className="shrink-0" />
                                    </div>
                                    <div>
                                        <p className="font-black mb-2 text-base">Inkommande Slash Commands (t.ex. '/eduflex')</p>
                                        <p className="text-sm font-bold opacity-80 mb-3">Peka din Slack App Request URL till:</p>
                                        <code className="bg-black/40 px-3 py-2 rounded-xl block font-mono text-sm border border-white/5 shadow-inner">{(window.location.origin).replace('localhost', 'eduflexlms.se')}/api/webhooks/slack/command</code>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 mt-8 border-t border-[var(--border-main)] flex justify-end relative z-10">
                                <button
                                    onClick={handleSaveSlack}
                                    disabled={integrationsLoading}
                                    className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 transition-all text-lg"
                                >
                                    {integrationsLoading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                    Spara Integrationer
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'languages':
                return <LanguageManager />;

            default:
                return (
                    <div className="flex items-center justify-center h-full p-12 text-center text-[var(--text-secondary)] font-bold italic">
                        Välj en kategori i menyn för att konfigurera systemet.
                    </div>
                );
        }
    };

    return (
        <div className={asTab ? "animate-in fade-in" : "p-8 max-w-7xl mx-auto animate-in fade-in pb-20"}>
            {!asTab && (
                <>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Systeminställningar</h1>
                    <p className="text-[var(--text-secondary)] mb-8 font-bold">Hantera globala inställningar, utseende och licenser för EduFlex.</p>
                </>
            )}

            <div className="flex bg-[var(--bg-main)] min-h-[600px] rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* SIDEBAR */}
                <aside className={`bg-[var(--bg-card)] w-64 border-r border-[var(--border-main)] flex-shrink-0 flex flex-col ${mobileMenuOpen ? 'block absolute z-50 h-full shadow-2xl backdrop-blur-xl' : 'hidden md:flex'}`}>
                    <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between">
                        <h2 className="font-black text-lg text-[var(--text-primary)]">Inställningar</h2>
                        <button className="md:hidden text-[var(--text-secondary)]" onClick={() => setMobileMenuOpen(false)}>✕</button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-8">
                        {menuItems.map((group, idx) => (
                            <div key={idx} className="animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 px-3">
                                    {group.category}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (!item.disabled) {
                                                    setActiveTab(item.id);
                                                    setMobileMenuOpen(false);
                                                }
                                            }}
                                            disabled={item.disabled}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black rounded-xl transition-all ${item.disabled
                                                ? 'text-white/10 dark:text-white/10 cursor-not-allowed'
                                                : activeTab === item.id
                                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                                                }`}
                                        >
                                            <item.icon size={16} strokeWidth={2.5} />
                                            {item.label}
                                            {item.disabled && <Lock size={12} className="ml-auto opacity-40" />}
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
                    <div className="md:hidden p-4 bg-[var(--bg-card)] border-b border-[var(--border-main)] flex justify-between items-center">
                        <span className="font-black text-[var(--text-primary)]">Meny</span>
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[var(--text-secondary)]">
                            <Settings size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-x-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>

            <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
        </div>
    );
};

export default SystemSettings;

