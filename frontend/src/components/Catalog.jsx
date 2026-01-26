import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Clock, ArrowRight, Layers, GraduationCap } from 'lucide-react';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

const Catalog = () => {
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
            console.error("Kunde inte hämta kurser", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        if(!confirm("Vill du gå med i denna kurs?")) return;
        try {
            await api.courses.enroll(courseId, currentUser.id);
            alert("Du har gått med i kursen!");
            loadCourses(); // Uppdatera listan
        } catch (e) {
            alert("Kunde inte gå med i kursen.");
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kurskatalog</h1>
                    <p className="text-gray-500 dark:text-gray-400">Hitta och anmäl dig till nya kurser.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Sök kurser..."
                        className="pl-10 w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Laddar kurser...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#282a2c]">
                    <Layers className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3"/>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inga kurser hittades</h3>
                    <p className="text-gray-500 dark:text-gray-400">Prova att söka på något annat eller be en lärare skapa en kurs.</p>
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
                                        {isEnrolled && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full font-bold">Deltar</span>}
                                        {isTeacher && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold">Lärare</span>}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-1">{course.description || "Ingen beskrivning tillgänglig."}</p>

                                    <div className="space-y-3 border-t border-gray-100 dark:border-[#282a2c] pt-4 mt-auto">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                                            <Users size={14}/> <span>{course.students ? course.students.length : 0} studenter</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                                            <GraduationCap size={14}/> <span>{course.teacher?.fullName || "Ingen lärare"}</span>
                                        </div>
                                    </div>

                                    {!isEnrolled && !isTeacher && (
                                        <button
                                            onClick={() => handleEnroll(course.id)}
                                            className="mt-6 w-full bg-gray-900 dark:bg-white text-white dark:text-black py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                        >
                                            Gå med i kurs <ArrowRight size={16}/>
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
