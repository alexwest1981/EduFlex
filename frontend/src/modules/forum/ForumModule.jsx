import React from 'react';
import { MessageSquare } from 'lucide-react';
import CourseForum from './CourseForum'; // Eller '../components/CourseForum' om du inte flyttade filen

export const ForumModuleMetadata = {
    id: 'module_forum_enabled',
    name: 'EduForum',
    version: '2.0.1',
    description: 'Diskussionsforum för kurser med trådar och svar.',
    icon: MessageSquare,
    settingsKey: 'module_forum_enabled',
    permissions: ['READ', 'WRITE']
};

const ForumModule = ({ courseId, currentUser }) => {
    // Här kan vi lägga till extra logik i framtiden, t.ex. gamification-triggers när man postar
    return (
        <div className="animate-in fade-in">
            <CourseForum courseId={courseId} currentUser={currentUser} />
        </div>
    );
};

export default ForumModule;