import React, { useState, useEffect } from 'react';
import { Crown, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { api } from '../../services/api';
import ContactVendorModal from './ContactVendorModal';

const LicenseStatusCard = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        api.system.checkLicense().then(data => {
            setStatus(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading || !status) return <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>;

    const isEnterprise = status.tier === 'ENTERPRISE';
    const warning = status.isExpiringSoon;

    return (
        <>
            <div className={`rounded-2xl border p-6 relative overflow-hidden transition-all ${warning
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-[#1e1e1f] border-gray-200 dark:border-[#3c4043]'
                }`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Crown size={120} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Current Plan
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`text-2xl font-black ${isEnterprise ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                {status.tier}
                            </span>
                            {isEnterprise && <Crown size={20} className="text-amber-500 fill-amber-500" />}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p>Customer: <span className="font-semibold">{status.customer}</span></p>
                            <p>Expires: <span className="font-mono">{status.expiry}</span></p>
                        </div>

                        {warning && (
                            <div className="mt-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold animate-pulse">
                                <AlertTriangle size={18} />
                                <span>Expiring in {status.daysRemaining} days!</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className={`p-3 rounded-full ${warning ? 'bg-amber-100 text-amber-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                            {warning ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        License ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                    </div>
                    {warning && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                        >
                            <Mail size={16} />
                            Contact Vendor to Renew
                        </button>
                    )}
                </div>
            </div>
            {showModal && <ContactVendorModal licenseInfo={status} onClose={() => setShowModal(false)} />}
        </>
    );
};

export default LicenseStatusCard;
