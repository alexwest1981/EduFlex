"""
Find all files that use colors.X but don't have useThemedStyles
"""

import os
import re

screens_dir = r"e:\\Projekt\\EduFlex\\mobile\\src\\screens"

print("\n" + "="*70)
print("FINDING FILES WITH MISSING useThemedStyles")
print("="*70 + "\n")

issues = []

for root, dirs, files in os.walk(screens_dir):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if file uses colors.X
            uses_colors = bool(re.search(r'colors\.\w+', content))
            
            # Check if file has useThemedStyles
            has_hook = 'useThemedStyles' in content
            
            # Check if file has colors variable defined
            has_colors_var = bool(re.search(r'const \{ colors', content))
            
            if uses_colors and not (has_hook or has_colors_var):
                issues.append(file)
                print(f"❌ {file} - Uses colors but missing useThemedStyles")

print("\n" + "="*70)
print(f"Found {len(issues)} files with issues")
print("="*70 + "\n")

if issues:
    print("Files to fix:")
    for f in issues:
        print(f"  - {f}")
