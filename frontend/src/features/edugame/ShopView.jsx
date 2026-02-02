import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Layout, Image as ImageIcon, Award, Type } from 'lucide-react';
import eduGameService from '../../services/eduGameService';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const ShopView = () => {
    const { currentUser, refreshUser } = useAppContext();
    const [items, setItems] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, FRAME, BACKGROUND, BADGE, TITLE

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [itemsData, inventoryData] = await Promise.all([
                eduGameService.getShopItems(),
                eduGameService.getMyInventory()
            ]);
            setItems(itemsData);
            setInventory(inventoryData.map(inv => inv.item.id));
        } catch (error) {
            console.error("Error fetching shop data:", error);
            toast.error("Kunde inte ladda butiken.");
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        if (currentUser.gamificationProfile?.points < item.cost) {
            toast.error("Du har inte tillräckligt med XP!");
            return;
        }

        try {
            await eduGameService.buyItem(item.id);
            toast.success(`Köpte ${item.name}!`);
            fetchData(); // Refresh inventory and points
            refreshUser(); // Update user context for points
        } catch (error) {
            console.error("Purchase failed:", error);
            toast.error("Köp misslyckades.");
        }
    };

    const handleEquip = async (item) => {
        try {
            await eduGameService.equipItem(item.id);
            toast.success(`Utrustade ${item.name}!`);
            refreshUser(); // Update user context
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
            case 'FRAME': return <Layout className="w-5 h-5" />;
            case 'BACKGROUND': return <ImageIcon className="w-5 h-5" />;
            case 'BADGE': return <Award className="w-5 h-5" />;
            case 'TITLE': return <Type className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Laddar butiken...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                    <ShoppingBag className="w-8 h-8 text-indigo-600" />
                    Butik
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Använd din XP för att köpa anpassningar till din profil!
                </p>
                <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg inline-block border border-indigo-100 dark:border-indigo-800">
                    <span className="text-indigo-800 dark:text-indigo-300 font-medium">Ditt Saldo: </span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 ml-2">
                        {currentUser?.gamificationProfile?.points || 0} XP
                    </span>
                </div>
            </header>

            {/* TABS */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                {['ALL', 'FRAME', 'BACKGROUND', 'BADGE', 'TITLE'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab === 'ALL' ? 'Alla' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const isOwned = inventory.includes(item.id);
                    const canAfford = currentUser?.gamificationProfile?.points >= item.cost;

                    return (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="h-40 bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
                                {item.imageUrl ? (
                                    <img src={`/gamification/${item.imageUrl}`} alt={item.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    getIconForType(item.type)
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    {item.type}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{item.description}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="font-bold text-gray-900 dark:text-white flex items-center">
                                        {item.cost} <span className="text-xs text-gray-500 ml-1">XP</span>
                                    </div>

                                    {isOwned ? (
                                        <button
                                            onClick={() => handleEquip(item)}
                                            className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                        >
                                            Utrusta
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(item)}
                                            disabled={!canAfford}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${canAfford
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                                : 'bg-gray-200 text-gray-400 dark:bg-gray-700 cursor-not-allowed'
                                                }`}
                                        >
                                            Köp
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Inga {activeTab !== 'ALL' && activeTab.toLowerCase()} hittades.
                </div>
            )}
        </div>
    );
};

export default ShopView;
