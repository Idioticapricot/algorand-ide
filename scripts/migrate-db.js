const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
});

async function runMigration() {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running database migration...');
    console.log('\n⚠️  Please run the following SQL in your Supabase SQL Editor:');
    console.log('   Dashboard → SQL Editor → New Query\n');
    console.log('─'.repeat(80));
    console.log(schema);
    console.log('─'.repeat(80));
    console.log('\n✅ Copy the SQL above and execute it in Supabase SQL Editor');
    console.log(`   URL: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

runMigration();
