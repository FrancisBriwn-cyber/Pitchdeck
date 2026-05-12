const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const pool = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const makeToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Google ────────────────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;
        if (result.rows.length === 0) {
          const insert = await pool.query(
            'INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING *',
            [name, email, profile.id]
          );
          user = insert.rows[0];
        } else {
          user = result.rows[0];
          if (!user.google_id) {
            await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [profile.id, user.id]);
          }
        }

        return done(null, { user, token: makeToken(user) });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ── GitHub ────────────────────────────────────────────────────────────────────
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.warn('[passport] GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set — GitHub OAuth disabled.');
} else
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Pick primary verified email; fall back to first available
        const emailObj = (profile.emails || []).find((e) => e.primary && e.verified)
          || (profile.emails || [])[0];

        if (!emailObj?.value) {
          return done(null, false, {
            message: 'Your GitHub account has no verified public email. Add one in GitHub Settings → Emails.',
          });
        }

        const email = emailObj.value;
        const name = profile.displayName || profile.username;

        // Find existing user by github_id, then by email (links accounts)
        let result = await pool.query('SELECT * FROM users WHERE github_id = $1', [String(profile.id)]);
        let user;

        if (result.rows.length > 0) {
          user = result.rows[0];
        } else {
          result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          if (result.rows.length > 0) {
            user = result.rows[0];
            await pool.query('UPDATE users SET github_id = $1 WHERE id = $2', [String(profile.id), user.id]);
          } else {
            const insert = await pool.query(
              'INSERT INTO users (name, email, github_id) VALUES ($1, $2, $3) RETURNING *',
              [name, email, String(profile.id)]
            );
            user = insert.rows[0];
          }
        }

        return done(null, { user, token: makeToken(user) });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
