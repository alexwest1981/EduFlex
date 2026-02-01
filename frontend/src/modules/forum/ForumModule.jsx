import React from 'react';
import { MessageSquare } from 'lucide-react';
import CourseForum from './CourseForum';

export const ForumModuleMetadata = {
    id: 'FORUM',
    name: 'EduForum',
    version: '2.0.1',
    description: 'Diskussionsforum för kurser med trådar och svar.',
    icon: MessageSquare,
    settingsKey: 'module_forum_enabled',
    permissions: ['READ', 'WRITE']
};

const ForumModule = (props) => {
    return (
        <div className="animate-in fade-in h-full">
            <CourseForum {...props} />
        </div>
    );
};

export default ForumModule;
