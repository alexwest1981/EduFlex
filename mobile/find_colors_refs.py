"""
Find ALL remaining colors. references in StyleSheets
"""

import os
import re
from pathlib import Path

SCREENS_DIR = r"e:\Projekt\EduFlex\mobile\src\screens"

def find_colors_refs(filepath):
    """Find any remaining colors. references"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        issues = []
        for i, line in enumerate(lines, 1):
            if 'colors.' in line and 'const colors' not in line and 'getThemeColors' not in line and 'import' not in line:
                issues.append((i, line.strip()))
        
        return issues
        
    except Exception as e:
        return []

def main():
    screens_path = Path(SCREENS_DIR)
    screen_files = list(screens_path.rglob("*.tsx"))
    
    print(f"\nSearching for colors. references in {len(screen_files)} files...\n")
    print("=" * 70)
    
    found_count = 0
    
    for filepath in sorted(screen_files):
        issues = find_colors_refs(filepath)
        if issues:
            print(f"\n⚠️  {filepath.name}")
            for line_num, line in issues[:3]:  # Show first 3
                print(f"   Line {line_num}: {line[:60]}...")
            found_count += 1
    
    print("=" * 70)
    print(f"\n⚠️  Found colors. references in {found_count} files\n")

if __name__ == "__main__":
    main()
