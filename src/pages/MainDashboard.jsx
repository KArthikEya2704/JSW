import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  LineChart, Line, AreaChart, Area,
} from 'recharts';

// ─── DATA (from DPR Sheets 23/09/2025) ────────────────────────────────────────

// Sheet 1 — F&B: Manpower
const manpowerFB = [
  { name: 'On Roll', actual: 11, present: 11 },
  { name: 'Associates', actual: 62, present: 53 },
  { name: 'Rashmi (JBN)', actual: 17, present: 16 },
  { name: 'Rashmi (JBC)', actual: 161, present: 135 },
  { name: 'Infinzy', actual: 7, present: 4 },
  { name: 'Sparkal', actual: 27, present: 25 },
];

// Sheet 1 — Guest House Occupancy
const guestHouseData = [
  { name: 'IB River', total: 76, occupied: 19, vacant: 57 },
  { name: 'VIP', total: 33, occupied: 9, vacant: 24 },
  { name: 'New GET', total: 42, occupied: 22, vacant: 20 },
];

// Sheet 1 — Meal Count (top canteens)
const mealData = [
  { name: 'NG V.I.P', breakfast: 197, lunch: 484, dinner: 148 },
  { name: 'NG VIP Mail', breakfast: 107, lunch: 166, dinner: 114 },
  { name: 'WRM', breakfast: 97, lunch: 163, dinner: 71 },
  { name: 'CRM', breakfast: 67, lunch: 114, dinner: 27 },
  { name: 'CSP', breakfast: 98, lunch: 122, dinner: 48 },
  { name: 'GET Mail', breakfast: 80, lunch: 200, dinner: 106 },
  { name: 'V.I.P', breakfast: 31, lunch: 41, dinner: 19 },
  { name: 'PELLET', breakfast: 38, lunch: 82, dinner: 27 },
];

// Sheet 1 — Vehicle Km
const vehicleData = [
  { name: 'MG-EV 9304', km: 115 },
  { name: 'MG-EV 9346', km: 138 },
  { name: 'MG-EV 9357', km: 97 },
  { name: 'MG-EV 9203', km: 76 },
  { name: 'MG-EV 9147', km: 76 },
  { name: 'MG-EV 9398', km: 83 },
  { name: 'MG-EV 1797', km: 83 },
  { name: 'MG-EV 9273', km: 21 },
  { name: 'Bolero', km: 41 },
];

// Sheet 2 — Maintenance Manpower
const manpowerMaint = [
  { name: 'On Roll', actual: 14, present: 11 },
  { name: 'Associates', actual: 51, present: 41 },
  { name: 'Kanha Ent.', actual: 11, present: 11 },
  { name: 'Maa Sarala', actual: 17, present: 15 },
  { name: 'Samaleswari', actual: 15, present: 13 },
  { name: 'Global Elevator', actual: 2, present: 2 },
];

// Sheet 2 — Complaints by category
const complaintsPie = [
  { name: 'Civil', value: 13, color: '#e63946' },
  { name: 'Seepage', value: 26, color: '#f4a261' },
  { name: 'Carpentry', value: 12, color: '#2a9d8f' },
  { name: 'Plumbing', value: 2, color: '#457b9d' },
  { name: 'Electrical', value: 3, color: '#a8dadc' },
];

// Sheet 2 — Complaints status
const complaintsStatus = [
  { name: 'Civil', completed: 0, inProgress: 13, pending: 0 },
  { name: 'Seepage', completed: 0, inProgress: 26, pending: 0 },
  { name: 'Carpentry', completed: 12, inProgress: 0, pending: 0 },
  { name: 'Plumbing', completed: 2, inProgress: 0, pending: 0 },
  { name: 'Electrical', completed: 3, inProgress: 0, pending: 0 },
];

// Sheet 2 — JBC Paint work progress (%)
const paintProgress = [
  { name: 'Pappi Devi\nInt. Wall', target: 5000, done: 4766.73 },
  { name: 'Pappi Devi\nExt. Wall', target: 500, done: 135.84 },
  { name: 'Manoj Ent.\nInt. Wall', target: 5000, done: 5089.73 },
  { name: 'Manoj Ent.\nExt. Wall', target: 500, done: 405.85 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const COLORS_BAR = ['#e63946', '#457b9d'];
const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' },
  labelStyle: { color: '#94a3b8', fontSize: 12 },
  itemStyle: { color: '#f1f5f9' },
};

function SectionTitle({ children }) {
  return <h3 className="md-section-title">{children}</h3>;
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="md-stat-card" style={{ borderTop: `3px solid ${color || '#e63946'}` }}>
      <span className="md-stat-value" style={{ color: color || '#e63946' }}>{value}</span>
      <span className="md-stat-label">{label}</span>
      {sub && <span className="md-stat-sub">{sub}</span>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MainDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalMeals = 1078 + 2015 + 761;
  const totalKm = 822;
  const totalRooms = 76 + 33 + 42;
  const occupiedRooms = 19 + 9 + 22;
  const totalComplaints = complaintsPie.reduce((a, b) => a + b.value, 0);

  return (
    <div className="dashboard-page md-page">
      {/* ── Nav ── */}
      <nav className="dashboard-nav nav-scrolled">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img src="/images/jsw_logo_clean.png" alt="JSW" className="nav-logo-img" />
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/dashboard')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              ← Back to Home
            </button>
          </div>
          <div className="nav-profile">
            <button className="profile-btn" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
              <div className="profile-avatar">{user?.name?.charAt(0) || 'A'}</div>
              <span className="profile-name">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="md-wrapper">

        {/* ── Page Header ── */}
        <motion.div className="md-page-header" {...fadeUp(0)}>
          <div>
            <h1 className="md-page-title">Township Daily Report</h1>
            <p className="md-page-date">Date: 23 September 2025 &nbsp;·&nbsp; {user?.name}</p>
          </div>
          <div className="md-header-badge">DPR</div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            SECTION 1 — KPI SUMMARY CARDS
        ══════════════════════════════════════════════════ */}
        <motion.div className="md-kpi-grid" {...fadeUp(0.05)}>
          <StatCard label="Total Meals Served" value={totalMeals.toLocaleString()} sub="Breakfast + Lunch + Dinner" color="#e63946" />
          <StatCard label="Guest Rooms Occupied" value={`${occupiedRooms}/${totalRooms}`} sub="Across 3 Guest Houses" color="#f4a261" />
          <StatCard label="Fleet Km Today" value={totalKm} sub="EV + Diesel combined" color="#2a9d8f" />
          <StatCard label="Maintenance Jobs" value={totalComplaints} sub="All categories" color="#457b9d" />
          <StatCard label="F&B Workforce Present" value={53 + 135 + 4 + 25 + 16} sub="vs 275 actual" color="#a8dadc" />
          <StatCard label="Maintenance Workforce" value={11 + 41 + 11 + 15 + 13 + 2} sub="vs 110 actual" color="#e9c46a" />
        </motion.div>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — GUEST HOUSE OCCUPANCY
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.1)}>
          <SectionTitle>🏨 Guest House Occupancy</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card md-chart-card--wide">
              <p className="md-chart-label">Rooms Available vs Occupied</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={guestHouseData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Bar dataKey="total" name="Total Rooms" fill="#457b9d" radius={[4,4,0,0]} />
                  <Bar dataKey="occupied" name="Occupied" fill="#e63946" radius={[4,4,0,0]} />
                  <Bar dataKey="vacant" name="Vacant" fill="#2a9d8f" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="md-chart-card">
              <p className="md-chart-label">Occupancy Rate</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={[{ name: 'Occupied', value: occupiedRooms }, { name: 'Vacant', value: totalRooms - occupiedRooms }]}
                    cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                    dataKey="value" paddingAngle={3}>
                    <Cell fill="#e63946" />
                    <Cell fill="rgba(255,255,255,0.08)" />
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="md-donut-label">{Math.round(occupiedRooms / totalRooms * 100)}% Occupied</p>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — MEAL REPORT
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.12)}>
          <SectionTitle>🍽️ Canteen Meal Report</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card md-chart-card--full">
              <p className="md-chart-label">Meals by Location (Breakfast / Lunch / Dinner)</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mealData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Bar dataKey="breakfast" name="Breakfast" fill="#f4a261" radius={[3,3,0,0]} />
                  <Bar dataKey="lunch" name="Lunch" fill="#e63946" radius={[3,3,0,0]} />
                  <Bar dataKey="dinner" name="Dinner" fill="#457b9d" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="md-meal-totals">
            {[{ label: 'Total Breakfast', val: 1078, color: '#f4a261' },
              { label: 'Total Lunch', val: 2015, color: '#e63946' },
              { label: 'Total Dinner', val: 761, color: '#457b9d' }].map(m => (
              <div key={m.label} className="md-meal-total-card" style={{ borderLeft: `3px solid ${m.color}` }}>
                <span style={{ color: m.color, fontSize: '1.6rem', fontWeight: 800 }}>{m.val.toLocaleString()}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — F&B MANPOWER
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.14)}>
          <SectionTitle>👷 F&B Department Manpower</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card md-chart-card--full">
              <p className="md-chart-label">Actual vs Present by Category</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={manpowerFB} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Bar dataKey="actual" name="Actual" fill="#457b9d" radius={[0,4,4,0]} />
                  <Bar dataKey="present" name="Present" fill="#2a9d8f" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════
            SECTION 5 — VEHICLE KM
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.16)}>
          <SectionTitle>🚗 Fleet Vehicle Movement (km)</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card md-chart-card--full">
              <p className="md-chart-label">Distance Covered per Vehicle Today · Total: {totalKm} km</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={vehicleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" km" />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="km" name="Km Covered" radius={[4,4,0,0]}>
                    {vehicleData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#2a9d8f' : '#457b9d'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════
            SECTION 6 — MAINTENANCE COMPLAINTS
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.18)}>
          <SectionTitle>🔧 Township Maintenance — Complaint Breakdown</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card">
              <p className="md-chart-label">Jobs by Category</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={complaintsPie} cx="50%" cy="50%"
                    outerRadius={100} dataKey="value" paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}>
                    {complaintsPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md-chart-card md-chart-card--wide">
              <p className="md-chart-label">Status by Category</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={complaintsStatus} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Bar dataKey="completed" name="Completed" fill="#2a9d8f" radius={[4,4,0,0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill="#f4a261" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════
            SECTION 7 — PAINT WORK PROGRESS
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.2)}>
          <SectionTitle>🎨 JBC Paint Work Progress (M²)</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card md-chart-card--full">
              <p className="md-chart-label">Target vs Achieved (Cumulative)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={paintProgress} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v.toLocaleString()} M²`} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Bar dataKey="target" name="Target (M²)" fill="rgba(255,255,255,0.12)" radius={[4,4,0,0]} />
                  <Bar dataKey="done" name="Achieved (M²)" fill="#e63946" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════
            SECTION 8 — MAINTENANCE MANPOWER
        ══════════════════════════════════════════════════ */}
        <motion.section className="md-section" {...fadeUp(0.22)}>
          <SectionTitle>👷 Maintenance Department Manpower</SectionTitle>
          <div className="md-chart-row">
            <div className="md-chart-card md-chart-card--full">
              <p className="md-chart-label">Actual vs Present</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={manpowerMaint} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Bar dataKey="actual" name="Actual" fill="#e9c46a" radius={[0,4,4,0]} />
                  <Bar dataKey="present" name="Present" fill="#2a9d8f" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        <motion.div className="md-footer-note" {...fadeUp(0.24)}>
          <span>📋 Data source: Township DPR Sheets — 23 Sept 2025</span>
          <span>JSW Group · Township Management Portal</span>
        </motion.div>

      </div>
    </div>
  );
}
