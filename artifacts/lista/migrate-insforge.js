import { createClient } from "@insforge/sdk";

const INSFORGE_URL = "https://w6pfebj5.ap-southeast.insforge.app";
const INSFORGE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDc3NTN9.0fXDdWm5dSQ7Ksk3kh86QmT8kCiorXuL8UjcdIxtRok";

const client = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY
});

// Use the HTTP client to make direct API calls
const httpClient = client.getHttpClient();

const migrations = [
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS middle_name TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS extension_name TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS birth_place TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS age INTEGER",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Filipino'",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS client_type TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS qualification_type TEXT DEFAULT 'Full Qualification'",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS is_ip BOOLEAN DEFAULT FALSE",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS indigenous_group TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS telephone TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS mobile_number TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS barangay TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS district TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Region X — Northern Mindanao'",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS zip_code TEXT DEFAULT '9014'",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS year_graduated TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS employment_type TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS company_name TEXT",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'New Enrollee'",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT FALSE",
  "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS document_status TEXT DEFAULT 'missing'",
  
  // Database Indexing for Massive Data
  "CREATE INDEX IF NOT EXISTS idx_enrollments_course_slug ON enrollments(course_slug)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON enrollments(created_at)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_last_name ON enrollments(last_name)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_first_name ON enrollments(first_name)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_trainee_email ON enrollments(trainee_email)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_document_status ON enrollments(document_status)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON enrollments(course_slug, status)"
];

async function runMigrations() {
  console.log("Starting INSFORGE database migration...");
  console.log("HTTP Client type:", typeof httpClient);
  console.log("HTTP Client methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(httpClient)).filter(m => typeof httpClient[m] === 'function'));
  
  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    console.log(`[${i + 1}/${migrations.length}] Executing: ${sql}`);
    
    try {
      // Try to execute SQL via HTTP
      const response = await httpClient.post('/rest/v1/rpc/exec_sql', { sql }, {
        headers: {
          'apikey': INSFORGE_ANON_KEY,
          'Authorization': `Bearer ${INSFORGE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      });
      
      console.log(`  ✅ Success:`, response.status);
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
      if (err.response) {
        console.error(`  Response:`, err.response.data);
      }
    }
  }
  
  console.log("\nMigration complete!");
}

runMigrations();
