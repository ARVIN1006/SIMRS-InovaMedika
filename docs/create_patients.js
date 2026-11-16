// Generator for SIMRS Screen 4: Patients (Master Data Pasien & RM)
function createSimrsPatients(startX = 4600, startY = 100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Data Pasien & RM";
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


  renderNavbar("Data Pasien & Rekam Medis");
  renderSidebar(3);

  // Main Header
  txt({ name: "pat-title", x: 244, y: 84, content: "Master Data Pasien & Rekam Medis", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "pat-sub", x: 244, y: 110, content: "Database pasien terintegrasi, identitas kependudukan, dan riwayat kunjungan klinik", size: 12, weight: "400", color: "#64748B" });

  // Action Buttons
  rect({ name: "btn-export", x: 1140, y: 84, w: 120, h: 36, r: 8, fill: "#FFFFFF", stroke: "#CBD5E1" });
  txt({ name: "btn-export-txt", x: 1162, y: 94, content: "Export Data", size: 12, weight: "600", color: "#334155" });

  rect({ name: "btn-new-p", x: 1272, y: 84, w: 144, h: 36, r: 8, fill: "#2563EB" });
  txt({ name: "btn-new-p-txt", x: 1294, y: 94, content: "+ Pasien Baru", size: 12, weight: "600", color: "#FFFFFF" });

  // Table Container (w: 1172, h: 720)
  rect({ name: "pat-table-card", x: 244, y: 140, w: 1172, h: 736, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });

  // Filter Bar inside table header
  rect({ name: "f-search-box", x: 268, y: 160, w: 380, h: 36, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "f-search-placeholder", x: 284, y: 171, content: "Cari nama pasien, NIK (16 digit), atau No. RM...", size: 12, weight: "400", color: "#64748B" });

  rect({ name: "f-btn-penjamin", x: 660, y: 160, w: 130, h: 36, r: 8, fill: "#FFFFFF", stroke: "#CBD5E1" });
  txt({ name: "f-btn-penjamin-txt", x: 676, y: 171, content: "Semua Penjamin", size: 12, weight: "400", color: "#334155" });

  txt({ name: "pat-total-txt", x: 1280, y: 171, content: "Total: 1.420 Pasien", size: 12, weight: "600", color: "#64748B" });
  rect({ name: "pat-sep-top", x: 244, y: 212, w: 1172, h: 1, fill: "#E2E8F0" });

  // Table Column Header (y: 213, h: 36)
  rect({ name: "pth-bg", x: 245, y: 213, w: 1170, h: 36, fill: "#F8FAFC" });
  txt({ name: "pth-rm", x: 268, y: 224, content: "NO. REKAM MEDIS", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "pth-nik", x: 400, y: 224, content: "NIK (KTP)", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "pth-name", x: 550, y: 224, content: "NAMA LENGKAP & USIA", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "pth-contact", x: 790, y: 224, content: "KONTAK & DOMISILI", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "pth-ins", x: 1010, y: 224, content: "PENJAMIN", size: 11, weight: "700", color: "#64748B" });
  txt({ name: "pth-act", x: 1260, y: 224, content: "AKSI", size: 11, weight: "700", color: "#64748B" });
  rect({ name: "pth-sep", x: 244, y: 249, w: 1172, h: 1, fill: "#E2E8F0" });

  function patientRow(y, rm, nik, name, ageJk, phone, city, ins) {
    txt({ name: "pr-rm", x: 268, y: y + 14, content: rm, size: 12, weight: "700", color: "#0F172A" });
    txt({ name: "pr-nik", x: 400, y: y + 14, content: nik, size: 12, weight: "400", color: "#64748B" });
    txt({ name: "pr-name", x: 550, y: y + 6, content: name, size: 13, weight: "700", color: "#0F172A" });
    txt({ name: "pr-age", x: 550, y: y + 24, content: ageJk, size: 11, weight: "400", color: "#64748B" });
    txt({ name: "pr-phone", x: 790, y: y + 6, content: phone, size: 12, weight: "400", color: "#0F172A" });
    txt({ name: "pr-city", x: 790, y: y + 24, content: city, size: 11, weight: "400", color: "#64748B" });
    txt({ name: "pr-ins", x: 1010, y: y + 14, content: ins, size: 12, weight: "400", color: "#334155" });

    rect({ name: "pr-btn-rm", x: 1240, y: y + 8, w: 70, h: 30, r: 6, fill: "#EFF6FF" });
    txt({ name: "pr-btn-rm-t", x: 1252, y: y + 15, content: "Lihat RM", size: 11, weight: "600", color: "#1D4ED8" });

    rect({ name: "pr-btn-edit", x: 1320, y: y + 8, w: 60, h: 30, r: 6, fill: "#F8FAFC", stroke: "#E2E8F0" });
    txt({ name: "pr-btn-edit-t", x: 1336, y: y + 15, content: "Edit", size: 11, weight: "400", color: "#475569" });

    rect({ name: "pr-sep", x: 244, y: y + 54, w: 1172, h: 1, fill: "#E2E8F0" });
  }

  patientRow(250, "RM-202611-001", "3204123456780001", "Hendra Kusuma", "45 Th | Laki-laki", "0812-3456-7890", "Majalaya, Kab. Bandung", "BPJS Kesehatan");
  patientRow(305, "RM-202611-002", "3204123456780002", "Siti Rahmawati", "32 Th | Perempuan", "0812-9876-5432", "Ciparay, Kab. Bandung", "Umum / Mandiri");
  patientRow(360, "RM-202611-003", "3204123456780003", "Ahmad Fauzi", "28 Th | Laki-laki", "0856-1122-3344", "Rancaekek, Kab. Bandung", "BPJS Kesehatan");
  patientRow(415, "RM-202611-004", "3204123456780004", "Dewi Lestari", "7 Th | Perempuan", "0877-9988-7766", "Solokanjeruk, Bandung", "Asuransi Swasta");
  patientRow(470, "RM-202610-098", "3204123456780005", "Bambang Subagio", "60 Th | Laki-laki", "0813-4455-6677", "Majalaya, Kab. Bandung", "BPJS Kesehatan");
  patientRow(525, "RM-202610-099", "3204123456780006", "Ratna Sari", "51 Th | Perempuan", "0818-2233-4455", "Paseh, Kab. Bandung", "Umum / Mandiri");
  patientRow(580, "RM-202610-100", "3204123456780007", "Dedi Kurniawan", "39 Th | Laki-laki", "0819-3344-5566", "Baleendah, Bandung", "BPJS Kesehatan");

  return board;
}
