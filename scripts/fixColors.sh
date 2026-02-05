#!/bin/bash

# Script to replace hardcoded colors with SCSS variables

# MyNotes color (yellow) - już naprawione powyżej

# Checklists - green
find src/components/Checklists -name "*.scss" -exec sed -i '' \
  -e 's/#fdd03b/\$category-checklists/g' \
  -e 's/rgba(253, 208, 59, 0\.\([0-9]*\))/rgba(\$category-checklists-rgb, 0.\1)/g' \
  {} \;

# Events - teal/cyan
find src/components/Events -name "*.scss" -exec sed -i '' \
  -e 's/#4a9396/\$category-events/g' \
  -e 's/rgba(74, 147, 150, 0\.\([0-9]*\))/rgba(\$category-events-rgb, 0.\1)/g' \
  {} \;

echo "Color replacement complete!"
