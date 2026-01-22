# Script Descriptions

This file provides a summary of the utility scripts found in this directory.

| Path | Description |
| --- | --- |
| `python/mobile-fixes/absolute_final_fix.py` | Traverses the `mobile/src` directory and aggressively replaces all `colors.` references with hardcoded hex values as a final fix. |
| `python/mobile-fixes/add_theme_support.py` | Injects `useTheme` hooks and theme-based color variables into React Native screen components that don't have theme support yet. |
| `python/mobile-fixes/apply_theme_to_all_screens.py` | Applies a standardized theme implementation (`useThemedStyles` hook) to a specific list of screen files and removes inline color overrides. |
| `python/mobile-fixes/complete_fix_colors.py` | A script to remove all `colors.` references from StyleSheets defined outside of the main component body. |
| `python/mobile-fixes/enable_dynamic_colors.py`| Replaces hardcoded hex color values with `colors.` variables within the StyleSheets of specific components, enabling dynamic theme changes. |
| `python/mobile-fixes/final_fix_colors.py` | Removes all remaining `colors.` references from mobile screen files, replacing them with hardcoded hex values. |
| `python/mobile-fixes/final_stylesheet_fix.py` | A script that moves `StyleSheet.create()` blocks to be inside the component function body for a list of dashboard screens, ensuring themes work correctly. |
| `python/mobile-fixes/find_all_missing_hooks.py` | Scans the `mobile/src` directory to find all `.tsx` or `.ts` files that use `colors.` variables but do not import the `useThemedStyles` hook. |
| `python/mobile-fixes/find_colors_refs.py` | Scans all screen files and reports any remaining `colors.` references that are not part of a variable declaration or import. |
| `python/mobile-fixes/find_missing_hook.py` | Scans screen files for usage of `colors.` variables where the `useThemedStyles` hook is missing. |
| `python/mobile-fixes/find_module_level_stylesheet.py` | A script to identify `.tsx` files where a `StyleSheet` is defined at the module level (outside a component) and uses `colors.` variables. |
| `python/mobile-fixes/find_module_stylesheets.py` | Finds all files where `StyleSheet.create` is defined at the module level (outside a component) and uses theme `colors`. |
| `python/mobile-fixes/find_stylesheet_issues.py` | A utility script to find if a `StyleSheet` is incorrectly defined within an `if` block in a predefined list of screens. |
| `python/mobile-fixes/fix_all_color_syntax.py` | Corrects syntax errors in `.tsx` files where color properties (`color`, `tintColor`, etc.) were assigned a `colors.` variable without curly braces. |
| `python/mobile-fixes/fix_course_detail.py` | Specifically refactors the `CourseDetailScreen.tsx` to move its `StyleSheet` out of an `if (isLoading)` block to fix scope issues. |
| `python/mobile-fixes/fix_malformed_colors.py` | Fixes string errors in screen files where color names were incorrectly concatenated, like `'#111827'Secondary`. |
| `python/mobile-fixes/fix_stylesheet_position.py` | Repositions the `StyleSheet.create()` block to be before any early `return` statements in dashboard components to prevent rendering errors. |
| `python/mobile-fixes/fix_tint_color.py` | Fixes the syntax for `tintColor` props in `.tsx` files, wrapping `colors.` variables in curly braces. |
| `python/mobile-fixes/move_stylesheet_dashboards.py` | Moves the `StyleSheet.create()` block from the module scope to inside the component function for all dashboard screens. |
| `python/mobile-fixes/move_stylesheet_priority.py` | Moves the `StyleSheet.create()` block inside the component function for a list of high-priority screens. |
| `python/mobile-fixes/proper_fix_stylesheet.py` | A comprehensive script to move `StyleSheet.create()` inside the component body for a long list of problematic screens to fix theme color access. |
| `python/mobile-fixes/quick_fix_colors.py` | A script to replace `colors.` variables in StyleSheets with hardcoded fallback values, as a temporary fix for theme-related crashes. |
| `python/mobile-fixes/remove_all_inline_colors.py`| Specifically targets `AdminDashboardScreen.tsx` to remove all inline style overrides for colors, consolidating style definitions. |
| `python/mobile-fixes/replace_hardcoded_colors.py` | Replaces hardcoded hex color values in a predefined list of screens with their corresponding theme `colors.` variables. |
| `powershell/server-manager.ps1` | A PowerShell menu-driven script to manage the EduFlex backend server (start, stop, restart, and status check). |