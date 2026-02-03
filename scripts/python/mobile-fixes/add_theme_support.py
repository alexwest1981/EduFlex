"""
Automatic Theme Support Injector for React Native Screens
Adds theme imports and applies theme colors to all mobile screens
"""

import os
import re
from pathlib import Path

# Base path to mobile screens
SCREENS_DIR = r"e:\\Projekt\\EduFlex\\mobile\\src\\screens"

# Theme imports to add
THEME_IMPORTS = """import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeStyles';"""

# Hook usage to add in component
THEME_HOOKS = "    const { currentTheme } = useTheme();
    const colors = getThemeColors(currentTheme);"

def has_theme_support(content):
    """Check if file already has theme support"""
    return 'useTheme' in content

def add_theme_imports(content):
    """Add theme imports after other imports"""
    # Find last import statement
    import_pattern = r"(import .+ from .+;)\n"
    imports = list(re.finditer(import_pattern, content))
    
    if not imports:
        return content
    
    last_import = imports[-1]
    insert_pos = last_import.end()
    
    return content[:insert_pos] + "\n" + THEME_IMPORTS + "\n" + content[insert_pos:]

def add_theme_hooks(content):
    """Add theme hooks in component function"""
    # Find component function start
    component_pattern = r"(const \w+Screen: React\.FC.*?= \(\)=> \{{)\n"
    match = re.search(component_pattern, content)
    
    if not match:
        return content
    
    insert_pos = match.end()
    return content[:insert_pos] + THEME_HOOKS + "\n" + content[insert_pos:]

def replace_hardcoded_colors(content):
    """Replace common hardcoded colors with theme colors"""
    replacements = {
        # Backgrounds
        r"backgroundColor:\s*['"]#F9FAFB['"]": "backgroundColor: colors.background",
        r"backgroundColor:\s*['"]#FFFFFF['"]": "backgroundColor: colors.card",
        r"backgroundColor:\s*['"]#111827['"]": "backgroundColor: colors.background",
        
        # Text colors
        r"color:\s*['"]#1F2937['"]": "color: colors.text",
        r"color:\s*['"]#111827['"]": "color: colors.text",
        r"color:\s*['"]#6B7280['"]": "color: colors.textSecondary",
        r"color:\s*['"]#9CA3AF['"]": "color: colors.textSecondary",
        
        # Primary colors
        r"color:\s*['"]#4F46E5['"]": "color: colors.primary",
        r"backgroundColor:\s*['"]#4F46E5['"]": "backgroundColor: colors.primary",
        
        # Borders
        r"borderColor:\s*['"]#E5E7EB['"]": "borderColor: colors.border",
        r"borderColor:\s*['"]#D1D5DB['"]": "borderColor: colors.border",
    }
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
    
    return content

def process_screen_file(filepath):
    """Process a single screen file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has theme support
        if has_theme_support(content):
            print(f"✓ Skipped (already has theme): {filepath.name}")
            return False
        
        # Add theme imports
        content = add_theme_imports(content)
        
        # Add theme hooks
        content = add_theme_hooks(content)
        
        # Replace hardcoded colors
        content = replace_hardcoded_colors(content)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Updated: {filepath.name}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {filepath.name}: {e}")
        return False

def main():
    """Main function to process all screen files"""
    screens_path = Path(SCREENS_DIR)
    
    if not screens_path.exists():
        print(f"Error: Screens directory not found: {SCREENS_DIR}")
        return
    
    # Find all .tsx files
    screen_files = list(screens_path.rglob("*Screen.tsx"))
    
    print(f"\nFound {len(screen_files)} screen files\n")
    print("=" * 60)
    
    updated_count = 0
    skipped_count = 0
    
    for filepath in sorted(screen_files):
        if process_screen_file(filepath):
            updated_count += 1
        else:
            skipped_count += 1
    
    print("=" * 60)
    print(f"\n✅ Updated: {updated_count} files")
    print(f"✓ Skipped: {skipped_count} files")
    print(f"📊 Total: {len(screen_files)} files\n")

if __name__ == "__main__":
    main()
