-- V102: Add Price Column to Courses Table
ALTER TABLE courses ADD COLUMN price DOUBLE PRECISION DEFAULT 0.0;
