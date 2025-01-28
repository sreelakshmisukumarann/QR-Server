const { v4: uuidv4 } = require("uuid"); // Import UUID generator
const QRCode = require("qrcode"); // QR code generation library
const ScanLog = require("../models/QrSchema"); // Adjust the path to your model

// Generate QR Code
exports.Qrcode = async (req, res) => {
  try {
    const slug = uuidv4(); // Unique slug
    const qrUrl = `https://qr-server-qwyi.onrender.com/api/scan/${slug}`; // Include slug in the URL

    // Generate QR code as a PNG image buffer
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

// Log scan details
exports.ScanDetails = async (req, res) => {
  try {
    const { slug } = req.params; // Extract slug from request params
    const source = req.headers["user-agent"]; // Get User-Agent
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // Get IP address

    // Check if the source has already scanned
    const existingScan = await ScanLog.findOne({ source });

    if (existingScan) {
      // Update the timestamp of the existing entry
      existingScan.timestamp = new Date();
      await existingScan.save();

      return res.status(200).json({
        message: "Scan details updated successfully",
        data: { slug, source, ipAddress },
      });
    }

    // Save a new scan entry if not found
    const scanEntry = new ScanLog({
      slug,
      source,
      ipAddress,
    });

    await scanEntry.save();

    res.status(200).json({
      message: "Scan details logged successfully",
      data: { slug, source, ipAddress },
    });
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).json({ message: "Error logging scan details" });
  }
};

// Handle scan and display success page
exports.ScanDetailsGet = async (req, res) => {
  try {
    const { slug } = req.params;
    const source = req.headers["user-agent"];
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Check if the source has already scanned
    const existingScan = await ScanLog.findOne({ source });

    if (existingScan) {
      // Update timestamp if source has already scanned
      existingScan.timestamp = new Date();
      await existingScan.save();

      return res.status(200).send(`
        <html>
          <head><title>QR Code Scanned</title></head>
          <body style="text-align: center; font-family: Arial, sans-serif;">
            <h1>QR Code Scanned Again</h1>
            <p>Your details have been updated. Thank you!</p>
          </body>
        </html>
      `);
    }

    // Save a new scan entry if not found
    const scanEntry = new ScanLog({
      slug,
      source,
      ipAddress,
    });

    await scanEntry.save();

    res.status(200).send(`
      <html>
        <head><title>QR Code Scanned</title></head>
        <body style="text-align: center; font-family: Arial, sans-serif;">
          <h1>QR Code Scanned Successfully</h1>
          <p>Thank you for scanning the QR code!</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).send("Error logging scan details.");
  }
};
