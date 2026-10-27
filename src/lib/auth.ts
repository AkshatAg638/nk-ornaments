/**
 * Server-Side Authentication & Authorization Helpers
 *
 * Dispatches between mock mode (for local UI-first development) and Supabase mode.
 */

import { isMockMode } from "@/lib/data/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const MOCK_ADMIN_USER: User = {
  id: "mock-admin-id",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  confirmation_sent_at: "",
  recovery_sent_at: "",
  email_change_sent_at: "",
  new_email: "",
  invited_at: "",
  action_link: "",
  email: "admin@nkornaments.com",
  phone: "+919837012345",
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: "",
  last_sign_in_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
  identities: [],
  is_anonymous: false,
};

export async function getCurrentUser(): Promise<User | null> {
  if (isMockMode()) {
    return MOCK_ADMIN_USER;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  if (isMockMode()) {
    return true;
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

export async function verifyAdmin(): Promise<{
  isAdmin: boolean;
  user: User | null;
}> {
  if (isMockMode()) {
    return { isAdmin: true, user: MOCK_ADMIN_USER };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { isAdmin: false, user: null };
  }

  const isAdmin = await isUserAdmin(user.id);
  return { isAdmin, user };
}

export async function requireAdmin(returnUrl: string = "/admin"): Promise<User> {
  if (isMockMode()) {
    return MOCK_ADMIN_USER;
  }

  const { isAdmin, user } = await verifyAdmin();

  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(returnUrl)}`);
  }

  if (!isAdmin) {
    redirect("/admin/login?error=unauthorized");
  }

  return user;
}

export async function hasAnyAdmin(): Promise<boolean> {
  if (isMockMode()) {
    return true;
  }

  try {
    const adminClient = createAdminClient();
    const { count, error } = await adminClient
      .from("admins")
      .select("user_id", { count: "exact", head: true });

    if (error) {
      console.error("Error checking existing admins:", error);
      return false;
    }

    return (count ?? 0) > 0;
  } catch (err) {
    console.error("Failed to query admins table:", err);
    return false;
  }
}
