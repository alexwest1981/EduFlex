"""
Find ALL files in src that use colors but don't have useThemedStyles
"""

import os
import re

src_dir = r"e:\Projekt\EduFlex\mobile\src"

print("\n" + "="*70)
print("FINDING ALL FILES WITH MISSING useThemedStyles")
print("="*70 + "\n")

issues = []

for root, dirs, files in os.walk(src_dir):
    # Skip node_modules
    if 'node_modules' in root:
        continue
        
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if file uses colors.X in StyleSheet or JSX
                uses_colors = bool(re.search(r'colors\.\w+', content))
                
                # Check if file has useThemedStyles
                has_hook = 'useThemedStyles' in content
                
                # Check if file has old pattern
                has_old_pattern = 'useTheme' in content and 'getThemeColors' in content
                
                if uses_colors and not has_hook:
                    rel_path = os.path.relpath(filepath, src_dir)
                    issues.append((rel_path, has_old_pattern))
                    if has_old_pattern:
                        print(f"❌ {rel_path} - Uses OLD pattern (useTheme + getThemeColors)")
                    else:
                        print(f"⚠️  {rel_path} - Uses colors but NO hook at all")
            except:
                pass

print("\n" + "="*70)
print(f"Found {len(issues)} files with issues")
print("="*70 + "\n")
