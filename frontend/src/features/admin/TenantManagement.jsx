import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Plus, Trash2, Edit2, CheckCircle, Database, Server, RefreshCw, Layers, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TenantManagement() {
    const { t } = useTranslation();
    const [tenants, setTenants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        tenantId: '',
        schema: '',
        dbUrl: '',
        dbUsername: '',
        dbPassword: '',
        tier: 'BASIC',
        allowedModules: []
    });
    const [availableModules, setAvailableModules] = useState([]);

    useEffect(() => {
        fetchTenants();
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const data = await api.system.getModules();
            setAvailableModules(data);
        } catch (error) {
            console.error("Failed to fetch modules", error);
        }
    };

    const fetchTenants = async () => {
        setIsLoading(true);
        try {
            const data = await api.tenants.getAll();
            setTenants(data);
        } catch (error) {
            console.error("Failed to fetch tenants", error);
            toast.error("Kunde inte hämta tenants");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.tenants.create({
                ...formData,
                allowedModules: formData.allowedModules.join(',')
            });
            toast.success("Tenant skapad!");
            setShowModal(false);
            setFormData({
                name: '',
                tenantId: '',
                schema: '',
                dbUrl: '',
                dbUsername: '',
                dbPassword: '',
                tier: 'BASIC',
                allowedModules: []
            });
        } catch (error) {
            console.error("Failed to create tenant", error);
            toast.error("Kunde inte skapa tenant. ID kanske redan finns?");
        } finally {
            setIsCreating(false);
        }
    };

    const handleInitSchema = async (id, name) => {
        if (!window.confirm(`Vill du initiera databasschemat för ${name}? Detta kommer skapa tabeller.`)) return;

        const toastId = toast.loading("Initierar schema...");
        try {
            await api.tenants.initSchema(id);
            toast.success("Schema initierat!", { id: toastId });
        } catch (error) {
            toast.error("Misslyckades att initiera schema", { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker? Detta kan inte ångras.")) return;
        try {
            await api.tenants.delete(id);
            toast.success("Tenant borttagen");
            fetchTenants();
        } catch (error) {
            toast.error("Kunde inte ta bort tenant");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Laddar tenants...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Server className="w-6 h-6 text-indigo-500" />
                        Tenant Management
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Hantera organisationer och databaskopplingar</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus size={18} />
                    Ny Tenant
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tenants.map(tenant => (
                    <div key={tenant.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                    <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tenant.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-mono border border-gray-200 dark:border-gray-600">
                                            ID: {tenant.tenantId}
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-mono border border-blue-100 dark:border-blue-800">
                                            Schema: {tenant.schema}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${tenant.tier === 'ENTERPRISE'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 border-purple-200'
                                            : tenant.tier === 'PRO'
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 border-indigo-200'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 border-green-200'
                                            }`}>
                                            {tenant.tier}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {tenant.allowedModules ? (
                                            tenant.allowedModules.split(',').map(m => (
                                                <span key={m} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full text-[10px] uppercase font-bold">
                                                    {m}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Alla moduler tillgängliga</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2 font-mono break-all">
                                        {tenant.dbUrl || "Using Default Connection"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleInitSchema(tenant.id, tenant.name)}
                                    title="Initiera/Uppdatera Schema"
                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(tenant.id)}
                                    title="Ta bort"
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {tenants.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Inga tenants hittades</h3>
                        <p className="text-gray-500">Börja med att skapa din första tenant.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ny Tenant</h3>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Namn (Display Name)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="T.ex. Acme Corp"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenant ID</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                                        placeholder="acme"
                                        value={formData.tenantId}
                                        onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Används i URL (acme.eduflex.local)</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Licensplan</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['BASIC', 'PRO', 'ENTERPRISE'].map(tier => (
                                        <button
                                            key={tier}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tier })}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${formData.tier === tier
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                }`}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Whitelistade Moduler</h4>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Inaktiva moduler döljs för tenant</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {availableModules.map(module => (
                                        <label
                                            key={module.moduleKey}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.allowedModules.includes(module.moduleKey)
                                                ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
                                                : 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.allowedModules.includes(module.moduleKey)}
                                                    onChange={() => {
                                                        const current = [...formData.allowedModules];
                                                        if (current.includes(module.moduleKey)) {
                                                            setFormData({ ...formData, allowedModules: current.filter(m => m !== module.moduleKey) });
                                                        } else {
                                                            setFormData({ ...formData, allowedModules: [...current, module.moduleKey] });
                                                        }
                                                    }}
                                                />
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.allowedModules.includes(module.moduleKey)
                                                    ? 'bg-indigo-600 border-indigo-600'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {formData.allowedModules.includes(module.moduleKey) && <CheckCircle className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{module.name}</span>
                                                <span className="text-[10px] text-gray-500 line-clamp-1">{module.moduleKey}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Separat Databas (Valfritt)</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                                        placeholder="JDBC URL (Lämna tomt för default)"
                                        value={formData.dbUrl}
                                        onChange={e => setFormData({ ...formData, dbUrl: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            placeholder="Username"
                                            value={formData.dbUsername}
                                            onChange={e => setFormData({ ...formData, dbUsername: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            placeholder="Password"
                                            value={formData.dbPassword}
                                            onChange={e => setFormData({ ...formData, dbPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isCreating && <RefreshCw className="animate-spin w-4 h-4" />}
                                    Skapa Tenant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
