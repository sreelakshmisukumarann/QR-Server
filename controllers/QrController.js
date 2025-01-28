const { v4: uuidv4 } = require("uuid"); // Import UUID generator
const QRCode = require("qrcode"); // QR code generation library
const ScanLog = require("../models/QrSchema"); // Adjust the path to your model

exports.Qrcode = async (req, res) => {
  try {
    const slug = uuidv4(); // Unique slug
    const qrUrl = `https://qr-server-qwyi.onrender.com/api/scan`;

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

// Controller to log scan details (source identifier)
exports.ScanDetails = async (req, res) => {
  try {
    // Get source information (e.g., IP address and User-Agent)
    const source = req.headers["user-agent"];
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Check if the source has already scanned any QR code
    const existingScan = await ScanLog.findOne({ source });

    if (existingScan) {
      // Update the timestamp of the existing entry
      existingScan.timestamp = new Date();
      await existingScan.save();

      return res.status(200).json({
        message: "Scan details updated successfully",
        data: { source, ipAddress },
      });
    }

    // Save a new scan entry if it doesn't exist
    const scanEntry = new ScanLog({
      source,
      ipAddress,
    });

    await scanEntry.save();

    res.status(200).json({
      message: "Scan details logged successfully",
      data: { source, ipAddress },
    });
  } catch (error) {
    console.error("Error logging scan details:", error);
    res.status(500).json({ message: "Error logging scan details" });
  }
};

exports.ScanDetailsGet = async (req, res) => {
  try {
    // Get source information (e.g., User-Agent and IP address)
    const source = req.headers["user-agent"];
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Check if the source has already scanned any QR code
    const existingScan = await ScanLog.findOne({ source });

    if (existingScan) {
      // Update the timestamp of the existing entry
      existingScan.timestamp = new Date();
      await existingScan.save();

      return res.status(200).send(`
        <html>
          <head>
            <title>QR Code Scanned</title>
          </head>
          <body style="text-align: center; font-family: Arial, sans-serif;">
            <h1>QR Code Scanned Again</h1>
            <p>Your details have been updated.</p>
          </body>
        </html>
      `);
    }

    // Save a new scan entry if it doesn't exist
    const scanEntry = new ScanLog({
      source,
      ipAddress,
    });

    await scanEntry.save();

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
