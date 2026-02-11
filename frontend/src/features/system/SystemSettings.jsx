import React, { useState, useEffect } from 'react';
import {
    Palette, ShieldCheck, Zap, Server, Database, Lock, Sparkles,
    Settings, ToggleLeft, Package, Bell, Users, FileText,
    MessageSquare, Calendar, CreditCard, BarChart3, Briefcase,
    GraduationCap, BookOpen, Globe, Shield, Cpu, HardDrive,
    Download, RefreshCw, Trash2, Plus, AlertTriangle, Clock, CheckCircle2,
    Link2, Cloud, Eye, EyeOff, Key, Save, Gamepad2, Trophy
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
import AdminIntegrations from '../dashboard/admin/AdminIntegrations';
import PdfTemplateEditor from '../admin/PdfTemplateEditor';

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
    const { currentUser } = useAppContext();
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

    // AI Quiz state
    const [aiStatus, setAiStatus] = useState(null);
    const [aiLoading, setAiLoading] = useState(true);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [savingApiKey, setSavingApiKey] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const currentTheme = themes.find(t => t.id === themeId) || themes[0];
    const isAdmin = currentUser?.role?.name === 'ADMIN' || currentUser?.role === 'ADMIN';

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
    }, [activeTab]);

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

    const handleToggleModule = async (key, currentStatus) => {
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

    const menuItems = [
        {
            category: 'Konfiguration',
            items: [
                ...(isAdmin ? [
                    { id: 'tenants', label: 'Tenants', icon: Server },
                    { id: 'skolverket', label: 'Skolverket', icon: Database },
                    { id: 'integrations', label: 'Integrationer', icon: Globe }
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
                ...(isAdmin ? [{ id: 'server', label: 'Serverinställningar', icon: Server }] : []),
            ]
        },
        {
            category: 'AI & Automation',
            items: [
                { id: 'ai', label: 'AI-inställningar', icon: Sparkles },
            ]
        },
        {
            category: 'Moduler',
            items: [
                { id: 'modules', label: 'Systemmoduler', icon: Database },
            ]
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'tenants':
                return <TenantManagement />;
            case 'skolverket':
                return <SkolverketManager />;
            case 'integrations':
                return <AdminIntegrations />;
            case 'theme':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tema & Utseende</h2>
                            <p className="text-gray-500 dark:text-gray-400">Anpassa systemets färger och känsla.</p>
                        </div>

                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Aktivt Tema</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Nuvarande utseende för systemet</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl mb-6">
                                <div className="w-12 h-12 rounded-xl shadow-sm" style={{ backgroundColor: currentTheme.colors[600] }}></div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white text-lg">{currentTheme.name}</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Primärfärg: {currentTheme.colors[600]}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsThemeModalOpen(true)}
                                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg hover:transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={18} /> Öppna Temahanterare
                            </button>
                        </div>
                    </div>
                );

            case 'pdf-templates':
                return <PdfTemplateEditor />;

            case 'whitelabel':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise Whitelabel</h2>
                            <p className="text-gray-500 dark:text-gray-400">Fullt anpassningsbar branding för din organisation.</p>
                        </div>

                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Whitelabel-status</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Anpassa logotyp, färger och mer</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl mb-6">
                                {hasAccess ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-green-600 dark:text-green-400">ENTERPRISE-licens aktiv</span>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Full tillgång till whitelabel-funktioner</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                            <Lock size={20} className="text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">Kräver ENTERPRISE-licens</span>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Uppgradera för att låsa upp</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/enterprise/whitelabel')}
                                className={`w-full py-3 rounded-xl font-bold shadow-lg hover:transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${hasAccess
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={!hasAccess}
                            >
                                <Sparkles size={18} /> {hasAccess ? 'Öppna Whitelabel' : 'Uppgradera för access'}
                            </button>
                        </div>
                    </div>
                );

            case 'license':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Licensstatus</h2>
                            <p className="text-gray-500 dark:text-gray-400">Information om din nuvarande plan och licensstatus.</p>
                        </div>

                        {licenseLoading ? (
                            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3"></div>
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Aktiv Licens</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Din licens är giltig och aktiv</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Licensägare */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Users size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Licensägare</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            {licenseInfo?.customer || 'Okänd'}
                                        </span>
                                    </div>

                                    {/* Plan */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Package size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Plan</span>
                                        </div>
                                        <span className={`px-3 py-1.5 text-sm font-black uppercase rounded-lg ${licenseInfo?.tier === 'ENTERPRISE'
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            }`}>
                                            {licenseInfo?.tier || 'PRO'}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <ToggleLeft size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Status</span>
                                        </div>
                                        <span className={`flex items-center gap-2 text-sm font-bold ${licenseInfo?.status === 'valid'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                            {licenseInfo?.status === 'valid' ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Aktiv
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={16} />
                                                    {licenseInfo?.status || 'Okänd'}
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* Giltig till */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Giltig till</span>
                                        </div>
                                        <span className={`text-sm font-medium ${licenseInfo?.isExpiringSoon
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {licenseInfo?.expiry || 'Obegränsad'}
                                            {licenseInfo?.isExpiringSoon && licenseInfo?.daysRemaining && (
                                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                                    ({licenseInfo.daysRemaining} dagar kvar)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'server':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Serverinställningar</h2>
                            <p className="text-gray-500 dark:text-gray-400">Hantera databas, backups och serverinställningar.</p>
                        </div>

                        {/* BACKUP SECTION */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                                        <HardDrive size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Databasbackup</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Hantera säkerhetskopior av databasen</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreateBackup}
                                    disabled={creatingBackup}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    {creatingBackup ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : (
                                        <Plus size={18} />
                                    )}
                                    {creatingBackup ? 'Skapar...' : 'Skapa backup'}
                                </button>
                            </div>

                            {/* Backup Status */}
                            {backupStatus && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock size={18} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Senaste backup</span>
                                        </div>
                                        <span className={`text-lg font-bold ${backupStatus.lastBackup ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {backupStatus.lastBackup ? formatDate(backupStatus.lastBackup) : 'Ingen backup gjord'}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar size={18} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Nästa schemalagda</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {backupStatus.nextScheduledBackup ? formatDate(backupStatus.nextScheduledBackup) : 'Kl 02:00 varje dag'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Backup List */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Tillgängliga backups</h4>
                                {backupLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : backups.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <HardDrive size={48} className="mx-auto mb-3 opacity-50" />
                                        <p>Inga backups hittades</p>
                                        <p className="text-sm">Skapa din första backup ovan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {backups.map(backup => (
                                            <div
                                                key={backup.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{backup.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(backup.createdAt)} • {formatBytes(backup.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownloadBackup(backup.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Ladda ner"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBackup(backup.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Ta bort"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DATABASE CONNECTIONS SECTION */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Databasanslutningar</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Hantera primär- och backup-databaser</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddDbModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    <Plus size={18} />
                                    Lägg till
                                </button>
                            </div>

                            {/* Warning Banner */}
                            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-6">
                                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Viktigt vid databasbyte</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        Att byta databas kräver att systemet startas om. Se till att alla användare är utloggade innan du byter.
                                    </p>
                                </div>
                            </div>

                            {/* Database Connections List */}
                            {dbLoading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : dbConnections.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Database size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>Inga databasanslutningar konfigurerade</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dbConnections.map(conn => (
                                        <div
                                            key={conn.id}
                                            className={`p-4 rounded-xl border-2 transition-all ${conn.active
                                                ? 'bg-green-50 dark:bg-green-900/10 border-green-500'
                                                : 'bg-gray-50 dark:bg-[#282a2c] border-gray-200 dark:border-[#3c4043]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${conn.active
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                                        }`}>
                                                        <Server size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-gray-900 dark:text-white">{conn.name}</p>
                                                            {conn.active && (
                                                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                                                    AKTIV
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {conn.host}:{conn.port} / {conn.database}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!conn.active && (
                                                    <button
                                                        onClick={() => handleSwitchDatabase(conn.id)}
                                                        disabled={switchingDb === conn.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                                    >
                                                        {switchingDb === conn.id ? (
                                                            <RefreshCw size={16} className="animate-spin" />
                                                        ) : (
                                                            <RefreshCw size={16} />
                                                        )}
                                                        Byt till denna
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );


            case 'ai': {
                const aiModule = modules.find(m => m.moduleKey === 'AI_QUIZ');
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI-inställningar</h2>
                            <p className="text-gray-500 dark:text-gray-400">Generera quiz-frågor automatiskt från dokument med Google Gemini AI.</p>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${aiStatus?.available
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                    }`}>
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">AI-status</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {aiLoading ? 'Kontrollerar...' : aiStatus?.message}
                                    </p>
                                </div>
                            </div>

                            {aiLoading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Module Status */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Package size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Modul</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {aiStatus?.moduleEnabled ? (
                                                <span className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                                                    <CheckCircle2 size={16} />
                                                    Aktiverad
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                                                    <AlertTriangle size={16} />
                                                    Inaktiverad
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* API Status */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Cpu size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Gemini API</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {aiStatus?.apiConfigured ? (
                                                <span className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                                                    <CheckCircle2 size={16} />
                                                    Konfigurerad
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
                                                    <AlertTriangle size={16} />
                                                    Ej konfigurerad
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* License Requirement */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={20} className="text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Licenskrav</span>
                                        </div>
                                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg">
                                            PRO / ENTERPRISE
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* API Key Configuration Card */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                                    <Key size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">API-konfiguration</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Konfigurera Google Gemini API-nyckel
                                    </p>
                                </div>
                            </div>

                            {/* Current Key Status */}
                            {aiStatus?.maskedApiKey && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl mb-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={20} className="text-green-500" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nuvarande nyckel: </span>
                                            <code className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                {aiStatus.maskedApiKey}
                                            </code>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${aiStatus.keySource === 'database'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {aiStatus.keySource === 'database' ? 'Databas' : 'Miljövariabel'}
                                    </span>
                                </div>
                            )}

                            {/* API Key Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {aiStatus?.apiConfigured ? 'Uppdatera API-nyckel' : 'Ange Gemini API-nyckel'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full px-4 py-3 pr-24 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#282a2c] text-gray-900 dark:text-white font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveApiKey}
                                    disabled={savingApiKey || !apiKeyInput.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 rounded-xl font-medium transition-colors"
                                >
                                    {savingApiKey ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {savingApiKey ? 'Sparar...' : 'Spara API-nyckel'}
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Skapa en API-nyckel på <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                                </p>
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Åtgärder</h3>

                            <div className="space-y-3">
                                {/* Toggle Module */}
                                {aiModule && (
                                    <button
                                        onClick={() => handleToggleModule('AI_QUIZ', aiModule.active)}
                                        disabled={toggling === 'AI_QUIZ'}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${aiModule.active
                                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20'
                                            : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <ToggleLeft size={20} className={aiModule.active ? 'text-red-600' : 'text-green-600'} />
                                            <span className={`font-medium ${aiModule.active ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                                {aiModule.active ? 'Inaktivera AI Quiz-modul' : 'Aktivera AI Quiz-modul'}
                                            </span>
                                        </div>
                                        {toggling === 'AI_QUIZ' && (
                                            <RefreshCw size={18} className="animate-spin text-gray-400" />
                                        )}
                                    </button>
                                )}

                                {/* Open AI Quiz Generator */}
                                <button
                                    onClick={() => navigate('/ai-quiz')}
                                    disabled={!aiStatus?.available}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${aiStatus?.available
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <span style={{ display: 'none' }}>{navigate.toString()}</span>
                                    <Sparkles size={20} />
                                    Öppna AI Quiz-generatorn
                                </button>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <FileText size={18} />
                                Så fungerar AI Quiz
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">1.</span>
                                    <span>Ladda upp ett dokument (PDF, DOCX, TXT) eller klistra in text</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">2.</span>
                                    <span>Välj antal frågor (3-15) och svårighetsgrad</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">3.</span>
                                    <span>AI:n genererar relevanta flervalsfrågor baserat på innehållet</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">4.</span>
                                    <span>Redigera, justera och spara som ett quiz i din kurs</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            }

            case 'modules': {
                // Group modules by category
                const moduleCategories = {
                    'Utbildning': ['QUIZ_BASIC', 'QUIZ_PRO', 'AI_QUIZ', 'SUBMISSIONS', 'SCORM'],
                    'Kommunikation': ['CHAT', 'FORUM'],
                    'Gamification': ['GAMIFICATION', 'EDUGAME'],
                    'Analys & Rapporter': ['ANALYTICS'],
                    'Utseende': ['DARK_MODE', 'ENTERPRISE_WHITELABEL'],
                    'Övrigt': ['REVENUE']
                };

                // Sort modules into categories
                const categorizedModules = {};
                const usedKeys = new Set();

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
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Systemmoduler</h2>
                                <p className="text-gray-500 dark:text-gray-400">Aktivera eller inaktivera funktioner globalt. Vissa moduler kräver PRO/ENTERPRISE-licens.</p>
                            </div>
                            <button
                                onClick={handleSyncModules}
                                disabled={toggling === '__sync__'}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={toggling === '__sync__' ? 'animate-spin' : ''} />
                                {toggling === '__sync__' ? 'Synkar...' : 'Synka moduler'}
                            </button>
                        </div>

                        {Object.entries(categorizedModules).map(([category, categoryModules]) => (
                            <div key={category} className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                                {/* Category Header */}
                                <div className="px-5 py-3 bg-gray-50 dark:bg-[#282a2c] border-b border-gray-200 dark:border-[#3c4043]">
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{category}</h3>
                                </div>

                                {/* Modules Grid */}
                                <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {categoryModules.map(mod => {
                                        const ModuleIcon = getModuleIcon(mod.moduleKey);

                                        // Specific Dependency Checks
                                        let dependencyMet = true;
                                        let dependencyMsg = "";

                                        if (mod.moduleKey === 'EDUGAME') {
                                            const gamificationMod = modules.find(m => m.moduleKey === 'GAMIFICATION');
                                            if (!gamificationMod || !gamificationMod.active) {
                                                dependencyMet = false;
                                                dependencyMsg = "Kräver Gamification Engine";
                                            }
                                        }

                                        return (
                                            <div
                                                key={mod.moduleKey}
                                                className={`flex items-center gap-4 px-5 py-4 transition-colors ${!dependencyMet ? 'bg-gray-50/50 dark:bg-gray-900/10 opacity-60' : 'hover:bg-gray-50 dark:hover:bg-[#282a2c]/50'
                                                    }`}
                                            >
                                                {/* Module Icon */}
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.active
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-gray-100 dark:bg-[#333] text-gray-400'
                                                    }`}>
                                                    <ModuleIcon size={20} />
                                                </div>

                                                {/* Module Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{mod.name}</h4>
                                                        {mod.requiresLicense && (
                                                            <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">PRO</span>
                                                        )}
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">v{mod.version}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{mod.description}</p>
                                                    {!dependencyMet && (
                                                        <div className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium">
                                                            <AlertTriangle size={12} /> {dependencyMsg}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Badge */}
                                                <div className="flex-shrink-0 hidden sm:block">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${mod.active
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                                                        }`}>
                                                        {mod.active ? 'AKTIV' : 'INAKTIV'}
                                                    </span>
                                                </div>

                                                {/* Toggle Switch */}
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => handleToggleModule(mod.moduleKey, mod.active)}
                                                        disabled={toggling === mod.moduleKey || !dependencyMet}
                                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${mod.active
                                                            ? 'bg-indigo-500'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                            } ${(toggling === mod.moduleKey || !dependencyMet) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${mod.active ? 'translate-x-5' : 'translate-x-0'
                                                            }`}>
                                                            {toggling === mod.moduleKey && (
                                                                <RefreshCw size={12} className="absolute inset-0 m-auto animate-spin text-gray-400" />
                                                            )}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Aktiv modul</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[9px] font-bold">PRO</span>
                                <span>Kräver PRO/ENTERPRISE-licens</span>
                            </div>
                        </div>
                    </div>
                );
            }

            default:
                return <div className="p-8 text-center text-gray-500">Välj en kategori i menyn</div>;
        }
    };

    return (
        <div className={asTab ? "animate-in fade-in" : "p-8 max-w-7xl mx-auto animate-in fade-in pb-20"}>
            {!asTab && (
                <>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Systeminställningar</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Hantera globala inställningar, utseende och licenser för EduFlex.</p>
                </>
            )}

            <div className="flex bg-gray-50 dark:bg-[#151718] min-h-[600px] rounded-lg border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                {/* SIDEBAR */}
                <aside className={`bg-white dark:bg-[#1e2022] w-64 border-r border-gray-200 dark:border-[#3c4043] flex-shrink-0 flex flex-col ${mobileMenuOpen ? 'block absolute z-50 h-full' : 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-gray-200 dark:border-[#3c4043] flex items-center justify-between">
                        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">Inställningar</h2>
                        <button className="md:hidden" onClick={() => setMobileMenuOpen(false)}>✕</button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                        {menuItems.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
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
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${item.disabled
                                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : activeTab === item.id
                                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282a2c]'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                            {item.disabled && <Lock size={14} className="ml-auto" />}
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
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-gray-100 dark:bg-[#282a2c] rounded">
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
