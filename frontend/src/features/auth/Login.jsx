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
        alert("Google-inloggning är inte konfigurerad än.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] p-4 font-sans transition-colors duration-300">
            <div className="max-w-[400px] w-full bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* HEADER */}
                <div className="bg-indigo-600 px-8 pt-12 pb-8 text-center">
                    <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-lg select-none">
                        E
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{t('auth.login_header') || 'Logga in'}</h2>
                    <p className="text-indigo-200 text-sm font-medium">Välkommen tillbaka till EduFlex</p>
                </div>

                {/* FORMULÄR */}
                <div className="p-8 pt-10">
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* ANVÄNDARNAMN */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                {t('auth.username') || 'Användarnamn'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#131314] transition-all font-medium text-sm"
                                    placeholder="Ditt användarnamn"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* LÖSENORD */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                {t('auth.password') || 'Lösenord'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#131314] transition-all font-medium text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* LOGIN KNAPP */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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

                    {/* GOOGLE KNAPP */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white dark:bg-[#282a2c] hover:bg-gray-50 dark:hover:bg-[#3c4043] text-gray-700 dark:text-white font-bold py-3.5 rounded-xl border border-gray-200 dark:border-[#3c4043] transition-all flex items-center justify-center gap-3 group text-sm"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Logga in med Google
                    </button>

                    <p className="text-center mt-8 text-xs text-gray-400 font-medium">
                        {t('auth.no_account') || 'Har du inget konto?'} <span className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Kontakta Admin</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;