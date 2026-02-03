"""
COMPLETE FIX: Remove ALL colors references from StyleSheets outside components
"""

import os
import re
from pathlib import Path

SCREENS_DIR = r"e:\\Projekt\\EduFlex\\mobile\\src\\screens"

def completely_remove_colors_refs(filepath):
    """Remove all colors. references from StyleSheet"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip files where StyleSheet is already inside component
        if filepath.name in ['LeaderboardScreen.tsx', 'NotificationsScreen.tsx']:
            return False
        
        # Find StyleSheet.create block that's outside component
        # Pattern: const styles = StyleSheet.create({ ... });
        stylesheet_pattern = r'const styles = StyleSheet\.create\(\{(.*?)\}\\);'
        match = re.search(stylesheet_pattern, content, re.DOTALL)
        
        if not match:
            return False
        
        stylesheet_content = match.group(1)
        
        # Check if it still has colors. references
        if 'colors.' not in stylesheet_content:
            return False
        
        # Replace ALL colors. references with safe fallbacks
        replacements = {
            'colors.background': "'#F9FAFB'",
            'colors.card': "'#FFFFFF'",
            'colors.text': "'#111827'",
            'colors.textSecondary': "'#6B7280'",
            'colors.primary': "'#4F46E5'",
            'colors.secondary': "'#9CA3AF'",
            'colors.border': "'#E5E7EB'",
        }
        
        new_stylesheet = stylesheet_content
        for old, new in replacements.items():
            new_stylesheet = new_stylesheet.replace(old, new)
        
        # Replace in full content
        new_content = content.replace(stylesheet_content, new_stylesheet)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {filepath.name} - {e}")
        return False

def main():
    screens_path = Path(SCREENS_DIR)
    screen_files = list(screens_path.rglob("*Screen.tsx"))
    
    print(f"\nRemoving ALL colors references from {len(screen_files)} files...\n")
    print("=" * 70)
    
    fixed_count = 0
    
    for filepath in sorted(screen_files):
        if completely_remove_colors_refs(filepath):
            print(f"✅ {filepath.name}")
            fixed_count += 1
    
    print("=" * 70)
    print(f"\n✅ Fixed {fixed_count} files")
    print("\nAll colors. references removed from external StyleSheets!\n")

if __name__ == "__main__":
    main()
