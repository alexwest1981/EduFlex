import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, CheckCircle2, AlertCircle, Plus, RefreshCw, ChevronRight } from 'lucide-react';
import { api } from '../../../services/api';

const SKADashboard = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const data = await api.principal.quality.getGoals();
            setGoals(data || []);
        } catch (err) {
            console.error('Failed to fetch SKA goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (goalId) => {
        setRefreshing(true);
        try {
            await api.principal.quality.calculateIndicators(goalId);
            await fetchGoals();
        } catch (err) {
            console.error('Failed to calculate indicators:', err);
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                        <Target className="text-indigo-600" />
                        Systematiskt Kvalitetsarbete 2.0
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Strategisk måluppföljning och kvalitetsindikatorer</p>
                </div>
                <button className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 font-bold text-sm">
                    <Plus size={18} />
                    Nytt Mål
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Year Cycle "Årshjulet" Placeholder */}
                <div className="lg:col-span-1 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-purple-500" size={20} />
                        Kvalitets-årshjul
                    </h3>
                    <div className="relative aspect-square rounded-full border-4 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center">
                        <div className="text-center">
                            <span className="block text-3xl font-black text-indigo-600">FEB</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Analysfas</span>
                        </div>
                        {/* Circular markers would go here */}
                    </div>
                </div>

                {/* Goals List */}
                <div className="lg:col-span-2 space-y-4">
                    {goals.length === 0 ? (
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                            <Target className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">Inga aktiva mål definierade.</p>
                        </div>
                    ) : (
                        goals.map(goal => (
                            <div key={goal.id} className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{goal.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCalculate(goal.id)}
                                        disabled={refreshing}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''} text-gray-400`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(goal.indicators || []).map(indicator => (
                                        <div key={indicator.id} className="p-4 bg-gray-50 dark:bg-[#2c2c2e] rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{indicator.name}</span>
                                                <div className="flex items-center gap-1">
                                                    {indicator.currentValue >= indicator.targetValue ? (
                                                        <CheckCircle2 className="text-green-500" size={14} />
                                                    ) : (
                                                        <TrendingUp className="text-indigo-500" size={14} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                    {indicator.currentValue?.toFixed(1)}{indicator.unit}
                                                </span>
                                                <span className="text-xs text-gray-400 mb-1">
                                                    Mål: {indicator.targetValue}{indicator.unit}
                                                </span>
                                            </div>
                                            <div className="mt-3 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${indicator.currentValue >= indicator.targetValue ? 'bg-green-500' : 'bg-indigo-600'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (indicator.currentValue / indicator.targetValue) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SKADashboard;
