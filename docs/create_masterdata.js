// Generator for SIMRS Screen 8: Master Data (Tarif & Layanan)
function createSimrsMasterData(startX = 4600, startY = 1100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Master Data & Tarif";
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


  renderNavbar("Master Data & Tarif Pelayanan");
  renderSidebar(7);

  // Main Header
  txt({ name: "md-title", x: 244, y: 84, content: "Manajemen Master Data & Tarif RS", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "md-sub", x: 244, y: 110, content: "Katalog tindakan medis, tarif poliklinik, data dokter, klinik, dan obat-obatan", size: 12, weight: "400", color: "#64748B" });

  // Action Button
  rect({ name: "btn-add-md", x: 1262, y: 84, w: 154, h: 36, r: 8, fill: "#2563EB" });
  txt({ name: "btn-add-md-t", x: 1282, y: 94, content: "+ Tambah Tindakan", size: 12, weight: "600", color: "#FFFFFF" });

  // Table Container (w: 1172, h: 720)
  rect({ name: "md-table-card", x: 244, y: 140, w: 1172, h: 736, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });

  // Navigation Tabs inside card
  function tabItem(x, title, isAct) {
    if (isAct) {
      rect({ name: "tab-act-b", x: x, y: 154, w: 140, h: 34, r: 6, fill: "#EFF6FF" });
      txt({ name: "tab-act-t", x: x + 16, y: 164, content: title, size: 12, weight: "700", color: "#1D4ED8" });
    } else {
      txt({ name: "tab-inact-t", x: x + 16, y: 164, content: title, size: 12, weight: "400", color: "#64748B" });
    }
  }

  tabItem(268, "Tindakan Medis (18)", true);
  tabItem(418, "Poliklinik (4)", false);
  tabItem(548, "Dokter & Jadwal (8)", false);
  tabItem(708, "Katalog Obat (45)", false);

  rect({ name: "md-sep-top", x: 244, y: 200, w: 1172, h: 1, fill: "#E2E8F0" });

  // Columns Header
  rect({ name: "mdth-bg", x: 245, y: 201, w: 1170, h: 36, fill: "#F8FAFC" });
  txt({ name: "mdth-c", x: 268, y: 212, content: "KODE", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "mdth-n", x: 380, y: 212, content: "NAMA TINDAKAN / LAYANAN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "mdth-k", x: 680, y: 212, content: "KATEGORI & POLIKLINIK", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "mdth-u", x: 920, y: 212, content: "TARIF UMUM", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "mdth-b", x: 1060, y: 212, content: "KLAIM BPJS", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "mdth-s", x: 1190, y: 212, content: "STATUS", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "mdth-a", x: 1320, y: 212, content: "AKSI", size: 11, weight: "700", color: "#64748B" });
  rect({ name: "mdth-sep", x: 244, y: 237, w: 1172, h: 1, fill: "#E2E8F0" });

  function masterRow(y, code, name, cat, poli, tarif, bpjs, status) {
    txt({ name: "mr-c", x: 268, y: y + 14, content: code, size: 12, weight: "700", color: "#0F172A" });
    txt({ name: "mr-n", x: 380, y: y + 14, content: name, size: 13, weight: "600", color: "#0F172A" });
    txt({ name: "mr-k", x: 680, y: y + 6, content: cat, size: 12, weight: "400", color: "#0F172A" });
    txt({ name: "mr-p", x: 680, y: y + 24, content: poli, size: 11, weight: "400", color: "#64748B" });
    txt({ name: "mr-u", x: 920, y: y + 14, content: tarif, size: 12, weight: "600", color: "#0F172A" });
    txt({ name: "mr-b", x: 1060, y: y + 14, content: bpjs, size: 12, weight: "600", color: "#059669" });
    txt({ name: "mr-s", x: 1190, y: y + 14, content: status, size: 12, weight: "600", color: "#059669" });

    rect({ name: "mr-btn-e", x: 1310, y: y + 8, w: 60, h: 30, r: 6, fill: "#F8FAFC", stroke: "#E2E8F0" });
    txt({ name: "mr-btn-et", x: 1326, y: y + 15, content: "Edit", size: 11, weight: "400", color: "#475569" });

    rect({ name: "mr-sep", x: 244, y: y + 54, w: 1172, h: 1, fill: "#E2E8F0" });
  }

  masterRow(238, "TND-001", "Konsultasi Dokter Spesialis", "Jasa Medis", "Semua Poliklinik", "Rp 150.000", "Rp 150.000", "Aktif");
  masterRow(293, "TND-002", "Pemeriksaan EKG 12 Lead", "Diagnostik", "Penyakit Dalam", "Rp 120.000", "Rp 120.000", "Aktif");
  masterRow(348, "TND-003", "Nebulisasi Dewasa / Anak", "Terapi", "Penyakit Dalam / Anak", "Rp 85.000", "Rp 85.000", "Aktif");
  masterRow(403, "TND-004", "Rawat Luka Ringan", "Tindakan Bedah", "Bedah Umum", "Rp 95.000", "Rp 95.000", "Aktif");
  masterRow(458, "TND-005", "Scaling Gigi (Pembersihan Karang)", "Tindakan Gigi", "Gigi & Mulut", "Rp 250.000", "Rp 200.000", "Aktif");
  masterRow(513, "TND-006", "Profil Lipid Lengkap", "Laboratorium LIS", "Unit Lab Terpadu", "Rp 200.000", "Rp 200.000", "Aktif");
  masterRow(568, "TND-007", "Darah Rutin (CBC 18 Parameter)", "Laboratorium LIS", "Unit Lab Terpadu", "Rp 125.000", "Rp 125.000", "Aktif");

  return board;
}
