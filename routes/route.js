const express = require('express');
const QrController = require('../controllers/QrController');

const router = express.Router();

// Route to generate the QR code
router.get('/api/qr', QrController.Qrcode);

// Route to log scan details (POST for JSON responses)
router.post('/api/scan/:slug', QrController.ScanDetails);

// Route to log scan details and return an HTML page (GET for browser scanning)
router.get('/api/scan/:slug', QrController.ScanDetailsGet);

module.exports = router;
