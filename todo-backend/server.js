const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Job = require("./models/Job");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", function (req, res) {
  res.json({ ok: true, message: "Backend running" });
});

// GET all jobs
app.get("/jobs", async function (req, res) {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("GET /jobs error:", error); // 👈 add this
    res.status(500).json({ message: error.message });
  }
});

// POST create a job
app.post("/jobs", async function (req, res) {
  try {
    const title = req.body.title;

    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const newJob = await Job.create({
      title: title.trim(),
      completed: false
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to create job" });
  }
});

//Complete

app.put("/jobs/:id/toggle", async function (req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.completed = !job.completed;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: "Invalid job id" });
  }
});


// DELETE a job by id
app.delete("/jobs/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const deleted = await Job.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: "Invalid job id" });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const port = process.env.PORT || 4000;
    app.listen(port, function () {
      console.log("Server running on port " + port);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
