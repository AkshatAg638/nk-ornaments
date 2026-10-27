/**
 * One-Time Admin Setup API Endpoint
 *
 * Permanently locks itself as soon as the first admin account is registered.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasAnyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const setupSchema = z
  .object({
    email: z.string().email("Please provide a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Za-z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    // 1. Rate limiting (max 5 attempts per minute)
    const ip = getClientIp(request.headers);
    const rateCheck = checkRateLimit(`setup:${ip}`, 5, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again in ${rateCheck.resetSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Security Check: Has an admin already been created?
    const alreadySetup = await hasAnyAdmin();
    if (alreadySetup) {
      return NextResponse.json(
        {
          error:
            "Setup is permanently locked. An administrator account has already been registered.",
        },
        { status: 403 }
      );
    }

    // 3. Validate request payload with Zod
    const body = await request.json();
    const parseResult = setupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid input data." },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const adminClient = createAdminClient();

    // 4. Create admin user in Supabase Auth (auto-confirmed)
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: `Authentication error: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user in authentication provider." },
        { status: 500 }
      );
    }

    // 5. Add user to admins table
    const { error: adminTableError } = await adminClient.from("admins").insert({
      user_id: authData.user.id,
    });

    if (adminTableError) {
      console.error("Failed to insert into admins table:", adminTableError);
      return NextResponse.json(
        {
          error:
            "Failed to assign admin permissions. Please check database configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Administrator account created successfully. Setup is now permanently locked.",
    });
  } catch (err) {
    console.error("Setup API exception:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
