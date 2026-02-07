import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { useModules } from '../../context/ModuleContext';
import eduGameService from '../../services/eduGameService';
import { Link } from 'react-router-dom';

const EduQuestWidget = () => {
    const { t } = useTranslation();
    const { isModuleActive } = useModules();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuests = async () => {
            if (!isModuleActive('EDUGAME')) return;

            try {
                // Fetch daily quests
                const daily = await eduGameService.getDailyQuests('DAILY');
                setQuests(daily || []);
            } catch (error) {
                console.error("Failed to fetch quests", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuests();
    }, [isModuleActive]);

    if (!isModuleActive('EDUGAME')) return null;

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-6 border border-gray-200 dark:border-[#3c4043] shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="text-indigo-500" size={20} />
                    Dagens Uppdrag
                </h3>
                <Link to="/quests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                    Visa alla
                </Link>
            </div>

            {quests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <Trophy size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Inga uppdrag just nu</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {quests.map(quest => {
                        const progress = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));
                        const isCompleted = quest.isCompleted || progress >= 100;

                        return (
                            <div key={quest.id} className="p-3 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-100 dark:border-[#3c4043]">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                            {quest.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {quest.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                        <Trophy size={10} />
                                        +{quest.rewardXp} XP
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
                                        {quest.currentCount}/{quest.targetCount}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EduQuestWidget;
