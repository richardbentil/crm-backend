import Contact from "../models/Contact";
import Deal from "../models/Deal";
import Task from "../models/Task";
import EmailLog from "../models/EmailLog";

const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count contacts created by the user
    const totalContacts = await Contact.countDocuments({ createdBy: userId });

    // Count tasks created by the user
    const totalTasks = await Task.countDocuments({ createdBy: userId });

    // Count emails sent by the user
    const totalEmailsSent = await EmailLog.countDocuments({ sentBy: userId });

    // Count deals won
    const dealsWon = await Deal.countDocuments({ createdBy: userId, stage: "Won" });

    // Aggregate metrics
    const metrics = {
      totalContacts,
      totalTasks,
      totalEmailsSent,
      dealsWon,
    };

    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getDashboardMetrics };
