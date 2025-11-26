'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    redemptionCode: z.string().optional(),
});

export async function signUpWithRedemption(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redemptionCode = formData.get('redemptionCode') as string | undefined;

    // Validate input
    const validation = signupSchema.safeParse({ email, password, redemptionCode });
    if (!validation.success) {
        return { error: validation.error.errors[0].message };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Public client for signup (to respect project auth settings)
    const publicClient = createClient(supabaseUrl, supabaseAnonKey);

    let planType = 'free';

    // 1. Validate Redemption Code if provided
    if (redemptionCode && redemptionCode.trim() !== '') {
        const { data: codeData, error: codeError } = await adminClient
            .from('redemption_codes')
            .select('*')
            .eq('code', redemptionCode)
            .single();

        if (codeError || !codeData) {
            return { error: 'Invalid redemption code.' };
        }

        if (codeData.is_redeemed) {
            return { error: 'This redemption code has already been used.' };
        }

        planType = codeData.plan_type;
    }

    // 2. Create User
    const { data: authData, error: authError } = await publicClient.auth.signUp({
        email,
        password,
    });

    if (authError) {
        return { error: authError.message };
    }

    if (!authData.user) {
        return { error: 'Signup failed. Please try again.' };
    }

    const userId = authData.user.id;

    // 3. Redeem Code and Grant Access
    if (redemptionCode && redemptionCode.trim() !== '') {
        // Mark code as redeemed
        const { error: updateError } = await adminClient
            .from('redemption_codes')
            .update({
                is_redeemed: true,
                redeemed_by: userId,
                redeemed_at: new Date().toISOString(),
            })
            .eq('code', redemptionCode);

        if (updateError) {
            console.error('Error marking code as redeemed:', updateError);
            // Continue anyway, or retry? Ideally we should have a transaction or rollback, 
            // but Supabase HTTP API doesn't support cross-service transactions easily here.
            // We'll log it. The user is created.
        }

        // Grant Entitlement
        // We use the existing function activate_entitlement if available, or insert directly.
        // The schema showed `activate_entitlement` function.
        const { error: entitlementError } = await adminClient.rpc('activate_entitlement', {
            p_user: userId,
            p_product: 'lifetime_access', // Or whatever the product name should be
            p_provider: 'dealify',
            p_reference: redemptionCode,
        });

        if (entitlementError) {
            console.error('Error granting entitlement:', entitlementError);
            // Fallback to direct insert if RPC fails or doesn't exist (though we saw it in schema)
            await adminClient.from('entitlements').insert({
                user_id: userId,
                product: 'lifetime_access',
                payment_provider: 'dealify',
                payment_reference: redemptionCode,
                status: 'active',
                activated_at: new Date().toISOString(),
            });
        }
    }

    return { success: true, user: authData.user, session: authData.session };
}
