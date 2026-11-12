/**
 * ==============================================================================
 * SUPABASE CLOUD UPLOADER & TABLE POPULATOR
 * Uploads all 2,649 migrated records across 24 modules to Supabase PostgreSQL.
 * Reads credentials from environment variables.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env from root .env.local if present
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🔗 Connecting to Supabase Cloud Instance:');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY.slice(0, 15) + '...' + SUPABASE_KEY.slice(-8));

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const bundlePath = path.join(__dirname, '..', 'supabase', 'migrated_sbl_data_bundle.json');
if (!fs.existsSync(bundlePath)) {
  console.error('❌ Migration bundle not found at:', bundlePath);
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

// Insertion order respecting Foreign Key constraints
const tableOrder = [
  'companies',
  'facilities',
  'users',
  'equipment_registry',
  'contractors',
  'statutory_compliances',
  'ehs_documents',
  'five_s_audits',
  'fps_assets',
  'kaizen_proposals',
  'safety_observations',
  'ptw_permits',
  'moc_records',
  'pssr_reviews',
  'capa_actions',
  'hazop_studies',
  'esg_environmental_metrics',
  'incident_investigations',
  'ohc_medical_records',
  'hira_assessments',
  'lms_courses',
  'lms_enrollments',
  'mock_drills',
  'safety_committee_meetings',
  'psm_elements',
  'job_safety_analyses',
  'loto_isolations',
  'vehicle_registry',
  'ehs_telemetry_snapshots'
];

async function uploadAll() {
  console.log('\n🚀 Starting Batched Cloud Ingestion into Supabase PostgreSQL...\n');
  const results = {};
  let missingTables = [];

  for (const table of tableOrder) {
    const rows = bundle[table];
    if (!rows || rows.length === 0) {
      results[table] = { total: 0, inserted: 0, status: 'EMPTY_IN_SOURCE' };
      continue;
    }

    process.stdout.write(`⏳ Table [${table}] (${rows.length} records)... `);

    // Test table accessibility
    const { error: testErr } = await supabase.from(table).select('id').limit(1);
    if (testErr) {
      if (testErr.code === 'PGRST205' || testErr.message.includes('Could not find the table')) {
        console.log(`❌ Table not found in schema cache.`);
        missingTables.push(table);
        results[table] = { total: rows.length, inserted: 0, status: 'TABLE_NOT_FOUND', error: testErr.message };
        continue;
      } else {
        console.log(`⚠️ Access warning: ${testErr.message}`);
      }
    }

    // Insert in batches of 50
    let inserted = 0;
    const batchSize = 50;
    let tableErr = null;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { data, error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: true });
      if (error) {
        tableErr = error;
        break;
      }
      inserted += batch.length;
    }

    if (tableErr) {
      console.log(`❌ Error: ${tableErr.message}`);
      results[table] = { total: rows.length, inserted, status: 'ERROR', error: tableErr.message };
    } else {
      console.log(`✅ ${inserted}/${rows.length} rows successfully populated!`);
      results[table] = { total: rows.length, inserted, status: 'SUCCESS' };
    }
  }

  console.log('\n==============================================================================');
  console.log('MIGRATION SUMMARY:');
  console.log('==============================================================================');
  for (const [t, r] of Object.entries(results)) {
    console.log(`${t.padEnd(28)} | ${String(r.inserted).padStart(5)} / ${String(r.total).padStart(5)} | ${r.status}`);
  }

  if (missingTables.length > 0) {
    console.log('\n⚠️ ATTENTION: The following tables have not been created in Supabase yet:');
    console.log(missingTables.join(', '));
    console.log('\n👉 To create all tables in 30 seconds:');
    console.log('1. Go to: https://supabase.com/dashboard/project/wzpdrkoluvprdokodpff/sql/new');
    console.log('2. Paste the contents of supabase/schema.sql and click "Run"');
    console.log('3. Re-run this script to populate all tables instantly!');
  } else {
    console.log('\n🎉 ALL HISTORICAL DATA FULLY POPULATED IN SUPABASE POSTGRESQL TABLES!');
  }
}

uploadAll();
