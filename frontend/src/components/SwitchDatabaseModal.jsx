import React, { useState } from 'react';
import { X, AlertTriangle, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SwitchDatabaseModal = ({ isOpen, onClose, onConfirm, targetDatabase }) => {
    const { t } = useTranslation();
    const [adminPassword, setAdminPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate confirmation text
        if (confirmText.toUpperCase() !== t('db_switch.confirm_text').toUpperCase()) {
            setError(t('db_switch.errors.confirm_mismatch'));
            return;
        }

        // Validate admin password
        if (!adminPassword) {
            setError(t('db_switch.errors.password_required'));
            return;
        }

        try {
            await onConfirm(adminPassword);
            setAdminPassword('');
            setConfirmText('');
            onClose();
        } catch (err) {
            setError(err.message || t('db_switch.errors.failed'));
        }
    };

    const handleClose = () => {
        setAdminPassword('');
        setConfirmText('');
        setError('');
        onClose();
    };

    if (!isOpen || !targetDatabase) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="bg-red-600 dark:bg-red-700 p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <ShieldAlert size={20} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {t('db_switch.title')}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Warning */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={24} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">{t('db_switch.warning_title')}</h4>
                                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                    <li>• {t('db_switch.warning_disconnect')}</li>
                                    <li>• {t('db_switch.warning_loss')}</li>
                                    <li>• {t('db_switch.warning_unavailable')}</li>
                                    <li>• {t('db_switch.warning_config')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Target Database Info */}
                    <div className="bg-gray-50 dark:bg-[#282a2c] rounded-xl p-4 border border-gray-200 dark:border-[#3c4043]">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('db_switch.switch_target')}</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{targetDatabase.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {targetDatabase.host}:{targetDatabase.port} / {targetDatabase.database}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Confirmation Text */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t('db_switch.confirm_label')}
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder={t('db_switch.confirm_placeholder')}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono uppercase"
                        />
                    </div>

                    {/* Admin Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-red-600" />
                            {t('db_switch.password_label')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={adminPassword}
                                onChange={(e) => {
                                    setAdminPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder={t('db_switch.password_placeholder')}
                                className="w-full px-4 py-2.5 pr-12 border border-red-300 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border border-gray-300 dark:border-[#3c4043] rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition"
                        >
                            {t('db_switch.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={confirmText.toUpperCase() !== t('db_switch.confirm_text').toUpperCase() || !adminPassword}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('db_switch.confirm_btn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SwitchDatabaseModal;
