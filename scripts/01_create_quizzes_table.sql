-- Create the quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to select quizzes
CREATE POLICY "Allow public read access" ON quizzes
  FOR SELECT USING (true);

-- Create a policy to allow anyone to insert quizzes
CREATE POLICY "Allow public insert access" ON quizzes
  FOR INSERT WITH CHECK (true);

-- Create a policy to allow anyone to delete quizzes (optional, maybe restrict later)
CREATE POLICY "Allow public delete access" ON quizzes
  FOR DELETE USING (true);
