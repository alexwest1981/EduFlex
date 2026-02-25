import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import bankIdLogo from '../../assets/auth/bankid-logo.png';
import keycloakLogo from '../../assets/auth/keycloak-logo.png';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const context = useAppContext();

    // Defensive coding for Context
    if (!context) {
        console.error("Login component: AppContext is missing/undefined!");
    }
    const { login, API_BASE = '/api' } = context || {};

    // UI States
    const [formData, setFormData] = useState({ username: '', password: '' });
    // Allow manual tenant override if not detected
    const [manualTenantId, setManualTenantId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // MFA States
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');

    // Initial check for URL param ?tenantId=...
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tenantParam = params.get('tenantId');
        if (tenantParam) {
            setManualTenantId(tenantParam);
        }
    }, [setManualTenantId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const getTenantId = () => {
        // 1. Manuell input (prioritet)
        if (manualTenantId) return manualTenantId;

        // 2. Hostname detection
        const hostname = window.location.hostname;
        const forcedTenant = localStorage.getItem('force_tenant');
        if (forcedTenant === 'public') return null;
        if (forcedTenant) return forcedTenant;
        if (/^[\d.]+$/.test(hostname)) return null;
        if (hostname.includes('ngrok') || hostname.includes('loca.lt') || hostname.includes('trycloudflare.com')) {
            return null;
        }
        if (hostname.endsWith('.localhost') && hostname !== 'localhost') return hostname.split('.')[0];
        const parts = hostname.split('.');
        if (parts.length > 2) {
            const subdomain = parts[0];
            if (['www', 'api', 'eduflexlms'].includes(subdomain)) return null;
            return subdomain;
        }
        return null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
            const tenantId = getTenantId();
            const headers = { 'Content-Type': 'application/json' };
            if (tenantId) headers['X-Tenant-ID'] = tenantId;

            // IF MFA IS REQUIRED, WE USE A DIFFERENT ENDPOINT
            if (mfaRequired) {
                const response = await fetch(`${baseUrl}/auth/verify-mfa`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ username: formData.username, code: mfaCode })
                });

                const data = await response.json();
                if (response.ok) {
                    processLoginSuccess(data, tenantId);
                } else {
                    setError(data.message || 'Ogiltig MFA-kod.');
                }
                return;
            }

            // REGULAR LOGIN
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            const data = contentType && contentType.indexOf("application/json") !== -1
                ? await response.json()
                : { message: await response.text() };

            if (response.ok) {
                if (data.mfaRequired) {
                    setMfaRequired(true);
                    return;
                }
                processLoginSuccess(data, tenantId);
            } else {
                setError(data.message || t('messages.login_failed') || 'Fel användarnamn eller lösenord.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(t('messages.login_error') || 'Kunde inte ansluta till servern.');
        } finally {
            setIsLoading(false);
        }
    };

    const processLoginSuccess = (data, tenantId) => {
        if (data.token) {
            localStorage.setItem('token', data.token);

            const userObj = {
                id: data.id,
                username: data.username,
                firstName: data.firstName || data.username,
                lastName: data.lastName || '',
                fullName: data.fullName || data.username,
                role: data.role,
                profilePictureUrl: data.profilePictureUrl || null,
                points: data.points || 0,
                level: data.level || 1,
                earnedBadges: data.earnedBadges || []
            };

            if (login) {
                login(userObj, data.token, tenantId);
            }

            navigate('/');
        } else {
            setError('Servern skickade ett ofullständigt svar (ingen token).');
        }
    };

    const handleKeycloakLogin = () => {
        // Redirect directly to the Spring Security OAuth2 authorization endpoint
        const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        window.location.href = `${baseUrl}/oauth2/authorization/keycloak`;
    };

    const handleGoogleLogin = () => {
        console.log("Google login not implemented yet");
        alert("Google login is coming soon!");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] p-4 font-sans transition-colors duration-300">
            <div className="max-w-[400px] w-full bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* HEADER */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 pt-12 pb-8 text-center relative overflow-hidden">
                    {/* Decorative background circle */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl font-black shadow-xl shadow-indigo-900/20 select-none transform transition-transform hover:scale-105">
                        E
                    </div>
                    <h2 className="relative text-2xl font-bold text-white mb-2 tracking-tight">{t('auth.login_header') || 'Logga in'}</h2>
                    <p className="relative text-indigo-100 text-sm font-medium opacity-90">Välkommen tillbaka till EduFlex</p>
                </div>

                {/* FORMULÄR */}
                <div className="p-8 pt-10">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* MFA CODE INPUT (Conditional) */}
                        {mfaRequired ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    MFA-kod (Från din app)
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#131314] transition-all font-medium text-sm shadow-sm"
                                        placeholder="000000"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMfaRequired(false)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 ml-1 hover:underline underline-offset-2"
                                >
                                    Tillbaka till lösenord
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* ORGANIZATION ID (Optional/Advanced) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                        Organization ID (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#131314] transition-all font-medium text-sm shadow-sm"
                                            placeholder="e.g. saas-test-school"
                                            value={manualTenantId}
                                            onChange={(e) => setManualTenantId(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* ANVÄNDARNAMN */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                        {t('auth.username') || 'Användarnamn'}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            name="username"
                                            type="text"
                                            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#131314] transition-all font-medium text-sm shadow-sm"
                                            placeholder="Ditt användarnamn"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <User size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* LÖSENORD */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                        {t('auth.password') || 'Lösenord'}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            name="password"
                                            type="password"
                                            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#131314] transition-all font-medium text-sm shadow-sm"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Lock size={20} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* LOGIN KNAPP */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 dark:shadow-none transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                            <span className="text-sm">
                                {isLoading ? (t('common.loading') || 'Loggar in...') : (mfaRequired ? 'Verifiera kod' : (t('auth.login_button') || 'Logga in'))}
                            </span>
                        </button>
                    </form>

                    {/* Footer Links and Social Login (Abbreviated for clarity) */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-[#3c4043]"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#1E1F20] px-3 text-gray-400 font-bold tracking-wider">Eller</span></div>
                    </div>
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => window.location.href = `${API_BASE}/oauth2/authorization/bankid`}
                            className="w-full bg-white dark:bg-[#282a2c] hover:bg-gray-50 dark:hover:bg-[#3c4043] text-gray-700 dark:text-white font-bold py-3.5 rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-[#003f8a] transition-all flex items-center justify-center gap-3 group text-sm shadow-sm hover:shadow-md"
                        >
                            <img src={bankIdLogo} alt="BankID" className="h-6 w-auto object-contain" />
                            Logga in med BankID
                        </button>

                        <button
                            type="button"
                            onClick={handleKeycloakLogin}
                            className="w-full bg-white dark:bg-[#282a2c] hover:bg-gray-50 dark:hover:bg-[#3c4043] text-gray-700 dark:text-white font-bold py-3.5 rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-blue-400 transition-all flex items-center justify-center gap-3 group text-sm shadow-sm hover:shadow-md"
                        >
                            <img src={keycloakLogo} alt="Keycloak" className="h-5 w-auto object-contain" />
                            Logga in med Keycloak (SSO)
                        </button>
                        <button type="button" onClick={handleGoogleLogin} className="w-full bg-white dark:bg-[#282a2c] hover:bg-gray-50 dark:hover:bg-[#3c4043] text-gray-700 dark:text-white font-bold py-3.5 rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-gray-300 dark:hover:border-gray-500 transition-all flex items-center justify-center gap-3 group text-sm shadow-sm hover:shadow-md">
                            Logga in med Google
                        </button>
                    </div>

                    <p className="text-center mt-8 text-xs text-gray-400 font-medium">
                        {t('auth.no_account') || 'Har du inget konto?'} <span className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Kontakta Admin</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;
