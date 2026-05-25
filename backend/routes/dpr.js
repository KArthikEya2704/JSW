const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const DprReport = require('../models/DprReport');
const { validateDprData } = require('../utils/dprValidator');

const router = express.Router();

// Multi-part upload configuration using memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());

    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed!'));
  }
});

// Standard Default / Seed values for both DPR categories
const DEFAULT_SECTIONS = {
  manpowerFB: [
    { name: 'On Roll', actual: 11, present: 11 },
    { name: 'Associates', actual: 62, present: 53 },
    { name: 'Rashmi (JBN)', actual: 17, present: 16 },
    { name: 'Rashmi (JBC)', actual: 161, present: 135 },
    { name: 'Infinzy', actual: 7, present: 4 },
    { name: 'Sparkal', actual: 27, present: 25 },
  ],
  guestHouseData: [
    { name: 'IB River', total: 76, occupied: 19, vacant: 57 },
    { name: 'VIP', total: 33, occupied: 9, vacant: 24 },
    { name: 'New GET', total: 42, occupied: 22, vacant: 20 },
  ],
  mealData: [
    { name: 'NG V.I.P', breakfast: 197, lunch: 484, dinner: 148 },
    { name: 'NG VIP Mail', breakfast: 107, lunch: 166, dinner: 114 },
    { name: 'WRM', breakfast: 97, lunch: 163, dinner: 71 },
    { name: 'CRM', breakfast: 67, lunch: 114, dinner: 27 },
    { name: 'CSP', breakfast: 98, lunch: 122, dinner: 48 },
    { name: 'GET Mail', breakfast: 80, lunch: 200, dinner: 106 },
    { name: 'V.I.P', breakfast: 31, lunch: 41, dinner: 19 },
    { name: 'PELLET', breakfast: 38, lunch: 82, dinner: 27 },
  ],
  vehicleData: [
    { name: 'MG-EV 9304', km: 115 },
    { name: 'MG-EV 9346', km: 138 },
    { name: 'MG-EV 9357', km: 97 },
    { name: 'MG-EV 9203', km: 76 },
    { name: 'MG-EV 9147', km: 76 },
    { name: 'MG-EV 9398', km: 83 },
    { name: 'MG-EV 1797', km: 83 },
    { name: 'MG-EV 9273', km: 21 },
    { name: 'Bolero', km: 41 },
  ],
  manpowerMaint: [
    { name: 'On Roll', actual: 14, present: 11 },
    { name: 'Associates', actual: 51, present: 41 },
    { name: 'Kanha Ent.', actual: 11, present: 11 },
    { name: 'Maa Sarala', actual: 17, present: 15 },
    { name: 'Samaleswari', actual: 15, present: 13 },
    { name: 'Global Elevator', actual: 2, present: 2 },
  ],
  complaintsPie: [
    { name: 'Civil', value: 13, color: '#c0293a' },
    { name: 'Seepage', value: 26, color: '#e07a5f' },
    { name: 'Carpentry', value: 12, color: '#2a9d8f' },
    { name: 'Plumbing', value: 2, color: '#0b4d8c' },
    { name: 'Electrical', value: 3, color: '#475569' },
  ],
  complaintsStatus: [
    { name: 'Civil', completed: 0, inProgress: 13, pending: 0 },
    { name: 'Seepage', completed: 0, inProgress: 26, pending: 0 },
    { name: 'Carpentry', completed: 12, inProgress: 0, pending: 0 },
    { name: 'Plumbing', completed: 2, inProgress: 0, pending: 0 },
    { name: 'Electrical', completed: 3, inProgress: 0, pending: 0 },
  ],
  paintProgress: [
    { name: 'Pappi Devi\nInt. Wall', target: 5000, done: 4766.73 },
    { name: 'Pappi Devi\nExt. Wall', target: 500, done: 135.84 },
    { name: 'Manoj Ent.\nInt. Wall', target: 5000, done: 5089.73 },
    { name: 'Manoj Ent.\nExt. Wall', target: 500, done: 405.85 },
  ],
  complaintsList: [
    {
      department: 'Civil',
      jobNo: '5064',
      description: 'Entrance grill painting work start at M3 building ground floor',
      completedDetails: '',
      pendingDetails: 'work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '5317',
      description: 'Vehicle parking painting near L & M block',
      completedDetails: '',
      pendingDetails: 'Work stopped for certain time due to rain',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'N & O Block parking painting',
      completedDetails: '',
      pendingDetails: 'Work stopped for certain time due to rain',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'E3-701 Putty & painting work',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'NEW GET D-914 Putty & painting work',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'A & C Block no parking painting',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'D-001 Putty & painting',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'E3-603 Kitchen sink repairing',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'C-203(Vacant room) Both bathroom wall tiles fixing',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'NEW GET CF-102(Vacant room) Full flat painting',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'H-604 Putty & painting',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'M3-604(Vacant room) Full flat painting',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Civil',
      jobNo: '',
      description: 'Temple lord Vishwakarma stage marble work',
      completedDetails: '',
      pendingDetails: 'Work in progress',
      feedback: ''
    },
    {
      department: 'Plumbing',
      jobNo: '',
      description: 'FU1-005 Kitchen sink waste coupling damage',
      completedDetails: 'New installed',
      pendingDetails: '',
      feedback: 'Outstanding'
    },
    {
      department: 'Plumbing',
      jobNo: '',
      description: 'E3-601 Kitchen sink cock damage',
      completedDetails: 'New installed',
      pendingDetails: '',
      feedback: 'Outstanding'
    },
    {
      department: 'Seepage',
      jobNo: '5888',
      description: 'E2-701 Balcony ceiling seepage',
      completedDetails: '',
      pendingDetails: 'Work will start as soon as possible',
      feedback: ''
    },
    {
      department: 'Seepage',
      jobNo: '6769',
      description: 'E2-804 Hall ceiling seepage',
      completedDetails: '',
      pendingDetails: 'Work will start as soon as possible',
      feedback: ''
    },
    {
      department: 'Seepage',
      jobNo: '',
      description: 'J-302 Master bedroom ceiling seepage',
      completedDetails: '',
      pendingDetails: 'Work will start as soon as possible',
      feedback: ''
    },
    {
      department: 'Seepage',
      jobNo: '8893',
      description: 'IB Basement floor seepage',
      completedDetails: '',
      pendingDetails: 'Work under progress',
      feedback: ''
    }
  ],
  horticultureManpower: [
    { name: 'On Roll', actual: 17, present: 16 },
    { name: 'Associates', actual: 13, present: 13 },
    { name: 'Sri Ram Ent.', actual: 20, present: 14 },
    { name: 'Pradhan Ent.', actual: 22, present: 19 },
    { name: 'Maa Mangala', actual: 10, present: 11 },
    { name: 'Maa Ramchandi', actual: 16, present: 5 },
    { name: 'Bishnu Ent.', actual: 25, present: 17 },
    { name: 'Maa Sarala Eng.', actual: 3, present: 3 },
  ],
  horticultureKPIs: {
    plantsTownship: 'NIL',
    plantsPlantArea: 'NIL',
    plantsOutside: 'NIL',
    nurseryDetails: ['Forest Trees - 16000 Nos.', 'Shrubs - 20000 Nos.', 'Indoor - 2550 Nos.'],
    maintenanceDetails: ['Total Green Cover = 175 Acre (708200 sq mtr)', 'A. Township - 80 Acre', 'B. Nursery, 700 Acre, outside - 33.5 Acre', 'C. Plant - 61.5 Acre']
  },
  plantAdminManpower: [
    { name: 'Gen Maintenance', actual: 89, present: 83 },
    { name: 'Road & Drain', actual: 79, present: 57 },
    { name: 'Employee Mobility', actual: 80, present: 54 },
    { name: 'Worker Colonies', actual: 29, present: 18 },
  ],
  plantAdminVehicles: [
    { name: 'Road Sweeper', count: 7 },
    { name: 'Hiwa', count: 3 },
    { name: 'JCB', count: 3 },
    { name: 'Tractor', count: 4 },
    { name: 'Cesspool', count: 2 },
  ],
  plantAdminKPIs: {
    totalEquipment: 11,
    totalVehicles: 36
  },
  roadDrainOperatingHours: [
    { name: 'Road Sweeper', hours: 44.2 },
    { name: 'JCB', hours: 19.4 },
    { name: 'Tractor / Farana', hours: 22.8 },
    { name: 'Cesspool', hours: 35 },
    { name: 'Hywa', hours: 33 },
    { name: 'Camphor', hours: 47 }
  ],
  roadDrainShifts: [
    { name: 'Shift- A', activeVehicles: 7 },
    { name: 'Shift- B', activeVehicles: 4 },
    { name: 'Shift- C', activeVehicles: 2 },
    { name: 'Shift- G-R', activeVehicles: 15 }
  ],
  roadDrainKPIs: {
    totalHours: 201.4,
    totalKM: 0,
    totalDiesel: 14.3
  },
  empMobilityBusData: [
    { name: 'OD15M 5829', km: 58, fuel: 62 },
    { name: 'OD15M 0751', km: 31, fuel: 72 },
    { name: 'OR15K 4008', km: 19, fuel: 151 },
    { name: 'OR15K 4010', km: 29, fuel: 82 },
    { name: 'OD15A 5575', km: 31, fuel: 34 },
    { name: 'OD15A 5980', km: 37, fuel: 33 },
    { name: 'OD15A 5981', km: 65, fuel: 22 },
    { name: 'OD15A 5982', km: 68, fuel: 88 }
  ],
  empMobilityKPIs: {
    totalBuses: 14,
    totalKM: 641,
    totalFuel: 809
  }
};

// --- F&B Single-Tab Sheet Parser ---
function parseFbSingleTab(rows) {
  const parsed = {
    manpowerFB: [],
    guestHouseData: [],
    mealData: [],
    vehicleData: []
  };

  // 1. Manpower
  rows.forEach((row) => {
    if (!row || row.length < 2) return;
    const col1 = String(row[1] || '').trim();
    const actual = Number(row[2]) || 0;
    const present = Number(row[3]) || 0;

    if (col1.includes('Total no. of On Roll Employees')) {
      parsed.manpowerFB.push({ name: 'On Roll', actual, present });
    } else if (col1.includes('Total no. of On Associate Employees')) {
      parsed.manpowerFB.push({ name: 'Associates', actual, present });
    } else if (col1.includes('Rashmi Hospitality Pvt. Ltd.') || col1.includes('Rashmi Hospitality (JBN)')) {
      parsed.manpowerFB.push({ name: 'Rashmi (JBN)', actual, present });
    } else if (col1.includes('Rashmi Hospitality') && !col1.includes('Pvt. Ltd.')) {
      parsed.manpowerFB.push({ name: 'Rashmi (JBC)', actual, present });
    } else if (col1.includes('Infinzy')) {
      parsed.manpowerFB.push({ name: 'Infinzy', actual, present });
    } else if (col1.includes('Sparkal')) {
      parsed.manpowerFB.push({ name: 'Sparkal', actual, present });
    }
  });

  // 2. Guest House (filter with col0 checking to ignore meal counts)
  rows.forEach((row) => {
    if (!row || row.length < 3) return;
    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();
    const total = Number(row[2]) || 0;
    const occupied = Number(row[3]) || 0;
    const vacant = total - occupied;

    if (col0.startsWith('(')) {
      if (col1.includes('IB River Guest House')) {
        parsed.guestHouseData.push({ name: 'IB River', total, occupied, vacant });
      } else if (col1.includes('VIP Guest House')) {
        parsed.guestHouseData.push({ name: 'VIP', total, occupied, vacant });
      } else if (col1.includes('New GET Guest House')) {
        parsed.guestHouseData.push({ name: 'New GET', total, occupied, vacant });
      }
    }
  });

  // 3. Canteen Meal Report
  let inMealSection = false;
  rows.forEach((row) => {
    if (!row) return;
    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();

    if (col0 === '4' && col1.includes('Meal Report')) {
      inMealSection = true;
      return;
    }
    if (inMealSection) {
      if (col1.includes('TOTAL')) {
        inMealSection = false;
        return;
      }
      if (col1 && col1 !== 'Details' && col1 !== 'Location' && !col1.includes('Snacks') && !col1.includes('TEA')) {
        const name = col1;
        const breakfast = Number(row[2]) || 0;
        const lunch = Number(row[3]) || 0;
        const dinner = Number(row[4]) || 0;
        parsed.mealData.push({ name, breakfast, lunch, dinner });
      }
    }
  });

  // 4. Vehicle Movement
  let inVehicleSection = false;
  rows.forEach((row) => {
    if (!row) return;
    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();

    if (col0 === '6' && col1.includes('Vehicle Movement')) {
      inVehicleSection = true;
      return;
    }
    if (inVehicleSection) {
      if (col1.includes('Total Running')) {
        inVehicleSection = false;
        return;
      }
      if (col1 && col1 !== 'Vehicle No' && col0 !== 'S.n.' && col0 !== 'Sl. No.') {
        let cleanName = col1;
        if (col1.includes('MG-EV')) {
          const match = col1.match(/(\d{4})/);
          cleanName = match ? `MG-EV ${match[1]}` : 'MG-EV';
        } else if (col1.toLowerCase().includes('bolero')) {
          cleanName = 'Bolero';
        } else if (col1.toLowerCase().includes('innova')) {
          cleanName = 'Innova';
        } else if (col1.toLowerCase().includes('honda')) {
          cleanName = 'Honda City';
        } else if (col1.toLowerCase().includes('pick up')) {
          cleanName = 'Pick up';
        }
        
        const km = Number(row[6]) || 0;
        // Filter active vehicles (km > 0) to avoid crowding the UI graphs
        if (km > 0) {
          parsed.vehicleData.push({ name: cleanName, km });
        }
      }
    }
  });

  return parsed;
}

// --- Maintenance Single-Tab Sheet Parser ---
function parseMaintSingleTab(rows) {
  const parsed = {
    manpowerMaint: [],
    paintProgress: [],
    complaintsPie: [],
    complaintsStatus: [],
    complaintsList: []
  };

  // 1. Manpower
  rows.forEach((row) => {
    if (!row || row.length < 2) return;
    const col1 = String(row[1] || '').trim();
    const actual = Number(row[2]) || 0;
    const present = Number(row[4]) || 0;

    if (col1.includes('Total no. of On Roll Employees')) {
      parsed.manpowerMaint.push({ name: 'On Roll', actual, present });
    } else if (col1.includes('Total no. of On Associate Employees')) {
      parsed.manpowerMaint.push({ name: 'Associates', actual, present });
    } else if (col1.includes('Kanha Enterprises')) {
      parsed.manpowerMaint.push({ name: 'Kanha Ent.', actual, present });
    } else if (col1.includes('Maa Sarala')) {
      parsed.manpowerMaint.push({ name: 'Maa Sarala', actual, present });
    } else if (col1.includes('Samaleswari Construction')) {
      parsed.manpowerMaint.push({ name: 'Samaleswari', actual, present });
    } else if (col1.includes('Global Elevator')) {
      parsed.manpowerMaint.push({ name: 'Global Elevator', actual, present });
    }
  });

  // 2. Paint Progress (resilient to M2/M² suffixes)
  rows.forEach((row) => {
    if (!row || row.length < 4) return;
    const contractor = String(row[1] || '').trim();
    const desc = String(row[3] || '').trim();
    const targetVal = String(row[4] || '');
    const doneVal = String(row[5] || '');

    if (contractor.includes('Pappi Devi') || contractor.includes('Manoj Enterprises')) {
      const contractorName = contractor.includes('Pappi Devi') ? 'Pappi Devi' : 'Manoj Ent.';
      if (desc.includes('Interior') || desc.includes('Exterior')) {
        const shortDesc = desc.includes('Interior') ? 'Int. Wall' : 'Ext. Wall';
        
        // Use parseFloat to resiliently extract numbers before unit space/symbols
        const target = parseFloat(targetVal) || 0;
        const done = parseFloat(doneVal) || 0;
        
        parsed.paintProgress.push({
          name: `${contractorName}\n${shortDesc}`,
          target,
          done
        });
      }
    }
  });

  // 3. Complaints
  const categoryKeys = {
    'civil': { name: 'Civil', color: '#c0293a', aliases: ['civil'] },
    'seepage': { name: 'Seepage', color: '#e07a5f', aliases: ['seepage'] },
    'carpentry': { name: 'Carpentry', color: '#2a9d8f', aliases: ['carpentry', 'carpenter'] },
    'plumbing': { name: 'Plumbing', color: '#0b4d8c', aliases: ['plumb', 'plumbing', 'plumber'] },
    'electrical': { name: 'Electrical', color: '#475569', aliases: ['electric', 'electrical', 'electrician'] }
  };

  let currentCategory = null;
  
  // Default indices based on the standard JSW sheet template
  let jobNoIdx = 2;
  let descIdx = 3;
  let completedIdx = 4;
  let pendingIdx = 5;
  let feedbackIdx = 6;

  rows.forEach((row) => {
    if (!row || !Array.isArray(row)) return;

    // A. Dynamic Column Header Detection:
    // We only treat a row as a header row if it contains key unique descriptors of the complaint ledger header.
    let isPotentialHeaderRow = false;
    row.forEach((cell) => {
      const cellStr = String(cell || '').trim().toLowerCase();
      if (
        cellStr.includes('job no') || cellStr === 'jobno' || cellStr === 'job.no' ||
        cellStr.includes('complain received') || cellStr === 'work description' || 
        cellStr.includes('complaint details') || cellStr.includes('description of complain')
      ) {
        isPotentialHeaderRow = true;
      }
    });

    if (isPotentialHeaderRow) {
      row.forEach((cell, idx) => {
        const cellStr = String(cell || '').trim().toLowerCase();
        if (cellStr.includes('job no') || cellStr === 'jobno' || cellStr === 'job.no') {
          jobNoIdx = idx;
        } else if (cellStr.includes('complain received') || cellStr === 'work description' || cellStr.includes('complaint details') || cellStr.includes('description of complain')) {
          descIdx = idx;
        } else if (cellStr.includes('completed details') || cellStr === 'complain completed' || cellStr === 'action taken' || cellStr === 'completed') {
          completedIdx = idx;
        } else if (cellStr.includes('pending details') || cellStr === 'pending' || cellStr.includes('outstanding')) {
          pendingIdx = idx;
        } else if (cellStr === 'feedback' || cellStr.includes('feedback details')) {
          feedbackIdx = idx;
        }
      });
      return; // Skip headers row from list
    }

    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();

    // B. Category Header Detection:
    // Scan all cells in the row to find parenthetical numbering or department name indicators.
    let detectedMatchedCategory = null;
    row.forEach((cell) => {
      const cellStr = String(cell || '').trim();
      const cellLower = cellStr.toLowerCase();

      Object.keys(categoryKeys).forEach(k => {
        const matchFound = categoryKeys[k].aliases.some(alias => cellLower.includes(alias));
        if (matchFound) {
          const hasNumbering = cellStr.startsWith('(') || cellStr.match(/^\d+/) || row.some(c => String(c || '').trim().startsWith('('));
          if (hasNumbering || cellLower.includes('work') || cellLower.includes('job') || cellLower.includes('section') || cellLower.includes('dept')) {
            detectedMatchedCategory = categoryKeys[k].name;
          }
        }
      });
    });

    if (detectedMatchedCategory) {
      currentCategory = detectedMatchedCategory;
      if (!parsed.complaintsStatus.some(s => s.name === currentCategory)) {
        parsed.complaintsStatus.push({ name: currentCategory, completed: 0, inProgress: 0, pending: 0 });
      }
      
      const jobNoColVal = String(row[jobNoIdx] || '').trim();
      const descColVal = String(row[descIdx] || '').trim();
      const completedColVal = String(row[completedIdx] || '').trim();
      const pendingColVal = String(row[pendingIdx] || '').trim();
      const isHeaderLabel = descColVal === 'Complain Received from details' || descColVal === 'Work Description' || descColVal === 'Description of Complain';
      
      if (isHeaderLabel || (!jobNoColVal && !descColVal && !completedColVal && !pendingColVal)) {
        return; // Category header matches and no complaint info on this row, safe to skip
      }
    }

    // C. Parsing Active Section:
    if (currentCategory) {
      // End of category section detection: any cell in first 3 columns contains 'total'
      const hasTotal = row.slice(0, 3).some(cell => String(cell || '').toLowerCase().includes('total'));
      if (hasTotal) {
        currentCategory = null;
        return;
      }

      const jobNoCol = String(row[jobNoIdx] || '').trim();
      const descCol = String(row[descIdx] || '').trim();
      const completedCol = String(row[completedIdx] || '').trim();
      const pendingCol = String(row[pendingIdx] || '').trim();

      // Extra verification to skip column labels
      if (descCol === 'Complain Received from details' || descCol === 'Work Description' || descCol === 'Description of Complain') {
        return;
      }

      if (jobNoCol || descCol || completedCol || pendingCol) {
        const statusEntry = parsed.complaintsStatus.find(s => s.name === currentCategory);
        if (statusEntry) {
          // Identify completed complaints vs pending vs in-progress
          const completedNorm = completedCol.toLowerCase();
          const pendingNorm = pendingCol.toLowerCase();

          const isCompleted = completedCol && 
                              !completedNorm.includes('pending') && 
                              !completedNorm.includes('progress') &&
                              !completedNorm.includes('outstanding') &&
                              !completedNorm.includes('will start');
                              
          const isPending = pendingCol && (
                            pendingNorm.includes('pending') || 
                            pendingNorm.includes('will start') ||
                            pendingNorm.includes('outstanding')
                          );

          if (isCompleted) {
            statusEntry.completed += 1;
          } else if (isPending) {
            statusEntry.pending += 1;
          } else {
            statusEntry.inProgress += 1;
          }
        }

        // Add this complaint row to list
        parsed.complaintsList.push({
          department: currentCategory,
          jobNo: jobNoCol,
          description: descCol || `Complaint registered (Job No: ${jobNoCol || 'N/A'})`,
          completedDetails: completedCol,
          pendingDetails: pendingCol,
          feedback: String(row[feedbackIdx] || '').trim()
        });
      }
    }
  });

  // Map complaintsPie from the status counts
  parsed.complaintsStatus.forEach(status => {
    const matchedColor = Object.values(categoryKeys).find(c => c.name === status.name)?.color || '#0b4d8c';
    const totalCount = status.completed + status.inProgress + status.pending;
    if (totalCount > 0) {
      parsed.complaintsPie.push({
        name: status.name,
        value: totalCount,
        color: matchedColor
      });
    }
  });

  return parsed;
}

// --- Horticulture Single-Tab Sheet Parser ---
function parseHorticultureTab(rows) {
  const parsed = {
    horticultureManpower: [],
    horticultureKPIs: {
      plantsTownship: 'NIL',
      plantsPlantArea: 'NIL',
      plantsOutside: 'NIL',
      nurseryDetails: [],
      maintenanceDetails: []
    }
  };

  let activeSection = null;

  rows.forEach((row) => {
    if (!row) return;
    const col1 = String(row[1] || '').trim();
    const col2 = String(row[2] || '').trim();
    const actual = Number(row[3]) || 0;
    const present = Number(row[4]) || 0;
    
    // Manpower
    if (col1.includes('Total no. of On Roll Employees')) {
      parsed.horticultureManpower.push({ name: 'On Roll', actual, present });
    } else if (col1.includes('Total no. of Associate Employees')) {
      parsed.horticultureManpower.push({ name: 'Associates', actual, present });
    } else if (col1.includes('Sri Ram Enterprises') || col1.includes('Sri Ram Ent')) {
      parsed.horticultureManpower.push({ name: 'Sri Ram Ent.', actual, present });
    } else if (col1.includes('Pradhan Enterprises') || col1.includes('Pradhan Ent')) {
      parsed.horticultureManpower.push({ name: 'Pradhan Ent.', actual, present });
    } else if (col1.includes('Maa Mangala')) {
      parsed.horticultureManpower.push({ name: 'Maa Mangala', actual, present });
    } else if (col1.includes('Maa Ramchandi')) {
      parsed.horticultureManpower.push({ name: 'Maa Ramchandi', actual, present });
    } else if (col1.includes('Bishnu Enterprise')) {
      parsed.horticultureManpower.push({ name: 'Bishnu Ent.', actual, present });
    } else if (col1.includes('Maa Sarala Engineering')) {
      parsed.horticultureManpower.push({ name: 'Maa Sarala Eng.', actual, present });
    }
    
    // Track active section for merged cells
    if (col1) {
      activeSection = col1;
    }

    if (!activeSection) return;

    // KPIs
    if (activeSection.includes('No. of Plants planted in Township') && col2) {
      parsed.horticultureKPIs.plantsTownship = col2;
      activeSection = null;
    } else if (activeSection.includes('No. of Plants planted in Plant Area') && col2) {
      parsed.horticultureKPIs.plantsPlantArea = col2;
      activeSection = null;
    } else if (activeSection.includes('No. of plants planted outside') && col2) {
      parsed.horticultureKPIs.plantsOutside = col2;
      activeSection = null;
    } else if (activeSection.includes('Total no of plants (Category wise) at nursery') && col2) {
      parsed.horticultureKPIs.nurseryDetails.push(col2);
    } else if (activeSection.includes('Total Maintenance area') && col2) {
      parsed.horticultureKPIs.maintenanceDetails.push(col2);
    }
  });

  return parsed;
}

// --- Plant Admin Single-Tab Sheet Parser ---
function parsePlantAdminTab(rows) {
  const parsed = {
    plantAdminManpower: [],
    plantAdminVehicles: [],
    plantAdminKPIs: {
      totalEquipment: 0,
      totalVehicles: 0
    }
  };

  rows.forEach((row) => {
    if (!row) return;
    const col1 = String(row[1] || '').trim();
    const col2 = String(row[2] || '').trim();

    if (col1.includes('Manpower Total')) {
      parsed.plantAdminManpower.push({ name: 'Gen Maintenance', actual: Number(row[3]) || 0, present: Number(row[5]) || 0 });
      parsed.plantAdminManpower.push({ name: 'Road & Drain', actual: Number(row[9]) || 0, present: Number(row[14]) || 0 });
      parsed.plantAdminManpower.push({ name: 'Employee Mobility', actual: Number(row[17]) || 0, present: Number(row[19]) || 0 });
      parsed.plantAdminManpower.push({ name: 'Worker Colonies', actual: Number(row[24]) || 0, present: Number(row[26]) || 0 });
    } else if (col1.includes('Total no of equipment') || col2.includes('Total no of equipment')) {
      let total = 0;
      for (let i = 3; i < 35; i++) { total += Number(row[i]) || 0; }
      parsed.plantAdminKPIs.totalEquipment += total;
    } else if (col1.includes('Total no of Vehicles') || col2.includes('Total no of Vehicles')) {
      let total = 0;
      for (let i = 3; i < 35; i++) { total += Number(row[i]) || 0; }
      parsed.plantAdminKPIs.totalVehicles += total;
    } else if (['Road Sweeper', 'Hiwa', 'JCB', 'Tractor', 'Cesspool', 'Water Tanker'].includes(col2)) {
      let count = 0;
      for (let i = 3; i < 35; i++) { count += Number(row[i]) || 0; }
      if (count > 0) {
        parsed.plantAdminVehicles.push({ name: col2, count });
      }
    }
  });

  return parsed;
}

// --- Road & Drain Single-Tab Sheet Parser ---
function parseRoadDrainTab(rows) {
  const parsed = {
    roadDrainOperatingHours: [],
    roadDrainShifts: [],
    roadDrainKPIs: {
      totalHours: 0,
      totalKM: 0,
      totalDiesel: 0
    }
  };

  const vehicleHoursMap = {};
  const shiftMap = {};

  let currentShift = 'Unknown Shift';

  rows.forEach((row, i) => {
    if (!row || i < 2) return; // skip headers
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim(); // Vehicle Name
    
    // Shift row detection: colA has text starting with "Shift-"
    if (colA.startsWith('Shift-') || colB.startsWith('Shift-')) {
       currentShift = colA.startsWith('Shift-') ? colA.split('(')[0].trim() : colB.split('(')[0].trim();
       if (!shiftMap[currentShift]) shiftMap[currentShift] = 0;
       return;
    }

    if (colA === 'Sr.' || colA === 'No' || colA === 'Vehicle Name' || colB === 'Vehicle Name') return;
    
    // It's a data row if there's a vehicle name
    if (colB && colB.length > 2) {
       const hours = Number(row[7]) || 0; // Total Hrs
       const km = Number(row[10]) || 0; // Total K.M.
       const diesel = Number(row[11]) || 0; // Diesel

       parsed.roadDrainKPIs.totalHours += hours;
       parsed.roadDrainKPIs.totalKM += km;
       parsed.roadDrainKPIs.totalDiesel += diesel;

       if (hours > 0 || km > 0 || diesel > 0 || colB) {
         shiftMap[currentShift] = (shiftMap[currentShift] || 0) + 1;
         
         // Aggregate vehicle hours
         let vehicleType = 'Other';
         const nameLower = colB.toLowerCase();
         if (nameLower.includes('sweeper')) vehicleType = 'Road Sweeper';
         else if (nameLower.includes('jcb')) vehicleType = 'JCB';
         else if (nameLower.includes('tractor') || nameLower.includes('farana')) vehicleType = 'Tractor / Farana';
         else if (nameLower.includes('cess')) vehicleType = 'Cesspool';
         else if (nameLower.includes('hywa')) vehicleType = 'Hywa';
         else if (nameLower.includes('camphor')) vehicleType = 'Camphor';
         else vehicleType = colB.split(' ')[0]; // fallback to first word

         vehicleHoursMap[vehicleType] = (vehicleHoursMap[vehicleType] || 0) + hours;
       }
    }
  });

  parsed.roadDrainOperatingHours = Object.keys(vehicleHoursMap).map(k => ({
    name: k,
    hours: Number(vehicleHoursMap[k].toFixed(2))
  }));

  parsed.roadDrainShifts = Object.keys(shiftMap).map(k => ({
    name: k,
    activeVehicles: shiftMap[k]
  }));

  parsed.roadDrainKPIs.totalHours = Number(parsed.roadDrainKPIs.totalHours.toFixed(2));
  parsed.roadDrainKPIs.totalKM = Number(parsed.roadDrainKPIs.totalKM.toFixed(2));
  parsed.roadDrainKPIs.totalDiesel = Number(parsed.roadDrainKPIs.totalDiesel.toFixed(2));

  return parsed;
}

// --- Employee Mobility Single-Tab Sheet Parser ---
function parseEmpMobilityTab(rows) {
  const parsed = {
    empMobilityBusData: [],
    empMobilityKPIs: {
      totalBuses: 0,
      totalKM: 0,
      totalFuel: 0
    }
  };

  rows.forEach((row, i) => {
    if (!row || i < 2) return; // skip headers
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim(); // Vehicle No
    const colW = String(row[22] || '').trim(); // Refilling Status
    const colX = Number(row[23]) || 0; // Total KM
    
    // Check if it's a valid bus row. Usually Sr No is numeric.
    if (!isNaN(colA) && colA !== '' && colB && colB.length > 3) {
      let fuelStr = colW.toLowerCase();
      let fuelLiters = 0;
      // parse "QTY (62 Ltr)" or "QTY(62Ltr)"
      if (fuelStr.includes('qty') || fuelStr.includes('ltr')) {
         const match = fuelStr.match(/\(?(\d+)\s*ltr/);
         if (match && match[1]) {
           fuelLiters = Number(match[1]);
         } else {
           const match2 = fuelStr.match(/\d+/g);
           if (match2 && match2.length > 1) {
             fuelLiters = Number(match2[match2.length - 1]);
           } else if (match2) {
             fuelLiters = Number(match2[0]);
           }
         }
      }

      parsed.empMobilityBusData.push({
         name: colB.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
         km: colX,
         fuel: fuelLiters
      });

      parsed.empMobilityKPIs.totalBuses++;
      parsed.empMobilityKPIs.totalKM += colX;
      parsed.empMobilityKPIs.totalFuel += fuelLiters;
    }
  });

  return parsed;
}

// @route   POST /api/dpr/import
// @desc    Upload, Validate, Merge & Upsert parsed Township DPR sheet to MongoDB
// @access  Public
router.post('/import', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { reportDate, uploadedBy } = req.body;
    if (!reportDate || !/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or missing report date. Expected format: YYYY-MM-DD' 
      });
    }

    // Read workbook in memory
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded Excel workbook contains no sheets.' });
    }

    // 1. Detect and parse sheet categories based on all sheets in the workbook
    let parsedData = {};
    let processedAny = false;

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (rows.length === 0) return;

      const nameNorm = sheetName.toLowerCase();
      const firstRowText = rows.slice(0, 3).map(r => r.join(' ')).join(' ').toLowerCase();

      if (nameNorm.includes('f&b') || firstRowText.includes('township guest house') || firstRowText.includes('canteen')) {
        console.log(`📡 Ingesting Sheet [${sheetName}] as F&B Report for date ${reportDate}...`);
        parsedData = { ...parsedData, ...parseFbSingleTab(rows) };
        processedAny = true;
      } else if (nameNorm.includes('maintenanc') || firstRowText.includes('township maintenance')) {
        console.log(`📡 Ingesting Sheet [${sheetName}] as Maintenance Report for date ${reportDate}...`);
        parsedData = { ...parsedData, ...parseMaintSingleTab(rows) };
        processedAny = true;
      } else if (nameNorm.includes('horticulture') || firstRowText.includes('horticulture department')) {
        console.log(`📡 Ingesting Sheet [${sheetName}] as Horticulture Report for date ${reportDate}...`);
        parsedData = { ...parsedData, ...parseHorticultureTab(rows) };
        processedAny = true;
      } else if (nameNorm.includes('plant admin') || firstRowText.includes('plant admin department')) {
        console.log(`📡 Ingesting Sheet [${sheetName}] as Plant Admin Report for date ${reportDate}...`);
        parsedData = { ...parsedData, ...parsePlantAdminTab(rows) };
        processedAny = true;
      } else if (nameNorm.includes('road & drain') || nameNorm.includes('road and drain') || firstRowText.includes('road & drain')) {
        console.log(`📡 Ingesting Sheet [${sheetName}] as Road & Drain Report for date ${reportDate}...`);
        parsedData = { ...parsedData, ...parseRoadDrainTab(rows) };
        processedAny = true;
      } else if (nameNorm.includes('employee mobility') || firstRowText.includes('employee mobility')) {
        console.log(`📡 Ingesting Sheet [${sheetName}] as Employee Mobility Report for date ${reportDate}...`);
        parsedData = { ...parsedData, ...parseEmpMobilityTab(rows) };
        processedAny = true;
      }
    });

    if (!processedAny) {
      // Fallback: Original tab-based synonyms parser
      console.log(`🔄 No single-tab signature identified. Falling back to multi-tab synonyms retriever...`);
      const tabs = {};
      workbook.SheetNames.forEach((name) => {
        tabs[name.trim().toLowerCase().replace(/[\s_-]+/g, '')] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
      });

      const getSheet = (...aliases) => {
        for (const alias of aliases) {
          const norm = alias.toLowerCase().replace(/[\s_-]+/g, '');
          if (tabs[norm]) return tabs[norm];
        }
        return null;
      };

      const getResilientValue = (row, expectedKey, aliases) => {
        const normalizedRow = {};
        Object.keys(row).forEach(k => {
          normalizedRow[k.trim().toLowerCase().replace(/[\s_-]+/g, '')] = row[k];
        });
        const normExpected = expectedKey.toLowerCase();
        if (normalizedRow[normExpected] !== undefined) return normalizedRow[normExpected];

        for (const alias of aliases) {
          const normAlias = alias.toLowerCase().replace(/[\s_-]+/g, '');
          if (normalizedRow[normAlias] !== undefined) return normalizedRow[normAlias];
        }
        return undefined;
      };

      const mapSheet = (sheetArray, schemaFields) => {
        if (!sheetArray || !Array.isArray(sheetArray)) return null;
        return sheetArray.map(row => {
          const mappedRow = {};
          Object.keys(schemaFields).forEach(field => {
            const aliases = schemaFields[field];
            const val = getResilientValue(row, field, aliases);
            const numericFields = ['total', 'occupied', 'vacant', 'breakfast', 'lunch', 'dinner', 'km', 'actual', 'present', 'value', 'completed', 'inProgress', 'pending', 'target', 'done'];
            if (numericFields.includes(field)) {
              mappedRow[field] = val !== undefined && val !== null ? Number(val) || 0 : 0;
            } else {
              mappedRow[field] = val !== undefined && val !== null ? String(val).trim() : '';
            }
          });
          return mappedRow;
        });
      };

      const SCHEMA_FIELDS = {
        guestHouseData: { name: ['guesthouse', 'location', 'guest house', 'name'], total: ['totalrooms', 'total rooms', 'rooms', 'total'], occupied: ['occupiedrooms', 'occupied rooms', 'occupied'], vacant: ['vacantrooms', 'vacant rooms', 'vacant'] },
        mealData: { name: ['canteen', 'location', 'name'], breakfast: ['bf', 'breakfast count', 'breakfast'], lunch: ['lh', 'lunch count', 'lunch'], dinner: ['dn', 'dinner count', 'dinner'] },
        vehicleData: { name: ['vehicle', 'vehicleno', 'vehicle no', 'name'], km: ['distance', 'kmcovered', 'km covered', 'km'] },
        manpowerFB: { name: ['category', 'role', 'name'], actual: ['onroll', 'on roll', 'total', 'actual'], present: ['attendance', 'active', 'present'] },
        manpowerMaint: { name: ['category', 'role', 'name'], actual: ['onroll', 'on roll', 'total', 'actual'], present: ['attendance', 'active', 'present'] },
        complaintsPie: { name: ['category', 'type', 'job', 'name'], value: ['count', 'quantity', 'jobs', 'value'] },
        complaintsStatus: { name: ['category', 'type', 'name'], completed: ['done', 'closed', 'completed'], inProgress: ['inprogress', 'in progress', 'active'], pending: ['pending', 'open'] },
        paintProgress: { name: ['description', 'work', 'name'], target: ['goal', 'planned', 'target'], done: ['achieved', 'actual', 'progress', 'done'] }
      };

      const rawMeal = getSheet('MealData', 'Meals', 'Meal Data', 'Sheet1');
      if (rawMeal) parsedData.mealData = mapSheet(rawMeal, SCHEMA_FIELDS.mealData);

      const rawGuest = getSheet('GuestHouse', 'Guest House', 'Occupancy');
      if (rawGuest) parsedData.guestHouseData = mapSheet(rawGuest, SCHEMA_FIELDS.guestHouseData);

      const rawVehicle = getSheet('Vehicles', 'Fleet', 'VehicleData', 'Vehicle Data');
      if (rawVehicle) parsedData.vehicleData = mapSheet(rawVehicle, SCHEMA_FIELDS.vehicleData);

      const rawManFB = getSheet('ManpowerFB', 'Manpower FB', 'FBManpower', 'FB Manpower');
      if (rawManFB) parsedData.manpowerFB = mapSheet(rawManFB, SCHEMA_FIELDS.manpowerFB);

      const rawManMaint = getSheet('ManpowerMaint', 'Manpower Maint', 'MaintManpower', 'Maint Manpower');
      if (rawManMaint) parsedData.manpowerMaint = mapSheet(rawManMaint, SCHEMA_FIELDS.manpowerMaint);

      const rawComplaints = getSheet('Complaints', 'ComplaintsPie', 'Jobs');
      if (rawComplaints) parsedData.complaintsPie = mapSheet(rawComplaints, SCHEMA_FIELDS.complaintsPie);

      const rawComplaintsStatus = getSheet('ComplaintsStatus', 'Complaints Status');
      if (rawComplaintsStatus) parsedData.complaintsStatus = mapSheet(rawComplaintsStatus, SCHEMA_FIELDS.complaintsStatus);

      const rawPaint = getSheet('PaintProgress', 'Paint Progress', 'Paint');
      if (rawPaint) parsedData.paintProgress = mapSheet(rawPaint, SCHEMA_FIELDS.paintProgress);
    }

    // 2. Fetch existing report to merge data or seed defaults
    const existingReport = await DprReport.findOne({ reportDate });
    let mergedData = {};

    if (existingReport && existingReport.data) {
      mergedData = { ...existingReport.data };
    } else {
      // Seed with standard JSW defaults
      mergedData = { ...DEFAULT_SECTIONS };
    }

    // Overwrite sections with parsedData
    Object.keys(parsedData).forEach((section) => {
      if (parsedData[section] && parsedData[section].length > 0) {
        mergedData[section] = parsedData[section];
      }
    });

    // 3. Schema structural validation of MERGED data
    const validation = validateDprData(mergedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet schema validation failed. Columns do not match template.',
        errors: validation.errors
      });
    }

    // 4. Save to Database
    const report = await DprReport.findOneAndUpdate(
      { reportDate },
      {
        filename: req.file.originalname,
        uploadedBy: uploadedBy || 'System Administrator',
        data: mergedData
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Daily Progress Report for ${reportDate} processed and saved successfully!`,
      filename: req.file.originalname,
      reportDate,
      data: report.data
    });

  } catch (error) {
    console.error('Excel Import Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to ingest Excel spreadsheet.',
      error: error.message
    });
  }
});

// @route   GET /api/dpr/dates
// @desc    Retrieve all distinct dates containing uploaded reports, sorted chronologically
// @access  Public
router.get('/dates', async (req, res) => {
  try {
    const reports = await DprReport.find({}, 'reportDate').sort({ reportDate: -1 });
    const dates = reports.map(r => r.reportDate);
    res.json({ success: true, dates });
  } catch (error) {
    console.error('Fetch dates error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch report dates.', error: error.message });
  }
});

// @route   GET /api/dpr/report/:date
// @desc    Retrieve structured report data for a specific date (YYYY-MM-DD)
// @access  Public
router.get('/report/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date parameter. Format: YYYY-MM-DD' });
    }

    const report = await DprReport.findOne({ reportDate: date });
    if (!report) {
      return res.status(404).json({ success: false, message: `No report found for date ${date}` });
    }

    res.json({
      success: true,
      reportDate: report.reportDate,
      filename: report.filename,
      uploadedBy: report.uploadedBy,
      data: report.data
    });
  } catch (error) {
    console.error('Fetch report error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch report data.', error: error.message });
  }
});

// @route   DELETE /api/dpr/report/:date
// @desc    Delete structured report data for a specific date (YYYY-MM-DD)
// @access  Public
router.delete('/report/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date parameter. Format: YYYY-MM-DD' });
    }

    const report = await DprReport.findOneAndDelete({ reportDate: date });
    if (!report) {
      return res.status(404).json({ success: false, message: `No report found for date ${date}` });
    }

    res.json({
      success: true,
      message: `Successfully deleted report for date ${date}`
    });
  } catch (error) {
    console.error('Delete report error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete report.', error: error.message });
  }
});

module.exports = router;

