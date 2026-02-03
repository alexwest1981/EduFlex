"""
Fix CourseDetailScreen - move massive StyleSheet out of if-block
"""

import re

filepath = r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\courses\\CourseDetailScreen.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the if (isLoading) block
if_start = content.find('  if (isLoading) {')
if_end = content.find('  }', if_start + 100)  # Find closing brace

# Extract the StyleSheet from inside if-block
stylesheet_start = content.find('const styles = StyleSheet.create({', if_start)
stylesheet_end = content.find('});', stylesheet_start) + 3

# Get the StyleSheet content
stylesheet = content[stylesheet_start:stylesheet_end]

# Remove StyleSheet from if-block
new_if_block = '''  if (isLoading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }'''

# Replace old if-block (including StyleSheet) with new one
old_if_block_end = content.find('  }', stylesheet_end)
content = content[:if_start] + new_if_block + content[old_if_block_end+3:]

# Add useThemedStyles hook after useAuth
hook_insert = content.find('const { courseId } = route.params;')
content = content[:hook_insert] + '  const { colors, styles: themedStyles } = useThemedStyles();\n  ' + content[hook_insert:]

# Add StyleSheet before if (isLoading), after handleRefresh
insert_pos = content.find('  if (isLoading) {')
# Replace hardcoded colors in stylesheet with colors.X
stylesheet = stylesheet.replace("'#F9FAFB'", 'colors.background')
stylesheet = stylesheet.replace("'#FFFFFF'", 'colors.card')
stylesheet = stylesheet.replace("'#111827'", 'colors.text')
stylesheet = stylesheet.replace("'#6B7280'", 'colors.textSecondary')
stylesheet = stylesheet.replace("'#4F46E5'", 'colors.primary')
stylesheet = stylesheet.replace("'#E5E7EB'", 'colors.border')

content = content[:insert_pos] + '\n  ' + stylesheet + '\n\n' + content[insert_pos:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed CourseDetailScreen")
