import { NextResponse } from "next/server";
import { z } from "zod";
import { isMockMode } from "@/lib/data/config";
import { mockDataService } from "@/lib/data/mock";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  contact_person: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  whatsapp: z.string().optional(),
  gst_number: z.string().optional(),
  address_line: z.string().min(5, "Shop/Office address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid 6-digit pincode is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    if (isMockMode()) {
      // In mock mode, create customer in mock store and set role cookie to 'customer'
      const newCustomer = await mockDataService.createCustomer({
        business_name: data.business_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        gst_number: data.gst_number || null,
        address_line: data.address_line,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        is_disabled: false,
      });

      const cookieStore = await cookies();
      cookieStore.set("nk_mock_role", "customer", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        customer: newCustomer,
        message: "Wholesale account registered successfully!",
      });
    }

    // In Supabase mode:
    const admin = createAdminClient();

    // 1. Create auth user with confirmed email
    const { data: authUser, error: authError } =
      await admin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          business_name: data.business_name,
          contact_person: data.contact_person,
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: "Failed to create user in authentication provider." },
        { status: 500 }
      );
    }

    // 2. Insert into public.customers table
    const { data: customerRow, error: customerError } = await admin
      .from("customers")
      .insert({
        id: authUser.user.id,
        business_name: data.business_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        gst_number: data.gst_number || null,
        address_line: data.address_line,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        is_disabled: false,
      })
      .select()
      .single();

    if (customerError) {
      console.error("Failed to insert customer record:", customerError);
      // Clean up created auth user if profile insertion failed
      await admin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: `Database error: ${customerError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: customerRow,
      message: "Wholesale account registered successfully!",
    });
  } catch (err: unknown) {
    console.error("Registration error:", err);
    const msg = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
