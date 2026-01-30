import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Server, Globe, Key, Lock, ExternalLink, Copy } from 'lucide-react';
import { api } from '../../services/api';

const LtiPlatformManager = () => {
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editPlatform, setEditPlatform] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        issuer: '',
        clientId: '',
        authUrl: '',
        tokenUrl: '',
        jwksUrl: '',
        deploymentId: '',
        tenantId: ''
    });

    useEffect(() => {
        fetchPlatforms();
    }, []);

    const fetchPlatforms = async () => {
        setLoading(true);
        try {
            const data = await api.lti.getAll();
            setPlatforms(data || []);
        } catch (error) {
            console.error("Failed to load LTI platforms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (platform) => {
        setEditPlatform(platform);
        setFormData({
            issuer: platform.issuer,
            clientId: platform.clientId,
            authUrl: platform.authUrl,
            tokenUrl: platform.tokenUrl,
            jwksUrl: platform.jwksUrl,
            deploymentId: platform.deploymentId || '',
            tenantId: platform.tenantId || ''
        });
        setIsEditing(true);
    };

    const handleAdd = () => {
        setEditPlatform(null);
        setFormData({
            issuer: '',
            clientId: '',
            authUrl: '',
            tokenUrl: '',
            jwksUrl: '',
            deploymentId: '',
            tenantId: ''
        });
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (editPlatform) {
                payload.id = editPlatform.id;
            }
            await api.lti.save(payload);
            setIsEditing(false);
            fetchPlatforms();
        } catch (error) {
            alert("Kunde inte spara plattform: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Är du säker på att du vill ta bort denna koppling? Detta kommer att stoppa alla inloggningar från detta LMS.")) return;
        try {
            await api.lti.delete(id);
            fetchPlatforms();
        } catch (error) {
            alert("Kunde inte ta bort plattform: " + error.message);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    if (isEditing) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {editPlatform ? 'Redigera LTI-koppling' : 'Ny LTI-koppling'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Konfigurera anslutningen mot ett externt LMS (t.ex. Canvas, Moodle).
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 bg-gray-100 dark:bg-[#333] rounded-lg hover:bg-gray-200 dark:hover:bg-[#444]"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Issuer */}
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Issuer (ISS)
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Globe size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="https://canvas.instructure.com"
                                    value={formData.issuer}
                                    onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">URL som identifierar LMS:et (finns ofta i OIDC-konfig).</p>
                        </div>

                        {/* Client ID */}
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Client ID
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Key size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="10000000000001"
                                    value={formData.clientId}
                                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* OIDC Auth URL */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                OIDC Auth URL
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Lock size={18} className="text-gray-400" />
                                <input
                                    type="url"
                                    required
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="https://sso.canvaslms.com/api/lti/authorize_redirect"
                                    value={formData.authUrl}
                                    onChange={e => setFormData({ ...formData, authUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Token URL */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Access Token URL
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Key size={18} className="text-gray-400" />
                                <input
                                    type="url"
                                    required
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="https://sso.canvaslms.com/login/oauth2/token"
                                    value={formData.tokenUrl}
                                    onChange={e => setFormData({ ...formData, tokenUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* JWKS URL */}
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                JWKS URL (Public Keys)
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Key size={18} className="text-gray-400" />
                                <input
                                    type="url"
                                    required
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="https://sso.canvaslms.com/api/lti/security/jwks"
                                    value={formData.jwksUrl}
                                    onChange={e => setFormData({ ...formData, jwksUrl: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">URL där LMS:et publicerar sina publika nycklar.</p>
                        </div>

                        {/* Deployment ID */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Deployment ID (Valfri)
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Server size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="d73282..."
                                    value={formData.deploymentId}
                                    onChange={e => setFormData({ ...formData, deploymentId: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tenant ID Mapping */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Mappa till Tenant ID
                            </label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-xl px-4 py-3">
                                <Globe size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                                    placeholder="public"
                                    value={formData.tenantId}
                                    onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Denna plattform loggar in användare i detta schema.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#3c4043]">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
                        >
                            Spara Koppling
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">LTI Integrationer</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Hantera kopplingar till externa LMS för Single Sign-On och Deep Linking.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                >
                    <Plus size={18} />
                    Ny Koppling
                </button>
            </div>

            {/* Quick Guide */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Server size={18} /> Konfigurationsuppgifter för LMS
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
                    Använd dessa URL:er när du konfigurerar EduFlex som ett verktyg i Canvas, Moodle eller Blackboard.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#1E1F20] p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-bold text-gray-500 uppercase">Redirect URI</span>
                        <div className="flex items-center justify-between mt-1">
                            <code className="text-sm text-gray-900 dark:text-white font-mono">
                                https://eduflexlms.se/api/lti/launch
                            </code>
                            <button onClick={() => copyToClipboard('https://eduflexlms.se/api/lti/launch')} className="p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded">
                                <Copy size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E1F20] p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-bold text-gray-500 uppercase">Login Initiation URL</span>
                        <div className="flex items-center justify-between mt-1">
                            <code className="text-sm text-gray-900 dark:text-white font-mono">
                                https://eduflexlms.se/api/lti/login_init
                            </code>
                            <button onClick={() => copyToClipboard('https://eduflexlms.se/api/lti/login_init')} className="p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded">
                                <Copy size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E1F20] p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-bold text-gray-500 uppercase">Public JWK Set URL</span>
                        <div className="flex items-center justify-between mt-1">
                            <code className="text-sm text-gray-900 dark:text-white font-mono">
                                https://eduflexlms.se/api/lti/jwks
                            </code>
                            <button onClick={() => copyToClipboard('https://eduflexlms.se/api/lti/jwks')} className="p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded">
                                <Copy size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : platforms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-[#1E1F20] rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#3c4043]">
                    <Globe size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inga kopplingar än</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                        Lägg till din första LTI-koppling för att låta användare logga in från andra lärplattformar.
                    </p>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-2 bg-white dark:bg-[#282a2c] text-indigo-600 font-bold rounded-xl border border-gray-200 dark:border-[#3c4043] hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
                    >
                        Lägg till Koppling
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {platforms.map(platform => (
                        <div
                            key={platform.id}
                            className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                                            {platform.issuer}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            ID: {platform.clientId}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(platform)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(platform.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className={`w-2 h-2 rounded-full ${platform.authUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="truncate flex-1" title={platform.authUrl}>{platform.authUrl || 'Ingen Auth URL'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className={`w-2 h-2 rounded-full ${platform.jwksUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="truncate flex-1" title={platform.jwksUrl}>{platform.jwksUrl || 'Ingen JWKS URL'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LtiPlatformManager;
