import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, Users, User, ChevronDown, Loader2, ChevronLeft, BookOpen } from 'lucide-react';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';

const CalendarFilter = ({ onFilterChange, primaryFilter, secondaryFilter }) => {
    const { currentUser } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [filterableUsers, setFilterableUsers] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // New navigation state
    const [filterView, setFilterView] = useState('main'); // 'main', 'roles', 'users-of-role', 'courses'
    const [selectedRole, setSelectedRole] = useState(null);

    const roleName = currentUser?.role?.name || currentUser?.role || '';
    const isStudent = roleName === 'STUDENT';

    useEffect(() => {
        if (isOpen) {
            if (isStudent) {
                fetchAvailableCourses();
            } else {
                fetchFilterableUsers();
            }
        }
    }, [isOpen]);

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

    const fetchAvailableCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Students use a specific endpoint for their courses
            const endpoint = isStudent ? '/courses/my-courses' : '/courses';
            const courses = await api.get(endpoint);
            setAvailableCourses(courses || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setError('Kunde inte ladda kurser');
        } finally {
            setIsLoading(false);
        }
    };

    // Derived data
    const availableRoles = useMemo(() => {
        if (!filterableUsers) return [];
        const rolesMap = new Map();
        filterableUsers.forEach(u => {
            if (u.role && u.role.name !== 'PRINCIPAL') {
                rolesMap.set(u.role.name, u.role);
            }
        });
        return Array.from(rolesMap.values());
    }, [filterableUsers]);

    const filteredUsersByRole = useMemo(() => {
        if (!selectedRole) return [];
        return filterableUsers.filter(u => u.role?.name === selectedRole);
    }, [filterableUsers, selectedRole]);

    const handleUserSelect = (user, isPrimary = true) => {
        onFilterChange({
            type: 'user',
            value: user,
            isPrimary
        });
        setIsOpen(false);
        resetNavigation();
    };

    const handleCourseSelect = (course) => {
        onFilterChange({
            type: 'course',
            value: course,
            isPrimary: true
        });
        setIsOpen(false);
        resetNavigation();
    };

    const clearFilter = (isPrimary = true) => {
        onFilterChange({
            type: 'clear',
            isPrimary
        });
    };

    const resetNavigation = () => {
        setFilterView('main');
        setSelectedRole(null);
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

    const renderRolesList = () => (
        <div className="flex-1 overflow-y-auto">
            <button
                onClick={() => setFilterView('main')}
                className="w-full p-3 flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
            >
                <ChevronLeft size={16} /> Tillbaka
            </button>
            {availableRoles.map(role => (
                <button
                    key={role.name}
                    onClick={() => {
                        setSelectedRole(role.name);
                        setFilterView('users-of-role');
                    }}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getRoleColor(role.name).replace('text-', 'bg-')}`} />
                        <span className="font-medium text-gray-900 dark:text-white">{getRoleLabel(role.name)}</span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
            ))}
        </div>
    );

    const renderUsersOfRole = () => (
        <div className="flex-1 overflow-y-auto">
            <button
                onClick={() => setFilterView('roles')}
                className="w-full p-3 flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
            >
                <ChevronLeft size={16} /> Tillbaka till roller
            </button>
            {filteredUsersByRole.map(user => (
                <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <User size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                                {user.id === currentUser?.id && <span className="ml-2 text-xs text-indigo-500">(Du)</span>}
                            </div>
                            <div className="text-xs text-gray-500">{user.username}</div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );

    const renderCoursesList = () => (
        <div className="flex-1 overflow-y-auto">
            {!isStudent && (
                <button
                    onClick={() => setFilterView('main')}
                    className="w-full p-3 flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
                >
                    <ChevronLeft size={16} /> Tillbaka
                </button>
            )}
            {availableCourses.map(course => (
                <button
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.name}</div>
                            <div className="text-xs text-gray-500">{course.code}</div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );

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
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                {isStudent ? 'Filtrera efter kurs' : 'Filtrera Kalender'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    resetNavigation();
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        {!isStudent && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Välj upp till 2 kalendrar att visa samtidigt
                            </p>
                        )}
                    </div>

                    {/* Current Active Filter */}
                    {primaryFilter && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                                <div className="p-1 bg-white dark:bg-gray-800 rounded">
                                    {primaryFilter.type === 'user' ? <User size={14} className="text-indigo-600" /> : <BookOpen size={14} className="text-indigo-600" />}
                                </div>
                                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200 truncate">
                                    {primaryFilter.type === 'user' ? `${primaryFilter.value.firstName} ${primaryFilter.value.lastName}` : primaryFilter.value.name}
                                </span>
                            </div>
                            <button onClick={() => clearFilter()} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded text-indigo-600">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                            </div>
                        ) : error ? (
                            <p className="p-8 text-center text-sm text-red-500">{error}</p>
                        ) : (
                            <>
                                {isStudent ? (
                                    renderCoursesList()
                                ) : (
                                    <>
                                        {filterView === 'main' && (
                                            <div className="p-2 space-y-1">
                                                <button
                                                    onClick={() => setFilterView('roles')}
                                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                            <Users size={20} className="text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-white">Filtrera efter roll</span>
                                                    </div>
                                                    <ChevronDown size={18} className="text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        fetchAvailableCourses();
                                                        setFilterView('courses');
                                                    }}
                                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                            <BookOpen size={20} className="text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-white">Filtrera efter kurs</span>
                                                    </div>
                                                    <ChevronDown size={18} className="text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        )}
                                        {filterView === 'roles' && renderRolesList()}
                                        {filterView === 'users-of-role' && renderUsersOfRole()}
                                        {filterView === 'courses' && renderCoursesList()}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarFilter;
