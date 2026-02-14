
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, CheckCircle, Target, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SKAManager = () => {
    const { currentUser } = useAppContext();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showIndicatorModal, setShowIndicatorModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Form states
    const [goalForm, setGoalForm] = useState({ title: '', description: '', targetDate: '' });
    const [indicatorForm, setIndicatorForm] = useState({
        name: '', description: '', indicatorType: 'MANUAL', targetValue: '', unit: ''
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const data = await api.principal.ska.getGoals();
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
            toast.error('Kunde inte hämta kvalitetsmål');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            await api.principal.ska.createGoal(goalForm);
            toast.success('Kvalitetsmål skapat');
            setShowGoalModal(false);
            setGoalForm({ title: '', description: '', targetDate: '' });
            fetchGoals();
        } catch (error) {
            toast.error('Kunde inte skapa mål');
        }
    };

    const handleAddIndicator = async (e) => {
        e.preventDefault();
        if (!selectedGoal) return;

        try {
            await api.principal.ska.addIndicator({
                ...indicatorForm,
                goal: { id: selectedGoal.id }
            });
            toast.success('Indikator tillagd');
            setShowIndicatorModal(false);
            setIndicatorForm({ name: '', description: '', indicatorType: 'MANUAL', targetValue: '', unit: '' });
            fetchGoals();
        } catch (error) {
            toast.error('Kunde inte lägga till indikator');
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm('Är du säker på att du vill ta bort detta mål?')) return;
        try {
            await api.principal.ska.deleteGoal(id);
            toast.success('Mål borttaget');
            fetchGoals();
        } catch (error) {
            toast.error('Kunde inte ta bort mål');
        }
    };

    const updateIndicatorValue = async (indicator, value) => {
        try {
            await api.principal.ska.updateIndicatorValue(indicator.id, value);
            toast.success('Värde uppdaterat');
            fetchGoals();
        } catch (error) {
            toast.error('Kunde inte uppdatera värde');
        }
    };

    if (loading) return <div className="p-8 text-center">Laddar kvalitetsarbete...</div>;

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Systematiskt Kvalitetsarbete</h1>
                    <p className="text-gray-500 mt-2">Hantera mål, indikatorer och uppföljning för läsåret.</p>
                </div>
                <button
                    onClick={() => setShowGoalModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-all"
                >
                    <Plus /> Nytt Mål
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {goals.map((goal) => (
                    <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                                    <p className="text-gray-500 mt-1">{goal.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 font-medium">
                                        <span>Måldatum: {goal.targetDate}</span>
                                        <span className={`px - 2 py - 1 rounded - md ${goal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} `}>
                                            {goal.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setSelectedGoal(goal); setShowIndicatorModal(true); }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                                    title="Lägg till indikator"
                                >
                                    <Plus />
                                </button>
                                <button
                                    onClick={() => handleDeleteGoal(goal.id)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                                >
                                    <Trash2 />
                                </button>
                            </div>
                        </div>

                        {/* Indicators Section */}
                        <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                            {goal.indicators?.map((indicator) => (
                                <div key={indicator.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl hover:bg-gray-100 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p - 2 rounded - lg ${indicator.isCompleted ? 'text-green-500 bg-green-50' : 'text-orange-500 bg-orange-50'} `}>
                                            {indicator.isCompleted ? <CheckCircle /> : <BarChart2 />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{indicator.name}</p>
                                            <p className="text-sm text-gray-500">{indicator.indicatorType} • Mål: {indicator.targetValue} {indicator.unit}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-500">Nuvarande</p>
                                            {indicator.indicatorType === 'MANUAL' ? (
                                                <input
                                                    type="number"
                                                    defaultValue={indicator.currentValue}
                                                    onBlur={(e) => updateIndicatorValue(indicator, e.target.value)}
                                                    className="w-20 px-2 py-1 text-right bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{indicator.currentValue}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {goal.indicators?.length === 0 && (
                                <p className="text-sm text-gray-500 italic">Inga indikatorer kopplade än.</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Goal Modal */}
            <AnimatePresence>
                {showGoalModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-3xl p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">Nytt Kvalitetsmål</h2>
                            <form onSubmit={handleCreateGoal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                                    <input
                                        type="text"
                                        required
                                        value={goalForm.title}
                                        onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beskrivning</label>
                                    <textarea
                                        required
                                        value={goalForm.description}
                                        onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Måldatum</label>
                                    <input
                                        type="date"
                                        value={goalForm.targetDate}
                                        onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowGoalModal(false)}
                                        className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                    >
                                        Skapa Mål
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Indicator Modal */}
            <AnimatePresence>
                {showIndicatorModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-3xl p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">Ny Indikator</h2>
                            <p className="text-gray-500 mb-4 text-sm">För mål: {selectedGoal?.title}</p>
                            <form onSubmit={handleAddIndicator} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Namn</label>
                                    <input
                                        type="text"
                                        required
                                        value={indicatorForm.name}
                                        onChange={(e) => setIndicatorForm({ ...indicatorForm, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                                        <select
                                            value={indicatorForm.indicatorType}
                                            onChange={(e) => setIndicatorForm({ ...indicatorForm, indicatorType: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="MANUAL">Manuell</option>
                                            <option value="ATTENDANCE">Närvaro</option>
                                            <option value="GRADES">Betyg</option>
                                            <option value="SURVEY">Enkät</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enhet</label>
                                        <input
                                            type="text"
                                            placeholder="%, st, etc"
                                            value={indicatorForm.unit}
                                            onChange={(e) => setIndicatorForm({ ...indicatorForm, unit: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Målvärde</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={indicatorForm.targetValue}
                                        onChange={(e) => setIndicatorForm({ ...indicatorForm, targetValue: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowIndicatorModal(false)}
                                        className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                    >
                                        Lägg till
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SKAManager;
