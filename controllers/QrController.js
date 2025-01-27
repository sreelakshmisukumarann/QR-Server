const { v4: uuidv4 } = require("uuid");
const QRCode = require('qrcode');
const ScanLog = require('../models/QrSchema'); // Adjust the path to your model

// Generate the QR code
exports.Qrcode = async (req, res) => {
  try {
    const slug = uuidv4(); // Generate a unique slug
    const qrUrl = `https://qr-server-qwyi.onrender.com/api/scan/${slug}`; // Embed slug in URL

    QRCode.toBuffer(qrUrl, { type: "png" }, (err, buffer) => {
      if (err) {
        return res.status(500).json({ message: "Error generating QR code" });
      }

      res.set("Content-Type", "image/png");
      res.send(buffer);
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ message: "Error generating QR code" });
  }
};

// Controller to log scan details (slug and source identifier)
exports.ScanDetails = async (req, res) => {
  try {
    const { slug } = req.params; // Get slug from request parameters
    const sourceIdentifier = req.headers["user-agent"] || "Unknown"; // Use User-Agent as sourceIdentifier
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP"; // Get IP address

    // Check if an entry for the same slug and sourceIdentifier exists
    let scanEntry = await ScanLog.findOne({ slug, sourceIdentifier });

    if (scanEntry) {
      // If found, just update the `updatedAt` timestamp
      scanEntry.updatedAt = new Date();
      await scanEntry.save();

      return res.status(200).json({
        message: "Scan details updated successfully",
        data: scanEntry,
      });
    } else {
      // If not found, create a new scan entry
      scanEntry = new ScanLog({
        slug,
        sourceIdentifier,
        ipAddress,
      });

      await scanEntry.save();

      return res.status(201).json({
        message: "New scan details logged successfully",
        data: scanEntry,
      });
    }
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).json({ message: "Error logging scan details" });
  }
};

// Controller to log scan details and return HTML page (GET for browser scanning)
exports.ScanDetailsGet = async (req, res) => {
  try {
    const { slug } = req.params; // Get slug from URL parameters

    // Get source information (e.g., User-Agent and IP address)
    const sourceIdentifier = req.headers["user-agent"] || "Unknown"; 
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP"; 

    // Save scan details in the database
    const scanEntry = new ScanLog({
      slug,
      sourceIdentifier,
      ipAddress,
      scannedAt: new Date(),
    });

    await scanEntry.save();

    // Return an HTML page with a thank you message
    res.status(200).send(`
      <html>
        <head>
          <title>QR Code Scanned</title>
        </head>
        <body style="text-align: center; font-family: Arial, sans-serif;">
          <h1>QR Code Scanned Successfully</h1>
          <p>Thank you for scanning the QR code.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).send("Error logging scan details.");
  }
};
