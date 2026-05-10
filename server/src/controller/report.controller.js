import Report from "../models/report.model.js";
import { sendReportEmail } from "../services/email.service.js";
import { calculateImpactScore } from "../utils/impactScore.js";

export const createReport = async (req, res) => {
  console.log(req.file);
  console.log(req.body);

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!req.body.type || !req.body.lat || !req.body.lng) {
      return res.status(400).json({ message: "Invalid form data: missing required fields" });
    }

    const report = new Report({
      user: req.body.user || "Citizen",
      type: req.body.type,
      lat: Number(req.body.lat),
      lng: Number(req.body.lng),
      location: {
        type: "Point",
        coordinates: [Number(req.body.lng), Number(req.body.lat)]
      },
      city: req.body.city || "",
      area: req.body.area || "",
      address: req.body.address || "",
      description: req.body.description,
      status: req.body.status || "reported",
      imageUrl: req.file.path,
      authorityEmail: req.body.authorityEmail || "",
      priority: req.body.priority || "low"
    });

    // Calculate initial Impact Score
    const impactData = await calculateImpactScore(report, Report);
    report.impactScore = impactData.finalScore;
    report.impactScoreBreakdown = impactData.breakdown;
    report.priority = impactData.priority;

    await report.save();

    // Send email notification (Disabled due to sending limit)
    // sendReportEmail(report).catch(err => console.error("Auto-email failed:", err));

    console.log("Report created:", report);
    res.status(201).json(report);
  } catch (err) {
    console.log("DB error:", err);
    res.status(500).json({ message: "Database connection failure or server error", error: err.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getReportsByBounds = async (req, res) => {
  try {
    const { swLat, swLng, neLat, neLng } = req.query;
    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({ message: "Missing bounds parameters" });
    }

    const reports = await Report.find({
      location: {
        $geoWithin: {
          $box: [
            [Number(swLng), Number(swLat)],
            [Number(neLng), Number(neLat)]
          ]
        }
      }
    });

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const checkNearby = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Missing location parameters" });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: 100 // 100 meters
        }
      }
    };

    if (type) {
      query.type = type;
    }

    const nearbyReports = await Report.find(query).limit(5);

    res.json({ success: true, reports: nearbyReports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const upvoteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User identification required" });
    }

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Check if user already upvoted
    if (report.upvotedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already upvoted" });
    }

    report.upvotes += 1;
    report.upvotedBy.push(userId);

    // Recalculate Impact Score after upvote
    const impactData = await calculateImpactScore(report, Report);
    report.impactScore = impactData.finalScore;
    report.impactScoreBreakdown = impactData.breakdown;
    report.priority = impactData.priority;

    await report.save();

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const flagReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User identification required" });
    }

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Check if user already flagged
    if (report.flaggedBy && report.flaggedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already flagged" });
    }

    report.flags += 1;
    if (!report.flaggedBy) report.flaggedBy = [];
    report.flaggedBy.push(userId);

    // Recalculate Impact Score after flag
    const impactData = await calculateImpactScore(report, Report);
    report.impactScore = impactData.finalScore;
    report.impactScoreBreakdown = impactData.breakdown;
    report.priority = impactData.priority;

    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};