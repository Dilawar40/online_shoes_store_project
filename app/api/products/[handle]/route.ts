import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Revalidate this route every 2 minutes (ISR)
export const revalidate = 120;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET product by handle (dynamic route)
export async function GET(
  _req: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = await params;

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("handle", handle)
      .single(); // Returns a single row

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Get Product by Handle Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
