"use server";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = {
      handle: body.handle,
      title: body.title,
      description: body.description,
      price_amount: body.price_amount,
      price_currency: body.price_currency,
      min_price_amount: body.price_amount,
      max_price_amount: body.price_amount,
      featured_image: body.featured_image || null, // optional jsonb
      images: body.images || [],
      options: body.options || [],
      variants: body.variants || [],
      collections: body.collections || [],
      inventory_status: body.inventory_status,
      inventory_quantity: body.inventory_quantity,
      status: "active",
      created_at: new Date(),
      updated_at: new Date()
    };

    const { error } = await supabase.from("products").insert(product);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Create Product Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
