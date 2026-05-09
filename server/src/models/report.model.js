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
    upvotedBy: {
      type: [String],
      default: []
    },
    flags: {
      type: Number,
      default: 0
    },
    impactScore: {
      type: Number,
      default: 0
    },
    impactScoreBreakdown: {
      baseSeverity: { type: Number, default: 0 },
      nearbyMultiplier: { type: Number, default: 0 },
      upvotePoints: { type: Number, default: 0 },
      timePoints: { type: Number, default: 0 },
      zoneMultiplier: { type: Number, default: 1 }
    }
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);