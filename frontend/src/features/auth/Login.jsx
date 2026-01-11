import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, API_BASE } = useAppContext();

    // UI States
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Kontrollera att API_BASE inte slutar med snedstreck för att undvika dubbla //
            const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token) {

                    // --- VIKTIGT: Spara Token Explicit ---
                    localStorage.setItem('token', data.token);
                    // -------------------------------------

                    // Bygg användarobjektet
                    const userObj = {
                        id: data.id,
                        username: data.username,
                        firstName: data.firstName || data.username, // Fallback
                        lastName: data.lastName || '',
                        fullName: data.fullName || data.username,   // Fallback
                        role: data.role,
                        profilePictureUrl: data.profilePictureUrl || null,
                        points: data.points || 0,
                        level: data.level || 1,
                        earnedBadges: data.earnedBadges || []
                    };

                    // Anropa context-funktionen för att uppdatera state i hela appen
                    if (login) {
                        login(userObj, data.token);
                    }

                    navigate('/');
                } else {
                    console.error("Svaret saknade token:", data);
                    setError('Servern skickade ett ofullständigt svar (ingen token).');
                }
            } else {
                setError(t('messages.login_failed') || 'Fel användarnamn eller lösenord.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(t('messages.login_error') || 'Kunde inte ansluta till servern.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to backend OAuth2 endpoint
        // NOTE: In production, use the actual backend URL from environment
        const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        window.location.href = `${baseUrl}/oauth2/authorization/google`;
    };

    const handleGithubLogin = () => {
        const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        window.location.href = `${baseUrl}/oauth2/authorization/github`;
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
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">

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

                        {/* LOGIN KNAPP */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 dark:shadow-none transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                            <span className="text-sm">{isLoading ? (t('common.loading') || 'Loggar in...') : (t('auth.login_button') || 'Logga in')}</span>
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-[#3c4043]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#1E1F20] px-3 text-gray-400 font-bold tracking-wider">Eller</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* GOOGLE KNAPP */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white dark:bg-[#282a2c] hover:bg-gray-50 dark:hover:bg-[#3c4043] text-gray-700 dark:text-white font-bold py-3.5 rounded-xl border border-gray-200 dark:border-[#3c4043] hover:border-gray-300 dark:hover:border-gray-500 transition-all flex items-center justify-center gap-3 group text-sm shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Logga in med Google
                        </button>

                        {/* GITHUB KNAPP */}
                        <button
                            onClick={handleGithubLogin}
                            className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-bold py-3.5 rounded-xl border border-transparent transition-all flex items-center justify-center gap-3 group text-sm shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Logga in med GitHub
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