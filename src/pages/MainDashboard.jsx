import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
} from 'recharts';

// ─── DEFAULT DATA (from DPR Sheets 23/09/2025) ──────────────────────────────

// Sheet 1 — F&B: Manpower
const defaultManpowerFB = [
  { name: 'On Roll', actual: 11, present: 11 },
  { name: 'Associates', actual: 62, present: 53 },
  { name: 'Rashmi (JBN)', actual: 17, present: 16 },
  { name: 'Rashmi (JBC)', actual: 161, present: 135 },
  { name: 'Infinzy', actual: 7, present: 4 },
  { name: 'Sparkal', actual: 27, present: 25 },
];

// Sheet 1 — Guest House Occupancy
const defaultGuestHouseData = [
  { name: 'IB River', total: 76, occupied: 19, vacant: 57 },
  { name: 'VIP', total: 33, occupied: 9, vacant: 24 },
  { name: 'New GET', total: 42, occupied: 22, vacant: 20 },
];

// Sheet 1 — Meal Count (top canteens)
const defaultMealData = [
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
const defaultVehicleData = [
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
const defaultManpowerMaint = [
  { name: 'On Roll', actual: 14, present: 11 },
  { name: 'Associates', actual: 51, present: 41 },
  { name: 'Kanha Ent.', actual: 11, present: 11 },
  { name: 'Maa Sarala', actual: 17, present: 15 },
  { name: 'Samaleswari', actual: 15, present: 13 },
  { name: 'Global Elevator', actual: 2, present: 2 },
];

// Sheet 2 — Complaints by category
const defaultComplaintsPie = [
  { name: 'Civil', value: 13, color: '#e63946' },
  { name: 'Seepage', value: 26, color: '#f4a261' },
  { name: 'Carpentry', value: 12, color: '#2a9d8f' },
  { name: 'Plumbing', value: 2, color: '#457b9d' },
  { name: 'Electrical', value: 3, color: '#a8dadc' },
];

// Sheet 2 — Complaints status
const defaultComplaintsStatus = [
  { name: 'Civil', completed: 0, inProgress: 13, pending: 0 },
  { name: 'Seepage', completed: 0, inProgress: 26, pending: 0 },
  { name: 'Carpentry', completed: 12, inProgress: 0, pending: 0 },
  { name: 'Plumbing', completed: 2, inProgress: 0, pending: 0 },
  { name: 'Electrical', completed: 3, inProgress: 0, pending: 0 },
];

// Sheet 2 — JBC Paint work progress (%)
const defaultPaintProgress = [
  { name: 'Pappi Devi\nInt. Wall', target: 5000, done: 4766.73 },
  { name: 'Pappi Devi\nExt. Wall', target: 500, done: 135.84 },
  { name: 'Manoj Ent.\nInt. Wall', target: 5000, done: 5089.73 },
  { name: 'Manoj Ent.\nExt. Wall', target: 500, done: 405.85 },
];

// ─── Section Definitions ────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'guest-house', label: 'Guest House Occupancy', icon: '🏨' },
  { id: 'meal-report', label: 'Canteen Meal Report', icon: '🍽️' },
  { id: 'fb-manpower', label: 'F&B Dept. Manpower', icon: '👷' },
  { id: 'vehicle-fleet', label: 'Fleet Vehicle Movement', icon: '🚗' },
  { id: 'complaints', label: 'Maintenance Complaints', icon: '🔧' },
  { id: 'paint-work', label: 'Paint Work Progress', icon: '🎨' },
  { id: 'maint-manpower', label: 'Maintenance Manpower', icon: '🏗️' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' },
  labelStyle: { color: '#94a3b8', fontSize: 12 },
  itemStyle: { color: '#f1f5f9' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MainDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('guest-house');
  const [sectionsPanelOpen, setSectionsPanelOpen] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [importFileName, setImportFileName] = useState('');

  // ─── Compute KPI values ──────────────────────────────────────────
  const mealData = importedData?.mealData || [];
  const guestHouseData = importedData?.guestHouseData || [];
  const vehicleData = importedData?.vehicleData || [];
  const manpowerFB = importedData?.manpowerFB || [];
  const manpowerMaint = importedData?.manpowerMaint || [];
  const complaintsPie = importedData?.complaintsPie || [];
  const complaintsStatus = importedData?.complaintsStatus || [];
  const paintProgress = importedData?.paintProgress || [];

  const totalBreakfast = mealData.reduce((s, m) => s + (m.breakfast || 0), 0);
  const totalLunch = mealData.reduce((s, m) => s + (m.lunch || 0), 0);
  const totalDinner = mealData.reduce((s, m) => s + (m.dinner || 0), 0);
  const totalMeals = totalBreakfast + totalLunch + totalDinner;
  const totalKm = vehicleData.reduce((s, v) => s + (v.km || 0), 0);
  const totalRooms = guestHouseData.reduce((s, g) => s + (g.total || 0), 0);
  const occupiedRooms = guestHouseData.reduce((s, g) => s + (g.occupied || 0), 0);
  const totalComplaints = complaintsPie.reduce((a, b) => a + b.value, 0);

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  // ─── Import Handler ───────────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const parsed = {};

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);
          parsed[sheetName] = json;
        });

        // Map imported sheets to data sections
        const imported = {};
        if (parsed['MealData'] || parsed['Meals'] || parsed['Sheet1']) {
          const src = parsed['MealData'] || parsed['Meals'] || parsed['Sheet1'];
          if (src.length > 0 && src[0].name !== undefined) {
            imported.mealData = src;
          }
        }
        if (parsed['GuestHouse']) imported.guestHouseData = parsed['GuestHouse'];
        if (parsed['Vehicles'] || parsed['Fleet']) imported.vehicleData = parsed['Vehicles'] || parsed['Fleet'];
        if (parsed['ManpowerFB']) imported.manpowerFB = parsed['ManpowerFB'];
        if (parsed['ManpowerMaint']) imported.manpowerMaint = parsed['ManpowerMaint'];
        if (parsed['Complaints']) imported.complaintsPie = parsed['Complaints'];
        if (parsed['ComplaintsStatus']) imported.complaintsStatus = parsed['ComplaintsStatus'];
        if (parsed['PaintProgress']) imported.paintProgress = parsed['PaintProgress'];

        setImportedData(Object.keys(imported).length > 0 ? imported : parsed);
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to parse Excel file. Please check the format.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // ─── Export Handler ───────────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const addSheet = (data, name) => {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    };

    addSheet(guestHouseData, 'GuestHouse');
    addSheet(mealData, 'MealData');
    addSheet(manpowerFB, 'ManpowerFB');
    addSheet(vehicleData, 'Vehicles');
    addSheet(manpowerMaint, 'ManpowerMaint');
    addSheet(complaintsPie, 'Complaints');
    addSheet(complaintsStatus, 'ComplaintsStatus');
    addSheet(paintProgress, 'PaintProgress');

    XLSX.writeFile(wb, `Township_DPR_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ─── Visualization Renderer ────────────────────────────────────────
  const renderVisualization = () => {
    if (!importedData) {
      return (
        <motion.div
          key="upload-prompt"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="md2-upload-placeholder"
        >
          <div className="md2-upload-card">
            <div className="md2-upload-icon-wrapper">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md2-upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="md2-upload-title">No DPR Data Loaded</h3>
            <p className="md2-upload-desc">
              Please upload the Township Daily Progress Report (DPR) spreadsheet to generate interactive charts, check occupancy rates, canteen meals, and maintenance metrics.
            </p>
            <button className="md2-upload-btn" onClick={() => fileInputRef.current?.click()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Select Excel File</span>
            </button>
            <div className="md2-upload-formats">
              Supported formats: <strong>.xlsx, .xls, .csv</strong>
            </div>
            <div className="md2-upload-requirements">
              <p className="md2-requirements-title">Expected Data Sheets:</p>
              <div className="md2-requirements-grid">
                <div className="md2-req-item">🏨 Guest House</div>
                <div className="md2-req-item">🍽️ Canteen Meals</div>
                <div className="md2-req-item">👷 F&B Manpower</div>
                <div className="md2-req-item">🚗 Fleet Movement</div>
                <div className="md2-req-item">🔧 Maintenance</div>
                <div className="md2-req-item">🎨 Paint Progress</div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    const contentVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    };

    switch (activeSection) {
      case 'guest-house':
        return (
          <motion.div key="guest-house" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel md2-chart-panel--large">
                <p className="md2-chart-label">Rooms Available vs Occupied</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={guestHouseData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="total" name="Total Rooms" fill="#457b9d" radius={[4,4,0,0]} />
                    <Bar dataKey="occupied" name="Occupied" fill="#e63946" radius={[4,4,0,0]} />
                    <Bar dataKey="vacant" name="Vacant" fill="#2a9d8f" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="md2-chart-panel">
                <p className="md2-chart-label">Occupancy Rate</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={[{ name: 'Occupied', value: occupiedRooms }, { name: 'Vacant', value: totalRooms - occupiedRooms }]}
                      cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                      dataKey="value" paddingAngle={3}>
                      <Cell fill="#e63946" />
                      <Cell fill="rgba(255,255,255,0.08)" />
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle">
                      <tspan x="50%" dy="-2" fill="#ffffff" style={{ fontSize: '20px', fontWeight: '700' }}>
                        {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
                      </tspan>
                      <tspan x="50%" dy="20" fill="#94a3b8" style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Occupied
                      </tspan>
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              {guestHouseData.map(g => (
                <div key={g.name} className="md2-kpi-mini">
                  <span className="md2-kpi-mini-value">{g.occupied}/{g.total}</span>
                  <span className="md2-kpi-mini-label">{g.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'meal-report':
        return (
          <motion.div key="meal-report" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel md2-chart-panel--full">
                <p className="md2-chart-label">Meals by Location (Breakfast / Lunch / Dinner)</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={mealData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="breakfast" name="Breakfast" fill="#f4a261" radius={[3,3,0,0]} />
                    <Bar dataKey="lunch" name="Lunch" fill="#e63946" radius={[3,3,0,0]} />
                    <Bar dataKey="dinner" name="Dinner" fill="#457b9d" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              {[{ label: 'Breakfast', val: totalBreakfast, color: '#f4a261' },
                { label: 'Lunch', val: totalLunch, color: '#e63946' },
                { label: 'Dinner', val: totalDinner, color: '#457b9d' },
                { label: 'Total', val: totalMeals, color: '#2a9d8f' },
              ].map(m => (
                <div key={m.label} className="md2-kpi-mini" style={{ borderLeft: `3px solid ${m.color}` }}>
                  <span className="md2-kpi-mini-value" style={{ color: m.color }}>{m.val.toLocaleString()}</span>
                  <span className="md2-kpi-mini-label">{m.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'fb-manpower':
        return (
          <motion.div key="fb-manpower" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel md2-chart-panel--full">
                <p className="md2-chart-label">Actual vs Present by Category</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={manpowerFB} layout="vertical" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="actual" name="Actual" fill="#457b9d" radius={[0,4,4,0]} />
                    <Bar dataKey="present" name="Present" fill="#2a9d8f" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#457b9d' }}>{manpowerFB.reduce((s, m) => s + m.actual, 0)}</span>
                <span className="md2-kpi-mini-label">Total Actual</span>
              </div>
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#2a9d8f' }}>{manpowerFB.reduce((s, m) => s + m.present, 0)}</span>
                <span className="md2-kpi-mini-label">Total Present</span>
              </div>
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#e63946' }}>
                  {Math.round((manpowerFB.reduce((s, m) => s + m.present, 0) / manpowerFB.reduce((s, m) => s + m.actual, 0)) * 100)}%
                </span>
                <span className="md2-kpi-mini-label">Attendance Rate</span>
              </div>
            </div>
          </motion.div>
        );

      case 'vehicle-fleet':
        return (
          <motion.div key="vehicle-fleet" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel md2-chart-panel--full">
                <p className="md2-chart-label">Distance Covered per Vehicle Today · Total: {totalKm} km</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={vehicleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" km" />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Bar dataKey="km" name="Km Covered" radius={[4,4,0,0]}>
                      {vehicleData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? '#2a9d8f' : '#457b9d'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#2a9d8f' }}>{totalKm}</span>
                <span className="md2-kpi-mini-label">Total Km Today</span>
              </div>
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#457b9d' }}>{vehicleData.length}</span>
                <span className="md2-kpi-mini-label">Vehicles Active</span>
              </div>
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#f4a261' }}>{Math.round(totalKm / vehicleData.length)}</span>
                <span className="md2-kpi-mini-label">Avg Km/Vehicle</span>
              </div>
            </div>
          </motion.div>
        );

      case 'complaints':
        return (
          <motion.div key="complaints" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel">
                <p className="md2-chart-label">Jobs by Category</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={complaintsPie} cx="50%" cy="50%"
                      outerRadius={100} dataKey="value" paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}>
                      {complaintsPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md2-chart-panel md2-chart-panel--large">
                <p className="md2-chart-label">Status by Category</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complaintsStatus} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="completed" name="Completed" fill="#2a9d8f" radius={[4,4,0,0]} />
                    <Bar dataKey="inProgress" name="In Progress" fill="#f4a261" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#e63946' }}>{totalComplaints}</span>
                <span className="md2-kpi-mini-label">Total Jobs</span>
              </div>
              {complaintsPie.map(c => (
                <div key={c.name} className="md2-kpi-mini">
                  <span className="md2-kpi-mini-value" style={{ color: c.color }}>{c.value}</span>
                  <span className="md2-kpi-mini-label">{c.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'paint-work':
        return (
          <motion.div key="paint-work" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel md2-chart-panel--full">
                <p className="md2-chart-label">Target vs Achieved (Cumulative M²)</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={paintProgress} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} formatter={(v) => `${v.toLocaleString()} M²`} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="target" name="Target (M²)" fill="rgba(255,255,255,0.12)" radius={[4,4,0,0]} />
                    <Bar dataKey="done" name="Achieved (M²)" fill="#e63946" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              {paintProgress.map(p => (
                <div key={p.name} className="md2-kpi-mini">
                  <span className="md2-kpi-mini-value" style={{ color: p.done >= p.target ? '#2a9d8f' : '#f4a261' }}>
                    {Math.round((p.done / p.target) * 100)}%
                  </span>
                  <span className="md2-kpi-mini-label">{p.name.replace('\n', ' ')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'maint-manpower':
        return (
          <motion.div key="maint-manpower" {...contentVariants} className="md2-viz-content">
            <div className="md2-chart-grid">
              <div className="md2-chart-panel md2-chart-panel--full">
                <p className="md2-chart-label">Actual vs Present</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={manpowerMaint} layout="vertical" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={false} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="actual" name="Actual" fill="#e9c46a" radius={[0,4,4,0]} />
                    <Bar dataKey="present" name="Present" fill="#2a9d8f" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="md2-kpi-strip">
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#e9c46a' }}>{manpowerMaint.reduce((s, m) => s + m.actual, 0)}</span>
                <span className="md2-kpi-mini-label">Total Actual</span>
              </div>
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#2a9d8f' }}>{manpowerMaint.reduce((s, m) => s + m.present, 0)}</span>
                <span className="md2-kpi-mini-label">Total Present</span>
              </div>
              <div className="md2-kpi-mini">
                <span className="md2-kpi-mini-value" style={{ color: '#e63946' }}>
                  {Math.round((manpowerMaint.reduce((s, m) => s + m.present, 0) / manpowerMaint.reduce((s, m) => s + m.actual, 0)) * 100)}%
                </span>
                <span className="md2-kpi-mini-label">Attendance Rate</span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page md2-page">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx,.xls,.csv"
        onChange={handleImport}
      />

      {/* ── Top Navigation Bar ── */}
      <nav className="md2-topbar">
        <div className="md2-topbar-inner">
          <div className="md2-topbar-left">
            {/* Hamburger Menu */}
            <button className="md2-hamburger" onClick={() => setSectionsPanelOpen(!sectionsPanelOpen)} title="Open sections">
              <span className={`md2-hamburger-line ${sectionsPanelOpen ? 'md2-hamburger-line--open' : ''}`} />
              <span className={`md2-hamburger-line ${sectionsPanelOpen ? 'md2-hamburger-line--open' : ''}`} />
              <span className={`md2-hamburger-line ${sectionsPanelOpen ? 'md2-hamburger-line--open' : ''}`} />
            </button>
            <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              <img src="/images/jsw_logo_clean.png" alt="JSW" className="nav-logo-img" />
            </div>
            <div className="md2-topbar-divider" />
            <h1 className="md2-topbar-title">Township Daily Report</h1>
          </div>

          <div className="md2-topbar-right">
            <div className="md2-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Search sections..." className="md2-search-input"
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  if (!q) return;
                  const match = SECTIONS.find(s => s.label.toLowerCase().includes(q));
                  if (match) setActiveSection(match.id);
                }}
              />
            </div>

            {/* Import Button */}
            <button className="md2-action-btn md2-action-btn--import" onClick={() => fileInputRef.current?.click()} title="Import Excel Sheet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Import</span>
            </button>

            {/* Profile / Logout */}
            <button className="profile-btn" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
              <div className="profile-avatar">{user?.name?.charAt(0) || 'A'}</div>
              <span className="profile-name">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Sections Popup Overlay ── */}
      <AnimatePresence>
        {sectionsPanelOpen && (
          <>
            <motion.div
              className="md2-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSectionsPanelOpen(false)}
            />
            <motion.div
              className="md2-popup-panel"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top left' }}
            >
              <div className="md2-popup-header">
                <h3 className="md2-popup-title">Sections</h3>
                <button className="md2-popup-close" onClick={() => setSectionsPanelOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="md2-popup-grid">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className={`md2-popup-item ${activeSection === section.id ? 'md2-popup-item--active' : ''}`}
                    onClick={() => { setActiveSection(section.id); setSectionsPanelOpen(false); }}
                  >
                    <span className="md2-popup-item-icon">{section.icon}</span>
                    <span className="md2-popup-item-label">{section.label}</span>
                    {activeSection === section.id && (
                      <span className="md2-popup-item-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="md2-popup-footer">
                <div className="md2-popup-kpi">
                  <span className="md2-popup-kpi-value">{totalMeals.toLocaleString()}</span>
                  <span className="md2-popup-kpi-label">Meals Today</span>
                </div>
                <div className="md2-popup-kpi-divider" />
                <div className="md2-popup-kpi">
                  <span className="md2-popup-kpi-value">{occupiedRooms}/{totalRooms}</span>
                  <span className="md2-popup-kpi-label">Rooms Occupied</span>
                </div>
                <div className="md2-popup-kpi-divider" />
                <div className="md2-popup-kpi">
                  <span className="md2-popup-kpi-value">{totalKm}</span>
                  <span className="md2-popup-kpi-label">Fleet Km</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <div className="md2-layout">
        <main className="md2-content">
          {/* Content Header */}
          <div className="md2-content-header">
            <div className="md2-content-header-left">
              <span className="md2-content-icon">{currentSection?.icon}</span>
              <div>
                <h2 className="md2-content-title">Township Daily Report</h2>
                <p className="md2-content-subtitle">
                  Data source: Township DPR Sheets
                  {importFileName && <span className="md2-import-badge"> · Imported: {importFileName}</span>}
                </p>
              </div>
            </div>
            <div className="md2-content-header-right">
              <span className="md2-date-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* ── Two-Panel Split ── */}
          <div className="md2-split">
            {/* Left Panel — Section List */}
            <div className="md2-split-left">
              <div className="md2-split-left-header">
                <span className="md2-split-left-label">Data Sections</span>
              </div>
              <div className="md2-split-left-list">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className={`md2-split-item ${activeSection === section.id ? 'md2-split-item--active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="md2-split-item-icon">{section.icon}</span>
                    <span className="md2-split-item-label">{section.label}</span>
                    {activeSection === section.id && (
                      <motion.div className="md2-split-item-bar" layoutId="splitIndicator" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel — Visualization */}
            <div className="md2-split-right">
              <div className="md2-split-right-header">
                <span className="md2-split-right-icon">{currentSection?.icon}</span>
                <span className="md2-split-right-title">{currentSection?.label}</span>
              </div>
              <div className="md2-split-right-body">
                <AnimatePresence mode="wait">
                  {renderVisualization()}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="md2-bottom-bar">
            <div className="md2-bottom-bar-left">
              <span className="md2-section-badge">
                {currentSection?.icon} {currentSection?.label}
              </span>
              <span className="md2-data-info">
                {user?.name && `· ${user.name}`} · JSW Group · Township Management Portal
              </span>
            </div>
            {/* Export Button */}
            <button className="md2-action-btn md2-action-btn--export" onClick={handleExport} title="Export to Excel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export Data</span>
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
