import React from 'react';
import { MessageCircle } from 'lucide-react';
import ChatOverlay from './ChatOverlay';

export const ChatModuleMetadata = {
    id: 'module_chat_enabled', // Viktigt: Detta ID används i databasen för settings
    name: 'EduChat Pro',
    version: '3.0.0-beta',
    description: 'Realtidskommunikation via WebSockets.',
    icon: MessageCircle,
    settingsKey: 'module_chat_enabled',
    permissions: ['READ', 'WRITE']
};

const ChatModule = ({ currentUser, API_BASE, token }) => {
    return <ChatOverlay currentUser={currentUser} API_BASE={API_BASE} token={token} />;
};

export default ChatModule;