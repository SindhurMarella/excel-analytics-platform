const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const ExcelData = require("../models/ExcelData");

// Upload Excel file
router.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No file uploaded.");
    }
    const file = req.files.file;
    const uploadPath = path.join(__dirname, "../uploads", file.name);
    await file.mv(uploadPath);

    // Parse Excel file
    const workbook = XLSX.readFile(uploadPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Get column headers
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Save data to MongoDB
    const excelDocument = new ExcelData({
      filename: file.name,
      originalName: file.name,
      data: data,
      rowCount: data.length,
      columns: columns,
      fileSize: file.size,
      sheetName: sheetName,
      // uploadedBy: req.user?.id
    });

    const savedData = await excelDocument.save();

    // Delete file after processing (optional)
    //fs.unlinkSync(uploadPath);

    res.json({
      message: "File uploaded and saved succesfully",
      id: savedData._id,
      rowCount: data.length,
      columns: columns,
      data: data.slice(0, 5), // Return first 5 rows as preview
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process file: " + error.message });
  }
});

// Get uploaded file data by ID
router.get("/:id", async (req, res) => {
  try {
    const excelData = await ExcelData.findById(req.params.id);
    if (!excelData) {
      return res.status(404).json({ error: "File not found" });
    }
    res.json(excelData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
