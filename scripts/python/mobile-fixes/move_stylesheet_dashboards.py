"Move StyleSheet inside component for dashboard screens
This enables full dynamic theme support
"

import os
import re
from pathlib import Path

DASHBOARDS = [
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\StudentDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\TeacherDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\AdminDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\MentorDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\PrincipalDashboardScreen.tsx",
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
    print("\nMoving StyleSheet inside dashboard components...\n")
    print("=" * 70)
    
    for filepath in DASHBOARDS:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = move_stylesheet_inside(filepath)
        
        if success:
            print(f"✅ {path.name}")
        else:
            print(f"❌ {path.name} - {message}")
    
    print("=" * 70)
    print("\n✅ Dashboard StyleSheets moved inside components!\n")

if __name__ == "__main__":
    main()
