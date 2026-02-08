import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, ThumbsUp, Heart, MoreVertical, Sparkles } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ForumThreadView = ({ thread, currentUser, onBack, onReply, onReact }) => {
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock reaction handling for UI until connected
    const handleReact = (postId, type) => {
        if (onReact) onReact(postId, type);
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        await onReply(replyContent);
        setReplyContent('');
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    title="Tillbaka"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold truncate">{thread.title}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Skapad av <span className="font-medium text-foreground">{thread.author?.firstName} {thread.author?.lastName}</span>
                        {thread.author?.gamificationProfile?.forumRankIcon && (
                            <span className="text-lg" title="Forum Rank">
                                {thread.author.gamificationProfile.forumRankIcon}
                            </span>
                        )}
                        {/* Tags could go here */}
                    </p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
                    <Sparkles size={14} />
                    Sammanfatta med AI
                </button>
            </div>

            {/* Main Thread Post */}
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
                <div
                    className="prose dark:prose-invert max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: thread.content }}
                />

                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ThumbsUp size={16} /> Gilla
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Heart size={16} /> Älska
                    </button>
                </div>
            </div>

            {/* Replies Divider */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                    {thread.posts?.length || 0} Svar
                </span>
                <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Replies List */}
            <div className="space-y-6">
                {thread.posts?.map((post) => (
                    <div key={post.id} className="flex gap-4 group">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold shrink-0 mt-1">
                            {post.author?.firstName?.[0]}
                        </div>

                        {/* Post Body */}
                        <div className="flex-1">
                            <div className="bg-muted/30 p-5 rounded-2xl rounded-tl-none border border-border/50">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-semibold text-sm flex items-center gap-1">
                                        {post.author?.firstName} {post.author?.lastName}
                                        {post.author?.gamificationProfile?.forumRankIcon && (
                                            <span className="text-base" title="Forum Rank">
                                                {post.author.gamificationProfile.forumRankIcon}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className="text-sm text-foreground/90 whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>

                            {/* Post Actions */}
                            <div className="flex items-center gap-3 mt-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleReact(post.id, 'LIKE')}
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                    <ThumbsUp size={12} /> Gilla
                                </button>
                                <button
                                    onClick={() => handleReact(post.id, 'HEART')}
                                    className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1"
                                >
                                    <Heart size={12} /> Älska
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Editor */}
            <div className="mt-4">
                <div className="border border-border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-card">
                    <ReactQuill
                        value={replyContent}
                        onChange={setReplyContent}
                        theme="snow"
                        placeholder="Skriv ett svar..."
                        modules={{
                            toolbar: [
                                ['bold', 'italic', 'underline'],
                                ['blockquote', 'code-block'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                            ]
                        }}
                        className="bg-card"
                    />
                    <div className="flex justify-between items-center bg-muted/20 p-2 px-3">
                        <p className="text-xs text-muted-foreground">
                            Var vänlig och håll god ton.
                        </p>
                        <button
                            onClick={handleReply}
                            disabled={isSubmitting || !replyContent}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={14} />
                            Skicka svar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumThreadView;
