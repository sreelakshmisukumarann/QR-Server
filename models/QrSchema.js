const mongoose = require("mongoose");

// Create schema
const QRSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
    },
    sourceIdentifier: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true, // IP address of the scanner
    },
  },
  { timestamps: true } // This option automatically adds `createdAt` and `updatedAt` fields
);

// Add a unique index on the combination of `slug` and `sourceIdentifier`
QRSchema.index({ slug: 1, sourceIdentifier: 1 }, { unique: true });

// Create model
const ScanLog = mongoose.model("ScanLog", QRSchema);

// Export the model
module.exports = ScanLog;
