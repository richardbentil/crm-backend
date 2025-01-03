import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const transporter = nodemailer.createTransport({
      //host: "email-smtp.us-east-1.amazonaws.com", // Replace <region> with your AWS region (e.g., us-east-1)
      //port: 465, // Use 465 for secure connection (SSL/TLS), or 587 for STARTTLS
      //secure: true, // Set to true for port 465, false for 587
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App-specific password or account password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: "richardebo.bentil@gmail.com", // Replace with desired sender email
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
