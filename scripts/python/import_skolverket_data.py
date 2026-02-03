#!/usr/bin/env python3
"""
Import Skolverket Data to Database
Reads JSON from skolverket_scraper.py and imports to PostgreSQL
"""

import json
import psycopg2
from psycopg2.extras import execute_values
import sys
from pathlib import Path

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'eduflex',
    'user': 'eduflex',
    'password': 'eduflex123'  # TODO: Use environment variable
}

def connect_db():
    """Connect to PostgreSQL database"""
    return psycopg2.connect(**DB_CONFIG)

def import_course_details(conn, course_data):
    """Update SkolverketCourse with detailed information"""
    cursor = conn.cursor()
    
    update_sql = """
        UPDATE skolverket_courses
        SET 
            english_title = %s,
            skolformer = %s,
            pdf_url = %s,
            description = %s,
            subject_purpose = %s,
            objectives = %s
        WHERE course_code = %s
    """
    
    cursor.execute(update_sql, (
        course_data.get('englishTitle'),
        course_data.get('skolformer'),
        course_data.get('pdfUrl'),
        course_data.get('description'),
        course_data.get('subjectPurpose'),
        course_data.get('objectives'),
        course_data['courseCode']
    ))
    
    return cursor.rowcount > 0

def import_grading_criteria(conn, course_code, criteria_list):
    """Import grading criteria for a course"""
    cursor = conn.cursor()
    
    # Get course ID
    cursor.execute("SELECT id FROM skolverket_courses WHERE course_code = %s", (course_code,))
    result = cursor.fetchone()
    if not result:
        print(f"Warning: Course {course_code} not found in database")
        return 0
    
    course_id = result[0]
    
    # Delete existing criteria
    cursor.execute("DELETE FROM skolverket_grading_criteria WHERE skolverket_course_id = %s", (course_id,))
    
    # Insert new criteria
    if not criteria_list:
        return 0
    
    insert_sql = """
        INSERT INTO skolverket_grading_criteria 
        (skolverket_course_id, grade_level, criteria_text, sort_order)
        VALUES %s
    """
    
    values = [
        (course_id, c['gradeLevel'], c['criteriaText'], c['sortOrder'])
        for c in criteria_list
    ]
    
    execute_values(cursor, insert_sql, values)
    return len(values)

def main():
    if len(sys.argv) < 2:
        print("Usage: python import_skolverket_data.py <path_to_json>")
        print("Example: python import_skolverket_data.py skolverket_courses_detailed.json")
        sys.exit(1)
    
    json_file = Path(sys.argv[1])
    
    if not json_file.exists():
        print(f"Error: File not found: {json_file}")
        sys.exit(1)
    
    # Load JSON data
    print(f"Loading data from {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
    
    print(f"Loaded {len(courses_data)} courses")
    
    # Connect to database
    print("Connecting to database...")
    conn = connect_db()
    conn.autocommit = False  # Use transactions
    
    try:
        updated_count = 0
        criteria_count = 0
        
        for i, course_data in enumerate(courses_data, 1):
            course_code = course_data['courseCode']
            print(f"[{i}/{len(courses_data)}] Importing {course_code}...")
            
            # Update course details
            if import_course_details(conn, course_data):
                updated_count += 1
            
            # Import grading criteria
            criteria_list = course_data.get('gradingCriteria', [])
            count = import_grading_criteria(conn, course_code, criteria_list)
            criteria_count += count
        
        # Commit transaction
        conn.commit()
        
        print("\nImport complete!")
        print(f"Updated courses: {updated_count}/{len(courses_data)}")
        print(f"Imported grading criteria: {criteria_count}")
    
    except Exception as e:
        conn.rollback()
        print(f"Error during import: {e}")
        sys.exit(1)
    
    finally:
        conn.close()

if __name__ == "__main__":
    main()
