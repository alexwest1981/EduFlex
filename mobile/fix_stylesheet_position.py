"""
Fix StyleSheet scope - move BEFORE early returns
"""

import os
import re
from pathlib import Path

DASHBOARDS = [
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\StudentDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\TeacherDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\AdminDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\MentorDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\PrincipalDashboardScreen.tsx",
]

def fix_stylesheet_position(filepath):
    """Move StyleSheet BEFORE early returns"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find StyleSheet block
        stylesheet_match = re.search(
            r'\n    const styles = StyleSheet\.create\(\{(.*?)\}\);\n',
            content,
            re.DOTALL
        )
        
        if not stylesheet_match:
            return False, "No StyleSheet found"
        
        stylesheet_full = stylesheet_match.group(0)
        
        # Remove StyleSheet from current location
        content_without_styles = content.replace(stylesheet_full, '\n')
        
        # Find first early return (if statement with return)
        early_return_match = re.search(
            r'(\n    if \(.*?\) \{\s*\n        return \()',
            content_without_styles
        )
        
        if early_return_match:
            # Insert BEFORE early return
            insert_pos = early_return_match.start()
        else:
            # No early return, insert before main return
            main_return_match = re.search(r'(\n    return \()', content_without_styles)
            if not main_return_match:
                return False, "No return statement found"
            insert_pos = main_return_match.start()
        
        new_content = (
            content_without_styles[:insert_pos] +
            stylesheet_full +
            content_without_styles[insert_pos:]
        )
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Success"
        
    except Exception as e:
        return False, str(e)

def main():
    print("\nFixing StyleSheet position in dashboards...\n")
    print("=" * 70)
    
    for filepath in DASHBOARDS:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = fix_stylesheet_position(filepath)
        
        if success:
            print(f"✅ {path.name}")
        else:
            print(f"❌ {path.name} - {message}")
    
    print("=" * 70)
    print("\n✅ StyleSheet now defined BEFORE early returns!\n")

if __name__ == "__main__":
    main()
