const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = "/app/public";

// Make sure directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Serve images
app.use("/images", express.static(UPLOAD_DIR));

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const filename =
      Date.now() + "-" + Math.random().toString(36).substring(2, 10) + ext;

    cb(null, filename);
  },
});

// Allowed image types
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
    }

    cb(null, true);
  },
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Image server is running",
  });
});

// Upload
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No image uploaded",
    });
  }

  const imageUrl = `/images/${req.file.filename}`;

  return res.json({
    success: true,
    filename: req.file.filename,
    url: imageUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(400).json({
    success: false,
    error: err.message || "Upload failed",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Image server running on port ${PORT}`);
});
