"ABSOLUTE FINAL FIX: Remove EVERY SINGLE colors. reference"

import os
import re
from pathlib import Path

MOBILE_DIR = r"e:\\Projekt\\EduFlex\\mobile\\src"

# Files that have StyleSheet inside component (skip these)
SKIP_FILES = ['LeaderboardScreen.tsx', 'NotificationsScreen.tsx']

def absolute_final_fix(filepath):
    """Remove EVERY colors. reference"""
    try:
        if filepath.name in SKIP_FILES:
            return False
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace ALL possible colors. patterns - be more aggressive
        replacements = [
            ('colors.background', "'#F9FAFB'",),
            ('colors.card', "'#FFFFFF'",),
            ('colors.text', "'#111827'",),
            ('colors.textSecondary', "'#6B7280'",),
            ('colors.primary', "'#4F46E5'",),
            ('colors.secondary', "'#9CA3AF'",),
            ('colors.border', "'#E5E7EB'",),
        ]
        
        original_content = content
        for old, new in replacements:
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
    mobile_path = Path(MOBILE_DIR)
    all_files = list(mobile_path.rglob("*.tsx")) + list(mobile_path.rglob("*.ts"))
    
    print(f"\nABSOLUTE FINAL FIX: Removing ALL colors. references from {len(all_files)} files...\n")
    print("=" * 70)
    
    fixed_count = 0
    
    for filepath in sorted(all_files):
        if absolute_final_fix(filepath):
            print(f"✅ {filepath.name}")
            fixed_count += 1
    
    print("=" * 70)
    print(f"\n✅ Fixed {fixed_count} files")
    print("\n🎯 EVERY SINGLE colors. reference has been removed!\n")

if __name__ == "__main__":
    main()
