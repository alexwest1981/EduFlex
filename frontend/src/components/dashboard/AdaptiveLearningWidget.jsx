import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './AdaptiveLearningWidget.css'; // We'll create a basic CSS file for it

const AdaptiveLearningWidget = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            const data = await api.adaptiveLearning.getMyRecommendations();
            setRecommendations(data);
        } catch (error) {
            console.error("Failed to load recommendations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (id) => {
        try {
            await api.adaptiveLearning.markAsViewed(id);
            setRecommendations(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to dismiss recommendation", error);
        }
    };

    if (loading) return null;
    if (recommendations.length === 0) return null;

    return (
        <div className="adaptive-learning-widget fade-in">
            <div className="widget-header">
                <h3>🧠 Rekommenderat för dig</h3>
            </div>
            <div className="recommendations-list">
                {recommendations.map(rec => (
                    <div key={rec.id} className="recommendation-card">
                        <div className="rec-icon">
                            {rec.type === 'TIP' ? '💡' : '📘'}
                        </div>
                        <div className="rec-content">
                            <h4>Studietips: {rec.lessonTitle}</h4>
                            <p className="rec-text">{rec.content}</p>
                            <div className="rec-actions">
                                <button onClick={() => handleDismiss(rec.id)} className="dismiss-btn">
                                    Tack, jag förstår
                                </button>
                                <a href={`/courses/${rec.course.id}/lessons/${rec.lessonId}`} className="go-to-lesson-btn">
                                    Gå till lektionen →
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdaptiveLearningWidget;
