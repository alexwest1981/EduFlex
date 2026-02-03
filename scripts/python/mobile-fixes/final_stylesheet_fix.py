"""
FINAL SOLUTION: Move StyleSheet inside components and use colors
This script does BOTH:
1. Moves StyleSheet.create() INSIDE the component function
2. Keeps colors.X references (they work when inside component)
"""

import os
import re
from pathlib import Path

DASHBOARDS = [
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\AdminDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\StudentDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\TeacherDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\MentorDashboardScreen.tsx",
    r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\PrincipalDashboardScreen.tsx",
]

def move_stylesheet_inside_component(filepath):
    """
    Move StyleSheet from outside component to inside, right before first return
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the component function start
        component_match = re.search(r'const \w+Screen.*?= \(\) => \{', content)
        if not component_match:
            return False, "Component function not found"
        
        component_start = component_match.end()
        
        # Find StyleSheet.create block (currently outside or inside)
        stylesheet_pattern = r'\n    const styles = StyleSheet\.create\(\{(.*?)\n    \}\);\n'
        stylesheet_match = re.search(stylesheet_pattern, content, re.DOTALL)
        
        if not stylesheet_match:
            return False, "StyleSheet not found"
        
        stylesheet_full = stylesheet_match.group(0)
        stylesheet_start = stylesheet_match.start()
        
        # Check if StyleSheet is already inside component
        if stylesheet_start > component_start:
            # Already inside, check if it's before return
            # Find first return statement after stylesheet
            after_stylesheet = content[stylesheet_match.end():]
            return_match = re.search(r'\n    return \(', after_stylesheet)
            
            if return_match:
                # StyleSheet is before return, good position
                return True, "Already correctly positioned"
            else:
                # StyleSheet is after return somehow, need to move
                pass
        
        # Remove StyleSheet from current location
        content_without_styles = content.replace(stylesheet_full, '\n')
        
        # Find the first return statement in component
        # Look for pattern: "    return (" 
        return_pattern = r'(\n    return \()'
        return_match = re.search(return_pattern, content_without_styles[component_start:])
        
        if not return_match:
            return False, "Return statement not found"
        
        # Calculate absolute position
        insert_pos = component_start + return_match.start()
        
        # Insert StyleSheet before return
        new_content = (
            content_without_styles[:insert_pos] +
            stylesheet_full +
            content_without_styles[insert_pos:]
        )
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Moved successfully"
        
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("\n" + "="*70)
    print("FINAL FIX: Moving StyleSheet inside components")
    print("="*70 + "\n")
    
    success_count = 0
    
    for filepath in DASHBOARDS:
        path = Path(filepath)
        if not path.exists():
            print(f"⚠️  Not found: {path.name}")
            continue
        
        success, message = move_stylesheet_inside_component(filepath)
        
        if success:
            print(f"✅ {path.name} - {message}")
            success_count += 1
        else:
            print(f"❌ {path.name} - {message}")
    
    print("\n" + "="*70)
    print(f"✅ Successfully processed {success_count}/{len(DASHBOARDS)} files")
    print("\n🎨 Dashboards will now update when theme changes!")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
