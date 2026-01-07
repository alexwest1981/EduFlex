import React, { useState, useEffect } from 'react';
import { Search, Layers, BookOpen, Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const CourseCatalog = () => {
    const { currentUser } = useAppContext();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Alla Kurser');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Vi hämtar ALLA kurser för katalogen
                const data = await api.courses.getAll();
                setCourses(data);
            } catch (error) {
                console.error("Kunde inte hämta kurskatalog", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleApply = async (courseId) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://127.0.0.1:8080/api/courses/${courseId}/apply/${currentUser.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Ansökan skickad! Invänta lärarens godkännande.");
            } else {
                const err = await res.json();
                alert(`Kunde inte ansöka: ${err.error || 'Okänt fel'}`);
            }
        } catch (e) {
            alert("Något gick fel vid ansökan.");
        }
    };

    // Extrahera unika kategorier
    const categories = ['Alla Kurser', ...new Set(courses.map(c => c.category || 'Övrigt'))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'Alla Kurser' || (course.category || 'Övrigt') === selectedCategory;
        // Visa bara öppna kurser i katalogen
        return matchesSearch && matchesCategory && course.isOpen;
    });

    return (
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kurskatalog</h1>
                    <p className="text-gray-500 dark:text-gray-400">Utforska, filtrera och hitta din nästa utmaning.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#3c4043] bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Sök efter kurser..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* --- KATEGORIER --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#3c4043] sticky top-8">
                        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold">
                            <Layers size={20}/>
                            <h3>Kategorier</h3>
                        </div>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-black text-white dark:bg-white dark:text-black'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3c4043]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- KURSLISTA --- */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-100 dark:bg-[#1E1F20] rounded-2xl animate-pulse"></div>)
                    ) : filteredCourses.length > 0 ? (
                        filteredCourses.map(course => {
                            // Beräkna platser
                            const max = course.maxStudents || 100;
                            const current = course.enrolledCount || 0;
                            const spotsLeft = max - current;
                            const isFull = spotsLeft <= 0;

                            return (
                                <div key={course.id} className="group bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                                    {/* FÄRGAD HEADER/BANNER */}
                                    <div className={`h-32 ${course.color || 'bg-indigo-600'} p-6 relative`}>
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-gray-800 uppercase tracking-wider">
                                                {course.category || 'Allmänt'}
                                            </span>
                                            <span className="bg-black/20 backdrop-blur-sm text-xs font-mono font-bold px-2 py-1 rounded text-white uppercase tracking-wider">
                                                {course.courseCode}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                            {course.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                                            {course.description || "Ingen beskrivning tillgänglig."}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-6 border-t border-gray-100 dark:border-[#3c4043] pt-4">
                                            <div className="flex items-center gap-1">
                                                <Users size={14}/> <span>{current} / {max} studenter</span>
                                            </div>
                                            {course.startDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14}/>
                                                    <span>{new Date(course.startDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto flex justify-between items-center gap-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {isFull ? 'FULLBOKAD' : `${spotsLeft} platser kvar`}
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/course/${course.id}`)}
                                                    className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    Info
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApply(course.id); }}
                                                    disabled={isFull}
                                                    className="bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                                >
                                                    {isFull ? 'Stängd' : 'Ansök'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-2 text-center py-20 text-gray-400">
                            Inga kurser hittades i denna kategori.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCatalog;