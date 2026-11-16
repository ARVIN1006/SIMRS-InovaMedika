// Generator for SIMRS Dashboard - Minimalist, Badge-reduced, Native Penpot Shapes

function createSimrsDashboard(startX = 100, startY = 100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Dashboard Pelayanan";
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

  // --- TOP NAVBAR ---
  rect({ name: "navbar-bg", x: 0, y: 0, w: 1440, h: 64, fill: "#FFFFFF", stroke: "#E2E8F0" });
  
  // Brand Logo (Clean square with cross)
  rect({ name: "logo-box", x: 24, y: 14, w: 36, h: 36, r: 8, fill: "#2563EB" });
  rect({ name: "cross-h", x: 30, y: 30, w: 24, h: 4, r: 2, fill: "#FFFFFF" });
  rect({ name: "cross-v", x: 40, y: 20, w: 4, h: 24, r: 2, fill: "#FFFFFF" });
  txt({ name: "brand-title", x: 72, y: 22, content: "Inova Medika SIMRS", size: 16, weight: "700", color: "#0F172A" });
  txt({ name: "brand-sub", x: 236, y: 24, content: "Rawat Jalan", size: 13, weight: "400", color: "#64748B" });

  // Search Bar (No heavy badge, clean inline shortcut hint)
  rect({ name: "search-box", x: 340, y: 14, w: 440, h: 36, r: 8, fill: "#F1F5F9", stroke: "#E2E8F0" });
  txt({ name: "search-placeholder", x: 356, y: 24, content: "Cari pasien (nama, no. RM, NIK) atau dokter...", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "kbd-txt", x: 736, y: 24, content: "Ctrl+K", size: 11, weight: "400", color: "#94A3B8" });

  // Topbar Right User Info
  txt({ name: "date-txt", x: 1120, y: 24, content: "Senin, 16 Nov 2026", size: 12, weight: "400", color: "#64748B" });
  rect({ name: "nav-div", x: 1255, y: 20, w: 1, h: 24, fill: "#E2E8F0" });
  circle({ name: "user-avatar", x: 1270, y: 14, size: 36, fill: "#EFF6FF", stroke: "#BFDBFE" });
  txt({ name: "user-initials", x: 1280, y: 23, content: "BS", size: 13, weight: "700", color: "#1D4ED8" });
  txt({ name: "user-name", x: 1316, y: 17, content: "dr. Budi Santoso, Sp.PD", size: 13, weight: "700", color: "#0F172A" });
  txt({ name: "user-role", x: 1316, y: 34, content: "Klinik Penyakit Dalam", size: 11, weight: "400", color: "#64748B" });

  // --- SIDEBAR ---
  rect({ name: "sidebar-bg", x: 0, y: 64, w: 220, h: 836, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "side-header", x: 16, y: 84, content: "MENU PELAYANAN", size: 10, weight: "700", color: "#94A3B8" });

  // 1. Dashboard (Active)
  rect({ name: "nav-active-bg", x: 12, y: 104, w: 196, h: 40, r: 8, fill: "#EFF6FF" });
  rect({ name: "nav-active-bar", x: 12, y: 110, w: 4, h: 28, r: 2, fill: "#2563EB" });
  txt({ name: "nav-dash", x: 28, y: 116, content: "Dashboard", size: 13, weight: "700", color: "#1D4ED8" });

  // 2. Antrean Pasien (clean plain count, no pill)
  txt({ name: "nav-queue", x: 28, y: 162, content: "Antrean Pasien", size: 13, weight: "400", color: "#475569" });
  txt({ name: "queue-count", x: 178, y: 162, content: "8", size: 12, weight: "600", color: "#64748B" });

  // 3-7 Nav items
  txt({ name: "nav-rme", x: 28, y: 204, content: "Pemeriksaan RME", size: 13, weight: "400", color: "#475569" });
  txt({ name: "nav-pharmacy", x: 28, y: 246, content: "Resep & Farmasi", size: 13, weight: "400", color: "#475569" });
  txt({ name: "nav-lab", x: 28, y: 288, content: "Laboratorium LIS", size: 13, weight: "400", color: "#475569" });
  txt({ name: "nav-cashier", x: 28, y: 330, content: "Kasir Pembayaran", size: 13, weight: "400", color: "#475569" });
  txt({ name: "nav-master", x: 28, y: 372, content: "Master Data & Tarif", size: 13, weight: "400", color: "#475569" });

  rect({ name: "side-div", x: 16, y: 414, w: 188, h: 1, fill: "#F1F5F9" });

  // Sidebar Status Footer
  rect({ name: "side-footer", x: 12, y: 830, w: 196, h: 44, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  circle({ name: "conn-dot", x: 24, y: 846, size: 8, fill: "#10B981" });
  txt({ name: "conn-txt1", x: 40, y: 838, content: "Sistem Terhubung", size: 11, weight: "600", color: "#0F172A" });
  txt({ name: "conn-txt2", x: 40, y: 852, content: "PostgreSQL & LIS Ready", size: 9, weight: "400", color: "#64748B" });

  // --- MAIN CONTENT AREA ---
  // Header Row
  txt({ name: "main-title", x: 244, y: 84, content: "Pelayanan Rawat Jalan", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "main-sub", x: 244, y: 110, content: "Klinik Spesialis Penyakit Dalam - Poliklinik Lantai 2", size: 12, weight: "400", color: "#64748B" });

  // Action Buttons
  rect({ name: "btn-filter", x: 1160, y: 84, w: 100, h: 36, r: 8, fill: "#FFFFFF", stroke: "#CBD5E1" });
  txt({ name: "btn-filter-txt", x: 1180, y: 94, content: "Filter Poli", size: 12, weight: "600", color: "#334155" });

  rect({ name: "btn-new", x: 1272, y: 84, w: 144, h: 36, r: 8, fill: "#2563EB" });
  txt({ name: "btn-new-txt", x: 1290, y: 94, content: "+ Pasien Baru", size: 12, weight: "600", color: "#FFFFFF" });

  // 4 KPI Cards (Clean typography, no colorful badge pill containers)
  // Card 1: Total Kunjungan
  rect({ name: "card-1", x: 244, y: 136, w: 275, h: 96, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "card-1-lbl", x: 264, y: 152, content: "Total Kunjungan Hari Ini", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "card-1-val", x: 264, y: 174, content: "42", size: 28, weight: "700", color: "#0F172A" });
  txt({ name: "card-1-sub", x: 330, y: 182, content: "+12.5% vs kemarin", size: 12, weight: "600", color: "#059669" });

  // Card 2: Menunggu Antrean
  rect({ name: "card-2", x: 543, y: 136, w: 275, h: 96, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "card-2-lbl", x: 563, y: 152, content: "Menunggu Antrean", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "card-2-val", x: 563, y: 174, content: "8", size: 28, weight: "700", color: "#D97706" });
  txt({ name: "card-2-sub", x: 605, y: 182, content: "pasien di ruang tunggu", size: 12, weight: "400", color: "#94A3B8" });

  // Card 3: Sedang Diperiksa
  rect({ name: "card-3", x: 842, y: 136, w: 275, h: 96, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "card-3-lbl", x: 862, y: 152, content: "Sedang Diperiksa", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "card-3-val", x: 862, y: 174, content: "1", size: 28, weight: "700", color: "#2563EB" });
  txt({ name: "card-3-sub", x: 900, y: 182, content: "Hendra Kusuma (Poli 1)", size: 12, weight: "400", color: "#64748B" });

  // Card 4: Selesai
  rect({ name: "card-4", x: 1141, y: 136, w: 275, h: 96, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "card-4-lbl", x: 1161, y: 152, content: "Pemeriksaan Selesai", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "card-4-val", x: 1161, y: 174, content: "33", size: 28, weight: "700", color: "#059669" });
  txt({ name: "card-4-sub", x: 1215, y: 182, content: "pasien terlayani", size: 12, weight: "400", color: "#64748B" });

  // --- QUEUE TABLE CONTAINER ---
  rect({ name: "table-container", x: 244, y: 252, w: 1172, h: 624, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  
  // Table Top Header
  txt({ name: "tbl-title", x: 268, y: 272, content: "Daftar Antrean Pelayanan Hari Ini", size: 15, weight: "700", color: "#0F172A" });
  circle({ name: "live-dot", x: 1240, y: 278, size: 8, fill: "#10B981" });
  txt({ name: "live-txt", x: 1256, y: 274, content: "Update Real-time", size: 11, weight: "400", color: "#64748B" });
  rect({ name: "tbl-sep", x: 244, y: 302, w: 1172, h: 1, fill: "#E2E8F0" });

  // Column Headers
  rect({ name: "th-bg", x: 245, y: 303, w: 1170, h: 36, fill: "#F8FAFC" });
  txt({ name: "th-no", x: 268, y: 314, content: "NO. ANTREAN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "th-patient", x: 380, y: 314, content: "PASIEN & REKAM MEDIS", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "th-doc", x: 650, y: 314, content: "DOKTER / POLIKLINIK", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "th-ins", x: 880, y: 314, content: "PENJAMIN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "th-status", x: 1040, y: 314, content: "STATUS", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "th-action", x: 1270, y: 314, content: "AKSI", size: 11, weight: "700", color: "#64748B" });
  rect({ name: "th-sep", x: 244, y: 339, w: 1172, h: 1, fill: "#E2E8F0" });

  // Minimalist Row Data Helper (No heavy badge boxes!)
  function tableRow({ y, isHighlighted, queueNo, queueColor, name, rm, doc, poli, ins, status, statusColor, statusDot, btnText, btnFill, btnStroke, btnColor }) {
    if (isHighlighted) {
      rect({ name: "row-hl", x: 245, y, w: 1170, h: 58, fill: "#F8FAFC" });
      rect({ name: "row-hl-bar", x: 245, y, w: 3, h: 58, fill: "#2563EB" });
    }
    
    // Queue number (Clean bold text, no pill box)
    txt({ name: "row-q-txt", x: 268, y: y + 20, content: queueNo, size: 14, weight: "700", color: queueColor });

    // Patient
    txt({ name: "row-p-name", x: 380, y: y + 10, content: name, size: 13, weight: "700", color: "#0F172A" });
    txt({ name: "row-p-rm", x: 380, y: y + 28, content: rm, size: 11, weight: "400", color: "#64748B" });

    // Doctor & Poli
    txt({ name: "row-d-name", x: 650, y: y + 10, content: doc, size: 12, weight: "600", color: "#0F172A" });
    txt({ name: "row-d-poli", x: 650, y: y + 28, content: poli, size: 11, weight: "400", color: "#64748B" });

    // Insurance (Clean text, no pill box)
    txt({ name: "row-ins-txt", x: 880, y: y + 20, content: ins, size: 12, weight: "400", color: "#334155" });

    // Status (Tiny dot + text, no colored container box)
    circle({ name: "row-st-dot", x: 1040, y: y + 24, size: 7, fill: statusDot });
    txt({ name: "row-st-txt", x: 1054, y: y + 20, content: status, size: 12, weight: "600", color: statusColor });

    // Action button
    rect({ name: "row-btn-box", x: 1270, y: y + 12, w: 110, h: 30, r: 6, fill: btnFill, stroke: btnStroke });
    txt({ name: "row-btn-txt", x: 1284, y: y + 19, content: btnText, size: 11, weight: "600", color: btnColor });

    // Row bottom separator line
    rect({ name: "row-sep", x: 244, y: y + 58, w: 1172, h: 1, fill: "#E2E8F0" });
  }

  // Row 1: Hendra Kusuma
  tableRow({
    y: 340,
    isHighlighted: true,
    queueNo: "A-001",
    queueColor: "#2563EB",
    name: "Hendra Kusuma",
    rm: "RM-202611-001 | L, 45 Th",
    doc: "dr. Budi Santoso, Sp.PD",
    poli: "Klinik Penyakit Dalam",
    ins: "BPJS Kesehatan",
    status: "Sedang Diperiksa",
    statusColor: "#1D4ED8",
    statusDot: "#2563EB",
    btnText: "Buka RME",
    btnFill: "#2563EB",
    btnColor: "#FFFFFF"
  });

  // Row 2: Siti Rahmawati
  tableRow({
    y: 399,
    isHighlighted: false,
    queueNo: "A-002",
    queueColor: "#0F172A",
    name: "Siti Rahmawati",
    rm: "RM-202611-002 | P, 32 Th",
    doc: "dr. Budi Santoso, Sp.PD",
    poli: "Klinik Penyakit Dalam",
    ins: "Umum / Mandiri",
    status: "Menunggu",
    statusColor: "#D97706",
    statusDot: "#F59E0B",
    btnText: "Panggil",
    btnFill: "#FFFFFF",
    btnStroke: "#CBD5E1",
    btnColor: "#334155"
  });

  // Row 3: Ahmad Fauzi
  tableRow({
    y: 458,
    isHighlighted: false,
    queueNo: "A-003",
    queueColor: "#0F172A",
    name: "Ahmad Fauzi",
    rm: "RM-202611-003 | L, 28 Th",
    doc: "dr. Budi Santoso, Sp.PD",
    poli: "Klinik Penyakit Dalam",
    ins: "BPJS Kesehatan",
    status: "Menunggu",
    statusColor: "#D97706",
    statusDot: "#F59E0B",
    btnText: "Panggil",
    btnFill: "#FFFFFF",
    btnStroke: "#CBD5E1",
    btnColor: "#334155"
  });

  // Row 4: Dewi Lestari
  tableRow({
    y: 517,
    isHighlighted: false,
    queueNo: "A-004",
    queueColor: "#0F172A",
    name: "Dewi Lestari",
    rm: "RM-202611-004 | P, 7 Th",
    doc: "dr. Budi Santoso, Sp.PD",
    poli: "Klinik Penyakit Dalam",
    ins: "Asuransi Swasta",
    status: "Menunggu",
    statusColor: "#D97706",
    statusDot: "#F59E0B",
    btnText: "Panggil",
    btnFill: "#FFFFFF",
    btnStroke: "#CBD5E1",
    btnColor: "#334155"
  });

  // Row 5: Bambang Subagio
  tableRow({
    y: 576,
    isHighlighted: false,
    queueNo: "A-000",
    queueColor: "#94A3B8",
    name: "Bambang Subagio",
    rm: "RM-202610-098 | L, 60 Th",
    doc: "dr. Budi Santoso, Sp.PD",
    poli: "Klinik Penyakit Dalam",
    ins: "BPJS Kesehatan",
    status: "Selesai",
    statusColor: "#059669",
    statusDot: "#10B981",
    btnText: "Lihat RME",
    btnFill: "#FFFFFF",
    btnStroke: "#E2E8F0",
    btnColor: "#64748B"
  });

  return board;
}
