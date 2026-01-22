// API Configuration
// Using Local IP to avoid DNS resolution issues
export const API_URL = 'https://www.eduflexlms.se/api';
export const API_BASE = 'https://www.eduflexlms.se'; // Base URL without /api

// WebSocket URL for real-time features
export const WS_URL = 'wss://www.eduflexlms.se/ws';

// App Configuration
export const APP_NAME = 'EduFlex';
export const APP_VERSION = '1.0.0';

// Gamification Constants
export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 100;

// Badge Tiers with colors
export const BADGE_TIER_COLORS = {
  COMMON: '#9CA3AF',     // Gray
  RARE: '#3B82F6',       // Blue
  EPIC: '#8B5CF6',       // Purple
  LEGENDARY: '#F59E0B',  // Gold
} as const;

// Risk Level Colors
export const RISK_LEVEL_COLORS = {
  LOW: '#10B981',    // Green
  MEDIUM: '#F59E0B', // Yellow
  HIGH: '#EF4444',   // Red
} as const;

// Notification Type Colors
export const NOTIFICATION_COLORS = {
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  ACHIEVEMENT: '#8B5CF6',
  ASSIGNMENT: '#6366F1',
  MESSAGE: '#06B6D4',
} as const;

// Date/Time formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  TENANT_ID: 'tenant_id',
  USER_DATA: 'user_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;
