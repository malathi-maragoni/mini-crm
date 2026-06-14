const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔌 Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/crm")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 📦 Model
const Lead = mongoose.model("Lead", {
  name: String,
  email: String,
  status: { type: String, default: "new" },
  notes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// ➕ Add Lead (FORCED timestamp)
app.post("/add", async (req, res) => {
  try {
    const lead = new Lead({
      name: req.body.name,
      email: req.body.email,
      status: "new",
      notes: [],
      createdAt: new Date() // ✅ always set
    });

    await lead.save();
    res.json(lead);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get Leads (latest first)
app.get("/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 Update Status
app.put("/status/:id", async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Add Note
app.put("/note/:id", async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: req.body.note } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete Lead (100% SAFE)
app.delete("/delete/:id", async (req, res) => {
  try {
    const result = await Lead.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});