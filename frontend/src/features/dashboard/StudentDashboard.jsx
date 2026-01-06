import React, { useState, useEffect } from 'react';
import {
    BookOpen, Clock, Award, Zap, ChevronRight,
    Trophy, Star, Calendar, Flag, MessageSquare, LayoutDashboard
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useModules } from '../../context/ModuleContext'; // <--- NY
import { useNavigate } from 'react-router-dom';
import MessageCenter from '../messages/MessageCenter';

const StudentDashboard = () => {
    const { currentUser } = useAppContext();
    const { isModuleActive } = useModules(); // <--- NY: Hämta modulstatus
    const navigate = useNavigate();

    const [myCourses, setMyCourses] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview');

    // --- GAMIFICATION LOGIK ---
    const pointsPerLevel = 100;
    const currentPoints = currentUser?.points || 0;
    const currentLevel = currentUser?.level || 1;
    const pointsInLevel = currentPoints % pointsPerLevel;
    const progressPercent = (pointsInLevel / pointsPerLevel) * 100;
    const pointsToNext = pointsPerLevel - pointsInLevel;

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const coursesData = await api.courses.getMyCourses(currentUser.id);
            setMyCourses(coursesData || []);

            let activeAssignments = [];
            if (coursesData && coursesData.length > 0) {
                const promises = coursesData.map(async (course) => {
                    try {
                        const assignments = await api.assignments.getByCourse(course.id);
                        const assignmentPromises = assignments.map(async (assign) => {
                            try {
                                const mySub = await api.assignments.getMySubmission(assign.id, currentUser.id);
                                if (!mySub) {
                                    return { ...assign, courseName: course.name, courseId: course.id };
                                }
                                return null;
                            } catch {
                                return { ...assign, courseName: course.name, courseId: course.id };
                            }
                        });
                        const courseActiveAssignments = (await Promise.all(assignmentPromises)).filter(a => a !== null);
                        return courseActiveAssignments;
                    } catch {
                        return [];
                    }
                });
                const results = await Promise.all(promises);
                results.forEach(arr => activeAssignments.push(...arr));
            }

            const now = new Date();
            const upcoming = activeAssignments
                .map(a => ({...a, parsedDate: parseDate(a.dueDate)}))
                .filter(a => a.parsedDate > now)
                .sort((a, b) => a.parsedDate - b.parsedDate)
                .slice(0, 5);

            setUpcomingAssignments(upcoming);

        } catch (e) {
            console.error("Kunde inte hämta dashboard-data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const parseDate = (dateInput) => {
        if (!dateInput) return new Date();
        if (Array.isArray(dateInput)) {
            return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
        }
        return new Date(dateInput);
    };

    const formatMonth = (dateObj) => dateObj.toLocaleString('default', { month: 'short' });
    const formatTime = (dateObj) => dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getBadgeIcon = (iconKey) => {
        switch (iconKey) {
            case 'TROPHY': return <Trophy size={24} className="text-amber-500" />;
            case 'STAR': return <Star size={24} className="text-yellow-400" />;
            case 'FLAG': return <Flag size={24} className="text-blue-500" />;
            case 'CLOCK': return <Clock size={24} className="text-purple-500" />;
            default: return <Award size={24} className="text-indigo-500" />;
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Laddar din översikt...</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hej, {currentUser?.firstName}! 👋</h1>
                <p className="text-gray-500 dark:text-gray-400">Här är dina studier just nu.</p>
            </div>

            <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043] mb-8">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <LayoutDashboard size={18}/> Översikt
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'messages' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <MessageSquare size={18}/> Meddelanden
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2 fade-in duration-300">

                    <div className="lg:col-span-2 space-y-8">

                        {/* GAMIFICATION SECTION - VISAS BARA OM MODULEN ÄR PÅ */}
                        {isModuleActive('GAMIFICATION') && (
                            <>
                                {/* LEVEL CARD */}
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={120} /></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Nuvarande Nivå</p>
                                                <h2 className="text-5xl font-black mt-1">{currentLevel}</h2>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end text-yellow-300 font-bold text-xl">
                                                    <Zap fill="currentColor" /> {currentPoints}
                                                </div>
                                                <p className="text-indigo-100 text-xs mt-1">{pointsToNext} poäng till nästa nivå</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden backdrop-blur-sm">
                                            <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* BADGES */}
                                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Award className="text-indigo-500" size={20}/> Mina Utmärkelser
                                    </h3>
                                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                        {currentUser?.earnedBadges && currentUser.earnedBadges.length > 0 ? (
                                            currentUser.earnedBadges.map((userBadge) => (
                                                <div key={userBadge.id} className="flex flex-col items-center min-w-[100px] p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] border border-gray-100 dark:border-[#3c4043]">
                                                    <div className="bg-white dark:bg-[#131314] p-3 rounded-full shadow-sm mb-2">{getBadgeIcon(userBadge.badge?.iconKey)}</div>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center">{userBadge.badge?.name}</span>
                                                    <span className="text-[10px] text-gray-500 text-center line-clamp-1">{userBadge.badge?.description}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-sm italic w-full text-center py-4 border-2 border-dashed border-gray-100 dark:border-[#3c4043] rounded-xl">
                                                Du har inga utmärkelser än.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* MINA KURSER */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="text-indigo-600" /> Mina Kurser
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myCourses.length > 0 ? myCourses.map(course => (
                                    <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded text-xs font-bold uppercase">{course.courseCode || 'Kurs'}</div>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{course.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-[#3c4043]">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#3c4043] flex items-center justify-center text-[10px] font-bold">{course.teacher?.firstName?.charAt(0)}</div>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{course.teacher?.fullName}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-10 bg-white dark:bg-[#1E1F20] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                                        <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-500">Du är inte registrerad på några kurser.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* HÖGER KOLUMN */}
                    <div className="space-y-8">
                        {/* UPCOMING DEADLINES - Visas bara om Inlämningar (SUBMISSIONS) är aktiverat */}
                        {isModuleActive('SUBMISSIONS') && (
                            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Clock size={20} className="text-red-500"/> Kommande Deadlines
                                    </h3>
                                    {upcomingAssignments.length > 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{upcomingAssignments.length}</span>}
                                </div>

                                <div className="space-y-4">
                                    {upcomingAssignments.length > 0 ? upcomingAssignments.map((assign) => (
                                        <div key={assign.id} className="p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] border border-gray-100 dark:border-[#3c4043] flex gap-3 group hover:bg-white dark:hover:bg-[#131314] hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate(`/course/${assign.course?.id || assign.courseId}`)}>
                                            <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-lg p-2 flex flex-col items-center justify-center min-w-[50px] h-[50px]">
                                                <span className="text-[10px] font-bold text-red-500 uppercase">{formatMonth(assign.parsedDate)}</span>
                                                <span className="text-lg font-black text-gray-800 dark:text-gray-200">{assign.parsedDate.getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{assign.title}</h4>
                                                <p className="text-xs text-gray-500 truncate">{assign.courseName}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10}/> {formatTime(assign.parsedDate)}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto text-gray-300 mb-2" size={32}/>
                                            <p className="text-gray-500 text-sm">Inga kommande uppgifter just nu.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* EXTRA INFO */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">Snittbetyg (Estimat)</h3>
                            <div className="text-5xl font-black text-emerald-500 mb-1">B</div>
                            <p className="text-xs text-gray-400">Baserat på dina senaste inlämningar.</p>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <MessageCenter />
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;