import React from 'react';
import { User, Plus } from 'lucide-react';

const CourseCatalog = ({ availableCourses, handleEnroll }) => {
    return (
        <div className="animate-in fade-in">
            <h1 className="text-3xl font-bold mb-6">Hitta Kurser</h1>
            <p className="text-gray-500 mb-8">Här kan du se och anmäla dig till nya kurser.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.length === 0 && <p className="text-gray-500 italic col-span-3 text-center">Inga nya kurser tillgängliga just nu.</p>}
                {availableCourses.map(c => (
                    <div key={c.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full relative group hover:shadow-md transition-all">
                        <div className="mb-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{c.courseCode}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{c.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex-1">{c.description || "Ingen beskrivning."}</p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><User size={12}/> {c.teacher?.fullName}</span>
                            <button
                                onClick={() => handleEnroll(c.id)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16}/> Gå med
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseCatalog;