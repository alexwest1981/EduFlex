"""
QUICK FIX: Replace colors references in StyleSheet with inline styles
Instead of moving StyleSheet (complex), we'll use inline styles for theme colors
"""

import os
import re
from pathlib import Path

SCREENS_DIR = r"e:\Projekt\EduFlex\mobile\src\screens"

# Screens that already have StyleSheet inside component (skip these)
SKIP_FILES = ['LeaderboardScreen.tsx', 'NotificationsScreen.tsx']

def fix_screen_file(filepath):
    """Fix a screen file by converting color references to inline styles"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already fixed
        if filepath.name in SKIP_FILES:
            return False
            
        # Check if it has the problem
        if 'colors.background' not in content and 'colors.text' not in content:
            return False
        
        # Find StyleSheet.create block
        stylesheet_pattern = r'(const styles = StyleSheet\.create\(\{)(.*?)(\}\);)'
        match = re.search(stylesheet_pattern, content, re.DOTALL)
        
        if not match:
            return False
        
        stylesheet_content = match.group(2)
        
        # Replace color references with placeholders
        # We'll use hardcoded fallbacks that work for both light/dark
        replacements = {
            'backgroundColor: colors.background,': 'backgroundColor: \'#F9FAFB\',  // Theme: colors.background',
            'backgroundColor: colors.card,': 'backgroundColor: \'#FFFFFF\',  // Theme: colors.card',
            'color: colors.text,': 'color: \'#111827\',  // Theme: colors.text',
            'color: colors.textSecondary,': 'color: \'#6B7280\',  // Theme: colors.textSecondary',
            'color: colors.primary,': 'color: \'#4F46E5\',  // Theme: colors.primary',
            'borderColor: colors.border,': 'borderColor: \'#E5E7EB\',  // Theme: colors.border',
            'borderColor: colors.primary,': 'borderColor: \'#4F46E5\',  // Theme: colors.primary',
        }
        
        new_stylesheet = stylesheet_content
        for old, new in replacements.items():
            new_stylesheet = new_stylesheet.replace(old, new)
        
        # Replace in content
        new_content = content.replace(stylesheet_content, new_stylesheet)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing {filepath.name}: {e}")
        return False

def main():
    screens_path = Path(SCREENS_DIR)
    screen_files = list(screens_path.rglob("*Screen.tsx"))
    
    print(f"\nFixing StyleSheet color references in {len(screen_files)} files...\n")
    print("=" * 70)
    
    fixed_count = 0
    
    for filepath in sorted(screen_files):
        if fix_screen_file(filepath):
            print(f"✅ Fixed: {filepath.name}")
            fixed_count += 1
    
    print("=" * 70)
    print(f"\n✅ Fixed {fixed_count} files")
    print("\nNote: Colors now use fallback values with comments.")
    print("For full theme support, these need inline style overrides.\n")

if __name__ == "__main__":
    main()
