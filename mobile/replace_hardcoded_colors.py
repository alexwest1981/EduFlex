"""
Replace ALL hardcoded colors in StyleSheets with colors.X
This will fix the remaining white backgrounds
"""

import re
from pathlib import Path

# Screens that need color replacement
SCREENS = [
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseListScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseDetailScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\calendar\CalendarScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\MessagesScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\InboxScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\ConversationScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\ProfileMainScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\AchievementsScreen.tsx",
]

# Color mappings
COLOR_MAP = {
    "'#F9FAFB'": "colors.background",
    "'#FFFFFF'": "colors.card",
    "'#111827'": "colors.text",
    "'#1F2937'": "colors.text",
    "'#6B7280'": "colors.textSecondary",
    "'#9CA3AF'": "colors.textSecondary",
    "'#4F46E5'": "colors.primary",
    "'#E5E7EB'": "colors.border",
    "'#D1D5DB'": "colors.border",
    '"#F9FAFB"': "colors.background",
    '"#FFFFFF"': "colors.card",
    '"#111827"': "colors.text",
    '"#1F2937"': "colors.text",
    '"#6B7280"': "colors.textSecondary",
    '"#9CA3AF"': "colors.textSecondary",
    '"#4F46E5"': "colors.primary",
    '"#E5E7EB"': "colors.border",
    '"#D1D5DB"': "colors.border",
}

def replace_colors_in_file(filepath):
    """Replace hardcoded colors with theme colors"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Replace each color
        for old_color, new_color in COLOR_MAP.items():
            content = content.replace(old_color, new_color)
        
        # Also replace in comments
        content = re.sub(r"//\s*Theme:\s*'#[0-9A-Fa-f]{6}'", "", content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, "Updated"
        return True, "No changes"
    except Exception as e:
        return False, str(e)

def main():
    print("\n" + "="*70)
    print("REPLACING HARDCODED COLORS WITH THEME COLORS")
    print("="*70 + "\n")
    
    updated = 0
    
    for filepath in SCREENS:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = replace_colors_in_file(filepath)
        
        if success and "Updated" in message:
            print(f"✅ {path.name} - {message}")
            updated += 1
        elif success:
            print(f"ℹ️  {path.name} - {message}")
        else:
            print(f"❌ {path.name} - {message}")
    
    print("\n" + "="*70)
    print(f"✅ Updated {updated} files with theme colors")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
