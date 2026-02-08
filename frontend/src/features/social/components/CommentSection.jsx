import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, CornerDownRight, Trash2, User, Heart } from 'lucide-react';
import { socialService } from '../services/socialService';
import { API_BASE } from '../../../services/api';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import UserAvatar from '../../../components/common/UserAvatar';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const CommentItem = ({ comment, onReply, onDelete, onLike, currentUserId, depth = 0 }) => {
    const { i18n } = useTranslation();
    const isOwner = comment.author.id === currentUserId;
    const dateLocale = i18n.language === 'sv' ? sv : enUS;

    const isLiked = comment.likes && comment.likes.some(u => u.id === currentUserId);
    const likeCount = comment.likes ? comment.likes.length : 0;

    return (
        <div className={`flex gap-3 mb-4 ${depth > 0 ? 'ml-8 is-reply' : ''}`}>
            <div className="flex-shrink-0">
                <UserAvatar user={comment.author} size="w-8 h-8" />
            </div>
            <div className="flex-grow">
                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 relative group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                            {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        {isOwner && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-1 ml-1">
                    <button
                        onClick={() => onReply(comment)}
                        className="text-xs font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                        <MessageSquare className="w-3 h-3" />
                        Reply
                    </button>
                    <button
                        onClick={() => onLike(comment.id)}
                        className={`text-xs font-medium flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                        {likeCount > 0 && likeCount}
                    </button>
                </div>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 border-l-2 border-gray-100 pl-4">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                onDelete={onDelete}
                                onLike={onLike}
                                currentUserId={currentUserId}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentSection = ({ targetType, targetId, title = "Comments" }) => {
    const { t } = useTranslation();
    const { currentUser: user } = useAppContext(); // Changed from useAuth
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // Comment object
    const stompClientRef = useRef(null);

    useEffect(() => {
        loadComments();
    }, [targetType, targetId]);

    const loadComments = async () => {
        try {
            setIsLoading(true);
            const data = await socialService.getComments(targetType, targetId);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            // Optimistic update could go here, but let's wait for server for now
            const parentId = replyingTo ? replyingTo.id : null;
            await socialService.addComment(newComment, targetType, targetId, parentId);

            setNewComment('');
            setReplyingTo(null);
            loadComments(); // Reload to get the new structure
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await socialService.deleteComment(commentId);
            loadComments();
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    // WebSocket Connection
    useEffect(() => {
        if (!user) return; // Wait for user to be loaded

        // Connect WS
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws-social`; // Use /ws-social endpoint

        // Use SockJS
        // Note: In development with Vite proxy, we might need to point to /api/ws-social if proxied, 
        // but SockJS usually handles relative paths well.
        // However, our proxy setup in vite.config.js might not cover /ws-social.
        // Let's assume /ws-social is proxied or accessible.
        // If not, we might need to use API_BASE logic.

        let client;
        try {
            // Using API_BASE replacement to be safe with proxy
            const baseUrl = API_BASE.replace(/\/api\/?$/, '');
            const socketUrl = `${baseUrl}/ws-social`;

            client = Stomp.over(() => new SockJS(socketUrl));
            client.debug = () => { }; // Disable debug logs
            client.reconnectDelay = 5000;

            client.connectHeaders = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };

            client.onConnect = () => {
                console.log("Connected to Social WebSocket");
                const topic = `/topic/social/comments/${targetType}/${targetId}`;

                client.subscribe(topic, (message) => {
                    const event = JSON.parse(message.body);
                    handleSocialEvent(event);
                });
            };

            client.activate();
            stompClientRef.current = client;

        } catch (e) {
            console.error("WebSocket connection failed", e);
        }

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [targetType, targetId, user, API_BASE]);

    const handleSocialEvent = (event) => {
        if (event.type === 'COMMENT_ADDED') {
            const newComment = event.payload;
            // Prevent duplicate handling if we already optimistically added it (not implemented yet, but good practice)
            // Or if backend sends it back to us

            setComments(prev => {
                // Check if already exists
                if (hasComment(prev, newComment.id)) return prev;

                if (newComment.parentId) {
                    return addReply(prev, newComment);
                } else {
                    return [newComment, ...prev];
                }
            });
        } else if (event.type === 'COMMENT_UPDATED') {
            const updatedComment = event.payload;
            setComments(prev => updateComment(prev, updatedComment));
        }
    };

    // Helper to check if comment exists recursively
    const hasComment = (list, id) => {
        return list.some(c => c.id === id || (c.replies && hasComment(c.replies, id)));
    };

    // Helper to add reply recursively
    const addReply = (list, reply) => {
        return list.map(c => {
            if (c.id === reply.parentId) {
                // Add to this comment's replies
                // Check duplicates in replies just in case
                const existingReplies = c.replies || [];
                if (existingReplies.some(r => r.id === reply.id)) return c;
                return { ...c, replies: [...existingReplies, reply] };
            }
            if (c.replies) {
                return { ...c, replies: addReply(c.replies, reply) };
            }
            return c;
        });
    };

    // Helper to update comment recursively
    const updateComment = (list, updated) => {
        return list.map(c => {
            if (c.id === updated.id) {
                // Preserve replies if the update doesn't include them (backend might send partial?)
                // But backend sends full entity usually. 
                // However, updated comment might have empty replies if fetched lazily or new transaction?
                // Our Controller sends the return value of repository.save(), which returns the entity.
                // If the entity has replies loaded, they are sent. 
                // Let's assume it replaces correctly.
                // We should probably preserve 'replies' if the incoming 'replies' is null/empty but we have local replies?
                // Actually, for a 'like' update, replies shouldn't change.
                return { ...updated, replies: c.replies };
            }
            if (c.replies) {
                return { ...c, replies: updateComment(c.replies, updated) };
            }
            return c;
        });
    };

    const handleLike = async (commentId) => {
        if (!user) return;
        try {
            // Optimistic update is tricky with WebSocket also coming in. 
            // But usually it's fine. 
            // We can skip optimistic update and rely on WS? 
            // No, immediate feedback is better.
            // We'll keep optimistic logic BUT we need to make sure we don't conflict.
            // Actually, the optimistic update in checking `isLiked` locally vs event payload.
            // If we rely on optimistic, we feel fast.
            // The WS event will arrive and overwrite it with server truth. This is desired.
            await socialService.likeComment(commentId);
        } catch (error) {
            console.error("Failed to like comment", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {title} <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
            </h3>

            {/* Input Area */}
            <div className="mb-8">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg mb-2 text-sm text-blue-700">
                        <span className="flex items-center gap-2">
                            <CornerDownRight className="w-4 h-4" />
                            Replying to <strong>{replyingTo.author.firstName}</strong>
                        </span>
                        <button onClick={() => setReplyingTo(null)} className="hover:underline">Cancel</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyingTo ? "Write a reply..." : "Add to the discussion..."}
                        className="w-full bg-gray-50 border-0 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y min-h-[100px]"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-400">Loading discussion...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic">
                        No comments yet. Be the first to start the conversation!
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={setReplyingTo}
                            onDelete={handleDelete}
                            onLike={handleLike}
                            currentUserId={user?.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
