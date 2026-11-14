const db = require('../db');

/**
 * Authentication Middleware
 * Validates Bearer token against PostgreSQL users table
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi Bearer tidak ditemukan.',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    const result = await db.query(
      'SELECT id, username, full_name, email, role, status FROM users WHERE access_token = $1 AND status = $2',
      [token, 'ACTIVE']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.',
        data: null,
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
        data: null,
      });
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Peran Anda (${req.user.role}) tidak memiliki wewenang untuk sumber daya ini.`,
      data: null,
    });
  };
}

module.exports = {
  authenticate,
  requireRoles,
};
