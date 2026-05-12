-- Migration: add role + founder profile fields to users table
-- Run this once against your Supabase SQL editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS role         VARCHAR(20)  NOT NULL DEFAULT 'founder';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio          TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stage        VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry     VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_for  VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location     VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_size    VARCHAR(50);
