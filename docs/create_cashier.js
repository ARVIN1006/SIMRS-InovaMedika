// Generator for SIMRS Screen 7: Cashier (Kasir & Billing)
function createSimrsCashier(startX = 3100, startY = 1100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Kasir & Pembayaran";
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


  renderNavbar("Kasir & Billing Rawat Jalan");
  renderSidebar(6);

  // Main Header
  txt({ name: "cas-title", x: 244, y: 84, content: "Kasir & Billing Rawat Jalan", size: 20, weight: "700", color: "#0F172A" });
  txt({ name: "cas-sub", x: 244, y: 110, content: "Rekapitulasi tagihan terintegrasi (Klinik, Farmasi, Lab) dan pembayaran pasien", size: 12, weight: "400", color: "#64748B" });

  // 3 Metric Cards
  rect({ name: "c-cas-1", x: 244, y: 136, w: 374, h: 84, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "c-cas-1-lbl", x: 264, y: 152, content: "Menunggu Pembayaran", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "c-cas-1-val", x: 264, y: 174, content: "2", size: 26, weight: "700", color: "#D97706" });
  txt({ name: "c-cas-1-sub", x: 300, y: 180, content: "pasien menunggu kasir", size: 12, weight: "400", color: "#94A3B8" });

  rect({ name: "c-cas-2", x: 642, y: 136, w: 374, h: 84, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "c-cas-2-lbl", x: 662, y: 152, content: "Transaksi Lunas Hari Ini", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "c-cas-2-val", x: 662, y: 174, content: "34", size: 26, weight: "700", color: "#059669" });
  txt({ name: "c-cas-2-sub", x: 710, y: 180, content: "tagihan selesai", size: 12, weight: "400", color: "#94A3B8" });

  rect({ name: "c-cas-3", x: 1040, y: 136, w: 376, h: 84, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "c-cas-3-lbl", x: 1060, y: 152, content: "Total Penerimaan Kasir", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "c-cas-3-val", x: 1060, y: 174, content: "Rp 18.450.000", size: 22, weight: "700", color: "#0F172A" });
  txt({ name: "c-cas-3-sub", x: 1220, y: 180, content: "(BPJS & Tunai)", size: 11, weight: "400", color: "#64748B" });

  // 2-Column Split: Bills List (w: 520), Invoice Breakdown (w: 628)
  rect({ name: "cas-list-card", x: 244, y: 236, w: 520, h: 640, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "cas-l-title", x: 268, y: 256, content: "Daftar Tagihan Pasien", size: 15, weight: "700", color: "#0F172A" });
  rect({ name: "cas-l-sep", x: 244, y: 284, w: 520, h: 1, fill: "#E2E8F0" });

  function billItem(y, isSelected, invNo, name, ins, total, status, statusColor) {
    if (isSelected) {
      rect({ name: "bi-bg", x: 245, y: y, w: 518, h: 76, fill: "#F8FAFC" });
      rect({ name: "bi-bar", x: 245, y: y, w: 4, h: 76, fill: "#2563EB" });
    }
    // Line 1: No. Tagihan & Status
    txt({ name: "bi-no", x: 268, y: y + 12, content: invNo, size: 12, weight: "700", color: "#2563EB" });
    txt({ name: "bi-st", x: 636, y: y + 12, content: status, size: 11, weight: "600", color: statusColor });

    // Line 2: Patient Name (left) & Total (right)
    txt({ name: "bi-name", x: 268, y: y + 32, content: name, size: 14, weight: "700", color: "#0F172A" });
    txt({ name: "bi-tot", x: 636, y: y + 32, content: total, size: 13, weight: "700", color: "#0F172A" });

    // Line 3: Sub details
    txt({ name: "bi-sub", x: 268, y: y + 52, content: ins + " | Poliklinik Penyakit Dalam", size: 11, weight: "400", color: "#64748B" });
    rect({ name: "bi-sep", x: 244, y: y + 76, w: 520, h: 1, fill: "#E2E8F0" });
  }

  billItem(285, true, "INV-202611-001", "Hendra Kusuma", "BPJS Kesehatan", "Rp 555.000", "Verifikasi BPJS", "#D97706");
  billItem(363, false, "INV-202611-002", "Siti Rahmawati", "Umum / Mandiri", "Rp 210.000", "Menunggu Bayar", "#D97706");
  billItem(441, false, "INV-202611-003", "Ahmad Fauzi", "BPJS Kesehatan", "Rp 150.000", "Verifikasi BPJS", "#D97706");
  billItem(519, false, "INV-202610-098", "Bambang Subagio", "BPJS Kesehatan", "Rp 680.000", "Lunas", "#059669");

  // Right Column: Invoice Breakdown (w: 628)
  rect({ name: "cas-detail-card", x: 788, y: 236, w: 628, h: 640, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "cas-d-title", x: 812, y: 256, content: "Rincian Tagihan: INV-202611-001", size: 15, weight: "700", color: "#0F172A" });
  txt({ name: "cas-d-meta", x: 812, y: 280, content: "Pasien: Hendra Kusuma (RM-202611-001) | Poliklinik Penyakit Dalam", size: 12, weight: "400", color: "#64748B" });
  rect({ name: "cas-d-sep", x: 788, y: 304, w: 628, h: 1, fill: "#E2E8F0" });

  function itemRow(y, num, desc, qty, price, total) {
    txt({ name: "ir-num", x: 812, y: y, content: num, size: 12, weight: "600", color: "#64748B" });
    txt({ name: "ir-desc", x: 836, y: y, content: desc, size: 12, weight: "600", color: "#0F172A" });
    txt({ name: "ir-total", x: 1330, y: y, content: total, size: 12, weight: "700", color: "#0F172A" });
    rect({ name: "ir-sep", x: 812, y: y + 26, w: 580, h: 1, fill: "#F1F5F9" });
  }

  itemRow(324, "1.", "Biaya Pendaftaran & Administrasi Rekam Medis", "1", "Rp 25.000", "Rp 25.000");
  itemRow(360, "2.", "Jasa Konsultasi dr. Budi Santoso, Sp.PD", "1", "Rp 150.000", "Rp 150.000");
  itemRow(396, "3.", "Pemeriksaan EKG 12 Lead", "1", "Rp 120.000", "Rp 120.000");
  itemRow(432, "4.", "Resep Farmasi (Amlodipine & Paracetamol)", "2", "Rp 60.000", "Rp 60.000");
  itemRow(468, "5.", "Pemeriksaan Lab LIS (Profil Lipid Lengkap)", "1", "Rp 200.000", "Rp 200.000");

  // Summary Box
  rect({ name: "cas-sum-box", x: 812, y: 510, w: 580, h: 84, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "cs-sub", x: 830, y: 524, content: "Subtotal Tagihan", size: 12, weight: "400", color: "#64748B" });
  txt({ name: "cs-sub-v", x: 1300, y: 524, content: "Rp 555.000", size: 12, weight: "600", color: "#0F172A" });

  txt({ name: "cs-bpjs", x: 830, y: 546, content: "Klaim BPJS Kesehatan (Covered 100%)", size: 12, weight: "600", color: "#059669" });
  txt({ name: "cs-bpjs-v", x: 1285, y: 546, content: "- Rp 555.000", size: 12, weight: "700", color: "#059669" });

  rect({ name: "cs-div", x: 830, y: 566, w: 544, h: 1, fill: "#CBD5E1" });

  txt({ name: "cs-tot", x: 830, y: 574, content: "TOTAL DIBAYAR PASIEN", size: 12, weight: "700", color: "#0F172A" });
  txt({ name: "cs-tot-v", x: 1335, y: 574, content: "Rp 0", size: 14, weight: "700", color: "#2563EB" });

  // Buttons
  rect({ name: "cas-btn-print", x: 812, y: 614, w: 280, h: 42, r: 8, fill: "#FFFFFF", stroke: "#CBD5E1" });
  txt({ name: "cas-btn-print-t", x: 888, y: 626, content: "Cetak Kuitansi / Invoice", size: 12, weight: "600", color: "#334155" });

  rect({ name: "cas-btn-pay", x: 1112, y: 614, w: 280, h: 42, r: 8, fill: "#2563EB" });
  txt({ name: "cas-btn-pay-t", x: 1172, y: 626, content: "Selesaikan Tagihan", size: 12, weight: "600", color: "#FFFFFF" });

  return board;
}
