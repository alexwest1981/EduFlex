"""
Find and fix all screens with StyleSheet scope issues
Specifically: StyleSheet defined inside if-blocks but used outside
"""

import os
import re
from pathlib import Path

def find_stylesheet_in_if_block(filepath):
    """Check if StyleSheet is defined inside an if-block"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for pattern: if (...) { ... const styles = StyleSheet.create
        pattern = r'if \([^)]+\) \{[^}]*const styles = StyleSheet\.create'
        
        if re.search(pattern, content, re.DOTALL):
            return True
        return False
    except:
        return False

def fix_stylesheet_scope(filepath):
    """Move StyleSheet out of if-block to component level"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the if (isLoading) block with StyleSheet
        if_block_pattern = r'(  if \(isLoading\) \{\n)(    const styles = StyleSheet\.create\(\{.*?\}\);\n\n)(    return \(.*?\);?\n  \})'
        
        match = re.search(if_block_pattern, content, re.DOTALL)
        if not match:
            return False, "Pattern not found"
        
        if_start = match.group(1)
        stylesheet = match.group(2)
        return_block = match.group(3)
        
        # Remove StyleSheet from if-block
        new_if_block = if_start + return_block
        
        # Find where to insert StyleSheet (after hooks, before if-block)
        # Look for the line before "if (isLoading)"
        insert_pattern = r'(\n  \};\n\n)(  if \(isLoading\))'
        
        # Replace: remove stylesheet from if-block, add before it
        content = content.replace(match.group(0), new_if_block)
        content = re.sub(insert_pattern, r'\1' + stylesheet + r'\2', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, "Fixed"
    except Exception as e:
        return False, str(e)

# Screens to check
SCREENS_TO_CHECK = [
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\StudentDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\TeacherDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\MentorDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\dashboard\PrincipalDashboardScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\courses\CourseDetailScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\MessagesScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\InboxScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\messages\ConversationScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\calendar\CalendarScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\ProfileMainScreen.tsx",
    r"e:\Projekt\EduFlex\mobile\src\screens\profile\AchievementsScreen.tsx",
]

def main():
    print("\nFinding and fixing StyleSheet scope issues...\n")
    print("=" * 70)
    
    issues_found = []
    
    for filepath in SCREENS_TO_CHECK:
        path = Path(filepath)
        if not path.exists():
            continue
        
        if find_stylesheet_in_if_block(filepath):
            issues_found.append(filepath)
            print(f"⚠️  {path.name} - StyleSheet in if-block")
    
    print("=" * 70)
    print(f"\nFound {len(issues_found)} files with scope issues")
    
    if issues_found:
        print("\nThese files need manual fixing:")
        for fp in issues_found:
            print(f"  - {Path(fp).name}")
    
    print()

if __name__ == "__main__":
    main()
