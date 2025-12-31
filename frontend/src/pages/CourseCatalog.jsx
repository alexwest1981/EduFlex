import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Users, ArrowRight, Layers, GraduationCap, Tag, X, Code, Info, CheckCircle, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CourseCatalog = ({ availableCourses, handleEnroll }) => {
    const { currentUser } = useAppContext();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedCourse, setSelectedCourse] = useState(null);

    // --- 1. DATA & LOGIK ---

    // Skapa en lista med UNIKA kategorier från kurserna
    const categories = useMemo(() => {
        // Hämtar unika kategorier, filtrerar bort null/undefined
        const cats = new Set(availableCourses.map(c => c.category).filter(Boolean));
        return ['ALL', ...Array.from(cats)];
    }, [availableCourses]);

    // Filtrera kurserna
    const filteredCourses = availableCourses.filter(c => {
        const searchLower = search.toLowerCase();

        // Sökning: Namn ELLER Kurskod
        const matchesSearch =
            (c.name && c.name.toLowerCase().includes(searchLower)) ||
            (c.courseCode && c.courseCode.toLowerCase().includes(searchLower));

        // Kategori-filter
        const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // --- 2. MODAL KOMPONENT ---
    const CourseModal = ({ course, onClose }) => {
        if (!course) return null;

        const isEnrolled = course.students?.some(s => s.id === currentUser.id);
        const isTeacher = course.teacher?.id === currentUser.id;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Modal Header */}
                    <div className="relative h-40 bg-gray-900 dark:bg-[#131314] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-50"></div>
                        <div className="z-10 text-center px-8">
                            <h2 className="text-3xl font-bold text-white mb-2">{course.name}</h2>
                            {course.courseCode && (
                                <span className="inline-block px-3 py-1 rounded-full bg-black/30 text-white text-xs font-mono border border-white/20">
                                    {course.courseCode}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors z-20">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap gap-3 mb-6">
                            {course.category && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center gap-1">
                                    <Tag size={12}/> {course.category}
                                </span>
                            )}
                            {course.startDate && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                                    <Calendar size={12}/> {course.startDate} - {course.endDate || 'Pågår'}
                                </span>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Om kursen</h3>
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                    {course.description || "Ingen beskrivning angiven för denna kurs."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-100 dark:border-[#3c4043]">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lärare</div>
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap size={16} className="text-indigo-500"/>
                                        {course.teacher?.fullName || "Ej tilldelad"}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-100 dark:border-[#3c4043]">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deltagare</div>
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Users size={16} className="text-indigo-500"/>
                                        {course.students ? course.students.length : 0} studenter
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#282a2c] flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3c4043] transition-colors">
                            Stäng
                        </button>

                        {isEnrolled ? (
                            <button disabled className="px-6 py-2.5 rounded-lg text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default flex items-center gap-2">
                                <CheckCircle size={16}/> Du deltar redan
                            </button>
                        ) : isTeacher ? (
                            <button disabled className="px-6 py-2.5 rounded-lg text-sm font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 cursor-default">
                                Du är lärare
                            </button>
                        ) : (
                            <button
                                onClick={() => { handleEnroll(course.id); onClose(); }}
                                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-gray-900 dark:bg-[#c2e7ff] text-white dark:text-[#001d35] hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                Gå med i kurs <ArrowRight size={16}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- 3. HUVUDRENDERING ---
    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kurskatalog</h1>
                    <p className="text-gray-500 dark:text-gray-400">Utforska, filtrera och hitta din nästa utmaning.</p>
                </div>

                {/* Sökruta */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Sök på kursnamn eller kod..."
                        className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* VÄNSTER: Filterpanel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-5 shadow-sm sticky top-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Layers size={18}/> Kategorier
                        </h3>
                        {categories.length === 1 ? (
                            <p className="text-sm text-gray-500 italic">Inga kategorier hittades.</p>
                        ) : (
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex justify-between items-center ${
                                            selectedCategory === cat
                                                ? 'bg-gray-900 text-white dark:bg-[#c2e7ff] dark:text-[#001d35]'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                        }`}
                                    >
                                        {cat === 'ALL' ? 'Alla Kurser' : cat}
                                        {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-current"></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* HÖGER: Kursrutnät */}
                <div className="lg:col-span-3">
                    {filteredCourses.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043]">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3"/>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inga kurser hittades</h3>
                            <p className="text-gray-500 dark:text-gray-400">Prova att ändra dina filter eller sökord.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredCourses.map(course => {
                                const isEnrolled = course.students?.some(s => s.id === currentUser.id);

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => setSelectedCourse(course)}
                                        className="group bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-xl overflow-hidden hover:shadow-lg dark:hover:border-gray-500 transition-all cursor-pointer flex flex-col h-full relative"
                                    >
                                        <div className="h-2 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 w-full"></div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    {course.category && (
                                                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-[#282a2c] dark:text-gray-400 border border-gray-200 dark:border-[#3c4043]">
                                                            {course.category}
                                                        </span>
                                                    )}
                                                    {course.courseCode && (
                                                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-[#282a2c] dark:text-gray-400 border border-gray-200 dark:border-[#3c4043] font-mono">
                                                            {course.courseCode}
                                                        </span>
                                                    )}
                                                </div>
                                                {isEnrolled && <CheckCircle size={18} className="text-green-500 shrink-0"/>}
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {course.name}
                                            </h3>

                                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 flex-1">
                                                {course.description || "Ingen beskrivning tillgänglig."}
                                            </p>

                                            <div className="pt-4 border-t border-gray-100 dark:border-[#282a2c] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14}/> {course.students ? course.students.length : 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium group-hover:translate-x-1 transition-transform text-indigo-600 dark:text-indigo-400">
                                                    Läs mer <ArrowRight size={14}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Rendera Modal om en kurs är vald */}
            <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        </div>
    );
};

export default CourseCatalog;