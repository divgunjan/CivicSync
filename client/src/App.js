import express from "express";
import mongoose from "mongoose";
import reportRoutes from "./routes/report.routes.js";

const app = express();

app.use(express.json());

//DB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected"))
  .catch(err => console.log("DB connection error:", err));

// routes
app.use("/report", reportRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});