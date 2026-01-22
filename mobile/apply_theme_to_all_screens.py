"""
Apply full theme support to all mobile screens
Based on successful AdminDashboardScreen pattern
"""

import os
import re
from pathlib import Path

# All screens to update
ALL_SCREENS = [
    # Dashboards
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\StudentDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\TeacherDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\MentorDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\PrincipalDashboardScreen.tsx",
    
    # Auth
    r"e:\Projekt\EduFlex\mobile\src\screens\auth\LoginScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\auth\RegisterScreen.tsx",
    
    # Profile
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\ProfileMainScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\AchievementsScreen.tsx",
    
    # Courses
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseListScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseDetailScreen.tsx",
    
    # Messages
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\MessagesScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\InboxScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\ConversationScreen.tsx",
    
    # Calendar
    r"e:\Projekt\EduFlex\mobile\src\screens\calendar\CalendarScreen.tsx",
]

def remove_inline_color_overrides(content):
    """Remove all inline color overrides like { color: '#...' }"""
    # Pattern 1: [styles.X, { color: '#...' }] -> styles.X
    content = re.sub(r'\[styles\.(\w+), \{ color: \'#[0-9A-Fa-f]{6}\' \}\]', r'styles.\1', content)
    
    # Pattern 2: [styles.X, { backgroundColor: '#...' }] -> styles.X
    content = re.sub(r'\[styles\.(\w+), \{ backgroundColor: \'#[0-9A-Fa-f]{6}\' \}\]', r'styles.\1', content)
    
    # Pattern 3: [styles.X, { backgroundColor: '#...', color: '#...' }] -> styles.X
    content = re.sub(r'\[styles\.(\w+), \{ backgroundColor: \'#[0-9A-Fa-f]{6}\', color: \'#[0-9A-Fa-f]{6}\' \}\]', r'styles.\1', content)
    
    # Pattern 4: [styles.X, { backgroundColor: '#...', borderColor: '#...' }] -> styles.X
    content = re.sub(r'\[styles\.(\w+), \{ backgroundColor: \'#[0-9A-Fa-f]{6}\', borderColor: \'#[0-9A-Fa-f]{6}\' \}\]', r'styles.\1', content)
    
    # Pattern 5: [styles.X, { borderColor: '#...' }] -> styles.X
    content = re.sub(r'\[styles\.(\w+), \{ borderColor: \'#[0-9A-Fa-f]{6}\' \}\]', r'styles.\1', content)
    
    return content

def update_imports(content):
    """Update imports to use useThemedStyles"""
    # Check if already has useThemedStyles
    if 'useThemedStyles' in content:
        return content
    
    # Replace old theme imports
    content = re.sub(
        r"import \{ useTheme \} from '.*?ThemeContext';\nimport \{ getThemeColors \} from '.*?themeStyles';",
        "import { useThemedStyles } from '../../hooks';",
        content
    )
    
    return content

def update_hook_usage(content):
    """Update hook usage in component"""
    # Replace old pattern with new
    content = re.sub(
        r"const \{ currentTheme \} = useTheme\(\);\s*const colors = getThemeColors\(currentTheme\);",
        "const { colors, styles: themedStyles } = useThemedStyles();",
        content
    )
    
    return content

def process_screen(filepath):
    """Process a single screen file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply transformations
        content = update_imports(content)
        content = update_hook_usage(content)
        content = remove_inline_color_overrides(content)
        
        # Only write if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, "Updated"
        else:
            return True, "No changes needed"
            
    except Exception as e:
        return False, str(e)

def main():
    print("\n" + "="*70)
    print("APPLYING THEME SUPPORT TO ALL SCREENS")
    print("="*70 + "\n")
    
    success_count = 0
    updated_count = 0
    
    for filepath in ALL_SCREENS:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = process_screen(filepath)
        
        if success:
            if "Updated" in message:
                print(f"✅ {path.name} - {message}")
                updated_count += 1
            else:
                print(f"ℹ️  {path.name} - {message}")
            success_count += 1
        else:
            print(f"❌ {path.name} - {message}")
    
    print("\n" + "="*70)
    print(f"✅ Processed {success_count}/{len(ALL_SCREENS)} files")
    print(f"📝 Updated {updated_count} files")
    print("\n🎨 Theme support applied to all screens!")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
