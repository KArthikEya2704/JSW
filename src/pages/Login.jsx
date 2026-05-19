import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Right Panel Background Photos ──────────────────────────────────────────
const BG_IMAGES = [
  '/images/login/image/arc-welding-steel-construction-site.jpg',
  '/images/login/image/interior-view-steel-factory.jpg',
  '/images/login/image/gettyimages-1262893156-612x612.jpg',
];

// ─── Right Panel Carousel Data (JSW real facts) ───────────────────────────────
const CAROUSEL_SLIDES = [
  {
    id: 'operations',
    tag: 'Operations',
    heading: 'Powering Tomorrow\'s\nSteel Industry',
    body: 'Manage maintenance, room allocations, canteen services, and more — all from a single unified portal built for JSW\'s operational excellence.',
    stats: [
      { value: '3+', label: 'Modules' },
      { value: 'Real‑time', label: 'Analytics' },
      { value: 'Secure', label: 'Access' },
    ],
  },
  {
    id: 'scale',
    tag: 'Global Scale',
    heading: 'India\'s Largest\nPrivate Steel Producer',
    body: 'JSW Steel commands a total installed capacity of 35.7 MTPA with operations in India and the United States, producing a record 27.79 million tonnes in FY2024–25.',
    stats: [
      { value: '35.7M', label: 'MTPA Capacity' },
      { value: '₹1.69L', label: 'Cr Revenue' },
      { value: '51.5M', label: 'MTPA by 2031' },
    ],
  },
  {
    id: 'people',
    tag: 'People & Impact',
    heading: '40,000 People.\nOne Mission.',
    body: 'Founded in 1982 by Sajjan Jindal, the JSW Group has grown into a US$23 billion conglomerate spanning steel, energy, infrastructure, cement, paints, and sports.',
    stats: [
      { value: '40K+', label: 'Employees' },
      { value: '$23B', label: 'Group Value' },
      { value: '1982', label: 'Est. Year' },
    ],
  },
];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 72 : -72,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -72 : 72,
    opacity: 0,
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  }),
};

// ─── Animated Input Field ─────────────────────────────────────────────────────
function AnimatedField({ id, type, placeholder, value, onChange, autoComplete, icon }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const active = hovered || focused;

  return (
    <motion.div
      className="input-group"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        borderColor: focused
          ? '#e63946'
          : hovered
            ? '#475569'
            : '#e2e8f0',
        backgroundColor: focused
          ? 'rgba(255, 255, 255, 0.72)'
          : hovered
            ? '#eef2f7'
            : '#f8fafc',
        boxShadow: focused
          ? '0 0 0 3px rgba(230,57,70,0.13), 0 4px 20px rgba(0,0,0,0.09), inset 0 1px 3px rgba(255,255,255,0.6)'
          : hovered
            ? '0 2px 12px rgba(0,0,0,0.07)'
            : '0 0 0 0 transparent',
        backdropFilter: focused ? 'blur(10px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ borderWidth: '1.5px', borderStyle: 'solid' }}
    >
      <motion.div
        className="input-icon"
        animate={{
          color: active ? '#1e293b' : '#94a3b8',
          scale: active ? 1.12 : 1,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {icon}
      </motion.div>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={active ? 'input-active' : ''}
      />
    </motion.div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-advance carousel every 5 s (always forward → infinite feel)
  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setSlideIdx((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const slide = CAROUSEL_SLIDES[slideIdx];

  return (
    <div className="login-page">

      {/* ── LEFT: Form Panel ── */}
      <div className={`login-left ${shake ? 'shake' : ''}`}>
        <div className="login-left-inner">

          <div className="login-logo">
            <img src="/images/jsw_logo_clean.png" alt="JSW" className="jsw-logo-login" />
          </div>

          <h1 className="login-title">Log in to your account</h1>
          <p className="login-subtitle">Sign in to access the JSW Portal</p>

          <form onSubmit={handleSubmit} className="login-form">

            <AnimatedField
              id="username-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <AnimatedField
              id="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />

            {error && (
              <div className="login-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              id="login-button"
              type="submit"
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-hint">Authorised personnel only</p>
        </div>
      </div>

      {/* ── RIGHT: Branded Carousel Panel ── */}
      <div className="login-right">

        {/* ── Background image crossfade — all 3 always mounted ── */}
        <div className="login-bg-stack">
          {BG_IMAGES.map((img, i) => (
            <motion.div
              key={img}
              className="login-bg-image"
              style={{ backgroundImage: `url(${img})` }}
              animate={{ opacity: i === slideIdx ? 1 : 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          ))}
          {/* Dark overlay for text readability */}
          <div className="login-bg-overlay" />
        </div>

        {/* Carousel content */}
        <div className="login-right-content">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="login-carousel-slide"
            >
              {/* Tag pill */}
              <div className="login-carousel-tag">{slide.tag}</div>

              {/* Heading */}
              <h2 className="login-brand-heading">
                {slide.heading.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < slide.heading.split('\n').length - 1 && <br />}</span>
                ))}
              </h2>

              <p className="login-brand-body">{slide.body}</p>

              {/* Stats */}
              <div className="login-brand-stats">
                {slide.stats.map((s, i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    {i > 0 && <div className="login-stat-divider" />}
                    <div className="login-stat">
                      <span className="login-stat-value">{s.value}</span>
                      <span className="login-stat-label">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="login-carousel-dots">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`login-carousel-dot ${i === slideIdx ? 'active' : ''}`}
                onClick={() => {
                  setDirection(i > slideIdx || (i === 0 && slideIdx === CAROUSEL_SLIDES.length - 1) ? 1 : -1);
                  setSlideIdx(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
