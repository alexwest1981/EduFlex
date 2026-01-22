"""
Find files using colors.X in StyleSheet.create OUTSIDE component functions
This is the problem - StyleSheet defined at module level
"""

import os
import re

src_dir = r"e:\Projekt\EduFlex\mobile\src"

print("\n" + "="*70)
print("FINDING StyleSheet.create WITH colors AT MODULE LEVEL")
print("="*70 + "\n")

for root, dirs, files in os.walk(src_dir):
    if 'node_modules' in root:
        continue
        
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Look for StyleSheet.create at module level (not inside function)
                # Pattern: const styles = StyleSheet.create({ ... colors.X ... })
                # But NOT inside a function
                
                lines = content.split('\n')
                in_function = False
                function_depth = 0
                
                for i, line in enumerate(lines, 1):
                    # Track function depth
                    if re.search(r'(const|function)\s+\w+\s*=\s*\(.*\)\s*=>\s*{', line) or \
                       re.search(r'function\s+\w+\s*\(', line):
                        in_function = True
                        function_depth = 0
                    
                    # Count braces
                    function_depth += line.count('{') - line.count('}')
                    
                    if function_depth <= 0:
                        in_function = False
                    
                    # Check for StyleSheet.create with colors outside function
                    if 'StyleSheet.create' in line and not in_function:
                        # Check next 50 lines for colors.X
                        snippet = '\n'.join(lines[i:min(i+50, len(lines))])
                        if re.search(r'colors\.\w+', snippet):
                            rel_path = os.path.relpath(filepath, src_dir)
                            print(f"❌ {rel_path}:{i} - StyleSheet.create at MODULE LEVEL uses colors")
                            print(f"   Line: {line.strip()[:60]}")
                            break
                            
            except Exception as e:
                pass

print("\n" + "="*70)
