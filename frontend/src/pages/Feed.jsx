import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Leaf, Cpu, Heart, Car, GraduationCap,
  ClipboardList, MessageSquare, Target,
  Flame, Lightbulb, Lock, Globe, Rocket, Wrench, CheckCircle,
} from 'lucide-react';
import api from '../api/axios';
import PitchCard from '../components/PitchCard';
import { useAuth } from '../context/AuthContext';

/* ── Animated number counter (smoothstep easing) ── */
function useCounter(target, active) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!active || !target) return;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, active]);
  return val;
}

/* ── Guest landing shown to unauthenticated visitors ── */
function GuestLanding({ pitches, loading }) {
  return (
    <div className="guest-page">

      {/* ── Hero ── */}
      <section className="guest-hero">

        {/* Floating industry badges */}
        <div className="guest-float-badges" aria-hidden="true">
          <span className="guest-float-badge" style={{ top: '18%', left: '4%' }}><TrendingUp size={12} /> Fintech</span>
          <span className="guest-float-badge" style={{ top: '22%', right: '5%' }}><Leaf size={12} /> Clean Energy</span>
          <span className="guest-float-badge" style={{ bottom: '28%', left: '3%' }}><Cpu size={12} /> AI &amp; ML</span>
          <span className="guest-float-badge" style={{ bottom: '24%', right: '4%' }}><Heart size={12} /> HealthTech</span>
          <span className="guest-float-badge guest-float-badge-sm" style={{ top: '42%', left: '1%' }}><Car size={12} /> Mobility</span>
          <span className="guest-float-badge guest-float-badge-sm" style={{ top: '40%', right: '2%' }}><GraduationCap size={12} /> EdTech</span>
        </div>

        <div className="container guest-hero-inner">
          <span className="guest-hero-eyebrow">The Startup Idea Exchange</span>
          <h1 className="guest-hero-title">
            Get torn apart by builders<br />before you write a line of code.
          </h1>
          <p className="guest-hero-sub">
            Founders post their startup pitches. Builders give structured, honest feedback.
            Validate your idea before building completely free.
          </p>

          {/* Social proof */}
          <div className="guest-hero-proof">
            <div className="guest-proof-avatars">
              <div className="guest-proof-av" style={{ background: '#065f46' }}>FO</div>
              <div className="guest-proof-av" style={{ background: '#7c3aed' }}>KM</div>
              <div className="guest-proof-av" style={{ background: '#b45309' }}>ZB</div>
              <div className="guest-proof-av" style={{ background: '#1d4ed8' }}>AO</div>
              <div className="guest-proof-av guest-proof-av-more">+16</div>
            </div>
            <span className="guest-proof-text">
              Join <strong>20+ founders</strong> already sharing pitches
            </span>
          </div>

          <div className="guest-hero-ctas">
            <Link to="/founder/register" className="btn btn-primary btn-lg guest-btn-glow">
              Join as Founder →
            </Link>
            <Link to="/builder/register" className="btn btn-outline btn-lg">
              Join as Builder
            </Link>
          </div>
          <p className="guest-hero-login">
            Already have an account?{' '}
            <Link to="/join" className="guest-login-link">Log in</Link>
          </p>
        </div>
      </section>

      {/* ── Who is it for ── */}
      <section className="guest-for">
        <div className="container">
          <span className="guest-section-label">Who is it for?</span>
          <h2 className="guest-for-title">Two sides. One platform.</h2>
          <div className="guest-for-grid">

            <div className="guest-for-card guest-for-founder">
              <div className="guest-for-icon"><Rocket size={26} /></div>
              <h3>Founders with an idea</h3>
              <p>You have a startup concept but haven't validated it yet. Post your pitch and hear the hard truth before you spend months building the wrong thing.</p>
              <ul className="guest-for-list">
                <li><CheckCircle size={14} /> Get honest, structured critique</li>
                <li><CheckCircle size={14} /> See your idea's approval score</li>
                <li><CheckCircle size={14} /> Find co-founders and early users</li>
              </ul>
              <Link to="/founder/register" className="btn btn-primary guest-for-btn">Join as Founder →</Link>
            </div>

            <div className="guest-for-card guest-for-builder">
              <div className="guest-for-icon"><Wrench size={26} /></div>
              <h3>Builders who love ideas</h3>
              <p>You're a developer, designer, or product thinker who enjoys evaluating early-stage ideas. Give the kind of feedback that actually shapes what gets built.</p>
              <ul className="guest-for-list">
                <li><CheckCircle size={14} /> Discover problems worth solving</li>
                <li><CheckCircle size={14} /> Build your reputation as an expert</li>
                <li><CheckCircle size={14} /> Connect with ambitious founders</li>
              </ul>
              <Link to="/register" className="btn btn-outline guest-for-btn">Join as Builder →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works — connected steps ── */}
      <section className="guest-how" id="how-it-works">
        <div className="container">
          <div className="guest-steps-header">
            <span className="guest-section-label">How it works</span>
            <h2 className="guest-steps-title">From idea to validated in minutes</h2>
          </div>
          <div className="guest-steps">
            <div className="guest-step">
              <div className="guest-step-top">
                <div className="guest-step-circle">
                  <span className="guest-step-num">1</span>
                </div>
                <div className="guest-step-line" />
              </div>
              <div className="guest-step-icon-wrap guest-step-icon-green"><ClipboardList size={22} /></div>
              <h3 className="guest-step-title">Share Your Pitch</h3>
              <p className="guest-step-desc">Describe your problem, solution, and target market in a clean structured format.</p>
              <div className="guest-step-example">e.g. "An app that splits bills instantly"</div>
            </div>

            <div className="guest-step">
              <div className="guest-step-top">
                <div className="guest-step-circle guest-step-circle-mid">
                  <span className="guest-step-num">2</span>
                </div>
                <div className="guest-step-line" />
              </div>
              <div className="guest-step-icon-wrap guest-step-icon-purple"><MessageSquare size={22} /></div>
              <h3 className="guest-step-title">Get Real Feedback</h3>
              <p className="guest-step-desc">Builders from the community review your pitch and leave structured, honest feedback.</p>
              <div className="guest-step-example">e.g. "Strong idea, but reconsider pricing"</div>
            </div>

            <div className="guest-step guest-step-last">
              <div className="guest-step-top">
                <div className="guest-step-circle guest-step-circle-end">
                  <span className="guest-step-num">3</span>
                </div>
              </div>
              <div className="guest-step-icon-wrap guest-step-icon-amber"><Target size={22} /></div>
              <h3 className="guest-step-title">Validate Your Idea</h3>
              <p className="guest-step-desc">See your approval score — what % of reviewers would actually use your product.</p>
              <div className="guest-step-example">e.g. "84% of reviewers would use this"</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento feature grid ── */}
      <section className="guest-bento-section">
        <div className="container">
          <span className="guest-section-label">Why PitchDeck</span>
          <div className="guest-bento">

            {/* Wide card */}
            <div className="guest-bento-card guest-bento-wide">
              <div className="guest-bento-tag">For Founders</div>
              <h3 className="guest-bento-title">Stop building in the dark</h3>
              <p className="guest-bento-desc">Post your pitch in under 5 minutes and get structured feedback from real product builders — not just friends who say "great idea!"</p>
              <div className="guest-bento-visual">
                <div className="gbv-field"><Flame size={13} /> The Problem</div>
                <div className="gbv-field"><Lightbulb size={13} /> The Solution</div>
                <div className="gbv-field"><Target size={13} /> Target Market</div>
              </div>
            </div>

            {/* Tall card */}
            <div className="guest-bento-card guest-bento-tall guest-bento-dark">
              <div className="guest-bento-tag guest-bento-tag-green">For Builders</div>
              <h3 className="guest-bento-title">See raw ideas before the world does</h3>
              <p className="guest-bento-desc">Review early pitches, leave feedback that actually shapes the product, and build your reputation as someone whose opinion matters.</p>
              <div className="guest-bento-score">
                <div className="gbs-bar">
                  <div className="gbs-fill" style={{ width: '78%' }} />
                </div>
                <span className="gbs-label">78% would use this</span>
              </div>
            </div>

            {/* Small card */}
            <div className="guest-bento-card guest-bento-sm">
              <div className="guest-bento-icon"><Lock size={22} /></div>
              <h3 className="guest-bento-title">100% Free</h3>
              <p className="guest-bento-desc">No paywalls, no credit card required. Always.</p>
            </div>

            {/* Small card */}
            <div className="guest-bento-card guest-bento-sm guest-bento-dark">
              <div className="guest-bento-icon"><Globe size={22} /></div>
              <h3 className="guest-bento-title">Global Community</h3>
              <p className="guest-bento-desc">Founders and builders from across the world.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="guest-join" id="pitches">
        {/* Decorative blurred card background */}
        <div className="guest-join-bg" aria-hidden="true">
          {pitches.slice(0, 3).map((p) => (
            <div key={p.id} className="guest-join-bg-card"><PitchCard pitch={p} /></div>
          ))}
          {loading && [1, 2, 3].map((i) => (
            <div key={i} className="guest-join-bg-card guest-skeleton-card" />
          ))}
        </div>
        <div className="guest-join-overlay" />

        <div className="container guest-join-inner">
          <div className="guest-lock-badge"><Lock size={26} /></div>
          <h2 className="guest-join-title">
            Join {loading ? '20+' : `${pitches.length}+`} founders already building in public
          </h2>
          <p className="guest-join-sub">
            Browse every pitch, leave honest feedback, and share your own idea — completely free.
          </p>

          <div className="guest-join-stats">
            <span className="guest-join-stat"><strong>{loading ? '20+' : `${pitches.length}+`}</strong> pitches live</span>
            <span className="guest-join-stat-dot" />
            <span className="guest-join-stat"><strong>100%</strong> free forever</span>
            <span className="guest-join-stat-dot" />
            <span className="guest-join-stat"><strong>∞</strong> feedback you can get</span>
          </div>

          <div className="guest-lock-actions">
            <Link to="/founder/register" className="btn btn-primary btn-lg guest-btn-glow">
              I'm a Founder →
            </Link>
            <Link to="/builder/register" className="btn btn-outline btn-lg guest-join-outline">
              I'm a Builder
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Authenticated feed ── */
export default function Feed() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const feedRef = useRef(null);

  useEffect(() => {
    api.get('/api/pitches')
      .then((res) => setPitches(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalFeedback = pitches.reduce((a, p) => a + Number(p.feedback_count || 0), 0);
  const countedPitches = useCounter(pitches.length, !loading);
  const countedFeedback = useCounter(totalFeedback, !loading);

  if (!user) {
    return <GuestLanding pitches={pitches} loading={loading} />;
  }

  return (
    <>
      {/* ── Hero ── */}
      <div className="feed-hero">
        <div className="feed-hero-inner">

          <div className="feed-hero-left">
            <span className="feed-hero-eyebrow">The Startup Idea Exchange</span>
            <h1>Get torn apart by builders<br />before you write a line of code.</h1>
            <p>Every pitch here is a problem someone is trying to solve. Browse, give feedback, or share your own idea.</p>

            <div className="feed-hero-ctas">
              <button
                className="btn btn-primary btn-lg btn-cta"
                onClick={() => feedRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Pitches ↓
              </button>
              <Link to="/pitches/new" className="btn btn-outline btn-lg">
                Share Your Idea →
              </Link>
            </div>

            <div className="feed-hero-stats">
              <div className="hero-stat-card">
                <span className="hero-stat-number">{loading ? '…' : countedPitches}</span>
                <span className="hero-stat-label">Pitches Live</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-number">{loading ? '…' : countedFeedback}</span>
                <span className="hero-stat-label">Feedback Given</span>
              </div>
              <div className="hero-stat-card hero-stat-card-accent">
                <span className="hero-stat-number">Free</span>
                <span className="hero-stat-label">Always</span>
              </div>
            </div>
          </div>

          <div className="feed-hero-right" aria-hidden="true">
            <div className="hero-mockup">
              <div className="hero-mockup-card hero-mockup-card-back">
                <div className="hmc-img" style={{ background: 'linear-gradient(135deg,#0d3d2b,#065f46)' }}>
                  <span>S</span>
                </div>
                <div className="hmc-body">
                  <div className="hmc-tag">CLEAN ENERGY</div>
                  <div className="hmc-title">SolarFlex</div>
                  <div className="hmc-line" />
                  <div className="hmc-meta"><span className="hmc-dot" />3 feedback</div>
                </div>
              </div>
              <div className="hero-mockup-card hero-mockup-card-front">
                <div className="hmc-img" style={{ background: 'linear-gradient(135deg,#1a1a2e,#065f46)' }}>
                  <span>P</span>
                </div>
                <div className="hmc-body">
                  <div className="hmc-tag">FINTECH</div>
                  <div className="hmc-title">PaySplit</div>
                  <div className="hmc-oneliner">Instant bill-splitting for mobile money users.</div>
                  <div className="hmc-footer">
                    <div className="hmc-avatar">AO</div>
                    <span className="hmc-author">Amara Osei</span>
                    <span className="hmc-badge"><MessageSquare size={12} /> 5 feedback</span>
                  </div>
                </div>
              </div>
              <div className="hero-mockup-pill"><Flame size={13} /> Trending today</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Feed ── */}
      <div className="container page" ref={feedRef}>
        <div className="section-header">
          <h2>Latest Pitches</h2>
          <span className="section-tag">Newest first</span>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            Loading pitches...
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && pitches.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><ClipboardList size={36} /></div>
            <h3>No pitches yet</h3>
            <p>Be the first to share your startup idea with the community.</p>
          </div>
        )}

        {!loading && !error && pitches.length > 0 && (
          <div className="pitch-grid">
            {pitches.map((p, i) => <PitchCard key={p.id} pitch={p} index={i} />)}
          </div>
        )}
      </div>
    </>
  );
}
