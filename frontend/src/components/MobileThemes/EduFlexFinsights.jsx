import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, BarChart2, ArrowRight, FileText, SlidersHorizontal, MoreHorizontal, Home, LayoutGrid, LogOut, Moon, Sun, X, BookOpen, Users, FolderOpen, ChevronRight, GraduationCap, MessageSquare, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

// Import Modular Views
import MobileDashboardView from './views/MobileDashboardView';
import MobileCalendarView from './views/MobileCalendarView';
import MobileResourcesView from './views/MobileResourcesView';
import MobileAdminView from './views/MobileAdminView';
import MobileAnalyticsView from './views/MobileAnalyticsView';
import MobileProfileView from './views/MobileProfileView';
import MobileCommunicationView from './views/MobileCommunicationView';
import MobileAvatar from './views/MobileAvatar';
import MobileCourseView from './views/MobileCourseView';
import MobileThemeSelector from './mobilecomponents/MobileThemeSelector';


const MobileFloatingNav = ({ currentView, setView, onMenuClick, unreadCount = 0 }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
            <div className="bg-white rounded-[30px] px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-6 pointer-events-auto">
                <button
                    onClick={() => setView('dashboard')}
                    className={`transition-colors active:scale-95 ${currentView === 'dashboard' ? 'text-black' : 'text-gray-400'}`}
                >
                    <Home size={24} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setView('courses')}
                    className={`transition-colors active:scale-95 ${currentView === 'courses' ? 'text-black' : 'text-gray-400'}`}
                >
                    <BookOpen size={24} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setView('communication')}
                    className={`transition-colors active:scale-95 relative ${currentView === 'communication' ? 'text-black' : 'text-gray-400'}`}
                >
                    <MessageSquare size={24} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6D5A] rounded-full border border-white"></span>
                    )}
                </button>
                <button
                    onClick={() => setView('resources')}
                    className={`transition-colors active:scale-95 ${currentView === 'resources' ? 'text-black' : 'text-gray-400'}`}
                >
                    <FolderOpen size={24} strokeWidth={2.5} />
                </button>
                <button
                    onClick={onMenuClick}
                    className="text-gray-400 hover:text-black transition-colors active:scale-95"
                >
                    <MoreHorizontal size={24} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

/**
 * SimpleInternalMenu
 */
const SimpleInternalMenu = ({ isOpen, onClose, onLogout, onThemeChange, setView }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#1C1C1E] w-full max-w-sm rounded-[32px] p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Meny</h3>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => { setView('calendar'); onClose(); }} className="p-4 bg-indigo-500/20 rounded-2xl flex flex-col items-center gap-2 text-indigo-400">
                        <Calendar size={24} />
                        <span className="text-xs font-bold">Kalender</span>
                    </button>
                    <button onClick={() => { setView('users'); onClose(); }} className="p-4 bg-pink-500/20 rounded-2xl flex flex-col items-center gap-2 text-pink-400">
                        <Users size={24} />
                        <span className="text-xs font-bold">Användare</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="p-4 bg-white/5 rounded-2xl">
                        <h4 className="text-white/50 text-xs font-bold uppercase mb-3">Utseende</h4>
                        <MobileThemeSelector />
                    </div>
                </div>

                <button className="w-full p-4 bg-white/5 rounded-2xl flex items-center gap-3 text-white">
                    <Moon size={20} />
                    <span className="font-bold flex-1 text-left">Dark Mode</span>
                    <div className="bg-green-500 text-xs px-2 py-1 rounded font-bold text-black">PÅ</div>
                </button>

                <button onClick={onLogout} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center gap-3 mt-4">
                    <LogOut size={20} />
                    <span className="font-bold">Logga ut</span>
                </button>
            </div>
        </div>
    );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-500 bg-black min-h-screen pt-20 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-4">Något gick fel 😔</h1>
                    <div className="text-left bg-red-900/20 p-4 rounded border border-red-500/30">
                        <p className="font-bold mb-2 text-red-400">{this.state.error?.toString()}</p>
                        <pre className="text-[10px] text-red-300/70 whitespace-pre-wrap font-mono">
                            {this.state.error?.stack}
                        </pre>
                    </div>
                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-white text-black rounded-full font-bold w-full">
                        Försök igen
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- SUB-VIEWS ---

const UsersView = ({ users, loading }) => (
    <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
        <h2 className="text-3xl font-bold">Användare</h2>
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-500" size={20} />
            <input type="text" placeholder="Sök användare..." className="w-full bg-[#1C1C1E] py-4 pl-12 pr-4 rounded-2xl text-white outline-none focus:ring-2 ring-[#FF6D5A]" />
        </div>

        <div className="space-y-3">
            {loading ? <p className="text-center opacity-50 p-4">Laddar...</p> : users.map((u, i) => (
                <div key={i} className="bg-[#1C1C1E] p-4 rounded-2xl flex items-center gap-4">
                    <MobileAvatar user={u} className="w-12 h-12 rounded-full text-base bg-gray-700" />
                    <div className="flex-1">
                        <h3 className="font-bold text-white">{u.fullName || u.name}</h3>
                        <p className="text-xs text-white/50 font-bold tracking-wider capitalize">{(u.role?.name || u.role || '').toLowerCase()}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CoursesView = ({ courses, currentUser, onCourseClick }) => {
    // Force vibrant colors to prevent black-on-black (ignoring backend color for now)
    const COLORS = ['#FFCE47', '#A78BFA', '#4ADE80', '#60A5FA', '#F472B6', '#FF6D5A'];
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role?.name === 'ADMIN';

    return (
        <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
            <h2 className="text-3xl font-bold">{isAdmin ? 'Alla kurser' : 'Mina kurser'}</h2>

            <div className="grid grid-cols-1 gap-3">
                {courses.map((c, i) => {
                    const bg = COLORS[i % COLORS.length];
                    return (
                        <div key={i} onClick={() => onCourseClick(c)} style={{ backgroundColor: bg }} className="cursor-pointer text-black p-5 rounded-[28px] relative overflow-hidden transition-all active:scale-95 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-black/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Active</span>
                                <div className="bg-white/40 p-2 rounded-full"><BookOpen size={20} className="opacity-70" /></div>
                            </div>
                            <h3 className="text-2xl font-bold leading-tight mb-1">{c.name}</h3>
                            <p className="font-medium opacity-60 text-sm">{c.code || 'NO-CODE'}</p>

                            <div className="mt-6 flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(x => <div key={x} className="w-8 h-8 rounded-full bg-white/40 border-2" style={{ borderColor: bg }} />)}
                                </div>
                                <span className="text-xs font-bold opacity-60 ml-2">+12 studenter</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * EduFlexFinsights 
 * SPA Version
 */
const EduFlexFinsights = ({ currentUser }) => {
    const navigate = useNavigate();
    const { getCustomTheme, updateBranding } = useBranding();

    const [localMenuOpen, setLocalMenuOpen] = useState(false);
    const [view, setView] = useState('dashboard');
    const [selectedCourse, setSelectedCourse] = useState(null); // Add state for selected course

    // Data State (Global Lists)
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [stats, setStats] = useState({ unreadMessages: 0 });

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return; // Wait for user

            try {
                // Determine which courses to fetch based on role
                const isStudent = currentUser.role?.name === 'STUDENT' || currentUser.role === 'STUDENT';

                const [uData, cData, unread] = await Promise.all([
                    api.users.getAll(0, 100),
                    isStudent ? api.courses.getMyCourses(currentUser.id) : api.courses.getAll(),
                    api.messages.getUnreadCount()
                ]);

                setAllUsers(uData.content || uData || []);
                setAllCourses(cData || []);
                setStats({ unreadMessages: unread || 0 });
                setLoading(false);
            } catch (e) {
                console.error("Data load failed", e);
                setLoading(false);
            }
        };
        loadData();
    }, [currentUser]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleThemeChange = async (newThemeId) => {
        try {
            const currentTheme = getCustomTheme() || {};
            const updatedTheme = {
                ...currentTheme,
                mobile: { ...currentTheme.mobile, id: newThemeId }
            };
            await updateBranding({ customTheme: JSON.stringify(updatedTheme) });
            window.location.reload();
        } catch (e) {
            console.error("Failed to switch theme", e);
        }
    };

    // Role text
    const roleText = (currentUser?.role?.name || currentUser?.role || 'User').toLowerCase();
    // Name display
    const displayName = currentUser?.fullName || currentUser?.name || "Användare";

    // Navigation Helper
    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setView('course');
    };

    // MAIN RENDER
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-[#0F0F11] text-white font-sans selection:bg-[#FF6D5A] pb-32">

                <SimpleInternalMenu
                    isOpen={localMenuOpen}
                    onClose={() => setLocalMenuOpen(false)}
                    onLogout={handleLogout}
                    onThemeChange={handleThemeChange}
                    setView={setView}
                />

                {/* Header - RESTRUCTURED: Profile Left, Actions Right */}
                <div className="relative z-40 bg-[#0F0F11] pt-12 pb-4 px-6">
                    <div className="flex justify-between items-center mb-6">
                        {/* LEFT: Profile & Name */}
                        <div className="flex items-center gap-4" onClick={() => setView('profile')}>
                            <button className="w-12 h-12 rounded-full overflow-hidden border border-white/10 active:scale-95 transition-all relative ring-2 ring-transparent active:ring-white/20">
                                <MobileAvatar user={currentUser} className="w-full h-full text-base" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                                    {displayName}
                                </h1>
                                <p className="text-sm font-medium text-white/50 lowercase">
                                    {roleText}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button onClick={() => setView('communication')} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 active:scale-95 transition-all">
                                    <Bell size={22} />
                                </button>
                                {stats.unreadMessages > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-[#FF6D5A] border-2 border-[#0F0F11] rounded-full text-[10px] font-bold flex items-center justify-center">{stats.unreadMessages}</span>
                                )}
                            </div>
                            <button onClick={() => setView('search')} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 active:scale-95 transition-all">
                                <Search size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ROUTER SWITCH */}
                {view === 'dashboard' && <MobileDashboardView currentUser={currentUser} setView={setView} />}

                {view === 'users' && <UsersView users={allUsers} loading={loading} />}
                {view === 'courses' && <CoursesView courses={allCourses} currentUser={currentUser} onCourseClick={handleCourseClick} />}
                {view === 'course' && <MobileCourseView course={selectedCourse} onBack={() => setView('courses')} />}
                {view === 'resources' && <MobileResourcesView currentUser={currentUser} />}
                {view === 'calendar' && <MobileCalendarView />}

                {/* NEW ADMIN VIEWS */}
                {view === 'admin' && <MobileAdminView />}
                {view === 'analytics' && <MobileAnalyticsView />}
                {view === 'profile' && <MobileProfileView currentUser={currentUser} onLogout={handleLogout} />}

                {view === 'communication' && <MobileCommunicationView currentUser={currentUser} />}

                {view === 'search' && <UsersView users={allUsers} loading={loading} />}

                {/* Views triggered by Dashboard */}
                {view === 'grading' && (
                    <div className="px-6 space-y-4 pt-4 animate-in fade-in pb-32">
                        <h2 className="text-3xl font-bold">Rättning</h2>
                        <button onClick={() => setView('dashboard')} className="mt-4 text-sm font-bold underline">Tillbaka</button>
                    </div>
                )}
                {view === 'applications' && (
                    <div className="px-6 space-y-4 pt-4 animate-in fade-in pb-32">
                        <h2 className="text-3xl font-bold">Ansökningar</h2>
                        <button onClick={() => setView('dashboard')} className="mt-4 text-sm font-bold underline">Tillbaka</button>
                    </div>
                )}

                <MobileFloatingNav currentView={view} setView={setView} onMenuClick={() => setLocalMenuOpen(true)} unreadCount={stats.unreadMessages} />
            </div>
        </ErrorBoundary>
    );
};

export default EduFlexFinsights;
