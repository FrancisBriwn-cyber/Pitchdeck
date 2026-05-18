-- Migration: add notifications table
-- Run once against your PostgreSQL / Supabase database.

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  pitch_id   INTEGER      NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  actor_name VARCHAR(100) NOT NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, is_read, created_at DESC);
