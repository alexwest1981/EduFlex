import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import ForumSidebar from './components/ForumSidebar';
import ForumThreadList from './components/ForumThreadList';
import ForumThreadView from './components/ForumThreadView';
import ForumInfoPanel from './components/ForumInfoPanel';
import NewThreadModal from './components/NewThreadModal';
import NewCategoryModal from './components/NewCategoryModal';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';

const CourseForum = ({ courseId, currentUser, course, ...props }) => {
    const { API_BASE, token } = useAppContext();

    // State
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [threads, setThreads] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
    const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

    const stompClientRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        fetchCategories();
        connectWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [courseId]);

    // Fetch Threads when Category changes
    useEffect(() => {
        if (activeCategory) {
            fetchThreads(activeCategory.id);
        } else if (categories.length > 0) {
            // Default to first category or "All"
            setActiveCategory(categories[0]);
        }
    }, [activeCategory, categories]);

    const connectWebSocket = () => {
        if (!token || token === 'undefined' || token === 'null') return;
        // Derive WS URL from API_BASE to support HTTPS/Prod
        const baseUrl = API_BASE.replace(/\/api\/?$/, '');
        const wsUrl = `${baseUrl}/ws-forum`;

        // Use SockJS fallback with a factory function for auto-reconnect
        const client = Stomp.over(() => new SockJS(wsUrl));

        client.connectHeaders = {
            'Authorization': `Bearer ${token}`
        };

        client.onConnect = () => {
            console.log("Connected to Forum WebSocket");

            // Subscribe to Course-level events (New Thread)
            client.subscribe(`/topic/course/${courseId}/forum`, (message) => {
                const newThread = JSON.parse(message.body);
                toast.success(`Ny diskussion: ${newThread.title}`);
                // Optimistically update list if in correct category
                setThreads(prev => [newThread, ...prev]);
            });
        };

        client.activate();
        stompClientRef.current = client;
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/forum/course/${courseId}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchThreads = async (catId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/forum/category/${catId}/threads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setThreads(data.content || []);
        } catch (error) {
            console.error("Error fetching threads", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (name, description, teacherOnly) => {
        try {
            const res = await fetch(`${API_BASE}/forum/course/${courseId}/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: description || "",
                    teacherOnly
                })
            });
            if (res.ok) {
                toast.success("Kategori skapad!");
                fetchCategories();
            } else {
                toast.error("Kunde inte skapa kategori");
            }
        } catch (e) {
            toast.error("Fel vid skapande av kategori");
        }
    };

    const handleCreateThread = async (title, content) => {
        try {
            const res = await fetch(`${API_BASE}/forum/category/${activeCategory.id}/thread`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    title,
                    content
                })
            });
            if (res.ok) {
                toast.success("Inlägg publicerat!");
                // WebSocket will handle list update
            }
        } catch (e) {
            toast.error("Misslyckades att skapa tråd");
        }
    };

    const handleReply = async (content) => {
        if (!activeThread) return;
        try {
            const res = await fetch(`${API_BASE}/forum/thread/${activeThread.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    content
                })
            });
            const newPost = await res.json();
            // Optimistic update
            const updatedThread = { ...activeThread };
            if (!updatedThread.posts) updatedThread.posts = [];
            updatedThread.posts.push(newPost);
            setActiveThread(updatedThread);
        } catch (e) {
            toast.error("Misslyckades att svara");
        }
    };

    const handleReact = async (postId, type) => {
        try {
            await fetch(`${API_BASE}/forum/post/${postId}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    type
                })
            });
            toast.success("Reagerat!");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex gap-4 items-start w-full min-h-[600px]">
            {/* Sidebar - Sticky, Categories */}
            <ForumSidebar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                isTeacher={props.isTeacher || (currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN'))}
                onCreateCategory={() => setIsNewCategoryModalOpen(true)}
            />

            {/* Main Area - Feed or View */}
            <div className="flex-1 min-w-0">
                {activeThread ? (
                    <ForumThreadView
                        thread={activeThread}
                        currentUser={currentUser}
                        onBack={() => setActiveThread(null)}
                        onReply={handleReply}
                        onReact={handleReact}
                    />
                ) : (
                    <ForumThreadList
                        threads={threads}
                        onSelectThread={setActiveThread}
                        onNewThread={() => setIsNewThreadModalOpen(true)}
                    />
                )}
            </div>

            {/* Modals */}
            <NewThreadModal
                isOpen={isNewThreadModalOpen}
                onClose={() => setIsNewThreadModalOpen(false)}
                onSubmit={handleCreateThread}
                categoryName={activeCategory?.name}
            />

            <NewCategoryModal
                isOpen={isNewCategoryModalOpen}
                onClose={() => setIsNewCategoryModalOpen(false)}
                onSubmit={handleCreateCategory}
            />

            {/* Right Panel - Course Info */}
            <ForumInfoPanel course={course} />
        </div>
    );
};

export default CourseForum;
