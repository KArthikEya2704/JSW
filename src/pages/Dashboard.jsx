import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    subtitle: 'Equipment & Infrastructure Management',
    image: '/images/maintenance_bg.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    stats: [
      { label: 'Pending Complaints', value: 12, color: '#f59e0b' },
      { label: 'Completed', value: 40, color: '#10b981' },
      { label: 'In Progress', value: 8, color: '#3b82f6' },
    ],
    description: 'Track and manage all maintenance requests, equipment servicing schedules, and infrastructure repairs across the facility.',
  },
  {
    id: 'room-allocation',
    title: 'Room Allocation',
    subtitle: 'Accommodation & Space Management',
    image: '/images/room_allocation_bg.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    stats: [
      { label: 'Available Rooms', value: 24, color: '#10b981' },
      { label: 'Occupied', value: 56, color: '#f59e0b' },
      { label: 'Under Maintenance', value: 4, color: '#ef4444' },
    ],
    description: 'Manage guest house allocations, room assignments, check-in/check-out schedules, and facility availability in real-time.',
  },
  {
    id: 'canteen',
    title: 'Canteen',
    subtitle: 'Food & Dining Services',
    image: '/images/canteen_bg.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    stats: [
      { label: 'Meals Today', value: 320, color: '#3b82f6' },
      { label: 'Menu Items', value: 18, color: '#10b981' },
      { label: 'Feedback Rating', value: '4.5★', color: '#f59e0b' },
    ],
    description: 'View today\'s menu, manage meal schedules, track daily consumption, and monitor canteen operations seamlessly.',
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sliderRef = useRef(null);
  const touchStartRef = useRef(null);
  const autoPlayRef = useRef(null);
  const dashboardRef = useRef(null);

  // Track scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      goToSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(autoPlayRef.current);
  }, [currentSlide]);

  const resetAutoPlay = useCallback(() => {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      goToSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
  }, []);

  const goToSlide = (indexOrFn) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      const next = typeof indexOrFn === 'function' ? indexOrFn(prev) : indexOrFn;
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const nextSlide = () => {
    goToSlide((prev) => (prev + 1) % SLIDES.length);
    resetAutoPlay();
  };

  const prevSlide = () => {
    goToSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    resetAutoPlay();
  };

  const goToDot = (index) => {
    goToSlide(index);
    resetAutoPlay();
  };

  // Touch / swipe support
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
    touchStartRef.current = null;
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const scrollToDashboard = () => {
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-page">
      {/* ===== FLOATING NAVBAR ===== */}
      <nav className={`dashboard-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo">
            <img src="/images/jsw_logo_clean.png" alt="JSW" className="nav-logo-img" />
          </div>

          <div className="nav-links">
            <a href="#slider" className="nav-link active">Home</a>
            <a href="#quick-dashboard" className="nav-link">Dashboard</a>
            <a href="#modules" className="nav-link">Modules</a>
          </div>

          <div className="nav-profile">
            <button
              id="profile-button"
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="profile-name">{user?.name || 'Admin'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="dropdown-name">{user?.name}</div>
                    <div className="dropdown-role">{user?.role}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile
                </button>
                <button className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button id="logout-button" className="dropdown-item logout-item" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO SLIDER ===== */}
      <section id="slider" className="slider-section">
        <div
          className="slider-track"
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide, index) => (
            <div className="slide" key={slide.id}>
              <div
                className="slide-bg"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="slide-overlay" />
              
              <div className="slide-content">
                <div className="slide-info">
                  <div className={`slide-badge ${currentSlide === index ? 'animate-in' : ''}`}>
                    <span className="badge-icon">{slide.icon}</span>
                    <span className="badge-text">{slide.title}</span>
                  </div>
                  
                  <h2 className={`slide-title ${currentSlide === index ? 'animate-in' : ''}`}>
                    {slide.title}
                  </h2>
                  <p className={`slide-subtitle ${currentSlide === index ? 'animate-in' : ''}`}>
                    {slide.subtitle}
                  </p>
                  <p className={`slide-description ${currentSlide === index ? 'animate-in' : ''}`}>
                    {slide.description}
                  </p>

                  {/* Stats Cards */}
                  <div className={`slide-stats ${currentSlide === index ? 'animate-in' : ''}`}>
                    {slide.stats.map((stat, si) => (
                      <div className="stat-card" key={si} style={{ '--accent': stat.color }}>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-bar">
                          <div
                            className="stat-bar-fill"
                            style={{
                              width: currentSlide === index ? '100%' : '0%',
                              backgroundColor: stat.color,
                              transitionDelay: `${si * 200 + 600}ms`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Go to Dashboard Button */}
                  <button
                    className={`slide-cta ${currentSlide === index ? 'animate-in' : ''}`}
                    onClick={scrollToDashboard}
                  >
                    <span>GO TO DASHBOARD</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <button id="prev-slide" className="slider-arrow slider-arrow-left" onClick={prevSlide} aria-label="Previous slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button id="next-slide" className="slider-arrow slider-arrow-right" onClick={nextSlide} aria-label="Next slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="slider-dots">
          {SLIDES.map((slide, index) => (
            <button
              key={index}
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToDot(index)}
              aria-label={`Go to ${slide.title}`}
            >
              <span className="dot-progress" style={{
                animationDuration: currentSlide === index ? '6s' : '0s',
                animationPlayState: currentSlide === index ? 'running' : 'paused',
              }} />
            </button>
          ))}
        </div>

        {/* Slide counter */}
        <div className="slide-counter">
          <span className="counter-current">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="counter-sep">/</span>
          <span className="counter-total">{String(SLIDES.length).padStart(2, '0')}</span>
        </div>
      </section>

      {/* ===== QUICK DASHBOARD ===== */}
      <section id="quick-dashboard" className="quick-dashboard" ref={dashboardRef}>
        <div className="dashboard-container">
          <div className="section-header">
            <h2 className="section-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard Overview
            </h2>
            <p className="section-subtitle">Quick access to all modules and real-time statistics</p>
          </div>

          <div id="modules" className="module-grid">
            {SLIDES.map((slide) => (
              <div className="module-card" key={slide.id}>
                <div className="module-card-bg" style={{ backgroundImage: `url(${slide.image})` }} />
                <div className="module-card-overlay" />
                <div className="module-card-content">
                  <div className="module-icon">{slide.icon}</div>
                  <h3 className="module-title">{slide.title}</h3>
                  <p className="module-desc">{slide.description}</p>
                  <div className="module-stats">
                    {slide.stats.map((stat, si) => (
                      <div className="module-stat" key={si}>
                        <span className="module-stat-value" style={{ color: stat.color }}>{stat.value}</span>
                        <span className="module-stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <button className="module-btn">
                    Open Module
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/images/jsw_logo_clean.png" alt="JSW" className="footer-logo-img" />
            <p className="footer-tagline">Better Everyday</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Modules</h4>
              <a href="#">Maintenance</a>
              <a href="#">Room Allocation</a>
              <a href="#">Canteen</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact IT</a>
              <a href="#">FAQs</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About JSW</a>
              <a href="#">Careers</a>
              <a href="#">Policies</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} JSW Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
