import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Clock, ArrowRight, Layers, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

const Catalog = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        setIsLoading(true);
        try {
            // Hämta ALLA kurser
            const data = await api.courses.getAll();
            setCourses(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(t('catalog_page.fetch_error'), e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        if(!confirm(t('catalog_page.enroll_confirm'))) return;
        try {
            await api.courses.enroll(courseId, currentUser.id);
            alert(t('catalog_page.enroll_success'));
            loadCourses(); // Uppdatera listan
        } catch (e) {
            alert(t('catalog_page.enroll_error'));
        }
    };

    // Filtrera baserat på sökning
    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('catalog_page.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('catalog_page.subtitle')}</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder={t('catalog_page.search_placeholder')}
                        className="pl-10 w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">{t('catalog_page.loading')}</div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#282a2c]">
                    <Layers className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3"/>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('catalog_page.no_courses')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('catalog_page.no_courses_desc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => {
                        const isEnrolled = course.students?.some(s => s.id === currentUser.id);
                        const isTeacher = course.teacher?.id === currentUser.id;

                        return (
                            <div key={course.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#282a2c] rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
                                <div className="h-2 bg-indigo-500 w-full"></div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-indigo-50 dark:bg-[#282a2c] rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <BookOpen size={24}/>
                                        </div>
                                        {isEnrolled && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full font-bold">{t('catalog_page.is_enrolled')}</span>}
                                        {isTeacher && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold">{t('catalog_page.is_teacher')}</span>}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-1">{course.description || t('catalog_page.no_description')}</p>

                                    <div className="space-y-3 border-t border-gray-100 dark:border-[#282a2c] pt-4 mt-auto">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                                            <Users size={14}/> <span>{t('catalog_page.students_count', { count: course.students ? course.students.length : 0 })}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                                            <GraduationCap size={14}/> <span>{course.teacher?.fullName || t('catalog_page.no_teacher')}</span>
                                        </div>
                                    </div>

                                    {!isEnrolled && !isTeacher && (
                                        <button
                                            onClick={() => handleEnroll(course.id)}
                                            className="mt-6 w-full bg-gray-900 dark:bg-white text-white dark:text-black py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                        >
                                            {t('catalog_page.enroll_btn')} <ArrowRight size={16}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Catalog;
