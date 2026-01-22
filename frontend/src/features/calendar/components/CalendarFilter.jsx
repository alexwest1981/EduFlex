import React, { useState, useEffect } from 'react';
import { Filter, X, Users, User, ChevronDown, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';

const CalendarFilter = ({ onFilterChange, primaryFilter, secondaryFilter }) => {
    const { currentUser } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [filterableUsers, setFilterableUsers] = useState([]);
    const [teacherCourses, setTeacherCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCourseFilter, setShowCourseFilter] = useState(false);
    const [error, setError] = useState(null);

    const roleName = currentUser?.role?.name || currentUser?.role || '';
    const isTeacher = roleName === 'TEACHER';

    useEffect(() => {
        fetchFilterableUsers();
        if (isTeacher) {
            fetchTeacherCourses();
        }
    }, []);

    const fetchFilterableUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('[CalendarFilter] Fetching filterable users...');
            console.log('[CalendarFilter] Current user:', currentUser);
            const users = await api.get('/events/filterable-users');
            console.log('[CalendarFilter] Received users:', users);
            setFilterableUsers(users || []);
            if (!users || users.length === 0) {
                setError('Inga användare hittades för filtrering');
            }
        } catch (error) {
            console.error('[CalendarFilter] Failed to fetch filterable users:', error);
            console.error('[CalendarFilter] Error response:', error.response);
            setError(error.message || 'Kunde inte ladda användare');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeacherCourses = async () => {
        try {
            const courseIds = await api.get('/events/my-courses');
            // Fetch full course details
            const courses = await api.get('/courses');
            const myCourses = courses.filter(c => courseIds.includes(c.id));
            setTeacherCourses(myCourses);
        } catch (error) {
            console.error('Failed to fetch teacher courses:', error);
        }
    };

    const handleUserSelect = (user, isPrimary = true) => {
        if (isPrimary) {
            onFilterChange({
                type: 'user',
                value: user,
                isPrimary: true
            });
        } else {
            onFilterChange({
                type: 'user',
                value: user,
                isPrimary: false
            });
        }
        setIsOpen(false);
    };

    const handleCourseSelect = (course) => {
        onFilterChange({
            type: 'course',
            value: course,
            isPrimary: true
        });
        setShowCourseFilter(false);
        setIsOpen(false);
    };

    const clearFilter = (isPrimary = true) => {
        onFilterChange({
            type: 'clear',
            isPrimary
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'TEACHER': return 'text-blue-600 dark:text-blue-400';
            case 'MENTOR': return 'text-purple-600 dark:text-purple-400';
            case 'PRINCIPAL': return 'text-red-600 dark:text-red-400';
            case 'STUDENT': return 'text-green-600 dark:text-green-400';
            case 'ADMIN': return 'text-orange-600 dark:text-orange-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'TEACHER': return 'Lärare';
            case 'MENTOR': return 'Mentor';
            case 'PRINCIPAL': return 'Rektor';
            case 'STUDENT': return 'Elev';
            case 'ADMIN': return 'Admin';
            default: return role;
        }
    };

    return (
        <div className="relative">
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors border-2
                    ${(primaryFilter || secondaryFilter)
                        ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                <Filter size={18} />
                <span className="hidden lg:inline">Filter</span>
                {(primaryFilter || secondaryFilter) && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs bg-white text-indigo-600 rounded-full font-bold">
                        {(primaryFilter ? 1 : 0) + (secondaryFilter ? 1 : 0)}
                    </span>
                )}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">Filtrera Kalender</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Välj upp till 2 kalendrar att visa samtidigt
                        </p>
                    </div>

                    {/* Current Filters */}
                    {(primaryFilter || secondaryFilter) && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 space-y-2">
                            {primaryFilter && (
                                <div className="flex items-center justify-between p-2 bg-white dark:bg-[#1E1E1E] rounded-lg">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {primaryFilter.type === 'user'
                                                ? `${primaryFilter.value.firstName} ${primaryFilter.value.lastName}`
                                                : primaryFilter.value.name
                                            }
                                        </span>
                                        {primaryFilter.type === 'user' && (
                                            <span className={`text-xs ${getRoleColor(primaryFilter.value.role?.name)}`}>
                                                ({getRoleLabel(primaryFilter.value.role?.name)})
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => clearFilter(true)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        <X size={14} className="text-gray-500" />
                                    </button>
                                </div>
                            )}
                            {secondaryFilter && (
                                <div className="flex items-center justify-between p-2 bg-white dark:bg-[#1E1E1E] rounded-lg opacity-60">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-2 h-2 rounded-full bg-purple-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {secondaryFilter.type === 'user'
                                                ? `${secondaryFilter.value.firstName} ${secondaryFilter.value.lastName}`
                                                : secondaryFilter.value.name
                                            }
                                        </span>
                                        {secondaryFilter.type === 'user' && (
                                            <span className={`text-xs ${getRoleColor(secondaryFilter.value.role?.name)}`}>
                                                ({getRoleLabel(secondaryFilter.value.role?.name)})
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => clearFilter(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        <X size={14} className="text-gray-500" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Teacher Course Filter Toggle */}
                    {isTeacher && teacherCourses.length > 0 && (
                        <button
                            onClick={() => setShowCourseFilter(!showCourseFilter)}
                            className="w-full p-3 text-left text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                        >
                            <span>Filtrera efter kurs</span>
                            <ChevronDown size={16} className={`transition-transform ${showCourseFilter ? 'rotate-180' : ''}`} />
                        </button>
                    )}

                    {/* Course List */}
                    {showCourseFilter && (
                        <div className="border-b border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                            {teacherCourses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => handleCourseSelect(course)}
                                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {course.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {course.code}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                <button
                                    onClick={fetchFilterableUsers}
                                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Försök igen
                                </button>
                            </div>
                        ) : filterableUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Inga användare tillgängliga</p>
                            </div>
                        ) : (
                            <div>
                                {filterableUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserSelect(
                                            user,
                                            !primaryFilter || (secondaryFilter && primaryFilter.value.id === user.id)
                                        )}
                                        className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-2
                                            ${primaryFilter?.value?.id === user.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' :
                                              secondaryFilter?.value?.id === user.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' :
                                              'border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                                                ${user.role?.name === 'TEACHER' ? 'bg-blue-500' :
                                                  user.role?.name === 'MENTOR' ? 'bg-purple-500' :
                                                  user.role?.name === 'PRINCIPAL' ? 'bg-red-500' :
                                                  user.role?.name === 'STUDENT' ? 'bg-green-500' :
                                                  'bg-gray-500'
                                                }`}
                                            >
                                                {user.id === currentUser?.id ? (
                                                    <User size={16} />
                                                ) : (
                                                    <Users size={16} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {user.firstName} {user.lastName}
                                                    {user.id === currentUser?.id && (
                                                        <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(Jag)</span>
                                                    )}
                                                </div>
                                                <div className={`text-xs ${getRoleColor(user.role?.name)}`}>
                                                    {getRoleLabel(user.role?.name)}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarFilter;
