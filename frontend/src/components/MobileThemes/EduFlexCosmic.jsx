import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bell, SlidersHorizontal, Home, BookOpen, Users, FolderOpen, Calendar, Menu, X, Moon, LogOut, FileText, ChevronRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

// Import Modular Views (Shared Logic)
import MobileDashboardView from './views/MobileDashboardView';
import MobileCourseView from './views/MobileCourseView'; // Import Course Detail View
import MobileThemeSelector from './mobilecomponents/MobileThemeSelector';
import MobileResourcesView from './views/MobileResourcesView';
import MobileCalendarView from './views/MobileCalendarView';
import MobileAdminView from './views/MobileAdminView';
import MobileAnalyticsView from './views/MobileAnalyticsView';
import MobileProfileView from './views/MobileProfileView';
import MobileCommunicationView from './views/MobileCommunicationView';
import MobileAvatar from './views/MobileAvatar';

// --- HELPER COMPONENTS (MUST NOT BE DELETED) ---

/**
 * MobileFloatingNav - Cosmic Style
 */
const MobileFloatingNav = ({ currentView, setView, onMenuClick, unreadCount = 0 }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md rounded-[30px] px-6 py-4 shadow-[0_20px_50px_rgba(31,34,53,0.3)] flex items-center gap-6 pointer-events-auto border border-white/20">
                <button
                    onClick={() => setView('dashboard')}
                    className={`transition-colors active:scale-95 ${currentView === 'dashboard' ? 'text-[#1F2235]' : 'text-gray-400'}`}
                >
                    <Home size={24} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setView('courses')}
                    className={`transition-colors active:scale-95 ${currentView === 'courses' ? 'text-[#1F2235]' : 'text-gray-400'}`}
                >
                    <BookOpen size={24} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => setView('communication')}
                    className={`transition-colors active:scale-95 relative ${currentView === 'communication' ? 'text-[#1F2235]' : 'text-gray-400'}`}
                >
                    <MessageSquare size={24} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6D5A] rounded-full border border-white"></span>
                    )}
                </button>
                <button
                    onClick={() => setView('resources')}
                    className={`transition-colors active:scale-95 ${currentView === 'resources' ? 'text-[#1F2235]' : 'text-gray-400'}`}
                >
                    <FolderOpen size={24} strokeWidth={2.5} />
                </button>
                <button
                    onClick={onMenuClick}
                    className="text-gray-400 hover:text-[#1F2235] transition-colors active:scale-95 px-2"
                >
                    <Menu size={24} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

/**
 * SimpleInternalMenu - Safe menu with Theme Switching
 */
const SimpleInternalMenu = ({ isOpen, onClose, onLogout, onThemeChange }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-[#1F2235]/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[#1F2235]">Menu</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                </div>

                <div className="space-y-2">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                        <MobileThemeSelector />
                    </div>

                    <button onClick={onLogout} className="w-full p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 mt-4 font-bold">
                        <LogOut size={20} />
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Error Boundary (Debugging Enabled) ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-500 bg-black min-h-screen pt-20 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-4">Cosmic Crash 🌠</h1>
                    <div className="text-left bg-red-900/20 p-4 rounded border border-red-500/30">
                        <p className="font-bold mb-2 text-red-400">{this.state.error?.toString()}</p>
                        <pre className="text-[10px] text-red-300/70 whitespace-pre-wrap font-mono">
                            {this.state.error?.stack}
                        </pre>
                    </div>
                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-white text-black rounded-full font-bold w-full">Retry Launch</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- SUB-VIEWS (Styled for Cosmic) ---

const UsersView = ({ users }) => (
    <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
        <h2 className="text-2xl font-bold text-[#1F2235]">Members</h2>
        <div className="space-y-3">
            {users.map((u, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                    <MobileAvatar
                        user={u}
                        className="w-12 h-12 rounded-2xl text-base shadow-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <div className="flex-1">
                        <h3 className="font-bold text-[#1F2235]">{u.fullName || u.name}</h3>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{u.role?.name || u.role}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CoursesView = ({ courses, onCourseClick }) => (
    <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
        <h2 className="text-2xl font-bold text-[#1F2235]">Courses</h2>
        <div className="grid grid-cols-2 gap-4">
            {courses.map((c, i) => (
                <div
                    key={i}
                    onClick={() => onCourseClick(c)}
                    className={`p-4 rounded-3xl flex flex-col justify-between h-40 cursor-pointer active:scale-95 transition-all ${i % 2 === 0 ? 'bg-[#E6F5FA]' : 'bg-[#F0FDF4]'}`}
                >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#1F2235]">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1F2235] leading-tight mb-1 line-clamp-2">{c.name}</h3>
                        <p className="text-xs font-bold opacity-50">{c.code}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DocumentsView = ({ docs }) => (
    <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
        <h2 className="text-2xl font-bold text-[#1F2235]">Documents</h2>
        <div className="space-y-3">
            {docs.map((d, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 active:scale-95 transition-transform" onClick={() => window.open(d.url || d.path, '_blank')}>
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-500">
                        <FileText size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[#1F2235] truncate max-w-[200px]">{d.title || d.name}</h3>
                        <span className="text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600">Open</button>
                </div>
            ))}
        </div>
    </div>
);

/**
 * EduFlexCosmic - High Fidelity SPA with Theme Switcher
 */
const EduFlexCosmic = ({ currentUser }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { getCustomTheme, updateBranding } = useBranding();

    const [localMenuOpen, setLocalMenuOpen] = useState(false);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'users', 'courses', 'documents'
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All topics');

    // Data State
    // Data State
    const [allUsers, setAllUsers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [stats, setStats] = useState({ unreadMessages: 0 });

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return;
            try {
                // Determine if fetching ALL or MY courses
                const isStudent = currentUser?.role === 'STUDENT' || currentUser?.role?.name === 'STUDENT';

                const [uData, cData, unread] = await Promise.all([
                    api.users.getAll(0, 100),
                    isStudent ? api.courses.getMyCourses(currentUser.id) : api.courses.getAll(),
                    api.messages.getUnreadCount()
                ]);

                // Defensively unpack
                setAllUsers(uData?.content || uData || []);
                setAllCourses(Array.isArray(cData) ? cData : (cData?.content || []));
                setStats({ unreadMessages: unread || 0 });
            } catch (e) { console.error(e); }
        };
        loadData();
    }, [currentUser]);

    const handleLogout = () => navigate('/logout');

    const handleThemeChange = async (newThemeId) => {
        try {
            const currentTheme = getCustomTheme() || {};
            const updatedTheme = { ...currentTheme, mobile: { ...currentTheme.mobile, id: newThemeId } };
            await updateBranding({ customTheme: JSON.stringify(updatedTheme) });
            window.location.reload();
        } catch (e) { console.error(e); }
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setView('course');
    };

    const filters = ['All topics', 'Design', 'Code', 'Bio'];

    // Helper for profile image (matching Finsights logic)
    const profileImg = currentUser?.profilePictureUrl ? api.getSafeUrl(currentUser.profilePictureUrl) : null;

    // MAIN RENDER
    return (
        <ErrorBoundary>
            <div className="bg-[#F8F9FB] dark:bg-[#111827] min-h-screen text-[#1F2235] dark:text-white pb-24 font-sans selection:bg-indigo-100">

                <SimpleInternalMenu
                    isOpen={localMenuOpen}
                    onClose={() => setLocalMenuOpen(false)}
                    onLogout={handleLogout}
                    onThemeChange={handleThemeChange}
                />

                {/* Header Section */}
                <div className="px-6 pt-12 pb-6 flex justify-between items-start bg-white/50 backdrop-blur-sm sticky top-0 z-40">
                    <div className="flex items-center gap-4" onClick={() => setView('profile')}>
                        <MobileAvatar
                            user={currentUser}
                            className="w-12 h-12 rounded-2xl text-base shadow-sm bg-gray-200"
                        />
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Hello,</p>
                            <h1 className="text-xl font-bold leading-tight">{currentUser?.fullName || currentUser?.name || 'Student'}</h1>
                        </div>
                    </div>
                    <button onClick={() => setView('communication')} className="p-2 relative bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-transform active:scale-95">
                        <Bell size={20} />
                        {stats.unreadMessages > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>
                </div>

                {/* ROUTER SWITCH */}
                {/* ROUTER SWITCH */}
                {view === 'users' && <UsersView users={allUsers} />}
                {view === 'courses' && <CoursesView courses={allCourses} onCourseClick={handleCourseClick} />}
                {view === 'course' && <MobileCourseView course={selectedCourse} onBack={() => setView('courses')} />}

                {/* Replaced Custom Dashboard with Shared Real-Data Dashboard */}
                {view === 'dashboard' && <MobileDashboardView currentUser={currentUser} setView={setView} />}

                {/* Additional Views */}
                {view === 'resources' && <MobileResourcesView currentUser={currentUser} />}
                {view === 'calendar' && <MobileCalendarView />}
                {view === 'admin' && <MobileAdminView />}
                {view === 'analytics' && <MobileAnalyticsView />}
                {view === 'profile' && <MobileProfileView currentUser={currentUser} onLogout={handleLogout} />}
                {view === 'communication' && <MobileCommunicationView currentUser={currentUser} />}

                {/* Sub-views reachable from Dashboard */}
                {view === 'grading' && (
                    <div className="px-6 space-y-4 pt-4 animate-in fade-in pb-32">
                        <h2 className="text-3xl font-bold text-[#1F2235]">Grading</h2>
                        <button onClick={() => setView('dashboard')} className="mt-4 text-sm font-bold underline text-gray-500">Back</button>
                    </div>
                )}
                {view === 'applications' && (
                    <div className="px-6 space-y-4 pt-4 animate-in fade-in pb-32">
                        <h2 className="text-3xl font-bold text-[#1F2235]">Applications</h2>
                        <button onClick={() => setView('dashboard')} className="mt-4 text-sm font-bold underline text-gray-500">Back</button>
                    </div>
                )}

                <MobileFloatingNav currentView={view} setView={setView} onMenuClick={() => setLocalMenuOpen(true)} unreadCount={stats.unreadMessages} />
            </div>
        </ErrorBoundary>
    );
};

export default EduFlexCosmic;
