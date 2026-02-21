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
                // Fetch AI-driven quests from EduAI Hub
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('/api/gamification/eduai/active', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuests(data || []);
                } else {
                    // Fallback to empty if AI quests fail
                    setQuests([]);
                }
            } catch (error) {
                console.error("Failed to fetch EduAI quests", error);
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
                    <p className="text-sm">Inga AI-uppdrag just nu</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {quests.map(quest => {
                        const isCompleted = quest.status === 'COMPLETED' || quest.status === 'CLAIMED';

                        // Handle both old schema (currentCount/targetCount) and new AI schema
                        const current = quest.currentCount || (isCompleted ? 1 : 0);
                        const target = quest.targetCount || 1;
                        let progress = Math.min(100, Math.round((current / target) * 100));
                        if (isCompleted) progress = 100;

                        return (
                            <Link
                                to={quest.courseId
                                    ? `/course/${quest.courseId}?tab=${quest.objectiveType === 'QUIZ' ? 'quiz' : quest.objectiveType === 'ASSIGNMENT' ? 'assignments' : 'material'}&itemId=${quest.objectiveId}`
                                    : '/my-courses'}
                                key={quest.id}
                                className="block p-3 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-100 dark:border-[#3c4043] hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`}>
                                            {quest.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {quest.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded shrink-0 ml-2">
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
                                    {target > 1 && (
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-8 text-right">
                                            {current}/{target}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EduQuestWidget;
