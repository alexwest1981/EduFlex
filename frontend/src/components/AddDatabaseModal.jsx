import React, { useState } from 'react';
import { X, Database, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

const AddDatabaseModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        host: '',
        port: '5432',
        database: '',
        username: '',
        password: '',
        adminPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (!formData.name || !formData.host || !formData.port || !formData.database ||
            !formData.username || !formData.password || !formData.adminPassword) {
            setError('Alla fält måste fyllas i');
            return;
        }

        try {
            await onAdd(formData);
            // Reset form
            setFormData({
                name: '',
                host: '',
                port: '5432',
                database: '',
                username: '',
                password: '',
                adminPassword: ''
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Misslyckades med att lägga till databas');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-[#1E1F20] border-b border-gray-200 dark:border-[#3c4043] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Database size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Lägg till Databasanslutning
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#282a2c] rounded-lg transition"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Warning */}
                <div className="p-6 pb-0">
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Kritisk Operation</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Att lägga till en ny databas kräver administratörslösenord. Denna anslutning kan användas för nödfall eller underhåll.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Connection Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Anslutningsnamn *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="t.ex. Backup Database"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Host and Port */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Host *
                            </label>
                            <input
                                type="text"
                                name="host"
                                value={formData.host}
                                onChange={handleChange}
                                placeholder="localhost eller IP-adress"
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Port *
                            </label>
                            <input
                                type="text"
                                name="port"
                                value={formData.port}
                                onChange={handleChange}
                                placeholder="5432"
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Database Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Databasnamn *
                        </label>
                        <input
                            type="text"
                            name="database"
                            value={formData.database}
                            onChange={handleChange}
                            placeholder="eduflex"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Användarnamn *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="postgres"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Database Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Databaslösenord *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-[#3c4043] rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                    {/* Admin Password */}
                    <div className="pt-4 border-t border-gray-200 dark:border-[#3c4043]">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-red-600" />
                            Ditt Administratörslösenord *
                        </label>
                        <div className="relative">
                            <input
                                type={showAdminPassword ? "text" : "password"}
                                name="adminPassword"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                placeholder="Bekräfta med ditt lösenord"
                                className="w-full px-4 py-2.5 pr-12 border border-red-300 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ange ditt EduFlex-administratörslösenord för att bekräfta denna operation
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 dark:border-[#3c4043] rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition"
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                        >
                            Lägg till Databas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDatabaseModal;
