-- Allow authenticated users to insert new hero slides
CREATE POLICY "Enable insert for authenticated users only" 
ON public.hero_slides 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update existing hero slides
CREATE POLICY "Enable update for authenticated users only" 
ON public.hero_slides 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to delete hero slides
CREATE POLICY "Enable delete for authenticated users only" 
ON public.hero_slides 
FOR DELETE 
TO authenticated 
USING (true);

-- Make sure the existing select policy is correct
DROP POLICY IF EXISTS "Hero slides are viewable by everyone" ON public.hero_slides;

CREATE POLICY "Hero slides are viewable by everyone" 
ON public.hero_slides 
FOR SELECT 
TO public 
USING (true);
