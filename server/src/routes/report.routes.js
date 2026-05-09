import express from "express";
import {
    createReport,
    getReports,
    getReportsByBounds,
    checkNearby,
    upvoteReport,
    flagReport,
    updateReportStatus
} from "../controller/report.controller.js";
import upload from "../middelware/upload.middleware.js";

const router = express.Router();

router.get("/bounds", getReportsByBounds);
router.get("/nearby", checkNearby);
router.patch("/:id/upvote", upvoteReport);
router.patch("/:id/flag", flagReport);

router.post("/", upload.single("image"), createReport);
router.get("/",getReports);
router.patch("/:id/status",updateReportStatus);

export default router;