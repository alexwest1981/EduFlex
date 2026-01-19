import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, FileText, CheckCircle, Play, Clock } from 'lucide-react';
import { api } from '../../../services/api';

const MobileCourseView = ({ course, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, lessons, assignments
    const [modules, setModules] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!course) return;

        const loadCourseContent = async () => {
            try {
                setLoading(true);
                // Fetch lessons/materials (grouped by module usually, but we might just get list)
                const materialsData = await api.lessons.getByCourse(course.id);
                // Fetch assignments
                const assignmentsData = await api.assignments.getByCourse(course.id);

                // Ensure arrays (handle Spring Page<T> or List<T> or null)
                const matArray = Array.isArray(materialsData) ? materialsData : (materialsData?.content || []);
                const assArray = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.content || []);

                setModules(matArray);
                setAssignments(assArray);
            } catch (error) {
                console.error("Failed to load course content", error);
            } finally {
                setLoading(false);
            }
        };

        loadCourseContent();
    }, [course]);

    if (!course) return null;

    return (
        <div className="px-6 space-y-6 pt-4 animate-in fade-in slide-in-from-right-4 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">{course.name}</h2>
                    <p className="text-xs text-white/50">{course.code}</p>
                </div>
            </div>

            {/* Course Hero Stats */}
            <div className="bg-[#1C1C1E] p-6 rounded-[32px] flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-white/50 text-xs font-bold uppercase mb-1">Dina framsteg</p>
                    <h3 className="text-4xl font-bold text-white">0%</h3>
                </div>
                {/* Progress Circle (Mock) */}
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-green-500 relative z-10"></div>

                {/* Background Decor */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full"></div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-[#1C1C1E] rounded-2xl">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-[#FF6D5A] text-white shadow-lg' : 'text-white/50'}`}
                >
                    Översikt
                </button>
                <button
                    onClick={() => setActiveTab('lessons')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'lessons' ? 'bg-[#FF6D5A] text-white shadow-lg' : 'text-white/50'}`}
                >
                    Material
                </button>
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'assignments' ? 'bg-[#FF6D5A] text-white shadow-lg' : 'text-white/50'}`}
                >
                    Uppgifter
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-white/20 border-t-[#FF6D5A] rounded-full animate-spin"></div></div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="bg-[#1C1C1E] p-5 rounded-2xl space-y-2">
                                    <h4 className="font-bold text-white">Om kursen</h4>
                                    <p className="text-sm text-white/70 leading-relaxed">
                                        {course.description || "Ingen beskrivning tillgänglig."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#1C1C1E] p-4 rounded-2xl">
                                        <BookOpen className="text-indigo-400 mb-2" />
                                        <span className="text-2xl font-bold text-white block">{modules.length}</span>
                                        <span className="text-xs text-white/50 uppercase font-bold">Lektioner</span>
                                    </div>
                                    <div className="bg-[#1C1C1E] p-4 rounded-2xl">
                                        <FileText className="text-pink-400 mb-2" />
                                        <span className="text-2xl font-bold text-white block">{assignments.length}</span>
                                        <span className="text-xs text-white/50 uppercase font-bold">Uppgifter</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lessons' && (
                            <div className="space-y-3 animate-in fade-in">
                                {modules.length === 0 ? (
                                    <p className="text-center text-white/30 py-10 italic">Inget material än.</p>
                                ) : (
                                    modules.map((m, i) => (
                                        <div key={i} className="bg-[#1C1C1E] p-4 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                            <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400">
                                                {m.type === 'VIDEO' ? <Play size={24} /> : <BookOpen size={24} />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white">{m.title}</h4>
                                                <p className="text-xs text-white/50 line-clamp-1">{m.description || 'Lektion'}</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-white/10"></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'assignments' && (
                            <div className="space-y-3 animate-in fade-in">
                                {assignments.length === 0 ? (
                                    <p className="text-center text-white/30 py-10 italic">Inga uppgifter.</p>
                                ) : (
                                    assignments.map((a, i) => (
                                        <div key={i} className="bg-[#1C1C1E] p-4 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                            <div className="bg-pink-500/20 p-3 rounded-xl text-pink-400">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white">{a.title}</h4>
                                                <p className="text-xs text-white/50">Deadline: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Ingen'}</p>
                                            </div>
                                            <Clock size={16} className="text-white/30" />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MobileCourseView;
