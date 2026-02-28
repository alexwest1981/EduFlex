import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Store, RotateCcw } from 'lucide-react';

const CheckoutCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-[#1a1b1d] rounded-3xl p-8 border border-gray-200 dark:border-white/5 shadow-2xl text-center">

                <div className="size-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="text-red-500" size={40} />
                </div>

                <h1 className="text-2xl font-black mb-2 dark:text-white">Köpet avbröts</h1>
                <p className="text-gray-500 mb-8">
                    Din betalning genomfördes inte och inga pengar har dragits från ditt kort. Din varukorg finns kvar om du vill försöka igen senare.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full py-4 bg-brand-teal text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-brand-teal/20"
                    >
                        <RotateCcw size={20} /> Försök igen
                    </button>
                    <button
                        onClick={() => navigate('/store')}
                        className="w-full py-4 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                        <Store size={20} /> Gå till butiken
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutCancel;
