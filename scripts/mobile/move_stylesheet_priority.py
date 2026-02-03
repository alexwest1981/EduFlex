"""
Move StyleSheet inside high-priority screens
"""

import os
import re
from pathlib import Path

HIGH_PRIORITY = [
    r"e:\Projekt\EduFlex\mobile\src\screens\admin\UserDetailScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseListScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseDetailScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\MessagesScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\calendar\CalendarScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\ProfileMainScreen.tsx",
]

def move_stylesheet_inside(filepath):
    """Move StyleSheet.create inside component"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find StyleSheet block
        stylesheet_match = re.search(
            r'\nconst styles = StyleSheet\.create\(\{(.*?)\}\);\s*\nexport default',
            content,
            re.DOTALL
        )
        
        if not stylesheet_match:
            return False, "No StyleSheet found"
        
        stylesheet_full = stylesheet_match.group(0)
        stylesheet_content = stylesheet_match.group(1)
        
        # Remove StyleSheet from current location
        content_without_styles = content.replace(stylesheet_full, '\nexport default')
        
        # Find return statement in component
        return_match = re.search(r'(\n    return \()', content_without_styles)
        
        if not return_match:
            return False, "No return statement found"
        
        # Insert StyleSheet before return
        insert_pos = return_match.start()
        
        # Build new StyleSheet with proper indentation
        new_stylesheet = f"\n    const styles = StyleSheet.create({{{stylesheet_content}}});\n"
        
        new_content = (
            content_without_styles[:insert_pos] +
            new_stylesheet +
            content_without_styles[insert_pos:]
        )
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Success"
        
    except Exception as e:
        return False, str(e)

def main():
    print("\nMoving StyleSheet inside high-priority screens...\n")
    print("=" * 70)
    
    success_count = 0
    
    for filepath in HIGH_PRIORITY:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = move_stylesheet_inside(filepath)
        
        if success:
            print(f"✅ {path.name}")
            success_count += 1
        else:
            print(f"❌ {path.name} - {message}")
    
    print("=" * 70)
    print(f"\n✅ Moved StyleSheet in {success_count} screens!\n")

if __name__ == "__main__":
    main()
