"""
Fix ALL color= and tintColor= syntax errors
The replacement script forgot to add {} around colors.X
"""

import re
from pathlib import Path
import os

def fix_color_syntax(filepath):
    """Fix color=colors.X and tintColor=colors.X to use {}"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix: color=colors.X to color={colors.X}
        content = re.sub(r'\scolor=colors\.(\w+)', r' color={colors.\1}', content)
        
        # Fix: tintColor=colors.X to tintColor={colors.X}
        content = re.sub(r'\stintColor=colors\.(\w+)', r' tintColor={colors.\1}', content)
        
        # Fix: backgroundColor=colors.X to backgroundColor={colors.X}
        content = re.sub(r'\sbackgroundColor=colors\.(\w+)', r' backgroundColor={colors.\1}', content)
        
        # Fix: borderColor=colors.X to borderColor={colors.X}
        content = re.sub(r'\sborderColor=colors\.(\w+)', r' borderColor={colors.\1}', content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, Path(filepath).name
        return False, None
    except Exception as e:
        return False, f"Error: {e}"

# Find all .tsx files
screens_dir = r"e:\Projekt\EduFlex\mobile\src\screens"

print("\n" + "="*70)
print("FIXING ALL COLOR SYNTAX ERRORS")
print("="*70 + "\n")

fixed = []
for root, dirs, files in os.walk(screens_dir):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            success, result = fix_color_syntax(filepath)
            if success:
                print(f"✅ Fixed {result}")
                fixed.append(result)

print("\n" + "="*70)
print(f"✅ Fixed {len(fixed)} files")
if fixed:
    for f in fixed:
        print(f"  - {f}")
print("="*70 + "\n")
