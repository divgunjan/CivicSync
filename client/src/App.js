import express from "express";
import mongoose from "mongoose";
import reportRoutes from ".../middleware/upload.middleware.js";

const app = express();

//incoming JSON to usable JS object
app.use(express.json());
app.use("/report",reportRoutes);

//connecting to the DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected."));

app.listen(5000, () => console.log("Server running..."));



