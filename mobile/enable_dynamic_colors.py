"""
Replace fallback values with colors.X in components with StyleSheet inside
This enables dynamic theme changes
"""

import os
import re
from pathlib import Path

# Components where StyleSheet is INSIDE component (can use colors)
COMPONENTS_WITH_INTERNAL_STYLESHEET = [
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\StudentDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\TeacherDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\AdminDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\MentorDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\PrincipalDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\admin\UserDetailScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseListScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseDetailScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\MessagesScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\calendar\CalendarScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\ProfileMainScreen.tsx",
]

def enable_dynamic_colors(filepath):
    """Replace fallback values with colors.X"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Only replace within StyleSheet.create block
        stylesheet_pattern = r'(const styles = StyleSheet\.create\(\{)(.*?)(\}\);)'
        match = re.search(stylesheet_pattern, content, re.DOTALL)
        
        if not match:
            return False, "No StyleSheet found"
        
        stylesheet_content = match.group(2)
        
        # Replace fallback values with colors.X
        replacements = {
            "'#F9FAFB'": 'colors.background',
            "'#FFFFFF'": 'colors.card',
            "'#111827'": 'colors.text',
            "'#6B7280'": 'colors.textSecondary',
            "'#4F46E5'": 'colors.primary',
            "'#9CA3AF'": 'colors.secondary',
            "'#E5E7EB'": 'colors.border',
        }
        
        new_stylesheet = stylesheet_content
        for old, new in replacements.items():
            new_stylesheet = new_stylesheet.replace(old, new)
        
        # Replace in full content
        new_content = content.replace(stylesheet_content, new_stylesheet)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Success"
        
    except Exception as e:
        return False, str(e)

def main():
    print("\nEnabling dynamic colors in components with internal StyleSheet...\n")
    print("=" * 70)
    
    success_count = 0
    
    for filepath in COMPONENTS_WITH_INTERNAL_STYLESHEET:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = enable_dynamic_colors(filepath)
        
        if success:
            print(f"✅ {path.name}")
            success_count += 1
        else:
            print(f"❌ {path.name} - {message}")
    
    print("=" * 70)
    print(f"\n✅ Enabled dynamic colors in {success_count} components!")
    print("\n🎨 These components will now change colors when theme changes!\n")

if __name__ == "__main__":
    main()
