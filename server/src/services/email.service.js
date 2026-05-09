import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReportEmail = async (report) => {
  const mailOptions = {
    from: `"CivicSync" <${process.env.EMAIL_USER}>`,
    to: report.authorityEmail || process.env.EMAIL_USER, // Fallback to admin
    subject: `New Civic Issue Reported: ${report.type} in ${report.city}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1FA84A;">New Issue Report</h2>
        <p><strong>Type:</strong> ${report.type}</p>
        <p><strong>Location:</strong> ${report.address || report.area || report.city}</p>
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Priority:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${report.priority === 'high' ? '#ef4444' : '#E8831A'}">${report.priority}</span></p>
        
        <div style="margin: 20px 0;">
          <p><strong>Evidence:</strong></p>
          <img src="${report.imageUrl}" alt="Issue Evidence" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
        </div>
        
        <p style="font-size: 14px; color: #666;">
          You can view and track this issue on the CivicSync dashboard.
          <br>
          <a href="${report.imageUrl}" style="color: #1FA84A;">View High Resolution Image</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">This is an automated notification from CivicSync.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Email error: ", error);
    throw error;
  }
};
