import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, ShoppingCart, Info, Check, X, ArrowRight,
    Filter, LayoutGrid, List, SortAsc, CreditCard, Tag
} from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { COURSE_CATEGORIES } from '../../constants/courseCategories';
import { useAppContext } from '../../context/AppContext';

const PublicStorefront = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Alla Kurser');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const navigate = useNavigate();
    const { cart, addToCart, removeFromCart, total } = useCart();
    const { currentUser } = useAppContext();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Public route or we might need to handle public vs private API access
                const data = await api.courses.getAll(); // Assuming this is accessible or we add a public one
                setCourses(data.filter(c => c.isOpen));
            } catch (error) {
                console.error("Kunde inte hämta kurser", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        let result = courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Alla Kurser' || course.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
        if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'price') result.sort((a, b) => (a.price || 0) - (b.price || 0));
        return result;
    }, [courses, searchTerm, selectedCategory, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1012] pb-20">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#1a1b1d]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-8 bg-brand-teal rounded-lg flex items-center justify-center">
                            <span className="text-white font-black">E</span>
                        </div>
                        <span className="text-xl font-bold dark:text-white">EduFlex <span className="text-brand-teal">Store</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-brand-teal/10 hover:text-brand-teal transition-all"
                        >
                            <ShoppingCart size={20} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 bg-brand-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                        {!currentUser && (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-5 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-brand-teal/20"
                            >
                                Logga in
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-slate-900 border-b border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black text-white mb-4">Uppgradera din <span className="text-brand-teal">kompetens</span></h1>
                    <p className="text-slate-400 max-w-xl">Utforska vårt utbud av expertledda kurser. Enkel checkout, direkt tillgång.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">
                {/* Search & Filter Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Sök kurser..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-white/5 focus:ring-2 focus:ring-brand-teal/50 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-white/5 font-bold text-xs uppercase tracking-widest text-gray-500">Kategorier</div>
                        <div className="p-2 space-y-1">
                            {['Alla Kurser', ...COURSE_CATEGORIES].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${selectedCategory === cat ? 'bg-brand-teal text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Course Grid */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse" />)
                        ) : filteredCourses.map(course => (
                            <div key={course.id} className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden hover:shadow-xl transition-all group">
                                <div className="h-32 bg-slate-800 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/20 to-brand-blue/20" />
                                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase">{course.category}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-teal transition-colors">{course.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6">{course.description?.replace(/<[^>]*>/g, '')}</p>

                                    <div className="flex items-center justify-between gap-4 mt-auto">
                                        <div className="text-2xl font-black text-brand-teal">{course.price || 0} kr</div>
                                        <button
                                            onClick={() => addToCart(course)}
                                            disabled={cart.find(i => i.id === course.id)}
                                            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-brand-teal text-white font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                                        >
                                            {cart.find(i => i.id === course.id) ? 'I varukorg' : 'Köp nu'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#1a1b1d] h-full shadow-2xl flex flex-col animate-in fade-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-black flex items-center gap-2"><ShoppingCart className="text-brand-teal" /> Din Varukorg</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><X /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <ShoppingCart size={48} className="mb-4" />
                                    <p>Din varukorg är tom</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm">{item.name}</h4>
                                        <div className="text-brand-teal font-black text-sm">{item.price} kr</div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-500 transition-colors"><X size={18} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/5 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Totalt</span>
                                <span className="text-3xl font-black text-brand-teal">{total} kr</span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-4 bg-brand-teal text-white font-black rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-brand-teal/30 flex items-center justify-center gap-2"
                            >
                                Till kassan <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicStorefront;
