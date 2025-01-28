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
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Create model
const ScanLog = mongoose.model("ScanLog", QRSchema);

// Export the model
module.exports = ScanLog;
