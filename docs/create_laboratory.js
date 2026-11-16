// Generator for SIMRS Screen 6: Laboratory (Laboratorium LIS)
function createSimrsLaboratory(startX = 1600, startY = 1100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Laboratorium LIS";
  board.x = startX;
  board.y = startY;
  board.resize(1440, 900);
  board.borderRadius = 16;
  board.fills = [{ fillColor: "#F8FAFC", fillOpacity: 1 }];


  function rect({ name, x, y, w, h, r, fill, stroke, strokeW }) {
    const s = penpot.createRectangle();
    if (name) s.name = name;
    s.x = board.x + x;
    s.y = board.y + y;
    s.resize(w, h);
    if (r) s.borderRadius = r;
    if (fill) s.fills = [{ fillColor: fill, fillOpacity: 1 }];
    else s.fills = [];
    if (stroke) s.strokes = [{ strokeColor: stroke, strokeWidth: strokeW || 1, strokeStyle: "solid", strokeOpacity: 1 }];
    else s.strokes = [];
    board.appendChild(s);
    return s;
  }

  function txt({ name, x, y, content, size, weight, color }) {
    const s = penpot.createText(content);
    if (name) s.name = name;
    s.x = board.x + x;
    s.y = board.y + y;
    if (size) s.fontSize = String(size);
    if (weight) s.fontWeight = String(weight);
    if (color) s.fills = [{ fillColor: color, fillOpacity: 1 }];
    board.appendChild(s);
    return s;
  }

  function circle({ name, x, y, size, fill, stroke }) {
    const s = penpot.createEllipse();
    if (name) s.name = name;
    s.x = board.x + x;
    s.y = board.y + y;
    s.resize(size, size);
    if (fill) s.fills = [{ fillColor: fill, fillOpacity: 1 }];
    else s.fills = [];
    if (stroke) s.strokes = [{ strokeColor: stroke, strokeWidth: 1, strokeStyle: "solid", strokeOpacity: 1 }];
    board.appendChild(s);
    return s;
  }

  function renderNavbar(activeTitle) {
    rect({ name: "navbar-bg", x: 0, y: 0, w: 1440, h: 64, fill: "#FFFFFF", stroke: "#E2E8F0" });
    rect({ name: "logo-box", x: 24, y: 14, w: 36, h: 36, r: 8, fill: "#2563EB" });
    rect({ name: "cross-h", x: 30, y: 30, w: 24, h: 4, r: 2, fill: "#FFFFFF" });
    rect({ name: "cross-v", x: 40, y: 20, w: 4, h: 24, r: 2, fill: "#FFFFFF" });
    txt({ name: "brand-title", x: 72, y: 22, content: "Inova Medika SIMRS", size: 16, weight: "700", color: "#0F172A" });
    txt({ name: "nav-page-title", x: 236, y: 24, content: activeTitle, size: 13, weight: "400", color: "#64748B" });

    rect({ name: "search-box", x: 400, y: 14, w: 380, h: 36, r: 8, fill: "#F1F5F9", stroke: "#E2E8F0" });
    txt({ name: "search-placeholder", x: 416, y: 24, content: "Cari pasien, no. RM, dokter...", size: 12, weight: "400", color: "#64748B" });
    txt({ name: "kbd-txt", x: 736, y: 24, content: "Ctrl+K", size: 11, weight: "400", color: "#94A3B8" });

    txt({ name: "date-txt", x: 1120, y: 24, content: "Senin, 16 Nov 2026", size: 12, weight: "400", color: "#64748B" });
    rect({ name: "nav-div", x: 1255, y: 20, w: 1, h: 24, fill: "#E2E8F0" });
    circle({ name: "user-avatar", x: 1270, y: 14, size: 36, fill: "#EFF6FF", stroke: "#BFDBFE" });
    txt({ name: "user-initials", x: 1280, y: 23, content: "BS", size: 13, weight: "700", color: "#1D4ED8" });
    txt({ name: "user-name", x: 1316, y: 17, content: "dr. Budi Santoso, Sp.PD", size: 13, weight: "700", color: "#0F172A" });
    txt({ name: "user-role", x: 1316, y: 34, content: "Klinik Penyakit Dalam", size: 11, weight: "400", color: "#64748B" });
  }

  function renderSidebar(activeMenuIndex) {
    rect({ name: "sidebar-bg", x: 0, y: 64, w: 220, h: 836, fill: "#FFFFFF", stroke: "#E2E8F0" });
    txt({ name: "side-header", x: 16, y: 84, content: "MENU PELAYANAN", size: 10, weight: "700", color: "#94A3B8" });

    const menus = [
      { name: "Dashboard", y: 104 },
      { name: "Pendaftaran Pasien", y: 146 },
      { name: "Pemeriksaan RME", y: 188 },
      { name: "Data Pasien & RM", y: 230 },
      { name: "Resep & Farmasi", y: 272 },
      { name: "Laboratorium LIS", y: 314 },
      { name: "Kasir Pembayaran", y: 356 },
      { name: "Master Data & Tarif", y: 398 }
    ];

    menus.forEach((m, idx) => {
      const isActive = idx === activeMenuIndex;
      if (isActive) {
        rect({ name: "nav-active-bg", x: 12, y: m.y, w: 196, h: 36, r: 8, fill: "#EFF6FF" });
        rect({ name: "nav-active-bar", x: 12, y: m.y + 6, w: 4, h: 24, r: 2, fill: "#2563EB" });
        txt({ name: "nav-item-" + idx, x: 28, y: m.y + 11, content: m.name, size: 13, weight: "700", color: "#1D4ED8" });
      } else {
        txt({ name: "nav-item-" + idx, x: 28, y: m.y + 11, content: m.name, size: 13, weight: "400", color: "#475569" });
      }
    });

    rect({ name: "side-div", x: 16, y: 444, w: 188, h: 1, fill: "#F1F5F9" });

    rect({ name: "side-footer", x: 12, y: 830, w: 196, h: 44, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
    circle({ name: "conn-dot", x: 24, y: 846, size: 8, fill: "#10B981" });
    txt({ name: "conn-txt1", x: 40, y: 838, content: "Sistem Terhubung", size: 11, weight: "600", color: "#0F172A" });
    txt({ name: "conn-txt2", x: 40, y: 852, content: "PostgreSQL & LIS Ready", size: 9, weight: "400", color: "#64748B" });
  }


  renderNavbar("Laboratorium LIS Terpadu");
  renderSidebar(5);

  // Main Header
  txt({ name: "lab-title", x: 244, y: 84, content: "Sistem Informasi Laboratorium (LIS)", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "lab-sub", x: 244, y: 110, content: "Microservice Node.js LIS: penerimaan sampel, entry hasil tes, dan auto-sinkron ke RME", size: 12, weight: "400", color: "#64748B" });

  // LIS Resiliency Status Strip
  rect({ name: "lis-status-strip", x: 244, y: 136, w: 1172, h: 44, r: 8, fill: "#F0FDF4", stroke: "#BBF7D0" });
  circle({ name: "lis-dot", x: 264, y: 154, size: 8, fill: "#166534" });
  txt({ name: "lis-stat-t1", x: 280, y: 149, content: "Node.js LIS Engine Connected (Port 5000)", size: 12, weight: "600", color: "#166534" });
  txt({ name: "lis-stat-t2", x: 620, y: 149, content: "Circuit Breaker: CLOSED (Resiliency 100%) | Retry Policy: Active", size: 11, weight: "400", color: "#15803D" });

  // 2-Column Split: Requests List (w: 480), Entry Form (w: 668)
  rect({ name: "lab-list-card", x: 244, y: 196, w: 480, h: 680, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "lab-l-title", x: 268, y: 216, content: "Permintaan Pemeriksaan Lab", size: 15, weight: "700", color: "#0F172A" });
  rect({ name: "lab-l-sep", x: 244, y: 244, w: 480, h: 1, fill: "#E2E8F0" });

  function labReqItem(y, isSelected, reqNo, name, testName, doc, status, statusColor) {
    if (isSelected) {
      rect({ name: "lri-bg", x: 245, y: y, w: 478, h: 80, fill: "#F8FAFC" });
      rect({ name: "lri-bar", x: 245, y: y, w: 4, h: 80, fill: "#2563EB" });
    }
    // Line 1: Req No & Status
    txt({ name: "lri-no", x: 268, y: y + 12, content: reqNo, size: 12, weight: "700", color: "#2563EB" });
    txt({ name: "lri-st", x: 570, y: y + 12, content: status, size: 11, weight: "600", color: statusColor });

    // Line 2: Patient Name & Test
    txt({ name: "lri-name", x: 268, y: y + 32, content: name + " - " + testName, size: 13, weight: "700", color: "#0F172A" });

    // Line 3: Doctor info
    txt({ name: "lri-doc", x: 268, y: y + 52, content: "Pengirim: " + doc + " (Poliklinik)", size: 11, weight: "400", color: "#64748B" });
    rect({ name: "lri-sep", x: 244, y: y + 80, w: 480, h: 1, fill: "#E2E8F0" });
  }

  labReqItem(245, true, "LAB-202611-001", "Hendra Kusuma", "Profil Lipid Lengkap", "dr. Budi Santoso, Sp.PD", "Siap Analisis", "#D97706");
  labReqItem(327, false, "LAB-202611-002", "Bambang Subagio", "Darah Rutin (CBC)", "dr. Budi Santoso, Sp.PD", "Terverifikasi", "#059669");
  labReqItem(409, false, "LAB-202611-003", "Ratna Sari", "Glukosa Puasa & HbA1c", "dr. Anita Rahayu, Sp.A", "Menunggu Sampel", "#64748B");

  // Right Column: Result Form (w: 668)
  rect({ name: "lab-form-card", x: 748, y: 196, w: 668, h: 680, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "lab-f-title", x: 772, y: 216, content: "Input Hasil: Profil Lipid Lengkap (LAB-202611-001)", size: 15, weight: "700", color: "#0F172A" });
  txt({ name: "lab-f-sub", x: 772, y: 238, content: "Pasien: Hendra Kusuma (RM-202611-001) | Sampel ID: SMP-8821 (Serum)", size: 12, weight: "400", color: "#64748B" });
  rect({ name: "lab-f-sep", x: 748, y: 262, w: 668, h: 1, fill: "#E2E8F0" });

  // Table Parameter Header
  rect({ name: "lth-bg", x: 749, y: 263, w: 666, h: 36, fill: "#F8FAFC" });
  txt({ name: "lth-p", x: 772, y: 274, content: "PARAMETER PEMERIKSAAN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "lth-v", x: 990, y: 274, content: "HASIL", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "lth-r", x: 1090, y: 274, content: "RUJUKAN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "lth-u", x: 1200, y: 274, content: "SATUAN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "lth-f", x: 1300, y: 274, content: "FLAG", size: 11, weight: "700", color: "#64748B" });
  rect({ name: "lth-sep", x: 748, y: 299, w: 668, h: 1, fill: "#E2E8F0" });

  function labRow(y, param, val, ref, unit, flag, flagColor) {
    txt({ name: "lr-p", x: 772, y: y + 12, content: param, size: 12, weight: "600", color: "#0F172A" });
    rect({ name: "lr-v-box", x: 980, y: y + 4, w: 80, h: 30, r: 6, fill: "#F8FAFC", stroke: "#CBD5E1" });
    txt({ name: "lr-v", x: 996, y: y + 11, content: val, size: 12, weight: "700", color: flagColor });
    txt({ name: "lr-r", x: 1090, y: y + 12, content: ref, size: 12, weight: "400", color: "#64748B" });
    txt({ name: "lr-u", x: 1200, y: y + 12, content: unit, size: 12, weight: "400", color: "#64748B" });
    txt({ name: "lr-f", x: 1300, y: y + 12, content: flag, size: 11, weight: "700", color: flagColor });
    rect({ name: "lr-sep", x: 748, y: y + 42, w: 668, h: 1, fill: "#E2E8F0" });
  }

  labRow(302, "Kolesterol Total", "240", "< 200", "mg/dL", "HIGH", "#DC2626");
  labRow(345, "Trigliserida", "185", "< 150", "mg/dL", "HIGH", "#DC2626");
  labRow(388, "Kolesterol HDL", "42", "> 40", "mg/dL", "NORMAL", "#059669");
  labRow(431, "Kolesterol LDL", "161", "< 130", "mg/dL", "HIGH", "#DC2626");

  // Notes
  txt({ name: "lab-n-lbl", x: 772, y: 494, content: "Catatan Analis Laboratorium", size: 12, weight: "600", color: "#475569" });
  rect({ name: "lab-n-box", x: 772, y: 512, w: 620, h: 60, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "lab-n-txt", x: 788, y: 526, content: "Sampel serum jernih, lipemik (-), ikterik (-). Kalibrasi alat prima.", size: 12, weight: "400", color: "#0F172A" });

  // Action Button
  rect({ name: "lab-btn-send", x: 772, y: 594, w: 620, h: 44, r: 8, fill: "#2563EB" });
  txt({ name: "lab-btn-txt", x: 940, y: 607, content: "Validasi & Kirim Hasil ke Rekam Medis (RME)", size: 13, weight: "600", color: "#FFFFFF" });

  return board;
}
