import mongoose from "mongoose";
import dotenv from "dotenv";
import Report from "./src/models/report.model.js";
import { calculateImpactScore } from "./src/utils/impactScore.js";

dotenv.config();

const locations = [
  { city: "Bangalore", area: "Yelahanka", lat: 13.1007, lng: 77.5963 },
  { city: "Mumbai", area: "Bandra", lat: 19.0596, lng: 72.8295 },
  { city: "Hyderabad", area: "Banjara Hills", lat: 17.4156, lng: 78.4347 }
];

const issues = ["pothole", "garbage", "drainage", "streetlight", "road", "water"];
const descriptions = [
  "Huge pothole causing traffic.",
  "Garbage not collected for a week.",
  "Drainage is overflowing.",
  "Streetlight is dead since last month.",
  "Road is completely damaged.",
  "Severe water logging after rains."
];

const imageKeywords = {
  pothole: "pothole,street,india",
  garbage: "garbage,street,india",
  drainage: "drainage,street,india",
  streetlight: "streetlight,broken",
  road: "road,damage,india",
  water: "flood,street,india"
};

// Helper to generate a random coordinate within roughly 2-3km radius
function getRandomOffset() {
  return (Math.random() - 0.5) * 0.03; 
}

const generateFakeReports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    // Delete previously seeded fake data to avoid duplicates without images
    await Report.deleteMany({ city: { $in: ["Bangalore", "Mumbai", "Hyderabad"] } });
    console.log("Cleared old seeded data...");

    const fakeData = [];

    for (const loc of locations) {
      for (let i = 0; i < 20; i++) {
        const lat = loc.lat + getRandomOffset();
        const lng = loc.lng + getRandomOffset();
        const issueType = issues[Math.floor(Math.random() * issues.length)];
        
        // Generates a random image URL using loremflickr based on the issue type
        const randomLock = Math.floor(Math.random() * 1000);
        const keyword = imageKeywords[issueType];
        const imageUrl = `https://loremflickr.com/600/400/${keyword}/all?lock=${randomLock}`;
        
        fakeData.push({
          type: issueType,
          lat: lat,
          lng: lng,
          location: {
            type: "Point",
            coordinates: [lng, lat]
          },
          city: loc.city,
          area: loc.area,
          address: `Random Address in ${loc.area}`,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          status: "reported",
          upvotes: Math.floor(Math.random() * 50),
          flags: 0,
          priority: Math.random() > 0.8 ? "high" : "medium",
          imageUrl: imageUrl 
        });
      }
    }

    console.log("Processing impact scores for seeded data...");
    for (let data of fakeData) {
      const impact = await calculateImpactScore(data, Report);
      data.impactScore = impact.finalScore;
      data.impactScoreBreakdown = impact.breakdown;
      data.priority = impact.priority;
      await Report.create(data);
    }
    
    console.log(`Successfully seeded ${fakeData.length} fake reports with dynamic impact scores!`);
    
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

generateFakeReports();
