-- PitchDeck Database Schema
-- Run this once against your Supabase/PostgreSQL database before starting the app.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  google_id     VARCHAR(100),
  role          VARCHAR(20)         NOT NULL DEFAULT 'founder',
  bio           TEXT,
  stage         VARCHAR(50),
  industry      VARCHAR(100),
  looking_for   VARCHAR(500),
  location      VARCHAR(100),
  linkedin_url  VARCHAR(255),
  team_size     VARCHAR(50),
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pitches (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(150)        NOT NULL,
  one_liner       VARCHAR(300)        NOT NULL,
  problem         TEXT                NOT NULL,
  solution        TEXT                NOT NULL,
  target_market   VARCHAR(255)        NOT NULL,
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Full-text search index on the most-searched columns
CREATE INDEX IF NOT EXISTS idx_pitches_fts
  ON pitches
  USING gin(to_tsvector('english', name || ' ' || one_liner || ' ' || problem || ' ' || solution));

CREATE TABLE IF NOT EXISTS feedback (
  id           SERIAL PRIMARY KEY,
  pitch_id     INTEGER  NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  user_id      INTEGER  NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  what_i_like  TEXT     NOT NULL,
  would_change TEXT     NOT NULL,
  would_use    BOOLEAN  NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A user can only submit one feedback entry per pitch
  UNIQUE (pitch_id, user_id)
);
