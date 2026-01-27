
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Link as LinkIcon, CheckCircle, FileText, Award } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';

const LtiDeepLinking = () => {
    const [searchParams] = useSearchParams();
    const { refreshUser, currentUser } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myQuizzes, setMyQuizzes] = useState([]);

    // LTI Context Params
    const token = searchParams.get('token');
    const settingsB64 = searchParams.get('settings');
    const deploymentId = searchParams.get('deploy');
    const issuer = searchParams.get('iss');

    useEffect(() => {
        const init = async () => {
            if (token) {
                // Set session
                localStorage.setItem('token', token);

                // Refresh user context
                if (refreshUser) {
                    await refreshUser();
                }

                // Load content available for linking
                try {
                    // Fetch quizzes (assuming user is teacher)
                    // We need to decode the token to get user ID? 
                    // Or just use 'me' endpoint if token is set.
                    const quizzes = await api.quiz.getMy('me'); // 'me' or rely on endpoint using token
                    // If getMy(id) is needed, we wait for currentUser
                } catch (e) {
                    console.error("Failed to load content", e);
                }
            }
            setIsLoading(false);
        };
        init();
    }, [token]);

    // Load quizzes once user is loaded
    useEffect(() => {
        if (currentUser) {
            const loadData = async () => {
                try {
                    const quizzes = await api.quiz.getMy(currentUser.id);
                    setMyQuizzes(quizzes || []);
                } catch (e) {
                    console.error("Error loading quizzes", e);
                }
            };
            loadData();
        }
    }, [currentUser]);

    const handleSelect = async (quiz) => {
        setIsSubmitting(true);
        try {
            // Decode settings to get return URL and data
            const settingsJson = atob(settingsB64);
            const settings = JSON.parse(settingsJson);
            const returnUrl = settings.deep_link_return_url;
            const data = settings.data;

            // Construct Content Item (LTI 1.3 standard)
            // https://www.imsglobal.org/spec/lti-dl/v2p0
            const contentItem = {
                "type": "ltiResourceLink",
                "title": quiz.title,
                "text": quiz.description,
                "url": window.location.origin + "/quiz/" + quiz.id, // Direct link to quiz
                // We can also use custom param to tell LTI launch to open generic view with this ID
                "custom": {
                    "resource_id": quiz.id,
                    "resource_type": "quiz"
                }
            };

            // Call Backend to sign
            const payload = {
                iss: issuer,
                deploy: deploymentId,
                data: data,
                contentItems: [contentItem]
            };

            // We need a specific endpoint for this in api.js, assume we add it or use raw fetch
            const response = await fetch('/api/lti/deep_link_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Failed to sign response");

            const result = await response.json();
            const signedJwt = result.jwt;

            // Auto-submit form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = returnUrl;

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'JWT';
            input.value = signedJwt;

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();

        } catch (e) {
            console.error("Selection failed", e);
            alert("Kunde inte länka materialet. Se konsolen.");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                        <LinkIcon /> Välj Material att Länka
                    </h1>
                    <p className="text-gray-500">Klicka på ett quiz för att lägga till det i din kurs (LMS).</p>
                </header>

                {isSubmitting ? (
                    <div className="text-center py-12">
                        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                        <p>Länkar materialet...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myQuizzes.map(quiz => (
                            <div key={quiz.id}
                                onClick={() => handleSelect(quiz)}
                                className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                                    <Award className="text-indigo-200 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{quiz.description || "Ingen beskrivning"}</p>
                                <div className="mt-4 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Klicka för att välja
                                </div>
                            </div>
                        ))}
                        {myQuizzes.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                Inga quiz hittades. Skapa ett quiz i Resursbanken först.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LtiDeepLinking;
