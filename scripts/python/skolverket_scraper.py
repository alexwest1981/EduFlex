#!/usr/bin/env python3
"""
Skolverket Course Scraper
Scrapes detailed course information from Skolverket's website
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import time
import sys
from pathlib import Path

# Configuration
BASE_URL = "https://www.skolverket.se"
RATE_LIMIT_SECONDS = 2  # Be respectful to Skolverket's servers
OUTPUT_FILE = "skolverket_courses_detailed.json"

def read_course_codes(csv_file):
    """Read course codes from existing CSV"""
    df = pd.read_csv(csv_file, encoding='utf-8')
    return df['Kurskod'].tolist()

def construct_course_url(course_code):
    """
    Construct Skolverket URL for a course
    TODO: Verify exact URL pattern from Skolverket
    Example: https://www.skolverket.se/undervisning/gymnasieskolan/laroplan-program-och-amnen-i-gymnasieskolan/...
    """
    # This URL pattern needs to be verified by visiting Skolverket
    return f"{BASE_URL}/undervisning/gymnasieskolan/kurser/{course_code}"

def scrape_grundinfo(soup):
    """Extract Grundinfo tab data"""
    data = {}
    try:
        # TODO: Adjust selectors based on actual Skolverket HTML structure
        # These are placeholders - need to inspect actual page
        data['englishTitle'] = soup.select_one('.english-title')?.text.strip() or None
        data['pdfUrl'] = soup.select_one('a[href*=".pdf"]')?.get('href') or None
        data['skolformer'] = soup.select_one('.skolformer')?.text.strip() or None
    except Exception as e:
        print(f"Error scraping grundinfo: {e}")
    return data

def scrape_innehall(soup):
    """Extract Innehåll tab data"""
    data = {}
    try:
        # Description
        desc_elem = soup.select_one('.course-description, .beskrivning')
        data['description'] = desc_elem.text.strip() if desc_elem else None

        # Subject purpose (Ämnets syfte)
        purpose_elem = soup.select_one('.subject-purpose, .amnets-syfte')
        data['subjectPurpose'] = purpose_elem.text.strip() if purpose_elem else None

        # Objectives
        objectives_elem = soup.select_one('.objectives, .undervisningen')
        data['objectives'] = objectives_elem.text.strip() if objectives_elem else None
    except Exception as e:
        print(f"Error scraping innehåll: {e}")
    return data

def scrape_kunskapskrav(soup):
    """Extract Kunskapskrav tab data (grading criteria E-A)"""
    criteria = []
    grade_order = {'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5}
    
    try:
        # TODO: Adjust selectors based on actual Skolverket HTML structure
        for grade_level in ['E', 'D', 'C', 'B', 'A']:
            criterion_elem = soup.select_one(f'.betyg-{grade_level}, .grade-{grade_level}')
            if criterion_elem:
                criteria.append({
                    'gradeLevel': grade_level,
                    'criteriaText': criterion_elem.text.strip(),
                    'sortOrder': grade_order[grade_level]
                })
    except Exception as e:
        print(f"Error scraping kunskapskrav: {e}")
    
    return criteria

def scrape_course(course_code):
    """Scrape all data for a single course"""
    url = construct_course_url(course_code)
    print(f"Scraping {course_code}...")
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract all data
        course_data = {
            'courseCode': course_code,
            **scrape_grundinfo(soup),
            **scrape_innehall(soup),
            'gradingCriteria': scrape_kunskapskrav(soup)
        }
        
        return course_data
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {course_code}: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python skolverket_scraper.py <path_to_csv>")
        print("Example: python skolverket_scraper.py ../docs/kurser_2026-01-11.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    # Read course codes
    print(f"Reading course codes from {csv_file}...")
    course_codes = read_course_codes(csv_file)
    print(f"Found {len(course_codes)} courses to scrape")
    
    # Test mode: scrape only first 5 courses
    test_mode = input("Test mode (scrape only 5 courses)? (y/n): ").lower() == 'y'
    if test_mode:
        course_codes = course_codes[:5]
        print(f"Test mode: scraping {len(course_codes)} courses")
    
    # Scrape all courses
    results = []
    for i, code in enumerate(course_codes, 1):
        print(f"[{i}/{len(course_codes)}] Scraping {code}...")
        
        course_data = scrape_course(code)
        if course_data:
            results.append(course_data)
        
        # Rate limiting
        if i < len(course_codes):
            time.sleep(RATE_LIMIT_SECONDS)
    
    # Save results
    output_path = Path(__file__).parent / OUTPUT_FILE
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nScraping complete!")
    print(f"Successfully scraped: {len(results)}/{len(course_codes)} courses")
    print(f"Output saved to: {output_path}")

if __name__ == "__main__":
    main()
