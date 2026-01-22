"""
PROPER FIX: Move StyleSheet inside component functions
This ensures StyleSheet can access the 'colors' variable from useTheme hook
"""

import os
import re
from pathlib import Path

SCREENS_DIR = r"e:\Projekt\EduFlex\mobile\src\screens"

def move_stylesheet_inside_component(filepath):
    """Move StyleSheet.create inside component function"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find component function
        component_pattern = r'(const (\w+Screen): React\.FC.*?= \(\) => \{)'
        component_match = re.search(component_pattern, content)
        
        if not component_match:
            return False, "No component function found"
        
        component_name = component_match.group(2)
        component_start = component_match.end()
        
        # Find StyleSheet.create block
        stylesheet_pattern = r'\n(const styles = StyleSheet\.create\(\{.*?\}\);)\n'
        stylesheet_match = re.search(stylesheet_pattern, content, re.DOTALL)
        
        if not stylesheet_match:
            return False, "No StyleSheet found"
        
        stylesheet_code = stylesheet_match.group(1)
        
        # Check if StyleSheet is already inside component
        if stylesheet_match.start() > component_start and stylesheet_match.start() < content.find(f'export default {component_name}'):
            return False, "StyleSheet already inside component"
        
        # Check if it references colors
        if 'colors.' not in stylesheet_code:
            return False, "StyleSheet doesn't use colors"
        
        # Remove StyleSheet from current location
        content_without_stylesheet = content.replace('\n' + stylesheet_code + '\n', '\n')
        
        # Find where to insert (after hooks, before return statement)
        # Look for the return statement
        return_pattern = r'(\n  return \()'
        return_match = re.search(return_pattern, content_without_stylesheet[component_start:])
        
        if not return_match:
            return False, "No return statement found"
        
        insert_pos = component_start + return_match.start()
        
        # Insert StyleSheet before return
        indented_stylesheet = '  ' + stylesheet_code.replace('\n', '\n  ')
        new_content = (
            content_without_stylesheet[:insert_pos] +
            '\n' + indented_stylesheet + '\n' +
            content_without_stylesheet[insert_pos:]
        )
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Success"
        
    except Exception as e:
        return False, str(e)

def main():
    screens_path = Path(SCREENS_DIR)
    
    # List of problematic files from our scan
    problematic_files = [
        'admin/ServerSettingsScreen.tsx',
        'calendar/CalendarScreen.tsx',
        'dashboard/MentorDashboardScreen.tsx',
        'dashboard/NotificationsScreen.tsx',
        'dashboard/PrincipalDashboardScreen.tsx',
        'dashboard/TeacherDashboardScreen.tsx',
        'mentor/BookMeetingScreen.tsx',
        'mentor/StudentAnalysisScreen.tsx',
        'mentor/StudentListScreen.tsx',
        'messages/InboxScreen.tsx',
        'messages/MessagesScreen.tsx',
        'principal/CourseStatisticsScreen.tsx',
        'principal/FullReportScreen.tsx',
        'principal/StaffListScreen.tsx',
        'principal/TeacherOverviewScreen.tsx',
        'profile/AchievementsScreen.tsx',
        'profile/SettingsScreen.tsx',
        'teacher/AttendanceScreen.tsx',
        'teacher/CourseApplicationsScreen.tsx',
        'teacher/CreateCourseScreen.tsx',
        'teacher/StatisticsScreen.tsx',
    ]
    
    print(f"\nMoving StyleSheet inside components for {len(problematic_files)} files...\n")
    print("=" * 70)
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for file_path in problematic_files:
        full_path = screens_path / file_path
        if not full_path.exists():
            print(f"⚠️  Not found: {file_path}")
            continue
        
        success, message = move_stylesheet_inside_component(full_path)
        
        if success:
            print(f"✅ {full_path.name}")
            success_count += 1
        elif "already inside" in message or "doesn't use colors" in message:
            print(f"⏭️  {full_path.name} - {message}")
            skip_count += 1
        else:
            print(f"❌ {full_path.name} - {message}")
            error_count += 1
    
    print("=" * 70)
    print(f"\n✅ Moved: {success_count}")
    print(f"⏭️  Skipped: {skip_count}")
    print(f"❌ Errors: {error_count}")
    print(f"\nStyleSheet now has access to colors variable!\n")

if __name__ == "__main__":
    main()
