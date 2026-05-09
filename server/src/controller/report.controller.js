import Report from "../models/report.model.js";

export const createReport = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const report = new Report({
      type: req.body.type,
      lat: Number(req.body.lat),
      lng: Number(req.body.lng),
      description: req.body.description,
      status: req.body.status || "reported",
      imageUrls: imageUrls
    });

    await report.save();

    console.log("Report created:", report);
    res.status(201).json(report);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
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