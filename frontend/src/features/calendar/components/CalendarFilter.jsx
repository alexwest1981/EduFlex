import React, { useState, useEffect } from 'react';
import { Filter, X, Users, User, ChevronDown, Loader2, Check } from 'lucide-react';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';

const EVENT_TYPES = [
    { value: 'LESSON', label: 'Lektion', color: 'bg-orange-500' },
    { value: 'MEETING', label: 'Möte / One-on-One', color: 'bg-purple-500' },
    { value: 'WORKSHOP', label: 'Workshop', color: 'bg-teal-500' },
    { value: 'EXAM', label: 'Prov', color: 'bg-red-500' },
    { value: 'ASSIGNMENT', label: 'Uppgift', color: 'bg-yellow-500' },
    { value: 'OTHER', label: 'Annat', color: 'bg-gray-500' }
];

const CalendarFilter = ({ onFilterChange, primaryFilter, secondaryFilter, selectedTypes = [] }) => {
    const { currentUser } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [filterableUsers, setFilterableUsers] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCourseFilter, setShowCourseFilter] = useState(false);
    const [showTypeFilter, setShowTypeFilter] = useState(false);
    const [error, setError] = useState(null);

    const roleName = currentUser?.role?.name || currentUser?.role || '';
    const isTeacher = roleName === 'TEACHER';
    const isStudent = roleName === 'STUDENT';

    const fetchFilterableUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const users = await api.get('/events/filterable-users');
            setFilterableUsers(users || []);
            if (!users || users.length === 0) {
                setError('Inga användare hittades för filtrering');
            }
        } catch (error) {
            console.error('[CalendarFilter] Failed to fetch filterable users:', error);
            setError(error.message || 'Kunde inte ladda användare');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyCourses = async () => {
        try {
            const courseIds = await api.get('/events/my-courses');
            const courses = await api.get('/courses');
            const filtered = courses.filter(c => courseIds.includes(c.id));
            setMyCourses(filtered);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    useEffect(() => {
        fetchFilterableUsers();
        if (isTeacher || isStudent) {
            fetchMyCourses();
        }
    }, [isTeacher, isStudent]);

    const handleUserSelect = (user, isPrimary = true) => {
        onFilterChange({
            type: 'user',
            value: user,
            isPrimary
        });
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

    const handleTypeToggle = (typeValue) => {
        let newTypes;
        if (selectedTypes.includes(typeValue)) {
            newTypes = selectedTypes.filter(t => t !== typeValue);
        } else {
            newTypes = [...selectedTypes, typeValue];
        }
        onFilterChange({
            type: 'types',
            value: newTypes
        });
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
                    ${(primaryFilter || secondaryFilter || selectedTypes.length > 0)
                        ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                <Filter size={18} />
                <span className="hidden lg:inline">Filter</span>
                {(primaryFilter || secondaryFilter || selectedTypes.length > 0) && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs bg-white text-indigo-600 rounded-full font-bold">
                        {(primaryFilter ? 1 : 0) + (secondaryFilter ? 1 : 0) + (selectedTypes.length > 0 ? 1 : 0)}
                    </span>
                )}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-[80vh] overflow-hidden flex flex-col">
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
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Event Types Filter */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowTypeFilter(!showTypeFilter)}
                                className="w-full p-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
                            >
                                <span>Händelsetyp</span>
                                <ChevronDown size={16} className={`transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
                            </button>

                            {showTypeFilter && (
                                <div className="p-2 grid grid-cols-1 gap-1">
                                    {EVENT_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => handleTypeToggle(type.value)}
                                            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors
                                                ${selectedTypes.includes(type.value)
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                            <span className="text-sm font-medium">{type.label}</span>
                                            {selectedTypes.includes(type.value) && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Course Filter Toggle */}
                        {(isTeacher || isStudent) && myCourses.length > 0 && (
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowCourseFilter(!showCourseFilter)}
                                    className="w-full p-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
                                >
                                    <span>Filtrera efter kurs</span>
                                    <ChevronDown size={16} className={`transition-transform ${showCourseFilter ? 'rotate-180' : ''}`} />
                                </button>

                                {showCourseFilter && (
                                    <div className="max-h-40 overflow-y-auto">
                                        {myCourses.map(course => (
                                            <button
                                                key={course.id}
                                                onClick={() => handleCourseSelect(course)}
                                                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                                                    ${primaryFilter?.type === 'course' && primaryFilter.value.id === course.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-600' : ''}`}
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
                            </div>
                        )}

                        {/* User List */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            Användare
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                                <button onClick={fetchFilterableUsers} className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">Försök igen</button>
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
                                            ${primaryFilter?.type === 'user' && primaryFilter.value.id === user.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' :
                                                secondaryFilter?.type === 'user' && secondaryFilter.value.id === user.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' :
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
                                                {user.id === currentUser?.id ? <User size={16} /> : <Users size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {user.firstName} {user.lastName}
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

                    {/* Footer - Clear Actions */}
                    {(primaryFilter || secondaryFilter || selectedTypes.length > 0) && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between">
                            <button
                                onClick={() => onFilterChange({ type: 'clear_all' })}
                                className="text-xs text-red-600 dark:text-red-400 hover:underline font-bold"
                            >
                                Rensa allt
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                            >
                                Klar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarFilter;
