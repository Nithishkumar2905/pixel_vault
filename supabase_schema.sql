-- ==========================================
-- PIXELVAULT SUPABASE SETUP SCRIPT
-- ==========================================
-- This script safely creates all tables required 
-- for the PixelVault application and enables 
-- appropriate Row Level Security (RLS) rules.
-- Run this directly in the Supabase SQL Editor.

-- 1. Create PUBLIC USERS Table
-- This stores the public profile information linked 
-- to the secure authenticated Supabase user
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT,
  bio TEXT,
  location TEXT,
  portfolio_link TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('photographer', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create PHOTOS Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  album TEXT,
  publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published')),
  cloudinary_public_id TEXT,
  likes_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create LIKES Table (Junction Table)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, photo_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Users Table Policies:
-- Anyone can view users
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);
  
-- Users can only insert/update their own profile data
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Photos Table Policies:
-- Anyone can view PUBLISHED photos
CREATE POLICY "Published photos are viewable by everyone" ON public.photos
  FOR SELECT USING (publish_status = 'published');

-- Owners can view ALL their own photos (draft and published)
CREATE POLICY "Users can view their own photos" ON public.photos
  FOR SELECT USING (auth.uid() = user_id);
  
-- Authenticated users can insert their own photos
CREATE POLICY "Users can insert their own photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON public.photos
  FOR DELETE USING (auth.uid() = user_id);

-- Note: We allow everyone to update photos so that the likes/downloads 
-- counters can be incremented when actions are taken by other users
CREATE POLICY "Allow public update for counter increments" ON public.photos
  FOR UPDATE USING (true);

-- Likes Table Policies:
-- Anyone can see likes
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);
  
-- Only authenticated users can insert likes for themselves
CREATE POLICY "Users can insert their own likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- STORAGE BUCKETS (If you ever migrate from Cloudinary)
-- ==========================================
-- Uncomment and run these if you choose to store images in Supabase Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- ==========================================
-- AUTH TRIGGERS
-- ==========================================
-- Automatically copy new users to public.users table from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    username,
    bio,
    location,
    portfolio_link,
    avatar_url,
    role
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'bio',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'portfolio_link',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN new;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
