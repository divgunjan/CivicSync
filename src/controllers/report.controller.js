// Read request
// Call services
// Save to DB
// Trigger n8n
// Send response

import Report from "../models/report.model.js";
// import { sendToWebhook } from "../services/webhook.service.js";

export const createReport = async (req,res) => {
    try{
        const {type, lat, lng, description} = req.body;

        const imageUrl = req.file?.path;

        //saving to db
        const report = await Report.create({
            type,
            lat,
            lng,
            description,
            imageUrl,
            status:"reported"
        });

        //send to n8n

        console.log("Report created", report);

        res.json({
            success:true,
            id:report._id
        });
    
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            error: error.message
        });
    }
}




