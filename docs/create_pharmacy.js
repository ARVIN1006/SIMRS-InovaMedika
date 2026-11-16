// Generator for SIMRS Screen 5: Pharmacy (Farmasi & Resep)
function createSimrsPharmacy(startX = 100, startY = 1100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Farmasi & Resep";
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


  renderNavbar("Farmasi & Resep Obat");
  renderSidebar(4);

  // Main Header
  txt({ name: "ph-title", x: 244, y: 84, content: "Pelayanan Farmasi & Dispensing Obat", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "ph-sub", x: 244, y: 110, content: "Telaah resep elektronik (e-prescription), peracikan obat, dan penyerahan ke pasien", size: 12, weight: "400", color: "#64748B" });

  // 3 Metric Cards (Clean typography)
  rect({ name: "c-ph-1", x: 244, y: 136, w: 374, h: 84, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "c-ph-1-lbl", x: 264, y: 152, content: "Menunggu Telaah Resep", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "c-ph-1-val", x: 264, y: 174, content: "3", size: 26, weight: "700", color: "#D97706" });
  txt({ name: "c-ph-1-sub", x: 300, y: 180, content: "antrean masuk poli", size: 12, weight: "400", color: "#94A3B8" });

  rect({ name: "c-ph-2", x: 642, y: 136, w: 374, h: 84, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "c-ph-2-lbl", x: 662, y: 152, content: "Sedang Disiapkan Apoteker", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "c-ph-2-val", x: 662, y: 174, content: "2", size: 26, weight: "700", color: "#2563EB" });
  txt({ name: "c-ph-2-sub", x: 700, y: 180, content: "dalam proses packaging", size: 12, weight: "400", color: "#94A3B8" });

  rect({ name: "c-ph-3", x: 1040, y: 136, w: 376, h: 84, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "c-ph-3-lbl", x: 1060, y: 152, content: "Obat Telah Diserahkan", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "c-ph-3-val", x: 1060, y: 174, content: "28", size: 26, weight: "700", color: "#059669" });
  txt({ name: "c-ph-3-sub", x: 1104, y: 180, content: "pasien hari ini", size: 12, weight: "400", color: "#94A3B8" });

  // 2-Column Split: Left List (w: 520), Right Detail (w: 628)
  rect({ name: "ph-list-card", x: 244, y: 236, w: 520, h: 640, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "ph-l-title", x: 268, y: 256, content: "Daftar Resep Masuk", size: 15, weight: "700", color: "#0F172A" });
  rect({ name: "ph-l-sep", x: 244, y: 284, w: 520, h: 1, fill: "#E2E8F0" });

  function rxItem(y, isSelected, rxNo, name, rm, doc, count, status, statusColor) {
    if (isSelected) {
      rect({ name: "rxi-bg", x: 245, y: y, w: 518, h: 72, fill: "#F8FAFC" });
      rect({ name: "rxi-bar", x: 245, y: y, w: 4, h: 72, fill: "#2563EB" });
    }
    txt({ name: "rxi-no", x: 268, y: y + 14, content: rxNo, size: 12, weight: "700", color: "#2563EB" });
    txt({ name: "rxi-name", x: 380, y: y + 14, content: name, size: 13, weight: "700", color: "#0F172A" });
    txt({ name: "rxi-sub", x: 268, y: y + 36, content: rm + " | " + doc + " (" + count + " Item)", size: 11, weight: "400", color: "#64748B" });
    txt({ name: "rxi-st", x: 440, y: y + 14, content: status, size: 11, weight: "600", color: statusColor });
    rect({ name: "rxi-sep", x: 244, y: y + 72, w: 520, h: 1, fill: "#E2E8F0" });
  }

  rxItem(285, true, "RX-202611-001", "Hendra Kusuma", "RM-202611-001", "dr. Budi Santoso", "2", "Menunggu Telaah", "#D97706");
  rxItem(358, false, "RX-202611-002", "Siti Rahmawati", "RM-202611-002", "dr. Budi Santoso", "1", "Menunggu Telaah", "#D97706");
  rxItem(431, false, "RX-202611-003", "Ahmad Fauzi", "RM-202611-003", "dr. Budi Santoso", "3", "Sedang Disiapkan", "#2563EB");
  rxItem(504, false, "RX-202610-098", "Bambang Subagio", "RM-202610-098", "dr. Budi Santoso", "2", "Selesai Diserahkan", "#059669");

  // Right Detail Card (w: 628)
  rect({ name: "ph-detail-card", x: 788, y: 236, w: 628, h: 640, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "ph-d-title", x: 812, y: 256, content: "Detail Resep: RX-202611-001", size: 15, weight: "700", color: "#0F172A" });
  txt({ name: "ph-d-meta", x: 812, y: 280, content: "Pasien: Hendra Kusuma (RM-202611-001) | Dokter: dr. Budi Santoso, Sp.PD", size: 12, weight: "400", color: "#64748B" });
  rect({ name: "ph-d-sep", x: 788, y: 304, w: 628, h: 1, fill: "#E2E8F0" });

  // Checklist Telaah Resep
  txt({ name: "ph-chk-title", x: 812, y: 320, content: "Kriteria Telaah Resep Farmasi", size: 12, weight: "700", color: "#475569" });
  rect({ name: "ph-chk-box", x: 812, y: 338, w: 580, h: 48, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "ph-chk-1", x: 828, y: 354, content: "Tepat Pasien & Obat (OK)", size: 11, weight: "600", color: "#059669" });
  txt({ name: "ph-chk-2", x: 1010, y: 354, content: "Tepat Dosis & Rute (OK)", size: 11, weight: "600", color: "#059669" });
  txt({ name: "ph-chk-3", x: 1200, y: 354, content: "Tidak Ada Interaksi (OK)", size: 11, weight: "600", color: "#059669" });

  // Item Obat 1
  rect({ name: "ph-drug-1", x: 812, y: 406, w: 580, h: 68, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "ph-d1-n", x: 828, y: 422, content: "Amlodipine 10 mg Tablet", size: 13, weight: "700", color: "#0F172A" });
  txt({ name: "ph-d1-s", x: 828, y: 444, content: "Signa: 1x sehari 1 tablet sesudah makan pagi | Stok Gudang: 450 Tab", size: 11, weight: "400", color: "#64748B" });
  txt({ name: "ph-d1-q", x: 1300, y: 430, content: "30 Tab", size: 13, weight: "700", color: "#2563EB" });

  // Item Obat 2
  rect({ name: "ph-drug-2", x: 812, y: 486, w: 580, h: 68, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "ph-d2-n", x: 828, y: 502, content: "Paracetamol 500 mg Tablet", size: 13, weight: "700", color: "#0F172A" });
  txt({ name: "ph-d2-s", x: 828, y: 524, content: "Signa: 3x sehari 1 tablet jika rasa nyeri/pusing | Stok Gudang: 1.200 Tab", size: 11, weight: "400", color: "#64748B" });
  txt({ name: "ph-d2-q", x: 1300, y: 510, content: "10 Tab", size: 13, weight: "700", color: "#2563EB" });

  // Actions
  rect({ name: "ph-btn-prep", x: 812, y: 574, w: 280, h: 42, r: 8, fill: "#FFFFFF", stroke: "#2563EB" });
  txt({ name: "ph-btn-prep-t", x: 868, y: 586, content: "Verifikasi & Siapkan Obat", size: 12, weight: "600", color: "#2563EB" });

  rect({ name: "ph-btn-done", x: 1112, y: 574, w: 280, h: 42, r: 8, fill: "#2563EB" });
  txt({ name: "ph-btn-done-t", x: 1162, y: 586, content: "Serahkan Obat ke Pasien", size: 12, weight: "600", color: "#FFFFFF" });

  return board;
}
