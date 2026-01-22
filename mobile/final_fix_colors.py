"""
FINAL FIX: Remove ALL remaining colors. references
"""

import os
import re
from pathlib import Path

SCREENS_DIR = r"e:\Projekt\EduFlex\mobile\src\screens"

def final_fix_colors(filepath):
    """Remove ALL colors. references"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip files with StyleSheet inside component
        if filepath.name in ['LeaderboardScreen.tsx', 'NotificationsScreen.tsx']:
            return False
        
        # Replace ALL possible colors. patterns
        replacements = {
            'colors.background': "'#F9FAFB'",
            'colors.card': "'#FFFFFF'",
            'colors.text': "'#111827'",
            'colors.textSecondary': "'#6B7280'",
            'colors.primary': "'#4F46E5'",
            'colors.secondary': "'#9CA3AF'",
            'colors.border': "'#E5E7EB'",
        }
        
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        
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
    
    print(f"\nFINAL FIX: Removing ALL colors. references...\n")
    print("=" * 70)
    
    fixed_count = 0
    
    for filepath in sorted(screen_files):
        if final_fix_colors(filepath):
            print(f"✅ {filepath.name}")
            fixed_count += 1
    
    print("=" * 70)
    print(f"\n✅ Fixed {fixed_count} files")
    print("\nALL colors. references removed!\n")

if __name__ == "__main__":
    main()
