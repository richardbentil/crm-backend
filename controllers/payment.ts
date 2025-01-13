import User from "../models/User";
import stripe from "../config/stripe";
import WebhookEvent from "../models/WebhookEvent";
import sendEmail from "../utils/emailService";

const checkout = async (req, res) => {
    const { subscriptionPlan, billingCycle } = req.body; // e.g., { subscriptionPlan: 'Pro', billingCycle: 'Monthly' }
    const { id: userId } = req.user;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Define subscription price IDs
        const subscriptionPrices = {
            Pro: {
                Monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
                Yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
            },
            Enterprise: {
                Monthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
                Yearly: process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY,
            },
        };

        if (!subscriptionPrices[subscriptionPlan] || !subscriptionPrices[subscriptionPlan][billingCycle]) {
            return res.status(400).json({ message: "Invalid subscription plan or billing cycle" });
        }

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: subscriptionPrices[subscriptionPlan][billingCycle],
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId,
                subscriptionPlan: subscriptionPlan,
                billingCycle: billingCycle,
            },
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const webhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Check if this event has already been processed
        const existingEvent = await WebhookEvent.findOne({ eventId: event.id });
        if (existingEvent) {
            return res.status(200).json({ received: true });
        }

        // Save the event ID to prevent duplicate processing
        await WebhookEvent.create({ eventId: event.id, type: event.type });

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const { userId, subscriptionPlan, billingCycle } = session.metadata;

            const subscriptionId = session.subscription; // Get the subscription ID from the session


            const user: any = await User.findById(userId);
            if (user) {
                // Retrieve the subscriptionId from the session
                user.subscriptionId = subscriptionId; // Save subscription ID to the user record
                user.subscriptionPlan = subscriptionPlan;
                user.billingCycle = billingCycle;
                user.planDetails.startDate = new Date();
                user.planDetails.endDate =
                    billingCycle === "Monthly"
                        ? new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1 month
                        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // 1 year
                await user.save();
                // Send email notification
                await sendEmail(
                    user.email,
                    "Subscription Successful",
                    `Your subscription to the ${subscriptionPlan} plan was successful.`,
                    `<p>Dear ${user.name},</p> <p>Your subscription to the <strong>${subscriptionPlan}</strong> plan was successful. Enjoy the premium features!</p>`
                );
            }
        }


        res.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
}

const invoices = async (req, res) => {
    const { id: userId } = req.user;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Retrieve customer from Stripe
        const customer = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });

        if (customer.data.length === 0) {
            return res.status(404).json({ message: "No customer found in Stripe" });
        }

        // Fetch invoices for the customer
        const invoices = await stripe.invoices.list({
            customer: customer.data[0].id,
        });

        res.status(200).json({ invoices: invoices.data });
    } catch (error) {
        console.error("Error retrieving invoices:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const subscriptions = async (req, res) => {
    try {
        const users = await User.find({}, "name email subscriptionPlan planDetails");
        res.status(200).json({ subscriptions: users });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const updateSubscription = async (req, res) => {
    const { subscriptionId, newPlan, newBillingCycle } = req.body; // Provided by the client

    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const newPriceId =
            newPlan === "Pro" && newBillingCycle === "Monthly"
                ? process.env.STRIPE_PRICE_ID_PRO_MONTHLY
                : newPlan === "Pro" && newBillingCycle === "Yearly"
                    ? process.env.STRIPE_PRICE_ID_PRO_YEARLY
                    : newPlan === "Enterprise" && newBillingCycle === "Monthly"
                        ? process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY
                        : process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY;

        // Update subscription in Stripe
        await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                },
            ],
        });

        res.status(200).json({ message: "Subscription updated successfully" });
    } catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

const cancel = async (req, res) => {
    const { subscriptionId } = req.body; // Expect subscriptionId from the request body
    const { id: userId } = req.user; // Assume user is authenticated and user ID is in req.user
  
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required." });
    }
  
    try {
      // Find the user in the database
      const user: any = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Check if the provided subscription ID matches the user's record
      if (user.subscriptionId !== subscriptionId) {
        return res.status(403).json({
          message: "You do not have permission to cancel this subscription.",
        });
      }
  
      // Cancel the subscription in Stripe
      const deletedSubscription = await stripe.subscriptions.del(subscriptionId);
  
      // Update the user's record in the database
      user.subscriptionId = null;
      user.subscriptionPlan = null;
      user.billingCycle = null;
      user.planDetails = {}; // Clear any plan details
      await user.save();
  
      // Respond to the client
      res.status(200).json({
        message: "Subscription canceled successfully.",
        deletedSubscription,
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({
        message: "An error occurred while canceling the subscription.",
        error: error.message,
      });
    }
}

export { checkout, webhook, invoices, subscriptions, updateSubscription, cancel }