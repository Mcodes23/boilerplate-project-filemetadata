const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB connection error:", err));

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: String,
  size: Number,
});

const File = mongoose.model("File", fileSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileDoc = new File({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });

    await fileDoc.save();

    res.json({
      name: fileDoc.name,
      type: fileDoc.type,
      size: fileDoc.size,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
