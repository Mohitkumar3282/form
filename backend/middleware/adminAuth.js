/**
 * Admin Authentication Middleware
 * Protects administrative routes by verifying the x-admin-key header
 */
module.exports = function adminAuth(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedKey = req.headers['x-admin-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : '');

  if (!providedKey || providedKey !== adminPassword) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin access passcode required.'
    });
  }

  next();
};
