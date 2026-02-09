package com.eduflex.backend.model;

public enum Permission {
    // CORE
    VIEW_DASHBOARD,
    VIEW_COURSES,
    VIEW_PROFILE,

    // COURSE MANAGEMENT
    COURSE_CREATE,
    COURSE_EDIT,
    COURSE_DELETE,
    COURSE_VIEW_ALL, // See courses even if not enrolled (Principal/Admin)

    // GRADING & EVALUATION
    GRADE_ASSIGN,
    GRADE_VIEW,

    // USER MANAGEMENT
    USER_CREATE,
    USER_EDIT,
    USER_DELETE,
    USER_VIEW_ALL,

    // ROLE & PERMISSIONS
    ROLE_MANAGE, // Create/Edit roles

    // SYSTEM
    SETTINGS_MANAGE,
    MODULE_MANAGE,
    AUDIT_VIEW,

    // SCORM
    SCORM_UPLOAD,
    SCORM_DELETE,

    // REVENUE
    REVENUE_VIEW,
    SUBSCRIPTION_MANAGE,

    // PRINCIPAL PACKAGE
    ORG_MANAGE,
    STAFF_AUDIT,
    GRADE_AUDIT_ALL,
    INCIDENT_MANAGE
}
