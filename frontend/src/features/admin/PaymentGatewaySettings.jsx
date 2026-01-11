import React, { useState, useEffect } from 'react';
import { CreditCard, Key, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const PaymentGatewaySettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        provider: 'STRIPE',
        apiKey: '',
        webhookSecret: '',
        isTestMode: true,
        enabledMethods: 'CARD,SWISH,INVOICE',
        isActive: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await api.get('/payment-settings');
            if (data.length > 0) {
                const stripeSettings = data.find(s => s.provider === 'STRIPE') || data[0];
                setSettings(stripeSettings);
                setFormData(stripeSettings);
            }
        } catch (error) {
            console.error('Failed to load payment settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (settings?.id) {
                await api.put(`/payment-settings/${settings.id}`, formData);
            } else {
                await api.post('/payment-settings', formData);
            }
            await fetchSettings();
            alert('Payment settings saved successfully!');
        } catch (error) {
            console.error('Failed to save payment settings:', error);
            alert('Failed to save payment settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleMethodToggle = (method) => {
        const methods = formData.enabledMethods.split(',');
        const index = methods.indexOf(method);

        if (index > -1) {
            methods.splice(index, 1);
        } else {
            methods.push(method);
        }

        setFormData({ ...formData, enabledMethods: methods.filter(m => m).join(',') });
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading payment settings...</div>;
    }

    const enabledMethodsArray = formData.enabledMethods.split(',').filter(m => m);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Gateway Settings</h2>
                        <p className="text-sm text-gray-500">Configure Stripe API integration</p>
                    </div>
                </div>

                {!formData.isActive && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-yellow-800 dark:text-yellow-200">Payment Gateway Not Active</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">Configure API keys and activate to enable payments</p>
                        </div>
                    </div>
                )}
            </div>

            {/* API Configuration */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Key size={20} /> API Configuration
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Provider
                        </label>
                        <select
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white"
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        >
                            <option value="STRIPE">Stripe</option>
                            <option value="PAYPAL">PayPal (Not Implemented)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            API Key (Publishable Key)
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white font-mono text-sm"
                            placeholder="pk_test_..."
                            value={formData.apiKey}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Webhook Secret
                        </label>
                        <input
                            type="password"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white font-mono text-sm"
                            placeholder="whsec_..."
                            value={formData.webhookSecret}
                            onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="testMode"
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600"
                            checked={formData.isTestMode}
                            onChange={(e) => setFormData({ ...formData, isTestMode: e.target.checked })}
                        />
                        <label htmlFor="testMode" className="font-medium text-gray-700 dark:text-gray-300">
                            Test Mode (Use test API keys)
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            {formData.isActive && <CheckCircle size={16} className="text-green-600" />}
                            Activate Payment Gateway
                        </label>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={20} /> Enabled Payment Methods
                </h3>

                <div className="space-y-3">
                    {['CARD', 'SWISH', 'INVOICE'].map((method) => (
                        <label key={method} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-[#3c4043] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-indigo-600"
                                checked={enabledMethodsArray.includes(method)}
                                onChange={() => handleMethodToggle(method)}
                            />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{method}</p>
                                <p className="text-xs text-gray-500">
                                    {method === 'CARD' && 'Credit/Debit Card via Stripe'}
                                    {method === 'SWISH' && 'Swedish Mobile Payment'}
                                    {method === 'INVOICE' && 'Invoice/Bank Transfer'}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Payment Settings'}
                </button>
            </div>
        </div>
    );
};

export default PaymentGatewaySettings;
