import React from 'react';
import { FileText, CheckCircle, AlertCircle, ExternalLink, Download, Star } from 'lucide-react';

const AssessmentView = ({ assignments, submissions, navigateTo, courseId }) => {

    const getSubmissionForAssignment = (assignmentId) => {
        return submissions.find(s => s.assignmentId === assignmentId);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="text-yellow-500"/> Bedömning & Resultat
            </h3>

            <div className="grid gap-4">
                {assignments.length === 0 && (
                    <div className="p-8 text-center text-gray-500 italic bg-gray-50 rounded-xl border border-dashed">
                        Inga uppgifter i denna kurs.
                    </div>
                )}

                {assignments.map(assignment => {
                    const submission = getSubmissionForAssignment(assignment.id);
                    const isGraded = submission && submission.grade;
                    const isSubmitted = !!submission;

                    return (
                        <div key={assignment.id} className="bg-white border rounded-xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isGraded ? 'bg-green-500' : isSubmitted ? 'bg-yellow-500' : 'bg-red-400'}`}></div>

                            <div className="flex flex-col md:flex-row justify-between gap-6 pl-4">
                                {/* Vänster: Uppgiftsinfo */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">{assignment.title}</h4>
                                        {isGraded && <CheckCircle size={16} className="text-green-500"/>}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Deadline: <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span></p>

                                    {/* Action Länkar */}
                                    <div className="flex gap-4 text-sm">
                                        <button
                                            onClick={() => navigateTo('course-detail', courseId)} // Egentligen vill vi öppna Assignments-taben
                                            className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <ExternalLink size={14}/> Gå till uppgift
                                        </button>

                                        {isSubmitted && (
                                            <a href={`http://127.0.0.1:8080${submission.fileUrl}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                <Download size={14}/> Min fil
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Höger: Status & Betyg */}
                                <div className="flex flex-col items-end min-w-[220px]">
                                    {isGraded ? (
                                        <div className="w-full">
                                            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                                <div className="text-[10px] text-green-600 uppercase font-bold tracking-wider mb-1">Betyg</div>
                                                <div className="text-3xl font-black text-green-700">{submission.grade}</div>
                                            </div>
                                            {submission.feedback && (
                                                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic relative">
                                                    <div className="absolute -top-2 left-4 w-3 h-3 bg-gray-50 border-t border-l border-gray-100 transform rotate-45"></div>
                                                    "{submission.feedback}"
                                                </div>
                                            )}
                                        </div>
                                    ) : isSubmitted ? (
                                        <div className="text-center w-full">
                                            <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                                                <AlertCircle size={16}/> Väntar på rättning
                                            </span>
                                            <p className="text-xs text-gray-400 mt-2">Inlämnad: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center w-full">
                                            <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-3 w-full">
                                                Ej inlämnad
                                            </span>
                                            <button
                                                onClick={() => navigateTo('course-detail', courseId)} // Borde öppna uppgiften direkt
                                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                                            >
                                                Lämna in nu
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AssessmentView;