/**
 * Data Mode Configuration
 *
 * Checks whether the application is running in 'mock' mode or 'supabase' mode.
 */

export function isMockMode(): boolean {
  // Check explicit environment variables
  const dataMode = process.env.DATA_MODE || process.env.NEXT_PUBLIC_DATA_MODE;
  if (dataMode === "mock") return true;
  if (dataMode === "supabase") return false;

  // Fallback: If Supabase URL or anon key is missing or placeholder, default to mock
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-ref")) {
    return true;
  }

  return true; // Default to mock during UI-first development
}
