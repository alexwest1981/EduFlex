import React from 'react';
import {
    X, FileQuestion, ClipboardList, BookOpen, ChevronRight,
    ChevronLeft, Loader2, Send, Tag, Plus, Check, Upload, FileSpreadsheet, AlertCircle,
    Brain, Lightbulb, Scale, TrendingUp, Briefcase, Rocket, Camera, Video, Stethoscope,
    Star, GraduationCap, Zap, Recycle, Gavel, Component, Terminal, Search, Award,
    Calculator, Globe, Atom, FlaskConical, Leaf, Landmark, Users, Map, Heart, Cog,
    Code, Activity, Music, Palette, Hammer, Utensils, MessageCircle, Languages, Folder
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
    'brain': Brain,
    'lightbulb': Lightbulb,
    'scale': Scale,
    'trending-up': TrendingUp,
    'briefcase': Briefcase,
    'rocket': Rocket,
    'camera': Camera,
    'video': Video,
    'stethoscope': Stethoscope,
    'star': Star,
    'graduation-cap': GraduationCap,
    'zap': Zap,
    'recycle': Recycle,
    'gavel': Gavel,
    'component': Component,
    'terminal': Terminal,
    'search': Search,
    'award': Award
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
