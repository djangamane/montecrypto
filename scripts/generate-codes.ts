import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DEALIFY-${result}`;
};

async function main() {
    console.log('Generating 500 unique redemption codes...');

    const codes = new Set<string>();
    while (codes.size < 500) {
        codes.add(generateCode());
    }

    const codeArray = Array.from(codes).map(code => ({
        code,
        plan_type: 'lifetime_deal',
    }));

    console.log(`Prepared ${codeArray.length} codes. Inserting into database...`);

    const { error } = await supabase
        .from('redemption_codes')
        .insert(codeArray);

    if (error) {
        console.error('Error inserting codes:', error);
        process.exit(1);
    }

    console.log('Successfully inserted 500 codes.');

    // Log codes to a file for easy copying
    const outputPath = path.join(projectDir, 'dealify_codes.csv');
    const csvContent = 'code\n' + codeArray.map(c => c.code).join('\n');
    fs.writeFileSync(outputPath, csvContent);

    console.log(`Codes exported to ${outputPath}`);
}

main().catch(console.error);
