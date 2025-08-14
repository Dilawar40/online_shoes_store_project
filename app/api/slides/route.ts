// app/api/slides/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static slide data for initial setup
const staticSlides = [
  {
    title: "Summer Collection 2025",
    description: "Discover our latest summer collection with up to 50% off",
    cta_text: "Shop Now",
    cta_link: "/collections/summer-2024",
    image_url: "/images/hero/summer-collection.jpg",
    alt_text: "Summer Collection 2025"
  }
];

export async function GET() {
  try {
    // For GET requests, we'll just return all slides (no upsert)
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch slides" },
        { status: 500 }
      );
    }

    // If no slides exist, you might want to insert the static ones
    if (data.length === 0) {
      await supabase.from('slides').upsert(staticSlides, { onConflict: 'id' });
      return NextResponse.json(staticSlides, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch slides" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // For authenticated routes, use the route handler client
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newSlide = await request.json();
    
    // Generate a unique ID if not provided
    if (!newSlide.id) {
      newSlide.id = crypto.randomUUID();
    }

    const { data, error } = await supabase
      .from('slides')
      .insert({
        ...newSlide,
        user_id: session.user.id
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to add slide" },
      { status: 500 }
    );
  }
}


export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedSlide = await request.json();

    if (!updatedSlide.id) {
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("slides")
      .update({
        title: updatedSlide.title,
        description: updatedSlide.description,
        cta_text: updatedSlide.cta_text,
        cta_link: updatedSlide.cta_link,
        image_url: updatedSlide.image_url,
        alt_text: updatedSlide.alt_text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updatedSlide.id)
      .eq("user_id", session.user.id)
      .select();

    if (error) {
      console.error("Update Error:", error);
      return NextResponse.json({ error: "Failed to update slide" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, slide: data[0] }, { status: 200 });

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  // ✅ Get cookies properly so Supabase can read session
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // ✅ Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // ✅ Parse the request body
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 });
    }

    // ✅ Delete only if slide belongs to the logged-in user
    const { data, error: deleteError } = await supabase
      .from('slides')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select();

    if (deleteError) {
      console.error("Delete Error:", deleteError);
      return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Slide deleted" }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
