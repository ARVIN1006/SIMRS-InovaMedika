const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/dashboard/stats
 * High-performance Outpatient Operational Analytics API
 * Implements Skenario D.6 (Optimized Aggregations & Query Indexing)
 */
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;

    let dateFilter = '1=1';
    const params = [];

    if (startDate && endDate) {
      params.push(startDate, endDate);
      dateFilter = `r.registration_date BETWEEN $1 AND $2`;
    } else if (period === 'today') {
      dateFilter = `r.registration_date = CURRENT_DATE`;
    } else if (period === '7days') {
      dateFilter = `r.registration_date >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === '30days') {
      dateFilter = `r.registration_date >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    // 1. Total Patient Visits & Breakdown by Status
    const visitsQuery = `
      SELECT 
        COUNT(*) AS total_visits,
        COUNT(CASE WHEN r.status = 'WAITING' THEN 1 END) AS waiting_count,
        COUNT(CASE WHEN r.status = 'IN_EXAMINATION' THEN 1 END) AS examining_count,
        COUNT(CASE WHEN r.status = 'COMPLETED' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN r.status = 'CANCELLED' THEN 1 END) AS cancelled_count
      FROM registrations r
      WHERE ${dateFilter}
    `;
    const visitsRes = await db.query(visitsQuery, params);

    // 2. Visits Grouped by Clinic (Poli)
    const clinicVisitsQuery = `
      SELECT c.id, c.code, c.name, COUNT(r.id) AS visit_count
      FROM clinics c
      LEFT JOIN registrations r ON c.id = r.clinic_id AND ${dateFilter}
      GROUP BY c.id, c.code, c.name
      ORDER BY visit_count DESC
    `;
    const clinicVisitsRes = await db.query(clinicVisitsQuery, params);

    // 3. Total Medical Services (Tindakan) Count & Top Services
    const servicesQuery = `
      SELECT ms.name, COUNT(es.id) AS total_performed, SUM(es.subtotal) AS total_revenue
      FROM examination_services es
      JOIN medical_services ms ON es.service_id = ms.id
      JOIN examinations e ON es.examination_id = e.id
      JOIN registrations r ON e.registration_id = r.id
      WHERE ${dateFilter}
      GROUP BY ms.name
      ORDER BY total_performed DESC
      LIMIT 5
    `;
    const servicesRes = await db.query(servicesQuery, params);

    // 4. Revenue Summary (Billing, Paid, Balance) & Payment Status Breakdown
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(b.total_amount), 0) AS gross_billing,
        COALESCE(SUM(b.paid_amount), 0) AS total_collected,
        COALESCE(SUM(b.balance_amount), 0) AS outstanding_balance,
        COUNT(CASE WHEN b.payment_status = 'PAID' THEN 1 END) AS paid_invoices,
        COUNT(CASE WHEN b.payment_status = 'PARTIAL' THEN 1 END) AS partial_invoices,
        COUNT(CASE WHEN b.payment_status = 'UNPAID' THEN 1 END) AS unpaid_invoices
      FROM bills b
      JOIN registrations r ON b.registration_id = r.id
      WHERE ${dateFilter}
    `;
    const revenueRes = await db.query(revenueQuery, params);

    // 5. Top Medicines Dispensed
    const medicinesQuery = `
      SELECT m.name, m.unit, SUM(pi.quantity) AS total_dispensed, SUM(pi.subtotal) AS total_sales
      FROM prescription_items pi
      JOIN medicines m ON pi.medicine_id = m.id
      JOIN prescriptions p ON pi.prescription_id = p.id
      JOIN examinations e ON p.examination_id = e.id
      JOIN registrations r ON e.registration_id = r.id
      WHERE p.status = 'DISPENSED' AND ${dateFilter}
      GROUP BY m.name, m.unit
      ORDER BY total_dispensed DESC
      LIMIT 5
    `;
    const medicinesRes = await db.query(medicinesQuery, params);

    // 6. Recent Registrations List (for Dashboard Feed)
    const recentVisitsQuery = `
      SELECT r.id, r.registration_number, r.queue_number, r.registration_date, r.status, r.payment_type,
             p.name AS patient_name, p.mr_number,
             c.name AS clinic_name,
             d.name AS doctor_name,
             b.payment_status, b.total_amount
      FROM registrations r
      JOIN patients p ON r.patient_id = p.id
      JOIN clinics c ON r.clinic_id = c.id
      JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN bills b ON r.id = b.registration_id
      ORDER BY r.id DESC
      LIMIT 10
    `;
    const recentVisitsRes = await db.query(recentVisitsQuery);

    res.json({
      success: true,
      message: 'Data statistik dashboard operasional rawat jalan berhasil diambil.',
      period,
      data: {
        summary: visitsRes.rows[0] || {},
        visits_by_clinic: clinicVisitsRes.rows || [],
        top_services: servicesRes.rows || [],
        revenue: revenueRes.rows[0] || {},
        top_medicines: medicinesRes.rows || [],
        recent_visits: recentVisitsRes.rows || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
