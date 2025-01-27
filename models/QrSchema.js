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
      type: String,
      required: true, // IP address of the scanner
    },
  },
  { timestamps: true } // This option is passed outside the field definitions
);

// Create model
const ScanLog = mongoose.model("ScanLog", QRSchema);

// Export the model
module.exports = ScanLog;
