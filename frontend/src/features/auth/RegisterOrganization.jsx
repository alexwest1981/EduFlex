import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, User, Lock, ArrowRight, Check, AlertCircle, Loader } from 'lucide-react';

const RegisterOrganization = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successData, setSuccessData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        domain: '', // subdomain
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare payload
        const payload = {
            name: formData.name,
            domain: formData.domain.toLowerCase(),
            adminFirstName: formData.adminFirstName,
            adminLastName: formData.adminLastName,
            adminEmail: formData.adminEmail,
            adminPassword: formData.adminPassword
        };

        try {
            const response = await fetch('/api/public/tenants/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Registreringen misslyckades.');
            }

            const data = await response.json();
            setSuccessData(data);
            setStep(3); // Success step

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <School size={24} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Registrera din Skola
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Kom igång med EduFlex på mindre än 2 minuter.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">

                    {step === 3 && successData ? (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Välkommen till EduFlex!</h3>
                            <p className="text-gray-500 mb-6">
                                Din organisation <strong>{successData.tenantId}</strong> är nu skapad.
                            </p>

                            <div className="bg-blue-50 p-4 rounded-lg text-left mb-6 border border-blue-100">
                                <p className="text-sm font-bold text-blue-900 mb-1">Inloggningsuppgifter:</p>
                                <p className="text-sm text-blue-800">Email: {formData.adminEmail}</p>
                                <p className="text-sm text-blue-800">Lösenord: ******</p>
                            </div>

                            <a
                                href={successData.loginUrl || '/login'}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Gå till din Inloggning
                            </a>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Skolans Namn
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <School className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="T.ex. Centralskolan"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                                    Önskad Subdomän
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">https://</span>
                                    </div>
                                    <input
                                        id="domain"
                                        name="domain"
                                        type="text"
                                        required
                                        pattern="[a-zA-Z0-9-]+"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-16 pr-24 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="centralskolan"
                                        value={formData.domain}
                                        onChange={handleChange}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">.eduflex.se</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-4">Administratörskonto</h4>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Förnamn</label>
                                        <input
                                            name="adminFirstName"
                                            required
                                            className="block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                                            value={formData.adminFirstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Efternamn</label>
                                        <input
                                            name="adminLastName"
                                            required
                                            className="block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                                            value={formData.adminLastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            name="adminEmail"
                                            type="email"
                                            required
                                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                            placeholder="admin@skola.se"
                                            value={formData.adminEmail}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lösenord</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            name="adminPassword"
                                            type="password"
                                            required
                                            minLength={8}
                                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                            placeholder="••••••••"
                                            value={formData.adminPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                            Skapar din miljö...
                                        </>
                                    ) : (
                                        <>
                                            Starta min 14-dagars testperiod
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {step !== 3 && (
                    <div className="text-center mt-4">
                        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-900">
                            Tillbaka till startsidan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterOrganization;
