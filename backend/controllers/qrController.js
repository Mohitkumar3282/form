const QRCode = require('qrcode');

/**
 * GET /api/qr
 * Generate QR Code PNG data URL for target URL
 */
exports.generateQrCode = async (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const defaultTarget = `${protocol}://${host}/`;
    const targetUrl = req.query.url || process.env.BASE_URL || defaultTarget;

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      width: 320
    });

    return res.json({
      success: true,
      targetUrl,
      qrCodeUrl: qrDataUrl
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR Code.',
      error: error.message
    });
  }
};
