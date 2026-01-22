# Skolverket Data Import Scripts

## Requirements

```bash
pip install requests beautifulsoup4 pandas psycopg2-binary
```

## Usage

### 1. Web Scraping

```bash
# Test mode (5 courses only)
python skolverket_scraper.py ../docs/kurser_2026-01-11.csv

# Full scrape (all 2619 courses)
python skolverket_scraper.py ../docs/kurser_2026-01-11.csv
# When prompted, enter 'n' for full scrape
```

**Output**: `skolverket_courses_detailed.json`

### 2. Import to Database

```bash
python import_skolverket_data.py skolverket_courses_detailed.json
```

## Important Notes

### Before First Run

1. **Verify Skolverket URL Pattern**
   - Visit a course on Skolverket's website
   - Copy the URL structure
   - Update `construct_course_url()` in `skolverket_scraper.py`

2. **Inspect HTML Structure**
   - Right-click on Skolverket page → Inspect
   - Find CSS selectors for:
     - English title
     - PDF link
     - Description (Beskrivning)
     - Subject purpose (Ämnets syfte)
     - Objectives
     - Grading criteria (Betyg E, D, C, B, A)
   - Update selectors in scraper functions

3. **Database Connection**
   - Update `DB_CONFIG` in `import_skolverket_data.py`
   - Or use environment variables:
     ```bash
     export DB_HOST=localhost
     export DB_USER=eduflex
     export DB_PASSWORD=your_password
     ```

### Rate Limiting

The scraper waits 2 seconds between requests to be respectful to Skolverket's servers. For 2619 courses, this will take approximately:
- 2619 courses × 2 seconds = ~1.5 hours

### Troubleshooting

**Scraper returns empty data:**
- CSS selectors need updating
- Run on 1-2 courses manually to debug
- Print `soup` to see actual HTML structure

**Import fails:**
- Check database connection
- Ensure `skolverket_courses` table exists
- Verify course codes match between CSV and database

## Manual Verification

After scraping, manually check a few courses:
```python
import json
with open('skolverket_courses_detailed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(json.dumps(data[0], indent=2, ensure_ascii=False))
```
