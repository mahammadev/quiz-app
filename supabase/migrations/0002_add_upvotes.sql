-- Add upvotes column to flagged_questions table
ALTER TABLE flagged_questions 
ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0;

-- Create index for upvotes
CREATE INDEX IF NOT EXISTS flagged_questions_upvotes_idx ON flagged_questions (upvotes DESC);
