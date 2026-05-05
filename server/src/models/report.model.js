import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    type:String,
    lat:Number,
    lng:Number,
    description: String,
    imageUrl:String,
    status:String
},{ timestamps: true});

export default mongoose.model("Report", reportSchema);
