import Contact from "../models/Contact";
import Deal from "../models/Deal";
import Task from "../models/Task";
import EmailLog from "../models/EmailLog";

const getDashboardMetrics = async (req, res) => {
  try {
    const query = req.user.role == "Admin" ? {} : { createdBy: req.user.id };
    const query2 = req.user.role == "Admin" ? {} : { sentBy: req.user.id };

    // Basic Metrics
    const totalContacts = await Contact.countDocuments(query);
    const totalTasks = await Task.countDocuments(query);
    const totalEmailsSent = await EmailLog.countDocuments(query2);
    const dealsWon = await Deal.countDocuments({ ...query, stage: "Won" });

    // Enhanced Metrics
    // Group contacts by company
    const contactsByCompany = await Contact.aggregate([
      { $match: query },
      { $group: { _id: "$company", totalContacts: { $sum: 1 } } },
    ]);

    // Group tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: query },
      { $group: { _id: "$status", totalTasks: { $sum: 1 } } },
    ]);

    // Count emails sent in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentEmails = await EmailLog.countDocuments({
      ...query2,
      sentAt: { $gte: oneMonthAgo },
    });

    // Group deals by stage
    const dealsByStage = await Deal.aggregate([
      { $match: query },
      { $group: { _id: "$stage", totalDeals: { $sum: 1 } } },
    ]);

    // Calculate average deal closure time
    const averageClosureTime = await Deal.aggregate([
      { $match: { ...query, closedAt: { $exists: true } } },
      {
        $project: {
          duration: {
            $subtract: ["$closedAt", "$createdAt"], // Calculate deal closure time
          },
        },
      },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
    ]);

    // Aggregate all metrics
    const metrics = {
      totalContacts,
      totalTasks,
      totalEmailsSent,
      dealsWon,
      contactsByCompany,
      tasksByStatus,
      recentEmails,
      dealsByStage,
      averageClosureTime:
        averageClosureTime.length > 0
          ? averageClosureTime[0].avgDuration / (1000 * 60 * 60 * 24) // Convert ms to days
          : null,
    };

    res.status(200).json(metrics);
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export { getDashboardMetrics };
