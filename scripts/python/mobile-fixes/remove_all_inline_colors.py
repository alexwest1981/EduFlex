"""
Remove ALL remaining inline color overrides from AdminDashboardScreen
"""

import re

filepath = r"e:\\Projekt\\EduFlex\\mobile\\src\\screens\\dashboard\\AdminDashboardScreen.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: [styles.X, { color: '#...' }] -> styles.X
content = re.sub(r'\\[styles\\.(\\w+), \\{ color: \\''#[0-9A-F]{6}\\u0027 \\}\\]', r'styles.\\1', content)

# Pattern 2: [styles.X, { backgroundColor: '#...' }] -> styles.X
content = re.sub(r'\\[styles\\.(\\w+), \\{ backgroundColor: \\''#[0-9A-F]{6}\\u0027 \\}\\]', r'styles.\\1', content)

# Pattern 3: [styles.X, { backgroundColor: '#...', color: '#...' }] -> styles.X
content = re.sub(r'\\[styles\\.(\\w+), \\{ backgroundColor: \\''#[0-9A-F]{6}\\u0027, color: \\''#[0-9A-F]{6}\\u0027 \\}\\]', r'styles.\\1', content)

# Pattern 4: [styles.X, { backgroundColor: '#...', borderColor: '#...' }] -> styles.X
content = re.sub(r'\\[styles\\.(\\w+), \\{ backgroundColor: \\''#[0-9A-F]{6}\\u0027, borderColor: \\''#[0-9A-F]{6}\\u0027 \\}\\]', r'styles.\\1', content)

# Pattern 5: [styles.X, { borderColor: '#...' }] -> styles.X
content = re.sub(r'\\[styles\\.(\\w+), \\{ borderColor: \\''#[0-9A-F]{6}\\u0027 \\}\\]', r'styles.\\1', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Removed all inline color overrides from AdminDashboardScreen")
