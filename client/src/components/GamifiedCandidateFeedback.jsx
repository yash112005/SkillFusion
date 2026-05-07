import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './GamifiedCandidateFeedback.css';

/* ── Enhanced confetti engine (Gold only) ── */
function launchConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const goldColors = ['#FFD700','#FFA500','#FFE44D','#DAA520','#FFB347','#FFEAA7','#F9CA24','#ffffff'];
  const shapes = ['rect', 'circle', 'star'];
  const particles = Array.from({ length: 250 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height * 0.3,
    w: Math.random() * 12 + 4,
    h: Math.random() * 8 + 3,
    color: goldColors[Math.floor(Math.random() * goldColors.length)],
    speed: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 8,
    vy: -(Math.random() * 6 + 2),
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    gravity: 0.06 + Math.random() * 0.04,
    opacity: Math.random() * 0.4 + 0.6,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    life: 0,
  }));
  let running = true;
  const drawStar = (ctx, x, y, r) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI / 2.5) * i - Math.PI / 2;
      const ox = r * Math.cos(a), oy = r * Math.sin(a);
      const ix = (r * 0.4) * Math.cos(a + Math.PI / 5), iy = (r * 0.4) * Math.sin(a + Math.PI / 5);
      i === 0 ? ctx.moveTo(x + ox, y + oy) : ctx.lineTo(x + ox, y + oy);
      ctx.lineTo(x + ix, y + iy);
    }
    ctx.closePath(); ctx.fill();
  };
  const animate = () => {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.life++;
      if (p.life < 3) { p.vy = -(Math.random() * 8 + 4); p.vx = (Math.random() - 0.5) * 12; }
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.angle += p.spin;
      p.opacity -= 0.002;
      if (p.y < canvas.height + 30 && p.opacity > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.max(p.opacity, 0);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, p.w / 2);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
    });
    if (active) requestAnimationFrame(animate); else running = false;
  };
  animate();
  return () => { running = false; };
}

/* ── Helpers ── */
const getTier = s => (s >= 80 ? 'gold' : s >= 50 ? 'silver' : 'bronze');
const tierEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉' };
const tierWord = { gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE' };
const skillColor = v => (v > 70 ? 'green' : v >= 50 ? 'yellow' : 'red');

const SKILL_LABELS = {
  technical: 'Technical Skills',
  communication: 'Communication',
  problemSolving: 'Problem Solving',
  culturalFit: 'Cultural Fit',
  experience: 'Experience Match',
};

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

const TIER_MSG = {
  gold: {
    title: 'Outstanding Match! 🏆',
    body: "You're in the top 5% of candidates. Our team will reach out within 24 hours. Get ready!",
    cta: 'View Offer Details',
  },
  silver: {
    title: 'Strong Candidate! ⚡',
    body: "You're a competitive match. You've been added to our priority shortlist. Expect a call soon.",
    cta: 'Check Your Status',
  },
  bronze: {
    title: 'Keep Growing! 💪',
    body: "You're not quite there yet, but you showed potential. Here are resources to improve your skills.",
    cta: 'View Learning Path',
  },
};

function buildLeaderboard(score, candidateName) {
  const rows = [
    { initials: 'AK', name: 'A**l K**r', score: 95 },
    { initials: 'PR', name: 'P**a R**i', score: 92 },
    { initials: 'SM', name: 'S**t M**a', score: 89 },
    { initials: 'NK', name: 'N**a K**r', score: 78 },
    { initials: 'VD', name: 'V**y D**e', score: 63 },
  ];
  const me = {
    initials: candidateName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    name: candidateName,
    score,
    isMe: true,
  };
  const combined = [...rows, me].sort((a, b) => b.score - a.score).slice(0, 5);
  const fullRank = [...rows, me].sort((a, b) => b.score - a.score);
  const rank = fullRank.findIndex(r => r.isMe) + 1;
  return { rows: combined, rank, total: 847 };
}

/* ── Main component ── */
const GamifiedCandidateFeedback = ({
  candidateName: propName = 'Rahul Sharma',
  score: propScore = 87,
  skills: propSkills = { technical: 90, communication: 78, problemSolving: 85, culturalFit: 88, experience: 72 },
  jobTitle: propJob = 'Senior Frontend Developer',
  companyName: propCompany = 'TechCorp India',
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const passedData = location.state || {};

  const candidateName = passedData.candidateName || user?.name || propName;
  const score = passedData.score || propScore;
  const skills = passedData.skills || propSkills;
  const jobTitle = passedData.jobTitle || propJob;
  const companyName = passedData.companyName || propCompany;

  const [currentScore, setCurrentScore] = useState(score);
  const [displayScore, setDisplayScore] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [skillsFilled, setSkillsFilled] = useState(false);
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState('Applied');
  const [flagged, setFlagged] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hireProbWidth, setHireProbWidth] = useState(0);

  const confettiRef = useRef(null);
  const badgeRef = useRef(null);

  const isRecruiter = user?.role === 'recruiter';
  const tier = getTier(currentScore);
  const circumference = 2 * Math.PI * 80; // r=80

  // Reveal sequence
  useEffect(() => {
    setRevealed(false);
    setSkillsFilled(false);
    setDisplayScore(0);
    setHireProbWidth(0);
    const t1 = setTimeout(() => setRevealed(true), 1400);
    const t2 = setTimeout(() => setSkillsFilled(true), 2000);
    const t3 = setTimeout(() => setHireProbWidth(82), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animKey]);

  // Score count-up
  useEffect(() => {
    if (!revealed) return;
    let raf;
    const start = Date.now();
    const duration = 2000;
    const animate = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * currentScore));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [revealed, score]);

  // Confetti for gold
  useEffect(() => {
    if (revealed && tier === 'gold' && confettiRef.current) {
      const stop = launchConfetti(confettiRef.current);
      return stop;
    }
  }, [revealed, tier, animKey]);

  const dashOffset = revealed ? circumference * (1 - score / 100) : circumference;

  const handleDownloadBadge = useCallback(() => {
    const c = document.createElement('canvas');
    c.width = 400; c.height = 500;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 0, 400, 500);
    // hexagon
    const cx = 200, cy = 170, sz = 90;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const x = cx + sz * Math.cos(a), y = cy + sz * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    const colors = { gold: ['#FFD700','#FFA500'], silver: ['#C0C0C0','#808080'], bronze: ['#CD7F32','#8B5A2B'] };
    const g = ctx.createLinearGradient(110, 80, 290, 260);
    g.addColorStop(0, colors[tier][0]); g.addColorStop(1, colors[tier][1]);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke();
    // tier text
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = '32px serif'; ctx.fillText(tierEmoji[tier], 200, 155);
    ctx.font = 'bold 22px Inter, sans-serif'; ctx.fillText(tierWord[tier], 200, 190);
    ctx.font = '12px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('MATCH', 200, 210);
    // score
    ctx.fillStyle = colors[tier][0]; ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(`${currentScore}%`, 200, 340);
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Your Match Score', 200, 370);
    ctx.fillText(`${candidateName} — ${companyName}`, 200, 460);
    // download
    const a = document.createElement('a');
    a.download = `${tier}-match-badge.png`;
    a.href = c.toDataURL('image/png');
    a.click();
  }, [tier, currentScore, candidateName, companyName]);

  const shareLinkedIn = () => {
    const text = `I earned a ${tierWord[tier]} Match Badge for ${jobTitle} at ${companyName}! ${tierEmoji[tier]}`;
    window.open(`https://www.linkedin.com/shareArticle?mini=true&title=${encodeURIComponent(text)}&summary=${encodeURIComponent(text)}`, '_blank');
  };

  const copyBadgeLink = () => {
    navigator.clipboard.writeText(`I earned a ${tierWord[tier]} Match Badge at ${companyName}! ${tierEmoji[tier]}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const triggerDemo = (val) => {
    setCurrentScore(val);
    setAnimKey(k => k + 1);
  };

  const lb = buildLeaderboard(currentScore, candidateName);

  /* ── SVG gradient IDs must be unique per animKey to avoid caching ── */
  const gradId = `tierGrad-${animKey}`;
  const shimId = `shimmer-${animKey}`;

  return (
    <div className="gcf-root" data-tier={tier} key={animKey}>
      {tier === 'gold' && <canvas ref={confettiRef} className="gcf-confetti" />}

      {/* Gold floating orbs background */}
      {tier === 'gold' && (
        <div className="gcf-gold-orbs">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="gcf-gold-orb" />)}
        </div>
      )}

      <div className="gcf-container">

        {/* ── Badge Reveal ── */}
        <div className="gcf-badge-section" ref={badgeRef}>

          {/* Gold radiating light rays */}
          {tier === 'gold' && (
            <div className="gcf-gold-rays">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="gcf-gold-ray"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    animationDelay: `${1.3 + i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="gcf-badge-wrapper">
            {/* Gold crown */}
            {tier === 'gold' && <div className="gcf-gold-crown">👑</div>}

            <div className={`gcf-badge-inner ${tier === 'gold' ? 'gold-celebrate' : 'glow-pulse'}`}>
              <svg className="gcf-badge-svg" viewBox="0 0 200 230">
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`var(--${tier}-light)`} />
                    <stop offset="50%" stopColor={`var(--${tier})`} />
                    <stop offset="100%" stopColor={`var(--${tier}-dark)`} />
                  </linearGradient>
                  <clipPath id={`hexClip-${animKey}`}>
                    <polygon points="100,8 188,55 188,175 100,222 12,175 12,55" />
                  </clipPath>
                </defs>
                <polygon points="100,8 188,55 188,175 100,222 12,175 12,55" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                {/* shimmer sweep */}
                <rect className="gcf-shimmer-rect" x="-60" y="0" width="60" height="230"
                  fill="rgba(255,255,255,0.13)" clipPath={`url(#hexClip-${animKey})`}
                  rx="4"
                />
              </svg>
              <div className="gcf-badge-text-overlay">
                <span className="gcf-badge-emoji">{tierEmoji[tier]}</span>
                <span className="gcf-badge-tier-label">{tierWord[tier]}</span>
                <span className="gcf-badge-match-label">MATCH</span>
              </div>

              {/* Gold sparkle burst particles */}
              {tier === 'gold' && (
                <div className="gcf-sparkle-container">
                  {Array.from({ length: 12 }, (_, i) => <div key={i} className="gcf-sparkle" />)}
                </div>
              )}
            </div>
          </div>
          <div className="gcf-job-info">
            <strong>{candidateName}</strong> — {jobTitle} at <strong>{companyName}</strong>
          </div>
        </div>

        {/* ── Score Meter ── */}
        <div className="gcf-score-section">
          <div className="gcf-score-ring-wrapper">
            <svg viewBox="0 0 180 180" width="100%" height="100%">
              <circle className="gcf-score-ring-bg" cx="90" cy="90" r="80" />
              <circle className="gcf-score-ring-fg" cx="90" cy="90" r="80"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div className="gcf-score-center">
              <span className="gcf-score-number">{displayScore}</span>
              <span className="gcf-score-percent">%</span>
            </div>
          </div>
          <div className="gcf-score-label">Your Match Score</div>
        </div>

        {/* ── Skill Bars ── */}
        <div className="gcf-skills-section">
          <h3 className="gcf-skills-title">📊 Skill Breakdown</h3>
          {Object.entries(skills).map(([key, val], i) => {
            const c = skillColor(val);
            return (
              <div className="gcf-skill-row" key={key}>
                <div className="gcf-skill-header">
                  <span className="gcf-skill-name">{SKILL_LABELS[key] || key}</span>
                  <span className={`gcf-skill-value ${c}`}>{val}%</span>
                </div>
                <div className="gcf-skill-track">
                  <div
                    className={`gcf-skill-fill ${c}`}
                    style={{
                      width: skillsFilled ? `${val}%` : '0%',
                      transitionDelay: `${i * 200}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tier Message ── */}
        <div className="gcf-tier-card">
          <div className="gcf-tier-card-title">{TIER_MSG[tier].title}</div>
          <div className="gcf-tier-card-body">{TIER_MSG[tier].body}</div>
          <button className={`gcf-tier-cta ${tier}`}>{TIER_MSG[tier].cta} →</button>
        </div>

        {/* ── Recruiter Panel ── */}
        {isRecruiter && (
          <div className="gcf-recruiter-panel">
            <h3>🔒 Recruiter Controls</h3>
            <textarea className="gcf-notes-area" placeholder="Internal notes…" value={notes} onChange={e => setNotes(e.target.value)} />
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Pipeline Stage</div>
            <div className="gcf-stage-pipeline">
              {STAGES.map((s, i) => {
                const activeIdx = STAGES.indexOf(stage);
                return (
                  <div key={s}
                    className={`gcf-stage-step ${s === stage ? 'active' : ''} ${i < activeIdx ? 'completed' : ''}`}
                    onClick={() => setStage(s)}
                  >{s}</div>
                );
              })}
            </div>
            <div className="gcf-recruiter-actions">
              <button className={`gcf-action-btn ${flagged ? 'flagged' : ''}`} onClick={() => setFlagged(!flagged)}>
                {flagged ? '🚩 Flagged' : '⚑ Flag for Review'}
              </button>
              <button className="gcf-action-btn">📊 Compare with Top Candidates</button>
            </div>
            <div className="gcf-hire-prob">
              <div className="gcf-hire-prob-label">Hire Probability: <strong style={{ color: 'var(--green)' }}>82%</strong> likely to accept offer</div>
              <div className="gcf-hire-prob-track">
                <div className="gcf-hire-prob-fill" style={{ width: `${hireProbWidth}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Share + Leaderboard ── */}
        <div className="gcf-bottom-grid">
          <div className="gcf-share-card">
            <h3>🔗 Share Your Badge</h3>
            <div className="gcf-share-buttons">
              <button className="gcf-share-btn linkedin" onClick={shareLinkedIn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Share on LinkedIn
              </button>
              <button className={`gcf-share-btn ${copySuccess ? 'copied' : ''}`} onClick={copyBadgeLink}>
                {copySuccess ? '✓ Copied!' : '📋 Copy Badge Text'}
              </button>
              <button className="gcf-share-btn" onClick={handleDownloadBadge}>
                ⬇️ Download Badge as PNG
              </button>
            </div>
          </div>

          <div className="gcf-leaderboard-card">
            <h3>🏅 Top Candidates This Week</h3>
            {lb.rows.map((r, i) => {
              const t = getTier(r.score);
              return (
                <div key={i} className={`gcf-lb-row ${r.isMe ? 'current' : ''}`}>
                  <span className="gcf-lb-rank">{i + 1}</span>
                  <span className="gcf-lb-avatar" style={{ background: `var(--${t})` }}>{r.initials}</span>
                  <span className="gcf-lb-name">{r.isMe ? candidateName : r.name}</span>
                  <span className="gcf-lb-badge">{tierEmoji[t]}</span>
                  <span className="gcf-lb-score" style={{ color: `var(--${t})` }}>{r.score}</span>
                </div>
              );
            })}
            <div className="gcf-lb-summary">
              You're ranked <strong>#{lb.rank}</strong> out of <strong>{lb.total}</strong> candidates
            </div>
          </div>
        </div>

        {/* ── Demo Mode ── */}
        <div className="gcf-demo-section">
          <h3>🧪 Demo Mode — Preview All Tiers</h3>
          <div className="gcf-demo-slider-row">
            <input type="range" min="0" max="100" value={score}
              className="gcf-demo-slider"
              onChange={e => triggerDemo(Number(e.target.value))}
            />
            <span className="gcf-demo-slider-value">{score}</span>
          </div>
          <div className="gcf-demo-tabs">
            <button className={`gcf-demo-tab ${tier === 'bronze' ? 'active' : ''}`} onClick={() => triggerDemo(35)}>🥉 Bronze Preview</button>
            <button className={`gcf-demo-tab ${tier === 'silver' ? 'active' : ''}`} onClick={() => triggerDemo(65)}>🥈 Silver Preview</button>
            <button className={`gcf-demo-tab ${tier === 'gold' ? 'active' : ''}`} onClick={() => triggerDemo(92)}>🥇 Gold Preview</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamifiedCandidateFeedback;
