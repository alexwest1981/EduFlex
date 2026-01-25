import React from 'react';
import {
    Calculator, BookOpen, Globe, Atom, FlaskConical, Leaf,
    Landmark, Users, Map, Heart, Cog, Code, Activity,
    Music, Palette, Hammer, Utensils, MessageCircle, Languages, Folder
} from 'lucide-react';

const iconMap = {
    'calculator': Calculator,
    'book-open': BookOpen,
    'globe': Globe,
    'atom': Atom,
    'flask-conical': FlaskConical,
    'leaf': Leaf,
    'landmark': Landmark,
    'users': Users,
    'map': Map,
    'heart': Heart,
    'cog': Cog,
    'code': Code,
    'activity': Activity,
    'music': Music,
    'palette': Palette,
    'hammer': Hammer,
    'utensils': Utensils,
    'message-circle': MessageCircle,
    'languages': Languages,
    'folder': Folder,
};

const SubjectIcon = ({ iconName, color = '#6366F1', size = 20, className = '' }) => {
    const IconComponent = iconMap[iconName] || Folder;

    return (
        <IconComponent
            size={size}
            style={{ color }}
            className={className}
        />
    );
};

export default SubjectIcon;
