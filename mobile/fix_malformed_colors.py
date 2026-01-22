"""
Fix all malformed color replacements where 'Secondary' was concatenated
"""

import os
import re
from pathlib import Path

SCREENS_DIR = r"e:\Projekt\EduFlex\mobile\src\screens"

def fix_malformed_colors(filepath):
    """Fix malformed color values like '#111827'Secondary"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and fix malformed patterns
        patterns = [
            (r"'#111827'Secondary", "'#6B7280'"),
            (r"'#111827'Text", "'#111827'"),
            (r"'#6B7280'Secondary", "'#6B7280'"),
        ]
        
        original_content = content
        for pattern, replacement in patterns:
            content = content.replace(pattern, replacement)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error: {filepath.name} - {e}")
        return False

def main():
    screens_path = Path(SCREENS_DIR)
    screen_files = list(screens_path.rglob("*.tsx"))
    
    print(f"\nFixing malformed color values in {len(screen_files)} files...\n")
    print("=" * 70)
    
    fixed_count = 0
    
    for filepath in sorted(screen_files):
        if fix_malformed_colors(filepath):
            print(f"✅ {filepath.name}")
            fixed_count += 1
    
    print("=" * 70)
    print(f"\n✅ Fixed {fixed_count} files\n")

if __name__ == "__main__":
    main()
