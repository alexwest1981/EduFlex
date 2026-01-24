import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const LtiSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (token) {
            // Save token
            localStorage.setItem('token', token);

            // Force reload to ensure AppContext hydrates currentUser correctly
            // setTimeout to show the success state briefly
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else if (error) {
            console.error("LTI Error:", error);
        } else {
            // If no token and no error, maybe redirect to login?
            console.warn("No token received in LTI Success");
            setTimeout(() => {
                navigate('/login?error=LTI_Missing_Token');
            }, 2000);
        }
    }, [location, navigate]);

    const params = new URLSearchParams(location.search);
    const hasError = params.get('error') || (!params.get('token') && 'Missing Token');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] p-4">
            <div className="bg-white dark:bg-[#1E1F20] p-8 rounded-3xl shadow-xl max-w-md w-full text-center">

                {!hasError ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inloggning Lyckades!</h2>
                        <p className="text-gray-500 mb-6">EduFlex LTI-anslutning accepterad. Vidarebefordrar...</p>
                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Anslutning Misslyckades</h2>
                        <p className="text-gray-500 mb-6 break-words w-full">
                            {params.get('message') || 'Kunde inte verifiera LTI-token.'}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
                        >
                            Till Inloggning
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LtiSuccess;
