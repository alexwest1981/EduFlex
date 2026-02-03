import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Loader2, ArrowRight } from 'lucide-react';

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
            return;
        }

        // Simulating verification/provisioning delay
        // In a real app, we would poll /api/tenants/status here to see if the tenant is ready
        setTimeout(() => {
            setStatus('success');
        }, 3000);
    }, [sessionId, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Installerar din skola...</h2>
                        <p className="text-gray-600">Vänligen vänta medan vi konfigurerar din dedikerade EduFlex-instans.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Allt klart!</h2>
                        <p className="text-gray-600 mb-8">
                            Din EduFlex-instans är nu skapad. Vi har skickat inloggningsuppgifter till din e-postadress (admin-kontot).
                        </p>
                        <button
                            onClick={() => window.location.href = "http://localhost:5173/login"} // TODO: Redirect to specific tenant domain in prod
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center"
                        >
                            Gå till Inloggning
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutSuccess;
