const { v4: uuidv4 } = require("uuid");
const QRCode = require('qrcode');
const ScanLog = require('../models/QrSchema'); // Adjust the path to your model

// Helper function to get device identifier
const getDeviceIdentifier = (req) => {
  return req.headers["device-id"] || req.headers["user-agent"] || uuidv4();
};

// Helper function to get IP address
const getIpAddress = (req) => {
  return req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "Unknown IP";
};

// Generate the QR code
exports.Qrcode = async (req, res) => {
  try {
    const sourceIdentifier = getDeviceIdentifier(req); // Get or generate device identifier
    const ipAddress = getIpAddress(req); // Get IP address

    // Check if the device (sourceIdentifier) already has a slug
    let scanEntry = await ScanLog.findOne({ sourceIdentifier });

    // If no slug exists for the device, generate a new one
    if (!scanEntry) {
      const slug = uuidv4(); // Generate a unique slug
      const baseUrl = process.env.BASE_URL || "https://qr-server-qwyi.onrender.com";
      const qrUrl = `${baseUrl}/api/scan/${slug}`; // Embed slug in URL

      // Save the new slug, sourceIdentifier, and IP address in the database
      scanEntry = new ScanLog({
        slug,
        sourceIdentifier,
        ipAddress,
        timestamp: new Date(), // Initial timestamp
      });

      await scanEntry.save();
    }

    // Generate the QR code with the slug URL
    const qrUrl = `${process.env.BASE_URL || "https://qr-server-qwyi.onrender.com"}/api/scan/${scanEntry.slug}`;
    QRCode.toBuffer(qrUrl, { type: "png" }, (err, buffer) => {
      if (err) {
        console.error("QRCode generation error:", err);
        return res.status(500).json({ message: "Error generating QR code", error: err.message });
      }

      res.set("Content-Type", "image/png");
      res.send(buffer);
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ message: "Error generating QR code", error: error.message });
  }
};

// Controller to log scan details
exports.ScanDetails = async (req, res) => {
  try {
    const { slug } = req.params; // Get slug from request parameters
    const sourceIdentifier = getDeviceIdentifier(req); // Get or generate device identifier
    const ipAddress = getIpAddress(req); // Get IP address

    // Find the scan entry for the slug
    let scanEntry = await ScanLog.findOne({ slug });

    if (!scanEntry) {
      return res.status(404).json({ message: "Slug not found" });
    }

    // If the device scanning is different from the one that generated the slug, deny the scan
    if (scanEntry.sourceIdentifier !== sourceIdentifier) {
      return res.status(400).json({ message: "This QR code is not for your device" });
    }

    // If the same device scans again, update the timestamp
    scanEntry.timestamp = new Date();
    await scanEntry.save();

    return res.status(200).json({
      message: "Scan details updated successfully",
      data: scanEntry,
    });
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).json({ message: "Error logging scan details", error: error.message });
  }
};

// Controller to log scan details and return HTML page (GET for browser scanning)
exports.ScanDetailsGet = async (req, res) => {
  try {
    const { slug } = req.params; // Get slug from URL parameters
    const sourceIdentifier = getDeviceIdentifier(req); // Get or generate device identifier
    const ipAddress = getIpAddress(req); // Get IP address

    // Find the scan entry for the slug
    let scanEntry = await ScanLog.findOne({ slug });

    if (!scanEntry) {
      return res.status(404).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Slug not found</h1>
          </body>
        </html>
      `);
    }

    // If the device scanning is different from the one that generated the slug, deny the scan
    if (scanEntry.sourceIdentifier !== sourceIdentifier) {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>This QR code is not for your device</h1>
          </body>
        </html>
      `);
    }

    // If the same device scans again, update the timestamp
    scanEntry.timestamp = new Date();
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
          <p>Slug: ${slug}</p>
          <p>IP Address: ${ipAddress}</p>
          <p>Device Identifier: ${sourceIdentifier}</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).send("Error logging scan details.");
  }
};