#!/bin/bash

INSFORGE_URL="https://w6pfebj5.ap-southeast.insforge.app"
INSFORGE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDc3NTN9.0fXDdWm5dSQ7Ksk3kh86QmT8kCiorXuL8UjcdIxtRok"

migrations=(
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS middle_name TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS extension_name TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS birth_place TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS age INTEGER"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Filipino'"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS client_type TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS qualification_type TEXT DEFAULT 'Full Qualification'"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS is_ip BOOLEAN DEFAULT FALSE"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS indigenous_group TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS telephone TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS mobile_number TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS barangay TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS district TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Region X — Northern Mindanao'"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS zip_code TEXT DEFAULT '9014'"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS year_graduated TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS employment_type TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS company_name TEXT"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'New Enrollee'"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT FALSE"
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS document_status TEXT DEFAULT 'missing'"
)

for i in "${!migrations[@]}"; do
  sql="${migrations[$i]}"
  echo "[$((i+1))/${#migrations[@]}] Executing: $sql"
  
  response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    "$INSFORGE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $INSFORGE_ANON_KEY" \
    -H "Authorization: Bearer $INSFORGE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"$sql\"}")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 204 ]; then
    echo "  ✅ Success"
  else
    echo "  ❌ Error: HTTP $http_code"
    echo "  Response: $body"
  fi
done

echo "Migration complete!"
