import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import { Plus, Trash2, Globe, Link as LinkIcon, Lock, Key, Loader2, Save, X, Cloud, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import OnlyOfficeSettings from '../../system/OnlyOfficeSettings';

const AdminIntegrations = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('lti');
    const [platforms, setPlatforms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        issuer: '',
        clientId: '',
        authUrl: '',
        tokenUrl: '',
        jwksUrl: ''
    });

    useEffect(() => {
        fetchPlatforms();
    }, []);

    const fetchPlatforms = async () => {
        setIsLoading(true);
        try {
            const data = await api.lti.getAll();
            setPlatforms(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Kunde inte hämta integrationer");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker? Detta kan bryta kopplingen för befintliga användare.")) return;
        try {
            await api.lti.delete(id);
            toast.success("Raderad");
            fetchPlatforms();
        } catch (error) {
            toast.error("Kunde inte radera");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.lti.save(formData);
            toast.success("Sparad!");
            setShowForm(false);
            setFormData({ issuer: '', clientId: '', authUrl: '', tokenUrl: '', jwksUrl: '' });
            fetchPlatforms();
        } catch (error) {
            toast.error("Kunde inte spara");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in">
            {/* TAB SELECTOR */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-8">
                <button
                    onClick={() => setActiveTab('lti')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'lti'
                        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Globe size={18} /> LTI / LMS
                </button>
                <button
                    onClick={() => setActiveTab('onlyoffice')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'onlyoffice'
                        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Cloud size={18} /> ONLYOFFICE
                </button>
            </div>

            {activeTab === 'onlyoffice' ? (
                <OnlyOfficeSettings />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                <Globe className="text-indigo-600" />
                                Externa Tjänster (LTI)
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">Hantera kopplingar till lärplattformar (Canvas, Moodle, etc)</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            {showForm ? <X size={20} /> : <Plus size={20} />}
                            {showForm ? 'Avbryt' : 'Ny Integration'}
                        </button>
                    </div>

                    {/* ADD FORM */}
                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg mb-8 animate-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">Lägg till LTI 1.3 Plattform</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Issuer (ISS)</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="https://canvas.instructure.com"
                                            value={formData.issuer}
                                            onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="10000000000001"
                                            value={formData.clientId}
                                            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">OIDC Auth URL</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="https://canvas.instructure.com/api/lti/authorize_redirect"
                                            value={formData.authUrl}
                                            onChange={e => setFormData({ ...formData, authUrl: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Access Token URL</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="https://canvas.instructure.com/login/oauth2/token"
                                            value={formData.tokenUrl}
                                            onChange={e => setFormData({ ...formData, tokenUrl: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">JWKS URL</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="https://canvas.instructure.com/api/lti/security/jwks"
                                            value={formData.jwksUrl}
                                            onChange={e => setFormData({ ...formData, jwksUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        Spara Integration
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* LIST */}
                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
                    ) : platforms.length === 0 ? (
                        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <Globe size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inga integrationer än</h3>
                            <p className="text-gray-500">Lägg till en LTI-plattform för att börja.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {platforms.map(p => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{p.issuer}</h3>
                                            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full border border-indigo-200">LTI 1.3</span>
                                        </div>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <div className="flex items-center gap-2"><Key size={14} /> Client ID: {p.clientId}</div>
                                            <div className="flex items-center gap-2"><LinkIcon size={14} /> Auth: {p.authUrl}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Radera"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* INSTRUCTIONS */}
                    <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Lock size={18} />
                            Konfigurera i ditt LMS
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            När du lägger till EduFlex som ett externt verktyg i Canvas/Moodle, använd följande URL:er:
                        </p>
                        <div className="grid gap-2 text-sm font-mono bg-white dark:bg-black/20 p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Login Init URL:</span>
                                <span className="select-all">{window.location.origin}/api/lti/login_init</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Redirect URI (Launch):</span>
                                <span className="select-all">{window.location.origin}/api/lti/launch</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Public Keys (JWKS):</span>
                                <span className="select-all">{window.location.origin}/api/lti/jwks</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminIntegrations;
