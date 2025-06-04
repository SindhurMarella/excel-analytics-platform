const mongoose = require("mongoose");

const excelDataSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    data: { type: Array, required: true }, // Stores parsed Excel rows
    rowCount: { type: Number, required: true },
    columns: { type: Array, required: true }, // Column headers
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: link to user
    uploadedAt: { type: Date, default: Date.now },
    fileSize: { type: Number }, // File size in bytes
    sheetName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExcelData", excelDataSchema);
