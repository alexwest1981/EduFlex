import React from 'react';
import { MessageSquare, Clock, User, CheckCircle, Lock, Plus } from 'lucide-react';

const ForumThreadList = ({ threads, onSelectThread, onNewThread }) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 bg-transparent gap-6">

            {/* "Add a new thread" Bar */}
            <div className="bg-card rounded-xl border border-border/50 p-3 shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:border-primary/50 transition-colors group" onClick={onNewThread}>
                <div className="text-muted-foreground text-sm pl-2 group-hover:text-foreground transition-colors">
                    Starta en ny diskussion...
                </div>
                <button className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                    <Plus size={18} />
                </button>
            </div>

            {/* Thread List */}
            <div className="flex-1 space-y-4 pb-6">
                {threads.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-xl border border-border/50 border-dashed">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Inga trådar i denna kategori än.</p>
                        <button onClick={onNewThread} className="text-primary font-medium hover:underline mt-2">
                            Bli den första att starta en!
                        </button>
                    </div>
                ) : (
                    threads.map((thread) => (
                        <div
                            key={thread.id}
                            onClick={() => onSelectThread(thread)}
                            className="group bg-card hover:bg-card/80 border border-border/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-4"
                        >
                            {/* Header: Author & Time */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                                        {thread.author?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">
                                            {thread.author?.firstName} {thread.author?.lastName}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {/* Calculate time ago roughly for now */}
                                            {new Date(thread.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-700 rounded-md">
                                    Diskussion
                                </span>
                            </div>

                            {/* Content Preview */}
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                                    {thread.title}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                    {thread.content}
                                </p>
                            </div>

                            {/* Footer: Actions */}
                            <div className="flex items-center gap-4 mt-2">
                                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">
                                    <MessageSquare size={14} />
                                    {thread.posts?.length > 0 ? `${thread.posts.length} Svar` : 'Svara'}
                                </button>
                                {thread.locked && (
                                    <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">
                                        <Lock size={12} /> Låst
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ForumThreadList;
