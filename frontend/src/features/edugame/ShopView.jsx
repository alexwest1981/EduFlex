import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Layout, Image as ImageIcon, Award, Type, Eye, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import eduGameService from '../../services/eduGameService';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { getGamificationAssetPath } from '../../utils/gamificationUtils';

const rarityConfig = {
    COMMON: {
        bg: 'bg-slate-50 dark:bg-slate-900/40',
        border: 'border-slate-200 dark:border-slate-700',
        text: 'text-slate-600 dark:text-slate-400',
        glow: '',
        label: 'bg-slate-500'
    },
    RARE: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
        label: 'bg-blue-600'
    },
    EPIC: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        label: 'bg-purple-600'
    },
    LEGENDARY: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-700',
        text: 'text-amber-600 dark:text-amber-400',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
        label: 'bg-gradient-to-r from-amber-500 to-yellow-500'
    }
};

const ShopView = () => {
    const { currentUser, refreshUser } = useAppContext();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [previewItem, setPreviewItem] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const itemsData = await eduGameService.getShopItems();
            setItems(itemsData);
        } catch (error) {
            console.error("Error fetching shop data:", error);
            toast.error("Kunde inte ladda butiken.");
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        if ((currentUser?.points || 0) < item.cost) {
            toast.error("Du har inte tillräckligt med XP!");
            return;
        }

        try {
            await eduGameService.buyItem(item.id);
            toast.success(`Köpte ${item.name}!`, {
                icon: '✨',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            fetchData();
            refreshUser();
        } catch (error) {
            console.error("Purchase failed:", error);
            toast.error("Köp misslyckades.");
        }
    };

    const handleEquip = async (item) => {
        try {
            await eduGameService.equipItem(item.id);
            toast.success(`${item.name} utrustad!`);
            refreshUser();
        } catch (error) {
            console.error("Equip failed:", error);
            toast.error("Kunde inte utrusta objektet.");
        }
    }

    const filteredItems = activeTab === 'ALL'
        ? items
        : items.filter(item => item.type === activeTab);

    const getIconForType = (type) => {
        switch (type) {
            case 'FRAME': return <Layout className="w-6 h-6" />;
            case 'BACKGROUND': return <ImageIcon className="w-6 h-6" />;
            case 'BADGE': return <Award className="w-6 h-6" />;
            case 'TITLE': return <Type className="w-6 h-6" />;
            default: return <Star className="w-6 h-6" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-500">Öppnar butiken...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black flex items-center gap-4">
                        <ShoppingBag className="w-10 h-10" />
                        EduGame Shop
                    </h1>
                    <p className="text-indigo-100 mt-2 text-lg max-w-2xl">
                        Anpassa din profil med exklusiva ramar, titlar och teman. Visa upp din framgång i form av stil!
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                            <span className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Ditt Saldo</span>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                                <span className="text-3xl font-bold">{currentUser?.points || 0}</span>
                                <span className="text-indigo-200 font-medium">XP</span>
                            </div>
                        </div>
                    </div>
                </div>
                <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 rotate-12" />
            </header>

            {/* TABS */}
            <div className="flex gap-2 pb-6 mb-8 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-20 overflow-x-auto no-scrollbar">
                {['ALL', 'FRAME', 'BACKGROUND', 'BADGE', 'TITLE'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === tab
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab === 'ALL' ? <Star className="w-4 h-4" /> : getIconForType(tab)}
                        {tab === 'ALL' ? 'Alla' : tab === 'FRAME' ? 'Ramar' : tab === 'BACKGROUND' ? 'Teman' : tab === 'BADGE' ? 'Badges' : 'Titlar'}
                    </button>
                ))}
            </div>

            {/* GRID */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => {
                        const canAfford = (currentUser?.points || 0) >= item.cost;
                        const config = rarityConfig[item.rarity || 'COMMON'];

                        return (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border ${config.border} ${config.glow} overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300`}
                            >
                                <div className={`h-48 ${config.bg} flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500`}>
                                    {item.imageUrl && item.type !== 'TITLE' ? (
                                        <img
                                            src={getGamificationAssetPath(item.imageUrl, item.type)}
                                            alt={item.name}
                                            className="max-h-full max-w-full object-contain p-4 drop-shadow-2xl"
                                        />
                                    ) : (
                                        <div className={`${config.text} opacity-40`}>
                                            {getIconForType(item.type)}
                                        </div>
                                    )}

                                    {/* RARITY LABEL */}
                                    <div className={`absolute top-4 left-4 ${config.label} text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg`}>
                                        {item.rarity}
                                    </div>

                                    {/* PREVIEW BUTTON - Relocated to Top-Right and always visible */}
                                    {(item.type === 'FRAME' || item.type === 'BACKGROUND') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewItem(item);
                                            }}
                                            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-lg hover:scale-105 transition-all z-10"
                                            title="Förhandsgranska"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Testa</span>
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                                        <div className={`${config.text}`}>
                                            {getIconForType(item.type)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 line-clamp-2">{item.description}</p>

                                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Kostnad</span>
                                            <div className={`font-black text-2xl ${canAfford || item.owned ? 'text-gray-900 dark:text-white' : 'text-red-400'}`}>
                                                {item.cost} <span className="text-xs font-medium text-gray-500">XP</span>
                                            </div>
                                        </div>

                                        {item.owned ? (
                                            <button
                                                onClick={() => handleEquip(item)}
                                                disabled={item.active}
                                                className={`px-6 py-3 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center gap-2 active:scale-95 ${item.active
                                                    ? 'bg-gray-100 text-gray-500 cursor-default shadow-none'
                                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                                                    }`}
                                            >
                                                {item.active ? (
                                                    <>
                                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                                        Används
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Utrusta
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(item)}
                                                disabled={!canAfford}
                                                className={`px-6 py-3 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 ${canAfford
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none'
                                                    }`}
                                            >
                                                Lås Upp
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {previewItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setPreviewItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl max-w-md w-full border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={`h-64 flex items-center justify-center relative overflow-hidden ${rarityConfig[previewItem.rarity || 'COMMON'].bg}`}>
                                {previewItem.type === 'BACKGROUND' && (
                                    <img
                                        src={getGamificationAssetPath(previewItem.imageUrl, previewItem.type)}
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
                                    />
                                )}
                                <div className="text-center relative z-10">
                                    <div className="relative inline-block">
                                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 relative z-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <img
                                                src={currentUser?.profilePictureUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                                className="w-full h-full object-cover relative z-10"
                                            />
                                        </div>
                                        {/* FRAME PREVIEW with Standard Sizing & Multiply Blending */}
                                        {previewItem.type === 'FRAME' && (
                                            <img
                                                src={getGamificationAssetPath(previewItem.imageUrl, previewItem.type)}
                                                className="absolute inset-0 w-32 h-32 z-20 pointer-events-none rounded-full object-cover"
                                                style={{
                                                    mixBlendMode: previewItem.imageUrl.includes('circular') ? 'multiply' : 'screen',
                                                    maskImage: 'radial-gradient(circle, transparent 72%, black 76%, black 92%, transparent 96%)',
                                                    WebkitMaskImage: 'radial-gradient(circle, transparent 72%, black 76%, black 92%, transparent 96%)',
                                                    filter: 'contrast(110%) brightness(1.1)'
                                                }}
                                            />
                                        )}
                                    </div>
                                    <h4 className="font-black text-xl text-gray-900 dark:text-white">Din Profil</h4>
                                    <p className="text-sm opacity-60">Förhandsgranskning</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black mb-2">{previewItem.name}</h3>
                                <p className="text-gray-500 mb-8">{previewItem.description}</p>
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl font-black transition-colors"
                                >
                                    Stäng Förhandsvisning
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {filteredItems.length === 0 && (
                <div className="text-center py-24">
                    <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Här var det tomt...</h3>
                    <p className="text-gray-500">Vi fyller på butiken snart med nya spännande föremål!</p>
                </div>
            )}
        </div>
    );
};

export default ShopView;
