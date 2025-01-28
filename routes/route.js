const express = require("express");
const QrController = require("../controllers/QrController");

const router = express.Router();

// Route to generate the QR code
router.get("/api/qr", QrController.Qrcode);

// Route to log scan details (via POST)
router.post("/api/scan/:slug", QrController.ScanDetails);

// Route to display a success page when a QR code is scanned (via GET)
router.get("/api/scan/:slug", QrController.ScanDetailsGet);

module.exports = router;
