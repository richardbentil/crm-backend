

// Plans JSON structure
const plans = {
  plans: [
    {
      title: "Free Plan",
      plan: "basic",
      price: "$0",
      description: "Get started with essential CRM features",
      features: [
        "Customer management (up to 50 customers)",
        "Task scheduling (basic reminders)",
        "1 sales pipeline",
        "Basic reporting (limited metrics)",
        "Limited email integration (50 emails/month)",
      ],
    },
    {
      title: "Standard Plan",
      plan: "standard",
      price: "$15/user",
      description: "Advanced tools for small to medium businesses",
      features: [
        "Customer management (up to 500 customers)",
        "Advanced reporting and analytics",
        "Multiple pipelines (up to 3)",
        "Email integration (500 emails/month)",
        "Task scheduling with recurring reminders",
        "Team collaboration (up to 5 users)",
      ],
    },
    {
      title: "Premium Plan",
      plan: "premium",
      price: "$50/user",
      description: "Comprehensive features for scaling businesses",
      features: [
        "Unlimited customers",
        "Unlimited pipelines",
        "Advanced email campaigns (unlimited emails/month)",
        "Full analytics and dashboards",
        "Advanced team collaboration (unlimited users)",
        "Role-based user permissions",
        "Priority customer support",
      ],
    },
  ],
};

// Middleware to check plan features
export const checkPlanFeatures = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userPlan = req?.user?.subscriptionPlan; // Assuming user subscription plan is available in req.user
    if (!userPlan) {
      return res.status(404).json({ error: "User subscription plan not found." });
    }

    // Find the plan details
    const planDetails = plans.plans.find((plan) => plan.plan === userPlan);

    if (!planDetails) {
      return res.status(400).json({
        error: `Invalid subscription plan: ${userPlan}`,
      });
    }

    // Attach plan details and features to the request object
    req.features = planDetails.features;

    // Allow access
    next();
  } catch (error: any) {
    res.status(500).json({
      error: "Server error",
      details: error.message || "An unexpected error occurred.",
    });
  }
};
