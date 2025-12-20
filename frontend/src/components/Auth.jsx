import React from 'react';
import { Lock, AlertTriangle, CheckCircle, Loader2, LogIn } from 'lucide-react';
import RegistrationForm from './RegistrationForm';

const Auth = ({ authView, setAuthView, loginForm, setLoginForm, handleLogin, isLoading, error, message, ...registerProps }) => {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-300 max-h-screen overflow-y-auto">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <Lock size={32} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">EduFlex</h1>
                <p className="text-center text-gray-500 mb-8">{authView === 'login' ? 'Logga in' : 'Registrering'}</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}
                {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><CheckCircle size={16}/>{message}</div>}

                {authView === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Användarnamn"
                            value={loginForm.username}
                            onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                            autoFocus required
                        />
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Lösenord"
                            value={loginForm.password}
                            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                            required
                        />
                        <button disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin" /> : <><LogIn size={20}/> Logga In</>}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-4">Inget konto? <button type="button" onClick={() => setAuthView('register')} className="text-indigo-600 font-bold hover:underline">Registrera</button></p>
                    </form>
                ) : (
                    <div>
                        <RegistrationForm isAdminContext={false} {...registerProps} />
                        <p className="text-center text-sm text-gray-500 mt-4">Har du konto? <button type="button" onClick={() => setAuthView('login')} className="text-indigo-600 font-bold hover:underline">Logga in</button></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auth;