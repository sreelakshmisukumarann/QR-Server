const mongoose = require("mongoose");

// Create schema
const QRSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true, 
    },
    source: {
      type: String,
      required: true, 
    },
    ipAddress: {
       type: String, required: true
       }, // IP address of the scanner
    scannedAt: {
       type: Date, default: Date.now 
      }, // Timestamp
  }
  // { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

// Create model
const ScanLog = mongoose.model("ScanLog", QRSchema); // Updated model name to `ScanLog`

// Export the model
module.exports = ScanLog;
