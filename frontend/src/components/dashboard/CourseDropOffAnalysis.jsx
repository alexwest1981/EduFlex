import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Users, ChevronDown, ChevronRight,
    ArrowRight, AlertTriangle, TrendingDown
} from 'lucide-react';

const CourseDropOffAnalysis = ({ courseId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            fetchDropOffData();
        }
    }, [courseId]);

    const fetchDropOffData = async () => {
        try {
            setLoading(true);
            const dropOff = await api.analytics.getDropOff(courseId);
            setData(dropOff || []);
        } catch (e) {
            console.error("Failed to fetch drop-off data", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-2xl p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-1/3 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 bg-gray-50 dark:bg-[#131314] rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-2xl p-6 shadow-sm text-center py-12">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-gray-900 dark:text-white font-bold">Ingen progressionsdata</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    Det finns inga lektioner eller studenter i den här kursen för att generera en drop-off analys.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                    <TrendingDown size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Avhoppsanalys (Funnel)</h3>
                    <p className="text-[10px] text-gray-500">Var tappar vi studenterna? (Genomsynlighet per lektion)</p>
                </div>
            </div>

            <div className="space-y-3">
                {data.map((step, index) => {
                    const prevStep = index > 0 ? data[index - 1] : null;
                    const dropOffFromPrev = prevStep ? prevStep.completionRate - step.completionRate : 0;
                    const isSignificantDrop = dropOffFromPrev > 15;

                    return (
                        <div key={step.id} className="relative">
                            <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${isSignificantDrop
                                    ? 'bg-rose-50/50 dark:bg-rose-900/5 border-rose-100 dark:border-rose-900/30'
                                    : 'bg-gray-50 dark:bg-[#131314] border-transparent'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSignificantDrop ? 'bg-rose-100 text-rose-600' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{step.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isSignificantDrop ? 'bg-rose-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${step.completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">{step.completionRate}% klarade</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-900 dark:text-white">{step.completedCount} studenter</div>
                                    {isSignificantDrop && (
                                        <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold mt-1">
                                            <AlertTriangle size={10} />
                                            -{dropOffFromPrev.toFixed(1)}% drop-off
                                        </div>
                                    )}
                                </div>
                            </div>

                            {index < data.length - 1 && (
                                <div className="h-4 flex justify-center items-center">
                                    <ArrowRight className="rotate-90 text-gray-300 dark:text-gray-700" size={14} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                <div className="flex gap-3">
                    <div className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <Users size={16} />
                    </div>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                        <strong>Insikt:</strong> {
                            data.some(d => d.completionRate < 50)
                                ? "Vi ser en betydande minskning i de senare delarna av kursen. Överväg att förenkla materialet eller lägga till mer interaktiva övningar i dessa steg."
                                : "Studenterna håller ett jämnt tempo genom kursen. Bra balans på materialet!"
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CourseDropOffAnalysis;
