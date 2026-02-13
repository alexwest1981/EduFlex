import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { Brain, ClipboardList, MessageSquare, ChevronRight, Loader2, Star } from 'lucide-react';
import WidgetWrapper from '../WidgetWrapper';

const MentorCoachWidget = ({ mentorId }) => {
    const [coaching, setCoaching] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mentorId) fetchCoaching();
    }, [mentorId]);

    const fetchCoaching = async () => {
        try {
            setLoading(true);
            const response = await api.analytics.predictive.getMentorCoach(mentorId);
            setCoaching(response);
        } catch (error) {
            console.error('Failed to fetch mentor coaching:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WidgetWrapper
            title="AI Mentorcoach"
            icon={<Brain size={20} className="text-brand-teal" />}
            subtitle="Beslutsstöd för din mentorgrupp"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-brand-teal" size={24} />
                    </div>
                ) : coaching ? (
                    <>
                        <div className="p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={16} className="text-brand-teal" />
                                <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                                    Viktigaste insikten
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                                {coaching.topConcern}
                            </p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                                "{coaching.briefing}"
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5 px-1">
                                <ClipboardList size={10} /> Föreslagen Agenda Mentortid
                            </p>
                            <div className="space-y-1.5">
                                {coaching.suggestedAgenda?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-[11px] text-gray-700 dark:text-gray-300">
                                        <div className="w-1 h-1 bg-brand-teal rounded-full" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brand-teal hover:bg-brand-teal/10 rounded-xl transition-colors">
                            Förbered Utvecklingssamtal <MessageSquare size={14} />
                        </button>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500">Ingen mentor-coachning tillgänglig.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};

export default MentorCoachWidget;
