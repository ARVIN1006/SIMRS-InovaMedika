// Generator for SIMRS Screen 3: Registration (Pendaftaran Pasien)
function createSimrsRegistration(startX = 3100, startY = 100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Pendaftaran Pasien";
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


  renderNavbar("Pendaftaran Rawat Jalan");
  renderSidebar(1);

  // Main Header
  txt({ name: "reg-title", x: 244, y: 84, content: "Pendaftaran Pasien & Cetak Antrean", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "reg-sub", x: 244, y: 110, content: "Form pendaftaran pasien poli rawat jalan dan penerbitan karcis antrean", size: 12, weight: "400", color: "#64748B" });

  // Left Column: Form Pendaftaran (w: 684)
  rect({ name: "reg-form-card", x: 244, y: 140, w: 684, h: 736, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "form-h", x: 268, y: 160, content: "Form Pendaftaran Poliklinik", size: 15, weight: "700", color: "#0F172A" });
  rect({ name: "form-sep", x: 244, y: 188, w: 684, h: 1, fill: "#E2E8F0" });

  // Search existing patient input
  txt({ name: "f-lbl-search", x: 268, y: 204, content: "Cari Pasien Terdaftar (NIK / No. RM)", size: 12, weight: "600", color: "#475569" });
  rect({ name: "f-box-search", x: 268, y: 222, w: 636, h: 40, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "f-val-search", x: 284, y: 234, content: "3204123456780001 (Hendra Kusuma - RM-202611-001)", size: 12, weight: "600", color: "#0F172A" });

  // Selected Patient Box
  rect({ name: "f-patient-box", x: 268, y: 274, w: 636, h: 64, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "f-p-name", x: 284, y: 288, content: "Hendra Kusuma (L, 45 Th)", size: 13, weight: "700", color: "#0F172A" });
  txt({ name: "f-p-meta", x: 284, y: 308, content: "RM-202611-001 | BPJS: 000123456789 | Alamat: Jl. Raya Majalaya No. 45", size: 11, weight: "400", color: "#64748B" });

  // Poliklinik Tujuan
  txt({ name: "f-lbl-poli", x: 268, y: 354, content: "Poliklinik Tujuan", size: 12, weight: "600", color: "#475569" });
  rect({ name: "f-box-poli", x: 268, y: 372, w: 636, h: 40, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "f-val-poli", x: 284, y: 384, content: "Klinik Spesialis Penyakit Dalam (Lantai 2 - Ruang 204)", size: 12, weight: "400", color: "#0F172A" });

  // Dokter Praktek
  txt({ name: "f-lbl-doc", x: 268, y: 426, content: "Dokter Spesialis & Jadwal", size: 12, weight: "600", color: "#475569" });
  rect({ name: "f-box-doc", x: 268, y: 444, w: 636, h: 40, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "f-val-doc", x: 284, y: 456, content: "dr. Budi Santoso, Sp.PD (Shift Pagi: 08:00 - 12:00 WIB)", size: 12, weight: "400", color: "#0F172A" });

  // Penjamin
  txt({ name: "f-lbl-pay", x: 268, y: 498, content: "Skema Penjamin / Pembayaran", size: 12, weight: "600", color: "#475569" });
  rect({ name: "f-box-pay", x: 268, y: 516, w: 636, h: 40, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "f-val-pay", x: 284, y: 528, content: "BPJS Kesehatan (Rujukan Faskes 1 Aktif)", size: 12, weight: "400", color: "#0F172A" });

  // Keluhan / Catatan
  txt({ name: "f-lbl-note", x: 268, y: 570, content: "Keluhan Awal Pasien", size: 12, weight: "600", color: "#475569" });
  rect({ name: "f-box-note", x: 268, y: 588, w: 636, h: 52, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "f-val-note", x: 284, y: 602, content: "Kontrol tensi rutin, mengeluh sering pusing dan rasa kaku pada leher.", size: 12, weight: "400", color: "#0F172A" });

  // Submit Button
  rect({ name: "f-btn-submit", x: 268, y: 660, w: 636, h: 46, r: 8, fill: "#2563EB" });
  txt({ name: "f-btn-txt", x: 440, y: 674, content: "Daftarkan Pasien & Terbitkan Antrean", size: 13, weight: "600", color: "#FFFFFF" });

  // Right Column: Karcis Cetak & Kuota (w: 464)
  // Card 1: Karcis Tiket Antrean (Thermal print style)
  rect({ name: "ticket-card", x: 952, y: 140, w: 464, h: 360, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "t-h-rs", x: 1040, y: 165, content: "RS INOVA MEDIKA SOLUSINDO", size: 14, weight: "700", color: "#0F172A" });
  txt({ name: "t-h-sub", x: 1080, y: 185, content: "Instalasi Rawat Jalan Terpadu", size: 11, weight: "400", color: "#64748B" });
  rect({ name: "t-div-1", x: 976, y: 205, w: 416, h: 1, fill: "#E2E8F0" });

  txt({ name: "t-lbl-q", x: 1110, y: 220, content: "NOMOR ANTREAN", size: 11, weight: "600", color: "#64748B" });
  txt({ name: "t-num-q", x: 1100, y: 245, content: "A-005", size: 42, weight: "700", color: "#0F172A" });

  txt({ name: "t-detail-1", x: 990, y: 310, content: "Poli: Spesialis Penyakit Dalam (dr. Budi Santoso, Sp.PD)", size: 11, weight: "600", color: "#0F172A" });
  txt({ name: "t-detail-2", x: 990, y: 330, content: "Pasien: Hendra Kusuma (RM-202611-001) | BPJS", size: 11, weight: "400", color: "#475569" });
  txt({ name: "t-detail-3", x: 990, y: 350, content: "Waktu Cetak: Senin, 16 Nov 2026 08:45 WIB", size: 11, weight: "400", color: "#94A3B8" });

  rect({ name: "t-btn-print", x: 976, y: 380, w: 416, h: 38, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "t-btn-txt", x: 1120, y: 391, content: "Cetak Ulang Karcis", size: 12, weight: "600", color: "#334155" });

  // Card 2: Status Kuota Poliklinik Hari Ini
  rect({ name: "quota-card", x: 952, y: 520, w: 464, h: 356, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "q-title", x: 976, y: 544, content: "Kapasitas & Kuota Poliklinik", size: 14, weight: "700", color: "#0F172A" });
  rect({ name: "q-sep", x: 952, y: 570, w: 464, h: 1, fill: "#E2E8F0" });

  function quotaRow(y, poli, doc, count, max, status) {
    txt({ name: "qr-p", x: 976, y: y, content: poli, size: 12, weight: "600", color: "#0F172A" });
    txt({ name: "qr-d", x: 976, y: y + 18, content: doc, size: 11, weight: "400", color: "#64748B" });
    txt({ name: "qr-c", x: 1280, y: y + 8, content: count + " / " + max + " Pasien", size: 12, weight: "600", color: "#0F172A" });
    rect({ name: "qr-div", x: 976, y: y + 42, w: 416, h: 1, fill: "#F1F5F9" });
  }

  quotaRow(590, "Klinik Penyakit Dalam", "dr. Budi Santoso, Sp.PD", "14", "25", "Tersedia");
  quotaRow(650, "Klinik Anak & Tumbuh Kembang", "dr. Anita Rahayu, Sp.A", "8", "20", "Tersedia");
  quotaRow(710, "Klinik Bedah Umum", "dr. Candra Wijaya, Sp.B", "5", "15", "Tersedia");
  quotaRow(770, "Klinik Gigi & Mulut", "drg. Diana Permata", "6", "12", "Tersedia");

  return board;
}
