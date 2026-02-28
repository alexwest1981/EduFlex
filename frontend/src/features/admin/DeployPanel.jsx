import React, { useState } from 'react';
import { Rocket, Copy, Check, Server, Globe, Terminal, RefreshCw, CheckCircle, Clock, Play } from 'lucide-react';
import logoMain from '../../assets/images/logo_main.png';
import { useAppContext } from '../../context/AppContext';

const DeployPanel = () => {
    const [copiedCmd, setCopiedCmd] = useState(null);
    const [deployLog, setDeployLog] = useState([]);
    const [serviceStatus, setServiceStatus] = useState({});
    const [checking, setChecking] = useState(false);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedCmd(id);
        setTimeout(() => setCopiedCmd(null), 2000);
    };

    const commands = [
        {
            id: 'backend',
            label: 'Bygga & starta om backend',
            cmd: 'docker compose up -d --build backend',
            description: 'Bygger om Spring Boot-backend med nya ändringar och startar om containern.',
            color: 'indigo'
        },
        {
            id: 'frontend',
            label: 'Bygga & starta om frontend',
            cmd: 'docker compose up -d --build frontend',
            description: 'Bygger om React-frontend och startar om containern.',
            color: 'emerald'
        },
        {
            id: 'both',
            label: 'Bygga & starta om båda',
            cmd: 'docker compose up -d --build backend frontend',
            description: 'Bygger om både backend och frontend.',
            color: 'amber'
        },
        {
            id: 'all',
            label: 'Fullständig omstart (alla tjänster)',
            cmd: 'docker compose up -d --build',
            description: 'Bygger om och startar om ALLA tjänster (inkl. databas, Redis, MinIO, etc).',
            color: 'red'
        },
        {
            id: 'deploy-script',
            label: 'Kör deploy-skript (PowerShell)',
            cmd: '.\\deploy.ps1',
            description: 'Kör det automatiska deploy-skriptet med git-check, build och health check.',
            color: 'purple'
        }
    ];

    const statusChecks = [
        { label: 'Backend API', url: '/api/actuator/health', key: 'backend' },
        { label: 'Frontend App', url: '/', key: 'frontend' },
        { label: 'Database (PG)', url: '/api/admin/database/connections', key: 'db' },
        { label: 'MinIO Storage', url: '/api/files/health', key: 'minio' },
        { label: 'Redis Cache', url: '/api/actuator/health', key: 'redis' },
        { label: 'OnlyOffice', url: '/api/onlyoffice/health', key: 'onlyoffice' },
        { label: 'Video Service', url: '/api/ai-video/health', key: 'video' },
        { label: 'PDF Service', url: '/api/templates/health', key: 'pdf' },
    ];

    const { API_BASE = '/api' } = useAppContext() || {};
    const [startingAll, setStartingAll] = useState(false);

    const checkServices = async () => {
        setChecking(true);
        const results = {};

        for (const svc of statusChecks) {
            try {
                const start = Date.now();
                const res = await fetch(svc.url, { method: 'GET', signal: AbortSignal.timeout(5000) });
                const latency = Date.now() - start;
                results[svc.key] = { ok: res.ok, latency, status: res.status };
            } catch {
                results[svc.key] = { ok: false, latency: 0, status: 'Offline' };
            }
        }

        setServiceStatus(results);
        setChecking(false);
    };

    const handleStartAll = async () => {
        if (!window.confirm("Är du säker på att du vill starta ALLA tjänster? Detta kan ta några minuter.")) return;

        setStartingAll(true);
        try {
            const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
            const res = await fetch(`${baseUrl}/admin/system/start-all`, { method: 'POST' });
            if (res.ok) {
                alert("Start-kommando skickat! Uppdatera status om en liten stund.");
                setTimeout(checkServices, 5000);
            } else {
                alert("Misslyckades att starta tjänster.");
            }
        } catch (err) {
            console.error("Start all error:", err);
            alert("Ett fel uppstod vid start av tjänster.");
        } finally {
            setStartingAll(false);
        }
    };

    React.useEffect(() => { checkServices(); }, []);

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043]">
                        <img src={logoMain} alt="EduFlex Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">EduFlex Ops</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kontrollcenter för systemdrift och microservices
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleStartAll}
                    disabled={startingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {startingAll ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    Starta ALLA tjänster
                </button>
            </div>

            {/* SERVICE STATUS */}
            <div className="bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-200 dark:border-[#3c4043] p-5">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Server size={16} /> Tjänstestatus
                    </h4>
                    <button
                        onClick={checkServices}
                        disabled={checking}
                        className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                        <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
                        {checking ? 'Kontrollerar...' : 'Uppdatera'}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {statusChecks.map(svc => {
                        const status = serviceStatus[svc.key];
                        return (
                            <div
                                key={svc.key}
                                className={`flex items-center justify-between p-3 rounded-lg border ${status?.ok
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                    : status
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                                        : 'bg-gray-100 dark:bg-[#282a2c] border-gray-200 dark:border-[#3c4043]'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {status?.ok ? (
                                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                    ) : status ? (
                                        <Clock size={16} className="text-red-500" />
                                    ) : (
                                        <Clock size={16} className="text-gray-400" />
                                    )}
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{svc.label}</span>
                                </div>
                                {status && (
                                    <span className={`text-xs font-mono ${status.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                        {status.ok ? `${status.latency}ms` : status.status}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DEPLOY COMMANDS */}
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Terminal size={16} /> Deploy-kommandon
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Kopiera kommandot och klistra in i PowerShell i projektmappen.
                </p>
                <div className="space-y-3">
                    {commands.map(cmd => (
                        <div
                            key={cmd.id}
                            className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{cmd.label}</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{cmd.description}</p>
                                    <code className="block bg-gray-900 dark:bg-black text-green-400 px-3 py-2 rounded-lg text-xs font-mono">
                                        {cmd.cmd}
                                    </code>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(cmd.cmd, cmd.id)}
                                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${copiedCmd === cmd.id
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        : 'bg-gray-100 dark:bg-[#282a2c] text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                        }`}
                                    title="Kopiera till urklipp"
                                >
                                    {copiedCmd === cmd.id ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* QUICK INFO */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-xl p-5">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Infrastruktur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-indigo-800 dark:text-indigo-300">
                    <div><span className="font-bold">Domän:</span> eduflexlms.se</div>
                    <div><span className="font-bold">Tunnel:</span> Cloudflare Tunnel</div>
                    <div><span className="font-bold">Backend:</span> Spring Boot (port 8080)</div>
                    <div><span className="font-bold">Frontend:</span> React/Vite (port 5173)</div>
                    <div><span className="font-bold">Databas:</span> PostgreSQL (port 5433)</div>
                    <div><span className="font-bold">Storage:</span> MinIO (port 9000)</div>
                </div>
            </div>
        </div>
    );
};

export default DeployPanel;
