import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import { CreditCard, Tag, ArrowRight, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

const Checkout = () => {
    const { cart, total } = useCart();
    const { currentUser } = useAppContext();
    const navigate = useNavigate();

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [validatingPromo, setValidatingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quantities, setQuantities] = useState({}); // Example: { courseId: quantity }

    const computedTotal = cart.reduce((acc, item) => acc + (item.price * (quantities[item.id] || 1)), 0);

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;
        setQuantities(prev => ({ ...prev, [id]: newQuantity }));

        // If promo is applied, we might need to recalculate or clear it
        if (appliedPromo) {
            setAppliedPromo(null);
            setPromoError('Rabattkoden togs bort pga ändrat antal. Använd den igen.');
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setValidatingPromo(true);
        setPromoError('');
        try {
            const response = await fetch('/api/promocodes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, originalPrice: computedTotal.toString() })
            });
            const data = await response.json();
            if (response.ok && data.valid) {
                setAppliedPromo(data);
            } else {
                setPromoError(data.message || 'Ogiltig rabattkod');
                setAppliedPromo(null);
            }
        } catch (err) {
            setPromoError('Kunde inte validera koden');
        } finally {
            setValidatingPromo(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-black mb-4 dark:text-white">Din varukorg är tom</h1>
                <button
                    onClick={() => navigate('/store')}
                    className="px-6 py-3 bg-brand-teal text-white rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all"
                >
                    <ArrowLeft size={18} /> Gå till butiken
                </button>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-black mb-4 dark:text-white">Du måste logga in</h1>
                <p className="text-gray-500 mb-6 text-center max-w-sm">För att kunna köpa och spara kurser till ditt konto måste du vara inloggad.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/store')}
                        className="px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        Tillbaka
                    </button>
                    <button
                        onClick={() => navigate('/login?redirect=/checkout')}
                        className="px-6 py-3 bg-brand-teal text-white rounded-xl font-bold hover:brightness-110 transition-all"
                    >
                        Logga in
                    </button>
                </div>
            </div>
        );
    }

    const handleCheckout = async () => {
        setLoading(true);
        setError('');
        try {
            const courseIds = cart.map(item => item.id);
            const successUrl = `${window.location.origin}/checkout/success`;
            const cancelUrl = `${window.location.origin}/checkout/cancel`;

            // Assume we create a specific api route in api.js or use direct fetch
            const response = await fetch('/api/checkout/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    courseIds,
                    courseQuantities: quantities,
                    promoCode: appliedPromo ? appliedPromo.code : null,
                    successUrl,
                    cancelUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Något gick fel vid kassan.');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (err) {
            console.error("Checkout error:", err);
            setError(err.message || 'Ett oväntat fel uppstod.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/store')}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={16} /> Tillbaka till butik
                </button>

                <h1 className="text-3xl font-black mb-8 dark:text-white flex items-center gap-3">
                    <CreditCard className="text-brand-teal" /> Kassa
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                            <h2 className="text-xl font-bold mb-6 dark:text-white">Din beställning</h2>
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                                        <div className="w-16 h-12 rounded-lg bg-slate-800 flex-shrink-0 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/20 to-brand-blue/20" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm dark:text-white">{item.name}</h4>
                                            <div className="text-xs text-brand-teal uppercase font-bold tracking-widest">{item.category}</div>

                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <span className="text-xs text-gray-500 font-bold uppercase">Licenser (Platser):</span>
                                                <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
                                                        className="px-3 py-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                                                    >-</button>
                                                    <div className="px-4 py-1 text-sm font-bold dark:text-white bg-white dark:bg-[#0f1012]">{quantities[item.id] || 1}</div>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                                                        className="px-3 py-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                                                    >+</button>
                                                </div>
                                                {(quantities[item.id] || 1) > 1 && <span className="text-xs px-2 py-1 bg-brand-teal/10 text-brand-teal rounded font-bold">Företagsköp (B2B)</span>}
                                            </div>
                                        </div>
                                        <div className="font-black dark:text-white text-right shrink-0">
                                            <div className="text-lg">{item.price * (quantities[item.id] || 1)} kr</div>
                                            {(quantities[item.id] || 1) > 1 && <div className="text-xs text-gray-400 font-normal">{item.price} kr / st</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User details */}
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                            <h2 className="text-lg font-bold mb-4 dark:text-white">Köpare</h2>
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex flex-col gap-1">
                                <span className="font-bold dark:text-white">{currentUser.firstName} {currentUser.lastName}</span>
                                <span className="text-sm text-gray-500">{currentUser.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Payment Box */}
                        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl p-6 border border-gray-200 dark:border-white/5 sticky top-24 shadow-xl">

                            <h3 className="font-bold mb-4 dark:text-white uppercase tracking-widest text-xs">Sammanställning</h3>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-500">Delsumma ({cart.length} kurser)</span>
                                <span className="dark:text-white font-bold">{computedTotal} kr</span>
                            </div>

                            {/* Promo code */}
                            <div className="mt-6 mb-6">
                                <label className="text-xs uppercase font-bold text-gray-500 mb-2 flex items-center gap-1">
                                    <Tag size={12} /> Rabattkod
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="T.ex. STUDENT20"
                                        value={promoCode}
                                        onChange={(e) => {
                                            setPromoCode(e.target.value.toUpperCase());
                                            setPromoError('');
                                        }}
                                        disabled={appliedPromo !== null}
                                        className="flex-1 bg-gray-50 dark:bg-[#0f1012] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-teal dark:text-white transition-colors disabled:opacity-50"
                                    />
                                    {!appliedPromo ? (
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={validatingPromo || !promoCode.trim()}
                                            className="px-4 py-2 bg-gray-200 dark:bg-white/10 dark:text-white font-bold rounded-xl text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                                        >
                                            {validatingPromo ? <Loader2 className="animate-spin" size={16} /> : 'Använd'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
                                            className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-xl text-sm hover:bg-red-200 transition-colors"
                                        >
                                            Ta bort
                                        </button>
                                    )}
                                </div>
                                {promoError && <p className="text-xs text-red-500 mt-2 font-bold">{promoError}</p>}
                                {appliedPromo && <p className="text-xs text-green-500 mt-2 font-bold">Rabattkod applicerad: -{appliedPromo.calculatedDiscount} kr</p>}
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between mb-6">
                                <span className="font-bold text-lg dark:text-white">Totalt</span>
                                <div className="text-right">
                                    {appliedPromo && <div className="text-sm line-through text-gray-400">{computedTotal} kr</div>}
                                    <span className="text-2xl font-black text-brand-teal">{appliedPromo ? appliedPromo.finalPrice : computedTotal} kr</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 mb-6 rounded-xl bg-red-500/10 text-red-500 text-sm border border-red-500/20 italic">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full py-4 bg-brand-teal text-white font-black rounded-xl hover:brightness-110 transition-all shadow-xl shadow-brand-teal/30 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Slutför Köp via Stripe'}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck size={14} className="text-brand-teal" /> Säker betalning med Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
