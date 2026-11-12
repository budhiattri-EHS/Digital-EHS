const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  });
}

const client = new Client({
  host: process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
  user: process.env.SUPABASE_DB_USER || 'postgres.wzpdrkoluvprdokodpff',
  password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');

  console.log('1. Altering ptw_permits table to add columns...');
  await client.query(`
    ALTER TABLE public.ptw_permits
      ADD COLUMN IF NOT EXISTS requestor_name TEXT,
      ADD COLUMN IF NOT EXISTS vendor_name TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
      ADD COLUMN IF NOT EXISTS contractor_induction_date TEXT,
      ADD COLUMN IF NOT EXISTS contractor_esi_id TEXT,
      ADD COLUMN IF NOT EXISTS workers_names TEXT,
      ADD COLUMN IF NOT EXISTS induction_numbers TEXT,
      ADD COLUMN IF NOT EXISTS first_aider_name TEXT,
      ADD COLUMN IF NOT EXISTS ert_member_name TEXT,
      ADD COLUMN IF NOT EXISTS fire_watch_name TEXT,
      ADD COLUMN IF NOT EXISTS assembly_point TEXT,
      ADD COLUMN IF NOT EXISTS executing_supervisor TEXT,
      ADD COLUMN IF NOT EXISTS beneficiary_supervisor TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_role TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_name TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_email TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_status TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_timestamp TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_comments TEXT,
      ADD COLUMN IF NOT EXISTS approver_1_token TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_role TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_name TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_email TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_status TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_timestamp TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_comments TEXT,
      ADD COLUMN IF NOT EXISTS approver_2_token TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_role TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_name TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_email TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_status TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_timestamp TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_comments TEXT,
      ADD COLUMN IF NOT EXISTS approver_3_token TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_role TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_name TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_email TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_status TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_timestamp TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_comments TEXT,
      ADD COLUMN IF NOT EXISTS approver_4_token TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_role TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_name TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_email TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_status TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_timestamp TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_comments TEXT,
      ADD COLUMN IF NOT EXISTS approver_5_token TEXT,
      ADD COLUMN IF NOT EXISTS final_closure_time TEXT,
      ADD COLUMN IF NOT EXISTS final_closure_comments TEXT,
      ADD COLUMN IF NOT EXISTS loto_details JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS ppe_issued JSONB DEFAULT '[]'::jsonb;
  `);
  console.log('Columns added successfully.');

  console.log('2. Dropping restrictive check constraints and relaxing NOT NULLs...');
  await client.query(`
    ALTER TABLE public.ptw_permits DROP CONSTRAINT IF EXISTS ptw_permits_permit_type_check;
    ALTER TABLE public.ptw_permits DROP CONSTRAINT IF EXISTS ptw_permits_status_check;
    ALTER TABLE public.ptw_permits DROP CONSTRAINT IF EXISTS ptw_permits_risk_level_check;
    ALTER TABLE public.ptw_permits ALTER COLUMN valid_from DROP NOT NULL;
    ALTER TABLE public.ptw_permits ALTER COLUMN valid_to DROP NOT NULL;
    ALTER TABLE public.ptw_permits ALTER COLUMN title DROP NOT NULL;
    ALTER TABLE public.ptw_permits ALTER COLUMN location DROP NOT NULL;
  `);
  console.log('Constraints updated successfully.');

  console.log('3. Reloading PostgREST schema cache...');
  await client.query(`NOTIFY pgrst, 'reload schema';`);
  console.log('Schema cache notification sent.');

  await client.end();
  console.log('Migration completed successfully!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
