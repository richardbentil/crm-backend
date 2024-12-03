import nodemailer from "nodemailer";

const sendEmail = async (to: any, subject: string, text: string, html?: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Replace with your email provider (e.g., Outlook, Yahoo)
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App-specific password or account password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    throw new Error(`Failed to send email: ${err.message}`);
  }
};

export default sendEmail;
