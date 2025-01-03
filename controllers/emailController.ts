import sendEmail from "../utils/emailService";

import EmailLog from "../models/EmailLog";

const sendCustomerEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailInfo = await sendEmail(to, subject, message);

    await EmailLog.create({
      to,
      subject,
      message,
      sentBy: req.user.id,
    });

    res.status(200).json({
      message: "Email sent successfully",
      emailInfo,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmailLogs = async (req, res) => {
    try {
      const logs = await EmailLog.find({ sentBy: req.user.id });
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  


export { sendCustomerEmail, getEmailLogs };
