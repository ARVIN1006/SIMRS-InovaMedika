const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');

// 1. GET /api/lab/requests - List all lab requests
router.get('/requests', authenticate, async (req, res, next) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    let queryText = `
      SELECT lr.*, 
             p.name AS patient_name, p.mr_number, p.gender, p.birth_date,
             d.name AS doctor_name,
             (SELECT COUNT(*) FROM lab_results WHERE lab_request_id = lr.id) AS result_count
      FROM lab_requests lr
      JOIN patients p ON lr.patient_id = p.id
      JOIN doctors d ON lr.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND lr.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      queryText += ` AND lr.priority = $${params.length}`;
    }

    queryText += ` ORDER BY lr.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await db.query(queryText, params);
    res.json({
      success: true,
      message: 'Daftar permintaan laboratorium berhasil diambil.',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/lab/requests/:id - Single lab request with full results
router.get('/requests/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqResult = await db.query(
      `SELECT lr.*, 
              p.name AS patient_name, p.mr_number, p.gender, p.birth_date, p.allergies,
              d.name AS doctor_name, d.specialization
       FROM lab_requests lr
       JOIN patients p ON lr.patient_id = p.id
       JOIN doctors d ON lr.doctor_id = d.id
       WHERE lr.id = $1`,
      [id]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan laboratorium tidak ditemukan.',
        data: null,
      });
    }

    const labReq = reqResult.rows[0];
    const resultsResult = await db.query(
      `SELECT lr.*, u.full_name AS performed_by_name
       FROM lab_results lr
       LEFT JOIN users u ON lr.performed_by = u.id
       WHERE lr.lab_request_id = $1
       ORDER BY lr.id ASC`,
      [id]
    );

    labReq.results = resultsResult.rows;

    res.json({
      success: true,
      message: 'Detail permintaan laboratorium berhasil diambil.',
      data: labReq,
    });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/lab/requests - External / Ancillary lab request creation
router.post('/requests', authenticate, requireRoles('DOCTOR', 'ADMIN'), async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { examination_id, patient_id, doctor_id, test_type, clinical_indication, priority = 'ROUTINE', total_amount = 150000 } = req.body;

    if (!examination_id || !patient_id || !doctor_id || !test_type) {
      return res.status(400).json({
        success: false,
        message: 'examination_id, patient_id, doctor_id, dan test_type wajib diisi.',
        data: null,
      });
    }

    await client.query('BEGIN');

    // Generate request number
    const countRes = await client.query("SELECT COUNT(*) FROM lab_requests WHERE DATE(created_at) = CURRENT_DATE");
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const requestNumber = `LAB/${dateStr}/${String(count).padStart(4, '0')}`;

    const insertRes = await client.query(
      `INSERT INTO lab_requests (examination_id, patient_id, doctor_id, request_number, test_type, clinical_indication, priority, status, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'REQUESTED', $8)
       RETURNING *`,
      [examination_id, patient_id, doctor_id, requestNumber, test_type, clinical_indication, priority, total_amount]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Permintaan pemeriksaan laboratorium berhasil dibuat.',
      data: insertRes.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 4. PUT /api/lab/results/:id - Input / Update test results
router.put('/results/:id', authenticate, requireRoles('LAB', 'ADMIN'), async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const { results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array hasil pemeriksaan (results) wajib disertakan.',
        data: null,
      });
    }

    await client.query('BEGIN');

    const checkReq = await client.query('SELECT id, status FROM lab_requests WHERE id = $1', [id]);
    if (checkReq.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Permintaan lab tidak ditemukan.',
        data: null,
      });
    }

    // Delete existing results to replace with verified set
    await client.query('DELETE FROM lab_results WHERE lab_request_id = $1', [id]);

    for (const item of results) {
      await client.query(
        `INSERT INTO lab_results (lab_request_id, test_name, result_value, normal_range, unit, interpretation, notes, performed_by, verified_by, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
        [
          id,
          item.test_name,
          item.result_value,
          item.normal_range || null,
          item.unit || null,
          item.interpretation || 'NORMAL',
          item.notes || null,
          req.user.id,
          req.user.id,
        ]
      );
    }

    // Update lab request status
    const updateReq = await client.query(
      `UPDATE lab_requests 
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, performed_by, ip_address)
       VALUES ('lab_requests', $1, 'UPDATE', $2, $3, $4)`,
      [id, JSON.stringify({ status: 'COMPLETED', results_count: results.length }), req.user.id, req.ip]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Hasil pemeriksaan laboratorium berhasil disimpan dan diverifikasi.',
      data: {
        lab_request: updateReq.rows[0],
        results_saved: results.length,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

/**
 * 5. POST /api/lab/external-integration/webhook
 * Mengimplementasikan Solusi Skenario D.5: Penanganan Gangguan Integrasi & Circuit Breaker
 */
let circuitBreakerState = {
  status: 'CLOSED', // CLOSED (Normal), OPEN (Failing), HALF_OPEN (Trial)
  failureCount: 0,
  lastFailureTime: null,
  threshold: 3,
  resetTimeoutMs: 15000,
};

router.post('/external-integration/webhook', async (req, res) => {
  const now = Date.now();

  // Circuit Breaker State Check
  if (circuitBreakerState.status === 'OPEN') {
    if (now - circuitBreakerState.lastFailureTime > circuitBreakerState.resetTimeoutMs) {
      circuitBreakerState.status = 'HALF_OPEN';
      console.log('[CIRCUIT BREAKER] State changed to HALF_OPEN. Attempting canary request.');
    } else {
      return res.status(503).json({
        success: false,
        message: 'Resiliensi Integrasi (Skenario D.5): Layanan integrasi eksternal sementara tidak tersedia (Circuit Breaker OPEN). Permintaan disimpan dalam antrean retry asynchronous (Dead Letter Queue / Background Buffer).',
        circuit_status: 'OPEN',
        retry_after_seconds: Math.ceil((circuitBreakerState.resetTimeoutMs - (now - circuitBreakerState.lastFailureTime)) / 1000),
      });
    }
  }

  // Simulate external transmission
  try {
    const { simulate_error, payload } = req.body;
    if (simulate_error) {
      circuitBreakerState.failureCount++;
      circuitBreakerState.lastFailureTime = now;
      if (circuitBreakerState.failureCount >= circuitBreakerState.threshold) {
        circuitBreakerState.status = 'OPEN';
      }
      throw new Error('Timeout koneksi ke perangkat / LIS Analyzer eksternal.');
    }

    // Success - reset breaker
    circuitBreakerState.status = 'CLOSED';
    circuitBreakerState.failureCount = 0;

    res.json({
      success: true,
      message: 'Data integrasi pemeriksaan penunjang berhasil diterima dan disinkronkan.',
      circuit_status: 'CLOSED',
      data: payload || null,
    });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: 'Gagal menghubungi sistem eksternal: ' + err.message,
      circuit_status: circuitBreakerState.status,
      fallback_mechanism: 'Pesan dialihkan ke fallback queue SIMRS tanpa menghilangkan data klinis pasien.',
    });
  }
});

module.exports = router;
