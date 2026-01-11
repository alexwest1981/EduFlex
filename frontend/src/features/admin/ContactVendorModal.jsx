import React from 'react';
import { X, Mail, Phone, Globe } from 'lucide-react';

const ContactVendorModal = ({ onClose, licenseInfo }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold">Förnya Licens</h2>
                        <p className="text-indigo-200 text-sm mt-1">Kontakta EduFlex Säljteam</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm space-y-2 border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Din nuvarande licens:</p>
                        <div className="font-medium text-gray-900 dark:text-gray-200 flex justify-between">
                            <span>Kund:</span>
                            <span>{licenseInfo?.customer || 'N/A'}</span>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-200 flex justify-between">
                            <span>Plan:</span>
                            <span>{licenseInfo?.tier || 'N/A'}</span>
                        </div>
                        <div className="font-medium text-amber-600 dark:text-amber-400 flex justify-between">
                            <span>Utgår:</span>
                            <span>{licenseInfo?.expiry || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <a href="mailto:sales@eduflex.com" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Maila oss</h3>
                                <p className="text-sm text-gray-500">sales@eduflex.com</p>
                            </div>
                        </a>

                        <a href="tel:+46701234567" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Ring oss</h3>
                                <p className="text-sm text-gray-500">070-123 45 67</p>
                            </div>
                        </a>

                        <a href="https://eduflex.com/renew" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Förnya Online</h3>
                                <p className="text-sm text-gray-500">eduflex.com/renew</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactVendorModal;
