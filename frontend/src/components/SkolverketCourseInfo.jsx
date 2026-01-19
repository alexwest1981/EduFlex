import React, { useState, useEffect } from 'react';
import { Book, FileText, Award, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

const SkolverketCourseInfo = ({ skolverketCourse }) => {
    const [activeTab, setActiveTab] = useState('grundinfo');
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (skolverketCourse && activeTab === 'kunskapskrav') {
            fetchCriteria();
        }
    }, [skolverketCourse, activeTab]);

    const fetchCriteria = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/skolverket/courses/${skolverketCourse.courseCode}/criteria`);
            setCriteria(data);
        } catch (error) {
            console.error('Failed to fetch grading criteria', error);
        } finally {
            setLoading(false);
        }
    };

    if (!skolverketCourse) {
        return null;
    }

    const tabs = [
        { id: 'grundinfo', label: 'Grundinfo', icon: FileText },
        { id: 'innehall', label: 'Innehåll', icon: Book },
        { id: 'kunskapskrav', label: 'Kunskapskrav', icon: Award }
    ];

    const gradeColors = {
        E: 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-100',
        D: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-900 dark:text-yellow-100',
        C: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-100',
        B: 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-900 dark:text-purple-100',
        A: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 text-indigo-900 dark:text-indigo-100'
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Book className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skolverkets Kursinformation</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{skolverketCourse.courseCode} - {skolverketCourse.courseName}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {activeTab === 'grundinfo' && (
                    <div className="space-y-4">
                        <InfoItem label="Kurskod" value={skolverketCourse.courseCode} />
                        <InfoItem label="Kursnamn" value={skolverketCourse.courseName} />
                        {skolverketCourse.englishTitle && <InfoItem label="Engelsk titel" value={skolverketCourse.englishTitle} />}
                        <InfoItem label="Poäng" value={`${skolverketCourse.points} poäng`} />
                        <InfoItem label="Ämne" value={skolverketCourse.subject} />
                        {skolverketCourse.skolformer && <InfoItem label="Skolformer" value={skolverketCourse.skolformer} />}
                        {skolverketCourse.pdfUrl && (
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">PDF</label>
                                <a
                                    href={skolverketCourse.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                                >
                                    <ExternalLink size={16} />
                                    Öppna officiell kursplan (Skolverket)
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'innehall' && (
                    <div className="space-y-6">
                        {skolverketCourse.description && (
                            <Section title="Kursbeskrivning" content={skolverketCourse.description} />
                        )}
                        {skolverketCourse.subjectPurpose && (
                            <Section title="Ämnets syfte" content={skolverketCourse.subjectPurpose} />
                        )}
                        {skolverketCourse.objectives && (
                            <Section title="Kursmål" content={skolverketCourse.objectives} />
                        )}
                        {!skolverketCourse.description && !skolverketCourse.subjectPurpose && !skolverketCourse.objectives && (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Ingen detaljerad information tillgänglig ännu. Denna data kommer läggas till framöver.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'kunskapskrav' && (
                    <div className="space-y-4">
                        {loading && <p className="text-gray-500">Laddar betygskriterier...</p>}
                        {!loading && criteria.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Inga betygskriterier tillgängliga ännu. Dessa kommer läggas till framöver.
                            </p>
                        )}
                        {!loading && criteria.map((criterion) => (
                            <div
                                key={criterion.id}
                                className={`p-4 rounded-lg border-l-4 ${gradeColors[criterion.gradeLevel]}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Award size={20} />
                                    <h3 className="font-bold text-lg">Betyget {criterion.gradeLevel}</h3>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{criterion.criteriaText}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</label>
        <p className="text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
);

const Section = ({ title, content }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <div
            className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    </div>
);

export default SkolverketCourseInfo;
