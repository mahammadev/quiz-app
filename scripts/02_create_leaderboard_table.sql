-- Enable UUID generation for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to select leaderboard entries
CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT USING (true);

-- Create a policy to allow anyone to insert leaderboard entries
CREATE POLICY "Allow public insert access" ON leaderboard
  FOR INSERT WITH CHECK (true);
