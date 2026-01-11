import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Award, Printer, ArrowLeft, ShieldCheck } from 'lucide-react';

const CertificateView = () => {
    const { courseId } = useParams();
    const { currentUser, systemSettings } = useAppContext();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                const [c, r] = await Promise.all([
                    api.courses.getOne(courseId),
                    api.courses.getResult(courseId, currentUser.id)
                ]);
                setCourse(c);
                setResult(r);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, currentUser]);

    if (loading) return <div className="flex h-screen items-center justify-center">Laddar certifikat...</div>;

    if (!result || result.status !== 'PASSED') {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-red-600">Certifikat saknas</h1>
                <p>Du har inte slutfört denna kurs än eller så är certifikatet inte utfärdat.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Gå tillbaka</button>
            </div>
        );
    }

    const date = result.gradedAt ? new Date(result.gradedAt).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <div className="bg-gray-100 min-h-screen py-10 print:bg-white print:p-0">
            {/* Navigering (Döljs vid utskrift) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} /> Tillbaka
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors font-bold">
                    <Printer size={20} /> Skriv ut PDF
                </button>
            </div>

            {/* Certifikatram */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none aspect-[1.414] relative p-10 flex flex-col items-center text-center border-[20px] border-double border-indigo-900/10">
                {/* Vattenstämpel / Bakgrund */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <ShieldCheck size={400} />
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-between border border-gray-200 p-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                                <Award size={48} />
                            </div>
                        </div>
                        <h1 className="text-5xl font-serif text-gray-900 tracking-wider">CERTIFIKAT</h1>
                        <p className="text-xl text-indigo-600 font-bold uppercase tracking-widest">För godkänd kurs</p>
                    </div>

                    {/* Main Content */}
                    <div className="my-10 space-y-6">
                        <p className="text-lg text-gray-500 italic">Detta intygar att</p>
                        <h2 className="text-4xl font-bold text-gray-900 border-b-2 border-gray-300 pb-4 inline-block min-w-[300px]">
                            {currentUser.fullName}
                        </h2>
                        <p className="text-lg text-gray-500 italic mt-4">har framgångsrikt genomfört kursen</p>
                        <h3 className="text-3xl font-bold text-indigo-800">{course.name}</h3>
                        <p className="text-gray-600 font-medium">{course.courseCode} • {course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}</p>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="grid grid-cols-2 gap-20 mt-12 w-full pt-8">
                        <div className="text-center">
                            <div className="border-b border-gray-400 pb-2 mb-2 font-handwriting text-2xl text-gray-800 font-bold italic">
                                {date}
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Datum</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-gray-400 pb-2 mb-2 font-handwriting text-2xl text-gray-800 font-bold italic">
                                {course.teacher ? course.teacher.fullName : 'EduFlex Academy'}
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Kursansvarig</p>
                        </div>
                    </div>

                    <div className="mt-8 text-xs text-gray-400 font-mono">
                        Certifikat ID: {result.id}-{Date.now().toString().slice(-6)} • {systemSettings?.site_name || 'EduFlex LMS'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateView;
