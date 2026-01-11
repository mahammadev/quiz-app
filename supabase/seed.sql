INSERT INTO quizzes (id, name, questions, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sample Quiz',
  '[{"question":"What is the capital of France?","choices":["Paris","Rome","Berlin"],"answer":0},{"question":"2 + 2 = ?","choices":["3","4","5"],"answer":1}]'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leaderboard (id, quiz_id, name, score, duration, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'sample-quiz',
  'Alex',
  8,
  120,
  now() - INTERVAL '1 day',
  now() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO flagged_questions (id, quiz_id, question, reason, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'sample-quiz',
  'Which planet is known as the Red Planet?',
  'Ambiguous choices',
  now() - INTERVAL '2 days',
  now() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;
