"""
Fix all tintColor=colors.primary syntax errors
The color replacement script forgot to add {} around the value
"""

import re
from pathlib import Path

def fix_tint_color_syntax(filepath):
    """Fix tintColor=colors.X to tintColor={colors.X}"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix: tintColor=colors.primary to tintColor={colors.primary}
        content = re.sub(r'tintColor=colors\.(\w+)', r'tintColor={colors.\1}', content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

# Find all .tsx files
import os
screens_dir = r"e:\Projekt\EduFlex\mobile\src\screens"

fixed = 0
for root, dirs, files in os.walk(screens_dir):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            if fix_tint_color_syntax(filepath):
                print(f"✅ Fixed {file}")
                fixed += 1

print(f"\n✅ Fixed {fixed} files")
