import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Supabase server client for non-auth read requests
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example static collections for first-time setup
const staticCollections = [
    { sort_order: 1, handle: "kitchen-essentials", title: "Kitchen Essentials", description: "Cookware, utensils, and appliances to make your cooking easier" },
    { sort_order: 2, handle: "home-decor", title: "Home Decor", description: "Stylish decor items to enhance your living space" },
    { sort_order: 3, handle: "smart-home", title: "Smart Home", description: "Smart devices and gadgets for modern living" },
    { sort_order: 4, handle: "outdoor-furniture", title: "Outdoor Furniture", description: "Durable and weather-resistant furniture for your garden or balcony" },
    { sort_order: 5, handle: "lighting", title: "Lighting", description: "Ceiling lights, lamps, and LED solutions for every room" },
    { sort_order: 6, handle: "storage-solutions", title: "Storage Solutions", description: "Organizers, shelves, and storage boxes to keep your home tidy" },
  ];
  

// GET all collections
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Seed collections if table is empty
    if (!data || data.length === 0) {
      const { error: seedError } = await supabase.from("collections").insert(staticCollections);
      if (seedError) throw seedError;
      return NextResponse.json(staticCollections, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET Collections Error:", err);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

// POST (Admin only) - Add new collection
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const newCollection = await request.json();

    const { data, error } = await supabase
      .from("collections")
      .insert(newCollection)
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST Collections Error:", err);
    return NextResponse.json({ error: err.message || "Failed to add collection" }, { status: 500 });
  }
}

// PUT (Admin only) - Update a collection
export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updatedCollection = await request.json();
    if (!updatedCollection.id) return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("collections")
      .update({
        sort_order: updatedCollection.sort_order,
        handle: updatedCollection.handle,
        title: updatedCollection.title,
        description: updatedCollection.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updatedCollection.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    return NextResponse.json({ success: true, collection: data[0] }, { status: 200 });
  } catch (err) {
    console.error("PUT Collections Error:", err);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

// DELETE (Admin only)
export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Collection deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE Collections Error:", err);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
