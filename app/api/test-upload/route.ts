"use server";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase server client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role key for server uploads
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;

    const { data, error } = await supabase.storage
      .from("image-test")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (error) throw error;

    const publicUrl = supabase
      .storage
      .from("image-test")
      .getPublicUrl(fileName)
      .data.publicUrl;

    return NextResponse.json({ success: true, publicUrl, fileData: data }, { status: 201 });
  } catch (err: any) {
    console.error("Image Upload Error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
