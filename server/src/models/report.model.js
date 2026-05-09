import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: String,
    lat: Number,
    lng: Number,
    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: [Number]
    },
    city: String,
    area: String,
    address: String,
    description: String,
    imageUrl: String,
    status: String,
    authorityEmail: String,
    priority: String,
    upvotes: {
      type: Number,
      default: 0
    },
    flags: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);