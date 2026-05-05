import express from "express";
import mongoose from "mongoose";
import reportRoutes from "./routes/report.routes.js";

const app = express();

// incoming JSON -> usable JS object
app.use(express.json());
app.use("/report", reportRoutes);

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/spoilt";
mongoose
	.connect(mongoUri)
	.then(() => console.log("DB connected."))
	.catch((err) => console.error("DB connection error:", err));

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
