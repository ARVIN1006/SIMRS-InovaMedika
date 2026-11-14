const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const labRoutes = require('./routes/lab');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'OK';
  try {
    await db.query('SELECT 1');
  } catch (err) {
    dbStatus = 'FAIL: ' + err.message;
  }

  res.json({
    success: true,
    message: 'SIMRS PT Inova Medika Solusindo Node.js Service is operational.',
    data: {
      service: 'Node.js Ancillary & Analytics Backend Service',
      version: '1.0.0',
      node_version: process.version,
      port: PORT,
      db_status: dbStatus,
      server_time: new Date().toISOString(),
    },
  });
});

// Interactive API Documentation (Requirement C.5)
app.get(['/', '/api/docs'], (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Dokumentasi API Node.js Service - SIMRS Inova Medika</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; }
    h1 { color: #38bdf8; margin-top: 0; }
    h2 { color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-top: 2rem; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .badge-get { background: #0284c7; color: white; }
    .badge-post { background: #16a34a; color: white; }
    .badge-put { background: #d97706; color: white; }
    .endpoint { background: #0f172a; padding: 12px; border-radius: 8px; margin: 10px 0; border: 1px solid #334155; }
    code { font-family: ui-monospace, Menlo, Monaco, monospace; color: #f43f5e; }
    p { line-height: 1.5; color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="container">
    <h1>SIMRS Node.js Services & Ancillary API</h1>
    <p>Layanan API pendukung untuk Pemeriksaan Penunjang (Laboratorium), Dashboard Analytics, dan Integrasi Eksternal PT Inova Medika Solusindo.</p>

    <h2>1. Dashboard & Analytics API</h2>
    <div class="endpoint">
      <span class="badge badge-get">GET</span> <code>/api/dashboard/stats</code>
      <p>Mengambil ringkasan operasional rawat jalan (kunjungan, kunjungan per poli, tindakan, pendapatan, obat terlaris). Mendukung filter <code>?period=today|7days|30days|all</code>.</p>
    </div>

    <h2>2. Pemeriksaan Penunjang (Laboratorium) API</h2>
    <div class="endpoint">
      <span class="badge badge-get">GET</span> <code>/api/lab/requests</code>
      <p>Daftar seluruh permintaan laboratorium dengan filter status dan prioritas.</p>
    </div>
    <div class="endpoint">
      <span class="badge badge-get">GET</span> <code>/api/lab/requests/:id</code>
      <p>Detail permintaan laboratorium lengkap dengan hasil uji parameter.</p>
    </div>
    <div class="endpoint">
      <span class="badge badge-post">POST</span> <code>/api/lab/requests</code>
      <p>Membuat permintaan laboratorium baru dari dokter atau sistem eksternal.</p>
    </div>
    <div class="endpoint">
      <span class="badge badge-put">PUT</span> <code>/api/lab/results/:id</code>
      <p>Input dan verifikasi hasil uji laboratorium oleh petugas analis lab.</p>
    </div>

    <h2>3. Resiliensi Integrasi & Circuit Breaker (Skenario D.5)</h2>
    <div class="endpoint">
      <span class="badge badge-post">POST</span> <code>/api/lab/external-integration/webhook</code>
      <p>Simulasi integrasi eksternal dengan proteksi Circuit Breaker otomatis.</p>
    </div>
  </div>
</body>
</html>
  `);
});

// Mount Routes
app.use('/api/lab', labRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[SIMRS Node.js Service] Server running on port ${PORT}`);
  console.log(`[SIMRS Node.js Service] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[SIMRS Node.js Service] Interactive Docs: http://localhost:${PORT}/api/docs`);
});
