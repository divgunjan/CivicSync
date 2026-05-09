import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: String,
    lat: Number,
    lng: Number,
    description: String,
    imageUrls: [String],
    status: String
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);