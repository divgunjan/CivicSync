import Report from "../models/report.model.js";
import fs from "fs";

export const createReport = async (req, res) => {
  try {
    const { type, lat, lng, description } = req.body;

    const imageUrl = req.file?.path;

    const report = await Report.create({
      type,
      lat,
      lng,
      description,
      imageUrl,
      status: "reported"
    });

    console.log("Report created:", report);

    res.json({
      success: true,
      id: report._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const updateReportStatus = async(req, res) => {
  try{
    const {id} = req.params;
    const {status}= req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {status},
      {new: true}
    );

    if(!report){
      return res.status(404).json({
        success:false, 
        message:"Not found"
      });
    }

    res.json({
      success:true,
      report
    });
    
  } catch(err) {
    res.status(500).json({
      success:false,
      error: err.message
    });
  }
};