// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all products count
export async function getProductsCount() {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  return { count: count || 0, error };
}

// Fetch all categories count
export async function getCategoriesCount() {
  const { count, error } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true });
  
  return { count: count || 0, error };
}