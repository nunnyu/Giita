import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "";

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Authenticate as admin user on startup so RLS policies can check auth.uid()
async function authenticateAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUserId = process.env.ADMIN_USER_ID;

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (error) {
    console.error("Failed to authenticate admin:", error.message);
    console.error("Use a user account from Supabase Auth (Dashboard -> Authentication -> Users)");
    return;
  }

  const authenticatedUserId = data.user?.id;
  console.log("Admin authenticated:", authenticatedUserId);
  
  if (adminUserId && authenticatedUserId !== adminUserId) {
    console.warn(`ADMIN_USER_ID (${adminUserId}) doesn't match authenticated user ID (${authenticatedUserId})`);
  }
}

authenticateAdmin().catch((err) => {
  console.error("Error during admin authentication:", err);
});

/**
 * Sets the app.current_user_uuid session variable for the current database session
 * This function should be called before any database operations that require the user context
 * @param userId - The user UUID to set
 */
export async function setCurrentUserUuid(userId: string): Promise<void> {
  try {
    // Escape single quotes to prevent SQL injection
    const escapedUserId = userId.replace(/'/g, "''");
    
    const { error } = await supabase.rpc('set_app_user_uuid', {
      uuid_text: userId
    });

    if (error) {
      console.warn('Warning: Could not set app.current_user_uuid session variable:', error.message);
      console.warn('Make sure the database function set_app_user_uuid exists.');
    } else {
      console.log(`Set app.current_user_uuid = '${userId}'`);
    }
  } catch (err) {
    console.warn('Warning: Error setting session variable:', err);
  }
}

export default supabase;
