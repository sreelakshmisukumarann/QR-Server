express = require('express')

const QrController = require('../controllers/QrController')

var router = express.Router();

// router.post('/scan/add-details',QrController.AddScanning)
// Route to generate the QR code
router.get('/api/qr', QrController.Qrcode);


// Route to log scan details
router.post('/api/scan/:slug', QrController.ScanDetails);
router.get('/api/scan/:slug', QrController.ScanDetailsGet); // Handle GET requests for QR scans


module.exports = router