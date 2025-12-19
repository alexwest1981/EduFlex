import React from 'react';
import { Lock, AlertTriangle, CheckCircle, Loader2, LogIn, RefreshCw } from 'lucide-react';

export const RegistrationForm = ({ isAdminContext, registerForm, setRegisterForm, handleRegister, handleGenerateUsernames, usernameSuggestions }) => (
    <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Förnamn</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.firstName}
                    onChange={e => setRegisterForm(prev => ({...prev, firstName: e.target.value}))}
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Efternamn</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.lastName}
                    onChange={e => setRegisterForm(prev => ({...prev, lastName: e.target.value}))}
                    required
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Personnummer (YYYYMMDD-XXXX)</label>
            <input
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                value={registerForm.ssn}
                onChange={e => setRegisterForm(prev => ({...prev, ssn: e.target.value}))}
                placeholder="19900101-1234"
                required
            />
        </div>

        {/* GENERATE USERNAME SECTION */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-700 mb-2">Välj Användarnamn</label>
            <div className="flex gap-2 mb-3">
                <button type="button" onClick={handleGenerateUsernames} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                    <RefreshCw size={12}/> Generera förslag
                </button>
            </div>

            {usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {usernameSuggestions.map(uname => (
                        <button
                            key={uname} type="button"
                            onClick={() => setRegisterForm(prev => ({...prev, username: uname}))}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${registerForm.username === uname ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}
                        >
                            {uname}
                        </button>
                    ))}
                </div>
            )}
            <input
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Valt användarnamn"
                value={registerForm.username}
                readOnly
                required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Lösenord</label>
                <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.password}
                    onChange={e => setRegisterForm(prev => ({...prev, password: e.target.value}))}
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Roll</label>
                <select
                    className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.role}
                    onChange={e => setRegisterForm(prev => ({...prev, role: e.target.value}))}
                >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Lärare</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={registerForm.email}
                onChange={e => setRegisterForm(prev => ({...prev, email: e.target.value}))}
                required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Telefon</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.phone}
                    onChange={e => setRegisterForm(prev => ({...prev, phone: e.target.value}))}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Adress</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.address}
                    onChange={e => setRegisterForm(prev => ({...prev, address: e.target.value}))}
                />
            </div>
        </div>

        <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mt-4 transition-colors">
            {isAdminContext ? 'Registrera Användare' : 'Skapa Mitt Konto'}
        </button>
    </form>
);

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