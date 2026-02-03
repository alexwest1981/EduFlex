"""
Find ALL files that have StyleSheet.create at module level (outside functions)
that use colors.X
"""

import os
import re

src_dir = r"e:\Projekt\EduFlex\mobile\src"

print("\n" + "="*70)
print("FINDING ALL MODULE-LEVEL StyleSheets USING colors")
print("="*70 + "\n")

found_files = []

for root, dirs, files in os.walk(src_dir):
    if 'node_modules' in root:
        continue
        
    for file in files:
        if not (file.endswith('.tsx') or file.endswith('.ts')):
            continue
            
        filepath = os.path.join(root, file)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all StyleSheet.create blocks
            pattern = r'const styles = StyleSheet\.create\(\{(.*?)\}\);'
            matches = re.finditer(pattern, content, re.DOTALL)
            
            for match in matches:
                stylesheet_content = match.group(1)
                
                # Check if this StyleSheet uses colors.X
                if re.search(r'colors\.\w+', stylesheet_content):
                    # Check if it's inside a function
                    start_pos = match.start()
                    before_stylesheet = content[:start_pos]
                    
                    # Count function definitions before this StyleSheet
                    # If it's at module level, there should be no unclosed function
                    open_braces = before_stylesheet.count('{')
                    close_braces = before_stylesheet.count('}')
                    
                    # Simple heuristic: if braces are balanced, it's at module level
                    if open_braces == close_braces:
                        rel_path = os.path.relpath(filepath, src_dir)
                        found_files.append(rel_path)
                        print(f"❌ {rel_path}")
                        print(f"   StyleSheet at module level uses colors")
                        break
                        
        except Exception as e:
            pass

print("\n" + "="*70)
print(f"Found {len(found_files)} files")
print("="*70)

if found_files:
    print("\nFiles to fix:")
    for f in found_files:
        print(f"  - {f}")
