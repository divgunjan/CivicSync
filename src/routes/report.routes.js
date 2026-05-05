import express from "express";
import { createReport } from "../controllers/report.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", upload.single("image"), createReport);

export default router;










