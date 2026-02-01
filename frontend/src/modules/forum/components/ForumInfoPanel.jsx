import React from 'react';
import { User, Users, Calendar, MessageCircle } from 'lucide-react';

const ForumInfoPanel = ({ course }) => {
    if (!course) return null;

    return (
        <div className="w-80 hidden xl:flex flex-col gap-6 p-4 border-l border-border h-[calc(100vh-6rem)] sticky top-0 overflow-y-auto">

            {/* Course Card */}
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-sm">
                <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {course.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar size={16} />
                    <span>{course.startDate} — {course.endDate}</span>
                </div>
            </div>

            {/* Teacher Info */}
            <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    Lärare
                </h4>
                {course.teacher ? (
                    <div className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border/50 shadow-sm text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mb-3 overflow-hidden">
                            {course.teacher.avatarUrl ? (
                                <img src={course.teacher.avatarUrl} alt="Teacher" className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <h3 className="font-semibold text-base mb-0.5">{course.teacher.firstName} {course.teacher.lastName}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-100 text-cyan-800 mb-4 dark:bg-cyan-900/30 dark:text-cyan-300">
                            Huvudlärare
                        </span>

                        <div className="w-full space-y-2">
                            <div className="group flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                                <div className="p-1.5 rounded-md bg-secondary text-foreground group-hover:bg-background transition-colors border border-transparent group-hover:border-border">
                                    <MessageCircle size={14} />
                                </div>
                                <span className="truncate">Skicka meddelande</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Ingen lärare tilldelad.</p>
                )}
            </div>

            {/* Attendees / Stats */}
            <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                    Deltagare
                    <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] text-foreground">
                        {course.students ? course.students.length : 0}
                    </span>
                </h4>

                {/* List first 5 students if available */}
                <div className="space-y-2">
                    {course.students && course.students.slice(0, 5).map(student => (
                        <div key={student.id} className="flex items-center gap-3 hover:bg-accent/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                                {student.avatarUrl ? (
                                    <img src={student.avatarUrl} alt={student.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={14} />
                                )}
                            </div>
                            <p className="text-sm">{student.firstName} {student.lastName}</p>
                        </div>
                    ))}
                    {course.students && course.students.length > 5 && (
                        <p className="text-xs text-muted-foreground pl-2 pt-1 hover:text-primary cursor-pointer transition-colors">
                            + {course.students.length - 5} till...
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ForumInfoPanel;
