import React, { useState } from 'react';
import { RefreshCw, Check, X, AlertCircle } from 'lucide-react';

// Lista på otillåtna ord (Profanity Filter)
const PROFANITY_LIST = ['root', 'support', 'skit', 'fan', 'helvete', 'sex', 'xxx'];

const RegistrationForm = ({
                              isAdminContext,
                              registerForm,
                              setRegisterForm,
                              handleRegister,
                              handleGenerateUsernames,
                              usernameSuggestions,
                              checkUsernameAvailability // Denna får vi från App.jsx nu
                          }) => {
    const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'taken', 'profane'
    const [touched, setTouched] = useState(false);

    // Hantera ändring av användarnamn + Profanity Check
    const handleUsernameChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/\s/g, ''); // Inga mellanslag
        setRegisterForm(prev => ({...prev, username: val}));
        setUsernameStatus(null); // Nollställ status medan man skriver

        // Profanity Check Direkt
        if (PROFANITY_LIST.some(badWord => val.includes(badWord))) {
            setUsernameStatus('profane');
        }
    };

    // Kolla databasen när man lämnar fältet (onBlur)
    const handleUsernameBlur = async () => {
        if (!registerForm.username || usernameStatus === 'profane') return;

        setUsernameStatus('checking');
        const isTaken = await checkUsernameAvailability(registerForm.username);

        if (isTaken) setUsernameStatus('taken');
        else setUsernameStatus('available');
    };

    return (
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

            {/* --- USERNAME SECTION --- */}
            <div className={`p-4 rounded-lg border ${usernameStatus === 'profane' || usernameStatus === 'taken' ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                <label className="block text-xs font-bold text-indigo-700 mb-2">Användarnamn</label>

                <div className="flex gap-2 mb-3">
                    <button type="button" onClick={handleGenerateUsernames} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                        <RefreshCw size={12}/> Generera förslag
                    </button>
                    {usernameSuggestions.length > 0 && usernameSuggestions.map(uname => (
                        <button
                            key={uname} type="button"
                            onClick={() => {
                                setRegisterForm(prev => ({...prev, username: uname}));
                                setUsernameStatus('available'); // Genererade namn antas vara lediga
                            }}
                            className="px-3 py-1 rounded-full text-xs border bg-white text-gray-700 hover:border-indigo-400"
                        >
                            {uname}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${usernameStatus === 'profane' || usernameStatus === 'taken' ? 'border-red-300 focus:ring-red-500' : 'focus:ring-indigo-500'}`}
                        placeholder="Välj eller generera..."
                        value={registerForm.username}
                        onChange={handleUsernameChange}
                        onBlur={handleUsernameBlur} // Kollar mot DB här
                        required
                    />
                    {/* Status Ikoner */}
                    <div className="absolute right-3 top-2.5">
                        {usernameStatus === 'available' && <Check size={18} className="text-green-500"/>}
                        {(usernameStatus === 'taken' || usernameStatus === 'profane') && <X size={18} className="text-red-500"/>}
                    </div>
                </div>

                {/* Felmeddelanden för användarnamn */}
                {usernameStatus === 'profane' && <p className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> Olämpligt ord valt.</p>}
                {usernameStatus === 'taken' && <p className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> Upptaget användarnamn.</p>}
                {usernameStatus === 'available' && <p className="text-xs text-green-600 mt-1 font-bold">Tillgängligt!</p>}
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
                        <option value="ADMIN">Administratör</option>
                        {/* Visa alltid ADMIN/LÄRARE om vi är i Admin-panelen */}
                        {isAdminContext && <option value="TEACHER">Lärare</option>}
                        {isAdminContext && <option value="ADMIN">Administratör</option>}
                    </select>
                </div>
            </div>

            {/* --- ADRESS SECTION (Split) --- */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Kontakt & Adress</h4>

                <div>
                    <input type="email" placeholder="E-post" className="w-full px-4 py-2 border rounded-lg text-sm"
                           value={registerForm.email} onChange={e => setRegisterForm(prev => ({...prev, email: e.target.value}))} required />
                </div>
                <div>
                    <input type="text" placeholder="Telefon" className="w-full px-4 py-2 border rounded-lg text-sm"
                           value={registerForm.phone} onChange={e => setRegisterForm(prev => ({...prev, phone: e.target.value}))} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                        <input type="text" placeholder="Gatuadress" className="w-full px-4 py-2 border rounded-lg text-sm"
                               value={registerForm.street} onChange={e => setRegisterForm(prev => ({...prev, street: e.target.value}))} required />
                    </div>
                    <input type="text" placeholder="Postnr" className="w-full px-4 py-2 border rounded-lg text-sm"
                           value={registerForm.zip} onChange={e => setRegisterForm(prev => ({...prev, zip: e.target.value}))} required />
                    <input type="text" placeholder="Ort" className="w-full px-4 py-2 border rounded-lg text-sm"
                           value={registerForm.city} onChange={e => setRegisterForm(prev => ({...prev, city: e.target.value}))} required />
                    <input type="text" placeholder="Land" className="w-full px-4 py-2 border rounded-lg text-sm"
                           value={registerForm.country} onChange={e => setRegisterForm(prev => ({...prev, country: e.target.value}))} required />
                </div>
            </div>

            <button
                disabled={usernameStatus === 'profane' || usernameStatus === 'taken'}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isAdminContext ? 'Registrera Användare' : 'Skapa Mitt Konto'}
            </button>
        </form>
    );
};

export default RegistrationForm;