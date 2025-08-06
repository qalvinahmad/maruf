#!/bin/bash

# Script to update all teacher dashboard pages to use HeaderTeacher component

echo "🔧 Updating teacher dashboard pages to use HeaderTeacher..."

# List of teacher dashboard files
files=(
  "pages/dashboard/teacher/DashboardActivityTeacher.jsx"
  "pages/dashboard/teacher/DashboardInformasi.jsx" 
  "pages/dashboard/teacher/DashboardSettingsTeacher.jsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Add HeaderTeacher import at the top
    sed -i '' '1i\
import HeaderTeacher from '\''../../../components/layout/HeaderTeacher'\'';
' "$file"
    
    echo "✅ Updated: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 All teacher dashboard pages updated!"
echo ""
echo "📋 Next steps:"
echo "1. Update each file manually to replace header section with <HeaderTeacher />"
echo "2. Remove handleLogout functions from individual files"
echo "3. Test logout functionality across all pages"
