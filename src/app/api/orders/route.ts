import { NextResponse } from "next/server";
import { createOrder, getCurrentAuthUser, getCustomers } from "@/lib/data";
import { isMockMode } from "@/lib/data/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, note, customerId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required to place an order." },
        { status: 400 }
      );
    }

    // Determine customer ID
    let resolvedCustomerId = customerId;

    if (!resolvedCustomerId) {
      const session = await getCurrentAuthUser();
      if (session.customerProfile?.id) {
        resolvedCustomerId = session.customerProfile.id;
      }
    }

    if (!resolvedCustomerId) {
      if (isMockMode()) {
        resolvedCustomerId = "cust-1"; // Agra Silver Palace in mock mode
      } else {
        // In Supabase mode, check if any customer exists or create a guest customer account
        const customers = await getCustomers();
        if (customers.length > 0) {
          resolvedCustomerId = customers[0].id;
        } else {
          // Create an initial trade lead customer in Supabase
          const admin = createAdminClient();
          const { data: leadCustomer, error: leadError } = await admin
            .from("customers")
            .insert({
              business_name: "Direct Trade Inbound",
              contact_person: "Wholesale Buyer",
              email: `trade-${Date.now()}@nkornaments.in`,
              phone: "+919837012345",
              address_line: "Inbound Trade Order",
              city: "Agra",
              state: "Uttar Pradesh",
              pincode: "282001",
            })
            .select()
            .single();

          if (leadError) {
            console.error("Error creating guest trade customer:", leadError);
            throw new Error("Failed to assign customer to order");
          }
          resolvedCustomerId = leadCustomer.id;
        }
      }
    }

    const order = await createOrder({
      customer_id: resolvedCustomerId,
      note: note || undefined,
      items: items.map((i: { anklet_id: string; quantity: number }) => ({
        anklet_id: i.anklet_id,
        quantity: Math.max(1, Number(i.quantity) || 1),
      })),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: unknown) {
    console.error("Order API error:", err);
    const msg = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
