import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, TrendingUp, Download, Calendar, CheckCircle, Clock, X } from 'lucide-react';
import { api } from '../../services/api';

const UserBilling = ({ userId }) => {
    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoVerified, setPromoVerified] = useState(false);
    const [discountData, setDiscountData] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchBillingData();
    }, [userId]);

    const fetchBillingData = async () => {
        try {
            const [plansData, paymentsData, invoicesData] = await Promise.all([
                api.get('/subscription-plans/active'),
                api.get(`/payments/user/${userId}`),
                api.get(`/invoices/user/${userId}`)
            ]);
            setPlans(plansData);
            setPayments(paymentsData);
            setInvoices(invoicesData);

            // Mock subscription for now - would come from user object
            setSubscription({
                plan: plansData[0] || null,
                status: 'active',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        } catch (error) {
            console.error('Failed to load billing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            COMPLETED: 'bg-green-100 text-green-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            FAILED: 'bg-red-100 text-red-700',
            PAID: 'bg-green-100 text-green-700',
            OVERDUE: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    const openPlanModal = (plan) => {
        setSelectedPlan(plan);
        setPromoCode('');
        setPromoVerified(false);
        setDiscountData(null);
        setPromoError('');
        setShowPlanModal(true);
    };

    const closePlanModal = () => {
        setShowPlanModal(false);
        setSelectedPlan(null);
    };

    const verifyPromoCode = async () => {
        if (!promoCode) return;
        setIsVerifying(true);
        setPromoError('');
        try {
            const result = await api.post('/promocodes/validate', {
                code: promoCode,
                originalPrice: selectedPlan.price
            });
            if (result.valid) {
                setPromoVerified(true);
                setDiscountData(result);
            } else {
                setPromoError(result.message || 'Invalid code');
                setPromoVerified(false);
            }
        } catch (error) {
            setPromoError('Kunde inte validera koden');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubscribe = async () => {
        setIsProcessing(true);
        try {
            // Create subscription invoice with promo code
            await api.post('/invoices/subscription', {
                planId: selectedPlan.id,
                promoCode: promoVerified ? promoCode : null
            });

            // Refresh data
            await fetchBillingData();
            closePlanModal();
            alert('Prenumeration uppdaterad! Faktura skapad.');
        } catch (error) {
            console.error('Subscription failed:', error);
            alert('Det gick inte att uppdatera prenumerationen.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading billing information...</div>;
    }

    return (
        <div className="w-full space-y-6">
            {/* Current Subscription Card */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuvarande Prenumeration</h2>
                            <p className="text-sm text-gray-500">Hantera din plan och betalningar</p>
                        </div>
                    </div>
                    {subscription?.status === 'active' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                            <CheckCircle size={14} />
                            Aktiv
                        </span>
                    )}
                </div>

                {subscription?.plan ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex items-baseline gap-2 mb-4">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                    {subscription.plan.displayName}
                                </h3>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {subscription.plan.price} {subscription.plan.currency}
                                </span>
                                <span className="text-gray-500">/{subscription.plan.billingInterval.toLowerCase()}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {subscription.plan.description}
                            </p>

                            {subscription.plan.features && (
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-500 uppercase">Funktioner:</p>
                                    <ul className="space-y-1">
                                        {subscription.plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle size={14} className="text-green-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Nästa Betalning</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {subscription.nextBillingDate.toLocaleDateString('sv-SE')}
                                    </p>
                                </div>
                            </div>

                            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold">
                                Uppgradera Plan
                            </button>
                            <button className="w-full px-4 py-2 border border-gray-300 dark:border-[#3c4043] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors font-bold">
                                Hantera Betalning
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Du har ingen aktiv prenumeration</p>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold">
                            Välj en Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Betalningshistorik</h2>
                        <p className="text-sm text-gray-500">Tidigare transaktioner</p>
                    </div>
                </div>

                {payments.length > 0 ? (
                    <div className="space-y-3">
                        {payments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-lg">
                                        <CreditCard size={20} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {payment.amount} {payment.currency}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(payment.createdAt).toLocaleDateString('sv-SE')} • {payment.paymentMethod}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(payment.status)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Inga betalningar ännu</p>
                )}
            </div>

            {/* Invoices */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fakturor</h2>
                        <p className="text-sm text-gray-500">Ladda ner dina fakturor</p>
                    </div>
                </div>

                {invoices.length > 0 ? (
                    <div className="space-y-3">
                        {invoices.slice(0, 5).map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-[#1E1F20] rounded-lg">
                                        <FileText size={20} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                                            {invoice.invoiceNumber}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(invoice.issueDate).toLocaleDateString('sv-SE')} • {invoice.amount} {invoice.currency}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(invoice.status)}
                                    {invoice.pdfUrl && (
                                        <button
                                            onClick={() => window.open(invoice.pdfUrl, '_blank')}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        >
                                            <Download size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Inga fakturor ännu</p>
                )}
            </div>

            {/* Available Plans (Upgrade/Downgrade) */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tillgängliga Planer</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`p-6 rounded-xl border-2 ${subscription?.plan?.id === plan.id
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                                : 'border-gray-200 dark:border-[#3c4043]'
                                }`}
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {plan.displayName}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-black text-indigo-600">
                                    {plan.price}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    {plan.currency}/{plan.billingInterval.toLowerCase()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {plan.description}
                            </p>

                            {subscription?.plan?.id === plan.id ? (
                                <button
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-bold cursor-not-allowed"
                                >
                                    Nuvarande Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => openPlanModal(plan)}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                                >
                                    {subscription?.plan ? 'Byt till denna' : 'Välj Plan'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Plan Selection Modal */}
            {showPlanModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {subscription?.plan?.id === selectedPlan.id ? 'Din Nuvarande Plan' : 'Bekräfta Prenumeration'}
                            </h3>
                            <button onClick={closePlanModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 dark:bg-[#282a2c] p-4 rounded-xl">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{selectedPlan.displayName}</h4>
                                <p className="text-gray-500 text-sm mb-2">{selectedPlan.description}</p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-[#3c4043]">
                                    <span className="text-gray-600 dark:text-gray-400">Pris</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {selectedPlan.price} {selectedPlan.currency}/{selectedPlan.billingInterval?.toLowerCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Promo Code Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Har du en rabattkod?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="KOD"
                                        className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-[#282a2c] text-gray-900 dark:text-white uppercase"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        disabled={promoVerified}
                                    />
                                    {promoVerified ? (
                                        <button
                                            onClick={() => { setPromoVerified(false); setPromoCode(''); setDiscountData(null); }}
                                            className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg"
                                        >
                                            Ta bort
                                        </button>
                                    ) : (
                                        <button
                                            onClick={verifyPromoCode}
                                            disabled={!promoCode || isVerifying}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold disabled:opacity-50"
                                        >
                                            {isVerifying ? 'Kollar...' : 'Använd'}
                                        </button>
                                    )}
                                </div>
                                {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                                {promoVerified && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm flex justify-between items-center">
                                        <span>Rabatt applicerad:</span>
                                        <span className="font-bold">-{discountData.calculatedDiscount} {selectedPlan.currency}</span>
                                    </div>
                                )}
                            </div>

                            {/* Final Total */}
                            <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-gray-200 dark:border-[#3c4043]">
                                <span className="text-gray-900 dark:text-white">Att betala:</span>
                                <span className="text-indigo-600">
                                    {promoVerified ? discountData.finalPrice : selectedPlan.price} {selectedPlan.currency}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closePlanModal}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleSubscribe}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Clock size={16} className="animate-spin" />
                                        Bearbetar...
                                    </>
                                ) : (
                                    'Bekräfta & Betala'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserBilling;
