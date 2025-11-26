import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function main() {
    console.log('Verifying setup...');

    // 1. Check if redemption_codes table exists and is accessible
    const testCode = `TEST-VERIFY-${Date.now()}`;
    console.log(`Attempting to insert test code: ${testCode}`);

    const { data, error } = await supabase
        .from('redemption_codes')
        .insert({
            code: testCode,
            plan_type: 'test_plan',
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Error accessing redemption_codes table:', error.message);
        console.error('Please ensure you have run the migration "supabase/migrations/20251126_dealify_redemption.sql".');
        process.exit(1);
    }

    console.log('✅ Successfully inserted test code.');
    console.log('Code ID:', data.id);

    // 2. Clean up
    const { error: deleteError } = await supabase
        .from('redemption_codes')
        .delete()
        .eq('id', data.id);

    if (deleteError) {
        console.warn('⚠️ Warning: Could not delete test code:', deleteError.message);
    } else {
        console.log('✅ Successfully cleaned up test code.');
    }

    console.log('Setup verification complete. Database schema appears correct.');
}

main().catch(console.error);
