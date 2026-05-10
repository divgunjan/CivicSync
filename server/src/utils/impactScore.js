
export const ISSUE_WEIGHTS = {
  'water': 30,      // Water Leakage
  'pothole': 20,
  'garbage': 15,
  'electric': 50,   // Electric Hazard
  'tree': 35,       // Fallen Tree
  'drainage': 25,
  'streetlight': 10,
  'other': 5
};

/**
 * Calculates the total Impact Score based on multiple factors:
 * - Base Severity (by issue type)
 * - Nearby Reports (community density)
 * - Upvotes (credibility)
 * - Time Pending (escalation)
 */
export const calculateImpactScore = async (report, ReportModel) => {
  // Normalize type
  const typeKey = report.type?.toLowerCase() || 'other';
  const baseSeverity = ISSUE_WEIGHTS[typeKey] || 10;
  
  // 1. Nearby Reports (Cluster detection within 200m for better MVP coverage)
  let nearbyMultiplier = 0;
  try {
    const nearbyCount = await ReportModel.countDocuments({
      _id: { $ne: report._id },
      location: {
        $geoWithin: {
          $centerSphere: [
            [report.location.coordinates[0], report.location.coordinates[1]],
            200 / 6378100 // 200 meters radius (normalized by Earth's radius)
          ]
        }
      }
    });

    if (nearbyCount >= 20) nearbyMultiplier = 50;
    else if (nearbyCount >= 10) nearbyMultiplier = 35;
    else if (nearbyCount >= 5) nearbyMultiplier = 20;
    else if (nearbyCount >= 1) nearbyMultiplier = 5;
  } catch (err) {
    console.error("Nearby score calculation failed:", err);
  }

  // 2. Upvotes Points
  const upvotePoints = (report.upvotes || 0) * 3;

  // 3. Flag Points (Emergency Escalation)
  const flagPoints = (report.flags || 0) * 10;

  // 4. Time Pending (2 points per day)
  const createdDate = report.createdAt ? new Date(report.createdAt) : new Date();
  const daysPending = Math.floor((Date.now() - createdDate.getTime()) / 86400000);
  const timePoints = daysPending * 2;

  // 5. Zone Multiplier (Placeholder for future OSM/Google Places integration)
  const zoneMultiplier = 1;

  const finalScore = baseSeverity + nearbyMultiplier + upvotePoints + flagPoints + timePoints;

  // Determine priority based on score
  let priority = "low";
  if (finalScore >= 80) priority = "critical";
  else if (finalScore >= 50) priority = "high";
  else if (finalScore >= 30) priority = "medium";

  return {
    finalScore,
    priority,
    breakdown: {
      baseSeverity,
      nearbyMultiplier,
      upvotePoints,
      flagPoints,
      timePoints,
      zoneMultiplier
    }
  };
};
