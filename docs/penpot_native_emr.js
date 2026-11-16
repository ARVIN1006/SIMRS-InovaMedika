// Generator for SIMRS EMR (Pemeriksaan RME) using native Penpot shapes

function createSimrsEmr(startX = 1600, startY = 100) {
  const board = penpot.createBoard();
  board.name = "SIMRS - Pemeriksaan RME";
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

  // Back Button (Pure rectangles and text)
  rect({ name: "btn-back", x: 24, y: 14, w: 170, h: 36, r: 8, fill: "#F1F5F9", stroke: "#E2E8F0" });
  rect({ name: "arrow-stem", x: 38, y: 31, w: 12, h: 2, r: 1, fill: "#0F172A" });
  rect({ name: "arrow-top", x: 38, y: 28, w: 4, h: 2, r: 1, fill: "#0F172A" });
  rect({ name: "arrow-bot", x: 38, y: 34, w: 4, h: 2, r: 1, fill: "#0F172A" });
  txt({ name: "btn-back-txt", x: 58, y: 23, content: "Kembali ke Antrean", size: 12, weight: "700", color: "#0F172A" });

  // Active Tag
  rect({ name: "status-tag", x: 210, y: 19, w: 130, h: 26, r: 4, fill: "#EFF6FF", stroke: "#BFDBFE" });
  txt({ name: "status-tag-txt", x: 220, y: 24, content: "KONSULTASI AKTIF", size: 10, weight: "700", color: "#1D4ED8" });

  // Right Action: Selesai & Kirim Resep
  rect({ name: "btn-complete", x: 1236, y: 14, w: 180, h: 36, r: 8, fill: "#2563EB" });
  txt({ name: "btn-complete-txt", x: 1256, y: 23, content: "Selesai & Kirim Resep", size: 12, weight: "700", color: "#FFFFFF" });

  // --- PATIENT SUMMARY CARD ---
  rect({ name: "patient-card", x: 24, y: 80, w: 1392, h: 76, r: 10, fill: "#FFFFFF", stroke: "#E2E8F0" });
  circle({ name: "patient-avatar", x: 44, y: 96, size: 44, fill: "#EFF6FF", stroke: "#BFDBFE" });
  txt({ name: "avatar-initials", x: 56, y: 108, content: "HK", size: 15, weight: "700", color: "#2563EB" });

  txt({ name: "p-name", x: 104, y: 96, content: "Hendra Kusuma", size: 16, weight: "700", color: "#0F172A" });
  rect({ name: "bpjs-tag", x: 235, y: 96, w: 110, h: 22, r: 4, fill: "#ECFDF5", stroke: "#A7F3D0" });
  txt({ name: "bpjs-tag-txt", x: 243, y: 100, content: "BPJS KESEHATAN", size: 9, weight: "700", color: "#059669" });
  txt({ name: "p-demo", x: 104, y: 120, content: "RM-202611-001 | Laki-laki, 45 Th | Gol. Darah: O+ | NIK: 3204123456780001", size: 12, weight: "400", color: "#64748B" });

  // Vitals Row (Pure boxes)
  // TD
  rect({ name: "vit-td", x: 670, y: 92, w: 136, h: 52, r: 8, fill: "#FEF2F2", stroke: "#FECACA" });
  txt({ name: "vit-td-lbl", x: 682, y: 98, content: "TEKANAN DARAH", size: 9, weight: "700", color: "#991B1B" });
  txt({ name: "vit-td-val", x: 682, y: 116, content: "140/90 mmHg", size: 13, weight: "700", color: "#DC2626" });

  // HR
  rect({ name: "vit-hr", x: 818, y: 92, w: 110, h: 52, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "vit-hr-lbl", x: 830, y: 98, content: "NADI / HR", size: 9, weight: "700", color: "#64748B" });
  txt({ name: "vit-hr-val", x: 830, y: 116, content: "78 bpm", size: 13, weight: "700", color: "#0F172A" });

  // Suhu
  rect({ name: "vit-temp", x: 940, y: 92, w: 105, h: 52, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "vit-temp-lbl", x: 952, y: 98, content: "SUHU TUBUH", size: 9, weight: "700", color: "#64748B" });
  txt({ name: "vit-temp-val", x: 952, y: 116, content: "36.7 C", size: 13, weight: "700", color: "#0F172A" });

  // SpO2
  rect({ name: "vit-spo2", x: 1057, y: 92, w: 95, h: 52, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "vit-spo2-lbl", x: 1069, y: 98, content: "SATURASI", size: 9, weight: "700", color: "#64748B" });
  txt({ name: "vit-spo2-val", x: 1069, y: 116, content: "99 %", size: 13, weight: "700", color: "#0F172A" });

  // TB/BB
  rect({ name: "vit-bb", x: 1164, y: 92, w: 140, h: 52, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "vit-bb-lbl", x: 1176, y: 98, content: "TB / BB", size: 9, weight: "700", color: "#64748B" });
  txt({ name: "vit-bb-val", x: 1176, y: 116, content: "170 cm / 72 kg", size: 12, weight: "700", color: "#0F172A" });

  // BMI
  rect({ name: "vit-bmi", x: 1316, y: 92, w: 84, h: 52, r: 8, fill: "#EFF6FF", stroke: "#BFDBFE" });
  txt({ name: "vit-bmi-lbl", x: 1324, y: 98, content: "STATUS BMI", size: 9, weight: "700", color: "#1D4ED8" });
  txt({ name: "vit-bmi-val", x: 1324, y: 116, content: "24.9 Normal", size: 11, weight: "700", color: "#1D4ED8" });

  // --- TWO COLUMNS WORK AREA ---
  // LEFT COLUMN: Anamnesis & Diagnosis
  rect({ name: "col-left", x: 24, y: 168, w: 684, h: 708, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "col-left-title", x: 48, y: 188, content: "Pemeriksaan Klinis & Anamnesis Pasien", size: 15, weight: "700", color: "#0F172A" });
  rect({ name: "col-left-sep", x: 24, y: 218, w: 684, h: 1, fill: "#E2E8F0" });

  // Keluhan Utama
  txt({ name: "lbl-keluhan", x: 48, y: 234, content: "Keluhan Utama", size: 12, weight: "700", color: "#475569" });
  rect({ name: "box-keluhan", x: 48, y: 252, w: 636, h: 44, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "txt-keluhan", x: 62, y: 266, content: "Pusing tengkuk dan rasa kaku pada leher sejak 3 hari lalu.", size: 13, weight: "400", color: "#0F172A" });

  // Anamnesis
  txt({ name: "lbl-anamnesis", x: 48, y: 312, content: "Anamnesis / Riwayat Penyakit & Pengobatan", size: 12, weight: "700", color: "#475569" });
  rect({ name: "box-anamnesis", x: 48, y: 330, w: 636, h: 84, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "txt-anam-1", x: 62, y: 346, content: "Riwayat hipertensi sejak 2 tahun lalu, tidak rutin kontrol obat.", size: 13, weight: "400", color: "#0F172A" });
  txt({ name: "txt-anam-2", x: 62, y: 370, content: "Alergi obat: Tidak ada. Tidak ada riwayat penyakit jantung koroner.", size: 13, weight: "400", color: "#0F172A" });

  // Pemeriksaan Fisik
  txt({ name: "lbl-fisik", x: 48, y: 430, content: "Pemeriksaan Fisik Terarah", size: 12, weight: "700", color: "#475569" });
  rect({ name: "box-fisik", x: 48, y: 448, w: 636, h: 84, r: 8, fill: "#F8FAFC", stroke: "#CBD5E1" });
  txt({ name: "txt-fisik-1", x: 62, y: 464, content: "KU: Sedang, Kesadaran: Compos Mentis. Nyeri tekan suboksipital (+).", size: 13, weight: "400", color: "#0F172A" });
  txt({ name: "txt-fisik-2", x: 62, y: 488, content: "Cor / Pulmo: S1 S2 reguler murni, murmur (-). Vesikuler (+/+). Edema (-/-).", size: 13, weight: "400", color: "#0F172A" });

  // Diagnosis ICD-10
  txt({ name: "lbl-diag", x: 48, y: 550, content: "Penegakan Diagnosis (ICD-10 Standar Kemenkes)", size: 14, weight: "700", color: "#0F172A" });

  // Diag 1: I10
  rect({ name: "diag-1-box", x: 48, y: 572, w: 636, h: 56, r: 8, fill: "#EFF6FF", stroke: "#BFDBFE" });
  rect({ name: "diag-1-code-bg", x: 60, y: 586, w: 64, h: 28, r: 6, fill: "#1D4ED8" });
  txt({ name: "diag-1-code", x: 74, y: 592, content: "I10", size: 12, weight: "700", color: "#FFFFFF" });
  txt({ name: "diag-1-title", x: 136, y: 584, content: "Essential (primary) hypertension", size: 13, weight: "700", color: "#1E3A8A" });
  txt({ name: "diag-1-sub", x: 136, y: 602, content: "Diagnosis Utama Rawat Jalan (Poliklinik Penyakit Dalam)", size: 11, weight: "600", color: "#3B82F6" });

  // Diag 2: G44.2
  rect({ name: "diag-2-box", x: 48, y: 638, w: 636, h: 50, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  rect({ name: "diag-2-code-bg", x: 60, y: 651, w: 64, h: 24, r: 6, fill: "#64748B" });
  txt({ name: "diag-2-code", x: 70, y: 656, content: "G44.2", size: 11, weight: "700", color: "#FFFFFF" });
  txt({ name: "diag-2-title", x: 136, y: 648, content: "Tension-type headache", size: 12, weight: "700", color: "#334155" });
  txt({ name: "diag-2-sub", x: 136, y: 664, content: "Diagnosis Sekunder / Komorbiditas Gejala Klinis", size: 11, weight: "400", color: "#64748B" });


  // RIGHT COLUMN: Tindakan, Resep & Lab Order
  rect({ name: "col-right", x: 732, y: 168, w: 684, h: 708, r: 12, fill: "#FFFFFF", stroke: "#E2E8F0" });
  txt({ name: "col-right-title", x: 756, y: 188, content: "Tindakan Medis, Resep Elektronik & Laboratorium", size: 15, weight: "700", color: "#0F172A" });
  rect({ name: "col-right-sep", x: 732, y: 218, w: 684, h: 1, fill: "#E2E8F0" });

  // Section 1: Tindakan Medis
  txt({ name: "lbl-tindakan", x: 756, y: 234, content: "Tindakan & Layanan Poliklinik", size: 12, weight: "700", color: "#475569" });
  // Row 1
  rect({ name: "tind-1-box", x: 756, y: 252, w: 636, h: 42, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "tind-1-name", x: 772, y: 265, content: "Konsultasi Dokter Spesialis Penyakit Dalam", size: 13, weight: "600", color: "#0F172A" });
  txt({ name: "tind-1-price", x: 1290, y: 265, content: "Rp 150.000", size: 13, weight: "700", color: "#0F172A" });
  // Row 2
  rect({ name: "tind-2-box", x: 756, y: 302, w: 636, h: 42, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "tind-2-name", x: 772, y: 315, content: "Pemeriksaan Rekam Jantung (EKG 12 Lead)", size: 13, weight: "600", color: "#0F172A" });
  txt({ name: "tind-2-price", x: 1290, y: 315, content: "Rp 120.000", size: 13, weight: "700", color: "#0F172A" });

  // Section 2: Resep Obat Elektronik
  txt({ name: "lbl-resep", x: 756, y: 362, content: "Resep Obat Farmasi (E-Prescription)", size: 12, weight: "700", color: "#475569" });
  // Drug 1
  rect({ name: "drug-1-box", x: 756, y: 380, w: 636, h: 56, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "drug-1-name", x: 772, y: 394, content: "Amlodipine 10 mg Tablet", size: 13, weight: "700", color: "#0F172A" });
  txt({ name: "drug-1-signa", x: 772, y: 412, content: "1x sehari 1 tablet sesudah makan pagi", size: 11, weight: "400", color: "#64748B" });
  rect({ name: "drug-1-qty-box", x: 1310, y: 395, w: 66, h: 26, r: 6, fill: "#EFF6FF" });
  txt({ name: "drug-1-qty", x: 1320, y: 401, content: "30 Tab", size: 11, weight: "700", color: "#1D4ED8" });
  // Drug 2
  rect({ name: "drug-2-box", x: 756, y: 444, w: 636, h: 56, r: 8, fill: "#F8FAFC", stroke: "#E2E8F0" });
  txt({ name: "drug-2-name", x: 772, y: 458, content: "Paracetamol 500 mg Tablet", size: 13, weight: "700", color: "#0F172A" });
  txt({ name: "drug-2-signa", x: 772, y: 476, content: "3x sehari 1 tablet jika terasa nyeri tengkuk / pusing", size: 11, weight: "400", color: "#64748B" });
  rect({ name: "drug-2-qty-box", x: 1310, y: 459, w: 66, h: 26, r: 6, fill: "#F1F5F9" });
  txt({ name: "drug-2-qty", x: 1320, y: 465, content: "10 Tab", size: 11, weight: "700", color: "#475569" });

  // Section 3: Laboratorium LIS
  txt({ name: "lbl-lab", x: 756, y: 518, content: "Pemeriksaan Laboratorium Terintegrasi (LIS)", size: 12, weight: "700", color: "#475569" });
  rect({ name: "lab-box", x: 756, y: 536, w: 636, h: 54, r: 8, fill: "#F0FDF4", stroke: "#BBF7D0" });
  txt({ name: "lab-name", x: 772, y: 550, content: "Profil Lipid Lengkap (Kolesterol Total, Trigliserida, HDL, LDL)", size: 13, weight: "700", color: "#14532D" });
  txt({ name: "lab-status", x: 772, y: 568, content: "Status: Siap kirim order sampel ke unit laboratorium (LIS Terintegrasi)", size: 11, weight: "600", color: "#166534" });

  // Section 4: Billing Summary Card
  rect({ name: "bill-box", x: 756, y: 610, w: 636, h: 80, r: 10, fill: "#0F172A" });
  txt({ name: "bill-lbl", x: 780, y: 628, content: "TOTAL ESTIMASI BIAYA PELAYANAN", size: 11, weight: "700", color: "#94A3B8" });
  txt({ name: "bill-val", x: 780, y: 652, content: "Rp 555.000", size: 24, weight: "700", color: "#38BDF8" });
  rect({ name: "bill-bpjs-box", x: 1210, y: 634, w: 166, h: 32, r: 6, fill: "#064E3B", stroke: "#059669" });
  txt({ name: "bill-bpjs-txt", x: 1222, y: 644, content: "DITANGGUNG BPJS 100%", size: 10, weight: "700", color: "#6EE7B7" });

  return board;
}
